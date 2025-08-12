import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Rating
} from '@mui/material';
import { getCachedData, setCachedData, getCacheKey, clearCache } from '../utils/apiCache';

const EditWord = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [word, setWord] = useState(null);
  const [formData, setFormData] = useState({
    originalWord: '',
    translation: '',
    language: '',
    exampleUsage: '',
    explanation: '',
    proficiencyLevel: 1
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  const apiUrl = process.env.REACT_APP_API_URL || 'https://language-learning-backend-production-3ce3.up.railway.app';

  useEffect(() => {
    fetchWord();
  }, [id]);

  const fetchWord = async () => {
    try {
      // Sprawdź cache dla konkretnego słowa
      const cacheKey = getCacheKey(`${apiUrl}/api/words/${id}`);
      const cachedData = getCachedData(cacheKey);
      
      if (cachedData) {
        setWord(cachedData);
        setFormData({
          originalWord: cachedData.originalWord || '',
          translation: cachedData.translation || '',
          language: cachedData.language || '',
          exampleUsage: cachedData.exampleUsage || '',
          explanation: cachedData.explanation || '',
          proficiencyLevel: cachedData.proficiencyLevel || 1
        });
        setLoading(false);
        return;
      }
      
      const response = await fetch(`${apiUrl}/api/words/${id}`);
      if (response.ok) {
        const data = await response.json();
        setWord(data);
        setFormData({
          originalWord: data.originalWord || '',
          translation: data.translation || '',
          language: data.language || '',
          exampleUsage: data.exampleUsage || '',
          explanation: data.explanation || '',
          proficiencyLevel: data.proficiencyLevel || 1
        });
        // Zapisz w cache
        setCachedData(cacheKey, data);
      } else {
        setError('Word not found');
      }
    } catch (error) {
      console.error('Error fetching word:', error);
      setError('Failed to fetch word');
    } finally {
      setLoading(false);
    }
  };

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

    try {
      const response = await fetch(`${apiUrl}/api/words/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess('Word updated successfully!');
        // Wyczyść cache po edycji słowa
        clearCache();
        setTimeout(() => {
          navigate('/words');
        }, 1500);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update word');
      }
    } catch (error) {
      console.error('Error updating word:', error);
      setError('Failed to update word');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this word?')) {
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/words/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('Word deleted successfully!');
        setTimeout(() => {
          navigate('/words');
        }, 1500);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to delete word');
      }
    } catch (error) {
      console.error('Error deleting word:', error);
      setError('Failed to delete word');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="sm">
        <Typography variant="h6" align="center">
          Loading...
        </Typography>
      </Container>
    );
  }

  if (error && !word) {
    return (
      <Container maxWidth="sm">
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="outlined" onClick={() => navigate('/words')}>
          Back to List
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom align="center">
        Edit Word
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
          />

          <TextField
            fullWidth
            label="Translation"
            name="translation"
            value={formData.translation}
            onChange={handleChange}
            margin="normal"
            required
          />

          <FormControl fullWidth margin="normal" required>
            <InputLabel id="edit-language-label">Language</InputLabel>
            <Select
              name="language"
              value={formData.language}
              onChange={handleChange}
              label="Language"
              labelId="edit-language-label"
              aria-label="Select language for editing"
            >
              <MenuItem value="english">English</MenuItem>
              <MenuItem value="polish">Polish</MenuItem>
              <MenuItem value="spanish">Spanish</MenuItem>
              <MenuItem value="german">German</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Example Usage (optional)"
            name="exampleUsage"
            value={formData.exampleUsage}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={3}
          />

          <TextField
            fullWidth
            label="Explanation (optional)"
            name="explanation"
            value={formData.explanation}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={3}
            placeholder="Add a brief explanation or context for this word..."
          />

          <Box sx={{ mt: 2 }}>
            <Typography component="legend">Proficiency Level</Typography>
            <Rating
              name="proficiencyLevel"
              value={parseInt(formData.proficiencyLevel)}
              onChange={(event, newValue) => {
                setFormData(prev => ({
                  ...prev,
                  proficiencyLevel: newValue
                }));
              }}
              max={5}
              aria-label={`Set proficiency level to ${parseInt(formData.proficiencyLevel)} out of 5`}
            />
          </Box>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
            >
              Update Word
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/words')}
              fullWidth
            >
              Cancel
            </Button>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="error"
              onClick={handleDelete}
              fullWidth
            >
              Delete Word
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default EditWord; 