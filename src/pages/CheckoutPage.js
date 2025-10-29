import React, { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";

// Change this to your deployed backend if needed
const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || "https://ecommerce-backend-3v0q.onrender.com";

export default function CheckoutPage() {
  const { cartItems, clearCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ ADDED: Authentication check and redirect
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/");
        return;
      }
    };
    checkAuth();
  }, [navigate]);

  // Expecting ProductDetailsPage to send { buyNowItem: {...} }
  const buyNowItem = location.state?.buyNowItem ?? null;

  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [session, setSession] = useState(null);

  // populate email if logged in
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user, session },
        } = await supabase.auth.getSession();
        setSession(session);
        if (user) setEmail(user.email || "");
      } catch (err) {
        console.warn("Could not fetch supabase user:", err);
      }
    };
    fetchUser();
  }, []);

  // compute totalAmount from buyNowItem OR cartItems
  useEffect(() => {
    const items = buyNowItem ? [buyNowItem] : (cartItems || []);
    const amount = items.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const qty = Number(item.quantity || 1);
      return sum + price * qty;
    }, 0);
    setTotalAmount(amount);
  }, [cartItems, buyNowItem]);

  // load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Save order on backend. If buyNowItem is present we DO NOT clear cart.
  const saveOrder = async (paymentMethod, paymentId = "") => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const itemsToSave = buyNowItem ? [buyNowItem] : cartItems;

      const res = await fetch(`${BACKEND_URL}/save-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user?.id || null,
          items: itemsToSave,
          total_amount: totalAmount,
          address,
          phone,
          payment_method: paymentMethod,
          payment_id: paymentId,
        }),
      });

      const result = await res.json();

      if (result.success) {
        // Only clear the cart when the order was placed from the cart (not buyNow)
        if (!buyNowItem) clearCart();
        // Navigate to thank-you with order details (if backend returns them)
        navigate("/thank-you", { state: { orderDetails: result.order || { id: result.orderId, total_amount: totalAmount, items: itemsToSave, address, phone, payment_method: paymentMethod } } });
      } else {
        setMessage("❌ Order save failed");
      }
    } catch (err) {
      console.error("Failed to save order:", err);
      setMessage("❌ Order save failed");
    }
  };

  // Handler: Razorpay
  const handleRazorpay = async () => {
    if (!session) {
      setMessage("❌ Please sign in to complete your purchase");
      navigate("/");
      return;
    }

    if (!address || !phone) {
      setMessage("❌ Please fill all fields");
      return;
    }

    const sdkLoaded = await loadRazorpayScript();
    if (!sdkLoaded) {
      alert("Razorpay SDK failed to load");
      return;
    }

    try {
      // Send totalAmount in INR to backend; backend should convert to paise
      const orderRes = await fetch(`${BACKEND_URL}/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalAmount }), // backend multiplies by 100
      });

      if (!orderRes.ok) {
        const body = await orderRes.text();
        console.error("Create-order response not ok:", orderRes.status, body);
        throw new Error("Failed to create order");
      }

      const order = await orderRes.json();

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY || "rzp_test_AiMI5J5tPyfEYz",
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: "My E-Commerce",
        description: "Order Payment",
        handler: async function (response) {
          // response.razorpay_payment_id
          await saveOrder("Razorpay", response.razorpay_payment_id);
        },
        prefill: { email, contact: phone },
        theme: { color: "#3399cc" },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error("Razorpay error:", err);
      setMessage("❌ Payment failed. Please try again.");
    }
  };

  // Handler: Cash on Delivery
  const handleCOD = async () => {
    if (!session) {
      setMessage("❌ Please sign in to complete your purchase");
      navigate("/");
      return;
    }

    if (!address || !phone) {
      setMessage("❌ Please fill all fields");
      return;
    }
    await saveOrder("Cash on Delivery");
  };

  const itemsToShow = buyNowItem ? [buyNowItem] : (cartItems || []);

  return (
    <div style={checkoutStyle}>
      <h2>🛒 Checkout</h2>
      
      {!session ? (
        <div style={authWarningStyle}>
          <p>🔐 Please sign in to complete your purchase</p>
          <button 
            onClick={() => navigate("/")}
            style={signInButtonStyle}
          >
            Sign In Now
          </button>
        </div>
      ) : (
        <>
          <label>Email:</label>
          <input type="email" value={email} readOnly style={inputStyle} />

          <label>Address:</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            style={inputStyle}
            placeholder="Enter your complete delivery address"
          />

          <label>Phone:</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={inputStyle}
            placeholder="Enter your phone number"
          />

          <h3>Order Summary:</h3>
          {itemsToShow.map((item) => (
            <p key={`${item.id}-${item.quantity ?? 1}`}>
              {item.name} × {item.quantity || 1} — ₹
              {(Number(item.price) * (item.quantity || 1)).toFixed(2)}
            </p>
          ))}

          <h3>Total: ₹{totalAmount.toFixed(2)}</h3>

          <button onClick={handleRazorpay} style={btnStyle}>
            💳 Pay with Razorpay
          </button>
          <button
            onClick={handleCOD}
            style={{ ...btnStyle, backgroundColor: "#555", marginTop: "10px" }}
          >
            📦 Cash on Delivery
          </button>

          {message && <p style={{ color: "red", marginTop: 12 }}>{message}</p>}
        </>
      )}
    </div>
  );
}

/* Simple inline styles */
const checkoutStyle = {
  padding: "2rem",
  maxWidth: "500px",
  margin: "auto",
  background: "#fff",
  borderRadius: "10px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  minHeight: "400px",
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "12px",
  border: "1px solid #ddd",
  borderRadius: "6px",
};

const btnStyle = {
  width: "100%",
  backgroundColor: "#3399cc",
  color: "white",
  border: "none",
  padding: "12px",
  fontSize: "16px",
  borderRadius: "8px",
  cursor: "pointer",
};

const authWarningStyle = {
  textAlign: 'center',
  padding: '40px 20px',
  color: '#666',
};

const signInButtonStyle = {
  backgroundColor: "#22c55e",
  color: "white",
  border: "none",
  padding: "12px 24px",
  fontSize: "16px",
  borderRadius: "8px",
  cursor: "pointer",
  marginTop: '20px',
};