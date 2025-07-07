import React, { useState } from "react";
import { UserCheck, Rocket, Cloud, Shield, Building2, Brain, Target, TrendingUp } from 'lucide-react';
import PinButton from './components/PinButton';
import { useTheme, useThemeStyles } from './contexts/ThemeContext';

const questions = [
  {
    text: "What is your age group?",
    options: [
      { label: "Under 25", value: 4 },
      { label: "25-35", value: 3 },
      { label: "36-50", value: 2 },
      { label: "Above 50", value: 1 },
    ],
  },
  {
    text: "What is your primary investment goal?",
    options: [
      { label: "Aggressive growth (maximize returns)", value: 4 },
      { label: "Wealth accumulation (steady growth)", value: 3 },
      { label: "Capital preservation (minimize loss)", value: 2 },
      { label: "Regular income (stability)", value: 1 },
    ],
  },
  {
    text: "How would you react if your investment dropped 20% in a year?",
    options: [
      { label: "Invest more (see opportunity)", value: 4 },
      { label: "Stay invested (wait for recovery)", value: 3 },
      { label: "Reduce exposure (move to safer assets)", value: 2 },
      { label: "Sell all (avoid further loss)", value: 1 },
    ],
  },
  {
    text: "What is your investment time horizon?",
    options: [
      { label: "10+ years", value: 4 },
      { label: "5-10 years", value: 3 },
      { label: "2-5 years", value: 2 },
      { label: "Less than 2 years", value: 1 },
    ],
  },
  {
    text: "What portion of your income do you save/invest monthly?",
    options: [
      { label: ">= 30%", value: 4 },
      { label: "15-30%", value: 3 },
      { label: "5-15%", value: 2 },
      { label: "< 5%", value: 1 },
    ],
  },
  {
    text: "How familiar are you with investment products (stocks, bonds, mutual funds, etc.)?",
    options: [
      { label: "Very familiar (I research and track markets)", value: 4 },
      { label: "Somewhat familiar (basic understanding)", value: 3 },
      { label: "Limited knowledge", value: 2 },
      { label: "Not familiar at all", value: 1 },
    ],
  },
  {
    text: "What is your current financial situation?",
    options: [
      { label: "Surplus income, no major liabilities", value: 4 },
      { label: "Stable income, manageable liabilities", value: 3 },
      { label: "Some financial stress", value: 2 },
      { label: "High liabilities, unstable income", value: 1 },
    ],
  },
  {
    text: "How would you describe your attitude towards risk?",
    options: [
      { label: "Risk taker (comfortable with volatility)", value: 4 },
      { label: "Moderate risk taker", value: 3 },
      { label: "Cautious", value: 2 },
      { label: "Risk averse", value: 1 },
    ],
  },
];

function getRiskProfile(score) {
  if (score >= 26) return { type: "Aggressive", color: "red", desc: "You are comfortable with high risk and volatility for higher returns. Suitable for equity-heavy portfolios, startups, and global markets." };
  if (score >= 19) return { type: "Moderate", color: "yellow", desc: "You balance risk and reward. Suitable for a mix of equity, debt, and alternative assets." };
  if (score >= 13) return { type: "Conservative", color: "green", desc: "You prefer stability and capital preservation. Suitable for debt funds, large-cap stocks, and fixed income." };
  return { type: "Very Conservative", color: "blue", desc: "You prioritize safety and regular income. Suitable for FDs, government bonds, and low-risk funds." };
}

