// src/pages/AdminPage.js
import React, { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  LinearProgress,
  CircularProgress,
  Tabs,
  Tab
} from "@mui/material";
import { 
  Add, 
  Edit, 
  Delete, 
  Visibility,
  ShoppingCart,
  People,
  AttachMoney,
  Inventory,
  LocalOffer,
  TrendingUp,
  CheckCircle,
  Cancel,
  Refresh,
  Download,
  BarChart,
  PieChart,
  Store,
  Category,
  Dashboard as DashboardIcon,
  ListAlt,
  Person
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState({ products: true, orders: true, users: true });
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockProducts: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    await Promise.all([
      fetchProducts(),
      fetchOrders(),
      fetchUsers()
    ]);
    calculateStats();
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      showSnackbar("Error loading products", "error");
    } finally {
      setLoading(prev => ({ ...prev, products: false }));
    }
  };

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            quantity,
            price_at_time,
            products (name)
          )
        `)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      showSnackbar("Error loading orders", "error");
    } finally {
      setLoading(prev => ({ ...prev, orders: false }));
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      showSnackbar("Error loading users", "error");
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  };

  const calculateStats = () => {
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const lowStockProducts = products.filter(product => product.stock < 10).length;

    setStats({
      totalProducts: products.length,
      totalOrders: orders.length,
      totalUsers: users.length,
      totalRevenue,
      pendingOrders,
      lowStockProducts
    });
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const { error } = await supabase
          .from("products")
          .delete()
          .eq("id", productId);

        if (error) throw error;
        showSnackbar("Product deleted successfully", "success");
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
        showSnackbar("Error deleting product", "error");
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", orderId);

      if (error) throw error;
      showSnackbar(`Order status updated to ${newStatus}`, "success");
      fetchOrders();
    } catch (error) {
      console.error("Error updating order:", error);
      showSnackbar("Error updating order status", "error");
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
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

  const getPaymentStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'paid': return '#22C55E';
      case 'pending': return '#FF9800';
      case 'failed': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const chartData = [
    { name: 'Jan', revenue: 4000, orders: 240 },
    { name: 'Feb', revenue: 3000, orders: 139 },
    { name: 'Mar', revenue: 2000, orders: 980 },
    { name: 'Apr', revenue: 2780, orders: 390 },
    { name: 'May', revenue: 1890, orders: 480 },
    { name: 'Jun', revenue: 2390, orders: 380 },
  ];

  const categoryData = products.reduce((acc, product) => {
    const category = product.category || 'Uncategorized';
    if (!acc[category]) acc[category] = 0;
    acc[category]++;
    return acc;
  }, {});

  const pieChartData = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ['#FF69B4', '#9370DB', '#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#10B981'];

  const renderDashboard = () => (
    <Box>
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { 
            title: "Total Revenue", 
            value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, 
            icon: <AttachMoney />, 
            color: "#22C55E",
            change: "+12.5%",
            subtext: "This month"
          },
          { 
            title: "Total Orders", 
            value: stats.totalOrders, 
            icon: <ShoppingCart />, 
            color: "#3B82F6",
            change: "+8.2%",
            subtext: `${stats.pendingOrders} pending`
          },
          { 
            title: "Total Products", 
            value: stats.totalProducts, 
            icon: <LocalOffer />, 
            color: "#8B7355",
            change: "+5.3%",
            subtext: `${stats.lowStockProducts} low stock`
          },
          { 
            title: "Total Users", 
            value: stats.totalUsers, 
            icon: <People />, 
            color: "#FF69B4",
            change: "+15.7%",
            subtext: "Active customers"
          },
        ].map((stat, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <Card sx={{ 
              borderRadius: 3,
              background: 'white',
              boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
              border: '1px solid rgba(139, 115, 85, 0.1)',
              height: '100%',
              transition: 'transform 0.3s ease',
              '&:hover': { transform: 'translateY(-4px)' }
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
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
                  <Chip 
                    label={stat.change} 
                    size="small"
                    sx={{ 
                      background: '#22C55E15',
                      color: '#22C55E',
                      fontWeight: 600,
                      fontSize: '0.75rem'
                    }}
                  />
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 800, color: '#2A2A2A', mb: 0.5 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6B6B5A', fontWeight: 500, mb: 1 }}>
                  {stat.title}
                </Typography>
                <Typography variant="caption" sx={{ color: '#8B7355', fontWeight: 500 }}>
                  {stat.subtext}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ 
            p: 3, 
            borderRadius: 3,
            background: 'white',
            boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
            border: '1px solid rgba(139, 115, 85, 0.1)',
            height: '100%'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#4A4A3A' }}>
                <TrendingUp sx={{ mr: 1, verticalAlign: 'middle' }} />
                Revenue & Orders Overview
              </Typography>
              <Button size="small" startIcon={<Refresh />} onClick={fetchAllData}>
                Refresh
              </Button>
            </Box>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'white', 
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" name="Revenue (₹)" fill="#8B7355" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="orders" name="Orders" fill="#FF69B4" radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Card sx={{ 
            p: 3, 
            borderRadius: 3,
            background: 'white',
            boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
            border: '1px solid rgba(139, 115, 85, 0.1)',
            height: '100%'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#4A4A3A', mb: 3 }}>
              <PieChart sx={{ mr: 1, verticalAlign: 'middle' }} />
              Products by Category
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3}>
        {[
          { 
            title: "Add New Product", 
            description: "Create a new product listing", 
            icon: <Add />, 
            color: "#8B7355",
            path: "/admin/products/new",
            action: "Create"
          },
          { 
            title: "Manage Orders", 
            description: "View and process customer orders", 
            icon: <ListAlt />, 
            color: "#3B82F6",
            path: "/admin/orders",
            action: "Manage"
          },
          { 
            title: "View Customers", 
            description: "See customer details and analytics", 
            icon: <Person />, 
            color: "#FF69B4",
            path: "#",
            action: "View"
          },
          { 
            title: "Store Analytics", 
            description: "Detailed store performance reports", 
            icon: <BarChart />, 
            color: "#22C55E",
            path: "#",
            action: "Analyze"
          },
        ].map((action, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              component={action.path !== "#" ? Link : Box}
              to={action.path}
              sx={{ 
                textDecoration: 'none',
                borderRadius: 3,
                background: 'white',
                boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
                border: '1px solid rgba(139, 115, 85, 0.1)',
                p: 3,
                height: '100%',
                transition: 'transform 0.3s ease',
                '&:hover': { 
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.1)'
                }
              }}
            >
              <Box sx={{ 
                background: `${action.color}15`,
                p: 2,
                borderRadius: 2,
                display: 'inline-flex',
                mb: 2
              }}>
                <Box sx={{ color: action.color, fontSize: 28 }}>
                  {action.icon}
                </Box>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#2A2A2A', mb: 1 }}>
                {action.title}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6B6B5A', mb: 2 }}>
                {action.description}
              </Typography>
              <Button 
                variant="contained"
                size="small"
                sx={{ 
                  background: action.color,
                  color: 'white',
                  borderRadius: 2,
                  px: 2,
                  '&:hover': { background: action.color }
                }}
              >
                {action.action}
              </Button>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderProducts = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#4A4A3A' }}>
          <LocalOffer sx={{ mr: 1, verticalAlign: 'middle' }} />
          Product Management ({products.length})
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchProducts}
            sx={{ 
              borderColor: '#8B7355',
              color: '#8B7355',
              '&:hover': { borderColor: '#755F47', background: 'rgba(139, 115, 85, 0.05)' }
            }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            component={Link}
            to="/admin/products/new"
            sx={{
              background: 'linear-gradient(135deg, #8B7355 0%, #6B6B5A 100%)',
              color: 'white',
              borderRadius: 2,
              px: 3,
              py: 1,
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(135deg, #755F47 0%, #4A4A3A 100%)',
                transform: 'translateY(-2px)',
              }
            }}
          >
            Add New Product
          </Button>
        </Box>
      </Box>

      {loading.products ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress sx={{ color: '#8B7355' }} />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ 
          borderRadius: 3,
          boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
          border: '1px solid rgba(139, 115, 85, 0.1)',
        }}>
          <Table>
            <TableHead sx={{ background: '#F5F1E8' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#4A4A3A' }}>Product</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#4A4A3A' }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#4A4A3A' }}>Price</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#4A4A3A' }}>Stock</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#4A4A3A' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#4A4A3A' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        component="img"
                        src={product.image_url || "https://via.placeholder.com/40"}
                        alt={product.name}
                        sx={{ width: 40, height: 40, borderRadius: 1, objectFit: 'cover' }}
                      />
                      <Box>
                        <Typography sx={{ fontWeight: 600, color: '#2A2A2A' }}>
                          {product.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6B6B5A' }}>
                          {product.brand || 'Generic'}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={product.category} 
                      size="small"
                      sx={{ 
                        background: 'rgba(139, 115, 85, 0.1)',
                        color: '#8B7355',
                        fontWeight: 500
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontWeight: 700, color: '#8B7355' }}>
                      ₹{product.price?.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.min((product.stock / 100) * 100, 100)}
                        sx={{ 
                          flex: 1,
                          height: 8,
                          borderRadius: 4,
                          background: '#F5F1E8',
                          '& .MuiLinearProgress-bar': {
                            background: product.stock < 10 ? '#EF4444' : product.stock < 30 ? '#F59E0B' : '#22C55E',
                            borderRadius: 4
                          }
                        }}
                      />
                      <Typography variant="body2" sx={{ 
                        fontWeight: 600, 
                        color: product.stock < 10 ? '#EF4444' : product.stock < 30 ? '#F59E0B' : '#22C55E',
                        minWidth: 40,
                        textAlign: 'right'
                      }}>
                        {product.stock}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={product.is_active ? 'Active' : 'Inactive'} 
                      size="small"
                      sx={{ 
                        background: product.is_active 
                          ? 'rgba(34, 197, 94, 0.1)' 
                          : 'rgba(107, 114, 128, 0.1)',
                        color: product.is_active ? '#22C55E' : '#6B7280',
                        fontWeight: 500
                      }}
                    />
                    {product.is_featured && (
                      <Chip 
                        label="Featured" 
                        size="small"
                        sx={{ 
                          ml: 1,
                          background: 'rgba(255, 105, 180, 0.1)',
                          color: '#FF69B4',
                          fontWeight: 500
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton 
                        size="small" 
                        onClick={() => navigate(`/product/${product.id}`)}
                        sx={{ 
                          color: '#3B82F6',
                          '&:hover': { background: 'rgba(59, 130, 246, 0.1)' }
                        }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                        sx={{ 
                          color: '#8B7355',
                          '&:hover': { background: 'rgba(139, 115, 85, 0.1)' }
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteProduct(product.id)}
                        sx={{ 
                          color: '#EF4444',
                          '&:hover': { background: 'rgba(239, 68, 68, 0.1)' }
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );

  const renderOrders = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#4A4A3A' }}>
          <ShoppingCart sx={{ mr: 1, verticalAlign: 'middle' }} />
          Order Management ({orders.length})
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchOrders}
            sx={{ 
              borderColor: '#8B7355',
              color: '#8B7355',
              '&:hover': { borderColor: '#755F47', background: 'rgba(139, 115, 85, 0.05)' }
            }}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download />}
            sx={{ 
              borderColor: '#3B82F6',
              color: '#3B82F6',
              '&:hover': { borderColor: '#2563EB', background: 'rgba(59, 130, 246, 0.05)' }
            }}
          >
            Export
          </Button>
        </Box>
      </Box>

      {loading.orders ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress sx={{ color: '#8B7355' }} />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ 
          borderRadius: 3,
          boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
          border: '1px solid rgba(139, 115, 85, 0.1)',
        }}>
          <Table>
            <TableHead sx={{ background: '#F5F1E8' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#4A4A3A' }}>Order ID</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#4A4A3A' }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#4A4A3A' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#4A4A3A' }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#4A4A3A' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#4A4A3A' }}>Payment</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#4A4A3A' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell>
                    <Typography sx={{ fontWeight: 600, color: '#2A2A2A', fontFamily: 'monospace' }}>
                      {order.order_number || `ORD-${order.id.slice(-8).toUpperCase()}`}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontWeight: 500, color: '#4A4A3A' }}>
                      {order.shipping_address?.name || 'Customer'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6B6B5A' }}>
                      {order.shipping_address?.email || 'No email'}
                    </Typography>
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
                        background: `${getPaymentStatusColor(order.payment_status)}15`,
                        color: getPaymentStatusColor(order.payment_status),
                        fontWeight: 600,
                        textTransform: 'uppercase'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton 
                        size="small" 
                        onClick={() => navigate(`/admin/orders/${order.id}`)}
                        sx={{ 
                          color: '#8B7355',
                          '&:hover': { background: 'rgba(139, 115, 85, 0.1)' }
                        }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleUpdateOrderStatus(order.id, 'processing')}
                        disabled={order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered'}
                        sx={{ 
                          color: '#2196F3',
                          '&:hover': { background: 'rgba(33, 150, 243, 0.1)' },
                          '&.Mui-disabled': { color: '#9CA3AF' }
                        }}
                      >
                        <CheckCircle fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                        disabled={order.status === 'cancelled' || order.status === 'delivered'}
                        sx={{ 
                          color: '#EF4444',
                          '&:hover': { background: 'rgba(239, 68, 68, 0.1)' },
                          '&.Mui-disabled': { color: '#9CA3AF' }
                        }}
                      >
                        <Cancel fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );

  const renderCustomers = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#4A4A3A' }}>
          <People sx={{ mr: 1, verticalAlign: 'middle' }} />
          Customer Management ({users.length})
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={fetchUsers}
          sx={{ 
            borderColor: '#8B7355',
            color: '#8B7355',
            '&:hover': { borderColor: '#755F47', background: 'rgba(139, 115, 85, 0.05)' }
          }}
        >
          Refresh
        </Button>
      </Box>

      {loading.users ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress sx={{ color: '#8B7355' }} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {users.map((user) => (
            <Grid item xs={12} sm={6} md={4} key={user.id}>
              <Card sx={{ 
                borderRadius: 3,
                background: 'white',
                boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
                border: '1px solid rgba(139, 115, 85, 0.1)',
                height: '100%',
                transition: 'transform 0.3s ease',
                '&:hover': { transform: 'translateY(-4px)' }
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ 
                      background: '#FF69B415',
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Person sx={{ color: '#FF69B4', fontSize: 24 }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 700, color: '#2A2A2A' }}>
                        {user.full_name || 'User'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6B6B5A' }}>
                        {user.email}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip 
                      label={user.role?.toUpperCase() || 'CUSTOMER'} 
                      size="small"
                      sx={{ 
                        background: user.role === 'admin' 
                          ? 'rgba(139, 115, 85, 0.1)' 
                          : 'rgba(59, 130, 246, 0.1)',
                        color: user.role === 'admin' ? '#8B7355' : '#3B82F6',
                        fontWeight: 500
                      }}
                    />
                    <Chip 
                      label={user.is_active ? 'ACTIVE' : 'INACTIVE'} 
                      size="small"
                      sx={{ 
                        background: user.is_active 
                          ? 'rgba(34, 197, 94, 0.1)' 
                          : 'rgba(107, 114, 128, 0.1)',
                        color: user.is_active ? '#22C55E' : '#6B7280',
                        fontWeight: 500
                      }}
                    />
                  </Box>

                  <Box sx={{ 
                    background: '#F5F1E8',
                    borderRadius: 2,
                    p: 2,
                    mb: 2
                  }}>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: '#6B6B5A', display: 'block' }}>
                          Joined
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#4A4A3A' }}>
                          {new Date(user.created_at).toLocaleDateString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: '#6B6B5A', display: 'block' }}>
                          Last Login
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#4A4A3A' }}>
                          {user.last_sign_in_at 
                            ? new Date(user.last_sign_in_at).toLocaleDateString()
                            : 'Never'
                          }
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                      variant="outlined" 
                      size="small"
                      fullWidth
                      sx={{ 
                        borderColor: '#8B7355',
                        color: '#8B7355',
                        '&:hover': { borderColor: '#755F47', background: 'rgba(139, 115, 85, 0.05)' }
                      }}
                    >
                      View Orders
                    </Button>
                    <Button 
                      variant="contained" 
                      size="small"
                      fullWidth
                      sx={{ 
                        background: '#8B7355',
                        color: 'white',
                        '&:hover': { background: '#755F47' }
                      }}
                    >
                      Message
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );

  return (
    <Box sx={{ p: 3, background: '#F5F1E8', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#4A4A3A', mb: 0.5 }}>
            🛠️ Admin Dashboard
          </Typography>
          <Typography variant="body1" sx={{ color: '#6B6B5A' }}>
            Manage your store, products, orders, and customers
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Store />}
          sx={{ 
            borderColor: '#8B7355',
            color: '#8B7355',
            fontWeight: 600,
            '&:hover': { borderColor: '#755F47', background: 'rgba(139, 115, 85, 0.05)' }
          }}
        >
          Store Settings
        </Button>
      </Box>

      <Paper sx={{ 
        mb: 4,
        borderRadius: 3,
        background: 'white',
        boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
        border: '1px solid rgba(139, 115, 85, 0.1)',
      }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ 
            borderBottom: '1px solid rgba(139, 115, 85, 0.1)',
            '& .MuiTab-root': {
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1rem',
              py: 2,
              px: 3,
            },
            '& .Mui-selected': {
              color: '#8B7355 !important',
            },
            '& .MuiTabs-indicator': {
              background: '#8B7355',
              height: 3,
              borderRadius: '3px 3px 0 0',
            }
          }}
        >
          <Tab icon={<DashboardIcon />} iconPosition="start" label="Dashboard" />
          <Tab icon={<LocalOffer />} iconPosition="start" label="Products" />
          <Tab icon={<ShoppingCart />} iconPosition="start" label="Orders" />
          <Tab icon={<People />} iconPosition="start" label="Customers" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {activeTab === 0 && renderDashboard()}
          {activeTab === 1 && renderProducts()}
          {activeTab === 2 && renderOrders()}
          {activeTab === 3 && renderCustomers()}
        </Box>
      </Paper>

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
            border: '1px solid rgba(139, 115, 85, 0.2)',
            '& .MuiAlert-icon': {
              color: snackbar.severity === 'success' ? '#22C55E' : 
                     snackbar.severity === 'error' ? '#EF4444' : 
                     snackbar.severity === 'warning' ? '#F59E0B' : '#3B82F6'
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}