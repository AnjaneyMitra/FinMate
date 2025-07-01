import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardPreview, GoalsPreview, BudgetPreview } from './components/FeaturePreviews'

export default function LandingPage() {
	const navigate = useNavigate();

	// Theme dropdown logic
	const [theme, setTheme] = useState(() => {
		return localStorage.getItem('theme') || 'light';
	});

	useEffect(() => {
		document.documentElement.classList.remove('light', 'dark', 'cyberpunk');
		document.documentElement.classList.add(theme);
		localStorage.setItem('theme', theme);
	}, [theme]);

	// Cyberpunk style overrides
	useEffect(() => {
		if (theme === 'cyberpunk') {
			document.body.style.backgroundColor = '#0f0f0f';
			document.body.style.color = '#f500f5';
			document.body.style.fontFamily = "'Orbitron', sans-serif";
		} else {
			document.body.style.backgroundColor = '';
			document.body.style.color = '';
			document.body.style.fontFamily = '';
		}
	}, [theme]);

	return (
		<div className={`min-h-screen font-sans antialiased ${theme === 'cyberpunk' ? 'cyberpunk' : ''} ${theme === 'dark' ? 'dark' : ''} ${theme === 'light' ? 'light' : ''}`}
			style={theme === 'cyberpunk' ? { backgroundColor: '#0f0f0f', color: '#f500f5', fontFamily: 'Orbitron, sans-serif' } : {}}>
			{/* Fixed header */}
			<header className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 border-b shadow-sm ${theme === 'cyberpunk' ? 'bg-black border-pink-500' : theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white/95 border-gray-200'}`}>
				<div className="flex items-center gap-3">
					<span className="text-2xl">🧩</span>
					<span className={`font-bold text-xl md:text-2xl tracking-tight ${theme === 'cyberpunk' ? 'text-pink-400' : theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>FinMate</span>
				</div>
				<div className="flex items-center gap-4">
					<select
						className={`px-3 py-2 rounded-lg border text-sm font-medium focus:outline-none focus:ring-2 transition-colors duration-200 ${theme === 'cyberpunk' ? 'bg-black text-pink-400 border-pink-500 focus:ring-pink-400' : theme === 'dark' ? 'bg-gray-900 text-white border-gray-700 focus:ring-teal-400' : 'bg-white text-gray-900 border-gray-300 focus:ring-teal-400'}`}
						value={theme}
						onChange={e => setTheme(e.target.value)}
						aria-label="Select theme"
					>
						<option value="light">Light Mode</option>
						<option value="dark">Dark Mode</option>
						<option value="cyberpunk">Cyberpunk</option>
					</select>
					<button
						className={theme === 'cyberpunk'
							? 'font-semibold text-sm md:text-base rounded-lg transition-all duration-200 hover:scale-105 shadow-md px-6 py-2.5 border-none'
							: theme === 'dark'
								? 'px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-semibold transition-all duration-200 hover:scale-105 shadow-md text-sm md:text-base'
								: 'px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold transition-all duration-200 hover:scale-105 shadow-md text-sm md:text-base'}
						style={theme === 'cyberpunk' ? {
							background: 'linear-gradient(45deg, #ff0080, #7928ca)',
							color: '#fff',
							boxShadow: '0 0 10px #ff0080',
						} : {}}
						onClick={() => navigate('/login')}
					>
						Try it out
					</button>
				</div>
			</header>

			{/* Hero Section */}
			<section className={`relative min-h-screen flex items-center justify-center overflow-hidden ${theme === 'cyberpunk' ? 'bg-black' : theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-teal-50'}`}>
				<div className="text-center z-10 max-w-5xl mx-auto px-4 py-20">
					<h1 className={`text-4xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tight leading-tight ${theme === 'cyberpunk' ? 'text-pink-400' : theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
						<span className={theme === 'cyberpunk' ? 'text-pink-400' : theme === 'dark' ? 'text-white' : 'text-gray-900'}>Modern Finance,</span>
						<span className={theme === 'cyberpunk' ? 'text-cyan-400' : theme === 'dark' ? 'text-teal-400' : 'text-teal-600'}>Made Simple</span>
					</h1>
					<p className={`text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto font-light leading-relaxed mb-8 ${theme === 'cyberpunk' ? 'text-cyan-300' : theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
						Experience intelligent budgeting with AI-powered insights and a beautiful, minimal workspace designed for clarity and focus.
					</p>
					<div className="mt-12">
						<button
							className={theme === 'cyberpunk'
								? 'rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg text-lg border-none px-8 py-4'
								: theme === 'dark'
									? 'px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg text-lg'
									: 'px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg text-lg'}
							style={theme === 'cyberpunk' ? {
								background: 'linear-gradient(45deg, #ff0080, #7928ca)',
								color: '#fff',
								boxShadow: '0 0 10px #ff0080',
							} : {}}
							onClick={() => navigate('/login')}
						>
							Get Started Free
						</button>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className={theme === 'cyberpunk' ? 'relative py-20 md:py-32 bg-black' : theme === 'dark' ? 'relative py-20 md:py-32 bg-gray-900' : 'relative py-20 md:py-32 bg-white'}>
				<div className="max-w-7xl mx-auto px-4 md:px-6">
					<div className="text-center mb-16 md:mb-20">
						<h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-4 ${theme === 'cyberpunk' ? 'text-pink-400' : theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Core Features</h2>
						<p className={`text-lg md:text-xl max-w-2xl mx-auto ${theme === 'cyberpunk' ? 'text-cyan-300' : theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Everything you need to take control of your finances</p>
					</div>
					<div className="space-y-20 md:space-y-32">
						{/* Real-Time Dashboard Feature */}
						<div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
							<div className="flex-1 text-center lg:text-left">
								<h3 className={`text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6 ${theme === 'cyberpunk' ? 'text-pink-400' : theme === 'dark' ? 'text-teal-400' : 'text-teal-600'}`}>Real-Time Dashboard</h3>
								<p className={`text-base md:text-lg lg:text-xl leading-relaxed max-w-xl mx-auto lg:mx-0 ${theme === 'cyberpunk' ? 'text-cyan-300' : theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Live updates and interactive visualizations give you instant clarity on your financial health and spending patterns with smart insights.</p>
								<div className="mt-6 flex flex-wrap gap-3 justify-center lg:justify-start">
									<span className={theme === 'cyberpunk' ? 'px-3 py-1 bg-black text-pink-400 border border-pink-500 rounded-full text-sm font-medium' : theme === 'dark' ? 'px-3 py-1 bg-gray-800 text-teal-400 rounded-full text-sm font-medium' : 'px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium'}>Live Analytics</span>
									<span className={theme === 'cyberpunk' ? 'px-3 py-1 bg-black text-pink-400 border border-pink-500 rounded-full text-sm font-medium' : theme === 'dark' ? 'px-3 py-1 bg-gray-800 text-teal-400 rounded-full text-sm font-medium' : 'px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium'}>Category Insights</span>
									<span className={theme === 'cyberpunk' ? 'px-3 py-1 bg-black text-pink-400 border border-pink-500 rounded-full text-sm font-medium' : theme === 'dark' ? 'px-3 py-1 bg-gray-800 text-teal-400 rounded-full text-sm font-medium' : 'px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium'}>Trend Analysis</span>
								</div>
							</div>
							<div className="flex-1 w-full max-w-md lg:max-w-none">
								<DashboardPreview theme={theme} />
							</div>
						</div>

						{/* Goal Tracking Feature */}
						<div className="flex flex-col lg:flex-row-reverse items-center gap-8 lg:gap-16">
							<div className="flex-1 text-center lg:text-left">
								<h3 className={`text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6 ${theme === 'cyberpunk' ? 'text-cyan-400' : theme === 'dark' ? 'text-gray-700' : 'text-gray-700'}`}>Smart Goal Tracking</h3>
								<p className={`text-base md:text-lg lg:text-xl leading-relaxed max-w-xl mx-auto lg:mx-0 ${theme === 'cyberpunk' ? 'text-cyan-300' : theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Visual progress tracking with gamified milestones to keep you motivated and on track to achieve your financial dreams.</p>
								<div className="mt-6 flex flex-wrap gap-3 justify-center lg:justify-start">
									<span className={theme === 'cyberpunk' ? 'px-3 py-1 bg-black text-cyan-400 border border-cyan-400 rounded-full text-sm font-medium' : theme === 'dark' ? 'px-3 py-1 bg-gray-800 text-teal-400 rounded-full text-sm font-medium' : 'px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium'}>Progress Tracking</span>
									<span className={theme === 'cyberpunk' ? 'px-3 py-1 bg-black text-cyan-400 border border-cyan-400 rounded-full text-sm font-medium' : theme === 'dark' ? 'px-3 py-1 bg-gray-800 text-teal-400 rounded-full text-sm font-medium' : 'px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium'}>Achievement Levels</span>
									<span className={theme === 'cyberpunk' ? 'px-3 py-1 bg-black text-cyan-400 border border-cyan-400 rounded-full text-sm font-medium' : theme === 'dark' ? 'px-3 py-1 bg-gray-800 text-teal-400 rounded-full text-sm font-medium' : 'px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium'}>Smart Insights</span>
								</div>
							</div>
							<div className="flex-1 w-full max-w-md lg:max-w-none">
								<GoalsPreview theme={theme} />
							</div>
						</div>

						{/* Budget Analytics Feature */}
						<div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
							<div className="flex-1 text-center lg:text-left">
								<h3 className={`text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6 ${theme === 'cyberpunk' ? 'text-pink-400' : theme === 'dark' ? 'text-teal-400' : 'text-teal-600'}`}>AI-Powered Budget Insights</h3>
								<p className={`text-base md:text-lg lg:text-xl leading-relaxed max-w-xl mx-auto lg:mx-0 ${theme === 'cyberpunk' ? 'text-cyan-300' : theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Machine learning algorithms analyze your spending patterns and provide actionable insights for better financial decisions and budget optimization.</p>
								<div className="mt-6 flex flex-wrap gap-3 justify-center lg:justify-start">
									<span className={theme === 'cyberpunk' ? 'px-3 py-1 bg-black text-pink-400 border border-pink-500 rounded-full text-sm font-medium' : theme === 'dark' ? 'px-3 py-1 bg-gray-800 text-teal-400 rounded-full text-sm font-medium' : 'px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium'}>Smart Recommendations</span>
									<span className={theme === 'cyberpunk' ? 'px-3 py-1 bg-black text-pink-400 border border-pink-500 rounded-full text-sm font-medium' : theme === 'dark' ? 'px-3 py-1 bg-gray-800 text-teal-400 rounded-full text-sm font-medium' : 'px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium'}>Budget vs Actual</span>
									<span className={theme === 'cyberpunk' ? 'px-3 py-1 bg-black text-pink-400 border border-pink-500 rounded-full text-sm font-medium' : theme === 'dark' ? 'px-3 py-1 bg-gray-800 text-teal-400 rounded-full text-sm font-medium' : 'px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium'}>Overspend Alerts</span>
								</div>
							</div>
							<div className="flex-1 w-full max-w-md lg:max-w-none">
								<BudgetPreview theme={theme} />
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Why Choose Section */}
			<section className={theme === 'cyberpunk' ? 'relative py-20 md:py-32 bg-black' : theme === 'dark' ? 'relative py-20 md:py-32 bg-gray-900' : 'relative py-20 md:py-32 bg-gray-50'}>
				<div className="max-w-6xl mx-auto px-4 md:px-6">
					<div className="text-center mb-12 md:mb-16">
						<h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-4 ${theme === 'cyberpunk' ? 'text-pink-400' : theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Why Choose FinMate?</h2>
						<p className={`text-lg md:text-xl max-w-2xl mx-auto ${theme === 'cyberpunk' ? 'text-cyan-300' : theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>Built for modern professionals who value clarity and control</p>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-12 text-white">
						{[
							{
								title: 'Zero Learning Curve',
								desc: 'Intuitive interface that feels familiar from day one',
							},
							{
								title: 'Professional Grade',
								desc: 'Built for modern professionals who demand excellence',
							},
							{
								title: 'Privacy First',
								desc: 'Your financial data stays yours, with complete control',
							},
							{
								title: 'Always Improving',
								desc: 'Regular updates with features you actually want',
							},
						].map((benefit, i) => (
							<div
								key={i}
								className={`p-6 md:p-8 rounded-2xl border shadow-sm text-center md:text-left transition-all duration-300 ${theme === 'cyberpunk' ? 'bg-black border-pink-500 hover:border-cyan-400 hover:shadow-pink-400' : theme === 'dark' ? 'bg-gray-800 border-gray-700 hover:border-teal-400 hover:shadow-lg' : 'bg-white border-gray-200 hover:border-teal-300 hover:shadow-lg'}`}
							>
								<h3 className={`text-xl md:text-2xl font-semibold mb-3 md:mb-4 ${theme === 'cyberpunk' ? 'text-pink-400' : theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{benefit.title}</h3>
								<p className={theme === 'cyberpunk' ? 'text-cyan-300' : theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{benefit.desc}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Testimonials Section */}
			<section className={theme === 'cyberpunk' ? 'relative py-20 md:py-32 bg-black' : theme === 'dark' ? 'relative py-20 md:py-32 bg-gray-900' : 'relative py-20 md:py-32 bg-white'}>
				<div className="max-w-5xl mx-auto px-4 md:px-6">
					<div className="text-center mb-12 md:mb-16">
						<h3 className={`text-3xl md:text-4xl font-bold mb-4 ${theme === 'cyberpunk' ? 'text-pink-400' : 'text-gray-900'}`}>Trusted by Professionals</h3>
						<p className={`text-lg md:text-xl ${theme === 'cyberpunk' ? 'text-cyan-300' : 'text-gray-600'}`}>See what our users have to say</p>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
						{[
							{
								name: 'Rohan M.',
								role: 'Product Manager',
								quote: "FinMate's analytics have revolutionized how I track my investments. The insights are incredibly actionable.",
							},
							{
								name: 'Ananya S.',
								role: 'UX Designer',
								quote: "Finally, a finance app that doesn't compromise on beautiful design. The interface is intuitive and powerful.",
							},
						].map((testimonial, i) => (
							<div
								key={i}
								className={`p-6 md:p-8 rounded-2xl border shadow-sm text-center md:text-left ${theme === 'cyberpunk' ? 'bg-black border-pink-500' : theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
							>
								<p className={`text-lg mb-6 italic leading-relaxed ${theme === 'cyberpunk' ? 'text-cyan-300' : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>"{testimonial.quote}"</p>
								<div className="flex items-center justify-center md:justify-start gap-4">
									<div className={theme === 'cyberpunk' ? 'w-12 h-12 bg-black border-2 border-pink-500 rounded-full flex items-center justify-center text-pink-400 font-bold shrink-0' : theme === 'dark' ? 'w-12 h-12 bg-gray-800 border-2 border-teal-400 rounded-full flex items-center justify-center text-teal-400 font-bold shrink-0' : 'w-12 h-12 bg-teal-100 border-2 border-teal-300 rounded-full flex items-center justify-center text-teal-700 font-bold shrink-0'}>
										{testimonial.name[0]}
									</div>
									<div>
										<div className={`font-semibold ${theme === 'cyberpunk' ? 'text-pink-400' : theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{testimonial.name}</div>
										<div className={`text-sm ${theme === 'cyberpunk' ? 'text-cyan-300' : theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{testimonial.role}</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className={`text-center text-sm py-12 md:py-16 border-t ${theme === 'cyberpunk' ? 'border-pink-500 bg-black text-pink-400' : theme === 'dark' ? 'border-gray-700 bg-gray-900 text-gray-300' : 'border-gray-200 bg-white text-gray-500'}`}>
				<div className="max-w-4xl mx-auto px-4">
					<p>&copy; {new Date().getFullYear()} FinMate. All rights reserved.</p>
					<p className={theme === 'cyberpunk' ? 'mt-2 text-cyan-300' : theme === 'dark' ? 'mt-2 text-gray-400' : 'mt-2 text-gray-600'}>Built for the modern professional.</p>
				</div>
			</footer>
		</div>
	);
}
