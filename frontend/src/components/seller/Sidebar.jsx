import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
    FaTachometerAlt, 
    FaBox, 
    FaClipboardList, 
    FaShoppingCart,
    FaStore,
    FaWallet,
    FaChartLine,
    FaCog,
    FaSignOutAlt,
    FaBars,
    FaTimes,
    FaBell,
    FaStar,
    FaUser,
    FaPercentage,
    FaTag,
    FaFileInvoice,
    FaHistory
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [internalMobileMenuOpen, setInternalMobileMenuOpen] = useState(false);

    const isMobileOpenEffective = typeof isMobileMenuOpen === 'boolean' ? isMobileMenuOpen : internalMobileMenuOpen;
    const setMobileMenuOpen = typeof setIsMobileMenuOpen === 'function' ? setIsMobileMenuOpen : setInternalMobileMenuOpen;

    // Close sidebar on route change for mobile
    useEffect(() => {
        if (window.innerWidth <= 768) {
            setMobileMenuOpen(false);
        }
    }, [location, setMobileMenuOpen]);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768) {
                setMobileMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [setMobileMenuOpen]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { path: '/seller/dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
        { path: '/seller/products', icon: <FaBox />, label: 'Products' },
        { path: '/seller/orders', icon: <FaClipboardList />, label: 'Orders' },
        { path: '/seller/earnings', icon: <FaWallet />, label: 'Earnings' },
        { path: '/seller/analytics', icon: <FaChartLine />, label: 'Analytics' },
        { path: '/seller/reviews', icon: <FaStar />, label: 'Reviews' },
        { path: '/seller/discounts', icon: <FaPercentage />, label: 'Discounts' },
        { path: '/seller/invoices', icon: <FaFileInvoice />, label: 'Invoices' },
        { path: '/seller/history', icon: <FaHistory />, label: 'History' },
        { path: '/seller/notifications', icon: <FaBell />, label: 'Notifications', badge: 3 },
        { path: '/seller/settings', icon: <FaCog />, label: 'Settings' },
    ];

    const styles = {
        // Menu Button (always visible to toggle overlay sidebar)
        menuButton: {
            position: 'fixed',
            top: '15px',
            left: '15px',
            zIndex: 1101,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            color: 'white',
            width: '45px',
            height: '45px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
        },
        // Overlay (click to close when menu is expanded)
        overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1090,
            display: isMobileOpenEffective ? 'block' : 'none',
            backdropFilter: 'blur(3px)',
        },
        // Sidebar Container (overlay sidebar)
        sidebar: {
            width: isCollapsed ? '80px' : '280px',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            color: 'white',
            position: 'fixed',
            left: 0,
            top: 0,
            transform: isMobileOpenEffective ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'width 0.3s ease, transform 0.3s ease',
            overflowY: 'auto',
            overflowX: 'hidden',
            zIndex: 1100,
            boxShadow: '2px 0 10px rgba(0,0,0,0.3)',
        },
        // Header
        header: {
            padding: '20px',
            borderBottom: '1px solid rgba(255,215,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        logo: {
            fontSize: isCollapsed ? '1rem' : '1.5rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        },
        collapseBtn: {
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,215,0,0.3)',
            color: 'white',
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s',
            '@media (max-width: 768px)': {
                display: 'none'
            }
        },
        closeBtn: {
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,215,0,0.3)',
            color: 'white',
            width: '35px',
            height: '35px',
            borderRadius: '50%',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '1.2rem',
            '@media (max-width: 768px)': {
                display: 'flex'
            }
        },
        // User Info
        userInfo: {
            padding: '20px',
            borderBottom: '1px solid rgba(255,215,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
        },
        avatar: {
            width: isCollapsed ? '40px' : '50px',
            height: isCollapsed ? '40px' : '50px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FFD700, #FFA500, #FF6B6B)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: isCollapsed ? '1rem' : '1.5rem',
            fontWeight: 'bold',
            color: '#1a1a2e',
            flexShrink: 0,
            transition: 'all 0.3s',
        },
        userDetails: {
            flex: 1,
            overflow: 'hidden',
            display: isCollapsed ? 'none' : 'block',
            '@media (max-width: 768px)': {
                display: 'block'
            }
        },
        userName: {
            fontSize: '1rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '4px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        },
        userEmail: {
            fontSize: '0.8rem',
            color: 'rgba(255,255,255,0.6)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        },
        userRole: {
            display: 'inline-block',
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            color: '#1a1a2e',
            fontSize: '0.6rem',
            padding: '2px 8px',
            borderRadius: '12px',
            marginTop: '4px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
        },
        // Navigation
        nav: {
            padding: '20px 10px',
        },
        navItem: {
            display: 'flex',
            alignItems: 'center',
            padding: '12px 15px',
            margin: '4px 0',
            borderRadius: '8px',
            color: 'white',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
            position: 'relative',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
        },
        navIcon: {
            fontSize: '1.2rem',
            color: '#FFD700',
            minWidth: isCollapsed ? 'auto' : '24px',
            marginRight: isCollapsed ? '0' : '15px',
            transition: 'margin 0.3s',
            '@media (max-width: 768px)': {
                marginRight: '15px',
            }
        },
        navLabel: {
            flex: 1,
            fontSize: '0.95rem',
            opacity: isCollapsed ? 0 : 1,
            transition: 'opacity 0.3s',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            '@media (max-width: 768px)': {
                opacity: 1,
            }
        },
        badge: {
            background: 'linear-gradient(135deg, #ff6b6b, #ff4757)',
            color: 'white',
            fontSize: '0.7rem',
            padding: '2px 6px',
            borderRadius: '12px',
            marginLeft: '8px',
            minWidth: '20px',
            textAlign: 'center',
            opacity: isCollapsed ? 0 : 1,
            transition: 'opacity 0.3s',
            '@media (max-width: 768px)': {
                opacity: 1,
            }
        },
        // Logout Button
        logoutButton: {
            display: 'flex',
            alignItems: 'center',
            padding: '12px 15px',
            margin: '20px 10px',
            borderRadius: '8px',
            background: 'rgba(255,107,107,0.15)',
            color: '#ff6b6b',
            border: '1px solid rgba(255,107,107,0.3)',
            cursor: 'pointer',
            width: 'calc(100% - 20px)',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
        },
        logoutIcon: {
            fontSize: '1.2rem',
            minWidth: isCollapsed ? 'auto' : '24px',
            marginRight: isCollapsed ? '0' : '15px',
            transition: 'margin 0.3s',
            '@media (max-width: 768px)': {
                marginRight: '15px',
            }
        },
        logoutLabel: {
            fontSize: '0.95rem',
            opacity: isCollapsed ? 0 : 1,
            transition: 'opacity 0.3s',
            '@media (max-width: 768px)': {
                opacity: 1,
            }
        },
        // Tooltip for collapsed mode
        tooltip: {
            position: 'absolute',
            left: '100%',
            top: '50%',
            transform: 'translateY(-50%)',
            background: '#333',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.8rem',
            whiteSpace: 'nowrap',
            zIndex: 1001,
            marginLeft: '10px',
            display: 'none',
            '@media (min-width: 769px)': {
                display: isCollapsed ? 'block' : 'none',
            }
        },
    };

    return (
        <>
            {/* Mobile Menu Button */}
            <button 
                style={styles.menuButton}
                onClick={() => setMobileMenuOpen(true)}
            >
                <FaBars />
            </button>

            {/* Overlay */}
            <div style={styles.overlay} onClick={() => setMobileMenuOpen(false)} />

            {/* Sidebar */}
            <div style={styles.sidebar}>
                {/* Header */}
                <div style={styles.header}>
                    <span style={styles.logo}>
                        {isCollapsed ? 'ES' : 'E-Store Seller'}
                    </span>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        <button 
                            style={styles.collapseBtn}
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            title={isCollapsed ? 'Expand' : 'Collapse'}
                        >
                            {isCollapsed ? '→' : '←'}
                        </button>
                        <button 
                            style={styles.closeBtn}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <FaTimes />
                        </button>
                    </div>
                </div>

                {/* User Info */}
                <div style={styles.userInfo}>
                    <div style={styles.avatar}>
                        {user?.name?.charAt(0).toUpperCase() || 'S'}
                    </div>
                    <div style={styles.userDetails}>
                        <div style={styles.userName}>{user?.name || 'Seller Name'}</div>
                        <div style={styles.userEmail}>{user?.email || 'seller@email.com'}</div>
                        <div style={styles.userRole}>SELLER</div>
                    </div>
                </div>

                {/* Navigation */}
                <div style={styles.nav}>
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                style={{
                                    ...styles.navItem,
                                    background: isActive ? 'rgba(255,215,0,0.15)' : 'transparent',
                                    borderLeft: isActive ? '4px solid #FFD700' : '4px solid transparent',
                                }}
                                onClick={() => {
                                    if (window.innerWidth <= 768) {
                                        setMobileMenuOpen(false);
                                    }
                                }}
                            >
                                <span style={styles.navIcon}>{item.icon}</span>
                                <span style={styles.navLabel}>{item.label}</span>
                                {item.badge && (
                                    <span style={styles.badge}>{item.badge}</span>
                                )}
                                {isCollapsed && (
                                    <span style={styles.tooltip}>{item.label}</span>
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* Logout Button */}
                <button style={styles.logoutButton} onClick={handleLogout}>
                    <span style={styles.logoutIcon}><FaSignOutAlt /></span>
                    <span style={styles.logoutLabel}>Logout</span>
                    {isCollapsed && (
                        <span style={styles.tooltip}>Logout</span>
                    )}
                </button>
            </div>
        </>
    );
};

export default Sidebar;