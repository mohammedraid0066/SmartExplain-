import React, { useState } from 'react';
import { postForm } from '../api';

export default function QASection({ originalText, qaHistory, setQaHistory, language }) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function askQuestion(event) {
    event.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setError('');
    try {
      const result = await postForm('qa', { text: originalText, question: question.trim(), language });
      setQaHistory((history) => [...history, { question: question.trim(), answer: result.answer }]);
      setQuestion('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="mb-3 font-bold">Ask Questions</h2>
      <form className="mb-4 flex flex-col gap-2 sm:flex-row" onSubmit={askQuestion}>
        <input aria-label="Question about the document" className="min-w-0 flex-1 rounded border bg-white p-3" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask a question about this document" disabled={!originalText || loading} />
        <button type="submit" className="rounded bg-blue-700 px-4 py-2 text-white disabled:opacity-50" disabled={!originalText || !question.trim() || loading}>{loading ? 'Finding answer...' : 'Ask'}</button>
      </form>
      {error && <p className="mb-3 text-sm text-red-700" role="alert">{error}</p>}
      <div className="space-y-3" aria-live="polite">
        {qaHistory.map((item, index) => <article key={`${index}-${item.question}`} className="rounded border bg-white p-4"><h3 className="font-semibold">{item.question}</h3><p className="mt-2 text-gray-700">{item.answer}</p></article>)}
        {!qaHistory.length && <p className="rounded border bg-white p-4 text-gray-500">Answers based on the uploaded document will appear here.</p>}
      </div>
    </div>
  );
}
