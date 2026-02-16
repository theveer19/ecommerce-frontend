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
import ErrorBoundary from "./components/ErrorBoundary";

import { supabase } from "./supabase/supabaseClient";

import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";

/* ---------- PAGES ---------- */

import CheckoutPage from "./pages/CheckoutPage";

/* Vendor Pages */
const VendorRegister = lazy(() => import("./pages/VendorRegister"));
const VendorDashboard = lazy(() => import("./pages/VendorDashboard"));
const VendorAddProduct = lazy(() => import("./pages/VendorAddProduct"));
const VendorProducts = lazy(() => import("./pages/VendorProducts"));
const VendorEditProduct = lazy(() => import("./pages/VendorEditProduct"));
const VendorOrders = lazy(() => import("./pages/VendorOrders"));
const VendorEarnings = lazy(() => import("./pages/VendorEarnings"));
const VendorStorePage = lazy(() => import("./pages/VendorStorePage")); // NEW

/* Customer Pages */
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

/* Admin Pages */
const AdminPage = lazy(() => import("./pages/AdminPage"));
const AdminOrdersPage = lazy(() => import("./pages/AdminOrders"));
const AdminOrderDetailsPage = lazy(() =>
  import("./pages/AdminOrderDetailsPage")
);
const ProductForm = lazy(() => import("./components/ProductForm"));
const AdminVendors = lazy(() => import("./pages/AdminVendors"));


/* ---------- AUTH GUARD ---------- */

const RequireAuth = ({ children }) => {
  const location = useLocation();

  const [checked, setChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;

    const check = async () => {
      const { data } = await supabase.auth.getUser();

      if (!mounted) return;

      setAuthenticated(!!data?.user);
      setChecked(true);
    };

    check();

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

/* ---------- LOADER ---------- */

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

/* ---------- MAIN CONTENT ---------- */

function AppContent() {
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState("customer");

  /* ---------- FETCH USER ROLE ---------- */

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

  /* ---------- CREATE VENDOR PROFILE ---------- */

  const createVendorIfNotExists = async (user) => {
    if (!user) return;

    if (user.user_metadata?.role !== "vendor") return;

    try {
      const { data: existingVendor } = await supabase
        .from("vendors")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingVendor) return;

      /* Generate slug */
      const slug =
        user.user_metadata.business_name
          ?.toLowerCase()
          ?.replace(/\s+/g, "-")
          ?.replace(/[^\w-]/g, "") +
        "-" +
        user.id.slice(0, 6);

      await supabase.from("vendors").insert({
  user_id: user.id,
  email: user.email,
  business_name: user.user_metadata.business_name,
  phone: user.user_metadata.phone,
  address: user.user_metadata.address,
  gst_number: user.user_metadata.gst_number,
  slug: slug,
  is_verified: false,
  is_approved: false // 🔴 Default to pending
});
      

      console.log("Vendor profile created");
    } catch (err) {
      console.error("Vendor creation error:", err);
    }
  };

  /* ---------- AUTH STATE ---------- */

  useEffect(() => {
    let mounted = true;

    /* Load Razorpay */
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
        createVendorIfNotExists(data.session.user);
      }
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        if (!mounted) return;

        setSession(newSession);

        if (newSession?.user) {
          fetchUserRole(newSession.user.id);
          createVendorIfNotExists(newSession.user);
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

  /* ---------- LOGOUT ---------- */

  const handleLogout = async () => {
    await supabase.auth.signOut();

    setSession(null);
    setUserRole("customer");

    navigate("/", { replace: true });
  };

  /* ---------- ROUTES ---------- */

  return (
    <>
      <AnnouncementBar />

      <Navbar
        session={session}
        userRole={userRole}
        onLogout={handleLogout}
      />

      <Suspense fallback={<PageLoader />}>

        <Routes>

          {/* Customer */}

          <Route path="/" element={<HomePage session={session} />} />

          <Route path="/products" element={<ProductList />} />

          <Route path="/product/:id" element={<ProductDetailsPage />} />

          <Route path="/store/:slug" element={<VendorStorePage />} />

          <Route path="/about" element={<AboutUsPage />} />

          <Route path="/contact" element={<ContactPage />} />

          <Route path="/cart" element={<CartPage session={session} />} />

          <Route path="/wishlist"
            element={
              <RequireAuth>
                <WishlistPage />
              </RequireAuth>
            }
          />

          <Route path="/checkout"
            element={
              <RequireAuth>
                <CheckoutPage />
              </RequireAuth>
            }
          />

          <Route path="/orders"
            element={
              <RequireAuth>
                <OrderPage />
              </RequireAuth>
            }
          />

          <Route path="/orders/:id"
            element={
              <RequireAuth>
                <UserOrderDetailsPage />
              </RequireAuth>
            }
          />

          <Route path="/thank-you" element={<ThankYouPage />} />

          <Route path="/login" element={<Auth />} />

          {/* Vendor */}

          <Route path="/vendor/register" element={<VendorRegister />} />

          <Route path="/vendor/dashboard"
            element={
              <RequireAuth>
                <VendorDashboard />
              </RequireAuth>
            }
          />

          <Route path="/vendor/add-product"
            element={
              <RequireAuth>
                <VendorAddProduct />
              </RequireAuth>
            }
          />

          <Route path="/vendor/products"
            element={
              <RequireAuth>
                <VendorProducts />
              </RequireAuth>
            }
          />

          <Route path="/vendor/edit-product/:id"
            element={
              <RequireAuth>
                <VendorEditProduct />
              </RequireAuth>
            }
          />

          <Route path="/vendor/orders"
            element={
              <RequireAuth>
                <VendorOrders />
              </RequireAuth>
            }
          />

          <Route path="/vendor/earnings"
            element={
              <RequireAuth>
                <VendorEarnings />
              </RequireAuth>
            }
          />

          {/* Admin */}

          <Route path="/admin"
            element={
              <RequireAdmin role={userRole}>
                <AdminPage />
              </RequireAdmin>
            }
          />

                  <Route
          path="/admin/vendors"
          element={
            <RequireAdmin role={userRole}>
              <AdminVendors />
            </RequireAdmin>
          }
        />


          <Route path="/admin/orders"
            element={
              <RequireAdmin role={userRole}>
                <AdminOrdersPage />
              </RequireAdmin>
            }
          />

          <Route path="/admin/orders/:id"
            element={
              <RequireAdmin role={userRole}>
                <AdminOrderDetailsPage />
              </RequireAdmin>
            }
          />

          <Route path="/admin/products/new"
            element={
              <RequireAdmin role={userRole}>
                <ProductForm />
              </RequireAdmin>
            }
          />

          <Route path="/admin/products/edit/:id"
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

/* ---------- ROOT ---------- */

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
