import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import { Box, Typography, Paper, Button, Divider, Container } from "@mui/material";
import { Check, ShoppingBag, ArrowRight, Package } from "lucide-react";

export default function ThankYouPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const orderDetails = location.state?.orderDetails;

  useEffect(() => {
    // 🖤 PREMIUM MONOCHROME CONFETTI
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#000000', '#444444', '#aaaaaa', '#ffffff'] // Black/White/Silver
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#000000', '#444444', '#aaaaaa', '#ffffff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  // Redirect if no order details (optional protection)
  useEffect(() => {
    if (!orderDetails) {
      // Uncomment below to force redirect if accessed directly
      // navigate('/');
    }
  }, [orderDetails, navigate]);

  return (
    <Box sx={styles.pageBackground}>
      {/* CSS Animations */}
      <style>{`
        @keyframes float { 0% { transform: translateY(0px) rotateX(0deg); } 50% { transform: translateY(-10px) rotateX(2deg); } 100% { transform: translateY(0px) rotateX(0deg); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        .barcode {
          height: 30px;
          width: 100%;
          background: repeating-linear-gradient(
            to right,
            #000 0px, #000 2px,
            transparent 2px, transparent 4px,
            #000 4px, #000 8px,
            transparent 8px, transparent 9px
          );
        }
      `}</style>

      <Container maxWidth="md" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* SUCCESS ICON */}
        <Box sx={styles.successIconWrapper}>
          <Check size={40} color="white" strokeWidth={3} />
        </Box>

        <Typography variant="h2" sx={styles.title}>
          ORDER CONFIRMED
        </Typography>
        
        <Typography variant="body1" sx={styles.subtitle}>
          Your order has been placed successfully. A confirmation email is on its way.
        </Typography>

        {/* --- 3D RECEIPT CARD --- */}
        <Box sx={styles.perspectiveWrapper}>
          <Paper sx={styles.receiptCard}>
            
            {/* Receipt Header */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography sx={{ fontWeight: 900, fontSize: '24px', letterSpacing: '-1px' }}>ONE-T</Typography>
              <Typography sx={{ fontSize: '10px', color: '#666', letterSpacing: '2px', textTransform: 'uppercase' }}>Official Receipt</Typography>
            </Box>

            <Divider sx={{ borderStyle: 'dashed', borderColor: '#ccc', mb: 3 }} />

            {/* Order Info Grid */}
            {orderDetails ? (
              <>
                <Box sx={styles.row}>
                  <Typography sx={styles.label}>ORDER ID</Typography>
                  <Typography sx={styles.value}>#{orderDetails.id || '29384-X'}</Typography>
                </Box>
                <Box sx={styles.row}>
                  <Typography sx={styles.label}>DATE</Typography>
                  <Typography sx={styles.value}>{new Date().toLocaleDateString()}</Typography>
                </Box>
                <Box sx={styles.row}>
                  <Typography sx={styles.label}>PAYMENT</Typography>
                  <Typography sx={styles.value}>{orderDetails.payment_method === 'Razorpay' ? 'CREDIT CARD' : 'COD'}</Typography>
                </Box>

                {orderDetails.shipping_info && (
                  <Box sx={{ mt: 2, mb: 2, p: 2, bgcolor: '#f9f9f9', borderRadius: '8px' }}>
                    <Typography sx={{ fontSize: '10px', fontWeight: 700, color: '#999', mb: 0.5 }}>SHIP TO</Typography>
                    <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>{orderDetails.shipping_info.firstName} {orderDetails.shipping_info.lastName}</Typography>
                    <Typography sx={{ fontSize: '12px', color: '#666' }}>
                      {orderDetails.shipping_info.address}, {orderDetails.shipping_info.city}
                    </Typography>
                  </Box>
                )}

                <Divider sx={{ mb: 3 }} />

                {/* Items List */}
                <Box sx={{ mb: 3 }}>
                  {orderDetails.items?.map((item, idx) => (
                    <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography sx={{ fontSize: '13px', color: '#333' }}>
                        {item.name} <span style={{ color: '#999' }}>x{item.quantity}</span>
                      </Typography>
                      <Typography sx={{ fontSize: '13px', fontWeight: 700 }}>
                        ₹{(item.price * (item.quantity || 1)).toFixed(2)}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Divider sx={{ borderStyle: 'dashed', borderColor: '#000', mb: 2 }} />

                {/* Total */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: '16px', fontWeight: 900 }}>TOTAL PAID</Typography>
                  <Typography sx={{ fontSize: '24px', fontWeight: 900 }}>₹{orderDetails.total_amount?.toFixed(2)}</Typography>
                </Box>
              </>
            ) : (
              <Typography sx={{ textAlign: 'center', color: '#999', py: 4 }}>Order details loading...</Typography>
            )}

            {/* Footer Barcode */}
            <Box sx={{ mt: 4, textAlign: 'center', opacity: 0.7 }}>
              <div className="barcode"></div>
              <Typography sx={{ fontSize: '10px', mt: 1, letterSpacing: '4px' }}>THANK YOU</Typography>
            </Box>

          </Paper>
        </Box>

        {/* Action Buttons */}
        <Box sx={styles.actions}>
          <Button
            component={Link}
            to="/products"
            startIcon={<ShoppingBag size={18} />}
            sx={styles.primaryBtn}
          >
            CONTINUE SHOPPING
          </Button>
          
          <Button
            component={Link}
            to="/orders"
            endIcon={<ArrowRight size={18} />}
            sx={styles.secondaryBtn}
          >
            VIEW MY ORDERS
          </Button>
        </Box>

      </Container>
    </Box>
  );
}

// --- STYLES ---
const styles = {
  pageBackground: {
    background: '#ffffff',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    py: 8,
    overflow: 'hidden'
  },
  successIconWrapper: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    bgcolor: 'black',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    mb: 3,
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
    animation: 'slideUp 0.5s ease-out'
  },
  title: {
    fontWeight: 900,
    fontSize: { xs: '32px', md: '48px' },
    letterSpacing: '-2px',
    mb: 1,
    color: 'black',
    textAlign: 'center',
    animation: 'slideUp 0.6s ease-out'
  },
  subtitle: {
    color: '#666',
    fontSize: '16px',
    textAlign: 'center',
    mb: 6,
    maxWidth: '400px',
    animation: 'slideUp 0.7s ease-out'
  },
  perspectiveWrapper: {
    perspective: '1500px',
    mb: 6,
    animation: 'slideUp 0.8s ease-out',
    width: '100%',
    maxWidth: '450px',
  },
  receiptCard: {
    p: 4,
    borderRadius: '0px', // Square corners for receipt look
    background: '#fff',
    // Realistic Receipt Shadow
    boxShadow: '0 1px 4px rgba(0,0,0,0.05), 0 20px 50px rgba(0,0,0,0.1)', 
    borderTop: '8px solid black', // Brand accent
    position: 'relative',
    transformStyle: 'preserve-3d',
    animation: 'float 6s ease-in-out infinite',
    // Zig-zag bottom edge via CSS mask or SVG (simplified here with just border)
    borderBottom: '4px dotted #ccc' 
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    mb: 1.5,
    alignItems: 'center'
  },
  label: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#999',
    letterSpacing: '1px'
  },
  value: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#000',
    fontFamily: 'Monospace, Inter, sans-serif' // Receipt font feel
  },
  actions: {
    display: 'flex',
    gap: 2,
    flexWrap: 'wrap',
    justifyContent: 'center',
    animation: 'slideUp 0.9s ease-out'
  },
  primaryBtn: {
    bgcolor: 'black',
    color: 'white',
    px: 4, py: 1.5,
    borderRadius: '0', // Sharp styling
    fontWeight: 800,
    fontSize: '12px',
    letterSpacing: '1px',
    '&:hover': {
      bgcolor: '#333',
      transform: 'translateY(-2px)',
      boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
    },
    transition: 'all 0.3s ease'
  },
  secondaryBtn: {
    color: 'black',
    borderColor: 'black',
    border: '1px solid black',
    px: 4, py: 1.5,
    borderRadius: '0',
    fontWeight: 800,
    fontSize: '12px',
    letterSpacing: '1px',
    '&:hover': {
      bgcolor: '#f5f5f5',
      borderColor: 'black',
      transform: 'translateY(-2px)'
    },
    transition: 'all 0.3s ease'
  }
};