import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";
import { 
  Box, Container, Grid, Typography, Button, Divider, 
  CircularProgress, IconButton, Snackbar, Alert, Paper 
} from "@mui/material";
import { 
  ArrowLeft, Printer, Share2, Package, Check, 
  MapPin, CreditCard, Receipt 
} from "lucide-react";

export default function UserOrderDetailsPage({ session }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ open: false, message: "" });

  /* ---------- FETCH ORDER ---------- */
  const fetchUserOrder = useCallback(async () => {
    try {
      if (!session?.user) return;

      // ✅ CHANGE 1: Simplified Query (No products join needed)
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            id,
            product_name,
            quantity,
            price_at_time,
            image_url
          )
        `)
        .eq("id", id)
        .eq("user_id", session.user.id)
        .single();

      if (error) throw error;

      // ✅ CHANGE 2: Removed extra address fetch (Address is now in 'orders' table)
      setOrder(data);

    } catch (err) {
      console.error("ORDER FETCH ERROR:", err);
      navigate("/orders", { replace: true });
    } finally {
      setLoading(false);
    }
  }, [id, navigate, session]);

  useEffect(() => {
    fetchUserOrder();
  }, [fetchUserOrder]);

  /* ---------- HELPERS ---------- */
  const handlePrint = () => window.print();

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: `Order #${order.order_number}`, url });
    } else {
      await navigator.clipboard.writeText(url);
      setNotification({ open: true, message: "LINK COPIED" });
    }
  };

  const getStatusStep = (status) => {
    const steps = ["pending", "processing", "shipped", "delivered"];
    return steps.indexOf(status?.toLowerCase());
  };

  /* ---------- STATES ---------- */
  if (loading) {
    return (
      <Box sx={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress sx={{ color: "black" }} />
      </Box>
    );
  }

  if (!order) return null;

  const currentStep = getStatusStep(order.status);

  return (
    <Box sx={styles.pageBackground}>
      <Container maxWidth="xl" sx={{ px: { xs: 2, md: 6 }, py: 6 }}>

        {/* TOP NAV */}
        <Box sx={styles.topNav}>
          <Button
            startIcon={<ArrowLeft size={18} />}
            onClick={() => navigate("/orders")}
            sx={styles.backBtn}
          >
            RETURN TO ORDERS
          </Button>

          <Box sx={{ display: "flex", gap: 2 }}>
            <IconButton onClick={handleShare} sx={styles.iconBtn}>
              <Share2 size={20} />
            </IconButton>
            <IconButton onClick={handlePrint} sx={styles.iconBtn}>
              <Printer size={20} />
            </IconButton>
          </Box>
        </Box>

        <Grid container spacing={6}>
          {/* LEFT */}
          <Grid item xs={12} md={7}>
            <Typography sx={styles.pageTitle}>
              ORDER #{order.order_number || order.id?.slice(0,8).toUpperCase()}
            </Typography>

            <Typography sx={styles.dateLabel}>
              PLACED ON{" "}
              {new Date(order.created_at).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric"
              }).toUpperCase()}
            </Typography>

            {/* STATUS */}
            <Box sx={styles.glassCard}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 4, gap: 2 }}>
                <Package size={24} />
                <Typography sx={styles.sectionHeader}>
                  SHIPMENT STATUS
                </Typography>
              </Box>

              <Box sx={styles.timelineContainer}>
                {["ORDERED", "PROCESSING", "SHIPPED", "DELIVERED"].map((label, index) => (
                  <Box key={label} sx={styles.timelineStep}>
                    <Box
                      sx={{
                        ...styles.timelineDot,
                        bgcolor: index <= currentStep ? "black" : "#eee",
                        color: index <= currentStep ? "white" : "transparent",
                        borderColor: index <= currentStep ? "black" : "#eee"
                      }}
                    >
                      <Check size={12} strokeWidth={4} />
                    </Box>

                    <Typography
                      sx={{
                        ...styles.timelineText,
                        color: index <= currentStep ? "black" : "#999",
                        fontWeight: index <= currentStep ? 800 : 500
                      }}
                    >
                      {label}
                    </Typography>

                    {index < 3 && (
                      <Box
                        sx={{
                          ...styles.timelineLine,
                          bgcolor: index < currentStep ? "black" : "#eee"
                        }}
                      />
                    )}
                  </Box>
                ))}
              </Box>
            </Box>

            {/* ITEMS */}
            <Box sx={{ mt: 4 }}>
              <Typography sx={{ ...styles.sectionHeader, mb: 3 }}>
                PURCHASED ASSETS ({order.order_items?.length || 0})
              </Typography>

              {/* ✅ CHANGE 4: Added optional chaining for safety */}
              {order.order_items?.map((item) => (
                <Box key={item.id} sx={styles.itemCard}>
                  {/* ✅ CHANGE 3: Correct Item Rendering */}
                  <img
                    src={item.image_url || "https://images.unsplash.com/photo-1558769132-cb1cb458ed44?w=150&h=150&fit=crop"}
                    alt={item.product_name}
                    style={styles.itemImg}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://images.unsplash.com/photo-1558769132-cb1cb458ed44?w=150&h=150&fit=crop";
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={styles.itemName}>
                      {item.product_name || "Product Name"}
                    </Typography>
                    <Typography sx={styles.itemMeta}>
                      QTY: {item.quantity}
                    </Typography>
                  </Box>
                  <Typography sx={styles.itemPrice}>
                    ₹{item.price_at_time}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>

          {/* RIGHT */}
          <Grid item xs={12} md={5}>
            <Box sx={styles.invoiceWrapper}>
              <Paper sx={styles.invoicePaper}>
                <Typography sx={{ fontSize: 32, fontWeight: 900 }}>
                  ONE-T
                </Typography>

                <Divider sx={{ my: 3 }} />

                <Typography sx={styles.invoiceLabel}>
                  <MapPin size={12} /> SHIP TO
                </Typography>

                <Typography sx={styles.invoiceValue}>
                  {/* ✅ CHANGE 5: Correct Shipping Address Display */}
                  {order.shipping_address
                    ? `${order.shipping_address.city || ''}, ${order.shipping_address.zip || ''}`
                    : "N/A"}
                </Typography>

                <Divider sx={{ my: 3 }} />

                <Typography sx={styles.invoiceLabel}>
                  <CreditCard size={12} /> PAYMENT
                </Typography>

                <Typography sx={styles.invoiceValue}>
                  {order.payment_method?.toUpperCase()}
                </Typography>

                <Button
                  fullWidth
                  startIcon={<Receipt size={16} />}
                  variant="outlined"
                  sx={styles.invoiceBtn}
                  onClick={handlePrint}
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
        onClose={() => setNotification({ open: false, message: "" })}
      >
        <Alert severity="success">{notification.message}</Alert>
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
    mb: 4,
    mt: 4
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