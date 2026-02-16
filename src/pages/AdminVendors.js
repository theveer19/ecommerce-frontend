import React, { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import {
  Box, Container, Typography, Grid, Paper, Button, Chip, 
  CircularProgress, Avatar, Snackbar, Alert
} from "@mui/material";
import { Store, CheckCircle, ShieldCheck, Mail } from "lucide-react";

// 🔴 REPLACE THIS WITH YOUR ACTUAL PROJECT ID
const PROJECT_REF = "YOUR_SUPABASE_PROJECT_REF"; 

export default function AdminVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("vendors")
      .select("*")
      .order("created_at", { ascending: false });
    setVendors(data || []);
    setLoading(false);
  };

  const approveVendor = async (vendor) => {
    if (!window.confirm(`Approve ${vendor.business_name} and send email notification?`)) return;
    
    setProcessingId(vendor.id);

    try {
      // 1. Update Database Status
      const { error: dbError } = await supabase
        .from("vendors")
        .update({ is_approved: true })
        .eq("id", vendor.id);

      if (dbError) throw dbError;

      // 2. Trigger Edge Function to Send Email
      const { error: fnError } = await fetch(
        `https://${PROJECT_REF}.supabase.co/functions/v1/approve-vendor`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}` 
          },
          body: JSON.stringify({
            email: vendor.email,
            business_name: vendor.business_name
          })
        }
      );

      if (fnError) console.warn("Email sending failed, but vendor approved locally.");

      setSnackbar({ open: true, message: "Vendor approved & notified!", severity: "success" });
      fetchVendors();

    } catch (error) {
      console.error("Approval error:", error);
      setSnackbar({ open: true, message: "Approval failed: " + error.message, severity: "error" });
    } finally {
      setProcessingId(null);
    }
  };

  // --- STYLES ---
  const styles = {
    pageWrapper: {
      minHeight: '100vh',
      background: '#f5f7fa',
      paddingTop: '40px',
      paddingBottom: '80px'
    },
    card: {
      padding: '24px',
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%',
      transition: 'transform 0.2s',
      background: '#fff',
      '&:hover': { transform: 'translateY(-4px)' }
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  return (
    <Box sx={styles.pageWrapper}>
      <Container maxWidth="lg">
        <Typography variant="h4" fontWeight={900} sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <ShieldCheck size={32} /> Vendor Approvals
        </Typography>

        <Grid container spacing={3}>
          {vendors.map((vendor) => (
            <Grid item xs={12} md={4} key={vendor.id}>
              <Paper sx={styles.card}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'black' }}><Store size={20} /></Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>{vendor.business_name}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Mail size={12} /> {vendor.email}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" sx={{ mb: 1 }}><strong>GST:</strong> {vendor.gst_number || "N/A"}</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}><strong>Phone:</strong> {vendor.phone || "N/A"}</Typography>
                  
                  <Chip 
                    label={vendor.is_approved ? "APPROVED" : "PENDING REVIEW"} 
                    color={vendor.is_approved ? "success" : "warning"}
                    size="small"
                    sx={{ fontWeight: 700 }}
                  />
                </Box>

                <Box sx={{ mt: 3 }}>
                  {!vendor.is_approved ? (
                    <Button 
                      fullWidth 
                      variant="contained" 
                      color="success" 
                      disabled={processingId === vendor.id}
                      startIcon={processingId === vendor.id ? <CircularProgress size={20} color="inherit" /> : <CheckCircle size={18} />}
                      onClick={() => approveVendor(vendor)}
                    >
                      {processingId === vendor.id ? "Notifying..." : "Approve Access"}
                    </Button>
                  ) : (
                    <Button fullWidth variant="outlined" disabled startIcon={<CheckCircle size={18} />}>
                      Active Vendor
                    </Button>
                  )}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}