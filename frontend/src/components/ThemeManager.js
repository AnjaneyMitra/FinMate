import React, { useState } from 'react';
import { useTheme, useThemeStyles, ThemedCard, ThemedButton, ThemedAlert, ThemedStatus } from '../contexts/ThemeContext';
import ThemeSwitcher from './ThemeSwitcher';
import ThemeShowcase from './ThemeShowcase';
import { 
  Palette, 
  Eye, 
  Settings, 
  Download, 
  Upload, 
  Sparkles, 
  Sun, 
  Moon, 
  MonitorSpeaker,
  Smartphone,
  Contrast,
  Accessibility
} from 'lucide-react';

/**
 * ThemeManager - Comprehensive theme management and customization interface
 * Provides theme selection, preview, and management capabilities
 */
export default function ThemeManager() {
  const { currentTheme, themes, changeTheme, bg, text, border } = useTheme();
  const styles = useThemeStyles();
  const [activeTab, setActiveTab] = useState('selection');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const tabs = [
    { id: 'selection', label: 'Theme Selection', icon: <Palette className="w-4 h-4" /> },
    { id: 'preview', label: 'Live Preview', icon: <Eye className="w-4 h-4" /> },
    { id: 'showcase', label: 'Component Showcase', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'settings', label: 'Advanced Settings', icon: <Settings className="w-4 h-4" /> }
  ];

  // Get theme statistics
  const themeStats = {
    total: Object.keys(themes).length,
    current: currentTheme,
    favoriteCount: 3, // Mock data - could be stored in localStorage
    customCount: 0 // Mock data - for future custom themes feature
  };

  // Theme categories for better organization
  const themeCategories = {
    'Standard': ['classic', 'light', 'dark'],
    'Vibrant': ['cyberpunk', 'sunset'],
    'Natural': ['nature', 'ocean'],
    'Professional': ['midnight']
  };

  const handleExportTheme = () => {
    const themeConfig = {
      name: themes[currentTheme].name,
      colors: themes[currentTheme].colors,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const dataStr = JSON.stringify(themeConfig, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `finmate-theme-${currentTheme}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`min-h-screen ${bg.primary} p-8`}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className={`text-4xl font-bold ${text.primary} mb-2`}>
              Theme Manager
            </h1>
            <p className={`text-lg ${text.secondary}`}>
              Customize your FinMate experience with our comprehensive theme system
            </p>
          </div>
          
          {/* Quick Theme Switcher */}
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            <ThemedButton variant="outline" onClick={handleExportTheme}>
              <Download className="w-4 h-4 mr-2" />
              Export Theme
            </ThemedButton>
          </div>
        </div>

        {/* Theme Statistics */}
        <ThemedCard variant="elevated" className="p-6">
          <h2 className={`text-2xl font-semibold ${text.primary} mb-4`}>Theme Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className={`text-3xl font-bold ${text.accent} mb-1`}>{themeStats.total}</div>
              <div className={`text-sm ${text.secondary}`}>Available Themes</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${text.accent} mb-1 capitalize`}>
                {themes[currentTheme].icon}
              </div>
              <div className={`text-sm ${text.secondary}`}>Current: {themes[currentTheme].name}</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${text.accent} mb-1`}>{themeStats.favoriteCount}</div>
              <div className={`text-sm ${text.secondary}`}>Favorite Themes</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${text.accent} mb-1`}>100%</div>
              <div className={`text-sm ${text.secondary}`}>Components Themed</div>
            </div>
          </div>
        </ThemedCard>

        {/* Tab Navigation */}
        <div className={`${border.primary} border-b`}>
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center gap-2 ${
                  activeTab === tab.id
                    ? `${border.accent.replace('border-', 'border-b-')} ${text.accent}`
                    : `border-transparent ${text.secondary} hover:${text.primary}`
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'selection' && (
          <div className="space-y-8">
            {/* Theme Categories */}
            {Object.entries(themeCategories).map(([category, themeList]) => (
              <div key={category}>
                <h3 className={`text-xl font-semibold ${text.primary} mb-4`}>{category} Themes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {themeList.map((themeName) => {
                    const theme = themes[themeName];
                    const isActive = currentTheme === themeName;
                    
                    return (
                      <ThemedCard 
                        key={themeName}
                        variant={isActive ? "highlighted" : "interactive"}
                        className="p-6 cursor-pointer transition-all duration-200 hover:scale-105"
                        onClick={() => changeTheme(themeName)}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{theme.icon}</span>
                            <div>
                              <h4 className={`font-semibold ${text.primary}`}>{theme.name}</h4>
                              <p className={`text-sm ${text.secondary}`}>
                                {themeName === 'classic' && 'Original FinMate design'}
                                {themeName === 'light' && 'Clean and minimal'}
                                {themeName === 'dark' && 'Easy on the eyes'}
                                {themeName === 'cyberpunk' && 'Futuristic vibes'}
                                {themeName === 'nature' && 'Fresh and organic'}
                                {themeName === 'ocean' && 'Calm and professional'}
                                {themeName === 'sunset' && 'Warm and vibrant'}
                                {themeName === 'midnight' && 'Deep and elegant'}
                              </p>
                            </div>
                          </div>
                          {isActive && (
                            <ThemedStatus type="success">Active</ThemedStatus>
                          )}
                        </div>
                        
                        {/* Theme Color Preview */}
                        <div className="flex space-x-2 mb-4">
                          <div className={`w-6 h-6 rounded-full ${theme.colors.accent.primary} border-2 border-white shadow-sm`}></div>
                          <div className={`w-6 h-6 rounded-full ${theme.colors.accent.secondary} border-2 border-white shadow-sm`}></div>
                          <div className={`w-6 h-6 rounded-full ${theme.colors.accent.success} border-2 border-white shadow-sm`}></div>
                          <div className={`w-6 h-6 rounded-full ${theme.colors.accent.warning} border-2 border-white shadow-sm`}></div>
                        </div>
                        
                        {/* Sample UI Elements */}
                        <div className="space-y-2">
                          <div className={`h-2 ${theme.colors.bg.secondary} rounded-full`}></div>
                          <div className={`h-2 ${theme.colors.bg.tertiary} rounded-full w-3/4`}></div>
                          <div className="flex gap-2">
                            <div className={`h-2 w-2 ${theme.colors.accent.primary} rounded-full`}></div>
                            <div className={`h-2 w-2 ${theme.colors.accent.secondary} rounded-full`}></div>
                            <div className={`h-2 w-2 ${theme.colors.accent.success} rounded-full`}></div>
                          </div>
                        </div>
                      </ThemedCard>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="space-y-6">
            <ThemedAlert type="info">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Live preview shows how your current theme affects real components. Changes are applied instantly!
              </div>
            </ThemedAlert>

            {/* Device Preview Mockups */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Desktop Preview */}
              <ThemedCard variant="elevated" className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MonitorSpeaker className="w-5 h-5" />
                  <h3 className={`font-semibold ${text.primary}`}>Desktop View</h3>
                </div>
                <div className={`${bg.secondary} rounded-lg p-4 border-2 ${border.primary}`}>
                  <div className="space-y-3">
                    <div className={`h-8 ${bg.card} rounded border ${border.primary} flex items-center px-3`}>
                      <div className={`w-4 h-4 ${themes[currentTheme].colors.accent.primary} rounded mr-2`}></div>
                      <div className={`h-2 ${bg.tertiary} rounded flex-1`}></div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className={`h-16 ${bg.card} rounded border ${border.primary}`}></div>
                      <div className={`h-16 ${bg.card} rounded border ${border.primary}`}></div>
                      <div className={`h-16 ${bg.card} rounded border ${border.primary}`}></div>
                    </div>
                  </div>
                </div>
              </ThemedCard>

              {/* Mobile Preview */}
              <ThemedCard variant="elevated" className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Smartphone className="w-5 h-5" />
                  <h3 className={`font-semibold ${text.primary}`}>Mobile View</h3>
                </div>
                <div className="flex justify-center">
                  <div className={`w-48 h-80 ${bg.secondary} rounded-2xl p-3 border-2 ${border.primary}`}>
                    <div className="space-y-2">
                      <div className={`h-6 ${bg.card} rounded border ${border.primary}`}></div>
                      <div className="space-y-1">
                        <div className={`h-12 ${bg.card} rounded border ${border.primary}`}></div>
                        <div className={`h-12 ${bg.card} rounded border ${border.primary}`}></div>
                        <div className={`h-12 ${bg.card} rounded border ${border.primary}`}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </ThemedCard>
            </div>
          </div>
        )}

        {activeTab === 'showcase' && (
          <div>
            <ThemeShowcase />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <ThemedCard variant="base" className="p-6">
              <h3 className={`text-xl font-semibold ${text.primary} mb-4`}>Theme Preferences</h3>
              
              <div className="space-y-6">
                {/* System Theme Detection */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Contrast className="w-5 h-5" />
                    <div>
                      <div className={`font-medium ${text.primary}`}>Auto Theme Detection</div>
                      <div className={`text-sm ${text.secondary}`}>Automatically switch between light and dark themes based on system preference</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                </div>

                {/* Accessibility Options */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Accessibility className="w-5 h-5" />
                    <div>
                      <div className={`font-medium ${text.primary}`}>High Contrast Mode</div>
                      <div className={`text-sm ${text.secondary}`}>Increase contrast for better accessibility</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                </div>

                {/* Reduced Motion */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5" />
                    <div>
                      <div className={`font-medium ${text.primary}`}>Reduce Motion</div>
                      <div className={`text-sm ${text.secondary}`}>Minimize animations and transitions for better performance</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                </div>
              </div>
            </ThemedCard>

            {/* Theme Export/Import */}
            <ThemedCard variant="base" className="p-6">
              <h3 className={`text-xl font-semibold ${text.primary} mb-4`}>Theme Management</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <ThemedButton variant="outline" onClick={handleExportTheme}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Current Theme
                </ThemedButton>
                <ThemedButton variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Import Custom Theme
                </ThemedButton>
              </div>
              
              <div className={`mt-4 p-4 ${bg.secondary} rounded-lg`}>
                <p className={`text-sm ${text.secondary}`}>
                  <strong>Note:</strong> Custom theme import is coming soon! Export functionality allows you to backup your current theme preferences.
                </p>
              </div>
            </ThemedCard>

            {/* Developer Information */}
            <ThemedCard variant="base" className="p-6">
              <h3 className={`text-xl font-semibold ${text.primary} mb-4`}>Theme System Information</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className={`font-medium ${text.primary} mb-2`}>Current Theme Details</h4>
                  <div className={`text-sm ${text.secondary} space-y-1`}>
                    <div>Name: {themes[currentTheme].name}</div>
                    <div>Icon: {themes[currentTheme].icon}</div>
                    <div>Type: {currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)}</div>
                    <div>Components: {Object.keys(themes[currentTheme].colors).length} color categories</div>
                  </div>
                </div>
                <div>
                  <h4 className={`font-medium ${text.primary} mb-2`}>System Features</h4>
                  <div className={`text-sm ${text.secondary} space-y-1`}>
                    <div>✓ Semantic color system</div>
                    <div>✓ Component variants</div>
                    <div>✓ Accessibility compliance</div>
                    <div>✓ Mobile optimized</div>
                    <div>✓ Live theme switching</div>
                  </div>
                </div>
              </div>
            </ThemedCard>
          </div>
        )}

      </div>
    </div>
  );
}
