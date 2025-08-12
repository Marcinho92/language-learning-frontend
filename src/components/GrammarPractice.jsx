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
  CircularProgress,
  Collapse,
  IconButton
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon, VolumeUp as VolumeUpIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const GrammarPractice = () => {
  const [currentPractice, setCurrentPractice] = useState(null);
  const [userSentence, setUserSentence] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [wordDetailsExpanded, setWordDetailsExpanded] = useState(false);
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
    setWordDetailsExpanded(false);
    fetchRandomGrammarPractice();
  };

  const playAudio = (audioUrl) => {
    if (audioUrl) {
      try {
        // Check if the URL is base64 encoded
        if (audioUrl.startsWith('data:audio/') || audioUrl.includes('base64')) {
          // It's already a data URL, use it directly
          const audio = new Audio(audioUrl);
          audio.play().catch(error => {
            console.error('Error playing audio:', error);
          });
        } else {
          // Try to decode base64 if it's not a data URL
          try {
            // Remove any URL prefix and decode base64
            const base64Data = audioUrl.replace(/^data:audio\/[^;]+;base64,/, '');
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: 'audio/mpeg' });
            const blobUrl = URL.createObjectURL(blob);
            
            const audio = new Audio(blobUrl);
            audio.play().catch(error => {
              console.error('Error playing audio:', error);
            }).finally(() => {
              // Clean up the blob URL after a delay
              setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
            });
          } catch (decodeError) {
            console.error('Error decoding base64 audio:', decodeError);
            // Fallback to direct URL
            const audio = new Audio(audioUrl);
            audio.play().catch(error => {
              console.error('Error playing audio:', error);
            });
          }
        }
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    }
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
            <Typography variant="h6" component="div" sx={{ mb: 2 }}>
              Practice Task
            </Typography>
            
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
              
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => setWordDetailsExpanded(!wordDetailsExpanded)}
                  endIcon={wordDetailsExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                >
                  Show word details
                </Button>
                
                <Collapse in={wordDetailsExpanded}>
                  <Box sx={{ mt: 2, pl: 2, borderLeft: 2, borderColor: 'divider' }}>
                    {currentPractice.word.exampleUsage && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" fontWeight="bold" gutterBottom>
                          Example Usage:
                        </Typography>
                        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                          {currentPractice.word.exampleUsage}
                        </Typography>
                      </Box>
                    )}
                    
                    {currentPractice.word.explanation && (
                      <Box>
                        <Typography variant="body2" fontWeight="bold" gutterBottom>
                          Explanation:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {currentPractice.word.explanation}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Collapse>
              </Box>
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
            severity={result.correct ? 'success' : 'warning'} 
            sx={{ mb: 2 }}
          >
            {result.feedback}
          </Alert>
          
          {result.explanation && !result.correct && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Explanation:
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', whiteSpace: 'pre-line' }}>
                {result.explanation}
              </Typography>
            </Box>
          )}
          
          {result.correction && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {result.correct ? 'Your Sentence:' : 'Corrected Version:'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body1" sx={{ 
                  color: result.correct ? 'text.primary' : 'success.main', 
                  fontWeight: 'bold',
                  flex: 1
                }}>
                  {result.correction}
                </Typography>
                {result.audioUrl && (
                  <IconButton
                    onClick={() => playAudio(result.audioUrl)}
                    size="small"
                    color="primary"
                    sx={{ ml: 1 }}
                    aria-label="Play audio pronunciation"
                  >
                    <VolumeUpIcon />
                  </IconButton>
                )}
              </Box>
            </Box>
          )}
          
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