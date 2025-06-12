import React, { useState } from "react";

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
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 mt-8 border border-teal-100 relative overflow-hidden">
      <div className="absolute -top-8 -right-8 opacity-10 text-[10rem] select-none pointer-events-none">🧑‍💼</div>
      <h2 className="text-3xl font-extrabold mb-2 text-teal-700 text-center drop-shadow">Risk Profiling Tool</h2>
      <p className="text-gray-600 mb-6 text-center">Answer a few questions to discover your investment risk profile.</p>
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-8">
        <div className="bg-teal-500 h-3 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
      </div>
      {!submitted ? (
        <form className="space-y-8" onSubmit={handleSubmit}>
          {questions.map((q, i) => (
            <div key={i} className="mb-2">
              <div className="font-semibold mb-3 text-lg text-gray-800 flex items-center">
                <span className="inline-block w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center mr-3 font-bold">{i + 1}</span>
                {q.text}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {q.options.map((opt, j) => (
                  <label key={j} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors text-base font-medium shadow-sm ${answers[i] === opt.value ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-200' : 'border-gray-200 hover:bg-gray-50'}`}>
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
            className="w-full bg-gradient-to-r from-teal-500 to-blue-400 text-white px-6 py-3 rounded-lg hover:from-teal-600 hover:to-blue-500 text-xl font-bold shadow-lg mt-6 transition-all"
            disabled={answers.includes(null)}
          >
            Assess My Risk Profile
          </button>
        </form>
      ) : (
        <div className={`mt-8 p-8 rounded-2xl border-l-8 border-${profile.color}-500 bg-${profile.color}-50 shadow-lg animate-fade-in`}> 
          <h3 className={`text-2xl font-extrabold mb-2 text-${profile.color}-700`}>Your Risk Profile: {profile.type}</h3>
          <p className="text-gray-800 mb-4 text-lg">{profile.desc}</p>
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl bg-${profile.color}-100 border-4 border-${profile.color}-300`}>{profile.type === 'Aggressive' ? '🚀' : profile.type === 'Moderate' ? '🌤️' : profile.type === 'Conservative' ? '🛡️' : '🏦'}</div>
            <div className="text-gray-600 text-base">Total Score: <span className="font-bold text-gray-900">{totalScore} / 32</span></div>
          </div>
          <button
            onClick={handleRetake}
            className="bg-white border border-teal-500 text-teal-700 px-6 py-2 rounded-lg hover:bg-teal-50 font-semibold transition-colors mt-2"
          >
            Retake Assessment
          </button>
        </div>
      )}
      <div className="mt-8 text-gray-500 text-sm text-center">
        <b>Note:</b> This assessment is for guidance only. For investment decisions, consult a certified financial advisor.
      </div>
    </div>
  );
}
