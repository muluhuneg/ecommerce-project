import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import API from '../services/api';
import { 
    FaLock, 
    FaEye, 
    FaEyeSlash, 
    FaCheckCircle,
    FaExclamationCircle,
    FaArrowLeft,
    FaSpinner
} from 'react-icons/fa';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [tokenValid, setTokenValid] = useState(true);
    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        hasLength: false,
        hasNumber: false,
        hasUpper: false,
        hasLower: false,
        hasSpecial: false
    });

    const token = searchParams.get('token');

    useEffect(() => {
        // Check if token exists
        if (!token) {
            setTokenValid(false);
            setError('No reset token provided');
        }
    }, [token]);

    // Password strength checker
    const checkPasswordStrength = (password) => {
        const strength = {
            score: 0,
            hasLength: password.length >= 8,
            hasNumber: /\d/.test(password),
            hasUpper: /[A-Z]/.test(password),
            hasLower: /[a-z]/.test(password),
            hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        // Calculate score (each criterion = 1 point)
        strength.score = [strength.hasLength, strength.hasNumber, strength.hasUpper, 
                         strength.hasLower, strength.hasSpecial].filter(Boolean).length;
        
        setPasswordStrength(strength);
        return strength;
    };

    // Get password strength color and text
    const getPasswordStrengthInfo = () => {
        const { hasLength, hasNumber, hasUpper, hasLower, hasSpecial } = passwordStrength;
        const metCriteria = [hasLength, hasNumber, hasUpper, hasLower, hasSpecial].filter(Boolean).length;
        
        if (metCriteria === 0) return { color: '#ff4444', text: 'Very Weak', width: '0%' };
        if (metCriteria === 1) return { color: '#ff4444', text: 'Weak', width: '20%' };
        if (metCriteria === 2) return { color: '#ffaa00', text: 'Fair', width: '40%' };
        if (metCriteria === 3) return { color: '#ffaa00', text: 'Good', width: '60%' };
        if (metCriteria === 4) return { color: '#00cc88', text: 'Strong', width: '80%' };
        return { color: '#00cc88', text: 'Very Strong', width: '100%' };
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        if (name === 'newPassword') {
            checkPasswordStrength(value);
        }

        // Clear error when user types
        if (error) setError('');
    };

    const validateForm = () => {
        if (!formData.newPassword) {
            setError('New password is required');
            return false;
        }

        if (formData.newPassword.length < 8) {
            setError('Password must be at least 8 characters');
            return false;
        }

        if (passwordStrength.score < 3) {
            setError('Password must contain at least: 1 uppercase, 1 lowercase, 1 number, and 1 special character');
            return false;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        setError('');

        try {
            await API.post('/auth/reset-password', {
                token,
                newPassword: formData.newPassword
            });

            setSuccess(true);
            
            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (error) {
            console.error('Reset password error:', error);
            setError(error.response?.data?.message || 'Failed to reset password. The link may have expired.');
            setTokenValid(false);
        } finally {
            setLoading(false);
        }
    };

    const PasswordStrengthMeter = () => {
        const strengthInfo = getPasswordStrengthInfo();
        const { hasLength, hasNumber, hasUpper, hasLower, hasSpecial } = passwordStrength;
        
        return (
            <div style={styles.strengthMeter}>
                <div style={styles.strengthBarContainer}>
                    <div style={{
                        ...styles.strengthBar,
                        width: strengthInfo.width,
                        backgroundColor: strengthInfo.color
                    }} />
                </div>
                <span style={{...styles.strengthText, color: strengthInfo.color}}>
                    {strengthInfo.text}
                </span>
                
                {/* Password requirements checklist */}
                {formData.newPassword && (
                    <div style={styles.requirementsList}>
                        <div style={styles.requirement}>
                            {hasLength ? 
                                <FaCheckCircle color="#00cc88" size={12} /> : 
                                <FaExclamationCircle color="#ff4444" size={12} />
                            }
                            <span style={{marginLeft: '5px', fontSize: '0.8rem'}}>
                                At least 8 characters
                            </span>
                        </div>
                        <div style={styles.requirement}>
                            {hasUpper ? 
                                <FaCheckCircle color="#00cc88" size={12} /> : 
                                <FaExclamationCircle color="#ff4444" size={12} />
                            }
                            <span style={{marginLeft: '5px', fontSize: '0.8rem'}}>
                                One uppercase letter
                            </span>
                        </div>
                        <div style={styles.requirement}>
                            {hasLower ? 
                                <FaCheckCircle color="#00cc88" size={12} /> : 
                                <FaExclamationCircle color="#ff4444" size={12} />
                            }
                            <span style={{marginLeft: '5px', fontSize: '0.8rem'}}>
                                One lowercase letter
                            </span>
                        </div>
                        <div style={styles.requirement}>
                            {hasNumber ? 
                                <FaCheckCircle color="#00cc88" size={12} /> : 
                                <FaExclamationCircle color="#ff4444" size={12} />
                            }
                            <span style={{marginLeft: '5px', fontSize: '0.8rem'}}>
                                One number
                            </span>
                        </div>
                        <div style={styles.requirement}>
                            {hasSpecial ? 
                                <FaCheckCircle color="#00cc88" size={12} /> : 
                                <FaExclamationCircle color="#ff4444" size={12} />
                            }
                            <span style={{marginLeft: '5px', fontSize: '0.8rem'}}>
                                One special character (!@#$%^&*)
                            </span>
                        </div>
                    </div>
                )}
            </div>
        );
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
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            animation: 'slideIn 0.3s ease-out'
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
        successContainer: {
            textAlign: 'center',
            padding: '20px'
        },
        successIcon: {
            fontSize: '4rem',
            color: '#28a745',
            marginBottom: '20px'
        },
        successTitle: {
            fontSize: '1.5rem',
            color: '#333',
            marginBottom: '10px'
        },
        successMessage: {
            color: '#666',
            marginBottom: '20px'
        },
        redirectMessage: {
            color: '#999',
            fontSize: '0.9rem',
            marginTop: '20px'
        },
        errorAlert: {
            background: '#f8d7da',
            color: '#721c24',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            justifyContent: 'center'
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
            fontSize: '1rem',
            transition: 'border-color 0.3s',
            outline: 'none'
        },
        passwordToggle: {
            position: 'absolute',
            right: '15px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            color: '#999',
            cursor: 'pointer'
        },
        strengthMeter: {
            marginTop: '5px'
        },
        strengthBarContainer: {
            width: '100%',
            height: '5px',
            backgroundColor: '#eee',
            borderRadius: '3px',
            overflow: 'hidden',
            marginBottom: '5px'
        },
        strengthBar: {
            height: '100%',
            transition: 'width 0.3s ease, background-color 0.3s ease'
        },
        strengthText: {
            fontSize: '0.8rem',
            fontWeight: '600'
        },
        requirementsList: {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '5px',
            marginTop: '10px',
            padding: '10px',
            background: '#f8f9fa',
            borderRadius: '5px'
        },
        requirement: {
            display: 'flex',
            alignItems: 'center',
            fontSize: '0.8rem',
            color: '#666'
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
            transition: 'all 0.3s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '10px'
        },
        backLink: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            color: '#667eea',
            textDecoration: 'none',
            marginTop: '20px',
            fontSize: '0.9rem'
        },
        spinner: {
            animation: 'spin 1s linear infinite'
        }
    };

    // Add global animations
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    if (!tokenValid) {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.successContainer}>
                        <FaExclamationCircle style={{...styles.successIcon, color: '#dc3545'}} />
                        <h2 style={styles.successTitle}>Invalid Reset Link</h2>
                        <p style={styles.successMessage}>
                            The password reset link is invalid or has expired.
                        </p>
                        <Link to="/forgot-password" style={styles.backLink}>
                            <FaArrowLeft /> Request New Reset Link
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.successContainer}>
                        <FaCheckCircle style={styles.successIcon} />
                        <h2 style={styles.successTitle}>Password Reset Successfully!</h2>
                        <p style={styles.successMessage}>
                            Your password has been changed. You can now log in with your new password.
                        </p>
                        <div style={styles.redirectMessage}>
                            Redirecting to login in 3 seconds...
                        </div>
                        <Link to="/login" style={styles.backLink}>
                            <FaArrowLeft /> Go to Login Now
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
                    <h1 style={styles.title}>Reset Password</h1>
                    <p style={styles.subtitle}>
                        Enter your new password below
                    </p>
                </div>

                {error && (
                    <div style={styles.errorAlert}>
                        <FaExclamationCircle /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <FaLock style={styles.inputIcon} />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="newPassword"
                            placeholder="New Password"
                            value={formData.newPassword}
                            onChange={handleChange}
                            required
                            style={styles.input}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={styles.passwordToggle}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>

                    {/* Password Strength Meter */}
                    {formData.newPassword && <PasswordStrengthMeter />}

                    <div style={styles.inputGroup}>
                        <FaLock style={styles.inputIcon} />
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            placeholder="Confirm New Password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            style={styles.input}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            style={styles.passwordToggle}
                        >
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            ...styles.button,
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? (
                            <>
                                <FaSpinner className="spinner" style={styles.spinner} />
                                Resetting Password...
                            </>
                        ) : (
                            'Reset Password'
                        )}
                    </button>
                </form>

                <Link to="/login" style={styles.backLink}>
                    <FaArrowLeft /> Back to Login
                </Link>
            </div>
        </div>
    );
};

export default ResetPassword;