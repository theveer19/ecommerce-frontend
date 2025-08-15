import React, { useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Tabs,
  Tab,
  Switch,
} from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import GoogleIcon from "@mui/icons-material/Google";
import { motion } from "framer-motion";
import confetti from "canvas-confetti"; // 🎉 install with `npm install canvas-confetti`

export default function Auth({ onLogin }) {
  const [tab, setTab] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [shake, setShake] = useState(false);

  // ✅ Login
  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setMessage("❌ Wrong credentials!");
      triggerShake();
    } else {
      setMessage("✅ Login successful!");
      onLogin(data.session);
      launchConfetti();
    }
  };

  // ✅ Signup
  const handleSignup = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setMessage(error.message);
      triggerShake();
    } else {
      setMessage("✅ Signup successful! Please verify your email.");
      launchConfetti();
    }
  };

  // ✅ OTP / Magic Link
  const handleMagicLink = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) setMessage(error.message);
    else setMessage("✅ Magic link sent! Check your email.");
  };

  // 🎉 Confetti
  const launchConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
    });
  };

  // 🔥 Shake animation trigger
  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: darkMode
          ? "linear-gradient(270deg, #1f2937, #111827, #374151)"
          : "linear-gradient(270deg, #6EE7B7, #3B82F6, #9333EA)",
        backgroundSize: "600% 600%",
        animation: "gradientShift 10s ease infinite",
        position: "relative",
      }}
    >
      {/* 🌗 Dark Mode Toggle */}
      <Box sx={{ position: "absolute", top: 20, right: 20 }}>
        <Typography variant="body2" sx={{ color: darkMode ? "white" : "black" }}>
          🌙 Dark Mode
        </Typography>
        <Switch
          checked={darkMode}
          onChange={() => setDarkMode(!darkMode)}
          color="default"
        />
      </Box>

      {/* ✅ Floating Card */}
      <Paper
        elevation={10}
        component={motion.div}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{
          opacity: 1,
          scale: 1,
          x: shake ? [0, -10, 10, -10, 10, 0] : 0, // 🔥 Shake on wrong password
        }}
        transition={{ duration: 0.5 }}
        sx={{
          padding: "2rem",
          width: "400px",
          textAlign: "center",
          borderRadius: "15px",
          backdropFilter: "blur(10px)",
          color: darkMode ? "#fff" : "#000",
          backgroundColor: darkMode ? "rgba(30,41,59,0.8)" : "rgba(255,255,255,0.9)",
        }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {tab === 0 ? "Login" : "Sign Up"}
        </Typography>

        {/* ✅ Tabs */}
        <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} centered>
          <Tab label="Login" />
          <Tab label="Sign Up" />
        </Tabs>

        {/* ✅ Email Input */}
        <TextField
          label="Email"
          type="email"
          fullWidth
          variant="outlined"
          sx={{ my: 2 }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* ✅ Password Input */}
        {(tab === 0 || tab === 1) && (
          <TextField
            label="Password"
            type="password"
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}

        {/* ✅ Buttons */}
        {tab === 0 ? (
          <>
            <Button variant="contained" fullWidth onClick={handleLogin}>
              Login
            </Button>
            <Button
              variant="outlined"
              fullWidth
              sx={{ mt: 1 }}
              onClick={handleMagicLink}
            >
              📩 Send Magic Link
            </Button>
          </>
        ) : (
          <Button variant="contained" fullWidth onClick={handleSignup}>
            Sign Up
          </Button>
        )}

        {/* ✅ Social Logins */}
        <Typography variant="body2" sx={{ mt: 2 }}>
          Or continue with:
        </Typography>
        <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
          <Button
  variant="outlined"
  startIcon={<GoogleIcon />}
  fullWidth
  onClick={() =>
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin, // Optional: ensure return to your site
      },
    })
  }
>
  Google
</Button>

<Button
  variant="outlined"
  startIcon={<GitHubIcon />}
  fullWidth
  onClick={() =>
    supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: window.location.origin,
      },
    })
  }
>
  GitHub
</Button>

        </Box>

        {/* ✅ Message */}
        {message && (
          <Typography sx={{ mt: 2, color: message.includes("✅") ? "lime" : "red" }}>
            {message}
          </Typography>
        )}
      </Paper>

      {/* ✅ Gradient Animation CSS */}
      <style>
        {`
          @keyframes gradientShift {
            0% {background-position: 0% 50%;}
            50% {background-position: 100% 50%;}
            100% {background-position: 0% 50%;}
          }
        `}
      </style>
    </Box>
  );
}
