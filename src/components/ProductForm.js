import React, { useState } from 'react';
import { supabase } from '../supabase/supabaseClient';

export default function ProductForm() {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Uploading...');

    let imageUrl = '';

    // Upload image to Supabase Storage
    if (image) {
      const fileName = `${Date.now()}_${image.name}`;
      const { data, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, image);

      if (uploadError) {
        setMessage('Image upload failed');
        return;
      }

      const { data: publicUrlData } = supabase
        .storage
        .from('product-images')
        .getPublicUrl(fileName);

      imageUrl = publicUrlData.publicUrl;
    }

    // Insert product details to DB
    const { error } = await supabase
      .from('products')
      .insert([{ name, description: desc, price, image_url: imageUrl }]);

    if (error) {
      setMessage('Error saving product');
    } else {
      setMessage('Product added successfully!');
      setName('');
      setDesc('');
      setPrice('');
      setImage(null);
    }
  };

  return (
    <div>
      <h2>Add Product</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        /><br/>
        <textarea
          placeholder="Description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          required
        /><br/>
        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        /><br/>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          required
        /><br/>
        <button type="submit">Add Product</button>
      </form>
      <p>{message}</p>
    </div>
  );
}
