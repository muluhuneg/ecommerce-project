import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaLock, FaEnvelope, FaEye, FaEyeSlash, FaShieldAlt, FaArrowRight, FaExclamationCircle } from 'react-icons/fa';

const SecretAdminLogin = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login(formData.email, formData.password);
            
            if (result.success) {
                if (result.user.role === 'admin') {
                    navigate('/admin/dashboard', { 
                        state: { 
                            message: 'Welcome back, Administrator!',
                            timestamp: new Date().toISOString()
                        }
                    });
                } else {
                    setError('Access Denied: This portal is strictly for administrators only.');
                    
                    // Log unauthorized access attempt (in production, you'd want to log this)
                    console.warn('Unauthorized admin access attempt:', {
                        email: formData.email,
                        role: result.user.role,
                        timestamp: new Date().toISOString()
                    });
                    
                    setLoading(false);
                }
            } else {
                setError(result.error || 'Invalid credentials');
            }
        } catch (err) {
            setError('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        container: {
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
            position: 'relative',
            overflow: 'hidden'
        },
        backgroundOverlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
        },
        card: {
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(10px)',
            borderRadius: '24px',
            padding: '50px',
            width: '100%',
            maxWidth: '480px',
            boxShadow: '0 30px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)',
            position: 'relative',
            zIndex: 1,
            border: '1px solid rgba(255,255,255,0.2)'
        },
        header: {
            textAlign: 'center',
            marginBottom: '30px'
        },
        shieldIcon: {
            fontSize: '4rem',
            color: '#667eea',
            marginBottom: '15px',
            filter: 'drop-shadow(0 10px 20px rgba(102,126,234,0.3))'
        },
        title: {
            fontSize: '2.2rem',
            color: '#1a1a2e',
            marginBottom: '5px',
            fontWeight: '800',
            letterSpacing: '1px'
        },
        subtitle: {
            color: '#666',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px'
        },
        restrictedBadge: {
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            padding: '8px 20px',
            borderRadius: '30px',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            display: 'inline-block',
            marginTop: '15px',
            letterSpacing: '0.5px',
            boxShadow: '0 4px 15px rgba(245, 87, 108, 0.3)'
        },
        form: {
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            marginTop: '30px'
        },
        inputGroup: {
            position: 'relative'
        },
        inputIcon: {
            position: 'absolute',
            left: '15px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#667eea',
            fontSize: '1.1rem',
            zIndex: 2
        },
        input: {
            width: '100%',
            padding: '16px 16px 16px 45px',
            border: '2px solid #e0e0e0',
            borderRadius: '12px',
            fontSize: '1rem',
            transition: 'all 0.3s',
            outline: 'none',
            background: 'white',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
        },
        passwordToggle: {
            position: 'absolute',
            right: '15px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            color: '#667eea',
            cursor: 'pointer',
            fontSize: '1.1rem'
        },
        button: {
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            padding: '16px',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s',
            marginTop: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: '0 10px 20px rgba(102,126,234,0.3)'
        },
        errorAlert: {
            background: '#ff4757',
            color: 'white',
            padding: '15px 20px',
            borderRadius: '12px',
            marginBottom: '20px',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            fontSize: '0.95rem',
            boxShadow: '0 5px 15px rgba(255,71,87,0.2)'
        },
        footer: {
            textAlign: 'center',
            marginTop: '30px',
            color: '#666',
            fontSize: '0.85rem',
            borderTop: '1px solid #eee',
            paddingTop: '20px'
        },
        secretHint: {
            background: 'rgba(102, 126, 234, 0.05)',
            padding: '15px',
            borderRadius: '12px',
            marginTop: '25px',
            fontSize: '0.8rem',
            color: '#667eea',
            textAlign: 'center',
            border: '1px dashed #667eea',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
        },
        securityNote: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            fontSize: '0.75rem',
            color: '#999',
            marginTop: '15px'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.backgroundOverlay}></div>
            <div style={styles.card}>
                <div style={styles.header}>
                    <FaShieldAlt style={styles.shieldIcon} />
                    <h1 style={styles.title}>Admin Portal</h1>
                    <div style={styles.subtitle}>
                        <FaLock size={12} /> Secure Administrator Access
                    </div>
                    <div style={styles.restrictedBadge}>
                        🔒 RESTRICTED ACCESS
                    </div>
                </div>

                {error && (
                    <div style={styles.errorAlert}>
                        <FaExclamationCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <FaEnvelope style={styles.inputIcon} />
                        <input
                            type="email"
                            name="email"
                            placeholder="Admin Email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            style={styles.input}
                            disabled={loading}
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <FaLock style={styles.inputIcon} />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            placeholder="Admin Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            style={styles.input}
                            disabled={loading}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={styles.passwordToggle}
                            disabled={loading}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            ...styles.button,
                            opacity: loading ? 0.7 : 1,
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Authenticating...' : (
                            <>
                                Access Admin Dashboard
                                <FaArrowRight />
                            </>
                        )}
                    </button>
                </form>

                <div style={styles.secretHint}>
                    <FaLock size={12} />
                    <span>This page is hidden. Only authorized administrators know this URL.</span>
                </div>

                <div style={styles.securityNote}>
                    <FaLock size={10} /> All access attempts are logged • Unauthorized access is prohibited
                </div>

                <div style={styles.footer}>
                    <p>© {new Date().getFullYear()} E-Store. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default SecretAdminLogin;