// src/components/ErrorBoundary.js
import React from 'react';
import { Alert, Button, Box, Typography } from '@mui/material';
import { AlertCircle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log to error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F5F1E8',
          padding: 3
        }}>
          <Box sx={{
            maxWidth: 500,
            textAlign: 'center',
            padding: 4,
            backgroundColor: 'white',
            borderRadius: 2,
            boxShadow: 3
          }}>
            <AlertCircle size={48} color="#F44336" style={{ marginBottom: 16 }} />
            <Typography variant="h5" gutterBottom color="error">
              Something went wrong
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              We apologize for the inconvenience. Please try refreshing the page.
            </Typography>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Alert severity="error" sx={{ mt: 2, textAlign: 'left' }}>
                {this.state.error.toString()}
              </Alert>
            )}
            <Button
              variant="contained"
              startIcon={<RefreshCw />}
              onClick={this.handleRetry}
              sx={{ mt: 3 }}
            >
              Reload Application
            </Button>
          </Box>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;