import React from 'react';

interface StepperProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

const Stepper: React.FC<StepperProps> = ({ steps, currentStep, className = '' }) => {
  return (
    <div className={`flex items-center justify-between mb-8 ${className}`}>
      {steps.map((step, index) => (
        <div key={index} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div
              className={`
                w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold
                ${index <= currentStep 
                  ? 'bg-accent text-bg' 
                  : 'bg-surface border border-border text-muted'
                }
              `}
            >
              {index + 1}
            </div>
            <span
              className={`
                mt-2 text-sm font-medium text-center
                ${index <= currentStep ? 'text-text' : 'text-muted'}
              `}
            >
              {step}
            </span>
          </div>
          
          {index < steps.length - 1 && (
            <div
              className={`
                flex-1 h-px mx-4 mt-[-1rem]
                ${index < currentStep ? 'bg-accent' : 'bg-border'}
              `}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default Stepper;