import React, { useState } from 'react';
import { auth } from '../firebase';
import { useTheme } from '../contexts/ThemeContext';
import { 
  FileText, 
  Compass, 
  HelpCircle, 
  FolderOpen, 
  Bell, 
  LogOut,
  Home,
  ArrowLeft
} from 'lucide-react';
import { Link, Outlet, useLocation, useNavigate, Routes, Route } from 'react-router-dom';

// Import components for nested routes
import TaxDashboardContent from './TaxDashboardContent';
import TaxFormDiscovery from './TaxFormDiscovery';
import TaxDocumentManager from './TaxDocumentManager';
import TaxGlossaryHelp from './TaxGlossaryHelp';
import EnhancedTaxReturnCompletion from './EnhancedTaxReturnCompletion';

const TaxFilingDashboard = ({ user }) => {
  const [selectedForm, setSelectedForm] = useState(null); // State for selected tax form
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
    primary: 'bg-teal-600'
  };

  const navigationItems = [
    {
      id: 'dashboard',
      path: '/tax-filing',
      name: 'Dashboard',
      icon: Home,
      description: 'Overview and quick stats'
    },
    {
      id: 'discovery',
      path: '/tax-filing/discovery',
      name: 'Form Discovery',
      icon: Compass,
      description: 'Find the right tax form'
    },
    {
      id: 'documents',
      path: '/tax-filing/documents',
      name: 'Document Manager',
      icon: FolderOpen,
      description: 'Upload and organize documents'
    },
    {
      id: 'glossary',
      path: '/tax-filing/glossary',
      name: 'Glossary & Help',
      icon: HelpCircle,
      description: 'Get help and explanations'
    },
    {
      id: 'filing',
      path: '/tax-filing/filing',
      name: 'Tax Filing',
      icon: FileText,
      description: 'Complete your tax return'
    }
  ];

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className={`flex h-screen font-sans ${safeBg.primary} ${safeText.primary}`}>
      {/* Sidebar */}
      <div className={`w-72 ${safeBg.secondary} p-6 flex-shrink-0 shadow-2xl z-20 flex flex-col`}>
        <Link to="/" className="flex items-center space-x-3 mb-10 hover:opacity-80 transition-opacity">
          <div className={`${safeAccent.primary} w-12 h-12 rounded-2xl flex items-center justify-center`}>
            <FileText className="w-7 h-7 text-white" />
          </div>
          <span className={`text-2xl font-bold ${safeText.primary}`}>FinMate Taxes</span>
        </Link>

        <nav className="mt-8 space-y-2 flex-1">
          {navigationItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center px-4 py-3 rounded-xl transition-all text-lg font-medium border-l-4 ${
                location.pathname === item.path
                  ? `${safeBg.tertiary} ${safeText.accent} ${safeBorder.accent}`
                  : `${safeText.secondary} border-transparent hover:${safeBg.tertiary}`
              }`}
            >
              <item.icon className="w-6 h-6 mr-4" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className={`p-4 rounded-2xl ${safeBg.tertiary} border ${safeBorder.primary}`}>
          <h4 className={`font-bold ${safeText.primary}`}>Need Help?</h4>
          <p className={`text-sm ${safeText.secondary} mt-1 mb-3`}>
            Our support team is here for you.
          </p>
          <button className={`w-full px-4 py-2 rounded-lg ${safeAccent.primary} text-white font-semibold`}>
            Contact Support
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className={`flex items-center justify-between p-6 border-b ${safeBorder.primary} ${safeBg.primary} flex-shrink-0`}>
          <div className="flex items-center space-x-4">
            <Link 
              to="/dashboard" 
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${safeBg.secondary} hover:${safeBg.tertiary} transition-colors border ${safeBorder.primary}`}
            >
              <ArrowLeft className={`w-4 h-4 ${safeText.secondary}`} />
              <span className={`text-sm font-medium ${safeText.secondary}`}>Back to Dashboard</span>
            </Link>
            <h1 className={`text-3xl font-bold ${safeText.primary}`}>
              {navigationItems.find(item => item.path === location.pathname)?.name || 'Tax Dashboard'}
            </h1>
          </div>
          <div className="flex items-center space-x-6">
            <button className={`p-2 rounded-full hover:${safeBg.secondary}`}>
              <Bell className={`w-6 h-6 ${safeText.secondary}`} />
            </button>
            <div className="flex items-center space-x-3">
              <img
                src={user?.photoURL || `https://i.pravatar.cc/150?u=${user?.uid}`}
                alt="User"
                className="w-10 h-10 rounded-full"
              />
              <div>
                <div className={`font-semibold ${safeText.primary}`}>{user?.displayName || 'User'}</div>
                <div className={`text-sm ${safeText.tertiary}`}>{user?.email}</div>
              </div>
            </div>
            <button onClick={handleLogout} className={`p-2 rounded-full hover:${safeBg.secondary}`}>
              <LogOut className={`w-6 h-6 ${safeText.secondary}`} />
            </button>
          </div>
        </header>
        
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <Routes>
            <Route element={<Outlet context={{ user, selectedForm, setSelectedForm }} />}>
              <Route index element={<TaxDashboardContent />} />
              <Route path="discovery" element={<TaxFormDiscovery />} />
              <Route path="documents" element={<TaxDocumentManager />} />
              <Route path="glossary" element={<TaxGlossaryHelp />} />
              <Route path="filing" element={<EnhancedTaxReturnCompletion />} />
            </Route>
          </Routes>
        </div>
      </main>

    </div>
  );
};

export default TaxFilingDashboard;
