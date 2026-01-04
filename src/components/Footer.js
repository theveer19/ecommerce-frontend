import React from "react";
import { Link } from "react-router-dom"; 
import { Box, Container, Grid, Typography, InputBase, IconButton, Divider } from "@mui/material";
// 1. Import Linkedin
import { Instagram, Facebook, Mail, ArrowRight, Linkedin } from "lucide-react";

export default function Footer() {
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    alert("Subscribed!");
  };

  // 2. Added LinkedIn to the list
  const socialLinks = [
    { icon: Instagram, path: "https://instagram.com", label: "Instagram" },
    { icon: Facebook, path: "https://facebook.com", label: "Facebook" },
    { icon: Linkedin, path: "https://linkedin.com", label: "LinkedIn" },
    { icon: Mail, path: "mailto:hello@onet.com", label: "Email" }
  ];

  const shopLinks = [
    { text: 'New Arrivals', path: '/products?sort=new' },
    { text: 'Best Sellers', path: '/products' },
    { text: 'Apparel', path: '/products?cat=tshirts' },
    { text: 'Accessories', path: '/products?cat=accessories' },
    { text: 'Sale', path: '/products?sort=price-low' }
  ];

  const helpLinks = [
    { text: 'Track Order', path: '/orders' },
    { text: 'Returns', path: '/contact' },
    { text: 'Shipping Info', path: '/contact' },
    { text: 'Size Guide', path: '/contact' },
    { text: 'Contact Us', path: '/contact' }
  ];

  return (
    <Box sx={styles.footerWrapper}>
      <style>{`
        .hover-lift { transition: transform 0.3s ease, color 0.3s ease; }
        .hover-lift:hover { transform: translateY(-3px); color: #fff !important; }
      `}</style>

      <Container maxWidth="xl" sx={{ px: { xs: 4, md: 8 }, pt: 8, pb: 4 }}>
        
        <Grid container spacing={6}>
          
          {/* 1. BRAND COLUMN */}
          <Grid item xs={12} md={4}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <Typography variant="h2" sx={styles.brandLogo}>OneT</Typography>
            </Link>
            <Typography sx={styles.brandDesc}>
              Extension of your expression. Timeless elegance meets modern sensibility in a digital-first era.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              {socialLinks.map((item, i) => (
                <IconButton 
                  key={i} 
                  sx={styles.socialBtn}
                  component="a"
                  href={item.path}
                  target={item.path.startsWith('http') ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  aria-label={item.label}
                >
                  <item.icon size={18} />
                </IconButton>
              ))}
            </Box>
          </Grid>

          {/* 2. LINKS: SHOP */}
          <Grid item xs={6} md={2}>
            <Typography sx={styles.colHeader}>SHOP</Typography>
            <Box sx={styles.linkStack}>
              {shopLinks.map((item) => (
                <Link key={item.text} to={item.path} style={{ textDecoration: 'none' }}>
                  <Typography className="hover-lift" sx={styles.link}>
                    {item.text}
                  </Typography>
                </Link>
              ))}
            </Box>
          </Grid>

          {/* 3. LINKS: HELP */}
          <Grid item xs={6} md={2}>
            <Typography sx={styles.colHeader}>HELP</Typography>
            <Box sx={styles.linkStack}>
              {helpLinks.map((item) => (
                <Link key={item.text} to={item.path} style={{ textDecoration: 'none' }}>
                  <Typography className="hover-lift" sx={styles.link}>
                    {item.text}
                  </Typography>
                </Link>
              ))}
            </Box>
          </Grid>

          {/* 4. NEWSLETTER */}
          <Grid item xs={12} md={4}>
            <Typography sx={styles.colHeader}>STAY IN THE LOOP</Typography>
            <Typography sx={{ color: '#888', fontSize: '13px', mb: 2, lineHeight: 1.6 }}>
              Sign up for exclusive drops, early access, and insider events.
            </Typography>
            
            <form onSubmit={handleNewsletterSubmit}>
              <Box sx={styles.inputWrapper}>
                <InputBase 
                  placeholder="Enter your email" 
                  sx={styles.input} 
                  type="email" 
                  required
                />
                <IconButton type="submit" sx={styles.submitBtn}>
                  <ArrowRight color="black" size={18} />
                </IconButton>
              </Box>
            </form>
          </Grid>

        </Grid>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mt: 8, mb: 4 }} />

        {/* BOTTOM BAR */}
        <Box sx={styles.bottomBar}>
          <Typography sx={{ fontSize: '12px', color: '#666', fontWeight: 500 }}>
            © {new Date().getFullYear()} OneT STUDIOS.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            {['Privacy Policy', 'Terms of Service', 'Cookies'].map((text) => (
              <Link key={text} to="/contact" style={{ textDecoration: 'none' }}>
                <Typography sx={styles.legalLink}>
                  {text}
                </Typography>
              </Link>
            ))}
          </Box>
        </Box>

      </Container>
    </Box>
  );
}

const styles = {
  footerWrapper: {
    bgcolor: '#000000',
    color: '#ffffff',
    borderTop: '1px solid #222',
    position: 'relative',
    overflow: 'hidden'
  },
  brandLogo: {
    fontSize: '42px',
    fontWeight: 900,
    letterSpacing: '-2px',
    color: 'white',
    mb: 2,
    lineHeight: 1,
    cursor: 'pointer'
  },
  brandDesc: {
    fontSize: '14px',
    color: '#888',
    lineHeight: 1.6,
    maxWidth: '300px'
  },
  socialBtn: {
    color: 'white',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    width: 40, height: 40,
    transition: 'all 0.3s ease',
    '&:hover': {
      bgcolor: 'white',
      color: 'black',
      transform: 'translateY(-3px)'
    }
  },
  colHeader: {
    fontSize: '13px',
    fontWeight: 800,
    letterSpacing: '1px',
    color: 'white',
    mb: 3,
    textTransform: 'uppercase'
  },
  linkStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1.5
  },
  link: {
    fontSize: '14px',
    color: '#999',
    fontWeight: 500,
    cursor: 'pointer'
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    bgcolor: 'rgba(255,255,255,0.1)',
    borderRadius: '4px',
    p: 0.5,
    pl: 2,
    transition: 'bgcolor 0.3s',
    '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' }
  },
  input: {
    flex: 1,
    fontSize: '14px',
    color: 'white',
    'input::placeholder': { color: '#888' }
  },
  submitBtn: {
    bgcolor: 'white',
    borderRadius: '4px',
    width: 36, height: 36,
    '&:hover': { bgcolor: '#e0e0e0' }
  },
  bottomBar: {
    display: 'flex',
    flexDirection: { xs: 'column', md: 'row' },
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 2
  },
  legalLink: {
    fontSize: '12px',
    color: '#666',
    transition: 'color 0.2s',
    '&:hover': { color: 'white' }
  }
};