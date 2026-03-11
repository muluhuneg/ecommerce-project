import React from 'react';
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
    FaUserShield
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const AdminSidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const menuItems = [
        { path: '/admin/dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
        { path: '/admin/users', icon: <FaUsers />, label: 'Users' },
        { path: '/admin/sellers', icon: <FaUserShield />, label: 'Sellers' },
        { path: '/admin/categories', icon: <FaTags />, label: 'Categories' },
        { path: '/admin/products', icon: <FaBox />, label: 'Products' },
        { path: '/admin/orders', icon: <FaShoppingCart />, label: 'Orders' },
        { path: '/admin/reports', icon: <FaChartBar />, label: 'Reports' },
        { path: '/admin/settings', icon: <FaCog />, label: 'Settings' },
    ];

    const styles = {
        sidebar: {
            width: '280px',
            height: '100vh',
            backgroundColor: '#2c3e50',
            color: 'white',
            position: 'fixed',
            left: 0,
            top: 0,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto'
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
        <div style={styles.sidebar}>
            <div style={styles.logo}>
                <h2 style={styles.logoText}>Admin Panel</h2>
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
                            backgroundColor: isActive ? '#3498db' : 'transparent',
                        })}
                    >
                        <span style={styles.icon}>{item.icon}</span>
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <button onClick={handleLogout} style={styles.logoutButton}>
                <FaSignOutAlt style={styles.icon} />
                Logout
            </button>
        </div>
    );
};

export default AdminSidebar;