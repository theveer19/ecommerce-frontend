// src/supabase/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gnzkaqenklddezzgicag.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImduemthcWVua2xkZGV6emdpY2FnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NTk3NjcsImV4cCI6MjA2NjIzNTc2N30.TL2K_nHeaWTI7vZM8OfVaMqqVxbYqqx4R8yKrAuwNac';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test the connection
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Supabase connection error:', error.message);
  } else {
    console.log('Supabase connected successfully');
  }
});