import React, { useEffect, useState, lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Box, CircularProgress, Typography } from "@mui/material";
import { Security } from "@mui/icons-material";

import Auth from "./components/Auth";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AnnouncementBar from "./components/AnnouncementBar";
import LoadingScreen from "./components/LoadingScreen";
import ErrorBoundary from "./components/ErrorBoundary";
import GlobalStyles from "./components/GlobalStyles";
import ScrollToTop from "./components/ScrollToTop";

import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";

import { supabase } from "./supabase/supabaseClient";

/* ------------------ LAZY PAGES ------------------ */
const HomePage = lazy(() => import("./pages/HomePage"));
const ProductList = lazy(() => import("./components/ProductList"));
const CategoriesPage = lazy(() => import("./pages/CategoriesPage"));
const ProductDetailsPage = lazy(() => import("./pages/ProductDetailsPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const OrderPage = lazy(() => import("./pages/OrderPage"));
const UserOrderDetailsPage = lazy(() => import("./pages/UserOrderDetailsPage"));
const WishlistPage = lazy(() => import("./pages/WishlistPage"));
const AboutUsPage = lazy(() => import("./pages/AboutUsPage"));
const ThankYouPage = lazy(() => import("./pages/ThankYouPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));

const AdminPage = lazy(() => import("./pages/AdminPage"));
const AdminOrdersPage = lazy(() => import("./pages/AdminOrders"));
const AdminOrderDetailsPage = lazy(() => import("./pages/AdminOrderDetailsPage"));
const ProductForm = lazy(() => import("./components/ProductForm"));

/* ------------------ THEME ------------------ */
const theme = createTheme({
  palette: {
    primary: { main: "#000" },
    background: { default: "#F9FAFB", paper: "#FFF" },
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
    button: { fontWeight: 700, letterSpacing: "0.05em" },
  },
  shape: { borderRadius: 12 },
});

/* ------------------ ADMIN FLOATING BUTTON ------------------ */
const AdminFloatingButton = ({ role }) => {
  if (role !== "admin") return null;

  return (
    <Box
      onClick={() => (window.location.href = "/admin")}
      sx={{
        position: "fixed",
        bottom: 30,
        right: 30,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 3,
        py: 1.5,
        borderRadius: "50px",
        cursor: "pointer",
        background: "#000",
        color: "#fff",
        boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
        "&:hover": { transform: "scale(1.05)" },
      }}
    ></Box>
  );
};

/* ------------------ PAGE LOADER ------------------ */
const PageLoader = () => (
  <Box
    sx={{
      minHeight: "70vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      gap: 2,
    }}
  >
    <CircularProgress sx={{ color: "#000" }} />
    <Typography sx={{ fontSize: 13, letterSpacing: 2, color: "#999" }}>
      LOADING...
    </Typography>
  </Box>
);

/* ------------------ APP ------------------ */
function App() {
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState("customer");
  const [authReady, setAuthReady] = useState(false);

  /* -------- AUTH INIT -------- */
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      setSession(session);

      if (session?.user?.id) {
        await fetchUserRole(session.user.id);
      }

      setAuthReady(true);
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;

      setSession(session);

      if (session?.user?.id) {
        await fetchUserRole(session.user.id);
      } else {
        setUserRole("customer");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /* -------- ROLE FETCH -------- */
  const fetchUserRole = async (userId) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Role fetch failed:", error.message);
      setUserRole("customer");
      return;
    }

    setUserRole(data?.role || "customer");
  };

  /* -------- LOGOUT -------- */
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUserRole("customer");
    window.location.href = "/";
  };

  /* -------- BLOCK RENDER UNTIL READY -------- */
  if (!authReady) return <LoadingScreen />;

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles />

        <WishlistProvider>
          <CartProvider>
            <Router>
              <ScrollToTop />

              <AnnouncementBar />
              <Navbar session={session} userRole={userRole} onLogout={handleLogout} />
              <AdminFloatingButton role={userRole} />

              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<HomePage session={session} />} />
                  <Route path="/products" element={<ProductList session={session} />} />
                  <Route path="/categories" element={<CategoriesPage />} />
                  <Route path="/product/:id" element={<ProductDetailsPage />} />
                  <Route path="/about" element={<AboutUsPage />} />
                  <Route path="/contact" element={<ContactPage />} />

                  <Route path="/login" element={session ? <Navigate to="/" /> : <Auth />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/wishlist" element={session ? <WishlistPage /> : <Navigate to="/login" />} />
                  <Route path="/checkout" element={session ? <CheckoutPage /> : <Navigate to="/login" />} />
                  <Route path="/thank-you" element={<ThankYouPage />} />
                  <Route path="/orders" element={session ? <OrderPage /> : <Navigate to="/login" />} />
                  <Route path="/orders/:id" element={session ? <UserOrderDetailsPage /> : <Navigate to="/login" />} />

                  {/* ADMIN */}
                  <Route path="/admin" element={userRole === "admin" ? <AdminPage /> : <Navigate to="/" />} />
                  <Route path="/admin/orders" element={userRole === "admin" ? <AdminOrdersPage /> : <Navigate to="/" />} />
                  <Route path="/admin/orders/:id" element={userRole === "admin" ? <AdminOrderDetailsPage /> : <Navigate to="/" />} />
                  <Route path="/admin/products/new" element={userRole === "admin" ? <ProductForm /> : <Navigate to="/" />} />
                  <Route path="/admin/products/edit/:id" element={userRole === "admin" ? <ProductForm /> : <Navigate to="/" />} />

                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </Suspense>

              <Footer />
            </Router>
          </CartProvider>
        </WishlistProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
