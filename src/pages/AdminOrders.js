import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton, Button, TextField, MenuItem,
  Select, FormControl, InputLabel, Dialog, DialogTitle, DialogContent,
  DialogActions, Snackbar, Alert, CircularProgress, Tooltip, Grid,
  Card, CardContent, Container, Avatar, useTheme
} from "@mui/material";
import {
  Visibility, Edit, CheckCircle, Cancel, Refresh, Search, FilterList,
  Download, LocalShipping, AttachMoney, Person, LocationOn, ShoppingBag, ArrowBack
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState([null, null]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  
  const navigate = useNavigate();

  // Styles
  const styles = {
    pageWrapper: { background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh', pb: 8, pt: 4 },
    glassPanel: { background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(20px)', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.9)', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)', transition: 'all 0.4s ease' },
    gradientText: { background: 'linear-gradient(45deg, #111 30%, #555 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 900 },
    tableRow: { transition: 'all 0.2s ease', '&:hover': { background: 'rgba(255,255,255,0.9) !important', transform: 'scale(1.005)', zIndex: 2, position: 'relative' } }
  };

  useEffect(() => { fetchOrders(); }, []);
  useEffect(() => { filterOrders(); }, [orders, searchTerm, statusFilter, dateRange]);

  const fetchOrders = async () => {
    try {
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
            email,
            full_name,
            phone
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
      setFilteredOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      showSnackbar("Error loading orders", "error");
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.order_number?.toLowerCase().includes(lowerTerm) ||
        order.id?.toLowerCase().includes(lowerTerm) ||
        // Accessing name from shipping_address JSON safely
        order.shipping_address?.name?.toLowerCase().includes(lowerTerm) ||
        order.profiles?.email?.toLowerCase().includes(lowerTerm)
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    setFilteredOrders(filtered);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase.from("orders").update({ status: newStatus, updated_at: new Date().toISOString() }).eq("id", orderId);
      if (error) throw error;
      showSnackbar(`Order status updated to ${newStatus}`, "success");
      fetchOrders(); 
    } catch (error) { showSnackbar("Error updating status", "error"); }
  };

  const calculateStats = () => {
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
    return {
      totalRevenue,
      pending: orders.filter(o => o.status === 'pending').length,
      processing: orders.filter(o => o.status === 'processing').length,
      total: orders.length
    };
  };
  const stats = calculateStats();

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending': return '#F59E0B'; case 'processing': return '#3B82F6';
      case 'shipped': return '#8B5CF6'; case 'delivered': return '#10B981';
      case 'cancelled': return '#EF4444'; default: return '#6B7280';
    }
  };

  const showSnackbar = (message, severity = "success") => setSnackbar({ open: true, message, severity });

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={styles.pageWrapper}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={() => navigate('/admin')} sx={{ bgcolor: 'white' }}><ArrowBack /></IconButton>
              <Typography variant="h3" sx={styles.gradientText}>Order Command</Typography>
            </Box>
            <Button variant="outlined" startIcon={<Refresh />} onClick={fetchOrders} sx={{ borderRadius: '30px' }}>Refresh</Button>
          </Box>

          <Grid container spacing={3} sx={{ mb: 5 }}>
            {[{ title: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, icon: <AttachMoney/>, color: "#10B981" },
              { title: "Pending", value: stats.pending, icon: <ShoppingBag/>, color: "#F59E0B" },
              { title: "Processing", value: stats.processing, icon: <LocalShipping/>, color: "#3B82F6" }
            ].map((stat, i) => (
              <Grid item xs={12} md={4} key={i}>
                <Card sx={{ ...styles.glassPanel, p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: `${stat.color}20`, color: stat.color }}>{stat.icon}</Box>
                    <Box>
                      <Typography variant="h4" fontWeight={800}>{stat.value}</Typography>
                      <Typography variant="caption" color="text.secondary">{stat.title}</Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Paper sx={{ ...styles.glassPanel, p: 3, mb: 4 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField fullWidth placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} size="small" />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Status">
                    <MenuItem value="all">All</MenuItem><MenuItem value="pending">Pending</MenuItem><MenuItem value="processing">Processing</MenuItem><MenuItem value="shipped">Shipped</MenuItem><MenuItem value="delivered">Delivered</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          <TableContainer component={Paper} sx={{ ...styles.glassPanel, mb: 8 }}>
            {loading ? <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box> : (
              <Table>
                <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.03)' }}>
                  <TableRow>
                    <TableCell fontWeight={800}>ORDER ID</TableCell>
                    <TableCell fontWeight={800}>CUSTOMER</TableCell>
                    <TableCell fontWeight={800}>TOTAL</TableCell>
                    <TableCell fontWeight={800}>STATUS</TableCell>
                    <TableCell fontWeight={800}>ACTIONS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} sx={styles.tableRow}>
                      <TableCell><Chip label={order.order_number || order.id.slice(0, 8).toUpperCase()} sx={{ borderRadius: '8px', fontWeight: 700 }} /></TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={700}>
                          {/* Accessing name from shipping_address JSON safely */}
                          {order.shipping_address?.name || order.profiles?.full_name || 'Guest'}
                        </Typography>
                        <Typography variant="caption">{order.profiles?.email}</Typography>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>₹{Number(order.total_amount || 0).toFixed(2)}</TableCell>
                      <TableCell><Chip label={order.status?.toUpperCase()} size="small" sx={{ bgcolor: `${getStatusColor(order.status)}20`, color: getStatusColor(order.status), fontWeight: 800 }} /></TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {/* Updated navigation to match standard admin route pattern if needed, typically just viewing details */}
                          <IconButton size="small" onClick={() => { setSelectedOrder(order); setOpenDialog(true); }}><Visibility fontSize="small" /></IconButton>
                          {order.status === 'pending' && <IconButton size="small" onClick={() => handleUpdateStatus(order.id, 'processing')} sx={{ color: '#3B82F6' }}><CheckCircle fontSize="small" /></IconButton>}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TableContainer>

          <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '24px' } }}>
            {selectedOrder && (
              <>
                <DialogTitle>Order #{selectedOrder.order_number || selectedOrder.id.slice(0,8)}</DialogTitle>
                <DialogContent dividers>
                  <Grid container spacing={2}>
                    {/* Accessing JSON fields safely */}
                    <Grid item xs={6}><Typography variant="subtitle2">Customer</Typography><Typography>{selectedOrder.shipping_address?.name}</Typography></Grid>
                    <Grid item xs={6}><Typography variant="subtitle2">Shipping</Typography><Typography>{selectedOrder.shipping_address?.address}</Typography></Grid>
                    
                    {/* Optional: Render Items List if you want to see what they bought */}
                    <Grid item xs={12} sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Items Ordered</Typography>
                        {selectedOrder.order_items?.map((item, idx) => (
                            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, p: 1, border: '1px solid #eee', borderRadius: '8px' }}>
                                <Avatar src={item.image_url} variant="rounded" />
                                <Box>
                                    <Typography variant="body2" fontWeight={600}>{item.product_name}</Typography>
                                    <Typography variant="caption">Qty: {item.quantity} | ₹{item.price_at_time}</Typography>
                                </Box>
                            </Box>
                        ))}
                    </Grid>
                  </Grid>
                </DialogContent>
                <DialogActions><Button onClick={() => setOpenDialog(false)}>Close</Button></DialogActions>
              </>
            )}
          </Dialog>
          <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}><Alert severity={snackbar.severity}>{snackbar.message}</Alert></Snackbar>
        </Container>
      </Box>
    </LocalizationProvider>
  );
}