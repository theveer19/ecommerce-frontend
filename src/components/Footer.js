// src/components/Footer.js
import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 mt-10">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Logo / About */}
        <div className="footer-column">
          <h2 className="text-2xl font-bold mb-3 text-yellow-400">OneT</h2>
          <p className="text-gray-400">
            Your one-stop shop for all categories. Quality products and amazing deals.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-column">
          <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-gray-400">
            <li><Link to="/" className="hover:text-yellow-400">Home</Link></li>
            <li><Link to="/products" className="hover:text-yellow-400">Products</Link></li>
            <li><Link to="/deals" className="hover:text-yellow-400">Deals</Link></li>
            <li><Link to="/cart" className="hover:text-yellow-400">Cart</Link></li>
          </ul>
        </div>

        {/* Account */}
        <div className="footer-column">
          <h3 className="text-lg font-semibold mb-3">Account</h3>
          <ul className="space-y-2 text-gray-400">
            <li><Link to="/" className="hover:text-yellow-400">Sign In</Link></li>
            <li><Link to="/orders" className="hover:text-yellow-400">Orders</Link></li>
            <li><Link to="/checkout" className="hover:text-yellow-400">Checkout</Link></li>
          </ul>
        </div>

        {/* Social Links */}
        <div className="footer-column">
          <h3 className="text-lg font-semibold mb-3">Follow Us</h3>
          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-yellow-400">Facebook</a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-yellow-400">Instagram</a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-yellow-400">Twitter</a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-yellow-400">LinkedIn</a>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="copyright">
        © {new Date().getFullYear()} OneT. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;