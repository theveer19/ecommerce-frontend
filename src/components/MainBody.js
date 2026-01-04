import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import ProductCard from './ProductCard';
import {
  Grid,
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Paper,
  Container,
} from '@mui/material';

const MainBody = ({ products }) => {
  const { addToCart } = useCart();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortOrder, setSortOrder] = useState('');

  const categories = [...new Set(products.map((p) => p.category))];

  let filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(search.toLowerCase()) &&
      (category === '' || product.category === category)
  );

  if (sortOrder === 'price-asc') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortOrder === 'price-desc') {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  return (
    <Box sx={{ py: 4, backgroundColor: '#f3f4f6', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        {/* Filters */}
        <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">
            Browse Products
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                variant="outlined"
                label="Search product..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="">All</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Sort by</InputLabel>
                <Select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  label="Sort by"
                >
                  <MenuItem value="">Default</MenuItem>
                  <MenuItem value="price-asc">Price: Low to High</MenuItem>
                  <MenuItem value="price-desc">Price: High to Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <Grid container spacing={3}>
            {filteredProducts.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <ProductCard product={product} onAddToCart={addToCart} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="h6" align="center" color="text.secondary" sx={{ mt: 5 }}>
            No products found.
          </Typography>
        )}
      </Container>
    </Box>
  );
  
};

export default MainBody;
