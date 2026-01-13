import React, { useState, useEffect, lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate
} from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Box, CircularProgress } from "@mui/material";

import Auth from "./components/Auth";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AnnouncementBar from "./components/AnnouncementBar";
import LoadingScreen from "./components/LoadingScreen";
import GlobalStyles from "./components/GlobalStyles";
import ScrollToTop from "./components/ScrollToTop";
import { supabase } from "./supabase/supabaseClient";

import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";

/* ---------- PAGES ---------- */
import CheckoutPage from "./pages/CheckoutPage"; // NOT lazy

const HomePage = lazy(() => import("./pages/HomePage"));
const ProductList = lazy(() => import("./components/ProductList"));
const ProductDetailsPage = lazy(() => import("./pages/ProductDetailsPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const WishlistPage = lazy(() => import("./pages/WishlistPage"));
const AboutUsPage = lazy(() => import("./pages/AboutUsPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const ThankYouPage = lazy(() => import("./pages/ThankYouPage"));
const OrderPage = lazy(() => import("./pages/OrderPage"));
const UserOrderDetailsPage = lazy(() => import("./pages/UserOrderDetailsPage"));

/* ---------- ADMIN PAGES (ONLY ADDITION) ---------- */
const AdminPage = lazy(() => import("./pages/AdminPage"));
const AdminOrdersPage = lazy(() => import("./pages/AdminOrders"));
const AdminOrderDetailsPage = lazy(() => import("./pages/AdminOrderDetailsPage"));
const ProductForm = lazy(() => import("./components/ProductForm"));

/* ---------- AUTH GUARD ---------- */
const RequireAuth = ({ session, children }) => {
  const location = useLocation();
  if (!session) {
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
  <Box sx={{ minHeight: "70vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
    <CircularProgress />
  </Box>
);

function AppContent() {
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState("customer");
  const [loading, setLoading] = useState(true);

  const fetchUserRole = async (userId) => {
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    setUserRole(data?.role === "admin" ? "admin" : "customer");
  };

  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }

    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data?.session ?? null);

      if (data?.session?.user) {
        await fetchUserRole(data.session.user.id);
      }

      setLoading(false);
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        if (newSession?.user) {
          await fetchUserRole(newSession.user.id);
        } else {
          setUserRole("customer");
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUserRole("customer");
    navigate("/", { replace: true });
  };

  if (loading) return <LoadingScreen />;

  return (
    <>
      <AnnouncementBar />
      <Navbar session={session} userRole={userRole} onLogout={handleLogout} />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* PUBLIC */}
          <Route path="/" element={<HomePage session={session} />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/product/:id" element={<ProductDetailsPage />} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/cart" element={<CartPage session={session} />} />
          <Route path="/thank-you" element={<ThankYouPage />} />
          <Route path="/login" element={<Auth />} />

          {/* USER */}
          <Route path="/checkout" element={<RequireAuth session={session}><CheckoutPage /></RequireAuth>} />
          <Route path="/orders" element={<RequireAuth session={session}><OrderPage /></RequireAuth>} />
          <Route path="/orders/:id" element={<RequireAuth session={session}><UserOrderDetailsPage /></RequireAuth>} />
          <Route path="/wishlist" element={<RequireAuth session={session}><WishlistPage /></RequireAuth>} />

          {/* ADMIN — FIXED */}
          <Route path="/admin" element={<RequireAdmin role={userRole}><AdminPage /></RequireAdmin>} />
          <Route path="/admin/orders" element={<RequireAdmin role={userRole}><AdminOrdersPage /></RequireAdmin>} />
          <Route path="/admin/orders/:id" element={<RequireAdmin role={userRole}><AdminOrderDetailsPage /></RequireAdmin>} />
          <Route path="/admin/products/new" element={<RequireAdmin role={userRole}><ProductForm /></RequireAdmin>} />
          <Route path="/admin/products/edit/:id" element={<RequireAdmin role={userRole}><ProductForm /></RequireAdmin>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      <Footer />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <CssBaseline />
      <WishlistProvider>
        <CartProvider>
          <Router>
            <ScrollToTop />
            <AppContent />
          </Router>
        </CartProvider>
      </WishlistProvider>
    </ThemeProvider>
  );
}
