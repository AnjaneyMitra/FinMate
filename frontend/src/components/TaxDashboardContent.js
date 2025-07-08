import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import {
  FileText,
  CheckCircle2,
  FolderOpen,
  DollarSign,
  Clock,
  Shield,
  Zap,
  TrendingUp
} from 'lucide-react';

const TaxDashboardContent = () => {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [userStats, setUserStats] = useState({
    formsCompleted: 0,
    documentsUploaded: 0,
    estimatedRefund: 0,
    daysToDeadline: 45
  });

  // Theme integration
  const themeContext = useTheme();
  const { bg, text, border, accent } = themeContext || {};

  // Safe fallbacks
  const safeBg = bg || { primary: 'bg-white', secondary: 'bg-gray-50', card: 'bg-white', tertiary: 'bg-gray-100' };
  const safeText = text || { primary: 'text-gray-900', secondary: 'text-gray-600', tertiary: 'text-gray-500', accent: 'text-teal-600' };
  const safeBorder = border || { primary: 'border-gray-200' };
  const safeAccent = accent || { primary: 'bg-teal-600', secondary: 'bg-blue-600', success: 'bg-green-600' };

  useEffect(() => {
    // Mock data loading
    setUserStats({
      formsCompleted: 2,
      documentsUploaded: 8,
      estimatedRefund: 25000,
      daysToDeadline: 45
    });
  }, [user]);

  const quickActions = [
    { action: 'Start Form Discovery', desc: 'Find the right tax form for you', path: '/tax-filing/discovery' },
    { action: 'Upload Documents', desc: 'Add supporting documents', path: '/tax-filing/documents' },
    { action: 'Continue Filing', desc: 'Resume your tax return', path: '/tax-filing/filing' },
    { action: 'Get Help', desc: 'Browse glossary and FAQs', path: '/tax-filing/glossary' }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className={`p-8 rounded-2xl text-white ${safeAccent.primary} shadow-lg`}>
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
        <div className={`${safeBg.card} rounded-2xl p-6 shadow-xl border ${safeBorder.primary}`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 ${safeAccent.success} bg-opacity-10 rounded-xl flex items-center justify-center`}>
              <CheckCircle2 className={`w-6 h-6 ${safeText.accent}`} />
            </div>
            <span className={`text-2xl font-bold ${safeText.primary}`}>{userStats.formsCompleted}</span>
          </div>
          <h3 className={`font-semibold ${safeText.primary}`}>Forms Completed</h3>
          <p className={`text-sm ${safeText.secondary}`}>Tax forms ready for submission</p>
        </div>

        <div className={`${safeBg.card} rounded-2xl p-6 shadow-xl border ${safeBorder.primary}`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 ${safeAccent.secondary} bg-opacity-10 rounded-xl flex items-center justify-center`}>
              <FolderOpen className={`w-6 h-6 ${safeText.accent}`} />
            </div>
            <span className={`text-2xl font-bold ${safeText.primary}`}>{userStats.documentsUploaded}</span>
          </div>
          <h3 className={`font-semibold ${safeText.primary}`}>Documents Uploaded</h3>
          <p className={`text-sm ${safeText.secondary}`}>Supporting documents processed</p>
        </div>

        <div className={`${safeBg.card} rounded-2xl p-6 shadow-xl border ${safeBorder.primary}`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center`}>
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <span className={`text-2xl font-bold ${safeText.primary}`}>₹{userStats.estimatedRefund.toLocaleString()}</span>
          </div>
          <h3 className={`font-semibold ${safeText.primary}`}>Estimated Refund</h3>
          <p className={`text-sm ${safeText.secondary}`}>Based on current information</p>
        </div>

        <div className={`${safeBg.card} rounded-2xl p-6 shadow-xl border ${safeBorder.primary}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <span className={`text-2xl font-bold ${safeText.primary}`}>{userStats.daysToDeadline}</span>
          </div>
          <h3 className={`font-semibold ${safeText.primary}`}>Days to Deadline</h3>
          <p className={`text-sm ${safeText.secondary}`}>Time remaining for filing</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${safeBg.card} rounded-2xl p-6 shadow-xl border ${safeBorder.primary}`}>
          <h3 className={`text-xl font-bold ${safeText.primary} mb-4`}>Quick Actions</h3>
          <div className="space-y-3">
            {quickActions.map((item, index) => (
              <button
                key={index}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center justify-between p-4 ${safeBg.secondary} hover:${safeBg.tertiary} rounded-xl transition-all group border ${safeBorder.primary}`}
              >
                <div className="text-left">
                  <div className={`font-medium ${safeText.primary}`}>{item.action}</div>
                  <div className={`text-sm ${safeText.secondary}`}>{item.desc}</div>
                </div>
                <div className={`w-8 h-8 ${safeBg.card} rounded-lg flex items-center justify-center group-hover:${safeBg.tertiary} transition-all border ${safeBorder.primary}`}>
                  <span className={safeText.accent}>→</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className={`${safeBg.card} rounded-2xl p-6 shadow-xl border ${safeBorder.primary}`}>
          <h3 className={`text-xl font-bold ${safeText.primary} mb-4`}>Recent Activity</h3>
          <div className="space-y-4">
            {[
              { action: 'Form 16 uploaded', time: '2 hours ago', status: 'success' },
              { action: 'ITR-1 draft saved', time: '1 day ago', status: 'info' },
              { action: 'Bank statement processed', time: '2 days ago', status: 'success' },
              { action: 'House rent receipt added', time: '3 days ago', status: 'success' }
            ].map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  item.status === 'success' ? safeAccent.success : safeAccent.secondary
                }`}></div>
                <div className="flex-1">
                  <div className={`text-sm font-medium ${safeText.primary}`}>{item.action}</div>
                  <div className={`text-xs ${safeText.tertiary}`}>{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Highlight */}
      <div className={`${safeBg.secondary} rounded-2xl p-8 border ${safeBorder.primary}`}>
        <h3 className={`text-2xl font-bold ${safeText.primary} mb-6 text-center`}>
          Why Choose Our Tax Filing System?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Shield, title: 'Bank-level Security', desc: 'Your data is encrypted and protected' },
            { icon: Zap, title: 'AI-Powered Assistance', desc: 'Smart recommendations and guidance' },
            { icon: TrendingUp, title: 'Maximize Refunds', desc: 'Find all eligible deductions' }
          ].map((feature, index) => (
            <div key={index} className="text-center">
              <div className={`w-16 h-16 ${safeBg.card} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg border ${safeBorder.primary}`}>
                <feature.icon className={`w-8 h-8 ${safeText.accent}`} />
              </div>
              <h4 className={`font-bold ${safeText.primary} mb-2`}>{feature.title}</h4>
              <p className={`text-sm ${safeText.secondary}`}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaxDashboardContent;
