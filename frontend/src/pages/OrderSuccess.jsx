import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import orderApi from '../services/orderApi';
import { FaCheck, FaSpinner, FaHome, FaShoppingBag } from 'react-icons/fa';

const OrderSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [order, setOrder] = useState(null);
    const [status, setStatus] = useState('verifying'); // 'verifying', 'confirmed', 'pending', 'failed'
    const [retryCount, setRetryCount] = useState(0);
    const [manualPaymentAttempted, setManualPaymentAttempted] = useState(false);
    
    const tx_ref = searchParams.get('tx_ref');
    const order_id = searchParams.get('order_id');

    const verifyOrder = useCallback(async () => {
        console.log('🔍 Verifying order with:', { tx_ref, order_id, retryCount, manualPaymentAttempted });

        try {
            setLoading(true);
            setError('');

            if (order_id) {
                console.log('📦 Fetching order by ID:', order_id);
                const orderData = await orderApi.getOrderById(order_id);
                setOrder(orderData);
                setStatus('confirmed');
                return;
            }

            if (tx_ref) {
                console.log('🔍 Checking order status for tx_ref:', tx_ref);
                const statusCheck = await orderApi.checkOrderStatus(tx_ref);
                console.log('✅ Order status check:', statusCheck);

                if (statusCheck.exists && statusCheck.order_id) {
                    const orderData = await orderApi.getOrderById(statusCheck.order_id);
                    setOrder(orderData);
                    setStatus('confirmed');
                    return;
                }

                if (statusCheck.pending) {
                    setStatus('pending');
                    setRetryCount(prev => prev + 1);
                    setError('Payment successful, finalizing your order...');
                } else {
                    const pendingTx = localStorage.getItem('pending_tx_ref');
                    if (pendingTx === tx_ref) {
                        setStatus('pending');
                        setRetryCount(prev => prev + 1);
                        setError('Payment successful, order confirmation is processing. Please wait.');
                    } else {
                        setStatus('failed');
                        setError('Order not found. Please contact support.');
                    }
                }
            } else {
                setStatus('failed');
                setError('No order information found');
            }
        } catch (err) {
            console.error('❌ Error verifying order:', err);
            const message = err?.message || 'Failed to verify order';

            if (tx_ref && localStorage.getItem('pending_tx_ref') === tx_ref) {
                setStatus('pending');
                setRetryCount(prev => prev + 1);
                setError('Payment responsive but server is delayed. Retrying...');
            } else {
                setStatus('failed');
                setError(message);
            }
        } finally {
            setLoading(false);
        }
    }, [tx_ref, order_id, retryCount, manualPaymentAttempted]);

    useEffect(() => {
        verifyOrder();
    }, [verifyOrder]);

    useEffect(() => {
        if (status === 'pending' && retryCount < 6) {
            const timer = setTimeout(() => verifyOrder(), 3000);
            return () => clearTimeout(timer);
        }

        if (status === 'pending' && retryCount >= 6 && tx_ref && !manualPaymentAttempted) {
            const manualComplete = async () => {
                try {
                    setLoading(true);
                    await orderApi.manualPaymentSuccess(tx_ref);
                    setManualPaymentAttempted(true);
                    await verifyOrder();
                } catch (error) {
                    console.error('❌ Manual payment finalization failed:', error);
                    setError('Please click "Force complete" or contact support.');
                } finally {
                    setLoading(false);
                }
            };

            manualComplete();
        }
    }, [status, retryCount, manualPaymentAttempted, tx_ref, verifyOrder]);

    if (loading && status !== 'confirmed') {
        return (
            <div style={styles.container}>
                <div style={styles.loadingContainer}>
                    <FaSpinner className="spinner" size={50} color="#667eea" />
                    <h2 style={styles.loadingText}>{status === 'pending' ? 'Finalizing your order...' : 'Verifying your order...'}</h2>
                </div>
            </div>
        );
    }

    if (status === 'failed' && error) {
        return (
            <div style={styles.container}>
                <div style={styles.errorContainer}>
                    <div style={styles.errorIcon}>❌</div>
                    <h2 style={styles.errorTitle}>Something went wrong</h2>
                    <p style={styles.errorMessage}>{error}</p>
                    <div style={styles.buttonGroup}>
                        <button 
                            style={styles.primaryButton}
                            onClick={() => navigate('/products')}
                        >
                            <FaShoppingBag /> Continue Shopping
                        </button>
                        <button 
                            style={styles.secondaryButton}
                            onClick={() => navigate('/contact')}
                        >
                            Contact Support
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!order && status === 'pending') {
        const handleForceComplete = async () => {
            if (!tx_ref) return;
            try {
                setLoading(true);
                setError('');
                setManualPaymentAttempted(true);
                await orderApi.manualPaymentSuccess(tx_ref);
                await verifyOrder();
            } catch (forceError) {
                console.error('❌ Force complete failed:', forceError);
                setError('Force completion failed. Please contact support.');
            } finally {
                setLoading(false);
            }
        };

        return (
            <div style={styles.container}>
                <div style={styles.successCard}>
                    <div style={styles.successIcon}>
                        <FaCheck size={50} color="#28a745" />
                    </div>
                    <h1 style={styles.title}>Payment Successful</h1>
                    <p style={styles.subtitle}>Your payment was received. Final order confirmation is in progress.</p>
                    <p style={styles.subtitle}>{error || 'Please keep this page open until the order is confirmed.'}</p>
                    <div style={styles.buttonGroup}>
                        <button style={styles.primaryButton} onClick={handleForceComplete}>
                            Force complete order
                        </button>
                        <Link to="/orders" style={styles.viewOrdersButton}>View Orders</Link>
                        <Link to="/products" style={styles.continueButton}>Continue Shopping</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.successCard}>
                <div style={styles.successIcon}>
                    <FaCheck size={50} color="#28a745" />
                </div>
                
                <h1 style={styles.title}>Order Placed Successfully!</h1>
                <p style={styles.subtitle}>Thank you for your purchase</p>
                
                {order && (
                    <div style={styles.orderDetails}>
                        <div style={styles.orderNumber}>
                            Order #: {order.order?.order_number || 'N/A'}
                        </div>
                        
                        <div style={styles.infoGrid}>
                            <div style={styles.infoItem}>
                                <strong>Total Amount:</strong>
                                <span>{order.order?.grand_total || 0} Br</span>
                            </div>
                            <div style={styles.infoItem}>
                                <strong>Payment Method:</strong>
                                <span>{order.order?.payment_method || 'Chapa'}</span>
                            </div>
                            <div style={styles.infoItem}>
                                <strong>Status:</strong>
                                <span style={styles.statusBadge}>
                                    {order.order?.status || 'Processing'}
                                </span>
                            </div>
                            <div style={styles.infoItem}>
                                <strong>Date:</strong>
                                <span>
                                    {order.order?.created_at 
                                        ? new Date(order.order.created_at).toLocaleDateString() 
                                        : new Date().toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                        
                        {order.items && order.items.length > 0 && (
                            <div style={styles.itemsSection}>
                                <h3 style={styles.itemsTitle}>Order Items</h3>
                                {order.items.map((item, index) => (
                                    <div key={index} style={styles.itemRow}>
                                        <img 
                                            src={item.image_url || 'https://via.placeholder.com/50'} 
                                            alt={item.name}
                                            style={styles.itemImage}
                                        />
                                        <div style={styles.itemDetails}>
                                            <div style={styles.itemName}>{item.name}</div>
                                            <div style={styles.itemMeta}>
                                                Qty: {item.quantity} × {item.price} Br
                                            </div>
                                        </div>
                                        <div style={styles.itemTotal}>
                                            {item.price * item.quantity} Br
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                
                <div style={styles.buttonGroup}>
                    <Link to="/orders" style={styles.viewOrdersButton}>
                        View My Orders
                    </Link>
                    <Link to="/products" style={styles.continueButton}>
                        Continue Shopping
                    </Link>
                </div>
                
                <p style={styles.confirmationText}>
                    A confirmation email has been sent to your email address.
                </p>
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
    container: {
        maxWidth: '800px',
        margin: '40px auto',
        padding: '20px'
    },
    loadingContainer: {
        textAlign: 'center',
        padding: '60px 20px',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    },
    loadingText: {
        marginTop: '20px',
        color: '#666'
    },
    successCard: {
        background: 'white',
        borderRadius: '12px',
        padding: '40px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        textAlign: 'center'
    },
    successIcon: {
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        background: '#d4edda',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 30px'
    },
    title: {
        fontSize: '2rem',
        color: '#333',
        marginBottom: '10px'
    },
    subtitle: {
        fontSize: '1.1rem',
        color: '#666',
        marginBottom: '30px'
    },
    orderDetails: {
        background: '#f8f9fa',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '30px',
        textAlign: 'left'
    },
    orderNumber: {
        fontSize: '1.2rem',
        fontWeight: 'bold',
        color: '#667eea',
        padding: '10px',
        background: '#e3f2fd',
        borderRadius: '4px',
        marginBottom: '20px'
    },
    infoGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '15px',
        marginBottom: '20px'
    },
    infoItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
    },
    statusBadge: {
        display: 'inline-block',
        padding: '4px 12px',
        background: '#ffc107',
        color: '#333',
        borderRadius: '20px',
        fontSize: '0.9rem'
    },
    itemsSection: {
        borderTop: '1px solid #dee2e6',
        paddingTop: '20px'
    },
    itemsTitle: {
        fontSize: '1.1rem',
        marginBottom: '15px'
    },
    itemRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        padding: '10px 0',
        borderBottom: '1px solid #dee2e6'
    },
    itemImage: {
        width: '50px',
        height: '50px',
        borderRadius: '4px',
        objectFit: 'cover'
    },
    itemDetails: {
        flex: 1
    },
    itemName: {
        fontWeight: '500'
    },
    itemMeta: {
        fontSize: '0.9rem',
        color: '#666'
    },
    itemTotal: {
        fontWeight: 'bold'
    },
    buttonGroup: {
        display: 'flex',
        gap: '15px',
        justifyContent: 'center',
        marginTop: '20px'
    },
    viewOrdersButton: {
        padding: '12px 30px',
        background: '#667eea',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '4px',
        fontSize: '1rem'
    },
    continueButton: {
        padding: '12px 30px',
        background: '#28a745',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '4px',
        fontSize: '1rem'
    },
    confirmationText: {
        marginTop: '30px',
        color: '#666',
        fontSize: '0.95rem'
    },
    errorContainer: {
        background: 'white',
        borderRadius: '12px',
        padding: '40px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        textAlign: 'center'
    },
    errorIcon: {
        fontSize: '4rem',
        marginBottom: '20px'
    },
    errorTitle: {
        fontSize: '1.8rem',
        color: '#dc3545',
        marginBottom: '10px'
    },
    errorMessage: {
        color: '#666',
        marginBottom: '30px'
    },
    primaryButton: {
        padding: '12px 30px',
        background: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1rem',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px'
    },
    secondaryButton: {
        padding: '12px 30px',
        background: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1rem'
    }
};

export default OrderSuccess;