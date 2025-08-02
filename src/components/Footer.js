import React, { useEffect, useState } from "react";
import { FaInstagram, FaLinkedin, FaPhoneAlt } from "react-icons/fa";

// ✅ Styles
const footerWrapper = {
  position: "relative",
  overflow: "hidden",
};

const footerStyle = {
  background: "rgba(30, 30, 47, 0.7)", // ✅ Glassmorphism transparency
  backdropFilter: "blur(15px)", // ✅ Frosted glass effect
  borderTop: "1px solid rgba(255, 255, 255, 0.2)",
  color: "#fff",
  padding: "40px 20px",
  textAlign: "center",
  marginTop: "50px",
  animation: "gradientShift 10s ease infinite",
  opacity: 0,
  transform: "translateY(30px)",
  transition: "opacity 1.2s ease-out, transform 1.2s ease-out",
};

const iconContainer = {
  display: "flex",
  justifyContent: "center",
  gap: "15px",
  marginTop: "10px",
};

const iconStyle = {
  fontSize: "30px",
  color: "#fff",
  transition: "transform 0.4s ease, color 0.3s ease",
  cursor: "pointer",
};

const linkStyle = {
  color: "#fff",
  textDecoration: "none",
  position: "relative",
  fontWeight: "500",
};

const linkHover = {
  position: "absolute",
  content: "''",
  width: "100%",
  height: "2px",
  background: "linear-gradient(90deg, #ff6600, #ffcc00)",
  bottom: "-5px",
  left: "0",
  transform: "scaleX(0)",
  transformOrigin: "right",
  transition: "transform 0.3s ease",
};

const footerBottom = {
  marginTop: "20px",
  fontSize: "14px",
  borderTop: "1px solid rgba(255, 255, 255, 0.2)",
  paddingTop: "10px",
};

// ✅ Floating particles
const particleStyle = {
  position: "absolute",
  width: "8px",
  height: "8px",
  background: "rgba(255,255,255,0.3)",
  borderRadius: "50%",
  animation: "float 8s infinite ease-in-out",
};

// ✅ Inject Keyframes (particles + gradient)
const injectKeyframes = () => {
  if (document.getElementById("footer-keyframes")) return;
  const styleSheet = document.createElement("style");
  styleSheet.id = "footer-keyframes";
  styleSheet.innerHTML = `
    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes float {
      0% { transform: translateY(0) scale(1); opacity: 0.6; }
      50% { transform: translateY(-20px) scale(1.2); opacity: 1; }
      100% { transform: translateY(0) scale(1); opacity: 0.6; }
    }
  `;
  document.head.appendChild(styleSheet);
};

export default function Footer() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    injectKeyframes();
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  // ✅ Create floating particles (random positions)
  const particles = Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 8}s`,
  }));

  return (
    <div style={footerWrapper}>
      {/* ✅ Floating Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            ...particleStyle,
            top: p.top,
            left: p.left,
            animationDelay: p.animationDelay,
          }}
        />
      ))}

      {/* ✅ Footer Content */}
      <footer
        style={{
          ...footerStyle,
          opacity: isLoaded ? 1 : 0,
          transform: isLoaded ? "translateY(0px)" : "translateY(30px)",
        }}
      >
        <h2>🛍 MyStore</h2>
        <p>Best products at the best prices – always for you!</p>

        {/* ✅ Social Icons */}
        <div style={iconContainer}>
          <a href="https://instagram.com" target="_blank" rel="noreferrer">
            <FaInstagram
              style={iconStyle}
              onMouseEnter={(e) => {
                e.target.style.color = "#E1306C";
                e.target.style.transform = "rotateY(15deg) rotateX(10deg) scale(1.2)";
              }}
              onMouseLeave={(e) => {
                e.target.style.color = "#fff";
                e.target.style.transform = "rotateY(0deg) rotateX(0deg) scale(1)";
              }}
            />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noreferrer">
            <FaLinkedin
              style={iconStyle}
              onMouseEnter={(e) => {
                e.target.style.color = "#0077B5";
                e.target.style.transform = "rotateY(-15deg) rotateX(10deg) scale(1.2)";
              }}
              onMouseLeave={(e) => {
                e.target.style.color = "#fff";
                e.target.style.transform = "rotateY(0deg) rotateX(0deg) scale(1)";
              }}
            />
          </a>
        </div>

        {/* ✅ Contact Info */}
        <p style={{ marginTop: "10px" }}>
          <FaPhoneAlt /> +91 98765 43210 | 📧 support@mystore.com
        </p>

        {/* ✅ Glowing Links */}
        <div style={{ marginTop: "20px" }}>
          <a
            href="/about"
            style={linkStyle}
            onMouseEnter={(e) => {
              const glow = document.createElement("span");
              glow.style.cssText = `
                ${Object.entries(linkHover)
                  .map(([k, v]) => `${k}:${v}`)
                  .join(";")};
                transform: scaleX(1);
                transform-origin: left;
              `;
              e.target.appendChild(glow);
            }}
            onMouseLeave={(e) => {
              if (e.target.lastChild) e.target.removeChild(e.target.lastChild);
            }}
          >
            About Us
          </a>{" "}
          |{" "}
          <a
            href="/contact"
            style={linkStyle}
            onMouseEnter={(e) => {
              const glow = document.createElement("span");
              glow.style.cssText = `
                ${Object.entries(linkHover)
                  .map(([k, v]) => `${k}:${v}`)
                  .join(";")};
                transform: scaleX(1);
                transform-origin: left;
              `;
              e.target.appendChild(glow);
            }}
            onMouseLeave={(e) => {
              if (e.target.lastChild) e.target.removeChild(e.target.lastChild);
            }}
          >
            Contact
          </a>
        </div>

        {/* ✅ Footer Bottom */}
        <div style={footerBottom}>
          <p>© {new Date().getFullYear()} MyStore. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
