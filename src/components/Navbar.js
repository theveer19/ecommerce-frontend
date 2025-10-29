import React from "react";
import { useNavigate } from "react-router-dom";
import { FaGem, FaShoppingCart } from "react-icons/fa";
import { useCart } from "../context/CartContext";

export default function Navbar({ userRole, session, onLogout }) {
  const navigate = useNavigate();
  const { cartItems, getCartCount } = useCart();
  
  const count = getCartCount ? getCartCount() : cartItems.reduce((total, item) => total + (item.quantity || 1), 0);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleHomeClick = () => {
    navigate("/products");
  };

  const handleSignIn = () => {
    navigate("/");
  };

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  return (
    <header style={headerStyle}>
      <div className="nav-container" style={navContainerStyle}>
        {/* Logo */}
        <div
          className="logo"
          onClick={handleHomeClick}
          aria-label="Go to home"
          style={logoStyle}
        >
          <span style={{ color: "#22c55e", fontSize: 22, display: 'flex', alignItems: 'center' }}>
            <FaGem />
          </span>
          <span style={{ marginLeft: '8px' }}>OneT</span>
        </div>

        {/* Navigation Links */}
        <nav className="nav-links" role="navigation" aria-label="Main navigation" style={navLinksStyle}>
          <button 
            onClick={() => handleNavigation("/products")} 
            aria-label="Products"
            style={navButtonStyle}
          >
            Products
          </button>
          <button 
            onClick={() => handleNavigation("/deals")} 
            aria-label="Deals"
            style={navButtonStyle}
          >
            Deals
          </button>
          <button 
            onClick={() => handleNavigation("/categories")} 
            aria-label="Categories"
            style={navButtonStyle}
          >
            Categories
          </button>
          <button 
            onClick={() => handleNavigation("/about")} 
            aria-label="About"
            style={navButtonStyle}
          >
            About
          </button>
        </nav>

        {/* Navigation Actions */}
        <div className="nav-actions" style={navActionsStyle}>
          {/* Cart Icon */}
          <div 
            className="cart-icon" 
            onClick={() => handleNavigation("/cart")} 
            role="button" 
            aria-label="Open cart"
            style={cartIconStyle}
          >
            <FaShoppingCart />
            {count > 0 && (
              <span className="cart-count" aria-hidden="true" style={cartCountStyle}>
                {count > 99 ? '99+' : count}
              </span>
            )}
          </div>

          {/* Conditional Sign In / Logout */}
          {session ? (
            <button 
              className="btn-secondary" 
              onClick={handleLogout}
              style={signInButtonStyle}
            >
              Logout
            </button>
          ) : (
            <button 
              className="btn-secondary" 
              onClick={handleSignIn}
              style={signInButtonStyle}
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

// Inline styles
const headerStyle = {
  position: 'sticky',
  top: 0,
  zIndex: 9999,
  pointerEvents: 'auto',
  background: 'rgba(10, 15, 31, 0.95)',
  backdropFilter: 'blur(10px)',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  padding: '15px 0',
  width: '100%',
};

const navContainerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '12px',
  maxWidth: '1400px',
  margin: '0 auto',
  padding: '0 20px',
};

const logoStyle = {
  fontSize: '28px',
  fontWeight: '700',
  background: 'linear-gradient(45deg, #22c55e, #3b82f6)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  cursor: 'pointer',
  userSelect: 'none',
};

const navLinksStyle = {
  display: 'flex',
  gap: '30px',
  alignItems: 'center',
  flexWrap: 'wrap',
};

const navButtonStyle = {
  background: 'transparent',
  border: 'none',
  color: '#f8fafc',
  fontWeight: '500',
  transition: 'all 0.3s ease',
  position: 'relative',
  padding: '6px 0',
  cursor: 'pointer',
  fontSize: '16px',
  fontFamily: 'inherit',
};

const navActionsStyle = {
  display: 'flex',
  gap: '20px',
  alignItems: 'center',
};

const cartIconStyle = {
  position: 'relative',
  fontSize: '1.5rem',
  cursor: 'pointer',
  color: '#fff',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px',
  borderRadius: '8px',
  transition: 'background-color 0.3s ease',
};

const cartCountStyle = {
  position: 'absolute',
  top: '-8px',
  right: '-8px',
  background: 'linear-gradient(45deg, #ef4444, #f59e0b)',
  color: 'white',
  minWidth: '20px',
  height: '20px',
  borderRadius: '50%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '0.7rem',
  fontWeight: '700',
  padding: '0 4px',
};

const signInButtonStyle = {
  background: 'rgba(17,25,40,0.85)',
  border: '1px solid rgba(34,197,94,0.3)',
  color: 'white',
  padding: '10px 20px',
  borderRadius: '10px',
  cursor: 'pointer',
  fontWeight: '600',
  transition: 'all 0.3s ease-in-out',
  fontSize: '16px',
  fontFamily: 'inherit',
};