import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";
import ProductCard from "./ProductCard";
import { 
  Box, Container, Typography, IconButton, 
  CircularProgress, Collapse 
} from "@mui/material";
import { Search, Close } from "@mui/icons-material";

export default function ProductList({ session }) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showSearch, setShowSearch] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  const categories = useMemo(() => [
    'all', 'T-Shirts', 'Hoodies', 'Pants', 'Jackets', 'Accessories'
  ], []);

  // Parse URL parameters on load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    const categoryParam = params.get('cat');
    const sortParam = params.get('sort');
    
    if (searchParam) setSearchTerm(searchParam);
    if (categoryParam) setSelectedCategory(categoryParam);
    if (sortParam) setSortBy(sortParam === 'new' ? 'newest' : sortParam);
  }, [location.search]);

  // --- FETCHING ---
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (data) {
        setProducts(data);
        setFilteredProducts(data);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  // --- FILTERING ---
  useEffect(() => {
    let result = [...products];
    
    if (searchTerm) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (selectedCategory !== 'all') {
      result = result.filter(p => 
        p.category?.toLowerCase() === selectedCategory.toLowerCase() ||
        (selectedCategory === 'tshirts' && p.category?.toLowerCase().includes('t-shirt')) ||
        (selectedCategory === 'hoodies' && p.category?.toLowerCase().includes('hoodie')) ||
        (selectedCategory === 'pants' && p.category?.toLowerCase().includes('pant'))
      );
    }
    
    if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price);
    else if (sortBy === 'newest') result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    setFilteredProducts(result);
  }, [searchTerm, selectedCategory, sortBy, products]);

  // Sync URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategory !== 'all') params.set('cat', selectedCategory);
    if (sortBy !== 'newest') params.set('sort', sortBy);
    const queryString = params.toString();
    navigate(`/products${queryString ? '?' + queryString : ''}`, { replace: true });
  }, [searchTerm, selectedCategory, sortBy, navigate]);

  const handleCategoryClick = (category) => setSelectedCategory(category);
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    if (value && !showSearch) setShowSearch(true);
  };
  const clearSearch = () => { setSearchTerm(''); setShowSearch(false); };

  if (loading) return (
    <Box sx={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: 'white' }}>
      <CircularProgress size={30} thickness={3} sx={{ color: 'black' }} />
    </Box>
  );

  return (
    <Box sx={{ bgcolor: '#FFFFFF', minHeight: '100vh' }}>
      
      {/* 1. COMPACT HEADER (No Product Count) */}
      <Box sx={styles.pageHeader}>
        <Container maxWidth="xl">
          <Typography sx={styles.collectionTitle}>
            {searchTerm ? `SEARCH: "${searchTerm}"` : selectedCategory === 'all' ? 'LATEST DROP' : selectedCategory.toUpperCase()}
          </Typography>
        </Container>
      </Box>

      {/* 2. COMPACT UTILITY BAR */}
      <Box sx={styles.stickyBarWrapper}>
        <Box sx={styles.stickyBar}>
          <Container maxWidth="xl" sx={{ height: '100%', px: { xs: 2, md: 4 } }}>
            <div style={styles.barFlex}>
              
              {/* Categories */}
              <div style={styles.categoriesWrapper}>
                 {categories.map((cat) => (
                   <button
                     key={cat}
                     onClick={() => handleCategoryClick(cat.toLowerCase())}
                     style={{
                       ...styles.catBtn,
                       opacity: selectedCategory === cat.toLowerCase() ? 1 : 0.4,
                       fontWeight: selectedCategory === cat.toLowerCase() ? 800 : 600,
                       borderBottom: selectedCategory === cat.toLowerCase() ? '2px solid black' : 'none'
                     }}
                   >
                     {cat.toUpperCase()}
                   </button>
                 ))}
              </div>

              {/* Tools */}
              <div style={styles.actionsWrapper}>
                 <div style={styles.searchContainer}>
                   <Collapse in={showSearch || searchTerm} orientation="horizontal">
                     <input 
                       autoFocus
                       placeholder="SEARCH..." 
                       value={searchTerm}
                       onChange={(e) => handleSearchChange(e.target.value)}
                       style={styles.minimalInput}
                     />
                   </Collapse>
                   <IconButton 
                     onClick={() => { if (searchTerm) clearSearch(); else setShowSearch(!showSearch); }} 
                     sx={{ color: 'black', p: 0.5 }}
                   >
                      {searchTerm || showSearch ? <Close sx={{ fontSize: 16 }} /> : <Search sx={{ fontSize: 16 }} />}
                   </IconButton>
                 </div>

                 <select 
                   value={sortBy} 
                   onChange={(e) => setSortBy(e.target.value)}
                   style={styles.minimalSelect}
                 >
                   <option value="newest">NEWEST</option>
                   <option value="price-low">LOW PRICE</option>
                   <option value="price-high">HIGH PRICE</option>
                 </select>
              </div>
            </div>
          </Container>
        </Box>
      </Box>

      {/* 3. STRICT 4-COLUMN GRID LAYOUT */}
      <Container maxWidth="xl" sx={{ px: { xs: 2, md: 4 }, pb: 10 }}>
        {filteredProducts.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 10 }}>
                <Typography sx={{ fontWeight: 800, fontSize: '12px', color: '#999', letterSpacing: '1px' }}>
                  NO PRODUCTS FOUND
                </Typography>
            </Box>
        ) : (
            // USE CSS GRID TO FORCE 4 COLUMNS
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)', // 2 columns on mobile
                sm: 'repeat(3, 1fr)', // 3 columns on tablet
                md: 'repeat(4, 1fr)', // 4 columns on desktop
                lg: 'repeat(4, 1fr)'  // Force 4 columns on large screens
              },
              gap: '10px', // Tight spacing
              width: '100%'
            }}>
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} session={session} />
                ))}
            </Box>
        )}
      </Container>
    </Box>
  );
}

