import React, { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress, Typography } from '@mui/material';
import { Security } from "@mui/icons-material"; // Icon for Admin Button

// --- CORE COMPONENTS ---
import Auth from "./components/Auth";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AnnouncementBar from "./components/AnnouncementBar";
import LoadingScreen from "./components/LoadingScreen";
import ErrorBoundary from "./components/ErrorBoundary";
import GlobalStyles from "./components/GlobalStyles";
import { supabase } from "./supabase/supabaseClient";
import ScrollToTop from "./components/ScrollToTop";

// --- CONTEXTS ---
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";

// --- LAZY LOADED PAGES ---
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

// --- ADMIN PAGES ---
const AdminPage = lazy(() => import("./pages/AdminPage")); 
const AdminOrdersPage = lazy(() => import("./pages/AdminOrders")); // Kept your specific import path
const AdminOrderDetailsPage = lazy(() => import("./pages/AdminOrderDetailsPage"));
const ProductForm = lazy(() => import("./components/ProductForm")); 

// --- PREMIUM THEME CONFIGURATION ---
const theme = createTheme({
  palette: {
    primary: { main: '#000000', contrastText: '#FFFFFF' },
    secondary: { main: '#FFFFFF', contrastText: '#000000' },
    background: { default: '#F9FAFB', paper: '#FFFFFF' }, // Softer background
    text: { primary: '#111827', secondary: '#6B7280' }
  },
  typography: {
    fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: { fontWeight: 900, letterSpacing: '-0.02em' },
    h2: { fontWeight: 800, letterSpacing: '-0.01em' },
    h3: { fontWeight: 700 },
    button: { fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' },
  },
  shape: { borderRadius: 12 }, // Modern rounded corners
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '50px', // Pill buttons
          padding: '12px 28px',
          boxShadow: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 10px 20px -10px rgba(0,0,0,0.2)' },
        },
        contained: { backgroundColor: '#000', color: '#fff' },
        outlined: { borderWidth: '1.5px', '&:hover': { borderWidth: '1.5px' } }
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none', transition: 'box-shadow 0.3s ease' }
      }
    }
  },
});

// --- STYLED ADMIN BUTTON (Glassmorphism) ---
const AdminFloatingButton = ({ userRole }) => {
  if (userRole !== 'admin') return null;
  
  return (
    <Box
      onClick={() => window.location.href = "/admin"}
      sx={{
        position: 'fixed',
        bottom: 30,
        right: 30,
        zIndex: 9999,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        padding: '12px 24px',
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(12px)',
        borderRadius: '50px',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        '&:hover': {
          transform: 'scale(1.05) translateY(-5px)',
          background: '#000000',
          boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
        }
      }}
    >
      <Security sx={{ color: '#4ade80', fontSize: 20 }} />
      <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '12px', letterSpacing: '1px' }}>
        ADMIN COMMAND
      </Typography>
    </Box>
  );
};

// --- CUSTOM FALLBACK LOADER ---
const PageLoader = () => (
  <Box sx={{ 
    display: 'flex', 
    flexDirection: 'column', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '80vh', 
    gap: 3 
  }}>
    <CircularProgress size={50} thickness={2} sx={{ color: 'black' }} />
    <Typography sx={{ 
      fontSize: '14px', 
      fontWeight: 600, 
      color: '#999', 
      letterSpacing: '2px',
      animation: 'pulse 2s infinite' 
    }}>
      LOADING EXPERIENCE...
    </Typography>
    <style>{`@keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }`}</style>
  </Box>
);

