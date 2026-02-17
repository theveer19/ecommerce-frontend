import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";
import { useCart } from "../context/CartContext";
import { 
  Box, Container, Grid, Typography, Button, 
  CircularProgress, IconButton, Divider, Chip,
  Snackbar, Alert, Accordion, AccordionSummary, AccordionDetails,
  Breadcrumbs
} from "@mui/material";
import { 
  ShoppingBag, Heart, Share2, ArrowLeft, 
  Truck, Shield, Minus, Plus, Zap, ChevronDown, 
  Ruler, RotateCcw, Star
} from "lucide-react";

// --- THEME STYLES (High-End Fashion Look) ---
const themeStyles = {
  pageBackground: {
    background: '#ffffff',
    minHeight: '100vh',
    color: '#1a1a1a',
    pb: 10,
  },
  stickyContainer: {
    position: { md: 'sticky' },
    top: { md: '100px' },
    height: 'fit-content',
  },
  mainImageContainer: {
    width: '100%',
    aspectRatio: '3/4',
    overflow: 'hidden',
    borderRadius: '4px',
    backgroundColor: '#f4f4f4',
    position: 'relative',
    cursor: 'zoom-in'
  },
  mainImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.5s ease',
  },
  thumbnail: (active) => ({
    width: '100%',
    aspectRatio: '1/1',
    objectFit: 'cover',
    borderRadius: '4px',
    cursor: 'pointer',
    border: active ? '1px solid #000' : '1px solid transparent',
    opacity: active ? 1 : 0.6,
    transition: 'all 0.2s'
  }),
  sizeButton: (selected) => ({
    minWidth: '48px',
    height: '48px',
    borderRadius: '0px',
    border: selected ? '1px solid #000' : '1px solid #e0e0e0',
    color: selected ? '#fff' : '#000',
    bgcolor: selected ? '#000' : 'transparent',
    fontWeight: 600,
    fontSize: '14px',
    transition: 'all 0.2s',
    '&:hover': {
      border: '1px solid #000',
      bgcolor: selected ? '#333' : 'rgba(0,0,0,0.02)'
    }
  }),
  accordion: {
    boxShadow: 'none',
    borderBottom: '1px solid #f0f0f0',
    '&:before': { display: 'none' },
    '& .MuiAccordionSummary-root': { px: 0, minHeight: '60px' },
    '& .MuiAccordionDetails-root': { px: 0, pb: 3, pt: 0 }
  }
};

// --- RELATED PRODUCT CARD ---
const RelatedProductCard = ({ product }) => (
  <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
    <Box sx={{ cursor: 'pointer', group: 'hover' }}>
      <Box sx={{ position: 'relative', overflow: 'hidden', mb: 2, aspectRatio: '3/4', bgcolor: '#f4f4f4' }}>
        <img 
          src={product.image_url} 
          alt={product.name} 
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} 
          className="hover-zoom"
        />
        <style>{`.hover-zoom:hover { transform: scale(1.05); }`}</style>
      </Box>
      <Typography sx={{ color: '#000', fontWeight: 600, fontSize: '14px', mb: 0.5 }}>{product.name}</Typography>
      <Typography sx={{ color: '#666', fontSize: '14px' }}>₹{product.price?.toLocaleString()}</Typography>
    </Box>
  </Link>
);

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Interaction State
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState("");
  const [parsedSizes, setParsedSizes] = useState([]);
  const [notification, setNotification] = useState({ open: false, message: "" });

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("products").select("*").eq("id", id).single();

    if (error || !data) {
      navigate("/products");
      return;
    }

    setProduct(data);
    setActiveImage(data.image_url);

    // ✅ ROBUST SIZE PARSING (Handles "S,M,L" string OR Array)
    let sizes = [];

if (data.sizes) {
  if (Array.isArray(data.sizes)) {
    sizes = data.sizes;
  } 
  else if (typeof data.sizes === "string") {
    sizes = data.sizes.split(",").map(s => s.trim()).filter(Boolean);
  }
}

