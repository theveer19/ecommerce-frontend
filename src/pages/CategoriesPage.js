import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";
import { useCart } from "../context/CartContext";
import { 
  Box, Container, Grid, Typography, Button, 
  CircularProgress, IconButton 
} from "@mui/material";
import { ShoppingBag, Eye, TrendingUp, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function CategoriesPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("male");
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
      name: "Men's Collection",
      description: "Elevate your style with our premium men's fashion",
      subcategories: {
        "tshirts": { name: "T-Shirts", filter: "t-shirt", icon: "👕" },
        "sweatshirts": { name: "Sweatshirts", filter: "sweatshirt", icon: "🧥" },
        "hoodies": { name: "Hoodies", filter: "hoodie", icon: "🦺" },
        "jackets": { name: "Jackets", filter: "jacket", icon: "🧥" },
        "pants": { name: "Pants", filter: "pant", icon: "👖" },
        "shorts": { name: "Shorts", filter: "short", icon: "🩳" }
      }
    },
    female: {
      name: "Women's Collection",
      description: "Discover elegance and comfort in every piece",
      subcategories: {
        "dresses": { name: "Dresses", filter: "dress", icon: "👗" },
        "tops": { name: "Tops", filter: "top", icon: "👚" },
        "hoodies": { name: "Hoodies", filter: "hoodie", icon: "🦺" },
        "jackets": { name: "Jackets", filter: "jacket", icon: "🧥" },
        "pants": { name: "Pants", filter: "pant", icon: "👖" },
        "skirts": { name: "Skirts", filter: "skirt", icon: "👗" }
      }
    },
    accessories: {
      name: "Accessories",
      description: "Complete your look with our premium accessories",
      subcategories: {
        "caps": { name: "Caps", filter: "cap", icon: "🧢" },
        "bags": { name: "Bags", filter: "bag", icon: "👜" },
        "jewelry": { name: "Jewelry", filter: "jewelry", icon: "💎" },
        "watches": { name: "Watches", filter: "watch", icon: "⌚" }
      }
    }
  };

  const handleAddToCart = (product) => {
    addToCart({ ...product, quantity: 1 });
    // You could add a toast notification here
  };

  const getProductsForSubcategory = (filter) => {
    return products
      .filter(product => 
        product.name.toLowerCase().includes(filter.toLowerCase()) ||
        product.description?.toLowerCase().includes(filter.toLowerCase()) ||
        product.category?.toLowerCase().includes(filter.toLowerCase())
      )
      .slice(0, 4);
  };

  if (loading) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress sx={{ color: 'black' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#FFFFFF', minHeight: '100vh' }}>
      <Container maxWidth="xl" sx={{ py: 8, px: { xs: 2, md: 4 } }}>
        
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography 
            sx={{ 
              fontSize: { xs: '36px', md: '56px' },
              fontWeight: 900,
              letterSpacing: '-1px',
              color: '#000',
              mb: 2,
              textTransform: 'uppercase'
            }}
          >
            Discover Collections
          </Typography>
          <Typography 
            sx={{ 
              fontSize: '16px',
              color: '#666',
              maxWidth: '600px',
              mx: 'auto',
              lineHeight: 1.6
            }}
          >
            Explore our curated categories and find your perfect style
          </Typography>
        </Box>

        {/* Category Tabs */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 2, 
          mb: 6,
          flexWrap: 'wrap' 
        }}>
          {Object.entries(categories).map(([key, category]) => (
            <Button
              key={key}
              variant={activeCategory === key ? "contained" : "outlined"}
              onClick={() => setActiveCategory(key)}
              sx={{
                borderRadius: 0,
                textTransform: 'uppercase',
                fontWeight: 700,
                letterSpacing: '1px',
                fontSize: '12px',
                px: 4,
                py: 1.5,
                minWidth: 'auto'
              }}
            >
              {category.name}
            </Button>
          ))}
        </Box>

        {/* Active Category Content */}
        <Box sx={{ mb: 8 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography 
              sx={{ 
                fontSize: '32px',
                fontWeight: 800,
                color: '#000',
                mb: 1,
                textTransform: 'uppercase'
              }}
            >
              {categories[activeCategory].name}
            </Typography>
            <Typography 
              sx={{ 
                fontSize: '14px',
                color: '#666',
                maxWidth: '500px',
                mx: 'auto'
              }}
            >
              {categories[activeCategory].description}
            </Typography>
          </Box>

          {/* Subcategories Grid */}
          <Grid container spacing={3}>
            {Object.entries(categories[activeCategory].subcategories).map(([subKey, subcategory]) => {
              const subcategoryProducts = getProductsForSubcategory(subcategory.filter);
              
              return (
                <Grid item key={subKey} xs={12} md={6} lg={4}>
                  <Box sx={{ 
                    border: '1px solid #eee',
                    p: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    {/* Subcategory Header */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 3,
                      pb: 2,
                      borderBottom: '1px solid #eee'
                    }}>
                      <Typography 
                        sx={{ 
                          fontSize: '24px',
                          mr: 2
                        }}
                      >
                        {subcategory.icon}
                      </Typography>
                      <Box sx={{ flex: 1 }}>
                        <Typography 
                          sx={{ 
                            fontSize: '18px',
                            fontWeight: 700,
                            color: '#000',
                            textTransform: 'uppercase'
                          }}
                        >
                          {subcategory.name}
                        </Typography>
                        {subcategoryProducts.length > 0 && (
                          <Typography 
                            sx={{ 
                              fontSize: '12px',
                              color: '#666',
                              fontWeight: 600
                            }}
                          >
                            {subcategoryProducts.length} items
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    {/* Products Preview */}
                    {subcategoryProducts.length > 0 ? (
                      <>
                        <Grid container spacing={2} sx={{ mb: 3, flex: 1 }}>
                          {subcategoryProducts.map(product => (
                            <Grid item xs={6} key={product.id}>
                              <Box sx={{ 
                                border: '1px solid #f0f0f0',
                                p: 1,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                '&:hover': {
                                  borderColor: '#000'
                                }
                              }}
                              onClick={() => navigate(`/product/${product.id}`)}
                              >
                                <Box sx={{ 
                                  height: '120px',
                                  bgcolor: '#fafafa',
                                  mb: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  overflow: 'hidden'
                                }}>
                                  <img 
                                    src={product.image_url || "/api/placeholder/80/80"} 
                                    alt={product.name}
                                    style={{ 
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover'
                                    }}
                                  />
                                </Box>
                                <Typography 
                                  sx={{ 
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    color: '#000',
                                    mb: 0.5,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  }}
                                >
                                  {product.name}
                                </Typography>
                                <Typography 
                                  sx={{ 
                                    fontSize: '14px',
                                    fontWeight: 700,
                                    color: '#000'
                                  }}
                                >
                                  ₹{product.price.toLocaleString()}
                                </Typography>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>

                        {subcategoryProducts.length >= 4 && (
                          <Button
                            variant="outlined"
                            fullWidth
                            sx={{
                              borderRadius: 0,
                              textTransform: 'uppercase',
                              fontWeight: 700,
                              fontSize: '11px',
                              letterSpacing: '1px',
                              py: 1.5
                            }}
                            onClick={() => navigate(`/products?cat=${subcategory.filter}`)}
                          >
                            View All {subcategory.name}
                          </Button>
                        )}
                      </>
                    ) : (
                      <Box sx={{ 
                        textAlign: 'center', 
                        py: 4,
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                      }}>
                        <Typography sx={{ color: '#999', mb: 2 }}>
                          No products available
                        </Typography>
                        <Button
                          variant="outlined"
                          sx={{
                            borderRadius: 0,
                            textTransform: 'uppercase',
                            fontWeight: 700,
                            fontSize: '11px',
                            letterSpacing: '1px'
                          }}
                          onClick={() => navigate('/products')}
                        >
                          Browse All Products
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Box>

        {/* Featured Products */}
        <Box sx={{ 
          borderTop: '1px solid #eee',
          pt: 8,
          mt: 8
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Sparkles size={24} style={{ marginRight: '12px' }} />
            <Typography 
              sx={{ 
                fontSize: '24px',
                fontWeight: 800,
                color: '#000',
                textTransform: 'uppercase'
              }}
            >
              Featured Products
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            {products
              .filter(p => p.featured)
              .slice(0, 4)
              .map(product => (
                <Grid item xs={6} md={3} key={product.id}>
                  <Box 
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)'
                      }
                    }}
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    <Box sx={{ 
                      height: '200px',
                      bgcolor: '#fafafa',
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden'
                    }}>
                      <img 
                        src={product.image_url || "/api/placeholder/200/200"} 
                        alt={product.name}
                        style={{ 
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </Box>
                    <Typography 
                      sx={{ 
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#000',
                        mb: 0.5,
                        textTransform: 'uppercase'
                      }}
                    >
                      {product.name}
                    </Typography>
                    <Typography 
                      sx={{ 
                        fontSize: '16px',
                        fontWeight: 700,
                        color: '#000'
                      }}
                    >
                      ₹{product.price.toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
              ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}