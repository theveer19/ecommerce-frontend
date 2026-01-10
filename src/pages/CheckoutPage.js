import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useCart } from "../context/CartContext";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";
import {
  Box, Stepper, Step, StepLabel, Button, Typography, TextField, Paper, Grid,
  FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Alert, Card,
  CardContent, CardMedia, Chip, CircularProgress, Container,
  InputAdornment, Checkbox, Divider, Badge, Snackbar, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, useMediaQuery, useTheme,
} from "@mui/material";
import {
  ArrowBack, CreditCard, Money, LocalShipping, Security,
  VerifiedUser, CheckCircle, Warning, LocationOn, Phone, Email,
  Person, Business, Close, Lock, Payment
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";

// CONFIGURATION
const BACKEND_URL = "https://ecommerce-backend-qqhi.onrender.com";
const RAZORPAY_KEY = process.env.REACT_APP_RAZORPAY_KEY_ID;

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
};

const cardHover3D = {
  rest: { scale: 1, rotateX: 0, rotateY: 0, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" },
  hover: { scale: 1.02, rotateX: 2, rotateY: 2, boxShadow: "0 20px 40px rgba(0,0,0,0.15)", transition: { type: "spring", stiffness: 300 } }
};

const styles = {
  root: {
    minHeight: '100vh',
    background: '#f8f9fa',
    backgroundImage: `
      radial-gradient(at 0% 0%, rgba(0,0,0,0.03) 0px, transparent 50%),
      radial-gradient(at 100% 100%, rgba(0,0,0,0.03) 0px, transparent 50%)
    `,
    position: 'relative',
    overflowX: 'hidden',
    pb: 8
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: { xs: '20px', md: '40px' },
    position: 'relative',
    zIndex: 2,
  },
  glassPanel: {
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.9)',
    borderRadius: '24px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
    transition: 'transform 0.3s ease',
  },
  headerTitle: {
    fontWeight: 900,
    fontSize: { xs: '2rem', md: '3.5rem' },
    background: 'linear-gradient(45deg, #000 30%, #444 90%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    mb: 1,
    letterSpacing: '-1px'
  },
  stepper: {
    background: 'transparent',
    p: 0,
    mb: 4,
    '& .MuiStepLabel-label': { fontWeight: 600, color: '#999' },
    '& .MuiStepLabel-label.Mui-active': { color: '#000', fontWeight: 800 },
    '& .MuiStepLabel-label.Mui-completed': { color: '#000' },
    '& .MuiStepIcon-root': { color: '#eee', fontSize: '2rem' },
    '& .MuiStepIcon-root.Mui-active': { color: '#000' },
    '& .MuiStepIcon-root.Mui-completed': { color: '#000' },
  },
  input: {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      background: '#fff',
      transition: 'all 0.3s',
      '& fieldset': { borderColor: '#eee' },
      '&:hover fieldset': { borderColor: '#000' },
      '&.Mui-focused fieldset': { borderColor: '#000', borderWidth: '2px' },
      '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }
    },
    '& .MuiInputLabel-root': { fontWeight: 500, color: '#666' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#000' }
  },
  paymentCard: {
    border: '2px solid transparent',
    borderRadius: '16px',
    p: 3,
    mb: 2,
    background: '#fff',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    '&.selected': {
      borderColor: '#000',
      background: 'linear-gradient(135deg, #fff 0%, #f5f5f5 100%)',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
    }
  },
  primaryBtn: {
    background: '#000',
    color: '#fff',
    borderRadius: '50px',
    py: 1.5,
    px: 4,
    fontWeight: 700,
    fontSize: '1rem',
    textTransform: 'none',
    boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
    '&:hover': {
      background: '#222',
      transform: 'translateY(-2px)',
      boxShadow: '0 15px 30px rgba(0,0,0,0.3)',
    },
    '&:disabled': {
      background: '#ccc'
    }
  },
  summaryCard: {
    position: 'sticky',
    top: 100,
    background: '#fff',
    borderRadius: '24px',
    p: 4,
    boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
    border: '1px solid rgba(0,0,0,0.05)'
  },
  itemRow: {
    display: 'flex',
    gap: 2,
    mb: 2,
    p: 1.5,
    borderRadius: '12px',
    transition: 'background 0.2s',
    '&:hover': { background: '#f8f8f8' }
  }
};

