import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Rating,
  Alert,
  Chip
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const WordList = () => {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    language: '',
    search: ''
  });

  const apiUrl = process.env.REACT_APP_API_URL || 'https://language-learning-backend-production-3ce3.up.railway.app';

  useEffect(() => {
    fetchWords();
  }, []);

  const fetchWords = async () => {
    try {
      setError('');
      const response = await fetch(`${apiUrl}/api/words`);
      
      if (response.ok) {
        const data = await response.json();
        setWords(data);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch words');
      }
    } catch (error) {
      console.error('Error fetching words:', error);
      setError('Failed to fetch words');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this word?')) {
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/words/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setWords(words.filter(word => word.id !== id));
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to delete word');
      }
    } catch (error) {
      console.error('Error deleting word:', error);
      setError('Failed to delete word');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredWords = words.filter(word => {
    const matchesLanguage = !filters.language || word.language === filters.language;
    const matchesSearch = !filters.search || 
      word.originalWord.toLowerCase().includes(filters.search.toLowerCase()) ||
      word.translation.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesLanguage && matchesSearch;
  });



  const getLanguageLabel = (language) => {
    const labels = {
      'english': 'English',
      'polish': 'Polish',
      'spanish': 'Spanish',
      'german': 'German'
    };
    return labels[language] || language;
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h6" align="center">
          Loading...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Word List
        </Typography>
        <Button
          component={Link}
          to="/add"
          variant="contained"
          color="primary"
        >
          Add New Word
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="Search words"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            size="small"
            sx={{ minWidth: 200 }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Language</InputLabel>
            <Select
              name="language"
              value={filters.language}
              onChange={handleFilterChange}
              label="Language"
            >
              <MenuItem value="">All Languages</MenuItem>
              <MenuItem value="english">English</MenuItem>
              <MenuItem value="polish">Polish</MenuItem>
              <MenuItem value="spanish">Spanish</MenuItem>
              <MenuItem value="german">German</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Typography variant="body2" color="text.secondary">
          Showing {filteredWords.length} of {words.length} words
        </Typography>
      </Paper>

      {filteredWords.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No words found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {words.length === 0 ? 'Add your first word to get started!' : 'Try adjusting your search filters.'}
          </Typography>
          {words.length === 0 && (
            <Button
              component={Link}
              to="/add"
              variant="contained"
              color="primary"
            >
              Add Your First Word
            </Button>
          )}
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Original Word</TableCell>
                <TableCell>Translation</TableCell>
                                 <TableCell>Language</TableCell>
                 <TableCell>Proficiency</TableCell>
                 <TableCell>Example Usage</TableCell>
                 <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredWords.map((word) => (
                <TableRow key={word.id}>
                  <TableCell>
                    <Typography variant="body1" fontWeight="bold">
                      {word.originalWord}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1">
                      {word.translation}
                    </Typography>
                  </TableCell>
                                     <TableCell>
                     <Chip 
                       label={getLanguageLabel(word.language)} 
                       size="small" 
                       color="primary" 
                       variant="outlined"
                     />
                   </TableCell>
                   <TableCell>
                     <Rating 
                       value={word.proficiencyLevel} 
                       max={5} 
                       readOnly 
                       size="small"
                     />
                   </TableCell>
                  <TableCell>
                    {word.exampleUsage ? (
                      <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                        {word.exampleUsage}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No example
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      component={Link}
                      to={`/edit/${word.id}`}
                      color="primary"
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(word.id)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default WordList; 