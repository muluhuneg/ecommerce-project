import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import adminApi from '../../services/adminApi';
import { FaBell, FaCheck, FaCircle, FaExclamationTriangle, FaArrowRight } from 'react-icons/fa';

const AdminNotifications = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [pendingSellers, setPendingSellers] = useState(0);
    const [pendingProducts, setPendingProducts] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const [adminNotifications, dashboardStats] = await Promise.all([
                adminApi.getNotifications(),
                adminApi.getDashboardStats()
            ]);

            setNotifications(Array.isArray(adminNotifications) ? adminNotifications : []);
            setPendingSellers(dashboardStats.pending_sellers || 0);
            setPendingProducts(dashboardStats.pending_products || 0);
        } catch (fetchError) {
            console.error('Error fetching admin notifications:', fetchError);
            setError('Unable to download notifications. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            await adminApi.markNotificationRead(notificationId);
            setNotifications((prev) => prev.map((n) => n.id === notificationId ? { ...n, is_read: true } : n));
        } catch (err) {
            console.error('Error marking notification read:', err);
        }
    };

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    return (
        <div className="admin-page" style={styles.container}>
            <AdminSidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
            <button style={styles.menuButton} onClick={() => setIsMobileMenuOpen(true)}>☰</button>
            <div className="admin-main-content" style={styles.mainContent}>
                <h1 style={styles.heading}>Admin Notifications</h1>

                <div style={styles.summaryCards}>
                    <div style={styles.summaryCard}>
                        <h3>Pending Sellers</h3>
                        <p>{pendingSellers}</p>
                        <Link to="/admin/sellers" style={styles.link}>Review <FaArrowRight /></Link>
                    </div>
                    <div style={styles.summaryCard}>
                        <h3>Pending Products</h3>
                        <p>{pendingProducts}</p>
                        <Link to="/admin/products" style={styles.link}>Review <FaArrowRight /></Link>
                    </div>
                    <div style={styles.summaryCard}>
                        <h3>Unread Alerts</h3>
                        <p>{unreadCount}</p>
                        <span style={{ color: '#666', fontSize: 14 }}>Click bell to mark read</span>
                    </div>
                </div>

                {loading ? (
                    <div style={styles.loading}>Loading notifications...</div>
                ) : error ? (
                    <div style={styles.error}>{error}</div>
                ) : notifications.length === 0 ? (
                    <div style={styles.empty}>No notifications yet.</div>
                ) : (
                    <div style={styles.list}>
                        {notifications.map((notification) => (
                            <div key={notification.id} style={{ ...styles.notificationCard, backgroundColor: notification.is_read ? '#fff' : '#f0f7ff' }}>
                                <div style={styles.iconBadge}>
                                    <FaBell size={18} color={notification.is_read ? '#bbb' : '#2a73ff'} />
                                    {!notification.is_read && <FaCircle size={8} color="#ff3b30" style={{ position: 'absolute', top: 0, right: 0 }} />}
                                </div>
                                <div style={styles.content}>
                                    <h3 style={styles.title}>{notification.title}</h3>
                                    <p style={styles.message}>{notification.message}</p>
                                    <small style={styles.meta}>{notification.type?.toUpperCase()} • {new Date(notification.created_at).toLocaleString()}</small>
                                </div>
                                <div style={styles.actions}>
                                    {!notification.is_read && (
                                        <button style={styles.actionButton} onClick={() => handleMarkAsRead(notification.id)}>
                                            <FaCheck />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
        position: 'relative',
        overflowX: 'hidden'
    },
    menuButton: {
        position: 'fixed',
        top: '15px',
        left: '15px',
        zIndex: 1170,
        background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
        border: 'none',
        color: 'white',
        width: '45px',
        height: '45px',
        borderRadius: '8px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    mainContent: {
        flex: 1,
        padding: '25px',
        marginLeft: '0'
    },
    heading: {
        color: '#000',
        marginBottom: '16px'
    },
    summaryCards: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '15px',
        marginBottom: '20px'
    },
    summaryCard: {
        borderRadius: '8px',
        background: '#fff',
        padding: '15px',
        boxShadow: '0 1px 5px rgba(0,0,0,0.08)',
        color: '#000'
    },
    link: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        textDecoration: 'none',
        color: '#007bff',
        marginTop: '8px'
    },
    loading: {
        background: '#fff',
        padding: '30px',
        borderRadius: '8px',
        color: '#666'
    },
    error: {
        color: '#dc3545',
        background: '#fff',
        padding: '20px',
        borderRadius: '8px'
    },
    empty: {
        background: '#fff',
        padding: '30px',
        borderRadius: '8px',
        color: '#666'
    },
    list: {
        display: 'grid',
        gap: '12px'
    },
    notificationCard: {
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
        padding: '14px',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        border: '1px solid #e6e6e6'
    },
    iconBadge: {
        position: 'relative',
        minWidth: '36px',
        minHeight: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    content: {
        flex: 1
    },
    title: {
        margin: '0 0 6px',
        fontSize: '16px',
        color: '#222'
    },
    message: {
        margin: 0,
        color: '#555'
    },
    meta: {
        display: 'block',
        marginTop: '6px',
        color: '#888',
        fontSize: '12px'
    },
    actions: {
        display: 'flex',
        alignItems: 'center',
        gap: '5px'
    },
    actionButton: {
        background: '#28a745',
        border: 'none',
        color: '#fff',
        padding: '7px',
        borderRadius: '6px',
        cursor: 'pointer'
    }
};

export default AdminNotifications;
