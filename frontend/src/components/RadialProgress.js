import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const RadialProgress = ({ 
  percentage, 
  size = 120, 
  strokeWidth = 8, 
  saved = 0, 
  target = 0, 
  color = 'teal', 
  onClick = null,
  className = "",
  showTooltip = false,
  showPercentage = true,
  showAmounts = true
}) => {
  const { currentTheme } = useTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  
  // Theme-aware color variants that adapt to current theme
  const getThemeAwareColors = () => {
    if (!currentTheme || !currentTheme.colors) {
      // Fallback colors if theme is not available
      return {
        teal: { primary: '#14b8a6', secondary: '#5eead4', background: '#f0fdfa', text: '#0f766e' },
        blue: { primary: '#3b82f6', secondary: '#93c5fd', background: '#eff6ff', text: '#1e40af' },
        green: { primary: '#10b981', secondary: '#6ee7b7', background: '#f0fdf4', text: '#047857' },
        amber: { primary: '#f59e0b', secondary: '#fcd34d', background: '#fffbeb', text: '#92400e' },
        red: { primary: '#ef4444', secondary: '#fca5a5', background: '#fef2f2', text: '#dc2626' },
        purple: { primary: '#8b5cf6', secondary: '#c4b5fd', background: '#faf5ff', text: '#7c3aed' }
      };
    }

    // Use theme colors for dynamic theming with safe access
    const themeColors = currentTheme.colors;
    const isDark = currentTheme.name === 'Dark' || currentTheme.name === 'Midnight' || currentTheme.name === 'Cyberpunk';
    
    // Safe fallbacks for accent colors - handle case where accent might be undefined
    const accent = themeColors.accent || {};
    const safeAccent = {
      primary: accent.primary || 'bg-teal-600',
      secondary: accent.secondary || 'bg-blue-600',
      success: accent.success || 'bg-green-600',
      warning: accent.warning || 'bg-yellow-500',
      error: accent.error || 'bg-red-600'
    };
    
    const text = themeColors.text || {};
    const safeText = {
      primary: text.primary || 'text-gray-900'
    };
    
    return {
      teal: {
        primary: safeAccent.primary.replace('bg-', ''),
        secondary: safeAccent.secondary.replace('bg-', ''),
        background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        text: safeText.primary.replace('text-', '')
      },
      blue: {
        primary: safeAccent.secondary.replace('bg-', ''),
        secondary: safeAccent.primary.replace('bg-', ''),
        background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        text: safeText.primary.replace('text-', '')
      },
      green: {
        primary: safeAccent.success.replace('bg-', ''),
        secondary: safeAccent.primary.replace('bg-', ''),
        background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        text: safeText.primary.replace('text-', '')
      },
      amber: {
        primary: safeAccent.warning.replace('bg-', ''),
        secondary: safeAccent.primary.replace('bg-', ''),
        background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        text: safeText.primary.replace('text-', '')
      },
      red: {
        primary: safeAccent.error.replace('bg-', ''),
        secondary: safeAccent.warning.replace('bg-', ''),
        background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        text: safeText.primary.replace('text-', '')
      },
      purple: {
        primary: safeAccent.secondary.replace('bg-', ''),
        secondary: safeAccent.primary.replace('bg-', ''),
        background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        text: safeText.primary.replace('text-', '')
      }
    };
  };

  const colorVariants = getThemeAwareColors();
  const colors = colorVariants[color] || colorVariants.teal;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <div 
        className={`relative transition-all duration-300 ${onClick ? 'cursor-pointer hover:scale-105' : ''}`}
        onClick={onClick}
        style={{ width: size, height: size }}
      >
        {/* Background circle */}
        <svg
          className="absolute inset-0 transform -rotate-90"
          width={size}
          height={size}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.background}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.primary}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
            style={{
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
            }}
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {showPercentage && (
            <div className="text-2xl font-bold" style={{ color: colors.text }}>
              {Math.round(percentage)}%
            </div>
          )}
          {showAmounts && saved !== undefined && target !== undefined && target > 0 && (
            <div className="text-xs opacity-75 text-center px-1 leading-tight break-all" style={{ color: colors.text, marginTop: showPercentage ? '4px' : '0' }}>
              <div>₹{saved.toLocaleString('en-IN')}</div>
              <div>of ₹{target.toLocaleString('en-IN')}</div>
            </div>
          )}
        </div>
        
        {/* Hover glow effect */}
        {onClick && (
          <div 
            className="absolute inset-0 rounded-full opacity-0 hover:opacity-20 transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle, ${colors.primary} 0%, transparent 70%)`,
              filter: 'blur(8px)'
            }}
          />
        )}
      </div>
    </div>
  );
};

export default RadialProgress;
