import React, { useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import { useNavigate } from "react-router-dom";
import { 
  Box, Container, Typography, TextField, Button, 
  CircularProgress, InputAdornment, Paper 
} from "@mui/material";
import { 
  Store, Mail, Phone, MapPin, FileText, Lock, 
  ArrowRight 
} from "lucide-react";

export default function VendorRegister() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    business_name: "",
    email: "",
    phone: "",
    address: "",
    gst_number: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const registerVendor = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            role: 'vendor',
            business_name: form.business_name,
            phone: form.phone,
            address: form.address,
            gst_number: form.gst_number
          }
        }
      });

      if (error) throw error;

      alert("Registration successful! Please check your email to confirm your account, then login to activate your dashboard.");
      navigate("/login");

    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- WHITE THEME STYLING ---
  const styles = {
    pageWrapper: {
      minHeight: '100vh',
      background: '#ffffff', // ✅ White Background
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      perspective: '1200px',
      paddingTop: '120px', // ✅ Added Padding for Navbar Clearance
      paddingBottom: '40px'
    },
    // Subtle Gray Orbs for White Theme Depth
    glow1: {
      position: 'absolute',
      top: '-10%',
      left: '-10%',
      width: '60vw',
      height: '60vw',
      background: 'radial-gradient(circle, rgba(0,0,0,0.03) 0%, rgba(255,255,255,0) 70%)',
      animation: 'float 15s ease-in-out infinite alternate',
      zIndex: 0
    },
    glow2: {
      position: 'absolute',
      bottom: '-10%',
      right: '-10%',
      width: '50vw',
      height: '50vw',
      background: 'radial-gradient(circle, rgba(0,0,0,0.02) 0%, rgba(255,255,255,0) 70%)',
      animation: 'float 12s ease-in-out infinite alternate-reverse',
      zIndex: 0
    },
    glassCard: {
      position: 'relative',
      zIndex: 10,
      background: 'rgba(255, 255, 255, 0.9)', // High opacity white
      backdropFilter: 'blur(40px)',
      border: '1px solid #eee',
      borderRadius: '0px',
      padding: { xs: '30px', md: '50px' },
      width: '100%',
      maxWidth: '550px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)', // Soft shadow
      transformStyle: 'preserve-3d',
      animation: 'cardEnter 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
    },
    headerIconBox: {
      width: 60, height: 60, 
      border: '2px solid #000', // Black Border
      borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: '20px',
      color: '#000'
    },
    title: {
      color: '#000', // Black Text
      fontWeight: 900,
      fontSize: '2rem',
      textAlign: 'center',
      marginBottom: '5px',
      textTransform: 'uppercase',
      letterSpacing: '2px',
      fontFamily: '"Inter", sans-serif'
    },
    subtitle: {
      color: '#666', // Grey Text
      textAlign: 'center',
      marginBottom: '40px',
      fontSize: '0.85rem',
      letterSpacing: '1px',
      textTransform: 'uppercase'
    },
    input: {
      marginBottom: '20px',
      '& .MuiOutlinedInput-root': {
        color: '#000', // Black Text Input
        borderRadius: '0px',
        backgroundColor: '#f9f9f9', // Light Gray Background
        transition: 'all 0.3s ease',
        '& fieldset': { borderColor: '#e0e0e0' },
        '&:hover fieldset': { borderColor: '#000' },
        '&.Mui-focused fieldset': { borderColor: '#000', borderWidth: '1px' },
        '& input': { paddingLeft: '10px' }
      },
      '& .MuiInputLabel-root': { color: '#888', fontSize: '0.8rem', letterSpacing: '1px', textTransform: 'uppercase' },
      '& .MuiInputLabel-root.Mui-focused': { color: '#000' }
    },
    submitBtn: {
      background: '#000', // Black Button
      color: '#fff',      // White Text
      fontWeight: 800,
      padding: '14px',
      borderRadius: '0px',
      textTransform: 'uppercase',
      letterSpacing: '2px',
      fontSize: '0.9rem',
      marginTop: '20px',
      border: '1px solid #000',
      transition: 'all 0.3s ease',
      '&:hover': {
        background: '#fff',
        color: '#000',
        boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
      }
    }
  };

  return (
    <Box sx={styles.pageWrapper}>
      <Box sx={styles.glow1} />
      <Box sx={styles.glow2} />
      
      <style>{`
        @keyframes float { 0% { transform: translate(0, 0); } 100% { transform: translate(40px, 40px); } }
        @keyframes cardEnter { from { opacity: 0; transform: translateY(60px) rotateX(5deg); } to { opacity: 1; transform: translateY(0) rotateX(0); } }
      `}</style>

      <Container maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center' }}>
        <Paper elevation={0} sx={styles.glassCard}>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={styles.headerIconBox}>
              <Store size={28} strokeWidth={1.5} />
            </Box>
            <Typography sx={styles.title}>Vendor Portal</Typography>
            <Typography sx={styles.subtitle}>Join the Exclusive Network</Typography>
          </Box>

          <form onSubmit={(e) => { e.preventDefault(); registerVendor(); }}>
            <TextField fullWidth name="business_name" label="Business Name" onChange={handleChange} sx={styles.input}
              InputProps={{ startAdornment: <InputAdornment position="start"><Store size={16} color="#000" /></InputAdornment> }} />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField fullWidth name="email" label="Email" onChange={handleChange} sx={styles.input}
                InputProps={{ startAdornment: <InputAdornment position="start"><Mail size={16} color="#000" /></InputAdornment> }} />
              <TextField fullWidth name="phone" label="Phone" onChange={handleChange} sx={styles.input}
                InputProps={{ startAdornment: <InputAdornment position="start"><Phone size={16} color="#000" /></InputAdornment> }} />
            </Box>

            <TextField fullWidth name="address" label="Business Address" onChange={handleChange} sx={styles.input}
              InputProps={{ startAdornment: <InputAdornment position="start"><MapPin size={16} color="#000" /></InputAdornment> }} />

            <TextField fullWidth name="gst_number" label="GST Number" onChange={handleChange} sx={styles.input}
              InputProps={{ startAdornment: <InputAdornment position="start"><FileText size={16} color="#000" /></InputAdornment> }} />

            <TextField fullWidth name="password" type="password" label="Password" onChange={handleChange} sx={styles.input}
              InputProps={{ startAdornment: <InputAdornment position="start"><Lock size={16} color="#000" /></InputAdornment> }} />

            <Button fullWidth type="submit" sx={styles.submitBtn} disabled={loading} endIcon={!loading && <ArrowRight size={18} />}>
              {loading ? <CircularProgress size={20} color="inherit" /> : "Initiate Registration"}
            </Button>
          </form>

          <Box sx={{ mt: 4, textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '20px' }}>
            <Typography variant="caption" sx={{ color: '#888', fontSize: '0.75rem', letterSpacing: '1px' }}>
              ALREADY REGISTERED? <span style={{ color: '#000', cursor: 'pointer', fontWeight: '800', marginLeft: '5px' }} onClick={() => navigate('/login')}>LOGIN</span>
            </Typography>
          </Box>

        </Paper>
      </Container>
    </Box>
  );
}