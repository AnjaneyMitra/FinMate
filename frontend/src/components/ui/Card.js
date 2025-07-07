import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export const Card = ({ children, className = '' }) => {
  const { bg, border } = useTheme();
  return (
    <div className={`${bg.card} shadow-lg rounded-lg border ${border.primary} ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => {
  const { border } = useTheme();
  return (
    <div className={`px-6 py-4 border-b ${border.primary} ${className}`}>
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className = '' }) => {
  const { text } = useTheme();
  return (
    <h3 className={`text-lg font-semibold ${text.primary} ${className}`}>
      {children}
    </h3>
  );
};

export const CardContent = ({ children, className = '' }) => {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  );
};
