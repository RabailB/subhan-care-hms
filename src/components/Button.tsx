import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'outline';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const getButtonClass = () => {
    switch (variant) {
      case 'secondary':
        return 'hms-btn-secondary';
      case 'danger':
        return 'hms-btn-danger';
      case 'success':
        return 'hms-btn-success';
      case 'ghost':
        return 'hms-btn-ghost';
      case 'outline':
        return 'hms-btn-outline';
      default:
        return 'hms-btn-primary';
    }
  };

  return (
    <button
      className={`hms-btn ${getButtonClass()} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex-center" style={{ gap: '8px' }}>
          <span className="spinner" />
          <span>Processing...</span>
        </span>
      ) : (
        <>
          {icon && <span className="btn-icon">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
