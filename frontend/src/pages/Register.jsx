import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    FaUser, 
    FaEnvelope, 
    FaPhone, 
    FaLock, 
    FaEye, 
    FaEyeSlash,
    FaStore,
    FaIdCard,
    FaMapMarkerAlt,
    FaBriefcase,
    FaCheckCircle,
    FaTimesCircle,
    FaShieldAlt
} from 'react-icons/fa';

const Register = () => {
    const [step, setStep] = useState(1);
    const [role, setRole] = useState('customer');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        hasLength: false,
        hasNumber: false,
        hasUpper: false,
        hasLower: false,
        hasSpecial: false
    });
    
    const [formData, setFormData] = useState({
        // Common fields
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        
        // Seller specific fields
        businessName: '',
        businessAddress: '',
        businessPhone: '',
        businessEmail: '',
        taxId: '',
        businessLicense: '',
        
        // Terms
        agreeTerms: false
    });

    const { register } = useAuth();
    const navigate = useNavigate();

    // Ethiopian phone number validation
    const validateEthiopianPhone = (phone) => {
        // Ethiopian phone numbers: 09XXXXXXXX or +2519XXXXXXXX
        const ethiopianPhoneRegex = /^(09\d{8}|\+2519\d{8})$/;
        return ethiopianPhoneRegex.test(phone);
    };

    // Email validation
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

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

        // Calculate score (each criterion = 1 point, max 5)
        strength.score = Object.values(strength).filter(val => val === true).length - 1; // Subtract 1 because score is included
        
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

    const roles = [
        { 
            value: 'customer', 
            label: 'Customer', 
            icon: '🛒',
            description: 'Shop and buy products',
            permissions: ['view_products', 'purchase', 'write_reviews']
        },
        { 
            value: 'seller', 
            label: 'Seller', 
            icon: '🏪',
            description: 'Sell products on our platform',
            permissions: ['view_products', 'manage_products', 'view_orders', 'manage_inventory']
        },
        { 
            value: 'admin', 
            label: 'Admin', 
            icon: '⚙️',
            description: 'Manage the platform (by invitation only)',
            permissions: ['all']
        }
    ];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        // Special handling for phone - only allow numbers and + sign
        if (name === 'phone' || name === 'businessPhone') {
            const cleaned = value.replace(/[^0-9+]/g, '');
            setFormData({
                ...formData,
                [name]: cleaned
            });
        } else {
            setFormData({
                ...formData,
                [name]: type === 'checkbox' ? checked : value
            });
        }

        // Check password strength when password changes
        if (name === 'password') {
            checkPasswordStrength(value);
        }
    };

    const handleRoleSelect = (selectedRole) => {
        setRole(selectedRole);
        setError('');
        setStep(2);
    };

    const validateStep = () => {
        if (step === 2) {
            // Validate name
            if (!formData.name.trim()) return 'Full name is required';
            if (formData.name.length < 3) return 'Name must be at least 3 characters';
            
            // Validate email
            if (!formData.email) return 'Email is required';
            if (!validateEmail(formData.email)) return 'Please enter a valid email address';
            
            // Validate phone
            if (!formData.phone) return 'Phone number is required';
            if (!validateEthiopianPhone(formData.phone)) {
                return 'Please enter a valid Ethiopian phone number (09XXXXXXXX or +2519XXXXXXXX)';
            }
            
            // Validate password
            if (!formData.password) return 'Password is required';
            if (formData.password.length < 8) return 'Password must be at least 8 characters';
            
            const strength = checkPasswordStrength(formData.password);
            if (strength.score < 3) {
                return 'Password must contain at least: 1 uppercase, 1 lowercase, 1 number, and 1 special character';
            }
            
            if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
        }
        
        if (step === 3 && role === 'seller') {
            if (!formData.businessName.trim()) return 'Business name is required';
            if (!formData.businessAddress.trim()) return 'Business address is required';
            if (!formData.businessPhone) return 'Business phone is required';
            if (!validateEthiopianPhone(formData.businessPhone)) {
                return 'Please enter a valid Ethiopian business phone number';
            }
            if (formData.businessEmail && !validateEmail(formData.businessEmail)) {
                return 'Please enter a valid business email address';
            }
        }
        
        return null;
    };

    const handleNext = () => {
        const validationError = validateStep();
        if (validationError) {
            setError(validationError);
            window.scrollTo(0, 0);
            return;
        }
        setError('');
        setStep(step + 1);
    };

    const handleBack = () => {
        setError('');
        setStep(step - 1);
    };

    // FIXED: handleSubmit with proper field name conversion
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.agreeTerms) {
            setError('You must agree to the terms and conditions');
            window.scrollTo(0, 0);
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Get permissions for selected role
            const selectedRole = roles.find(r => r.value === role);
            
            // Base registration data for all roles
            const registrationData = {
                name: formData.name,
                email: formData.email.toLowerCase().trim(),
                phone: formData.phone,
                password: formData.password,
                role: role,
                permissions: selectedRole.permissions
            };

            // Add seller-specific fields with proper snake_case naming for backend
            if (role === 'seller') {
                registrationData.business_name = formData.businessName;
                registrationData.business_address = formData.businessAddress;
                registrationData.business_phone = formData.businessPhone;
                registrationData.business_email = formData.businessEmail;
                registrationData.tax_id = formData.taxId;
                registrationData.business_license = formData.businessLicense;
            }

            // Remove undefined or empty fields
            Object.keys(registrationData).forEach(key => {
                if (registrationData[key] === undefined || registrationData[key] === '') {
                    delete registrationData[key];
                }
            });

            console.log('Sending registration data:', registrationData);

            const result = await register(registrationData);
            
            if (result.success) {
                setSuccess('Registration successful! Redirecting...');
                
                // Store user role in localStorage for authorization checks
                localStorage.setItem('userRole', role);
                localStorage.setItem('userPermissions', JSON.stringify(selectedRole.permissions));
                
                // Redirect based on role after delay
                setTimeout(() => {
                    if (role === 'admin') {
                        navigate('/admin/dashboard', { state: { message: 'Your admin account is pending approval' } });
                    } else if (role === 'seller') {
                        navigate('/seller/dashboard', { state: { welcome: true } });
                    } else {
                        navigate('/profile', { state: { welcome: true } });
                    }
                }, 2000);
            } else {
                setError(result.error || 'Registration failed. Please try again.');
            }
        } catch (err) {
            console.error('Registration error:', err);
            setError('An error occurred. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    // Password strength meter component
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
                {formData.password && (
                    <div style={styles.requirementsList}>
                        <div style={styles.requirement}>
                            {hasLength ? 
                                <FaCheckCircle color="#00cc88" size={12} /> : 
                                <FaTimesCircle color="#ff4444" size={12} />
                            }
                            <span style={{marginLeft: '5px', fontSize: '0.8rem'}}>
                                At least 8 characters
                            </span>
                        </div>
                        <div style={styles.requirement}>
                            {hasUpper ? 
                                <FaCheckCircle color="#00cc88" size={12} /> : 
                                <FaTimesCircle color="#ff4444" size={12} />
                            }
                            <span style={{marginLeft: '5px', fontSize: '0.8rem'}}>
                                One uppercase letter
                            </span>
                        </div>
                        <div style={styles.requirement}>
                            {hasLower ? 
                                <FaCheckCircle color="#00cc88" size={12} /> : 
                                <FaTimesCircle color="#ff4444" size={12} />
                            }
                            <span style={{marginLeft: '5px', fontSize: '0.8rem'}}>
                                One lowercase letter
                            </span>
                        </div>
                        <div style={styles.requirement}>
                            {hasNumber ? 
                                <FaCheckCircle color="#00cc88" size={12} /> : 
                                <FaTimesCircle color="#ff4444" size={12} />
                            }
                            <span style={{marginLeft: '5px', fontSize: '0.8rem'}}>
                                One number
                            </span>
                        </div>
                        <div style={styles.requirement}>
                            {hasSpecial ? 
                                <FaCheckCircle color="#00cc88" size={12} /> : 
                                <FaTimesCircle color="#ff4444" size={12} />
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
            maxWidth: '600px',
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
        stepIndicator: {
            display: 'flex',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '30px'
        },
        step: {
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '1.2rem'
        },
        stepLine: {
            width: '60px',
            height: '2px',
            alignSelf: 'center'
        },
        roleGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '15px',
            marginBottom: '20px'
        },
        roleCard: {
            padding: '20px',
            border: '2px solid #eee',
            borderRadius: '10px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s'
        },
        roleIcon: {
            fontSize: '2.5rem',
            marginBottom: '10px'
        },
        roleLabel: {
            fontSize: '1.1rem',
            fontWeight: '600',
            color: '#333',
            marginBottom: '5px'
        },
        roleDescription: {
            fontSize: '0.8rem',
            color: '#666'
        },
        form: {
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
        },
        formSection: {
            marginBottom: '20px'
        },
        sectionTitle: {
            fontSize: '1.2rem',
            color: '#333',
            marginBottom: '15px',
            paddingBottom: '5px',
            borderBottom: '2px solid #667eea'
        },
        formGrid: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '15px'
        },
        inputGroup: {
            position: 'relative',
            marginBottom: '15px'
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
            padding: '12px 12px 12px 40px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '0.95rem',
            transition: 'border-color 0.3s'
        },
        textarea: {
            width: '100%',
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '0.95rem',
            minHeight: '80px',
            resize: 'vertical'
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
            marginTop: '5px',
            marginBottom: '10px'
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
        terms: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginTop: '10px'
        },
        checkbox: {
            width: '18px',
            height: '18px',
            cursor: 'pointer'
        },
        buttonGroup: {
            display: 'flex',
            gap: '15px',
            marginTop: '20px'
        },
        button: {
            flex: 1,
            padding: '12px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'opacity 0.3s'
        },
        primaryButton: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
        },
        secondaryButton: {
            background: '#6c757d',
            color: 'white'
        },
        errorAlert: {
            background: '#f8d7da',
            color: '#721c24',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'center'
        },
        successAlert: {
            background: '#d4edda',
            color: '#155724',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'center'
        },
        footer: {
            textAlign: 'center',
            marginTop: '30px',
            paddingTop: '20px',
            borderTop: '1px solid #eee'
        },
        link: {
            color: '#667eea',
            textDecoration: 'none',
            fontWeight: '600'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <h1 style={styles.title}>Create Account</h1>
                    <p style={styles.subtitle}>Join us as a customer, seller, or admin</p>
                </div>

                {/* Step Indicator */}
                <div style={styles.stepIndicator}>
                    <div style={{
                        ...styles.step,
                        backgroundColor: step >= 1 ? '#667eea' : '#ddd',
                        color: step >= 1 ? 'white' : '#666'
                    }}>
                        1
                    </div>
                    <div style={{
                        ...styles.stepLine,
                        backgroundColor: step >= 2 ? '#667eea' : '#ddd'
                    }} />
                    <div style={{
                        ...styles.step,
                        backgroundColor: step >= 2 ? '#667eea' : '#ddd',
                        color: step >= 2 ? 'white' : '#666'
                    }}>
                        2
                    </div>
                    <div style={{
                        ...styles.stepLine,
                        backgroundColor: step >= 3 ? '#667eea' : '#ddd'
                    }} />
                    <div style={{
                        ...styles.step,
                        backgroundColor: step >= 3 ? '#667eea' : '#ddd',
                        color: step >= 3 ? 'white' : '#666'
                    }}>
                        3
                    </div>
                </div>

                {error && (
                    <div style={styles.errorAlert}>
                        {error}
                    </div>
                )}

                {success && (
                    <div style={styles.successAlert}>
                        {success}
                    </div>
                )}

                {/* Step 1: Role Selection */}
                {step === 1 && (
                    <div>
                        <div style={styles.roleGrid}>
                            {roles.map(r => (
                                <div
                                    key={r.value}
                                    style={{
                                        ...styles.roleCard,
                                        borderColor: role === r.value ? '#667eea' : '#eee',
                                        background: role === r.value ? '#f0f4ff' : 'white'
                                    }}
                                    onClick={() => handleRoleSelect(r.value)}
                                >
                                    <div style={styles.roleIcon}>{r.icon}</div>
                                    <div style={styles.roleLabel}>{r.label}</div>
                                    <div style={styles.roleDescription}>{r.description}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: Common Information */}
                {step === 2 && (
                    <form style={styles.form} onSubmit={(e) => e.preventDefault()}>
                        <div style={styles.formSection}>
                            <h3 style={styles.sectionTitle}>Personal Information</h3>
                            
                            <div style={styles.inputGroup}>
                                <FaUser style={styles.inputIcon} />
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Full Name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <FaEnvelope style={styles.inputIcon} />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email Address"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <FaPhone style={styles.inputIcon} />
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="Ethiopian Phone (09XXXXXXXX or +2519XXXXXXXX)"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    style={styles.input}
                                />
                                <small style={{position: 'absolute', left: '40px', bottom: '-18px', fontSize: '0.7rem', color: '#999'}}>
                                    Ethiopian numbers only
                                </small>
                            </div>

                            <div style={styles.inputGroup}>
                                <FaLock style={styles.inputIcon} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    placeholder="Password"
                                    value={formData.password}
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
                            {formData.password && <PasswordStrengthMeter />}

                            <div style={styles.inputGroup}>
                                <FaLock style={styles.inputIcon} />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    placeholder="Confirm Password"
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
                        </div>
                    </form>
                )}

                {/* Step 3: Role-specific Information */}
                {step === 3 && (
                    <form style={styles.form} onSubmit={(e) => e.preventDefault()}>
                        {role === 'seller' && (
                            <div style={styles.formSection}>
                                <h3 style={styles.sectionTitle}>Business Information</h3>
                                
                                <div style={styles.inputGroup}>
                                    <FaStore style={styles.inputIcon} />
                                    <input
                                        type="text"
                                        name="businessName"
                                        placeholder="Business Name"
                                        value={formData.businessName}
                                        onChange={handleChange}
                                        required
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.inputGroup}>
                                    <FaMapMarkerAlt style={styles.inputIcon} />
                                    <textarea
                                        name="businessAddress"
                                        placeholder="Business Address"
                                        value={formData.businessAddress}
                                        onChange={handleChange}
                                        required
                                        style={styles.textarea}
                                    />
                                </div>

                                <div style={styles.formGrid}>
                                    <div style={styles.inputGroup}>
                                        <FaPhone style={styles.inputIcon} />
                                        <input
                                            type="tel"
                                            name="businessPhone"
                                            placeholder="Business Phone (Ethiopian)"
                                            value={formData.businessPhone}
                                            onChange={handleChange}
                                            style={styles.input}
                                        />
                                    </div>

                                    <div style={styles.inputGroup}>
                                        <FaEnvelope style={styles.inputIcon} />
                                        <input
                                            type="email"
                                            name="businessEmail"
                                            placeholder="Business Email"
                                            value={formData.businessEmail}
                                            onChange={handleChange}
                                            style={styles.input}
                                        />
                                    </div>
                                </div>

                                <div style={styles.formGrid}>
                                    <div style={styles.inputGroup}>
                                        <FaIdCard style={styles.inputIcon} />
                                        <input
                                            type="text"
                                            name="taxId"
                                            placeholder="Tax ID / License"
                                            value={formData.taxId}
                                            onChange={handleChange}
                                            style={styles.input}
                                        />
                                    </div>

                                    <div style={styles.inputGroup}>
                                        <FaBriefcase style={styles.inputIcon} />
                                        <input
                                            type="text"
                                            name="businessLicense"
                                            placeholder="Business License"
                                            value={formData.businessLicense}
                                            onChange={handleChange}
                                            style={styles.input}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {role === 'admin' && (
                            <div style={styles.formSection}>
                                <div style={{textAlign: 'center', marginBottom: '20px'}}>
                                    <FaShieldAlt size={50} color="#667eea" />
                                    <p style={{color: '#666', marginTop: '10px'}}>
                                        Admin registration requires an invitation code and approval.
                                    </p>
                                </div>
                                <div style={styles.inputGroup}>
                                    <FaLock style={styles.inputIcon} />
                                    <input
                                        type="text"
                                        name="invitationCode"
                                        placeholder="Enter Invitation Code"
                                        style={styles.input}
                                    />
                                </div>
                                <p style={{color: '#ff6b6b', fontSize: '0.8rem', marginTop: '10px'}}>
                                    Note: Admin accounts must be approved by super admin
                                </p>
                            </div>
                        )}

                        {role === 'customer' && (
                            <div style={styles.formSection}>
                                <div style={{
                                    background: '#d4edda',
                                    color: '#155724',
                                    padding: '20px',
                                    borderRadius: '8px',
                                    textAlign: 'center'
                                }}>
                                    <FaCheckCircle size={40} color="#28a745" />
                                    <p style={{marginTop: '10px', fontSize: '1.1rem'}}>
                                        ✓ You're all set!
                                    </p>
                                    <p style={{marginTop: '5px', fontSize: '0.9rem'}}>
                                        Just review and accept the terms below to complete your registration.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Terms and Conditions */}
                        <div style={styles.terms}>
                            <input
                                type="checkbox"
                                name="agreeTerms"
                                checked={formData.agreeTerms}
                                onChange={handleChange}
                                style={styles.checkbox}
                                required
                            />
                            <span>
                                I agree to the{' '}
                                <Link to="/terms" style={styles.link}>Terms of Service</Link>{' '}
                                and{' '}
                                <Link to="/privacy" style={styles.link}>Privacy Policy</Link>
                            </span>
                        </div>
                    </form>
                )}

                {/* Navigation Buttons */}
                <div style={styles.buttonGroup}>
                    {step > 1 && (
                        <button
                            type="button"
                            onClick={handleBack}
                            style={{...styles.button, ...styles.secondaryButton}}
                        >
                            Back
                        </button>
                    )}
                    
                    {step < 3 ? (
                        <button
                            type="button"
                            onClick={handleNext}
                            style={{...styles.button, ...styles.primaryButton}}
                        >
                            Continue
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            style={{
                                ...styles.button,
                                ...styles.primaryButton,
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? 'Creating Account...' : `Create ${roles.find(r => r.value === role)?.label} Account`}
                        </button>
                    )}
                </div>

                <div style={styles.footer}>
                    <p style={{ color: '#666', marginBottom: '10px' }}>
                        Already have an account?
                    </p>
                    <Link to="/login" style={styles.link}>
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;