import React, { useState } from 'react';

const Practice = () => {
  const [form, setForm] = useState({
    sourceLanguage: '',
    targetLanguage: '',
    level: '',
    sentenceCount: 5,
    topic: ''
  });
  const [loading, setLoading] = useState(false);
  const [exerciseText, setExerciseText] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setExerciseText('');
    try {
      const response = await fetch('https://language-learning-backend-production-3ce3.up.railway.app/api/practice/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!response.ok) throw new Error('Błąd generowania ćwiczenia');
      const data = await response.json();
      setExerciseText(data.exerciseText);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h2>Practice - Generator tekstu ćwiczeniowego</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label>
          Język źródłowy:
          <input name="sourceLanguage" value={form.sourceLanguage} onChange={handleChange} required />
        </label>
        <label>
          Język docelowy:
          <input name="targetLanguage" value={form.targetLanguage} onChange={handleChange} required />
        </label>
        <label>
          Poziom:
          <input name="level" value={form.level} onChange={handleChange} required />
        </label>
        <label>
          Liczba zdań:
          <input name="sentenceCount" type="number" min={1} max={20} value={form.sentenceCount} onChange={handleChange} required />
        </label>
        <label>
          Temat (opcjonalnie):
          <input name="topic" value={form.topic} onChange={handleChange} />
        </label>
        <button type="submit" disabled={loading}>{loading ? 'Generowanie...' : 'Generuj tekst'}</button>
      </form>
      {error && <div style={{ color: 'red', marginTop: 16 }}>{error}</div>}
      {exerciseText && (
        <div style={{ marginTop: 24 }}>
          <h3>Wygenerowany tekst:</h3>
          <pre style={{ background: '#f4f4f4', padding: 16 }}>{exerciseText}</pre>
        </div>
      )}
    </div>
  );
};

export default Practice;