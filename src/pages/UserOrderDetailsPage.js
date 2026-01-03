import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";
import { 
  Box, Container, Grid, Typography, Button, Divider, 
  CircularProgress, IconButton, Snackbar, Alert, Paper 
} from "@mui/material";
import { 
  ArrowLeft, Printer, Share2, Package, Check, 
  MapPin, CreditCard, ShoppingBag, Receipt 
} from "lucide-react";

export default function UserOrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ open: false, message: "" });

  // --- FETCH LOGIC ---
  const fetchUserOrder = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/login'); return; }

      const { data, error } = await supabase
        .from("orders")
        .select(`*, order_items (*, product:products(*))`)
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      const { data: address } = await supabase
        .from("addresses")
        .select("*")
        .eq("order_id", id)
        .maybeSingle();

      setOrder({ ...data, shipping_address: address });
    } catch (err) {
      console.error(err);
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchUserOrder();
  }, [fetchUserOrder]);

  // --- ACTIONS ---
  const handlePrint = () => window.print();
  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: `Order #${order.order_number}`, url });
    } else {
      navigator.clipboard.writeText(url);
      setNotification({ open: true, message: "LINK COPIED" });
    }
  };

  const getStatusStep = (status) => {
    const steps = ['pending', 'processing', 'shipped', 'delivered'];
    return steps.indexOf(status?.toLowerCase());
  };

  if (loading) return <Box sx={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><CircularProgress sx={{ color: 'black' }} /></Box>;
  if (!order) return null;

  const currentStep = getStatusStep(order.status);

  return (
    <Box sx={styles.pageBackground}>
      {/* CSS Animations */}
      <style>{`
        @keyframes float { 0% { transform: translateY(0px) rotateX(0deg); } 50% { transform: translateY(-5px) rotateX(1deg); } 100% { transform: translateY(0px) rotateX(0deg); } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .invoice-barcode {
          height: 40px;
          width: 100%;
          background: repeating-linear-gradient(to right, #000 0px, #000 2px, transparent 2px, transparent 4px, #000 4px, #000 8px, transparent 8px, transparent 9px);
          opacity: 0.8;
        }
      `}</style>

      <Container maxWidth="xl" sx={{ px: { xs: 2, md: 6 }, py: 6 }}>
        
        {/* TOP NAV */}
        <Box sx={styles.topNav}>
          <Button 
            startIcon={<ArrowLeft size={18} />} 
            onClick={() => navigate('/orders')}
            sx={styles.backBtn}
          >
            RETURN TO ORDERS
          </Button>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <IconButton onClick={handleShare} sx={styles.iconBtn}><Share2 size={20} /></IconButton>
            <IconButton onClick={handlePrint} sx={styles.iconBtn}><Printer size={20} /></IconButton>
          </Box>
        </Box>

        <Grid container spacing={6}>
          
          {/* LEFT: ORDER STATUS & ITEMS */}
          <Grid item xs={12} md={7} sx={{ animation: 'slideIn 0.6s ease-out' }}>
            
            <Box sx={{ mb: 6 }}>
              <Typography variant="h1" sx={styles.pageTitle}>ORDER #{order.order_number}</Typography>
              <Typography sx={styles.dateLabel}>
                PLACED ON {new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()}
              </Typography>
            </Box>

            {/* TRACKING TIMELINE */}
            <Box sx={styles.glassCard}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
                <Package size={24} color="black" />
                <Typography sx={styles.sectionHeader}>SHIPMENT STATUS</Typography>
              </Box>
              
              <Box sx={styles.timelineContainer}>
                {['ORDERED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map((label, index) => (
                  <Box key={label} sx={styles.timelineStep}>
                    <Box sx={{ 
                      ...styles.timelineDot, 
                      bgcolor: index <= currentStep ? 'black' : '#eee',
                      color: index <= currentStep ? 'white' : 'transparent',
                      borderColor: index <= currentStep ? 'black' : '#eee'
                    }}>
                      <Check size={12} strokeWidth={4} />
                    </Box>
                    <Typography sx={{ 
                      ...styles.timelineText, 
                      color: index <= currentStep ? 'black' : '#999',
                      fontWeight: index <= currentStep ? 800 : 500
                    }}>
                      {label}
                    </Typography>
                    {/* Connecting Line */}
                    {index < 3 && <Box sx={{ ...styles.timelineLine, bgcolor: index < currentStep ? 'black' : '#eee' }} />}
                  </Box>
                ))}
              </Box>

              {order.tracking_number && (
                <Box sx={styles.trackingBox}>
                  <Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#666', mb: 0.5 }}>TRACKING ID</Typography>
                  <Typography sx={{ fontSize: '16px', fontWeight: 900, letterSpacing: '1px' }}>{order.tracking_number}</Typography>
                  <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#999', mt: 0.5 }}>{order.shipping_carrier?.toUpperCase()}</Typography>
                </Box>
              )}
            </Box>

            {/* ORDER ITEMS LIST */}
            <Box sx={{ mt: 4 }}>
              <Typography sx={{ ...styles.sectionHeader, mb: 3 }}>PURCHASED ASSETS ({order.order_items.length})</Typography>
              {order.order_items.map((item, idx) => (
                <Box key={item.id} sx={{ ...styles.itemCard, animationDelay: `${idx * 0.1}s` }}>
                  <img src={item.product?.image_url} alt={item.product?.name} style={styles.itemImg} />
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={styles.itemName}>{item.product?.name}</Typography>
                    <Typography sx={styles.itemMeta}>SIZE: {item.size || 'N/A'} • QTY: {item.quantity}</Typography>
                  </Box>
                  <Typography sx={styles.itemPrice}>₹{item.price_at_time?.toLocaleString()}</Typography>
                </Box>
              ))}
            </Box>
          </Grid>

          {/* RIGHT: 3D INVOICE (Sticky) */}
          <Grid item xs={12} md={5}>
            <Box sx={styles.invoiceWrapper}>
              <Paper sx={styles.invoicePaper}>
                
                {/* INVOICE HEADER */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Typography sx={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-2px', lineHeight: 1 }}>ONE-T</Typography>
                  <Typography sx={{ fontSize: '10px', letterSpacing: '4px', color: '#666', mt: 0.5 }}>OFFICIAL INVOICE</Typography>
                </Box>

                <Divider sx={{ borderStyle: 'dashed', borderColor: '#000', mb: 4 }} />

                {/* BILLING DETAILS */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={6}>
                    <Box sx={styles.invoiceBlock}>
                      <Typography sx={styles.invoiceLabel}><MapPin size={12} /> SHIP TO</Typography>
                      {order.shipping_address ? (
                        <Typography sx={styles.invoiceValue}>
                          {order.shipping_address.full_name}<br/>
                          {order.shipping_address.address_line1}<br/>
                          {order.shipping_address.city}, {order.shipping_address.state}
                        </Typography>
                      ) : <Typography sx={styles.invoiceValue}>N/A</Typography>}
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={styles.invoiceBlock}>
                      <Typography sx={styles.invoiceLabel}><CreditCard size={12} /> PAYMENT</Typography>
                      <Typography sx={styles.invoiceValue}>
                        {order.payment_method?.replace('_', ' ').toUpperCase()}<br/>
                        STATUS: {order.payment_status?.toUpperCase()}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* COST BREAKDOWN */}
                <Box sx={{ bgcolor: '#f9f9f9', p: 3, borderRadius: '12px' }}>
                  <Box sx={styles.costRow}>
                    <Typography sx={styles.costLabel}>SUBTOTAL</Typography>
                    <Typography sx={styles.costValue}>₹{order.subtotal}</Typography>
                  </Box>
                  <Box sx={styles.costRow}>
                    <Typography sx={styles.costLabel}>SHIPPING</Typography>
                    <Typography sx={styles.costValue}>₹{order.shipping_cost}</Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={styles.costRow}>
                    <Typography sx={{ ...styles.costLabel, fontSize: '14px', color: 'black' }}>TOTAL PAID</Typography>
                    <Typography sx={{ ...styles.costValue, fontSize: '20px' }}>₹{order.total_amount}</Typography>
                  </Box>
                </Box>

                {/* FOOTER */}
                <Box sx={{ mt: 5, textAlign: 'center', opacity: 0.6 }}>
                  <div className="invoice-barcode"></div>
                  <Typography sx={{ fontSize: '9px', mt: 1, letterSpacing: '2px' }}>AUTHENTICATED TRANSACTION</Typography>
                </Box>

                <Button 
                  fullWidth 
                  startIcon={<Receipt size={16} />}
                  variant="outlined" 
                  sx={styles.invoiceBtn}
                  onClick={() => window.print()}
                >
                  DOWNLOAD PDF
                </Button>

              </Paper>
            </Box>
          </Grid>

        </Grid>
      </Container>

      <Snackbar
        open={notification.open}
        autoHideDuration={2000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ bgcolor: 'black', color: 'white', fontWeight: 700, borderRadius: '50px' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// --- STYLES ---
const styles = {
  pageBackground: {
    bgcolor: '#ffffff',
    minHeight: '100vh',
    pb: 10,
  },
  topNav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 6,
    pb: 2,
    borderBottom: '1px solid #f0f0f0'
  },
  backBtn: {
    color: 'black',
    fontWeight: 800,
    fontSize: '11px',
    letterSpacing: '1px',
    '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
  },
  iconBtn: {
    color: 'black',
    border: '1px solid #eee',
    '&:hover': { bgcolor: '#f5f5f5', borderColor: 'black' }
  },
  pageTitle: {
    fontSize: { xs: '32px', md: '56px' },
    fontWeight: 900,
    letterSpacing: '-2px',
    lineHeight: 1,
    mb: 1
  },
  dateLabel: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#999',
    letterSpacing: '1px'
  },
  sectionHeader: {
    fontSize: '12px',
    fontWeight: 800,
    letterSpacing: '1px',
    textTransform: 'uppercase',
    color: '#000'
  },
  // Timeline
  glassCard: {
    bgcolor: '#fff',
    border: '1px solid #f0f0f0',
    borderRadius: '20px',
    p: 4,
    boxShadow: '0 20px 40px rgba(0,0,0,0.03)',
    mb: 4
  },
  timelineContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    position: 'relative',
    mb: 4
  },
  timelineStep: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    position: 'relative',
    zIndex: 1
  },
  timelineDot: {
    width: 24, height: 24,
    borderRadius: '50%',
    border: '2px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    mb: 1.5,
    transition: 'all 0.3s ease'
  },
  timelineText: {
    fontSize: '10px',
    letterSpacing: '0.5px',
    textAlign: 'center'
  },
  timelineLine: {
    position: 'absolute',
    top: 12, left: '50%', width: '100%', height: 2,
    zIndex: -1
  },
  trackingBox: {
    bgcolor: '#f9f9f9',
    p: 2, borderRadius: '12px',
    border: '1px solid #eee'
  },
  // Items
  itemCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 3,
    p: 2,
    mb: 2,
    bgcolor: '#fff',
    border: '1px solid #f0f0f0',
    borderRadius: '16px',
    transition: 'transform 0.2s',
    animation: 'slideIn 0.5s ease forwards',
    '&:hover': {
      transform: 'translateX(5px)',
      borderColor: '#000'
    }
  },
  itemImg: {
    width: 60, height: 60,
    objectFit: 'cover',
    borderRadius: '8px',
    bgcolor: '#f0f0f0'
  },
  itemName: {
    fontWeight: 800, fontSize: '13px', textTransform: 'uppercase', mb: 0.5
  },
  itemMeta: {
    fontSize: '11px', color: '#666', fontWeight: 600
  },
  itemPrice: {
    fontWeight: 800, fontSize: '14px'
  },
  // 3D Invoice
  invoiceWrapper: {
    perspective: '1500px',
    position: 'sticky',
    top: 100,
    animation: 'slideIn 0.8s ease-out'
  },
  invoicePaper: {
    p: 5,
    bgcolor: '#fff',
    borderRadius: '4px', // Square corners for receipt look
    boxShadow: '0 1px 2px rgba(0,0,0,0.05), 0 30px 60px rgba(0,0,0,0.1)',
    transformStyle: 'preserve-3d',
    animation: 'float 6s ease-in-out infinite',
    borderTop: '6px solid black',
    position: 'relative',
    '&::after': { // Zigzag bottom
      content: '""',
      position: 'absolute',
      bottom: -10, left: 0, right: 0,
      height: 10,
      background: 'linear-gradient(45deg, transparent 33.333%, #fff 33.333%, #fff 66.667%, transparent 66.667%), linear-gradient(-45deg, transparent 33.333%, #fff 33.333%, #fff 66.667%, transparent 66.667%)',
      backgroundSize: '20px 20px',
      backgroundPosition: '0 0' // Simple jagged edge simulation
    }
  },
  invoiceBlock: {
    mb: 2
  },
  invoiceLabel: {
    fontSize: '10px',
    fontWeight: 800,
    color: '#999',
    letterSpacing: '1px',
    mb: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 0.5
  },
  invoiceValue: {
    fontSize: '12px',
    fontWeight: 600,
    lineHeight: 1.5,
    color: '#333'
  },
  costRow: {
    display: 'flex',
    justifyContent: 'space-between',
    mb: 1
  },
  costLabel: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#666'
  },
  costValue: {
    fontSize: '12px',
    fontWeight: 800,
    color: '#000'
  },
  invoiceBtn: {
    mt: 4,
    color: 'black',
    borderColor: 'black',
    borderRadius: 0,
    fontWeight: 800,
    fontSize: '11px',
    letterSpacing: '1px',
    py: 1.5,
    borderWidth: '2px',
    '&:hover': { borderWidth: '2px', bgcolor: 'black', color: 'white' }
  }
};