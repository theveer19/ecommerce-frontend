import React, { useEffect, useState } from 'react';
import { Box, Grid, Typography, TextField } from '@mui/material';
import { supabase } from '../supabase/supabaseClient';
import ProductCard from './ProductCard';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase.from('products').select('*');
        if (error) {
          console.error('Error fetching products:', error.message);
        } else {
          setProducts(data || []);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products by search term
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ padding: 3, backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      
      {/* ✅ OFFER BANNER */}
      <Box
        className="offer-banner"
        sx={{
          background: 'linear-gradient(90deg, #ff416c, #ff4b2b)',
          color: 'white',
          padding: '12px',
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '18px',
          borderRadius: '12px',
          mb: 3,
          animation: 'pulse 2s infinite',
          boxShadow: '0px 4px 12px rgba(0,0,0,0.2)',
        }}
      >
        🎉 Mega Sale! Get up to 50% OFF 🔥 | Free Shipping on Orders Above ₹999 🚚
      </Box>

      {/* ✅ SEARCH BAR */}
      <TextField
        fullWidth
        placeholder="Search products..."
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{
          mb: 4,
          backgroundColor: 'white',
          borderRadius: '10px',
          boxShadow: '0px 4px 8px rgba(0,0,0,0.1)',
        }}
      />

      {/* ✅ PRODUCT GRID */}
      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <Grid
          container
          spacing={3}
          justifyContent="center"
          sx={{
            maxWidth: '1300px',
            margin: 'auto',
          }}
        >
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
                <ProductCard product={product} />
              </Grid>
            ))
          ) : (
            <Typography>No products found.</Typography>
          )}
        </Grid>
      )}
    </Box>
  );
}
