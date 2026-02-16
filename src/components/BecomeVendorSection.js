import React from "react";
import { Box, Typography, Button, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Store } from "lucide-react";

export default function BecomeVendorSection() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        background: "#ffffff", // ✅ White Background
        color: "#000000",      // ✅ Black Text
        padding: { xs: "100px 0 60px", md: "120px 0 100px" }, // ✅ Added top padding to clear Navbar
        borderTop: "1px solid #f0f0f0",
        textAlign: "center",
        position: "relative",
        zIndex: 1
      }}
    >
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Box sx={{ 
                p: 2, 
                borderRadius: '50%', 
                border: '2px solid #000', // ✅ Black Border
                color: '#000'             // ✅ Black Icon
            }}>
                <Store size={32} />
            </Box>
        </Box>

        <Typography
          sx={{
            fontSize: { xs: "2rem", md: "3rem" },
            fontWeight: 900,
            marginBottom: "16px",
            letterSpacing: "-1px",
            textTransform: "uppercase",
            color: "#000"
          }}
        >
          Sell on OneT
        </Typography>

        <Typography
          sx={{
            color: "#666", // Dark Grey for readability
            marginBottom: "40px",
            fontSize: "1.1rem",
            maxWidth: "600px",
            mx: "auto",
            lineHeight: 1.6
          }}
        >
          Join the OneT marketplace and reach thousands of fashion-forward customers. 
          Scale your business with our premium platform.
        </Typography>

        <Button
          onClick={() => navigate("/vendor/register")}
          sx={{
            background: "rgb(0, 0, 0)", // ✅ Black Button
            color: "#fff",      // ✅ White Text
            padding: "16px 40px",
            fontWeight: 800,
            letterSpacing: "1px",
            borderRadius: "0px",
            fontSize: "0.9rem",
            boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
            transition: "all 0.3s ease",
            "&:hover": {
              background: "#333",
              transform: "translateY(-2px)",
              boxShadow: "0 15px 30px rgba(0,0,0,0.3)"
            }
          }}
        >
          BECOME A VENDOR
        </Button>

      </Container>
    </Box>
  );
}