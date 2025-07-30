import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { supabase } from '../supabase/supabaseClient';
import { FiShoppingCart, FiLogOut } from 'react-icons/fi'; // For icons

const Navbar = ({ userRole }) => {
  const { cartItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.left}>
        <Link to="/" style={styles.brand}>🛍️ One-T</Link>
        <Link to="/products" style={styles.link}>Products</Link>
        <Link to="/orders" style={styles.link}>My Orders</Link>

        {userRole === 'admin' && (
          <div style={styles.adminMenu}>
            <span style={styles.adminLabel}>Admin</span>
            <Link to="/admin" style={styles.link}>Dashboard</Link>
            <Link to="/admin/orders" style={styles.link}>Orders</Link>
            <Link to="/admin/products" style={styles.link}>Products</Link>
            <Link to="/admin/users" style={styles.link}>Users</Link>
          </div>
        )}
      </div>

      <div style={styles.right}>
        <Link to="/cart" style={styles.cartLink}>
          <FiShoppingCart size={20} />
          <span style={styles.cartCount}>{cartItems.length}</span>
        </Link>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          <FiLogOut size={16} /> Logout
        </button>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 24px',
    background: '#ffffff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    position: 'sticky',
    top: 0,
    zIndex: 999,
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
  },
  brand: {
    fontWeight: 'bold',
    fontSize: '20px',
    textDecoration: 'none',
    color: '#1f2937',
  },
  link: {
    textDecoration: 'none',
    color: '#374151',
    fontSize: '16px',
    transition: 'color 0.2s',
  },
  cartLink: {
    position: 'relative',
    color: '#1f2937',
    textDecoration: 'none',
    marginRight: '20px',
  },
  cartCount: {
    position: 'absolute',
    top: '-6px',
    right: '-10px',
    background: '#ef4444',
    color: '#fff',
    borderRadius: '50%',
    padding: '2px 6px',
    fontSize: '12px',
  },
  logoutBtn: {
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  adminMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginLeft: '20px',
    borderLeft: '1px solid #ddd',
    paddingLeft: '12px',
  },
  adminLabel: {
    fontWeight: 'bold',
    color: '#6b7280',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
  },
};

export default Navbar;
