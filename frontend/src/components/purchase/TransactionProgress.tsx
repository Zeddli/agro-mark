import React from 'react';

interface Step {
  title: string;
  description: string;
}

interface TransactionProgressProps {
  currentStep: number;
  steps: Step[];
}

export default function TransactionProgress({ currentStep, steps }: TransactionProgressProps) {
  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div key={index} className="flex items-start space-x-3">
          <div className="flex-shrink-0 flex flex-col items-center">
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                index < currentStep
                  ? 'bg-green-500 text-white'
                  : index === currentStep
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {index < currentStep ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            {index < steps.length - 1 && (
              <div 
                className={`h-10 w-0.5 ${
                  index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
          <div className="pt-1 pb-3 w-full">
            <h3 
              className={`text-lg font-medium ${
                index <= currentStep ? 'text-gray-900' : 'text-gray-500'
              }`}
            >
              {step.title}
              {index === currentStep && (
                <span className="ml-2 inline-block animate-pulse">
                  <span className="text-blue-500">•</span>
                  <span className="text-blue-500 ml-0.5">•</span>
                  <span className="text-blue-500 ml-0.5">•</span>
                </span>
              )}
            </h3>
            <p 
              className={`text-sm ${
                index <= currentStep ? 'text-gray-600' : 'text-gray-400'
              }`}
            >
              {step.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
} 