import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Paper,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  CircularProgress
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon, Mic as MicIcon, MicOff as MicOffIcon } from '@mui/icons-material';
import { buildApiUrl, buildApiUrlWithParams, API_CONFIG } from '../config/api';

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

  // Stan dla zwijania/rozwijania generatora
  const [isGeneratorExpanded, setIsGeneratorExpanded] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleVerifyChange = (e) => {
    const { name, value } = e.target;
    setVerifyForm((prev) => ({ ...prev, [name]: value }));
  };

  // Funkcja do kopiowania wygenerowanego tekstu
  const copyToSourceText = () => {
    if (exerciseText) {
      setVerifyForm(prev => ({
        ...prev,
        sourceText: exerciseText.trim()
      }));
    }
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

    const currentLanguage = fieldName === 'sourceText' 
      ? verifyForm.sourceLanguage 
      : verifyForm.targetLanguage;
    
    recognition.lang = languageMap[currentLanguage] || 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    if (fieldName === 'sourceText') {
      setIsRecordingSource(true);
    } else {
      setIsRecordingTranslation(true);
    }

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setVerifyForm(prev => ({
        ...prev,
        [fieldName]: transcript
      }));
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      alert(`Błąd rozpoznawania mowy: ${event.error}`);
    };

    recognition.onend = () => {
      setIsRecordingSource(false);
      setIsRecordingTranslation(false);
    };

    recognition.start();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setExerciseText('');
    setLoading(true);

    try {
      const response = await fetch(buildApiUrl(API_CONFIG.PRACTICE.GENERATE), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.text || data;
        setExerciseText(text);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to generate exercise text');
      }
    } catch (error) {
      console.error('Error generating exercise text:', error);
      setError('Failed to generate exercise text. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setVerifyError('');
    setVerifyResult(null);
    setVerifyLoading(true);

    try {
      const response = await fetch(buildApiUrl(API_CONFIG.PRACTICE.VERIFY), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceLanguage: verifyForm.sourceLanguage,
          targetLanguage: verifyForm.targetLanguage,
          sourceText: verifyForm.sourceText,
          userTranslation: verifyForm.userTranslation
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setVerifyResult(data);
      } else {
        const errorData = await response.json();
        setVerifyError(errorData.message || 'Failed to verify translation');
      }
    } catch (error) {
      console.error('Error verifying translation:', error);
      setVerifyError('Failed to verify translation. Please check your connection and try again.');
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      {/* Generator tekstu ćwiczeniowego - zwijany */}
      <Paper sx={{ mb: 5, p: 3 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>Generator tekstu ćwiczeniowego</Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 0 }}>Generuj nowy tekst:</Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setIsGeneratorExpanded(!isGeneratorExpanded)}
              endIcon={isGeneratorExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            >
              {isGeneratorExpanded ? 'Ukryj' : 'Pokaż'}
            </Button>
          </Box>
          <Collapse in={isGeneratorExpanded}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth required>
                <InputLabel id="source-language-label">Język źródłowy</InputLabel>
                <Select
                  id="sourceLanguage"
                  name="sourceLanguage"
                  value={form.sourceLanguage}
                  onChange={handleChange}
                  label="Język źródłowy"
                  labelId="source-language-label"
                  aria-label="Select source language"
                >
                  {LANGUAGES.map(lang => (
                    <MenuItem key={lang.value} value={lang.value}>{lang.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth required>
                <InputLabel id="target-language-label">Język docelowy</InputLabel>
                <Select
                  id="targetLanguage"
                  name="targetLanguage"
                  value={form.targetLanguage}
                  onChange={handleChange}
                  label="Język docelowy"
                  labelId="target-language-label"
                  aria-label="Select target language"
                >
                  {LANGUAGES.map(lang => (
                    <MenuItem key={lang.value} value={lang.value}>{lang.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth required>
                <InputLabel id="level-label">Poziom</InputLabel>
                <Select
                  id="level"
                  name="level"
                  value={form.level}
                  onChange={handleChange}
                  label="Poziom"
                  labelId="level-label"
                  aria-label="Select proficiency level"
                >
                  {LEVELS.map(level => (
                    <MenuItem key={level} value={level}>{level}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                id="sentenceCount"
                name="sentenceCount"
                type="number"
                label="Liczba zdań"
                value={form.sentenceCount}
                onChange={handleChange}
                required
                inputProps={{ min: 1, max: 20 }}
                aria-label="Enter number of sentences"
              />
              <TextField
                fullWidth
                id="topic"
                name="topic"
                label="Temat (opcjonalnie)"
                value={form.topic}
                onChange={handleChange}
                aria-label="Enter optional topic"
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ px: 4 }}
                >
                  {loading ? <CircularProgress size={20} /> : 'Generuj tekst'}
                </Button>
              </Box>
            </Box>
          </Collapse>
          {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}
          {exerciseText && (
            <Alert severity="success" sx={{ mt: 3, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '1.15rem' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h6" sx={{ mb: 0 }}>Wygenerowany tekst:</Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={copyToSourceText}
                  startIcon={<span>📋</span>}
                >
                  Użyj do tłumaczenia
                </Button>
              </Box>
              {exerciseText}
            </Alert>
          )}
        </Box>
      </Paper>

      <Paper sx={{ mt: 5, p: 3 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>Weryfikacja tłumaczeń</Typography>
        <Box component="form" onSubmit={handleVerifySubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 0 }}>Sprawdź swoje tłumaczenie:</Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth required>
              <InputLabel id="verify-source-language-label">Język źródłowy</InputLabel>
              <Select
                id="verifySourceLanguage"
                name="sourceLanguage"
                value={verifyForm.sourceLanguage}
                onChange={handleVerifyChange}
                label="Język źródłowy"
                labelId="verify-source-language-label"
                aria-label="Select source language for verification"
              >
                {LANGUAGES.map(lang => (
                  <MenuItem key={lang.value} value={lang.value}>{lang.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel id="verify-target-language-label">Język docelowy</InputLabel>
              <Select
                id="verifyTargetLanguage"
                name="targetLanguage"
                value={verifyForm.targetLanguage}
                onChange={handleVerifyChange}
                label="Język docelowy"
                labelId="verify-target-language-label"
                aria-label="Select target language for verification"
              >
                {LANGUAGES.map(lang => (
                  <MenuItem key={lang.value} value={lang.value}>{lang.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              id="sourceText"
              name="sourceText"
              label="Tekst do przetłumaczenia"
              value={verifyForm.sourceText}
              onChange={handleVerifyChange}
              multiline
              rows={3}
              placeholder="Wpisz tekst do przetłumaczenia lub użyj mikrofonu..."
              required
              aria-label="Enter text to translate"
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => startSpeechRecognition('sourceText')}
                    disabled={isRecordingSource}
                    color={isRecordingSource ? 'error' : 'default'}
                    aria-label={isRecordingSource ? 'Stop recording' : 'Start voice recording'}
                  >
                    {isRecordingSource ? <MicOffIcon /> : <MicIcon />}
                  </IconButton>
                )
              }}
            />
            <TextField
              fullWidth
              id="userTranslation"
              name="userTranslation"
              label="Twoje tłumaczenie"
              value={verifyForm.userTranslation}
              onChange={handleVerifyChange}
              multiline
              rows={3}
              placeholder="Wpisz swoje tłumaczenie lub użyj mikrofonu..."
              required
              aria-label="Enter your translation"
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => startSpeechRecognition('userTranslation')}
                    disabled={isRecordingTranslation}
                    color={isRecordingTranslation ? 'error' : 'default'}
                    aria-label={isRecordingTranslation ? 'Stop recording' : 'Start voice recording'}
                  >
                    {isRecordingTranslation ? <MicOffIcon /> : <MicIcon />}
                  </IconButton>
                )
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                color="success"
                size="large"
                disabled={verifyLoading}
                sx={{ px: 4 }}
              >
                {verifyLoading ? <CircularProgress size={20} /> : 'Sprawdź tłumaczenie'}
              </Button>
            </Box>
          </Box>
          {verifyError && <Alert severity="error" sx={{ mt: 3 }}>{verifyError}</Alert>}
          {verifyResult && (
            <Alert severity={verifyResult.isCorrect ? 'success' : 'warning'} sx={{ mt: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {verifyResult.isCorrect ? '✅ Tłumaczenie jest poprawne!' : '❌ Tłumaczenie niepoprawne'}
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography component="strong">Feedback:</Typography> {verifyResult.feedback}
              </Box>
              {verifyResult.explanation && (
                <Box sx={{ mb: 2 }}>
                  <Typography component="strong">Wyjaśnienie:</Typography> {verifyResult.explanation}
                </Box>
              )}
              {!verifyResult.isCorrect && verifyResult.correctTranslation && (
                <Box sx={{ mb: 2 }}>
                  <Typography component="strong">Poprawne tłumaczenie:</Typography> {verifyResult.correctTranslation}
                </Box>
              )}
            </Alert>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default Practice;