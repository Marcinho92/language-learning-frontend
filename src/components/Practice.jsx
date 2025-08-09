import React, { useState } from 'react';

const LANGUAGES = [
  { value: 'polski', label: 'Polski' },
  { value: 'english', label: 'English' },
  { value: 'deutsch', label: 'Deutsch' },
  { value: 'français', label: 'Français' },
  { value: 'español', label: 'Español' },
];
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const Practice = () => {
  const [form, setForm] = useState({
    sourceLanguage: 'polski',
    targetLanguage: 'english',
    level: 'B2',
    sentenceCount: 1,
    topic: ''
  });
  const [loading, setLoading] = useState(false);
  const [exerciseText, setExerciseText] = useState('');
  const [error, setError] = useState('');

  // Stan dla weryfikacji tłumaczeń
  const [verifyForm, setVerifyForm] = useState({
    sourceLanguage: 'polski',
    sourceText: '',
    targetLanguage: 'english',
    userTranslation: ''
  });
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifyError, setVerifyError] = useState('');

  // Stan dla rozpoznawania mowy
  const [isRecordingSource, setIsRecordingSource] = useState(false);
  const [isRecordingTranslation, setIsRecordingTranslation] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleVerifyChange = (e) => {
    const { name, value } = e.target;
    setVerifyForm((prev) => ({ ...prev, [name]: value }));
  };

  // Funkcja do rozpoznawania mowy
  const startSpeechRecognition = (fieldName) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Twoja przeglądarka nie obsługuje rozpoznawania mowy.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    // Ustaw język na podstawie wybranego języka
    const languageMap = {
      'polski': 'pl-PL',
      'english': 'en-US',
      'deutsch': 'de-DE',
      'français': 'fr-FR',
      'español': 'es-ES'
    };
    
    recognition.lang = fieldName === 'sourceText' 
      ? languageMap[verifyForm.sourceLanguage] || 'en-US'
      : languageMap[verifyForm.targetLanguage] || 'en-US';
    
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      if (fieldName === 'sourceText') {
        setIsRecordingSource(true);
      } else {
        setIsRecordingTranslation(true);
      }
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setVerifyForm(prev => ({
        ...prev,
        [fieldName]: prev[fieldName] + ' ' + transcript
      }));
    };

    recognition.onerror = (event) => {
      console.error('Błąd rozpoznawania mowy:', event.error);
      alert('Błąd rozpoznawania mowy: ' + event.error);
    };

    recognition.onend = () => {
      setIsRecordingSource(false);
      setIsRecordingTranslation(false);
    };

    recognition.start();
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

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setVerifyLoading(true);
    setVerifyError('');
    setVerifyResult(null);
    try {
      const response = await fetch('https://language-learning-backend-production-3ce3.up.railway.app/api/practice/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verifyForm)
      });
      if (!response.ok) throw new Error('Błąd weryfikacji tłumaczenia');
      const data = await response.json();
      setVerifyResult(data);
    } catch (err) {
      setVerifyError(err.message);
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <div className="container my-5" style={{ maxWidth: 700 }}>
      {/* Generator tekstu ćwiczeniowego */}
      <div className="card shadow mb-5">
        <div className="card-body">
          <h2 className="card-title mb-4">Practice - Generator tekstu ćwiczeniowego</h2>
          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Język źródłowy</label>
              <select
                className="form-select"
                name="sourceLanguage"
                value={form.sourceLanguage}
                onChange={handleChange}
                required
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.value} value={lang.value}>{lang.label}</option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Język docelowy</label>
              <select
                className="form-select"
                name="targetLanguage"
                value={form.targetLanguage}
                onChange={handleChange}
                required
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.value} value={lang.value}>{lang.label}</option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Poziom</label>
              <select
                className="form-select"
                name="level"
                value={form.level}
                onChange={handleChange}
                required
              >
                {LEVELS.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Liczba zdań</label>
              <input
                className="form-control"
                name="sentenceCount"
                type="number"
                min={1}
                max={20}
                value={form.sentenceCount}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-12">
              <label className="form-label">Temat (opcjonalnie)</label>
              <input
                className="form-control"
                name="topic"
                value={form.topic}
                onChange={handleChange}
              />
            </div>
            <div className="col-12 d-flex justify-content-end">
              <button type="submit" className="btn btn-primary px-4" disabled={loading}>
                {loading ? 'Generowanie...' : 'Generuj tekst'}
              </button>
            </div>
          </form>
          {error && <div className="alert alert-danger mt-4">{error}</div>}
          {exerciseText && (
            <div className="alert alert-success mt-5" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '1.15rem' }}>
              <h5 className="mb-3">Wygenerowany tekst:</h5>
              {exerciseText}
            </div>
          )}
        </div>
      </div>

      {/* Weryfikacja tłumaczeń */}
      <div className="card shadow">
        <div className="card-body">
          <h2 className="card-title mb-4">Weryfikacja tłumaczeń</h2>
          <form onSubmit={handleVerifySubmit} className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Język źródłowy</label>
              <select
                className="form-select"
                name="sourceLanguage"
                value={verifyForm.sourceLanguage}
                onChange={handleVerifyChange}
                required
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.value} value={lang.value}>{lang.label}</option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Język docelowy</label>
              <select
                className="form-select"
                name="targetLanguage"
                value={verifyForm.targetLanguage}
                onChange={handleVerifyChange}
                required
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.value} value={lang.value}>{lang.label}</option>
                ))}
              </select>
            </div>
            <div className="col-12">
              <label className="form-label">Tekst do przetłumaczenia</label>
              <div className="input-group">
                <textarea
                  className="form-control"
                  name="sourceText"
                  value={verifyForm.sourceText}
                  onChange={handleVerifyChange}
                  rows={3}
                  placeholder="Wpisz tekst do przetłumaczenia lub użyj mikrofonu..."
                  required
                />
                <button
                  type="button"
                  className={`btn ${isRecordingSource ? 'btn-danger' : 'btn-outline-secondary'}`}
                  onClick={() => startSpeechRecognition('sourceText')}
                  disabled={isRecordingSource}
                >
                  {isRecordingSource ? '🔴' : '🎤'}
                </button>
              </div>
            </div>
            <div className="col-12">
              <label className="form-label">Twoje tłumaczenie</label>
              <div className="input-group">
                <textarea
                  className="form-control"
                  name="userTranslation"
                  value={verifyForm.userTranslation}
                  onChange={handleVerifyChange}
                  rows={3}
                  placeholder="Wpisz swoje tłumaczenie lub użyj mikrofonu..."
                  required
                />
                <button
                  type="button"
                  className={`btn ${isRecordingTranslation ? 'btn-danger' : 'btn-outline-secondary'}`}
                  onClick={() => startSpeechRecognition('userTranslation')}
                  disabled={isRecordingTranslation}
                >
                  {isRecordingTranslation ? '🔴' : '🎤'}
                </button>
              </div>
            </div>
            <div className="col-12 d-flex justify-content-end">
              <button type="submit" className="btn btn-success px-4" disabled={verifyLoading}>
                {verifyLoading ? 'Sprawdzanie...' : 'Sprawdź tłumaczenie'}
              </button>
            </div>
          </form>
          {verifyError && <div className="alert alert-danger mt-4">{verifyError}</div>}
          {verifyResult && (
            <div className={`alert mt-4 ${verifyResult.correct ? 'alert-success' : 'alert-warning'}`}>
              <h5 className="mb-3">
                {verifyResult.correct ? '✅ Tłumaczenie jest poprawne!' : '❌ Tłumaczenie niepoprawne'}
              </h5>
              <div className="mb-3">
                <strong>Feedback:</strong> {verifyResult.feedback}
              </div>
              {!verifyResult.correct && (
                <>
                  <div className="mb-3">
                    <strong>Poprawne tłumaczenie:</strong> {verifyResult.correctTranslation}
                  </div>
                  <div>
                    <strong>Wyjaśnienie:</strong> {verifyResult.explanation}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Practice;