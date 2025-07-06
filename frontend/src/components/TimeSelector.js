import React from 'react';
import { Clock } from 'lucide-react';

const TimeSelector = ({ 
  value, 
  onChange, 
  className = '',
  label = 'Time Period',
  showLabel = true,
  size = 'md',
  variant = 'default'
}) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };

  const variantClasses = {
    default: 'bg-white border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent',
    minimal: 'bg-transparent border border-gray-200 text-gray-700 focus:ring-1 focus:ring-gray-400 focus:border-gray-400',
    outlined: 'bg-white border-2 border-blue-200 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
  };

  const timeOptions = [
    { value: 'lastMonth', label: 'Last Month' },
    { value: '3months', label: '3 Months' },
    { value: '6months', label: '6 Months' },
    { value: 'currentYear', label: 'Current Year' },
    { value: 'allTime', label: 'All Time' }
  ];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && (
        <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
          <Clock className="w-4 h-4" />
          {label}:
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`
          ${sizeClasses[size]} 
          ${variantClasses[variant]} 
          rounded-lg shadow-sm transition-all duration-200
          hover:shadow-md cursor-pointer outline-none
        `}
      >
        {timeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TimeSelector;
