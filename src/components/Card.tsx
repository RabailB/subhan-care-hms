import React from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  headerAction,
  className = ''
}) => {
  return (
    <div className={`hms-card ${className}`}>
      {(title || subtitle || headerAction) && (
        <div 
          className="card-header" 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '20px',
            borderBottom: '1px solid #e2e8f0',
            paddingBottom: '12px'
          }}
        >
          <div>
            {title && <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>{title}</h3>}
            {subtitle && <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{subtitle}</p>}
          </div>
          {headerAction && <div className="card-action">{headerAction}</div>}
        </div>
      )}
      <div className="card-body">
        {children}
      </div>
    </div>
  );
};
export default Card;