function App() {
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState('customer');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Safety Timeout
    const loadingTimeout = setTimeout(() => {
      if (mounted) {
        console.warn("Loading timeout reached. Forcing app render.");
        setLoading(false);
      }
    }, 5000); 

    // --- 📱 SAFE BACK BUTTON LOGIC ---
    const onLocationChange = () => {
      if (window.location.pathname === '/' && !window.history.state?.pushed) {
        window.history.pushState({ pushed: true }, "", "/");
      }
    };
    const backButtonTimer = setTimeout(onLocationChange, 1000); 

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;
        if (session) {
          setSession(session);
          await fetchUserRole(session.user.id);
        }
      } catch (err) {
        console.error("Auth init failed", err);
      } finally {
        if (mounted) setLoading(false); 
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (mounted) {
        if (session) {
          setSession(session);
          await fetchUserRole(session.user.id);
        } else {
          setSession(null);
          setUserRole('customer');
        }
      }
    });

    return () => {
      mounted = false;
      clearTimeout(loadingTimeout);
      clearTimeout(backButtonTimer);
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const fetchUserRole = async (userId) => {
    try {
      // Use 'profiles' table as per your new logic
      const { data } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
      
      if (data) {
        setUserRole(data.role);
      } else {
        // Fallback logic if needed, but primarily relying on profiles now
        const { data: userData } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
        if (userData) setUserRole(userData.role);
        
        // Ensure profile exists logic
        await supabase.from("profiles").insert({
          id: userId,
          email: session?.user?.email || '',
          role: 'customer',
          created_at: new Date().toISOString()
        }).select();
      }
    } catch (err) {
      console.error("Role fetch error", err);
    }
  };

  const handleLogin = (sessionData) => {
    setSession(sessionData);
    if (sessionData?.user?.id) fetchUserRole(sessionData.user.id);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUserRole('customer');
    window.location.href = "/";
  };

  if (loading) return <LoadingScreen />;

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        <CssBaseline />
        <WishlistProvider>
          <CartProvider>
            <Router>
              <ScrollToTop />
              <Box sx={{ 
                minHeight: '100vh', 
                display: 'flex', 
                flexDirection: 'column', 
                bgcolor: 'background.default',
                animation: 'fadeIn 0.8s ease-out'
              }}>
                <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
                
                <AnnouncementBar />
                <Navbar session={session} userRole={userRole} onLogout={handleLogout} />
                <AdminFloatingButton userRole={userRole} />

                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<HomePage session={session} />} />
                    <Route path="/products" element={<ProductList session={session} />} />
                    <Route path="/categories" element={<CategoriesPage session={session} />} />
                    <Route path="/product/:id" element={<ProductDetailsPage session={session} />} />
                    <Route path="/about" element={<AboutUsPage session={session} />} />
                    <Route path="/contact" element={<ContactPage />} />
                    
                    <Route path="/login" element={session ? <Navigate to="/" replace /> : <Auth onLogin={handleLogin} />} />

                    <Route path="/cart" element={<CartPage session={session} />} />
                    <Route path="/wishlist" element={session ? <WishlistPage session={session} /> : <Navigate to="/login" replace />} />
                    <Route path="/checkout" element={session ? <CheckoutPage session={session} /> : <Navigate to="/login" replace />} />
                    <Route path="/thank-you" element={<ThankYouPage session={session} />} />
                    <Route path="/orders" element={session ? <OrderPage session={session} /> : <Navigate to="/login" replace />} />
                    <Route path="/orders/:id" element={session ? <UserOrderDetailsPage session={session} /> : <Navigate to="/login" replace />} />

                    {/* Admin Routes */}
                    <Route path="/admin" element={userRole === "admin" ? <AdminPage session={session} /> : <Navigate to="/" replace />} />
                    <Route path="/admin/orders" element={userRole === "admin" ? <AdminOrdersPage session={session} /> : <Navigate to="/" replace />} />
                    <Route path="/admin/orders/:id" element={userRole === "admin" ? <AdminOrderDetailsPage session={session} /> : <Navigate to="/" replace />} />
                    <Route path="/admin/products/new" element={userRole === "admin" ? <ProductForm session={session} /> : <Navigate to="/" replace />} />
                    <Route path="/admin/products/edit/:id" element={userRole === "admin" ? <ProductForm session={session} /> : <Navigate to="/" replace />} />

                    <Route path="/test-route" element={<div style={{ padding: '100px', textAlign: 'center' }}><h1>TEST ROUTE</h1><p>This route should always be visible</p></div>} />

                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>

                <Footer />
              </Box>
            </Router>
          </CartProvider>
        </WishlistProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;