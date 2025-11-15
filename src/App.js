import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Auth from "./components/Auth";
import Navbar from "./components/Navbar";
import ProductForm from "./components/ProductForm";
import ProductList from "./components/ProductList";
import CartPage from "./pages/CartPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import { supabase } from "./supabase/supabaseClient";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import AdminPage from "./pages/AdminPage";
import AdminOrders from "./pages/AdminOrders";
import ManageProducts from "./pages/ManageProducts";
import ManageUsers from "./pages/ManageUsers";
import CheckoutPage from "./pages/CheckoutPage";
import ThankYouPage from "./pages/ThankYouPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import Footer from "./components/Footer";
import DealsPage from "./pages/DealsPage";
import CategoriesPage from "./pages/CategoriesPage";
import AboutUsPage from "./pages/AboutUsPage";
import WishlistPage from "./pages/WishlistPage";

function App() {
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // Add this function to create user in database if missing
  const createUserInDatabase = useCallback(async (userId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('users')
          .insert([
            { 
              id: userId, 
              email: user.email, 
              role: 'customer' 
            }
          ]);
        
        if (error && !error.message.includes('duplicate key')) {
          console.error('Error creating user in database:', error);
        }
      }
    } catch (err) {
      console.error('Error in createUserInDatabase:', err);
    }
  }, []);

  // Fetch user role from 'users' table (uses maybeSingle())
  const fetchUserRole = useCallback(async (userId) => {
    try {
      if (!userId) {
        setUserRole(null);
        return;
      }
      
      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching role:", error);
        // If user doesn't exist in users table, create them
        await createUserInDatabase(userId);
        setUserRole('customer'); // Default role
        return;
      }
      
      setUserRole(data?.role || 'customer'); // Default to customer if null
    } catch (err) {
      console.error("Error fetching role:", err);
      setUserRole('customer');
    }
  }, [createUserInDatabase]);

  useEffect(() => {
    // get initial session + role
    const getSessionAndRole = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const currentSession = data?.session ?? null;
        setSession(currentSession);
        if (currentSession?.user?.id) {
          await fetchUserRole(currentSession.user.id);
        }
      } catch (err) {
        console.error("Error getting session:", err);
      }
    };

    getSessionAndRole();

    // subscribe to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession?.user?.id) fetchUserRole(newSession.user.id);
      else setUserRole(null);
    });

    // cleanup subscription on unmount
    return () => {
      if (listener?.subscription?.unsubscribe) {
        listener.subscription.unsubscribe();
      } else if (typeof listener?.unsubscribe === "function") {
        listener.unsubscribe();
      }
    };
  }, [fetchUserRole]); // Added fetchUserRole to dependencies

  const handleLogin = useCallback((newSession) => {
    setSession(newSession);
    if (newSession?.user?.id) {
      fetchUserRole(newSession.user.id);
    } else {
      setUserRole(null);
    }
  }, [fetchUserRole]);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUserRole(null);
  }, []);

  return (
    <WishlistProvider>
      <CartProvider>
        <Router>
          <Navbar userRole={userRole} session={session} onLogout={handleLogout} />

          <Routes>
            {/* Root: show Auth if not logged in, otherwise go to products */}
            <Route
              path="/"
              element={session ? <Navigate to="/products" replace /> : <Auth onLogin={handleLogin} />}
            />

            {/* PRODUCTS: public listing (anyone can view) */}
            <Route
              path="/products"
              element={
                <>
                  {/* Admin can see ProductForm above the listing */}
                  {userRole === "admin" && <ProductForm />}
                  <ProductList />
                </>
              }
            />

            {/* New Routes */}
            <Route path="/deals" element={<DealsPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/about" element={<AboutUsPage />} />
            <Route path="/wishlist" element={session ? <WishlistPage /> : <Navigate to="/" replace />} />

            {/* Product details (public) */}
            <Route path="/product/:id" element={<ProductDetailsPage />} />

            {/* Protected routes (require login) */}
            <Route path="/cart" element={session ? <CartPage /> : <Navigate to="/" replace />} />
            <Route path="/orders" element={session ? <OrderHistoryPage /> : <Navigate to="/" replace />} />
            <Route path="/checkout" element={session ? <CheckoutPage /> : <Navigate to="/" replace />} />

            {/* Thank you page can be public (displays order details passed in state) */}
            <Route path="/thank-you" element={<ThankYouPage />} />

            {/* Admin-only routes — only register them if userRole === 'admin' */}
            {userRole === "admin" && (
              <>
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/admin/products" element={<ManageProducts />} />
                <Route path="/admin/users" element={<ManageUsers />} />
              </>
            )}

            {/* Fallback: redirect unknown routes to /products */}
            <Route path="*" element={<Navigate to="/products" replace />} />
          </Routes>

          <Footer />
        </Router>
      </CartProvider>
    </WishlistProvider>
  );
}

export default App;