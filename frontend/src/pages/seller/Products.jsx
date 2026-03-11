import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/seller/Sidebar';
import sellerApi from '../../services/sellerApi';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaEye, FaPlus, FaSpinner } from 'react-icons/fa';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await sellerApi.getProducts();
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
            setError('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await sellerApi.deleteProduct(productId);
                // Refresh the list after deletion
                fetchProducts();
            } catch (error) {
                console.error('Error deleting product:', error);
                alert('Failed to delete product');
            }
        }
    };

    const getStatusBadge = (status, isApproved) => {
        if (!isApproved) {
            return <span style={styles.badgePending}>Pending Approval</span>;
        }
        if (status === 'active') {
            return <span style={styles.badgeActive}>Active</span>;
        }
        return <span style={styles.badgeInactive}>Inactive</span>;
    };

    if (loading) {
        return (
            <div style={{ display: 'flex' }}>
                <Sidebar />
                <div style={styles.loadingContainer}>
                    <FaSpinner className="spinner" size={30} />
                    <p>Loading products...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <div style={styles.mainContent}>
                <div style={styles.header}>
                    <h1 style={styles.title}>My Products</h1>
                    <Link to="/seller/products/add" style={styles.addButton}>
                        <FaPlus /> Add New Product
                    </Link>
                </div>

                {error && <div style={styles.error}>{error}</div>}

                {products.length === 0 ? (
                    <div style={styles.emptyState}>
                        <p>You haven't added any products yet.</p>
                        <Link to="/seller/products/add" style={styles.emptyStateButton}>
                            Add Your First Product
                        </Link>
                    </div>
                ) : (
                    <div style={styles.productsGrid}>
                        {products.map(product => (
                            <div key={product.id} style={styles.productCard}>
                                <div style={styles.productImageContainer}>
                                    <img 
                                        src={product.image_url || 'https://via.placeholder.com/200x200?text=No+Image'} 
                                        alt={product.name}
                                        style={styles.productImage}
                                    />
                                    {!product.is_approved && (
                                        <div style={styles.pendingOverlay}>
                                            <span>Pending Approval</span>
                                        </div>
                                    )}
                                </div>
                                <div style={styles.productInfo}>
                                    <h3 style={styles.productName}>{product.name}</h3>
                                    <p style={styles.productPrice}>{product.price} Br</p>
                                    <div style={styles.productStats}>
                                        <span>Stock: {product.stock || 0}</span>
                                        <span>Sold: {product.sold_count || 0}</span>
                                    </div>
                                    <div style={styles.productFooter}>
                                        {getStatusBadge(product.status, product.is_approved)}
                                        <div style={styles.actionButtons}>
                                            <Link to={`/seller/products/edit/${product.id}`} style={styles.editButton}>
                                                <FaEdit />
                                            </Link>
                                            <button 
                                                onClick={() => handleDelete(product.id)} 
                                                style={styles.deleteButton}
                                            >
                                                <FaTrash />
                                            </button>
                                            <Link to={`/product/${product.id}`} style={styles.viewButton}>
                                                <FaEye />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    .spinner {
                        animation: spin 1s linear infinite;
                    }
                `}
            </style>
        </div>
    );
};

const styles = {
    mainContent: {
        marginLeft: '280px',
        padding: '2rem',
        flex: 1,
        minHeight: '100vh',
        backgroundColor: '#f8f9fa'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
    },
    title: {
        fontSize: '2rem',
        color: '#333',
        margin: 0
    },
    addButton: {
        backgroundColor: '#28a745',
        color: 'white',
        padding: '0.75rem 1.5rem',
        borderRadius: '4px',
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        transition: 'background-color 0.3s'
    },
    loadingContainer: {
        marginLeft: '280px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '500px'
    },
    error: {
        backgroundColor: '#f8d7da',
        color: '#721c24',
        padding: '1rem',
        borderRadius: '4px',
        marginBottom: '1rem'
    },
    emptyState: {
        textAlign: 'center',
        padding: '4rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    emptyStateButton: {
        display: 'inline-block',
        marginTop: '1rem',
        padding: '0.75rem 2rem',
        backgroundColor: '#007bff',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '4px'
    },
    productsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1.5rem'
    },
    productCard: {
        backgroundColor: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'transform 0.3s, box-shadow 0.3s'
    },
    productImageContainer: {
        position: 'relative',
        height: '200px',
        overflow: 'hidden'
    },
    productImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
    },
    pendingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '1.2rem',
        fontWeight: 'bold'
    },
    productInfo: {
        padding: '1rem'
    },
    productName: {
        fontSize: '1.1rem',
        margin: '0 0 0.5rem',
        color: '#333'
    },
    productPrice: {
        fontSize: '1.2rem',
        fontWeight: 'bold',
        color: '#28a745',
        margin: '0 0 0.5rem'
    },
    productStats: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '0.5rem',
        fontSize: '0.9rem',
        color: '#666'
    },
    productFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '0.5rem'
    },
    badgePending: {
        backgroundColor: '#ffc107',
        color: '#333',
        padding: '0.25rem 0.5rem',
        borderRadius: '4px',
        fontSize: '0.8rem',
        fontWeight: 'bold'
    },
    badgeActive: {
        backgroundColor: '#28a745',
        color: 'white',
        padding: '0.25rem 0.5rem',
        borderRadius: '4px',
        fontSize: '0.8rem',
        fontWeight: 'bold'
    },
    badgeInactive: {
        backgroundColor: '#6c757d',
        color: 'white',
        padding: '0.25rem 0.5rem',
        borderRadius: '4px',
        fontSize: '0.8rem',
        fontWeight: 'bold'
    },
    actionButtons: {
        display: 'flex',
        gap: '0.5rem'
    },
    editButton: {
        color: '#007bff',
        cursor: 'pointer',
        fontSize: '1.1rem'
    },
    deleteButton: {
        color: '#dc3545',
        cursor: 'pointer',
        fontSize: '1.1rem',
        border: 'none',
        background: 'none'
    },
    viewButton: {
        color: '#17a2b8',
        cursor: 'pointer',
        fontSize: '1.1rem'
    }
};

export default Products;