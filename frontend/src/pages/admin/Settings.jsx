import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import adminApi from '../../services/adminApi';
import { FaSave, FaKey, FaEnvelope, FaCreditCard } from 'react-icons/fa';

const AdminSettings = () => {
    const [settings, setSettings] = useState({
        site_name: 'E-Store',
        site_email: 'admin@estore.com',
        site_phone: '+251912345678',
        site_address: 'Addis Ababa, Ethiopia',
        currency: 'ETB',
        tax_rate: 15,
        shipping_fee: 5.00,
        free_shipping_threshold: 100,
        enable_registration: true,
        enable_reviews: true,
        payment_gateway: 'chapa',
        chapa_public_key: '',
        chapa_secret_key: '',
        smtp_host: '',
        smtp_port: 587,
        smtp_user: '',
        smtp_pass: '',
        maintenance_mode: false
    });
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('general');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const data = await adminApi.getSettings();
            setSettings({...settings, ...data});
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await adminApi.updateSettings(settings);
            alert('Settings saved successfully');
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Failed to save settings');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings({
            ...settings,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const styles = {
        container: {
            display: 'flex',
            backgroundColor: '#f5f5f5',
            minHeight: '100vh'
        },
        mainContent: {
            flex: 1,
            marginLeft: '0',
            padding: '2rem'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem'
        },
        title: {
            fontSize: '2rem',
            color: '#333'
        },
        saveButton: {
            padding: '0.75rem 2rem',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '1rem'
        },
        tabs: {
            display: 'flex',
            gap: '1rem',
            marginBottom: '2rem',
            borderBottom: '2px solid #dee2e6'
        },
        tab: {
            padding: '0.75rem 1.5rem',
            cursor: 'pointer',
            border: 'none',
            background: 'none',
            fontSize: '1rem',
            fontWeight: '500',
            color: '#666',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        activeTab: {
            color: '#3498db',
            borderBottom: '2px solid #3498db'
        },
        card: {
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            maxWidth: '800px'
        },
        formGroup: {
            marginBottom: '1.5rem'
        },
        label: {
            display: 'block',
            marginBottom: '0.5rem',
            color: '#333',
            fontWeight: '500'
        },
        input: {
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '1rem'
        },
        textarea: {
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '1rem',
            minHeight: '100px'
        },
        checkbox: {
            marginRight: '0.5rem',
            width: '18px',
            height: '18px',
            cursor: 'pointer'
        },
        row: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem'
        },
        loadingContainer: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '400px'
        },
        spinner: {
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite'
        }
    };

    if (loading) {
        return (
            <div className="admin-page" style={styles.container}>
                <AdminSidebar />
                <div className="admin-main-content" style={styles.mainContent}>
                    <div style={styles.loadingContainer}>
                        <div style={styles.spinner}></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page" style={styles.container}>
            <AdminSidebar />
            <div className="admin-main-content" style={styles.mainContent}>
                <div style={styles.header}>
                    <h1 style={styles.title}>Settings</h1>
                    <button style={styles.saveButton} onClick={handleSave}>
                        <FaSave /> Save Changes
                    </button>
                </div>

                <div style={styles.tabs}>
                    <button
                        style={{
                            ...styles.tab,
                            ...(activeTab === 'general' ? styles.activeTab : {})
                        }}
                        onClick={() => setActiveTab('general')}
                    >
                        General
                    </button>
                    <button
                        style={{
                            ...styles.tab,
                            ...(activeTab === 'payment' ? styles.activeTab : {})
                        }}
                        onClick={() => setActiveTab('payment')}
                    >
                        <FaCreditCard /> Payment
                    </button>
                    <button
                        style={{
                            ...styles.tab,
                            ...(activeTab === 'email' ? styles.activeTab : {})
                        }}
                        onClick={() => setActiveTab('email')}
                    >
                        <FaEnvelope /> Email
                    </button>
                    <button
                        style={{
                            ...styles.tab,
                            ...(activeTab === 'security' ? styles.activeTab : {})
                        }}
                        onClick={() => setActiveTab('security')}
                    >
                        <FaKey /> Security
                    </button>
                </div>

                <div style={styles.card}>
                    {activeTab === 'general' && (
                        <>
                            <h2 style={{ marginBottom: '1.5rem' }}>General Settings</h2>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Site Name</label>
                                <input
                                    type="text"
                                    name="site_name"
                                    value={settings.site_name}
                                    onChange={handleChange}
                                    style={styles.input}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Site Email</label>
                                <input
                                    type="email"
                                    name="site_email"
                                    value={settings.site_email}
                                    onChange={handleChange}
                                    style={styles.input}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Site Phone</label>
                                <input
                                    type="text"
                                    name="site_phone"
                                    value={settings.site_phone}
                                    onChange={handleChange}
                                    style={styles.input}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Site Address</label>
                                <textarea
                                    name="site_address"
                                    value={settings.site_address}
                                    onChange={handleChange}
                                    style={styles.textarea}
                                />
                            </div>
                            <div style={styles.row}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Currency</label>
                                    <select
                                        name="currency"
                                        value={settings.currency}
                                        onChange={handleChange}
                                        style={styles.input}
                                    >
                                        <option value="ETB">ETB - Ethiopian Birr</option>
                                        <option value="USD">USD - US Dollar</option>
                                    </select>
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Tax Rate (%)</label>
                                    <input
                                        type="number"
                                        name="tax_rate"
                                        value={settings.tax_rate}
                                        onChange={handleChange}
                                        style={styles.input}
                                    />
                                </div>
                            </div>
                            <div style={styles.row}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Shipping Fee ($)</label>
                                    <input
                                        type="number"
                                        name="shipping_fee"
                                        value={settings.shipping_fee}
                                        onChange={handleChange}
                                        style={styles.input}
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Free Shipping Threshold ($)</label>
                                    <input
                                        type="number"
                                        name="free_shipping_threshold"
                                        value={settings.free_shipping_threshold}
                                        onChange={handleChange}
                                        style={styles.input}
                                    />
                                </div>
                            </div>
                            <div style={styles.formGroup}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <input
                                        type="checkbox"
                                        name="enable_registration"
                                        checked={settings.enable_registration}
                                        onChange={handleChange}
                                        style={styles.checkbox}
                                    />
                                    Enable New User Registration
                                </label>
                            </div>
                            <div style={styles.formGroup}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <input
                                        type="checkbox"
                                        name="enable_reviews"
                                        checked={settings.enable_reviews}
                                        onChange={handleChange}
                                        style={styles.checkbox}
                                    />
                                    Enable Product Reviews
                                </label>
                            </div>
                        </>
                    )}

                    {activeTab === 'payment' && (
                        <>
                            <h2 style={{ marginBottom: '1.5rem' }}>Payment Settings</h2>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Payment Gateway</label>
                                <select
                                    name="payment_gateway"
                                    value={settings.payment_gateway}
                                    onChange={handleChange}
                                    style={styles.input}
                                >
                                    <option value="chapa">Chapa</option>
                                    <option value="stripe">Stripe</option>
                                    <option value="paypal">PayPal</option>
                                </select>
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Chapa Public Key</label>
                                <input
                                    type="text"
                                    name="chapa_public_key"
                                    value={settings.chapa_public_key}
                                    onChange={handleChange}
                                    style={styles.input}
                                    placeholder="Enter Chapa public key"
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Chapa Secret Key</label>
                                <input
                                    type="password"
                                    name="chapa_secret_key"
                                    value={settings.chapa_secret_key}
                                    onChange={handleChange}
                                    style={styles.input}
                                    placeholder="Enter Chapa secret key"
                                />
                            </div>
                        </>
                    )}

                    {activeTab === 'email' && (
                        <>
                            <h2 style={{ marginBottom: '1.5rem' }}>Email Settings</h2>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>SMTP Host</label>
                                <input
                                    type="text"
                                    name="smtp_host"
                                    value={settings.smtp_host}
                                    onChange={handleChange}
                                    style={styles.input}
                                    placeholder="smtp.gmail.com"
                                />
                            </div>
                            <div style={styles.row}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>SMTP Port</label>
                                    <input
                                        type="number"
                                        name="smtp_port"
                                        value={settings.smtp_port}
                                        onChange={handleChange}
                                        style={styles.input}
                                    />
                                </div>
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>SMTP Username</label>
                                <input
                                    type="text"
                                    name="smtp_user"
                                    value={settings.smtp_user}
                                    onChange={handleChange}
                                    style={styles.input}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>SMTP Password</label>
                                <input
                                    type="password"
                                    name="smtp_pass"
                                    value={settings.smtp_pass}
                                    onChange={handleChange}
                                    style={styles.input}
                                />
                            </div>
                        </>
                    )}

                    {activeTab === 'security' && (
                        <>
                            <h2 style={{ marginBottom: '1.5rem' }}>Security Settings</h2>
                            <div style={styles.formGroup}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <input
                                        type="checkbox"
                                        name="maintenance_mode"
                                        checked={settings.maintenance_mode}
                                        onChange={handleChange}
                                        style={styles.checkbox}
                                    />
                                    Enable Maintenance Mode
                                </label>
                                <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                    When enabled, only admins can access the site.
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;