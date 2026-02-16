import React, { useState, useEffect } from "react";
import { supabase } from "../supabase/supabaseClient";
import {
  Box, Container, Typography, TextField, Button,
  CircularProgress, Paper, InputAdornment, Chip, IconButton
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { 
  Store, Tag, AlignLeft, DollarSign, Upload, 
  ArrowLeft, CheckCircle, X, Image as ImageIcon, Lock 
} from "lucide-react";

export default function VendorAddProduct() {
  const navigate = useNavigate();
  const [vendorId, setVendorId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  // ✅ STATE: Image & Preview
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: ""
  });

  useEffect(() => {
    fetchVendorData();
  }, []);

  const fetchVendorData = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        navigate("/login");
        return;
      }

      // ✅ Fetch Vendor ID AND Approval Status
      const { data: vendor } = await supabase
        .from("vendors")
        .select("id, is_approved")
        .eq("user_id", userData.user.id)
        .single();

      if (!vendor) {
        alert("Vendor profile not found.");
        navigate("/vendor/register");
        return;
      }

      // ✅ SECURITY CHECK: Block if not approved
      if (!vendor.is_approved) {
        alert("Your account is pending approval. You cannot add products yet.");
        navigate("/vendor/dashboard");
        return;
      }

      setVendorId(vendor.id);
    } catch (error) {
      console.error("Auth check failed", error);
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ LOGIC: Handle Image Selection & Preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    
    // Create immediate preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const removeImage = (e) => {
    e.preventDefault();
    setImageFile(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async () => {
    if (!vendorId) {
      alert("Vendor profile not found.");
      return;
    }

    if (!imageFile) {
      alert("Please upload a product image.");
      return;
    }

    setLoading(true);

    try {
      let imageUrl = "";

      // ✅ LOGIC: Upload to Supabase Storage
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
        const filePath = `${vendorId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);

        imageUrl = data.publicUrl;
      }

      // ✅ LOGIC: Insert Product Record
      const { error: insertError } = await supabase
        .from("products")
        .insert({
          name: form.name,
          description: form.description,
          price: form.price,
          image_url: imageUrl,
          category: form.category,
          vendor_id: vendorId
        });

      if (insertError) throw insertError;

      alert("Product added successfully!");
      navigate("/vendor/products");

    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- PREMIUM STYLES ---
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
    uploadArea: {
      border: '2px dashed rgba(255,255,255,0.2)',
      borderRadius: '16px',
      padding: '0',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginBottom: '20px',
      backgroundColor: 'rgba(255,255,255,0.02)',
      position: 'relative',
      overflow: 'hidden',
      height: '250px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      '&:hover': {
        borderColor: '#fff',
        backgroundColor: 'rgba(255,255,255,0.05)'
      }
    },
    previewImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
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

  if (checkingAuth) {
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

      <Container maxWidth="sm">
        
        <Button 
          startIcon={<ArrowLeft />} 
          onClick={() => navigate('/vendor/dashboard')}
          sx={{ color: '#888', mb: 3, '&:hover': { color: '#fff' } }}
        >
          Back to Dashboard
        </Button>

        <Paper sx={styles.glassCard}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" fontWeight={900} sx={{ color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Add New Product
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
              Upload details & image
            </Typography>
          </Box>

          <TextField
            fullWidth
            label="Product Name"
            name="name"
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
              onChange={handleChange}
              sx={styles.input}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Store size={18} color="#888" /></InputAdornment>,
              }}
            />
          </Box>

          {/* ✅ PROFESSIONAL UPLOAD UI */}
          <Box sx={styles.uploadArea}>
            <input
              type="file"
              accept="image/*"
              id="file-upload"
              hidden
              onChange={handleImageChange}
            />
            
            {previewUrl ? (
              <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
                <img src={previewUrl} alt="Preview" style={styles.previewImage} />
                <IconButton 
                  onClick={removeImage}
                  sx={{ 
                    position: 'absolute', top: 10, right: 10, 
                    bgcolor: 'rgba(0,0,0,0.6)', color: '#fff',
                    '&:hover': { bgcolor: 'red' }
                  }}
                >
                  <X size={20} />
                </IconButton>
                <Chip 
                  label="Change Image" 
                  component="label" 
                  htmlFor="file-upload"
                  clickable
                  sx={{ 
                    position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
                    bgcolor: 'rgba(255,255,255,0.9)', color: '#000', fontWeight: 'bold' 
                  }} 
                />
              </Box>
            ) : (
              <label htmlFor="file-upload" style={{ width: '100%', height: '100%', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Upload size={48} color="#fff" style={{ marginBottom: '15px', opacity: 0.8 }} />
                <Typography sx={{ color: '#fff', fontWeight: 700 }}>Click to Upload Image</Typography>
                <Typography variant="caption" sx={{ color: '#888', mt: 1 }}>JPG, PNG, WEBP</Typography>
              </label>
            )}
          </Box>

          <Button
            fullWidth
            onClick={handleSubmit}
            sx={styles.submitBtn}
            disabled={loading}
            startIcon={!loading && <CheckCircle size={20} />}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Publish Product"}
          </Button>

        </Paper>
      </Container>
    </Box>
  );
}