import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  id,
  type = 'text',
  ...props
}) => {
  const inputId = id || `hms-input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="form-group">
      {label && (
        <label className="form-label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <input
        type={type}
        id={inputId}
        className={`form-input ${error ? 'input-error' : ''} ${className}`}
        style={{
          border: error ? '1px solid #ef4444' : undefined,
          boxShadow: error ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : undefined
        }}
        {...props}
      />
      {error && (
        <span className="error-text" style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '4px' }}>
          {error}
        </span>
      )}
      {!error && helperText && (
        <span className="helper-text" style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
          {helperText}
        </span>
      )}
    </div>
  );
};
export default Input;
