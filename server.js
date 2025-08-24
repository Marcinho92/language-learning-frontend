const express = require('express');
const path = require('path');
const app = express();

// Railway przydziela port dynamicznie
const PORT = process.env.PORT || 3000;

// Middleware do logowania requestów
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Healthcheck endpoint dla Railway
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Serwuj statyczne pliki z dist
app.use(express.static(path.join(__dirname, 'dist')));

// Dla React Router - przekieruj wszystko na index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// KRYTYCZNE: Nasłuchuj na 0.0.0.0, nie localhost!
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Serving static files from: ${path.join(__dirname, 'dist')}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
});