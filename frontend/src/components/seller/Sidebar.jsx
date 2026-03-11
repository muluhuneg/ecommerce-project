// frontend/src/components/seller/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
    FaTachometerAlt, 
    FaBox, 
    FaShoppingCart, 
    FaWallet, 
    FaUser,
    FaSignOutAlt,
    FaPlus
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
    const { user, logout } = useAuth();

    const menuItems = [
        { path: '/seller/dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
        { path: '/seller/products', icon: <FaBox />, label: 'Products' },
        { path: '/seller/products/add', icon: <FaPlus />, label: 'Add Product' },
        { path: '/seller/orders', icon: <FaShoppingCart />, label: 'Orders' },
        { path: '/seller/earnings', icon: <FaWallet />, label: 'Earnings' },
        { path: '/seller/profile', icon: <FaUser />, label: 'Profile' },
    ];

    return (
        <div style={styles.sidebar}>
            <div style={styles.logo}>
                <h2>Seller Hub</h2>
            </div>
            
            <div style={styles.sellerInfo}>
                <div style={styles.avatar}>
                    {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div style={styles.sellerDetails}>
                    <h4>{user?.name}</h4>
                    <p style={styles.businessName}>
                        {user?.seller?.business_name || 'Pending Approval'}
                    </p>
                    <span style={styles.badge}>
                        {user?.seller?.is_approved ? 'Approved' : 'Pending'}
                    </span>
                </div>
            </div>

            <nav style={styles.nav}>
                {menuItems.map((item, index) => (
                    <NavLink
                        key={index}
                        to={item.path}
                        style={({ isActive }) => ({
                            ...styles.navLink,
                            backgroundColor: isActive ? '#2a5298' : 'transparent',
                        })}
                    >
                        <span style={styles.icon}>{item.icon}</span>
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <button onClick={logout} style={styles.logoutButton}>
                <FaSignOutAlt style={styles.icon} />
                Logout
            </button>
        </div>
    );
};

const styles = {
    sidebar: {
        width: '280px',
        height: '100vh',
        backgroundColor: '#1e3c72',
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
        borderBottom: '1px solid rgba(255,255,255,0.1)'
    },
    sellerInfo: {
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
        backgroundColor: '#4a6fa5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.5rem',
        fontWeight: 'bold'
    },
    sellerDetails: {
        flex: 1
    },
    businessName: {
        fontSize: '0.9rem',
        opacity: 0.8,
        margin: '0.2rem 0'
    },
    badge: {
        backgroundColor: '#ff6b6b',
        padding: '0.2rem 0.5rem',
        borderRadius: '4px',
        fontSize: '0.8rem'
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
        fontSize: '1.2rem'
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

export default Sidebar;