import React from 'react';
import { Card, CardMedia, CardContent, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  return (
    <Card
      sx={{
    background: "rgba(17, 25, 40, 0.85)",
    backdropFilter: "blur(10px)",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
    transition: "all 0.3s ease",
    color: "#f8fafc",
    "&:hover": {
      transform: "translateY(-5px) scale(1.02)",
      boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
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
