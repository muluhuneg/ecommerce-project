import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FaTimesCircle, FaHome, FaRedo } from 'react-icons/fa';

const OrderFailed = () => {
    const [searchParams] = useSearchParams();
    const [error, setError] = useState('');
    const tx_ref = searchParams.get('tx_ref');
    const errorMsg = searchParams.get('error');

    useEffect(() => {
        if (errorMsg === 'verification_failed') {
            setError('Payment verification failed. Please contact support.');
        } else if (tx_ref) {
            setError(`Transaction ${tx_ref} could not be completed.`);
        } else {
            setError('Your payment could not be processed.');
        }
    }, [tx_ref, errorMsg]);

    const styles = {
        container: {
            minHeight: '80vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
        },
        card: {
            background: 'white',
            padding: '50px',
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
            textAlign: 'center',
            maxWidth: '500px',
            width: '100%',
            animation: 'slideUp 0.5s ease'
        },
        icon: {
            fontSize: '5rem',
            color: '#dc3545',
            marginBottom: '20px',
            animation: 'shake 0.5s'
        },
        title: {
            fontSize: '2.5rem',
            color: '#333',
            marginBottom: '15px',
            fontWeight: 'bold'
        },
        message: {
            color: '#666',
            fontSize: '1.1rem',
            marginBottom: '20px',
            lineHeight: '1.6'
        },
        errorBox: {
            background: '#f8d7da',
            color: '#721c24',
            padding: '20px',
            borderRadius: '10px',
            marginBottom: '30px',
            border: '1px solid #f5c6cb'
        },
        actions: {
            display: 'flex',
            gap: '15px',
            justifyContent: 'center',
            flexWrap: 'wrap'
        },
        button: {
            padding: '15px 30px',
            background: '#dc3545',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '10px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '1rem',
            fontWeight: '600',
            transition: 'transform 0.3s, box-shadow 0.3s',
            border: 'none',
            cursor: 'pointer'
        },
        secondaryButton: {
            background: '#6c757d'
        },
        helpText: {
            marginTop: '30px',
            paddingTop: '20px',
            borderTop: '1px solid #eee',
            color: '#999',
            fontSize: '0.9rem'
        }
    };

    // Add animations
    const styleTag = document.createElement('style');
    styleTag.textContent = `
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
    `;
    document.head.appendChild(styleTag);

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <FaTimesCircle style={styles.icon} />
                <h1 style={styles.title}>Payment Failed</h1>
                <p style={styles.message}>
                    We couldn't process your payment. Please try again.
                </p>
                
                <div style={styles.errorBox}>
                    <strong>Error:</strong> {error}
                </div>

                <div style={styles.actions}>
                    <Link to="/cart" style={{...styles.button, ...styles.secondaryButton}}>
                        <FaRedo /> Try Again
                    </Link>
                    <Link to="/" style={styles.button}>
                        <FaHome /> Go Home
                    </Link>
                </div>

                <div style={styles.helpText}>
                    Need help? Contact our support team at support@estore.com
                </div>
            </div>
        </div>
    );
};

export default OrderFailed;