import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";
import { useCart } from "../context/CartContext";

export default function CategoriesPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching products:", error);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  const categories = {
    male: {
      name: "👨 Men's Fashion",
      subcategories: {
        "top-wear": { name: "👕 Top Wear", filter: "shirt" },
        "bottom-wear": { name: "👖 Bottom Wear", filter: "pant" },
        "sports": { name: "⚽ Sports", filter: "sports" }
      }
    },
    female: {
      name: "👩 Women's Fashion",
      subcategories: {
        "top-wear": { name: "👚 Top Wear", filter: "top" },
        "bottom-wear": { name: "👗 Bottom Wear", filter: "dress" },
        "sports": { name: "🤸 Sports", filter: "sports" }
      }
    }
  };

  const handleAddToCart = (product) => {
    addToCart({ ...product, quantity: 1 });
  };

  const handleViewDetails = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={containerStyle}>
          <h1 style={titleStyle}>🛍️ Categories</h1>
          <p>Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <h1 style={titleStyle}>🛍️ Categories</h1>
        <p style={subtitleStyle}>Browse through our wide range of categories</p>
        
        {Object.entries(categories).map(([categoryKey, category]) => (
          <div key={categoryKey} style={categorySectionStyle}>
            <h2 style={categoryTitleStyle}>{category.name}</h2>
            
            <div style={subcategoriesGridStyle}>
              {Object.entries(category.subcategories).map(([subKey, subcategory]) => (
                <div key={subKey} style={subcategoryCardStyle}>
                  <h3 style={subcategoryTitleStyle}>{subcategory.name}</h3>
                  <div style={productsGridStyle}>
                    {products
                      .filter(product => 
                        product.name.toLowerCase().includes(subcategory.filter.toLowerCase()) ||
                        product.description?.toLowerCase().includes(subcategory.filter.toLowerCase())
                      )
                      .slice(0, 3)
                      .map(product => (
                        <div key={product.id} style={productCardStyle}>
                          <img 
                            src={product.image_url || "https://via.placeholder.com/150x150?text=No+Image"} 
                            alt={product.name}
                            style={productImageStyle}
                          />
                          <div style={productContentStyle}>
                            <h4 style={productNameStyle}>{product.name}</h4>
                            <p style={productPriceStyle}>₹{product.price}</p>
                            <div style={productButtonContainerStyle}>
                              <button 
                                onClick={() => handleAddToCart(product)}
                                style={smallButtonStyle}
                              >
                                Add to Cart
                              </button>
                              <button 
                                onClick={() => handleViewDetails(product.id)}
                                style={{...smallButtonStyle, background: 'rgba(34, 197, 94, 0.8)'}}
                              >
                                View
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    }
                    {products.filter(product => 
                      product.name.toLowerCase().includes(subcategory.filter.toLowerCase()) ||
                      product.description?.toLowerCase().includes(subcategory.filter.toLowerCase())
                    ).length === 0 && (
                      <p style={noProductsStyle}>No products found in this category</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
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
  background: 'linear-gradient(45deg, #22c55e, #3b82f6)',
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

const categorySectionStyle = {
  marginBottom: '50px',
};

const categoryTitleStyle = {
  fontSize: '2rem',
  color: '#fff',
  marginBottom: '20px',
  borderBottom: '2px solid #22c55e',
  paddingBottom: '10px',
};

const subcategoriesGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
  gap: '20px',
};

const subcategoryCardStyle = {
  background: 'rgba(17, 25, 40, 0.85)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  padding: '20px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
};

const subcategoryTitleStyle = {
  fontSize: '1.5rem',
  color: '#fff',
  marginBottom: '15px',
};

const productsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
  gap: '15px',
};

const productCardStyle = {
  background: 'rgba(30, 41, 59, 0.9)',
  borderRadius: '12px',
  padding: '10px',
  textAlign: 'center',
};

const productImageStyle = {
  width: '80px',
  height: '80px',
  objectFit: 'cover',
  borderRadius: '8px',
  marginBottom: '8px',
};

const productContentStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '5px',
};

const productNameStyle = {
  fontSize: '0.8rem',
  color: '#fff',
  fontWeight: 'bold',
  margin: 0,
};

const productPriceStyle = {
  fontSize: '0.9rem',
  color: '#22c55e',
  fontWeight: 'bold',
  margin: 0,
};

const productButtonContainerStyle = {
  display: 'flex',
  gap: '5px',
  marginTop: '5px',
};

const smallButtonStyle = {
  flex: 1,
  background: 'rgba(37, 99, 235, 0.8)',
  color: 'white',
  border: 'none',
  padding: '5px 8px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.7rem',
  fontWeight: '600',
};

const noProductsStyle = {
  color: '#9ca3af',
  textAlign: 'center',
  fontStyle: 'italic',
  gridColumn: '1 / -1',
};