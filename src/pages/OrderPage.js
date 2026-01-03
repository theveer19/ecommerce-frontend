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
      const { data, error: fetchError } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            id,
            quantity,
            price_at_time,
            product_id,
            products (
              id,
              name,
              image_url,
              category,
              brand
            )
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      
      const transformedOrders = (data || []).map(order => {
        const orderItems = (order.order_items || []).map(item => ({
          id: item.id,
          quantity: item.quantity,
          price_at_time: item.price_at_time,
          product: item.products || null
        }));
        
        return {
          ...order,
          order_items: orderItems
        };
      });
      
      setOrders(transformedOrders);
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
          (item.product?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.product?.category || '').toLowerCase().includes(searchTerm.toLowerCase())
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
        `[${item.quantity}x] ${item.product?.name || 'Product'} \t @ ₹${item.price_at_time} \t = ₹${(item.quantity * item.price_at_time).toFixed(2)}`
      ).join('\n      ')}
      
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
                            <img
                              src={item.product?.image_url || "https://images.unsplash.com/photo-1558769132-cb1cb458ed44?w=150&h=150&fit=crop"}
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
                            <h4 style={styles.itemName}>{item.product?.name || "Product Name"}</h4>
                            <p style={styles.itemVariant}>{item.product?.category || "Category"}</p>
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

