import React, { useState } from "react";
import { Box, Container, Grid, Typography, TextField, Button, Snackbar, Alert } from "@mui/material";
import { Mail, MapPin, Phone, ArrowRight, Instagram, Facebook} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [open, setOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    console.log("Form Submitted:", formData);
    setOpen(true);
    setFormData({ name: '', email: '', message: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Box sx={styles.pageWrapper}>
      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-up { animation: fadeIn 0.8s ease-out forwards; opacity: 0; }
        .delay-1 { animation-delay: 0.2s; }
        .delay-2 { animation-delay: 0.4s; }
      `}</style>

      <Container maxWidth="xl" sx={{ px: { xs: 3, md: 8 }, py: 12 }}>
        
        {/* PAGE HEADER */}
        <Box sx={{ mb: 8, textAlign: 'center' }} className="animate-up">
          <Typography variant="h1" sx={styles.pageTitle}>GET IN TOUCH</Typography>
          <Typography sx={styles.pageSubtitle}>WE'D LOVE TO HEAR FROM YOU</Typography>
        </Box>

        <Grid container spacing={8}>
          
          {/* LEFT: CONTACT INFO (Editorial Style) */}
          <Grid item xs={12} md={5} className="animate-up delay-1">
            <Box sx={styles.infoBox}>
              <Typography sx={styles.sectionHeader}>CUSTOMER CARE</Typography>
              <Typography sx={styles.descText}>
                Our team is available Monday – Friday, 9am – 6pm IST. <br/>
                We aim to respond to all inquiries within 24 hours.
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, mt: 6 }}>
                
                {/* Email */}
                <Box sx={styles.contactItem}>
                  <Box sx={styles.iconCircle}><Mail size={18} /></Box>
                  <Box>
                    <Typography sx={styles.contactLabel}>EMAIL US</Typography>
                    <Typography component="a" href="mailto:hello@onet.com" sx={styles.contactLink}>
                      hello@onet.com
                    </Typography>
                  </Box>
                </Box>

                {/* Location */}
                <Box sx={styles.contactItem}>
                  <Box sx={styles.iconCircle}><MapPin size={18} /></Box>
                  <Box>
                    <Typography sx={styles.contactLabel}>HQ</Typography>
                    <Typography sx={styles.contactValue}>
                      Gwalior, Madhya Pradesh <br/> India
                    </Typography>
                  </Box>
                </Box>

                {/* Socials */}
                <Box sx={{ mt: 2 }}>
                  <Typography sx={styles.contactLabel}>FOLLOW US</Typography>
                  <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                    <Button startIcon={<Instagram size={16} />} sx={styles.socialBtn} href="https://instagram.com" target="_blank">
                      INSTAGRAM
                    </Button>
                    <Button startIcon={<Facebook size={16} />} sx={styles.socialBtn} href="https://facebook.com" target="_blank">
                      FACEBOOK
                    </Button>
                    <Button startIcon={<linkedin size={16} />} sx={styles.socialBtn} href="https://linkedin.com" target="_blank">
                      LINKEDIN
                    </Button>
                  </Box>
                </Box>

              </Box>
            </Box>
          </Grid>

          {/* RIGHT: CONTACT FORM */}
          <Grid item xs={12} md={7} className="animate-up delay-2">
            <Box component="form" onSubmit={handleSubmit} sx={styles.formBox}>
              <Grid container spacing={4}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="YOUR NAME"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    variant="standard"
                    InputLabelProps={{ sx: styles.inputLabel }}
                    InputProps={{ sx: styles.input }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="EMAIL ADDRESS"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    variant="standard"
                    InputLabelProps={{ sx: styles.inputLabel }}
                    InputProps={{ sx: styles.input }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="MESSAGE"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    multiline
                    rows={4}
                    variant="standard"
                    InputLabelProps={{ sx: styles.inputLabel }}
                    InputProps={{ sx: styles.input }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button 
                    type="submit" 
                    fullWidth 
                    variant="contained" 
                    endIcon={<ArrowRight />}
                    sx={styles.submitBtn}
                  >
                    SEND MESSAGE
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Grid>

        </Grid>
      </Container>

      {/* Success Notification */}
      <Snackbar open={open} autoHideDuration={4000} onClose={() => setOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" sx={{ bgcolor: 'black', color: 'white', borderRadius: 0 }}>
          MESSAGE SENT SUCCESSFULLY
        </Alert>
      </Snackbar>
    </Box>
  );
}

const styles = {
  pageWrapper: {
    bgcolor: '#ffffff',
    minHeight: '100vh',
    pt: 8
  },
  pageTitle: {
    fontSize: { xs: '42px', md: '80px' },
    fontWeight: 900,
    letterSpacing: '-2px',
    lineHeight: 0.9,
    mb: 2,
    color: 'black'
  },
  pageSubtitle: {
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '2px',
    color: '#888'
  },
  // Left Column
  infoBox: {
    pr: { md: 8 },
    borderRight: { md: '1px solid #f0f0f0' },
    height: '100%'
  },
  sectionHeader: {
    fontSize: '18px',
    fontWeight: 800,
    letterSpacing: '1px',
    mb: 2
  },
  descText: {
    fontSize: '14px',
    color: '#666',
    lineHeight: 1.6
  },
  contactItem: {
    display: 'flex',
    gap: 3,
    alignItems: 'flex-start'
  },
  iconCircle: {
    width: 40, height: 40,
    borderRadius: '50%',
    border: '1px solid #eee',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'black'
  },
  contactLabel: {
    fontSize: '10px',
    fontWeight: 800,
    color: '#999',
    letterSpacing: '1px',
    mb: 0.5
  },
  contactValue: {
    fontSize: '14px',
    fontWeight: 600,
    color: 'black'
  },
  contactLink: {
    fontSize: '14px',
    fontWeight: 600,
    color: 'black',
    textDecoration: 'none',
    borderBottom: '1px solid black',
    pb: 0.2,
    transition: 'opacity 0.2s',
    '&:hover': { opacity: 0.6 }
  },
  socialBtn: {
    color: 'black',
    borderColor: '#e0e0e0',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '1px',
    px: 2,
    '&:hover': { bgcolor: '#f5f5f5' }
  },
  // Right Column (Form)
  formBox: {
    bgcolor: '#fff',
    pl: { md: 4 }
  },
  inputLabel: {
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '1px',
    color: '#999',
    '&.Mui-focused': { color: 'black' }
  },
  input: {
    fontSize: '14px',
    fontWeight: 600,
    color: 'black',
    pb: 1,
    '&:before': { borderBottom: '1px solid #eee' },
    '&:after': { borderBottom: '2px solid black' },
    '&:hover:not(.Mui-disabled):before': { borderBottom: '1px solid #999' }
  },
  submitBtn: {
    mt: 4,
    bgcolor: 'black',
    color: 'white',
    borderRadius: 0,
    py: 2,
    fontSize: '12px',
    fontWeight: 800,
    letterSpacing: '2px',
    boxShadow: 'none',
    '&:hover': {
      bgcolor: '#333',
      boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
    }
  }
};