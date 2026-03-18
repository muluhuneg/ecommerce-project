import React from 'react';
import { Link } from 'react-router-dom';
import {
    FaMapMarkerAlt,
    FaPhone,
    FaEnvelope,
} from 'react-icons/fa';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const styles = {
        footer: {
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
            marginTop: 'auto',
            padding: '50px 0 20px',
            fontFamily: 'Arial, sans-serif',
        },
        container: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px',
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '30px',
            marginBottom: '30px',
        },
        section: {
            marginBottom: '20px',
        },
        sectionTitle: {
            fontSize: '1.1rem',
            fontWeight: '700',
            marginBottom: '16px',
            borderBottom: '2px solid rgba(255,255,255,0.15)',
            paddingBottom: '8px',
        },
        logo: {
            fontSize: '1.8rem',
            fontWeight: 'bold',
            marginBottom: '12px',
            color: 'white',
            textDecoration: 'none',
            display: 'block',
        },
        description: {
            color: 'rgba(255,255,255,0.9)',
            lineHeight: '1.5',
            fontSize: '0.95rem',
        },
        linkList: {
            listStyle: 'none',
            padding: 0,
            margin: 0,
        },
        linkItem: {
            marginBottom: '10px',
        },
        link: {
            color: 'rgba(255,255,255,0.85)',
            textDecoration: 'none',
            fontSize: '0.95rem',
            transition: 'color 0.2s',
        },
        contactInfo: {
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'rgba(255,255,255,0.85)',
            fontSize: '0.95rem',
        },
        contactIcon: {
            fontSize: '1.05rem',
            color: '#4facfe',
        },
        newsletter: {
            marginTop: '25px',
        },
        newsletterInput: {
            width: '100%',
            padding: '10px',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '5px',
            marginBottom: '10px',
            fontSize: '0.95rem',
            background: 'rgba(255,255,255,0.08)',
            color: 'white',
        },
        newsletterButton: {
            width: '100%',
            padding: '10px',
            background: '#4facfe',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: '600',
        },
        bottomBar: {
            borderTop: '1px solid rgba(255,255,255,0.15)',
            paddingTop: '18px',
            marginTop: '25px',
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
        },
        copyright: {
            color: 'rgba(255,255,255,0.7)',
            fontSize: '0.85rem',
        },
        bottomLinks: {
            display: 'flex',
            gap: '15px',
            flexWrap: 'wrap',
        },
        bottomLink: {
            color: 'rgba(255,255,255,0.7)',
            textDecoration: 'none',
            fontSize: '0.85rem',
        },
    };

    return (
        <footer style={styles.footer}>
            <div style={styles.container}>
                <div style={styles.grid}>
                    <div style={styles.section}>
                        <Link to="/" style={styles.logo}>
                            E-Store
                        </Link>
                        <p style={styles.description}>
                             online shopping destination in Ethiopia.
                            Find top products at great prices with fast, secure service.
                        </p>
                    </div>

                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>Quick Links</h3>
                        <ul style={styles.linkList}>
                            <li style={styles.linkItem}>
                                <Link to="/" style={styles.link}>Home</Link>
                            </li>
                            <li style={styles.linkItem}>
                                <Link to="/products" style={styles.link}>Products</Link>
                            </li>
                           
                            
                        </ul>
                    </div>

                    
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>Contact Us</h3>
                        <div style={styles.contactInfo}>
                            <FaMapMarkerAlt style={styles.contactIcon} />
                            <span>Bahir Dar, Ethiopia</span>
                        </div>
                        <div style={styles.contactInfo}>
                            <FaPhone style={styles.contactIcon} />
                            <span>+251 924 473 940</span>
                        </div>
                        <div style={styles.contactInfo}>
                            <FaEnvelope style={styles.contactIcon} />
                            <span>support@estore.com</span>
                        </div>
                    </div>
                </div>

                <div style={styles.newsletter}>
                    <h3 style={styles.sectionTitle}>Subscribe to Our Newsletter</h3>
                    <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '12px' }}>
                        Get updates about new arrivals and exclusive offers.
                    </p>
                    <div style={{ display: 'flex', gap: '10px', maxWidth: '500px' }}>
                        <input
                            type="email"
                            placeholder="Your email address"
                            style={styles.newsletterInput}
                        />
                        <button style={styles.newsletterButton}>Subscribe</button>
                    </div>
                </div>

                <div style={styles.bottomBar}>
                    <div style={styles.copyright}>
                        © {currentYear} E-Store. All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;