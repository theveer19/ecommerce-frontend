import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";
import {
  Box, Container, Typography, TextField, Button,
  Alert, IconButton, InputAdornment, Divider
} from "@mui/material";
import { 
  Visibility, VisibilityOff, ArrowLeft,
  Google as GoogleIcon, GitHub as GitHubIcon 
} from "@mui/icons-material";
import { Mail, Lock, User } from "lucide-react";

export default function Auth({ onLogin }) {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        setSuccess("Logged in successfully! Redirecting...");
        
        if (onLogin) {
          onLogin(data.session);
        }
        
        // Redirect after delay
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name }
          }
        });

        if (error) throw error;
        
        setSuccess("Account created! Please check your email to confirm.");
        setEmail("");
        setPassword("");
        setName("");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`,
        },
      });
      
      if (error) throw error;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setLoading(true);
    setError("");
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}`,
        },
      });
      
      if (error) throw error;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <Box sx={styles.root}>
      <Container maxWidth="lg" sx={styles.container}>
        {/* Back Button */}
        <Button
          startIcon={<ArrowLeft />}
          onClick={() => navigate("/")}
          sx={styles.backButton}
        >
          BACK TO HOME
        </Button>

        <Box sx={styles.card}>
          {/* Logo Header */}
          <Box sx={styles.header}>
            <Typography variant="h1" sx={styles.logo}>
              ONE-T
            </Typography>
            <Typography variant="h6" sx={styles.subtitle}>
              {isLogin ? 'WELCOME BACK' : 'JOIN THE MOVEMENT'}
            </Typography>
          </Box>

          {/* Toggle */}
          <Box sx={styles.toggleContainer}>
            <Button
              fullWidth
              variant={isLogin ? "contained" : "outlined"}
              onClick={() => setIsLogin(true)}
              sx={styles.toggleButton}
              disabled={loading}
            >
              LOGIN
            </Button>
            <Button
              fullWidth
              variant={!isLogin ? "contained" : "outlined"}
              onClick={() => setIsLogin(false)}
              sx={styles.toggleButton}
              disabled={loading}
            >
              SIGN UP
            </Button>
          </Box>

          {/* Messages */}
          {error && (
            <Alert severity="error" sx={styles.alert}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={styles.alert}>
              {success}
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} sx={styles.form}>
            {!isLogin && (
              <TextField
                fullWidth
                label="FULL NAME"
                value={name}
                onChange={(e) => setName(e.target.value)}
                margin="normal"
                required={!isLogin}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <User size={18} />
                    </InputAdornment>
                  ),
                }}
                sx={styles.textField}
              />
            )}

            <TextField
              fullWidth
              type="email"
              label="EMAIL"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Mail size={18} />
                  </InputAdornment>
                ),
              }}
              sx={styles.textField}
            />

            <TextField
              fullWidth
              type={showPassword ? "text" : "password"}
              label="PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock size={18} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: 'black' }}
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={styles.textField}
            />

            {/* Forgot Password */}
            {isLogin && (
              <Box sx={styles.forgotPassword}>
                <Button
                  component={Link}
                  to="/forgot-password"
                  sx={styles.forgotButton}
                  disabled={loading}
                >
                  FORGOT PASSWORD?
                </Button>
              </Box>
            )}

            {/* Submit Button */}
            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading}
              sx={styles.submitButton}
            >
              {loading ? 'PROCESSING...' : (isLogin ? 'LOGIN' : 'CREATE ACCOUNT')}
            </Button>

            {/* Divider */}
            <Box sx={styles.divider}>
              <Divider sx={{ flex: 1 }} />
              <Typography variant="body2" sx={styles.dividerText}>
                OR CONTINUE WITH
              </Typography>
              <Divider sx={{ flex: 1 }} />
            </Box>

            {/* Social Login */}
            <Box sx={styles.socialButtons}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleGoogleLogin}
                disabled={loading}
                startIcon={<GoogleIcon />}
                sx={styles.socialButton}
              >
                GOOGLE
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleGithubLogin}
                disabled={loading}
                startIcon={<GitHubIcon />}
                sx={styles.socialButton}
              >
                GITHUB
              </Button>
            </Box>

            {/* Terms */}
            {!isLogin && (
              <Typography variant="body2" sx={styles.terms}>
                By creating an account, you agree to our{' '}
                <Link to="/terms" style={styles.link}>
                  TERMS
                </Link>{' '}
                and{' '}
                <Link to="/privacy" style={styles.link}>
                  PRIVACY POLICY
                </Link>
              </Typography>
            )}
          </Box>

          {/* Switch Mode */}
          <Box sx={styles.switchMode}>
            <Typography variant="body2" sx={styles.switchText}>
              {isLogin ? "DON'T HAVE AN ACCOUNT? " : "ALREADY HAVE AN ACCOUNT? "}
              <Button
                onClick={() => setIsLogin(!isLogin)}
                sx={styles.switchButton}
                disabled={loading}
              >
                {isLogin ? 'SIGN UP' : 'LOGIN'}
              </Button>
            </Typography>
          </Box>

          {/* Guest Option */}
          <Box sx={styles.guestContainer}>
            <Button
              component={Link}
              to="/products"
              sx={styles.guestButton}
              disabled={loading}
            >
              CONTINUE AS GUEST
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

