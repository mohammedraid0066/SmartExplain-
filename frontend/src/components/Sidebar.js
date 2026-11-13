import React from 'react';

const tabs = [
  { id: 'simplify', label: 'Simplify' },
  { id: 'summarize', label: 'Summarize' },
  { id: 'keypoints', label: 'Key Points' },
  { id: 'qa', label: 'Ask Questions' },
];

export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <aside className="w-48 bg-white border-r shadow-sm flex flex-col">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`p-4 text-left hover:bg-blue-100 ${activeTab === tab.id ? 'bg-blue-50 font-semibold' : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </aside>
  );
}