const steps = ['Shipping', 'Payment', 'Review'];

export default function CheckoutPage() {
  const { cartItems, clearCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const buyNowItem = location.state?.buyNowItem ?? null;
  const itemsToShow = useMemo(() => buyNowItem ? [buyNowItem] : (cartItems || []), [buyNowItem, cartItems]);

  const [activeStep, setActiveStep] = useState(0);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  const [shippingInfo, setShippingInfo] = useState({
    firstName: '', lastName: '', email: '', phone: '', address: '',
    city: '', state: '', zipCode: '', country: 'India', saveAddress: false,
  });

  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  const subtotal = useMemo(() => itemsToShow.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * (Number(item.quantity) || 1), 0), [itemsToShow]);
  const shippingFee = subtotal > 999 ? 0 : 50;
  const tax = subtotal * 0.18;
  const totalAmount = subtotal + shippingFee + tax;

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data?.session);
      if (data?.session?.user?.email) setShippingInfo(p => ({ ...p, email: data.session.user.email }));
    };
    checkAuth();
    
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);
  }, []);

  const showMessage = (type, text) => { setMessage({ type, text }); setShowSnackbar(true); };

  const saveOrderToBackend = async (method, paymentDetails = null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const orderPayload = {
        user_id: user?.id || null,
        items: itemsToShow.map(item => ({
          id: item.id, name: item.name, price: parseFloat(item.price),
          quantity: Number(item.quantity), image_url: item.image_url
        })),
        total_amount: Number(totalAmount.toFixed(2)),
        subtotal: Number(subtotal.toFixed(2)),
        shipping_fee: Number(shippingFee.toFixed(2)),
        tax: Number(tax.toFixed(2)),
        shipping_info: shippingInfo,
        payment_method: method,
        payment_id: paymentDetails 
      };

      const response = await fetch(`${BACKEND_URL}/save-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      return result.order;
    } catch (err) {
      console.error('❌ Save failed:', err);
      throw err;
    }
  };

  const handlePlaceOrder = async () => {
    if (paymentMethod === 'cod') {
      setLoading(true);
      try {
        const order = await saveOrderToBackend("cod", null);
        if (!buyNowItem) clearCart();
        navigate("/thank-you", { state: { orderDetails: { ...order, items: itemsToShow } } });
      } catch (err) {
        showMessage('error', 'Order failed. Try again.');
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(true);
      setPaymentDialog(true);
      try {
        const orderRes = await fetch(`${BACKEND_URL}/create-order`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: totalAmount.toFixed(2) }),
        });
        
        const orderData = await orderRes.json();
        if (!orderData.id) throw new Error("Payment init failed");

        const options = {
          key: RAZORPAY_KEY,
          amount: orderData.amount,
          currency: "INR",
          order_id: orderData.id,
          name: "ONE-T Fashion",
          description: "Premium Fashion Order",
          handler: async function (response) {
            setPaymentStatus('success');
            try {
              const savedOrder = await saveOrderToBackend("razorpay", {
                payment_id: response.razorpay_payment_id,
                order_id: response.razorpay_order_id
              });
              await fetch(`${BACKEND_URL}/verify-payment`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                })
              });
              if (!buyNowItem) clearCart();
              setTimeout(() => {
                setPaymentDialog(false);
                navigate("/thank-you", { state: { orderDetails: { ...savedOrder, items: itemsToShow } } });
              }, 1500);
            } catch (err) {
              setPaymentStatus('error');
              showMessage('error', 'Payment successful but order save failed.');
            }
          },
          prefill: {
            name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
            email: shippingInfo.email,
            contact: shippingInfo.phone,
          },
          theme: { color: "#000000" },
          modal: { ondismiss: () => { setPaymentDialog(false); setLoading(false); } }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
        setLoading(false);
      } catch (err) {
        setPaymentDialog(false);
        setLoading(false);
        showMessage('error', 'Payment initialization failed');
      }
    }
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!shippingInfo.firstName || !shippingInfo.phone || !shippingInfo.address) {
        showMessage('error', 'Please fill all fields');
        return;
      }
    }
    setActiveStep(prev => prev + 1);
  };

  const renderStepContent = (step) => {
    const inputAnimation = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };

    switch (step) {
      case 0: return (
        <motion.div initial="hidden" animate="visible" variants={containerVariants}>
          <Typography variant="h6" fontWeight={800} mb={3} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOn /> SHIPPING DETAILS
          </Typography>
          <Grid container spacing={3}>
            {['firstName', 'lastName', 'email', 'phone'].map((field, i) => (
              <Grid item xs={12} sm={6} key={field}>
                <motion.div variants={itemVariants}>
                  <TextField fullWidth label={field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} 
                    value={shippingInfo[field]} onChange={(e) => setShippingInfo({...shippingInfo, [field]: e.target.value})} 
                    sx={styles.input} />
                </motion.div>
              </Grid>
            ))}
            <Grid item xs={12}>
              <motion.div variants={itemVariants}>
                <TextField fullWidth label="Address" value={shippingInfo.address} onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})} sx={styles.input} />
              </motion.div>
            </Grid>
            {['city', 'state', 'zipCode'].map((field) => (
              <Grid item xs={12} sm={4} key={field}>
                <motion.div variants={itemVariants}>
                  <TextField fullWidth label={field === 'zipCode' ? 'Zip Code' : field.charAt(0).toUpperCase() + field.slice(1)} 
                    value={shippingInfo[field]} onChange={(e) => setShippingInfo({...shippingInfo, [field]: e.target.value})} 
                    sx={styles.input} />
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      );
      case 1: return (
        <motion.div initial="hidden" animate="visible" variants={containerVariants}>
          <Typography variant="h6" fontWeight={800} mb={3} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CreditCard /> PAYMENT METHOD
          </Typography>
          <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            {[
              { value: 'razorpay', label: 'Credit/Debit/UPI', desc: 'Secure Instant Payment', icon: <Security /> },
              { value: 'cod', label: 'Cash on Delivery', desc: 'Pay at your doorstep', icon: <Money /> }
            ].map((option) => (
              <motion.div key={option.value} variants={itemVariants} whileHover="hover" initial="rest" animate="rest">
                <Paper 
                  elevation={0}
                  className={paymentMethod === option.value ? 'selected' : ''}
                  sx={{ ...styles.paymentCard, ...(paymentMethod === option.value && styles.paymentCard.selected) }}
                  component={motion.div}
                  variants={cardHover3D}
                >
                  <FormControlLabel value={option.value} control={<Radio sx={{ color: '#000', '&.Mui-checked': { color: '#000' } }} />} 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ p: 1, bgcolor: '#000', color: '#fff', borderRadius: '50%' }}>{option.icon}</Box>
                        <Box>
                          <Typography fontWeight={800} fontSize="1.1rem">{option.label}</Typography>
                          <Typography variant="body2" color="text.secondary">{option.desc}</Typography>
                        </Box>
                      </Box>
                    } 
                  />
                </Paper>
              </motion.div>
            ))}
          </RadioGroup>
        </motion.div>
      );
      case 2: return (
        <motion.div initial="hidden" animate="visible" variants={containerVariants}>
          <Typography variant="h6" fontWeight={800} mb={3} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircle /> FINAL REVIEW
          </Typography>
          <Card sx={{ borderRadius: '20px', boxShadow: 'none', border: '1px solid #eee' }}>
            <CardContent>
              {itemsToShow.map((item, i) => (
                <motion.div key={i} variants={itemVariants} style={styles.itemRow}>
                  <CardMedia component="img" image={item.image_url} sx={{ width: 70, height: 70, borderRadius: '12px', objectFit: 'cover' }} />
                  <Box flex={1}>
                    <Typography fontWeight={800} fontSize="1.1rem">{item.name}</Typography>
                    <Typography variant="body2" color="text.secondary">Quantity: {item.quantity}</Typography>
                  </Box>
                  <Typography fontWeight={800} fontSize="1.2rem">₹{item.price}</Typography>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      );
      default: return null;
    }
  };

  if (!session) return <Box sx={styles.root} display="flex" justifyContent="center" alignItems="center"><Paper sx={{ p: 5, borderRadius: '24px', textAlign: 'center' }}><Typography variant="h4" fontWeight={900} mb={2}>Sign In Required</Typography><Button onClick={() => navigate("/login")} sx={styles.primaryBtn}>Login Now</Button></Paper></Box>;

  return (
    <Box sx={styles.root}>
      {/* Background Decor */}
      <Box sx={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,0,0,0.05) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <Box sx={{ position: 'absolute', bottom: -100, left: -100, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,0,0,0.03) 0%, transparent 70%)', filter: 'blur(60px)' }} />

      <Container sx={styles.container}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <Box textAlign="center" mb={6}>
            <Typography sx={styles.headerTitle}>SECURE CHECKOUT</Typography>
            <Typography variant="body1" color="text.secondary" fontWeight={500}>Complete your order safely and securely</Typography>
          </Box>
        </motion.div>

        <Grid container spacing={5}>
          <Grid item xs={12} lg={8}>
            <Paper sx={styles.glassPanel}>
              <Box p={4}>
                <Stepper activeStep={activeStep} alternativeLabel sx={styles.stepper}>
                  {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
                </Stepper>
                
                <AnimatePresence mode="wait">
                  <motion.div key={activeStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                    {renderStepContent(activeStep)}
                  </motion.div>
                </AnimatePresence>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 6 }}>
                  <Button disabled={activeStep === 0} onClick={() => setActiveStep(p => p - 1)} variant="outlined" sx={{ borderRadius: '50px', px: 4, borderColor: '#ccc', color: '#666' }}>Back</Button>
                  {activeStep === steps.length - 1 ? (
                    <Button onClick={handlePlaceOrder} disabled={loading} sx={styles.primaryBtn}>
                      {loading ? 'Processing...' : `Pay ₹${totalAmount.toFixed(2)}`}
                    </Button>
                  ) : (
                    <Button onClick={handleNext} sx={styles.primaryBtn}>Continue</Button>
                  )}
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={4}>
            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <Box sx={styles.summaryCard}>
                <Typography variant="h6" fontWeight={900} mb={3}>ORDER SUMMARY</Typography>
                <Box mb={2} display="flex" justifyContent="space-between"><Typography color="text.secondary">Subtotal</Typography><Typography fontWeight={600}>₹{subtotal.toFixed(2)}</Typography></Box>
                <Box mb={2} display="flex" justifyContent="space-between"><Typography color="text.secondary">Shipping</Typography><Typography fontWeight={600} color={shippingFee === 0 ? "success.main" : "text.primary"}>{shippingFee === 0 ? "FREE" : `₹${shippingFee}`}</Typography></Box>
                <Box mb={3} display="flex" justifyContent="space-between"><Typography color="text.secondary">GST (18%)</Typography><Typography fontWeight={600}>₹{tax.toFixed(2)}</Typography></Box>
                <Divider sx={{ my: 2 }} />
                <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" fontWeight={800}>TOTAL</Typography>
                  <Typography variant="h4" fontWeight={900}>₹{totalAmount.toFixed(2)}</Typography>
                </Box>
                
                <Box bgcolor="#f8f9fa" p={2} borderRadius="12px">
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Security sx={{ fontSize: 18, color: '#4CAF50' }} />
                    <Typography variant="caption" fontWeight={700} color="#4CAF50">SSL ENCRYPTED PAYMENT</Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" display="block">Your data is processed securely.</Typography>
                </Box>
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </Container>

      <Snackbar open={showSnackbar} autoHideDuration={6000} onClose={() => setShowSnackbar(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={message.type} variant="filled" sx={{ borderRadius: '12px', fontWeight: 600 }}>{message.text}</Alert>
      </Snackbar>
    </Box>
  );
}