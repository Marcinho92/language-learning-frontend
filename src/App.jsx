import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container, CssBaseline } from '@mui/material';
import WordList from './components/WordList.jsx';
import WordLearning from './components/WordLearning.jsx';
import AddWord from './components/AddWord.jsx';
import Navigation from './components/Navigation.jsx';

function App() {
  return (
    <Router>
      <CssBaseline />
      <Container>
        <Navigation />
        <Routes>
          <Route path="/words" element={<WordList />} />
          <Route path="/learn" element={<WordLearning />} />
          <Route path="/add" element={<AddWord />} />
          <Route path="/" element={<WordList />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App; 