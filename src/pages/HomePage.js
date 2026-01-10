import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Button, Container } from '@mui/material';
import { ArrowDown } from 'lucide-react';
import { supabase } from '../supabase/supabaseClient';
import ProductCard from '../components/ProductCard';

// Helper Component for Hover-to-Play Video
const HoverVideo = ({ src, title }) => {
  const videoRef = useRef(null);

  const handleMouseEnter = () => {
    if (videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0; 
    }
  };

  return (
    <Box 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{ 
        position: 'relative', 
        width: '100%', 
        height: '500px', 
        overflow: 'hidden',
        cursor: 'pointer',
        backgroundColor: '#000',
        borderRight: '1px solid #fff',
        '&:last-child': { borderRight: 'none' }
      }}
    >
      <video 
        ref={videoRef}
        muted 
        loop 
        playsInline
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'cover', 
          transition: 'transform 0.5s ease'
        }}
        onError={(e) => console.error(`Failed to load video: ${src}`, e)}
        src={src} 
      />
      <Box sx={{ position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center', pointerEvents: 'none' }}>
        <Typography sx={{ color: 'white', fontSize: '14px', fontWeight: 800, letterSpacing: '1px', textShadow: '0 2px 5px rgba(0,0,0,0.8)' }}>
          {title}
        </Typography>
      </Box>
    </Box>
  );
};

export default function HomePage({ session }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchLatest = async () => {
      const { data } = await supabase.from('products').select('*').limit(16);
      if (data) setProducts(data);
    };
    fetchLatest();
  }, []);

  const firstDrop = products.slice(0, 8);
  const secondDrop = products.slice(8, 16);

  const scrollToProducts = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      
      {/* 1. HERO VIDEO */}
      <Box sx={{ position: 'sticky', top: 0, height: { xs: '100dvh', md: '100vh' }, width: '100%', overflow: 'hidden', zIndex: 0 }}>
        <video 
          autoPlay loop muted playsInline 
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', filter: 'brightness(0.9)' }}
          src="/videos/hero.mp4" 
        />
        <Box sx={{ position: 'absolute', bottom: '50px', width: '100%', display: 'flex', justifyContent: 'center', zIndex: 2 }}>
           <Box onClick={scrollToProducts} sx={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'bounce 2s infinite' }}>
             <Typography sx={{ color: '#fff', fontSize: '10px', fontWeight: 800, letterSpacing: '2px', mb: 1 }}>SHOP ALL</Typography>
             <ArrowDown color="white" size={24} />
           </Box>
        </Box>
      </Box>

      {/* 2. MAIN CONTENT LAYER */}
      <Box sx={{ position: 'relative', zIndex: 10, backgroundColor: '#ffffff', minHeight: '100vh', paddingTop: '5px', paddingBottom: '0px', boxShadow: '0 -10px 30px rgba(0,0,0,0.1)' }}>
        
        {/* SECTION A */}
        <Container maxWidth="xl" sx={{ px: { xs: 2, md: 4 }, mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3, mt: 2 }}>
            <Typography sx={{ fontSize: '10px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', lineHeight: 1 }}>LATEST DROP</Typography>
            <Link to="/products" style={{ textDecoration: 'none' }}>
              <Button disableRipple sx={{ borderRadius: 0, border: '1px solid #e0e0e0', color: 'black', fontSize: '10px', fontWeight: 800, py: 1, px: 2, minWidth: 'auto', '&:hover': { bgcolor: 'black', color: 'white', borderColor: 'black' } }}>DISCOVER MORE</Button>
            </Link>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' }, gap: '10px', width: '100%' }}>
            {firstDrop.map((product) => (<ProductCard key={product.id} product={product} session={session} />))}
          </Box>
        </Container>

        {/* SECTION B */}
        <Box sx={{ width: '100%', height: { xs: '60vh', md: '80vh' }, overflow: 'hidden', position: 'relative', backgroundColor: '#000' }}>
          <video autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }} src="/videos/hero2.mp4" onError={(e) => console.error("Error loading Hero2:", e.target.src)} />
          <Box sx={{ position: 'absolute', bottom: 40, left: 20, color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.5)', textAlign: 'left' }}>
            <Typography sx={{ fontSize: '10px', fontWeight: 800, letterSpacing: '2px', mb: 1 }}>NEW SEASON</Typography>
            <Typography sx={{ fontSize: { xs: '24px', md: '32px' }, fontWeight: 900, textTransform: 'uppercase', lineHeight: 1 }}>THE WINTER EDIT</Typography>
          </Box>
        </Box>

        {/* SECTION C */}
        <Container maxWidth="xl" sx={{ px: { xs: 2, md: 4 }, mt: 2, mb: 0, pb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3 }}>
            <Typography sx={{ fontSize: '10px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', lineHeight: 1 }}>MORE FROM ONET</Typography>
            <Link to="/products" style={{ textDecoration: 'none' }}>
              <Button disableRipple sx={{ borderRadius: 0, border: '1px solid #e0e0e0', color: 'black', fontSize: '10px', fontWeight: 800, py: 1, px: 2, minWidth: 'auto', '&:hover': { bgcolor: 'black', color: 'white', borderColor: 'black' } }}>VIEW ALL</Button>
            </Link>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' }, gap: '10px', width: '100%' }}>
            {secondDrop.length > 0 ? (secondDrop.map((product) => (<ProductCard key={product.id} product={product} session={session} />))) : (<Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 4 }}><Typography sx={{ fontSize: '12px', color: '#999' }}>Loading...</Typography></Box>)}
          </Box>
        </Container>

        {/* SECTION D */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, width: '100%', borderTop: '1px solid #eee' }}>
          <HoverVideo src="/videos/store1.mp4" title="DELHI STORE" />
          <HoverVideo src="/videos/store2.mp4" title="MUMBAI STORE" />
          <HoverVideo src="/videos/store3.mp4" title="BANGALORE STORE" />
        </Box>

        {/* === SECTION E: SHIPPING MARQUEE (🟢 NEW) === */}
        <Box sx={{ 
          backgroundColor: '#000', 
          color: '#fff', 
          height: '40px', 
          overflow: 'hidden', 
          display: 'flex', 
          alignItems: 'center',
          whiteSpace: 'nowrap'
        }}>
          <Box sx={{ 
            display: 'flex', 
            animation: 'marquee 20s linear infinite', // Continuous scroll
            width: 'max-content'
          }}>
            {/* Repeated text for seamless loop */}
            {[...Array(20)].map((_, i) => (
              <Typography key={i} component="span" sx={{ 
                fontSize: '11px', 
                fontWeight: 700, 
                letterSpacing: '2px', 
                mx: 4, 
                textTransform: 'uppercase'
              }}>
                SHIPPING ACROSS THE WORLD
              </Typography>
            ))}
          </Box>
        </Box>

      </Box>

      <style>{`
        @keyframes bounce { 0%, 20%, 50%, 80%, 100% {transform: translateY(0);} 40% {transform: translateY(-5px);} 60% {transform: translateY(-3px);} }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      `}</style>
    </Box>
  );
}