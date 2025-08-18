import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  const [saving, setSaving] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL || 'https://language-learning-backend-production-3ce3.up.railway.app';

  useEffect(() => {
    fetchWord();
  }, [id]);

  const fetchWord = async () => {
    try {
      setLoading(true);
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
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Word not found');
      }
    } catch (error) {
      console.error('Error fetching word:', error);
      setError('Failed to fetch word. Please check your connection and try again.');
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
    setSaving(true);

    try {
      const response = await fetch(`${apiUrl}/api/words/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedWord = await response.json();
        setWord(updatedWord);
        setSuccess('Word updated successfully!');
        
        // Przekieruj do listy słów po 2 sekundach
        setTimeout(() => {
          navigate('/words');
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update word');
      }
    } catch (error) {
      console.error('Error updating word:', error);
      setError('Failed to update word. Please check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this word?')) {
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`${apiUrl}/api/words/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Przekieruj do listy słów
        navigate('/words');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to delete word');
      }
    } catch (error) {
      console.error('Error deleting word:', error);
      setError('Failed to delete word. Please check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress size={40} />
        </Box>
      </Container>
    );
  }

  if (error && !word) {
    return (
      <Container maxWidth="sm">
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          onClick={() => navigate('/words')}
          sx={{ mt: 2 }}
        >
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

      {word && (
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
              disabled={saving}
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
              disabled={saving}
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
                disabled={saving}
              >
                <MenuItem value="english">English</MenuItem>
                <MenuItem value="polish">Polish</MenuItem>
                <MenuItem value="spanish">Spanish</MenuItem>
                <MenuItem value="german">German</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography component="legend" gutterBottom>
                Proficiency Level
              </Typography>
              <Rating
                name="proficiencyLevel"
                value={formData.proficiencyLevel}
                onChange={(event, newValue) => {
                  handleChange({
                    target: { name: 'proficiencyLevel', value: newValue }
                  });
                }}
                max={5}
                disabled={saving}
                aria-label="Set proficiency level"
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Current level: {formData.proficiencyLevel}/5
              </Typography>
            </Box>
            <TextField
              fullWidth
              label="Example Usage (Optional)"
              name="exampleUsage"
              value={formData.exampleUsage}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={2}
              disabled={saving}
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
              disabled={saving}
              placeholder="Additional explanation or context"
            />
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={saving || !formData.originalWord || !formData.translation || !formData.language}
              >
                {saving ? <CircularProgress size={20} /> : 'Update Word'}
              </Button>
              <Button
                type="button"
                variant="outlined"
                color="error"
                onClick={handleDelete}
                disabled={saving}
              >
                Delete Word
              </Button>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Button
                type="button"
                variant="text"
                onClick={() => navigate('/words')}
                disabled={saving}
                fullWidth
              >
                Cancel
              </Button>
            </Box>
          </form>
        </Paper>
      )}
    </Container>
  );
};

export default EditWord; 