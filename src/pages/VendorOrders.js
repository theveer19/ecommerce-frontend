import React, { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import {
  Box, Container, Typography, Grid, Paper, Chip, 
  CircularProgress, Button, Divider
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { 
  Package, Calendar, User, MapPin, ArrowLeft, 
  Clock, CheckCircle, Truck, XCircle
} from "lucide-react";

export default function VendorOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendorOrders();
  }, []);

  const fetchVendorOrders = async () => {
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

    // 2. Fetch Order Items belonging to this Vendor
    // We fetch 'order_items' because a single Order might contain items from multiple vendors.
    // This ensures the vendor ONLY sees the items they sold.
    const { data, error } = await supabase
      .from("order_items")
      .select(`
        *,
        products!inner ( name, image_url, price, vendor_id ),
        orders ( id, status, created_at, shipping_address, order_number )
      `)
      .eq("products.vendor_id", vendor.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
    } else {
      setOrders(data || []);
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
      borderRadius: '20px',
      padding: '24px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)',
        borderColor: 'rgba(255, 255, 255, 0.3)'
      }
    },
    imgThumbnail: {
      width: '80px',
      height: '80px',
      objectFit: 'cover',
      borderRadius: '12px',
      border: '1px solid rgba(255,255,255,0.1)'
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return { bg: '#fff', color: '#000', icon: <CheckCircle size={14} /> };
      case 'shipped': return { bg: '#333', color: '#fff', icon: <Truck size={14} /> };
      case 'cancelled': return { bg: '#300', color: '#ff4444', icon: <XCircle size={14} /> };
      default: return { bg: 'rgba(255,255,255,0.1)', color: '#ccc', icon: <Clock size={14} /> };
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
      <Box sx={{ ...styles.glow, top: '-20%', left: '-10%' }} />
      
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        
        <Button 
          startIcon={<ArrowLeft size={16} />} 
          onClick={() => navigate('/vendor/dashboard')}
          sx={{ color: '#888', mb: 3, '&:hover': { color: '#fff' } }}
        >
          DASHBOARD
        </Button>

        <Typography variant="h3" sx={{ fontWeight: 900, textTransform: 'uppercase', mb: 1 }}>
          Vendor Orders
        </Typography>
        <Typography variant="body1" sx={{ color: '#666', mb: 6 }}>
          Track and manage orders for your products.
        </Typography>

        {orders.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10, border: '1px dashed #333', borderRadius: '20px' }}>
            <Package size={64} color="#333" />
            <Typography sx={{ color: '#666', mt: 2 }}>No orders received yet.</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {orders.map((item) => {
              const statusStyle = getStatusColor(item.orders?.status);
              return (
                <Grid item xs={12} md={6} key={item.id}>
                  <Paper sx={styles.glassCard}>
                    
                    {/* Header: Order ID & Date */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Chip 
                        icon={statusStyle.icon} 
                        label={item.orders?.status?.toUpperCase() || "PENDING"} 
                        sx={{ 
                          bgcolor: statusStyle.bg, 
                          color: statusStyle.color, 
                          fontWeight: 800, 
                          height: '24px',
                          '& .MuiChip-icon': { color: statusStyle.color }
                        }} 
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#666' }}>
                        <Calendar size={14} />
                        <Typography variant="caption" fontWeight={600}>
                          {new Date(item.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Product Details */}
                    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                      <img 
                        src={item.products?.image_url} 
                        alt={item.products?.name} 
                        style={styles.imgThumbnail} 
                      />
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700}>
                          {item.products?.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#888' }}>
                          Qty: <span style={{ color: '#fff' }}>{item.quantity}</span> &times; ₹{item.price_at_time}
                        </Typography>
                        <Typography variant="h6" fontWeight={800} sx={{ mt: 0.5 }}>
                          Total: ₹{item.quantity * item.price_at_time}
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 2 }} />

                    {/* Customer / Shipping Info */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <User size={16} color="#666" />
                        <Typography variant="caption" sx={{ color: '#ccc', fontSize: '0.85rem' }}>
                          {item.orders?.shipping_address?.name || "Customer"}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                        <MapPin size={16} color="#666" style={{ marginTop: '2px' }} />
                        <Typography variant="caption" sx={{ color: '#888', fontSize: '0.8rem', lineHeight: 1.4 }}>
                          {item.orders?.shipping_address?.address || "Address Hidden"}
                        </Typography>
                      </Box>
                    </Box>

                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>
    </Box>
  );
}