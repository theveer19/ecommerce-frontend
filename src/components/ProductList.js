import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";
import { useCart } from "../context/CartContext";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [adding, setAdding] = useState({});
  const [session, setSession] = useState(null);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const gridRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    
    // Check session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (mounted) setSession(session);
    };
    
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching products:", error);
      } else if (mounted) {
        setProducts(data || []);
      }
    };
    
    checkSession();
    fetchProducts();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    // If nav state requested scroll, do it once after products loaded
    if (location.state?.scrollToGrid && gridRef.current) {
      setTimeout(() => {
        gridRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        // clear the state so reload doesn't scroll again
        navigate(location.pathname, { replace: true, state: {} });
      }, 250);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, location.state]);

  // ✅ ADDED: Authentication check before adding to cart
  const handleAdd = (product, e) => {
    e.stopPropagation(); // Prevent navigation when clicking Add to Cart
    if (!session) {
      alert("Please sign in to add items to cart");
      navigate("/");
      return;
    }
    addToCart({ ...product, quantity: 1 });
    setAdding((s) => ({ ...s, [product.id]: true }));
    setTimeout(() => setAdding((s) => ({ ...s, [product.id]: false })), 1400);
  };

  // ✅ ADDED: Navigate to product details
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleShopNow = () => {
    if (location.pathname !== "/products") {
      navigate("/products", { state: { scrollToGrid: true } });
      return;
    }
    if (gridRef.current) {
      gridRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollBy({ top: 600, behavior: "smooth" });
    }
  };

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Elevate Your Style</h1>
          <p>Discover premium products with exclusive designs, crafted for those who appreciate the extraordinary.</p>
          <button onClick={handleShopNow}>Shop Now <i className="fas fa-arrow-right" /></button>
        </div>
      </section>

      <main className="container">
        <h2 className="section-title">Featured Products</h2>

        <div className="products-grid" ref={gridRef}>
          {products.slice(0, 6).map((p) => (
            <div 
              className="card product-card" 
              key={p.id}
              onClick={() => handleProductClick(p.id)}
              style={{ cursor: 'pointer' }}
            >
              <img className="product-image" src={p.image_url || "https://via.placeholder.com/600x400?text=No+Image"} alt={p.name} />
              <h3 className="product-title">{p.name}</h3>
              <p className="product-description">{p.description ? (p.description.length > 140 ? p.description.slice(0, 140) + "…" : p.description) : "High-quality product."}</p>
              <div className="product-price">₹{p.price}</div>
              <button onClick={(e) => handleAdd(p, e)}>
                {adding[p.id] ? "Added ✓" : "Add to Cart"}
              </button>
            </div>
          ))}
        </div>

        <h2 className="section-title" style={{ marginTop: 30 }}>New Arrivals</h2>

        <div className="products-grid">
          {products.slice(6, 12).map((p) => (
            <div 
              className="card product-card" 
              key={p.id}
              onClick={() => handleProductClick(p.id)}
              style={{ cursor: 'pointer' }}
            >
              <img className="product-image" src={p.image_url || "https://via.placeholder.com/600x400?text=No+Image"} alt={p.name} />
              <h3 className="product-title">{p.name}</h3>
              <p className="product-description">{p.description ? (p.description.length > 140 ? p.description.slice(0, 140) + "…" : p.description) : "New arrival."}</p>
              <div className="product-price">₹{p.price}</div>
              <button onClick={(e) => handleAdd(p, e)}>
                {adding[p.id] ? "Added ✓" : "Add to Cart"}
              </button>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}