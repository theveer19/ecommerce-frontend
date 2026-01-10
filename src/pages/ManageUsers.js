import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase/supabaseClient';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Avatar, Chip, CircularProgress, Container, 
  IconButton, Tooltip 
} from '@mui/material';
import { Edit, Shield, Person, Phone, Email } from '@mui/icons-material';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    // ✅ FIX: Query 'profiles' instead of 'users'
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching profiles:', error.message);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // --- STYLES (Matching Admin Dashboard) ---
  const styles = {
    pageWrapper: {
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh',
      pb: 8, pt: 4
    },
    glassPanel: {
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      border: '1px solid rgba(255, 255, 255, 0.8)',
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      overflow: 'hidden'
    },
    gradientText: {
      background: 'linear-gradient(45deg, #111 30%, #555 90%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      fontWeight: 900,
    },
    tableRow: {
      transition: 'all 0.2s ease',
      '&:hover': {
        background: 'rgba(255,255,255,0.9) !important',
        transform: 'scale(1.005)',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        zIndex: 2,
        position: 'relative'
      }
    }
  };

  return (
    <Box sx={styles.pageWrapper}>
      <Container maxWidth="xl">
        <Box sx={{ mb: 5 }}>
          <Typography variant="h3" sx={styles.gradientText}>User Management</Typography>
          <Typography variant="body1" sx={{ color: '#666', mt: 1 }}>
            View and manage registered customer profiles.
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', height: 400, alignItems: 'center' }}>
            <CircularProgress sx={{ color: 'black' }} />
          </Box>
        ) : users.length === 0 ? (
          <Paper sx={{ ...styles.glassPanel, p: 5, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">No users found.</Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper} sx={styles.glassPanel}>
            <Table>
              <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.03)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, color: '#555' }}>USER</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#555' }}>ROLE</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#555' }}>CONTACT</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#555' }}>JOINED</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#555' }}>ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} sx={styles.tableRow}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar src={user.avatar_url} sx={{ bgcolor: '#111', width: 40, height: 40 }}>
                          {user.full_name?.[0]?.toUpperCase() || <Person />}
                        </Avatar>
                        <Box>
                          <Typography fontWeight={700}>{user.full_name || 'Guest User'}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                            ID: {user.id.slice(0, 8)}...
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        icon={user.role === 'admin' ? <Shield style={{ fontSize: 16 }} /> : <Person style={{ fontSize: 16 }} />}
                        label={user.role?.toUpperCase() || 'CUSTOMER'} 
                        size="small"
                        sx={{ 
                          bgcolor: user.role === 'admin' ? '#8B735520' : '#3B82F620',
                          color: user.role === 'admin' ? '#8B7355' : '#3B82F6',
                          fontWeight: 800,
                          borderRadius: '8px'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Email sx={{ fontSize: 14, color: '#999' }} />
                        <Typography variant="body2" fontWeight={500}>{user.email}</Typography>
                      </Box>
                      {user.phone && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Phone sx={{ fontSize: 14, color: '#999' }} />
                          <Typography variant="caption" color="text.secondary">{user.phone}</Typography>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(user.created_at).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Edit User">
                        <IconButton size="small"><Edit fontSize="small" /></IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </Box>
  );
};

export default ManageUsers;