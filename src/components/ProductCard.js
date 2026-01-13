import React from "react";
import { Link } from "react-router-dom";
import { Box } from "@mui/material";

export default function ProductCard({ product }) {
  // HARD GUARD — prevents crashes
  if (!product || !product.id) {
    console.error("Invalid product passed to ProductCard:", product);
    return null;
  }

  const { id, image_url, is_featured } = product;

  return (
    <Link
      to={`/product/${id}`}
      style={{ textDecoration: "none", display: "block" }}
    >
      <Box sx={styles.card}>
        {/* IMAGE */}
        <Box sx={styles.imageContainer}>
          <img
            src={image_url || "/api/placeholder/400/500"}
            alt="Product"
            style={styles.image}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/api/placeholder/400/500";
            }}
          />

          {/* FEATURED BADGE */}
          {is_featured && (
            <Box sx={styles.featuredBadge}>
              FEATURED
            </Box>
          )}
        </Box>
      </Box>
    </Link>
  );
}

const styles = {
  card: {
    border: "1px solid #f0f0f0",
    cursor: "pointer",
    backgroundColor: "#fff",
    transition: "border-color 0.25s ease",
    "&:hover": {
      borderColor: "#000",
    },
  },

  imageContainer: {
    position: "relative",
    width: "100%",
    paddingBottom: "125%", // 4:5 fashion ratio
    backgroundColor: "#fafafa",
    overflow: "hidden",
  },

  image: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  featuredBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#000",
    color: "#fff",
    fontSize: 10,
    fontWeight: 800,
    padding: "2px 8px",
    letterSpacing: "1px",
  },
};
