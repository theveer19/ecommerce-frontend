// src/components/ProductForm.js
import React, { useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  IconButton,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";

export default function ProductForm() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [specifications, setSpecifications] = useState([{ key: "", value: "" }]);
  const [faqs, setFaqs] = useState([{ q: "", a: "" }]);

  const handleAddSpec = () => {
    setSpecifications([...specifications, { key: "", value: "" }]);
  };

  const handleSpecChange = (index, field, value) => {
    const updated = [...specifications];
    updated[index][field] = value;
    setSpecifications(updated);
  };

  const handleRemoveSpec = (index) => {
    const updated = [...specifications];
    updated.splice(index, 1);
    setSpecifications(updated);
  };

  const handleAddFaq = () => {
    setFaqs([...faqs, { q: "", a: "" }]);
  };

  const handleFaqChange = (index, field, value) => {
    const updated = [...faqs];
    updated[index][field] = value;
    setFaqs(updated);
  };

  const handleRemoveFaq = (index) => {
    const updated = [...faqs];
    updated.splice(index, 1);
    setFaqs(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase.from("products").insert([
      {
        name,
        price: parseFloat(price),
        image_url: imageUrl,
        description,
        specifications: specifications.reduce((acc, cur) => {
          if (cur.key && cur.value) acc[cur.key] = cur.value;
          return acc;
        }, {}),
        faqs: faqs.filter((faq) => faq.q && faq.a),
      },
    ]);

    if (error) {
      console.error("Error inserting product:", error);
      alert("Failed to add product!");
    } else {
      alert("Product added successfully!");
      setName("");
      setPrice("");
      setImageUrl("");
      setDescription("");
      setSpecifications([{ key: "", value: "" }]);
      setFaqs([{ q: "", a: "" }]);
    }
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 700, margin: "30px auto" }}>
      <Typography variant="h4" gutterBottom>
        Add New Product
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          margin="normal"
          multiline
          rows={3}
        />

        {/* Specifications */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6">Specifications</Typography>
          {specifications.map((spec, index) => (
            <Box key={index} sx={{ display: "flex", gap: 2, mt: 1 }}>
              <TextField
                label="Key"
                value={spec.key}
                onChange={(e) =>
                  handleSpecChange(index, "key", e.target.value)
                }
              />
              <TextField
                label="Value"
                value={spec.value}
                onChange={(e) =>
                  handleSpecChange(index, "value", e.target.value)
                }
              />
              <IconButton onClick={() => handleRemoveSpec(index)}>
                <Delete />
              </IconButton>
            </Box>
          ))}
          <Button startIcon={<Add />} onClick={handleAddSpec} sx={{ mt: 1 }}>
            Add Specification
          </Button>
        </Box>

        {/* FAQs */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6">FAQs</Typography>
          {faqs.map((faq, index) => (
            <Box key={index} sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}>
              <TextField
                label="Question"
                value={faq.q}
                onChange={(e) => handleFaqChange(index, "q", e.target.value)}
              />
              <TextField
                label="Answer"
                value={faq.a}
                onChange={(e) => handleFaqChange(index, "a", e.target.value)}
              />
              <IconButton onClick={() => handleRemoveFaq(index)}>
                <Delete />
              </IconButton>
            </Box>
          ))}
          <Button startIcon={<Add />} onClick={handleAddFaq} sx={{ mt: 1 }}>
            Add FAQ
          </Button>
        </Box>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 3 }}
        >
          Save Product
        </Button>
      </form>
    </Paper>
  );
}
