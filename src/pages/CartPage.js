import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  TextField,
  Avatar
} from "@mui/material";
import { Delete, ShoppingCart, Login, ArrowBack, Add, Remove, Home, Inventory2 } from "@mui/icons-material";

export default function CartPage({ session }) {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartCount } = useCart();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!session) {
      navigate('/login', { 
        state: { 
          returnTo: '/checkout',
          message: 'Please login to continue with checkout' 
        } 
      });
      return;
    }
    navigate('/checkout');
  };

  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(id);
      setSnackbarMessage('Item removed from cart');
      setSnackbarSeverity('info');
      setOpenSnackbar(true);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  const handleRemoveItem = (id) => {
    removeFromCart(id);
    setSnackbarMessage('Item removed from cart');
    setSnackbarSeverity('info');
    setOpenSnackbar(true);
  };

  const handleClearCart = () => {
    clearCart();
    setSnackbarMessage('Cart cleared');
    setSnackbarSeverity('info');
    setOpenSnackbar(true);
  };

  const calculateSubtotal = (price, quantity) => {
    return (parseFloat(price) || 0) * (quantity || 1);
  };

  // --- STYLES FOR 3D EFFECT (BLACK & WHITE THEME) ---
  const styles = {
    pageBackground: {
      background: '#ffffff', // Pure white background
      minHeight: '100vh',
      color: '#000000', // Black text default
      pb: 8
    },
    glassCard: {
      background: '#ffffff', // Solid white cards
      // backdropFilter: 'blur(20px)', // Removed blur for clean B&W
      borderRadius: '24px',
      border: '2px solid #000000', // bold black border
      boxShadow: '0 10px 30px -12px rgba(0, 0, 0, 0.3)', // softer gray shadow
      overflow: 'hidden',
      transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease',
      '&:hover': {
        transform: 'translateY(-8px) scale(1.01)',
        boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.5)',
        // border: '2px solid #000000', 
      }
    },
    img3D: {
      transform: 'perspective(1000px) rotateY(-10deg)',
      boxShadow: '15px 15px 30px rgba(0,0,0,0.3)', // Softer shadow
      borderRadius: '16px',
      transition: 'all 0.5s ease',
      border: '1px solid #eee' // Light gray border
    },
    neonText: {
      // Removed gradient, just solid black
      color: '#000000',
      fontWeight: 900,
      letterSpacing: '1px',
    }
  };

  if (cartItems.length === 0) {
    return (
      <Box sx={styles.pageBackground}>
        <Container maxWidth="lg" sx={{ 
          py: 8, 
          textAlign: 'center',
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Box sx={{
            position: 'relative',
            animation: 'float 6s ease-in-out infinite'
          }}>
            <div style={{
              position: 'absolute',
              top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: '200px', height: '200px',
              background: 'radial-gradient(circle, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0) 70%)', // subtly gray radial
              zIndex: 0
            }} />
            <ShoppingCart sx={{ 
              fontSize: 120, 
              color: '#000000', // Black icon
              mb: 3,
              position: 'relative',
              zIndex: 1,
              filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.2))' // Gray shadow
            }} />
          </Box>
          
          <Typography variant="h3" sx={{ ...styles.neonText, mb: 2 }}>
            VOID DETECTED
          </Typography>
          <Typography variant="body1" sx={{ 
            color: '#666', 
            mb: 5,
            maxWidth: '400px',
            fontSize: '1.1rem'
          }}>
            Your inventory is currently empty. Initialize shopping sequence to acquire assets.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/products')}
            startIcon={<Home />}
            sx={{ 
              bgcolor: '#000000', // Black button
              color: '#ffffff', // White text
              px: 6,
              py: 2,
              borderRadius: '50px',
              fontSize: '1rem',
              fontWeight: 900,
              boxShadow: '0 0 30px rgba(0,0,0,0.2)', // Gray shadow
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: '#333333',
                transform: 'scale(1.05)',
                boxShadow: '0 0 50px rgba(0,0,0,0.4)'
              }
            }}
          >
            ENTER SHOP
          </Button>
          <style>{`
            @keyframes float {
              0% { transform: translateY(0px); }
              50% { transform: translateY(-20px); }
              100% { transform: translateY(0px); }
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
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* HEADER 3D */}
        <Box sx={{ textAlign: 'center', mb: 6, position: 'relative' }}>
          <Typography variant="h2" sx={{ 
            fontWeight: 900, 
            color: '#000000', // Black text
            textTransform: 'uppercase',
            letterSpacing: '4px',
            // Removed colored text shadow
          }}>
            Inventory <span style={{ color: '#999' }}>//</span> Cart
          </Typography>
          <Box sx={{ 
            width: '100px', 
            height: '4px', 
            background: '#000000', // Black line
            margin: '20px auto',
            borderRadius: '2px',
            // Removed colored box shadow
          }} />
        </Box>

        {!session && (
          <Alert 
            severity="warning" 
            variant="outlined" // Outlined for B&W theme
            sx={{ 
              mb: 4,
              borderRadius: '12px',
              borderColor: '#000',
              color: '#000',
              background: '#fff',
              boxShadow: '0 0 10px rgba(0,0,0,0.1)'
            }}
            icon={<Inventory2 fontSize="inherit" style={{color: 'black'}}/>}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', letterSpacing: '1px' }}>
              ⚠ ACCESS RESTRICTED: LOGIN REQUIRED
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Authentication needed to finalize transaction. Data will be cached.
            </Typography>
          </Alert>
        )}

        <Grid container spacing={4}>
          {/* Cart Items Column */}
          <Grid item xs={12} lg={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
              <Inventory2 sx={{ color: '#000' }} />
              <Typography variant="h6" sx={{ color: '#666', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>
                Assets Loaded: {totalItems}
              </Typography>
            </Box>
            
            {cartItems.map((item, index) => (
              <Paper 
                key={`${item.id}-${item.quantity}`} 
                sx={{
                  ...styles.glassCard,
                  p: 3,
                  mb: 3,
                  position: 'relative',
                  animation: `slideUp 0.5s ease forwards ${index * 0.1}s`,
                  opacity: 0,
                  transform: 'translateY(20px)'
                }}
              >
                <Grid container spacing={3} alignItems="center">
                  {/* 3D Image Container */}
                  <Grid item xs={12} sm={4} md={3}>
                    <Box sx={{ 
                      perspective: '1000px',
                      '&:hover img': {
                        transform: 'rotateY(0deg) scale(1.1)',
                      }
                    }}>
                      <img
                        src={item.image_url || 'https://via.placeholder.com/200x200?text=No+Image'}
                        alt={item.name}
                        style={{ 
                          width: '100%',
                          height: '160px',
                          objectFit: 'cover',
                          ...styles.img3D
                        }}
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={8} md={9}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h5" sx={{ 
                          fontWeight: 800, 
                          color: '#000000', // Black text
                          mb: 1,
                          letterSpacing: '0.5px'
                        }}>
                          {item.name}
                        </Typography>
                        
                        {item.category && (
                          <Box sx={{ 
                            display: 'inline-block',
                            px: 1.5, py: 0.5, 
                            borderRadius: '4px', 
                            background: '#f5f5f5', // Light gray background
                            mb: 2,
                            border: '1px solid #e0e0e0'
                          }}>
                            <Typography variant="caption" sx={{ color: '#666', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
                              {item.category}
                            </Typography>
                          </Box>
                        )}
                        
                        <Typography variant="h6" sx={{ color: '#000', mb: 2, fontWeight: 300 }}>
                          ₹{item.price?.toFixed(2) || '0.00'} <span style={{ fontSize: '0.8em', color: '#999' }}>/ unit</span>
                        </Typography>
                      </Box>
                      
                      {/* Controls */}
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        mt: 'auto',
                        background: '#f9f9f9', // Very light gray
                        borderRadius: '12px',
                        p: 1.5,
                        border: '2px solid #eee'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            sx={{ color: 'black', border: '1px solid #ccc' }}
                          >
                            <Remove fontSize="small" />
                          </IconButton>
                          
                          <Box sx={{ 
                            width: '40px', height: '30px', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'white', borderRadius: '4px',
                            border: '2px solid black'
                          }}>
                             <Typography sx={{ color: 'black', fontWeight: 'bold' }}>{item.quantity}</Typography>
                          </Box>
                          
                          <IconButton
                            size="small"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            sx={{ color: 'black', border: '1px solid #ccc' }}
                          >
                            <Add fontSize="small" />
                          </IconButton>
                        </Box>
                        
                        <Typography variant="h6" sx={{ color: '#000', fontWeight: 'bold' }}>
                          ₹{calculateSubtotal(item.price, item.quantity).toFixed(2)}
                        </Typography>
                        
                        <IconButton
                          onClick={() => handleRemoveItem(item.id)}
                          sx={{ 
                            color: '#000', // Black delete icon
                            opacity: 0.7,
                            '&:hover': { opacity: 1, background: '#eee' }
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            ))}

            <Box sx={{ display: 'flex', gap: 2, mt: 4, flexWrap: 'wrap' }}>
              <Button
                component={Link}
                to="/products"
                startIcon={<ArrowBack />}
                sx={{ 
                  color: 'black',
                  borderColor: 'black',
                  borderRadius: '30px',
                  px: 3,
                  '&:hover': { color: 'white', borderColor: 'black', background: 'black' }
                }}
                variant="outlined"
              >
                Continue Shopping
              </Button>
              
              <Button
                variant="text"
                // color="error" // Removed error color for B&W
                onClick={handleClearCart}
                sx={{ ml: 'auto', opacity: 0.6, color: 'black', '&:hover': { opacity: 1, background: '#eee' } }}
              >
                Empty Cart
              </Button>
            </Box>
          </Grid>

          {/* Order Summary Sticky 3D Panel */}
          <Grid item xs={12} lg={4}>
            <Paper sx={{ 
              ...styles.glassCard,
              p: 4, 
              position: 'sticky', 
              top: '100px',
              // background: 'linear-gradient(160deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.4) 100%)' // Removed gradient
            }}>
              <Typography variant="h5" sx={{ ...styles.neonText, mb: 4, textAlign: 'center' }}>
                TRANSACTION SUMMARY
              </Typography>
              
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography sx={{ color: '#666' }}>Total Items</Typography>
                  <Typography sx={{ color: 'black' }}>{totalItems}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography sx={{ color: '#666' }}>Subtotal</Typography>
                  <Typography sx={{ color: 'black' }}>₹{cartTotal.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography sx={{ color: '#666' }}>Shipping</Typography>
                  <Typography sx={{ color: 'black', fontWeight: cartTotal > 999 ? 'bold' : 'normal' }}>
                    {cartTotal > 999 ? 'COMPLIMENTARY' : '₹50.00'}
                  </Typography>
                </Box>
                
                {cartTotal <= 999 && (
                  <Box sx={{ mt: 2, p: 1.5, borderRadius: '8px', background: '#f5f5f5', textAlign: 'center', border: '1px solid #eee' }}>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      Add <span style={{ color: 'black', fontWeight: 'bold' }}>₹{(999 - cartTotal).toFixed(2)}</span> for free shipping
                    </Typography>
                    <Box sx={{ width: '100%', height: '4px', background: '#e0e0e0', mt: 1, borderRadius: '2px', overflow: 'hidden' }}>
                      <Box sx={{ width: `${(cartTotal/999)*100}%`, height: '100%', background: 'black' }} />
                    </Box>
                  </Box>
                )}
              </Box>

              <Divider sx={{ borderColor: '#eee', mb: 3 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h6" sx={{ color: 'black', fontWeight: 300 }}>Total</Typography>
                <Typography variant="h4" sx={{ fontWeight: 900, color: 'black' }}>
                  ₹{cartTotal.toFixed(2)}
                </Typography>
              </Box>

              <Button
                fullWidth
                size="large"
                onClick={handleCheckout}
                startIcon={!session ? <Login /> : <Inventory2 />}
                sx={{
                  py: 2,
                  background: 'black', // Black button
                  color: 'white', // White text
                  borderRadius: '12px',
                  fontWeight: 900,
                  fontSize: '1.1rem',
                  letterSpacing: '1px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-2px) scale(1.02)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                    background: '#333'
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: '-50%',
                    left: '-50%',
                    width: '200%',
                    height: '200%',
                    background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.4), transparent)', // subtle gray shine
                    transform: 'rotate(45deg)',
                    animation: 'shine 3s infinite',
                  }
                }}
              >
                {!session ? 'LOGIN TO SECURE' : 'INITIATE CHECKOUT'}
              </Button>
            </Paper>
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
              width: '100%', 
              borderRadius: '50px', 
              fontWeight: 'bold',
              bgcolor: 'black', // Black snackbar bg
              color: 'white' // White text
             }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>

        <style>{`
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes shine {
            0% { left: -100%; opacity: 0; }
            50% { opacity: 0.5; }
            100% { left: 100%; opacity: 0; }
          }
        `}</style>
      </Container>
    </Box>
  );
}