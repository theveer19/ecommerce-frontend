import React, { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { supabase } from "../supabase/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function CheckoutPage() {
  const { cartItems, clearCart } = useCart();
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setEmail(user.email);
    };
    fetchUser();
  }, []);

  // ✅ Load Razorpay script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // ✅ Handle payment with Razorpay
  const handlePayment = async () => {
    if (!address || !phone) {
      setMessage("❌ Please fill in all required details.");
      return;
    }

    const res = await loadRazorpayScript();
    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    // ✅ Calculate total amount
    const totalAmount = cartItems.reduce((sum, item) => sum + item.price, 0);

    // ✅ Create Razorpay order from Vercel API
    const orderResponse = await fetch("/api/createOrder", {   // ✅ CHANGED to Vercel API route
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: totalAmount }),
    });

    const orderData = await orderResponse.json();
    if (!orderData.id) {
      alert("❌ Failed to create Razorpay order");
      return;
    }

    // ✅ Razorpay options
    const options = {
      key: "rzp_test_xxxxxx", // 🔑 Replace with your real Razorpay key_id (or store in .env)
      amount: orderData.amount,
      currency: orderData.currency,
      name: "My E-Commerce",
      description: "Order Payment",
      order_id: orderData.id,
      handler: async function (response) {
        // ✅ Save order details to Supabase
        const { data: { user } } = await supabase.auth.getUser();
        const user_id = user?.id;

        const { data, error } = await supabase
          .from("orders")
          .insert([
            {
              user_id,
              total_amount: totalAmount,
              items: cartItems,
              address,
              phone,
              payment_method: "Razorpay",
              payment_id: response.razorpay_payment_id,
            },
          ])
          .select()
          .single();

        if (error) {
          console.error("Order save failed:", error);
          setMessage("❌ Order failed. Please try again.");
        } else {
          clearCart();
          navigate("/thank-you", { state: { orderDetails: data } });
        }
      },
      prefill: {
        email,
        contact: phone,
      },
      theme: { color: "#3399cc" },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  return (
    <div style={{
      padding: "2rem",
      maxWidth: "500px",
      margin: "auto",
      background: "#fff",
      borderRadius: "10px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
    }}>
      <h2>🛒 Checkout</h2>
      <label>Email:</label>
      <input type="email" value={email} readOnly style={inputStyle} />

      <label>Address:</label>
      <textarea value={address} onChange={(e) => setAddress(e.target.value)} style={inputStyle} />

      <label>Phone:</label>
      <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} />

      <h3>Total: ₹{cartItems.reduce((sum, item) => sum + item.price, 0)}</h3>

      <button onClick={handlePayment} style={btnStyle}>💳 Pay with Razorpay</button>

      {message && <p>{message}</p>}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "12px",
  border: "1px solid #ddd",
  borderRadius: "6px"
};

const btnStyle = {
  width: "100%",
  backgroundColor: "#3399cc",
  color: "white",
  border: "none",
  padding: "12px",
  fontSize: "16px",
  borderRadius: "8px",
  cursor: "pointer"
};
