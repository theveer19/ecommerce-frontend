import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/supabaseClient';
import { Button, Typography, Box, TextField } from '@mui/material';
import { useCart } from '../context/CartContext';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      if (error) console.error(error);
      else setProduct(data);
    };
    fetchProduct();
  }, [id]);

  if (!product) return <Typography>Loading product...</Typography>;

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (value >= 1) setQuantity(value);
  };

  return (
    <Box sx={{ padding: '30px', textAlign: 'center' }}>
      <img
        src={product.image_url}
        alt={product.name}
        style={{ width: '300px', borderRadius: '12px' }}
      />
      <Typography variant="h4" sx={{ mt: 2, fontWeight: 'bold' }}>
        {product.name}
      </Typography>
      <Typography variant="h5" sx={{ mt: 1, color: 'green' }}>
        ₹{product.price}
      </Typography>
      <Typography variant="body1" sx={{ mt: 1 }}>
        {product.description}
      </Typography>

      {/* ✅ Quantity Input */}
      <Box sx={{ mt: 2 }}>
        <TextField
          type="number"
          label="Quantity"
          value={quantity}
          onChange={handleQuantityChange}
          inputProps={{ min: 1 }}
          sx={{ width: '100px' }}
        />
      </Box>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => addToCart({ ...product, quantity })}
        >
          Add to Cart
        </Button>

        {/* ✅ Pass quantity along with product */}
        <Button
          variant="contained"
          color="success"
          onClick={() => navigate('/checkout', { state: { product: { ...product, quantity } } })}
        >
          Buy Now
        </Button>
      </Box>
    </Box>
  );
}
