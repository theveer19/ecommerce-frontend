import React, { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import ProductCard from "./ProductCard";
import {
  Box,
  Container,
  Typography,
  IconButton,
  CircularProgress,
  Button,
  InputBase,
  Fade,
  useTheme,
  useMediaQuery,
  Paper
} from "@mui/material";
import { Search, Close, Refresh, Tune, Sort } from "@mui/icons-material";

export default function ProductList({ session }) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showSearch, setShowSearch] = useState(false);

  /* ---------- FIXED CATEGORY VALUES (MATCH DATABASE) ---------- */
  const categories = [
    { label: "ALL", value: "all" },
    { label: "T-SHIRTS", value: "tshirts" },
    { label: "HOODIES", value: "hoodies" },
    { label: "PANTS", value: "pants" },
    { label: "JACKETS", value: "jackets" },
    { label: "ACCESSORIES", value: "accessories" },
  ];

  /* ---------- RESPONSIVE HOOKS ---------- */
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  /* ---------- FETCH PRODUCTS (SAFE) ---------- */
  const fetchProducts = async () => {
    setLoading(true);
    setError(false);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Product fetch failed:", error);
      setError(true);
      setLoading(false);
      return;
    }

    setProducts(data || []);
    setFilteredProducts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* ---------- FILTER & SORT (NO LOOPS) ---------- */
  useEffect(() => {
    let result = [...products];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((p) =>
        p.name?.toLowerCase().includes(term)
      );
    }

    if (selectedCategory !== "all") {
      result = result.filter(
        (p) => p.category === selectedCategory
      );
    }

    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    }

    if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    }

    if (sortBy === "newest") {
      result.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
    }

    setFilteredProducts(result);
  }, [products, searchTerm, selectedCategory, sortBy]);

  /* ---------- STYLES (3D / DYNAMIC) ---------- */
  const styles = {
    pageBackground: {
      background: '#f4f5f7',
      backgroundImage: `radial-gradient(#e0e0e0 1px, transparent 1px), radial-gradient(#e0e0e0 1px, transparent 1px)`,
      backgroundSize: '20px 20px',
      backgroundPosition: '0 0, 10px 10px',
      minHeight: '100vh',
      pb: 10
    },
    stickyHeader: {
      position: "sticky",
      top: 20,
      zIndex: 90,
      marginTop: '-30px', // Pull up to overlap header slightly
      marginBottom: '40px',
    },
    glassBar: {
      background: 'rgba(255, 255, 255, 0.65)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderRadius: '24px',
      border: '1px solid rgba(255, 255, 255, 0.4)',
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
      padding: '10px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      transition: 'all 0.3s ease',
    },
    categoryBtn: (isActive) => ({
      background: isActive ? '#000' : 'transparent',
      color: isActive ? '#fff' : '#666',
      border: 'none',
      cursor: 'pointer',
      padding: '8px 16px',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: 800,
      letterSpacing: '1px',
      transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
      position: 'relative',
      transform: isActive ? 'scale(1.05)' : 'scale(1)',
      boxShadow: isActive ? '0 10px 20px rgba(0,0,0,0.2)' : 'none',
      whiteSpace: 'nowrap',
      '&:hover': {
        color: isActive ? '#fff' : '#000',
        transform: 'translateY(-2px)'
      }
    }),
    sortSelect: {
      appearance: 'none',
      background: 'transparent',
      border: 'none',
      fontWeight: 700,
      fontSize: '0.8rem',
      color: '#000',
      cursor: 'pointer',
      paddingRight: '20px',
      outline: 'none',
      textAlign: 'right'
    },
    title3D: {
      fontWeight: 900,
      color: 'transparent',
      WebkitTextStroke: '1px #000',
      fontSize: { xs: '3rem', md: '5rem' },
      opacity: 0.1,
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 0,
      whiteSpace: 'nowrap',
      pointerEvents: 'none'
    }
  };

  /* ---------- LOADING ---------- */
  if (loading) {
    return (
      <Box sx={{ ...styles.pageBackground, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Box sx={{ position: 'relative' }}>
            <CircularProgress size={60} thickness={2} sx={{ color: "black" }} />
            <Box sx={{ 
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'pulse 1s infinite'
            }}>
                <Typography variant="caption" sx={{ fontWeight: 900 }}>LOAD</Typography>
            </Box>
        </Box>
        <style>{`@keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }`}</style>
      </Box>
    );
  }

  /* ---------- ERROR ---------- */
  if (error) {
    return (
      <Box sx={{ ...styles.pageBackground, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Paper sx={{ 
            p: 6, borderRadius: '24px', textAlign: "center", 
            background: 'rgba(255,255,255,0.9)', 
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)' 
        }}>
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 2, color: '#000' }}>
            CONNECTION LOST
          </Typography>
          <Typography variant="body2" sx={{ color: '#666', mb: 4 }}>
            Unable to retrieve the inventory.
          </Typography>
          <Button
            startIcon={<Refresh />}
            onClick={fetchProducts}
            variant="contained"
            sx={{ bgcolor: 'black', color: 'white', borderRadius: '50px', px: 4, py: 1.5 }}
          >
            Retry Connection
          </Button>
        </Paper>
      </Box>
    );
  }

  /* ---------- UI ---------- */
  return (
    <Box sx={styles.pageBackground}>
      
      {/* HEADER SECTION */}
      <Box sx={{ 
          pt: { xs: 15, md: 18 }, 
          pb: 12, 
          position: 'relative', 
          overflow: 'hidden',
          textAlign: 'center'
      }}>
         {/* Background Giant Text */}
         <Typography sx={styles.title3D}>
            {selectedCategory === "all" ? "COLLECTION" : selectedCategory.toUpperCase()}
         </Typography>

         <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
            <Fade in={true} timeout={800}>
                <Box>
                    <Typography variant="overline" sx={{ letterSpacing: '4px', fontWeight: 800, color: '#666' }}>
                        SEASON 2026 // {products.length} ITEMS
                    </Typography>
                    <Typography variant="h2" sx={{ 
                        fontSize: { xs: '2rem', md: '3.5rem' }, 
                        fontWeight: 900, 
                        color: '#000',
                        textTransform: 'uppercase',
                        letterSpacing: '-1px',
                        mt: 1
                    }}>
                        {searchTerm ? `Results: "${searchTerm}"` : 
                         selectedCategory === 'all' ? "Latest Drop" : selectedCategory}
                    </Typography>
                </Box>
            </Fade>
         </Container>
      </Box>

      {/* STICKY CONTROL BAR (GLASS) */}
      <Box sx={styles.stickyHeader}>
        <Container maxWidth="xl">
          <Box sx={styles.glassBar}>
            
            {/* CATEGORIES (Scrollable on mobile) */}
            <Box sx={{ 
                display: "flex", 
                gap: 1, 
                overflowX: 'auto', 
                mr: 2,
                pb: { xs: 1, md: 0 }, // Space for scrollbar on mobile
                '::-webkit-scrollbar': { display: 'none' }, // Hide scrollbar
                scrollbarWidth: 'none'
            }}>
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  style={styles.categoryBtn(selectedCategory === cat.value)}
                >
                  {cat.label}
                </button>
              ))}
            </Box>

            {/* RIGHT SIDE: SEARCH & SORT */}
            <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, md: 3 } }}>
              
              {/* Expanding Search */}
              <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  background: showSearch ? '#f5f5f5' : 'transparent',
                  borderRadius: '20px',
                  pr: 1,
                  transition: 'all 0.3s ease',
                  border: showSearch ? '1px solid #ddd' : '1px solid transparent'
              }}>
                {showSearch && (
                  <InputBase
                    placeholder="Search assets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                    sx={{ 
                        ml: 2, 
                        fontSize: '0.9rem', 
                        width: { xs: '100px', md: '180px' },
                        fontWeight: 600
                    }}
                  />
                )}
                <IconButton
                  onClick={() => {
                      if (showSearch) { setSearchTerm(""); }
                      setShowSearch(!showSearch);
                  }}
                  size="small"
                  sx={{ color: '#000' }}
                >
                  {showSearch ? <Close fontSize="small"/> : <Search fontSize="small"/>}
                </IconButton>
              </Box>

              {/* Custom styled select wrapper */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                 {!isMobile && <Sort fontSize="small" sx={{ color: '#999' }} />}
                 <Box sx={{ position: 'relative' }}>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        style={styles.sortSelect}
                    >
                        <option value="newest">Newest Drop</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                    </select>
                 </Box>
              </Box>

            </Box>
          </Box>
        </Container>
      </Box>

      {/* PRODUCTS GRID */}
      <Container maxWidth="xl">
        {filteredProducts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10, opacity: 0.5 }}>
             <Tune sx={{ fontSize: 60, mb: 2 }} />
             <Typography variant="h6" fontWeight="bold">NO MATCHING ASSETS</Typography>
             <Typography variant="body2">Try adjusting your filters.</Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)", // 2 columns mobile
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
                lg: "repeat(4, 1fr)", // 4 columns desktop
              },
              gap: { xs: 2, md: 4 }, // Responsive gap
            }}
          >
            {filteredProducts.map((product, index) => (
              <Box
                key={product.id}
                sx={{
                    animation: `fadeInUp 0.6s ease forwards`,
                    animationDelay: `${index * 0.05}s`,
                    opacity: 0,
                    transform: 'translateY(20px)',
                    // Wrapper style to give the card 3D context
                    perspective: '1000px', 
                    '& > *': { height: '100%' } // Ensure ProductCard fills height
                }}
              >
                <ProductCard
                  product={product}
                  session={session}
                />
              </Box>
            ))}
          </Box>
        )}
      </Container>
      
      <style>{`
        @keyframes fadeInUp {
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Box>
  );
}