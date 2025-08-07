import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container, CssBaseline, Alert, Box, Typography } from '@mui/material';
import WordList from './components/WordList.jsx';
import WordLearning from './components/WordLearning.jsx';
import GrammarPractice from './components/GrammarPractice.jsx';
import AddWord from './components/AddWord.jsx';
import EditWord from './components/EditWord.jsx';
import Navigation from './components/Navigation.jsx';
import Practice from './components/Practice';

class ErrorBoundary extends React.Component {
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
          <Routes>
            <Route path="/words" element={<WordList />} />
            <Route path="/learn" element={<WordLearning />} />
            <Route path="/grammar" element={<GrammarPractice />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/add" element={<AddWord />} />
            <Route path="/edit/:id" element={<EditWord />} />
            <Route path="/" element={<WordList />} />
          </Routes>
        </Container>
      </Router>
    </ErrorBoundary>
  );
}

export default App; 