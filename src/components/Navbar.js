import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingBag, Search, X } from "lucide-react";
import { Box, Container, Collapse, Drawer, Input, IconButton } from "@mui/material";
import { useCart } from "../context/CartContext";

export default function Navbar({ session, onLogout, userRole }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [apparelOpen, setApparelOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems } = useCart();

  // Check if we're on the homepage
  const isHomePage = location.pathname === "/";

  // Handle Scroll Effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    if (isHomePage) {
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    } else {
      setIsScrolled(true);
    }
  }, [isHomePage]);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  // Determine navbar colors
  let textColor, bgColor, borderColor;
  
  if (isHomePage) {
    textColor = isScrolled ? '#000000' : '#FFFFFF';
    bgColor = isScrolled ? 'rgba(255, 255, 255, 0.98)' : 'transparent';
    borderColor = isScrolled ? '#f0f0f0' : 'transparent';
  } else {
    textColor = '#000000';
    bgColor = '#FFFFFF';
    borderColor = '#f0f0f0';
  }

  // Check if current user is admin
  const isAdmin = userRole === 'admin';

  return (
    <>
      {/* INJECT CSS ANIMATIONS */}
      <style>
        {`
          @keyframes spin3D {
            0% { transform: perspective(1000px) rotateY(0deg); }
            100% { transform: perspective(1000px) rotateY(360deg); }
          }
          .nav-hover-underline::after {
            content: '';
            display: block;
            width: 0;
            height: 1px;
            background: currentColor;
            transition: width 0.3s ease;
            margin-top: 2px;
          }
          .nav-hover-underline:hover::after {
            width: 100%;
          }
        `}
      </style>

      <header style={{
        position: 'fixed',
        top: '35px',
        left: 0,
        right: 0,
        height: '80px',
        backgroundColor: bgColor,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 1500,
        display: 'flex',
        alignItems: 'center',
        borderBottom: `1px solid ${borderColor}`,
        backdropFilter: isScrolled ? 'blur(10px)' : 'none',
      }}>
        <Container maxWidth="xl" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
          
          {/* 1. LEFT: LOGO */}
          <Box sx={{ width: '200px', display: 'flex', justifyContent: 'flex-start' }}>
            <Link to="/" style={styles.logo(textColor)}>
              OneT
            </Link>
          </Box>

          {/* 2. CENTER: NAV LINKS (Absolute Center) */}
          <Box sx={{ 
            display: { xs: 'none', md: 'flex' }, 
            gap: 6, 
            position: 'absolute', 
            left: '50%', 
            transform: 'translateX(-50%)',
            alignItems: 'center',
            height: '100%'
          }}>
            <Link to="/products?sort=new" className="nav-hover-underline" style={styles.navLink(textColor)}>
              NEW IN
            </Link>
            
            {/* Mega Menu Trigger */}
            <div 
              onMouseEnter={() => setApparelOpen(true)}
              onMouseLeave={() => setApparelOpen(false)}
              style={{ height: '100%', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            >
              <span className="nav-hover-underline" style={styles.navLink(textColor)}>
                APPAREL
              </span>
            </div>

            <Link to="/about" className="nav-hover-underline" style={styles.navLink(textColor)}>
              STORES
            </Link>
          </Box>

          {/* 3. RIGHT: ACTIONS */}
          <Box sx={{ width: '300px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 3 }}>
            <button onClick={() => setSearchOpen(true)} className="nav-hover-underline" style={styles.textButton(textColor)}>
              SEARCH
            </button>
            
            {/* Login / Account Logic */}
            {session ? (
              <>
                <Link to="/orders" className="nav-hover-underline" style={styles.textButton(textColor)}>
                  ACCOUNT
                </Link>
                
                {isAdmin && (
                  <Link to="/admin" style={{
                    ...styles.textButton(textColor),
                    border: `1px solid ${textColor}`,
                    padding: '4px 8px',
                    marginRight: '8px'
                  }}>
                    ADMIN
                  </Link>
                )}
                
                <button onClick={onLogout} className="nav-hover-underline" style={styles.textButton(textColor)}>
                  LOGOUT
                </button>
              </>
            ) : (
              <Link to="/login" className="nav-hover-underline" style={styles.textButton(textColor)}>
                LOGIN
              </Link>
            )}

            {/* ROTATING CART ICON - FORCE BLACK COLOR */}
            <Link to="/cart" style={{ 
              position: 'relative', 
              color: '#000000', // STRICTLY BLACK
              textDecoration: 'none', 
              display: 'flex', 
              alignItems: 'center' 
            }}>
               <Box sx={{ 
                 position: 'relative', 
                 display: 'flex', 
                 alignItems: 'center',
                 animation: 'spin3D 6s linear infinite',
                 transformStyle: 'preserve-3d'
               }}>
                 {/* Stroke is black because parent color is #000000 */}
                 <ShoppingBag size={20} strokeWidth={1.5} />
               </Box>
               
               {/* Cart Count Badge */}
               {cartItems.length > 0 && (
                 <span style={{ 
                   marginLeft: '6px', 
                   fontSize: '11px', 
                   fontWeight: 700,
                   position: 'absolute',
                   right: -12,
                   top: 0,
                   color: '#000000' // Badge text also black
                 }}>
                   ({cartItems.length})
                 </span>
               )}
            </Link>
          </Box>
        </Container>
      </header>

      {/* MEGA MENU: APPAREL */}
      <Collapse in={apparelOpen} timeout={300} sx={{ position: 'fixed', top: '115px', left: 0, right: 0, zIndex: 1400 }}>
        <div 
          onMouseEnter={() => setApparelOpen(true)}
          onMouseLeave={() => setApparelOpen(false)}
          style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #eee', padding: '50px 0', boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}
        >
          <Container maxWidth="lg">
            <Box sx={{ display: 'flex', gap: 15, justifyContent: 'center' }}>
              <Box>
                <div style={styles.menuHeader}>TOP WEAR</div>
                <div style={styles.menuList}>
                  <Link to="/products?cat=tshirts" style={styles.menuItem}>T-SHIRTS</Link>
                  <Link to="/products?cat=hoodies" style={styles.menuItem}>HOODIES</Link>
                  <Link to="/products?cat=jackets" style={styles.menuItem}>JACKETS</Link>
                  <Link to="/products?cat=shirts" style={styles.menuItem}>SHIRTS</Link>
                  <Link to="/products?cat=sweatshirts" style={styles.menuItem}>SWEATSHIRTS</Link>
                </div>
              </Box>
              <Box>
                <div style={styles.menuHeader}>BOTTOM WEAR</div>
                <div style={styles.menuList}>
                   <Link to="/products?cat=pants" style={styles.menuItem}>PANTS</Link>
                   <Link to="/products?cat=cargos" style={styles.menuItem}>CARGOS</Link>
                   <Link to="/products?cat=shorts" style={styles.menuItem}>SHORTS</Link>
                </div>
              </Box>
               <Box>
                <div style={styles.menuHeader}>ACCESSORIES</div>
                <div style={styles.menuList}>
                   <Link to="/products?cat=caps" style={styles.menuItem}>CAPS</Link>
                   <Link to="/products?cat=bags" style={styles.menuItem}>BAGS</Link>
                   <Link to="/products?cat=jewelry" style={styles.menuItem}>JEWELRY</Link>
                </div>
              </Box>
            </Box>
          </Container>
        </div>
      </Collapse>

      {/* SEARCH DRAWER */}
      <Drawer 
        anchor="top" 
        open={searchOpen} 
        onClose={() => { setSearchOpen(false); setSearchQuery(""); }}
        transitionDuration={400}
        PaperProps={{ sx: { height: '100vh', backgroundColor: 'white' } }}
      >
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <IconButton 
            onClick={() => { setSearchOpen(false); setSearchQuery(""); }} 
            sx={{ position: 'absolute', top: 40, right: 40, color: 'black' }}
          >
            <X size={32} strokeWidth={1} />
          </IconButton>
          
          <Box sx={{ width: '60%', maxWidth: 600, position: 'relative' }}>
            <Input
              autoFocus
              fullWidth
              disableUnderline
              type="text"
              placeholder="SEARCH"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearch}
              sx={{
                fontSize: { xs: '32px', md: '48px' },
                fontWeight: 800,
                textAlign: 'center',
                letterSpacing: '-1px',
                borderBottom: '2px solid #000',
                paddingBottom: '10px',
                '& input': { textAlign: 'center', textTransform: 'uppercase' }
              }}
            />
          </Box>
          
          <Box sx={{ mt: 4, opacity: 0.5 }}>
            <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '1px' }}>PRESS ENTER TO SEARCH</span>
          </Box>
        </Box>
      </Drawer>
    </>
  );
}

const styles = {
  logo: (color) => ({
    fontSize: '26px',
    fontWeight: 900,
    letterSpacing: '-1.5px',
    color: color,
    fontFamily: 'Inter, sans-serif',
    textDecoration: 'none',
    textTransform: 'uppercase',
  }),
  navLink: (color) => ({
    fontSize: '11px',
    fontWeight: 700,
    color: color,
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    textDecoration: 'none',
    cursor: 'pointer',
    position: 'relative',
    paddingBottom: '2px',
  }),
  textButton: (color) => ({
    background: 'none',
    border: 'none',
    fontSize: '11px',
    fontWeight: 700,
    color: color,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    cursor: 'pointer',
    textDecoration: 'none',
    fontFamily: 'inherit',
    padding: 0,
    position: 'relative',
  }),
  menuHeader: {
    fontSize: '10px',
    fontWeight: 800,
    color: '#999',
    marginBottom: '24px',
    letterSpacing: '2px',
    textTransform: 'uppercase',
  },
  menuList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  menuItem: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#000',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    textDecoration: 'none',
    transition: 'opacity 0.2s',
  }
};