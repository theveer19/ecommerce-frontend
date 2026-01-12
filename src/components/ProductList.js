import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";
import ProductCard from "./ProductCard";
import {
  Box,
  Container,
  Typography,
  IconButton,
  CircularProgress,
  Collapse,
  Button
} from "@mui/material";
import { Search, Close, Refresh } from "@mui/icons-material";

export default function ProductList({ session }) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showSearch, setShowSearch] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  /* ---------- CATEGORIES (NORMALIZED) ---------- */
  const categories = useMemo(() => [
    { label: "ALL", value: "all" },
    { label: "T-SHIRTS", value: "t-shirts" },
    { label: "HOODIES", value: "hoodies" },
    { label: "PANTS", value: "pants" },
    { label: "JACKETS", value: "jackets" },
    { label: "ACCESSORIES", value: "accessories" },
  ], []);

  /* ---------- URL → STATE ---------- */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchTerm(params.get("search") || "");
    setSelectedCategory(params.get("cat") || "all");
    setSortBy(params.get("sort") || "newest");
  }, [location.search]);

  /* ---------- FETCH PRODUCTS ---------- */
  const fetchProducts = async () => {
    setLoading(true);
    setError(false);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Product fetch failed:", error);
      setError(true);
      setLoading(false);
      return;
    }

    const normalized = (data || []).map(p => ({
      ...p,
      category_normalized: p.category?.trim().toLowerCase()
    }));

    setProducts(normalized);
    setFilteredProducts(normalized);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* ---------- FILTER LOGIC ---------- */
  useEffect(() => {
    let result = [...products];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        p =>
          p.name?.toLowerCase().includes(term) ||
          p.category_normalized?.includes(term)
      );
    }

    if (selectedCategory !== "all") {
      result = result.filter(
        p => p.category_normalized === selectedCategory
      );
    }

    if (sortBy === "price-low") result.sort((a, b) => a.price - b.price);
    if (sortBy === "price-high") result.sort((a, b) => b.price - a.price);
    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    setFilteredProducts(result);
  }, [products, searchTerm, selectedCategory, sortBy]);

  /* ---------- STATE → URL ---------- */
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (selectedCategory !== "all") params.set("cat", selectedCategory);
    if (sortBy !== "newest") params.set("sort", sortBy);

    navigate(`/products${params.toString() ? "?" + params : ""}`, {
      replace: true
    });
  }, [searchTerm, selectedCategory, sortBy, navigate]);

  /* ---------- LOADING ---------- */
  if (loading) {
    return (
      <Box sx={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress sx={{ color: "black" }} />
      </Box>
    );
  }

  /* ---------- ERROR ---------- */
  if (error) {
    return (
      <Box sx={{ textAlign: "center", py: 12 }}>
        <Typography sx={{ fontWeight: 900 }}>
          FAILED TO LOAD PRODUCTS
        </Typography>
        <Button startIcon={<Refresh />} onClick={fetchProducts} sx={{ mt: 3 }} variant="contained">
          Retry
        </Button>
      </Box>
    );
  }

  /* ---------- UI ---------- */
  return (
    <Box sx={{ bgcolor: "#fff", minHeight: "100vh" }}>
      <Box sx={{ pt: 10, pb: 3, textAlign: "center" }}>
        <Container maxWidth="xl">
          <Typography sx={{ fontSize: 26, fontWeight: 900 }}>
            {searchTerm
              ? `SEARCH: "${searchTerm}"`
              : selectedCategory === "all"
              ? "LATEST DROP"
              : selectedCategory.toUpperCase()}
          </Typography>
        </Container>
      </Box>

      <Box sx={{ position: "sticky", top: 75, zIndex: 90, bgcolor: "#fff", borderBottom: "1px solid #eee" }}>
        <Container maxWidth="xl" sx={{ display: "flex", justifyContent: "space-between", py: 1 }}>
          <Box sx={{ display: "flex", gap: 2 }}>
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 11,
                  fontWeight: selectedCategory === cat.value ? 800 : 600,
                  opacity: selectedCategory === cat.value ? 1 : 0.4
                }}
              >
                {cat.label}
              </button>
            ))}
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Collapse in={showSearch || searchTerm}>
              <input
                placeholder="SEARCH..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ border: "none", borderBottom: "1px solid black" }}
              />
            </Collapse>

            <IconButton
              onClick={() =>
                searchTerm ? setSearchTerm("") : setShowSearch(!showSearch)
              }
            >
              {searchTerm || showSearch ? <Close /> : <Search />}
            </IconButton>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{ border: "none" }}
            >
              <option value="newest">NEWEST</option>
              <option value="price-low">LOW PRICE</option>
              <option value="price-high">HIGH PRICE</option>
            </select>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 8 }}>
        {filteredProducts.length === 0 ? (
          <Typography align="center" sx={{ color: "#999", fontWeight: 700 }}>
            NO PRODUCTS FOUND
          </Typography>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "repeat(2,1fr)", md: "repeat(4,1fr)" },
              gap: 2
            }}
          >
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                session={session}
              />
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
}
