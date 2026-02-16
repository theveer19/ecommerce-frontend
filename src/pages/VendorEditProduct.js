import React, { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import {
  Box, Container, Typography, TextField, Button,
  CircularProgress, Paper, InputAdornment, Grid
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Edit, Tag, AlignLeft, DollarSign, Image, Store, 
  ArrowLeft, CheckCircle, RefreshCw 
} from "lucide-react";

export default function VendorEditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [vendorId, setVendorId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
    category: ""
  });

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    const { data: userData } = await supabase.auth.getUser();

    if (!userData?.user) {
      navigate("/login");
      return;
    }

    // Get vendor id
    const { data: vendor } = await supabase
      .from("vendors")
      .select("id")
      .eq("user_id", userData.user.id)
      .single();

    if (!vendor) {
      navigate("/vendor/dashboard");
      return;
    }

    setVendorId(vendor.id);

    // Fetch product
    const { data: product } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .eq("vendor_id", vendor.id) // Security check
      .single();

    if (!product) {
      alert("Product not found or unauthorized");
      navigate("/vendor/products");
      return;
    }

    setForm(product);
    setLoading(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const updateProduct = async () => {
    setSaving(true);

    const { error } = await supabase
      .from("products")
      .update({
        name: form.name,
        description: form.description,
        price: form.price,
        image_url: form.image_url,
        category: form.category
      })
      .eq("id", id)
      .eq("vendor_id", vendorId);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Product updated successfully");
    navigate("/vendor/products");
  };

  // --- STYLES ---
  const styles = {
    pageWrapper: {
      minHeight: '100vh',
      background: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      position: 'relative',
      overflow: 'hidden'
    },
    glow: {
      position: 'absolute',
      width: '600px',
      height: '600px',
      background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0) 70%)',
      borderRadius: '50%',
      zIndex: 0,
      animation: 'float 10s ease-in-out infinite alternate'
    },
    glassCard: {
      position: 'relative',
      zIndex: 10,
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(30px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '24px',
      padding: '40px',
      width: '100%',
      boxShadow: '0 40px 80px -20px rgba(0, 0, 0, 0.8)',
    },
    input: {
      marginBottom: '20px',
      '& .MuiOutlinedInput-root': {
        color: '#fff',
        borderRadius: '12px',
        backgroundColor: 'rgba(0,0,0,0.3)',
        transition: 'all 0.3s ease',
        '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
        '&.Mui-focused fieldset': { borderColor: '#fff', borderWidth: '1px' },
      },
      '& .MuiInputLabel-root': { color: '#888' },
      '& .MuiInputLabel-root.Mui-focused': { color: '#fff' }
    },
    previewImage: {
      width: '100%',
      height: '300px',
      objectFit: 'cover',
      borderRadius: '16px',
      border: '1px solid rgba(255,255,255,0.2)',
      marginBottom: '20px',
      opacity: form.image_url ? 1 : 0.3
    },
    submitBtn: {
      background: '#fff',
      color: '#000',
      fontWeight: 800,
      padding: '14px',
      borderRadius: '12px',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      marginTop: '10px',
      '&:hover': {
        background: '#e0e0e0',
        transform: 'translateY(-2px)',
        boxShadow: '0 10px 20px rgba(255,255,255,0.1)'
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", background: "#000", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress sx={{ color: "white" }} />
      </Box>
    );
  }

  return (
    <Box sx={styles.pageWrapper}>
      <Box sx={{ ...styles.glow, top: '-20%', left: '-10%' }} />
      <Box sx={{ ...styles.glow, bottom: '-20%', right: '-10%', animationDelay: '5s' }} />
      
      <style>{`@keyframes float { 0% { transform: translateY(0); } 100% { transform: translateY(40px); } }`}</style>

      <Container maxWidth="lg">
        
        {/* Back Button */}
        <Button 
          startIcon={<ArrowLeft />} 
          onClick={() => navigate('/vendor/products')}
          sx={{ color: '#888', mb: 3, '&:hover': { color: '#fff' } }}
        >
          Cancel Editing
        </Button>

        <Grid container spacing={6}>
          
          {/* Form Side */}
          <Grid item xs={12} md={7}>
            <Paper sx={styles.glassCard}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={900} sx={{ color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Edit Product
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                  Update details for <span style={{color: '#fff'}}>{form.name}</span>
                </Typography>
              </Box>

              <TextField
                fullWidth
                label="Product Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                sx={styles.input}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Tag size={18} color="#888" /></InputAdornment>,
                }}
              />

              <TextField
                fullWidth
                label="Description"
                name="description"
                value={form.description}
                multiline
                rows={3}
                onChange={handleChange}
                sx={styles.input}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><AlignLeft size={18} color="#888" /></InputAdornment>,
                }}
              />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Price"
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={handleChange}
                  sx={styles.input}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><DollarSign size={18} color="#888" /></InputAdornment>,
                  }}
                />
                <TextField
                  fullWidth
                  label="Category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  sx={styles.input}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Store size={18} color="#888" /></InputAdornment>,
                  }}
                />
              </Box>

              <TextField
                fullWidth
                label="Image URL"
                name="image_url"
                value={form.image_url}
                onChange={handleChange}
                sx={styles.input}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Image size={18} color="#888" /></InputAdornment>,
                }}
              />

              <Button
                fullWidth
                onClick={updateProduct}
                sx={styles.submitBtn}
                disabled={saving}
                startIcon={saving ? <RefreshCw className="animate-spin" /> : <CheckCircle />}
              >
                {saving ? "Saving Changes..." : "Update Product"}
              </Button>
            </Paper>
          </Grid>

          {/* Preview Side */}
          <Grid item xs={12} md={5}>
            <Box sx={{ position: 'sticky', top: '100px' }}>
              <Typography variant="overline" sx={{ color: '#888', fontWeight: 800, letterSpacing: '2px' }}>
                LIVE PREVIEW
              </Typography>
              
              <Paper sx={{ ...styles.glassCard, p: 2, mt: 2 }}>
                <img 
                  src={form.image_url || "https://via.placeholder.com/400x500?text=No+Image"} 
                  alt="Preview" 
                  style={styles.previewImage}
                  onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/400x500?text=Invalid+Image"; }}
                />
                <Box sx={{ px: 2, pb: 2 }}>
                  <Typography variant="h5" fontWeight={800} color="white">{form.name || "Product Name"}</Typography>
                  <Typography variant="h6" fontWeight={400} color="#ccc">₹{form.price || "0"}</Typography>
                  <Typography variant="body2" color="#666" sx={{ mt: 1 }}>{form.category || "Uncategorized"}</Typography>
                </Box>
              </Paper>
            </Box>
          </Grid>

        </Grid>
      </Container>
    </Box>
  );
}