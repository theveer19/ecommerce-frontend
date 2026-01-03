// src/pages/AdminOrdersPage.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  Tooltip,
  Grid,
  Card,
  CardContent,
  Divider
} from "@mui/material";
import {
  Visibility,
  Edit,
  CheckCircle,
  Cancel,
  Refresh,
  Search,
  FilterList,
  Download,
  LocalShipping,
  AttachMoney,
  CalendarToday,
  Person,
  Email,
  Phone,
  LocationOn,
  ShoppingBag
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

export default function AdminOrdersPage() {
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

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter, dateRange]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            id,
            quantity,
            price_at_time,
            product_id,
            products (
              name,
              image_url
            )
          ),
          users (
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

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shipping_address?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shipping_address?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.users?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Filter by date range
    if (dateRange[0] && dateRange[1]) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= dateRange[0] && orderDate <= dateRange[1];
      });
    }

    setFilteredOrders(filtered);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ 
          status: newStatus, 
          updated_at: new Date().toISOString(),
          ...(newStatus === 'shipped' && { shipped_at: new Date().toISOString() }),
          ...(newStatus === 'delivered' && { delivered_at: new Date().toISOString() })
        })
        .eq("id", orderId);

      if (error) throw error;
      showSnackbar(`Order status updated to ${newStatus}`, "success");
      fetchOrders();
    } catch (error) {
      console.error("Error updating order:", error);
      showSnackbar("Error updating order status", "error");
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setOpenDialog(true);
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending': return '#FF9800';
      case 'processing': return '#2196F3';
      case 'shipped': return '#4CAF50';
      case 'delivered': return '#22C55E';
      case 'cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const calculateStats = () => {
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const processingOrders = orders.filter(o => o.status === 'processing').length;
    const shippedOrders = orders.filter(o => o.status === 'shipped').length;
    const deliveredOrders = orders.filter(o => o.status === 'delivered').length;

    return {
      totalRevenue,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      totalOrders: orders.length
    };
  };
  
  const stats = calculateStats();

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3, background: '#F5F1E8', minHeight: '100vh' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#4A4A3A', mb: 0.5 }}>
              📦 Order Management
            </Typography>
            <Typography variant="body1" sx={{ color: '#6B6B5A' }}>
              Manage and track customer orders
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Download />}
              sx={{ 
                borderColor: '#8B7355',
                color: '#8B7355',
                fontWeight: 600,
                '&:hover': { borderColor: '#755F47', background: 'rgba(139, 115, 85, 0.05)' }
              }}
            >
              Export Orders
            </Button>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchOrders}
              sx={{ 
                borderColor: '#3B82F6',
                color: '#3B82F6',
                fontWeight: 600,
                '&:hover': { borderColor: '#2563EB', background: 'rgba(59, 130, 246, 0.05)' }
              }}
            >
              Refresh
            </Button>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { 
              title: "Total Revenue", 
              value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, 
              icon: <AttachMoney />, 
              color: "#22C55E",
              subtext: "All orders"
            },
            { 
              title: "Total Orders", 
              value: stats.totalOrders, 
              icon: <ShoppingBag />, 
              color: "#8B7355",
              subtext: `${stats.pendingOrders} pending`
            },
            { 
              title: "Processing", 
              value: stats.processingOrders, 
              icon: <FilterList />, 
              color: "#2196F3",
              subtext: "In progress"
            },
            { 
              title: "Delivered", 
              value: stats.deliveredOrders, 
              icon: <CheckCircle />, 
              color: "#22C55E",
              subtext: "Completed orders"
            },
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ 
                borderRadius: 3,
                background: 'white',
                boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
                border: '1px solid rgba(139, 115, 85, 0.1)',
                height: '100%'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ 
                      background: `${stat.color}15`,
                      p: 1.5,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Box sx={{ color: stat.color, fontSize: 28 }}>
                        {stat.icon}
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="h3" sx={{ fontWeight: 800, color: '#2A2A2A', mb: 0.5 }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6B6B5A', fontWeight: 500 }}>
                        {stat.title}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#8B7355', fontWeight: 500 }}>
                    {stat.subtext}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Filters */}
        <Paper sx={{ 
          p: 3, 
          mb: 3,
          borderRadius: 3,
          background: 'white',
          boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
          border: '1px solid rgba(139, 115, 85, 0.1)',
        }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search orders by ID, name, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ color: '#8B7355', mr: 1 }} />
                }}
                sx={styles.textField}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth sx={styles.select}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="processing">Processing</MenuItem>
                  <MenuItem value="shipped">Shipped</MenuItem>
                  <MenuItem value="delivered">Delivered</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <DatePicker
                label="From Date"
                value={dateRange[0]}
                onChange={(newValue) => setDateRange([newValue, dateRange[1]])}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<FilterList />}
                onClick={filterOrders}
                sx={{
                  background: '#8B7355',
                  color: 'white',
                  borderRadius: 2,
                  height: '56px',
                  '&:hover': { background: '#755F47' }
                }}
              >
                Filter
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Orders Table */}
        <Paper sx={{ 
          borderRadius: 3,
          background: 'white',
          boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
          border: '1px solid rgba(139, 115, 85, 0.1)',
          overflow: 'hidden'
        }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress sx={{ color: '#8B7355' }} />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead sx={{ background: '#F5F1E8' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: '#4A4A3A' }}>Order ID</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#4A4A3A' }}>Customer</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#4A4A3A' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#4A4A3A' }}>Items</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#4A4A3A' }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#4A4A3A' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#4A4A3A' }}>Payment</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#4A4A3A' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} hover>
                      <TableCell>
                        <Typography sx={{ fontWeight: 600, color: '#2A2A2A', fontFamily: 'monospace' }}>
                          {order.order_number || `ORD-${order.id.slice(-8).toUpperCase()}`}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography sx={{ fontWeight: 500, color: '#4A4A3A' }}>
                            {order.shipping_address?.name || order.users?.full_name || 'Customer'}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#6B6B5A' }}>
                            {order.shipping_address?.email || order.users?.email || 'No email'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ color: '#6B6B5A' }}>
                          {new Date(order.created_at).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#8B7355' }}>
                          {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontWeight: 500, color: '#4A4A3A' }}>
                          {order.order_items?.length || 0} items
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontWeight: 700, color: '#8B7355' }}>
                          ₹{order.total_amount?.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={order.status?.toUpperCase() || 'PENDING'} 
                          size="small"
                          sx={{ 
                            background: `${getStatusColor(order.status)}15`,
                            color: getStatusColor(order.status),
                            fontWeight: 600,
                            textTransform: 'uppercase'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={order.payment_status?.toUpperCase() || 'PENDING'} 
                          size="small"
                          sx={{ 
                            background: order.payment_status === 'paid' ? '#22C55E15' : '#FF980015',
                            color: order.payment_status === 'paid' ? '#22C55E' : '#FF9800',
                            fontWeight: 600,
                            textTransform: 'uppercase'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton 
                              size="small" 
                              onClick={() => handleViewOrder(order)}
                              sx={{ 
                                color: '#8B7355',
                                '&:hover': { background: 'rgba(139, 115, 85, 0.1)' }
                              }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {order.status === 'pending' && (
                            <Tooltip title="Mark as Processing">
                              <IconButton 
                                size="small" 
                                onClick={() => handleUpdateStatus(order.id, 'processing')}
                                sx={{ 
                                  color: '#2196F3',
                                  '&:hover': { background: 'rgba(33, 150, 243, 0.1)' }
                                }}
                              >
                                <CheckCircle fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {order.status === 'processing' && (
                            <Tooltip title="Mark as Shipped">
                              <IconButton 
                                size="small" 
                                onClick={() => handleUpdateStatus(order.id, 'shipped')}
                                sx={{ 
                                  color: '#4CAF50',
                                  '&:hover': { background: 'rgba(76, 175, 80, 0.1)' }
                                }}
                              >
                                <LocalShipping fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* Order Details Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)} 
          maxWidth="md" 
          fullWidth
        >
          {selectedOrder && (
            <>
              <DialogTitle sx={{ background: '#F5F1E8', color: '#4A4A3A', fontWeight: 700 }}>
                Order Details: {selectedOrder.order_number || `ORD-${selectedOrder.id.slice(-8).toUpperCase()}`}
              </DialogTitle>
              <DialogContent dividers>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ color: '#8B7355', fontWeight: 600, mb: 2 }}>
                      <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Customer Information
                    </Typography>
                    <Box sx={{ pl: 3 }}>
                      <Typography variant="body2" sx={{ color: '#4A4A3A', mb: 1 }}>
                        <strong>Name:</strong> {selectedOrder.shipping_address?.name || selectedOrder.users?.full_name || 'N/A'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#4A4A3A', mb: 1 }}>
                        <strong>Email:</strong> {selectedOrder.shipping_address?.email || selectedOrder.users?.email || 'N/A'}
                      </Typography>
                      {selectedOrder.shipping_address?.phone && (
                        <Typography variant="body2" sx={{ color: '#4A4A3A', mb: 1 }}>
                          <strong>Phone:</strong> {selectedOrder.shipping_address.phone}
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ color: '#8B7355', fontWeight: 600, mb: 2 }}>
                      <LocationOn sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Shipping Address
                    </Typography>
                    <Box sx={{ pl: 3 }}>
                      <Typography variant="body2" sx={{ color: '#4A4A3A' }}>
                        {selectedOrder.shipping_address?.address || 'N/A'}<br />
                        {selectedOrder.shipping_address?.city && `${selectedOrder.shipping_address.city}, `}
                        {selectedOrder.shipping_address?.state}<br />
                        {selectedOrder.shipping_address?.pincode && `Pincode: ${selectedOrder.shipping_address.pincode}`}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" sx={{ color: '#8B7355', fontWeight: 600, mb: 2 }}>
                      <ShoppingBag sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Order Items
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Product</TableCell>
                            <TableCell align="right">Price</TableCell>
                            <TableCell align="right">Quantity</TableCell>
                            <TableCell align="right">Total</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedOrder.order_items?.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Box
                                    component="img"
                                    src={item.products?.image_url || "https://via.placeholder.com/40"}
                                    alt={item.products?.name}
                                    sx={{ width: 40, height: 40, borderRadius: 1, objectFit: 'cover' }}
                                  />
                                  <Typography variant="body2">
                                    {item.products?.name || 'Product'}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell align="right">
                                ₹{item.price_at_time?.toFixed(2)}
                              </TableCell>
                              <TableCell align="right">
                                {item.quantity}
                              </TableCell>
                              <TableCell align="right">
                                ₹{(item.quantity * item.price_at_time).toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2" sx={{ color: '#6B6B5A' }}>
                          <strong>Order Date:</strong> {new Date(selectedOrder.created_at).toLocaleString()}
                        </Typography>
                        {selectedOrder.shipped_at && (
                          <Typography variant="body2" sx={{ color: '#6B6B5A' }}>
                            <strong>Shipped Date:</strong> {new Date(selectedOrder.shipped_at).toLocaleDateString()}
                          </Typography>
                        )}
                        {selectedOrder.delivered_at && (
                          <Typography variant="body2" sx={{ color: '#6B6B5A' }}>
                            <strong>Delivered Date:</strong> {new Date(selectedOrder.delivered_at).toLocaleDateString()}
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h6" sx={{ color: '#8B7355', fontWeight: 700 }}>
                          Total: ₹{selectedOrder.total_amount?.toFixed(2)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6B6B5A' }}>
                          {selectedOrder.payment_method} • {selectedOrder.payment_status}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions sx={{ p: 3, background: '#F5F1E8' }}>
                <Button onClick={() => setOpenDialog(false)} sx={{ color: '#6B6B5A' }}>
                  Close
                </Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    setOpenDialog(false);
                    navigate(`/admin/orders/${selectedOrder.id}`);
                  }}
                  sx={{
                    background: '#8B7355',
                    color: 'white',
                    '&:hover': { background: '#755F47' }
                  }}
                >
                  View Full Details
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={6000} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity}
            sx={{ 
              background: 'white',
              color: '#4A4A3A',
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
              borderRadius: 2,
              border: '1px solid rgba(139, 115, 85, 0.2)'
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
}

const styles = {
  textField: {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      background: 'white',
      '& fieldset': {
        borderColor: 'rgba(139, 115, 85, 0.2)',
      },
      '&:hover fieldset': {
        borderColor: 'rgba(139, 115, 85, 0.4)',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#8B7355',
        borderWidth: '2px',
      },
    },
  },
  select: {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      background: 'white',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(139, 115, 85, 0.2)',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(139, 115, 85, 0.4)',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#8B7355',
      borderWidth: '2px',
    },
  },
};