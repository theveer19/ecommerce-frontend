import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { supabase } from '../supabase/supabaseClient';

export default function CartPage() {
  const { cartItems, removeFromCart, clearCart } = useCart();
  const [successMessage, setSuccessMessage] = useState('');

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;

    const user = await supabase.auth.getUser();
    const user_id = user?.data?.user?.id;

    const total_amount = cartItems.reduce((sum, item) => sum + item.price, 0);

    const { error } = await supabase.from('orders').insert([
      {
        user_id,
        total_amount,
        items: cartItems,
      },
    ]);

    if (error) {
      console.error('Order failed:', error);
      setSuccessMessage('❌ Order failed. Please try again.');
    } else {
      setSuccessMessage('✅ Order placed successfully!');
      clearCart();
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>🛒 Your Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul>
            {cartItems.map((item, index) => (
              <li key={index}>
                {item.name} - ₹{item.price}
                <button onClick={() => removeFromCart(item.id)}>Remove</button>
              </li>
            ))}
          </ul>
          <h3>Total: ₹{cartItems.reduce((sum, item) => sum + item.price, 0)}</h3>
          <button onClick={handlePlaceOrder}>Place Order</button>
        </>
      )}
      {successMessage && <p>{successMessage}</p>}
    </div>
  );
}
