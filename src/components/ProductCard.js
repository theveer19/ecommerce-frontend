import React, { useState } from 'react';
import { Card, CardMedia, CardContent, Typography, Button, IconButton, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);

  const isWishlisted = isInWishlist(product.id);

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ ...product, quantity: 1 });
  };

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
        position: 'relative',
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Wishlist Button */}
      <IconButton
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 2,
          backgroundColor: 'rgba(0,0,0,0.6)',
          '&:hover': {
            backgroundColor: 'rgba(0,0,0,0.8)',
          },
        }}
        onClick={handleWishlistToggle}
      >
        {isWishlisted ? (
          <FavoriteIcon sx={{ color: '#ef4444' }} />
        ) : (
          <FavoriteBorderIcon sx={{ color: '#f8fafc' }} />
        )}
      </IconButton>

      {/* Product Badges */}
      {product.isNew && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            backgroundColor: '#22c55e',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '0.7rem',
            fontWeight: 'bold',
            zIndex: 2,
          }}
        >
          NEW
        </Box>
      )}

      {product.discount > 0 && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            left: product.isNew ? 60 : 8,
            backgroundColor: '#ef4444',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '0.7rem',
            fontWeight: 'bold',
            zIndex: 2,
          }}
        >
          -{product.discount}%
        </Box>
      )}

      {/* Make Image Clickable to go to Product Details */}
      <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
        <CardMedia
          component="img"
          height="200"
          image={product.image_url || "https://via.placeholder.com/300x200?text=No+Image"}
          alt={product.name}
          sx={{
            transition: 'transform 0.3s ease',
            ...(isHovered && {
              transform: 'scale(1.05)',
            }),
          }}
        />
      </Link>

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, flexGrow: 1 }}>
          {product.name}
        </Typography>
        
        {/* Price with discount */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Typography variant="body1" sx={{ color: '#22c55e', fontWeight: 'bold' }}>
            ₹{product.price}
          </Typography>
          {product.originalPrice && product.originalPrice > product.price && (
            <Typography variant="body2" sx={{ color: '#9ca3af', textDecoration: 'line-through' }}>
              ₹{product.originalPrice}
            </Typography>
          )}
        </Box>

        {/* Rating */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
          <span style={{ color: '#f59e0b' }}>⭐⭐⭐⭐⭐</span>
          <Typography variant="body2" sx={{ color: '#9ca3af' }}>
            (4.5)
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: '8px', mt: 'auto' }}>
          <Button
            component={Link}
            to={`/product/${product.id}`}
            variant="outlined"
            color="primary"
            sx={{ flex: 1 }}
          >
            View Details
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<ShoppingCartIcon />}
            sx={{ flex: 1 }}
            onClick={handleAddToCart}
          >
            Add to Cart
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}