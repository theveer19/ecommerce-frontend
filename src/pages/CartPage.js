import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Divider,
  Alert,
  Snackbar,
  Grid,
  IconButton,
  useTheme,
  useMediaQuery,
  Backdrop,
  CircularProgress
} from "@mui/material";
import {
  Delete,
  ShoppingCart,
  Login,
  ArrowBack,
  Add,
  Remove,
  Home,
  Inventory2,
  LocalMall
} from "@mui/icons-material";

export default function CartPage({ session }) {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount
  } = useCart();

  const navigate = useNavigate();
  const location = useLocation();

  /* ---------------- FIXED STATE ---------------- */
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [hoveredItem, setHoveredItem] = useState(null);

  /* ---------------- RESPONSIVE ---------------- */
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  /* ---------------- SESSION SAFETY ---------------- */
  if (session === undefined) {
    return null;
  }

  /* ---------------- HANDLERS ---------------- */
  const handleCheckout = () => {
    if (!session) {
      navigate("/login", {
        state: { from: location }
      });
      return;
    }
    navigate("/checkout");
  };

  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(id);
      setSnackbarMessage("Item removed from cart");
      setSnackbarSeverity("info");
      setOpenSnackbar(true);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  const handleRemoveItem = (id) => {
    removeFromCart(id);
    setSnackbarMessage("Item removed from cart");
    setSnackbarSeverity("info");
    setOpenSnackbar(true);
  };

  const handleClearCart = () => {
    clearCart();
    setSnackbarMessage("Cart cleared");
    setSnackbarSeverity("info");
    setOpenSnackbar(true);
  };

  const calculateSubtotal = (price, quantity) =>
    (parseFloat(price) || 0) * (quantity || 1);

  /* ---------------- VISUAL STYLES (UPDATED) ---------------- */
  const styles = {
    pageBackground: {
      background: '#f8f9fa',
      backgroundImage: `
        radial-gradient(at 0% 0%, rgba(0,0,0,0.03) 0px, transparent 50%),
        radial-gradient(at 100% 100%, rgba(0,0,0,0.03) 0px, transparent 50%),
        linear-gradient(#e5e5e5 1px, transparent 1px),
        linear-gradient(90deg, #e5e5e5 1px, transparent 1px)
      `,
      backgroundSize: '100% 100%, 100% 100%, 40px 40px, 40px 40px',
      minHeight: '100vh',
      color: '#1a1a1a',
      pb: 8,
      position: 'relative',
      overflowX: 'hidden'
    },
    glassCard: {
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderRadius: '24px',
      border: '1px solid rgba(255, 255, 255, 0.8)',
      boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.05), inset 0 0 0 1px rgba(255,255,255,0.5)',
      overflow: 'hidden',
      transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      position: 'relative',
      zIndex: 1,
    },
    hoverEffect: {
      transform: isMobile ? 'none' : 'translateY(-10px) scale(1.005)',
      boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0,0,0,0.05)',
      zIndex: 10,
    },
    productImageContainer: {
      position: 'relative',
      perspective: '1000px',
      transformStyle: 'preserve-3d',
      height: '180px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    img3D: {
      height: '100%',
      width: 'auto',
      maxWidth: '100%',
      objectFit: 'contain',
      borderRadius: '12px',
      transition: 'transform 0.5s ease',
      filter: 'drop-shadow(0 15px 15px rgba(0,0,0,0.15))',
      transform: isMobile ? 'none' : 'rotateY(-15deg) rotateX(5deg)',
    },
    neonText: {
      background: 'linear-gradient(45deg, #000 30%, #555 90%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      fontWeight: 900,
      letterSpacing: '-1px',
    },
    controlButton: {
      width: '36px',
      height: '36px',
      borderRadius: '10px',
      border: '1px solid rgba(0,0,0,0.1)',
      background: 'white',
      transition: 'all 0.2s',
      '&:hover': {
        background: '#000',
        color: 'white',
        transform: 'scale(1.1)',
        boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
      },
      '&:disabled': {
        background: '#f5f5f5',
        color: '#ccc',
        border: 'none'
      }
    }
  };

  /* ---------------- EMPTY STATE ---------------- */
  if (cartItems.length === 0) {
    return (
      <Box sx={styles.pageBackground}>
        <Container maxWidth="lg" sx={{ 
          pt: { xs: 15, md: 18 }, 
          pb: 8, 
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}>
          <Box sx={{
            position: 'relative',
            mb: 6,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '300px', height: '300px',
              background: 'radial-gradient(circle, rgba(0,0,0,0.05) 0%, transparent 70%)',
              zIndex: 0
            }
          }}>
            <Box sx={{ animation: 'float 4s ease-in-out infinite' }}>
              <LocalMall sx={{ fontSize: 120, color: '#ddd' }} />
            </Box>
            <Box sx={{ 
              position: 'absolute', 
              top: '50%', left: '50%', 
              transform: 'translate(-50%, -50%)',
              animation: 'float 4s ease-in-out infinite 0.5s' 
            }}>
              <ShoppingCart sx={{ fontSize: 60, color: '#000' }} />
            </Box>
          </Box>
          
          <Typography variant="h2" sx={{ ...styles.neonText, mb: 2, fontSize: { xs: '2rem', md: '3.5rem' } }}>
            CART IS EMPTY
          </Typography>
          <Typography variant="body1" sx={{ color: '#666', mb: 5, fontSize: '1.2rem', maxWidth: '500px' }}>
            Looks like you haven't made your choice yet. Explore our collection to find something you love.
          </Typography>
          
          <Button
            variant="contained"
            onClick={() => navigate('/products')}
            startIcon={<Home />}
            sx={{ 
              bgcolor: '#000',
              color: '#fff',
              px: 6, py: 2,
              borderRadius: '20px',
              fontSize: '1rem',
              fontWeight: 800,
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: '#222',
                transform: 'translateY(-5px)',
                boxShadow: '0 30px 60px rgba(0,0,0,0.4)'
              }
            }}
          >
            START SHOPPING
          </Button>
          <style>{`
            @keyframes float {
              0%, 100% { transform: translateY(0) translate(-50%, -50%); }
              50% { transform: translateY(-20px) translate(-50%, -50%); }
            }
          `}</style>
        </Container>
      </Box>
    );
  }

  const totalItems = getCartCount();
  const cartTotal = getCartTotal();

  return (
    <Box sx={styles.pageBackground}>
      <Container maxWidth="xl" sx={{ pt: { xs: 14, md: 18 }, pb: 6 }}>
        
        {/* PAGE HEADER */}
        <Box sx={{ mb: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h1" sx={{ 
              fontSize: { xs: '2.5rem', md: '4rem' },
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: '-2px',
              color: '#000',
              mb: 1
            }}>
              Your Cart.
            </Typography>
            <Typography variant="h6" sx={{ color: '#666', fontWeight: 400, ml: 1 }}>
              {totalItems} Items ready for checkout
            </Typography>
          </Box>
          <Box sx={{ 
            p: 1, 
            background: '#fff', 
            borderRadius: '50px', 
            border: '1px solid #eee',
            display: { xs: 'none', md: 'block' }
          }}>
             <Inventory2 sx={{ color: '#000', m: 1 }} />
          </Box>
        </Box>

        {!session && (
          <Alert 
            severity="info" 
            sx={{ 
              mb: 4, borderRadius: '16px', 
              background: 'rgba(255,255,255,0.8)', 
              backdropFilter: 'blur(10px)',
              border: '1px solid #cce5ff',
              boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              You are browsing as a Guest.
            </Typography>
            Please login to save your cart permanently.
          </Alert>
        )}

        <Grid container spacing={5}>
          {/* ---------------- LEFT COLUMN: CART ITEMS ---------------- */}
          <Grid item xs={12} lg={8}>
            
            {cartItems.map((item, index) => (
              <Paper 
                key={`${item.id}-${item.quantity}`} 
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                sx={{
                  ...styles.glassCard,
                  mb: 3,
                  p: { xs: 2, md: 0 },
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  alignItems: 'stretch',
                  ...(hoveredItem === item.id && styles.hoverEffect),
                  animation: `slideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards ${index * 0.1}s`,
                  opacity: 0,
                  transform: 'translateY(40px)'
                }}
              >
                {/* 3D Image Section */}
                <Box sx={{ 
                  width: { xs: '100%', md: '250px' }, 
                  bgcolor: '#f5f5f7',
                  position: 'relative',
                  overflow: 'visible',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '200px'
                }}>
                   {/* Background Circle Decoration */}
                  <Box sx={{
                    position: 'absolute',
                    width: '120px', height: '120px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #e0e0e0, #ffffff)',
                    zIndex: 0
                  }} />
                  
                  <Box sx={{
                    ...styles.productImageContainer,
                    // If hovered, rotate the image to face front
                    transform: hoveredItem === item.id ? 'scale(1.1)' : 'none',
                    transition: 'transform 0.5s ease'
                  }}>
                    <img
                      src={item.image_url || 'https://via.placeholder.com/200x200?text=No+Image'}
                      alt={item.name}
                      style={{
                        ...styles.img3D,
                        // Reset rotation on mobile or hover
                        transform: (isMobile || hoveredItem === item.id) 
                          ? 'rotateY(0deg) rotateX(0deg)' 
                          : 'rotateY(-20deg) rotateX(10deg)'
                      }}
                    />
                  </Box>
                </Box>
                
                {/* Content Section */}
                <Box sx={{ 
                  flex: 1, 
                  p: { xs: 2, md: 4 }, 
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        {item.category && (
                          <Typography variant="overline" sx={{ color: '#999', fontWeight: 800, letterSpacing: '1px', lineHeight: 1 }}>
                            {item.category}
                          </Typography>
                        )}
                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#000', mt: 0.5 }}>
                          {item.name}
                        </Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#000' }}>
                        ₹{item.price?.toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {/* Controls Bar */}
                  <Box sx={{ 
                    mt: 3, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 2,
                    pt: 3,
                    borderTop: '1px dashed #e0e0e0'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                       <Box sx={{ 
                         display: 'flex', alignItems: 'center', gap: 1,
                         background: '#f8f9fa', borderRadius: '12px', p: 0.5
                       }}>
                          <IconButton size="small" onClick={() => handleQuantityChange(item.id, item.quantity - 1)} sx={styles.controlButton}>
                            <Remove fontSize="small" />
                          </IconButton>
                          <Typography sx={{ fontWeight: 'bold', width: '30px', textAlign: 'center' }}>{item.quantity}</Typography>
                          <IconButton size="small" onClick={() => handleQuantityChange(item.id, item.quantity + 1)} sx={styles.controlButton}>
                            <Add fontSize="small" />
                          </IconButton>
                       </Box>
                       <Button 
                        startIcon={<Delete />} 
                        onClick={() => handleRemoveItem(item.id)}
                        sx={{ color: '#999', '&:hover': { color: '#d32f2f', background: 'transparent' } }}
                       >
                         Remove
                       </Button>
                    </Box>

                    <Typography variant="h6" sx={{ fontWeight: 900 }}>
                      ₹{calculateSubtotal(item.price, item.quantity).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            ))}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, flexWrap: 'wrap', gap: 2 }}>
              <Button
                component={Link}
                to="/products"
                startIcon={<ArrowBack />}
                sx={{ 
                  color: 'black',
                  borderRadius: '30px',
                  px: 3,
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '1rem',
                  '&:hover': { background: '#f5f5f5' }
                }}
              >
                Continue Shopping
              </Button>
              <Button
                onClick={handleClearCart}
                sx={{ 
                  color: '#ff4444',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': { background: '#fff0f0' }
                }}
              >
                Clear Entire Cart
              </Button>
            </Box>
          </Grid>

          {/* ---------------- RIGHT COLUMN: SUMMARY ---------------- */}
          <Grid item xs={12} lg={4}>
            <Box sx={{ position: { lg: 'sticky' }, top: '120px' }}>
              <Paper sx={{
                ...styles.glassCard,
                p: 4,
                background: '#000', // Inverted Theme for Summary
                color: '#fff',
                border: '1px solid #333',
                transform: 'none !important', // No hover lift for summary
                boxShadow: '0 30px 60px rgba(0,0,0,0.5)'
              }}>
                <Typography variant="h4" sx={{ 
                  fontWeight: 900, 
                  letterSpacing: '-1px', 
                  mb: 4, 
                  textTransform: 'uppercase',
                  borderBottom: '1px solid #333',
                  pb: 2
                }}>
                  Summary
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', color: '#aaa' }}>
                    <Typography>Subtotal ({totalItems} items)</Typography>
                    <Typography sx={{ color: '#fff' }}>₹{cartTotal.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', color: '#aaa' }}>
                    <Typography>Shipping</Typography>
                    <Typography sx={{ color: '#fff' }}>
                      {cartTotal > 999 ? 'Free' : '₹50.00'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', color: '#aaa' }}>
                    <Typography>Tax (Est.)</Typography>
                    <Typography sx={{ color: '#fff' }}>₹{(cartTotal * 0.18).toFixed(2)}</Typography>
                  </Box>
                </Box>

                {cartTotal <= 999 && (
                   <Box sx={{ mb: 4, p: 2, bgcolor: '#1a1a1a', borderRadius: '12px', border: '1px solid #333' }}>
                      <Typography variant="caption" sx={{ color: '#888', display: 'block', mb: 1 }}>
                        Add <b>₹{(999 - cartTotal).toFixed(2)}</b> for Free Shipping
                      </Typography>
                      <Box sx={{ width: '100%', height: '4px', bgcolor: '#333', borderRadius: '2px', overflow: 'hidden' }}>
                        <Box sx={{ 
                          width: `${(cartTotal/999)*100}%`, 
                          height: '100%', 
                          bgcolor: '#fff', 
                          transition: 'width 1s ease'
                        }} />
                      </Box>
                   </Box>
                )}

                <Divider sx={{ borderColor: '#333', mb: 3 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 4 }}>
                  <Typography variant="body1" sx={{ color: '#aaa' }}>Total</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 900, fontSize: '2.5rem' }}>
                    ₹{cartTotal.toFixed(2)}
                  </Typography>
                </Box>

                <Button
                  fullWidth
                  size="large"
                  onClick={handleCheckout}
                  endIcon={!session && <Login />}
                  sx={{
                    py: 2.5,
                    bgcolor: '#fff',
                    color: '#000',
                    borderRadius: '16px',
                    fontWeight: 900,
                    fontSize: '1.1rem',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: '#f0f0f0',
                      transform: 'scale(1.02)',
                      boxShadow: '0 0 30px rgba(255,255,255,0.2)'
                    }
                  }}
                >
                  {session ? 'Checkout Now' : 'Login to Checkout'}
                </Button>
                
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 1 }}>
                   {/* Decorative dots */}
                   <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#333' }} />
                   <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#333' }} />
                   <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#333' }} />
                </Box>
              </Paper>
            </Box>
          </Grid>
        </Grid>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={3000}
          onClose={() => setOpenSnackbar(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setOpenSnackbar(false)} 
            severity={snackbarSeverity}
            variant="filled"
            sx={{ 
              borderRadius: '50px', 
              fontWeight: 700, 
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              px: 4
            }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>

        <style>{`
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(60px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>
      </Container>
    </Box>
  );
}