const styles = {
  root: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    bgcolor: 'white',
    py: 8,
  },
  container: {
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: -60,
    left: 0,
    color: 'black',
    fontWeight: 700,
    fontSize: '12px',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    '&:hover': {
      bgcolor: 'transparent',
      textDecoration: 'underline',
    }
  },
  card: {
    maxWidth: '500px',
    margin: '0 auto',
    border: '1px solid #eee',
    p: { xs: 4, md: 6 },
    bgcolor: 'white',
  },
  header: {
    textAlign: 'center',
    mb: 4,
  },
  logo: {
    fontWeight: 900,
    fontSize: { xs: '40px', md: '56px' },
    letterSpacing: '-1px',
    mb: 1,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontWeight: 700,
    letterSpacing: '1px',
    color: '#666',
    textTransform: 'uppercase',
  },
  toggleContainer: {
    display: 'flex',
    mb: 4,
    borderBottom: '1px solid #eee',
  },
  toggleButton: {
    borderRadius: 0,
    borderColor: '#000',
    color: '#000',
    fontWeight: 700,
    fontSize: '12px',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    py: 2,
    '&.MuiButton-contained': {
      bgcolor: 'black',
      color: 'white',
    },
    '&.MuiButton-outlined': {
      borderBottom: 'none',
      '&:hover': {
        bgcolor: 'rgba(0,0,0,0.05)',
      }
    }
  },
  alert: {
    borderRadius: 0,
    mb: 3,
    fontWeight: 600,
  },
  form: {
    mt: 3,
  },
  textField: {
    '& .MuiOutlinedInput-root': {
      borderRadius: 0,
      '&:hover fieldset': {
        borderColor: '#000',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#000',
        borderWidth: '1px',
      },
    },
    '& .MuiInputLabel-root': {
      textTransform: 'uppercase',
      fontSize: '11px',
      fontWeight: 700,
      letterSpacing: '1px',
      color: '#666',
      '&.Mui-focused': {
        color: '#000',
      },
    },
  },
  forgotPassword: {
    textAlign: 'right',
    mt: 1,
    mb: 2,
  },
  forgotButton: {
    fontSize: '11px',
    color: '#666',
    fontWeight: 700,
    letterSpacing: '1px',
    textTransform: 'uppercase',
    '&:hover': {
      color: '#000',
      bgcolor: 'transparent',
    }
  },
  submitButton: {
    mt: 3,
    py: 1.5,
    borderRadius: 0,
    bgcolor: 'black',
    color: 'white',
    fontWeight: 700,
    letterSpacing: '1px',
    textTransform: 'uppercase',
    fontSize: '12px',
    '&:hover': {
      bgcolor: '#333',
    },
    '&:disabled': {
      bgcolor: '#666',
    }
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    my: 4,
    gap: 2,
  },
  dividerText: {
    color: '#999',
    fontWeight: 700,
    fontSize: '11px',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },
  socialButtons: {
    display: 'flex',
    gap: 2,
    mb: 4,
  },
  socialButton: {
    borderRadius: 0,
    borderColor: '#eee',
    color: '#000',
    fontWeight: 700,
    fontSize: '11px',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    py: 1.5,
    '&:hover': {
      borderColor: '#000',
      bgcolor: 'transparent',
    }
  },
  terms: {
    textAlign: 'center',
    color: '#666',
    fontSize: '12px',
    mt: 3,
  },
  link: {
    color: '#000',
    fontWeight: 700,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    }
  },
  switchMode: {
    textAlign: 'center',
    mt: 4,
    pt: 4,
    borderTop: '1px solid #eee',
  },
  switchText: {
    color: '#666',
    fontSize: '13px',
  },
  switchButton: {
    color: '#000',
    fontWeight: 700,
    fontSize: '13px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    p: 0,
    minWidth: 'auto',
    '&:hover': {
      bgcolor: 'transparent',
      textDecoration: 'underline',
    }
  },
  guestContainer: {
    textAlign: 'center',
    mt: 3,
  },
  guestButton: {
    color: '#666',
    fontWeight: 700,
    fontSize: '12px',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    textDecoration: 'underline',
    '&:hover': {
      color: '#000',
      bgcolor: 'transparent',
    }
  },
};