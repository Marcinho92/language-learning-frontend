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
  Rating,
  Alert,
  Chip,
  CircularProgress
} from '@mui/material';
import { VolumeUp as VolumeUpIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { buildApiUrl, buildApiUrlWithParams, API_CONFIG } from '../config/api';

const WordLearning = () => {
  const [currentWord, setCurrentWord] = useState(null);
  const [translation, setTranslation] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    language: ''
  });
  const navigate = useNavigate();

  const fetchRandomWord = async () => {
    try {
      setError('');
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      if (filters.language) {
        queryParams.append('language', filters.language);
      }
      
      // Nie cachuj losowych słów - zawsze pobierz nowe
      // Dodaj timestamp aby wymusić nowe pobieranie (zapobiega cache'owaniu)
      queryParams.append('_t', Date.now());
      
      const response = await fetch(buildApiUrlWithParams(API_CONFIG.WORDS.RANDOM, {
        language: filters.language,
        _t: Date.now()
      }));
      
      if (response.ok) {
        const data = await response.json();
        if (data.isEmpty) {
          setCurrentWord(null);
          setError(data.message || 'Baza słów jest pusta. Dodaj słowa, aby rozpocząć naukę.');
          setTranslation('');
          setResult(null);
        } else {
          setCurrentWord(data);
          setTranslation('');
          setResult(null);
          setError('');
          
          // Wyczyść cache dla tego słowa aby wymusić aktualizację
          // clearCacheByPattern(`/api/words/${data.id}`); // Removed as per edit hint
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch random word');
        setCurrentWord(null);
      }
    } catch (error) {
      console.error('Error fetching random word:', error);
      setError('Failed to fetch random word');
      setCurrentWord(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentWord || !translation.trim()) return;

    try {
      setLoading(true);
      const response = await fetch(buildApiUrl(API_CONFIG.WORDS.CHECK(currentWord.id)), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ translation: translation.trim() }),
      });

      const data = await response.json();
      setResult(data);
      
      // Jeśli odpowiedź jest poprawna, zaktualizuj poziom biegłości
      if (data.correct) {
        // Pobierz zaktualizowane słowo z nowym poziomem biegłości
        const updatedWordResponse = await fetch(buildApiUrl(API_CONFIG.WORDS.GET_BY_ID(currentWord.id)));
        if (updatedWordResponse.ok) {
          const updatedWord = await updatedWordResponse.json();
          setCurrentWord(updatedWord);
          
          // Wyczyść cache dla listy słów aby odzwierciedlić zmiany
          // clearCacheByPattern('/api/words'); // Removed as per edit hint
        }
      }
    } catch (error) {
      console.error('Error checking translation:', error);
      setResult({ correct: false, message: 'Error checking translation' });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    // Reset current word when language filter changes
    setCurrentWord(null);
    setTranslation('');
    setResult(null);
    setError('');
  };

  useEffect(() => {
    fetchRandomWord();
  }, [filters]);

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom align="center">
        Learn Words
      </Typography>

      <Box sx={{ mb: 4 }}>
        <FormControl sx={{ mr: 2, minWidth: 120 }}>
          <InputLabel id="learn-language-label">Language</InputLabel>
          <Select
            name="language"
            value={filters.language}
            onChange={handleFilterChange}
            label="Language"
            labelId="learn-language-label"
            aria-label="Select language for learning"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="english">English</MenuItem>
            <MenuItem value="polish">Polish</MenuItem>
            <MenuItem value="spanish">Spanish</MenuItem>
            <MenuItem value="german">German</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert 
          severity={error.includes('Baza słów jest pusta') ? 'info' : 'error'} 
          sx={{ mb: 2 }}
          action={
            error.includes('Baza słów jest pusta') && (
              <Button 
                color="inherit" 
                size="small"
                onClick={() => navigate('/add')}
              >
                Dodaj słowo
              </Button>
            )
          }
        >
          {error}
        </Alert>
      )}

      {currentWord ? (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Translate this word:
          </Typography>
          <Typography variant="h4" gutterBottom>
            {currentWord.originalWord}
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Typography component="span" sx={{ mr: 1 }}>
              Current Proficiency:
            </Typography>
            <Rating 
              value={currentWord.proficiencyLevel} 
              max={5} 
              readOnly 
              aria-label={`Current proficiency level: ${currentWord.proficiencyLevel} out of 5`} 
            />
            <Chip 
              label={`Level ${currentWord.proficiencyLevel}`} 
              size="small" 
              color="primary" 
              sx={{ ml: 1 }}
            />
          </Box>

          {currentWord.language && (
            <Box sx={{ mb: 2 }}>
              <Chip 
                label={currentWord.language} 
                size="small" 
                variant="outlined"
              />
            </Box>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Your Translation"
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
              margin="normal"
              required
              disabled={loading}
              placeholder="Enter your translation..."
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
              disabled={loading || !translation.trim()}
            >
              {loading ? <CircularProgress size={20} /> : 'Check Translation'}
            </Button>
          </form>

          {result && (
            <Box sx={{ mt: 3 }}>
              <Alert 
                severity={result.correct ? 'success' : 'warning'}
                sx={{ mb: 2 }}
              >
                <Typography variant="h6">
                  {result.message}
                </Typography>
              </Alert>
              
              {result.exampleUsage && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Example Usage:
                  </Typography>
                  <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                    {result.exampleUsage}
                  </Typography>
                </Box>
              )}
              
              {result.explanation && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Explanation:
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    {result.explanation}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Paper>
      ) : !error && !loading && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="body1" align="center">
            No words available for selected language.
          </Typography>
        </Paper>
      )}

      {loading && !currentWord && (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <CircularProgress size={40} />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Loading random word...
          </Typography>
        </Paper>
      )}

      {currentWord && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button
            variant="outlined"
            onClick={fetchRandomWord}
            disabled={loading}
            sx={{ mr: 1 }}
          >
            Next Word
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default WordLearning; 