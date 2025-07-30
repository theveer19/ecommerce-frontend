// pages/AdminOrders.js
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase/supabaseClient';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch orders:', error.message);
    } else {
      setOrders(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>📦 All Orders (Admin View)</h2>

      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        orders.map((order) => (
          <div
            key={order.id}
            style={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem',
            }}
          >
            <h4>🧑 User ID: {order.user_id}</h4>
            <p>💰 Total: ₹{order.total_amount}</p>
            <p>📅 Date: {new Date(order.created_at).toLocaleString()}</p>
            <h5>🛒 Items:</h5>
            <ul>
              {(Array.isArray(order.items) ? order.items : []).map((item, index) => (
                <li key={index}>
                  {item.title} — ₹{item.price} × {item.quantity}
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
