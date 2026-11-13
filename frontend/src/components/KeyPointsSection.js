import React, { useState } from 'react';
import { downloadText, postForm } from '../api';

export default function KeyPointsSection({ originalText, keyPoints, setKeyPoints, language }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function extractPoints() {
    setLoading(true);
    setError('');
    try {
      const result = await postForm('keypoints', { text: originalText, language });
      setKeyPoints(result.keypoints);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <button type="button" className="rounded bg-blue-700 px-4 py-2 text-white disabled:opacity-50" onClick={extractPoints} disabled={!originalText || loading}>{loading ? 'Extracting...' : 'Extract key points'}</button>
        <button type="button" className="rounded border border-gray-300 bg-white px-4 py-2 disabled:opacity-50" onClick={() => downloadText(keyPoints.join('\n'), 'key-points').catch((downloadError) => setError(downloadError.message))} disabled={!keyPoints.length}>Download key points</button>
      </div>
      {error && <p className="mb-3 text-sm text-red-700" role="alert">{error}</p>}
      <h2 className="mb-2 font-bold">Key Points</h2>
      {keyPoints.length ? <ul className="list-disc space-y-2 rounded border bg-white p-4 pl-9">{keyPoints.map((point, index) => <li key={`${index}-${point}`}>{point}</li>)}</ul> : <p className="rounded border bg-white p-4 text-gray-500">Key points will appear here.</p>}
    </div>
  );
}
