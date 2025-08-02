import React from 'react';
import { Card, CardMedia, CardContent, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  return (
    <Card
      sx={{
        transition: '0.3s',
        '&:hover': {
          transform: 'scale(1.05)',
          boxShadow: '0px 8px 20px rgba(0,0,0,0.3)',
        },
      }}
    >
      {/* ✅ Make Image Clickable to go to Product Details */}
      <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
        <CardMedia
          component="img"
          height="200"
          image={product.image_url}
          alt={product.name}
        />
      </Link>

      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {product.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          ₹{product.price}
        </Typography>
        <Button
          component={Link}
          to={`/product/${product.id}`}
          variant="contained"
          color="primary"
          sx={{ mt: 1 }}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}
