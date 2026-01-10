import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";
import { 
  Box, Container, Grid, Typography, Button, Divider, 
  CircularProgress, IconButton, Snackbar, Alert, Paper, Chip 
} from "@mui/material";
import { 
  ArrowLeft, Printer, Share2, Package, Check, 
  MapPin, CreditCard, ShoppingBag, Receipt, Clock, Loader, Truck, XCircle
} from "lucide-react";

export default function UserOrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ open: false, message: "" });

  const fetchUserOrder = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/login'); return; }

      // ✅ FIX: Simplified Query to prevent "relation not found" errors
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            *,
            products (*) 
          )
        `)
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      // Handle Shipping Address (Try separate table first, fallback to order column)
      let addressData = data.shipping_address; // If stored as JSON
      
      // If you use a separate addresses table:
      const { data: address } = await supabase
        .from("addresses")
        .select("*")
        .eq("order_id", id)
        .maybeSingle();
      
      if (address) addressData = address;

      setOrder({ ...data, shipping_address: addressData });
    } catch (err) {
      console.error("Order fetch error:", err);
      // Don't redirect immediately so you can see the error in dev
      // navigate('/orders'); 
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchUserOrder();
  }, [fetchUserOrder]);

  const handlePrint = () => window.print();
  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: `Order #${order.order_number}`, url });
    } else {
      navigator.clipboard.writeText(url);
      setNotification({ open: true, message: "Link Copied!" });
    }
  };

  const getStatusStep = (status) => {
    const steps = ['pending', 'processing', 'shipped', 'delivered'];
    if (status === 'cancelled') return -1;
    return steps.indexOf(status?.toLowerCase());
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return '#F59E0B';
      case 'processing': return '#3B82F6';
      case 'shipped': return '#8B5CF6';
      case 'delivered': return '#10B981';
      case 'cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  };

  if (loading) return <Box sx={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><CircularProgress sx={{ color: 'black' }} /></Box>;
  if (!order) return <Box sx={{ p: 5, textAlign: 'center' }}><Typography>Order not found</Typography></Box>;

  const currentStep = getStatusStep(order.status);
  const statusColor = getStatusColor(order.status);

  // --- STYLES ---
  const styles = {
    pageBackground: { bgcolor: '#ffffff', minHeight: '100vh', pb: 10 },
    topNav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6, pb: 2, borderBottom: '1px solid #f0f0f0' },
    backBtn: { color: 'black', fontWeight: 800, fontSize: '11px', letterSpacing: '1px' },
    pageTitle: { fontSize: { xs: '24px', md: '42px' }, fontWeight: 900, letterSpacing: '-1px', lineHeight: 1 },
    sectionHeader: { fontSize: '12px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: '#000' },
    glassCard: { bgcolor: '#fff', border: '1px solid #f0f0f0', borderRadius: '20px', p: 4, boxShadow: '0 20px 40px rgba(0,0,0,0.03)', mb: 4 },
    timelineContainer: { display: 'flex', justifyContent: 'space-between', position: 'relative', mb: 4 },
    timelineStep: { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative', zIndex: 1 },
    timelineDot: { width: 24, height: 24, borderRadius: '50%', border: '2px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5, transition: 'all 0.3s ease' },
    timelineText: { fontSize: '10px', letterSpacing: '0.5px', textAlign: 'center' },
    timelineLine: { position: 'absolute', top: 12, left: '50%', width: '100%', height: 2, zIndex: -1 },
    invoicePaper: { p: 5, bgcolor: '#fff', borderRadius: '4px', boxShadow: '0 1px 2px rgba(0,0,0,0.05), 0 30px 60px rgba(0,0,0,0.1)', transformStyle: 'preserve-3d', animation: 'float 6s ease-in-out infinite', borderTop: '6px solid black', position: 'relative' },
    invoiceValue: { fontSize: '12px', fontWeight: 600, lineHeight: 1.5, color: '#333' },
    costRow: { display: 'flex', justifyContent: 'space-between', mb: 1 },
    costLabel: { fontSize: '11px', fontWeight: 700, color: '#666' },
    costValue: { fontSize: '12px', fontWeight: 800, color: '#000' }
  };

  return (
    <Box sx={styles.pageBackground}>
      <style>{`
        @keyframes float { 0% { transform: translateY(0px) rotateX(0deg); } 50% { transform: translateY(-5px) rotateX(1deg); } 100% { transform: translateY(0px) rotateX(0deg); } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <Container maxWidth="xl" sx={{ px: { xs: 2, md: 6 }, py: 6 }}>
        {/* TOP NAV */}
        <Box sx={styles.topNav}>
          <Button startIcon={<ArrowLeft size={18} />} onClick={() => navigate('/orders')} sx={styles.backBtn}>RETURN TO ORDERS</Button>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <IconButton onClick={handleShare}><Share2 size={20} /></IconButton>
            <IconButton onClick={handlePrint}><Printer size={20} /></IconButton>
          </Box>
        </Box>

        <Grid container spacing={6}>
          {/* LEFT: STATUS & ITEMS */}
          <Grid item xs={12} md={7} sx={{ animation: 'slideIn 0.6s ease-out' }}>
            <Box sx={{ mb: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography variant="h1" sx={styles.pageTitle}>ORDER #{order.order_number || order.id.slice(0,8).toUpperCase()}</Typography>
                <Chip label={order.status?.toUpperCase()} sx={{ bgcolor: `${statusColor}20`, color: statusColor, fontWeight: 800, fontSize: '12px', height: '28px', border: `1px solid ${statusColor}40` }} />
              </Box>
              <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#999', letterSpacing: '1px', mt: 1 }}>
                PLACED ON {new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()}
              </Typography>
            </Box>

            {/* TIMELINE */}
            {order.status !== 'cancelled' && (
              <Box sx={styles.glassCard}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
                  <Package size={24} color="black" />
                  <Typography sx={styles.sectionHeader}>SHIPMENT STATUS</Typography>
                </Box>
                <Box sx={styles.timelineContainer}>
                  {['ORDERED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map((label, index) => (
                    <Box key={label} sx={styles.timelineStep}>
                      <Box sx={{ ...styles.timelineDot, bgcolor: index <= currentStep ? 'black' : '#eee', color: index <= currentStep ? 'white' : 'transparent', borderColor: index <= currentStep ? 'black' : '#eee' }}>
                        <Check size={12} strokeWidth={4} />
                      </Box>
                      <Typography sx={{ ...styles.timelineText, color: index <= currentStep ? 'black' : '#999', fontWeight: index <= currentStep ? 800 : 500 }}>{label}</Typography>
                      {index < 3 && <Box sx={{ ...styles.timelineLine, bgcolor: index < currentStep ? 'black' : '#eee' }} />}
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* ITEMS LIST */}
            <Box sx={{ mt: 4 }}>
              <Typography sx={{ ...styles.sectionHeader, mb: 3 }}>PURCHASED ASSETS ({order.order_items.length})</Typography>
              {order.order_items.map((item, idx) => (
                <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 3, p: 2, mb: 2, bgcolor: '#fff', border: '1px solid #f0f0f0', borderRadius: '16px', animation: 'slideIn 0.5s ease forwards', animationDelay: `${idx * 0.1}s` }}>
                  <img src={item.products?.image_url} alt={item.products?.name} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: '8px', background: '#f0f0f0' }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '13px', textTransform: 'uppercase', mb: 0.5 }}>{item.products?.name}</Typography>
                    <Typography sx={{ fontSize: '11px', color: '#666', fontWeight: 600 }}>QTY: {item.quantity}</Typography>
                  </Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '14px' }}>₹{item.price_at_time?.toLocaleString()}</Typography>
                </Box>
              ))}
            </Box>
          </Grid>

          {/* RIGHT: INVOICE */}
          <Grid item xs={12} md={5}>
            <Box sx={{ perspective: '1500px', position: 'sticky', top: 100, animation: 'slideIn 0.8s ease-out' }}>
              <Paper sx={styles.invoicePaper}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Typography sx={{ fontSize: '48px', fontWeight: 900, letterSpacing: '-3px', lineHeight: 1, fontFamily: 'Inter, sans-serif' }}>
                    One<span style={{ color: '#F59E0B' }}>T</span>
                  </Typography>
                  <Typography sx={{ fontSize: '10px', letterSpacing: '4px', color: '#666', mt: 0.5 }}>OFFICIAL INVOICE</Typography>
                </Box>
                <Divider sx={{ borderStyle: 'dashed', borderColor: '#000', mb: 4 }} />
                
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography sx={{ fontSize: '10px', fontWeight: 800, color: '#999', letterSpacing: '1px', mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <MapPin size={12} /> SHIP TO
                      </Typography>
                      {order.shipping_address ? (
                        <Typography sx={styles.invoiceValue}>
                          {order.shipping_address.name || order.shipping_address.full_name}<br/>
                          {order.shipping_address.address || order.shipping_address.address_line1}<br/>
                          {order.shipping_address.city}, {order.shipping_address.state}
                        </Typography>
                      ) : <Typography sx={styles.invoiceValue}>N/A</Typography>}
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography sx={{ fontSize: '10px', fontWeight: 800, color: '#999', letterSpacing: '1px', mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CreditCard size={12} /> PAYMENT
                      </Typography>
                      <Typography sx={styles.invoiceValue}>
                        {order.payment_method?.replace('_', ' ').toUpperCase()}<br/>
                        <span style={{ color: order.payment_status === 'paid' ? '#10B981' : '#F59E0B' }}>
                          STATUS: {order.payment_status?.toUpperCase()}
                        </span>
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Box sx={{ bgcolor: '#f9f9f9', p: 3, borderRadius: '12px' }}>
                  <Box sx={styles.costRow}><Typography sx={styles.costLabel}>SUBTOTAL</Typography><Typography sx={styles.costValue}>₹{order.subtotal || 0}</Typography></Box>
                  <Box sx={styles.costRow}><Typography sx={styles.costLabel}>SHIPPING</Typography><Typography sx={styles.costValue}>₹{order.shipping_cost || 0}</Typography></Box>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={styles.costRow}>
                    <Typography sx={{ ...styles.costLabel, fontSize: '14px', color: 'black' }}>TOTAL PAID</Typography>
                    <Typography sx={{ ...styles.costValue, fontSize: '20px' }}>₹{order.total_amount}</Typography>
                  </Box>
                </Box>

                <Button fullWidth startIcon={<Receipt size={16} />} variant="outlined" onClick={() => window.print()} sx={{ mt: 4, color: 'black', borderColor: 'black', borderRadius: 0, fontWeight: 800, fontSize: '11px', letterSpacing: '1px', py: 1.5, borderWidth: '2px', '&:hover': { borderWidth: '2px', bgcolor: 'black', color: 'white' } }}>
                  DOWNLOAD PDF
                </Button>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Container>
      <Snackbar open={notification.open} autoHideDuration={2000} onClose={() => setNotification({ ...notification, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" sx={{ bgcolor: 'black', color: 'white', fontWeight: 700, borderRadius: '50px' }}>{notification.message}</Alert>
      </Snackbar>
    </Box>
  );
}