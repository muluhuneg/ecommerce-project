import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/seller/Sidebar';
import sellerApi from '../../services/sellerApi';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaEye, FaPlus, FaSpinner, FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [addingToCart, setAddingToCart] = useState({});
    
    const { addToCart } = useCart();
    const { user } = useAuth();

    useEffect(() => {
        fetchProducts();
    }, []);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768) {
                setIsMobileMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
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
                fetchProducts();
            } catch (error) {
                console.error('Error deleting product:', error);
                alert('Failed to delete product');
            }
        }
    };

    const handleAddToCart = async (product, e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (product.stock === 0) {
            alert('This product is out of stock');
            return;
        }

        setAddingToCart(prev => ({ ...prev, [product.id]: true }));

        try {
            await addToCart(product, 1);
            // Show success message (you can replace with a toast notification)
            alert(`${product.name} added to cart!`);
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Failed to add to cart');
        } finally {
            setTimeout(() => {
                setAddingToCart(prev => ({ ...prev, [product.id]: false }));
            }, 500);
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
            <div style={styles.container}>
                <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
                <div style={styles.mainContent}>
                    <div style={styles.loadingContainer}>
                        <FaSpinner className="spinner" size={30} />
                        <p>Loading products...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
            
            {/* Mobile Header */}
            <div style={styles.mobileHeader}>
                <button 
                    style={styles.menuButton}
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    ☰
                </button>
                <h2 style={styles.mobileTitle}>My Products</h2>
                <Link to="/seller/products/add" style={styles.mobileAddButton}>
                    <FaPlus />
                </Link>
            </div>

            <div style={styles.mainContent}>
                {/* Desktop Header */}
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
                                    {product.stock === 0 && (
                                        <div style={styles.outOfStockOverlay}>
                                            <span>Out of Stock</span>
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
                                    
                                    {/* Add to Cart Button */}
                                    {user?.role === 'customer' && (
                                        <button
                                            style={{
                                                ...styles.addToCartBtn,
                                                backgroundColor: addingToCart[product.id] ? '#28a745' : (product.stock === 0 ? '#6c757d' : '#007bff'),
                                                cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                                                opacity: product.stock === 0 ? 0.6 : 1
                                            }}
                                            onClick={(e) => handleAddToCart(product, e)}
                                            disabled={product.stock === 0 || addingToCart[product.id]}
                                        >
                                            <FaShoppingCart />
                                            {addingToCart[product.id] ? 'Adding...' : (product.stock > 0 ? 'Add to Cart' : 'Out of Stock')}
                                        </button>
                                    )}

                                    <div style={styles.productFooter}>
                                        {getStatusBadge(product.status, product.is_approved)}
                                        <div style={styles.actionButtons}>
                                            <Link to={`/seller/products/edit/${product.id}`} style={styles.editButton} title="Edit">
                                                <FaEdit />
                                            </Link>
                                            <button 
                                                onClick={() => handleDelete(product.id)} 
                                                style={styles.deleteButton}
                                                title="Delete"
                                            >
                                                <FaTrash />
                                            </button>
                                            <Link to={`/product/${product.id}`} style={styles.viewButton} title="View">
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
                    @keyframes slideIn {
                        from {
                            transform: translateX(-100%);
                        }
                        to {
                            transform: translateX(0);
                        }
                    }
                `}
            </style>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        backgroundColor: '#f8f9fa',
        minHeight: '100vh'
    },
    mainContent: {
        marginLeft: '280px',
        padding: '2rem',
        flex: 1,
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        transition: 'margin-left 0.3s ease',
        '@media (max-width: 1024px)': {
            marginLeft: '250px',
            padding: '1.5rem'
        },
        '@media (max-width: 768px)': {
            marginLeft: '0',
            padding: '1rem',
            paddingTop: '70px'
        },
        '@media (max-width: 480px)': {
            padding: '0.8rem',
            paddingTop: '60px'
        }
    },
    // Mobile Header
    mobileHeader: {
        display: 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '60px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        zIndex: 999,
        padding: '0 1rem',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        '@media (max-width: 768px)': {
            display: 'flex'
        }
    },
    menuButton: {
        background: 'rgba(255,255,255,0.2)',
        border: 'none',
        color: 'white',
        width: '40px',
        height: '40px',
        borderRadius: '8px',
        fontSize: '1.5rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    mobileTitle: {
        color: 'white',
        fontSize: '1.2rem',
        margin: 0
    },
    mobileAddButton: {
        background: 'rgba(255,255,255,0.2)',
        color: 'white',
        width: '40px',
        height: '40px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textDecoration: 'none',
        fontSize: '1.2rem'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        '@media (max-width: 768px)': {
            display: 'none'
        }
    },
    title: {
        fontSize: '2rem',
        color: '#333',
        margin: 0,
        '@media (max-width: 1024px)': {
            fontSize: '1.8rem'
        }
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
        transition: 'background-color 0.3s',
        '@media (max-width: 1024px)': {
            padding: '0.6rem 1.2rem',
            fontSize: '0.9rem'
        }
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '500px',
        gap: '1rem'
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
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        '@media (max-width: 480px)': {
            padding: '2rem'
        }
    },
    emptyStateButton: {
        display: 'inline-block',
        marginTop: '1rem',
        padding: '0.75rem 2rem',
        backgroundColor: '#007bff',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '4px',
        '@media (max-width: 480px)': {
            padding: '0.6rem 1.5rem',
            fontSize: '0.9rem'
        }
    },
    productsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.5rem',
        '@media (max-width: 1024px)': {
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1rem'
        },
        '@media (max-width: 768px)': {
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '1rem'
        },
        '@media (max-width: 480px)': {
            gridTemplateColumns: '1fr',
            gap: '1rem'
        }
    },
    productCard: {
        backgroundColor: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'transform 0.3s, box-shadow 0.3s',
        ':hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
        },
        '@media (max-width: 768px)': {
            ':hover': {
                transform: 'none'
            }
        }
    },
    productImageContainer: {
        position: 'relative',
        height: '200px',
        overflow: 'hidden',
        '@media (max-width: 480px)': {
            height: '180px'
        }
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
    outOfStockOverlay: {
        position: 'absolute',
        top: '10px',
        right: '10px',
        backgroundColor: '#dc3545',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '0.8rem',
        fontWeight: 'bold'
    },
    productInfo: {
        padding: '1rem',
        '@media (max-width: 480px)': {
            padding: '0.8rem'
        }
    },
    productName: {
        fontSize: '1.1rem',
        margin: '0 0 0.5rem',
        color: '#333',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        '@media (max-width: 480px)': {
            fontSize: '1rem'
        }
    },
    productPrice: {
        fontSize: '1.2rem',
        fontWeight: 'bold',
        color: '#28a745',
        margin: '0 0 0.5rem',
        '@media (max-width: 480px)': {
            fontSize: '1.1rem'
        }
    },
    productStats: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '0.5rem',
        fontSize: '0.9rem',
        color: '#666',
        '@media (max-width: 480px)': {
            fontSize: '0.8rem'
        }
    },
    // Add to Cart Button
    addToCartBtn: {
        width: '100%',
        padding: '0.6rem',
        border: 'none',
        borderRadius: '4px',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        fontSize: '0.9rem',
        fontWeight: '500',
        marginBottom: '0.8rem',
        transition: 'all 0.3s',
        cursor: 'pointer',
        '@media (max-width: 480px)': {
            padding: '0.5rem',
            fontSize: '0.8rem'
        }
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
        fontWeight: 'bold',
        '@media (max-width: 480px)': {
            fontSize: '0.7rem',
            padding: '0.2rem 0.4rem'
        }
    },
    badgeActive: {
        backgroundColor: '#28a745',
        color: 'white',
        padding: '0.25rem 0.5rem',
        borderRadius: '4px',
        fontSize: '0.8rem',
        fontWeight: 'bold',
        '@media (max-width: 480px)': {
            fontSize: '0.7rem',
            padding: '0.2rem 0.4rem'
        }
    },
    badgeInactive: {
        backgroundColor: '#6c757d',
        color: 'white',
        padding: '0.25rem 0.5rem',
        borderRadius: '4px',
        fontSize: '0.8rem',
        fontWeight: 'bold',
        '@media (max-width: 480px)': {
            fontSize: '0.7rem',
            padding: '0.2rem 0.4rem'
        }
    },
    actionButtons: {
        display: 'flex',
        gap: '0.5rem'
    },
    editButton: {
        color: '#007bff',
        cursor: 'pointer',
        fontSize: '1.1rem',
        transition: 'color 0.3s',
        ':hover': {
            color: '#0056b3'
        }
    },
    deleteButton: {
        color: '#dc3545',
        cursor: 'pointer',
        fontSize: '1.1rem',
        border: 'none',
        background: 'none',
        transition: 'color 0.3s',
        ':hover': {
            color: '#bd2130'
        }
    },
    viewButton: {
        color: '#17a2b8',
        cursor: 'pointer',
        fontSize: '1.1rem',
        transition: 'color 0.3s',
        ':hover': {
            color: '#138496'
        }
    }
};

export default Products;