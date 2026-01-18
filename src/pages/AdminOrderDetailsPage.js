import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";
import {
  Box, Typography, Grid, Card, CardContent, Button, Chip, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem,
  FormControl, InputLabel, Snackbar, Alert, CircularProgress, Avatar, List,
  ListItem, ListItemIcon, ListItemText, Container
} from "@mui/material";
import {
  ArrowBack, Edit, Print, Phone as PhoneIcon, Email
} from "@mui/icons-material";

export default function AdminOrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  // Glass Styles
  const styles = {
    pageWrapper: { background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh', pb: 8, pt: 4 },
    glassPanel: { background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(20px)', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.9)', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)', transition: 'all 0.4s ease' },
    card3D: { transformStyle: 'preserve-3d', perspective: '1000px', transition: 'transform 0.4s ease, box-shadow 0.4s ease', '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)' } },
    gradientText: { background: 'linear-gradient(45deg, #111 30%, #555 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 900 }
  };

  useEffect(() => { if (id) fetchOrderDetails(); }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      // ✅ STEP 1: Updated Query (No products join, using snapshot data)
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
          ),
          profiles (
            full_name,
            email,
            phone,
            avatar_url
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error) {
      console.error("Error fetching order:", error);
      showSnackbar("Error loading details", "error");
    } finally { setLoading(false); }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) return;
    try {
      setUpdating(true);
      const updates = { status: newStatus, updated_at: new Date().toISOString() };
      if (newStatus === 'processing') updates.processing_at = new Date().toISOString();
      if (newStatus === 'shipped') updates.shipped_at = new Date().toISOString();
      if (newStatus === 'delivered') updates.delivered_at = new Date().toISOString();

      const { error } = await supabase.from("orders").update(updates).eq("id", id);
      if (error) throw error;

      setOrder(prev => ({ ...prev, ...updates }));
      showSnackbar(`Status updated to ${newStatus}`, "success");
      setStatusDialogOpen(false);
    } catch (error) { showSnackbar("Update failed", "error"); } finally { setUpdating(false); }
  };

  const showSnackbar = (message, severity = "success") => setSnackbar({ open: true, message, severity });

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;
  if (!order) return <Box sx={{ p: 5, textAlign: 'center' }}><Typography variant="h5">Order not found</Typography><Button onClick={() => navigate('/admin/orders')}>Back</Button></Box>;

  return (
    <Box sx={styles.pageWrapper}>
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => navigate('/admin/orders')} sx={{ bgcolor: 'white' }}><ArrowBack /></IconButton>
            <Box>
              <Typography variant="h4" sx={styles.gradientText}>Order Details</Typography>
              <Typography variant="body2" color="text.secondary">ID: {order.order_number || order.id}</Typography>
            </Box>
          </Box>
          <Button variant="outlined" startIcon={<Print />} onClick={() => window.print()} sx={{ borderRadius: '20px' }}>Print</Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Card sx={{ ...styles.glassPanel, mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Box>
                    <Typography variant="h6" fontWeight={800}>Current Status</Typography>
                    <Chip label={order.status.toUpperCase()} sx={{ mt: 1, bgcolor: '#F59E0B20', color: '#F59E0B', fontWeight: 800 }} />
                  </Box>
                  <Button variant="contained" startIcon={<Edit />} onClick={() => { setNewStatus(order.status); setStatusDialogOpen(true); }} sx={{ bgcolor: 'black', borderRadius: '12px' }}>Update Status</Button>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ ...styles.glassPanel, mb: 3 }}>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ p: 3, borderBottom: '1px solid #eee' }}><Typography variant="h6" fontWeight={800}>Items</Typography></Box>
                <TableContainer>
                  <Table>
                    <TableHead sx={{ bgcolor: '#f9f9f9' }}>
                      <TableRow><TableCell>Product</TableCell><TableCell align="right">Price</TableCell><TableCell align="center">Qty</TableCell><TableCell align="right">Total</TableCell></TableRow>
                    </TableHead>
                    <TableBody>
                      {order.order_items?.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              {/* ✅ STEP 2: Use direct item.image_url */}
                              <Avatar src={item.image_url} variant="rounded" />
                              {/* ✅ STEP 3: Use direct item.product_name */}
                              <Typography fontWeight={600}>{item.product_name}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right">₹{Number(item.price_at_time || 0).toFixed(2)}</TableCell>
                          <TableCell align="center">{item.quantity}</TableCell>
                          <TableCell align="right" fontWeight={700}>₹{(Number(item.price_at_time || 0) * item.quantity).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Card sx={{ ...styles.glassPanel, mb: 3, ...styles.card3D }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={800} gutterBottom>Customer</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar src={order.profiles?.avatar_url} sx={{ width: 56, height: 56 }}>{order.profiles?.full_name?.[0] || 'C'}</Avatar>
                  <Box>
                    <Typography fontWeight={700}>{order.profiles?.full_name || order.shipping_address?.name || 'Guest'}</Typography>
                    <Typography variant="caption" color="text.secondary">{order.profiles?.email}</Typography>
                  </Box>
                </Box>
                <List dense disablePadding>
                  <ListItem disableGutters><ListItemIcon><Email fontSize="small" /></ListItemIcon><ListItemText primary={order.profiles?.email || 'No Email'} /></ListItem>
                  <ListItem disableGutters><ListItemIcon><PhoneIcon fontSize="small" /></ListItemIcon><ListItemText primary={order.shipping_address?.phone || order.profiles?.phone || 'No Phone'} /></ListItem>
                </List>
              </CardContent>
            </Card>

            <Card sx={{ ...styles.glassPanel, ...styles.card3D }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={800} gutterBottom>Summary</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography color="text.secondary">Subtotal</Typography>
                  <Typography fontWeight={600}>₹{Number(order.subtotal || 0).toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography color="text.secondary">Shipping</Typography>
                  <Typography fontWeight={600}>₹{Number(order.shipping_cost || 0).toFixed(2)}</Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" fontWeight={800}>Total</Typography>
                  <Typography variant="h6" fontWeight={800} color="primary">₹{Number(order.total_amount || 0).toFixed(2)}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '24px' } }}>
          <DialogTitle fontWeight={800}>Update Status</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mt: 1 }}>
              <InputLabel>Status</InputLabel>
              <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} label="Status">
                <MenuItem value="pending">Pending</MenuItem><MenuItem value="processing">Processing</MenuItem><MenuItem value="shipped">Shipped</MenuItem><MenuItem value="delivered">Delivered</MenuItem><MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleStatusUpdate} disabled={updating} sx={{ bgcolor: 'black', borderRadius: '12px' }}>Update</Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}><Alert severity={snackbar.severity}>{snackbar.message}</Alert></Snackbar>
      </Container>
    </Box>
  );
}