import React from 'react';

export function TestPreview() {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 h-full">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">📊</span>
        <h3 className="text-xl font-bold text-gray-900">Test Preview</h3>
      </div>
      <p>This is a test component to verify imports work.</p>
    </div>
  );
}
