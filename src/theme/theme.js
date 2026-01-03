// // src/theme/theme.js
// export const theme = {
//   colors: {
//     primary: '#FF69B4', // Hot pink
//     primaryLight: '#FFB6C1', // Light pink
//     primaryDark: '#DB7093', // Pale violet red
//     secondary: '#9370DB', // Medium purple
//     secondaryLight: '#D8BFD8', // Thistle
//     accent: '#FFD700', // Gold
//     background: '#FFF5F7', // Light pink background
//     cardBg: '#FFFFFF', // White cards
//     text: '#4A4A4A', // Dark gray text
//     textLight: '#777777',
//     textInverse: '#FFFFFF',
//     success: '#22C55E',
//     warning: '#F59E0B',
//     error: '#EF4444',
//     border: '#FFE4E9',
//     shadow: 'rgba(255, 105, 180, 0.1)'
//   },
//   gradients: {
//     primary: 'linear-gradient(135deg, #FF69B4 0%, #9370DB 100%)',
//     secondary: 'linear-gradient(135deg, #FFB6C1 0%, #D8BFD8 100%)',
//     accent: 'linear-gradient(135deg, #FFD700 0%, #FF69B4 100%)',
//     card: 'linear-gradient(180deg, #FFFFFF 0%, #FFF5F7 100%)'
//   },
//   shadows: {
//     small: '0 4px 12px rgba(255, 105, 180, 0.1)',
//     medium: '0 8px 24px rgba(255, 105, 180, 0.15)',
//     large: '0 16px 48px rgba(255, 105, 180, 0.2)'
//   },
//   animations: {
//     fadeIn: 'fadeIn 0.5s ease-in-out',
//     slideUp: 'slideUp 0.5s ease-out',
//     scale: 'scale 0.3s ease-in-out',
//     shimmer: 'shimmer 2s infinite linear'
//   }
// };

// // Add to your global CSS or styled components
// export const globalStyles = `
//   @keyframes fadeIn {
//     from { opacity: 0; }
//     to { opacity: 1; }
//   }
  
//   @keyframes slideUp {
//     from { transform: translateY(20px); opacity: 0; }
//     to { transform: translateY(0); opacity: 1; }
//   }
  
//   @keyframes scale {
//     from { transform: scale(0.95); }
//     to { transform: scale(1); }
//   }
  
//   @keyframes shimmer {
//     0% { background-position: -1000px 0; }
//     100% { background-position: 1000px 0; }
//   }
  
//   @keyframes float {
//     0%, 100% { transform: translateY(0); }
//     50% { transform: translateY(-10px); }
//   }
  
//   @keyframes pulse {
//     0%, 100% { opacity: 1; }
//     50% { opacity: 0.5; }
//   }
// `;