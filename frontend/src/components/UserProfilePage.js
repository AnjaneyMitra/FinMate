import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../firebase';
import { 
  User, TrendingUp, Target, Briefcase, DollarSign, Mail, Phone, 
  Edit, Save, X, MapPin, Calendar, Award, Wallet, Shield, 
  Sparkles, ChevronDown, ChevronUp, Camera, Zap, Gem, ArrowLeft
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ADVANCED_FIELDS = {
  employment_type: 'salaried',
  location: '',
  investment_experience: 'beginner',
  risk_tolerance: 'moderate',
  investment_goals: [],
  current_investments: [],
  monthly_savings: '',
  investment_timeline: 'long_term',
};

const GOALS = [
  { value: 'retirement', label: 'Retirement Planning', icon: <Calendar className="w-3 h-3" /> },
  { value: 'house', label: 'Buying a House', icon: <Briefcase className="w-3 h-3" /> },
  { value: 'child_education', label: 'Child Education', icon: <Award className="w-3 h-3" /> },
  { value: 'wealth_creation', label: 'Wealth Creation', icon: <Gem className="w-3 h-3" /> },
  { value: 'emergency_fund', label: 'Emergency Fund', icon: <Shield className="w-3 h-3" /> },
  { value: 'travel', label: 'Travel & Lifestyle', icon: <Zap className="w-3 h-3" /> },
];

const INVESTMENTS = [
  { value: 'fd', label: 'Fixed Deposits', icon: <Wallet className="w-3 h-3" /> },
  { value: 'mutual_funds', label: 'Mutual Funds', icon: <TrendingUp className="w-3 h-3" /> },
  { value: 'stocks', label: 'Direct Stocks', icon: <TrendingUp className="w-3 h-3" /> },
  { value: 'ppf', label: 'PPF/EPF', icon: <Shield className="w-3 h-3" /> },
  { value: 'real_estate', label: 'Real Estate', icon: <Briefcase className="w-3 h-3" /> },
  { value: 'gold', label: 'Gold/Jewelry', icon: <Gem className="w-3 h-3" /> },
];

const EXPERIENCE = [
  { value: 'beginner', label: 'Beginner', icon: <User className="w-3 h-3" /> },
  { value: 'intermediate', label: 'Intermediate', icon: <Award className="w-3 h-3" /> },
  { value: 'advanced', label: 'Advanced', icon: <Sparkles className="w-3 h-3" /> },
];

const RISK = [
  { value: 'conservative', label: 'Conservative', icon: <Shield className="w-3 h-3" /> },
  { value: 'moderate', label: 'Moderate', icon: <Target className="w-3 h-3" /> },
  { value: 'aggressive', label: 'Aggressive', icon: <Zap className="w-3 h-3" /> },
];

const EMPLOYMENT = [
  { value: 'salaried', label: 'Salaried Employee', icon: <Briefcase className="w-3 h-3" /> },
  { value: 'business', label: 'Business Owner', icon: <Briefcase className="w-3 h-3" /> },
  { value: 'freelancer', label: 'Freelancer', icon: <Zap className="w-3 h-3" /> },
  { value: 'retired', label: 'Retired', icon: <Calendar className="w-3 h-3" /> },
  { value: 'student', label: 'Student', icon: <Award className="w-3 h-3" /> },
];

const TIMELINE = [
  { value: 'short_term', label: 'Short Term (< 1 year)', icon: <Calendar className="w-3 h-3" /> },
  { value: 'medium_term', label: 'Medium Term (1-5 years)', icon: <Calendar className="w-3 h-3" /> },
  { value: 'long_term', label: 'Long Term (> 5 years)', icon: <Calendar className="w-3 h-3" /> },
];

export default function UserProfilePage() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', bio: '', ...ADVANCED_FIELDS
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isNewProfile, setIsNewProfile] = useState(false);
  const { bg, text, border, button, accent, components, styles } = useTheme();
  const profileRef = useRef(null);

  // Animation classes
  const fadeIn = "animate-[fade-in_0.5s_ease-out]";
  const slideDown = "animate-[slide-down_0.3s_ease-out]";
  const popIn = "animate-[pop-in_0.4s_ease-out]";

  useEffect(() => {
    let isMounted = true;
    async function fetchProfile() {
      setLoading(true);
      setError('');
      try {
        if (!auth.currentUser) {
          setError('You must be logged in to view your profile.');
          setLoading(false);
          return;
        }
        const token = await auth.currentUser.getIdToken();
        const res = await fetch('/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 404) {
          if (isMounted) {
            setProfile({ email: auth.currentUser.email });
            setForm({ full_name: '', email: auth.currentUser.email || '', phone: '', bio: '', ...ADVANCED_FIELDS });
            setError('No profile found. Please complete your profile.');
            setIsNewProfile(true);
          }
        } else if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setProfile(data);
            setForm({
              full_name: data.full_name || '',
              email: data.email || '',
              phone: data.phone || '',
              bio: data.bio || '',
              ...ADVANCED_FIELDS,
              ...data,
            });
            setError('');
            setIsNewProfile(false);
          }
        } else {
          throw new Error('Could not fetch profile');
        }
      } catch (e) {
        if (isMounted) setError('Failed to load profile.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchProfile();
    return () => { isMounted = false; };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm((prev) => ({
        ...prev,
        [name]: checked
          ? [...(prev[name] || []), value]
          : (prev[name] || []).filter((v) => v !== value),
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRadioChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (!auth.currentUser) throw new Error('Not authenticated');
      const token = await auth.currentUser.getIdToken();
      const method = isNewProfile ? 'POST' : 'PUT';
      const res = await fetch('/api/user/profile', {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Could not update profile');
      const data = await res.json();
      setProfile(data);
      setForm({
        full_name: data.full_name || '',
        email: data.email || '',
        phone: data.phone || '',
        bio: data.bio || '',
        ...ADVANCED_FIELDS,
        ...data,
      });
      setEditMode(false);
      setError('');
      setIsNewProfile(false);
    } catch (e) {
      setError('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className={`flex justify-center items-center min-h-[60vh] ${fadeIn}`}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin border-teal-500"></div>
        <p className={`text-lg ${text.secondary}`}>Loading your profile...</p>
      </div>
    </div>
  );

  const getInitials = () => {
    if (form.full_name) {
      return form.full_name.split(' ')
        .map(name => name[0]?.toUpperCase())
        .join('')
        .substring(0, 2);
    }
    return form.email?.[0]?.toUpperCase() || 'U';
  };

  const getProfileCompleteness = () => {
    const requiredFields = [
      'full_name', 'email', 'phone', 'bio', 'location', 
      'employment_type', 'investment_experience', 'risk_tolerance'
    ];
    const optionalFields = ['investment_goals', 'current_investments', 'monthly_savings', 'investment_timeline'];
    
    let score = 0;
    requiredFields.forEach(field => {
      if (form[field] && form[field] !== '') score += 10;
    });
    
    optionalFields.forEach(field => {
      if (Array.isArray(form[field]) && form[field].length > 0) score += 5;
      else if (form[field] && form[field] !== '') score += 5;
    });
    
    return Math.min(100, score);
  };

  const completeness = getProfileCompleteness();

  return (
    <div className={`min-h-screen ${bg.primary} flex flex-col items-center py-12 px-4 ${fadeIn}`}>
      <div className="w-full max-w-5xl mx-auto">
        <Link to="/dashboard" className={`inline-flex items-center gap-2 mb-6 ${styles.button.secondary} ${popIn}`}>
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
        {/* Profile Header Card */}
        <div className={`rounded-3xl shadow-2xl overflow-hidden ${bg.card} border ${border.primary} mb-8 ${popIn}`}>
          {/* Cover Photo Area */}
          <div className="h-48 bg-gradient-to-r from-teal-400 via-blue-500 to-indigo-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute bottom-4 right-4">
              {!editMode ? (
                <button 
                  className={`${styles.button.primary} flex items-center gap-2`} 
                  onClick={() => setEditMode(true)}
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button 
                    type="button" 
                    className={`${styles.button.secondary} flex items-center gap-2`} 
                    onClick={() => { setEditMode(false); setForm(profile); }} 
                    disabled={saving}
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className={`${styles.button.primary} flex items-center gap-2`} 
                    onClick={handleSave} 
                    disabled={saving}
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Profile Info Section */}
          <div className="px-8 py-6 relative">
            {/* Profile Avatar */}
            <div className="absolute -top-16 left-8 rounded-full p-1 bg-white shadow-xl">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-3xl font-bold text-white overflow-hidden">
                {getInitials()}
              </div>
              {editMode && (
                <button className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors">
                  <Camera className="w-5 h-5 text-gray-700" />
                </button>
              )}
            </div>
            
            {/* Profile Details */}
            <div className="ml-36 flex flex-col md:flex-row justify-between">
              <div>
                <h1 className={`text-3xl font-bold ${text.primary}`}>
                  {form.full_name || form.email?.split('@')[0] || 'User'}
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                  <div className={`flex items-center gap-2 ${text.secondary}`}>
                    <Mail className="w-4 h-4" /> {form.email}
                  </div>
                  {form.phone && (
                    <div className={`flex items-center gap-2 ${text.secondary}`}>
                      <Phone className="w-4 h-4" /> {form.phone}
                    </div>
                  )}
                  {form.location && (
                    <div className={`flex items-center gap-2 ${text.secondary}`}>
                      <MapPin className="w-4 h-4" /> {form.location}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Profile Completeness */}
              <div className="mt-4 md:mt-0 flex flex-col items-center">
                <div className="relative w-20 h-20">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle 
                      className="text-gray-200" 
                      strokeWidth="8" 
                      stroke="currentColor" 
                      fill="transparent" 
                      r="40" 
                      cx="50" 
                      cy="50" 
                    />
                    <circle 
                      className="text-teal-500" 
                      strokeWidth="8" 
                      strokeDasharray={`${completeness * 2.51} 251`}
                      strokeLinecap="round" 
                      stroke="currentColor" 
                      fill="transparent" 
                      r="40" 
                      cx="50" 
                      cy="50" 
                    />
                    <text 
                      x="50" 
                      y="50" 
                      className="text-lg font-bold" 
                      dominantBaseline="middle" 
                      textAnchor="middle"
                      fill={completeness >= 80 ? '#10b981' : completeness >= 40 ? '#0ea5e9' : '#ef4444'}
                    >
                      {completeness}%
                    </text>
                  </svg>
                </div>
                <p className={`text-sm font-medium ${text.secondary} mt-1`}>Profile Completeness</p>
              </div>
            </div>
            
            {/* Bio */}
            {form.bio && !editMode && (
              <div className={`mt-6 ${text.secondary} text-base`}>
                <p>{form.bio}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Profile Content */}
        {!editMode ? (
          <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${fadeIn}`}>
            {/* Left Column - Personal Info */}
            <div className={`lg:col-span-1 ${slideDown}`}>
              <div className={`rounded-2xl shadow-lg ${bg.card} border ${border.primary} p-6 mb-6`}>
                <h2 className={`text-xl font-bold ${text.primary} mb-4 flex items-center gap-2`}>
                  <User className="w-5 h-5" /> Personal Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className={`text-sm font-semibold ${text.tertiary} uppercase`}>Employment</h3>
                    <p className={`${text.primary} flex items-center gap-2 mt-1`}>
                      <Briefcase className="w-4 h-4 text-teal-500" />
                      {EMPLOYMENT.find(e => e.value === form.employment_type)?.label || 'Not specified'}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className={`text-sm font-semibold ${text.tertiary} uppercase`}>Location</h3>
                    <p className={`${text.primary} flex items-center gap-2 mt-1`}>
                      <MapPin className="w-4 h-4 text-teal-500" />
                      {form.location || 'Not specified'}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className={`text-sm font-semibold ${text.tertiary} uppercase`}>Contact</h3>
                    <div className="space-y-2 mt-1">
                      <p className={`${text.primary} flex items-center gap-2`}>
                        <Mail className="w-4 h-4 text-teal-500" /> {form.email}
                      </p>
                      <p className={`${text.primary} flex items-center gap-2`}>
                        <Phone className="w-4 h-4 text-teal-500" /> {form.phone || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Investment Timeline */}
              <div className={`rounded-2xl shadow-lg ${bg.card} border ${border.primary} p-6`}>
                <h2 className={`text-xl font-bold ${text.primary} mb-4 flex items-center gap-2`}>
                  <Calendar className="w-5 h-5" /> Investment Timeline
                </h2>
                <div className="relative pt-6">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-teal-200"></div>
                  <div className="relative z-10 flex items-center mb-6">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${form.investment_timeline === 'short_term' ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <span className="text-xs font-bold">1</span>
                    </div>
                    <div className="ml-4">
                      <h3 className={`text-base font-medium ${form.investment_timeline === 'short_term' ? text.accent : text.secondary}`}>Short Term</h3>
                      <p className={`text-sm ${text.tertiary}`}>Less than 1 year</p>
                    </div>
                  </div>
                  
                  <div className="relative z-10 flex items-center mb-6">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${form.investment_timeline === 'medium_term' ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <span className="text-xs font-bold">2</span>
                    </div>
                    <div className="ml-4">
                      <h3 className={`text-base font-medium ${form.investment_timeline === 'medium_term' ? text.accent : text.secondary}`}>Medium Term</h3>
                      <p className={`text-sm ${text.tertiary}`}>1-5 years</p>
                    </div>
                  </div>
                  
                  <div className="relative z-10 flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${form.investment_timeline === 'long_term' ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <span className="text-xs font-bold">3</span>
                    </div>
                    <div className="ml-4">
                      <h3 className={`text-base font-medium ${form.investment_timeline === 'long_term' ? text.accent : text.secondary}`}>Long Term</h3>
                      <p className={`text-sm ${text.tertiary}`}>More than 5 years</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Middle Column - Investment Profile */}
            <div className={`lg:col-span-2 ${slideDown}`}>
              <div className={`rounded-2xl shadow-lg ${bg.card} border ${border.primary} p-6 mb-6`}>
                <h2 className={`text-xl font-bold ${text.primary} mb-6 flex items-center gap-2`}>
                  <Target className="w-5 h-5" /> Investment Profile
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Experience & Risk */}
                  <div className="space-y-6">
                    <div>
                      <h3 className={`text-sm font-semibold ${text.tertiary} uppercase mb-3`}>Experience Level</h3>
                      <div className={`p-4 rounded-xl ${bg.secondary} border ${border.primary}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                              <TrendingUp className="w-5 h-5 text-teal-600" />
                            </div>
                            <div>
                              <p className={`font-medium ${text.primary}`}>
                                {EXPERIENCE.find(e => e.value === form.investment_experience)?.label || 'Not specified'}
                              </p>
                              <p className={`text-sm ${text.tertiary}`}>Investment Experience</p>
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${form.investment_experience === 'beginner' ? 'bg-blue-100 text-blue-700' : form.investment_experience === 'intermediate' ? 'bg-teal-100 text-teal-700' : 'bg-purple-100 text-purple-700'}`}>
                            {form.investment_experience === 'beginner' ? 'Learning' : form.investment_experience === 'intermediate' ? 'Growing' : 'Expert'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className={`text-sm font-semibold ${text.tertiary} uppercase mb-3`}>Risk Tolerance</h3>
                      <div className={`p-4 rounded-xl ${bg.secondary} border ${border.primary}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                              <Shield className="w-5 h-5 text-teal-600" />
                            </div>
                            <div>
                              <p className={`font-medium ${text.primary}`}>
                                {RISK.find(r => r.value === form.risk_tolerance)?.label || 'Not specified'}
                              </p>
                              <p className={`text-sm ${text.tertiary}`}>Risk Approach</p>
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${form.risk_tolerance === 'conservative' ? 'bg-green-100 text-green-700' : form.risk_tolerance === 'moderate' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                            {form.risk_tolerance === 'conservative' ? 'Safe' : form.risk_tolerance === 'moderate' ? 'Balanced' : 'Aggressive'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {form.monthly_savings && (
                      <div>
                        <h3 className={`text-sm font-semibold ${text.tertiary} uppercase mb-3`}>Monthly Savings</h3>
                        <div className={`p-4 rounded-xl ${bg.secondary} border ${border.primary}`}>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                              <Wallet className="w-5 h-5 text-teal-600" />
                            </div>
                            <div>
                              <p className={`font-medium ${text.primary}`}>₹{parseInt(form.monthly_savings).toLocaleString()}</p>
                              <p className={`text-sm ${text.tertiary}`}>Monthly Investment Capacity</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Goals & Investments */}
                  <div className="space-y-6">
                    <div>
                      <h3 className={`text-sm font-semibold ${text.tertiary} uppercase mb-3`}>Investment Goals</h3>
                      {form.investment_goals?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {form.investment_goals.map(goal => {
                            const goalInfo = GOALS.find(g => g.value === goal);
                            return (
                              <div key={goal} className="px-3 py-2 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 text-sm font-medium flex items-center gap-2">
                                {goalInfo?.icon || <Target className="w-3 h-3" />}
                                {goalInfo?.label || goal}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className={`italic ${text.tertiary}`}>No investment goals specified</p>
                      )}
                    </div>
                    
                    <div>
                      <h3 className={`text-sm font-semibold ${text.tertiary} uppercase mb-3`}>Current Investments</h3>
                      {form.current_investments?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {form.current_investments.map(inv => {
                            const invInfo = INVESTMENTS.find(i => i.value === inv);
                            return (
                              <div key={inv} className="px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium flex items-center gap-2">
                                {invInfo?.icon || <DollarSign className="w-3 h-3" />}
                                {invInfo?.label || inv}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className={`italic ${text.tertiary}`}>No current investments specified</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Recommendations */}
              <div className={`rounded-2xl shadow-lg ${bg.card} border ${border.primary} p-6`}>
                <h2 className={`text-xl font-bold ${text.primary} mb-4 flex items-center gap-2`}>
                  <Sparkles className="w-5 h-5" /> Personalized Recommendations
                </h2>
                <div className="p-4 rounded-xl bg-gradient-to-br from-teal-50 to-blue-50 border border-teal-100">
                  <p className={`${text.primary} mb-3`}>Based on your profile, we recommend:</p>
                  <ul className="space-y-2">
                    {form.risk_tolerance === 'conservative' && (
                      <li className="flex items-start gap-2">
                        <Shield className="w-4 h-4 text-teal-600 mt-0.5" />
                        <span>Focus on fixed income and debt instruments for stability</span>
                      </li>
                    )}
                    {form.risk_tolerance === 'moderate' && (
                      <li className="flex items-start gap-2">
                        <Target className="w-4 h-4 text-teal-600 mt-0.5" />
                        <span>Balanced portfolio with mix of equity and debt</span>
                      </li>
                    )}
                    {form.risk_tolerance === 'aggressive' && (
                      <li className="flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-teal-600 mt-0.5" />
                        <span>Higher allocation to equity for growth potential</span>
                      </li>
                    )}
                    {form.investment_experience === 'beginner' && (
                      <li className="flex items-start gap-2">
                        <Zap className="w-4 h-4 text-teal-600 mt-0.5" />
                        <span>Start with mutual funds and ETFs for diversification</span>
                      </li>
                    )}
                    {form.investment_timeline === 'long_term' && (
                      <li className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-teal-600 mt-0.5" />
                        <span>Consider tax-advantaged retirement accounts</span>
                      </li>
                    )}
                  </ul>
                  <div className="mt-4">
                    <button className={`${styles.button('primary')} w-full`}>View Detailed Recommendations</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Edit Profile Form */
          <form onSubmit={handleSave} className={`rounded-2xl shadow-lg ${bg.card} border ${border.primary} p-8 mb-8 ${fadeIn}`}>
            {/* Form Tabs */}
            <div className="flex border-b mb-6 ${border.primary}">
              <button 
                type="button"
                className={`px-4 py-2 font-medium ${activeTab === 'personal' ? `${text.accent} border-b-2 ${border.accent}` : text.secondary}`}
                onClick={() => setActiveTab('personal')}
              >
                Personal Information
              </button>
              <button 
                type="button"
                className={`px-4 py-2 font-medium ${activeTab === 'investment' ? `${text.accent} border-b-2 ${border.accent}` : text.secondary}`}
                onClick={() => setActiveTab('investment')}
              >
                Investment Profile
              </button>
            </div>
            
            {activeTab === 'personal' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ${slideDown}">
                <div className="flex flex-col gap-2">
                  <label className={`font-semibold ${text.secondary}`}>Full Name</label>
                  <input 
                    type="text" 
                    name="full_name" 
                    value={form.full_name} 
                    onChange={handleChange} 
                    className={styles.input()} 
                    autoComplete="name" 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className={`font-semibold ${text.secondary}`}>Email</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={form.email} 
                    disabled 
                    className={styles.input()} 
                    autoComplete="email" 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className={`font-semibold ${text.secondary}`}>Phone</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={form.phone} 
                    onChange={handleChange} 
                    className={styles.input()} 
                    autoComplete="tel" 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className={`font-semibold ${text.secondary}`}>Location</label>
                  <input 
                    type="text" 
                    name="location" 
                    value={form.location} 
                    onChange={handleChange} 
                    className={styles.input()} 
                    placeholder="e.g., Mumbai" 
                  />
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className={`font-semibold ${text.secondary}`}>Bio</label>
                  <textarea 
                    name="bio" 
                    value={form.bio} 
                    onChange={handleChange} 
                    className={styles.input()} 
                    rows="4"
                    autoComplete="off" 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className={`font-semibold ${text.secondary}`}>Employment Type</label>
                  <select 
                    name="employment_type" 
                    value={form.employment_type} 
                    onChange={handleChange} 
                    className={styles.input()}
                  >
                    {EMPLOYMENT.map(e => (
                      <option key={e.value} value={e.value}>{e.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            
            {activeTab === 'investment' && (
              <div className="space-y-6 ${slideDown}">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className={`font-semibold ${text.secondary}`}>Investment Experience</label>
                    <select 
                      name="investment_experience" 
                      value={form.investment_experience} 
                      onChange={handleChange} 
                      className={styles.input()}
                    >
                      {EXPERIENCE.map(e => (
                        <option key={e.value} value={e.value}>{e.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={`font-semibold ${text.secondary}`}>Risk Tolerance</label>
                    <select 
                      name="risk_tolerance" 
                      value={form.risk_tolerance} 
                      onChange={handleChange} 
                      className={styles.input()}
                    >
                      {RISK.map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={`font-semibold ${text.secondary}`}>Monthly Savings</label>
                    <input 
                      type="number" 
                      name="monthly_savings" 
                      value={form.monthly_savings} 
                      onChange={handleChange} 
                      className={styles.input()} 
                      min="0" 
                      placeholder="e.g., 10000" 
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={`font-semibold ${text.secondary}`}>Investment Timeline</label>
                    <select 
                      name="investment_timeline" 
                      value={form.investment_timeline} 
                      onChange={handleChange} 
                      className={styles.input()}
                    >
                      {TIMELINE.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className={`font-semibold ${text.secondary}`}>Investment Goals</label>
                  <div className="flex flex-wrap gap-2">
                    {GOALS.map(goal => (
                      <label 
                        key={goal.value} 
                        className={`px-4 py-2 rounded-lg border ${border.primary} cursor-pointer text-sm font-medium flex items-center gap-2 ${form.investment_goals?.includes(goal.value) ? 'bg-teal-100 border-teal-400 text-teal-700' : bg.secondary}`}
                      > 
                        <input 
                          type="checkbox" 
                          name="investment_goals" 
                          value={goal.value} 
                          checked={form.investment_goals?.includes(goal.value)} 
                          onChange={handleChange} 
                          className="sr-only" 
                        />
                        {goal.icon}
                        {goal.label}
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className={`font-semibold ${text.secondary}`}>Current Investments</label>
                  <div className="flex flex-wrap gap-2">
                    {INVESTMENTS.map(inv => (
                      <label 
                        key={inv.value} 
                        className={`px-4 py-2 rounded-lg border ${border.primary} cursor-pointer text-sm font-medium flex items-center gap-2 ${form.current_investments?.includes(inv.value) ? 'bg-blue-100 border-blue-400 text-blue-700' : bg.secondary}`}
                      > 
                        <input 
                          type="checkbox" 
                          name="current_investments" 
                          value={inv.value} 
                          checked={form.current_investments?.includes(inv.value)} 
                          onChange={handleChange} 
                          className="sr-only" 
                        />
                        {inv.icon}
                        {inv.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-2 mt-8">
              <button 
                type="button" 
                className={styles.button('secondary')} 
                onClick={() => { setEditMode(false); setForm(profile); }} 
                disabled={saving}
              >
                <X className="w-4 h-4 mr-1" />Cancel
              </button>
              <button 
                type="submit" 
                className={styles.button('primary')} 
                disabled={saving}
              >
                <Save className="w-4 h-4 mr-1" />{saving ? 'Saving...' : 'Save'}
              </button>
            </div>
            {error && (
              <div className={`mt-6 text-red-500 text-base text-center font-semibold bg-red-50/80 rounded-lg py-2 shadow-lg ring-1 ring-red-200/40`}>
                {error}
              </div>
            )}
          </form>
        )}
        
        {!editMode && error && (
          <div className={`mt-6 text-red-500 text-base text-center font-semibold bg-red-50/80 rounded-lg py-2 shadow-lg ring-1 ring-red-200/40`}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
