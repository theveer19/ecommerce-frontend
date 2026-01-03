import React from 'react';

export default function AnnouncementBar() {
  return (
    <div style={{
      backgroundColor: '#1a1a1a', // Soft black like the screenshot
      color: '#fff',
      textAlign: 'center',
      padding: '12px 0',
      fontSize: '10px',
      fontWeight: '700',
      letterSpacing: '2px',
      textTransform: 'uppercase',
      position: 'fixed',
      top: 0,
      width: '100%',
      zIndex: 2000 // Highest priority
    }}>
      EXTENSION OF YOUR EXPRESSION
    </div>
  );
}