import React, { useState } from 'react';
import { downloadText, postForm } from '../api';

export default function SimplifySection({ originalText, simplifiedText, setSimplifiedText, language }) {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState('');
  const [error, setError] = useState('');

  async function runAction(action) {
    setLoading(action);
    setError('');
    try {
      const result = await postForm(action === 'terms' ? 'explain_terms' : 'simplify', { text: originalText, language });
      if (action === 'terms') setTerms(result.terms);
      else setSimplifiedText(result.simplified);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading('');
    }
  }

  async function saveResult() {
    try {
      await downloadText(simplifiedText, 'simplified');
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <button type="button" className="rounded bg-blue-700 px-4 py-2 text-white disabled:opacity-50" onClick={() => runAction('simplify')} disabled={!originalText || Boolean(loading)}>{loading === 'simplify' ? 'Simplifying...' : 'Simplify text'}</button>
        <button type="button" className="rounded border border-gray-300 bg-white px-4 py-2 disabled:opacity-50" onClick={() => runAction('terms')} disabled={!originalText || Boolean(loading)}>{loading === 'terms' ? 'Finding terms...' : 'Explain terms'}</button>
        <button type="button" className="rounded border border-gray-300 bg-white px-4 py-2 disabled:opacity-50" onClick={saveResult} disabled={!simplifiedText}>Download simplified text</button>
      </div>
      {error && <p className="mb-3 text-sm text-red-700" role="alert">{error}</p>}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <h2 className="mb-2 font-bold">Original Text</h2>
          <textarea aria-label="Original text" className="h-48 w-full rounded border bg-white p-3" value={originalText} readOnly placeholder="Upload a document to begin." />
        </div>
        <div>
          <h2 className="mb-2 font-bold">Simplified Text</h2>
          <textarea aria-label="Simplified text" className="h-48 w-full rounded border bg-white p-3" value={simplifiedText} readOnly placeholder="Your simplified text will appear here." />
        </div>
      </div>
      {terms.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 font-bold">Terms explained</h2>
          <dl className="divide-y rounded border bg-white px-4">
            {terms.map(({ term, explanation }) => <div key={term} className="py-3"><dt className="font-semibold">{term}</dt><dd className="text-gray-700">{explanation}</dd></div>)}
          </dl>
        </section>
      )}
    </div>
  );
}
