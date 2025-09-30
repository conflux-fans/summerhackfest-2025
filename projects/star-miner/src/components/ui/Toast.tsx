'use client';

import React, { useEffect, useState } from 'react';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const toastStyles = {
  success: {
    bg: 'bg-green-900/90 border-green-500',
    icon: '✅',
    titleColor: 'text-green-400',
    messageColor: 'text-green-300',
  },
  error: {
    bg: 'bg-red-900/90 border-red-500',
    icon: '❌',
    titleColor: 'text-red-400',
    messageColor: 'text-red-300',
  },
  warning: {
    bg: 'bg-yellow-900/90 border-yellow-500',
    icon: '⚠️',
    titleColor: 'text-yellow-400',
    messageColor: 'text-yellow-300',
  },
  info: {
    bg: 'bg-blue-900/90 border-blue-500',
    icon: 'ℹ️',
    titleColor: 'text-blue-400',
    messageColor: 'text-blue-300',
  },
};

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setIsVisible(true);

    // Auto-close after duration
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300); // Match animation duration
  };

  const style = toastStyles[type];

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 min-w-80 max-w-md
        transform transition-all duration-300 ease-out
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}
        ${style.bg} backdrop-blur-sm border rounded-lg p-4 shadow-xl
      `}
    >
      <div className="flex items-start gap-3">
        <div className="text-xl flex-shrink-0">{style.icon}</div>

        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold text-sm ${style.titleColor}`}>
            {title}
          </h4>
          {message && (
            <p className={`text-sm mt-1 ${style.messageColor} break-words`}>
              {message}
            </p>
          )}
        </div>

        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-white transition-colors flex-shrink-0 ml-2"
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>

      {/* Progress bar */}
      <div className="mt-3 bg-gray-700 rounded-full h-1 overflow-hidden">
        <div
          className={`h-full transition-all duration-75 ease-linear ${
            type === 'success' ? 'bg-green-500' :
            type === 'error' ? 'bg-red-500' :
            type === 'warning' ? 'bg-yellow-500' :
            'bg-blue-500'
          }`}
          style={{
            animation: `shrink ${duration}ms linear forwards`,
          }}
        />
      </div>
    </div>
  );
};

// Toast Container Component
interface ToastContainerProps {
  toasts: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    duration?: number;
  }>;
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-0 right-0 z-50 pointer-events-none">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className="pointer-events-auto mb-2"
          style={{
            transform: `translateY(${index * 8}px)`,
            zIndex: 50 - index,
          }}
        >
          <Toast
            {...toast}
            onClose={onRemove}
          />
        </div>
      ))}
    </div>
  );
};