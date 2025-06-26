import React, { createContext, useContext, useState, useEffect } from 'react';

// Enhanced theme system with semantic component categories
const createThemeVariants = (baseColors) => {
  return {
    // Component-specific styling combinations
    components: {
      // Form elements
      input: {
        base: `${baseColors.bg.card} ${baseColors.text.primary} ${baseColors.border.primary} border-2 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:${baseColors.border.accent} transition-all`,
        error: `${baseColors.bg.card} ${baseColors.text.primary} border-red-500 border-2 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-200 transition-all`,
        success: `${baseColors.bg.card} ${baseColors.text.primary} border-green-500 border-2 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all`
      },
      
      // Button variants
      button: {
        primary: `${baseColors.button.primary} px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg transform hover:scale-105`,
        secondary: `${baseColors.button.secondary} px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg`,
        ghost: `${baseColors.button.ghost} px-6 py-3 rounded-lg font-medium transition-all duration-200`,
        danger: `bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg`,
        outline: `border-2 ${baseColors.border.accent} ${baseColors.text.accent} hover:${baseColors.bg.accent} hover:${baseColors.text.inverse} px-6 py-3 rounded-lg font-medium transition-all duration-200`,
        success: `${baseColors.accent.success} ${baseColors.text.inverse} px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg transform scale-105`,
        disabled: `${baseColors.bg.tertiary} ${baseColors.text.tertiary} px-6 py-3 rounded-lg font-medium cursor-not-allowed opacity-50`
      },
      
      // Card variants
      card: {
        base: `${baseColors.bg.card} ${baseColors.border.primary} border rounded-xl shadow-sm`,
        elevated: `${baseColors.bg.card} ${baseColors.border.primary} border rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200`,
        interactive: `${baseColors.bg.card} ${baseColors.border.primary} border rounded-xl shadow-sm hover:shadow-md hover:${baseColors.border.accent} transition-all duration-200 cursor-pointer`,
        highlighted: `${baseColors.bg.card} ${baseColors.border.accent} border-2 rounded-xl shadow-md`,
        success: `${baseColors.bg.card} border-green-500 border-2 rounded-xl shadow-md`,
        warning: `${baseColors.bg.card} border-yellow-500 border-2 rounded-xl shadow-md`,
        error: `${baseColors.bg.card} border-red-500 border-2 rounded-xl shadow-md`
      },
      
      // Navigation elements
      nav: {
        item: `${baseColors.text.secondary} hover:${baseColors.text.primary} hover:${baseColors.bg.secondary} px-4 py-2 rounded-lg transition-all duration-200`,
        active: `${baseColors.text.accent} ${baseColors.bg.accent} px-4 py-2 rounded-lg font-medium`,
        brand: `${baseColors.text.primary} font-bold text-xl`
      },
      
      // Status indicators
      status: {
        success: `${baseColors.accent.success} ${baseColors.text.inverse} px-3 py-1 rounded-full text-sm font-medium`,
        warning: `${baseColors.accent.warning} ${baseColors.text.inverse} px-3 py-1 rounded-full text-sm font-medium`,
        error: `${baseColors.accent.error} ${baseColors.text.inverse} px-3 py-1 rounded-full text-sm font-medium`,
        info: `${baseColors.accent.secondary} ${baseColors.text.inverse} px-3 py-1 rounded-full text-sm font-medium`,
        neutral: `${baseColors.bg.tertiary} ${baseColors.text.secondary} px-3 py-1 rounded-full text-sm font-medium`
      },
      
      // Selection states (for payment methods, categories, etc.)
      selectable: {
        unselected: `${baseColors.bg.card} ${baseColors.border.primary} ${baseColors.text.primary} border-2 rounded-lg p-4 hover:${baseColors.border.accent} hover:${baseColors.bg.secondary} transition-all duration-200 cursor-pointer`,
        selected: `${baseColors.bg.accent} ${baseColors.border.accent} ${baseColors.text.accent} border-2 rounded-lg p-4 shadow-md transform scale-105 transition-all duration-200`,
        disabled: `${baseColors.bg.tertiary} ${baseColors.border.primary} ${baseColors.text.tertiary} border-2 rounded-lg p-4 cursor-not-allowed opacity-50`
      },
      
      // Alert/notification boxes
      alert: {
        success: `${baseColors.accent.success} ${baseColors.text.inverse} rounded-xl p-4 shadow-lg`,
        warning: `${baseColors.accent.warning} ${baseColors.text.inverse} rounded-xl p-4 shadow-lg`,
        error: `${baseColors.accent.error} ${baseColors.text.inverse} rounded-xl p-4 shadow-lg`,
        info: `${baseColors.accent.secondary} ${baseColors.text.inverse} rounded-xl p-4 shadow-lg`
      },
      
      // Loading states
      loading: {
        spinner: `border-2 ${baseColors.text.tertiary} border-t-transparent rounded-full animate-spin`,
        shimmer: `bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse`,
        skeleton: `${baseColors.bg.tertiary} rounded animate-pulse`
      },
      
      // Form sections and layouts
      section: {
        base: `${baseColors.bg.secondary} ${baseColors.border.primary} border rounded-lg p-6`,
        highlighted: `${baseColors.bg.secondary} ${baseColors.border.accent} border-2 rounded-lg p-6`,
        compact: `${baseColors.bg.secondary} ${baseColors.border.primary} border rounded-lg p-4`
      }
    },
    
    // Original color system for direct access
    ...baseColors
  };
};

