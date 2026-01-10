import React, { useState, useEffect } from "react";
import { 
  Box, Typography, Paper, Grid, Card, CardContent, Button, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Chip, IconButton, Tabs, Tab, CircularProgress, LinearProgress, 
  Avatar, Tooltip, useTheme, useMediaQuery, Container, Snackbar, Alert
} from "@mui/material";
import { 
  Add, Edit, Delete, Visibility, ShoppingCart, People, AttachMoney, 
  Inventory, LocalOffer, TrendingUp, CheckCircle, Cancel, Refresh, 
  Download, BarChart, PieChart, Store, Dashboard as DashboardIcon, 
  ListAlt, Person, ArrowUpward
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";
import { 
  BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer, 
  PieChart as RechartsPieChart, Pie, Cell 
} from 'recharts';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState({ products: true, orders: true, users: true });
  const [stats, setStats] = useState({
    totalProducts: 0, totalOrders: 0, totalUsers: 0, 
    totalRevenue: 0, pendingOrders: 0, lowStockProducts: 0
  });
  
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const navigate = useNavigate();

  useEffect(() => { fetchAllData(); }, []);

  useEffect(() => {
    calculateStats();
  }, [products, orders, users]);

  const fetchAllData = async () => {
    await Promise.all([fetchProducts(), fetchOrders(), fetchUsers()]);
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (!error) setProducts(data || []);
    } finally { setLoading(prev => ({ ...prev, products: false })); }
  };

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase.from("orders").select(`*, order_items (quantity, price_at_time, products (name))`).order("created_at", { ascending: false }).limit(50);
      if (!error) setOrders(data || []);
    } finally { setLoading(prev => ({ ...prev, orders: false })); }
  };

  // ✅ STEP 6: VERIFIED USERS QUERY
  const fetchUsers = async () => {
    try {
      // Correctly fetching from profiles
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(50);
      if (!error) setUsers(data || []);
    } finally { setLoading(prev => ({ ...prev, users: false })); }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) throw error;
      setProducts(prev => prev.filter(p => p.id !== productId));
      setSnackbar({ open: true, message: "Product deleted successfully!", severity: "success" });
    } catch (error) {
      console.error("Delete failed:", error);
      setSnackbar({ open: true, message: "Failed to delete. Product likely in an order.", severity: "error" });
    }
  };

  const calculateStats = () => {
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
    setStats({
      totalProducts: products.length,
      totalOrders: orders.length,
      totalUsers: users.length,
      totalRevenue,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      lowStockProducts: products.filter(p => p.stock < 10).length
    });
  };

  // Styles (Glassmorphism)
  const styles = {
    pageWrapper: { background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh', pb: 8, pt: 4, overflowX: 'hidden' },
    glassPanel: { background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(20px)', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.8)', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)', transition: 'all 0.4s ease' },
    card3D: { transformStyle: 'preserve-3d', perspective: '1000px', transition: 'transform 0.4s ease, box-shadow 0.4s ease', cursor: 'pointer', '&:hover': { transform: 'translateY(-10px) rotateX(5deg)', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.15)', zIndex: 10 } },
    gradientText: { background: 'linear-gradient(45deg, #111 30%, #555 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 900 },
    tableRow: { transition: 'all 0.2s ease', '&:hover': { background: 'rgba(255,255,255,0.9) !important', transform: 'scale(1.01)', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', zIndex: 2, position: 'relative' } }
  };

  // Chart Data Preparation
  const categoryData = products.reduce((acc, product) => {
    const cat = product.category || 'Other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  const pieChartData = Object.entries(categoryData).map(([name, value]) => ({ name, value }));
  const COLORS = ['#000000', '#333333', '#666666', '#999999', '#AAAAAA', '#CCCCCC'];
  const barChartData = [ { name: 'Jan', sales: 4000 }, { name: 'Feb', sales: 3000 }, { name: 'Mar', sales: 5000 }, { name: 'Apr', sales: 4500 }, { name: 'May', sales: 6000 }, { name: 'Jun', sales: 5500 } ];

  const StatCard = ({ title, value, icon, color, subtext, delay }) => (
    <Card sx={{ ...styles.glassPanel, ...styles.card3D, height: '100%', overflow: 'hidden', animation: `slideUp 0.6s ease-out forwards ${delay}s`, opacity: 0, transform: 'translateY(20px)' }}>
      <CardContent sx={{ position: 'relative', p: 3 }}>
        <Box sx={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, background: color, borderRadius: '50%', opacity: 0.1 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ p: 1.5, borderRadius: '16px', background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`, color: color }}>{icon}</Box>
          <Chip icon={<ArrowUpward style={{ width: 14 }} />} label="12%" size="small" sx={{ bgcolor: 'rgba(34, 197, 94, 0.1)', color: '#22C55E', fontWeight: 700 }} />
        </Box>
        <Typography variant="h3" sx={{ fontWeight: 800, color: '#111', mb: 0.5 }}>{value}</Typography>
        <Typography variant="body2" sx={{ color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>{title}</Typography>
        <Typography variant="caption" sx={{ color: '#999', mt: 1, display: 'block' }}>{subtext}</Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={styles.pageWrapper}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5 }}>
          <Box>
            <Typography variant="h2" sx={{ ...styles.gradientText, fontSize: { xs: '2rem', md: '3rem' } }}>Admin Dashboard</Typography>
            <Typography variant="body1" sx={{ color: '#666', mt: 1 }}>Welcome back, Commander.</Typography>
          </Box>
          <Button startIcon={<Store />} sx={{ color: 'black', borderColor: 'black', borderWidth: 2, borderRadius: '30px', px: 3, fontWeight: 700 }} variant="outlined">View Store</Button>
        </Box>

        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 4, '& .MuiTabs-indicator': { bgcolor: 'black', height: 4, borderRadius: 2 }, '& .Mui-selected': { color: 'black !important' } }}>
          <Tab icon={<DashboardIcon />} iconPosition="start" label="Overview" />
          <Tab icon={<LocalOffer />} iconPosition="start" label="Products" />
          <Tab icon={<ShoppingCart />} iconPosition="start" label="Orders" />
          <Tab icon={<People />} iconPosition="start" label="Customers" />
        </Tabs>

        {(loading.products || loading.orders || loading.users) ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}><CircularProgress sx={{ color: 'black' }} /></Box>
        ) : (
          <>
            {activeTab === 0 && (
              <Box>
                <Grid container spacing={4} sx={{ mb: 6 }}>
                  <Grid item xs={12} sm={6} md={3}><StatCard title="Revenue" value={`₹${(stats.totalRevenue/1000).toFixed(1)}k`} icon={<AttachMoney fontSize="large"/>} color="#000000" subtext="Total earnings" delay={0.1} /></Grid>
                  <Grid item xs={12} sm={6} md={3}><StatCard title="Orders" value={stats.totalOrders} icon={<ShoppingCart fontSize="large"/>} color="#3B82F6" subtext={`${stats.pendingOrders} pending`} delay={0.2} /></Grid>
                  <Grid item xs={12} sm={6} md={3}><StatCard title="Products" value={stats.totalProducts} icon={<Inventory fontSize="large"/>} color="#8B7355" subtext={`${stats.lowStockProducts} low stock`} delay={0.3} /></Grid>
                  <Grid item xs={12} sm={6} md={3}><StatCard title="Users" value={stats.totalUsers} icon={<People fontSize="large"/>} color="#FF69B4" subtext="Active customers" delay={0.4} /></Grid>
                </Grid>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={8}>
                    <Paper sx={{ ...styles.glassPanel, p: 4, height: 400 }}>
                      <Typography variant="h6" sx={{ fontWeight: 800, mb: 4 }}>REVENUE ANALYTICS</Typography>
                      <ResponsiveContainer width="100%" height="85%">
                        <RechartsBarChart data={barChartData}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" /><YAxis /><RechartsTooltip /><Bar dataKey="sales" fill="#000000" radius={[6, 6, 0, 0]} /></RechartsBarChart>
                      </ResponsiveContainer>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ ...styles.glassPanel, p: 4, height: 400 }}>
                      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>INVENTORY MIX</Typography>
                      <ResponsiveContainer width="100%" height="90%">
                        <RechartsPieChart><Pie data={pieChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">{pieChartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie><RechartsTooltip /><Legend /></RechartsPieChart>
                      </ResponsiveContainer>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            )}
            {activeTab === 1 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}><Typography variant="h5" fontWeight={800}>Product Inventory</Typography><Button variant="contained" startIcon={<Add />} onClick={() => navigate('/admin/products/new')} sx={{ bgcolor: 'black', borderRadius: '50px' }}>Add Product</Button></Box>
                <TableContainer component={Paper} sx={{ ...styles.glassPanel, boxShadow: 'none' }}>
                  <Table>
                    <TableHead><TableRow><TableCell>PRODUCT</TableCell><TableCell>CATEGORY</TableCell><TableCell>PRICE</TableCell><TableCell>STOCK</TableCell><TableCell>ACTIONS</TableCell></TableRow></TableHead>
                    <TableBody>
                      {products.map((row) => (
                        <TableRow key={row.id} sx={styles.tableRow}>
                          <TableCell><Typography fontWeight={700}>{row.name}</Typography></TableCell>
                          <TableCell><Chip label={row.category} size="small" /></TableCell>
                          <TableCell fontWeight={600}>₹{row.price}</TableCell>
                          <TableCell>{row.stock} units</TableCell>
                          <TableCell>
                            <IconButton size="small" onClick={() => navigate(`/admin/products/edit/${row.id}`)}><Edit fontSize="small" /></IconButton>
                            <IconButton size="small" color="error" onClick={() => handleDeleteProduct(row.id)}><Delete fontSize="small" /></IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
            {activeTab === 2 && <Box sx={{ ...styles.glassPanel, p: 4 }}><Typography>Please navigate to the "Orders" tab in the sidebar or top menu to manage full orders.</Typography></Box>}
            {activeTab === 3 && (
              <Box sx={{ ...styles.glassPanel, p: 4 }}>
                <Typography variant="h5" fontWeight={800} mb={3}>Registered Customers</Typography>
                {users.map(u => (
                  <Box key={u.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, p: 2, bgcolor: 'rgba(255,255,255,0.5)', borderRadius: '12px' }}>
                    <Avatar src={u.avatar_url}>{u.full_name?.[0]}</Avatar>
                    <Box><Typography fontWeight={700}>{u.full_name || 'User'}</Typography><Typography variant="caption">{u.email}</Typography></Box>
                  </Box>
                ))}
              </Box>
            )}
          </>
        )}
      </Container>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}><Alert severity={snackbar.severity}>{snackbar.message}</Alert></Snackbar>
    </Box>
  );
}