import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";
import ProductCard from "./ProductCard";
import { Grid, Container, Typography, Box } from "@mui/material";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const gridRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching products:", error);
      } else if (mounted) {
        // Add some mock data for demonstration
        const productsWithMockData = (data || []).map((product, index) => ({
          ...product,
          isNew: index < 4, // First 4 products are new
          discount: index % 3 === 0 ? 20 : 0, // Every 3rd product has discount
          originalPrice: index % 3 === 0 ? Math.round(product.price * 1.25) : null,
        }));
        setProducts(productsWithMockData);
      }
    };
    
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

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography 
          variant="h3" 
          sx={{ 
            textAlign: 'center', 
            mb: 4, 
            color: 'white',
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #22c55e, #3b82f6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Featured Products
        </Typography>

        <Grid container spacing={3} ref={gridRef}>
          {products.slice(0, 8).map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 6 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              textAlign: 'center', 
              mb: 4, 
              color: 'white',
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #FFD700, #FFA500)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            New Arrivals
          </Typography>

          <Grid container spacing={3}>
            {products.slice(8, 16).map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </>
  );
}