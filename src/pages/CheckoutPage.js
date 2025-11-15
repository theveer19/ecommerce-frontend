import React, { useEffect, useState } from "react";
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
  Divider,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";

// Change this to your deployed backend if needed
const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || "https://ecommerce-backend-3v0q.onrender.com";

const steps = ['Shipping Address', 'Payment Method', 'Review Order'];

export default function CheckoutPage() {
  const { cartItems, clearCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  // Expecting ProductDetailsPage to send { buyNowItem: {...} }
  const buyNowItem = location.state?.buyNowItem ?? null;

  const [activeStep, setActiveStep] = useState(0);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

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
  });

  const [paymentMethod, setPaymentMethod] = useState('razorpay');

  // Compute total
  const itemsToShow = buyNowItem ? [buyNowItem] : (cartItems || []);
  const subtotal = itemsToShow.reduce((sum, item) => {
    const price = parseFloat(item.price) || 0;
    const qty = Number(item.quantity || 1);
    return sum + price * qty;
  }, 0);

  const shippingFee = subtotal > 999 ? 0 : 50;
  const tax = subtotal * 0.18; // 18% GST
  const totalAmount = subtotal + shippingFee + tax;

  // Check authentication and fetch user data
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/");
        return;
      }
      setSession(session);
      
      // Prefill email if available
      if (session.user?.email) {
        setShippingInfo(prev => ({ ...prev, email: session.user.email }));
      }
    };
    checkAuth();
  }, [navigate]);

  // Form validation
  const validateStep = (step) => {
    switch (step) {
      case 0: // Shipping Address
        const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipCode'];
        const missingFields = requiredFields.filter(field => !shippingInfo[field]);
        if (missingFields.length > 0) {
          setMessage({ type: 'error', text: 'Please fill all required fields' });
          return false;
        }
        if (!/^\d{10}$/.test(shippingInfo.phone)) {
          setMessage({ type: 'error', text: 'Please enter a valid 10-digit phone number' });
          return false;
        }
        return true;

      case 1: // Payment Method
        if (!paymentMethod) {
          setMessage({ type: 'error', text: 'Please select a payment method' });
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
      setMessage({ type: '', text: '' });
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setMessage({ type: '', text: '' });
  };

  const handleShippingChange = (field, value) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
  };

  // Fallback function using backend for order saving
  const saveOrderViaBackend = async (paymentMethod, paymentId = "") => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const itemsToSave = buyNowItem ? [buyNowItem] : cartItems;
      
      const orderData = {
        user_id: user?.id,
        items: itemsToSave,
        total_amount: totalAmount,
        subtotal: subtotal,
        shipping_fee: shippingFee,
        tax: tax,
        shipping_info: shippingInfo,
        payment_method: paymentMethod,
        payment_id: paymentId,
        status: 'confirmed'
      };

      console.log('Saving order via backend:', orderData);

      const response = await fetch(`${BACKEND_URL}/save-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Backend order failed');
      }
      
      console.log('Backend order save successful:', result);
      return result.order;
    } catch (err) {
      console.error('Backend order save failed:', err);
      throw err;
    }
  };

  // Save order to Supabase directly (for COD)
  const saveOrderToSupabase = async (paymentMethod, paymentId = "") => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      const itemsToSave = buyNowItem ? [buyNowItem] : cartItems;

      // Prepare minimal order data to avoid column errors
      const orderData = {
        user_id: user.id,
        items: itemsToSave,
        total_amount: totalAmount,
        payment_method: paymentMethod,
        status: 'confirmed',
      };

      // Only add optional fields if they exist in the table
      if (shippingInfo) orderData.shipping_info = shippingInfo;
      if (paymentId) orderData.payment_id = paymentId;

      console.log('Saving order to Supabase:', orderData);

      const { data, error } = await supabase
        .from("orders")
        .insert([orderData])
        .select();

      if (error) {
        console.error("Supabase insert error:", error);
        
        // If column error, try the backend endpoint
        if (error.message.includes('column') && error.message.includes('does not exist')) {
          console.log('Column missing, trying backend endpoint...');
          return await saveOrderViaBackend(paymentMethod, paymentId);
        }
        
        throw error;
      }

      return data?.[0];
    } catch (err) {
      console.error("Failed to save order to Supabase:", err);
      throw err;
    }
  };

  // Handle Cash on Delivery
  const handleCODPayment = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      console.log('Starting COD payment process...');
      
      // Try direct Supabase first, then fallback to backend
      let order;
      try {
        order = await saveOrderToSupabase("Cash on Delivery");
      } catch (supabaseError) {
        console.log('Supabase failed, trying backend...', supabaseError);
        order = await saveOrderViaBackend("Cash on Delivery");
      }
      
      if (order) {
        console.log('COD order saved successfully:', order);
        
        // Only clear the cart when the order was placed from the cart (not buyNow)
        if (!buyNowItem) {
          clearCart();
        }
        
        // Navigate to thank-you page with order details
        navigate("/thank-you", { 
          state: { 
            orderDetails: {
              id: order.id,
              total_amount: totalAmount,
              items: buyNowItem ? [buyNowItem] : cartItems,
              shipping_info: shippingInfo,
              payment_method: "Cash on Delivery",
              status: 'confirmed'
            } 
          } 
        });
      } else {
        throw new Error("Failed to create order");
      }
    } catch (err) {
      console.error("COD payment error:", err);
      setMessage({ 
        type: 'error', 
        text: `COD order failed: ${err.message || 'Please try again'}` 
      });
    } finally {
      setLoading(false);
    }
  };

  // Load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Handle Razorpay payment
  const handleRazorpayPayment = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    const sdkLoaded = await loadRazorpayScript();
    
    if (!sdkLoaded) {
      setMessage({ type: 'error', text: 'Razorpay SDK failed to load' });
      setLoading(false);
      return;
    }

    try {
      const orderRes = await fetch(`${BACKEND_URL}/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalAmount }),
      });

      if (!orderRes.ok) {
        throw new Error("Failed to create Razorpay order");
      }

      const order = await orderRes.json();

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY || "rzp_test_AiMI5J5tPyfEYz",
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: "LUXE Fashion",
        description: "Order Payment",
        handler: async function (response) {
          try {
            // Save order with payment ID
            let savedOrder;
            try {
              savedOrder = await saveOrderToSupabase("Razorpay", response.razorpay_payment_id);
            } catch (supabaseError) {
              console.log('Supabase failed, trying backend...', supabaseError);
              savedOrder = await saveOrderViaBackend("Razorpay", response.razorpay_payment_id);
            }
            
            if (savedOrder) {
              if (!buyNowItem) clearCart();
              navigate("/thank-you", { 
                state: { 
                  orderDetails: {
                    id: savedOrder.id,
                    total_amount: totalAmount,
                    items: buyNowItem ? [buyNowItem] : cartItems,
                    shipping_info: shippingInfo,
                    payment_method: "Razorpay",
                    payment_id: response.razorpay_payment_id,
                    status: 'confirmed'
                  } 
                } 
              });
            }
          } catch (err) {
            console.error("Error saving Razorpay order:", err);
            setMessage({ type: 'error', text: 'Payment successful but order save failed' });
          }
        },
        prefill: {
          name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
          email: shippingInfo.email,
          contact: shippingInfo.phone,
        },
        theme: { color: "#3399cc" },
        modal: {
          ondismiss: function() {
            setLoading(false);
            setMessage({ type: 'info', text: 'Payment cancelled' });
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error("Razorpay error:", err);
      setMessage({ type: 'error', text: 'Payment failed. Please try again.' });
      setLoading(false);
    }
  };

  // Handle final order placement
  const handlePlaceOrder = async () => {
    if (paymentMethod === 'razorpay') {
      await handleRazorpayPayment();
    } else if (paymentMethod === 'cod') {
      await handleCODPayment();
    }
  };

  // Render step content
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
              Shipping Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="First Name"
                  value={shippingInfo.firstName}
                  onChange={(e) => handleShippingChange('firstName', e.target.value)}
                  sx={textFieldStyle}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Last Name"
                  value={shippingInfo.lastName}
                  onChange={(e) => handleShippingChange('lastName', e.target.value)}
                  sx={textFieldStyle}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Email"
                  type="email"
                  value={shippingInfo.email}
                  onChange={(e) => handleShippingChange('email', e.target.value)}
                  sx={textFieldStyle}
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
                  sx={textFieldStyle}
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
                  sx={textFieldStyle}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="City"
                  value={shippingInfo.city}
                  onChange={(e) => handleShippingChange('city', e.target.value)}
                  sx={textFieldStyle}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="State"
                  value={shippingInfo.state}
                  onChange={(e) => handleShippingChange('state', e.target.value)}
                  sx={textFieldStyle}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="ZIP / Postal Code"
                  value={shippingInfo.zipCode}
                  onChange={(e) => handleShippingChange('zipCode', e.target.value)}
                  sx={textFieldStyle}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Country"
                  value={shippingInfo.country}
                  onChange={(e) => handleShippingChange('country', e.target.value)}
                  sx={textFieldStyle}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
              Select Payment Method
            </Typography>
            <FormControl component="fieldset" sx={{ width: '100%' }}>
              <FormLabel component="legend" sx={{ color: 'white', mb: 2 }}>
                Choose how you want to pay
              </FormLabel>
              <RadioGroup
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <Paper sx={{ p: 2, mb: 2, background: 'rgba(255,255,255,0.05)' }}>
                  <FormControlLabel
                    value="razorpay"
                    control={<Radio sx={{ color: 'white' }} />}
                    label={
                      <Box>
                        <Typography sx={{ color: 'white', fontWeight: 'bold' }}>
                          💳 Credit/Debit Card & UPI
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#d1d5db' }}>
                          Secure payment with Razorpay
                        </Typography>
                      </Box>
                    }
                  />
                </Paper>
                <Paper sx={{ p: 2, background: 'rgba(255,255,255,0.05)' }}>
                  <FormControlLabel
                    value="cod"
                    control={<Radio sx={{ color: 'white' }} />}
                    label={
                      <Box>
                        <Typography sx={{ color: 'white', fontWeight: 'bold' }}>
                          📦 Cash on Delivery
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#d1d5db' }}>
                          Pay when you receive your order
                        </Typography>
                      </Box>
                    }
                  />
                </Paper>
              </RadioGroup>
            </FormControl>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
              Review Your Order
            </Typography>
            
            {/* Order Summary */}
            <Paper sx={{ p: 3, mb: 3, background: 'rgba(255,255,255,0.05)' }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                Order Items
              </Typography>
              {itemsToShow.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <img 
                      src={item.image_url || "https://via.placeholder.com/60x60?text=No+Image"} 
                      alt={item.name}
                      style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }}
                    />
                    <Box>
                      <Typography sx={{ color: 'white', fontWeight: 'bold' }}>
                        {item.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#d1d5db' }}>
                        Qty: {item.quantity || 1}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography sx={{ color: 'white', fontWeight: 'bold' }}>
                    ₹{(item.price * (item.quantity || 1)).toFixed(2)}
                  </Typography>
                </Box>
              ))}
            </Paper>

            {/* Shipping Information */}
            <Paper sx={{ p: 3, mb: 3, background: 'rgba(255,255,255,0.05)' }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                Shipping Address
              </Typography>
              <Typography sx={{ color: 'white' }}>
                {shippingInfo.firstName} {shippingInfo.lastName}
              </Typography>
              <Typography sx={{ color: '#d1d5db' }}>
                {shippingInfo.address}
              </Typography>
              <Typography sx={{ color: '#d1d5db' }}>
                {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}
              </Typography>
              <Typography sx={{ color: '#d1d5db' }}>
                {shippingInfo.country}
              </Typography>
              <Typography sx={{ color: '#d1d5db' }}>
                📞 {shippingInfo.phone}
              </Typography>
              <Typography sx={{ color: '#d1d5db' }}>
                ✉️ {shippingInfo.email}
              </Typography>
            </Paper>

            {/* Payment Method */}
            <Paper sx={{ p: 3, background: 'rgba(255,255,255,0.05)' }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                Payment Method
              </Typography>
              <Typography sx={{ color: 'white' }}>
                {paymentMethod === 'razorpay' ? '💳 Credit/Debit Card & UPI' : '📦 Cash on Delivery'}
              </Typography>
            </Paper>
          </Box>
        );

      default:
        return null;
    }
  };

  if (!session) {
    return (
      <Box sx={pageStyle}>
        <Typography variant="h6" sx={{ color: 'white', textAlign: 'center' }}>
          Please sign in to continue with checkout
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={pageStyle}>
      <Box sx={containerStyle}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" sx={titleStyle}>
            Checkout
          </Typography>
          <Typography variant="body1" sx={{ color: '#d1d5db' }}>
            Complete your purchase in just a few steps
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Left Column - Checkout Steps */}
          <Grid item xs={12} lg={8}>
            <Paper sx={paperStyle}>
              {/* Stepper */}
              <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel sx={{ '& .MuiStepLabel-label': { color: 'white' } }}>
                      {label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>

              {/* Step Content */}
              {renderStepContent(activeStep)}

              {/* Message Alert */}
              {message.text && (
                <Alert 
                  severity={message.type === 'error' ? 'error' : message.type === 'success' ? 'success' : 'info'} 
                  sx={{ mt: 2 }}
                >
                  {message.text}
                </Alert>
              )}

              {/* Navigation Buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  disabled={activeStep === 0 || loading}
                  onClick={handleBack}
                  startIcon={<ArrowBack />}
                  sx={buttonStyle}
                >
                  Back
                </Button>

                <Box>
                  {activeStep === steps.length - 1 ? (
                    <Button
                      variant="contained"
                      onClick={handlePlaceOrder}
                      disabled={loading}
                      sx={{ ...buttonStyle, background: 'linear-gradient(45deg, #22c55e, #3b82f6)' }}
                    >
                      {loading ? 'Processing...' : `Place Order - ₹${totalAmount.toFixed(2)}`}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      sx={{ ...buttonStyle, background: 'linear-gradient(45deg, #22c55e, #3b82f6)' }}
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
            <Paper sx={paperStyle}>
              <Typography variant="h6" sx={{ color: 'white', mb: 3, fontWeight: 'bold' }}>
                Order Summary
              </Typography>

              {/* Order Items */}
              <Box sx={{ mb: 3 }}>
                {itemsToShow.map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <img 
                        src={item.image_url || "https://via.placeholder.com/40x40?text=No+Image"} 
                        alt={item.name}
                        style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }}
                      />
                      <Box>
                        <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                          {item.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#d1d5db' }}>
                          Qty: {item.quantity || 1}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                      ₹{(item.price * (item.quantity || 1)).toFixed(2)}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 2 }} />

              {/* Price Breakdown */}
              <Box sx={{ space: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#d1d5db' }}>Subtotal</Typography>
                  <Typography variant="body2" sx={{ color: 'white' }}>₹{subtotal.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#d1d5db' }}>Shipping</Typography>
                  <Typography variant="body2" sx={{ color: 'white' }}>
                    {shippingFee === 0 ? 'FREE' : `₹${shippingFee.toFixed(2)}`}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#d1d5db' }}>Tax (18% GST)</Typography>
                  <Typography variant="body2" sx={{ color: 'white' }}>₹{tax.toFixed(2)}</Typography>
                </Box>
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>Total</Typography>
                  <Typography variant="h6" sx={{ color: '#22c55e', fontWeight: 'bold' }}>
                    ₹{totalAmount.toFixed(2)}
                  </Typography>
                </Box>
              </Box>

              {/* Free Shipping Notice */}
              {subtotal < 999 && (
                <Alert severity="info" sx={{ mt: 2, background: 'rgba(59, 130, 246, 0.1)' }}>
                  Add ₹{(999 - subtotal).toFixed(2)} more for FREE shipping!
                </Alert>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

// Styles
const pageStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(160deg, #0a0f1f 0%, #1a273a 50%, #0a192f 100%)',
  padding: '20px 0',
};

const containerStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 20px',
};

const titleStyle = {
  fontSize: '2.5rem',
  fontWeight: 'bold',
  background: 'linear-gradient(45deg, #22c55e, #3b82f6)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  mb: 1,
};

const paperStyle = {
  background: 'rgba(17, 25, 40, 0.85)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  padding: '30px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
};

const textFieldStyle = {
  '& .MuiOutlinedInput-root': {
    color: 'white',
    '& fieldset': {
      borderColor: 'rgba(255,255,255,0.3)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255,255,255,0.5)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#22c55e',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255,255,255,0.7)',
  },
};

const buttonStyle = {
  borderRadius: '10px',
  padding: '12px 24px',
  fontWeight: '600',
  textTransform: 'none',
  fontSize: '16px',
};