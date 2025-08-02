import React, { useState } from 'react';
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
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const AddWord = () => {
  const [formData, setFormData] = useState({
    originalWord: '',
    translation: '',
    language: '',
    exampleUsage: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_URL || 'https://language-learning-backend-production-3ce3.up.railway.app';

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
      const response = await fetch(`${apiUrl}/api/words`, {
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
           exampleUsage: ''
         });
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to add word');
      }
    } catch (error) {
      console.error('Error adding word:', error);
      setError('Failed to add word');
    }
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
            <InputLabel>Language</InputLabel>
            <Select
              name="language"
              value={formData.language}
              onChange={handleChange}
              label="Language"
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

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
            >
              Add Word
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/words')}
              fullWidth
            >
              Back to List
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default AddWord; 