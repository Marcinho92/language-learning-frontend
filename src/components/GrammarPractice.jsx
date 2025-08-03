import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Box,
  Alert,
  Card,
  CardContent,
  Chip,
  Divider,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const GrammarPractice = () => {
  const [currentPractice, setCurrentPractice] = useState(null);
  const [userSentence, setUserSentence] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_URL || 'https://language-learning-backend-production-3ce3.up.railway.app';

  const fetchRandomGrammarPractice = async () => {
    try {
      setLoading(true);
      setError('');
      setResult(null);
      setUserSentence('');
      
      const response = await fetch(`${apiUrl}/api/words/grammar-practice`);
      
      if (response.ok) {
        const data = await response.json();
        setCurrentPractice(data);
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch grammar practice');
        setCurrentPractice(null);
      }
    } catch (error) {
      console.error('Error fetching grammar practice:', error);
      setError('Failed to fetch grammar practice');
      setCurrentPractice(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentPractice || !userSentence.trim()) return;

    try {
      setSubmitting(true);
      const response = await fetch(`${apiUrl}/api/words/grammar-practice/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wordId: currentPractice.word.id,
          userSentence: userSentence.trim(),
          grammarTopic: currentPractice.grammarTopic
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error validating grammar practice:', error);
      setResult({ 
        isCorrect: false, 
        feedback: 'Error validating sentence',
        explanation: 'Please try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextPractice = () => {
    setResult(null);
    setUserSentence('');
    fetchRandomGrammarPractice();
  };

  useEffect(() => {
    fetchRandomGrammarPractice();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
        Grammar Practice
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {currentPractice && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="div">
                Practice Task
              </Typography>
              <Chip 
                label={currentPractice.grammarTopic} 
                color="primary" 
                variant="outlined"
              />
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Word to use:
              </Typography>
              <Typography variant="h5" color="primary" gutterBottom>
                {currentPractice.word.originalWord}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Translation: {currentPractice.word.translation}
              </Typography>
              {currentPractice.word.language && (
                <Typography variant="body2" color="text.secondary">
                  Language: {currentPractice.word.language}
                </Typography>
              )}
            </Box>

            <Typography variant="body1" gutterBottom>
              Write a sentence using the word "<strong>{currentPractice.word.originalWord}</strong>" 
              and applying the grammar topic "<strong>{currentPractice.grammarTopic}</strong>".
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Grammar Explanation - always visible */}
      {currentPractice && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Grammar Explanation
          </Typography>
          <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
            {currentPractice.explanation || "Loading grammar explanation..."}
          </Typography>
        </Paper>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Your sentence"
            value={userSentence}
            onChange={(e) => setUserSentence(e.target.value)}
            placeholder="Write your sentence here..."
            disabled={submitting}
            sx={{ mb: 3 }}
          />
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={!userSentence.trim() || submitting}
              sx={{ minWidth: 120 }}
            >
              {submitting ? <CircularProgress size={24} /> : 'Check Sentence'}
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              onClick={handleNextPractice}
              disabled={submitting}
            >
              Next Practice
            </Button>
          </Box>
        </form>
      </Paper>

      {result && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Alert 
            severity={result.isCorrect ? 'success' : 'warning'} 
            sx={{ mb: 2 }}
          >
            {result.feedback}
          </Alert>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              variant="contained"
              onClick={handleNextPractice}
              size="large"
            >
              Next Practice
            </Button>
          </Box>
        </Paper>
      )}

      {!currentPractice && !error && (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No words available
          </Typography>
          <Typography variant="body1" paragraph>
            Add some words to your vocabulary to start grammar practice.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/add')}
          >
            Add Words
          </Button>
        </Paper>
      )}
    </Container>
  );
};

export default GrammarPractice; 