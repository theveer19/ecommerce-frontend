import React, { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import {
  Box, Container, Typography, Grid, Button,
  CircularProgress, IconButton, Chip
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { 
  Edit, Trash2, Plus, PackageX, ArrowLeft, 
  Search, Filter 
} from "lucide-react";

export default function VendorProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendorProducts();
  }, []);

  const fetchVendorProducts = async () => {
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
      setLoading(false);
      return;
    }

    // Fetch products
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("vendor_id", vendor.id)
      .order("created_at", { ascending: false });

    setProducts(data || []);
    setLoading(false);
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to permanently delete this product?")) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) {
      alert(error.message);
      return;
    }
    // Optimistic UI update
    setProducts(products.filter(p => p.id !== productId));
  };

  // --- STYLES ---
  const styles = {
    pageWrapper: {
      minHeight: '100vh',
      background: '#000',
      color: '#fff',
      paddingTop: '40px',
      paddingBottom: '80px',
      position: 'relative'
    },
    // Background Glow
    glow: {
      position: 'absolute',
      top: '-10%',
      right: '-10%',
      width: '600px',
      height: '600px',
      background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0) 70%)',
      borderRadius: '50%',
      zIndex: 0,
      pointerEvents: 'none'
    },
    glassCard: {
      background: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '20px',
      overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)',
        borderColor: 'rgba(255, 255, 255, 0.3)'
      }
    },
    imageContainer: {
      height: '250px',
      width: '100%',
      overflow: 'hidden',
      position: 'relative',
      borderBottom: '1px solid rgba(255,255,255,0.05)'
    },
    productImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transition: 'transform 0.5s ease',
    },
    actionBtn: {
      background: 'white',
      color: 'black',
      fontWeight: 800,
      borderRadius: '8px',
      padding: '8px 16px',
      fontSize: '0.8rem',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      '&:hover': { background: '#ccc' }
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
      <Box sx={styles.glow} />
      <style>{`.product-card:hover img { transform: scale(1.05); }`}</style>

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        
        {/* HEADER */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, mb: 6, gap: 3 }}>
          <Box>
            <Button 
              startIcon={<ArrowLeft size={16} />} 
              onClick={() => navigate('/vendor/dashboard')}
              sx={{ color: '#888', mb: 1, '&:hover': { color: '#fff' } }}
            >
              DASHBOARD
            </Button>
            <Typography variant="h3" sx={{ fontWeight: 900, textTransform: 'uppercase' }}>
              My Inventory <span style={{ color: '#444', fontSize: '0.5em', verticalAlign: 'middle' }}>({products.length})</span>
            </Typography>
          </Box>

          <Button 
            variant="contained" 
            startIcon={<Plus size={20} />} 
            onClick={() => navigate("/vendor/add-product")}
            sx={styles.actionBtn}
          >
            Add Product
          </Button>
        </Box>

        {/* PRODUCTS GRID */}
        {products.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10, border: '1px dashed #333', borderRadius: '20px' }}>
            <PackageX size={64} color="#333" />
            <Typography sx={{ color: '#666', mt: 2, fontSize: '1.2rem' }}>No products found in your inventory.</Typography>
            <Button 
              sx={{ mt: 3, color: '#fff', borderColor: '#fff' }} 
              variant="outlined" 
              onClick={() => navigate("/vendor/add-product")}
            >
              Create Your First Listing
            </Button>
          </Box>
        ) : (
          <Grid container spacing={4}>
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product.id}>
                <Box sx={styles.glassCard} className="product-card">
                  
                  {/* Image Area */}
                  <Box sx={styles.imageContainer}>
                    <img 
                      src={product.image_url} 
                      alt={product.name} 
                      style={styles.productImage}
                    />
                    <Chip 
                      label={`₹${product.price}`} 
                      sx={{ position: 'absolute', top: 12, right: 12, bgcolor: 'black', color: 'white', fontWeight: 800 }} 
                    />
                  </Box>

                  {/* Content Area */}
                  <Box sx={{ p: 3 }}>
                    <Typography variant="caption" sx={{ color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      {product.category || 'Uncategorized'}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {product.name}
                    </Typography>
                    
                    {/* Actions */}
                    <Box sx={{ display: 'flex', gap: 2, mt: 3, pt: 3, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                      <Button 
                        fullWidth 
                        startIcon={<Edit size={16} />}
                        onClick={() => navigate(`/vendor/edit-product/${product.id}`)}
                        sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)', '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.05)' } }}
                        variant="outlined"
                      >
                        Edit
                      </Button>
                      <IconButton 
                        onClick={() => deleteProduct(product.id)}
                        sx={{ color: '#ff4444', border: '1px solid rgba(255, 68, 68, 0.2)', '&:hover': { bgcolor: 'rgba(255, 68, 68, 0.1)' } }}
                      >
                        <Trash2 size={20} />
                      </IconButton>
                    </Box>
                  </Box>

                </Box>
              </Grid>
            ))}
          </Grid>
        )}

      </Container>
    </Box>
  );
}