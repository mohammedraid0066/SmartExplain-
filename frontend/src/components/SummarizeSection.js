import React, { useState } from 'react';
import { downloadText, postForm } from '../api';

export default function SummarizeSection({ originalText, summary, setSummary, language }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function summarize() {
    setLoading(true);
    setError('');
    try {
      const result = await postForm('summarize', { text: originalText, language });
      setSummary(result.summary);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <button type="button" className="rounded bg-blue-700 px-4 py-2 text-white disabled:opacity-50" onClick={summarize} disabled={!originalText || loading}>{loading ? 'Summarizing...' : 'Generate summary'}</button>
        <button type="button" className="rounded border border-gray-300 bg-white px-4 py-2 disabled:opacity-50" onClick={() => downloadText(summary, 'summary').catch((downloadError) => setError(downloadError.message))} disabled={!summary}>Download summary</button>
      </div>
      {error && <p className="mb-3 text-sm text-red-700" role="alert">{error}</p>}
      <h2 className="mb-2 font-bold">Summary</h2>
      <textarea aria-label="Summary" className="h-40 w-full rounded border bg-white p-3" value={summary} readOnly placeholder="The summary will appear here." />
    </div>
  );
}
