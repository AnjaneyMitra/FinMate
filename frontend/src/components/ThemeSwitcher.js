// This file previously provided a theme switcher. It is now a placeholder since theming is removed.
import React from 'react';

const ThemeSwitcher = ({ className = "" }) => {
  return (
    <div className={`p-4 bg-white border border-gray-200 rounded-xl shadow text-gray-500 text-center ${className}`}>
      <span>Theme switching is not available.</span>
    </div>
  );
};

export default ThemeSwitcher;
