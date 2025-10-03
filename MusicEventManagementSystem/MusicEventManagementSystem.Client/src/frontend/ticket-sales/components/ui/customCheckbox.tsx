import { Check } from 'lucide-react';

export interface CustomCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function CustomCheckbox({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className = '',
  size = 'md'
}: CustomCheckboxProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20
  };

  return (
    <label className={`flex items-start gap-3 cursor-pointer group ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <div className="relative flex-shrink-0 mt-0.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => !disabled && onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={`
            ${sizeClasses[size]}
            rounded-lg border-2 transition-all duration-200
            flex items-center justify-center
            ${checked 
              ? 'bg-lime-500 border-lime-500' 
              : 'bg-neutral-800 border-neutral-600 group-hover:border-lime-500/50'
            }
            ${!disabled && 'group-hover:scale-110'}
          `}
        >
          {checked && (
            <Check 
              size={iconSizes[size]} 
              className="text-black animate-in zoom-in duration-200" 
              strokeWidth={3}
            />
          )}
        </div>
      </div>

      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-white text-sm font-medium leading-tight">
              {label}
            </span>
          )}
          {description && (
            <span className="text-neutral-400 text-xs mt-0.5 leading-tight">
              {description}
            </span>
          )}
        </div>
      )}
    </label>
  );
}

// CustomToggle.tsx (Bonus - modern switch component)
export interface CustomToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export function CustomToggle({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className = ''
}: CustomToggleProps) {
  return (
    <label className={`flex items-start justify-between cursor-pointer group ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      {(label || description) && (
        <div className="flex flex-col mr-4">
          {label && (
            <span className="text-white text-sm font-medium leading-tight">
              {label}
            </span>
          )}
          {description && (
            <span className="text-neutral-400 text-xs mt-0.5 leading-tight">
              {description}
            </span>
          )}
        </div>
      )}

      <div className="relative flex-shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => !disabled && onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={`
            w-11 h-6 rounded-full transition-all duration-300 ease-in-out
            ${checked ? 'bg-lime-500' : 'bg-neutral-700'}
            ${!disabled && 'group-hover:shadow-lg'}
          `}
        >
          <div
            className={`
              absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full
              transition-all duration-300 ease-in-out
              shadow-md
              ${checked ? 'translate-x-5' : 'translate-x-0'}
            `}
          />
        </div>
      </div>
    </label>
  );
}