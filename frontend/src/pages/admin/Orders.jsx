import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import adminApi from '../../services/adminApi';
import { FaEye, FaTruck, FaCheck, FaTimes } from 'react-icons/fa';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isDesktop = windowWidth > 768;

    useEffect(() => {
        fetchOrders();
    }, [statusFilter]);

    const fetchOrders = async () => {
        try {
            const data = await adminApi.getAllOrders(statusFilter);
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            await adminApi.updateOrderStatus(orderId, newStatus);
            fetchOrders();
        } catch (error) {
            console.error('Error updating order:', error);
        }
    };

    const styles = {
        container: {
            display: 'flex',
            backgroundColor: '#f5f5f5',
            minHeight: '100vh'
        },
        mainContent: {
            flex: 1,
            marginLeft: isDesktop ? '280px' : '0',
            padding: '2rem',
            transition: 'margin-left 0.3s ease'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem'
        },
        title: {
            fontSize: '2rem',
            color: '#333'
        },
        filterSelect: {
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '1rem',
            minWidth: '200px'
        },
        table: {
            width: '100%',
            backgroundColor: 'white',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        },
        tableHeader: {
            backgroundColor: '#f8f9fa',
            padding: '1rem',
            textAlign: 'left',
            borderBottom: '2px solid #dee2e6'
        },
        tableRow: {
            borderBottom: '1px solid #dee2e6'
        },
        tableCell: {
            padding: '1rem'
        },
        statusBadge: {
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            fontSize: '0.875rem',
            display: 'inline-block',
            color: 'white'
        },
        actionButton: {
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            marginRight: '0.5rem'
        },
        loadingContainer: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '400px'
        },
        menuButton: {
            position: 'fixed',
            top: '15px',
            left: '15px',
            zIndex: 1170,
            width: '40px',
            height: '40px',
            border: 'none',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
            color: 'white',
            cursor: 'pointer',
            fontSize: '1.2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        spinner: {
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite'
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'delivered': return '#2ecc71';
            case 'processing': return '#f39c12';
            case 'shipped': return '#3498db';
            case 'pending': return '#e74c3c';
            default: return '#95a5a6';
        }
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <AdminSidebar />
                <div style={styles.mainContent}>
                    <div style={styles.loadingContainer}>
                        <div style={styles.spinner}></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <AdminSidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
            {!isDesktop && (
                <button style={styles.menuButton} onClick={() => setIsMobileMenuOpen(true)}>
                    ☰
                </button>
            )}
            <div style={styles.mainContent}>
                <div style={styles.header}>
                    <h1 style={styles.title}>Order Management</h1>
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
                    </select>
                </div>

                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.tableHeader}>Order #</th>
                            <th style={styles.tableHeader}>Customer</th>
                            <th style={styles.tableHeader}>Seller</th>
                            <th style={styles.tableHeader}>Total</th>
                            <th style={styles.tableHeader}>Status</th>
                            <th style={styles.tableHeader}>Payment</th>
                            <th style={styles.tableHeader}>Date</th>
                            <th style={styles.tableHeader}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.id} style={styles.tableRow}>
                                <td style={styles.tableCell}>{order.order_number}</td>
                                <td style={styles.tableCell}>{order.customer_name}</td>
                                <td style={styles.tableCell}>{order.seller_name || 'N/A'}</td>
                                <td style={styles.tableCell}>${order.grand_total}</td>
                                <td style={styles.tableCell}>
                                    <span style={{
                                        ...styles.statusBadge,
                                        backgroundColor: getStatusColor(order.status)
                                    }}>
                                        {order.status}
                                    </span>
                                </td>
                                <td style={styles.tableCell}>
                                    <span style={{
                                        ...styles.statusBadge,
                                        backgroundColor: order.payment_status === 'paid' ? '#2ecc71' : '#e74c3c'
                                    }}>
                                        {order.payment_status}
                                    </span>
                                </td>
                                <td style={styles.tableCell}>
                                    {new Date(order.created_at).toLocaleDateString()}
                                </td>
                                <td style={styles.tableCell}>
                                    <select
                                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                        value={order.status}
                                        style={styles.filterSelect}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminOrders;