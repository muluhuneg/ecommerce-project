import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { 
    FaBell, 
    FaShoppingBag,
    FaMoneyBillWave,
    FaBox,
    FaStore,
    FaShieldAlt,
    FaGift,
    FaInfoCircle,
    FaTrash,
    FaArchive,
    FaCheck,
    FaFilter,
    FaSort,
    FaEye,
    FaClock,
    FaSpinner
} from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

const Notifications = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { 
        notifications, 
        unreadCount,
        markAsRead, 
        markAllAsRead,
        archiveNotification,
        deleteNotification,
        loading
    } = useNotifications();

    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [selectedType, setSelectedType] = useState('all');

    // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    // Add global animations
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    // NOW we can have conditional returns
    if (!user) {
        return null; // Will redirect via useEffect
    }

    // Filter and sort notifications
    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.is_read;
        if (filter === 'read') return n.is_read;
        return true;
    }).filter(n => {
        if (selectedType !== 'all') return n.type === selectedType;
        return true;
    });

    const sortedNotifications = [...filteredNotifications].sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
        if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
        return 0;
    });

    const getIconAndColor = (type) => {
        switch(type) {
            case 'order': return { icon: <FaShoppingBag />, bg: '#e3f2fd', color: '#1976d2' };
            case 'payment': return { icon: <FaMoneyBillWave />, bg: '#e8f5e8', color: '#2e7d32' };
            case 'product': return { icon: <FaBox />, bg: '#fff3e0', color: '#ed6c02' };
            case 'seller': return { icon: <FaStore />, bg: '#f3e5f5', color: '#9c27b0' };
            case 'admin': return { icon: <FaShieldAlt />, bg: '#ffebee', color: '#d32f2f' };
            case 'promotion': return { icon: <FaGift />, bg: '#fff9c4', color: '#ff8f00' };
            case 'system': return { icon: <FaInfoCircle />, bg: '#e0f2f1', color: '#00796b' };
            default: return { icon: <FaBell />, bg: '#f5f5f5', color: '#757575' };
        }
    };

    const notificationTypes = [
        { value: 'all', label: 'All Types' },
        { value: 'order', label: 'Orders' },
        { value: 'payment', label: 'Payments' },
        { value: 'product', label: 'Products' },
        { value: 'seller', label: 'Seller' },
        { value: 'admin', label: 'Admin' },
        { value: 'promotion', label: 'Promotions' },
        { value: 'system', label: 'System' }
    ];

    const filterOptions = [
        { value: 'all', label: 'All' },
        { value: 'unread', label: 'Unread' },
        { value: 'read', label: 'Read' }
    ];

    const sortOptions = [
        { value: 'newest', label: 'Newest First' },
        { value: 'oldest', label: 'Oldest First' }
    ];

    // Styles
    const styles = {
        container: {
            padding: '20px',
            backgroundColor: '#f8f9fa',
            minHeight: 'calc(100vh - 140px)',
            width: '100%',
            boxSizing: 'border-box'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            backgroundColor: 'white',
            padding: '15px 20px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        },
        titleSection: {
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
        },
        title: {
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#333',
            margin: 0
        },
        unreadBadge: {
            backgroundColor: '#667eea',
            color: 'white',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '14px'
        },
        markAllBtn: {
            padding: '8px 16px',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '14px',
            transition: 'all 0.3s'
        },
        filters: {
            display: 'flex',
            gap: '10px',
            marginBottom: '20px',
            flexWrap: 'wrap',
            backgroundColor: 'white',
            padding: '15px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        },
        select: {
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            minWidth: '120px',
            backgroundColor: 'white',
            cursor: 'pointer'
        },
        loadingContainer: {
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        },
        spinner: {
            animation: 'spin 1s linear infinite',
            color: '#667eea'
        },
        emptyState: {
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        },
        notificationsList: {
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
        },
        notificationCard: {
            display: 'flex',
            padding: '15px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            borderLeft: '4px solid transparent',
            width: '100%',
            boxSizing: 'border-box',
            transition: 'all 0.3s'
        },
        iconContainer: {
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '15px',
            fontSize: '18px',
            flexShrink: 0
        },
        content: {
            flex: 1,
            minWidth: 0
        },
        headerRow: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '5px',
            flexWrap: 'wrap',
            gap: '5px'
        },
        titleWrapper: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap'
        },
        notificationTitle: {
            fontSize: '16px',
            fontWeight: '600',
            color: '#333',
            margin: 0
        },
        newBadge: {
            backgroundColor: '#667eea',
            color: 'white',
            fontSize: '10px',
            padding: '2px 6px',
            borderRadius: '10px'
        },
        timeText: {
            fontSize: '12px',
            color: '#999',
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            whiteSpace: 'nowrap'
        },
        message: {
            fontSize: '14px',
            color: '#666',
            margin: '5px 0 8px 0',
            lineHeight: '1.4'
        },
        metaSection: {
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            marginBottom: '8px',
            flexWrap: 'wrap'
        },
        typeBadge: {
            fontSize: '11px',
            padding: '2px 8px',
            borderRadius: '12px',
            fontWeight: '500'
        },
        priorityBadge: {
            fontSize: '11px',
            padding: '2px 8px',
            borderRadius: '12px',
            color: 'white'
        },
        viewLink: {
            color: '#667eea',
            textDecoration: 'none',
            fontSize: '13px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
            padding: '4px 8px',
            backgroundColor: '#f0f4ff',
            borderRadius: '4px',
            transition: 'all 0.3s'
        },
        actions: {
            display: 'flex',
            gap: '5px',
            marginLeft: '10px',
            alignItems: 'flex-start',
            flexShrink: 0
        },
        actionBtn: {
            padding: '5px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            borderRadius: '4px',
            transition: 'all 0.2s'
        }
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loadingContainer}>
                    <FaSpinner size={40} style={styles.spinner} />
                    <p style={{ marginTop: '15px', color: '#666' }}>Loading notifications...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header Section */}
            <div style={styles.header}>
                <div style={styles.titleSection}>
                    <h1 style={styles.title}>Notifications</h1>
                    {unreadCount > 0 && (
                        <span style={styles.unreadBadge}>{unreadCount} unread</span>
                    )}
                </div>
                {unreadCount > 0 && (
                    <button 
                        style={styles.markAllBtn} 
                        onClick={markAllAsRead}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#764ba2';
                            e.target.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#667eea';
                            e.target.style.transform = 'translateY(0)';
                        }}
                    >
                        <FaCheck size={12} /> Mark All Read
                    </button>
                )}
            </div>

            {/* Filters Section */}
            <div style={styles.filters}>
                <select value={filter} onChange={(e) => setFilter(e.target.value)} style={styles.select}>
                    {filterOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={styles.select}>
                    {sortOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} style={styles.select}>
                    {notificationTypes.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>

            {/* Notifications List */}
            {sortedNotifications.length === 0 ? (
                <div style={styles.emptyState}>
                    <FaBell size={40} color="#ddd" />
                    <h3 style={{ margin: '15px 0 5px', color: '#333' }}>No notifications</h3>
                    <p style={{ color: '#666' }}>
                        {filter !== 'all' || selectedType !== 'all' 
                            ? 'No notifications match your filters.' 
                            : "You're all caught up!"}
                    </p>
                </div>
            ) : (
                <div style={styles.notificationsList}>
                    {sortedNotifications.map(notification => {
                        const { icon, bg, color } = getIconAndColor(notification.type);
                        return (
                            <div 
                                key={notification.id}
                                style={{
                                    ...styles.notificationCard,
                                    backgroundColor: notification.is_read ? '#fff' : '#f0f7ff',
                                    borderLeftColor: notification.priority === 'high' ? '#ff9800' : 
                                                    notification.priority === 'urgent' ? '#f44336' : 
                                                    notification.priority === 'low' ? '#4caf50' : '#667eea'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                                }}
                            >
                                {/* Icon */}
                                <div style={{...styles.iconContainer, backgroundColor: bg, color: color}}>
                                    {icon}
                                </div>

                                {/* Content */}
                                <div style={styles.content}>
                                    <div style={styles.headerRow}>
                                        <div style={styles.titleWrapper}>
                                            <span style={styles.notificationTitle}>
                                                {notification.title}
                                            </span>
                                            {!notification.is_read && (
                                                <span style={styles.newBadge}>New</span>
                                            )}
                                        </div>
                                        <span style={styles.timeText}>
                                            <FaClock size={10} /> {
                                                notification.created_at 
                                                    ? formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })
                                                    : 'Just now'
                                            }
                                        </span>
                                    </div>

                                    <p style={styles.message}>{notification.message}</p>

                                    <div style={styles.metaSection}>
                                        <span style={{
                                            ...styles.typeBadge,
                                            backgroundColor: bg,
                                            color: color
                                        }}>
                                            {notification.type?.toUpperCase()}
                                        </span>
                                        {notification.priority && (
                                            <span style={{
                                                ...styles.priorityBadge,
                                                backgroundColor: notification.priority === 'high' ? '#ff9800' :
                                                                notification.priority === 'urgent' ? '#f44336' :
                                                                notification.priority === 'low' ? '#4caf50' : '#9e9e9e'
                                            }}>
                                                {notification.priority.toUpperCase()}
                                            </span>
                                        )}
                                    </div>

                                    {notification.action_url && (
                                        <Link 
                                            to={notification.action_url} 
                                            style={styles.viewLink}
                                            onClick={() => !notification.is_read && markAsRead(notification.id)}
                                        >
                                            View Details →
                                        </Link>
                                    )}
                                </div>

                                {/* Actions */}
                                <div style={styles.actions}>
                                    {!notification.is_read && (
                                        <button
                                            style={styles.actionBtn}
                                            onClick={() => markAsRead(notification.id)}
                                            title="Mark as read"
                                        >
                                            <FaEye color="#2196f3" />
                                        </button>
                                    )}
                                    <button
                                        style={styles.actionBtn}
                                        onClick={() => archiveNotification(notification.id)}
                                        title="Archive"
                                    >
                                        <FaArchive color="#ff9800" />
                                    </button>
                                    <button
                                        style={styles.actionBtn}
                                        onClick={() => {
                                            if (window.confirm('Delete this notification?')) {
                                                deleteNotification(notification.id);
                                            }
                                        }}
                                        title="Delete"
                                    >
                                        <FaTrash color="#f44336" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Notifications;