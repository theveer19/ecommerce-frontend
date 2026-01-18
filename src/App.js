import React, { useState, useEffect, lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Box, CircularProgress } from "@mui/material";
import { HelmetProvider } from "react-helmet-async";

import Auth from "./components/Auth";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AnnouncementBar from "./components/AnnouncementBar";
import GlobalStyles from "./components/GlobalStyles";
import ScrollToTop from "./components/ScrollToTop";
import { supabase } from "./supabase/supabaseClient";

import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import ErrorBoundary from "./components/ErrorBoundary";

/* ---------- PAGES ---------- */
import CheckoutPage from "./pages/CheckoutPage";

const HomePage = lazy(() => import("./pages/HomePage"));
const ProductList = lazy(() => import("./components/ProductList"));
const ProductDetailsPage = lazy(() => import("./pages/ProductDetailsPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const WishlistPage = lazy(() => import("./pages/WishlistPage"));
const AboutUsPage = lazy(() => import("./pages/AboutUsPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const ThankYouPage = lazy(() => import("./pages/ThankYouPage"));
const OrderPage = lazy(() => import("./pages/OrderPage"));
const UserOrderDetailsPage = lazy(() =>
  import("./pages/UserOrderDetailsPage")
);

/* ---------- ADMIN ---------- */
const AdminPage = lazy(() => import("./pages/AdminPage"));
const AdminOrdersPage = lazy(() => import("./pages/AdminOrders"));
const AdminOrderDetailsPage = lazy(() =>
  import("./pages/AdminOrderDetailsPage")
);
const ProductForm = lazy(() => import("./components/ProductForm"));

/* ---------- AUTH GUARD (BULLETPROOF) ---------- */
const RequireAuth = ({ children }) => {
  const location = useLocation();
  const [checked, setChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();

      if (!mounted) return;

      setAuthenticated(!!data?.user);
      setChecked(true);
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, []);

  if (!checked) return null;

  if (!authenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

/* ---------- ADMIN GUARD ---------- */
const RequireAdmin = ({ role, children }) => {
  if (role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return children;
};

const theme = createTheme({});

const PageLoader = () => (
  <Box
    sx={{
      minHeight: "70vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <CircularProgress />
  </Box>
);

function AppContent() {
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState("customer");

  const fetchUserRole = async (userId) => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      setUserRole(data?.role === "admin" ? "admin" : "customer");
    } catch {
      setUserRole("customer");
    }
  };

  useEffect(() => {
    let mounted = true;

    // Preload Razorpay safely
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }

    const init = async () => {
      const { data } = await supabase.auth.getSession();

      if (!mounted) return;

      setSession(data?.session ?? null);

      if (data?.session?.user) {
        fetchUserRole(data.session.user.id);
      }
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        if (!mounted) return;

        setSession(newSession);

        if (newSession?.user) {
          fetchUserRole(newSession.user.id);
        } else {
          setUserRole("customer");
        }
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUserRole("customer");
    navigate("/", { replace: true });
  };

  return (
    <>
      <AnnouncementBar />
      <Navbar session={session} userRole={userRole} onLogout={handleLogout} />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage session={session} />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/product/:id" element={<ProductDetailsPage />} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/cart" element={<CartPage session={session} />} />
          <Route path="/thank-you" element={<ThankYouPage />} />
          <Route path="/login" element={<Auth />} />

          <Route
            path="/checkout"
            element={
              <RequireAuth>
                <CheckoutPage />
              </RequireAuth>
            }
          />

          <Route
            path="/orders"
            element={
              <RequireAuth>
                <OrderPage />
              </RequireAuth>
            }
          />

          <Route
            path="/orders/:id"
            element={
              <RequireAuth>
                <UserOrderDetailsPage />
              </RequireAuth>
            }
          />

          <Route
            path="/wishlist"
            element={
              <RequireAuth>
                <WishlistPage />
              </RequireAuth>
            }
          />

          <Route
            path="/admin"
            element={
              <RequireAdmin role={userRole}>
                <AdminPage />
              </RequireAdmin>
            }
          />

          <Route
            path="/admin/orders"
            element={
              <RequireAdmin role={userRole}>
                <AdminOrdersPage />
              </RequireAdmin>
            }
          />

          <Route
            path="/admin/orders/:id"
            element={
              <RequireAdmin role={userRole}>
                <AdminOrderDetailsPage />
              </RequireAdmin>
            }
          />

          <Route
            path="/admin/products/new"
            element={
              <RequireAdmin role={userRole}>
                <ProductForm />
              </RequireAdmin>
            }
          />

          <Route
            path="/admin/products/edit/:id"
            element={
              <RequireAdmin role={userRole}>
                <ProductForm />
              </RequireAdmin>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      <Footer />
    </>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        <CssBaseline />
        <WishlistProvider>
          <CartProvider>
            <Router>
              <ScrollToTop />
              <ErrorBoundary>
                <AppContent />
              </ErrorBoundary>
            </Router>
          </CartProvider>
        </WishlistProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}
