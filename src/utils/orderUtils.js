import { 
  Clock, CheckCircle, Truck, XCircle, 
  Package, RefreshCw 
} from "lucide-react";

// Helper functions for order status
export const getStatusIcon = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending': return <Clock style={{ color: '#FF9800' }} />;
    case 'processing': return <RefreshCw style={{ color: '#2196F3' }} />;
    case 'shipped': return <Truck style={{ color: '#4CAF50' }} />;
    case 'delivered': return <CheckCircle style={{ color: '#4CAF50' }} />;
    case 'cancelled': return <XCircle style={{ color: '#F44336' }} />;
    default: return <Package />;
  }
};

export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending': return '#FF9800';
    case 'processing': return '#2196F3';
    case 'shipped': return '#4CAF50';
    case 'delivered': return '#4CAF50';
    case 'cancelled': return '#F44336';
    default: return '#6B6B5A';
  }
};

export const getStatusProgress = (status) => {
  const steps = ['pending', 'processing', 'shipped', 'delivered'];
  const currentIndex = steps.indexOf(status?.toLowerCase());
  return currentIndex >= 0 ? ((currentIndex + 1) / steps.length) * 100 : 0;
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const calculateOrderTotal = (order) => {
  if (!order) return 0;
  const subtotal = order.order_items?.reduce((sum, item) => 
    sum + ((item.quantity || 0) * (item.price_at_time || 0)), 0) || 0;
  const shipping = order.shipping_cost || 0;
  const tax = order.tax_amount || 0;
  const discount = order.discount_amount || 0;
  return subtotal + shipping + tax - discount;
};