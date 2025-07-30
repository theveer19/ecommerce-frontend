import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase/supabaseClient';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from Supabase
  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
      console.error('Error fetching products:', error.message);
    } else {
      setProducts(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Delete a product
  const handleDelete = async (productId) => {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) {
      console.error('Delete error:', error.message);
      alert('Failed to delete product.');
    } else {
      alert('Product deleted successfully!');
      fetchProducts(); // Refresh list
    }
  };

  if (loading) return <p>Loading products...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Manage Products</h2>
      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <table border="1" cellPadding="10" style={{ width: '100%', textAlign: 'left' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Price (₹)</th>
              <th>Image</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td>{p.description}</td>
                <td>{p.price}</td>
                <td>
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} width="60" />
                  ) : (
                    'No image'
                  )}
                </td>
                <td>
                  <button onClick={() => handleDelete(p.id)} style={{ background: 'red', color: 'white' }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManageProducts;