setParsedSizes(sizes);


    // Fetch Related
    const categoryQuery = data.category ? data.category.split(' ')[0] : '';
    if (categoryQuery) {
      const { data: related } = await supabase
        .from("products")
        .select("*")
        .ilike("category", `%${categoryQuery}%`)
        .neq("id", id)
        .limit(4);
      setRelatedProducts(related || []);
    }

    setLoading(false);
  };

  const handleAddToCart = () => {
    if (parsedSizes.length > 0 && !selectedSize) {
      setNotification({ open: true, message: "⚠️ Please select a size" });
      return;
    }
    addToCart({ ...product, quantity, selectedSize: selectedSize || "One Size", price: product.price });
    setNotification({ open: true, message: `Added ${quantity} item(s) to cart` });
  };

  const handleBuyNow = () => {
    if (parsedSizes.length > 0 && !selectedSize) {
      setNotification({ open: true, message: "⚠️ Please select a size" });
      return;
    }
    addToCart({ ...product, quantity, selectedSize: selectedSize || "One Size", price: product.price });
    navigate("/cart");
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: product.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setNotification({ open: true, message: "Link copied to clipboard" });
    }
  };

  if (loading) return <Box sx={{ height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><CircularProgress sx={{ color: 'black' }} /></Box>;
  if (!product) return null;

  return (
    <Box sx={themeStyles.pageBackground}>
      <Container maxWidth="xl" sx={{ px: { xs: 2, md: 6 }, pt: 4 }}>
        
        {/* Breadcrumbs */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Breadcrumbs separator="›" aria-label="breadcrumb" sx={{ fontSize: '12px', textTransform: 'uppercase' }}>
            <Link to="/" style={{ color: '#999', textDecoration: 'none' }}>Home</Link>
            <Link to="/products" style={{ color: '#999', textDecoration: 'none' }}>{product.category || 'Shop'}</Link>
            <Typography color="text.primary" sx={{ fontSize: '12px', fontWeight: 600 }}>{product.name}</Typography>
          </Breadcrumbs>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton size="small" onClick={handleShare}><Share2 size={18} /></IconButton>
            <IconButton size="small"><Heart size={18} /></IconButton>
          </Box>
        </Box>

        <Grid container spacing={{ xs: 4, md: 8 }}>
          
          {/* --- LEFT: IMAGES --- */}
          <Grid item xs={12} md={7}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column-reverse', md: 'row' }, gap: 2 }}>
              
              {/* Thumbnails (Vertical on Desktop, Horizontal on Mobile) */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'row', md: 'column' }, 
                gap: 2, 
                width: { xs: '100%', md: '80px' },
                overflowX: 'auto'
              }}>
                <Box onClick={() => setActiveImage(product.image_url)} sx={{ flexShrink: 0 }}>
                  <img src={product.image_url} alt="Main" style={themeStyles.thumbnail(activeImage === product.image_url)} />
                </Box>
                {product.extra_images?.map((img, index) => (
                  <Box key={index} onClick={() => setActiveImage(img)} sx={{ flexShrink: 0 }}>
                    <img src={img} alt={`View ${index + 1}`} style={themeStyles.thumbnail(activeImage === img)} />
                  </Box>
                ))}
              </Box>

              {/* Main Image */}
              <Box sx={themeStyles.mainImageContainer}>
                <img src={activeImage} alt={product.name} style={themeStyles.mainImage} />
                {product.stock <= 5 && product.stock > 0 && (
                  <Chip label="LOW STOCK" sx={{ position: 'absolute', top: 16, left: 16, bgcolor: '#d32f2f', color: 'white', fontWeight: 700, borderRadius: 0, height: 24 }} />
                )}
                {product.stock === 0 && (
                  <Chip label="SOLD OUT" sx={{ position: 'absolute', top: 16, left: 16, bgcolor: '#000', color: 'white', fontWeight: 700, borderRadius: 0, height: 24 }} />
                )}
              </Box>
            </Box>
          </Grid>

          {/* --- RIGHT: DETAILS (Sticky) --- */}
          <Grid item xs={12} md={5}>
            <Box sx={themeStyles.stickyContainer}>
              
              {/* Header */}
              <Typography variant="h1" sx={{ fontSize: { xs: '24px', md: '32px' }, fontWeight: 700, mb: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {product.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Typography sx={{ fontSize: '20px', fontWeight: 600 }}>₹{product.price?.toLocaleString()}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#ffb400' }}>
                  <Star size={14} fill="#ffb400" />
                  <Typography sx={{ fontSize: '13px', color: '#000', fontWeight: 500 }}>4.8 (12 Reviews)</Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 4 }} />

              {/* Size Selector */}
              {parsedSizes.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography sx={{ fontSize: '13px', fontWeight: 700 }}>SELECT SIZE</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer', opacity: 0.7, '&:hover': { opacity: 1 } }}>
                      <Ruler size={14} />
                      <Typography sx={{ fontSize: '12px', textDecoration: 'underline' }}>Size Guide</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                    {parsedSizes.map((size) => (
                      <Button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        sx={themeStyles.sizeButton(selectedSize === size)}
                        disableRipple
                      >
                        {size}
                      </Button>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Quantity & Cart */}
              <Box sx={{ mb: 4 }}>
                <Typography sx={{ fontSize: '13px', fontWeight: 700, mb: 1.5 }}>QUANTITY</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #e0e0e0', px: 1, height: '48px' }}>
                    <IconButton size="small" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}><Minus size={16} /></IconButton>
                    <Typography sx={{ px: 2, fontWeight: 600, minWidth: '30px', textAlign: 'center' }}>{quantity}</Typography>
                    <IconButton size="small" onClick={() => setQuantity(quantity + 1)} disabled={quantity >= product.stock}><Plus size={16} /></IconButton>
                  </Box>
                  <Button 
                    fullWidth 
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    sx={{ 
                      bgcolor: 'black', color: 'white', fontWeight: 700, fontSize: '14px', borderRadius: 0,
                      '&:hover': { bgcolor: '#333' },
                      '&:disabled': { bgcolor: '#ccc' }
                    }}
                  >
                    {product.stock === 0 ? "SOLD OUT" : "ADD TO CART"}
                  </Button>
                </Box>
                <Button 
                  fullWidth 
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  sx={{ 
                    mt: 2, border: '1px solid black', color: 'black', fontWeight: 700, fontSize: '14px', borderRadius: 0, height: '48px',
                    '&:hover': { bgcolor: '#f9f9f9' }
                  }}
                >
                  BUY IT NOW
                </Button>
              </Box>

              {/* Accordions */}
              <Box>
                <Accordion defaultExpanded disableGutters elevation={0} sx={themeStyles.accordion}>
                  <AccordionSummary expandIcon={<ChevronDown size={18} />}>
                    <Typography sx={{ fontWeight: 600, fontSize: '14px' }}>DESCRIPTION</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography sx={{ fontSize: '14px', color: '#555', lineHeight: 1.6 }}>
                      {product.description || "No description available for this product."}
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                <Accordion disableGutters elevation={0} sx={themeStyles.accordion}>
                  <AccordionSummary expandIcon={<ChevronDown size={18} />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Truck size={18} />
                      <Typography sx={{ fontWeight: 600, fontSize: '14px' }}>DELIVERY & SHIPPING</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography sx={{ fontSize: '13px', color: '#555', lineHeight: 1.6 }}>
                      • Free shipping on orders over ₹1499.<br />
                      • Standard delivery: 3-5 business days.<br />
                      • Express delivery available at checkout.
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                <Accordion disableGutters elevation={0} sx={themeStyles.accordion}>
                  <AccordionSummary expandIcon={<ChevronDown size={18} />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <RotateCcw size={18} />
                      <Typography sx={{ fontWeight: 600, fontSize: '14px' }}>RETURNS & EXCHANGES</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography sx={{ fontSize: '13px', color: '#555', lineHeight: 1.6 }}>
                      Easy 7-day return policy. Items must be unworn, unwashed, and with original tags attached.
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </Box>

            </Box>
          </Grid>
        </Grid>

        {/* --- RELATED PRODUCTS SECTION --- */}
        {relatedProducts.length > 0 && (
          <Box sx={{ mt: 15, mb: 5 }}>
            <Divider sx={{ mb: 6 }} />
            <Typography variant="h4" sx={{ textAlign: 'center', fontWeight: 800, mb: 6, textTransform: 'uppercase', fontSize: '24px' }}>
              You May Also Like
            </Typography>
            <Grid container spacing={4}>
              {relatedProducts.map((p) => (
                <Grid item xs={6} md={3} key={p.id}>
                  <RelatedProductCard product={p} />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

      </Container>

      {/* Notifications */}
      <Snackbar open={notification.open} autoHideDuration={3000} onClose={() => setNotification({ ...notification, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" variant="filled" sx={{ bgcolor: '#000', color: '#fff', borderRadius: 0 }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}