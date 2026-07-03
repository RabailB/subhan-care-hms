import React, { useState, useId } from 'react';
import { Eye, EyeOff } from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);
  const reactId = useId();
  const inputId = id || reactId;

  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="form-group">
      {label && (
        <label className="form-label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative', width: '100%' }}>
        <input
          type={inputType}
          id={inputId}
          className={`form-input ${error ? 'input-error' : ''} ${className}`}
          style={{
            width: '100%',
            border: error ? '1px solid #ef4444' : undefined,
            boxShadow: error ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : undefined,
            paddingRight: isPassword ? '40px' : undefined
          }}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              height: '100%',
              padding: '0'
            }}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
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
