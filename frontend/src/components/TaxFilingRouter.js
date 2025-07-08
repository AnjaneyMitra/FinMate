import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../firebase';
import TaxFilingDashboard from './TaxFilingDashboard';
import TaxFormDiscovery from './TaxFormDiscovery';
import TaxGlossaryHelp from './TaxGlossaryHelp';
import TaxDocumentManager from './TaxDocumentManager';
import EnhancedTaxReturnCompletion from './EnhancedTaxReturnCompletion';
import ThemeManager from './ThemeManager';
import { useTheme } from '../contexts/ThemeContext';
import { 
  FileText, 
  Compass, 
  HelpCircle, 
  FolderOpen, 
  User, 
  Bell, 
  Settings, 
  LogOut,
  Home,
  Palette
} from 'lucide-react';

const TaxFilingRouter = ({ user }) => {
  const [selectedForm, setSelectedForm] = useState(null);
  const [showThemeManager, setShowThemeManager] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Theme integration
  const themeContext = useTheme();
  const { bg, text, border, accent } = themeContext || {};
  
  // Safe fallbacks for theme properties
  const safeBg = bg || {
    primary: 'bg-white',
    secondary: 'bg-gray-50',
    card: 'bg-white',
    tertiary: 'bg-gray-100'
  };
  const safeText = text || {
    primary: 'text-gray-900',
    secondary: 'text-gray-600',
    tertiary: 'text-gray-500',
    accent: 'text-teal-600'
  };
  const safeBorder = border || {
    primary: 'border-gray-200',
    accent: 'border-teal-300'
  };
  const safeAccent = accent || {
    primary: 'bg-teal-600',
    secondary: 'bg-blue-600',
    success: 'bg-green-600',
    error: 'bg-red-600'
  };

  const navigationItems = [
    {
      path: '/tax-filing',
      name: 'Dashboard',
      icon: Home,
      description: 'Overview and quick stats'
    },
    {
      path: '/tax-filing/discovery',
      name: 'Form Discovery',
      icon: Compass,
      description: 'Find the right tax form'
    },
    {
      path: '/tax-filing/documents',
      name: 'Document Manager',
      icon: FolderOpen,
      description: 'Upload and organize documents'
    },
    {
      path: '/tax-filing/glossary',
      name: 'Glossary & Help',
      icon: HelpCircle,
      description: 'Get help and explanations'
    },
    {
      path: '/tax-filing/filing',
      name: 'Tax Filing',
      icon: FileText,
      description: 'Complete your tax return'
    }
  ];

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleFormSelection = async (formId) => {
    try {
      // Fetch complete form metadata from backend
      const response = await fetch(`http://localhost:8000/api/tax/forms/${formId}`);
      const data = await response.json();
      
      setSelectedForm(data.form_details || { id: formId, name: `Form ${formId}` });
      navigate('/tax-filing/filing');
    } catch (error) {
      console.error('Error fetching form details:', error);
      // Fallback: use minimal form data
      setSelectedForm({ id: formId, name: `Form ${formId}` });
      navigate('/tax-filing/filing');
    }
  };

  const getCurrentPageName = () => {
    const currentItem = navigationItems.find(item => item.path === location.pathname);
    return currentItem ? currentItem.name : 'Tax Filing';
  };

  return (
    <div className={`min-h-screen ${safeBg.primary}`}>
      {/* Top Navigation */}
      <nav className={`${safeBg.card} border-b ${safeBorder.primary} px-6 py-4`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-10 h-10 ${safeAccent.primary} rounded-xl flex items-center justify-center`}>
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-xl font-bold ${safeText.primary}`}>Indian Tax Filing</h1>
              <p className={`text-sm ${safeText.secondary}`}>{getCurrentPageName()}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setShowThemeManager(!showThemeManager)}
              className={`p-2 ${safeText.secondary} hover:${safeText.primary} hover:${safeBg.secondary} rounded-lg transition-all relative`}
              title="Theme Settings"
            >
              <Palette className="w-5 h-5" />
            </button>
            <button className={`p-2 ${safeText.secondary} hover:${safeText.primary} hover:${safeBg.secondary} rounded-lg transition-all`}>
              <Bell className="w-5 h-5" />
            </button>
            <button className={`p-2 ${safeText.secondary} hover:${safeText.primary} hover:${safeBg.secondary} rounded-lg transition-all`}>
              <Settings className="w-5 h-5" />
            </button>
            <div className={`flex items-center space-x-3 pl-4 border-l ${safeBorder.primary}`}>
              <div className={`w-8 h-8 ${safeAccent.primary} rounded-full flex items-center justify-center`}>
                <User className="w-4 h-4 text-white" />
              </div>
              <span className={`font-medium ${safeText.primary} hidden sm:block`}>
                {user?.displayName || user?.email?.split('@')[0] || 'User'}
              </span>
              <button
                onClick={handleLogout}
                className={`p-2 ${safeText.secondary} hover:text-red-600 hover:bg-red-50 rounded-lg transition-all`}
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Theme Manager Modal */}
        {showThemeManager && (
          <div className="absolute right-6 top-16 z-50">
            <ThemeManager onClose={() => setShowThemeManager(false)} />
          </div>
        )}
      </nav>

      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar Navigation */}
        <aside className={`w-64 ${safeBg.card} border-r ${safeBorder.primary} min-h-screen p-6`}>
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${
                    isActive
                      ? `${safeAccent.primary} text-white shadow-lg`
                      : `${safeText.secondary} hover:${safeBg.secondary}`
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className={`text-xs ${isActive ? 'text-blue-100' : safeText.tertiary}`}>
                      {item.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Progress Card */}
          <div className={`mt-8 p-4 ${safeBg.secondary} rounded-xl border ${safeBorder.accent}`}>
            <div className="flex items-center space-x-2 mb-3">
              <FileText className={`w-5 h-5 ${safeText.accent}`} />
              <span className={`font-semibold ${safeText.primary}`}>Filing Progress</span>
            </div>
            <div className={`w-full ${safeBg.card} rounded-full h-2 mb-2`}>
              <div className={`${safeAccent.success} h-2 rounded-full`} style={{width: '65%'}}></div>
            </div>
            <p className={`text-sm ${safeText.secondary}`}>65% Complete</p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Routes>
            <Route 
              path="/" 
              element={<TaxFilingDashboard user={user} isEmbedded={true} />} 
            />
            <Route 
              path="/discovery" 
              element={
                <TaxFormDiscovery 
                  user={user} 
                  onFormSelected={handleFormSelection}
                />
              } 
            />
            <Route 
              path="/documents" 
              element={<TaxDocumentManager user={user} />} 
            />
            <Route 
              path="/glossary" 
              element={<TaxGlossaryHelp />} 
            />
            <Route 
              path="/filing" 
              element={
                <EnhancedTaxReturnCompletion 
                  selectedForm={selectedForm}
                  onBack={() => navigate('/tax-filing/discovery')}
                  onComplete={() => navigate('/tax-filing')}
                />
              } 
            />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default TaxFilingRouter;
