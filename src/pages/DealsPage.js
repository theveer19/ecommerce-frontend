import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";
import { useCart } from "../context/CartContext";

export default function DealsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDeals = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching deals:", error);
      } else {
        // Simulate deals by filtering or modifying prices
        const deals = data.map(product => ({
          ...product,
          // Add 20% discount for demo
          originalPrice: product.price,
          price: Math.round(product.price * 0.8),
          discount: "20% OFF"
        }));
        setProducts(deals);
      }
      setLoading(false);
    };

    fetchDeals();
  }, []);

  const handleAddToCart = (product) => {
    addToCart({ ...product, quantity: 1 });
  };

  const handleBuyNow = (product) => {
    navigate("/checkout", {
      state: {
        buyNowItem: { ...product, quantity: 1 },
      },
    });
  };

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={containerStyle}>
          <h1 style={titleStyle}>🔥 Hot Deals</h1>
          <p>Loading amazing deals...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <h1 style={titleStyle}>🔥 Hot Deals</h1>
        <p style={subtitleStyle}>Limited time offers! Don't miss out on these amazing discounts.</p>
        
        <div style={dealsGridStyle}>
          {products.map((product) => (
            <div key={product.id} style={dealCardStyle}>
              <div style={badgeStyle}>{product.discount}</div>
              <img 
                src={product.image_url || "https://via.placeholder.com/300x200?text=No+Image"} 
                alt={product.name}
                style={imageStyle}
              />
              <div style={contentStyle}>
                <h3 style={productTitleStyle}>{product.name}</h3>
                <p style={descriptionStyle}>
                  {product.description?.substring(0, 100)}...
                </p>
                <div style={priceContainerStyle}>
                  <span style={originalPriceStyle}>₹{product.originalPrice}</span>
                  <span style={discountPriceStyle}>₹{product.price}</span>
                </div>
                <div style={buttonContainerStyle}>
                  <button 
                    onClick={() => handleAddToCart(product)}
                    style={addToCartButtonStyle}
                  >
                    Add to Cart
                  </button>
                  <button 
                    onClick={() => handleBuyNow(product)}
                    style={buyNowButtonStyle}
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(160deg, #0a0f1f 0%, #1a273a 50%, #0a192f 100%)',
  padding: '20px 0',
};

const containerStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 20px',
};

const titleStyle = {
  fontSize: '3rem',
  fontWeight: 'bold',
  background: 'linear-gradient(45deg, #FFD700, #FFA500)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  textAlign: 'center',
  marginBottom: '10px',
};

const subtitleStyle = {
  fontSize: '1.2rem',
  color: '#d1d5db',
  textAlign: 'center',
  marginBottom: '40px',
};

const dealsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: '30px',
  marginTop: '40px',
};

const dealCardStyle = {
  background: 'rgba(17, 25, 40, 0.85)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  overflow: 'hidden',
  position: 'relative',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
};

const badgeStyle = {
  position: 'absolute',
  top: '15px',
  right: '15px',
  background: 'linear-gradient(45deg, #ef4444, #f59e0b)',
  color: 'white',
  padding: '5px 10px',
  borderRadius: '20px',
  fontSize: '0.8rem',
  fontWeight: 'bold',
  zIndex: 2,
};

const imageStyle = {
  width: '100%',
  height: '200px',
  objectFit: 'cover',
};

const contentStyle = {
  padding: '20px',
};

const productTitleStyle = {
  fontSize: '1.3rem',
  fontWeight: 'bold',
  color: '#fff',
  marginBottom: '10px',
};

const descriptionStyle = {
  color: '#d1d5db',
  fontSize: '0.9rem',
  marginBottom: '15px',
  lineHeight: '1.4',
};

const priceContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginBottom: '15px',
};

const originalPriceStyle = {
  color: '#9ca3af',
  textDecoration: 'line-through',
  fontSize: '0.9rem',
};

const discountPriceStyle = {
  color: '#22c55e',
  fontSize: '1.3rem',
  fontWeight: 'bold',
};

const buttonContainerStyle = {
  display: 'flex',
  gap: '10px',
};

const addToCartButtonStyle = {
  flex: 1,
  background: 'rgba(37, 99, 235, 0.8)',
  color: 'white',
  border: 'none',
  padding: '10px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: '600',
  transition: 'all 0.3s ease',
};

const buyNowButtonStyle = {
  flex: 1,
  background: 'linear-gradient(45deg, #22c55e, #3b82f6)',
  color: 'white',
  border: 'none',
  padding: '10px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: '600',
  transition: 'all 0.3s ease',
};