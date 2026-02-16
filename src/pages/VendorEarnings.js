import React, { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import {
  Box, Container, Typography, Grid, Paper, CircularProgress, 
  Button, Divider
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, DollarSign, TrendingUp, ShoppingBag, 
  Calendar, CreditCard 
} from "lucide-react";

export default function VendorEarnings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalItemsSold: 0,
    averageOrderValue: 0
  });

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    const { data: userData } = await supabase.auth.getUser();

    if (!userData?.user) {
      navigate("/login");
      return;
    }

    // 1. Get Vendor ID
    const { data: vendor } = await supabase
      .from("vendors")
      .select("id")
      .eq("user_id", userData.user.id)
      .single();

    if (!vendor) {
      setLoading(false);
      return;
    }

    // 2. Fetch Sales Data (from order_items)
    // We calculate earnings based on specific items sold by this vendor
    const { data } = await supabase
      .from("order_items")
      .select(`
        *,
        products!inner ( name, image_url, vendor_id ),
        orders ( created_at, status )
      `)
      .eq("products.vendor_id", vendor.id)
      .order("created_at", { ascending: false });

    if (data) {
      const totalEarnings = data.reduce((sum, item) => sum + (item.price_at_time * item.quantity), 0);
      const totalItemsSold = data.reduce((sum, item) => sum + item.quantity, 0);
      const averageOrderValue = data.length > 0 ? totalEarnings / data.length : 0;

      setStats({
        totalEarnings,
        totalItemsSold,
        averageOrderValue
      });
      setTransactions(data);
    }

    setLoading(false);
  };

  // --- STYLES ---
  const styles = {
    pageWrapper: {
      minHeight: '100vh',
      background: '#000',
      color: '#fff',
      paddingTop: '40px',
      paddingBottom: '80px',
      position: 'relative',
      overflow: 'hidden'
    },
    glow: {
      position: 'absolute',
      width: '600px',
      height: '600px',
      background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0) 70%)',
      borderRadius: '50%',
      zIndex: 0,
      pointerEvents: 'none'
    },
    glassCard: {
      background: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '24px',
      padding: '24px',
      height: '100%',
      transition: 'transform 0.3s ease',
      '&:hover': {
        transform: 'translateY(-5px)',
        borderColor: 'rgba(255, 255, 255, 0.3)'
      }
    },
    statValue: {
      fontSize: '2rem',
      fontWeight: 900,
      marginTop: '8px'
    },
    statLabel: {
      color: '#888',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      fontSize: '0.75rem',
      fontWeight: 700
    },
    imgThumbnail: {
      width: '50px',
      height: '50px',
      objectFit: 'cover',
      borderRadius: '8px',
      backgroundColor: '#222'
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", background: "#000", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress sx={{ color: "white" }} />
      </Box>
    );
  }

  return (
    <Box sx={styles.pageWrapper}>
      <Box sx={{ ...styles.glow, top: '-20%', right: '-10%' }} />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        
        <Button 
          startIcon={<ArrowLeft size={16} />} 
          onClick={() => navigate('/vendor/dashboard')}
          sx={{ color: '#888', mb: 3, '&:hover': { color: '#fff' } }}
        >
          DASHBOARD
        </Button>

        <Typography variant="h3" sx={{ fontWeight: 900, textTransform: 'uppercase', mb: 4 }}>
          Earnings Report
        </Typography>

        {/* STATS CARDS */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} md={4}>
            <Paper sx={styles.glassCard}>
              <DollarSign size={24} color="#fff" style={{ marginBottom: '10px' }} />
              <Typography sx={styles.statLabel}>Total Revenue</Typography>
              <Typography sx={styles.statValue}>₹{stats.totalEarnings.toLocaleString()}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={styles.glassCard}>
              <ShoppingBag size={24} color="#fff" style={{ marginBottom: '10px' }} />
              <Typography sx={styles.statLabel}>Items Sold</Typography>
              <Typography sx={styles.statValue}>{stats.totalItemsSold}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={styles.glassCard}>
              <TrendingUp size={24} color="#fff" style={{ marginBottom: '10px' }} />
              <Typography sx={styles.statLabel}>Avg. Order Value</Typography>
              <Typography sx={styles.statValue}>₹{Math.round(stats.averageOrderValue).toLocaleString()}</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* RECENT TRANSACTIONS */}
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>Recent Transactions</Typography>
        
        <Paper sx={{ ...styles.glassCard, padding: 0 }}>
          {transactions.map((item, index) => (
            <React.Fragment key={item.id}>
              <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                
                {/* Product Info */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: '200px' }}>
                  <img src={item.products?.image_url} alt="" style={styles.imgThumbnail} />
                  <Box>
                    <Typography fontWeight={700}>{item.products?.name}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Calendar size={12} color="#666" />
                      <Typography variant="caption" sx={{ color: '#888' }}>
                        {new Date(item.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Amount */}
                <Box sx={{ textAlign: 'right' }}>
                  <Typography fontWeight={800} fontSize="1.1rem" sx={{ color: '#4caf50' }}>
                    +₹{item.price_at_time * item.quantity}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end', mt: 0.5 }}>
                    <CreditCard size={12} color="#666" />
                    <Typography variant="caption" sx={{ color: '#666', textTransform: 'uppercase' }}>
                      {item.orders?.status || 'Paid'}
                    </Typography>
                  </Box>
                </Box>

              </Box>
              {index < transactions.length - 1 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />}
            </React.Fragment>
          ))}

          {transactions.length === 0 && (
            <Box sx={{ p: 4, textAlign: 'center', color: '#666' }}>
              No earnings to display yet.
            </Box>
          )}
        </Paper>

      </Container>
    </Box>
  );
}