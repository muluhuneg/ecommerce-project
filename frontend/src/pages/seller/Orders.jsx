import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/seller/Sidebar';
import sellerApi from '../../services/sellerApi';
import { 
    FaEye, 
    FaSpinner, 
    FaCheck, 
    FaTruck, 
    FaBox, 
    FaClock,
    FaExclamationCircle,
    FaSearch,
    FaFilter,
    FaDownload
} from 'react-icons/fa';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [updatingOrderId, setUpdatingOrderId] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const filterOrders = useCallback(() => {
        let filtered = [...orders];

        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(order => order.status === statusFilter);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(order => 
                order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredOrders(filtered);
    }, [orders, statusFilter, searchTerm]);

    useEffect(() => {
        filterOrders();
    }, [filterOrders]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await sellerApi.getOrders();
            setOrders(data);
            setFilteredOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };



    const updateStatus = async (orderId, newStatus) => {
        setUpdatingOrderId(orderId);
        try {
            await sellerApi.updateOrderStatus(orderId, newStatus, '');
            // Show success message
            alert('Order status updated successfully');
            // Refresh orders
            await fetchOrders();
        } catch (error) {
            console.error('Error updating order:', error);
            alert('Failed to update order status');
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const viewOrderDetails = async (order) => {
        try {
            const orderDetails = await sellerApi.getOrderDetails(order.id);
            setSelectedOrder(orderDetails);
            setShowDetails(true);
        } catch (error) {
            console.error('Error fetching order details:', error);
        }
    };

    const getStatusBadgeStyle = (status) => {
        const styles = {
            pending: { bg: '#fff3cd', color: '#856404', icon: <FaClock /> },
            processing: { bg: '#cce5ff', color: '#004085', icon: <FaBox /> },
            shipped: { bg: '#d1ecf1', color: '#0c5460', icon: <FaTruck /> },
            delivered: { bg: '#d4edda', color: '#155724', icon: <FaCheck /> },
            cancelled: { bg: '#f8d7da', color: '#721c24', icon: <FaExclamationCircle /> }
        };
        return styles[status] || styles.pending;
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

    const getStatusCounts = () => {
        return {
            all: orders.length,
            pending: orders.filter(o => o.status === 'pending').length,
            processing: orders.filter(o => o.status === 'processing').length,
            shipped: orders.filter(o => o.status === 'shipped').length,
            delivered: orders.filter(o => o.status === 'delivered').length,
            cancelled: orders.filter(o => o.status === 'cancelled').length
        };
    };

    const stats = getStatusCounts();

    if (loading) {
        return (
            <div style={{ display: 'flex' }}>
                <Sidebar />
                <div style={styles.loadingContainer}>
                    <FaSpinner className="spinner" size={40} />
                    <p>Loading your orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="seller-page" style={{ display: 'flex' }}>
            <Sidebar />
            <div className="seller-main-content" style={styles.mainContent}>
                <div style={styles.header}>
                    <h1 style={styles.title}>Orders Management</h1>
                    <div style={styles.statsContainer}>
                        <div style={styles.statBox}>
                            <span style={styles.statNumber}>{stats.all}</span>
                            <span style={styles.statLabel}>Total</span>
                        </div>
                        <div style={styles.statBox}>
                            <span style={styles.statNumber}>{stats.pending}</span>
                            <span style={styles.statLabel}>Pending</span>
                        </div>
                        <div style={styles.statBox}>
                            <span style={styles.statNumber}>{stats.processing}</span>
                            <span style={styles.statLabel}>Processing</span>
                        </div>
                        <div style={styles.statBox}>
                            <span style={styles.statNumber}>{stats.shipped}</span>
                            <span style={styles.statLabel}>Shipped</span>
                        </div>
                        <div style={styles.statBox}>
                            <span style={styles.statNumber}>{stats.delivered}</span>
                            <span style={styles.statLabel}>Delivered</span>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div style={styles.filtersContainer}>
                    <div style={styles.searchBox}>
                        <FaSearch style={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search by order # or customer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={styles.searchInput}
                        />
                    </div>
                    <div style={styles.filterBox}>
                        <FaFilter style={styles.filterIcon} />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={styles.filterSelect}
                        >
                            <option value="all">All Orders</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                {filteredOrders.length === 0 ? (
                    <div style={styles.emptyState}>
                        <FaBox size={50} color="#ccc" />
                        <h3>No orders found</h3>
                        <p>When customers order your products, they will appear here.</p>
                    </div>
                ) : (
                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th>Order #</th>
                                    <th>Customer</th>
                                    <th>Items</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map(order => {
                                    const statusStyle = getStatusBadgeStyle(order.status);
                                    return (
                                        <tr key={order.id} style={styles.tableRow}>
                                            <td style={styles.orderNumber}>
                                                {order.order_number}
                                            </td>
                                            <td>
                                                <div style={styles.customerInfo}>
                                                    <strong>{order.customer_name || 'N/A'}</strong>
                                                    <small>{order.customer_email || ''}</small>
                                                </div>
                                            </td>
                                            <td style={styles.itemCount}>
                                                {order.item_count || 0} items
                                            </td>
                                            <td style={styles.totalAmount}>
                                                {formatCurrency(order.grand_total)}
                                            </td>
                                            <td>
                                                <span style={{
                                                    ...styles.statusBadge,
                                                    backgroundColor: statusStyle.bg,
                                                    color: statusStyle.color
                                                }}>
                                                    {statusStyle.icon} {order.status}
                                                </span>
                                            </td>
                                            <td style={styles.dateCell}>
                                                {formatDate(order.created_at)}
                                            </td>
                                            <td>
                                                <div style={styles.actionButtons}>
                                                    <button 
                                                        onClick={() => viewOrderDetails(order)}
                                                        style={styles.viewButton}
                                                        title="View Details"
                                                    >
                                                        <FaEye />
                                                    </button>
                                                    <select 
                                                        onChange={(e) => updateStatus(order.id, e.target.value)}
                                                        value={order.status}
                                                        style={styles.statusSelect}
                                                        disabled={updatingOrderId === order.id}
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="processing">Processing</option>
                                                        <option value="shipped">Shipped</option>
                                                        <option value="delivered">Delivered</option>
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                    {updatingOrderId === order.id && (
                                                        <FaSpinner className="spinner-small" />
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Order Details Modal */}
                {showDetails && selectedOrder && (
                    <div style={styles.modalOverlay}>
                        <div style={styles.modal}>
                            <div style={styles.modalHeader}>
                                <h2>Order Details #{selectedOrder.order?.order_number}</h2>
                                <button onClick={() => setShowDetails(false)} style={styles.closeButton}>×</button>
                            </div>
                            <div style={styles.modalBody}>
                                <div style={styles.customerDetails}>
                                    <h3>Customer Information</h3>
                                    <p><strong>Name:</strong> {selectedOrder.order?.customer_name}</p>
                                    <p><strong>Email:</strong> {selectedOrder.order?.customer_email}</p>
                                    <p><strong>Phone:</strong> {selectedOrder.order?.customer_phone}</p>
                                    <p><strong>Address:</strong> {selectedOrder.order?.shipping_address}</p>
                                </div>
                                
                                <h3>Order Items</h3>
                                <table style={styles.itemsTable}>
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Quantity</th>
                                            <th>Price</th>
                                            <th>Total</th>
                                            <th>Your Earnings</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedOrder.items?.map(item => (
                                            <tr key={item.id}>
                                                <td>{item.name}</td>
                                                <td>{item.quantity}</td>
                                                <td>{formatCurrency(item.price)}</td>
                                                <td>{formatCurrency(item.total)}</td>
                                                <td style={styles.earnings}>
                                                    {formatCurrency(item.seller_amount)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                
                                <div style={styles.orderSummary}>
                                    <p><strong>Subtotal:</strong> {formatCurrency(selectedOrder.order?.total_amount)}</p>
                                    <p><strong>Shipping:</strong> {formatCurrency(selectedOrder.order?.shipping_cost || 0)}</p>
                                    <p><strong>Tax:</strong> {formatCurrency(selectedOrder.order?.tax_amount || 0)}</p>
                                    <p><strong>Discount:</strong> {formatCurrency(selectedOrder.order?.discount_amount || 0)}</p>
                                    <p style={styles.grandTotal}><strong>Grand Total:</strong> {formatCurrency(selectedOrder.order?.grand_total)}</p>
                                    <p style={styles.yourEarnings}><strong>Your Earnings:</strong> {formatCurrency(selectedOrder.items?.reduce((sum, item) => sum + item.seller_amount, 0))}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    .spinner {
                        animation: spin 1s linear infinite;
                    }
                    .spinner-small {
                        animation: spin 1s linear infinite;
                        margin-left: 5px;
                    }
                `}
            </style>
        </div>
    );
};

const styles = {
    mainContent: {
        marginLeft: '280px',
        padding: '2rem',
        flex: 1,
        minHeight: '100vh',
        backgroundColor: '#f8f9fa'
    },
    header: {
        marginBottom: '2rem'
    },
    title: {
        fontSize: '2rem',
        color: '#333',
        marginBottom: '1rem'
    },
    statsContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '1rem',
        marginBottom: '2rem'
    },
    statBox: {
        backgroundColor: 'white',
        padding: '1rem',
        borderRadius: '8px',
        textAlign: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    statNumber: {
        display: 'block',
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#3498db'
    },
    statLabel: {
        fontSize: '0.9rem',
        color: '#666'
    },
    filtersContainer: {
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem'
    },
    searchBox: {
        flex: 2,
        position: 'relative'
    },
    searchIcon: {
        position: 'absolute',
        left: '10px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#999'
    },
    searchInput: {
        width: '100%',
        padding: '0.75rem 1rem 0.75rem 2.5rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '1rem'
    },
    filterBox: {
        flex: 1,
        position: 'relative'
    },
    filterIcon: {
        position: 'absolute',
        left: '10px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#999'
    },
    filterSelect: {
        width: '100%',
        padding: '0.75rem 1rem 0.75rem 2.5rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '1rem',
        backgroundColor: 'white'
    },
    tableContainer: {
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        overflow: 'auto'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse'
    },
    tableRow: {
        borderBottom: '1px solid #eee'
    },
    orderNumber: {
        fontWeight: 'bold',
        color: '#3498db'
    },
    customerInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem'
    },
    itemCount: {
        textAlign: 'center'
    },
    totalAmount: {
        fontWeight: 'bold',
        color: '#28a745'
    },
    statusBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.25rem 0.75rem',
        borderRadius: '20px',
        fontSize: '0.85rem',
        fontWeight: '500'
    },
    dateCell: {
        color: '#666',
        fontSize: '0.9rem'
    },
    actionButtons: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    },
    viewButton: {
        padding: '0.5rem',
        border: 'none',
        borderRadius: '4px',
        backgroundColor: '#17a2b8',
        color: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    statusSelect: {
        padding: '0.5rem',
        borderRadius: '4px',
        border: '1px solid #ddd',
        fontSize: '0.9rem'
    },
    loadingContainer: {
        marginLeft: '280px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '500px'
    },
    emptyState: {
        textAlign: 'center',
        padding: '4rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
    },
    modal: {
        backgroundColor: 'white',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'auto'
    },
    modalHeader: {
        padding: '1.5rem',
        borderBottom: '1px solid #eee',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    closeButton: {
        fontSize: '2rem',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#666'
    },
    modalBody: {
        padding: '1.5rem'
    },
    customerDetails: {
        backgroundColor: '#f8f9fa',
        padding: '1rem',
        borderRadius: '4px',
        marginBottom: '1.5rem'
    },
    itemsTable: {
        width: '100%',
        borderCollapse: 'collapse',
        marginBottom: '1.5rem'
    },
    earnings: {
        color: '#28a745',
        fontWeight: 'bold'
    },
    orderSummary: {
        borderTop: '2px solid #eee',
        paddingTop: '1rem',
        textAlign: 'right'
    },
    grandTotal: {
        fontSize: '1.2rem',
        color: '#333'
    },
    yourEarnings: {
        fontSize: '1.2rem',
        color: '#28a745',
        fontWeight: 'bold'
    }
};

export default Orders;