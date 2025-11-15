import React from "react";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Grid,
  IconButton,
  Card,
  CardMedia,
  CardContent,
  Container,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import FavoriteIcon from "@mui/icons-material/Favorite";

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = (product) => {
    addToCart({ ...product, quantity: 1 });
    removeFromWishlist(product.id);
  };

  const handleViewProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (wishlistItems.length === 0) {
    return (
      <Box sx={{ 
        padding: "40px", 
        textAlign: "center", 
        minHeight: "60vh",
        background: 'linear-gradient(160deg, #0a0f1f 0%, #1a273a 50%, #0a192f 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <FavoriteIcon sx={{ fontSize: 80, color: '#ef4444', mb: 2 }} />
        <Typography variant="h4" sx={{ color: "white", mb: 2 }}>
          Your Wishlist is Empty
        </Typography>
        <Typography variant="body1" sx={{ color: "#d1d5db", mb: 3, maxWidth: '400px' }}>
          Start adding items you love to your wishlist! They will be saved here for you to revisit later.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/products")}
          sx={{
            background: 'linear-gradient(45deg, #22c55e, #3b82f6)',
            padding: '12px 30px',
            fontSize: '16px'
          }}
        >
          Continue Shopping
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: "100vh", 
      background: "linear-gradient(160deg, #0a0f1f 0%, #1a273a 50%, #0a192f 100%)",
      padding: '20px 0'
    }}>
      <Container maxWidth="lg">
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
          <Typography variant="h3" sx={{ color: "white", fontWeight: 'bold' }}>
            ❤️ My Wishlist ({wishlistItems.length})
          </Typography>
          <Button
            variant="outlined"
            color="error"
            onClick={clearWishlist}
            sx={{ borderColor: '#ef4444', color: '#ef4444' }}
          >
            Clear All
          </Button>
        </Box>

        <Grid container spacing={3}>
          {wishlistItems.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
              <Card
                sx={{
                  background: "rgba(17, 25, 40, 0.85)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "16px",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  color: "#f8fafc",
                  position: "relative",
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                  }
                }}
              >
                <IconButton
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    zIndex: 2,
                    backgroundColor: "rgba(0,0,0,0.6)",
                    "&:hover": {
                      backgroundColor: "rgba(0,0,0,0.8)",
                    },
                  }}
                  onClick={() => removeFromWishlist(product.id)}
                >
                  <DeleteIcon sx={{ color: "#ef4444" }} />
                </IconButton>

                <CardMedia
                  component="img"
                  height="200"
                  image={product.image_url || "https://via.placeholder.com/300x200?text=No+Image"}
                  alt={product.name}
                  sx={{ cursor: "pointer" }}
                  onClick={() => handleViewProduct(product.id)}
                />

                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1, flexGrow: 1 }}>
                    {product.name}
                  </Typography>
                  <Typography variant="body1" sx={{ color: "#22c55e", fontWeight: "bold", mb: 2 }}>
                    ₹{product.price}
                  </Typography>

                  <Box sx={{ display: "flex", gap: 1, mt: 'auto' }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      sx={{ flex: 1 }}
                      onClick={() => handleViewProduct(product.id)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<ShoppingCartIcon />}
                      sx={{ flex: 1 }}
                      onClick={() => handleAddToCart(product)}
                    >
                      Add to Cart
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}