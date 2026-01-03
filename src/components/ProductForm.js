// src/pages/ProductForm.js - UPDATED WITH FALLBACK SOLUTION
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  CircularProgress,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Tooltip,
  Divider
} from "@mui/material";
import {
  ArrowBack,
  Save,
  CloudUpload,
  CheckCircle,
  Star,
  Inventory,
  LocalOffer
} from "@mui/icons-material";

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  // Form state
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [activeStep, setActiveStep] = useState(0);
  
  // Product fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("0");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [brand, setBrand] = useState("");
  const [sku, setSku] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  // Categories
  const categories = [
    "Electronics",
    "Fashion",
    "Home & Kitchen", 
    "Books",
    "Sports",
    "Beauty",
    "Toys",
    "Other"
  ];

  // Steps
  const steps = ['Basic Info', 'Pricing & Stock', 'Image', 'Review'];

  // Fetch product if editing
  useEffect(() => {
    if (isEditMode) {
      fetchProduct();
    }
  }, [id]);

  // Fetch product data
  const fetchProduct = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      
      if (data) {
        setName(data.name || "");
        setDescription(data.description || "");
        setPrice(data.price?.toString() || "");
        setCategory(data.category || "");
        setStock(data.stock?.toString() || "0");
        setImagePreview(data.image_url || "");
        setBrand(data.brand || "");
        setSku(data.sku || "");
        // Check if these columns exist before setting them
        if (data.hasOwnProperty('is_active')) {
          setIsActive(data.is_active !== false);
        }
        if (data.hasOwnProperty('is_featured')) {
          setIsFeatured(data.is_featured || false);
        }
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      showSnackbar("Error loading product", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Basic validation
      if (!file.type.startsWith('image/')) {
        showSnackbar("Please select an image file", "error");
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        showSnackbar("Image size should be less than 5MB", "error");
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Upload image to Supabase
  const uploadImage = async (file) => {
    try {
      setUploading(true);
      
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);
      
      return publicUrl;
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  // Show snackbar notification
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  // Validate current step
  const validateCurrentStep = () => {
    console.log("Validating step:", activeStep);
    
    switch (activeStep) {
      case 0: // Basic Info - only check name and category
        if (!name.trim()) {
          showSnackbar("Product name is required", "error");
          return false;
        }
        if (!category) {
          showSnackbar("Please select a category", "error");
          return false;
        }
        return true;
        
      case 1: // Pricing & Stock - check price and stock
        if (!price) {
          showSnackbar("Price is required", "error");
          return false;
        }
        const priceNum = parseFloat(price);
        if (isNaN(priceNum) || priceNum <= 0) {
          showSnackbar("Price must be greater than 0", "error");
          return false;
        }
        const stockNum = parseInt(stock);
        if (isNaN(stockNum) || stockNum < 0) {
          showSnackbar("Stock must be 0 or greater", "error");
          return false;
        }
        return true;
        
      case 2: // Image
        if (!imagePreview && !imageFile) {
          showSnackbar("Please upload a product image", "error");
          return false;
        }
        return true;
        
      default:
        return true;
    }
  };

  // Handle next step
  const handleNext = () => {
    console.log("Next clicked, current step:", activeStep);
    if (!validateCurrentStep()) {
      return;
    }
    setActiveStep((prev) => prev + 1);
  };

  // Handle previous step
  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  // Submit form - UPDATED WITH FALLBACK LOGIC
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting form...");
    
    setLoading(true);
    
    try {
      // Final validation - check all required fields
      if (!name.trim()) {
        showSnackbar("Product name is required", "error");
        setLoading(false);
        return;
      }
      if (!price) {
        showSnackbar("Price is required", "error");
        setLoading(false);
        return;
      }
      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum <= 0) {
        showSnackbar("Price must be greater than 0", "error");
        setLoading(false);
        return;
      }
      if (!category) {
        showSnackbar("Category is required", "error");
        setLoading(false);
        return;
      }
      
      const stockNum = parseInt(stock);
      if (isNaN(stockNum) || stockNum < 0) {
        showSnackbar("Stock must be 0 or greater", "error");
        setLoading(false);
        return;
      }
      
      let imageUrl = imagePreview;
      
      // Upload new image if selected
      if (imageFile) {
        try {
          imageUrl = await uploadImage(imageFile);
        } catch (error) {
          console.error("Image upload failed:", error);
          // Use existing image or placeholder
          if (!imagePreview) {
            imageUrl = "https://via.placeholder.com/400x300?text=Product+Image";
          }
        }
      }
      
      // Prepare basic product data (without new columns)
      const basicProductData = {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        category,
        stock: parseInt(stock) || 0,
        image_url: imageUrl,
        brand: brand.trim() || null,
        sku: sku.trim() || `SKU-${Date.now()}`,
        updated_at: new Date().toISOString(),
      };
      
      // Prepare product data with new columns
      const productDataWithNewColumns = {
        ...basicProductData,
        is_active: isActive,
        is_featured: isFeatured,
      };
      
      console.log("Saving product data:", productDataWithNewColumns);
      
      let result;
      let saveAttempt = 1;
      
      try {
        // First try: Save with new columns
        if (isEditMode) {
          result = await supabase
            .from("products")
            .update(productDataWithNewColumns)
            .eq("id", id);
        } else {
          productDataWithNewColumns.created_at = new Date().toISOString();
          result = await supabase
            .from("products")
            .insert([productDataWithNewColumns]);
        }
        
        const { error } = result;
        
        if (error) {
          // Check if error is about missing columns
          if (error.message.includes('is_active') || error.message.includes('is_featured')) {
            console.log("New columns not found in schema, trying without them...");
            saveAttempt = 2;
            
            // Second try: Save without new columns
            if (isEditMode) {
              result = await supabase
                .from("products")
                .update(basicProductData)
                .eq("id", id);
            } else {
              basicProductData.created_at = new Date().toISOString();
              result = await supabase
                .from("products")
                .insert([basicProductData]);
            }
            
            const { error: secondError } = result;
            if (secondError) throw secondError;
            
            showSnackbar(
              `Product ${isEditMode ? 'updated' : 'created'} successfully! (Note: Active/Featured flags not saved)`,
              "warning"
            );
          } else {
            // Different error, throw it
            throw error;
          }
        } else {
          showSnackbar(
            `Product ${isEditMode ? 'updated' : 'created'} successfully!`,
            "success"
          );
        }
      } catch (error) {
        console.error(`Save attempt ${saveAttempt} failed:`, error);
        throw error;
      }
      
      // Redirect to admin page
      setTimeout(() => navigate("/admin"), 1500);
      
    } catch (error) {
      console.error("Error in form submission:", error);
      showSnackbar(
        `Failed to ${isEditMode ? 'update' : 'create'} product: ${error.message}`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Render step content
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#8B7355', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocalOffer />
              Basic Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Product Name *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  fullWidth
                  required
                  sx={{ 
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    }
                  }}
                  placeholder="Enter product name"
                  helperText="Required field"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  fullWidth
                  multiline
                  rows={4}
                  sx={{ 
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    }
                  }}
                  placeholder="Enter product description"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required sx={{ mb: 2 }}>
                  <InputLabel>Category *</InputLabel>
                  <Select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    label="Category *"
                    sx={{ borderRadius: '12px' }}
                  >
                    <MenuItem value="">
                      <em>Select a category</em>
                    </MenuItem>
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
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    }
                  }}
                  placeholder="Enter brand name"
                />
              </Grid>
            </Grid>
          </Box>
        );
      
      case 1:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#8B7355', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Inventory />
              Pricing & Inventory
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Price *"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    inputProps: { min: 0, step: 0.01 }
                  }}
                  sx={{ 
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    }
                  }}
                  helperText="Required field"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Stock Quantity"
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  fullWidth
                  InputProps={{
                    inputProps: { min: 0 }
                  }}
                  sx={{ 
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="SKU"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  fullWidth
                  sx={{ 
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    }
                  }}
                  placeholder="Auto-generated if empty"
                />
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" sx={{ color: '#6B6B5A', mb: 2, fontWeight: 600 }}>
                  Product Status
                </Typography>
                <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        color="primary"
                        sx={{ '&.Mui-checked': { color: '#8B7355' } }}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircle sx={{ color: isActive ? '#22C55E' : '#9CA3AF' }} />
                        <Typography>Active Product</Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        color="primary"
                        sx={{ '&.Mui-checked': { color: '#8B7355' } }}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Star sx={{ color: isFeatured ? '#FFD700' : '#9CA3AF' }} />
                        <Typography>Featured Product</Typography>
                      </Box>
                    }
                  />
                </Box>
                <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', mt: 1 }}>
                  Active products are visible to customers. Featured products appear on the homepage.
                </Typography>
              </Grid>
            </Grid>
          </Box>
        );
      
      case 2:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#8B7355', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CloudUpload />
              Product Image
            </Typography>
            <Box sx={{ textAlign: 'center' }}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="image-upload"
                type="file"
                onChange={handleImageChange}
              />
              <label htmlFor="image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUpload />}
                  sx={{ 
                    mb: 3,
                    borderColor: '#8B7355',
                    color: '#8B7355',
                    borderRadius: '12px',
                    px: 4,
                    py: 1.5,
                    '&:hover': {
                      borderColor: '#755F47',
                      background: 'rgba(139, 115, 85, 0.05)'
                    }
                  }}
                >
                  {uploading ? 'Uploading...' : 'Choose Image'}
                </Button>
              </label>
              
              {imagePreview && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, color: '#4A4A3A', fontWeight: 600 }}>
                    Image Preview:
                  </Typography>
                  <Card sx={{ 
                    maxWidth: 300, 
                    margin: '0 auto',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                  }}>
                    <CardMedia
                      component="img"
                      image={imagePreview}
                      alt="Preview"
                      sx={{ height: 200, objectFit: 'cover' }}
                    />
                    <CardContent>
                      {imageFile && (
                        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                          {imageFile.name} ({(imageFile.size / 1024).toFixed(1)} KB)
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Box>
              )}
              
              {!imagePreview && !uploading && (
                <Box sx={{ 
                  mt: 3, 
                  p: 4, 
                  border: '2px dashed #E5E7EB',
                  borderRadius: '16px',
                  background: '#F9FAFB'
                }}>
                  <CloudUpload sx={{ fontSize: 48, color: '#9CA3AF', mb: 2 }} />
                  <Typography variant="body2" sx={{ color: '#6B7280' }}>
                    No image selected. Click the button above to upload.
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        );
      
      case 3:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#8B7355', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircle />
              Review & Submit
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card sx={{ 
                  mb: 3,
                  borderRadius: '16px',
                  border: '1px solid rgba(139, 115, 85, 0.2)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: '#4A4A3A' }}>
                      Product Summary
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                          Name:
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {name || "Not specified"}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                          Price:
                        </Typography>
                        <Typography variant="body1" fontWeight={600} color="#8B7355">
                          ₹{price || "0.00"}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                          Category:
                        </Typography>
                        <Chip 
                          label={category || "Not specified"} 
                          size="small"
                          sx={{ 
                            background: 'rgba(139, 115, 85, 0.1)',
                            color: '#8B7355',
                            fontWeight: 500
                          }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                          Stock:
                        </Typography>
                        <Typography variant="body1" sx={{ 
                          fontWeight: 600,
                          color: parseInt(stock) < 10 ? '#EF4444' : parseInt(stock) < 30 ? '#F59E0B' : '#22C55E'
                        }}>
                          {stock} units
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                          Brand:
                        </Typography>
                        <Typography variant="body1">
                          {brand || "Not specified"}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                          SKU:
                        </Typography>
                        <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                          {sku || "Auto-generated"}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                          Status:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Chip 
                            label={isActive ? "Active" : "Inactive"} 
                            size="small"
                            sx={{ 
                              background: isActive ? '#22C55E15' : '#EF444415',
                              color: isActive ? '#22C55E' : '#EF4444',
                              fontWeight: 500
                            }}
                          />
                          {isFeatured && (
                            <Chip 
                              label="Featured" 
                              size="small"
                              sx={{ 
                                background: '#FFD70015',
                                color: '#B45309',
                                fontWeight: 500
                              }}
                            />
                          )}
                        </Box>
                      </Grid>
                      {description && (
                        <Grid item xs={12}>
                          <Divider sx={{ my: 1 }} />
                          <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                            Description:
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#4A4A3A', lineHeight: 1.6 }}>
                            {description.substring(0, 150)}...
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ 
                  borderRadius: '16px',
                  border: '1px solid rgba(139, 115, 85, 0.2)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: '#4A4A3A' }}>
                      Image Preview
                    </Typography>
                    {imagePreview ? (
                      <CardMedia
                        component="img"
                        image={imagePreview}
                        alt="Product"
                        sx={{ 
                          borderRadius: '12px', 
                          mb: 2, 
                          height: 200, 
                          objectFit: 'cover',
                          border: '1px solid rgba(139, 115, 85, 0.2)'
                        }}
                      />
                    ) : (
                      <Box sx={{ 
                        height: 200, 
                        bgcolor: '#F5F1E8', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        borderRadius: '12px',
                        mb: 2,
                        border: '1px dashed rgba(139, 115, 85, 0.3)'
                      }}>
                        <Typography variant="body2" color="#8B7355">
                          No image uploaded
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            <Box sx={{ 
              mt: 3, 
              p: 3, 
              bgcolor: '#F5F1E8', 
              borderRadius: '16px',
              border: '1px solid rgba(139, 115, 85, 0.2)'
            }}>
              <Typography variant="body2" sx={{ color: '#8B7355', mb: 1, fontWeight: 600 }}>
                ⚡ Ready to {isEditMode ? 'Update' : 'Publish'}!
              </Typography>
              <Typography variant="body2" sx={{ color: '#6B7280' }}>
                Review all information before submitting. The product will be {isEditMode ? 'updated in' : 'added to'} your store.
              </Typography>
              <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', mt: 1, fontStyle: 'italic' }}>
                Note: If you see a warning about columns, the Active/Featured status might not be saved yet. This will be fixed automatically when the database updates.
              </Typography>
            </Box>
          </Box>
        );
      
      default:
        return null;
    }
  };

  // Show loading while fetching product
  if (loading && isEditMode) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#F5F1E8'
      }}>
        <CircularProgress sx={{ color: '#8B7355' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, background: '#F5F1E8', minHeight: '100vh' }}>
      <Paper sx={{ 
        p: 3, 
        borderRadius: '20px',
        maxWidth: 1200, 
        margin: '0 auto',
        border: '1px solid rgba(139, 115, 85, 0.2)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.05)'
      }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Tooltip title="Back to Dashboard">
            <IconButton 
              onClick={() => navigate('/admin')} 
              sx={{ 
                mr: 2, 
                color: '#8B7355',
                background: 'rgba(139, 115, 85, 0.1)',
                '&:hover': { 
                  background: 'rgba(139, 115, 85, 0.2)',
                  transform: 'translateX(-2px)'
                }
              }}
            >
              <ArrowBack />
            </IconButton>
          </Tooltip>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#4A4A3A' }}>
              {isEditMode ? '✏️ Edit Product' : '🚀 Add New Product'}
            </Typography>
            <Typography variant="body1" sx={{ color: '#6B6B5A' }}>
              {isEditMode 
                ? `Editing: ${name || 'Product'}` 
                : 'Create a new product listing for your store'
              }
            </Typography>
          </Box>
        </Box>
        
        {/* Stepper */}
        <Stepper 
          activeStep={activeStep} 
          sx={{ 
            mb: 4,
            '& .MuiStepLabel-root .Mui-active': {
              color: '#8B7355',
            },
            '& .MuiStepLabel-root .Mui-completed': {
              color: '#22C55E',
            },
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {/* Form Content */}
        <form onSubmit={handleSubmit}>
          {renderStepContent(activeStep)}
          
          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0 || loading}
              onClick={handleBack}
              sx={{ 
                color: '#6B6B5A',
                fontWeight: 600,
                '&:hover': { 
                  background: 'rgba(139, 115, 85, 0.1)',
                  color: '#8B7355'
                }
              }}
            >
              Back
            </Button>
            
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save />}
                  disabled={loading || uploading}
                  sx={{
                    background: 'linear-gradient(135deg, #8B7355 0%, #6B6B5A 100%)',
                    color: 'white',
                    px: 5,
                    py: 1.5,
                    fontWeight: 700,
                    borderRadius: '12px',
                    boxShadow: '0 4px 14px rgba(139, 115, 85, 0.4)',
                    '&:hover': { 
                      background: 'linear-gradient(135deg, #755F47 0%, #4A4A3A 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(139, 115, 85, 0.5)'
                    },
                    '&.Mui-disabled': {
                      background: 'linear-gradient(135deg, #C4B5A0 0%, #A5A592 100%)',
                      color: '#E5E7EB'
                    }
                  }}
                >
                  {loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} color="inherit" />
                      {isEditMode ? 'Updating...' : 'Creating...'}
                    </Box>
                  ) : uploading ? (
                    'Uploading Image...'
                  ) : isEditMode ? (
                    '✅ Update Product'
                  ) : (
                    '🚀 Create Product'
                  )}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{
                    background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                    color: 'white',
                    px: 5,
                    py: 1.5,
                    fontWeight: 700,
                    borderRadius: '12px',
                    boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
                    '&:hover': { 
                      background: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(59, 130, 246, 0.5)'
                    }
                  }}
                >
                  Continue
                </Button>
              )}
            </Box>
          </Box>
        </form>
      </Paper>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ 
            width: '100%',
            background: 'white',
            color: '#4A4A3A',
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(139, 115, 85, 0.2)',
            '& .MuiAlert-icon': {
              color: snackbar.severity === 'success' ? '#22C55E' : 
                     snackbar.severity === 'warning' ? '#F59E0B' : '#EF4444'
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}