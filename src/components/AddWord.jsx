import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildApiUrl, buildApiUrlWithParams, API_CONFIG } from '../config/api';
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
  CircularProgress
} from '@mui/material';

const AddWord = () => {
  const [formData, setFormData] = useState({
    originalWord: '',
    translation: '',
    language: '',
    exampleUsage: '',
    explanation: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch(buildApiUrl(API_CONFIG.WORDS.CREATE), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess('Word added successfully!');
        
        setFormData({
          originalWord: '',
          translation: '',
          language: '',
          exampleUsage: '',
          explanation: ''
        });
        
        // Przekieruj do listy słów po 2 sekundach
        setTimeout(() => {
          navigate('/words');
        }, 2000);
      } else {
        const errorText = await response.text();
        let errorData = { message: 'Failed to add word' };
        
        if (errorText.trim()) {
          try {
            errorData = JSON.parse(errorText);
          } catch (parseError) {
            console.error('Error parsing error response:', parseError);
          }
        }
        
        setError(errorData.message || 'Failed to add word');
      }
    } catch (error) {
      console.error('Error adding word:', error);
      setError('Failed to add word. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      originalWord: '',
      translation: '',
      language: '',
      exampleUsage: '',
      explanation: ''
    });
    setError('');
    setSuccess('');
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom align="center">
        Add New Word
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Original Word"
            name="originalWord"
            value={formData.originalWord}
            onChange={handleChange}
            margin="normal"
            required
            disabled={loading}
            placeholder="Enter the word in original language"
          />
          <TextField
            fullWidth
            label="Translation"
            name="translation"
            value={formData.translation}
            onChange={handleChange}
            margin="normal"
            required
            disabled={loading}
            placeholder="Enter the translation"
          />
          <FormControl fullWidth margin="normal" required>
            <InputLabel id="language-label">Language</InputLabel>
            <Select
              name="language"
              value={formData.language}
              onChange={handleChange}
              label="Language"
              labelId="language-label"
              disabled={loading}
            >
              <MenuItem value="english">English</MenuItem>
              <MenuItem value="polish">Polish</MenuItem>
              <MenuItem value="spanish">Spanish</MenuItem>
              <MenuItem value="german">German</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Example Usage (Optional)"
            name="exampleUsage"
            value={formData.exampleUsage}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={2}
            disabled={loading}
            placeholder="Example sentence using this word"
          />
          <TextField
            fullWidth
            label="Explanation (Optional)"
            name="explanation"
            value={formData.explanation}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={2}
            disabled={loading}
            placeholder="Additional explanation or context"
          />
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading || !formData.originalWord || !formData.translation || !formData.language}
            >
              {loading ? <CircularProgress size={20} /> : 'Add Word'}
            </Button>
            <Button
              type="button"
              variant="outlined"
              onClick={handleReset}
              disabled={loading}
            >
              Reset
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default AddWord; 