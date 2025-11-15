import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase/supabaseClient';
import {
  Box,
  Typography,
  Rating,
  TextField,
  Button,
  Divider,
  Avatar,
  Alert,
} from '@mui/material';
import { useAuth } from '../context/AuthContext'; // We'll need to create an AuthContext if not existing

export default function ProductReviews({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles:user_id (username, avatar_url)
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reviews:', error);
      } else {
        setReviews(data);
      }
    };

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    fetchReviews();
    getUser();
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to submit a review.');
      return;
    }
    if (rating === 0) {
      setError('Please select a rating.');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('reviews')
      .insert([
        {
          product_id: productId,
          user_id: user.id,
          rating,
          comment,
        },
      ])
      .select();

    if (error) {
      setError(error.message);
    } else {
      setReviews([data[0], ...reviews]);
      setRating(0);
      setComment('');
      setError('');
    }
    setLoading(false);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Customer Reviews
      </Typography>

      {/* Review Form */}
      {user ? (
        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
          <Typography variant="subtitle1">Write a Review</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography component="legend">Rating</Typography>
            <Rating
              value={rating}
              onChange={(event, newValue) => {
                setRating(newValue);
              }}
            />
          </Box>
          <TextField
            label="Comment"
            multiline
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            fullWidth
            variant="outlined"
            margin="normal"
          />
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{ mt: 2 }}
          >
            Submit Review
          </Button>
        </Box>
      ) : (
        <Typography>Please log in to write a review.</Typography>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <Typography>No reviews yet.</Typography>
      ) : (
        reviews.map((review) => (
          <Box key={review.id} sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar src={review.profiles?.avatar_url} sx={{ mr: 2 }}>
                {review.profiles?.username?.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="subtitle1">
                  {review.profiles?.username || 'Anonymous'}
                </Typography>
                <Rating value={review.rating} readOnly size="small" />
              </Box>
            </Box>
            <Typography variant="body2" color="textSecondary">
              {new Date(review.created_at).toLocaleDateString()}
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              {review.comment}
            </Typography>
            <Divider sx={{ mt: 2 }} />
          </Box>
        ))
      )}
    </Box>
  );
}