import React from 'react';

interface JourneyStepsProps {
  currentStep: string;
  onStepChange: (step: string) => void;
  completedSteps?: string[]; // Add this to track completed steps
}

const JourneySteps: React.FC<JourneyStepsProps> = ({ 
  currentStep, 
  onStepChange,
  completedSteps = [] 
}) => {
  const steps = [
    { id: 'awareness', name: 'Awareness' },
    { id: 'consideration', name: 'Consideration' },
    { id: 'purchase', name: 'Purchase' },
    { id: 'postPurchase', name: 'Post-Purchase' },
    { id: 'support', name: 'Support' }
  ];

  return (
    <div className="my-6">
      <div className="flex items-center justify-between w-full mb-2">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = currentStep === step.id;
          
          return (
            <React.Fragment key={step.id}>
              {/* Step button */}
              <button
                onClick={() => onStepChange(step.id)}
                className={`rounded-full h-12 w-12 flex items-center justify-center z-10 transition-colors
                  ${isCurrent 
                    ? 'bg-indigo-600 text-white' 
                    : isCompleted
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
              >
                {isCompleted && !isCurrent ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </button>
              
              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div className={`h-1 flex-grow mx-2 ${
                    index < steps.indexOf(steps.find(s => s.id === currentStep) || steps[0]) || 
                    (completedSteps.includes(step.id) && completedSteps.includes(steps[index + 1].id))
                      ? 'bg-indigo-600' 
                      : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step labels */}
      <div className="flex items-center justify-between w-full mt-1">
        {steps.map((step) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = currentStep === step.id;
          
          return (
            <div 
              key={`label-${step.id}`}
              className={`text-xs ${
                isCurrent 
                  ? 'text-indigo-600 font-medium' 
                  : isCompleted
                    ? 'text-green-500 font-medium'
                    : 'text-gray-500'
                }`}
              style={{ width: '20%', textAlign: 'center' }}
            >
              {step.name}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default JourneySteps;