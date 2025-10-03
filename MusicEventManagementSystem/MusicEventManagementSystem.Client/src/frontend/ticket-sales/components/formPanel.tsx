// components/FormPanel.tsx
import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { X, Save, Loader2, Plus, Edit } from 'lucide-react';

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'password' | 'textarea' | 'select' | 'date' | 'checkbox';
  required?: boolean;
  placeholder?: string;
  options?: { value: string | number; label: string }[];
  disabled?: boolean;
}

export interface FormPanelProps<T> {
  isOpen: boolean;
  onClose: () => void;
  mode: 'view' | 'create' | 'edit';
  title: string;
  entity: T | null;
  fields: FormField[];
  onSubmit: (data: Partial<T>) => Promise<void>;
  loading?: boolean;
  children?: ReactNode;
  renderCustomFields?: () => ReactNode;
  width?: string;
}

const FormPanel = <T,>({
  isOpen,
  onClose,
  mode,
  title,
  entity,
  fields,
  onSubmit,
  loading = false,
  children,
  renderCustomFields,
  width = "w-1/3"
}: FormPanelProps<T>) => {
  const [formData, setFormData] = useState<Partial<T>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when entity or mode changes
  useEffect(() => {
    if (entity) {
      setFormData(entity);
    } else {
      setFormData({});
    }
    setErrors({});
  }, [entity, mode]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    fields.forEach(field => {
      if (field.required && (!formData[field.name as keyof T] || formData[field.name as keyof T] === '')) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'view') {
      onClose();
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const getFieldValue = (fieldName: string) => {
    return formData[fieldName as keyof T] || '';
  };

  const renderField = (field: FormField) => {
    const value = getFieldValue(field.name);
    const error = errors[field.name];
    const isViewMode = mode === 'view';

    const baseClassName = `w-full p-3 bg-neutral-800 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all ${
      error ? 'border-red-500' : 'border-neutral-700'
    } ${isViewMode ? 'bg-neutral-900 cursor-not-allowed' : ''}`;

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            value={value as string}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className={baseClassName}
            placeholder={field.placeholder}
            disabled={isViewMode || field.disabled}
            rows={4}
          />
        );

      case 'select':
        return (
          <select
            value={value as string}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className={baseClassName}
            disabled={isViewMode || field.disabled}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => handleInputChange(field.name, e.target.checked)}
            className="w-4 h-4 text-lime-400 bg-neutral-800 border-neutral-700 rounded focus:ring-lime-400 focus:ring-2"
            disabled={isViewMode || field.disabled}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value as number}
            onChange={(e) => handleInputChange(field.name, parseInt(e.target.value) || 0)}
            className={baseClassName}
            placeholder={field.placeholder}
            disabled={isViewMode || field.disabled}
            min="0"
          />
        );

      default:
        return (
          <input
            type={field.type}
            value={value as string}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className={baseClassName}
            placeholder={field.placeholder}
            disabled={isViewMode || field.disabled}
          />
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`${width} transition-all duration-300`}>
      <div className="bg-neutral-900/60 backdrop-blur-sm border border-neutral-800 rounded-xl shadow-xl h-max">
        <div className="p-4 m-1 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-800 rounded-xl transition-all duration-200 text-neutral-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6 overflow-y-auto flex-1">
            {/* Custom error display can be handled by parent */}
            {children}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Form Fields */}
              <div className="space-y-4">
                {fields.map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium mb-2 text-neutral-300">
                      {field.label}
                      {field.required && <span className="text-red-400 ml-1">*</span>}
                    </label>
                    {renderField(field)}
                    {errors[field.name] && (
                      <p className="text-red-400 text-sm mt-1">{errors[field.name]}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Custom Fields */}
              {renderCustomFields && renderCustomFields()}

              {/* Action Buttons */}
              {mode !== 'view' && (
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 p-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-all duration-200 text-white border border-neutral-700 hover:border-neutral-500"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 p-3 bg-lime-500 hover:bg-lime-600 disabled:bg-lime-500/50 rounded-xl transition-all duration-200 text-black font-semibold flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : mode === 'create' ? (
                      <Plus className="w-4 h-4" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {loading ? (
                      mode === 'create' ? 'Creating...' : 'Updating...'
                    ) : mode === 'create' ? (
                      'Create'
                    ) : (
                      'Update'
                    )}
                  </button>
                </div>
              )}

              {mode === 'view' && (
                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold px-3 py-2 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 text-sm"
                  >
                    Close
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormPanel;