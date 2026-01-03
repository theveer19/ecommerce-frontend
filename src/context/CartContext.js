import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      // Check if user is logged in by looking for auth session in localStorage
      const hasUserSession = localStorage.getItem('sb-') || 
                            document.cookie.includes('supabase-auth-token');
      
      if (hasUserSession) {
        // User is logged in - use cartItems
        const userCart = localStorage.getItem("cartItems");
        return userCart ? JSON.parse(userCart) : [];
      } else {
        // User is guest - use guestCart
        const guestCart = localStorage.getItem("guestCart");
        return guestCart ? JSON.parse(guestCart) : [];
      }
    } catch {
      return [];
    }
  });

  const [isGuest, setIsGuest] = useState(true);

  // Check if user is logged in
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const hasUserSession = localStorage.getItem('sb-') || 
                              document.cookie.includes('supabase-auth-token');
        setIsGuest(!hasUserSession);
      } catch (err) {
        console.error("Error checking auth status:", err);
        setIsGuest(true);
      }
    };
    
    checkAuthStatus();
    // Check every 2 seconds (for OAuth redirects)
    const interval = setInterval(checkAuthStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  // Save cart to appropriate localStorage key - useCallback to fix dependency issue
  const saveCart = useCallback((items) => {
    try {
      const cartKey = isGuest ? "guestCart" : "cartItems";
      localStorage.setItem(cartKey, JSON.stringify(items));
    } catch (err) {
      console.error("Failed to save cart:", err);
    }
  }, [isGuest]);

  // Convert guest cart to user cart when user logs in
  const convertGuestToUserCart = useCallback(() => {
    try {
      const guestCart = localStorage.getItem("guestCart");
      if (guestCart) {
        const guestItems = JSON.parse(guestCart);
        const userCart = localStorage.getItem("cartItems");
        let mergedItems = [...guestItems];
        
        if (userCart) {
          const userItems = JSON.parse(userCart);
          
          // Merge items by product ID
          userItems.forEach((userItem) => {
            const existingIndex = mergedItems.findIndex(item => item.id === userItem.id);
            if (existingIndex > -1) {
              // Update quantity
              mergedItems[existingIndex].quantity += userItem.quantity;
            } else {
              // Add new item
              mergedItems.push(userItem);
            }
          });
        }
        
        setCartItems(mergedItems);
        localStorage.setItem("cartItems", JSON.stringify(mergedItems));
        localStorage.removeItem("guestCart");
        setIsGuest(false);
        return mergedItems;
      }
    } catch (err) {
      console.error("Error converting guest cart:", err);
    }
    return cartItems;
  }, [cartItems]);

  // Clear guest cart (when user logs out or cart is cleared)
  const clearGuestCart = useCallback(() => {
    if (isGuest) {
      localStorage.removeItem("guestCart");
    } else {
      localStorage.removeItem("cartItems");
    }
  }, [isGuest]);

  // Save cart whenever cartItems or isGuest changes
  useEffect(() => {
    saveCart(cartItems);
  }, [cartItems, saveCart]);

  const addToCart = useCallback((product, qty = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      let newCart;
      
      if (existing) {
        newCart = prev.map((p) =>
          p.id === product.id ? { ...p, quantity: (p.quantity || 1) + qty } : p
        );
      } else {
        newCart = [...prev, { ...product, quantity: qty }];
      }
      
      return newCart;
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCartItems((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) => prev.map((p) => (p.id === productId ? { ...p, quantity } : p)));
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    clearGuestCart();
  }, [clearGuestCart]);

  const getCartTotal = useCallback(() => {
    return cartItems.reduce((sum, it) => sum + Number(it.price || 0) * (it.quantity || 1), 0);
  }, [cartItems]);

  const getCartCount = useCallback(() => {
    return cartItems.reduce((count, item) => count + (item.quantity || 1), 0);
  }, [cartItems]);

  const isCartEmpty = useCallback(() => {
    return cartItems.length === 0;
  }, [cartItems]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        isCartEmpty,
        isGuest,
        convertGuestToUserCart,
        clearGuestCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}