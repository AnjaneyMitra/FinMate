import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import TaxFormDiscoveryNew from './TaxFormDiscoveryNew';
import TaxFilingWizard from './TaxFilingWizard';
import TaxGlossaryHelp from './TaxGlossaryHelp';
import TaxDocumentManager from './TaxDocumentManager';
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
  BarChart3,
  Calendar,
  Shield,
  Zap,
  CheckCircle2,
  TrendingUp,
  Clock,
  DollarSign
} from 'lucide-react';

const TaxFilingDashboard = ({ user }) => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedFormId, setSelectedFormId] = useState(null);
  const [userStats, setUserStats] = useState({
    formsCompleted: 0,
    documentsUploaded: 0,
    estimatedRefund: 0,
    daysToDeadline: 45
  });

  const navigationItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: Home,
      description: 'Overview and quick stats'
    },
    {
      id: 'discovery',
      name: 'Form Discovery',
      icon: Compass,
      description: 'Find the right tax form'
    },
    {
      id: 'documents',
      name: 'Document Manager',
      icon: FolderOpen,
      description: 'Upload and organize documents'
    },
    {
      id: 'glossary',
      name: 'Glossary & Help',
      icon: HelpCircle,
      description: 'Get help and explanations'
    },
    {
      id: 'filing',
      name: 'Tax Filing',
      icon: FileText,
      description: 'Complete your tax return'
    }
  ];

  useEffect(() => {
    loadUserStats();
  }, [user]);

  const loadUserStats = async () => {
    try {
      // Mock data - replace with actual API calls
      setUserStats({
        formsCompleted: 2,
        documentsUploaded: 8,
        estimatedRefund: 25000,
        daysToDeadline: 45
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const renderDashboardView = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="glass-card p-8 gradient-primary text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.displayName || user?.email?.split('@')[0] || 'Taxpayer'}! 👋
            </h1>
            <p className="text-blue-100 text-lg">
              Ready to file your taxes? Let's make it simple and efficient.
            </p>
          </div>
          <div className="hidden lg:block">
            <div className="w-32 h-32 bg-white bg-opacity-10 rounded-full flex items-center justify-center floating">
              <FileText className="w-16 h-16 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-luxury border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{userStats.formsCompleted}</span>
          </div>
          <h3 className="font-semibold text-gray-900">Forms Completed</h3>
          <p className="text-sm text-gray-600">Tax forms ready for submission</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-luxury border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FolderOpen className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{userStats.documentsUploaded}</span>
          </div>
          <h3 className="font-semibold text-gray-900">Documents Uploaded</h3>
          <p className="text-sm text-gray-600">Supporting documents processed</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-luxury border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">₹{userStats.estimatedRefund.toLocaleString()}</span>
          </div>
          <h3 className="font-semibold text-gray-900">Estimated Refund</h3>
          <p className="text-sm text-gray-600">Based on current information</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-luxury border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{userStats.daysToDeadline}</span>
          </div>
          <h3 className="font-semibold text-gray-900">Days to Deadline</h3>
          <p className="text-sm text-gray-600">Time remaining for filing</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-luxury border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {[
              { action: 'Start Form Discovery', desc: 'Find the right tax form for you', view: 'discovery' },
              { action: 'Upload Documents', desc: 'Add supporting documents', view: 'documents' },
              { action: 'Continue Filing', desc: 'Resume your tax return', view: 'filing' },
              { action: 'Get Help', desc: 'Browse glossary and FAQs', view: 'glossary' }
            ].map((item, index) => (
              <button
                key={index}
                onClick={() => setCurrentView(item.view)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all group"
              >
                <div className="text-left">
                  <div className="font-medium text-gray-900">{item.action}</div>
                  <div className="text-sm text-gray-600">{item.desc}</div>
                </div>
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center group-hover:bg-blue-50 transition-all">
                  <span className="text-blue-600">→</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-luxury border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[
              { action: 'Form 16 uploaded', time: '2 hours ago', status: 'success' },
              { action: 'ITR-1 draft saved', time: '1 day ago', status: 'info' },
              { action: 'Bank statement processed', time: '2 days ago', status: 'success' },
              { action: 'House rent receipt added', time: '3 days ago', status: 'success' }
            ].map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  item.status === 'success' ? 'bg-green-500' : 'bg-blue-500'
                }`}></div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{item.action}</div>
                  <div className="text-xs text-gray-500">{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Highlight */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Why Choose Our Tax Filing System?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Shield,
              title: 'Bank-level Security',
              desc: 'Your data is encrypted and protected'
            },
            {
              icon: Zap,
              title: 'AI-Powered Assistance',
              desc: 'Smart recommendations and guidance'
            },
            {
              icon: TrendingUp,
              title: 'Maximize Refunds',
              desc: 'Find all eligible deductions'
            }
          ].map((feature, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <feature.icon className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">{feature.title}</h4>
              <p className="text-sm text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return renderDashboardView();
      case 'discovery':
        return (
          <TaxFormDiscoveryNew 
            user={user} 
            onFormSelected={(formId) => {
              setSelectedFormId(formId);
              setCurrentView('filing');
            }}
          />
        );
      case 'documents':
        return <TaxDocumentManager user={user} />;
      case 'glossary':
        return <TaxGlossaryHelp />;
      case 'filing':
        return (
          <TaxFilingWizard 
            user={user} 
            formId={selectedFormId}
            onBack={() => setCurrentView('discovery')}
          />
        );
      default:
        return renderDashboardView();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Indian Tax Filing</h1>
              <p className="text-sm text-gray-600">Comprehensive Tax Return System</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all">
              <Settings className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium text-gray-900 hidden sm:block">
                {user?.displayName || user?.email?.split('@')[0] || 'User'}
              </span>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-6">
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className={`text-xs ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
                      {item.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Progress Card */}
          <div className="mt-8 p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border border-green-200">
            <div className="flex items-center space-x-2 mb-3">
              <BarChart3 className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-900">Filing Progress</span>
            </div>
            <div className="w-full bg-white rounded-full h-2 mb-2">
              <div className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full" style={{width: '65%'}}></div>
            </div>
            <p className="text-sm text-green-700">65% Complete</p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default TaxFilingDashboard;
