import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardPreview, GoalsPreview, BudgetPreview } from './components/FeaturePreviews';
import { Sun, Moon } from 'lucide-react';

export default function LandingPage() {
	const navigate = useNavigate();

	// Dark mode state
	const [darkMode, setDarkMode] = useState(() => {
		if (typeof window !== 'undefined') {
			return document.documentElement.classList.contains('dark');
		}
		return false;
	});

	const toggleDarkMode = () => {
		setDarkMode((prev) => {
			const newMode = !prev;
			if (newMode) {
				document.documentElement.classList.add('dark');
				localStorage.setItem('finmate-dark-mode', 'true');
			} else {
				document.documentElement.classList.remove('dark');
				localStorage.setItem('finmate-dark-mode', 'false');
			}
			return newMode;
		});
	};

	useEffect(() => {
		if (typeof window !== 'undefined') {
			const stored = localStorage.getItem('finmate-dark-mode');
			setDarkMode(stored === 'true');
		}
	}, []);

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 font-sans antialiased">
			{/* Fixed header */}
			<header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm">
				<div className="flex items-center gap-3">
					<span className="text-2xl">🧩</span>
					<span className="font-bold text-xl md:text-2xl tracking-tight text-gray-900 dark:text-white">
						FinMate
					</span>
				</div>
				<div className="flex items-center gap-3">
					<button
						className="rounded-full p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-colors"
						onClick={toggleDarkMode}
						aria-label="Toggle dark mode"
					>
						{darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-700 dark:text-gray-200" />}
					</button>
					<button
						className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold transition-all duration-200 hover:scale-105 shadow-md text-sm md:text-base"
						onClick={() => navigate('/login')}
					>
						Try it out
					</button>
				</div>
			</header>

			{/* Hero Section */}
			<section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 via-white to-teal-50 dark:from-black dark:via-gray-900 dark:to-teal-950">
				<div className="text-center z-10 max-w-5xl mx-auto px-4 py-20">
					<h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tight leading-tight">
						<span className="text-gray-900 dark:text-white block">Modern Finance,</span>
						<span className="text-teal-600 dark:text-teal-400 block">Made Simple</span>
					</h1>
					<p className="text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-light leading-relaxed mb-8">
						Experience intelligent budgeting with AI-powered insights and a
						beautiful, minimal workspace designed for clarity and focus.
					</p>
					<div className="mt-12">
						<button
							className="px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg text-lg"
							onClick={() => navigate('/login')}
						>
							Get Started Free
						</button>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="relative py-20 md:py-32 bg-white dark:bg-gray-900">
				<div className="max-w-7xl mx-auto px-4 md:px-6">
					<div className="text-center mb-16 md:mb-20">
						<h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
							Core Features
						</h2>
						<p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
							Everything you need to take control of your finances
						</p>
					</div>
					<div className="space-y-20 md:space-y-32">
						{/* Real-Time Dashboard Feature */}
						<div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
							<div className="flex-1 text-center lg:text-left">
								<h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6 text-teal-600 dark:text-teal-400">
									Real-Time Dashboard
								</h3>
								<p className="text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
									Live updates and interactive visualizations give you instant clarity on your financial health and spending patterns with smart insights.
								</p>
								<div className="mt-6 flex flex-wrap gap-3 justify-center lg:justify-start">
									<span className="px-3 py-1 bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 rounded-full text-sm font-medium">
										Live Analytics
									</span>
									<span className="px-3 py-1 bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 rounded-full text-sm font-medium">
										Category Insights
									</span>
									<span className="px-3 py-1 bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 rounded-full text-sm font-medium">
										Trend Analysis
									</span>
								</div>
							</div>
							<div className="flex-1 w-full max-w-md lg:max-w-none">
								<div className="h-80 md:h-96">
									<DashboardPreview />
								</div>
							</div>
						</div>
						{/* Goal Tracking Feature */}
						<div className="flex flex-col lg:flex-row-reverse items-center gap-8 lg:gap-16">
							<div className="flex-1 text-center lg:text-left">
								<h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6 text-gray-700 dark:text-gray-200">
									Smart Goal Tracking
								</h3>
								<p className="text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
									Visual progress tracking with gamified milestones to keep you motivated and on track to achieve your financial dreams.
								</p>
								<div className="mt-6 flex flex-wrap gap-3 justify-center lg:justify-start">
									<span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-full text-sm font-medium">
										Progress Tracking
									</span>
									<span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-full text-sm font-medium">
										Achievement Levels
									</span>
									<span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-full text-sm font-medium">
										Smart Insights
									</span>
								</div>
							</div>
							<div className="flex-1 w-full max-w-md lg:max-w-none">
								<div className="h-80 md:h-96">
									<GoalsPreview />
								</div>
							</div>
						</div>
						{/* Budget Analytics Feature */}
						<div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
							<div className="flex-1 text-center lg:text-left">
								<h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6 text-teal-600 dark:text-teal-400">
									AI-Powered Budget Insights
								</h3>
								<p className="text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
									Machine learning algorithms analyze your spending patterns and provide actionable insights for better financial decisions and budget optimization.
								</p>
								<div className="mt-6 flex flex-wrap gap-3 justify-center lg:justify-start">
									<span className="px-3 py-1 bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 rounded-full text-sm font-medium">
										Smart Recommendations
									</span>
									<span className="px-3 py-1 bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 rounded-full text-sm font-medium">
										Budget vs Actual
									</span>
									<span className="px-3 py-1 bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 rounded-full text-sm font-medium">
										Overspend Alerts
									</span>
								</div>
							</div>
							<div className="flex-1 w-full max-w-md lg:max-w-none">
								<div className="h-80 md:h-96">
									<BudgetPreview />
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Why Choose Section */}
			<section className="relative py-20 md:py-32 bg-gray-50 dark:bg-black">
				<div className="max-w-6xl mx-auto px-4 md:px-6">
					<div className="text-center mb-12 md:mb-16">
						<h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
							Why Choose FinMate?
						</h2>
						<p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
							Built for modern professionals who value clarity and control
						</p>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
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
								className="p-6 md:p-8 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-400 hover:shadow-lg transition-all duration-300 shadow-sm text-center md:text-left"
							>
								<h3 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white mb-3 md:mb-4">
									{benefit.title}
								</h3>
								<p className="text-gray-600 dark:text-gray-300 leading-relaxed">
									{benefit.desc}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Testimonials Section */}
			<section className="relative py-20 md:py-32 bg-white dark:bg-gray-900">
				<div className="max-w-5xl mx-auto px-4 md:px-6">
					<div className="text-center mb-12 md:mb-16">
						<h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
							Trusted by Professionals
						</h3>
						<p className="text-lg md:text-xl text-gray-600 dark:text-gray-300">
							See what our users have to say
						</p>
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
								className="p-6 md:p-8 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm text-center md:text-left"
							>
								<p className="text-lg text-gray-700 dark:text-gray-200 mb-6 italic leading-relaxed">
									"{testimonial.quote}"
								</p>
								<div className="flex items-center justify-center md:justify-start gap-4">
									<div className="w-12 h-12 bg-teal-100 dark:bg-teal-900 border-2 border-teal-300 dark:border-teal-700 rounded-full flex items-center justify-center text-teal-700 dark:text-teal-300 font-bold shrink-0">
										{testimonial.name[0]}
									</div>
									<div>
										<div className="font-semibold text-gray-900 dark:text-white">
											{testimonial.name}
										</div>
										<div className="text-gray-600 dark:text-gray-300 text-sm">
											{testimonial.role}
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="text-center text-gray-500 dark:text-gray-400 text-sm py-12 md:py-16 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
				<div className="max-w-4xl mx-auto px-4">
					<p>&copy; {new Date().getFullYear()} FinMate. All rights reserved.</p>
					<p className="mt-2 text-gray-600 dark:text-gray-400">Built for the modern professional.</p>
				</div>
			</footer>
		</div>
	);
}
