import React, { useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  IconButton,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material"; // Removed CloudUpload

export default function ProductForm() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [brand, setBrand] = useState("");
  const [specifications, setSpecifications] = useState([{ key: "", value: "" }]);
  const [faqs, setFaqs] = useState([{ question: "", answer: "" }]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const categories = [
    "Men's Fashion",
    "Women's Fashion", 
    "Electronics",
    "Home & Kitchen",
    "Beauty & Personal Care",
    "Sports & Fitness",
    "Books",
    "Toys & Games"
  ];

  const handleAddSpec = () => {
    setSpecifications([...specifications, { key: "", value: "" }]);
  };

  const handleSpecChange = (index, field, value) => {
    const updated = [...specifications];
    updated[index][field] = value;
    setSpecifications(updated);
  };

  const handleRemoveSpec = (index) => {
    const updated = [...specifications];
    updated.splice(index, 1);
    setSpecifications(updated);
  };

  const handleAddFaq = () => {
    setFaqs([...faqs, { question: "", answer: "" }]);
  };

  const handleFaqChange = (index, field, value) => {
    const updated = [...faqs];
    updated[index][field] = value;
    setFaqs(updated);
  };

  const handleRemoveFaq = (index) => {
    const updated = [...faqs];
    updated.splice(index, 1);
    setFaqs(updated);
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!name || !price || !category) {
        showSnackbar("Please fill in all required fields", "error");
        setLoading(false);
        return;
      }

      const productData = {
        name,
        price: parseFloat(price),
        image_url: imageUrl || "https://via.placeholder.com/400x300?text=Product+Image",
        description,
        category,
        stock: parseInt(stock) || 0,
        brand: brand || "Generic",
        specifications: specifications.reduce((acc, cur) => {
          if (cur.key && cur.value) acc[cur.key] = cur.value;
          return acc;
        }, {}),
        faqs: faqs.filter((faq) => faq.question && faq.answer),
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("products").insert([productData]); // Removed unused 'data'

      if (error) {
        console.error("Error inserting product:", error);
        showSnackbar("Failed to add product! " + error.message, "error");
      } else {
        showSnackbar("Product added successfully!");
        // Reset form
        setName("");
        setPrice("");
        setImageUrl("");
        setDescription("");
        setCategory("");
        setStock("");
        setBrand("");
        setSpecifications([{ key: "", value: "" }]);
        setFaqs([{ question: "", answer: "" }]);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      showSnackbar("An unexpected error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 800, margin: "30px auto", background: 'rgba(17, 25, 40, 0.85)', color: 'white' }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'white', textAlign: 'center', mb: 4 }}>
        🚀 Add New Product
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 2, color: '#22c55e' }}>Basic Information</Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Product Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                },
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' }
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Price *"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              fullWidth
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                },
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' }
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Category *</InputLabel>
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                label="Category *"
                required
                sx={{
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                }}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                },
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' }
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Stock Quantity"
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                },
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' }
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Image URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              fullWidth
              placeholder="https://example.com/image.jpg"
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                },
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' }
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Product Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={4}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                },
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' }
              }}
            />
          </Grid>

          {/* Specifications */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mt: 3, mb: 2, color: '#22c55e' }}>
              Specifications
            </Typography>
            {specifications.map((spec, index) => (
              <Box key={index} sx={{ display: "flex", gap: 2, mt: 1, alignItems: 'center' }}>
                <TextField
                  label="Specification Key"
                  value={spec.key}
                  onChange={(e) => handleSpecChange(index, "key", e.target.value)}
                  placeholder="e.g., Material, Size, Color"
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Specification Value"
                  value={spec.value}
                  onChange={(e) => handleSpecChange(index, "value", e.target.value)}
                  placeholder="e.g., Cotton, Large, Red"
                  sx={{ flex: 1 }}
                />
                <IconButton 
                  onClick={() => handleRemoveSpec(index)}
                  sx={{ color: '#ef4444' }}
                >
                  <Delete />
                </IconButton>
              </Box>
            ))}
            <Button 
              startIcon={<Add />} 
              onClick={handleAddSpec} 
              sx={{ mt: 1, color: '#22c55e' }}
            >
              Add Specification
            </Button>
          </Grid>

          {/* FAQs */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mt: 3, mb: 2, color: '#22c55e' }}>
              Frequently Asked Questions
            </Typography>
            {faqs.map((faq, index) => (
              <Box key={index} sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1, p: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
                <TextField
                  label="Question"
                  value={faq.question}
                  onChange={(e) => handleFaqChange(index, "question", e.target.value)}
                  placeholder="e.g., What is the return policy?"
                  fullWidth
                />
                <TextField
                  label="Answer"
                  value={faq.answer}
                  onChange={(e) => handleFaqChange(index, "answer", e.target.value)}
                  placeholder="e.g., We offer 30-day returns..."
                  fullWidth
                  multiline
                  rows={2}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <IconButton 
                    onClick={() => handleRemoveFaq(index)}
                    sx={{ color: '#ef4444' }}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              </Box>
            ))}
            <Button 
              startIcon={<Add />} 
              onClick={handleAddFaq} 
              sx={{ mt: 1, color: '#22c55e' }}
            >
              Add FAQ
            </Button>
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ 
                mt: 3, 
                py: 2,
                background: 'linear-gradient(45deg, #22c55e, #3b82f6)',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
              disabled={loading}
            >
              {loading ? "Adding Product..." : "🚀 Add Product to Store"}
            </Button>
          </Grid>
        </Grid>
      </form>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}