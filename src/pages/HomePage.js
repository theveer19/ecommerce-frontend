import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Button, Container } from '@mui/material';
import { ArrowDown } from 'lucide-react';
import { supabase } from '../supabase/supabaseClient';
import ProductCard from '../components/ProductCard';

export default function HomePage({ session }) {
  const productSectionRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatest = async () => {
      // Fetch 8 products
      const { data, error } = await supabase.from('products').select('*').limit(8);
      if (error) {
        console.error('Error fetching products:', error);
      } else if (data) {
        setProducts(data);
      }
      setLoading(false);
    };
    fetchLatest();
  }, []);

  const scrollToProducts = () => {
    productSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Box sx={{ bgcolor: '#ffffff' }}>
      
      {/* 1. HERO VIDEO */}
      <Box sx={{ position: 'relative', height: '100vh', width: '100%', overflow: 'hidden', bgcolor: 'black' }}>
        <video 
          autoPlay loop muted playsInline 
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }}
          src={process.env.PUBLIC_URL + "/videos/hero.mp4"} 
        />
        <Box sx={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', pb: 6 }}>
          <Box onClick={scrollToProducts} sx={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, animation: 'bounce 2s infinite' }}>
             <Typography sx={{ color: '#fff', fontSize: '10px', fontWeight: 800, letterSpacing: '2px' }}>SHOP ALL</Typography>
             <ArrowDown color="white" size={20} />
          </Box>
        </Box>
      </Box>

      {/* 2. PRODUCT SECTION */}
      <Box ref={productSectionRef} sx={{ pt: 6, pb: 10, bgcolor: 'white' }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2, md: 4 } }}>
          
          {/* HEADER */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 4 }}>
            <Typography sx={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>
              LATEST DROP
            </Typography>
            <Link to="/products" style={{ textDecoration: 'none' }}>
              <Button disableRipple sx={{ 
                borderRadius: 0, border: '1px solid #e0e0e0', color: 'black', fontSize: '10px', fontWeight: 800, py: 1, px: 2, minWidth: 'auto',
                '&:hover': { bgcolor: 'black', color: 'white', borderColor: 'black' }
              }}>
                DISCOVER MORE
              </Button>
            </Link>
          </Box>

          {/* === RESPONSIVE CSS GRID LAYOUT === */}
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 10 }}>
              <Typography sx={{ color: '#999' }}>Loading products...</Typography>
            </Box>
          ) : products.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 10 }}>
              <Typography sx={{ color: '#999' }}>No products available</Typography>
            </Box>
          ) : (
            <Box sx={{
              display: 'grid',
              // Responsive Columns:
              // xs (0px+): 2 Columns
              // sm (600px+): 3 Columns
              // md (900px+): 4 Columns
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(3, 1fr)',
                md: 'repeat(4, 1fr)'
              },
              gap: '10px', // Tight gap
              width: '100%'
            }}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} session={session} />
              ))}
            </Box>
          )}

        </Container>
      </Box>
      <style>{`@keyframes bounce { 0%, 20%, 50%, 80%, 100% {transform: translateY(0);} 40% {transform: translateY(-5px);} 60% {transform: translateY(-3px);} }`}</style>
    </Box>
  );
}