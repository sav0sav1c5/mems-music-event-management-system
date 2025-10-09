import { User, CreditCard, Shield, CheckCircle } from "lucide-react";

interface ProgressStep {
  name: string;
  label: string;
  icon: React.ComponentType<any>;
}

interface CheckoutProgressProps {
  currentStep: 'billing' | 'payment' | 'review' | 'complete';
  isStepValid: (stepName: string) => boolean;
}

export const CheckoutProgress = ({ currentStep, isStepValid }: CheckoutProgressProps) => {
  const steps: ProgressStep[] = [
    { name: 'billing', label: 'Billing', icon: User },
    { name: 'payment', label: 'Payment', icon: CreditCard },
    { name: 'review', label: 'Review', icon: Shield }
  ];

  return (
    <div className="flex justify-end">
      <div className="flex w-200">
        {steps.map((stepItem, index) => {
          const Icon = stepItem.icon;
          const isCompleted = isStepValid(stepItem.name) && currentStep !== stepItem.name;
          const isCurrent = currentStep === stepItem.name;
          
          return (
            <div key={stepItem.name} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  isCurrent 
                    ? 'bg-orange-400 text-black shadow-lg' 
                    : isCompleted
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span className={`text-xs mt-2 font-medium ${
                  isCurrent ? 'text-orange-400' : isCompleted ? 'text-green-400' : 'text-neutral-400'
                }`}>
                  {stepItem.label}
                </span>
              </div>
              {index < 2 && (
                <div className="flex-1 mx-3">
                  <div className={`h-1 rounded-full transition-all duration-200 ${
                    isCompleted ? 'bg-green-400' : isCurrent ? 'bg-orange-400' : 'bg-neutral-800'
                  }`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};