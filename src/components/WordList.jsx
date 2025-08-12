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
  Chip,
  Checkbox,
  TablePagination,
  Tooltip,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Collapse,
  Grid,
  Divider
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  GetApp as DownloadIcon, 
  Publish as UploadIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { getCachedData, setCachedData, getCacheKey, clearCache } from '../utils/apiCache';

const WordList = () => {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    language: '',
    search: ''
  });
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  });
  const [selectedWords, setSelectedWords] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [expandedWords, setExpandedWords] = useState(new Set());

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const apiUrl = process.env.REACT_APP_API_URL || 'https://language-learning-backend-production-3ce3.up.railway.app';

  useEffect(() => {
    fetchWords();
  }, []);

  const fetchWords = async () => {
    try {
      setError('');
      
      // Sprawdź cache
      const cacheKey = getCacheKey(`${apiUrl}/api/words`);
      const cachedData = getCachedData(cacheKey);
      
      if (cachedData) {
        setWords(cachedData);
        setLoading(false);
        return;
      }
      
      const response = await fetch(`${apiUrl}/api/words`);
      
      if (response.ok) {
        const data = await response.json();
        setWords(data);
        // Zapisz w cache
        setCachedData(cacheKey, data);
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
        setSelectedWords(selectedWords.filter(wordId => wordId !== id));
        setExpandedWords(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
        // Wyczyść cache po usunięciu słowa
        clearCache();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to delete word');
      }
    } catch (error) {
      console.error('Error deleting word:', error);
      setError('Failed to delete word');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedWords.length === 0) return;
    
    if (!window.confirm(`Are you sure you want to delete ${selectedWords.length} selected words?`)) {
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/words/bulk`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedWords),
      });

      if (response.ok) {
        const result = await response.json();
        setWords(words.filter(word => !selectedWords.includes(word.id)));
        setSelectedWords([]);
        setExpandedWords(new Set());
        // Wyczyść cache po bulk delete
        clearCache();
        alert(`Successfully deleted ${result.deletedCount} words!`);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to delete words');
      }
    } catch (error) {
      console.error('Error bulk deleting words:', error);
      setError('Failed to delete words');
    }
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const currentPageWordIds = paginatedWords.map(word => word.id);
      setSelectedWords(currentPageWordIds);
    } else {
      setSelectedWords([]);
    }
  };

  const handleSelectWord = (wordId) => {
    setSelectedWords(prev => 
      prev.includes(wordId) 
        ? prev.filter(id => id !== wordId)
        : [...prev, wordId]
    );
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggleExpand = (wordId) => {
    setExpandedWords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(wordId)) {
        newSet.delete(wordId);
      } else {
        newSet.add(wordId);
      }
      return newSet;
    });
  };

  const filteredWords = words.filter(word => {
    const matchesLanguage = !filters.language || word.language === filters.language;
    const matchesSearch = !filters.search || 
      word.originalWord.toLowerCase().includes(filters.search.toLowerCase()) ||
      word.translation.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesLanguage && matchesSearch;
  });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedWords = [...filteredWords].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];
    
    if (sortConfig.key === 'proficiencyLevel') {
      aValue = parseInt(aValue) || 0;
      bValue = parseInt(bValue) || 0;
    } else {
      aValue = (aValue || '').toString().toLowerCase();
      bValue = (bValue || '').toString().toLowerCase();
    }
    
    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Pagination
  const paginatedWords = rowsPerPage === -1 
    ? sortedWords 
    : sortedWords.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const getLanguageLabel = (language) => {
    const labels = {
      'english': 'English',
      'polish': 'Polish',
      'spanish': 'Spanish',
      'german': 'German'
    };
    return labels[language] || language;
  };

  const parseCsvLine = (line) => {
    const fields = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const c = line[i];

      if (c === '"') {
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          // Double quotes inside quoted field (escaped quote)
          currentField += '"';
          i++;
        } else {
          // Start/end of quoted field
          inQuotes = !inQuotes;
        }
      } else if (c === ',' && !inQuotes) {
        // End of field (only if not inside quotes)
        fields.push(currentField.trim());
        currentField = '';
      } else {
        currentField += c;
      }
    }

    // Add the last field
    fields.push(currentField.trim());
    return fields;
  };

  const exportToCSV = () => {
    const headers = ['Original Word', 'Translation', 'Language', 'Proficiency Level', 'Example Usage', 'Explanation'];
    const csvContent = [
      headers.join(','),
      ...sortedWords.map(word => [
        `"${word.originalWord}"`,
        `"${word.translation}"`,
        `"${getLanguageLabel(word.language)}"`,
        word.proficiencyLevel,
        `"${word.exampleUsage || ''}"`,
        `"${word.explanation || ''}"`
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'words.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const importFromCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      const words = lines.slice(1).filter(line => line.trim()).map(line => {
        const values = parseCsvLine(line);
        return {
          originalWord: values[0] || '',
          translation: values[1] || '',
          language: values[2]?.toLowerCase() || 'english',
          proficiencyLevel: parseInt(values[3]) || 1,
          exampleUsage: values[4] || '',
          explanation: values[5] || ''
        };
      });

      try {
        // Use bulk import endpoint instead of individual requests
        const response = await fetch(`${apiUrl}/api/words/bulk`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(words),
        });
        
        if (response.ok) {
          const result = await response.json();
          // Wyczyść cache po imporcie
          clearCache();
          fetchWords(); // Refresh the list
          alert(`Import completed successfully! ${result.importedCount} words imported.`);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to import words');
        }
      } catch (error) {
        console.error('Import error:', error);
        alert('Import failed: ' + error.message);
      }
    };
    reader.readAsText(file);
  };

  const renderMobileWordCard = (word) => {
    const isExpanded = expandedWords.has(word.id);
    
    return (
      <Card key={word.id} sx={{ mb: 2, cursor: 'pointer' }} onClick={() => handleToggleExpand(word.id)}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                {word.originalWord}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {word.translation}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Checkbox
                checked={selectedWords.includes(word.id)}
                onChange={(e) => {
                  e.stopPropagation();
                  handleSelectWord(word.id);
                }}
                size="small"
                aria-label={`Select ${word.originalWord} for bulk operations`}
              />
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </Box>
          </Box>
          
          <Collapse in={isExpanded}>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>

                              <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Proficiency Level
                  </Typography>
                  <Rating 
                    value={word.proficiencyLevel} 
                    max={5} 
                    readOnly 
                    size="small"
                    aria-label={`Proficiency level: ${word.proficiencyLevel} out of 5`}
                  />
                </Grid>
              {word.exampleUsage && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Example Usage
                  </Typography>
                  <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                    {word.exampleUsage}
                  </Typography>
                </Grid>
              )}
              {word.explanation && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Explanation
                  </Typography>
                  <Typography variant="body2">
                    {word.explanation}
                  </Typography>
                </Grid>
              )}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <IconButton
                    component={Link}
                    to={`/edit/${word.id}`}
                    color="primary"
                    size="small"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Edit word"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(word.id);
                    }}
                    color="error"
                    size="small"
                    aria-label="Delete word"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Grid>
            </Grid>
          </Collapse>
        </CardContent>
      </Card>
    );
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4">
          Word List
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={exportToCSV}
            disabled={sortedWords.length === 0}
          >
            Export CSV
          </Button>
          <Button
            variant="outlined"
            component="label"
            startIcon={<UploadIcon />}
          >
            Import CSV
            <input
              type="file"
              accept=".csv"
              onChange={importFromCSV}
              style={{ display: 'none' }}
            />
          </Button>
          {selectedWords.length > 0 && (
            <Tooltip title={`Delete ${selectedWords.length} selected words`}>
              <Button
                variant="contained"
                color="error"
                onClick={handleBulkDelete}
              >
                Delete Selected ({selectedWords.length})
              </Button>
            </Tooltip>
          )}
          <Button
            component={Link}
            to="/add"
            variant="contained"
            color="primary"
          >
            Add New Word
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Search words"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            size="small"
            sx={{ minWidth: 200 }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="wordlist-language-label">Language</InputLabel>
            <Select
              name="language"
              value={filters.language}
              onChange={handleFilterChange}
              label="Language"
              labelId="wordlist-language-label"
              aria-label="Filter words by language"
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
          Showing {sortedWords.length} of {words.length} words
          {selectedWords.length > 0 && ` • ${selectedWords.length} selected`}
        </Typography>
      </Paper>

      {sortedWords.length === 0 ? (
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
      ) : isMobile ? (
        // Mobile view - cards layout
        <Box>
          {paginatedWords.map(renderMobileWordCard)}
          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100, { label: 'All', value: -1 }]}
            component="div"
            count={sortedWords.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Words per page:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`}
          />
        </Box>
      ) : (
        // Desktop view - table layout
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedWords.length > 0 && selectedWords.length < paginatedWords.length}
                    checked={paginatedWords.length > 0 && selectedWords.length === paginatedWords.length}
                    onChange={handleSelectAll}
                    aria-label="Select all words on current page"
                  />
                </TableCell>
                <TableCell 
                  onClick={() => handleSort('originalWord')}
                  sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}
                >
                  Original Word {sortConfig.key === 'originalWord' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </TableCell>
                <TableCell 
                  onClick={() => handleSort('translation')}
                  sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}
                >
                  Translation {sortConfig.key === 'translation' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </TableCell>

                <TableCell 
                  onClick={() => handleSort('proficiencyLevel')}
                  sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}
                >
                  Proficiency {sortConfig.key === 'proficiencyLevel' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </TableCell>
                <TableCell>Example Usage</TableCell>
                <TableCell>Explanation</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedWords.map((word) => (
                <TableRow key={word.id}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedWords.includes(word.id)}
                      onChange={() => handleSelectWord(word.id)}
                      aria-label={`Select ${word.originalWord} for bulk operations`}
                    />
                  </TableCell>
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
                    <Rating 
                      value={word.proficiencyLevel} 
                      max={5} 
                      readOnly 
                      size="small"
                      aria-label={`Proficiency level: ${word.proficiencyLevel} out of 5`}
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
                  <TableCell>
                    {word.explanation ? (
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {word.explanation}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No explanation
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      component={Link}
                      to={`/edit/${word.id}`}
                      color="primary"
                      size="small"
                      aria-label="Edit word"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(word.id)}
                      color="error"
                      size="small"
                      aria-label="Delete word"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100, { label: 'All', value: -1 }]}
            component="div"
            count={sortedWords.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Words per page:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`}
          />
        </TableContainer>
      )}
    </Container>
  );
};

export default WordList; 