// Define trending themes
const themes = {
  classic: {
    name: 'Classic',
    icon: '🏛️',
    colors: {
      // Background colors - matches original gradient and cards
      bg: {
        primary: 'bg-gradient-to-br from-blue-50 to-teal-100',
        secondary: 'bg-blue-50',
        tertiary: 'bg-teal-50',
        card: 'bg-white',
        overlay: 'bg-white/95',
        success: 'bg-green-50',
        warning: 'bg-yellow-50',
        error: 'bg-red-50',
        info: 'bg-blue-50'
      },
      // Text colors - matches original teal and gray scheme
      text: {
        primary: 'text-teal-700',
        secondary: 'text-gray-700',
        tertiary: 'text-gray-600',
        accent: 'text-teal-600',
        inverse: 'text-white',
        muted: 'text-gray-500'
      },
      // Border colors - matches original teal borders
      border: {
        primary: 'border-teal-200',
        secondary: 'border-gray-200',
        accent: 'border-teal-300',
        success: 'border-green-300',
        warning: 'border-yellow-300',
        error: 'border-red-300',
        info: 'border-blue-300'
      },
      // Button colors - matches original styling
      button: {
        primary: 'bg-teal-600 hover:bg-teal-700 text-white',
        secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
        ghost: 'hover:bg-teal-50 text-teal-600'
      },
      // Accent colors - based on original teal theme
      accent: {
        primary: 'bg-teal-600',
        secondary: 'bg-blue-600',
        success: 'bg-green-600',
        warning: 'bg-yellow-500',
        error: 'bg-red-600'
      }
    }
  },
  
  light: {
    name: 'Light',
    icon: '☀️',
    colors: {
      // Background colors
      bg: {
        primary: 'bg-white',
        secondary: 'bg-gray-50',
        tertiary: 'bg-gray-100',
        card: 'bg-white',
        overlay: 'bg-white/95'
      },
      // Text colors
      text: {
        primary: 'text-gray-900',
        secondary: 'text-gray-600',
        tertiary: 'text-gray-500',
        accent: 'text-teal-600',
        inverse: 'text-white'
      },
      // Border colors
      border: {
        primary: 'border-gray-200',
        secondary: 'border-gray-100',
        accent: 'border-teal-200'
      },
      // Button colors
      button: {
        primary: 'bg-teal-600 hover:bg-teal-700 text-white',
        secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
        ghost: 'hover:bg-gray-100 text-gray-600'
      },
      // Accent colors
      accent: {
        primary: 'bg-teal-600',
        secondary: 'bg-blue-600',
        success: 'bg-green-600',
        warning: 'bg-yellow-600',
        error: 'bg-red-600'
      }
    }
  },
  
  dark: {
    name: 'Dark',
    icon: '🌙',
    colors: {
      bg: {
        primary: 'bg-gray-900',
        secondary: 'bg-gray-800',
        tertiary: 'bg-gray-700',
        card: 'bg-gray-800',
        overlay: 'bg-gray-900/95'
      },
      text: {
        primary: 'text-white',
        secondary: 'text-gray-300',
        tertiary: 'text-gray-400',
        accent: 'text-teal-400',
        inverse: 'text-gray-900'
      },
      border: {
        primary: 'border-gray-700',
        secondary: 'border-gray-600',
        accent: 'border-teal-600'
      },
      button: {
        primary: 'bg-teal-600 hover:bg-teal-500 text-white',
        secondary: 'bg-gray-700 hover:bg-gray-600 text-gray-200',
        ghost: 'hover:bg-gray-700 text-gray-300'
      },
      accent: {
        primary: 'bg-teal-600',
        secondary: 'bg-blue-600',
        success: 'bg-green-600',
        warning: 'bg-yellow-600',
        error: 'bg-red-600'
      }
    }
  },

  cyberpunk: {
    name: 'Cyberpunk',
    icon: '🔮',
    colors: {
      bg: {
        primary: 'bg-black',
        secondary: 'bg-gray-900',
        tertiary: 'bg-purple-900/20',
        card: 'bg-gray-900/80',
        overlay: 'bg-black/95'
      },
      text: {
        primary: 'text-cyan-300',
        secondary: 'text-purple-300',
        tertiary: 'text-gray-400',
        accent: 'text-pink-400',
        inverse: 'text-black'
      },
      border: {
        primary: 'border-cyan-500/30',
        secondary: 'border-purple-500/30',
        accent: 'border-pink-500'
      },
      button: {
        primary: 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white',
        secondary: 'bg-gray-800 hover:bg-gray-700 text-cyan-300 border border-cyan-500/30',
        ghost: 'hover:bg-purple-900/30 text-purple-300'
      },
      accent: {
        primary: 'bg-cyan-500',
        secondary: 'bg-purple-600',
        success: 'bg-green-400',
        warning: 'bg-yellow-400',
        error: 'bg-pink-500'
      }
    }
  },

  nature: {
    name: 'Nature',
    icon: '🌿',
    colors: {
      bg: {
        primary: 'bg-green-50',
        secondary: 'bg-emerald-50',
        tertiary: 'bg-green-100',
        card: 'bg-white/90',
        overlay: 'bg-green-50/95'
      },
      text: {
        primary: 'text-green-900',
        secondary: 'text-green-700',
        tertiary: 'text-green-600',
        accent: 'text-emerald-600',
        inverse: 'text-white'
      },
      border: {
        primary: 'border-green-200',
        secondary: 'border-emerald-200',
        accent: 'border-emerald-400'
      },
      button: {
        primary: 'bg-emerald-600 hover:bg-emerald-700 text-white',
        secondary: 'bg-green-100 hover:bg-green-200 text-green-700',
        ghost: 'hover:bg-green-100 text-green-600'
      },
      accent: {
        primary: 'bg-emerald-600',
        secondary: 'bg-green-600',
        success: 'bg-green-600',
        warning: 'bg-amber-600',
        error: 'bg-red-500'
      }
    }
  },

  ocean: {
    name: 'Ocean',
    icon: '🌊',
    colors: {
      bg: {
        primary: 'bg-blue-50',
        secondary: 'bg-slate-50',
        tertiary: 'bg-blue-100',
        card: 'bg-white/90',
        overlay: 'bg-blue-50/95'
      },
      text: {
        primary: 'text-slate-900',
        secondary: 'text-slate-700',
        tertiary: 'text-slate-600',
        accent: 'text-blue-600',
        inverse: 'text-white'
      },
      border: {
        primary: 'border-slate-200',
        secondary: 'border-blue-200',
        accent: 'border-blue-400'
      },
      button: {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white',
        secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700',
        ghost: 'hover:bg-blue-100 text-blue-600'
      },
      accent: {
        primary: 'bg-blue-600',
        secondary: 'bg-slate-600',
        success: 'bg-emerald-600',
        warning: 'bg-amber-600',
        error: 'bg-red-500'
      }
    }
  },

  sunset: {
    name: 'Sunset',
    icon: '🌅',
    colors: {
      bg: {
        primary: 'bg-gradient-to-br from-orange-50 to-pink-50',
        secondary: 'bg-orange-50',
        tertiary: 'bg-pink-100',
        card: 'bg-white/80',
        overlay: 'bg-orange-50/95'
      },
      text: {
        primary: 'text-gray-900',
        secondary: 'text-orange-800',
        tertiary: 'text-pink-700',
        accent: 'text-orange-600',
        inverse: 'text-white'
      },
      border: {
        primary: 'border-orange-200',
        secondary: 'border-pink-200',
        accent: 'border-orange-400'
      },
      button: {
        primary: 'bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white',
        secondary: 'bg-orange-100 hover:bg-orange-200 text-orange-700',
        ghost: 'hover:bg-orange-100 text-orange-600'
      },
      accent: {
        primary: 'bg-orange-500',
        secondary: 'bg-pink-500',
        success: 'bg-green-500',
        warning: 'bg-yellow-500',
        error: 'bg-red-500'
      }
    }
  },

  midnight: {
    name: 'Midnight',
    icon: '🌌',
    colors: {
      bg: {
        primary: 'bg-slate-900',
        secondary: 'bg-slate-800',
        tertiary: 'bg-slate-700',
        card: 'bg-slate-800/80',
        overlay: 'bg-slate-900/95'
      },
      text: {
        primary: 'text-slate-100',
        secondary: 'text-slate-300',
        tertiary: 'text-slate-400',
        accent: 'text-indigo-400',
        inverse: 'text-slate-900'
      },
      border: {
        primary: 'border-slate-700',
        secondary: 'border-slate-600',
        accent: 'border-indigo-500'
      },
      button: {
        primary: 'bg-indigo-600 hover:bg-indigo-500 text-white',
        secondary: 'bg-slate-700 hover:bg-slate-600 text-slate-200',
        ghost: 'hover:bg-slate-700 text-slate-300'
      },
      accent: {
        primary: 'bg-indigo-600',
        secondary: 'bg-slate-600',
        success: 'bg-emerald-600',
        warning: 'bg-amber-500',
        error: 'bg-red-500'
      }
    }
  }
};

