import React from 'react';
import { Box, Typography } from '@mui/material';

export default function AnnouncementBar() {
  const msg1 = "EXTENSION OF YOUR EXPRESSION";
  const msg2 = "OneT";

  return (
    <Box sx={{
      backgroundColor: '#000000',
      color: '#ffffff',
      height: '35px',
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      zIndex: 2000,
      overflow: 'hidden', // Hides the sliding parts
      userSelect: 'none',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <style>
        {`
          @keyframes slideUp {
            0%, 45% { transform: translateY(0); }          /* SHOW MSG 1 */
            50%, 95% { transform: translateY(-35px); }     /* SHOW MSG 2 */
            100% { transform: translateY(-70px); }         /* SLIDE TO CLONE (RESET) */
          }
        `}
      </style>

      {/* Sliding Wrapper */}
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideUp 6s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite',
        textAlign: 'center'
      }}>
        
        {/* 1. First Message */}
        <Box sx={styles.messageBox}>
          <Typography sx={styles.text}>{msg1}</Typography>
        </Box>

        {/* 2. Second Message */}
        <Box sx={styles.messageBox}>
          <Typography sx={{ ...styles.text, color: '#ccc', letterSpacing: '3px' }}>{msg2}</Typography>
        </Box>

        {/* 3. Clone of First Message (For seamless loop) */}
        <Box sx={styles.messageBox}>
          <Typography sx={styles.text}>{msg1}</Typography>
        </Box>

      </Box>
    </Box>
  );
}

const styles = {
  messageBox: {
    height: '35px', // Must match container height exactly
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100vw'
  },
  text: {
    fontSize: { xs: '10px', md: '11px' },
    fontWeight: 800,
    letterSpacing: '2px',
    textTransform: 'uppercase',
    fontFamily: '"Inter", sans-serif'
  }
};