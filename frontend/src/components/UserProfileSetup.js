import React, { useState } from 'react';
import { User, TrendingUp, Target, Briefcase, DollarSign } from 'lucide-react';

const UserProfileSetup = ({ onSave, initialProfile = null, onSkip = null }) => {
  const [profile, setProfile] = useState({
    age: initialProfile?.age || '',
    income_range: initialProfile?.income_range || '',
    investment_experience: initialProfile?.investment_experience || 'beginner',
    risk_tolerance: initialProfile?.risk_tolerance || 'moderate',
    investment_goals: initialProfile?.investment_goals || [],
    current_investments: initialProfile?.current_investments || [],
    monthly_savings: initialProfile?.monthly_savings || '',
    investment_timeline: initialProfile?.investment_timeline || 'long_term',
    location: initialProfile?.location || '',
    employment_type: initialProfile?.employment_type || 'salaried'
  });

  const [saving, setSaving] = useState(false);

  const handleInputChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field, value, checked) => {
    setProfile(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Convert string numbers to actual numbers
      const processedProfile = {
        ...profile,
        age: profile.age ? parseInt(profile.age) : null,
        monthly_savings: profile.monthly_savings ? parseFloat(profile.monthly_savings) : null
      };
      
      await onSave(processedProfile);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <User className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Personalize Your Learning</h2>
        <p className="text-gray-600">
          Help us create customized investment content just for you. This information helps our AI generate more relevant and personalized learning materials.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age
              </label>
              <input
                type="number"
                min="18"
                max="100"
                value={profile.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 28"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Annual Income Range
              </label>
              <select
                value={profile.income_range}
                onChange={(e) => handleInputChange('income_range', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select income range</option>
                <option value="0-3L">₹0 - ₹3 Lakhs</option>
                <option value="3-5L">₹3 - ₹5 Lakhs</option>
                <option value="5-10L">₹5 - ₹10 Lakhs</option>
                <option value="10-25L">₹10 - ₹25 Lakhs</option>
                <option value="25L+">₹25 Lakhs+</option>
              </select>
            </div>
          </div>
        </div>

        {/* Investment Experience */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Investment Experience
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { value: 'beginner', label: 'Beginner', desc: 'New to investing' },
              { value: 'intermediate', label: 'Intermediate', desc: 'Some experience' },
              { value: 'advanced', label: 'Advanced', desc: 'Experienced investor' }
            ].map((option) => (
              <label key={option.value} className="relative">
                <input
                  type="radio"
                  name="experience"
                  value={option.value}
                  checked={profile.investment_experience === option.value}
                  onChange={(e) => handleInputChange('investment_experience', e.target.value)}
                  className="sr-only"
                />
                <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  profile.investment_experience === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="font-medium text-gray-900">{option.label}</div>
                  <div className="text-sm text-gray-600">{option.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Risk Tolerance */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Risk Tolerance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { value: 'conservative', label: 'Conservative', desc: 'Prefer safety over returns' },
              { value: 'moderate', label: 'Moderate', desc: 'Balanced approach' },
              { value: 'aggressive', label: 'Aggressive', desc: 'Higher risk for higher returns' }
            ].map((option) => (
              <label key={option.value} className="relative">
                <input
                  type="radio"
                  name="risk"
                  value={option.value}
                  checked={profile.risk_tolerance === option.value}
                  onChange={(e) => handleInputChange('risk_tolerance', e.target.value)}
                  className="sr-only"
                />
                <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  profile.risk_tolerance === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="font-medium text-gray-900">{option.label}</div>
                  <div className="text-sm text-gray-600">{option.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Investment Goals */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Investment Goals (Select all that apply)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { value: 'retirement', label: 'Retirement Planning' },
              { value: 'house', label: 'Buying a House' },
              { value: 'child_education', label: 'Child Education' },
              { value: 'wealth_creation', label: 'Wealth Creation' },
              { value: 'emergency_fund', label: 'Emergency Fund' },
              { value: 'travel', label: 'Travel & Lifestyle' }
            ].map((goal) => (
              <label key={goal.value} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={profile.investment_goals.includes(goal.value)}
                  onChange={(e) => handleArrayChange('investment_goals', goal.value, e.target.checked)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{goal.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Current Investments */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Current Investments (Select all that apply)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { value: 'fd', label: 'Fixed Deposits' },
              { value: 'mutual_funds', label: 'Mutual Funds' },
              { value: 'stocks', label: 'Direct Stocks' },
              { value: 'ppf', label: 'PPF/EPF' },
              { value: 'real_estate', label: 'Real Estate' },
              { value: 'gold', label: 'Gold/Jewelry' }
            ].map((investment) => (
              <label key={investment.value} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={profile.current_investments.includes(investment.value)}
                  onChange={(e) => handleArrayChange('current_investments', investment.value, e.target.checked)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{investment.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Additional Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Savings Capacity
              </label>
              <input
                type="number"
                min="0"
                value={profile.monthly_savings}
                onChange={(e) => handleInputChange('monthly_savings', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 10000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Investment Timeline
              </label>
              <select
                value={profile.investment_timeline}
                onChange={(e) => handleInputChange('investment_timeline', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="short_term">Short Term (1-3 years)</option>
                <option value="medium_term">Medium Term (3-7 years)</option>
                <option value="long_term">Long Term (7+ years)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employment Type
              </label>
              <select
                value={profile.employment_type}
                onChange={(e) => handleInputChange('employment_type', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="salaried">Salaried Employee</option>
                <option value="business">Business Owner</option>
                <option value="freelancer">Freelancer</option>
                <option value="retired">Retired</option>
                <option value="student">Student</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            💡 This information helps generate personalized investment advice
          </div>
          <div className="flex gap-4">
            {onSkip && (
              <button
                type="button"
                onClick={onSkip}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Skip for now
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                'Save Profile'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UserProfileSetup;
