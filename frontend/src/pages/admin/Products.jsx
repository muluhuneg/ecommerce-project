import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import adminApi from '../../services/adminApi';
import { FaCheck, FaTimes, FaEye } from 'react-icons/fa';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [pendingProducts, setPendingProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const [allProducts, pending] = await Promise.all([
                adminApi.getAllProducts(),
                adminApi.getPendingProducts()
            ]);
            setProducts(allProducts);
            setPendingProducts(pending);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveProduct = async (productId, approve) => {
        try {
            await adminApi.approveProduct(productId, approve);
            fetchProducts();
        } catch (error) {
            console.error('Error approving product:', error);
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
            marginLeft: '280px',
            padding: '2rem'
        },
        header: {
            marginBottom: '2rem'
        },
        title: {
            fontSize: '2rem',
            color: '#333'
        },
        tabs: {
            display: 'flex',
            gap: '1rem',
            marginBottom: '2rem',
            borderBottom: '2px solid #dee2e6'
        },
        tab: {
            padding: '0.75rem 1.5rem',
            cursor: 'pointer',
            border: 'none',
            background: 'none',
            fontSize: '1rem',
            fontWeight: '500',
            color: '#666'
        },
        activeTab: {
            color: '#3498db',
            borderBottom: '2px solid #3498db'
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
        productImage: {
            width: '50px',
            height: '50px',
            objectFit: 'cover',
            borderRadius: '4px'
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
            marginRight: '0.5rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        loadingContainer: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '400px'
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
            <AdminSidebar />
            <div style={styles.mainContent}>
                <div style={styles.header}>
                    <h1 style={styles.title}>Product Management</h1>
                </div>

                <div style={styles.tabs}>
                    <button
                        style={{
                            ...styles.tab,
                            ...(activeTab === 'all' ? styles.activeTab : {})
                        }}
                        onClick={() => setActiveTab('all')}
                    >
                        All Products ({products.length})
                    </button>
                    <button
                        style={{
                            ...styles.tab,
                            ...(activeTab === 'pending' ? styles.activeTab : {})
                        }}
                        onClick={() => setActiveTab('pending')}
                    >
                        Pending Approval ({pendingProducts.length})
                    </button>
                </div>

                {activeTab === 'pending' ? (
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.tableHeader}>Product</th>
                                <th style={styles.tableHeader}>Seller</th>
                                <th style={styles.tableHeader}>Price</th>
                                <th style={styles.tableHeader}>Category</th>
                                <th style={styles.tableHeader}>Stock</th>
                                <th style={styles.tableHeader}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingProducts.map(product => (
                                <tr key={product.id} style={styles.tableRow}>
                                    <td style={styles.tableCell}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <img 
                                                src={product.image_url || 'https://via.placeholder.com/50'} 
                                                alt={product.name}
                                                style={styles.productImage}
                                            />
                                            <span>{product.name}</span>
                                        </div>
                                    </td>
                                    <td style={styles.tableCell}>{product.seller_name || 'N/A'}</td>
                                    <td style={styles.tableCell}>{product.price} Br</td>
                                    <td style={styles.tableCell}>{product.category_name || 'N/A'}</td>
                                    <td style={styles.tableCell}>{product.stock}</td>
                                    <td style={styles.tableCell}>
                                        <button
                                            style={{
                                                ...styles.actionButton,
                                                backgroundColor: '#d4edda',
                                                color: '#155724'
                                            }}
                                            onClick={() => handleApproveProduct(product.id, true)}
                                        >
                                            <FaCheck /> Approve
                                        </button>
                                        <button
                                            style={{
                                                ...styles.actionButton,
                                                backgroundColor: '#f8d7da',
                                                color: '#721c24'
                                            }}
                                            onClick={() => handleApproveProduct(product.id, false)}
                                        >
                                            <FaTimes /> Reject
                                        </button>
                                        <button
                                            style={{
                                                ...styles.actionButton,
                                                backgroundColor: '#e3f2fd',
                                                color: '#1976d2'
                                            }}
                                        >
                                            <FaEye /> View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.tableHeader}>Product</th>
                                <th style={styles.tableHeader}>Seller</th>
                                <th style={styles.tableHeader}>Price</th>
                                <th style={styles.tableHeader}>Status</th>
                                <th style={styles.tableHeader}>Stock</th>
                                <th style={styles.tableHeader}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product.id} style={styles.tableRow}>
                                    <td style={styles.tableCell}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <img 
                                                src={product.image_url || 'https://via.placeholder.com/50'} 
                                                alt={product.name}
                                                style={styles.productImage}
                                            />
                                            <span>{product.name}</span>
                                        </div>
                                    </td>
                                    <td style={styles.tableCell}>{product.seller_name || 'N/A'}</td>
                                    <td style={styles.tableCell}>{product.price} Br</td>
                                    <td style={styles.tableCell}>
                                        <span style={{
                                            ...styles.statusBadge,
                                            backgroundColor: product.is_approved ? '#d4edda' : '#f8d7da',
                                            color: product.is_approved ? '#155724' : '#721c24'
                                        }}>
                                            {product.is_approved ? 'Approved' : 'Pending'}
                                        </span>
                                    </td>
                                    <td style={styles.tableCell}>{product.stock}</td>
                                    <td style={styles.tableCell}>
                                        <button
                                            style={{
                                                ...styles.actionButton,
                                                backgroundColor: '#e3f2fd',
                                                color: '#1976d2'
                                            }}
                                        >
                                            <FaEye /> View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminProducts;