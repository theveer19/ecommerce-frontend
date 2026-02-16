import React, { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import {
  Box, Container, Typography, Grid, Paper, Button, Chip,
  CircularProgress
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { Store, ShoppingBag, ArrowRight } from "lucide-react";

export default function VendorStorePage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStore();
  }, [slug]);

  const fetchStore = async () => {
    try {
      // 1. Get Vendor by Slug
      const { data: vendorData, error: vendorError } = await supabase
        .from("vendors")
        .select("*")
        .eq("slug", slug)
        .single();

      if (vendorError || !vendorData) {
        console.error("Vendor not found");
        setLoading(false);
        return;
      }

      setVendor(vendorData);

      // 2. Get Products for this Vendor
      const { data: productsData } = await supabase
        .from("products")
        .select("*")
        .eq("vendor_id", vendorData.id)
        .order("created_at", { ascending: false });

      setProducts(productsData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- STYLES ---
  const styles = {
    pageWrapper: {
      minHeight: '100vh',
      background: '#000',
      color: '#fff',
      paddingTop: '80px',
      paddingBottom: '80px',
      position: 'relative'
    },
    glow: {
      position: 'absolute',
      top: '-20%',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '80vw',
      height: '600px',
      background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0) 70%)',
      borderRadius: '50%',
      zIndex: 0,
      pointerEvents: 'none'
    },
    glassHeader: {
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(30px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '24px',
      padding: '40px',
      textAlign: 'center',
      marginBottom: '60px',
      position: 'relative',
      zIndex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    },
    vendorIcon: {
      width: '80px',
      height: '80px',
      background: '#fff',
      color: '#000',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '20px',
      boxShadow: '0 0 30px rgba(255,255,255,0.2)'
    },
    productCard: {
      background: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      '&:hover': {
        transform: 'translateY(-10px)',
        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)',
        borderColor: 'rgba(255, 255, 255, 0.3)'
      }
    },
    productImage: {
      width: '100%',
      height: '300px',
      objectFit: 'cover',
      borderBottom: '1px solid rgba(255,255,255,0.05)'
    },
    viewBtn: {
      marginTop: 'auto',
      color: '#fff',
      borderColor: '#fff',
      borderRadius: '0',
      width: '100%',
      '&:hover': {
        background: '#fff',
        color: '#000'
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

  if (!vendor) {
    return (
      <Box sx={{ minHeight: "100vh", background: "#000", color: "#fff", display: "flex", flexDirection: 'column', justifyContent: "center", alignItems: "center" }}>
        <Typography variant="h4" fontWeight={900}>STORE NOT FOUND</Typography>
        <Button onClick={() => navigate('/')} sx={{ mt: 2, color: '#fff', border: '1px solid #fff' }}>Return Home</Button>
      </Box>
    );
  }

  return (
    <Box sx={styles.pageWrapper}>
      <Box sx={styles.glow} />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        
        {/* VENDOR HEADER */}
        <Paper sx={styles.glassHeader}>
          <Box sx={styles.vendorIcon}>
            <Store size={40} />
          </Box>
          <Typography variant="caption" sx={{ letterSpacing: '3px', textTransform: 'uppercase', color: '#888', mb: 1 }}>
            Official Store
          </Typography>
          <Typography variant="h2" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-1px' }}>
            {vendor.business_name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Chip icon={<ShoppingBag size={14} />} label={`${products.length} Products`} sx={{ bgcolor: 'white', color: 'black', fontWeight: 800 }} />
            {vendor.is_verified && <Chip label="VERIFIED VENDOR" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid #fff' }} />}
          </Box>
        </Paper>

        {/* PRODUCTS GRID */}
        {products.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography sx={{ color: '#666', fontSize: '1.2rem' }}>This vendor hasn't added any products yet.</Typography>
          </Box>
        ) : (
          <Grid container spacing={4}>
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product.id}>
                <Box onClick={() => navigate(`/product/${product.id}`)} sx={styles.productCard}>
                  <img src={product.image_url} alt={product.name} style={styles.productImage} />
                  <Box sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="caption" sx={{ color: '#888', mb: 1 }}>{product.category || 'Apparel'}</Typography>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>{product.name}</Typography>
                    <Typography variant="h6" fontWeight={400} sx={{ color: '#ccc', mb: 3 }}>₹{product.price}</Typography>
                    
                    <Button variant="outlined" endIcon={<ArrowRight size={16} />} sx={styles.viewBtn}>
                      VIEW PRODUCT
                    </Button>
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