const ThemeContext = createContext();

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState('classic');

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('finmate-theme');
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  // Save theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('finmate-theme', currentTheme);
    
    // Apply theme to document root for global styles
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const theme = themes[currentTheme];
      // Extract color from theme (simplified)
      metaThemeColor.setAttribute('content', 
        currentTheme === 'classic' ? '#0d9488' :
        currentTheme === 'dark' ? '#1f2937' :
        currentTheme === 'cyberpunk' ? '#000000' :
        currentTheme === 'nature' ? '#10b981' :
        currentTheme === 'ocean' ? '#3b82f6' :
        currentTheme === 'sunset' ? '#f97316' :
        currentTheme === 'midnight' ? '#0f172a' :
        '#ffffff'
      );
    }
  }, [currentTheme]);

  const changeTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
    }
  };

  const theme = createThemeVariants(themes[currentTheme].colors);

  const value = {
    currentTheme,
    theme,
    themes,
    changeTheme,
    // Enhanced component access
    components: theme.components,
    // Direct color access (backward compatibility)
    bg: theme.bg,
    text: theme.text,
    border: theme.border,
    button: theme.button,
    accent: theme.accent,
    // Utility functions
    getComponentStyle: (component, variant = 'base') => {
      return theme.components[component]?.[variant] || '';
    },
    // Semantic styling helpers
    styles: {
      input: (state = 'base') => theme.components.input[state],
      button: (variant = 'primary') => theme.components.button[variant],
      card: (variant = 'base') => theme.components.card[variant],
      status: (type = 'neutral') => theme.components.status[type],
      alert: (type = 'info') => theme.components.alert[type],
      selectable: (state = 'unselected') => theme.components.selectable[state],
      section: (variant = 'base') => theme.components.section[variant]
    }
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Enhanced theme hooks for specific use cases
export const useThemeStyles = () => {
  const { styles } = useTheme();
  return styles;
};

export const useComponentStyle = () => {
  const { getComponentStyle } = useTheme();
  return getComponentStyle;
};

// Utility components for common themed elements
export const ThemedInput = ({ state = 'base', className = '', ...props }) => {
  const { styles } = useTheme();
  return (
    <input 
      className={`${styles.input(state)} ${className}`}
      {...props}
    />
  );
};

export const ThemedButton = ({ variant = 'primary', className = '', children, ...props }) => {
  const { styles } = useTheme();
  return (
    <button 
      className={`${styles.button(variant)} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const ThemedCard = ({ variant = 'base', className = '', children, ...props }) => {
  const { styles } = useTheme();
  return (
    <div 
      className={`${styles.card(variant)} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const ThemedStatus = ({ type = 'neutral', className = '', children, ...props }) => {
  const { styles } = useTheme();
  return (
    <span 
      className={`${styles.status(type)} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export const ThemedAlert = ({ type = 'info', className = '', children, ...props }) => {
  const { styles } = useTheme();
  return (
    <div 
      className={`${styles.alert(type)} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default ThemeContext;
