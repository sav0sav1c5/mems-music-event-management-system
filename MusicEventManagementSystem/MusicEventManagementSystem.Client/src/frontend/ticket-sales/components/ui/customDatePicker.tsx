import { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

export interface CustomDatePickerProps {
  value: string; // ISO date string (YYYY-MM-DD)
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
}

export function CustomDatePicker({
  value,
  onChange,
  placeholder = 'Select date...',
  className = '',
  disabled = false,
  minDate,
  maxDate
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (value) {
      setCurrentMonth(new Date(value));
    }
  }, [value]);

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const isDateDisabled = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    if (minDate && dateStr < minDate) return true;
    if (maxDate && dateStr > maxDate) return true;
    return false;
  };

  const handleDateClick = (day: number) => {
    const { year, month } = getDaysInMonth(currentMonth);
    const selectedDate = new Date(Date.UTC(year, month, day, 12, 0, 0));
    
    if (isDateDisabled(selectedDate)) return;
    
    const dateStr = selectedDate.toISOString().split('T')[0];
    onChange(dateStr);
    setIsOpen(false);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
    const days = [];
    const selectedDate = value ? new Date(value) : null;

    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-10" />);
    }

    // Actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const isSelected = selectedDate && 
        selectedDate.getDate() === day && 
        selectedDate.getMonth() === month && 
        selectedDate.getFullYear() === year;
      const isToday = new Date().toDateString() === currentDate.toDateString();
      const isDisabled = isDateDisabled(currentDate);

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateClick(day)}
          disabled={isDisabled}
          className={`
            h-10 rounded-lg text-sm font-medium transition-all duration-200
            ${isSelected 
              ? 'bg-lime-500 text-black' 
              : isToday
              ? 'bg-lime-500/20 text-lime-400 border border-lime-500/30'
              : 'text-neutral-300 hover:bg-neutral-700'
            }
            ${isDisabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div ref={pickerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center justify-between w-full px-4 py-3 
          bg-neutral-800 text-neutral-300 rounded-xl 
          focus:outline-none focus:ring-2 focus:ring-lime-500 
          border border-neutral-700 focus:border-lime-500 
          transition-all duration-200 hover:bg-neutral-750 text-sm
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <span className={value ? 'text-white' : 'text-neutral-500'}>
          {value ? formatDisplayDate(value) : placeholder}
        </span>
        <Calendar className="w-4 h-4 text-lime-500" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-80 bg-neutral-800 border border-neutral-700 rounded-xl shadow-2xl p-4">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-neutral-700 rounded-lg transition-all duration-200"
            >
              <ChevronLeft className="w-5 h-5 text-lime-400" />
            </button>
            <span className="text-white font-semibold">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button
              type="button"
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-neutral-700 rounded-lg transition-all duration-200"
            >
              <ChevronRight className="w-5 h-5 text-lime-400" />
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="h-10 flex items-center justify-center text-neutral-500 text-xs font-semibold">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {renderCalendar()}
          </div>

          {/* Quick Actions */}
          <div className="mt-4 pt-4 border-t border-neutral-700 flex gap-2">
            <button
              type="button"
              onClick={() => {
                onChange(new Date().toISOString().split('T')[0]);
                setIsOpen(false);
              }}
              className="flex-1 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg text-sm transition-all duration-200"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              className="flex-1 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg text-sm transition-all duration-200"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}