const express = require('express');
const path = require('path');
const app = express();

// Railway przydziela port dynamicznie
const PORT = process.env.PORT || 3000;

// Serwuj statyczne pliki z dist
app.use(express.static(path.join(__dirname, 'dist')));

// Dla React Router - przekieruj wszystko na index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// KRYTYCZNE: Nasłuchuj na 0.0.0.0, nie localhost!
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});