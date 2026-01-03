import React from "react";
import { Link } from "react-router-dom";
import { Box, Typography } from "@mui/material";

export default function ProductCard({ product, session }) {
  // Check if product exists and has required properties
  if (!product || !product.id) {
    console.error("Invalid product data in ProductCard:", product);
    return null; // Don't render anything if product is invalid
  }

  return (
    <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
      <Box sx={styles.card}>
        <Box sx={styles.imageContainer}>
          <img 
            src={product.image_url || "/api/placeholder/400/500"} 
            alt={product.name || "Product"}
            style={styles.image}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/api/placeholder/400/500";
            }}
          />
          {product.featured && (
            <Box sx={styles.featuredBadge}>
              FEATURED
            </Box>
          )}
        </Box>
        <Box sx={styles.details}>
          <Typography sx={styles.name}>
            {product.name || "Product Name"}
          </Typography>
          <Typography sx={styles.price}>
            ₹{product.price ? product.price.toLocaleString() : '0'}
          </Typography>
        </Box>
      </Box>
    </Link>
  );
}

const styles = {
  card: {
    border: '1px solid #f0f0f0',
    transition: 'all 0.2s',
    cursor: 'pointer',
    '&:hover': {
      borderColor: '#000',
    }
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    paddingBottom: '125%', // 4:5 aspect ratio
    backgroundColor: '#fafafa',
    overflow: 'hidden',
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s',
    '&:hover': {
      transform: 'scale(1.05)',
    }
  },
  featuredBadge: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    backgroundColor: 'black',
    color: 'white',
    fontSize: '10px',
    fontWeight: 700,
    padding: '2px 8px',
    letterSpacing: '1px',
    textTransform: 'uppercase',
  },
  details: {
    padding: '16px',
  },
  name: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#000',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '4px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  price: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#000',
  },
};