import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";
import { useCart } from "../context/CartContext";
import { 
  Box, Container, Grid, Typography, Button, 
  CircularProgress, IconButton, Divider, Chip,
  Snackbar, Alert
} from "@mui/material";
import { 
  ShoppingBag, Heart, Share2, ArrowLeft, 
  Truck, Shield, Check, Minus, Plus, Zap
} from "lucide-react";

// --- THEME STYLES (Clean B&W + Perfect Sizing) ---
const themeStyles = {
  pageBackground: {
    background: '#ffffff',
    minHeight: '100vh',
    color: 'black',
    pb: 10,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center' // Vertically center content
  },
  glassPanel: {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(30px)',
    borderRadius: '24px',
    border: '1px solid rgba(0, 0, 0, 0.06)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
    p: { xs: 3, md: 5 }, // More padding
    position: 'relative',
    overflow: 'hidden'
  },
  img3DWrapper: {
    perspective: '1500px',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px'
  },
  img3D: {
    width: '100%',
    maxWidth: '450px', // RESTRICT WIDTH SO IT'S NOT HUGE
    height: 'auto',
    aspectRatio: '4/5', // Fashion Standard Ratio
    objectFit: 'cover',
    borderRadius: '12px',
    boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.3)', // Sharp shadow
    transition: 'transform 0.4s ease, box-shadow 0.4s ease',
    transform: 'rotateY(-5deg) rotateX(2deg)', // Subtle 3D tilt
    border: '1px solid rgba(0,0,0,0.05)',
    '&:hover': {
      transform: 'rotateY(0deg) rotateX(0deg) scale(1.02)',
      boxShadow: '0 15px 30px rgba(0, 0, 0, 0.15)'
    }
  },
  glowButton: {
    background: 'black',
    color: 'white',
    fontWeight: 900,
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
    '&:hover': {
      background: '#333',
      transform: 'translateY(-2px)'
    }
  }
};

