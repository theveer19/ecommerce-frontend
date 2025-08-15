// components/ProductForm.js (Enhanced & Beautiful)
import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  InputAdornment,
  Snackbar,
  Alert,
} from '@mui/material';
import { supabase } from '../supabase/supabaseClient';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { styled } from '@mui/system';

const UploadInput = styled('input')({
  display: 'none',
});

export default function ProductForm() {
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    image: null,
  });
  const [preview, setPreview] = useState(null);
  const [open, setOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProduct({ ...product, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let imageUrl = '';

    if (product.image) {
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(`products/${Date.now()}-${product.image.name}`, product.image);

      if (error) {
        console.error('Image upload error:', error);
        return;
      }

      const { publicUrl } = supabase.storage.from('product-images').getPublicUrl(data.path);
      imageUrl = publicUrl;
    }

    const { error } = await supabase.from('products').insert([
      {
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        image_url: imageUrl,
      },
    ]);

    if (error) {
      console.error('Product insert error:', error);
    } else {
      setOpen(true);
      setProduct({ name: '', description: '', price: '', image: null });
      setPreview(null);
    }
  };

  return (
    <Paper elevation={3} sx={{ maxWidth: 600, mx: 'auto', p: 4, mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        🛍️ Add New Product
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Product Name"
              name="name"
              value={product.name}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              multiline
              rows={3}
              value={product.description}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Price"
              name="price"
              type="number"
              value={product.price}
              onChange={handleChange}
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <label htmlFor="upload-image">
              <UploadInput
                accept="image/*"
                id="upload-image"
                type="file"
                onChange={handleImageUpload}
              />
              <Button
                component="span"
                variant="outlined"
                startIcon={<AddPhotoAlternateIcon />}
              >
                Upload Image
              </Button>
            </label>
            {preview && (
              <Box mt={2}>
                <img src={preview} alt="preview" style={{ maxWidth: '100%' }} />
              </Box>
            )}
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" fullWidth variant="contained" color="primary">
              Add Product
            </Button>
          </Grid>
        </Grid>
      </form>

      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Product added successfully!
        </Alert>
      </Snackbar>
    </Paper>
  );
}
