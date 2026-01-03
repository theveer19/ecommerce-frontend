import React, { useEffect, useState, useCallback, useMemo } from "react";
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
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  Card,
  CardContent,
  CardMedia,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Container,
  InputAdornment,
  Checkbox,
  Divider,
  Badge,
  Snackbar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  ArrowBack,
  ShoppingBag,
  CreditCard,
  Money,
  LocalShipping,
  Security,
  VerifiedUser,
  CheckCircle,
  Warning,
  ExpandMore,
  LocationOn,
  Phone,
  Email,
  Person,
  Home,
  Business,
  Close,
  Lock,
  Payment,
  Receipt,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";

// Enhanced styles with black and white theme
const styles = {
  root: {
    minHeight: '100vh',
    background: '#FFFFFF',
    position: 'relative',
    overflow: 'hidden',
  },
  floatingElement1: {
    position: 'fixed',
    top: '10%',
    left: '5%',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0) 70%)',
    zIndex: 0,
    animation: 'float 20s ease-in-out infinite',
  },
  floatingElement2: {
    position: 'fixed',
    bottom: '10%',
    right: '5%',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0) 70%)',
    zIndex: 0,
    animation: 'float 25s ease-in-out infinite reverse',
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '20px',
    position: 'relative',
    zIndex: 1,
  },
  header: {
    textAlign: 'center',
    mb: 4,
    pt: 2,
  },
  title: {
    fontSize: { xs: '2rem', md: '3rem' },
    fontWeight: 800,
    color: '#000000',
    mb: 1,
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  subtitle: {
    color: '#666666',
    fontSize: '1.1rem',
    fontWeight: 400,
  },
  stepper: {
    background: '#FFFFFF',
    border: '1px solid #E5E5E5',
    borderRadius: '12px',
    p: 3,
    mb: 4,
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  stepIcon: {
    '&.Mui-active': {
      color: '#000000',
      transform: 'scale(1.1)',
    },
    '&.Mui-completed': {
      color: '#000000',
      transform: 'scale(1.1)',
    },
    transition: 'all 0.3s ease',
  },
  paper: {
    background: '#FFFFFF',
    border: '1px solid #E5E5E5',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    overflow: 'hidden',
  },
  formSection: {
    p: 4,
  },
  sectionTitle: {
    color: '#000000',
    fontWeight: 700,
    mb: 3,
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    fontSize: '1.3rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  textField: {
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      background: '#FFFFFF',
      '& fieldset': {
        borderColor: '#DDDDDD',
        borderWidth: '1px',
      },
      '&:hover fieldset': {
        borderColor: '#000000',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#000000',
        borderWidth: '1px',
      },
    },
    '& .MuiInputLabel-root': {
      color: '#666666',
      fontWeight: 500,
    },
    '& .MuiInputAdornment-root': {
      color: '#000000',
    },
  },
  paymentMethodCard: {
    border: '1px solid #DDDDDD',
    borderRadius: '8px',
    p: 3,
    mb: 2,
    background: '#FFFFFF',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    '&:hover': {
      borderColor: '#000000',
      background: '#FAFAFA',
      transform: 'translateY(-2px)',
    },
    '&.selected': {
      borderColor: '#000000',
      background: '#FAFAFA',
    },
  },
  paymentIcon: {
    fontSize: 32,
    color: '#000000',
    mb: 1,
  },
  orderSummary: {
    position: 'sticky',
    top: 100,
    background: '#FFFFFF',
    border: '1px solid #E5E5E5',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    p: 4,
    height: 'fit-content',
  },
  orderItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    mb: 2,
    p: 2,
    background: '#FAFAFA',
    borderRadius: '8px',
    border: '1px solid #EEEEEE',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: '8px',
    objectFit: 'cover',
    border: '1px solid #EEEEEE',
  },
  priceBreakdown: {
    background: '#FAFAFA',
    borderRadius: '8px',
    p: 3,
    border: '1px solid #EEEEEE',
  },
  totalAmount: {
    fontSize: '1.5rem',
    fontWeight: 800,
    color: '#000000',
  },
  trustBadge: {
    background: '#FAFAFA',
    border: '1px solid #E5E5E5',
    borderRadius: '8px',
    p: 2,
    textAlign: 'center',
    mt: 2,
    transition: 'all 0.3s ease',
    '&:hover': {
      background: '#F0F0F0',
      transform: 'translateY(-2px)',
    },
  },
  button: {
    borderRadius: '8px',
    px: 4,
    py: 1.5,
    fontWeight: 600,
    textTransform: 'uppercase',
    transition: 'all 0.3s ease',
    letterSpacing: '0.5px',
  },
  primaryButton: {
    background: '#000000',
    color: '#FFFFFF',
    border: '1px solid #000000',
    '&:hover': {
      background: '#333333',
      borderColor: '#333333',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    },
    '&:disabled': {
      background: '#CCCCCC',
      borderColor: '#CCCCCC',
      color: '#999999',
    },
  },
  secondaryButton: {
    color: '#666666',
    border: '1px solid #DDDDDD',
    background: '#FFFFFF',
    '&:hover': {
      background: '#FAFAFA',
      borderColor: '#000000',
      color: '#000000',
    },
  },
  accordion: {
    background: '#FAFAFA',
    borderRadius: '8px',
    border: '1px solid #E5E5E5',
    mb: 2,
    '&:before': {
      display: 'none',
    },
  },
  progressIndicator: {
    background: '#000000',
    height: '3px',
    borderRadius: '2px',
    transition: 'width 0.5s ease',
  },
  emptyCart: {
    textAlign: 'center',
    py: 10,
    background: '#FFFFFF',
    borderRadius: '12px',
    border: '2px dashed #DDDDDD',
  },
  badge: {
    '& .MuiBadge-badge': {
      background: '#000000',
      color: '#FFFFFF',
      fontWeight: 600,
      border: '2px solid #FFFFFF',
    },
  },
  chip: {
    background: '#000000',
    color: '#FFFFFF',
    fontWeight: 600,
    borderRadius: '4px',
  },
  snackbar: {
    borderRadius: '8px',
    background: '#FFFFFF',
    border: '1px solid #E5E5E5',
  },
  divider: {
    borderColor: '#EEEEEE',
  },
  alert: {
    borderRadius: '8px',
    '&.MuiAlert-standardError': {
      background: '#FFF5F5',
      border: '1px solid #FED7D7',
    },
    '&.MuiAlert-standardSuccess': {
      background: '#F0FFF4',
      border: '1px solid #C6F6D5',
    },
    '&.MuiAlert-standardInfo': {
      background: '#EBF8FF',
      border: '1px solid #BEE3F8',
    },
    '&.MuiAlert-standardWarning': {
      background: '#FFFBEB',
      border: '1px solid #FEF3C7',
    },
  },
};

