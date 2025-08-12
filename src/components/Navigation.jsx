import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box
} from '@mui/material';

const Navigation = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <AppBar position="static" sx={{ mb: 3 }}>
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1,
            display: { xs: 'none', sm: 'block' } // Hide on mobile, show on tablet+
          }}
        >
          Language Learning
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            component={Link}
            to="/add"
            color="inherit"
            variant={isActive('/add') ? 'contained' : 'text'}
          >
            Add Word
          </Button>
          <Button
            component={Link}
            to="/words"
            color="inherit"
            variant={isActive('/words') || isActive('/') ? 'contained' : 'text'}
          >
            Words
          </Button>
          <Button
            component={Link}
            to="/learn"
            color="inherit"
            variant={isActive('/learn') ? 'contained' : 'text'}
          >
            Learn Words
          </Button>
          <Button
            component={Link}
            to="/grammar"
            color="inherit"
            variant={isActive('/grammar') ? 'contained' : 'text'}
          >
            Grammar
          </Button>
          <Button
            component={Link}
            to="/practice"
            color="inherit"
            variant={isActive('/practice') ? 'contained' : 'text'}
          >
            Practice
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation; 