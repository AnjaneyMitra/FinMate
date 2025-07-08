import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardPreview, GoalsPreview, BudgetPreview } from './components/FeaturePreviews';
import { PieChart } from 'lucide-react';
import { useTheme } from './contexts/ThemeContext';

export default function LandingPage() {
	const navigate = useNavigate();
	const themeContext = useTheme();
	const { bg, text, border, accent, currentTheme } = themeContext || {};
	
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
		accent: 'text-teal-600',
		inverse: 'text-white'
	};
	const safeBorder = border || {
		primary: 'border-gray-200',
		secondary: 'border-gray-300',
		accent: 'border-teal-300'
	};
	const safeAccent = accent || {
		primary: 'bg-teal-600',
		secondary: 'bg-blue-600',
		success: 'bg-green-600',
		warning: 'bg-yellow-500',
		error: 'bg-red-600'
	};

	return (
		<div className={`min-h-screen ${safeBg.secondary} ${safeText.primary} font-sans antialiased`}>
			{/* Fixed header */}
			<header className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 ${safeBg.primary}/95 backdrop-blur-md border-b ${safeBorder.primary} shadow-sm`}>
				<div className="flex items-center gap-3">
					<div className={`w-8 h-8 ${safeAccent.primary} rounded-lg flex items-center justify-center`}>
						<PieChart className="w-5 h-5 text-white" />
					</div>
					<span className={`font-bold text-xl md:text-2xl tracking-tight ${safeText.primary}`}>
						FinMate
					</span>
				</div>
				<button
					className={`px-6 py-2.5 ${safeAccent.primary} hover:opacity-90 text-white rounded-lg font-semibold transition-all duration-200 hover:scale-105 shadow-md text-sm md:text-base`}
					onClick={() => navigate('/login')}
				>
					Try it out
				</button>
			</header>

			{/* Hero Section */}
			<section className={`relative min-h-screen flex items-center justify-center overflow-hidden ${safeBg.primary}`}>
				{/* Theme-aware gradient background */}
				<div className={`absolute inset-0 ${currentTheme === 'classic' ? 'bg-gradient-to-br from-blue-50 via-white to-teal-50' : 
					currentTheme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700' :
					currentTheme === 'cyberpunk' ? 'bg-gradient-to-br from-black via-gray-900 to-purple-900' :
					currentTheme === 'nature' ? 'bg-gradient-to-br from-green-50 via-emerald-50 to-green-100' :
					currentTheme === 'ocean' ? 'bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100' :
					currentTheme === 'sunset' ? 'bg-gradient-to-br from-orange-50 via-pink-50 to-orange-100' :
					currentTheme === 'midnight' ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700' :
					`${safeBg.secondary}`}`}>
				</div>
				<div className="text-center z-10 max-w-5xl mx-auto px-4 py-20">
					<h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tight leading-tight">
						<span className={`${safeText.primary} block`}>Modern Finance,</span>
						<span className={`${safeText.accent} block`}>Made Simple</span>
					</h1>
					<p className={`text-lg md:text-xl lg:text-2xl ${safeText.secondary} max-w-3xl mx-auto font-light leading-relaxed mb-8`}>
						Experience intelligent budgeting with AI-powered insights and a
						beautiful, minimal workspace designed for clarity and focus.
					</p>
					<div className="mt-12">
						<button
							className={`px-8 py-4 ${safeAccent.primary} hover:opacity-90 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg text-lg`}
							onClick={() => navigate('/login')}
						>
							Get Started Free
						</button>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className={`relative py-20 md:py-32 ${safeBg.primary}`}>
				<div className="max-w-7xl mx-auto px-4 md:px-6">
					<div className="text-center mb-16 md:mb-20">
						<h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold ${safeText.primary} mb-4`}>
							Core Features
						</h2>
						<p className={`text-lg md:text-xl ${safeText.secondary} max-w-2xl mx-auto`}>
							Everything you need to take control of your finances
						</p>
					</div>

					<div className="space-y-20 md:space-y-32">
						{/* Real-Time Dashboard Feature */}
						<div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
							<div className="flex-1 text-center lg:text-left">
								<h3 className={`text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6 ${safeText.accent}`}>
									Real-Time Dashboard
								</h3>
								<p className={`text-base md:text-lg lg:text-xl ${safeText.secondary} leading-relaxed max-w-xl mx-auto lg:mx-0`}>
									Live updates and interactive visualizations give you instant clarity on your financial health and spending patterns with smart insights.
								</p>
								<div className="mt-6 flex flex-wrap gap-3 justify-center lg:justify-start">
									<span className={`px-3 py-1 ${safeAccent.primary} bg-opacity-10 ${safeText.accent} rounded-full text-sm font-medium`}>
										Live Analytics
									</span>
									<span className={`px-3 py-1 ${safeAccent.primary} bg-opacity-10 ${safeText.accent} rounded-full text-sm font-medium`}>
										Category Insights
									</span>
									<span className={`px-3 py-1 ${safeAccent.primary} bg-opacity-10 ${safeText.accent} rounded-full text-sm font-medium`}>
										Trend Analysis
									</span>
								</div>
							</div>
							<div className="flex-1 w-full max-w-md lg:max-w-none">
								<div className="h-[28rem] md:h-[32rem] lg:h-[36rem]">
									<DashboardPreview />
								</div>
							</div>
						</div>

						{/* Goal Tracking Feature */}
						<div className="flex flex-col lg:flex-row-reverse items-center gap-8 lg:gap-16">
							<div className="flex-1 text-center lg:text-left">
								<h3 className={`text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6 ${safeText.primary}`}>
									Smart Goal Tracking
								</h3>
								<p className={`text-base md:text-lg lg:text-xl ${safeText.secondary} leading-relaxed max-w-xl mx-auto lg:mx-0`}>
									Visual progress tracking with gamified milestones to keep you motivated and on track to achieve your financial dreams.
								</p>
								<div className="mt-6 flex flex-wrap gap-3 justify-center lg:justify-start">
									<span className={`px-3 py-1 ${safeBg.tertiary} ${safeText.secondary} rounded-full text-sm font-medium`}>
										Progress Tracking
									</span>
									<span className={`px-3 py-1 ${safeBg.tertiary} ${safeText.secondary} rounded-full text-sm font-medium`}>
										Achievement Levels
									</span>
									<span className={`px-3 py-1 ${safeBg.tertiary} ${safeText.secondary} rounded-full text-sm font-medium`}>
										Smart Insights
									</span>
								</div>
							</div>
							<div className="flex-1 w-full max-w-md lg:max-w-none">
								<div className="h-[24rem] md:h-[28rem] lg:h-[32rem]">
									<GoalsPreview />
								</div>
							</div>
						</div>

						{/* Budget Analytics Feature */}
						<div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
							<div className="flex-1 text-center lg:text-left">
								<h3 className={`text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6 ${safeText.accent}`}>
									AI-Powered Budget Insights
								</h3>
								<p className={`text-base md:text-lg lg:text-xl ${safeText.secondary} leading-relaxed max-w-xl mx-auto lg:mx-0`}>
									Machine learning algorithms analyze your spending patterns and provide actionable insights for better financial decisions and budget optimization.
								</p>
								<div className="mt-6 flex flex-wrap gap-3 justify-center lg:justify-start">
									<span className={`px-3 py-1 ${safeAccent.primary} bg-opacity-10 ${safeText.accent} rounded-full text-sm font-medium`}>
										Smart Recommendations
									</span>
									<span className={`px-3 py-1 ${safeAccent.primary} bg-opacity-10 ${safeText.accent} rounded-full text-sm font-medium`}>
										Budget vs Actual
									</span>
									<span className={`px-3 py-1 ${safeAccent.primary} bg-opacity-10 ${safeText.accent} rounded-full text-sm font-medium`}>
										Overspend Alerts
									</span>
								</div>
							</div>
							<div className="flex-1 w-full max-w-md lg:max-w-none">
								<div className="h-[26rem] md:h-[32rem] lg:h-[36rem] max-h-screen">
									<BudgetPreview />
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Why Choose Section */}
			<section className={`relative py-20 md:py-32 ${safeBg.secondary}`}>
				<div className="max-w-6xl mx-auto px-4 md:px-6">
					<div className="text-center mb-12 md:mb-16">
						<h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-4 ${safeText.primary}`}>
							Why Choose FinMate?
						</h2>
						<p className={`text-lg md:text-xl ${safeText.secondary} max-w-2xl mx-auto`}>
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
								className={`p-6 md:p-8 ${safeBg.card} rounded-2xl border ${safeBorder.primary} hover:border-${safeBorder.accent.replace('border-', '')} hover:shadow-lg transition-all duration-300 shadow-sm text-center md:text-left`}
							>
								<h3 className={`text-xl md:text-2xl font-semibold ${safeText.primary} mb-3 md:mb-4`}>
									{benefit.title}
								</h3>
								<p className={`${safeText.secondary} leading-relaxed`}>
									{benefit.desc}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Testimonials Section */}
			<section className={`relative py-20 md:py-32 ${safeBg.primary}`}>
				<div className="max-w-5xl mx-auto px-4 md:px-6">
					<div className="text-center mb-12 md:mb-16">
						<h3 className={`text-3xl md:text-4xl font-bold ${safeText.primary} mb-4`}>
							Trusted by Professionals
						</h3>
						<p className={`text-lg md:text-xl ${safeText.secondary}`}>
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
								className={`p-6 md:p-8 ${safeBg.secondary} rounded-2xl border ${safeBorder.primary} shadow-sm text-center md:text-left`}
							>
								<p className={`text-lg ${safeText.primary} mb-6 italic leading-relaxed`}>
									"{testimonial.quote}"
								</p>
								<div className="flex items-center justify-center md:justify-start gap-4">
									<div className={`w-12 h-12 ${safeAccent.primary} bg-opacity-10 border-2 ${safeBorder.accent} rounded-full flex items-center justify-center ${safeText.accent} font-bold shrink-0`}>
										{testimonial.name[0]}
									</div>
									<div>
										<div className={`font-semibold ${safeText.primary}`}>
											{testimonial.name}
										</div>
										<div className={`${safeText.secondary} text-sm`}>
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
			<footer className={`text-center ${safeText.secondary} text-sm py-12 md:py-16 border-t ${safeBorder.primary} ${safeBg.primary}`}>
				<div className="max-w-4xl mx-auto px-4">
					<p>&copy; {new Date().getFullYear()} FinMate. All rights reserved.</p>
					<p className={`mt-2 ${safeText.tertiary}`}>Built for the modern professional.</p>
				</div>
			</footer>
		</div>
	);
}
