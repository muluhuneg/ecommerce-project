import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { 
    FaBell, 
    FaCheck,
    FaShoppingBag,
    FaMoneyBillWave,
    FaBox,
    FaStore,
    FaShieldAlt,
    FaGift,
    FaInfoCircle,
    FaClock
} from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

const NotificationBell = () => {
    const { user } = useAuth();
    const { 
        unreadCount, 
        notifications, 
        showDropdown, 
        setShowDropdown,
        markAsRead,
        markAllAsRead,
        fetchNotifications,
        fetchUnreadCount
    } = useNotifications();
    
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);

    useEffect(() => {
        if (user) {
            fetchNotifications();
            fetchUnreadCount();
        }
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
                buttonRef.current && !buttonRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [setShowDropdown]);

    const getNotificationIcon = (type) => {
        switch(type) {
            case 'order': return <FaShoppingBag />;
            case 'payment': return <FaMoneyBillWave />;
            case 'product': return <FaBox />;
            case 'seller': return <FaStore />;
            case 'admin': return <FaShieldAlt />;
            case 'promotion': return <FaGift />;
            case 'system': return <FaInfoCircle />;
            default: return <FaBell />;
        }
    };

    const getIconBackground = (type) => {
        switch(type) {
            case 'order': return '#e3f2fd';
            case 'payment': return '#e8f5e8';
            case 'product': return '#fff3e0';
            case 'seller': return '#f3e5f5';
            case 'admin': return '#ffebee';
            case 'promotion': return '#fff9c4';
            case 'system': return '#e0f2f1';
            default: return '#f5f5f5';
        }
    };

    const getIconColor = (type) => {
        switch(type) {
            case 'order': return '#1976d2';
            case 'payment': return '#2e7d32';
            case 'product': return '#ed6c02';
            case 'seller': return '#9c27b0';
            case 'admin': return '#d32f2f';
            case 'promotion': return '#ff8f00';
            case 'system': return '#00796b';
            default: return '#757575';
        }
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.is_read) {
            await markAsRead(notification.id);
        }
        setShowDropdown(false);
        
        if (notification.action_url) {
            navigate(notification.action_url);
        }
    };

    const handleMarkAllRead = async () => {
        await markAllAsRead();
    };

    if (!user) return null;

    // FIXED STYLES - Proper z-index and positioning
    const styles = {
        container: {
            position: 'relative',
            display: 'inline-block',
            marginLeft: '10px',
            zIndex: 1000 // Lower z-index so it doesn't overlap dashboard
        },
        bellButton: {
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            position: 'relative',
            color: 'white',
            transition: 'all 0.3s ease',
            outline: 'none'
        },
        badge: {
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            background: '#ff6b6b',
            color: 'white',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            fontSize: '0.7rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            border: '2px solid white'
        },
        dropdown: {
            position: 'absolute',
            top: '50px',
            right: 0,
            width: '360px',
            maxHeight: '480px',
            overflowY: 'auto',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            zIndex: 1001, // Slightly higher than button but still manageable
            animation: 'slideDown 0.3s ease'
        },
        dropdownHeader: {
            padding: '15px 20px',
            borderBottom: '1px solid #eee',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#f8f9fa',
            position: 'sticky',
            top: 0,
            zIndex: 2
        },
        dropdownTitle: {
            margin: 0,
            fontSize: '1.1rem',
            color: '#333',
            fontWeight: '600'
        },
        markAllReadBtn: {
            background: 'none',
            border: 'none',
            color: '#667eea',
            cursor: 'pointer',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            borderRadius: '4px',
            transition: 'all 0.3s',
            fontWeight: '500'
        },
        notificationsList: {
            maxHeight: '350px',
            overflowY: 'auto'
        },
        notificationItem: {
            display: 'flex',
            padding: '15px 20px',
            borderBottom: '1px solid #f0f0f0',
            cursor: 'pointer',
            transition: 'all 0.3s',
            position: 'relative'
        },
        notificationIcon: {
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '12px',
            flexShrink: 0,
            fontSize: '1.2rem'
        },
        notificationContent: {
            flex: 1,
            minWidth: 0
        },
        notificationTitle: {
            margin: '0 0 4px',
            fontSize: '0.95rem',
            color: '#333',
            fontWeight: '600'
        },
        notificationMessage: {
            margin: '0 0 4px',
            fontSize: '0.85rem',
            color: '#666',
            lineHeight: '1.4',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
        },
        notificationTime: {
            fontSize: '0.75rem',
            color: '#999',
            display: 'flex',
            alignItems: 'center',
            gap: '3px'
        },
        unreadDot: {
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#4facfe',
            position: 'absolute',
            top: '50%',
            right: '15px',
            transform: 'translateY(-50%)'
        },
        emptyState: {
            padding: '40px 20px',
            textAlign: 'center',
            color: '#999'
        },
        emptyIcon: {
            color: '#ddd',
            marginBottom: '10px',
            fontSize: '2.5rem'
        },
        dropdownFooter: {
            padding: '12px 20px',
            borderTop: '1px solid #eee',
            textAlign: 'center',
            background: '#f8f9fa',
            position: 'sticky',
            bottom: 0,
            zIndex: 2
        },
        viewAllLink: {
            color: '#667eea',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: '500',
            display: 'inline-block',
            padding: '6px 12px',
            borderRadius: '20px',
            transition: 'all 0.3s'
        }
    };

    return (
        <div style={styles.container}>
            <button 
                ref={buttonRef}
                style={styles.bellButton}
                onClick={() => setShowDropdown(!showDropdown)}
                aria-label="Notifications"
            >
                <FaBell size={20} />
                {unreadCount > 0 && (
                    <span style={styles.badge}>{unreadCount}</span>
                )}
            </button>

            {showDropdown && (
                <div ref={dropdownRef} style={styles.dropdown}>
                    <div style={styles.dropdownHeader}>
                        <h3 style={styles.dropdownTitle}>Notifications</h3>
                        {unreadCount > 0 && (
                            <button 
                                style={styles.markAllReadBtn}
                                onClick={handleMarkAllRead}
                            >
                                <FaCheck size={12} /> Mark all read
                            </button>
                        )}
                    </div>

                    <div style={styles.notificationsList}>
                        {notifications.length === 0 ? (
                            <div style={styles.emptyState}>
                                <FaBell style={styles.emptyIcon} />
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            notifications.slice(0, 5).map(notification => {
                                const icon = getNotificationIcon(notification.type);
                                const bgColor = getIconBackground(notification.type);
                                const iconColor = getIconColor(notification.type);
                                
                                return (
                                    <div 
                                        key={notification.id}
                                        style={{
                                            ...styles.notificationItem,
                                            backgroundColor: notification.is_read ? '#fff' : '#f0f7ff'
                                        }}
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <div style={{...styles.notificationIcon, backgroundColor: bgColor, color: iconColor}}>
                                            {icon}
                                        </div>
                                        <div style={styles.notificationContent}>
                                            <h4 style={styles.notificationTitle}>
                                                {notification.title}
                                            </h4>
                                            <p style={styles.notificationMessage}>
                                                {notification.message}
                                            </p>
                                            <span style={styles.notificationTime}>
                                                <FaClock size={10} /> {
                                                    notification.created_at 
                                                        ? formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })
                                                        : 'Just now'
                                                }
                                            </span>
                                        </div>
                                        {!notification.is_read && (
                                            <span style={styles.unreadDot} />
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div style={styles.dropdownFooter}>
                            <Link to="/notifications" style={styles.viewAllLink} onClick={() => setShowDropdown(false)}>
                                View All Notifications
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Add global animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(styleSheet);

export default NotificationBell;