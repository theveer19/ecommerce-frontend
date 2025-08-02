// src/pages/ManageProducts.js
import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "../supabase/supabaseClient";


const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [trash, setTrash] = useState([]);
  const [loading, setLoading] = useState(true);
  const [countAnim, setCountAnim] = useState({ total: 0, active: 0, trash: 0 });

  // ✅ Fetch products (Memoized to prevent useEffect warnings)
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("products").select("*");

    if (error) {
      console.error("❌ Error fetching products:", error.message);
    } else {
      const active = data.filter((p) => !p.is_deleted);
      const trashed = data.filter((p) => p.is_deleted);

      setProducts(active);
      setTrash(trashed);

      // ✅ Animate counts
      animateCount("total", data.length);
      animateCount("active", active.length);
      animateCount("trash", trashed.length);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ✅ Count-up animation
  const animateCount = (key, target) => {
    let start = 0;
    const duration = 700;
    const increment = target / (duration / 30);

    const counter = setInterval(() => {
      start += increment;
      if (start >= target) {
        start = target;
        clearInterval(counter);
      }
      setCountAnim((prev) => ({ ...prev, [key]: Math.floor(start) }));
    }, 30);
  };

  // ✅ SOFT DELETE (move to trash)
  const handleSoftDelete = async (id) => {
    const { error } = await supabase
      .from("products")
      .update({ is_deleted: true })
      .eq("id", id);

    if (error) {
      alert("❌ Failed to move product to trash");
      console.error(error);
    } else {
      alert("🗑 Product moved to trash!");
      fetchProducts();
    }
  };

  // ✅ PERMANENT DELETE (remove from DB)
  const handlePermanentDelete = async (id) => {
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      alert("❌ Failed to delete product permanently");
      console.error(error);
    } else {
      alert("✅ Product deleted permanently!");
      fetchProducts();
    }
  };

  return (
    <div style={{ padding: "20px", background: "#f9fafb", minHeight: "100vh" }}>
      <h2 style={{ marginBottom: "20px", color: "#333" }}>📦 Manage Products</h2>

      {/* ✅ ANALYTICS */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <AnalyticsCard label="Total Products" count={countAnim.total} color="linear-gradient(135deg, #6EE7B7, #3B82F6)" />
        <AnalyticsCard label="Active Products" count={countAnim.active} color="linear-gradient(135deg, #A7F3D0, #10B981)" />
        <AnalyticsCard label="In Trash" count={countAnim.trash} color="linear-gradient(135deg, #FCA5A5, #EF4444)" />
      </div>

      {/* ✅ LOADING */}
      {loading ? (
        <p>Loading products...</p>
      ) : (
        <>
          {/* ✅ ACTIVE PRODUCTS TABLE */}
          <h3>✅ Active Products</h3>
          {products.length === 0 ? (
            <p>No active products.</p>
          ) : (
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Image</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.name}</td>
                    <td>₹{p.price}</td>
                    <td>
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} width="50" />
                      ) : (
                        "No image"
                      )}
                    </td>
                    <td>
                      <button
                        style={softBtn}
                        onClick={() => handleSoftDelete(p.id)}
                      >
                        🗑 Move to Trash
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* ✅ TRASHED PRODUCTS TABLE */}
          <h3 style={{ marginTop: "30px" }}>🗑 Trash</h3>
          {trash.length === 0 ? (
            <p>No products in trash.</p>
          ) : (
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Image</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {trash.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.name}</td>
                    <td>₹{p.price}</td>
                    <td>
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} width="50" />
                      ) : (
                        "No image"
                      )}
                    </td>
                    <td>
                      <button
                        style={deleteBtn}
                        onClick={() => handlePermanentDelete(p.id)}
                      >
                        ❌ Delete Forever
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
};

export default ManageProducts;

const AnalyticsCard = ({ label, count, color }) => (
  <div
    style={{
      flex: 1,
      padding: "20px",
      borderRadius: "12px",
      textAlign: "center",
      color: "white",
      fontWeight: "bold",
      background: color,
      boxShadow: "0 5px 15px rgba(0, 0, 0, 0.2)",
      transition: "transform 0.3s ease",
      cursor: "pointer",
      minWidth: "150px",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
  >
    <h3 style={{ margin: 0, fontSize: "2.2rem" }}>{count}</h3>
    <p style={{ margin: 0, fontSize: "1rem" }}>{label}</p>
  </div>
);

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "10px",
};

const softBtn = {
  background: "#FBBF24",
  padding: "6px 10px",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

const deleteBtn = {
  background: "#EF4444",
  color: "white",
  padding: "6px 10px",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};
