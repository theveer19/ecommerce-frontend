import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Removed Link import
import { supabase } from "../supabase/supabaseClient";
import {
  Button,
  Typography,
  Box,
  TextField,
  Tabs,
  Tab,
  Divider,
  Grid,
  Paper,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Rating,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { useCart } from "../context/CartContext";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FlashOnIcon from '@mui/icons-material/FlashOn';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [tabValue, setTabValue] = useState(0);
  const [session, setSession] = useState(null);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Check session first
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);

        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching product:", error);
          return;
        }
        setProduct(data);

        if (data) {
          const { data: relatedData, error: relatedError } = await supabase
            .from("products")
            .select("*")
            .neq("id", id)
            .limit(8);

          if (relatedError) {
            console.error("Error fetching related products:", relatedError);
          } else {
            setRelatedProducts(relatedData || []);
          }
        }
      } catch (err) {
        console.error("Error fetching product:", err);
      }
    };
    fetchProduct();
  }, [id]);

  if (!product) return <Typography sx={{ padding: 4, textAlign: 'center' }}>Loading product details...</Typography>;

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1) setQuantity(value);
  };

  const handleAddToCart = () => {
    if (!session) {
      alert("Please sign in to add items to cart");
      navigate("/");
      return;
    }
    addToCart({ ...product, quantity });
    alert("Product added to cart!");
  };

  const handleBuyNow = () => {
    if (!session) {
      alert("Please sign in to purchase items");
      navigate("/");
      return;
    }
    navigate("/checkout", {
      state: {
        buyNowItem: { ...product, quantity },
      },
    });
  };

  // Parse specifications and FAQs from JSON or use defaults
  const specifications = typeof product.specifications === 'object' ? product.specifications : {};
  const faqs = Array.isArray(product.faqs) ? product.faqs : [];

  return (
    <Box sx={{ padding: "30px", background: 'linear-gradient(160deg, #0a0f1f 0%, #1a273a 50%, #0a192f 100%)', minHeight: '100vh' }}>
      <Grid container spacing={4}>
        {/* Left: Image Gallery */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2, borderRadius: 3, background: 'rgba(17, 25, 40, 0.85)' }}>
            <img
              src={product.image_url || "https://via.placeholder.com/400"}
              alt={product.name}
              style={{ width: "100%", borderRadius: "12px", maxHeight: "500px", objectFit: 'cover' }}
            />
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <img
                src={product.image_url || "https://via.placeholder.com/100"}
                alt={product.name}
                style={{ width: "80px", height: "80px", borderRadius: "8px", objectFit: 'cover', cursor: 'pointer' }}
              />
              <img
                src={product.image_url || "https://via.placeholder.com/100"}
                alt={product.name}
                style={{ width: "80px", height: "80px", borderRadius: "8px", objectFit: 'cover', cursor: 'pointer' }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Right: Product Info */}
        <Grid item xs={12} md={6}>
          <Box sx={{ color: 'white' }}>
            <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
              {product.name}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating value={4.5} precision={0.5} readOnly sx={{ color: '#FFD700' }} />
              <Typography variant="body2" sx={{ ml: 1, color: '#d1d5db' }}>
                (128 reviews)
              </Typography>
            </Box>

            <Typography variant="h5" sx={{ mt: 1, color: "#22c55e", fontWeight: 'bold' }}>
              ₹{product.price}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, mt: 2, mb: 2 }}>
              <Chip label="Free Shipping" color="success" variant="outlined" />
              <Chip label="In Stock" color="primary" variant="outlined" />
              <Chip label="Best Seller" color="secondary" variant="outlined" />
            </Box>

            <Typography variant="body2" sx={{ mt: 1, color: "gray", mb: 3 }}>
              {product.stock > 0 ? `✅ In Stock (${product.stock} available)` : "❌ Out of Stock"}
            </Typography>

            {/* Quantity Selector */}
            <Box sx={{ mt: 2, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 1, color: 'white' }}>Quantity:</Typography>
              <TextField
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                inputProps={{ min: 1, max: product.stock || 10 }}
                sx={{ 
                  width: "120px",
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(255,255,255,0.3)',
                    },
                  }
                }}
              />
            </Box>

            {/* Action Buttons */}
            <Box sx={{ mt: 3, display: "flex", gap: 2, flexWrap: 'wrap' }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleAddToCart}
                startIcon={<ShoppingCartIcon />}
                sx={{ 
                  flex: 1,
                  minWidth: '200px',
                  background: 'linear-gradient(45deg, #2563eb, #22c55e)',
                  padding: '12px 24px',
                  fontSize: '16px'
                }}
              >
                Add to Cart
              </Button>
              <Button 
                variant="contained" 
                color="success" 
                onClick={handleBuyNow}
                startIcon={<FlashOnIcon />}
                sx={{ 
                  flex: 1,
                  minWidth: '200px',
                  background: 'linear-gradient(45deg, #f59e0b, #ef4444)',
                  padding: '12px 24px',
                  fontSize: '16px'
                }}
              >
                Buy Now
              </Button>
            </Box>

            {/* Product Highlights */}
            <Box sx={{ mt: 4, p: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 1, color: 'white' }}>Product Highlights:</Typography>
              <ul style={{ color: '#d1d5db', paddingLeft: '20px' }}>
                <li>Premium quality materials</li>
                <li>Free shipping on orders above ₹999</li>
                <li>30-day return policy</li>
                <li>1-year warranty included</li>
              </ul>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Divider */}
      <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Product Details Tabs */}
      <Paper sx={{ background: 'rgba(17, 25, 40, 0.85)', borderRadius: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          textColor="primary"
          indicatorColor="primary"
          sx={{ 
            borderBottom: 1, 
            borderColor: 'rgba(255,255,255,0.1)',
            '& .MuiTab-root': { color: 'rgba(255,255,255,0.7)' }
          }}
          centered
        >
          <Tab label="Description" />
          <Tab label="Specifications" />
          <Tab label="Reviews" />
          <Tab label="FAQs" />
        </Tabs>

        <Box sx={{ p: 3, color: 'white' }}>
          {tabValue === 0 && (
            <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
              {product.description || "No description available for this product."}
            </Typography>
          )}
          
          {tabValue === 1 && (
            <Box>
              {Object.keys(specifications).length > 0 ? (
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
                  {Object.entries(specifications).map(([key, value]) => (
                    <Box key={key} sx={{ p: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
                      <Typography variant="subtitle2" sx={{ color: '#22c55e' }}>{key}:</Typography>
                      <Typography variant="body2" sx={{ color: 'white' }}>{value}</Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography>No specifications available.</Typography>
              )}
            </Box>
          )}
          
          {tabValue === 2 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>Customer Reviews</Typography>
              {[1, 2, 3].map((review, index) => (
                <Box key={index} sx={{ mb: 3, p: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Rating value={5 - index} readOnly sx={{ color: '#FFD700' }} />
                    <Typography variant="body2" sx={{ ml: 1, color: '#d1d5db' }}>User {index + 1}</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: 'white' }}>
                    "Great product! Excellent quality and fast delivery. Would definitely recommend!"
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
          
          {tabValue === 3 && (
            <Box>
              {faqs.length > 0 ? (
                faqs.map((faq, index) => (
                  <Accordion key={index} sx={{ background: 'rgba(255,255,255,0.05)', color: 'white', mb: 1 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}>
                      <Typography variant="subtitle1">{faq.q || faq.question}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" sx={{ color: '#d1d5db' }}>
                        {faq.a || faq.answer}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                ))
              ) : (
                <Typography>No FAQs available for this product.</Typography>
              )}
            </Box>
          )}
        </Box>
      </Paper>

      {/* Related Products */}
      <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />
      
      <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold", color: 'white', textAlign: 'center' }}>
        You Might Also Like
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          overflowX: "auto",
          pb: 2,
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {relatedProducts.map((item) => (
          <Card
            key={item.id}
            sx={{
              borderRadius: 3,
              minWidth: 200,
              flex: "0 0 auto",
              background: 'rgba(17, 25, 40, 0.85)',
              cursor: 'pointer'
            }}
            onClick={() => navigate(`/product/${item.id}`)}
          >
            <CardMedia
              component="img"
              height="180"
              image={item.image_url || "https://via.placeholder.com/200"}
              alt={item.name}
            />
            <CardContent sx={{ color: 'white' }}>
              <Typography variant="h6" sx={{ fontSize: '1rem' }}>{item.name}</Typography>
              <Typography variant="body2" color="#22c55e">
                ₹{item.price}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}