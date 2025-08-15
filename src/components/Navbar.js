// components/Navbar.js
import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, Avatar, Box, Button } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabase/supabaseClient';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StoreIcon from '@mui/icons-material/Store';

export default function Navbar({ userRole }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const navigate = useNavigate();

  const user = supabase.auth.getUser(); // you may also pass session.user directly

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#1a1a1a' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <StoreIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component={Link} to="/products" color="inherit" sx={{ textDecoration: 'none' }}>
            MyShop
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button color="inherit" component={Link} to="/products">Products</Button>
          <IconButton color="inherit" component={Link} to="/cart">
            <ShoppingCartIcon />
          </IconButton>

          {userRole === 'admin' && (
            <Button color="inherit" component={Link} to="/admin">Admin</Button>
          )}

          <IconButton onClick={handleMenu}>
            <Avatar sx={{ bgcolor: '#FFD700' }} />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem disabled>Hello, Admin</MenuItem>
            <MenuItem onClick={() => navigate('/orders')}>My Orders</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
