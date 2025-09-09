import React, { Suspense, lazy, Component } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container, CssBaseline, Alert, Box, Typography, CircularProgress } from '@mui/material';
import Navigation from './components/Navigation.jsx';

// Lazy loading komponentów
const WordList = lazy(() => import('./components/WordList.jsx'));
const WordLearning = lazy(() => import('./components/WordLearning.jsx'));
const GrammarPractice = lazy(() => import('./components/GrammarPractice.jsx'));
const AddWord = lazy(() => import('./components/AddWord.jsx'));
const EditWord = lazy(() => import('./components/EditWord.jsx'));
const Practice = lazy(() => import('./components/Practice'));

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container>
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              Something went wrong. Please refresh the page.
            </Alert>
            <Typography variant="body2" color="text.secondary">
              Error: {this.state.error?.message}
            </Typography>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <CssBaseline />
        <Container>
          <Navigation />
          <Suspense fallback={
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
              <CircularProgress />
            </Box>
          }>
            <Routes>
              <Route path="/words" element={<WordList />} />
              <Route path="/learn" element={<WordLearning />} />
              <Route path="/grammar" element={<GrammarPractice />} />
              <Route path="/practice" element={<Practice />} />
              <Route path="/add" element={<AddWord />} />
              <Route path="/edit/:id" element={<EditWord />} />
              <Route path="/" element={<WordList />} />
            </Routes>
          </Suspense>
        </Container>
      </Router>
    </ErrorBoundary>
  );
}

export default App; 