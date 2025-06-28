// This file previously demonstrated the theme system. It has been rewritten to use only standard React and Tailwind CSS.
import React from 'react';

export default function ThemeShowcase() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">UI Showcase</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Example UI elements using only Tailwind CSS and standard React components.
          </p>
        </div>

        {/* Alerts Section */}
        <div className="bg-white rounded-2xl p-6 shadow border border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Alert Components</h2>
          <div className="grid gap-4">
            <div className="bg-green-100 text-green-800 rounded-lg p-4">✅ Transaction saved successfully! Your expense has been categorized and added to your budget.</div>
            <div className="bg-yellow-100 text-yellow-800 rounded-lg p-4">⚠️ You're approaching your monthly budget limit. Consider reviewing your expenses.</div>
            <div className="bg-red-100 text-red-800 rounded-lg p-4">❌ Failed to process transaction. Please check your internet connection and try again.</div>
            <div className="bg-blue-100 text-blue-800 rounded-lg p-4">💡 Pro tip: Use detailed descriptions to improve automatic categorization accuracy.</div>
          </div>
        </div>

        {/* Form Elements */}
        <div className="bg-white rounded-2xl p-6 shadow border border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Form Elements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Standard Input</label>
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Enter transaction amount" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Success State</label>
              <input className="w-full border border-green-400 rounded-lg px-3 py-2 bg-green-50" placeholder="Valid input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Error State</label>
              <input className="w-full border border-red-400 rounded-lg px-3 py-2 bg-red-50" placeholder="Invalid input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Dropdown</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option>Select category</option>
                <option>Food & Dining</option>
                <option>Transportation</option>
                <option>Entertainment</option>
              </select>
            </div>
          </div>
        </div>

        {/* Button Variants */}
        <div className="bg-white rounded-2xl p-6 shadow border border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Button Variants</h2>
          <div className="flex flex-wrap gap-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700">Primary Action</button>
            <button className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-300">Secondary</button>
            <button className="border border-gray-400 text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100">Outline</button>
            <button className="bg-transparent text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100">Ghost</button>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700">Delete</button>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700">Success</button>
            <button className="bg-gray-300 text-gray-500 px-4 py-2 rounded-lg font-medium cursor-not-allowed" disabled>Disabled</button>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="bg-white rounded-2xl p-6 shadow border border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Status Indicators</h2>
          <div className="flex gap-4 flex-wrap">
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">Completed</span>
            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">Pending Review</span>
            <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full">Failed</span>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">In Progress</span>
            <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full">Draft</span>
          </div>
        </div>

        {/* Card Variants */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-2">Base Card</h3>
            <p className="text-sm text-gray-600">Simple card with basic styling</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 shadow border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Elevated Card</h3>
            <p className="text-sm text-gray-600">Enhanced shadow for emphasis</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 shadow border border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-2">Interactive Card</h3>
            <p className="text-sm text-gray-600">Hover effects for clickable content</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 shadow border border-purple-200">
            <h3 className="font-semibold text-gray-900 mb-2">Highlighted Card</h3>
            <p className="text-sm text-gray-600">Accent border for important content</p>
          </div>
        </div>
      </div>
    </div>
  );
}
