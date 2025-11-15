import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import confetti from "canvas-confetti";
import { Box, Typography, Paper, Button, Divider } from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

export default function ThankYouPage() {
  const location = useLocation();
  const orderDetails = location.state?.orderDetails;

  useEffect(() => {
    // 🎉 Trigger confetti once
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
    });
  }, []);

  return (
    <Box
      sx={{
        background: "linear-gradient(160deg, #0a0f1f 0%, #1a273a 50%, #0a192f 100%)",
        minHeight: "100vh",
        padding: "40px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper
        sx={{
          background: "rgba(17, 25, 40, 0.95)",
          backdropFilter: "blur(10px)",
          maxWidth: "600px",
          width: "100%",
          padding: "40px",
          borderRadius: "20px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          textAlign: "center",
          color: "white",
        }}
      >
        <CheckCircleIcon 
          sx={{ 
            fontSize: 80, 
            color: "#22c55e", 
            mb: 2,
            filter: 'drop-shadow(0 0 20px rgba(34, 197, 94, 0.5))'
          }} 
        />
        
        <Typography variant="h3" sx={{ fontWeight: "bold", mb: 2, color: "#22c55e" }}>
          Order Confirmed!
        </Typography>
        
        <Typography variant="h6" sx={{ mb: 3, color: "#d1d5db" }}>
          Thank you for your purchase. Your order has been successfully placed.
        </Typography>

        {orderDetails ? (
          <Box
            sx={{
              textAlign: "left",
              backgroundColor: "rgba(255,255,255,0.05)",
              padding: "25px",
              borderRadius: "12px",
              marginBottom: "30px",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <Typography variant="h5" sx={{ mb: 3, color: "white", textAlign: 'center' }}>
              📦 Order Summary
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ color: "#22c55e" }}>Order ID:</Typography>
              <Typography sx={{ color: "white", fontWeight: 'bold' }}>#{orderDetails.id || 'N/A'}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ color: "#22c55e" }}>Total Amount:</Typography>
              <Typography sx={{ color: "white", fontWeight: 'bold', fontSize: '1.2rem' }}>
                ₹{orderDetails.total_amount?.toFixed(2) || '0.00'}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ color: "#22c55e" }}>Payment Method:</Typography>
              <Typography sx={{ color: "white" }}>
                {orderDetails.payment_method === 'Razorpay' ? '💳 Credit/Debit Card' : '📦 Cash on Delivery'}
              </Typography>
            </Box>

            {orderDetails.shipping_info && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: "#22c55e" }}>Shipping Address:</Typography>
                <Typography sx={{ color: "white" }}>
                  {orderDetails.shipping_info.firstName} {orderDetails.shipping_info.lastName}
                </Typography>
                <Typography sx={{ color: "#d1d5db", fontSize: '0.9rem' }}>
                  {orderDetails.shipping_info.address}, {orderDetails.shipping_info.city}
                </Typography>
                <Typography sx={{ color: "#d1d5db", fontSize: '0.9rem' }}>
                  {orderDetails.shipping_info.phone}
                </Typography>
              </Box>
            )}

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 2 }} />

            <Typography variant="subtitle2" sx={{ color: "#22c55e", mb: 1 }}>Items:</Typography>
            {orderDetails.items?.map((item, idx) => (
              <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography sx={{ color: "white", fontSize: '0.9rem' }}>
                  {item.name} × {item.quantity || 1}
                </Typography>
                <Typography sx={{ color: "#22c55e", fontSize: '0.9rem', fontWeight: 'bold' }}>
                  ₹{(item.price * (item.quantity || 1)).toFixed(2)}
                </Typography>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography sx={{ color: "#ef4444", mb: 3 }}>
            ⚠️ No order details found.
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            component={Link}
            to="/products"
            variant="contained"
            startIcon={<ShoppingCartIcon />}
            sx={{
              background: 'linear-gradient(45deg, #22c55e, #3b82f6)',
              padding: '12px 30px',
              borderRadius: '10px',
              fontWeight: 'bold',
              fontSize: '16px',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 25px rgba(34, 197, 94, 0.3)',
              },
            }}
          >
            Continue Shopping
          </Button>
          
          <Button
            component={Link}
            to="/orders"
            variant="outlined"
            sx={{
              borderColor: '#22c55e',
              color: '#22c55e',
              padding: '12px 30px',
              borderRadius: '10px',
              fontWeight: 'bold',
              fontSize: '16px',
              '&:hover': {
                borderColor: '#22c55e',
                background: 'rgba(34, 197, 94, 0.1)',
              },
            }}
          >
            View Orders
          </Button>
        </Box>

        <Typography variant="body2" sx={{ mt: 3, color: "#9ca3af" }}>
          A confirmation email has been sent to your registered email address.
        </Typography>
      </Paper>
    </Box>
  );
}