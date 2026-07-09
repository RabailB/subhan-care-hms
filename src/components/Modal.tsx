import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  primaryActionLoading?: boolean;
  primaryActionVariant?: 'primary' | 'danger' | 'success';
  cancelActionLabel?: string;
  isConfirmation?: boolean;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  primaryActionLabel,
  onPrimaryAction,
  primaryActionLoading = false,
  primaryActionVariant = 'primary',
  cancelActionLabel = 'Cancel',
  isConfirmation = false,
  maxWidth = '520px'
}) => {
  if (!isOpen) return null;

  // Handle escape key closure
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }} onClick={onClose}>
      <div 
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '24px',
          width: '100%',
          maxWidth,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          animation: 'slide-up 0.2s ease-out'
        }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isConfirmation && <AlertTriangle size={20} style={{ color: '#f59e0b' }} />}
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>{title}</h3>
          </div>
          <button 
            onClick={onClose} 
            style={{ border: 'none', background: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px', borderRadius: '4px' }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.5 }}>
          {children}
        </div>

        {/* Footer actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginTop: '8px' }}>
          <Button onClick={onClose} variant="secondary" style={{ height: '36px' }}>
            {cancelActionLabel}
          </Button>
          {onPrimaryAction && primaryActionLabel && (
            <Button 
              onClick={onPrimaryAction} 
              variant={primaryActionVariant} 
              loading={primaryActionLoading}
              style={{ height: '36px' }}
            >
              {primaryActionLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
