import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import orderApi from '../services/orderApi';
import { 
    FaSpinner, 
    FaEye, 
    FaDownload, 
    FaCheck, 
    FaClock, 
    FaTruck,
    FaBox,
    FaShoppingBag,
    FaTimesCircle,
    FaPrint
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        console.log('🟢 Orders page mounted');
        console.log('👤 Current user:', user);
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError('');
            console.log('📦 Fetching customer orders...');
            
            const data = await orderApi.getMyOrders();
            console.log('✅ API Response:', data);
            console.log('📊 Number of orders:', data?.length || 0);
            
            if (data && Array.isArray(data)) {
                setOrders(data);
                console.log('✅ Orders set in state:', data.length);
            } else {
                console.log('❌ Data is not an array:', data);
                setOrders([]);
            }
        } catch (error) {
            console.error('❌ Error fetching orders:', error);
            setError(error.message || 'Failed to load orders');
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const viewOrderDetails = async (orderId) => {
        try {
            console.log('🔍 Fetching order details for ID:', orderId);
            const data = await orderApi.getOrderById(orderId);
            console.log('✅ Order details:', data);
            setSelectedOrder(data);
            setShowDetails(true);
        } catch (error) {
            console.error('❌ Error fetching order details:', error);
            alert('Failed to load order details');
        }
    };

    const downloadInvoice = async (orderId) => {
        try {
            console.log('📄 Downloading invoice for order:', orderId);
            await orderApi.downloadInvoice(orderId);
        } catch (error) {
            console.error('❌ Error downloading invoice:', error);
            alert('Failed to download invoice');
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            pending: { bg: '#fff3cd', color: '#856404', icon: <FaClock />, text: 'Pending' },
            processing: { bg: '#cce5ff', color: '#004085', icon: <FaSpinner className="spin" />, text: 'Processing' },
            shipped: { bg: '#d1ecf1', color: '#0c5460', icon: <FaTruck />, text: 'Shipped' },
            delivered: { bg: '#d4edda', color: '#155724', icon: <FaCheck />, text: 'Delivered' },
            cancelled: { bg: '#f8d7da', color: '#721c24', icon: <FaTimesCircle />, text: 'Cancelled' }
        };
        return statusMap[status] || statusMap.pending;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' Br';
    };

    const parseItems = (itemsJson) => {
        try {
            return typeof itemsJson === 'string' ? JSON.parse(itemsJson) : itemsJson || [];
        } catch (e) {
            console.error('Error parsing items:', e);
            return [];
        }
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <FaSpinner className="spinner" size={50} color="#3498db" />
                <p style={styles.loadingText}>Loading your orders...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.errorContainer}>
                <FaTimesCircle size={50} color="#dc3545" />
                <h3 style={styles.errorTitle}>Error Loading Orders</h3>
                <p style={styles.errorMessage}>{error}</p>
                <button onClick={fetchOrders} style={styles.retryButton}>
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>My Orders</h1>
                <p style={styles.subtitle}>Track and manage your orders</p>
            </div>
            
            {orders.length === 0 ? (
                <div style={styles.emptyState}>
                    <FaShoppingBag size={80} color="#ccc" />
                    <h2 style={styles.emptyTitle}>No orders yet</h2>
                    <p style={styles.emptyText}>You haven't placed any orders. Start shopping to see your orders here!</p>
                    <Link to="/products" style={styles.shopButton}>
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <>
                    <div style={styles.statsContainer}>
                        <div style={styles.statBox}>
                            <span style={styles.statNumber}>{orders.length}</span>
                            <span style={styles.statLabel}>Total Orders</span>
                        </div>
                        <div style={styles.statBox}>
                            <span style={styles.statNumber}>
                                {orders.filter(o => o.status === 'delivered').length}
                            </span>
                            <span style={styles.statLabel}>Delivered</span>
                        </div>
                        <div style={styles.statBox}>
                            <span style={styles.statNumber}>
                                {orders.filter(o => o.status === 'processing').length}
                            </span>
                            <span style={styles.statLabel}>Processing</span>
                        </div>
                        <div style={styles.statBox}>
                            <span style={styles.statNumber}>
                                {orders.filter(o => o.status === 'shipped').length}
                            </span>
                            <span style={styles.statLabel}>Shipped</span>
                        </div>
                    </div>

                    <div style={styles.ordersList}>
                        {orders.map(order => {
                            const statusBadge = getStatusBadge(order.status);
                            const items = parseItems(order.items);
                            
                            return (
                                <div key={order.id} style={styles.orderCard}>
                                    <div style={styles.orderHeader}>
                                        <div style={styles.orderHeaderLeft}>
                                            <h3 style={styles.orderNumber}>
                                                Order #{order.order_number}
                                            </h3>
                                            <p style={styles.orderDate}>
                                                <FaClock style={{marginRight: '5px'}} />
                                                {formatDate(order.created_at)}
                                            </p>
                                        </div>
                                        <span style={{
                                            ...styles.statusBadge,
                                            backgroundColor: statusBadge.bg,
                                            color: statusBadge.color
                                        }}>
                                            {statusBadge.icon} {statusBadge.text}
                                        </span>
                                    </div>
                                    
                                    <div style={styles.orderContent}>
                                        <div style={styles.orderSummary}>
                                            <div style={styles.summaryItem}>
                                                <span style={styles.summaryLabel}>Total Amount:</span>
                                                <span style={styles.summaryValue}>
                                                    {formatCurrency(order.grand_total)}
                                                </span>
                                            </div>
                                            <div style={styles.summaryItem}>
                                                <span style={styles.summaryLabel}>Items:</span>
                                                <span style={styles.summaryValue}>
                                                    {order.item_count || 0}
                                                </span>
                                            </div>
                                            <div style={styles.summaryItem}>
                                                <span style={styles.summaryLabel}>Payment:</span>
                                                <span style={styles.summaryValue}>
                                                    {order.payment_method || 'N/A'}
                                                </span>
                                            </div>
                                        </div>

                                        <div style={styles.itemsPreview}>
                                            {items.slice(0, 3).map((item, idx) => (
                                                <div key={idx} style={styles.previewItem}>
                                                    <img 
                                                        src={item.image || 'https://via.placeholder.com/50x50?text=Product'} 
                                                        alt={item.name}
                                                        style={styles.previewImage}
                                                        onError={(e) => {
                                                            e.target.src = 'https://via.placeholder.com/50x50?text=Product';
                                                        }}
                                                    />
                                                    <div style={styles.previewInfo}>
                                                        <span style={styles.previewName}>
                                                            {item.name?.length > 30 
                                                                ? item.name.substring(0, 30) + '...' 
                                                                : item.name}
                                                        </span>
                                                        <span style={styles.previewQuantity}>
                                                            x{item.quantity}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                            {order.item_count > 3 && (
                                                <span style={styles.moreItems}>
                                                    +{order.item_count - 3} more items
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div style={styles.orderActions}>
                                        <button 
                                            onClick={() => viewOrderDetails(order.id)}
                                            style={styles.actionButton}
                                        >
                                            <FaEye /> View Details
                                        </button>
                                        <button 
                                            onClick={() => downloadInvoice(order.id)}
                                            style={styles.actionButton}
                                        >
                                            <FaDownload /> Invoice
                                        </button>
                                        {order.status === 'delivered' && (
                                            <Link 
                                                to={`/product/${order.id}/review`}
                                                style={styles.actionButton}
                                            >
                                                <FaCheck /> Write Review
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* Order Details Modal */}
            {showDetails && selectedOrder && (
                <div style={styles.modalOverlay} onClick={() => setShowDetails(false)}>
                    <div style={styles.modal} onClick={e => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>
                                Order Details #{selectedOrder.order?.order_number}
                            </h2>
                            <button 
                                onClick={() => setShowDetails(false)} 
                                style={styles.closeButton}
                            >
                                ×
                            </button>
                        </div>
                        
                        <div style={styles.modalBody}>
                            {/* Customer Information */}
                            <div style={styles.infoSection}>
                                <h3 style={styles.sectionTitle}>Customer Information</h3>
                                <div style={styles.infoGrid}>
                                    <div style={styles.infoRow}>
                                        <span style={styles.infoLabel}>Name:</span>
                                        <span style={styles.infoValue}>
                                            {selectedOrder.order?.customer_name}
                                        </span>
                                    </div>
                                    <div style={styles.infoRow}>
                                        <span style={styles.infoLabel}>Email:</span>
                                        <span style={styles.infoValue}>
                                            {selectedOrder.order?.customer_email}
                                        </span>
                                    </div>
                                    <div style={styles.infoRow}>
                                        <span style={styles.infoLabel}>Phone:</span>
                                        <span style={styles.infoValue}>
                                            {selectedOrder.order?.customer_phone}
                                        </span>
                                    </div>
                                    <div style={styles.infoRow}>
                                        <span style={styles.infoLabel}>Address:</span>
                                        <span style={styles.infoValue}>
                                            {selectedOrder.order?.shipping_address}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div style={styles.itemsSection}>
                                <h3 style={styles.sectionTitle}>Order Items</h3>
                                <table style={styles.itemsTable}>
                                    <thead>
                                        <tr>
                                            <th style={styles.tableHeader}>Product</th>
                                            <th style={styles.tableHeader}>Price</th>
                                            <th style={styles.tableHeader}>Quantity</th>
                                            <th style={styles.tableHeader}>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedOrder.items?.map(item => (
                                            <tr key={item.id} style={styles.tableRow}>
                                                <td style={styles.tableCell}>
                                                    <div style={styles.productCell}>
                                                        <img 
                                                            src={item.image_url || 'https://via.placeholder.com/40'} 
                                                            alt={item.name}
                                                            style={styles.productImage}
                                                        />
                                                        <span>{item.name}</span>
                                                    </div>
                                                </td>
                                                <td style={styles.tableCell}>
                                                    {formatCurrency(item.price)}
                                                </td>
                                                <td style={styles.tableCell}>
                                                    {item.quantity}
                                                </td>
                                                <td style={styles.tableCell}>
                                                    {formatCurrency(item.total)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan="3" style={styles.totalLabel}>
                                                <strong>Subtotal:</strong>
                                            </td>
                                            <td style={styles.totalValue}>
                                                {formatCurrency(selectedOrder.order?.total_amount)}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan="3" style={styles.totalLabel}>
                                                <strong>Shipping:</strong>
                                            </td>
                                            <td style={styles.totalValue}>
                                                {formatCurrency(selectedOrder.order?.shipping_cost || 0)}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan="3" style={styles.totalLabel}>
                                                <strong>Tax:</strong>
                                            </td>
                                            <td style={styles.totalValue}>
                                                {formatCurrency(selectedOrder.order?.tax_amount || 0)}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan="3" style={styles.totalLabel}>
                                                <strong>Discount:</strong>
                                            </td>
                                            <td style={styles.totalValue}>
                                                {formatCurrency(selectedOrder.order?.discount_amount || 0)}
                                            </td>
                                        </tr>
                                        <tr style={styles.grandTotalRow}>
                                            <td colSpan="3" style={styles.grandTotalLabel}>
                                                <strong>Grand Total:</strong>
                                            </td>
                                            <td style={styles.grandTotalValue}>
                                                <strong>{formatCurrency(selectedOrder.order?.grand_total)}</strong>
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {/* Order Timeline */}
                            {selectedOrder.timeline && selectedOrder.timeline.length > 0 && (
                                <div style={styles.timelineSection}>
                                    <h3 style={styles.sectionTitle}>Order Timeline</h3>
                                    <div style={styles.timeline}>
                                        {selectedOrder.timeline.map((event, index) => (
                                            <div key={index} style={styles.timelineItem}>
                                                <div style={styles.timelineDot} />
                                                <div style={styles.timelineContent}>
                                                    <p style={styles.timelineStatus}>
                                                        {event.status}
                                                    </p>
                                                    <p style={styles.timelineDescription}>
                                                        {event.description}
                                                    </p>
                                                    <p style={styles.timelineDate}>
                                                        {formatDate(event.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={styles.modalFooter}>
                            <button 
                                onClick={() => downloadInvoice(selectedOrder.order?.id)}
                                style={styles.footerButton}
                            >
                                <FaDownload /> Download Invoice
                            </button>
                            <button 
                                onClick={() => setShowDetails(false)}
                                style={{...styles.footerButton, background: '#6c757d'}}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    .spinner {
                        animation: spin 1s linear infinite;
                    }
                    .spin {
                        animation: spin 1s linear infinite;
                    }
                `}
            </style>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '1200px',
        margin: '40px auto',
        padding: '0 20px'
    },
    header: {
        marginBottom: '30px'
    },
    title: {
        fontSize: '2.5rem',
        color: '#333',
        margin: '0 0 5px',
        fontWeight: '600'
    },
    subtitle: {
        fontSize: '1rem',
        color: '#666',
        margin: 0
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '500px'
    },
    loadingText: {
        marginTop: '20px',
        color: '#666',
        fontSize: '1.1rem'
    },
    errorContainer: {
        textAlign: 'center',
        padding: '60px',
        background: '#f8d7da',
        color: '#721c24',
        borderRadius: '12px',
        margin: '40px auto',
        maxWidth: '500px'
    },
    errorTitle: {
        fontSize: '1.5rem',
        margin: '15px 0 10px'
    },
    errorMessage: {
        marginBottom: '20px',
        color: '#721c24'
    },
    retryButton: {
        padding: '12px 30px',
        background: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '500'
    },
    statsContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px',
        marginBottom: '30px'
    },
    statBox: {
        background: 'white',
        padding: '20px',
        borderRadius: '10px',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    },
    statNumber: {
        display: 'block',
        fontSize: '1.8rem',
        fontWeight: 'bold',
        color: '#3498db',
        marginBottom: '5px'
    },
    statLabel: {
        fontSize: '0.9rem',
        color: '#666'
    },
    emptyState: {
        textAlign: 'center',
        padding: '80px 20px',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    },
    emptyTitle: {
        fontSize: '1.8rem',
        color: '#333',
        margin: '20px 0 10px'
    },
    emptyText: {
        color: '#666',
        marginBottom: '30px',
        fontSize: '1.1rem'
    },
    shopButton: {
        display: 'inline-block',
        padding: '15px 40px',
        background: '#3498db',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '8px',
        fontSize: '1.1rem',
        fontWeight: '500',
        transition: 'background 0.3s'
    },
    ordersList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    orderCard: {
        background: 'white',
        borderRadius: '12px',
        padding: '25px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'transform 0.3s, box-shadow 0.3s'
    },
    orderHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '15px',
        borderBottom: '2px solid #f0f0f0'
    },
    orderHeaderLeft: {
        flex: 1
    },
    orderNumber: {
        fontSize: '1.2rem',
        margin: '0 0 5px',
        color: '#3498db',
        fontWeight: '600'
    },
    orderDate: {
        color: '#666',
        fontSize: '0.9rem',
        margin: 0,
        display: 'flex',
        alignItems: 'center'
    },
    statusBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        borderRadius: '30px',
        fontSize: '0.9rem',
        fontWeight: '500'
    },
    orderContent: {
        marginBottom: '20px'
    },
    orderSummary: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '15px',
        marginBottom: '20px',
        padding: '15px',
        background: '#f8f9fa',
        borderRadius: '8px'
    },
    summaryItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
    },
    summaryLabel: {
        fontSize: '0.85rem',
        color: '#666'
    },
    summaryValue: {
        fontSize: '1.1rem',
        fontWeight: '600',
        color: '#333'
    },
    itemsPreview: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        flexWrap: 'wrap'
    },
    previewItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px 12px',
        background: '#f8f9fa',
        borderRadius: '8px'
    },
    previewImage: {
        width: '40px',
        height: '40px',
        borderRadius: '6px',
        objectFit: 'cover'
    },
    previewInfo: {
        display: 'flex',
        flexDirection: 'column'
    },
    previewName: {
        fontSize: '0.9rem',
        fontWeight: '500',
        color: '#333'
    },
    previewQuantity: {
        fontSize: '0.8rem',
        color: '#666'
    },
    moreItems: {
        fontSize: '0.9rem',
        color: '#666',
        fontStyle: 'italic'
    },
    orderActions: {
        display: 'flex',
        gap: '10px',
        marginTop: '20px',
        paddingTop: '20px',
        borderTop: '1px solid #f0f0f0'
    },
    actionButton: {
        padding: '10px 20px',
        border: '1px solid #ddd',
        borderRadius: '6px',
        background: 'white',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '0.9rem',
        color: '#333',
        textDecoration: 'none',
        transition: 'all 0.3s'
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
    },
    modal: {
        background: 'white',
        borderRadius: '16px',
        width: '90%',
        maxWidth: '900px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
    },
    modalHeader: {
        padding: '25px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#f8f9fa',
        borderRadius: '16px 16px 0 0'
    },
    modalTitle: {
        fontSize: '1.5rem',
        margin: 0,
        color: '#333'
    },
    closeButton: {
        fontSize: '2rem',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#666',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        transition: 'background 0.3s'
    },
    modalBody: {
        padding: '25px'
    },
    infoSection: {
        marginBottom: '30px',
        padding: '20px',
        background: '#f8f9fa',
        borderRadius: '12px'
    },
    sectionTitle: {
        fontSize: '1.2rem',
        margin: '0 0 15px',
        color: '#333',
        fontWeight: '600'
    },
    infoGrid: {
        display: 'grid',
        gap: '12px'
    },
    infoRow: {
        display: 'flex',
        alignItems: 'center'
    },
    infoLabel: {
        width: '100px',
        fontSize: '0.95rem',
        color: '#666',
        fontWeight: '500'
    },
    infoValue: {
        flex: 1,
        fontSize: '0.95rem',
        color: '#333'
    },
    itemsSection: {
        marginBottom: '30px'
    },
    itemsTable: {
        width: '100%',
        borderCollapse: 'collapse'
    },
    tableHeader: {
        textAlign: 'left',
        padding: '12px',
        background: '#f8f9fa',
        fontSize: '0.95rem',
        fontWeight: '600',
        color: '#333'
    },
    tableRow: {
        borderBottom: '1px solid #f0f0f0'
    },
    tableCell: {
        padding: '12px',
        fontSize: '0.95rem'
    },
    productCell: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    productImage: {
        width: '40px',
        height: '40px',
        borderRadius: '6px',
        objectFit: 'cover'
    },
    totalLabel: {
        padding: '8px 12px',
        textAlign: 'right',
        fontSize: '0.95rem'
    },
    totalValue: {
        padding: '8px 12px',
        fontSize: '0.95rem'
    },
    grandTotalRow: {
        background: '#f8f9fa',
        borderTop: '2px solid #ddd'
    },
    grandTotalLabel: {
        padding: '15px 12px',
        textAlign: 'right',
        fontSize: '1.1rem'
    },
    grandTotalValue: {
        padding: '15px 12px',
        fontSize: '1.1rem',
        color: '#28a745'
    },
    timelineSection: {
        marginBottom: '20px'
    },
    timeline: {
        position: 'relative',
        paddingLeft: '30px'
    },
    timelineItem: {
        position: 'relative',
        paddingBottom: '25px'
    },
    timelineDot: {
        position: 'absolute',
        left: '-26px',
        top: '0',
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        background: '#3498db',
        border: '2px solid white',
        boxShadow: '0 0 0 2px #3498db'
    },
    timelineContent: {
        background: '#f8f9fa',
        padding: '15px',
        borderRadius: '8px'
    },
    timelineStatus: {
        margin: '0 0 5px',
        fontSize: '1rem',
        fontWeight: '600',
        color: '#333',
        textTransform: 'capitalize'
    },
    timelineDescription: {
        margin: '0 0 5px',
        fontSize: '0.95rem',
        color: '#666'
    },
    timelineDate: {
        margin: 0,
        fontSize: '0.85rem',
        color: '#999'
    },
    modalFooter: {
        padding: '20px 25px',
        borderTop: '1px solid #f0f0f0',
        display: 'flex',
        gap: '10px',
        justifyContent: 'flex-end'
    },
    footerButton: {
        padding: '10px 20px',
        border: 'none',
        borderRadius: '6px',
        background: '#3498db',
        color: 'white',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '0.95rem',
        fontWeight: '500',
        transition: 'background 0.3s'
    }
};

export default Orders;