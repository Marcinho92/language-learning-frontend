import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Alert,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Memory as MemoryIcon,
  Speed as SpeedIcon,
  Storage as StorageIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { 
  getCacheStats, 
  getCacheKeys, 
  clearCache, 
  resetCacheStats,
  clearCacheByPattern 
} from '../utils/apiCache';

const CacheMonitor = () => {
  const [stats, setStats] = useState(null);
  const [keys, setKeys] = useState({ api: [], static: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    refreshStats();
  }, []);

  const refreshStats = () => {
    setLoading(true);
    try {
      const currentStats = getCacheStats();
      const currentKeys = getCacheKeys();
      setStats(currentStats);
      setKeys(currentKeys);
      setError('');
    } catch (error) {
      console.error('Error refreshing cache stats:', error);
      setError('Failed to refresh cache statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleClearAllCache = () => {
    if (window.confirm('Are you sure you want to clear all cache? This will remove all cached data.')) {
      try {
        clearCache();
        resetCacheStats();
        refreshStats();
      } catch (error) {
        console.error('Error clearing cache:', error);
        setError('Failed to clear cache');
      }
    }
  };

  const handleClearPatternCache = (pattern) => {
    if (window.confirm(`Are you sure you want to clear cache for pattern: ${pattern}?`)) {
      try {
        clearCacheByPattern(pattern);
        refreshStats();
      } catch (error) {
        console.error('Error clearing pattern cache:', error);
        setError('Failed to clear pattern cache');
      }
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getHitRateColor = (rate) => {
    if (rate >= 0.8) return 'success';
    if (rate >= 0.6) return 'warning';
    return 'error';
  };

  if (!stats) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Typography>Loading cache statistics...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom align="center">
        Cache Monitor
      </Typography>
      <Typography variant="subtitle1" gutterBottom align="center" color="text.secondary">
        Frontend Cache Statistics & Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Control Panel */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Cache Management</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={refreshStats}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleClearAllCache}
              disabled={loading}
            >
              Clear All Cache
            </Button>
          </Box>
        </Box>
        <LinearProgress sx={{ display: loading ? 'block' : 'none' }} />
      </Paper>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <MemoryIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">{stats.size}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                API Cache Entries
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <StorageIcon color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h6">{stats.staticSize}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Static Cache Entries
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SpeedIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  {(stats.hitRate * 100).toFixed(1)}%
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Hit Rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TimelineIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">{stats.hits + stats.misses}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Total Requests
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Cache Performance
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Hit Rate</Typography>
                <Typography variant="body2">
                  {(stats.hitRate * 100).toFixed(1)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={stats.hitRate * 100}
                color={getHitRateColor(stats.hitRate)}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Cache Hits
                </Typography>
                <Typography variant="h6" color="success.main">
                  {stats.hits}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Cache Misses
                </Typography>
                <Typography variant="h6" color="error.main">
                  {stats.misses}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Cache Operations
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Cache Sets
                </Typography>
                <Typography variant="h6" color="info.main">
                  {stats.sets}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Cache Clears
                </Typography>
                <Typography variant="h6" color="warning.main">
                  {stats.clears}
                </Typography>
              </Grid>
            </Grid>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Memory Usage
            </Typography>
            <Typography variant="body2">
              API Cache: {stats.memoryUsage.api} entries
            </Typography>
            <Typography variant="body2">
              Static Cache: {stats.memoryUsage.static} entries
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Cache Keys */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              API Cache Keys ({keys.api.length})
            </Typography>
            {keys.api.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Cache Key</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {keys.api.slice(0, 10).map((key, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Typography variant="body2" sx={{ 
                            fontFamily: 'monospace', 
                            fontSize: '0.75rem',
                            wordBreak: 'break-all'
                          }}>
                            {key}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Clear this cache entry">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleClearPatternCache(key)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No API cache entries
              </Typography>
            )}
            {keys.api.length > 10 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Showing first 10 of {keys.api.length} entries
              </Typography>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Static Cache Keys ({keys.static.length})
            </Typography>
            {keys.static.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Cache Key</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {keys.static.slice(0, 10).map((key, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Typography variant="body2" sx={{ 
                            fontFamily: 'monospace', 
                            fontSize: '0.75rem',
                            wordBreak: 'break-all'
                          }}>
                            {key}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Clear this cache entry">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleClearPatternCache(key)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No static cache entries
              </Typography>
            )}
            {keys.static.length > 10 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Showing first 10 of {keys.static.length} entries
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            onClick={() => handleClearPatternCache('/api/words')}
            disabled={loading}
          >
            Clear Words Cache
          </Button>
          <Button
            variant="outlined"
            onClick={() => handleClearPatternCache('/api/practice')}
            disabled={loading}
          >
            Clear Practice Cache
          </Button>
          <Button
            variant="outlined"
            onClick={() => handleClearPatternCache('/api/words/random')}
            disabled={loading}
          >
            Clear Random Words Cache
          </Button>
          <Button
            variant="outlined"
            onClick={resetCacheStats}
            disabled={loading}
          >
            Reset Statistics
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default CacheMonitor;
