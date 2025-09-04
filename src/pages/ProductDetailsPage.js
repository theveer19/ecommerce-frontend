// src/pages/ProductDetailsPage.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
} from "@mui/material";
import { useCart } from "../context/CartContext";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
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
            setRelatedProducts(relatedData);
          }
        }
      } catch (err) {
        console.error("Error fetching product:", err);
      }
    };
    fetchProduct();
  }, [id]);

  if (!product) return <Typography>Loading product...</Typography>;

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1) setQuantity(value);
  };

  const handleAddToCart = () => {
    addToCart({ ...product, quantity });
  };

  const handleBuyNow = () => {
    navigate("/checkout", {
      state: {
        buyNowItem: { ...product, quantity },
      },
    });
  };

  return (
    <Box sx={{ padding: "30px" }}>
      <Grid container spacing={4}>
        {/* Left: Image */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
            <img
              src={product.image_url || "https://via.placeholder.com/400"}
              alt={product.name}
              style={{ width: "100%", borderRadius: "12px" }}
            />
          </Paper>
        </Grid>

        {/* Right: Info */}
        <Grid item xs={12} md={6}>
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            {product.name}
          </Typography>
          <Typography variant="h5" sx={{ mt: 1, color: "green" }}>
            ₹{product.price}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: "gray" }}>
            {product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock"}
          </Typography>

          {/* Quantity */}
          <Box sx={{ mt: 2 }}>
            <TextField
              type="number"
              label="Quantity"
              value={quantity}
              onChange={handleQuantityChange}
              inputProps={{ min: 1 }}
              sx={{ width: "120px" }}
            />
          </Box>

          {/* Buttons */}
          <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
            <Button variant="contained" color="primary" onClick={handleAddToCart}>
              Add to Cart
            </Button>
            <Button variant="contained" color="success" onClick={handleBuyNow}>
              Buy Now
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Divider */}
      <Divider sx={{ my: 4 }} />

      {/* Tabs */}
      <Tabs
        value={tabValue}
        onChange={(e, newValue) => setTabValue(newValue)}
        textColor="primary"
        indicatorColor="primary"
        sx={{ mb: 2 }}
      >
        <Tab label="Description" />
        <Tab label="Specifications" />
        <Tab label="Reviews" />
        <Tab label="FAQs" />
      </Tabs>

      {tabValue === 0 && (
        <Typography>{product.description || "No description available."}</Typography>
      )}
      {tabValue === 1 && (
        <Typography>
          📌 Example Specs:
          <br />• Material: Cotton
          <br />• Size: Medium
          <br />• Weight: 1kg
        </Typography>
      )}
      {tabValue === 2 && <Typography>⭐ No reviews yet. Be the first!</Typography>}
      {tabValue === 3 && <Typography>❓ FAQs will appear here.</Typography>}

      {/* Related Products */}
      <Divider sx={{ my: 4 }} />
      <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
        Related Products
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          overflowX: "auto",
          pb: 2,
          "&::-webkit-scrollbar": { display: "none" }, // Hide scrollbar
        }}
      >
        {relatedProducts.map((item) => (
          <Card
            key={item.id}
            sx={{
              borderRadius: 3,
              minWidth: 200,
              flex: "0 0 auto",
            }}
          >
            <Link
              to={`/product/${item.id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <CardMedia
                component="img"
                height="180"
                image={item.image_url || "https://via.placeholder.com/200"}
                alt={item.name}
              />
              <CardContent>
                <Typography variant="h6">{item.name}</Typography>
                <Typography variant="body2" color="green">
                  ₹{item.price}
                </Typography>
              </CardContent>
            </Link>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
