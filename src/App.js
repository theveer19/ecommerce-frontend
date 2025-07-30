// ✅ App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './components/Auth';
import Navbar from './components/Navbar';
import ProductForm from './components/ProductForm';
import ProductList from './components/ProductList';
import CartPage from './pages/CartPage';
import OrderHistory from './pages/OrderHistory';
import { supabase } from './supabase/supabaseClient';
import { CartProvider } from './context/CartContext';
import AdminPage from './pages/AdminPage';
import AdminOrders from './pages/AdminOrders';
import ManageProducts from './pages/ManageProducts';
import ManageUsers from './pages/ManageUsers';

function App() {
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const getSessionAndRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session?.user) fetchUserRole(session.user.id);
    };

    getSessionAndRole();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) fetchUserRole(session.user.id);
    });

    return () => {
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  const fetchUserRole = async (userId) => {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (data?.role) {
      setUserRole(data.role);
    } else {
      console.error('Error fetching role:', error);
      setUserRole(null);
    }
  };

  const handleLogin = (session) => {
    setSession(session);
    if (session?.user) fetchUserRole(session.user.id);
  };

  return (
    <CartProvider>
      <Router>
        <Navbar userRole={userRole} />
        <Routes>
          <Route
            path="/"
            element={session ? <Navigate to="/products" /> : <Auth onLogin={handleLogin} />}
          />
          <Route
            path="/products"
            element={
              session ? (
                <>
                  {userRole === 'admin' && <ProductForm />}
                  <ProductList />
                </>
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route path="/cart" element={session ? <CartPage /> : <Navigate to="/" />} />
          <Route path="/orders" element={session ? <OrderHistory /> : <Navigate to="/" />} />

          {/* Admin-only routes */}
          {userRole === 'admin' && (
            <>
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/products" element={<ManageProducts />} />
              <Route path="/admin/users" element={<ManageUsers />} />
            </>
          )}
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
