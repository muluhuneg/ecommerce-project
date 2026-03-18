import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import adminApi from '../../services/adminApi';
import { FaSearch, FaFilter, FaUserCheck, FaUserTimes } from 'react-icons/fa';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isDesktop = windowWidth > 768;

    useEffect(() => {
        fetchUsers();
    }, [roleFilter, searchTerm]);

    const fetchUsers = async () => {
        try {
            const data = await adminApi.getUsers(roleFilter, searchTerm);
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleUserStatus = async (userId, currentStatus) => {
        try {
            // You'll need to add this endpoint to your admin controller
            await adminApi.toggleUserStatus(userId, !currentStatus);
            fetchUsers(); // Refresh the list
        } catch (error) {
            console.error('Error updating user status:', error);
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
        filters: {
            display: 'flex',
            gap: '1rem',
            marginBottom: '2rem'
        },
        searchBox: {
            flex: 1,
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'white'
        },
        searchInput: {
            border: 'none',
            outline: 'none',
            flex: 1,
            fontSize: '1rem'
        },
        filterSelect: {
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '1rem',
            backgroundColor: 'white',
            cursor: 'pointer',
            minWidth: '150px'
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
            borderBottom: '1px solid #dee2e6',
            transition: 'background-color 0.3s'
        },
        tableCell: {
            padding: '1rem'
        },
        userInfo: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
        },
        avatar: {
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#3498db',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem',
            fontWeight: 'bold'
        },
        roleBadge: {
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            fontSize: '0.875rem',
            color: 'white',
            display: 'inline-block'
        },
        statusBadge: {
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            fontSize: '0.875rem',
            display: 'inline-block'
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

    const getRoleColor = (role) => {
        switch(role) {
            case 'admin': return '#e74c3c';
            case 'seller': return '#f39c12';
            case 'customer': return '#2ecc71';
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
                    <h1 style={styles.title}>User Management</h1>
                    <p>Total Users: {users.length}</p>
                </div>

                <div style={styles.filters}>
                    <div style={styles.searchBox}>
                        <FaSearch color="#666" />
                        <input
                            type="text"
                            placeholder="Search users by name, email, or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={styles.searchInput}
                        />
                    </div>
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        style={styles.filterSelect}
                    >
                        <option value="all">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="seller">Seller</option>
                        <option value="customer">Customer</option>
                    </select>
                </div>

                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.tableHeader}>User</th>
                            <th style={styles.tableHeader}>Email</th>
                            <th style={styles.tableHeader}>Phone</th>
                            <th style={styles.tableHeader}>Role</th>
                            <th style={styles.tableHeader}>Status</th>
                            <th style={styles.tableHeader}>Joined</th>
                            <th style={styles.tableHeader}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} style={styles.tableRow}>
                                <td style={styles.tableCell}>
                                    <div style={styles.userInfo}>
                                        <div style={styles.avatar}>
                                            {user.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <span>{user.name}</span>
                                    </div>
                                </td>
                                <td style={styles.tableCell}>{user.email}</td>
                                <td style={styles.tableCell}>{user.phone || 'N/A'}</td>
                                <td style={styles.tableCell}>
                                    <span style={{
                                        ...styles.roleBadge,
                                        backgroundColor: getRoleColor(user.role)
                                    }}>
                                        {user.role}
                                    </span>
                                </td>
                                <td style={styles.tableCell}>
                                    <span style={{
                                        ...styles.statusBadge,
                                        backgroundColor: user.is_verified ? '#d4edda' : '#f8d7da',
                                        color: user.is_verified ? '#155724' : '#721c24'
                                    }}>
                                        {user.is_verified ? 'Verified' : 'Unverified'}
                                    </span>
                                </td>
                                <td style={styles.tableCell}>
                                    {new Date(user.created_at).toLocaleDateString()}
                                </td>
                                <td style={styles.tableCell}>
                                    <button
                                        style={{
                                            ...styles.actionButton,
                                            backgroundColor: user.is_verified ? '#f8d7da' : '#d4edda',
                                            color: user.is_verified ? '#721c24' : '#155724'
                                        }}
                                        onClick={() => toggleUserStatus(user.id, user.is_verified)}
                                    >
                                        {user.is_verified ? 'Deactivate' : 'Activate'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Users;