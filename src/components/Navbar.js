import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingBag, Search, X, Menu, User, LogOut, ChevronDown, ChevronUp } from "lucide-react";
import { Box, Container, Collapse, Drawer, Input, IconButton, List, ListItem, ListItemText } from "@mui/material";
import { useCart } from "../context/CartContext";

export default function Navbar({ session, onLogout, userRole }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [apparelOpen, setApparelOpen] = useState(false); // Desktop Hover
  const [mobileApparelOpen, setMobileApparelOpen] = useState(false); // Mobile Click
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
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  // --- 🎨 COLOR LOGIC ---
  const isTransparent = isHomePage && !isScrolled;
  const textColor = isTransparent ? '#FFFFFF' : '#000000'; 
  const iconColor = isTransparent ? '#FFFFFF' : '#000000';
  const isAdmin = userRole === 'admin';

  return (
    <>
      <style>
        {`
          /* Minimalist Hover Line */
          .nav-link-hover {
            position: relative;
            transition: opacity 0.3s ease;
          }
          .nav-link-hover:hover {
            opacity: 0.7;
          }
          .nav-link-hover::after {
            content: '';
            position: absolute;
            width: 0;
            height: 1px;
            bottom: -2px;
            left: 0;
            background: currentColor;
            transition: width 0.3s ease;
          }
          .nav-link-hover:hover::after {
            width: 100%;
          }

          /* 3D Menu Icon Style */
          .menu-icon-3d {
             filter: drop-shadow(2px 2px 0px rgba(0,0,0,0.3));
             transition: transform 0.1s ease;
          }
          .menu-icon-3d:active {
             transform: translate(1px, 1px);
             filter: drop-shadow(1px 1px 0px rgba(0,0,0,0.3));
          }
        `}
      </style>

      {/* --- NAVBAR HEADER --- */}
      <header style={{
        position: 'fixed',
        top: '35px', 
        left: 0,
        right: 0,
        height: '60px', 
        backgroundColor: isTransparent ? 'transparent' : '#FFFFFF', 
        borderBottom: isTransparent ? 'none' : '1px solid #f0f0f0',
        transition: 'all 0.4s ease',
        zIndex: 1500,
        display: 'flex',
        alignItems: 'center',
      }}>
        
        <Container maxWidth="xl" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
          
          {/* 1. LEFT: LOGO & MOBILE MENU */}
          <Box sx={{ display: 'flex', alignItems: 'center', width: { xs: 'auto', md: '200px' } }}>
            <IconButton 
              onClick={() => setMobileMenuOpen(true)}
              sx={{ 
                display: { xs: 'flex', md: 'none' }, 
                color: iconColor, 
                mr: 1,
                '&:focus': { outline: 'none' }, 
                '& .MuiTouchRipple-root': { color: 'rgba(0,0,0,0.2)' } 
              }}
            >
              {/* 3D STYLISH MENU ICON */}
              <Menu size={24} className={!isTransparent ? "menu-icon-3d" : ""} strokeWidth={2.5} />
            </IconButton>

            {/* LOGO */}
            <Link to="/" style={styles.logo(isTransparent)}>
              OneT
            </Link>
          </Box>

          {/* 2. CENTER: NAVIGATION (Desktop) */}
          <Box sx={{ 
            display: { xs: 'none', md: 'flex' }, 
            gap: 4, 
            position: 'absolute', 
            left: '50%', 
            transform: 'translateX(-50%)',
            alignItems: 'center',
            height: '100%'
          }}>
            <Link to="/products?sort=new" className="nav-link-hover" style={styles.navLink(textColor)}>
              NEW IN
            </Link>
            
            <div 
              onMouseEnter={() => setApparelOpen(true)}
              onMouseLeave={() => setApparelOpen(false)}
              style={{ height: '100%', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            >
              <span className="nav-link-hover" style={styles.navLink(textColor)}>
                APPAREL
              </span>
            </div>

            <Link to="/about" className="nav-link-hover" style={styles.navLink(textColor)}>
              ABOUT
            </Link>
          </Box>

          {/* 3. RIGHT: ICONS */}
          <Box sx={{ 
            width: { xs: 'auto', md: '300px' }, 
            display: 'flex', 
            justifyContent: 'flex-end', 
            alignItems: 'center', 
            gap: { xs: 1.5, md: 3 } 
          }}>
            <IconButton onClick={() => setSearchOpen(true)} sx={{ color: iconColor, p: 1 }}>
              <Search size={18} />
            </IconButton>
            
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
              {session ? (
                <>
                  <Link to="/orders" className="nav-link-hover" style={styles.textButton(textColor)}>ACCOUNT</Link>
                  {isAdmin && (
                    <Link to="/admin" style={{ ...styles.textButton(textColor), border: `1px solid ${textColor}`, padding: '2px 6px' }}>
                      ADMIN
                    </Link>
                  )}
                  <button onClick={onLogout} className="nav-link-hover" style={styles.textButton(textColor)}>LOGOUT</button>
                </>
              ) : (
                <Link to="/login" className="nav-link-hover" style={styles.textButton(textColor)}>LOGIN</Link>
              )}
            </Box>

            <Link to="/cart" style={{ textDecoration: 'none', color: iconColor, position: 'relative' }}>
               <ShoppingBag size={18} />
               {cartItems.length > 0 && (
                 <span style={{ 
                   position: 'absolute', top: -5, right: -8, 
                   background: isTransparent ? '#FFFFFF' : '#000000',
                   color: isTransparent ? '#000000' : '#FFFFFF',
                   fontSize: '9px', fontWeight: 'bold',
                   width: '14px', height: '14px', borderRadius: '50%',
                   display: 'flex', alignItems: 'center', justifyContent: 'center'
                 }}>
                   {cartItems.length}
                 </span>
               )}
            </Link>
          </Box>
        </Container>
      </header>

      {/* --- DESKTOP MEGA MENU --- */}
      <Collapse in={apparelOpen} timeout={300} sx={{ position: 'fixed', top: '95px', left: 0, right: 0, zIndex: 1400 }}>
        <Box 
          onMouseEnter={() => setApparelOpen(true)}
          onMouseLeave={() => setApparelOpen(false)}
          sx={{ backgroundColor: '#fff', borderBottom: '1px solid #eee', padding: '40px 0' }}
        >
          <Container maxWidth="lg">
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 4, md: 15 }, justifyContent: 'center' }}>
              {['TOP WEAR', 'BOTTOM WEAR', 'ACCESSORIES'].map((title, i) => (
                <Box key={title}>
                  <div style={styles.menuHeader}>{title}</div>
                  <div style={styles.menuList}>
                    {i === 0 && ['TSHIRTS', 'HOODIES', 'JACKETS', 'SHIRTS'].map(item => (
                      <Link key={item} to={`/products?cat=${item.toLowerCase()}`} style={styles.menuItem}>{item}</Link>
                    ))}
                    {i === 1 && ['PANTS', 'CARGOS', 'SHORTS'].map(item => (
                      <Link key={item} to={`/products?cat=${item.toLowerCase()}`} style={styles.menuItem}>{item}</Link>
                    ))}
                    {i === 2 && ['CAPS', 'BAGS', 'JEWELRY'].map(item => (
                      <Link key={item} to={`/products?cat=${item.toLowerCase()}`} style={styles.menuItem}>{item}</Link>
                    ))}
                  </div>
                </Box>
              ))}
            </Box>
          </Container>
        </Box>
      </Collapse>

      {/* --- SEARCH --- */}
      <Drawer anchor="top" open={searchOpen} onClose={() => setSearchOpen(false)} PaperProps={{ sx: { height: '50vh', backgroundColor: '#fff', zIndex: 2000 } }} sx={{ zIndex: 2000 }}>
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <IconButton onClick={() => setSearchOpen(false)} sx={{ position: 'absolute', top: 20, right: 20, color: 'black' }}><X size={24} /></IconButton>
          <Input 
            autoFocus fullWidth disableUnderline placeholder="SEARCH" 
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyPress={handleSearch} 
            sx={{ fontSize: '2rem', fontWeight: 600, textAlign: 'center', borderBottom: '1px solid #000', width: '80%', maxWidth: 600, '& input': { textAlign: 'center' } }} 
          />
        </Box>
      </Drawer>

      {/* --- MOBILE DRAWER (UPDATED) --- */}
      <Drawer anchor="left" open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} PaperProps={{ sx: { width: '85%', maxWidth: '300px' } }} sx={{ zIndex: 1600 }}>
        <Box sx={{ p: 4 }}>
          {/* Logo & Close Button */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Link to="/" style={{...styles.logo(false), color: 'black'}} onClick={() => setMobileMenuOpen(false)}>OneT</Link>
            <IconButton onClick={() => setMobileMenuOpen(false)} sx={{ color: '#000' }}><X size={24} /></IconButton>
          </Box>
          
          <List>
            <ListItem button component={Link} to="/products?sort=new" onClick={() => setMobileMenuOpen(false)}>
              <ListItemText primary="NEW IN" primaryTypographyProps={styles.mobileLink} />
            </ListItem>
            
            {/* 🟢 MOBILE APPAREL DROPDOWN */}
            <ListItem button onClick={() => setMobileApparelOpen(!mobileApparelOpen)} sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <ListItemText primary="APPAREL" primaryTypographyProps={styles.mobileLink} />
              {mobileApparelOpen ? <ChevronUp size={20} color="black" /> : <ChevronDown size={20} color="black" />}
            </ListItem>
            
            <Collapse in={mobileApparelOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding sx={{ pl: 2, borderLeft: '2px solid #eee' }}>
                {['TSHIRTS', 'HOODIES', 'JACKETS', 'PANTS', 'CARGOS', 'ACCESSORIES'].map((item) => (
                  <ListItem key={item} button component={Link} to={`/products?cat=${item.toLowerCase()}`} onClick={() => setMobileMenuOpen(false)} sx={{ py: 0.5 }}>
                    <ListItemText primary={item} primaryTypographyProps={styles.mobileSubLink} />
                  </ListItem>
                ))}
              </List>
            </Collapse>

            <ListItem button component={Link} to="/about" onClick={() => setMobileMenuOpen(false)}>
              <ListItemText primary="ABOUT" primaryTypographyProps={styles.mobileLink} />
            </ListItem>

            <ListItem button component={Link} to="/contact" onClick={() => setMobileMenuOpen(false)}>
              <ListItemText primary="CONTACT" primaryTypographyProps={styles.mobileLink} />
            </ListItem>
            
            {session ? (
              <ListItem button onClick={onLogout}><LogOut size={18} style={{ marginRight: 10, color: 'black' }} /> 
                <ListItemText primary="LOGOUT" primaryTypographyProps={styles.mobileLink} />
              </ListItem>
            ) : (
              <ListItem button component={Link} to="/login"><User size={18} style={{ marginRight: 10, color: 'black' }} /> 
                <ListItemText primary="LOGIN" primaryTypographyProps={styles.mobileLink} />
              </ListItem>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
}

const styles = {
  logo: (isTransparent) => ({
    fontSize: '20px', 
    fontWeight: 800,
    letterSpacing: '-0.5px',
    textDecoration: 'none',
    textTransform: 'uppercase',
    color: isTransparent ? '#FFFFFF' : '#000000', 
    transition: 'color 0.3s ease',
  }),
  
  navLink: (color) => ({
    fontSize: '10px', 
    fontWeight: 600,
    color: color,
    textDecoration: 'none',
    letterSpacing: '1px',
    textTransform: 'uppercase'
  }),
  textButton: (color) => ({
    background: 'none',
    border: 'none',
    fontSize: '10px',
    fontWeight: 600,
    color: color,
    cursor: 'pointer',
    textDecoration: 'none',
    letterSpacing: '0.5px',
    textTransform: 'uppercase'
  }),
  menuHeader: { fontSize: '10px', fontWeight: 700, color: '#888', marginBottom: '20px', letterSpacing: '1px', textTransform: 'uppercase' },
  menuList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  menuItem: { fontSize: '12px', fontWeight: 500, color: '#333', textDecoration: 'none', letterSpacing: '0.5px', transition: '0.2s', '&:hover': { color: '#000', paddingLeft: '5px' } },
  
  // 🟢 UPDATED MOBILE LINK STYLE (Black, 3D Effect)
  mobileLink: { 
    fontWeight: 900, 
    fontSize: '18px', 
    letterSpacing: '1px', 
    color: '#000', // Forces Black color
    textTransform: 'uppercase',
    fontFamily: 'Assistant, sans-serif',
    textShadow: '1px 1px 0px rgba(0,0,0,0.1)' // Subtle 3D Effect
  },
  
  mobileSubLink: { fontWeight: 600, fontSize: '12px', letterSpacing: '1px', color: '#555', textTransform: 'uppercase' }
};