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

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showSearch, setShowSearch] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const categories = useMemo(
    () => ["all", "T-Shirts", "Hoodies", "Pants", "Jackets", "Accessories"],
    []
  );

  /* ---------------- URL PARAMS ---------------- */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("search")) setSearchTerm(params.get("search"));
    if (params.get("cat")) setSelectedCategory(params.get("cat"));
    if (params.get("sort")) setSortBy(params.get("sort"));
  }, [location.search]);

  /* ---------------- FETCH PRODUCTS ---------------- */
  const fetchProducts = async () => {
    setLoading(true);
    setError(false);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Product fetch failed:", error.message);
      setError(true);
      setLoading(false);
      return;
    }

    setProducts(data || []);
    setFilteredProducts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* ---------------- FILTER LOGIC ---------------- */
  useEffect(() => {
    let result = [...products];

    if (searchTerm) {
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      result = result.filter(
        (p) => p.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (sortBy === "price-low") result.sort((a, b) => a.price - b.price);
    if (sortBy === "price-high") result.sort((a, b) => b.price - a.price);
    if (sortBy === "newest")
      result.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

    setFilteredProducts(result);
  }, [products, searchTerm, selectedCategory, sortBy]);

  /* ---------------- URL SYNC ---------------- */
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (selectedCategory !== "all") params.set("cat", selectedCategory);
    if (sortBy !== "newest") params.set("sort", sortBy);

    navigate(`/products${params.toString() ? "?" + params : ""}`, {
      replace: true,
    });
  }, [searchTerm, selectedCategory, sortBy, navigate]);

  /* ---------------- LOADING UI ---------------- */
  if (loading) {
    return (
      <Box sx={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress size={30} sx={{ color: "black" }} />
      </Box>
    );
  }

  /* ---------------- ERROR UI ---------------- */
  if (error) {
    return (
      <Box sx={{ textAlign: "center", py: 12 }}>
        <Typography sx={{ fontWeight: 900, letterSpacing: "1px" }}>
          FAILED TO LOAD PRODUCTS
        </Typography>
        <Typography sx={{ fontSize: 12, color: "#777", mt: 1 }}>
          Network issue or server unavailable
        </Typography>
        <Button
          startIcon={<Refresh />}
          onClick={fetchProducts}
          sx={{ mt: 3 }}
          variant="contained"
        >
          Retry
        </Button>
      </Box>
    );
  }

  /* ---------------- MAIN UI ---------------- */
  return (
    <Box sx={{ bgcolor: "#FFF", minHeight: "100vh" }}>
      {/* HEADER */}
      <Box sx={styles.pageHeader}>
        <Container maxWidth="xl">
          <Typography sx={styles.collectionTitle}>
            {searchTerm
              ? `SEARCH: "${searchTerm}"`
              : selectedCategory === "all"
              ? "LATEST DROP"
              : selectedCategory.toUpperCase()}
          </Typography>
        </Container>
      </Box>

      {/* TOOLBAR */}
      <Box sx={styles.stickyBarWrapper}>
        <Box sx={styles.stickyBar}>
          <Container maxWidth="xl">
            <div style={styles.barFlex}>
              <div style={styles.categoriesWrapper}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat.toLowerCase())}
                    style={{
                      ...styles.catBtn,
                      opacity:
                        selectedCategory === cat.toLowerCase() ? 1 : 0.4,
                      fontWeight:
                        selectedCategory === cat.toLowerCase() ? 800 : 600,
                    }}
                  >
                    {cat.toUpperCase()}
                  </button>
                ))}
              </div>

              <div style={styles.actionsWrapper}>
                <div style={styles.searchContainer}>
                  <Collapse in={showSearch || searchTerm}>
                    <input
                      placeholder="SEARCH..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={styles.minimalInput}
                    />
                  </Collapse>
                  <IconButton
                    onClick={() =>
                      searchTerm ? setSearchTerm("") : setShowSearch(!showSearch)
                    }
                  >
                    {searchTerm || showSearch ? <Close /> : <Search />}
                  </IconButton>
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={styles.minimalSelect}
                >
                  <option value="newest">NEWEST</option>
                  <option value="price-low">LOW PRICE</option>
                  <option value="price-high">HIGH PRICE</option>
                </select>
              </div>
            </div>
          </Container>
        </Box>
      </Box>

      {/* GRID */}
      <Container maxWidth="xl" sx={{ pb: 10 }}>
        {filteredProducts.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 10 }}>
            <Typography sx={{ fontWeight: 800, fontSize: 12, color: "#999" }}>
              NO PRODUCTS FOUND
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                sm: "repeat(3, 1fr)",
                md: "repeat(4, 1fr)",
              },
              gap: 2,
            }}
          >
            {filteredProducts.map((product) => (
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

/* ---------------- STYLES ---------------- */
const styles = {
  pageHeader: { pt: 10, pb: 3, textAlign: "center" },
  collectionTitle: { fontSize: 26, fontWeight: 900 },
  stickyBarWrapper: { position: "sticky", top: 75, zIndex: 90 },
  stickyBar: { background: "#fff", borderBottom: "1px solid #eee" },
  barFlex: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  categoriesWrapper: { display: "flex", gap: 20 },
  catBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 11 },
  actionsWrapper: { display: "flex", gap: 20 },
  searchContainer: { display: "flex", alignItems: "center" },
  minimalInput: { border: "none", borderBottom: "1px solid black" },
  minimalSelect: { border: "none", background: "transparent" },
};