const styles = {
  pageHeader: {
    pt: 10,
    pb: 3,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  collectionTitle: {
    fontSize: { xs: '20px', md: '28px' }, // Compact, sharp font size
    fontWeight: 900,
    letterSpacing: '-0.5px',
    color: '#000',
    mb: 0.5,
    lineHeight: 1,
  },
  stickyBarWrapper: {
    position: 'sticky',
    top: '75px', 
    zIndex: 90,
    mb: 4,
    display: 'flex',
    justifyContent: 'center',
  },
  stickyBar: {
    width: '100%',
    backdropFilter: 'blur(12px)',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderBottom: '1px solid #f0f0f0',
    height: '45px',
  },
  barFlex: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100%',
  },
  categoriesWrapper: {
    display: 'flex',
    gap: '20px',
    overflowX: 'auto',
    scrollbarWidth: 'none',
    height: '100%',
    alignItems: 'center',
  },
  catBtn: {
    background: 'none',
    border: 'none',
    fontSize: '10px', // Small tech font
    cursor: 'pointer',
    padding: '13px 0',
    whiteSpace: 'nowrap',
    letterSpacing: '0.5px',
    fontFamily: 'inherit',
    transition: 'opacity 0.2s',
  },
  actionsWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    borderRight: '1px solid #eee',
    paddingRight: '10px',
  },
  minimalInput: {
    border: 'none',
    borderBottom: '1px solid #000',
    outline: 'none',
    fontSize: '11px',
    fontWeight: 600,
    width: '120px',
    marginRight: '8px',
    background: 'transparent',
    textTransform: 'uppercase',
    fontFamily: 'inherit',
    paddingBottom: '2px',
  },
  minimalSelect: {
    border: 'none',
    outline: 'none',
    fontSize: '10px',
    fontWeight: 800,
    background: 'transparent',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontFamily: 'inherit',
    textAlign: 'right',
  },
};