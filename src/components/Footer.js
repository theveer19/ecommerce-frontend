import React from "react";
import { Instagram, Facebook, Twitter, Mail } from "lucide-react";

export default function AtelierFooter() {
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter subscription logic here
    console.log("Newsletter subscription submitted");
    alert("Thank you for subscribing!");
  };

  return (
    <footer style={styles.footer}>
      {/* Main Footer */}
      <div style={styles.container}>
        <div style={styles.grid}>
          {/* Brand Column */}
          <div style={styles.column}>
            <h3 style={styles.logo}>
              <a href="/" style={styles.logoLink}>ATELIER</a>
            </h3>
            <p style={styles.description}>
              Timeless elegance meets modern sensibility. Discover sustainably-crafted pieces for the contemporary wardrobe.
            </p>
            <div style={styles.socialLinks}>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={styles.socialButton}
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={styles.socialButton}
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={styles.socialButton}
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a 
                href="mailto:hello@atelier.com" 
                style={styles.socialButton}
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Shop Column */}
          <div style={styles.column}>
            <h4 style={styles.columnTitle}>Shop</h4>
            <ul style={styles.list}>
              <li style={styles.listItem}>
                <a href="/shop/women" style={styles.link}>Women</a>
              </li>
              <li style={styles.listItem}>
                <a href="/shop/accessories" style={styles.link}>Accessories</a>
              </li>
              <li style={styles.listItem}>
                <a href="/shop/unisex" style={styles.link}>Unisex</a>
              </li>
              <li style={styles.listItem}>
                <a href="/shop/new-arrivals" style={styles.link}>New Arrivals</a>
              </li>
              <li style={styles.listItem}>
                <a href="/shop/sale" style={styles.link}>Sale</a>
              </li>
            </ul>
          </div>

          {/* Customer Service Column */}
          <div style={styles.column}>
            <h4 style={styles.columnTitle}>Customer Service</h4>
            <ul style={styles.list}>
              <li style={styles.listItem}>
                <a href="/contact" style={styles.link}>Contact Us</a>
              </li>
              <li style={styles.listItem}>
                <a href="/shipping-returns" style={styles.link}>Shipping & Returns</a>
              </li>
              <li style={styles.listItem}>
                <a href="/size-guide" style={styles.link}>Size Guide</a>
              </li>
              <li style={styles.listItem}>
                <a href="/faq" style={styles.link}>FAQs</a>
              </li>
              <li style={styles.listItem}>
                <a href="/track-order" style={styles.link}>Track Order</a>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div style={styles.column}>
            <h4 style={styles.columnTitle}>Company</h4>
            <ul style={styles.list}>
              <li style={styles.listItem}>
                <a href="/about" style={styles.link}>About Us</a>
              </li>
              <li style={styles.listItem}>
                <a href="/sustainability" style={styles.link}>Sustainability</a>
              </li>
              <li style={styles.listItem}>
                <a href="/careers" style={styles.link}>Careers</a>
              </li>
              <li style={styles.listItem}>
                <a href="/press" style={styles.link}>Press</a>
              </li>
              <li style={styles.listItem}>
                <a href="/affiliate-program" style={styles.link}>Affiliate Program</a>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div style={styles.column}>
            <h4 style={styles.columnTitle}>Stay Updated</h4>
            <p style={styles.newsletterText}>
              Subscribe to receive updates on new arrivals and exclusive offers.
            </p>
            <form onSubmit={handleNewsletterSubmit} style={styles.newsletterForm}>
              <input 
                type="email" 
                placeholder="Email address"
                style={styles.newsletterInput}
                required
              />
              <button type="submit" style={styles.newsletterButton}>
                →
              </button>
            </form>
            <p style={styles.privacyText}>
              By subscribing you agree to our <a href="/privacy" style={styles.privacyLink}>Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={styles.bottomBar}>
        <div style={styles.container}>
          <div style={styles.bottomContent}>
            <p style={styles.copyright}>
              © {new Date().getFullYear()} ATELIER. All rights reserved.
            </p>
            <div style={styles.legalLinks}>
              <a href="/privacy-policy" style={styles.legalLink}>Privacy Policy</a>
              <span style={styles.separator}>•</span>
              <a href="/terms-of-service" style={styles.legalLink}>Terms of Service</a>
              <span style={styles.separator}>•</span>
              <a href="/cookie-settings" style={styles.legalLink}>Cookie Settings</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    backgroundColor: '#2A2A2A',
    color: '#E0D5C7',
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 24px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '48px',
    padding: '80px 0 60px',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  logo: {
    fontSize: '24px',
    fontWeight: '700',
    letterSpacing: '2px',
    color: '#F5F1E8',
    margin: 0,
  },
  logoLink: {
    color: '#F5F1E8',
    textDecoration: 'none',
    fontFamily: 'inherit',
  },
  description: {
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#A09A8C',
    margin: 0,
  },
  socialLinks: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px',
  },
  socialButton: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'transparent',
    border: '1px solid rgba(224, 213, 199, 0.2)',
    color: '#E0D5C7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textDecoration: 'none',
  },
  columnTitle: {
    fontSize: '14px',
    fontWeight: '600',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    color: '#F5F1E8',
    margin: 0,
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  listItem: {
    margin: 0,
  },
  link: {
    fontSize: '14px',
    color: '#A09A8C',
    textDecoration: 'none',
    transition: 'color 0.3s ease',
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: 'inherit',
  },
  newsletterText: {
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#A09A8C',
    margin: 0,
  },
  newsletterForm: {
    display: 'flex',
    gap: '8px',
    marginTop: '8px',
  },
  newsletterInput: {
    flex: 1,
    padding: '12px 16px',
    backgroundColor: 'transparent',
    border: '1px solid rgba(224, 213, 199, 0.2)',
    color: '#F5F1E8',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit',
  },
  newsletterButton: {
    width: '48px',
    height: '48px',
    backgroundColor: '#8B7355',
    border: 'none',
    color: 'white',
    fontSize: '20px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    fontFamily: 'inherit',
  },
  privacyText: {
    fontSize: '12px',
    color: '#6B6B5A',
    margin: 0,
  },
  privacyLink: {
    color: '#8B7355',
    textDecoration: 'none',
  },
  bottomBar: {
    borderTop: '1px solid rgba(224, 213, 199, 0.1)',
    padding: '24px 0',
  },
  bottomContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  copyright: {
    fontSize: '14px',
    color: '#6B6B5A',
    margin: 0,
  },
  legalLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  legalLink: {
    fontSize: '14px',
    color: '#6B6B5A',
    textDecoration: 'none',
    transition: 'color 0.3s ease',
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  separator: {
    color: '#6B6B5A',
    fontSize: '14px',
  },
};

// Add hover effects and responsive styles
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  [style*="socialButton"]:hover,
  a[style*="socialButton"]:hover {
    background-color: #8B7355 !important;
    border-color: #8B7355 !important;
  }
  
  [style*="link"]:hover,
  a[style*="link"]:hover {
    color: #F5F1E8 !important;
  }
  
  [style*="legalLink"]:hover,
  a[style*="legalLink"]:hover {
    color: #E0D5C7 !important;
  }
  
  [style*="newsletterButton"]:hover {
    background-color: #755F47 !important;
  }
  
  [style*="newsletterInput"]:focus {
    border-color: #8B7355 !important;
  }
  
  [style*="newsletterInput"]::placeholder {
    color: #6B6B5A;
  }
  
  .privacyLink:hover {
    text-decoration: underline !important;
  }
  
  @media (max-width: 1024px) {
    [style*="gridTemplateColumns: 'repeat(5, 1fr)'"] {
      grid-template-columns: repeat(3, 1fr) !important;
    }
  }
  
  @media (max-width: 768px) {
    [style*="gridTemplateColumns: 'repeat(5, 1fr)'"] {
      grid-template-columns: 1fr !important;
    }
    [style*="bottomContent"] {
      flex-direction: column;
      text-align: center;
    }
  }
`;
document.head.appendChild(styleSheet);