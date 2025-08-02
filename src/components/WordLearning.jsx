import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Box,
  Rating,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const WordLearning = () => {
  const [currentWord, setCurrentWord] = useState(null);
  const [translation, setTranslation] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    language: ''
  });
  const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_URL || 'https://language-learning-backend-production-3ce3.up.railway.app';

  const fetchRandomWord = async () => {
    try {
      setError('');
      const queryParams = new URLSearchParams();
      if (filters.language) {
        queryParams.append('language', filters.language);
      }
      
      const response = await fetch(`${apiUrl}/api/words/random?${queryParams}`);
      
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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentWord) return;

    try {
      const response = await fetch(`${apiUrl}/api/words/${currentWord.id}/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ translation }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error checking translation:', error);
      setResult({ correct: false, message: 'Error checking translation' });
    }
  };

  const handleFilterChange = (e) => {
    setFilters(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
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
          <InputLabel>Language</InputLabel>
          <Select
            name="language"
            value={filters.language}
            onChange={handleFilterChange}
            label="Language"
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
            <Rating value={currentWord.proficiencyLevel} max={5} readOnly />
          </Box>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Your Translation"
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
              margin="normal"
              required
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
            >
              Check
            </Button>
          </form>
          {result && (
            <Box sx={{ mt: 2 }}>
              <Typography
                color={result.correct ? 'success.main' : 'error.main'}
                variant="h6"
              >
                {result.message}
              </Typography>
              
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
              
              {result.correct && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Correct Translation:
                  </Typography>
                  <Typography variant="body1">
                    {result.correctTranslation}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Paper>
      ) : !error && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="body1" align="center">
            Loading...
          </Typography>
        </Paper>
      )}

      {currentWord && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button
            variant="outlined"
            onClick={fetchRandomWord}
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