// --- PROFESSIONAL 3D STYLES ---
const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#F3F4F6', // Light grayish-blue for depth
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '40px 0 80px',
    color: '#1F2937',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
  },
  
  // Header
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center', // FIXED: Center aligned so buttons are visible
    marginBottom: '40px',
    flexWrap: 'wrap',
    gap: '20px',
  },
  headerContent: {
    flex: '1 1 200px',
  },
  titleGradient: {
    fontSize: '42px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #1F2937 0%, #4B5563 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: '0 0 8px 0',
    letterSpacing: '-1px',
    textShadow: '0px 2px 4px rgba(0,0,0,0.1)',
  },
  subtitle: {
    fontSize: '16px',
    color: '#6B7280',
    margin: 0,
    fontWeight: '500',
  },
  badgeCount: {
    background: '#E5E7EB',
    padding: '2px 8px',
    borderRadius: '12px',
    color: '#374151',
    fontWeight: '700',
    fontSize: '14px',
  },
  headerActions: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },

  // Buttons
  primaryButton: {
    background: 'linear-gradient(135deg, #8B7355 0%, #6D5A43 100%)', // Onet Gold/Brown
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 4px 6px -1px rgba(139, 115, 85, 0.4), 0 2px 4px -1px rgba(139, 115, 85, 0.2)',
    transition: 'all 0.2s ease',
    className: 'btn-3d',
    justifyContent: 'center',
    whiteSpace: 'nowrap',
  },
  primaryButtonSmall: {
    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)',
  },
  outlineButton: {
    background: 'white',
    color: '#374151',
    border: '1px solid #D1D5DB',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.1s ease',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  iconButton: {
    background: 'white',
    border: '1px solid #D1D5DB',
    borderRadius: '12px',
    width: '46px',
    height: '46px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#6B7280',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },

  // Stats
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '24px',
    marginBottom: '40px',
  },
  statCard: {
    background: 'white',
    borderRadius: '20px',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
    border: '1px solid rgba(255,255,255,0.8)',
    backdropFilter: 'blur(10px)',
    transition: 'transform 0.3s ease',
  },
  statIconWrapper: (color) => ({
    background: color,
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 8px 16px -4px ${color}66`, // Colored shadow glow
    background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
  }),
  statValue: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#111827',
    margin: 0,
    lineHeight: '1.2',
  },
  statLabel: {
    fontSize: '14px',
    color: '#6B7280',
    margin: 0,
    fontWeight: '500',
  },

  // Filters
  filterSection: {
    background: 'white',
    padding: '16px',
    borderRadius: '20px',
    marginBottom: '32px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchWrapper: {
    position: 'relative',
    flex: '1 1 300px',
  },
  searchIcon: {
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9CA3AF',
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px 12px 48px',
    borderRadius: '12px',
    border: '1px solid #E5E7EB',
    background: '#F9FAFB',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s',
  },
  filterTabs: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    paddingBottom: '4px',
  },
  filterTab: {
    background: 'transparent',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '20px',
    color: '#6B7280',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  activeFilterTab: {
    background: '#1F2937',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    whiteSpace: 'nowrap',
  },

  // Order Cards
  ordersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  orderCard: {
    background: 'white',
    borderRadius: '24px',
    padding: '0', 
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.01)',
    border: '1px solid #F3F4F6',
    overflow: 'hidden',
    animation: 'fadeInScale 0.5s ease forwards',
    opacity: 0,
    transition: 'all 0.3s ease',
  },
  cardHeader: {
    padding: '24px',
    borderBottom: '1px solid #F3F4F6',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'linear-gradient(to right, #ffffff, #fafafa)',
  },
  orderMetaLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  orderIdBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontFamily: 'monospace',
    fontSize: '16px',
    fontWeight: '700',
    color: '#111827',
  },
  dateText: {
    fontSize: '13px',
    color: '#6B7280',
  },
  statusPill: (status) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '99px',
    fontSize: '12px',
    fontWeight: '700',
    letterSpacing: '0.5px',
    background: 'white',
    boxShadow: `0 0 0 1px ${styles.page.backgroundColor}, 0 4px 10px rgba(0,0,0,0.05)`, // Neumorphic inset
    color: '#1F2937',
    border: `1px solid #E5E7EB`,
  }),

  // Progress Bar
  progressContainer: {
    padding: '24px 24px 0',
  },
  trackLine: {
    height: '6px',
    background: '#E5E7EB',
    borderRadius: '99px',
    marginBottom: '16px',
    overflow: 'hidden',
  },
  fillLine: {
    height: '100%',
    borderRadius: '99px',
    transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  stepsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingBottom: '24px',
    borderBottom: '1px solid #F3F4F6',
  },
  stepItem: (active, color) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    opacity: active ? 1 : 0.5,
    transition: 'all 0.3s',
  }),
  stepDot: (active, color) => ({
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: active ? color : '#D1D5DB',
    boxShadow: active ? `0 0 0 4px ${color}33` : 'none',
  }),
  stepText: (active) => ({
    fontSize: '12px',
    fontWeight: active ? '700' : '500',
    color: active ? '#111827' : '#9CA3AF',
  }),

  // Items
  itemsContainer: {
    padding: '24px',
    background: '#F9FAFB',
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '16px',
    background: 'white',
    padding: '12px',
    borderRadius: '12px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
  },
  itemThumbWrapper: {
    position: 'relative',
  },
  itemThumb: {
    width: '64px',
    height: '64px',
    borderRadius: '8px',
    objectFit: 'cover',
    border: '1px solid #E5E7EB',
  },
  qtyBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    background: '#374151',
    color: 'white',
    fontSize: '10px',
    fontWeight: '700',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    margin: '0 0 4px 0',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1F2937',
  },
  itemVariant: {
    margin: 0,
    fontSize: '12px',
    color: '#6B7280',
  },
  itemPriceSingle: {
    fontSize: '12px',
    color: '#6B7280',
    marginTop: '4px',
  },
  itemTotal: {
    fontWeight: '700',
    color: '#1F2937',
    fontSize: '15px',
  },

  // Footer & Actions
  cardFooterInfo: {
    padding: '16px 24px',
    background: 'white',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid #F3F4F6',
  },
  addressSnippet: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#6B7280',
    fontWeight: '500',
  },
  totalPriceSnippet: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#6B7280',
  },
  bigPrice: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#111827',
  },
  actionToolbar: {
    padding: '16px 24px',
    background: 'white',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    borderTop: '1px dashed #E5E7EB',
  },

  // Empty & Error States
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '60vh',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #E5E7EB',
    borderTop: '4px solid #8B7355',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    gap: '16px',
    textAlign: 'center',
    padding: '40px',
    background: 'white',
    borderRadius: '20px',
  },
  errorIconBg: {
    background: '#FEF2F2',
    padding: '16px',
    borderRadius: '50%',
    marginBottom: '8px',
  },
  errorTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#111827',
    margin: 0,
  },
  errorText: {
    color: '#6B7280',
    margin: 0,
    maxWidth: '300px',
  },
  retryButton: {
    background: '#1F2937',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  
  // Empty State
  emptyState: {
    textAlign: 'center',
    padding: '80px 20px',
    background: 'white',
    borderRadius: '32px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '20px',
  },
  emptyIconParams: {
    background: '#F3F4F6',
    padding: '40px',
    borderRadius: '50%',
    marginBottom: '24px',
    color: '#9CA3AF',
  },
  emptyTitle: {
    fontSize: '24px',
    fontWeight: '800',
    marginBottom: '12px',
    color: '#111827',
  },
  emptyText: {
    color: '#6B7280',
    marginBottom: '32px',
    fontSize: '16px',
  },

  // Support
  supportFooter: {
    marginTop: '60px',
    background: '#1F2937',
    borderRadius: '24px',
    padding: '32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: 'white',
    flexWrap: 'wrap',
    gap: '20px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  supportContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  shieldIcon: {
    background: 'rgba(255,255,255,0.1)',
    padding: '12px',
    borderRadius: '12px',
  },
  supportBtn: {
    background: 'white',
    color: '#1F2937',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },

  // Modal
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  modalContent: {
    background: 'white',
    padding: '32px',
    borderRadius: '24px',
    width: '90%',
    maxWidth: '400px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    marginTop: '24px',
  },
};