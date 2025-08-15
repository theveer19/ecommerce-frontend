// components/ProductList.js
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase/supabaseClient';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Grid,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchRole();
  }, [sortBy]);

  const fetchProducts = async () => {
    let query = supabase.from('products').select('*');

    if (sortBy === 'priceAsc') query = query.order('price', { ascending: true });
    else if (sortBy === 'priceDesc') query = query.order('price', { ascending: false });
    else query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) console.error('Error fetching products:', error);
    else setProducts(data);
  };

  // in ProductList (or similar files)
const fetchRole = async () => {
  try {
    const { data: { session } = {} } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      setUserRole(null);
      return;
    }

    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching role:', error);
      setUserRole(null);
      return;
    }

    setUserRole(data?.role ?? null);
  } catch (err) {
    console.error('Error fetching role:', err);
    setUserRole(null);
  }
};


  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this product?");
    if (!confirmed) return;

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) alert("Error deleting product");
    else fetchProducts();
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" className="fade-in" gutterBottom>
        🛍 All Products
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <FormControl size="small">
          <InputLabel>Sort by</InputLabel>
          <Select value={sortBy} label="Sort by" onChange={(e) => setSortBy(e.target.value)}>
            <MenuItem value="newest">Newest</MenuItem>
            <MenuItem value="priceAsc">Price: Low to High</MenuItem>
            <MenuItem value="priceDesc">Price: High to Low</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
            <Card
              sx={{
                transition: 'transform 0.3s',
                '&:hover': { transform: 'scale(1.03)' },
              }}
            >
              <CardMedia
                component="img"
                height="180"
                image={product.image_url || 'https://via.placeholder.com/300'}
                alt={product.name}
              />
              <CardContent>
                <Typography variant="h6">{product.name}</Typography>
                <Typography color="text.secondary" sx={{ mb: 1 }}>
                  ₹{product.price}
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{ mb: 1 }}
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  View Details
                </Button>

                {userRole === 'admin' && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleDelete(product.id)}
                      fullWidth
                    >
                      Delete
                    </Button>
                    {/* Optional: Add Edit functionality here */}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
