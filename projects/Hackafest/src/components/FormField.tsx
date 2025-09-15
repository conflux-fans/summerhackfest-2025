import React from 'react';

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  error?: string;
  helper?: string;
}

const FormField: React.FC<FormFieldProps> = ({ 
  label, 
  children, 
  required = false, 
  error, 
  helper 
}) => {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-text mb-2">
        {label}
        {required && <span className="text-danger ml-1">*</span>}
      </label>
      {children}
      {helper && !error && (
        <p className="mt-1 text-sm text-muted">{helper}</p>
      )}
      {error && (
        <p className="mt-1 text-sm text-danger">{error}</p>
      )}
    </div>
  );
};

export default FormField;