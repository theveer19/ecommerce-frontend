import React, { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { supabase } from "../supabase/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function CheckoutPage() {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch role from Supabase
  useEffect(() => {
    const getUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Supabase role fetch error:", error.message);
      }

      setRole(data?.role || null);
      setLoading(false);
    };

    getUserRole();
  }, []);

  // Razorpay payment handler
  const handlePayment = async () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    try {
      const orderData = {
        amount: getCartTotal() * 100, // Razorpay works in paise
        currency: "INR",
      };

      const response = await fetch(
        "https://ecommerce-backend-3v0q.onrender.com/create-order",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        }
      );

      const order = await response.json();

      const options = {
        key: "rzp_test_YourKeyHere",
        amount: order.amount,
        currency: order.currency,
        name: "My E-Commerce Store",
        description: "Order Payment",
        order_id: order.id,
        handler: function (paymentResponse) {
          console.log("Payment successful:", paymentResponse);

          // Save order to Supabase
          supabase
            .from("orders")
            .insert([
              {
                user_id: supabase.auth.user()?.id || null,
                items: cartItems,
                total: getCartTotal(),
                payment_id: paymentResponse.razorpay_payment_id,
              },
            ])
            .then(() => {
              clearCart();
              navigate("/thank-you");
            });
        },
        prefill: {
          name: "Customer Name",
          email: "customer@example.com",
          contact: "9999999999",
        },
        theme: { color: "#3399cc" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Checkout</h1>
      <p>User Role: {role || "Not logged in"}</p>
      <h2>Order Summary</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        cartItems.map((item) => (
          <div key={item.id} style={{ marginBottom: "10px" }}>
            {item.name} x {item.quantity} = ₹{item.price * item.quantity}
          </div>
        ))
      )}
      <h3>Total: ₹{getCartTotal()}</h3>
      <button
        onClick={handlePayment}
        disabled={cartItems.length === 0}
        style={{
          backgroundColor: "#3399cc",
          color: "#fff",
          padding: "10px 20px",
          border: "none",
          cursor: "pointer",
          marginTop: "10px",
        }}
      >
        Pay Now
      </button>
    </div>
  );
}
