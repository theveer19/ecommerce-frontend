// src/components/GlobalStyles.js
import React from 'react';

const GlobalStyles = () => (
  <style>
    {`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @media (max-width: 968px) {
        .auth-container {
          grid-template-columns: 1fr !important;
        }
        
        .auth-brand-side {
          display: none !important;
        }
      }
      
      @media print {
        .no-print {
          display: none !important;
        }
      }
    `}
  </style>
);

export default GlobalStyles;