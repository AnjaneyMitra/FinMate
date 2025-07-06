import React from 'react';
import { useTheme, useThemeStyles, ThemedInput, ThemedButton, ThemedCard, ThemedAlert, ThemedStatus } from '../contexts/ThemeContext';
import { CreditCard, DollarSign, Smartphone, Building2, Rocket, Sparkles, CheckCircle, AlertTriangle, XCircle, Lightbulb } from 'lucide-react';

/**
 * ThemeShowcase - Demonstrates the enhanced theme system capabilities
 * This component shows how easy it is to create consistently themed UI elements
 */
export default function ThemeShowcase() {
  const { bg, text, components } = useTheme();
  const styles = useThemeStyles();

  return (
    <div className={`min-h-screen ${bg.primary} p-8`}>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <h1 className={`text-4xl font-bold ${text.primary} mb-4`}>Enhanced Theme System</h1>
          <p className={`text-lg ${text.secondary} max-w-2xl mx-auto`}>
            A comprehensive, semantic approach to theming that automatically adapts all UI components across themes
          </p>
        </div>

        {/* Alerts Section */}
        <ThemedCard variant="base" className="p-6">
          <h2 className={`text-2xl font-semibold ${text.primary} mb-6`}>Alert Components</h2>
          <div className="grid gap-4">
            <ThemedAlert type="success">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Transaction saved successfully! Your expense has been categorized and added to your budget.
              </div>
            </ThemedAlert>
            <ThemedAlert type="warning">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                You're approaching your monthly budget limit. Consider reviewing your expenses.
              </div>
            </ThemedAlert>
            <ThemedAlert type="error">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Failed to process transaction. Please check your internet connection and try again.
              </div>
            </ThemedAlert>
            <ThemedAlert type="info">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Pro tip: Use detailed descriptions to improve automatic categorization accuracy.
              </div>
            </ThemedAlert>
          </div>
        </ThemedCard>

        {/* Form Elements */}
        <ThemedCard variant="elevated" className="p-6">
          <h2 className={`text-2xl font-semibold ${text.primary} mb-6`}>Form Elements</h2>
          <div className="form-grid">
            <div>
              <label className={`block text-sm font-medium ${text.primary} mb-2`}>
                Standard Input
              </label>
              <ThemedInput 
                placeholder="Enter transaction amount"
                className="w-full"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${text.primary} mb-2`}>
                Success State
              </label>
              <ThemedInput 
                state="success"
                placeholder="Valid input"
                className="w-full"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${text.primary} mb-2`}>
                Error State
              </label>
              <ThemedInput 
                state="error"
                placeholder="Invalid input"
                className="w-full"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${text.primary} mb-2`}>
                Dropdown
              </label>
              <select className={styles.input()}>
                <option>Select category</option>
                <option>Food & Dining</option>
                <option>Transportation</option>
                <option>Entertainment</option>
              </select>
            </div>
          </div>
        </ThemedCard>

        {/* Button Variants */}
        <ThemedCard variant="interactive" className="p-6">
          <h2 className={`text-2xl font-semibold ${text.primary} mb-6`}>Button Variants</h2>
          <div className="btn-group">
            <ThemedButton variant="primary">Primary Action</ThemedButton>
            <ThemedButton variant="secondary">Secondary</ThemedButton>
            <ThemedButton variant="outline">Outline</ThemedButton>
            <ThemedButton variant="ghost">Ghost</ThemedButton>
            <ThemedButton variant="danger">Delete</ThemedButton>
            <ThemedButton variant="success">Success</ThemedButton>
            <ThemedButton variant="disabled" disabled>Disabled</ThemedButton>
          </div>
        </ThemedCard>

        {/* Status Indicators */}
        <ThemedCard variant="highlighted" className="p-6">
          <h2 className={`text-2xl font-semibold ${text.primary} mb-6`}>Status Indicators</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
              <ThemedStatus type="success">Completed</ThemedStatus>
              <ThemedStatus type="warning">Pending Review</ThemedStatus>
              <ThemedStatus type="error">Failed</ThemedStatus>
              <ThemedStatus type="info">In Progress</ThemedStatus>
              <ThemedStatus type="neutral">Draft</ThemedStatus>
            </div>
          </div>
        </ThemedCard>

        {/* Selection States Demo */}
        <ThemedCard variant="base" className="p-6">
          <h2 className={`text-2xl font-semibold ${text.primary} mb-6`}>Selection States</h2>
          <div className="grid-auto-fit">
            <div className={`${styles.selectable('selected')} flex-center flex-col space-y-2`}>
              <div className="p-2 bg-gradient-to-r from-teal-100 to-blue-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-teal-600" />
              </div>
              <span className="text-sm font-medium">Credit Card (Selected)</span>
            </div>
            <div className={`${styles.selectable('unselected')} flex-center flex-col space-y-2`}>
              <div className="p-2 bg-gradient-to-r from-gray-100 to-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm font-medium">Cash</span>
            </div>
            <div className={`${styles.selectable('unselected')} flex-center flex-col space-y-2`}>
              <div className="p-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg">
                <Smartphone className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm font-medium">UPI</span>
            </div>
            <div className={`${styles.selectable('disabled')} flex-center flex-col space-y-2`}>
              <div className="p-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg">
                <Building2 className="w-6 h-6 text-gray-400" />
              </div>
              <span className="text-sm font-medium">Net Banking (Disabled)</span>
            </div>
          </div>
        </ThemedCard>

        {/* Card Variants */}
        <div className="card-grid">
          <ThemedCard variant="base" className="p-4">
            <h3 className={`font-semibold ${text.primary} mb-2`}>Base Card</h3>
            <p className={`text-sm ${text.secondary}`}>Simple card with basic styling</p>
          </ThemedCard>
          
          <ThemedCard variant="elevated" className="p-4">
            <h3 className={`font-semibold ${text.primary} mb-2`}>Elevated Card</h3>
            <p className={`text-sm ${text.secondary}`}>Enhanced shadow for emphasis</p>
          </ThemedCard>
          
          <ThemedCard variant="interactive" className="p-4">
            <h3 className={`font-semibold ${text.primary} mb-2`}>Interactive Card</h3>
            <p className={`text-sm ${text.secondary}`}>Hover effects for clickable content</p>
          </ThemedCard>
          
          <ThemedCard variant="highlighted" className="p-4">
            <h3 className={`font-semibold ${text.primary} mb-2`}>Highlighted Card</h3>
            <p className={`text-sm ${text.secondary}`}>Accent border for important content</p>
          </ThemedCard>
        </div>

        {/* Loading States */}
        <ThemedCard variant="base" className="p-6">
          <h2 className={`text-2xl font-semibold ${text.primary} mb-6`}>Loading States</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className={`w-6 h-6 ${components.loading.spinner}`}></div>
              <span className={text.secondary}>Loading...</span>
            </div>
            <div className="space-y-2">
              <div className={`h-4 ${components.loading.skeleton} w-3/4`}></div>
              <div className={`h-4 ${components.loading.skeleton} w-1/2`}></div>
              <div className={`h-4 ${components.loading.skeleton} w-2/3`}></div>
            </div>
          </div>
        </ThemedCard>

        {/* Usage Examples */}
        <ThemedCard variant="base" className="p-6">
          <h2 className={`text-2xl font-semibold ${text.primary} mb-6`}>Usage Benefits</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className={`text-lg font-semibold ${text.primary} mb-3 flex items-center gap-2`}>
                <div className="p-1 bg-gradient-to-r from-red-100 to-orange-100 rounded-md">
                  <Rocket className="w-4 h-4 text-red-600" />
                </div>
                Before (Manual Approach)
              </h3>
              <div className={`${bg.secondary} rounded-lg p-4 text-sm ${text.secondary}`}>
                <code>{`// Manually applying theme colors
<button className={\`\${
  theme === 'dark' 
    ? 'bg-gray-800 text-white border-gray-600' 
    : 'bg-white text-gray-900 border-gray-200'
} px-4 py-2 rounded\`}>
  Submit
</button>`}</code>
              </div>
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${text.primary} mb-3 flex items-center gap-2`}>
                <div className="p-1 bg-gradient-to-r from-blue-100 to-purple-100 rounded-md">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                </div>
                After (Enhanced System)
              </h3>
              <div className={`${bg.secondary} rounded-lg p-4 text-sm ${text.secondary}`}>
                <code>{`// Semantic, theme-aware components
<ThemedButton variant="primary">
  Submit
</ThemedButton>

// Or using utility functions
<button className={styles.button('primary')}>
  Submit
</button>`}</code>
              </div>
            </div>
          </div>
          
          <div className="mt-6 space-y-3">
            <h3 className={`text-lg font-semibold ${text.primary}`}>Key Advantages:</h3>
            <ul className={`space-y-2 ${text.secondary}`}>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span><strong>Automatic theme adaptation:</strong> All components automatically work with any theme</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span><strong>Semantic naming:</strong> Use meaningful names like 'primary', 'success', 'warning' instead of colors</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span><strong>Consistent spacing:</strong> Standardized padding, margins, and sizing across all components</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span><strong>Accessibility built-in:</strong> Focus states, contrast ratios, and interactive feedback included</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span><strong>Developer productivity:</strong> No more manual color combinations or theme switching logic</span>
              </li>
            </ul>
          </div>
        </ThemedCard>

      </div>
    </div>
  );
}