const steps = ['Shipping Address', 'Payment Method', 'Review Order'];

// Backend URL
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://ecommerce-backend-qqhi.onrender.com";
const RAZORPAY_KEY = "rzp_live_RzGifw58xDx28e";
 // Use your live key

export default function CheckoutPage() {
  const { cartItems, clearCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const buyNowItem = location.state?.buyNowItem ?? null;
  const itemsToShow = useMemo(() => buyNowItem ? [buyNowItem] : (cartItems || []), [buyNowItem, cartItems]);

  const [activeStep, setActiveStep] = useState(0);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [progress, setProgress] = useState(0);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  // Form states
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    saveAddress: false,
  });

  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Calculate totals
  const subtotal = useMemo(() => itemsToShow.reduce((sum, item) => {
    const price = parseFloat(item.price) || 0;
    const qty = Number(item.quantity || 1);
    return sum + price * qty;
  }, 0), [itemsToShow]);

  const shippingFee = subtotal > 999 ? 0 : 50;
  const tax = subtotal * 0.18; // 18% GST
  const totalAmount = subtotal + shippingFee + tax;

  // Authentication check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const currentSession = data?.session ?? null;
        setSession(currentSession);
        
        if (currentSession?.user?.email) {
          setShippingInfo(prev => ({ 
            ...prev, 
            email: currentSession.user.email 
          }));
        }
      } catch (err) {
        console.error("Error getting session:", err);
      }
    };

    checkAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      if (listener?.subscription?.unsubscribe) {
        listener.subscription.unsubscribe();
      }
    };
  }, []);

  // Progress tracking
  useEffect(() => {
    const progress = ((activeStep + 1) / steps.length) * 100;
    setProgress(progress);
  }, [activeStep]);

  // Load Razorpay script on component mount
  useEffect(() => {
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        if (window.Razorpay) {
          console.log("✅ Razorpay already loaded");
          setRazorpayLoaded(true);
          return resolve(true);
        }

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        
        script.onload = () => {
          console.log("✅ Razorpay SDK loaded");
          setRazorpayLoaded(true);
          resolve(true);
        };
        
        script.onerror = (error) => {
          console.error("❌ Failed to load Razorpay script:", error);
          setRazorpayLoaded(false);
          resolve(false);
        };
        
        document.body.appendChild(script);
      });
    };

    loadRazorpayScript();
  }, []);

  // Show message in snackbar
  const showMessage = useCallback((type, text) => {
    setMessage({ type, text });
    setShowSnackbar(true);
  }, []);

  // Form validation
  const validateStep = useCallback((step) => {
    switch (step) {
      case 0: // Shipping Address
        const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipCode'];
        const missingFields = requiredFields.filter(field => !shippingInfo[field]);
        
        if (missingFields.length > 0) {
          showMessage('error', 'Please fill in all required fields');
          return false;
        }
        
        if (!/^\S+@\S+\.\S+$/.test(shippingInfo.email)) {
          showMessage('error', 'Please enter a valid email address');
          return false;
        }
        
        if (!/^\d{10}$/.test(shippingInfo.phone)) {
          showMessage('error', 'Please enter a valid 10-digit phone number');
          return false;
        }
        
        return true;

      case 1: // Payment Method
        if (!paymentMethod) {
          showMessage('error', 'Please select a payment method');
          return false;
        }
        return true;

      default:
        return true;
    }
  }, [shippingInfo, paymentMethod, showMessage]);

  const handleNext = useCallback(() => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
      setMessage({ type: '', text: '' });
      setShowSnackbar(false);
    }
  }, [activeStep, validateStep]);

  const handleBack = useCallback(() => {
    setActiveStep((prevStep) => prevStep - 1);
    setMessage({ type: '', text: '' });
    setShowSnackbar(false);
  }, []);

  const handleShippingChange = useCallback((field, value) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
  }, []);

  const handlePaymentMethodChange = useCallback((method) => {
    setPaymentMethod(method);
  }, []);

  // ✅ FIXED: Save order to backend
  const saveOrderToBackend = useCallback(async (paymentMethod, paymentId = null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Prepare order payload
      const orderPayload = {
        user_id: user?.id || null,
        items: itemsToShow.map(item => ({
          id: item.id || `prod_${Date.now()}`,
          name: item.name || item.title || "Product",
          price: parseFloat(item.price) || 0,
          quantity: Number(item.quantity) || 1,
          image: item.image_url || item.images?.[0] || "https://via.placeholder.com/150",
        })),
        total_amount: parseFloat(totalAmount.toFixed(2)),
        subtotal: parseFloat(subtotal.toFixed(2)),
        shipping_fee: parseFloat(shippingFee.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        shipping_info: {
          name: `${shippingInfo.firstName} ${shippingInfo.lastName}`.trim(),
          email: shippingInfo.email,
          phone: shippingInfo.phone,
          address: shippingInfo.address,
          city: shippingInfo.city,
          state: shippingInfo.state,
          pincode: shippingInfo.zipCode,
          country: shippingInfo.country,
        },
        payment_method: paymentMethod,
        payment_id: paymentId,
        status: paymentMethod === 'cod' ? 'pending' : 'confirmed',
      };

      console.log('📦 Saving order to backend:', orderPayload);

      // Call backend to save order
      const response = await fetch(`${BACKEND_URL}/save-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Failed to save order');
      }

      console.log('✅ Order saved successfully:', result);
      return result.order || result.data;

    } catch (err) {
      console.error('❌ Save order failed:', err);
      throw err;
    }
  }, [itemsToShow, totalAmount, subtotal, shippingFee, tax, shippingInfo]);

  // ✅ FIXED: Handle Cash on Delivery
  const handleCODPayment = useCallback(async () => {
    setLoading(true);
    setPaymentProcessing(true);
    showMessage('info', 'Processing your COD order...');
    
    try {
      const orderData = await saveOrderToBackend("cod");
      
      if (orderData) {
        // Clear cart if not buy now
        if (!buyNowItem) {
          clearCart();
        }
        
        // Navigate to thank you page
        navigate("/thank-you", { 
          state: { 
            orderDetails: {
              id: orderData.id,
              order_number: orderData.order_number,
              total_amount: totalAmount,
              items: itemsToShow,
              shipping_info: shippingInfo,
              payment_method: "Cash on Delivery",
              payment_id: null,
              status: 'pending',
              created_at: orderData.created_at || new Date().toISOString(),
            } 
          } 
        });
      } else {
        throw new Error("Failed to create order");
      }
    } catch (err) {
      console.error("COD payment error:", err);
      showMessage('error', `Order failed: ${err.message || 'Please try again'}`);
    } finally {
      setLoading(false);
      setPaymentProcessing(false);
    }
  }, [saveOrderToBackend, buyNowItem, clearCart, navigate, itemsToShow, totalAmount, shippingInfo, showMessage]);

  // ✅ FIXED: Razorpay Payment Handler (WORKING VERSION)
  const handleRazorpayPayment = useCallback(async () => {
    console.log("💰 Starting Razorpay payment process...");
    
    setLoading(true);
    setPaymentProcessing(true);
    setPaymentDialog(true);
    showMessage('info', 'Initializing payment gateway...');

    try {
      // Check if Razorpay is loaded
      if (!window.Razorpay && !razorpayLoaded) {
        throw new Error("Payment gateway not loaded. Please refresh the page.");
      }

      // Wait a moment for Razorpay to be ready
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 1: Create order with backend
      console.log("📦 Creating order with backend...");
      const orderRes = await fetch(`${BACKEND_URL}/create-order`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          amount: totalAmount
        }),
      });

      if (!orderRes.ok) {
        const errorData = await orderRes.json();
        console.error("❌ Backend create-order error:", errorData);
        throw new Error(errorData.error || errorData.message || "Failed to create payment order");
      }

      const orderData = await orderRes.json();
      console.log("✅ Backend response:", orderData);

      // ✅ Correct validation for Razorpay response
if (!orderData.id || !orderData.amount) {
  throw new Error("Invalid order response from server");
}

const razorpayOrder = orderData;


      // Step 2: Prepare payment options
      const options = {
        key: RAZORPAY_TEST_KEY, // Your Razorpay test key
        amount: razorpayOrder.amount,
        currency: "INR",
        order_id: razorpayOrder.id,
        name: "ONE-T Fashion Store",
        description: "Order Payment",
        image: "https://cdn-icons-png.flaticon.com/512/2456/2456702.png",
        handler: async function (response) {
          console.log("✅ Payment successful response:", response);
          setPaymentStatus('success');
          showMessage('success', 'Payment successful! Saving your order...');
          
          try {
            // Step 3: Save order to database
            const savedOrder = await saveOrderToBackend("razorpay", response.razorpay_payment_id);
            
            if (savedOrder) {
              // Clear cart if not buy now
              if (!buyNowItem) {
                clearCart();
              }
              
              // Close payment dialog
              setPaymentDialog(false);
              
              // Navigate to thank you page
              setTimeout(() => {
                navigate("/thank-you", { 
                  state: { 
                    orderDetails: {
                      id: savedOrder.id,
                      order_number: savedOrder.order_number,
                      total_amount: totalAmount,
                      items: itemsToShow,
                      shipping_info: shippingInfo,
                      payment_method: "Razorpay",
                      payment_id: response.razorpay_payment_id,
                      status: 'confirmed',
                      created_at: savedOrder.created_at || new Date().toISOString(),
                    } 
                  } 
                });
              }, 1500);
            }
          } catch (saveError) {
            console.error("❌ Error saving order after payment:", saveError);
            showMessage('error', 'Payment successful but order save failed. Please contact support.');
            setPaymentStatus('error');
          } finally {
            setLoading(false);
            setPaymentProcessing(false);
          }
        },
        prefill: {
          name: `${shippingInfo.firstName} ${shippingInfo.lastName}`.trim(),
          email: shippingInfo.email,
          contact: shippingInfo.phone,
        },
        notes: {
          address: shippingInfo.address,
        },
        theme: {
          color: "#000000",
          backdrop_color: "#FFFFFF",
        },
        modal: {
          ondismiss: function() {
            console.log("Payment modal dismissed by user");
            setPaymentDialog(false);
            setPaymentStatus('cancelled');
            showMessage('info', 'Payment cancelled');
            setLoading(false);
            setPaymentProcessing(false);
          },
          escape: true,
          backdropclose: true,
        }
      };

      // Add payment failure handler
      options.modal.ondismiss = function() {
        console.log("Payment modal closed");
        setPaymentDialog(false);
        showMessage('info', 'Payment cancelled');
        setLoading(false);
        setPaymentProcessing(false);
      };

      // Step 4: Create and open Razorpay instance
      console.log("🔄 Opening Razorpay modal...");
      const rzp = new window.Razorpay(options);
      
      // Listen for payment failure
      rzp.on('payment.failed', function (response) {
        console.error("❌ Payment failed:", response.error);
        setPaymentStatus('failed');
        showMessage('error', `Payment failed: ${response.error.description || 'Please try again'}`);
        setLoading(false);
        setPaymentProcessing(false);
      });

      // Open the payment modal
      rzp.open();
      
      // Store reference for cleanup
      window.currentRzp = rzp;

    } catch (error) {
      console.error("❌ Razorpay initialization error:", error);
      setPaymentDialog(false);
      showMessage('error', `Payment failed: ${error.message || 'Please try again'}`);
      setLoading(false);
      setPaymentProcessing(false);
    }
  }, [razorpayLoaded, totalAmount, saveOrderToBackend, buyNowItem, clearCart, navigate, itemsToShow, shippingInfo, showMessage]);

  // Handle final order placement
  const handlePlaceOrder = useCallback(async () => {
    if (paymentMethod === 'razorpay') {
      await handleRazorpayPayment();
    } else if (paymentMethod === 'cod') {
      await handleCODPayment();
    }
  }, [paymentMethod, handleRazorpayPayment, handleCODPayment]);

  // Render step content
  const renderStepContent = useCallback((step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={styles.formSection}>
            <Typography variant="h6" sx={styles.sectionTitle}>
              <LocationOn sx={{ color: '#000000' }} />
              Shipping Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="First Name"
                  value={shippingInfo.firstName}
                  onChange={(e) => handleShippingChange('firstName', e.target.value)}
                  sx={styles.textField}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: '#000000' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Last Name"
                  value={shippingInfo.lastName}
                  onChange={(e) => handleShippingChange('lastName', e.target.value)}
                  sx={styles.textField}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: '#000000' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={shippingInfo.email}
                  onChange={(e) => handleShippingChange('email', e.target.value)}
                  sx={styles.textField}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: '#000000' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Phone Number"
                  value={shippingInfo.phone}
                  onChange={(e) => handleShippingChange('phone', e.target.value)}
                  placeholder="10-digit mobile number"
                  sx={styles.textField}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone sx={{ color: '#000000' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Street Address"
                  multiline
                  rows={2}
                  value={shippingInfo.address}
                  onChange={(e) => handleShippingChange('address', e.target.value)}
                  sx={styles.textField}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Home sx={{ color: '#000000' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="City"
                  value={shippingInfo.city}
                  onChange={(e) => handleShippingChange('city', e.target.value)}
                  sx={styles.textField}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="State"
                  value={shippingInfo.state}
                  onChange={(e) => handleShippingChange('state', e.target.value)}
                  sx={styles.textField}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="ZIP / Postal Code"
                  value={shippingInfo.zipCode}
                  onChange={(e) => handleShippingChange('zipCode', e.target.value)}
                  sx={styles.textField}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Country"
                  value={shippingInfo.country}
                  onChange={(e) => handleShippingChange('country', e.target.value)}
                  sx={styles.textField}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Business sx={{ color: '#000000' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={shippingInfo.saveAddress}
                      onChange={(e) => handleShippingChange('saveAddress', e.target.checked)}
                      sx={{
                        color: '#666666',
                        '&.Mui-checked': {
                          color: '#000000',
                        },
                      }}
                    />
                  }
                  label="Save this address for future orders"
                  sx={{ color: '#666666' }}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box sx={styles.formSection}>
            <Typography variant="h6" sx={styles.sectionTitle}>
              <CreditCard sx={{ color: '#000000' }} />
              Select Payment Method
            </Typography>
            
            <FormControl component="fieldset" sx={{ width: '100%' }}>
              <FormLabel component="legend" sx={{ color: '#666666', mb: 3, fontSize: '1.1rem' }}>
                Choose how you want to pay
              </FormLabel>
              <RadioGroup value={paymentMethod} onChange={(e) => handlePaymentMethodChange(e.target.value)}>
                <Paper 
                  sx={{
                    ...styles.paymentMethodCard,
                    ...(paymentMethod === 'razorpay' ? { borderColor: '#000000', background: '#FAFAFA' } : {}),
                  }}
                >
                  <FormControlLabel
                    value="razorpay"
                    control={<Radio sx={{ color: '#000000' }} />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <CreditCard sx={styles.paymentIcon} />
                        <Box>
                          <Typography sx={{ color: '#000000', fontWeight: 'bold', fontSize: '1.1rem' }}>
                            Credit/Debit Card & UPI
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#666666' }}>
                            Secure payment with Razorpay
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <Chip label="Visa" size="small" variant="outlined" sx={{ color: '#000000', borderColor: '#000000' }} />
                            <Chip label="Mastercard" size="small" variant="outlined" sx={{ color: '#000000', borderColor: '#000000' }} />
                            <Chip label="UPI" size="small" variant="outlined" sx={{ color: '#000000', borderColor: '#000000' }} />
                          </Box>
                          <Typography variant="caption" sx={{ color: '#666666', display: 'block', mt: 1 }}>
                            Test Card: 4111 1111 1111 1111
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                </Paper>
                
                <Paper 
                  sx={{
                    ...styles.paymentMethodCard,
                    ...(paymentMethod === 'cod' ? { borderColor: '#000000', background: '#FAFAFA' } : {}),
                  }}
                >
                  <FormControlLabel
                    value="cod"
                    control={<Radio sx={{ color: '#000000' }} />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Money sx={styles.paymentIcon} />
                        <Box>
                          <Typography sx={{ color: '#000000', fontWeight: 'bold', fontSize: '1.1rem' }}>
                            Cash on Delivery
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#666666' }}>
                            Pay when you receive your order
                          </Typography>
                          <Chip 
                            label="No extra charges" 
                            size="small" 
                            variant="outlined" 
                            sx={{ color: '#000000', borderColor: '#000000', mt: 1 }} 
                          />
                        </Box>
                      </Box>
                    }
                  />
                </Paper>
              </RadioGroup>
            </FormControl>

            {/* Payment Security Info */}
            <Box sx={{ mt: 4 }}>
              <Accordion sx={styles.accordion}>
                <AccordionSummary expandIcon={<ExpandMore sx={{ color: '#000000' }} />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Security sx={{ color: '#000000' }} />
                    <Typography sx={{ color: '#000000', fontWeight: 600 }}>
                      Payment Security
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle sx={{ color: '#000000' }} />
                      </ListItemIcon>
                      <ListItemText primary="SSL Encrypted Transactions" sx={{ color: '#666666' }} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle sx={{ color: '#000000' }} />
                      </ListItemIcon>
                      <ListItemText primary="PCI DSS Compliant" sx={{ color: '#666666' }} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle sx={{ color: '#000000' }} />
                      </ListItemIcon>
                      <ListItemText primary="No card details stored" sx={{ color: '#666666' }} />
                    </ListItem>
                  </List>
                </AccordionDetails>
              </Accordion>
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box sx={styles.formSection}>
            <Typography variant="h6" sx={styles.sectionTitle}>
              <CheckCircle sx={{ color: '#000000' }} />
              Review Your Order
            </Typography>
            
            {/* Order Items */}
            <Card sx={{ mb: 3, background: '#FAFAFA' }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#000000', mb: 2, fontWeight: 600 }}>
                  Order Items ({itemsToShow.length})
                </Typography>
                {itemsToShow.map((item, index) => (
                  <Box key={index} sx={styles.orderItem}>
                    <CardMedia
                      component="img"
                      image={item.image_url || item.images?.[0] || "https://via.placeholder.com/60x60?text=No+Image"}
                      alt={item.name}
                      sx={styles.itemImage}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ color: '#000000', fontWeight: 'bold', mb: 0.5 }}>
                        {item.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#666666' }}>
                          Qty: {item.quantity || 1}
                        </Typography>
                        {item.discount > 0 && (
                          <Chip 
                            label={`${item.discount}% OFF`} 
                            size="small" 
                            sx={styles.chip} 
                          />
                        )}
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography sx={{ color: '#000000', fontWeight: 'bold', fontSize: '1.1rem' }}>
                        ₹{(item.price * (item.quantity || 1)).toFixed(2)}
                      </Typography>
                      {item.originalPrice && (
                        <Typography variant="body2" sx={{ color: '#999999', textDecoration: 'line-through' }}>
                          ₹{(item.originalPrice * (item.quantity || 1)).toFixed(2)}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card sx={{ mb: 3, background: '#FAFAFA' }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#000000', mb: 2, fontWeight: 600 }}>
                  Shipping Address
                </Typography>
                <Box sx={{ color: '#000000' }}>
                  <Typography sx={{ fontWeight: 'bold', mb: 1 }}>
                    {shippingInfo.firstName} {shippingInfo.lastName}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    {shippingInfo.address}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    {shippingInfo.country}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Chip 
                      icon={<Phone />} 
                      label={shippingInfo.phone} 
                      variant="outlined" 
                      sx={{ color: '#000000', borderColor: '#000000' }} 
                    />
                    <Chip 
                      icon={<Email />} 
                      label={shippingInfo.email} 
                      variant="outlined" 
                      sx={{ color: '#000000', borderColor: '#000000' }} 
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card sx={{ mb: 3, background: '#FAFAFA' }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#000000', mb: 2, fontWeight: 600 }}>
                  Payment Method
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {paymentMethod === 'razorpay' ? (
                    <>
                      <CreditCard sx={{ color: '#000000', fontSize: 32 }} />
                      <Box>
                        <Typography sx={{ color: '#000000', fontWeight: 'bold' }}>
                          Credit/Debit Card & UPI
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666666' }}>
                          Secure payment with Razorpay
                        </Typography>
                      </Box>
                    </>
                  ) : (
                    <>
                      <Money sx={{ color: '#000000', fontSize: 32 }} />
                      <Box>
                        <Typography sx={{ color: '#000000', fontWeight: 'bold' }}>
                          Cash on Delivery
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666666' }}>
                          Pay when you receive your order
                        </Typography>
                      </Box>
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* Final Order Summary */}
            <Card sx={{ background: '#FAFAFA' }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#000000', mb: 2, fontWeight: 600 }}>
                  Order Summary
                </Typography>
                <Box sx={styles.priceBreakdown}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: '#666666' }}>
                      Subtotal
                    </Typography>
                    <Typography sx={{ color: '#000000', fontWeight: 600 }}>
                      ₹{subtotal.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: '#666666' }}>
                      Shipping
                    </Typography>
                    <Typography sx={{ color: '#000000', fontWeight: 600 }}>
                      {shippingFee === 0 ? (
                        <Chip label="FREE" size="small" sx={{ background: '#000000', color: '#FFFFFF' }} />
                      ) : (
                        `₹${shippingFee.toFixed(2)}`
                      )}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: '#666666' }}>
                      GST (18%)
                    </Typography>
                    <Typography sx={{ color: '#000000', fontWeight: 600 }}>
                      ₹{tax.toFixed(2)}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2, borderColor: '#EEEEEE' }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" sx={{ color: '#000000', fontWeight: 'bold' }}>
                      Total
                    </Typography>
                    <Typography variant="h6" sx={styles.totalAmount}>
                      ₹{totalAmount.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Trust Badges */}
            <Box sx={{ mt: 4 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Box sx={styles.trustBadge}>
                    <Security sx={{ color: '#000000', fontSize: 24, mb: 1 }} />
                    <Typography variant="body2" sx={{ color: '#000000', fontWeight: 600 }}>
                      Secure Payment
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={styles.trustBadge}>
                    <LocalShipping sx={{ color: '#000000', fontSize: 24, mb: 1 }} />
                    <Typography variant="body2" sx={{ color: '#000000', fontWeight: 600 }}>
                      Fast Delivery
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={styles.trustBadge}>
                    <VerifiedUser sx={{ color: '#000000', fontSize: 24, mb: 1 }} />
                    <Typography variant="body2" sx={{ color: '#000000', fontWeight: 600 }}>
                      Quality Guarantee
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  }, [shippingInfo, paymentMethod, itemsToShow, subtotal, shippingFee, tax, totalAmount, handleShippingChange, handlePaymentMethodChange]);

  // Handle empty cart
  if (!session) {
    return (
      <Box sx={styles.root}>
        <Container sx={styles.container}>
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Warning sx={{ fontSize: 80, color: '#000000', opacity: 0.5, mb: 3 }} />
            <Typography variant="h4" sx={{ color: '#000000', mb: 2 }}>
              Please Sign In
            </Typography>
            <Typography variant="body1" sx={{ color: '#666666', mb: 4 }}>
              Please sign in to continue with checkout
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate("/login", { state: { returnTo: '/checkout' } })}
              sx={styles.primaryButton}
            >
              Sign In to Continue
            </Button>
          </Box>
        </Container>
      </Box>
    );
  }

  if (itemsToShow.length === 0) {
    return (
      <Box sx={styles.root}>
        <Container sx={styles.container}>
          <Box sx={styles.emptyCart}>
            <ShoppingBag sx={{ fontSize: 80, color: '#000000', opacity: 0.3, mb: 3 }} />
            <Typography variant="h4" sx={{ color: '#000000', mb: 2 }}>
              Your cart is empty
            </Typography>
            <Typography variant="body1" sx={{ color: '#666666', mb: 4 }}>
              Discover our collection of premium fashion
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate("/products")}
              sx={styles.primaryButton}
            >
              Start Shopping
            </Button>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={styles.root}>
      {/* Floating decorative elements */}
      <Box sx={styles.floatingElement1} />
      <Box sx={styles.floatingElement2} />

      <Container sx={styles.container}>
        {/* Header */}
        <Box sx={styles.header}>
          <Typography variant="h3" sx={styles.title}>
            Secure Checkout
          </Typography>
          <Typography variant="body1" sx={styles.subtitle}>
            Complete your purchase in just a few steps
          </Typography>
          
          {/* Progress Bar */}
          <Box sx={{ maxWidth: 600, mx: 'auto', mt: 3 }}>
            <Box sx={{ ...styles.progressIndicator, width: `${progress}%` }} />
          </Box>
        </Box>

        <Grid container spacing={4}>
          {/* Left Column - Checkout Steps */}
          <Grid item xs={12} lg={8}>
            <Paper sx={styles.paper}>
              {/* Stepper */}
              <Stepper activeStep={activeStep} sx={styles.stepper}>
                {steps.map((label, index) => (
                  <Step key={label}>
                    <StepLabel 
                      StepIconProps={{
                        sx: styles.stepIcon,
                      }}
                    >
                      {label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>

              {/* Step Content */}
              {renderStepContent(activeStep)}

              {/* Navigation Buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  disabled={activeStep === 0 || loading || paymentProcessing}
                  onClick={handleBack}
                  startIcon={<ArrowBack />}
                  sx={styles.secondaryButton}
                >
                  Back
                </Button>

                <Box>
                  {activeStep === steps.length - 1 ? (
                    <Button
                      variant="contained"
                      onClick={handlePlaceOrder}
                      disabled={loading || paymentProcessing}
                      startIcon={paymentProcessing ? <CircularProgress size={20} /> : <Payment />}
                      sx={styles.primaryButton}
                    >
                      {paymentProcessing ? 'Processing...' : `Place Order - ₹${totalAmount.toFixed(2)}`}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      sx={styles.primaryButton}
                    >
                      Continue to {steps[activeStep + 1]}
                    </Button>
                  )}
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Right Column - Order Summary */}
          <Grid item xs={12} lg={4}>
            <Paper sx={styles.orderSummary}>
              <Typography variant="h6" sx={{ color: '#000000', mb: 3, fontWeight: 'bold', fontSize: '1.3rem' }}>
                Order Summary
              </Typography>

              {/* Order Items */}
              <Box sx={{ mb: 3, maxHeight: 300, overflowY: 'auto' }}>
                {itemsToShow.map((item, index) => (
                  <Box key={index} sx={styles.orderItem}>
                    <Badge 
                      badgeContent={item.quantity || 1} 
                      color="primary"
                      sx={styles.badge}
                    >
                      <CardMedia
                        component="img"
                        image={item.image_url || item.images?.[0] || "https://via.placeholder.com/40x40?text=Product"}
                        alt={item.name}
                        sx={styles.itemImage}
                      />
                    </Badge>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ color: '#000000', fontWeight: 'bold', mb: 0.5 }}>
                        {item.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#666666' }}>
                        {item.brand || 'Premium Brand'}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#000000', fontWeight: 'bold' }}>
                      ₹{(item.price * (item.quantity || 1)).toFixed(2)}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Divider sx={{ borderColor: '#EEEEEE', my: 2 }} />

              {/* Price Breakdown */}
              <Box sx={styles.priceBreakdown}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#666666' }}>
                    Subtotal
                  </Typography>
                  <Typography sx={{ color: '#000000', fontWeight: 600 }}>
                    ₹{subtotal.toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#666666' }}>
                    Shipping
                  </Typography>
                  <Typography sx={{ color: '#000000', fontWeight: 600 }}>
                    {shippingFee === 0 ? (
                      <Chip label="FREE" size="small" sx={{ background: '#000000', color: '#FFFFFF', fontWeight: 600 }} />
                    ) : (
                      `₹${shippingFee.toFixed(2)}`
                    )}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#666666' }}>
                    GST (18%)
                  </Typography>
                  <Typography sx={{ color: '#000000', fontWeight: 600 }}>
                    ₹{tax.toFixed(2)}
                  </Typography>
                </Box>
                <Divider sx={{ borderColor: '#EEEEEE', my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6" sx={{ color: '#000000', fontWeight: 'bold' }}>
                    Total
                  </Typography>
                  <Typography variant="h6" sx={styles.totalAmount}>
                    ₹{totalAmount.toFixed(2)}
                    <Typography variant="caption" sx={{ color: '#666666', ml: 1 }}>
                      (including all taxes)
                    </Typography>
                  </Typography>
                </Box>
              </Box>

              {/* Free Shipping Notice */}
              {subtotal < 999 && (
                <Alert 
                  severity="info" 
                  sx={{ 
                    mt: 2, 
                    background: '#FAFAFA',
                    border: '1px solid #E5E5E5',
                    borderRadius: '8px',
                    '& .MuiAlert-icon': {
                      color: '#666666',
                    },
                    ...styles.alert
                  }}
                >
                  Add ₹{(999 - subtotal).toFixed(2)} more for FREE shipping!
                </Alert>
              )}

              {/* Trust Badges */}
              <Box sx={{ mt: 4 }}>
                <Typography variant="subtitle2" sx={{ color: '#666666', mb: 2, fontWeight: 600 }}>
                  Why shop with us?
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={styles.trustBadge}>
                      <Lock sx={{ color: '#000000', fontSize: 24, mb: 1 }} />
                      <Typography variant="body2" sx={{ color: '#000000', fontWeight: 600 }}>
                        100% Secure
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={styles.trustBadge}>
                      <Receipt sx={{ color: '#000000', fontSize: 24, mb: 1 }} />
                      <Typography variant="body2" sx={{ color: '#000000', fontWeight: 600 }}>
                        Easy Returns
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Payment Processing Dialog */}
      <Dialog 
        open={paymentDialog} 
        onClose={() => !paymentProcessing && setPaymentDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', borderBottom: '1px solid #EEEEEE' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <CircularProgress size={40} sx={{ color: '#000000' }} />
          </Box>
          <Typography variant="h6" sx={{ color: '#000000', fontWeight: 600 }}>
            Processing Payment
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <Typography sx={{ color: '#666666', mb: 2 }}>
            Please wait while we process your payment...
          </Typography>
          <Typography variant="body2" sx={{ color: '#999999' }}>
            Do not close this window or refresh the page.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button 
            onClick={() => setPaymentDialog(false)} 
            disabled={paymentProcessing}
            sx={styles.secondaryButton}
          >
            Cancel Payment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for messages */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={styles.snackbar}
      >
        <Alert
          severity={message.type}
          onClose={() => setShowSnackbar(false)}
          action={
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={() => setShowSnackbar(false)}
            >
              <Close fontSize="small" />
            </IconButton>
          }
          sx={styles.alert}
        >
          {message.text}
        </Alert>
      </Snackbar>

      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
          }
        `}
      </style>
    </Box>
  );
}