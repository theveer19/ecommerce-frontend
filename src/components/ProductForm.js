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
  const [sizes, setSizes] = useState(""); // ✅ Step 1: Changed to 'sizes' (plural string for input)
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [brand, setBrand] = useState("");
  const [sku, setSku] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  const categories = [
    { value: "tshirts", label: "T-Shirts" },
    { value: "hoodies", label: "Hoodies" },
    { value: "jackets", label: "Jackets" },
    { value: "shirts", label: "Shirts" },
    { value: "sweatshirts", label: "Sweatshirts" },
    { value: "pants", label: "Pants" },
    { value: "cargos", label: "Cargos" },
    { value: "shorts", label: "Shorts" },
    { value: "caps", label: "Caps" },
    { value: "bags", label: "Bags" },
    { value: "jewelry", label: "Jewelry" },
    { value: "other", label: "Other" }
  ];

  const steps = ['Basic Info', 'Pricing & Stock', 'Image', 'Review'];

  useEffect(() => {
    if (isEditMode) {
      fetchProduct();
    }
  }, [id]);

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
        
        // ✅ Step 2: Convert JSONB array to Comma Separated String for editing
        setSizes(Array.isArray(data.sizes) ? data.sizes.join(", ") : ""); 
        
        setImagePreview(data.image_url || "");
        setBrand(data.brand || "");
        setSku(data.sku || "");
        
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
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

  const uploadImage = async (file) => {
    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) throw uploadError;
      
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

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const validateCurrentStep = () => {
    switch (activeStep) {
      case 0: 
        if (!name.trim()) {
          showSnackbar("Product name is required", "error");
          return false;
        }
        if (!category) {
          showSnackbar("Please select a category", "error");
          return false;
        }
        return true;
        
      case 1:
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
        
      case 2:
        if (!imagePreview && !imageFile) {
          showSnackbar("Please upload a product image", "error");
          return false;
        }
        return true;
        
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      return;
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let imageUrl = imagePreview;
      
      if (imageFile) {
        try {
          imageUrl = await uploadImage(imageFile);
        } catch (error) {
          console.error("Image upload failed:", error);
          if (!imagePreview) {
            imageUrl = "https://via.placeholder.com/400x300?text=Product+Image";
          }
        }
      }
      
      const basicProductData = {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        category,
        stock: parseInt(stock) || 0,
        
        // ✅ Step 4: Convert string -> Array for DB storage
        sizes: sizes ? sizes.split(",").map(s => s.trim()).filter(Boolean) : [],
        
        image_url: imageUrl,
        brand: brand.trim() || null,
        sku: sku.trim() || `SKU-${Date.now()}`,
        updated_at: new Date().toISOString(),
      };
      
      const productDataWithNewColumns = {
        ...basicProductData,
        is_active: isActive,
        is_featured: isFeatured,
      };
      
      let result;
      let saveAttempt = 1;
      
      try {
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
          if (error.message.includes('is_active') || error.message.includes('is_featured')) {
            console.log("New columns not found in schema, trying without them...");
            saveAttempt = 2;
            
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
              `Product ${isEditMode ? 'updated' : 'created'} successfully!`,
              "warning"
            );
          } else {
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
                  sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  placeholder="Enter product name"
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
                  sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
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
                      <MenuItem key={cat.value} value={cat.value}>
                        {cat.label}
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
                  sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
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
                  sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Stock Quantity"
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  fullWidth
                  InputProps={{ inputProps: { min: 0 } }}
                  sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                {/* ✅ Step 3: Updated TextField for 'sizes' */}
                <TextField
                  label="Sizes (comma separated)"
                  value={sizes}
                  onChange={(e) => setSizes(e.target.value)}
                  fullWidth
                  sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  placeholder="e.g. S, M, L, XL or 42, 44"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="SKU"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  fullWidth
                  sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
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
                    px: 4, py: 1.5,
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
                  <Card sx={{ maxWidth: 300, margin: '0 auto', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                    <CardMedia component="img" image={imagePreview} alt="Preview" sx={{ height: 200, objectFit: 'cover' }} />
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
            </Box>
          </Box>
        );
      
      case 3:
        const categoryLabel = categories.find(c => c.value === category)?.label || category || "Not specified";

        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#8B7355', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircle />
              Review & Submit
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card sx={{ mb: 3, borderRadius: '16px', border: '1px solid rgba(139, 115, 85, 0.2)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: '#4A4A3A' }}>
                      Product Summary
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>Name:</Typography>
                        <Typography variant="body1" fontWeight={600}>{name || "Not specified"}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>Price:</Typography>
                        <Typography variant="body1" fontWeight={600} color="#8B7355">₹{price || "0.00"}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>Category:</Typography>
                        <Chip 
                          label={categoryLabel} 
                          size="small"
                          sx={{ background: 'rgba(139, 115, 85, 0.1)', color: '#8B7355', fontWeight: 500 }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>Stock:</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: parseInt(stock) < 10 ? '#EF4444' : '#22C55E' }}>
                          {stock} units
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        {/* ✅ Step 5: Updated Review Display */}
                        <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>Sizes:</Typography>
                        <Typography variant="body1" fontWeight={600}>{sizes || "N/A"}</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ borderRadius: '16px', border: '1px solid rgba(139, 115, 85, 0.2)' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: '#4A4A3A' }}>Image Preview</Typography>
                    {imagePreview ? (
                      <CardMedia component="img" image={imagePreview} alt="Product" sx={{ borderRadius: '12px', mb: 2, height: 200, objectFit: 'cover' }} />
                    ) : (
                      <Box sx={{ height: 200, bgcolor: '#F5F1E8', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>
                        <Typography variant="body2" color="#8B7355">No image uploaded</Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            <Box sx={{ mt: 3, p: 3, bgcolor: '#F5F1E8', borderRadius: '16px', border: '1px solid rgba(139, 115, 85, 0.2)' }}>
              <Typography variant="body2" sx={{ color: '#8B7355', mb: 1, fontWeight: 600 }}>
                ⚡ Ready to {isEditMode ? 'Update' : 'Publish'}!
              </Typography>
            </Box>
          </Box>
        );
      default:
        return null;
    }
  };

  if (loading && isEditMode) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#F5F1E8' }}>
        <CircularProgress sx={{ color: '#8B7355' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, background: '#F5F1E8', minHeight: '100vh' }}>
      <Paper sx={{ p: 3, borderRadius: '20px', maxWidth: 1200, margin: '0 auto', border: '1px solid rgba(139, 115, 85, 0.2)', boxShadow: '0 8px 32px rgba(0,0,0,0.05)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Tooltip title="Back to Dashboard">
            <IconButton onClick={() => navigate('/admin')} sx={{ mr: 2, color: '#8B7355', background: 'rgba(139, 115, 85, 0.1)', '&:hover': { background: 'rgba(139, 115, 85, 0.2)' } }}>
              <ArrowBack />
            </IconButton>
          </Tooltip>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#4A4A3A' }}>
              {isEditMode ? '✏️ Edit Product' : '🚀 Add New Product'}
            </Typography>
          </Box>
        </Box>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4, '& .MuiStepLabel-root .Mui-active': { color: '#8B7355' } }}>
          {steps.map((label) => (
            <Step key={label}><StepLabel>{label}</StepLabel></Step>
          ))}
        </Stepper>
        
        <form onSubmit={handleSubmit}>
          {renderStepContent(activeStep)}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button disabled={activeStep === 0 || loading} onClick={handleBack} sx={{ color: '#6B6B5A', fontWeight: 600 }}>Back</Button>
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button type="submit" variant="contained" startIcon={<Save />} disabled={loading || uploading} sx={{ background: 'linear-gradient(135deg, #8B7355 0%, #6B6B5A 100%)', px: 5, py: 1.5, borderRadius: '12px' }}>
                  {loading ? 'Processing...' : isEditMode ? '✅ Update Product' : '🚀 Create Product'}
                </Button>
              ) : (
                <Button variant="contained" onClick={handleNext} sx={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', px: 5, py: 1.5, borderRadius: '12px' }}>Continue</Button>
              )}
            </Box>
          </Box>
        </form>
      </Paper>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%', borderRadius: '12px' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}