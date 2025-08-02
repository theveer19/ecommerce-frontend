import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";
import { motion } from "framer-motion";
import {
  FaShoppingCart,
  FaHome,
  FaBoxOpen,
  FaUserShield,
  FaSignOutAlt,
  FaBars,
} from "react-icons/fa";

export default function Navbar({ userRole }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isShrunk, setIsShrunk] = useState(false);

  // ✅ Shrink navbar on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsShrunk(true);
      } else {
        setIsShrunk(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      await supabase.auth.signOut();
      navigate("/");
    }
  };

  return (
    <motion.nav
      animate={{
        height: isShrunk ? "60px" : "80px",
      }}
      transition={{ duration: 0.3 }}
      style={styles.navbar}
    >
      {/* ✅ Animated gradient background overlay */}
      <div style={styles.gradientOverlay}></div>

      {/* ✅ Logo */}
      <motion.h2
        whileHover={{ scale: 1.1, rotateX: 10 }}
        style={styles.logo}
      >
        🛍️ One-T
      </motion.h2>

      {/* ✅ Hamburger Menu (Mobile) */}
      <div style={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
        <FaBars size={26} style={styles.icon3D} />
      </div>

      {/* ✅ Menu Items */}
      <ul style={{ ...styles.navLinks, ...(menuOpen ? styles.showMenu : {}) }}>
        {[
          { to: "/products", icon: <FaHome />, label: "Home" },
          { to: "/cart", icon: <FaShoppingCart />, label: "Cart" },
          { to: "/orders", icon: <FaBoxOpen />, label: "Orders" },
        ].map((item, index) => (
          <motion.li
            key={index}
            style={styles.navItem}
            whileHover={{ scale: 1.1, rotateY: 10 }}
          >
            <Link to={item.to} style={styles.link}>
              {item.icon} {item.label}
            </Link>
          </motion.li>
        ))}

        {userRole === "admin" && (
          <motion.li
            style={styles.navItem}
            whileHover={{ scale: 1.1, rotateY: 10 }}
          >
            <Link to="/admin" style={styles.link}>
              <FaUserShield /> Admin
            </Link>
          </motion.li>
        )}

        <motion.li
          style={styles.navItem}
          whileHover={{ scale: 1.1, rotateY: 10 }}
        >
          <button onClick={handleLogout} style={styles.logoutBtn}>
            <FaSignOutAlt /> Logout
          </button>
        </motion.li>
      </ul>
    </motion.nav>
  );
}

const styles = {
  navbar: {
    position: "sticky",
    top: "0",
    zIndex: "1000",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 2rem",
    borderRadius: "15px",
    margin: "10px",
    overflow: "hidden",
    boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
    backdropFilter: "blur(10px)",
  },

  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background:
      "linear-gradient(270deg, #ff4e50, #f9d423, #24c6dc, #514a9d)",
    backgroundSize: "600% 600%",
    animation: "gradientAnimation 15s ease infinite",
    zIndex: "-1",
    opacity: "0.9",
  },

  logo: {
    color: "#fff",
    fontSize: "2rem",
    fontWeight: "900",
    textShadow: "2px 2px 8px rgba(0,0,0,0.4)",
    cursor: "pointer",
  },

  hamburger: {
    display: "none",
    cursor: "pointer",
  },

  navLinks: {
    listStyle: "none",
    display: "flex",
    gap: "1.5rem",
    margin: 0,
    padding: 0,
    transition: "all 0.3s ease-in-out",
  },

  showMenu: {
    display: "block",
    position: "absolute",
    top: "80px",
    left: "0",
    background: "rgba(0,0,0,0.8)",
    width: "100%",
    textAlign: "center",
    padding: "1rem 0",
  },

  navItem: {
    display: "flex",
    alignItems: "center",
  },

  link: {
    color: "#fff",
    textDecoration: "none",
    fontSize: "1.2rem",
    fontWeight: "600",
    transition: "transform 0.3s ease, text-shadow 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  logoutBtn: {
    background: "transparent",
    border: "none",
    color: "#ffdddd",
    fontSize: "1.2rem",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  icon3D: {
    filter: "drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.4))",
    transition: "transform 0.3s ease",
  },
};
