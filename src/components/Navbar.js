import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingBag, Search, X, Menu, User, LogOut, ShieldCheck } from "lucide-react";
import { Box, Container, Collapse, Drawer, Input, IconButton, List, ListItem, ListItemText } from "@mui/material";
import { useCart } from "../context/CartContext";

export default function Navbar({ session, onLogout, userRole }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [apparelOpen, setApparelOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems } = useCart();

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

  const isAdmin = userRole === 'admin';

  return (
    <>
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
          /* 3D Click Effect for Hamburger */
          .click-3d:active {
            transform: scale(0.95);
            transition: transform 0.1s;
          }
        `}
      </style>

      <header style={{
        position: 'fixed',
        top: 0, // ✅ Fixed: Stick to very top on mobile
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
        paddingTop: isHomePage && !isScrolled ? '35px' : '0px' // Announcement bar spacing
      }}>
        <Container maxWidth="xl" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
          
          {/* 1. LEFT: HAMBURGER (Mobile) & LOGO */}
          <Box sx={{ display: 'flex', alignItems: 'center', width: { xs: 'auto', md: '200px' } }}>
            
            {/* ✅ DYNAMIC 3D HAMBURGER ICON */}
            <IconButton 
              className="click-3d"
              onClick={() => setMobileMenuOpen(true)}
              sx={{ 
                display: { xs: 'flex', md: 'none' }, 
                color: textColor, // Dynamic Color
                mr: 1,
                padding: '8px',
                transition: 'color 0.3s ease'
              }}
            >
              <Menu size={28} strokeWidth={2} />
            </IconButton>

            <Link to="/" style={styles.logo(textColor)}>
              OneT
            </Link>
          </Box>

          {/* 2. CENTER: NAV LINKS (Desktop) */}
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
          <Box sx={{ 
            width: { xs: 'auto', md: '300px' }, 
            display: 'flex', 
            justifyContent: 'flex-end', 
            alignItems: 'center', 
            gap: { xs: 1, md: 3 } 
          }}>
            {/* Search Button */}
            <button onClick={() => setSearchOpen(true)} className="nav-hover-underline" style={{ ...styles.textButton(textColor), display: 'flex', alignItems: 'center' }}>
              <span style={{ display: window.innerWidth > 900 ? 'block' : 'none' }}>SEARCH</span>
              <Search size={22} style={{ display: window.innerWidth <= 900 ? 'block' : 'none', color: textColor }} />
            </button>
            
            {/* Desktop Account Links */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 3 }}>
              {session ? (
                <>
                  <Link to="/orders" className="nav-hover-underline" style={styles.textButton(textColor)}>
                    ACCOUNT
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" style={{ ...styles.textButton(textColor), border: `1px solid ${textColor}`, padding: '4px 8px', marginRight: '8px' }}>
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
            </Box>

            {/* Cart Icon */}
            <Link to="/cart" style={{ position: 'relative', color: textColor, textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
               <Box sx={{ 
                 position: 'relative', 
                 display: 'flex', 
                 alignItems: 'center',
                 animation: 'spin3D 6s linear infinite',
                 transformStyle: 'preserve-3d'
               }}>
                 <ShoppingBag size={22} strokeWidth={1.5} />
               </Box>
               
               {cartItems.length > 0 && (
                 <span style={{ 
                   marginLeft: '6px', 
                   fontSize: '11px', 
                   fontWeight: 700,
                   position: 'absolute',
                   right: -10,
                   top: -5,
                   color: textColor
                 }}>
                   ({cartItems.length})
                 </span>
               )}
            </Link>
          </Box>
        </Container>
      </header>

      {/* --- MOBILE DRAWER MENU --- */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{ sx: { width: '85%', maxWidth: '300px', bgcolor: 'white', zIndex: 1600 } }}
        sx={{ zIndex: 1600 }} // ✅ Ensure Drawer is above everything
      >
        <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', height: '100%' }}>
          
          {/* HEADER WITH CLOSE BUTTON */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Link to="/" style={styles.logo('#000')} onClick={() => setMobileMenuOpen(false)}>
              OneT
            </Link>
            
            {/* ✅ FIXED CLOSE BUTTON */}
            <IconButton 
              onClick={() => setMobileMenuOpen(false)}
              sx={{ 
                color: 'black',
                zIndex: 1700, // Very high Z-Index
                padding: '10px',
                '&:active': { transform: 'scale(0.9)' } // 3D Click
              }}
            >
              <X size={28} />
            </IconButton>
          </Box>

          <List sx={{ flexGrow: 1 }}>
            <ListItem button component={Link} to="/products?sort=new" onClick={() => setMobileMenuOpen(false)}>
              <ListItemText primary="NEW IN" primaryTypographyProps={styles.mobileLink} />
            </ListItem>
            <ListItem button onClick={() => { setApparelOpen(true); setMobileMenuOpen(false); }}>
              <ListItemText primary="APPAREL" primaryTypographyProps={styles.mobileLink} />
            </ListItem>
            <ListItem button component={Link} to="/about" onClick={() => setMobileMenuOpen(false)}>
              <ListItemText primary="STORES" primaryTypographyProps={styles.mobileLink} />
            </ListItem>
            
            <Box sx={{ my: 3, height: '1px', bgcolor: '#eee' }} />

            {session ? (
              <>
                <ListItem button component={Link} to="/orders" onClick={() => setMobileMenuOpen(false)}>
                  <User size={18} style={{ marginRight: 10 }} />
                  <ListItemText primary="MY ACCOUNT" primaryTypographyProps={styles.mobileSubLink} />
                </ListItem>
                {isAdmin && (
                  <ListItem button component={Link} to="/admin" onClick={() => setMobileMenuOpen(false)}>
                    <ShieldCheck size={18} style={{ marginRight: 10 }} />
                    <ListItemText primary="ADMIN DASHBOARD" primaryTypographyProps={styles.mobileSubLink} />
                  </ListItem>
                )}
                <ListItem button onClick={() => { onLogout(); setMobileMenuOpen(false); }}>
                  <LogOut size={18} style={{ marginRight: 10 }} />
                  <ListItemText primary="LOGOUT" primaryTypographyProps={styles.mobileSubLink} />
                </ListItem>
              </>
            ) : (
              <ListItem button component={Link} to="/login" onClick={() => setMobileMenuOpen(false)}>
                <User size={18} style={{ marginRight: 10 }} />
                <ListItemText primary="LOGIN / REGISTER" primaryTypographyProps={styles.mobileSubLink} />
              </ListItem>
            )}
          </List>
        </Box>
      </Drawer>

      {/* MEGA MENU: APPAREL */}
      <Collapse in={apparelOpen} timeout={300} sx={{ position: 'fixed', top: '80px', left: 0, right: 0, zIndex: 1400 }}>
        <div 
          onMouseEnter={() => setApparelOpen(true)}
          onMouseLeave={() => setApparelOpen(false)}
          style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #eee', padding: '50px 0', boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}
        >
          <Container maxWidth="lg">
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' }, 
              gap: { xs: 4, md: 15 }, 
              justifyContent: 'center',
              textAlign: { xs: 'center', md: 'left' } 
            }}>
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
        PaperProps={{ sx: { height: '100vh', backgroundColor: 'white', zIndex: 2000 } }} // ✅ Max Z-Index
        sx={{ zIndex: 2000 }}
      >
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          
          {/* ✅ FIXED SEARCH CLOSE BUTTON */}
          <IconButton 
            onClick={() => { setSearchOpen(false); setSearchQuery(""); }} 
            sx={{ 
              position: 'absolute', 
              top: 30, 
              right: 30, 
              color: 'black',
              zIndex: 2001, // Above everything
              padding: '10px',
              backgroundColor: 'rgba(0,0,0,0.05)',
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.1)' }
            }}
          >
            <X size={32} strokeWidth={1.5} />
          </IconButton>
          
          <Box sx={{ width: '80%', maxWidth: 600, position: 'relative' }}>
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
                fontSize: { xs: '24px', md: '48px' },
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
    transition: 'color 0.3s ease'
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
    transition: 'color 0.3s ease'
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
    transition: 'color 0.3s ease'
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
  },
  mobileLink: {
    fontWeight: 900, 
    fontSize: '24px', 
    letterSpacing: '-1px', 
    textTransform: 'uppercase'
  },
  mobileSubLink: {
    fontWeight: 600, 
    fontSize: '14px', 
    letterSpacing: '1px', 
    textTransform: 'uppercase'
  }
};