import React, { useState } from "react";

export default function BudgetForm() {
  const [form, setForm] = useState({
    income: "",
    goals: "",
    location: "",
  });
  const [suggestedBudget, setSuggestedBudget] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuggestedBudget(null);
    
    // Simulate API call with mock data
    try {
      // Replace with your actual API endpoint
      // const res = await fetch("/api/budget-suggestion", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(form),
      // });
      // const data = await res.json();
      
      // Mock data for demonstration
      setTimeout(() => {
        const income = parseInt(form.income);
        const mockBudget = {
          essentials: Math.round(income * 0.5),
          savings: Math.round(income * 0.2),
          discretionary: Math.round(income * 0.3),
          emergency: Math.round(income * 0.1),
        };
        setSuggestedBudget(mockBudget);
        setLoading(false);
      }, 1500);
    } catch (err) {
      setSuggestedBudget({ error: "Failed to fetch budget suggestion." });
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Budget Planner</h2>
        <p className="text-gray-600">Create a personalized budget based on your income and goals</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Budget Form */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-teal-700 mb-4">Your Information</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2 font-medium text-gray-700">Monthly Income (INR)</label>
              <input
                type="number"
                name="income"
                value={form.income}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                placeholder="Enter your monthly income"
                required
              />
            </div>
            
            <div>
              <label className="block mb-2 font-medium text-gray-700">Financial Goals</label>
              <input
                type="text"
                name="goals"
                value={form.goals}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                placeholder="e.g. Save for house, travel, emergency fund"
                required
              />
            </div>
            
            <div>
              <label className="block mb-2 font-medium text-gray-700">Location</label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                placeholder="e.g. Mumbai, Delhi, Bangalore"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Generating Budget..." : "Get Suggested Budget"}
            </button>
          </form>
        </div>

        {/* Budget Results */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-teal-700 mb-4">Budget Suggestion</h3>
          
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
              <span className="ml-2 text-gray-600">Calculating your budget...</span>
            </div>
          )}
          
          {!loading && !suggestedBudget && (
            <div className="text-center py-8 text-gray-500">
              <span className="text-4xl mb-4 block">💰</span>
              <p>Fill out the form to get your personalized budget suggestion</p>
            </div>
          )}
          
          {suggestedBudget && suggestedBudget.error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-red-600">{suggestedBudget.error}</div>
            </div>
          )}
          
          {suggestedBudget && !suggestedBudget.error && (
            <div className="space-y-6">
              {/* Budget Breakdown */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-blue-600 font-medium">Essentials</p>
                  <p className="text-2xl font-bold text-blue-700">₹{suggestedBudget.essentials?.toLocaleString("en-IN")}</p>
                  <p className="text-xs text-blue-600">50% of income</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-green-600 font-medium">Savings</p>
                  <p className="text-2xl font-bold text-green-700">₹{suggestedBudget.savings?.toLocaleString("en-IN")}</p>
                  <p className="text-xs text-green-600">20% of income</p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-purple-600 font-medium">Discretionary</p>
                  <p className="text-2xl font-bold text-purple-700">₹{suggestedBudget.discretionary?.toLocaleString("en-IN")}</p>
                  <p className="text-xs text-purple-600">30% of income</p>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-orange-600 font-medium">Emergency</p>
                  <p className="text-2xl font-bold text-orange-700">₹{suggestedBudget.emergency?.toLocaleString("en-IN")}</p>
                  <p className="text-xs text-orange-600">10% of income</p>
                </div>
              </div>
              
              {/* Detailed Table */}
              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount (₹)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Percentage
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Essentials</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{suggestedBudget.essentials?.toLocaleString("en-IN")}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">50%</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Savings</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{suggestedBudget.savings?.toLocaleString("en-IN")}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">20%</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Discretionary</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{suggestedBudget.discretionary?.toLocaleString("en-IN")}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">30%</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Emergency Fund</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{suggestedBudget.emergency?.toLocaleString("en-IN")}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">10%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