// --- RELATED PRODUCT CARD ---
const RelatedProductCard = ({ product }) => {
  if (!product || !product.id) return null;
  return (
    <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
      <Box sx={{
        background: '#fff', border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden',
        transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-5px)', border: '1px solid #000' }
      }}>
        <Box sx={{ position: 'relative', pt: '125%', bgcolor: '#f9f9f9' }}>
          <img src={product.image_url} alt={product.name} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        </Box>
        <Box sx={{ p: 2 }}>
          <Typography sx={{ color: 'black', fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', mb: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {product.name}
          </Typography>
          <Typography sx={{ color: '#000', fontWeight: 700 }}>₹{product.price?.toLocaleString()}</Typography>
        </Box>
      </Box>
    </Link>
  );
};

export default function ProductDetailsPage({ session }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState("");
  const [notification, setNotification] = useState({ open: false, message: "" });
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
  const fetchProduct = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      navigate("/products");
      return;
    }

    setProduct(data);
    setMainImage(data.image_url);

    const category = data.category?.trim().toLowerCase();

    if (category) {
      const { data: related } = await supabase
        .from("products")
        .select("*")
        .ilike("category", `%${category}%`)
        .neq("id", id)
        .limit(4);

      setRelatedProducts(related || []);
    }

    setLoading(false);
  };

  fetchProduct();
}, [id, navigate]);


  const handleAddToCart = () => {
    if (!selectedSize && product.sizes?.length > 0) { setNotification({ open: true, message: "⚠️ SELECT A SIZE" }); return; }
    addToCart({ ...product, quantity, selectedSize, price: product.price });
    setNotification({ open: true, message: "ADDED TO CART" });
  };

  const handleBuyNow = () => {
    if (!selectedSize && product.sizes?.length > 0) { setNotification({ open: true, message: "⚠️ SELECT A SIZE" }); return; }
    addToCart({ ...product, quantity, selectedSize, price: product.price });
    navigate("/cart");
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) { await navigator.share({ title: product.name, url }); } 
    else { navigator.clipboard.writeText(url); setNotification({ open: true, message: "LINK COPIED" }); }
  };

  if (loading) return <Box sx={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><CircularProgress sx={{ color: 'black' }} /></Box>;
  if (!product) return null;

  return (
    <Box sx={themeStyles.pageBackground}>
      <style>{`@keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }`}</style>

      <Container maxWidth="xl" sx={{ px: { xs: 2, md: 6 } }}>
        
        {/* Navigation Bar */}
        <Box sx={{ py: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button startIcon={<ArrowLeft />} onClick={() => navigate(-1)} sx={{ color: '#666', fontWeight: 700, '&:hover': { color: 'black', bgcolor: 'transparent' } }}>
            BACK
          </Button>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <IconButton onClick={handleShare} sx={{ color: 'black', border: '1px solid #eee' }}><Share2 size={20} /></IconButton>
            <IconButton sx={{ color: 'black', border: '1px solid #eee' }}><Heart size={20} /></IconButton>
          </Box>
        </Box>

        {/* MAIN CONTENT - VERTICALLY CENTERED GRID */}
        <Grid container spacing={8} alignItems="center" justifyContent="center" sx={{ minHeight: '60vh' }}>
          
          {/* LEFT: IMAGE SECTION (Centered & Sized Perfect) */}
          <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={themeStyles.img3DWrapper}>
              <Box sx={{ position: 'relative', width: '100%', maxWidth: '450px', animation: 'float 6s ease-in-out infinite' }}>
                <img src={mainImage} alt={product.name} style={themeStyles.img3D} />
                {product.featured && (
                  <Chip label="FEATURED" sx={{ position: 'absolute', top: 20, left: -10, bgcolor: 'black', color: 'white', fontWeight: 900, borderRadius: 0 }} />
                )}
              </Box>
            </Box>

            {/* Thumbnails */}
            {product.extra_images?.length > 0 && (
              <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                 <Box onClick={() => setMainImage(product.image_url)} sx={{ width: 60, height: 60, borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', border: mainImage === product.image_url ? '2px solid black' : '1px solid #eee' }}>
                    <img src={product.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="main" />
                 </Box>
                 {product.extra_images.map((img, i) => (
                  <Box key={i} onClick={() => setMainImage(img)} sx={{ width: 60, height: 60, borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', border: mainImage === img ? '2px solid black' : '1px solid #eee' }}>
                    <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="extra" />
                  </Box>
                 ))}
              </Box>
            )}
          </Grid>

          {/* RIGHT: DETAILS SECTION (Clean & Sharp) */}
          <Grid item xs={12} md={6}>
            <Box sx={themeStyles.glassPanel}>
              
              <Typography sx={{ color: '#888', letterSpacing: '3px', fontSize: '11px', mb: 1, textTransform: 'uppercase', fontWeight: 800 }}>
                {product.brand || 'ONE-T'}
              </Typography>
              
              <Typography variant="h2" sx={{ fontWeight: 900, fontSize: { xs: '32px', md: '48px' }, mb: 2, lineHeight: 1 }}>
                {product.name}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                <Typography sx={{ fontSize: '32px', fontWeight: 800 }}>₹{product.price?.toLocaleString()}</Typography>
                {product.original_price > product.price && (
                  <Typography sx={{ color: '#999', textDecoration: 'line-through', fontSize: '18px', fontWeight: 600 }}>
                    ₹{product.original_price.toLocaleString()}
                  </Typography>
                )}
              </Box>

              <Divider sx={{ mb: 4 }} />

              <Typography sx={{ color: '#444', lineHeight: 1.6, mb: 3, fontSize: '14px' }}>
                {product.description}
              </Typography>

              {/* Sizes */}
              {product.sizes?.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography sx={{ fontSize: '11px', fontWeight: 800, mb: 1.5, letterSpacing: '1px' }}>SELECT SIZE</Typography>
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    {product.sizes.map((size) => (
                      <Button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        sx={{
                          minWidth: '45px', height: '45px', borderRadius: '8px',
                          border: selectedSize === size ? '2px solid black' : '1px solid #eee',
                          color: selectedSize === size ? 'white' : 'black',
                          bgcolor: selectedSize === size ? 'black' : 'transparent',
                          fontWeight: 700,
                          '&:hover': { bgcolor: selectedSize === size ? 'black' : '#f5f5f5' }
                        }}
                      >
                        {size}
                      </Button>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#f9f9f9', borderRadius: '12px', border: '1px solid #eee', px: 1 }}>
                  <IconButton size="small" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={16} /></IconButton>
                  <Typography sx={{ fontWeight: 700, px: 2 }}>{quantity}</Typography>
                  <IconButton size="small" onClick={() => setQuantity(quantity + 1)}><Plus size={16} /></IconButton>
                </Box>
                <Button fullWidth onClick={handleAddToCart} variant="outlined" sx={{ py: 1.5, borderRadius: '12px', borderColor: 'black', color: 'black', fontWeight: 800, borderWidth: '2px', '&:hover': { borderWidth: '2px', bgcolor: '#f0f0f0', borderColor: 'black' } }}>
                  ADD TO CART
                </Button>
                <Button fullWidth onClick={handleBuyNow} startIcon={<Zap fill="white" size={18} />} sx={{ ...themeStyles.glowButton, py: 1.5, borderRadius: '12px' }}>
                  BUY NOW
                </Button>
              </Box>

              {/* Trust Badges */}
              <Box sx={{ display: 'flex', gap: 4, pt: 3, borderTop: '1px solid #eee' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Truck size={18} />
                  <Box><Typography sx={{ fontSize: '11px', fontWeight: 800 }}>FAST DELIVERY</Typography><Typography sx={{ color: '#666', fontSize: '10px' }}>2-4 Days</Typography></Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Shield size={18} />
                  <Box><Typography sx={{ fontSize: '11px', fontWeight: 800 }}>AUTHENTIC</Typography><Typography sx={{ color: '#666', fontSize: '10px' }}>100% Verified</Typography></Box>
                </Box>
              </Box>

            </Box>
          </Grid>
        </Grid>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <Box sx={{ mt: 15 }}>
            <Typography variant="h4" sx={{ textAlign: 'center', fontWeight: 900, mb: 6, textTransform: 'uppercase', letterSpacing: '2px' }}>
              You May Also Like
            </Typography>
            <Grid container spacing={3}>
              {relatedProducts.map((p) => (
                <Grid item xs={6} md={3} key={p.id}><RelatedProductCard product={p} /></Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>

      <Snackbar open={notification.open} autoHideDuration={3000} onClose={() => setNotification({ ...notification, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" variant="filled" sx={{ bgcolor: 'black', color: 'white', fontWeight: 800, borderRadius: '50px' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}