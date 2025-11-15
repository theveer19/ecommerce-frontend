// src/pages/OrderHistoryPage.js
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase/supabaseClient';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Error fetching user:', userError);
        return;
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
      } else {
        setOrders(data);
      }

      setLoading(false);
    };

    fetchOrders();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>📦 Order History</h2>
      {loading ? (
        <p>Loading...</p>
      ) : orders.length === 0 ? (
        <p>No past orders found.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {orders.map((order, index) => (
            <li key={order.id} style={{ marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
              <strong>🧾 Order #{orders.length - index}</strong><br />
              📅 <b>Date:</b> {new Date(order.created_at).toLocaleString()}<br />
              💰 <b>Total:</b> ₹{order.total_amount}<br />
              🛒 <b>Items:</b>
              <ul>
                {Array.isArray(order.items)
                  ? order.items.map((item, idx) => (
                      <li key={idx}>
                        {item.name} (x{item.quantity})
                      </li>
                    ))
                  : "Invalid items format"}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
