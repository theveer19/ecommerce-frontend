// src/pages/AdminOrderDetailsPage.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Badge,
  Tooltip,
  LinearProgress
} from "@mui/material";
import {
  ArrowBack,
  Edit,
  CheckCircle,
  Cancel,
  LocalShipping,
  AttachMoney,
  CalendarToday,
  Person,
  Email,
  Phone,
  LocationOn,
  ShoppingBag,
  Payment,
  Receipt,
  Print,
  Download,
  Share,
  Timeline,
  Inventory,
  Warning,
  Check,
  Close,
  MoreVert,
  Refresh,
  Chat,
  Mail,
  Phone as PhoneIcon
} from "@mui/icons-material";
import { format } from 'date-fns';

export default function AdminOrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
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
              id,
              name,
              description,
              image_url,
              category,
              brand,
              sku
            )
          ),
          users (
            id,
            email,
            full_name,
            phone,
            avatar_url,
            created_at
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      
      setOrder(data);
      
      // Initialize tracking number if exists
      if (data.tracking_number) {
        setTrackingNumber(data.tracking_number);
      }
      
      // Initialize notes
      if (data.admin_notes) {
        setNotes(data.admin_notes);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      showSnackbar("Error loading order details", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) return;
    
    try {
      setUpdating(true);
      
      const updates = {
        status: newStatus,
        updated_at: new Date().toISOString(),
        admin_notes: notes || null,
        tracking_number: trackingNumber || null
      };

      // Add status-specific timestamps
      if (newStatus === 'processing') {
        updates.processing_at = new Date().toISOString();
      } else if (newStatus === 'shipped') {
        updates.shipped_at = new Date().toISOString();
      } else if (newStatus === 'delivered') {
        updates.delivered_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("orders")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      // Update local state
      setOrder(prev => ({
        ...prev,
        ...updates
      }));

      showSnackbar(`Order status updated to ${newStatus}`, "success");
      setStatusDialogOpen(false);
      setNewStatus('');
    } catch (error) {
      console.error("Error updating order status:", error);
      showSnackbar("Error updating order status", "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    if (window.confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
      try {
        setUpdating(true);
        
        const { error } = await supabase
          .from("orders")
          .update({ 
            status: 'cancelled',
            updated_at: new Date().toISOString(),
            cancelled_at: new Date().toISOString()
          })
          .eq("id", id);

        if (error) throw error;

        setOrder(prev => ({
          ...prev,
          status: 'cancelled',
          cancelled_at: new Date().toISOString()
        }));

        showSnackbar("Order cancelled successfully", "success");
      } catch (error) {
        console.error("Error cancelling order:", error);
        showSnackbar("Error cancelling order", "error");
      } finally {
        setUpdating(false);
      }
    }
  };

  const handleRefund = async () => {
    if (window.confirm("Initiate refund for this order?")) {
      try {
        // Here you would integrate with your payment gateway's refund API
        // For now, we'll just update the order status
        const { error } = await supabase
          .from("orders")
          .update({ 
            payment_status: 'refunded',
            status: 'cancelled',
            updated_at: new Date().toISOString(),
            refunded_at: new Date().toISOString()
          })
          .eq("id", id);

        if (error) throw error;

        setOrder(prev => ({
          ...prev,
          payment_status: 'refunded',
          status: 'cancelled',
          refunded_at: new Date().toISOString()
        }));

        showSnackbar("Refund initiated successfully", "success");
      } catch (error) {
        console.error("Error processing refund:", error);
        showSnackbar("Error processing refund", "error");
      }
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending': return '#F59E0B';
      case 'processing': return '#3B82F6';
      case 'shipped': return '#8B5CF6';
      case 'delivered': return '#22C55E';
      case 'cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'paid': return '#22C55E';
      case 'pending': return '#F59E0B';
      case 'failed': return '#EF4444';
      case 'refunded': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleExportInvoice = () => {
    // Simple export implementation
    const invoiceContent = `
Invoice
Order ID: ${order?.order_number || order?.id}
Date: ${order?.created_at ? format(new Date(order.created_at), 'PPP') : 'N/A'}
Customer: ${order?.shipping_address?.name || order?.users?.full_name || 'N/A'}
Status: ${order?.status}
Payment: ${order?.payment_status}
Total: ₹${order?.total_amount || '0.00'}
    `;
    
    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice_${order?.order_number || order?.id}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showSnackbar("Invoice exported successfully", "success");
  };

  const getOrderTimeline = () => {
    const timeline = [];
    
    if (order?.created_at) {
      timeline.push({
        status: 'Order Placed',
        date: order.created_at,
        icon: <ShoppingBag />,
        color: '#22C55E'
      });
    }
    
    if (order?.processing_at) {
      timeline.push({
        status: 'Processing Started',
        date: order.processing_at,
        icon: <Inventory />,
        color: '#3B82F6'
      });
    }
    
    if (order?.shipped_at) {
      timeline.push({
        status: 'Shipped',
        date: order.shipped_at,
        icon: <LocalShipping />,
        color: '#8B5CF6'
      });
    }
    
    if (order?.delivered_at) {
      timeline.push({
        status: 'Delivered',
        date: order.delivered_at,
        icon: <CheckCircle />,
        color: '#22C55E'
      });
    }
    
    if (order?.cancelled_at) {
      timeline.push({
        status: 'Cancelled',
        date: order.cancelled_at,
        icon: <Cancel />,
        color: '#EF4444'
      });
    }
    
    return timeline.sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '80vh',
        background: '#F5F1E8'
      }}>
        <CircularProgress sx={{ color: '#8B7355' }} />
      </Box>
    );
  }

  if (!order) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '80vh',
        background: '#F5F1E8',
        p: 3
      }}>
        <Typography variant="h5" sx={{ color: '#4A4A3A', mb: 2 }}>
          Order not found
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/admin/orders')}
          sx={{
            background: '#8B7355',
            color: 'white',
            '&:hover': { background: '#755F47' }
          }}
        >
          Back to Orders
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, background: '#F5F1E8', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <IconButton 
              onClick={() => navigate('/admin/orders')}
              sx={{ 
                color: '#8B7355',
                '&:hover': { background: 'rgba(139, 115, 85, 0.1)' }
              }}
            >
              <ArrowBack />
            </IconButton>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#4A4A3A' }}>
              Order Details
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ color: '#6B6B5A', ml: 6 }}>
            {order.order_number || `ORD-${order.id.slice(-8).toUpperCase()}`}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Print />}
            onClick={handlePrintInvoice}
            sx={{ 
              borderColor: '#6B7280',
              color: '#6B7280',
              '&:hover': { borderColor: '#4B5563', background: 'rgba(107, 114, 128, 0.05)' }
            }}
          >
            Print
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExportInvoice}
            sx={{ 
              borderColor: '#8B7355',
              color: '#8B7355',
              '&:hover': { borderColor: '#755F47', background: 'rgba(139, 115, 85, 0.05)' }
            }}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={fetchOrderDetails}
            disabled={updating}
            sx={{
              background: '#8B7355',
              color: 'white',
              '&:hover': { background: '#755F47' },
              '&.Mui-disabled': { background: '#C4B5A0' }
            }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} lg={8}>
          {/* Order Status Card */}
          <Card sx={{ 
            mb: 3,
            borderRadius: 3,
            background: 'white',
            boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
            border: '1px solid rgba(139, 115, 85, 0.1)',
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#4A4A3A', mb: 1 }}>
                    Order Status
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip 
                      label={order.status?.toUpperCase()} 
                      sx={{ 
                        background: `${getStatusColor(order.status)}15`,
                        color: getStatusColor(order.status),
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        py: 1
                      }}
                    />
                    <Chip 
                      label={order.payment_status?.toUpperCase()} 
                      sx={{ 
                        background: `${getPaymentStatusColor(order.payment_status)}15`,
                        color: getPaymentStatusColor(order.payment_status),
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        py: 1
                      }}
                    />
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={() => {
                      setNewStatus(order.status);
                      setStatusDialogOpen(true);
                    }}
                    sx={{ 
                      borderColor: '#8B7355',
                      color: '#8B7355',
                      '&:hover': { borderColor: '#755F47', background: 'rgba(139, 115, 85, 0.05)' }
                    }}
                  >
                    Update Status
                  </Button>
                  {order.status !== 'cancelled' && order.status !== 'delivered' && (
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Cancel />}
                      onClick={handleCancelOrder}
                      disabled={updating}
                      sx={{ 
                        borderColor: '#EF4444',
                        color: '#EF4444',
                        '&:hover': { borderColor: '#DC2626', background: 'rgba(239, 68, 68, 0.05)' }
                      }}
                    >
                      Cancel Order
                    </Button>
                  )}
                </Box>
              </Box>

              {/* Order Timeline */}
              <Typography variant="subtitle2" sx={{ color: '#6B6B5A', mb: 2, fontWeight: 600 }}>
                Order Timeline
              </Typography>
              <Box sx={{ pl: 2 }}>
                {getOrderTimeline().map((event, index) => (
                  <Box key={index} sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2, 
                    mb: 2,
                    pb: 2,
                    borderBottom: index < getOrderTimeline().length - 1 ? '1px solid #E5E7EB' : 'none'
                  }}>
                    <Box sx={{ 
                      width: 32, 
                      height: 32, 
                      borderRadius: '50%',
                      background: `${event.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: event.color
                    }}>
                      {event.icon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#4A4A3A' }}>
                        {event.status}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#6B7280' }}>
                        {format(new Date(event.date), 'PPpp')}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card sx={{ 
            mb: 3,
            borderRadius: 3,
            background: 'white',
            boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
            border: '1px solid rgba(139, 115, 85, 0.1)',
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#4A4A3A', mb: 3 }}>
                <ShoppingBag sx={{ mr: 1, verticalAlign: 'middle' }} />
                Order Items ({order.order_items?.length || 0})
              </Typography>

              <TableContainer>
                <Table>
                  <TableHead sx={{ background: '#F5F1E8' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, color: '#4A4A3A' }}>Product</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#4A4A3A' }}>Price</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#4A4A3A' }}>Quantity</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#4A4A3A' }} align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order.order_items?.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar
                              src={item.products?.image_url}
                              alt={item.products?.name}
                              sx={{ width: 56, height: 56, borderRadius: 2 }}
                            >
                              {item.products?.name?.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography sx={{ fontWeight: 600, color: '#2A2A2A' }}>
                                {item.products?.name}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#6B7280' }}>
                                SKU: {item.products?.sku || 'N/A'}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#8B7355' }}>
                                {item.products?.category}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontWeight: 600, color: '#4A4A3A' }}>
                            ₹{item.price_at_time?.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ color: '#4A4A3A' }}>
                            {item.quantity}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography sx={{ fontWeight: 700, color: '#8B7355' }}>
                            ₹{(item.quantity * item.price_at_time).toFixed(2)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Customer Notes (if any) */}
          {order.customer_notes && (
            <Card sx={{ 
              borderRadius: 3,
              background: 'white',
              boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
              border: '1px solid rgba(139, 115, 85, 0.1)',
            }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#4A4A3A', mb: 2 }}>
                  Customer Notes
                </Typography>
                <Paper sx={{ 
                  p: 2, 
                  background: '#F5F1E8', 
                  borderRadius: 2,
                  border: '1px solid rgba(139, 115, 85, 0.1)'
                }}>
                  <Typography sx={{ color: '#4A4A3A', fontStyle: 'italic' }}>
                    "{order.customer_notes}"
                  </Typography>
                </Paper>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} lg={4}>
          {/* Customer Information */}
          <Card sx={{ 
            mb: 3,
            borderRadius: 3,
            background: 'white',
            boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
            border: '1px solid rgba(139, 115, 85, 0.1)',
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#4A4A3A', mb: 3 }}>
                <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                Customer Information
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar
                  src={order.users?.avatar_url}
                  sx={{ width: 56, height: 56 }}
                >
                  {order.users?.full_name?.charAt(0) || order.shipping_address?.name?.charAt(0) || 'C'}
                </Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 700, color: '#2A2A2A' }}>
                    {order.shipping_address?.name || order.users?.full_name || 'Customer'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6B7280' }}>
                    {order.users?.email || order.shipping_address?.email}
                  </Typography>
                </Box>
              </Box>

              <List dense>
                {order.shipping_address?.phone && (
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <PhoneIcon sx={{ color: '#8B7355' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Phone"
                      secondary={order.shipping_address.phone}
                      secondaryTypographyProps={{ color: '#4A4A3A' }}
                    />
                  </ListItem>
                )}

                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Email sx={{ color: '#8B7355' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Email"
                    secondary={order.users?.email || order.shipping_address?.email || 'N/A'}
                    secondaryTypographyProps={{ color: '#4A4A3A' }}
                  />
                </ListItem>

                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <CalendarToday sx={{ color: '#8B7355' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Customer Since"
                    secondary={order.users?.created_at ? format(new Date(order.users.created_at), 'PP') : 'N/A'}
                    secondaryTypographyProps={{ color: '#4A4A3A' }}
                  />
                </ListItem>
              </List>

              <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
                <Button
                  variant="outlined"
                  startIcon={<Chat />}
                  fullWidth
                  sx={{ 
                    borderColor: '#8B7355',
                    color: '#8B7355',
                    '&:hover': { borderColor: '#755F47', background: 'rgba(139, 115, 85, 0.05)' }
                  }}
                >
                  Message
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Mail />}
                  fullWidth
                  sx={{ 
                    background: '#8B7355',
                    color: 'white',
                    '&:hover': { background: '#755F47' }
                  }}
                >
                  Email
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Shipping Information */}
          <Card sx={{ 
            mb: 3,
            borderRadius: 3,
            background: 'white',
            boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
            border: '1px solid rgba(139, 115, 85, 0.1)',
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#4A4A3A', mb: 3 }}>
                <LocationOn sx={{ mr: 1, verticalAlign: 'middle' }} />
                Shipping Information
              </Typography>

              <Box sx={{ background: '#F5F1E8', borderRadius: 2, p: 2, mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#4A4A3A', mb: 1 }}>
                  Shipping Address
                </Typography>
                <Typography sx={{ color: '#4A4A3A', whiteSpace: 'pre-line' }}>
                  {order.shipping_address?.name || 'Customer'}{'\n'}
                  {order.shipping_address?.address}{'\n'}
                  {order.shipping_address?.city}, {order.shipping_address?.state}{'\n'}
                  {order.shipping_address?.pincode}{'\n'}
                  {order.shipping_address?.country || 'India'}
                </Typography>
              </Box>

              <Box sx={{ background: '#F5F1E8', borderRadius: 2, p: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#4A4A3A', mb: 1 }}>
                  Shipping Method
                </Typography>
                <Typography sx={{ color: '#4A4A3A' }}>
                  {order.shipping_method || 'Standard Shipping'}
                </Typography>
                {order.tracking_number && (
                  <>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#4A4A3A', mt: 2, mb: 1 }}>
                      Tracking Number
                    </Typography>
                    <Typography sx={{ 
                      fontFamily: 'monospace', 
                      color: '#8B7355',
                      background: 'white',
                      p: 1,
                      borderRadius: 1,
                      border: '1px solid rgba(139, 115, 85, 0.2)'
                    }}>
                      {order.tracking_number}
                    </Typography>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card sx={{ 
            borderRadius: 3,
            background: 'white',
            boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
            border: '1px solid rgba(139, 115, 85, 0.1)',
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#4A4A3A', mb: 3 }}>
                <Receipt sx={{ mr: 1, verticalAlign: 'middle' }} />
                Order Summary
              </Typography>

              <List dense>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText primary="Subtotal" />
                  <Typography sx={{ fontWeight: 600 }}>
                    ₹{order.subtotal?.toFixed(2) || '0.00'}
                  </Typography>
                </ListItem>
                
                <ListItem sx={{ px: 0 }}>
                  <ListItemText primary="Shipping" />
                  <Typography sx={{ fontWeight: 600 }}>
                    ₹{order.shipping_cost?.toFixed(2) || '0.00'}
                  </Typography>
                </ListItem>
                
                <ListItem sx={{ px: 0 }}>
                  <ListItemText primary="Tax" />
                  <Typography sx={{ fontWeight: 600 }}>
                    ₹{order.tax_amount?.toFixed(2) || '0.00'}
                  </Typography>
                </ListItem>
                
                <ListItem sx={{ px: 0 }}>
                  <ListItemText primary="Discount" />
                  <Typography sx={{ fontWeight: 600, color: '#22C55E' }}>
                    -₹{order.discount_amount?.toFixed(2) || '0.00'}
                  </Typography>
                </ListItem>
                
                <Divider sx={{ my: 1 }} />
                
                <ListItem sx={{ px: 0 }}>
                  <ListItemText 
                    primary={<Typography sx={{ fontWeight: 700, fontSize: '1.1rem' }}>Total</Typography>} 
                  />
                  <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: '#8B7355' }}>
                    ₹{order.total_amount?.toFixed(2) || '0.00'}
                  </Typography>
                </ListItem>
              </List>

              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#6B6B5A', mb: 1 }}>
                  Payment Method
                </Typography>
                <Chip 
                  label={order.payment_method?.toUpperCase() || 'ONLINE'} 
                  sx={{ 
                    background: '#8B735515',
                    color: '#8B7355',
                    fontWeight: 600
                  }}
                />
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#6B6B5A', mb: 1 }}>
                  Transaction ID
                </Typography>
                <Typography sx={{ 
                  fontFamily: 'monospace', 
                  fontSize: '0.875rem',
                  color: '#6B7280',
                  wordBreak: 'break-all'
                }}>
                  {order.transaction_id || 'N/A'}
                </Typography>
              </Box>

              {/* Refund Button */}
              {order.payment_status === 'paid' && order.status !== 'refunded' && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<AttachMoney />}
                  onClick={handleRefund}
                  fullWidth
                  sx={{ mt: 3 }}
                >
                  Initiate Refund
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Update Status Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ background: '#F5F1E8', color: '#4A4A3A', fontWeight: 700 }}>
          Update Order Status
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>New Status</InputLabel>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              label="New Status"
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="processing">Processing</MenuItem>
              <MenuItem value="shipped">Shipped</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Tracking Number (if shipping)"
            fullWidth
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Enter tracking number"
            sx={{ mb: 3 }}
          />

          <TextField
            label="Admin Notes"
            fullWidth
            multiline
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this order..."
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, background: '#F5F1E8' }}>
          <Button onClick={() => setStatusDialogOpen(false)} sx={{ color: '#6B6B5A' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleStatusUpdate}
            disabled={!newStatus || updating}
            sx={{
              background: '#8B7355',
              color: 'white',
              '&:hover': { background: '#755F47' },
              '&.Mui-disabled': { background: '#C4B5A0' }
            }}
          >
            {updating ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Update Status'}
          </Button>
        </DialogActions>
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
  );
}