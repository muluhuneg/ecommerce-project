import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { FaEnvelope, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await API.post('/auth/forgot-password', { email });
            setSuccess(true);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        container: {
            minHeight: 'calc(100vh - 80px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px'
        },
        card: {
            background: 'white',
            borderRadius: '10px',
            padding: '40px',
            width: '100%',
            maxWidth: '450px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
        },
        header: {
            textAlign: 'center',
            marginBottom: '30px'
        },
        title: {
            fontSize: '2rem',
            color: '#333',
            marginBottom: '10px'
        },
        subtitle: {
            color: '#666',
            fontSize: '0.95rem'
        },
        form: {
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
        },
        inputGroup: {
            position: 'relative'
        },
        inputIcon: {
            position: 'absolute',
            left: '15px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#999'
        },
        input: {
            width: '100%',
            padding: '15px 15px 15px 45px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '1rem'
        },
        button: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '15px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'opacity 0.3s'
        },
        errorAlert: {
            background: '#f8d7da',
            color: '#721c24',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'center'
        },
        successMessage: {
            textAlign: 'center',
            padding: '20px'
        },
        successIcon: {
            fontSize: '4rem',
            color: '#28a745',
            marginBottom: '20px'
        },
        backLink: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            color: '#667eea',
            textDecoration: 'none',
            marginTop: '20px'
        }
    };

    if (success) {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.successMessage}>
                        <FaCheckCircle style={styles.successIcon} />
                        <h2>Check Your Email</h2>
                        <p>We've sent a password reset link to {email}</p>
                        <p style={{ color: '#666', marginTop: '10px' }}>
                            The link will expire in 1 hour.
                        </p>
                        <Link to="/login" style={styles.backLink}>
                            <FaArrowLeft /> Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <h1 style={styles.title}>Forgot Password?</h1>
                    <p style={styles.subtitle}>
                        Enter your email and we'll send you a reset link
                    </p>
                </div>

                {error && (
                    <div style={styles.errorAlert}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <FaEnvelope style={styles.inputIcon} />
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={styles.input}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            ...styles.button,
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <Link to="/login" style={{ color: '#667eea', textDecoration: 'none' }}>
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;