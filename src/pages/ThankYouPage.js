import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function ThankYouPage() {
  const location = useLocation();
  const orderDetails = location.state?.orderDetails;

  return (
    <div style={{
      background: "#f3f3f3",
      minHeight: "100vh",
      padding: "50px 20px",
      textAlign: "center"
    }}>
      <div style={{
        background: "white",
        maxWidth: "600px",
        margin: "0 auto",
        padding: "30px",
        borderRadius: "12px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
      }}>
        <h1 style={{ color: "#1a8917", fontSize: "2rem" }}>✅ Thank you for your order!</h1>
        <p style={{ fontSize: "1.2rem", marginBottom: "20px" }}>
          Your order has been successfully placed.
        </p>

        {orderDetails && (
          <div style={{
            border: "1px solid #ddd",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "20px",
            textAlign: "left"
          }}>
            <h3>📦 <b>Order Summary</b></h3>
            <p><strong>Order ID:</strong> {orderDetails.id}</p>
            <p><strong>Total Amount:</strong> ₹{orderDetails.total_amount}</p>
            <p><strong>Payment Method:</strong> {orderDetails.payment_method}</p>
            <p><strong>Shipping Address:</strong> {orderDetails.address}</p>
            <p><strong>Phone:</strong> {orderDetails.phone}</p>
            <h4>🛒 Items:</h4>
            <ul>
              {orderDetails.items?.map((item, idx) => (
                <li key={idx}>{item.name} – ₹{item.price}</li>
              ))}
            </ul>
          </div>
        )}

        <Link to="/products">
          <button style={{
            backgroundColor: "#FFD814",
            border: "1px solid #FCD200",
            padding: "12px 25px",
            fontSize: "16px",
            borderRadius: "8px",
            cursor: "pointer"
          }}>
            🛍 Continue Shopping
          </button>
        </Link>
      </div>
    </div>
  );
}
