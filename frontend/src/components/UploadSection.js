import React, { useState } from 'react';
import { uploadDocument } from '../api';

export default function UploadSection({ setOriginalText, setDocumentName }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleFileChange(event) {
    const file = event.target.files[0];
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const result = await uploadDocument(file);
      setOriginalText(result.text);
      setDocumentName(result.filename);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
      event.target.value = '';
    }
  }

  return (
    <div className="mb-6">
      <label className="block mb-2 font-semibold">Upload Document (PDF, DOCX, TXT):</label>
      <input type="file" accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" onChange={handleFileChange} disabled={loading} className="border p-2 rounded w-full bg-white" />
      {loading && <p className="mt-2 text-sm text-blue-700" role="status">Reading document...</p>}
      {error && <p className="mt-2 text-sm text-red-700" role="alert">{error}</p>}
    </div>
  );
}
