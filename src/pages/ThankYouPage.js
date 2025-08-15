import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import confetti from "canvas-confetti";

export default function ThankYouPage() {
  const location = useLocation();
  const orderDetails = location.state?.orderDetails;

  useEffect(() => {
    // 🎉 Trigger confetti once
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
    });
  }, []);

  return (
    <div
      style={{
        background: "#f9fafb",
        minHeight: "100vh",
        padding: "50px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "white",
          maxWidth: "600px",
          width: "100%",
          padding: "30px",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          textAlign: "center",
        }}
      >
        <h1 style={{ color: "#22c55e", fontSize: "2rem", marginBottom: "10px" }}>
          ✅ Thank you for your order!
        </h1>
        <p style={{ fontSize: "1.1rem", marginBottom: "25px", color: "#555" }}>
          Your order has been successfully placed. We’ll reach out soon!
        </p>

        {orderDetails ? (
          <div
            style={{
              textAlign: "left",
              backgroundColor: "#f1f5f9",
              padding: "20px",
              borderRadius: "12px",
              marginBottom: "30px",
            }}
          >
            <h3 style={{ marginBottom: "10px" }}>📦 <b>Order Summary</b></h3>
            <p><strong>🆔 Order ID:</strong> {orderDetails.id}</p>
            <p><strong>💰 Total Amount:</strong> ₹{orderDetails.total_amount}</p>
            <p><strong>💳 Payment Method:</strong> {orderDetails.payment_method}</p>
            <p><strong>🏠 Address:</strong> {orderDetails.address}</p>
            <p><strong>📞 Phone:</strong> {orderDetails.phone}</p>
            <h4 style={{ marginTop: "10px" }}>🛒 Items:</h4>
            <ul style={{ paddingLeft: "20px" }}>
              {orderDetails.items?.map((item, idx) => (
                <li key={idx}>
                  {item.name} – ₹{item.price}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p>⚠️ No order details found.</p>
        )}

        <Link to="/products">
          <button
            style={{
              backgroundColor: "#ffd814",
              border: "none",
              padding: "12px 25px",
              fontSize: "16px",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "bold",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
          >
            🛍 Continue Shopping
          </button>
        </Link>
      </div>
    </div>
  );
}
