import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

function LoadingScreen() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        flexDirection: 'column',
        gap: 2,
        backgroundColor: '#FFFFFF', // Pure White (Matches new theme)
        zIndex: 9999,
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
      }}
    >
      {/* BRAND LOGO (Text based to match Navbar) */}
      <Typography 
        variant="h3" 
        sx={{ 
          fontWeight: 900, 
          letterSpacing: '5px', 
          color: '#000000',
          textTransform: 'uppercase',
          mb: 2,
          animation: 'pulse 2s infinite' // Subtle breathing effect
        }}
      >
        ONE-T
      </Typography>

      {/* Minimalist Spinner */}
      <CircularProgress 
        size={30} 
        thickness={4} 
        sx={{ 
          color: '#000000' // Black Spinner
        }} 
      />

      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}
      </style>
    </Box>
  );
}

export default LoadingScreen;