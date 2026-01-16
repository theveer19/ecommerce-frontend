import React, { useEffect, useState, useMemo } from "react";
import { useCart } from "../context/CartContext";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  TextField,
  Paper,
  Grid,
  Radio,
  RadioGroup,
  Alert,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Snackbar,
  Container,
  Avatar,
} from "@mui/material";
import {
  CreditCard,
  Money,
  LocalShipping,
  CheckCircle,
  Security,
  ArrowBack,
  ReceiptLong,
  Lock,
  CardGiftcard,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";

const BACKEND_URL = "https://ecommerce-backend-qqhi.onrender.com";
const RAZORPAY_KEY = process.env.REACT_APP_RAZORPAY_KEY_ID;
const steps = ["Shipping", "Payment", "Review"];

export default function CheckoutPage() {
  const { cartItems, clearCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const buyNowItem = location.state?.buyNowItem ?? null;
  const itemsToShow = useMemo(
    () => (buyNowItem ? [buyNowItem] : cartItems),
    [buyNowItem, cartItems]
  );

  const [session, setSession] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    type: "",
    text: "",
  });

  const [shippingInfo, setShippingInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
    country: "India",
  });

  const [paymentMethod, setPaymentMethod] = useState("razorpay");

  const subtotal = useMemo(
    () =>
      itemsToShow.reduce(
        (sum, i) => sum + Number(i.price) * Number(i.quantity || 1),
        0
      ),
    [itemsToShow]
  );

  const totalAmount = subtotal;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data?.session || null);
      if (data?.session?.user?.email) {
        setShippingInfo((p) => ({
          ...p,
          email: data.session.user.email,
        }));
      }
    });
  }, []);

  const showMessage = (type, text) =>
    setSnackbar({ open: true, type, text });

  const saveOrderToBackend = async (method, paymentDetails = null) => {
    const { data } = await supabase.auth.getUser();

    const payload = {
      user_id: data?.user?.id || null,
      items: itemsToShow,
      subtotal,
      shipping_fee: 0,
      tax: 0,
      total_amount: Number(totalAmount.toFixed(2)),
      shipping_info: shippingInfo,
      payment_method: method,
      payment_details: paymentDetails,
    };

    const res = await fetch(`${BACKEND_URL}/save-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!json.success) throw new Error();
    return json.order;
  };

  const handlePlaceOrder = async () => {
    setLoading(true);

    if (paymentMethod === "cod") {
      try {
        const order = await saveOrderToBackend("cod");
        if (!buyNowItem) clearCart();
        navigate("/thank-you", { state: { orderDetails: order } });
      } catch {
        showMessage("error", "Order failed");
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      if (!window.Razorpay) {
        showMessage("error", "Payment service still loading. Try again.");
        setLoading(false);
        return;
      }

      const res = await fetch(`${BACKEND_URL}/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalAmount.toFixed(2) }),
      });

      const orderData = await res.json();
      if (!orderData?.id) throw new Error();

      const options = {
        key: RAZORPAY_KEY,
        amount: orderData.amount,
        currency: "INR",
        order_id: orderData.id,

        handler: async (response) => {
          try {
            const saved = await saveOrderToBackend("razorpay", response);
            if (!buyNowItem) clearCart();
            navigate("/thank-you", {
              state: { orderDetails: saved },
            });
          } catch {
            showMessage("error", "Payment done but order save failed");
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: () => {
            setLoading(false);
            showMessage("error", "Payment cancelled");
          },
        },
      };

      new window.Razorpay(options).open();
    } catch {
      setLoading(false);
      showMessage("error", "Payment initialization failed");
    }
  };

  const handleNext = () => {
    if (
      activeStep === 0 &&
      (!shippingInfo.firstName ||
        !shippingInfo.phone ||
        !shippingInfo.address)
    ) {
      showMessage("error", "Please fill all shipping fields");
      return;
    }
    setActiveStep((p) => p + 1);
  };

  /* ---------- STYLES (3D / MODERN) ---------- */
  const styles = {
    pageBackground: {
      background: '#f0f2f5',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      py: 8,
      position: 'relative',
      overflow: 'hidden'
    },
    mainContainer: {
      position: 'relative',
      zIndex: 2,
    },
    glassCard: {
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(20px)',
      borderRadius: '30px',
      border: '1px solid #fff',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255,255,255,0.5)',
      overflow: 'hidden',
      p: 4
    },
    stepIcon: (active, completed) => ({
      width: '40px',
      height: '40px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: active ? '#000' : completed ? '#4caf50' : '#e0e0e0',
      color: active || completed ? '#fff' : '#999',
      boxShadow: active ? '0 10px 20px rgba(0,0,0,0.3)' : 'none',
      transition: 'all 0.3s ease',
      fontWeight: 'bold'
    }),
    inputField: {
      '& .MuiOutlinedInput-root': {
        borderRadius: '16px',
        background: '#fff',
        transition: 'all 0.3s ease',
        '& fieldset': { borderColor: '#e0e0e0' },
        '&:hover fieldset': { borderColor: '#000' },
        '&.Mui-focused fieldset': { borderColor: '#000', borderWidth: '2px' },
        '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }
      }
    },
    paymentCard: (selected) => ({
      p: 3,
      borderRadius: '20px',
      border: selected ? '2px solid #000' : '1px solid #e0e0e0',
      background: selected ? '#fff' : '#f9f9f9',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: selected ? 'scale(1.02) translateY(-4px)' : 'scale(1)',
      boxShadow: selected ? '0 20px 30px rgba(0,0,0,0.1)' : 'none',
      display: 'flex',
      alignItems: 'center',
      gap: 2
    }),
    summaryRow: {
        display: 'flex', 
        justifyContent: 'space-between', 
        mb: 2,
        color: '#555'
    },
    actionBtn: {
        borderRadius: '50px',
        py: 1.5,
        px: 4,
        fontWeight: 800,
        textTransform: 'none',
        fontSize: '1rem',
        boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
        transition: 'all 0.3s ease',
        '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 15px 30px rgba(0,0,0,0.3)'
        }
    }
  };

  if (!session) {
    return (
      <Box sx={styles.pageBackground}>
        <Container maxWidth="sm" sx={{ textAlign: "center" }}>
          <Paper sx={{ ...styles.glassCard, textAlign: 'center', py: 8 }}>
            <Lock sx={{ fontSize: 60, mb: 2, color: '#000' }} />
            <Typography variant="h4" fontWeight={900} mb={2}>
              Secure Checkout
            </Typography>
            <Typography color="text.secondary" mb={4}>
              Please login to access your saved address and complete your purchase securely.
            </Typography>
            <Button 
                onClick={() => navigate("/login")} 
                variant="contained" 
                sx={{ ...styles.actionBtn, bgcolor: 'black', color: 'white' }}
            >
              Login to Continue
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={styles.pageBackground}>
      {/* Dynamic Background Elements */}
      <Box sx={{ position: 'absolute', top: -100, left: -100, width: 400, height: 400, background: 'radial-gradient(circle, rgba(0,0,0,0.05) 0%, transparent 70%)', borderRadius: '50%' }} />
      <Box sx={{ position: 'absolute', bottom: -50, right: -50, width: 600, height: 600, background: 'radial-gradient(circle, rgba(0,0,0,0.03) 0%, transparent 70%)', borderRadius: '50%' }} />

      <Container maxWidth="lg" sx={styles.mainContainer}>
        
        {/* Header */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Typography variant="h2" sx={{ fontWeight: 900, fontSize: { xs: '2rem', md: '3rem' }, mb: 1 }}>
                CHECKOUT
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <Security sx={{ fontSize: 16, color: '#4caf50' }} />
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#666', letterSpacing: '1px' }}>
                    256-BIT SECURE SSL ENCRYPTED
                </Typography>
            </Box>
        </Box>

        <Grid container spacing={4}>
            
            {/* LEFT COLUMN: STEPS */}
            <Grid item xs={12} lg={8}>
                <Paper sx={styles.glassCard}>
                    
                    {/* Custom Stepper */}
                    <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 6 }}>
                        {steps.map((label, index) => (
                        <Step key={label}>
                            <StepLabel StepIconComponent={() => (
                                <Box sx={styles.stepIcon(activeStep === index, activeStep > index)}>
                                    {activeStep > index ? <CheckCircle fontSize="small" /> : index + 1}
                                </Box>
                            )}>
                                <Typography sx={{ fontWeight: activeStep === index ? 800 : 500 }}>{label}</Typography>
                            </StepLabel>
                        </Step>
                        ))}
                    </Stepper>

                    <AnimatePresence mode="wait">
                        {/* STEP 1: SHIPPING */}
                        {activeStep === 0 && (
                        <motion.div 
                            key="step1"
                            initial={{ opacity: 0, x: -20 }} 
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
                                <Avatar sx={{ bgcolor: '#f5f5f5', color: '#000' }}><LocalShipping /></Avatar>
                                <Typography variant="h5" fontWeight={800}>Shipping Details</Typography>
                            </Box>
                            
                            <Grid container spacing={3}>
                                {["firstName", "lastName", "email", "phone"].map((f) => (
                                    <Grid item xs={12} md={6} key={f}>
                                        <TextField
                                            fullWidth
                                            label={f.replace(/([A-Z])/g, ' $1').trim().toUpperCase()}
                                            value={shippingInfo[f]}
                                            onChange={(e) => setShippingInfo({ ...shippingInfo, [f]: e.target.value })}
                                            sx={styles.inputField}
                                            variant="outlined"
                                            InputLabelProps={{ style: { fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px' } }}
                                        />
                                    </Grid>
                                ))}
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="STREET ADDRESS"
                                        value={shippingInfo.address}
                                        onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                                        sx={styles.inputField}
                                        multiline
                                        rows={2}
                                        InputLabelProps={{ style: { fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px' } }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="CITY"
                                        value={shippingInfo.city}
                                        onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                                        sx={styles.inputField}
                                        InputLabelProps={{ style: { fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px' } }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="ZIP CODE"
                                        value={shippingInfo.zipCode}
                                        onChange={(e) => setShippingInfo({ ...shippingInfo, zipCode: e.target.value })}
                                        sx={styles.inputField}
                                        InputLabelProps={{ style: { fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px' } }}
                                    />
                                </Grid>
                            </Grid>
                        </motion.div>
                        )}

                        {/* STEP 2: PAYMENT */}
                        {activeStep === 1 && (
                        <motion.div 
                            key="step2"
                            initial={{ opacity: 0, x: -20 }} 
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                        >
                             <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
                                <Avatar sx={{ bgcolor: '#f5f5f5', color: '#000' }}><CreditCard /></Avatar>
                                <Typography variant="h5" fontWeight={800}>Select Payment</Typography>
                            </Box>

                            <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <Box onClick={() => setPaymentMethod('razorpay')} sx={styles.paymentCard(paymentMethod === 'razorpay')}>
                                            <Radio checked={paymentMethod === 'razorpay'} />
                                            <Box>
                                                <Typography fontWeight={800} fontSize="1.1rem">Pay Online (Razorpay)</Typography>
                                                <Typography variant="body2" color="text.secondary">Cards, UPI, NetBanking. Fast & Secure.</Typography>
                                            </Box>
                                            <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                                                <Box sx={{ width: 30, height: 20, bgcolor: '#eee', borderRadius: 1 }} />
                                                <Box sx={{ width: 30, height: 20, bgcolor: '#eee', borderRadius: 1 }} />
                                            </Box>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Box onClick={() => setPaymentMethod('cod')} sx={styles.paymentCard(paymentMethod === 'cod')}>
                                            <Radio checked={paymentMethod === 'cod'} />
                                            <Box>
                                                <Typography fontWeight={800} fontSize="1.1rem">Cash on Delivery</Typography>
                                                <Typography variant="body2" color="text.secondary">Pay with cash when your order arrives.</Typography>
                                            </Box>
                                            <Box sx={{ ml: 'auto' }}>
                                                <Money sx={{ color: '#666' }} />
                                            </Box>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </RadioGroup>
                        </motion.div>
                        )}

                        {/* STEP 3: REVIEW */}
                        {activeStep === 2 && (
                        <motion.div 
                            key="step3"
                            initial={{ opacity: 0, x: -20 }} 
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
                                <Avatar sx={{ bgcolor: '#f5f5f5', color: '#000' }}><ReceiptLong /></Avatar>
                                <Typography variant="h5" fontWeight={800}>Review Order</Typography>
                            </Box>

                            <Box sx={{ maxHeight: '400px', overflowY: 'auto', pr: 1 }}>
                                {itemsToShow.map((item) => (
                                <Card key={item.id} sx={{ mb: 2, borderRadius: '16px', boxShadow: 'none', border: '1px solid #eee' }}>
                                    <CardContent sx={{ display: "flex", gap: 3, alignItems: 'center' }}>
                                        <Box sx={{ 
                                            width: 80, height: 80, 
                                            borderRadius: '12px', overflow: 'hidden', 
                                            boxShadow: '0 5px 15px rgba(0,0,0,0.1)' 
                                        }}>
                                            <CardMedia component="img" image={item.image_url} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography fontWeight={800} fontSize="1.1rem">{item.name}</Typography>
                                            <Typography color="text.secondary" variant="body2">Qty: {item.quantity}</Typography>
                                        </Box>
                                        <Typography fontWeight={700}>₹{item.price}</Typography>
                                    </CardContent>
                                </Card>
                                ))}
                            </Box>

                            <Box sx={{ mt: 4, p: 3, bgcolor: '#f8f9fa', borderRadius: '16px', border: '1px dashed #ccc' }}>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>SHIPPING TO:</Typography>
                                <Typography variant="body2">{shippingInfo.firstName} {shippingInfo.lastName}</Typography>
                                <Typography variant="body2">{shippingInfo.address}, {shippingInfo.city}</Typography>
                                <Typography variant="body2">{shippingInfo.phone}</Typography>
                            </Box>
                        </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", mt: 6, pt: 4, borderTop: '1px solid #eee' }}>
                        <Button 
                            disabled={activeStep === 0} 
                            onClick={() => setActiveStep((p) => p - 1)}
                            startIcon={<ArrowBack />}
                            sx={{ color: '#000', fontWeight: 700 }}
                        >
                            Back
                        </Button>
                        
                        {activeStep === steps.length - 1 ? (
                            <Button 
                                variant="contained" 
                                onClick={handlePlaceOrder} 
                                disabled={loading}
                                sx={{ ...styles.actionBtn, bgcolor: 'black', color: 'white', '&:hover': { bgcolor: '#333' } }}
                            >
                                {loading ? <Typography sx={{ animation: 'pulse 1s infinite' }}>PROCESSING...</Typography> : `PAY ₹${totalAmount.toFixed(2)}`}
                            </Button>
                        ) : (
                            <Button 
                                variant="contained" 
                                onClick={handleNext}
                                sx={{ ...styles.actionBtn, bgcolor: 'black', color: 'white', '&:hover': { bgcolor: '#333' } }}
                            >
                                Continue
                            </Button>
                        )}
                    </Box>
                </Paper>
            </Grid>

            {/* RIGHT COLUMN: ORDER SUMMARY (Sticky) */}
            <Grid item xs={12} lg={4}>
                <Paper sx={{ 
                    ...styles.glassCard, 
                    position: { lg: 'sticky' }, 
                    top: '100px',
                    bgcolor: '#1a1a1a', // Dark theme for summary
                    color: '#fff',
                    border: '1px solid #333'
                }}>
                    <Typography variant="h6" sx={{ fontWeight: 900, mb: 4, letterSpacing: '1px' }}>ORDER SUMMARY</Typography>
                    
                    <Box sx={{ ...styles.summaryRow, color: '#aaa' }}>
                        <Typography>Subtotal</Typography>
                        <Typography sx={{ color: '#fff' }}>₹{subtotal.toFixed(2)}</Typography>
                    </Box>
                    
                    {/* MYSTERY GIFT PROMO */}
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        mb: 2,
                        p: 1.5,
                        borderRadius: '12px',
                        background: 'linear-gradient(45deg, rgba(255,255,255,0.05), rgba(255,255,255,0.1))',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ animation: 'bounce 2s infinite' }}>
                                <CardGiftcard sx={{ color: '#ff4081' }} />
                            </Box>
                            <Box>
                                <Typography variant="caption" sx={{ color: '#ff4081', fontWeight: 900, letterSpacing: '0.5px' }}>
                                    LIMITED OFFER
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem' }}>
                                    Delivery + Mystery Gift
                                </Typography>
                            </Box>
                         </Box>
                         <Typography sx={{ color: '#00e676', fontWeight: 900 }}>FREE</Typography>
                    </Box>

                    <Divider sx={{ borderColor: '#333', my: 3 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <Typography sx={{ color: '#aaa' }}>Total Amount</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 900 }}>₹{totalAmount.toFixed(2)}</Typography>
                    </Box>

                    {/* Trust Badges */}
                    <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center', opacity: 0.5 }}>
                       <Security fontSize="small" />
                       <Typography variant="caption">Guaranteed Secure Checkout</Typography>
                    </Box>
                </Paper>
            </Grid>

        </Grid>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
            severity={snackbar.type === "error" ? "error" : "success"} 
            variant="filled"
            sx={{ borderRadius: '50px', fontWeight: 700, px: 4, boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}
        >
          {snackbar.text}
        </Alert>
      </Snackbar>

      <style>{`
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
            40% {transform: translateY(-5px);}
            60% {transform: translateY(-3px);}
        }
      `}</style>
    </Box>
  );
}