import React, { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';

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
const ContactPage = lazy(() => import("./pages/ContactPage")); // ✅ Contact Page Included

// Admin Pages
const AdminPage = lazy(() => import("./pages/AdminPage"));
const AdminOrdersPage = lazy(() => import("./pages/AdminOrders"));
const AdminOrderDetailsPage = lazy(() => import("./pages/AdminOrderDetailsPage"));
const ProductForm = lazy(() => import("./components/ProductForm"));

// --- THEME CONFIGURATION ---
const theme = createTheme({
  palette: {
    primary: {
      main: '#000000',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FFFFFF',
      contrastText: '#000000',
    },
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#000000',
      secondary: '#666666',
    }
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: { fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px' },
    h2: { fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px' },
    h3: { fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' },
    button: {
      fontWeight: 700,
      letterSpacing: '1px',
      textTransform: 'uppercase',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          padding: '12px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
            backgroundColor: '#333',
          },
        },
        contained: {
          backgroundColor: '#000',
          color: '#fff',
        },
        outlined: {
          borderColor: '#000',
          color: '#000',
          borderWidth: '1px',
          '&:hover': {
            backgroundColor: '#000',
            color: '#fff',
            borderWidth: '1px',
          }
        }
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 0, backgroundImage: 'none' }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 0, fontWeight: 700 }
      }
    }
  },
});

// Simple Admin Access Button Component
const AdminAccessButton = ({ userRole }) => {
  if (userRole !== 'admin') return null;
  
  return (
    <button
      onClick={() => window.location.href = "/admin"}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: '#000000',
        color: '#FFFFFF',
        border: 'none',
        padding: '10px 20px',
        fontSize: '12px',
        fontWeight: '700',
        letterSpacing: '1px',
        textTransform: 'uppercase',
        cursor: 'pointer',
        zIndex: 9999,
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
        transition: 'all 0.3s ease',
        fontFamily: '"Inter", sans-serif',
        borderRadius: '0',
      }}
      onMouseEnter={(e) => e.target.style.backgroundColor = '#333333'}
      onMouseLeave={(e) => e.target.style.backgroundColor = '#000000'}
    >
      ADMIN ACCESS
    </button>
  );
};

function App() {
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState('customer');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // 🔥 SAFETY TIMEOUT (Prevents infinite loading)
    const loadingTimeout = setTimeout(() => {
      if (mounted) {
        console.warn("Loading timeout reached. Forcing app render.");
        setLoading(false);
      }
    }, 5000); // 5 seconds max

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
        if (mounted) {
          setLoading(false); 
        }
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
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const fetchUserRole = async (userId) => {
    try {
      const { data } = await supabase.from("users").select("role").eq("id", userId).maybeSingle();
      if (data) {
        setUserRole(data.role);
      } else {
        const { error } = await supabase.from("users").insert({
          id: userId,
          email: session?.user?.email || '',
          name: session?.user?.user_metadata?.name || '',
          role: 'customer',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        
        if (error && error.code !== '23505') {
          console.error("Error creating user:", error);
        }
      }
    } catch (err) {
      console.error("Role fetch error", err);
    }
  };

  const handleLogin = (sessionData) => {
    setSession(sessionData);
    if (sessionData?.user?.id) {
      fetchUserRole(sessionData.user.id);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUserRole('customer');
    window.location.href = "/";
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        <CssBaseline />
        <WishlistProvider>
          <CartProvider>
            <Router>
              <ScrollToTop />
              <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
                
                <AnnouncementBar />
                <Navbar session={session} userRole={userRole} onLogout={handleLogout} />
                <AdminAccessButton userRole={userRole} />

                <Suspense fallback={
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    minHeight: '60vh',
                    color: '#666',
                    fontWeight: 600 
                  }}>
                    Loading page...
                  </Box>
                }>
                  <Routes>
                    <Route path="/" element={<HomePage session={session} />} />
                    <Route path="/products" element={<ProductList session={session} />} />
                    <Route path="/categories" element={<CategoriesPage session={session} />} />
                    <Route path="/product/:id" element={<ProductDetailsPage session={session} />} />
                    <Route path="/about" element={<AboutUsPage session={session} />} />
                    
                    {/* ✅ CONTACT ROUTE */}
                    <Route path="/contact" element={<ContactPage />} />
                    
                    <Route path="/login" element={
                      session ? <Navigate to="/" replace /> : <Auth onLogin={handleLogin} />
                    } />

                    <Route path="/cart" element={<CartPage session={session} />} />
                    <Route path="/wishlist" element={
                      session ? <WishlistPage session={session} /> : <Navigate to="/login" replace />
                    } />
                    <Route path="/checkout" element={
                      session ? <CheckoutPage session={session} /> : <Navigate to="/login" replace />
                    } />
                    <Route path="/thank-you" element={<ThankYouPage session={session} />} />
                    <Route path="/orders" element={
                      session ? <OrderPage session={session} /> : <Navigate to="/login" replace />
                    } />
                    <Route path="/orders/:id" element={
                      session ? <UserOrderDetailsPage session={session} /> : <Navigate to="/login" replace />
                    } />

                    {/* Admin Routes */}
                    <Route path="/admin" element={
                      userRole === "admin" ? <AdminPage session={session} /> : <Navigate to="/" replace />
                    } />
                    <Route path="/admin/orders" element={
                      userRole === "admin" ? <AdminOrdersPage session={session} /> : <Navigate to="/" replace />
                    } />
                    <Route path="/admin/orders/:id" element={
                      userRole === "admin" ? <AdminOrderDetailsPage session={session} /> : <Navigate to="/" replace />
                    } />
                    <Route path="/admin/products/new" element={
                      userRole === "admin" ? <ProductForm session={session} /> : <Navigate to="/" replace />
                    } />
                    <Route path="/admin/products/edit/:id" element={
                      userRole === "admin" ? <ProductForm session={session} /> : <Navigate to="/" replace />
                    } />

                    <Route path="/test-route" element={
                      <div style={{ padding: '100px', textAlign: 'center' }}>
                        <h1>TEST ROUTE</h1>
                        <p>This route should always be visible</p>
                      </div>
                    } />

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