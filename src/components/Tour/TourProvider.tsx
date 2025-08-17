import React from 'react';
import { TourProvider as ReactTourProvider } from '@reactour/tour';
import { ArrowRight, ArrowLeft, X } from 'lucide-react';

const tourConfig = {
  steps: [],
  styles: {
    popover: (base: any) => ({
      ...base,
      '--reactour-accent': '#2563eb',
      borderRadius: '12px',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(37, 99, 235, 0.2)',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      padding: '20px',
      maxWidth: '320px',
    }),
    maskArea: (base: any) => ({
      ...base,
      rx: '8px',
      fill: 'rgba(0, 0, 0, 0.7)',
    }),
    badge: (base: any) => ({
      ...base,
      backgroundColor: '#2563eb',
      color: 'white',
      fontSize: '12px',
      fontWeight: '600',
      padding: '4px 8px',
      borderRadius: '6px',
    }),
  },
  components: {
    Badge: ({ children, ...props }: any) => (
      <div className="inline-flex items-center px-2 py-1 bg-primary-600 text-white text-xs font-semibold rounded-md">
        {children}
      </div>
    ),
    Close: ({ onClick, ...props }: any) => (
      <button
        onClick={onClick}
        className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100"
        aria-label="Close tour"
      >
        <X className="h-4 w-4" />
      </button>
    ),
    Navigation: ({ 
      currentStep, 
      steps, 
      setCurrentStep, 
      setIsOpen,
      ...props
    }: any) => {
      const isFirst = currentStep === 0;
      const isLast = currentStep === steps.length - 1;

      return (
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">
              {currentStep + 1} of {steps.length}
            </span>
            <div className="flex space-x-1">
              {steps.map((_: any, index: number) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep
                      ? 'bg-primary-600'
                      : index < currentStep
                      ? 'bg-primary-300'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!isFirst && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors rounded-md hover:bg-gray-100"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </button>
            )}
            
            {isLast ? (
              <button
                onClick={() => setIsOpen(false)}
                className="flex items-center px-4 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 transition-colors"
              >
                Finish
              </button>
            ) : (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="flex items-center px-4 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 transition-colors"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            )}
          </div>
        </div>
      );
    },
  },
  padding: {
    mask: [10, 10, 10, 10],
    popover: [5, 5, 5, 5],
  },
  showBadge: true,
  showCloseButton: true,
  showNavigation: true,
  showDots: false,
  scrollSmooth: true,
  onClickMask: ({ setIsOpen }: { setIsOpen: (open: boolean) => void }) => {
    setIsOpen(false);
  },
  beforeClose: () => {
    // You can add analytics or cleanup here
    console.log('Tour closed');
    return Promise.resolve();
  },
};

interface TourProviderProps {
  children: React.ReactNode;
}

export function TourProvider({ children }: TourProviderProps) {
  return (
    <ReactTourProvider {...tourConfig}>
      {children}
    </ReactTourProvider>
  );
}

export default TourProvider;