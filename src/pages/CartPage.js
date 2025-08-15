// src/pages/CartPage.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const navigate = useNavigate();

  const handleRemove = (id) => removeFromCart(id);

  const handleCheckout = () => {
    // Navigate to checkout page (CheckoutPage will handle Razorpay)
    navigate("/checkout");
  };

  return (
    <div style={{ padding: "1.5rem" }}>
      <h2>🛒 Your Cart</h2>

      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {cartItems.map((item, idx) => (
              <li
                key={`${item.id}-${idx}`}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 0",
                  borderBottom: "1px solid #eee",
                }}
              >
                <div>
                  <strong>{item.name}</strong>
                  <div>₹{item.price} × {item.quantity || 1}</div>
                </div>

                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <input
                    aria-label={`qty-${item.id}`}
                    type="number"
                    min="1"
                    value={item.quantity || 1}
                    onChange={(e) => {
                      const q = parseInt(e.target.value, 10);
                      if (!isNaN(q)) updateQuantity(item.id, q);
                    }}
                    style={{ width: "70px", padding: "6px" }}
                  />
                  <button
                    onClick={() => handleRemove(item.id)}
                    style={{
                      background: "#ff4d4f",
                      color: "#fff",
                      border: "none",
                      padding: "8px 12px",
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div style={{ marginTop: "1rem", textAlign: "right" }}>
            <h3>Total: ₹{getCartTotal().toFixed(2)}</h3>
            <button
              onClick={handleCheckout}
              style={{
                marginTop: "10px",
                padding: "10px 18px",
                backgroundColor: "#3399cc",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}
