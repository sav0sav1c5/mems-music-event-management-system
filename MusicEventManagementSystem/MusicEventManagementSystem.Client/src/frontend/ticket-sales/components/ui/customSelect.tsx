import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

export interface CustomSelectOption {
  value: string;
  label: string;
}

export interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  className?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export function CustomSelect({ 
  value, 
  onChange, 
  options, 
  placeholder = 'Select...', 
  className = '',
  icon,
  disabled = false
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownDirection, setDropdownDirection] = useState<'down' | 'up'>('down');
  const selectRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const calculateDropdownDirection = () => {
    if (!buttonRef.current) return 'down';
    
    const buttonRect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;
    const estimatedDropdownHeight = Math.min(options.length * 48, 300);
    
    return spaceBelow < estimatedDropdownHeight && spaceAbove > spaceBelow ? 'up' : 'down';
  };

  const handleToggle = () => {
    if (disabled) return;
    
    if (!isOpen) {
      setDropdownDirection(calculateDropdownDirection());
    }
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (optionValue: string) => {
    if (disabled) return;
    
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={selectRef} className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`flex items-center justify-between w-full px-4 py-3 bg-neutral-800 text-neutral-300 rounded-xl focus:outline-none border border-neutral-700 transition-all duration-200 text-sm ${
          disabled 
            ? 'opacity-60 cursor-not-allowed' 
            : 'focus:ring-2 focus:ring-lime-500 focus:border-lime-500 hover:bg-neutral-750 cursor-pointer'
        }`}
      >
        <div className="flex items-center gap-2">
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span className="truncate">{selectedOption?.label || placeholder}</span>
        </div>
        <ChevronDown 
          className={`w-4 h-4 text-lime-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${disabled ? 'opacity-50' : ''}`}
        />
      </button>

      {isOpen && !disabled && (
        <div 
          className={`
            absolute z-50 w-full overflow-hidden bg-neutral-800 border border-neutral-700 rounded-xl shadow-xl
            ${dropdownDirection === 'up' 
              ? 'bottom-full mb-2' 
              : 'top-full mt-2'
            }
          `}
          style={{
            maxHeight: '300px',
            overflowY: 'auto'
          }}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleOptionClick(option.value)}
              className={`w-full text-left px-4 py-3 transition-colors duration-150 border-b border-neutral-700 last:border-b-0 ${
                option.value === value
                  ? 'bg-lime-500 text-neutral-900 font-medium'
                  : 'text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}