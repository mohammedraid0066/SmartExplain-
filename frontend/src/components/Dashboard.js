import React, { useState } from 'react';
import Sidebar from './Sidebar';
import UploadSection from './UploadSection';
import SimplifySection from './SimplifySection';
import SummarizeSection from './SummarizeSection';
import KeyPointsSection from './KeyPointsSection';
import QASection from './QASection';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('simplify');
  const [originalText, setOriginalText] = useState('');
  const [simplifiedText, setSimplifiedText] = useState('');
  const [summary, setSummary] = useState('');
  const [keyPoints, setKeyPoints] = useState([]);
  const [qaHistory, setQaHistory] = useState([]);
  const [documentName, setDocumentName] = useState('');
  const [language, setLanguage] = useState('en');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-blue-700 text-white p-4 shadow flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">SmartExplain – Document Simplifier</h1>
        <label className="flex items-center gap-2 text-sm font-medium">
          Output language
          <select className="rounded border border-white/40 bg-white px-3 py-2 text-gray-900" value={language} onChange={(event) => setLanguage(event.target.value)}>
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="it">Italian</option>
            <option value="pt">Portuguese</option>
          </select>
        </label>
      </header>
      <div className="flex flex-1">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 p-6">
          <UploadSection setOriginalText={setOriginalText} setDocumentName={setDocumentName} />
          {documentName && <p className="mb-4 text-sm text-gray-600" aria-live="polite">Loaded: {documentName}</p>}
          {activeTab === 'simplify' && (
            <SimplifySection originalText={originalText} simplifiedText={simplifiedText} setSimplifiedText={setSimplifiedText} language={language} />
          )}
          {activeTab === 'summarize' && (
            <SummarizeSection originalText={originalText} summary={summary} setSummary={setSummary} language={language} />
          )}
          {activeTab === 'keypoints' && (
            <KeyPointsSection originalText={originalText} keyPoints={keyPoints} setKeyPoints={setKeyPoints} language={language} />
          )}
          {activeTab === 'qa' && (
            <QASection originalText={originalText} qaHistory={qaHistory} setQaHistory={setQaHistory} language={language} />
          )}
        </main>
      </div>
    </div>
  );
}
