import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    FaEnvelope, 
    FaLock, 
    FaEye, 
    FaEyeSlash, 
    FaUserTag,
    FaStore,
    FaShieldAlt,
    FaArrowRight,
    FaCheckCircle,
    FaExclamationCircle,
    FaGoogle,
    FaFacebook,
    FaTwitter
} from 'react-icons/fa';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'customer', // Default to customer
        rememberMe: false
    });
    
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [loginAttempts, setLoginAttempts] = useState(0);
    const [isLocked, setIsLocked] = useState(false);
    const [lockTimer, setLockTimer] = useState(0);
    
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Get redirect path from location state or default to role-based dashboard
    const from = location.state?.from?.pathname || null;

    // 👇 FIXED: Only show Customer and Seller roles - Admin is HIDDEN
    const roles = [
        { 
            value: 'customer', 
            label: 'Customer', 
            icon: '🛒',
            iconComponent: <FaUserTag />,
            color: '#4CAF50',
            lightColor: '#E8F5E9',
            description: 'Shop and track orders',
            redirectPath: '/profile'
        },
        { 
            value: 'seller', 
            label: 'Seller', 
            icon: '🏪',
            iconComponent: <FaStore />,
            color: '#FF9800',
            lightColor: '#FFF3E0',
            description: 'Manage products and sales',
            redirectPath: '/seller/dashboard'
        }
        // 👇 ADMIN ROLE REMOVED - NO LONGER VISIBLE TO PUBLIC
    ];

    // Lockout timer effect
    useEffect(() => {
        let interval;
        if (isLocked && lockTimer > 0) {
            interval = setInterval(() => {
                setLockTimer(prev => {
                    if (prev <= 1) {
                        setIsLocked(false);
                        setLoginAttempts(0);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isLocked, lockTimer]);

    // Check for message from registration
    useEffect(() => {
        if (location.state?.message) {
            setSuccess(location.state.message);
        }
        if (location.state?.email) {
            setFormData(prev => ({ ...prev, email: location.state.email }));
        }
    }, [location]);

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateField = (name, value) => {
        const errors = { ...fieldErrors };
        
        switch(name) {
            case 'email':
                if (!value) {
                    errors.email = 'Email is required';
                } else if (!validateEmail(value)) {
                    errors.email = 'Please enter a valid email address';
                } else {
                    delete errors.email;
                }
                break;
                
            case 'password':
                if (!value) {
                    errors.password = 'Password is required';
                } else if (value.length < 6) {
                    errors.password = 'Password must be at least 6 characters';
                } else {
                    delete errors.password;
                }
                break;
                
            default:
                break;
        }
        
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });

        if (name === 'email' || name === 'password') {
            validateField(name, value);
        }

        if (error) setError('');
    };

    const handleRoleSelect = (selectedRole) => {
        setFormData({ ...formData, role: selectedRole });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (isLocked) {
            setError(`Too many failed attempts. Please wait ${lockTimer} seconds.`);
            return;
        }

        const isEmailValid = validateField('email', formData.email);
        const isPasswordValid = validateField('password', formData.password);

        if (!isEmailValid || !isPasswordValid) {
            setError('Please fix the errors above');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const result = await login(formData.email, formData.password);
            
            if (result.success) {
                setLoginAttempts(0);
                
                // Check if user is trying to login as admin from public page
                if (result.user.role === 'admin') {
                    setError('Admin access is restricted. Please use the secure admin portal.');
                    setLoading(false);
                    return;
                }

                if (result.user.role !== formData.role) {
                    setError(
                        `This account is registered as a ${result.user.role}. ` +
                        `Please select the "${result.user.role}" role to continue.`
                    );
                    setLoading(false);
                    return;
                }

                setSuccess(`Welcome back, ${result.user.name || formData.email}! Redirecting...`);

                if (formData.rememberMe) {
                    localStorage.setItem('rememberedEmail', formData.email);
                } else {
                    localStorage.removeItem('rememberedEmail');
                }

                setTimeout(() => {
                    const roleConfig = roles.find(r => r.value === result.user.role);
                    
                    if (from) {
                        navigate(from, { replace: true });
                    } else if (roleConfig) {
                        navigate(roleConfig.redirectPath, { 
                            state: { welcome: true, userName: result.user.name } 
                        });
                    } else {
                        navigate('/profile');
                    }
                }, 1500);
            } else {
                const newAttempts = loginAttempts + 1;
                setLoginAttempts(newAttempts);

                if (newAttempts >= 5) {
                    setIsLocked(true);
                    setLockTimer(60);
                    setError('Too many failed attempts. Please try again in 60 seconds.');
                } else {
                    setError(
                        result.error || 
                        `Invalid credentials. ${5 - newAttempts} attempt(s) remaining.`
                    );
                }
            }
        } catch (err) {
            setError('Network error. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = (provider) => {
        setLoading(true);
        setTimeout(() => {
            setError(`${provider} login coming soon!`);
            setLoading(false);
        }, 1000);
    };

    const getRoleCardStyle = (role) => ({
        ...styles.roleCard,
        borderColor: formData.role === role.value ? role.color : '#eee',
        background: formData.role === role.value ? role.lightColor : 'white',
        transform: formData.role === role.value ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: formData.role === role.value ? '0 5px 15px rgba(0,0,0,0.1)' : 'none'
    });

    // Load remembered email on mount
    useEffect(() => {
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            setFormData(prev => ({ ...prev, email: rememberedEmail, rememberMe: true }));
        }
    }, []);

    // 👇 Updated demo credentials - Admin removed
    const demoCredentials = [
        { role: 'Customer', email: 'customer@test.com', icon: '🛒' },
        { role: 'Seller', email: 'seller@test.com', icon: '🏪' }
    ];

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
            borderRadius: '20px',
            padding: '40px',
            width: '100%',
            maxWidth: '500px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            position: 'relative',
            overflow: 'hidden'
        },
        cardBackground: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '200px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            opacity: 0.1,
            zIndex: 0
        },
        header: {
            textAlign: 'center',
            marginBottom: '30px',
            position: 'relative',
            zIndex: 1
        },
        title: {
            fontSize: '2.2rem',
            color: '#333',
            marginBottom: '10px',
            fontWeight: '700'
        },
        subtitle: {
            color: '#666',
            fontSize: '1rem'
        },
        roleSelector: {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)', // Changed from 3 to 2 columns
            gap: '15px',
            marginBottom: '30px',
            position: 'relative',
            zIndex: 1
        },
        roleCard: {
            padding: '20px 10px',
            border: '2px solid',
            borderRadius: '12px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
        },
        roleIcon: {
            fontSize: '2.5rem',
            marginBottom: '8px'
        },
        roleLabel: {
            fontSize: '0.9rem',
            fontWeight: '600',
            color: '#333',
            marginBottom: '4px'
        },
        roleDescription: {
            fontSize: '0.7rem',
            color: '#666',
            lineHeight: '1.3'
        },
        roleSelectedBadge: {
            position: 'absolute',
            top: '5px',
            right: '5px',
            color: '#4CAF50',
            fontSize: '0.8rem'
        },
        form: {
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            position: 'relative',
            zIndex: 1
        },
        inputGroup: {
            position: 'relative',
            marginBottom: fieldErrors.email || fieldErrors.password ? '5px' : '0'
        },
        inputIcon: {
            position: 'absolute',
            left: '15px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#999',
            fontSize: '1.1rem',
            zIndex: 2
        },
        input: {
            width: '100%',
            padding: '15px 15px 15px 45px',
            border: `2px solid ${fieldErrors.email || fieldErrors.password ? '#ff4444' : '#e0e0e0'}`,
            borderRadius: '12px',
            fontSize: '1rem',
            transition: 'all 0.3s',
            outline: 'none',
            backgroundColor: '#fafafa'
        },
        passwordToggle: {
            position: 'absolute',
            right: '15px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            color: '#999',
            cursor: 'pointer',
            zIndex: 2,
            fontSize: '1.1rem'
        },
        fieldError: {
            color: '#ff4444',
            fontSize: '0.8rem',
            marginTop: '5px',
            marginLeft: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
        },
        options: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '5px'
        },
        checkbox: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#666',
            cursor: 'pointer',
            userSelect: 'none'
        },
        checkboxInput: {
            width: '18px',
            height: '18px',
            cursor: 'pointer',
            accentColor: '#667eea'
        },
        forgotLink: {
            color: '#667eea',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: '500',
            transition: 'color 0.3s'
        },
        button: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
        },
        socialLogin: {
            marginTop: '25px',
            textAlign: 'center',
            position: 'relative',
            zIndex: 1
        },
        socialDivider: {
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            marginBottom: '20px'
        },
        dividerLine: {
            flex: 1,
            height: '1px',
            background: '#e0e0e0'
        },
        dividerText: {
            color: '#999',
            fontSize: '0.9rem'
        },
        socialButtons: {
            display: 'flex',
            gap: '15px',
            justifyContent: 'center'
        },
        socialButton: {
            flex: 1,
            padding: '12px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            background: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.3s',
            fontSize: '0.9rem',
            color: '#666'
        },
        errorAlert: {
            background: '#ffebee',
            color: '#c62828',
            padding: '15px 20px',
            borderRadius: '12px',
            marginBottom: '20px',
            textAlign: 'center',
            border: '1px solid #ffcdd2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            position: 'relative',
            zIndex: 1
        },
        successAlert: {
            background: '#e8f5e9',
            color: '#2e7d32',
            padding: '15px 20px',
            borderRadius: '12px',
            marginBottom: '20px',
            textAlign: 'center',
            border: '1px solid #a5d6a7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            position: 'relative',
            zIndex: 1,
            animation: 'slideDown 0.5s ease'
        },
        footer: {
            textAlign: 'center',
            marginTop: '30px',
            paddingTop: '20px',
            borderTop: '1px solid #eee',
            position: 'relative',
            zIndex: 1
        },
        link: {
            color: '#667eea',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '1rem'
        },
        demoCredentials: {
            background: '#f8f9fa',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '25px',
            fontSize: '0.9rem',
            color: '#444',
            border: '1px dashed #667eea',
            position: 'relative',
            zIndex: 1
        },
        demoTitle: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: '600',
            marginBottom: '12px',
            color: '#333'
        },
        demoGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)', // Changed from 3 to 2 columns
            gap: '10px'
        },
        demoItem: {
            padding: '8px',
            background: 'white',
            borderRadius: '6px',
            border: '1px solid #e0e0e0'
        },
        demoRole: {
            fontSize: '0.8rem',
            color: '#667eea',
            fontWeight: '600',
            marginBottom: '2px'
        },
        demoEmail: {
            fontSize: '0.7rem',
            color: '#666',
            wordBreak: 'break-all'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.cardBackground}></div>
                
                <div style={styles.header}>
                    <h1 style={styles.title}>Welcome Back</h1>
                    <p style={styles.subtitle}>Sign in to continue your journey</p>
                </div>

                {/* Demo Credentials - Admin Removed */}
                <div style={styles.demoCredentials}>
                    <div style={styles.demoTitle}>
                        <FaCheckCircle color="#4CAF50" size={16} />
                        <span>Demo Accounts</span>
                    </div>
                    <div style={styles.demoGrid}>
                        <div style={styles.demoItem}>
                            <div style={styles.demoRole}>🛒 Customer</div>
                            <div style={styles.demoEmail}>customer@test.com</div>
                        </div>
                        <div style={styles.demoItem}>
                            <div style={styles.demoRole}>🏪 Seller</div>
                            <div style={styles.demoEmail}>seller@test.com</div>
                        </div>
                    </div>
                </div>

                {/* Role Selector - Now only shows Customer and Seller */}
                <div style={styles.roleSelector}>
                    {roles.map(role => (
                        <div
                            key={role.value}
                            style={getRoleCardStyle(role)}
                            onClick={() => handleRoleSelect(role.value)}
                            onMouseEnter={(e) => {
                                if (formData.role !== role.value) {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (formData.role !== role.value) {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }
                            }}
                        >
                            <div style={styles.roleIcon}>{role.icon}</div>
                            <div style={styles.roleLabel}>{role.label}</div>
                            <div style={styles.roleDescription}>{role.description}</div>
                            {formData.role === role.value && (
                                <div style={styles.roleSelectedBadge}>
                                    <FaCheckCircle color={role.color} size={12} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Error Message */}
                {error && (
                    <div style={styles.errorAlert}>
                        <FaExclamationCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Success Message */}
                {success && (
                    <div style={styles.successAlert}>
                        <FaCheckCircle size={18} />
                        <span>{success}</span>
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div>
                        <div style={styles.inputGroup}>
                            <FaEnvelope style={styles.inputIcon} />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={() => validateField('email', formData.email)}
                                required
                                style={styles.input}
                                disabled={loading || isLocked}
                            />
                        </div>
                        {fieldErrors.email && (
                            <div style={styles.fieldError}>
                                <FaExclamationCircle size={12} />
                                {fieldErrors.email}
                            </div>
                        )}
                    </div>

                    <div>
                        <div style={styles.inputGroup}>
                            <FaLock style={styles.inputIcon} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                onBlur={() => validateField('password', formData.password)}
                                required
                                style={styles.input}
                                disabled={loading || isLocked}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={styles.passwordToggle}
                                disabled={loading || isLocked}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        {fieldErrors.password && (
                            <div style={styles.fieldError}>
                                <FaExclamationCircle size={12} />
                                {fieldErrors.password}
                            </div>
                        )}
                    </div>

                    <div style={styles.options}>
                        <label style={styles.checkbox}>
                            <input
                                type="checkbox"
                                name="rememberMe"
                                checked={formData.rememberMe}
                                onChange={handleChange}
                                style={styles.checkboxInput}
                                disabled={loading || isLocked}
                            />
                            <span>Remember me</span>
                        </label>
                        <Link to="/forgot-password" style={styles.forgotLink}>
                            Forgot Password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || isLocked}
                        style={{
                            ...styles.button,
                            opacity: loading || isLocked ? 0.7 : 1,
                            cursor: loading || isLocked ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? (
                            'Signing in...'
                        ) : isLocked ? (
                            `Locked (${lockTimer}s)`
                        ) : (
                            <>
                                Sign in as {formData.role}
                                <FaArrowRight />
                            </>
                        )}
                    </button>
                </form>

                {/* Social Login */}
                <div style={styles.socialLogin}>
                    <div style={styles.socialDivider}>
                        <div style={styles.dividerLine} />
                        <span style={styles.dividerText}>or continue with</span>
                        <div style={styles.dividerLine} />
                    </div>
                    <div style={styles.socialButtons}>
                        <button
                            style={styles.socialButton}
                            onClick={() => handleSocialLogin('Google')}
                            disabled={loading}
                        >
                            <FaGoogle color="#DB4437" />
                            Google
                        </button>
                        <button
                            style={styles.socialButton}
                            onClick={() => handleSocialLogin('Facebook')}
                            disabled={loading}
                        >
                            <FaFacebook color="#4267B2" />
                            Facebook
                        </button>
                        <button
                            style={styles.socialButton}
                            onClick={() => handleSocialLogin('Twitter')}
                            disabled={loading}
                        >
                            <FaTwitter color="#1DA1F2" />
                            Twitter
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div style={styles.footer}>
                    <p style={{ color: '#666', marginBottom: '10px' }}>
                        Don't have an account?
                    </p>
                    <Link to="/register" style={styles.link}>
                        Create Account
                    </Link>
                </div>
            </div>

            {/* CSS Animations */}
            <style>
                {`
                    @keyframes slideDown {
                        from {
                            opacity: 0;
                            transform: translateY(-20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    
                    @keyframes fadeIn {
                        from {
                            opacity: 0;
                        }
                        to {
                            opacity: 1;
                        }
                    }
                    
                    .pulse {
                        animation: pulse 2s infinite;
                    }
                    
                    @keyframes pulse {
                        0% {
                            transform: scale(1);
                        }
                        50% {
                            transform: scale(1.05);
                        }
                        100% {
                            transform: scale(1);
                        }
                    }
                `}
            </style>
        </div>
    );
};

export default Login;