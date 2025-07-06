import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardPreview, GoalsPreview, BudgetPreview } from './components/FeaturePreviews';
import { PieChart } from 'lucide-react';

export default function LandingPage() {
	const navigate = useNavigate();

	return (
		<div className="min-h-screen bg-gray-50 text-gray-900 font-sans antialiased">
			{/* Fixed header */}
			<header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
				<div className="flex items-center gap-3">
					<div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
						<PieChart className="w-5 h-5 text-white" />
					</div>
					<span className="font-bold text-xl md:text-2xl tracking-tight text-gray-900">
						FinMate
					</span>
				</div>
				<button
					className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold transition-all duration-200 hover:scale-105 shadow-md text-sm md:text-base"
					onClick={() => navigate('/login')}
				>
					Try it out
				</button>
			</header>

			{/* Hero Section */}
			<section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 via-white to-teal-50">
				<div className="text-center z-10 max-w-5xl mx-auto px-4 py-20">
					<h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tight leading-tight">
						<span className="text-gray-900 block">Modern Finance,</span>
						<span className="text-teal-600 block">Made Simple</span>
					</h1>
					<p className="text-lg md:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed mb-8">
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
			<section className="relative py-20 md:py-32 bg-white">
				<div className="max-w-7xl mx-auto px-4 md:px-6">
					<div className="text-center mb-16 md:mb-20">
						<h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
							Core Features
						</h2>
						<p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
							Everything you need to take control of your finances
						</p>
					</div>

					<div className="space-y-20 md:space-y-32">
						{/* Real-Time Dashboard Feature */}
						<div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
							<div className="flex-1 text-center lg:text-left">
								<h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6 text-teal-600">
									Real-Time Dashboard
								</h3>
								<p className="text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
									Live updates and interactive visualizations give you instant clarity on your financial health and spending patterns with smart insights.
								</p>
								<div className="mt-6 flex flex-wrap gap-3 justify-center lg:justify-start">
									<span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">
										Live Analytics
									</span>
									<span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">
										Category Insights
									</span>
									<span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">
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
								<h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6 text-gray-700">
									Smart Goal Tracking
								</h3>
								<p className="text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
									Visual progress tracking with gamified milestones to keep you motivated and on track to achieve your financial dreams.
								</p>
								<div className="mt-6 flex flex-wrap gap-3 justify-center lg:justify-start">
									<span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
										Progress Tracking
									</span>
									<span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
										Achievement Levels
									</span>
									<span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
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
								<h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6 text-teal-600">
									AI-Powered Budget Insights
								</h3>
								<p className="text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
									Machine learning algorithms analyze your spending patterns and provide actionable insights for better financial decisions and budget optimization.
								</p>
								<div className="mt-6 flex flex-wrap gap-3 justify-center lg:justify-start">
									<span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">
										Smart Recommendations
									</span>
									<span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">
										Budget vs Actual
									</span>
									<span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">
										Overspend Alerts
									</span>
								</div>
							</div>
							<div className="flex-1 w-full max-w-md lg:max-w-none">
								<div className="h-[22rem] md:h-[26rem] lg:h-[30rem]">
									<BudgetPreview />
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Why Choose Section */}
			<section className="relative py-20 md:py-32 bg-gray-50">
				<div className="max-w-6xl mx-auto px-4 md:px-6">
					<div className="text-center mb-12 md:mb-16">
						<h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-gray-900">
							Why Choose FinMate?
						</h2>
						<p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
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
								className="p-6 md:p-8 bg-white rounded-2xl border border-gray-200 hover:border-teal-300 hover:shadow-lg transition-all duration-300 shadow-sm text-center md:text-left"
							>
								<h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3 md:mb-4">
									{benefit.title}
								</h3>
								<p className="text-gray-600 leading-relaxed">
									{benefit.desc}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Testimonials Section */}
			<section className="relative py-20 md:py-32 bg-white">
				<div className="max-w-5xl mx-auto px-4 md:px-6">
					<div className="text-center mb-12 md:mb-16">
						<h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
							Trusted by Professionals
						</h3>
						<p className="text-lg md:text-xl text-gray-600">
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
								className="p-6 md:p-8 bg-gray-50 rounded-2xl border border-gray-200 shadow-sm text-center md:text-left"
							>
								<p className="text-lg text-gray-700 mb-6 italic leading-relaxed">
									"{testimonial.quote}"
								</p>
								<div className="flex items-center justify-center md:justify-start gap-4">
									<div className="w-12 h-12 bg-teal-100 border-2 border-teal-300 rounded-full flex items-center justify-center text-teal-700 font-bold shrink-0">
										{testimonial.name[0]}
									</div>
									<div>
										<div className="font-semibold text-gray-900">
											{testimonial.name}
										</div>
										<div className="text-gray-600 text-sm">
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
			<footer className="text-center text-gray-500 text-sm py-12 md:py-16 border-t border-gray-200 bg-white">
				<div className="max-w-4xl mx-auto px-4">
					<p>&copy; {new Date().getFullYear()} FinMate. All rights reserved.</p>
					<p className="mt-2 text-gray-600">Built for the modern professional.</p>
				</div>
			</footer>
		</div>
	);
}
