// src/pages/ProductDetailsPage.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";
import { Button, Typography, Box, TextField } from "@mui/material";
import { useCart } from "../context/CartContext";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
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
    // addToCart in your context expects an item object --
    // we add quantity field so the context can store it
    addToCart({ ...product, quantity });
  };

  const handleBuyNow = () => {
    // Important: use the key buyNowItem so CheckoutPage picks it up
    navigate("/checkout", {
      state: {
        buyNowItem: { ...product, quantity },
      },
    });
  };

  return (
    <Box sx={{ padding: "30px", textAlign: "center" }}>
      <img
        src={product.image_url || "https://via.placeholder.com/300"}
        alt={product.name}
        style={{ width: "300px", borderRadius: "12px" }}
      />
      <Typography variant="h4" sx={{ mt: 2, fontWeight: "bold" }}>
        {product.name}
      </Typography>
      <Typography variant="h5" sx={{ mt: 1, color: "green" }}>
        ₹{product.price}
      </Typography>
      <Typography variant="body1" sx={{ mt: 1 }}>
        {product.description}
      </Typography>

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

      <Box sx={{ mt: 3, display: "flex", justifyContent: "center", gap: 2 }}>
        <Button variant="contained" color="primary" onClick={handleAddToCart}>
          Add to Cart
        </Button>

        {/* Buy Now: will only buy this product, not the whole cart */}
        <Button variant="contained" color="success" onClick={handleBuyNow}>
          Buy Now
        </Button>
      </Box>
    </Box>
  );
}
