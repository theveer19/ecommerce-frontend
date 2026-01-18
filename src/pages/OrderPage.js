import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";
import { 
  Package, Clock, CheckCircle, Truck, XCircle, 
  RefreshCw, Search, Loader, ArrowRight, AlertCircle,
  MapPin, ExternalLink, Calendar, Filter, Hash, CreditCard,
  ShoppingBag, ChevronRight, Eye, Download, ShoppingCart,
  MessageCircle, Mail, Phone, Shield, Star
} from "lucide-react";

// --- LOGIC: Custom hook for fetching orders ---
const useUserOrders = (userId) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      setOrders([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // ✅ CHANGE 1: Simplified Query (No foreign key join)
      const { data, error: fetchError } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            id,
            product_name,
            quantity,
            price_at_time,
            image_url
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      
      // ✅ CHANGE 2: No transformation needed
      setOrders(data || []);
    } catch (err) {
      console.error("Error fetching user orders:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId !== undefined) {
      fetchOrders();
    }
  }, [userId, fetchOrders]);

  return { orders, loading, error, refetch: fetchOrders };
};

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [showReorderConfirm, setShowReorderConfirm] = useState(false);
  const [selectedOrderForReorder, setSelectedOrderForReorder] = useState(null);
  const navigate = useNavigate();

  // --- LOGIC: Session Management ---
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) setUser(null);
        else setUser(data.user);
      } catch (err) {
        setUser(null);
      } finally {
        setUserLoading(false);
      }
    };
    getUser();
  }, []);

  const { orders, loading, error, refetch } = useUserOrders(user?.id);
  const isLoading = userLoading || (loading && user?.id);

  useEffect(() => {
    if (!userLoading && !user) navigate('/login');
  }, [user, userLoading, navigate]);

  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter(o => (o.status || '').toLowerCase() === 'pending').length,
    processing: orders.filter(o => (o.status || '').toLowerCase() === 'processing').length,
    shipped: orders.filter(o => (o.status || '').toLowerCase() === 'shipped').length,
    delivered: orders.filter(o => (o.status || '').toLowerCase() === 'delivered').length,
    cancelled: orders.filter(o => (o.status || '').toLowerCase() === 'cancelled').length,
  }), [orders]);

  // --- LOGIC: Helpers ---
  const getStatusIcon = useCallback((orderStatus) => {
    const status = (orderStatus || '').toLowerCase();
    switch (status) {
      case 'pending': return <Clock size={18} />;
      case 'processing': return <RefreshCw size={18} />;
      case 'shipped': return <Truck size={18} />;
      case 'delivered': return <CheckCircle size={18} />;
      case 'cancelled': return <XCircle size={18} />;
      default: return <Package size={18} />;
    }
  }, []);

  const getStatusColor = useCallback((orderStatus) => {
    const status = (orderStatus || '').toLowerCase();
    switch (status) {
      case 'pending': return '#F59E0B'; 
      case 'processing': return '#3B82F6'; 
      case 'shipped': return '#8B5CF6'; 
      case 'delivered': return '#10B981'; 
      case 'cancelled': return '#EF4444'; 
      default: return '#6B7280'; 
    }
  }, []);

  const getStatusProgress = useCallback((orderStatus) => {
    const steps = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIndex = steps.indexOf((orderStatus || '').toLowerCase());
    return currentIndex >= 0 ? ((currentIndex + 1) / steps.length) * 100 : 0;
  }, []);

  const getTrackingUrl = useCallback((trackingNumber, carrier) => {
    const carriers = {
      'dhl': `https://www.dhl.com/in-en/home/tracking/tracking-express.html?submit=1&tracking-id=${trackingNumber}`,
      'fedex': `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
      'ups': `https://www.ups.com/track?tracknum=${trackingNumber}`,
      'indiapost': `https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx`,
      'bluedart': `https://www.bluedart.com/tracking.html`,
      'delhivery': `https://www.delhivery.com/track/package/${trackingNumber}`,
      'ekart': `https://ekartlogistics.com/track/${trackingNumber}`,
      'default': `https://www.17track.net/en/track?nums=${trackingNumber}`
    };
    return carriers[(carrier || '').toLowerCase()] || carriers.default;
  }, []);

  const formatDateTime = useCallback((dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch { return 'Invalid date'; }
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = searchTerm === '' || 
        (order.order_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.order_items?.some(item => 
          (item.product_name || '').toLowerCase().includes(searchTerm.toLowerCase()) // ✅ CHANGE 3: Use product_name
        );
      
      const matchesFilter = filterStatus === 'all' || 
        (order.status || '').toLowerCase() === filterStatus.toLowerCase();
      
      return matchesSearch && matchesFilter;
    });
  }, [orders, searchTerm, filterStatus]);

  // --- ACTIONS ---
  const handleTrackOrder = useCallback((order) => {
    if (order.tracking_number) {
      const url = getTrackingUrl(order.tracking_number, order.shipping_carrier);
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      alert("Tracking information will be available once your order is shipped.");
    }
  }, [getTrackingUrl]);

  const handleViewDetails = useCallback((orderId) => {
    navigate(`/orders/${orderId}`);
  }, [navigate]);

  const handleContactSupport = useCallback((order) => {
    const subject = `Support Request for Order ${order.order_number || order.id}`;
    const body = `Order Number: ${order.order_number || order.id}\nStatus: ${order.status}\nIssue: `;
    window.location.href = `mailto:support@onet.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, []);

  const handleReorderClick = useCallback((order) => {
    setSelectedOrderForReorder(order);
    setShowReorderConfirm(true);
  }, []);

  const confirmReorder = useCallback(() => {
    if (selectedOrderForReorder) {
      console.log("Reordering items from order:", selectedOrderForReorder);
      alert("Items added to cart successfully!");
      setShowReorderConfirm(false);
      setSelectedOrderForReorder(null);
    }
  }, [selectedOrderForReorder]);

  const cancelReorder = useCallback(() => {
    setShowReorderConfirm(false);
    setSelectedOrderForReorder(null);
  }, []);

  const handleDownloadInvoice = useCallback((order) => {
    const invoiceContent = `
      .----------------.  .----------------.  .----------------.  .----------------. 
     | .--------------. || .--------------. || .--------------. || .--------------. |
     | |     ____     | || | ____  _____  | || |  _________   | || |  _________   | |
     | |   .'    '.   | || ||_   \\|_   _| | || | |_   ___  |  | || | |  _   _  |  | |
     | |  |  .--.  |  | || |  |   \\ | |   | || |   | |_  \\_|  | || | |_/ | | \\_|  | |
     | |  | |    | |  | || |  | |\\ \\| |   | || |   |  _|  _   | || |     | |      | |
     | |  |  '--'  |  | || | _| |_\\   |_  | || |  _| |___/ |  | || |    _| |_     | |
     | |   '.____.'   | || ||_____|\\____| | || | |_________|  | || |   |_____|    | |
     | |              | || |              | || |              | || |              | |
     | '--------------' || '--------------' || '--------------' || '--------------' |
      '----------------'  '----------------'  '----------------'  '----------------' 

      OFFICIAL INVOICE
      =============================================================================
      
      Order ID:     ${order.order_number || order.id}
      Date:         ${formatDateTime(order.created_at)}
      Status:       ${(order.status || 'UNKNOWN').toUpperCase()}
      
      -----------------------------------------------------------------------------
      
      ITEMS PURCHASED:
      ${order.order_items?.map(item => 
        `[${item.quantity}x] ${item.product_name || 'Product'} \t @ ₹${item.price_at_time} \t = ₹${(item.quantity * item.price_at_time).toFixed(2)}`
      ).join('\n       ')}
      
      -----------------------------------------------------------------------------
      
      SUBTOTAL:     ₹${order.order_items?.reduce((sum, item) => sum + (item.quantity * (item.price_at_time || 0)), 0).toFixed(2)}
      TAX:          ₹${order.tax_amount?.toFixed(2) || '0.00'}
      SHIPPING:     ₹${order.shipping_fee?.toFixed(2) || '0.00'}
      
      TOTAL AMOUNT: ₹${order.total_amount?.toFixed(2)}
      
      -----------------------------------------------------------------------------
      Payment Method: ${order.payment_method || 'Online Payment'}
      Payment Status: ${order.payment_status || 'Paid'}
      
      Thank you for shopping with ONET!
      For support, visit: www.onetshop.com/support
    `;
    
    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ONET-Invoice-${order.order_number || order.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, [formatDateTime]);

  // --- STYLES (Cleaned for brevity) ---
  const styles = {
    page: { background: '#f9fafb', minHeight: '100vh', padding: '40px 20px' },
    container: { maxWidth: '1200px', margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', paddingBottom: '20px', borderBottom: '1px solid #e5e7eb' },
    titleGradient: { fontSize: '2.5rem', fontWeight: 800, margin: 0, background: 'linear-gradient(90deg, #111827 0%, #374151 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    subtitle: { color: '#6b7280', marginTop: '8px', fontSize: '1rem' },
    badgeCount: { background: '#000', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700 },
    headerActions: { display: 'flex', gap: '12px' },
    primaryButton: { display: 'flex', alignItems: 'center', background: '#000', color: '#fff', padding: '10px 20px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all 0.2s' },
    iconButton: { background: '#fff', border: '1px solid #e5e7eb', padding: '10px', borderRadius: '12px', cursor: 'pointer', color: '#374151' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '40px' },
    statCard: { background: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '16px', transition: 'transform 0.2s' },
    statValue: { fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#111827' },
    statLabel: { fontSize: '0.875rem', color: '#6b7280', margin: 0 },
    statIconWrapper: (color) => ({ width: '48px', height: '48px', borderRadius: '12px', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }),
    filterSection: { background: '#fff', padding: '16px', borderRadius: '16px', marginBottom: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' },
    searchWrapper: { display: 'flex', alignItems: 'center', background: '#f3f4f6', padding: '8px 16px', borderRadius: '12px', flex: 1, minWidth: '200px' },
    searchIcon: { color: '#9ca3af', marginRight: '8px' },
    searchInput: { border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.95rem' },
    filterTabs: { display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' },
    filterTab: { padding: '8px 16px', borderRadius: '20px', border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#4b5563', whiteSpace: 'nowrap' },
    activeFilterTab: { padding: '8px 16px', borderRadius: '20px', border: '1px solid #000', background: '#000', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap' },
    ordersList: { display: 'flex', flexDirection: 'column', gap: '20px' },
    orderCard: { background: '#fff', borderRadius: '20px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', overflow: 'hidden', transition: 'all 0.3s ease', animation: 'fadeInScale 0.5s ease forwards' },
    cardHeader: { padding: '20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa' },
    orderMetaLeft: { display: 'flex', flexDirection: 'column', gap: '4px' },
    orderIdBadge: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 700, color: '#111827' },
    dateText: { fontSize: '0.8rem', color: '#6b7280' },
    statusPill: (status) => ({ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, background: getStatusColor(status) + '20', color: getStatusColor(status) }),
    progressContainer: { padding: '24px 30px' },
    trackLine: { height: '4px', background: '#e5e7eb', borderRadius: '2px', position: 'relative', marginBottom: '16px' },
    fillLine: { height: '100%', borderRadius: '2px', transition: 'width 1s ease-in-out' },
    stepsRow: { display: 'flex', justifyContent: 'space-between', position: 'relative', top: '-10px' },
    stepItem: (active, color) => ({ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '20px' }),
    stepDot: (active, color) => ({ width: '16px', height: '16px', borderRadius: '50%', background: active ? color : '#e5e7eb', border: '2px solid #fff', boxShadow: '0 0 0 2px ' + (active ? color : '#fff'), zIndex: 2 }),
    stepText: (active) => ({ fontSize: '0.7rem', fontWeight: active ? 700 : 500, color: active ? '#111827' : '#9ca3af', whiteSpace: 'nowrap', position: 'absolute', top: '24px' }),
    itemsContainer: { padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: '16px' },
    itemRow: { display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', background: '#f9fafb', borderRadius: '12px' },
    itemThumbWrapper: { position: 'relative', width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb' },
    itemThumb: { width: '100%', height: '100%', objectFit: 'cover' },
    qtyBadge: { position: 'absolute', bottom: 0, right: 0, background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '0.65rem', padding: '2px 6px', borderTopLeftRadius: '6px' },
    itemDetails: { flex: 1 },
    itemName: { fontSize: '0.9rem', fontWeight: 700, margin: '0 0 4px', color: '#111827' },
    itemVariant: { fontSize: '0.8rem', color: '#6b7280', margin: 0 },
    itemPriceSingle: { fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginTop: '4px' },
    itemTotal: { fontSize: '0.95rem', fontWeight: 800, color: '#111827' },
    cardFooterInfo: { padding: '16px 20px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa' },
    addressSnippet: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#4b5563' },
    totalPriceSnippet: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#6b7280' },
    bigPrice: { fontSize: '1.2rem', fontWeight: 800, color: '#111827' },
    actionToolbar: { padding: '16px 20px', display: 'flex', gap: '12px', justifyContent: 'flex-end', background: '#fff' },
    outlineButton: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', '&:hover': { background: '#f9fafb', borderColor: '#d1d5db' } },
    primaryButtonSmall: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', border: 'none', background: '#000', color: '#fff', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' },
    emptyState: { textAlign: 'center', padding: '60px 20px' },
    emptyIconParams: { width: '120px', height: '120px', background: '#f3f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#9ca3af' },
    emptyTitle: { fontSize: '1.5rem', fontWeight: 800, color: '#111827', marginBottom: '8px' },
    emptyText: { color: '#6b7280', marginBottom: '24px' },
    supportFooter: { marginTop: '60px', background: '#fff', padding: '30px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' },
    supportContent: { display: 'flex', alignItems: 'center', gap: '16px' },
    shieldIcon: { width: '48px', height: '48px', background: '#fffbeb', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    supportBtn: { padding: '10px 24px', background: '#fff', border: '2px solid #e5e7eb', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', color: '#111827' },
    loadingContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' },
    spinner: { width: '40px', height: '40px', border: '3px solid #f3f4f6', borderTop: '3px solid #000', borderRadius: '50%', animation: 'spin 1s linear infinite' },
    loadingText: { marginTop: '16px', fontWeight: 600, color: '#6b7280' },
    errorContainer: { textAlign: 'center', padding: '40px' },
    errorIconBg: { width: '80px', height: '80px', background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' },
    errorTitle: { fontSize: '1.25rem', fontWeight: 800, color: '#111827', marginBottom: '8px' },
    errorText: { color: '#6b7280', marginBottom: '24px' },
    retryButton: { display: 'flex', alignItems: 'center', margin: '0 auto', padding: '10px 24px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modalContent: { background: '#fff', padding: '32px', borderRadius: '24px', maxWidth: '400px', width: '90%', textAlign: 'center' },
    modalActions: { display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'center' }
  };

  // --- RENDER ---
  if (isLoading) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Loading Orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.errorContainer}>
            <div style={styles.errorIconBg}><AlertCircle size={48} color="#EF4444" /></div>
            <h3 style={styles.errorTitle}>Unable to Load Orders</h3>
            <p style={styles.errorText}>{error}</p>
            <button style={styles.retryButton} onClick={refetch}>
              <RefreshCw size={16} style={{ marginRight: '8px' }} /> Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Global CSS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.98) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #9ca3af; }

        .order-card-hover:hover {
          transform: translateY(-5px);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
        }
        
        .btn-3d:active {
          transform: translateY(2px);
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
        }
      `}</style>

      <div style={styles.container}>
        {/* Header Section - ALWAYS VISIBLE NOW */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <h1 style={styles.titleGradient}>My Orders</h1>
            <p style={styles.subtitle}>
              <span style={styles.badgeCount}>{filteredOrders.length}</span> Orders Found
            </p>
          </div>
          <div style={styles.headerActions}>
            <button style={styles.iconButton} onClick={refetch} title="Refresh Data">
              <RefreshCw size={20} />
            </button>
            <button style={styles.primaryButton} onClick={() => navigate('/products')}>
              <ShoppingCart size={18} style={{ marginRight: '8px' }} /> Shop Collection
            </button>
          </div>
        </div>

        {/* Global Empty State (If user has 0 orders total) */}
        {orders.length === 0 ? (
           <div style={styles.emptyState}>
             <div style={styles.emptyIconParams}>
                 <ShoppingBag size={80} strokeWidth={1} />
             </div>
             <h2 style={styles.emptyTitle}>Your History is Empty</h2>
             <p style={styles.emptyText}>
               Looks like you haven't discovered our premium collection yet.
             </p>
             <button style={styles.primaryButton} onClick={() => navigate('/products')}>
               <ShoppingBag size={18} style={{ marginRight: '8px' }} /> Start Shopping
             </button>
           </div>
        ) : (
          <>
            {/* 3D Stats Dashboard */}
            <div style={styles.statsGrid}>
              <div style={{...styles.statCard, background: 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)'}}>
                <div style={styles.statIconWrapper('#8B7355')}>
                  <ShoppingBag size={24} color="white" />
                </div>
                <div>
                  <p style={styles.statValue}>{stats.total}</p>
                  <p style={styles.statLabel}>Total Orders</p>
                </div>
              </div>
              <div style={{...styles.statCard, borderBottom: '4px solid #F59E0B'}}>
                <div style={styles.statIconWrapper('#F59E0B')}>
                  <Clock size={24} color="white" />
                </div>
                <div>
                  <p style={styles.statValue}>{stats.pending}</p>
                  <p style={styles.statLabel}>Pending</p>
                </div>
              </div>
              <div style={{...styles.statCard, borderBottom: '4px solid #3B82F6'}}>
                <div style={styles.statIconWrapper('#3B82F6')}>
                  <RefreshCw size={24} color="white" />
                </div>
                <div>
                  <p style={styles.statValue}>{stats.processing}</p>
                  <p style={styles.statLabel}>Processing</p>
                </div>
              </div>
              <div style={{...styles.statCard, borderBottom: '4px solid #10B981'}}>
                <div style={styles.statIconWrapper('#10B981')}>
                  <CheckCircle size={24} color="white" />
                </div>
                <div>
                  <p style={styles.statValue}>{stats.delivered}</p>
                  <p style={styles.statLabel}>Delivered</p>
                </div>
              </div>
            </div>

            {/* 3D Filter Bar */}
            <div style={styles.filterSection}>
              <div style={styles.searchWrapper}>
                <Search style={styles.searchIcon} size={20} />
                <input
                  type="text"
                  placeholder="Search orders, products, IDs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={styles.searchInput}
                />
              </div>
              
              <div style={styles.filterTabs}>
                {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                  <button
                    key={status}
                    style={filterStatus === status ? styles.activeFilterTab : styles.filterTab}
                    onClick={() => setFilterStatus(status)}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders List */}
            <div style={styles.ordersList}>
              {filteredOrders.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIconParams}>
                      <Search size={80} strokeWidth={1} />
                  </div>
                  <h2 style={styles.emptyTitle}>No orders match your search</h2>
                  <p style={styles.emptyText}>Try changing keywords or clearing filters.</p>
                  <button onClick={() => { setSearchTerm(''); setFilterStatus('all'); }} style={styles.primaryButtonSmall}>
                    Clear Filters
                  </button>
                </div>
              ) : (
                filteredOrders.map((order, index) => (
                  <div 
                    key={order.id || index} 
                    style={{
                      ...styles.orderCard,
                      animationDelay: `${index * 0.1}s` 
                    }}
                    className="order-card-hover"
                  >
                    {/* Card Header */}
                    <div style={styles.cardHeader}>
                      <div style={styles.orderMetaLeft}>
                        <div style={styles.orderIdBadge}>
                          <Hash size={14} /> 
                          {order.order_number || (order.id ? order.id.slice(0, 8).toUpperCase() : 'N/A')}
                        </div>
                        <span style={styles.dateText}>{formatDateTime(order.created_at)}</span>
                      </div>
                      
                      <div style={styles.statusPill(order.status || 'unknown')}>
                        {getStatusIcon(order.status)}
                        <span>{(order.status || 'UNKNOWN').toUpperCase()}</span>
                      </div>
                    </div>

                    {/* Progress Bar (Dynamic) */}
                    {['pending', 'processing', 'shipped', 'delivered'].includes((order.status || '').toLowerCase()) && (
                      <div style={styles.progressContainer}>
                        <div style={styles.trackLine}>
                          <div style={{
                            ...styles.fillLine,
                            width: `${getStatusProgress(order.status)}%`,
                            background: getStatusColor(order.status)
                          }} />
                        </div>
                        <div style={styles.stepsRow}>
                          {['Pending', 'Processing', 'Shipped', 'Delivered'].map((step, idx) => {
                            const active = getStatusProgress(order.status) >= ((idx + 1) * 25);
                            return (
                              <div key={step} style={styles.stepItem(active, getStatusColor(order.status))}>
                                <span style={styles.stepDot(active, getStatusColor(order.status))}></span>
                                <span style={styles.stepText(active)}>{step}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Items Grid */}
                    <div style={styles.itemsContainer}>
                      {order.order_items?.map((item, idx) => (
                        <div key={idx} style={styles.itemRow}>
                          <div style={styles.itemThumbWrapper}>
                            {/* ✅ CHANGE 4: Use direct item.image_url */}
                            <img
                              src={item.image_url || "https://images.unsplash.com/photo-1558769132-cb1cb458ed44?w=150&h=150&fit=crop"}
                              alt="Product"
                              style={styles.itemThumb}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://images.unsplash.com/photo-1558769132-cb1cb458ed44?w=150&h=150&fit=crop";
                              }}
                            />
                            <span style={styles.qtyBadge}>{item.quantity}</span>
                          </div>
                          <div style={styles.itemDetails}>
                            {/* ✅ CHANGE 5: Use direct item.product_name */}
                            <h4 style={styles.itemName}>{item.product_name || "Product Name"}</h4>
                            <p style={styles.itemVariant}>Standard</p>
                            <p style={styles.itemPriceSingle}>₹{item.price_at_time?.toFixed(2)}</p>
                          </div>
                          <div style={styles.itemTotal}>
                            ₹{((item.quantity || 0) * (item.price_at_time || 0)).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Tracking & Address Snippet */}
                    <div style={styles.cardFooterInfo}>
                      <div style={styles.addressSnippet}>
                        <MapPin size={16} color="#6B7280" />
                        <span>
                          {/* ✅ CHANGE 6: Updated Address Handling */}
                          {order.shipping_address && typeof order.shipping_address === 'object' 
                          ? `${order.shipping_address.city || 'Location'}, ${order.shipping_address.zip || ''}`
                          : 'Delivery Address'}
                        </span>
                      </div>
                      <div style={styles.totalPriceSnippet}>
                        <span>Total:</span>
                        <span style={styles.bigPrice}>₹{order.total_amount?.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Actions Toolbar */}
                    <div style={styles.actionToolbar}>
                      <button style={styles.outlineButton} onClick={() => handleViewDetails(order.id)}>
                        <Eye size={16} /> Details
                      </button>
                      <button style={styles.outlineButton} onClick={() => handleDownloadInvoice(order)}>
                        <Download size={16} /> Invoice
                      </button>
                      
                      {order.tracking_number && (
                        <button style={styles.outlineButton} onClick={() => handleTrackOrder(order)}>
                          <ExternalLink size={16} /> Track
                        </button>
                      )}

                      {(order.status || '').toLowerCase() === 'delivered' && (
                        <button style={styles.primaryButtonSmall} onClick={() => handleReorderClick(order)}>
                          <RefreshCw size={16} /> Buy Again
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Support Section */}
        <div style={styles.supportFooter}>
          <div style={styles.supportContent}>
             <div style={styles.shieldIcon}><Shield size={24} color="#8B7355" /></div>
             <div>
               <h4>Secure Order Guarantee</h4>
               <p>Issues with your order? Our 24/7 team is here to help.</p>
             </div>
          </div>
          <button style={styles.supportBtn} onClick={() => handleContactSupport({id: 'General', status: 'Inquiry'})}>
            Contact ONET Support
          </button>
        </div>
      </div>

      {/* Modals */}
      {showReorderConfirm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
             <h3>Confirm Reorder</h3>
             <p>Add items from order <b>{selectedOrderForReorder?.order_number || selectedOrderForReorder?.id?.slice(0,8)}</b> to cart?</p>
             <div style={styles.modalActions}>
                <button style={styles.outlineButton} onClick={cancelReorder}>Cancel</button>
                <button style={styles.primaryButton} onClick={confirmReorder}>Yes, Add to Cart</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}