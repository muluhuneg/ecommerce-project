import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

const Profile = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || ''
            });
            fetchOrders();
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            // You'll need to create this endpoint
            const response = await API.get('/orders/my-orders');
            setOrders(response.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.put('/auth/profile', formData);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        container: {
            maxWidth: '1200px',
            margin: '2rem auto',
            padding: '0 20px'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: '1fr 2fr',
            gap: '2rem'
        },
        card: {
            background: 'white',
            borderRadius: '10px',
            padding: '2rem',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        },
        title: {
            marginBottom: '1.5rem',
            color: '#333'
        },
        formGroup: {
            marginBottom: '1.5rem'
        },
        label: {
            display: 'block',
            marginBottom: '0.5rem',
            color: '#666',
            fontWeight: '500'
        },
        input: {
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '1rem'
        },
        button: {
            background: '#667eea',
            color: 'white',
            padding: '0.75rem 2rem',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1rem',
            cursor: 'pointer',
            width: '100%'
        },
        ordersTable: {
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '1rem'
        },
        tableHeader: {
            background: '#f8f9fa',
            padding: '1rem',
            textAlign: 'left',
            borderBottom: '2px solid #dee2e6'
        },
        tableCell: {
            padding: '1rem',
            borderBottom: '1px solid #dee2e6'
        },
        statusBadge: {
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            fontSize: '0.875rem',
            color: 'white'
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>My Profile</h1>
            
            <div style={styles.grid}>
                {/* Profile Information */}
                <div style={styles.card}>
                    <h2 style={styles.title}>Personal Information</h2>
                    <form onSubmit={handleSubmit}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                style={styles.input}
                                disabled
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Phone</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                style={styles.input}
                            />
                        </div>
                        <button type="submit" style={styles.button} disabled={loading}>
                            {loading ? 'Updating...' : 'Update Profile'}
                        </button>
                    </form>
                </div>

                {/* Recent Orders */}
                <div style={styles.card}>
                    <h2 style={styles.title}>Recent Orders</h2>
                    {orders.length === 0 ? (
                        <p>No orders yet</p>
                    ) : (
                        <table style={styles.ordersTable}>
                            <thead>
                                <tr>
                                    <th style={styles.tableHeader}>Order #</th>
                                    <th style={styles.tableHeader}>Date</th>
                                    <th style={styles.tableHeader}>Total</th>
                                    <th style={styles.tableHeader}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order.id}>
                                        <td style={styles.tableCell}>{order.order_number}</td>
                                        <td style={styles.tableCell}>
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </td>
                                        <td style={styles.tableCell}>${order.grand_total}</td>
                                        <td style={styles.tableCell}>
                                            <span style={{
                                                ...styles.statusBadge,
                                                backgroundColor: 
                                                    order.status === 'delivered' ? '#28a745' :
                                                    order.status === 'processing' ? '#ffc107' :
                                                    order.status === 'shipped' ? '#17a2b8' : '#ff6b6b'
                                            }}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;