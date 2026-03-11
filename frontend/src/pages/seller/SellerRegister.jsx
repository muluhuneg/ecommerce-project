import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';  // Add one more ../

const SellerRegister = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        business_name: '',
        business_address: '',
        business_phone: '',
        business_email: '',
        tax_id: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { registerSeller } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        const result = await registerSeller(formData);
        
        if (result.success) {
            navigate('/seller/dashboard');
        } else {
            setError(result.error);
        }
        
        setLoading(false);
    };

    const styles = {
        container: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: '#f5f5f5',
            padding: '20px'
        },
        card: {
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '2rem',
            width: '100%',
            maxWidth: '600px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        },
        header: {
            textAlign: 'center',
            marginBottom: '2rem'
        },
        errorAlert: {
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '0.75rem 1rem',
            borderRadius: '4px',
            marginBottom: '1rem'
        },
        form: {
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
        },
        formGroup: {
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
        },
        label: {
            fontWeight: '500',
            color: '#333'
        },
        input: {
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '1rem'
        },
        button: {
            backgroundColor: '#1e3c72',
            color: 'white',
            padding: '0.75rem',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer',
            marginTop: '1rem'
        },
        footer: {
            textAlign: 'center',
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid #eee'
        },
        link: {
            color: '#1e3c72',
            textDecoration: 'none',
            fontWeight: '500'
        },
        row: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <h2>Seller Registration</h2>
                    <p>Start selling on our platform</p>
                </div>

                {error && (
                    <div style={styles.errorAlert}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <h3>Personal Information</h3>
                    
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Full Name *</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            style={styles.input}
                            placeholder="John Doe"
                        />
                    </div>

                    <div style={styles.row}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Email *</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                style={styles.input}
                                placeholder="seller@example.com"
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Phone *</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                style={styles.input}
                                placeholder="0912345678"
                            />
                        </div>
                    </div>

                    <div style={styles.row}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Password *</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                style={styles.input}
                                placeholder="••••••••"
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Confirm Password *</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                style={styles.input}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <h3 style={{ marginTop: '1rem' }}>Business Information</h3>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Business Name *</label>
                        <input
                            type="text"
                            name="business_name"
                            value={formData.business_name}
                            onChange={handleChange}
                            required
                            style={styles.input}
                            placeholder="My Store Name"
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Business Address *</label>
                        <textarea
                            name="business_address"
                            value={formData.business_address}
                            onChange={handleChange}
                            required
                            style={{...styles.input, minHeight: '80px'}}
                            placeholder="Full business address"
                        />
                    </div>

                    <div style={styles.row}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Business Phone</label>
                            <input
                                type="tel"
                                name="business_phone"
                                value={formData.business_phone}
                                onChange={handleChange}
                                style={styles.input}
                                placeholder="0912345678"
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Business Email</label>
                            <input
                                type="email"
                                name="business_email"
                                value={formData.business_email}
                                onChange={handleChange}
                                style={styles.input}
                                placeholder="store@example.com"
                            />
                        </div>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Tax ID / License Number</label>
                        <input
                            type="text"
                            name="tax_id"
                            value={formData.tax_id}
                            onChange={handleChange}
                            style={styles.input}
                            placeholder="Optional"
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
                        {loading ? 'Registering...' : 'Register as Seller'}
                    </button>
                </form>

                <div style={styles.footer}>
                    <p>Already have a seller account?</p>
                    <Link to="/seller/login" style={styles.link}>
                        Login here
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SellerRegister;