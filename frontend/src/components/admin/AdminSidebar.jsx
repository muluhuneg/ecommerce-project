import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
    FaTachometerAlt, 
    FaUsers, 
    FaBox, 
    FaShoppingCart, 
    FaChartBar,
    FaTags,
    FaCog,
    FaSignOutAlt,
    FaUserShield,
    FaBell
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import adminApi from '../../services/adminApi';

const AdminSidebar = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [pendingCount, setPendingCount] = useState(0);
    const [localSidebarOpen, setLocalSidebarOpen] = useState(window.innerWidth > 768);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
            if (window.innerWidth > 768) {
                setLocalSidebarOpen(true);
                setIsMobileMenuOpen?.(true);
            } else {
                setLocalSidebarOpen(false);
                setIsMobileMenuOpen?.(false);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, [setIsMobileMenuOpen]);

    useEffect(() => {
        const fetchPending = async () => {
            try {
                const stats = await adminApi.getDashboardStats();
                setPendingCount((stats.pending_sellers || 0) + (stats.pending_products || 0));
            } catch (error) {
                console.error('Error fetching pending counts for notifications:', error);
            }
        };
        fetchPending();
    }, []);

    const isDesktop = windowWidth > 768;
    const menuOpen = isDesktop || isMobileMenuOpen || localSidebarOpen;

    const toggleMenu = () => {
        if (!isDesktop) {
            setIsMobileMenuOpen?.(!menuOpen);
            setLocalSidebarOpen(prev => !prev);
        }
    };

    const closeMenu = () => {
        if (!isDesktop) {
            setIsMobileMenuOpen?.(false);
            setLocalSidebarOpen(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const menuItems = [
        { path: '/admin/dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
        { path: '/admin/notifications', icon: <FaBell />, label: 'Notifications', badge: pendingCount },
        { path: '/admin/users', icon: <FaUsers />, label: 'Users' },
        { path: '/admin/sellers', icon: <FaUserShield />, label: 'Sellers' },
        { path: '/admin/categories', icon: <FaTags />, label: 'Categories' },
        { path: '/admin/products', icon: <FaBox />, label: 'Products' },
        { path: '/admin/orders', icon: <FaShoppingCart />, label: 'Orders' },
        { path: '/admin/reports', icon: <FaChartBar />, label: 'Reports' },
        { path: '/admin/settings', icon: <FaCog />, label: 'Settings' },
    ];

    const styles = {
        overlay: {
            display: menuOpen && !isDesktop ? 'block' : 'none',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1150,
            transition: 'opacity 0.3s ease'
        },
        sidebar: {
            width: '280px',
            height: '100vh',
            backgroundColor: '#2c3e50',
            color: 'white',
            position: isDesktop ? 'relative' : 'fixed',
            left: 0,
            top: 0,
            transform: menuOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            zIndex: 1160,
        },
        logo: {
            padding: '1.5rem',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            textAlign: 'center'
        },
        logoText: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: 'white',
            margin: 0
        },
        adminInfo: {
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
        },
        avatar: {
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: '#3498db',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: 'bold'
        },
        menuBtnWrapper: {
            position: 'fixed',
            top: '15px',
            left: '15px',
            zIndex: 1170,
            display: isDesktop ? 'none' : 'block'
        },
        menuToggleButton: {
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
        adminDetails: {
            flex: 1
        },
        adminName: {
            margin: 0,
            fontSize: '1rem'
        },
        adminRole: {
            margin: '0.2rem 0 0',
            fontSize: '0.8rem',
            opacity: 0.7
        },
        nav: {
            flex: 1,
            padding: '1rem 0'
        },
        badge: {
            marginLeft: 'auto',
            backgroundColor: '#d93025',
            borderRadius: '999px',
            color: 'white',
            fontSize: '0.7rem',
            fontWeight: '600',
            padding: '2px 8px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        navLink: {
            display: 'flex',
            alignItems: 'center',
            padding: '0.8rem 1.5rem',
            color: 'white',
            textDecoration: 'none',
            transition: 'background-color 0.3s',
            gap: '0.8rem'
        },
        icon: {
            fontSize: '1.2rem',
            width: '20px'
        },
        logoutButton: {
            margin: '1rem 1.5rem',
            padding: '0.8rem',
            backgroundColor: 'transparent',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'white',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'all 0.3s'
        }
    };
    return (
        <div>
            <div style={styles.menuBtnWrapper}>
                <button style={styles.menuToggleButton} onClick={toggleMenu}>☰</button>
            </div>
            <div style={styles.overlay} onClick={closeMenu} />

            <div style={styles.sidebar}>
                <div style={styles.logo}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={styles.logoText}>Admin Panel</h2>
                        <button
                            onClick={closeMenu}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'white',
                                fontSize: '1.2rem',
                                cursor: 'pointer'
                            }}
                            aria-label="Close menu"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                <div style={styles.adminInfo}>
                    <div style={styles.avatar}>
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div style={styles.adminDetails}>
                        <h4 style={styles.adminName}>{user?.name}</h4>
                        <p style={styles.adminRole}>Administrator</p>
                    </div>
                </div>

                <nav style={styles.nav}>
                    {menuItems.map((item, index) => (
                        <NavLink
                            key={index}
                            to={item.path}
                            style={({ isActive }) => ({
                                ...styles.navLink,
                                backgroundColor: isActive ? '#3498db' : 'transparent'
                            })}
                        >
                            <span style={styles.icon}>{item.icon}</span>
                            {item.label}
                            {item.badge > 0 && (
                                <span style={styles.badge}>{item.badge}</span>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <button onClick={handleLogout} style={styles.logoutButton}>
                    <FaSignOutAlt style={styles.icon} />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;