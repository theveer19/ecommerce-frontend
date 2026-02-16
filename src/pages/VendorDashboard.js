import React, { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import { 
  Box, Container, Typography, Grid, Paper, Button, 
  CircularProgress, Chip, Alert
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { 
  Store, Plus, Package, TrendingUp, LogOut, ArrowRight, Lock 
} from "lucide-react";

export default function VendorDashboard() {
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendor();
  }, []);

  const fetchVendor = async () => {
    const { data: userData } = await supabase.auth.getUser();

    if (!userData?.user) {
      navigate("/login");
      return;
    }

    const { data, error } = await supabase
      .from("vendors")
      .select("*")
      .eq("user_id", userData.user.id)
      .single();

    if (!error) {
      setVendor(data);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const styles = {
    pageWrapper: {
      minHeight: '100vh',
      background: '#000',
      color: '#fff',
      paddingTop: '80px',
      paddingBottom: '80px',
      position: 'relative',
      overflow: 'hidden'
    },
    glassPanel: {
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '24px',
      padding: '30px',
      position: 'relative',
      zIndex: 1
    },
    actionCard: {
      height: '100%',
      background: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '20px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      '&:hover': {
        background: 'rgba(255, 255, 255, 0.1)',
        transform: 'translateY(-5px)',
        borderColor: '#fff'
      }
    },
    iconBox: {
      width: 50, height: 50, borderRadius: '12px', background: '#fff', color: '#000',
      display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px'
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", background: "#000", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress sx={{ color: "white" }} />
      </Box>
    );
  }

  // 🔴 BLOCK ACCESS IF NOT APPROVED
  if (vendor && !vendor.is_approved) {
    return (
      <Box sx={styles.pageWrapper}>
        <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 10 }}>
          <Lock size={64} color="#666" style={{ marginBottom: '20px' }} />
          <Typography variant="h4" fontWeight={900} sx={{ mb: 2 }}>ACCOUNT PENDING</Typography>
          <Typography sx={{ color: '#888', mb: 4 }}>
            Your vendor account is currently under review. <br />
            You will be able to access your dashboard once an admin approves your request.
          </Typography>
          <Button variant="outlined" onClick={handleLogout} sx={{ color: '#fff', borderColor: '#fff' }}>
            Logout
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={styles.pageWrapper}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 6 }}>
          <Box>
            <Typography sx={{ color: '#888', fontSize: '0.9rem', letterSpacing: '2px', textTransform: 'uppercase', mb: 1 }}>
              Vendor Portal
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 900, color: '#fff', textTransform: 'uppercase' }}>
              Dashboard
            </Typography>
          </Box>
          <Button startIcon={<LogOut size={18} />} onClick={handleLogout} sx={{ color: '#fff', borderColor: '#333', '&:hover': { borderColor: '#fff' } }} variant="outlined">
            Logout
          </Button>
        </Box>

        <Paper sx={{ ...styles.glassPanel, mb: 6 }}>
          <Grid container alignItems="center" spacing={4}>
            <Grid item>
              <Box sx={{ width: 80, height: 80, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Store size={40} color="black" />
              </Box>
            </Grid>
            <Grid item xs>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>{vendor?.business_name}</Typography>
              <Typography sx={{ color: '#888', fontFamily: 'monospace' }}>{vendor?.email}</Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Chip label="APPROVED SELLER" sx={{ bgcolor: '#fff', color: '#000', fontWeight: 800, borderRadius: '4px' }} />
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, color: '#fff' }}>QUICK ACTIONS</Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <Box onClick={() => navigate("/vendor/add-product")} sx={styles.actionCard}>
              <Box>
                <Box sx={styles.iconBox}><Plus size={28} /></Box>
                <Typography variant="h5" fontWeight={800}>Add Product</Typography>
                <Typography variant="body2" sx={{ color: '#888', mt: 1 }}>Upload new inventory.</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}><ArrowRight color="white" /></Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Box onClick={() => navigate("/vendor/products")} sx={styles.actionCard}>
              <Box>
                <Box sx={styles.iconBox}><Package size={28} /></Box>
                <Typography variant="h5" fontWeight={800}>Inventory</Typography>
                <Typography variant="body2" sx={{ color: '#888', mt: 1 }}>Manage stock & prices.</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}><ArrowRight color="white" /></Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Box onClick={() => navigate("/vendor/orders")} sx={styles.actionCard}>
              <Box>
                <Box sx={styles.iconBox}><TrendingUp size={28} /></Box>
                <Typography variant="h5" fontWeight={800}>Orders</Typography>
                <Typography variant="body2" sx={{ color: '#888', mt: 1 }}>Track sales & shipments.</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}><ArrowRight color="white" /></Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}