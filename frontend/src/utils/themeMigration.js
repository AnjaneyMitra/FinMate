/**
 * Theme Migration Utility
 * 
 * This utility helps convert existing components to use the enhanced theme system.
 * It provides mapping functions and utilities to automatically replace hardcoded colors.
 */

export const THEME_MIGRATION_MAP = {
  // Background color mappings
  backgrounds: {
    'bg-white': 'bg.card',
    'bg-gray-50': 'bg.secondary',
    'bg-gray-100': 'bg.tertiary',
    'bg-gray-800': 'bg.card', // for dark themes
    'bg-gray-900': 'bg.primary', // for dark themes
  },
  
  // Text color mappings
  texts: {
    'text-gray-900': 'text.primary',
    'text-gray-800': 'text.primary',
    'text-gray-700': 'text.secondary',
    'text-gray-600': 'text.secondary',
    'text-gray-500': 'text.tertiary',
    'text-gray-400': 'text.tertiary',
    'text-white': 'text.inverse',
    'text-teal-600': 'text.accent',
    'text-blue-600': 'text.accent',
  },
  
  // Border color mappings
  borders: {
    'border-gray-200': 'border.primary',
    'border-gray-300': 'border.primary',
    'border-gray-600': 'border.primary', // for dark themes
    'border-teal-200': 'border.accent',
    'border-teal-500': 'border.accent',
  },
  
  // Common button patterns
  buttons: {
    'bg-teal-600 hover:bg-teal-700 text-white': 'styles.button("primary")',
    'bg-gray-100 hover:bg-gray-200 text-gray-700': 'styles.button("secondary")',
    'border border-gray-300 hover:border-gray-400': 'styles.button("outline")',
  },
  
  // Form input patterns
  inputs: {
    'border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2': 'styles.input()',
    'border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none': 'styles.input()',
  },
  
  // Card patterns
  cards: {
    'bg-white border border-gray-200 rounded-lg shadow': 'styles.card()',
    'bg-white border border-gray-200 rounded-xl shadow-lg': 'styles.card("elevated")',
    'bg-white border-2 border-teal-200 rounded-lg': 'styles.card("highlighted")',
  },
  
  // Status patterns
  statuses: {
    'bg-green-100 text-green-800 px-2 py-1 rounded': 'styles.status("success")',
    'bg-yellow-100 text-yellow-800 px-2 py-1 rounded': 'styles.status("warning")',
    'bg-red-100 text-red-800 px-2 py-1 rounded': 'styles.status("error")',
    'bg-blue-100 text-blue-800 px-2 py-1 rounded': 'styles.status("info")',
  }
};

/**
 * Generates component-specific theme classes
 */
export const generateThemeClasses = (component, variant = 'base', customClasses = '') => {
  const componentMap = {
    input: (variant) => `styles.input("${variant}")`,
    button: (variant) => `styles.button("${variant}")`,
    card: (variant) => `styles.card("${variant}")`,
    status: (variant) => `styles.status("${variant}")`,
    alert: (variant) => `styles.alert("${variant}")`,
    selectable: (variant) => `styles.selectable("${variant}")`,
    section: (variant) => `styles.section("${variant}")`
  };
  
  const baseClass = componentMap[component]?.(variant) || '';
  return customClasses ? `${baseClass} ${customClasses}` : baseClass;
};

/**
 * Migration helpers for common UI patterns
 */
export const migrationHelpers = {
  
  // Convert form input
  input: (state = 'base', customClasses = '') => ({
    className: generateThemeClasses('input', state, customClasses),
    themeAware: true
  }),
  
  // Convert button
  button: (variant = 'primary', customClasses = '') => ({
    className: generateThemeClasses('button', variant, customClasses),
    themeAware: true
  }),
  
  // Convert card
  card: (variant = 'base', customClasses = '') => ({
    className: generateThemeClasses('card', variant, customClasses),
    themeAware: true
  }),
  
  // Convert selection button (for payment methods, categories, etc.)
  selectable: (isSelected = false, customClasses = '') => ({
    className: generateThemeClasses('selectable', isSelected ? 'selected' : 'unselected', customClasses),
    themeAware: true
  }),
  
  // Convert alert/notification
  alert: (type = 'info', customClasses = '') => ({
    className: generateThemeClasses('alert', type, customClasses),
    themeAware: true
  }),
  
  // Convert section/container
  section: (variant = 'base', customClasses = '') => ({
    className: generateThemeClasses('section', variant, customClasses),
    themeAware: true
  })
};

/**
 * Utility to check if a className string contains hardcoded colors
 */
export const hasHardcodedColors = (classNameString) => {
  const hardcodedPatterns = [
    /bg-gray-\d+/,
    /text-gray-\d+/,
    /border-gray-\d+/,
    /bg-(red|blue|green|yellow|purple|pink|indigo)-\d+/,
    /text-(red|blue|green|yellow|purple|pink|indigo)-\d+/,
    /border-(red|blue|green|yellow|purple|pink|indigo)-\d+/,
    /bg-white/,
    /text-white/,
    /border-white/,
    /bg-black/,
    /text-black/,
    /border-black/
  ];
  
  return hardcodedPatterns.some(pattern => pattern.test(classNameString));
};

/**
 * Generate migration suggestions for a component
 */
export const getMigrationSuggestions = (componentType, currentClasses) => {
  const suggestions = [];
  
  if (hasHardcodedColors(currentClasses)) {
    suggestions.push({
      type: 'warning',
      message: 'This component uses hardcoded colors',
      suggestion: `Replace with theme-aware classes using styles.${componentType}()`
    });
  }
  
  // Check for common patterns and suggest replacements
  Object.entries(THEME_MIGRATION_MAP[componentType] || {}).forEach(([pattern, replacement]) => {
    if (currentClasses.includes(pattern)) {
      suggestions.push({
        type: 'info',
        message: `Found pattern: ${pattern}`,
        suggestion: `Replace with: ${replacement}`
      });
    }
  });
  
  return suggestions;
};

/**
 * Auto-migration utility (use with caution)
 */
export const autoMigrateClasses = (classNameString, componentType = 'generic') => {
  let migratedClasses = classNameString;
  
  // Apply automatic replacements based on component type
  const mappings = THEME_MIGRATION_MAP[componentType] || {};
  Object.entries(mappings).forEach(([oldClass, newClass]) => {
    migratedClasses = migratedClasses.replace(new RegExp(oldClass, 'g'), newClass);
  });
  
  return {
    original: classNameString,
    migrated: migratedClasses,
    hasChanges: migratedClasses !== classNameString
  };
};

/**
 * React hook for theme migration warnings in development
 */
export const useThemeMigrationWarnings = (componentName, classNames) => {
  if (process.env.NODE_ENV === 'development') {
    const warnings = [];
    
    if (typeof classNames === 'string' && hasHardcodedColors(classNames)) {
      warnings.push(`${componentName}: Consider migrating hardcoded colors to theme system`);
    }
    
    if (warnings.length > 0) {
      console.group(`🎨 Theme Migration Suggestions for ${componentName}`);
      warnings.forEach(warning => console.warn(warning));
      console.groupEnd();
    }
  }
};

export default {
  THEME_MIGRATION_MAP,
  generateThemeClasses,
  migrationHelpers,
  hasHardcodedColors,
  getMigrationSuggestions,
  autoMigrateClasses,
  useThemeMigrationWarnings
};

// This file previously provided theme migration utilities. It is now deprecated and empty.
