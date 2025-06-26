import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeSwitcher = ({ className = "" }) => {
  const { currentTheme, themes, changeTheme, bg, text, border, button } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const handleThemeChange = (themeName) => {
    changeTheme(themeName);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Theme Switcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center space-x-2 px-3 py-2 rounded-lg
          ${button.ghost} transition-colors
          ${border.primary} border
        `}
        title="Change Theme"
      >
        <span className="text-lg">{themes[currentTheme].icon}</span>
        <span className={`text-sm font-medium ${text.secondary} hidden sm:block`}>
          {themes[currentTheme].name}
        </span>
        <svg 
          className={`w-4 h-4 ${text.tertiary} transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Theme Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className={`
            absolute top-full right-0 mt-2 w-56 
            ${bg.card} ${border.primary} border rounded-xl shadow-xl
            z-50 overflow-hidden
          `}>
            <div className={`p-3 ${bg.secondary} ${border.primary} border-b`}>
              <h3 className={`text-sm font-semibold ${text.primary}`}>Choose Theme</h3>
              <p className={`text-xs ${text.tertiary}`}>Select your preferred appearance</p>
            </div>
            
            <div className="p-2 max-h-80 overflow-y-auto">
              {Object.entries(themes).map(([themeName, themeData]) => (
                <button
                  key={themeName}
                  onClick={() => handleThemeChange(themeName)}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-3 rounded-lg
                    transition-colors text-left
                    ${currentTheme === themeName 
                      ? `${bg.tertiary} ${text.accent}` 
                      : `hover:${bg.secondary} ${text.primary}`
                    }
                  `}
                >
                  <span className="text-xl">{themeData.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium">{themeData.name}</div>
                    <div className={`text-xs ${text.tertiary}`}>
                      {themeName === 'light' && 'Clean and minimal'}
                      {themeName === 'dark' && 'Easy on the eyes'}
                      {themeName === 'cyberpunk' && 'Futuristic vibes'}
                      {themeName === 'nature' && 'Fresh and organic'}
                      {themeName === 'ocean' && 'Calm and professional'}
                      {themeName === 'sunset' && 'Warm and vibrant'}
                      {themeName === 'midnight' && 'Deep and elegant'}
                    </div>
                  </div>
                  {currentTheme === themeName && (
                    <svg className={`w-4 h-4 ${text.accent}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
            
            {/* Theme Preview */}
            <div className={`p-3 ${bg.secondary} ${border.primary} border-t`}>
              <div className="flex space-x-2">
                <div className={`w-4 h-4 rounded-full ${themes[currentTheme].colors.accent.primary}`}></div>
                <div className={`w-4 h-4 rounded-full ${themes[currentTheme].colors.accent.secondary}`}></div>
                <div className={`w-4 h-4 rounded-full ${themes[currentTheme].colors.accent.success}`}></div>
                <div className={`w-4 h-4 rounded-full ${themes[currentTheme].colors.accent.warning}`}></div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ThemeSwitcher;
