const API_BASE = (process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

export async function postForm(path, values) {
  const form = new FormData();
  Object.entries(values).forEach(([key, value]) => form.append(key, value));
  const response = await fetch(`${API_BASE}/${path}`, { method: 'POST', body: form });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Request failed (${response.status})`);
  }
  return response.json();
}

export async function uploadDocument(file) {
  const form = new FormData();
  form.append('file', file);
  const response = await fetch(`${API_BASE}/upload`, { method: 'POST', body: form });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Upload failed (${response.status})`);
  }
  return response.json();
}

export async function downloadText(text, type) {
  const form = new FormData();
  form.append('text', text);
  form.append('type', type);
  const response = await fetch(`${API_BASE}/download`, { method: 'POST', body: form });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Download failed (${response.status})`);
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${type || 'document'}.txt`;
  document.body.appendChild(link);
  link.click();
  window.setTimeout(() => {
    link.remove();
    URL.revokeObjectURL(url);
  }, 1000);
}