export default function RiskProfiler() {
  const themeContext = useTheme();
  const { bg, text, border, accent } = themeContext || {};
  const styles = useThemeStyles();
  
  // Safe fallbacks for theme properties
  const safeBg = bg || {
    primary: 'bg-white',
    secondary: 'bg-gray-50',
    card: 'bg-white'
  };
  const safeText = text || {
    primary: 'text-gray-900',
    secondary: 'text-gray-600',
    tertiary: 'text-gray-500'
  };
  const safeBorder = border || {
    primary: 'border-gray-200'
  };
  const safeAccent = accent || {
    primary: 'bg-teal-600',
    secondary: 'text-teal-600',
    bg: 'bg-teal-50',
    border: 'border-teal-500'
  };
  
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (qIdx, value) => {
    const newAnswers = [...answers];
    newAnswers[qIdx] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRetake = () => {
    setAnswers(Array(questions.length).fill(null));
    setSubmitted(false);
  };

  const totalScore = answers.reduce((sum, v) => sum + (v ? Number(v) : 0), 0);
  const profile = getRiskProfile(totalScore);
  const progress = Math.round((answers.filter(Boolean).length / questions.length) * 100);

  return (
    <div className={`max-w-2xl mx-auto ${safeBg.card} rounded-xl shadow-sm p-8 mt-8 border ${safeBorder.primary} relative overflow-hidden`}>
      <div className="absolute -top-4 -right-4 opacity-10 select-none pointer-events-none">
        <div className={`p-6 bg-gradient-to-br from-${safeAccent.primary.replace('bg-', '')} to-blue-600 rounded-2xl`}>
          <UserCheck className="w-24 h-24 text-white" />
        </div>
      </div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={`p-2 bg-gradient-to-r from-${safeAccent.primary.replace('bg-', '')} to-blue-600 rounded-lg`}>
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className={`text-3xl font-bold ${safeText.primary}`}>Risk Profiling Tool</h2>
            <p className={`${safeText.secondary}`}>Answer a few questions to discover your investment risk profile.</p>
          </div>
          <PinButton pageId="risk" />
        </div>
      </div>
      {/* Progress Bar */}
      <div className={`w-full ${safeBg.secondary} rounded-full h-3 mb-8`}>
        <div className={`${safeAccent.primary} h-3 rounded-full transition-all duration-300`} style={{ width: `${progress}%` }}></div>
      </div>
      {!submitted ? (
        <form className="space-y-8" onSubmit={handleSubmit}>
          {questions.map((q, i) => (
            <div key={i} className="mb-2">
              <div className={`font-semibold mb-3 text-lg ${safeText.primary} flex items-center`}>
                <span className={`inline-block w-8 h-8 rounded-full bg-gradient-to-r from-${safeAccent.primary.replace('bg-', '')} to-blue-600 text-white flex items-center justify-center mr-3 font-bold text-sm`}>{i + 1}</span>
                {q.text}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {q.options.map((opt, j) => (
                  <label key={j} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors text-base font-medium shadow-sm ${answers[i] === opt.value ? `${safeAccent.bg} ${safeAccent.border} ring-2 ring-${safeAccent.primary.replace('bg-', '')}-200` : `${safeBorder.primary} hover:${safeBg.secondary}`}`}>
                    <input
                      type="radio"
                      name={`q${i}`}
                      value={opt.value}
                      checked={answers[i] === opt.value}
                      onChange={() => handleChange(i, opt.value)}
                      className="mr-3 accent-teal-600"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-teal-600 hover:to-blue-700 text-xl font-bold shadow-lg mt-6 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            disabled={answers.includes(null)}
          >
            <div className="flex items-center justify-center gap-2">
              <Target className="w-5 h-5" />
              Assess My Risk Profile
            </div>
          </button>
        </form>
      ) : (
        <div className="mt-8 p-8 rounded-xl border border-gray-200 bg-gradient-to-br from-teal-50 to-blue-50 shadow-lg animate-fade-in">
          <div className="text-center mb-6">
            <div className="p-3 bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-md">
              {profile.type === 'Aggressive' ? <Rocket className="w-10 h-10 text-red-500" /> : 
               profile.type === 'Moderate' ? <Cloud className="w-10 h-10 text-yellow-500" /> : 
               profile.type === 'Conservative' ? <Shield className="w-10 h-10 text-green-500" /> : 
               <Building2 className="w-10 h-10 text-blue-500" />}
            </div>
            <h3 className="text-2xl font-bold mb-2 text-gray-800">Your Risk Profile: {profile.type}</h3>
            <p className="text-gray-700 mb-4 text-lg">{profile.desc}</p>
            <div className="flex items-center justify-center gap-2 text-gray-600 text-base mb-4">
              <TrendingUp className="w-5 h-5" />
              <span>Total Score: <span className="font-bold text-gray-900">{totalScore} / 32</span></span>
            </div>
          </div>
          <button
            onClick={handleRetake}
            className="w-full bg-white border border-teal-500 text-teal-700 px-6 py-3 rounded-lg hover:bg-teal-50 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          >
            Retake Assessment
          </button>
        </div>
      )}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-2">
          <div className="p-1 bg-blue-100 rounded-md mt-0.5">
            <Target className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-800 mb-1">Assessment Note</p>
            <p className="text-sm text-blue-700">
              This assessment is for guidance only. For investment decisions, consult a certified financial advisor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
