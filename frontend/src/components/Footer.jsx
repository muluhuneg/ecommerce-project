import React from 'react';
import { Link } from 'react-router-dom';
import { 
    FaFacebook, 
    FaTwitter, 
    FaInstagram, 
    FaLinkedin, 
    FaYoutube,
    FaMapMarkerAlt,
    FaPhone,
    FaEnvelope,
    FaCreditCard,
    FaPaypal,
    FaApple,
    FaGooglePay,
    FaCcVisa,
    FaCcMastercard,
    FaCcAmex,
    FaTelegram,
    FaTiktok
} from 'react-icons/fa';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const styles = {
        footer: {
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
            marginTop: 'auto',
            padding: '60px 0 20px',
            fontFamily: 'Arial, sans-serif'
        },
        container: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '30px',
            marginBottom: '40px'
        },
        section: {
            marginBottom: '20px'
        },
        sectionTitle: {
            fontSize: '1.2rem',
            fontWeight: 'bold',
            marginBottom: '20px',
            position: 'relative',
            paddingBottom: '10px',
            borderBottom: '2px solid rgba(255,255,255,0.1)'
        },
        logo: {
            fontSize: '2rem',
            fontWeight: 'bold',
            marginBottom: '15px',
            color: 'white',
            textDecoration: 'none',
            display: 'block'
        },
        description: {
            color: 'rgba(255,255,255,0.8)',
            lineHeight: '1.6',
            marginBottom: '20px',
            fontSize: '0.95rem'
        },
        socialLinks: {
            display: 'flex',
            gap: '12px'
        },
        socialIcon: {
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '1.1rem',
            transition: 'all 0.3s',
            cursor: 'pointer'
        },
        linkList: {
            listStyle: 'none',
            padding: 0,
            margin: 0
        },
        linkItem: {
            marginBottom: '12px'
        },
        link: {
            color: 'rgba(255,255,255,0.8)',
            textDecoration: 'none',
            fontSize: '0.95rem',
            transition: 'color 0.3s',
            display: 'inline-block'
        },
        contactInfo: {
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: 'rgba(255,255,255,0.8)',
            fontSize: '0.95rem'
        },
        contactIcon: {
            fontSize: '1.1rem',
            color: '#4facfe'
        },
        paymentMethods: {
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            marginTop: '15px'
        },
        paymentIcon: {
            fontSize: '2rem',
            color: 'rgba(255,255,255,0.8)',
            transition: 'color 0.3s'
        },
        appButtons: {
            display: 'flex',
            gap: '10px',
            marginTop: '15px',
            flexWrap: 'wrap'
        },
        appButton: {
            background: 'rgba(255,255,255,0.1)',
            padding: '8px 15px',
            borderRadius: '5px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'white',
            textDecoration: 'none',
            fontSize: '0.9rem',
            transition: 'background 0.3s'
        },
        newsletter: {
            marginTop: '20px'
        },
        newsletterInput: {
            width: '100%',
            padding: '12px',
            border: 'none',
            borderRadius: '5px',
            marginBottom: '10px',
            fontSize: '0.95rem'
        },
        newsletterButton: {
            width: '100%',
            padding: '12px',
            background: '#4facfe',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: '600',
            transition: 'background 0.3s'
        },
        bottomBar: {
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: '20px',
            marginTop: '40px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '15px'
        },
        copyright: {
            color: 'rgba(255,255,255,0.6)',
            fontSize: '0.9rem'
        },
        bottomLinks: {
            display: 'flex',
            gap: '20px',
            flexWrap: 'wrap'
        },
        bottomLink: {
            color: 'rgba(255,255,255,0.6)',
            textDecoration: 'none',
            fontSize: '0.9rem',
            transition: 'color 0.3s'
        }
    };

    return (
        <footer style={styles.footer}>
            <div style={styles.container}>
                {/* Main Footer Grid */}
                <div style={styles.grid}>
                    {/* Company Info */}
                    <div style={styles.section}>
                        <Link to="/" style={styles.logo}>
                            E-Store
                        </Link>
                        <p style={styles.description}>
                            Your premier online shopping destination in Ethiopia. 
                            Discover amazing products at the best prices with fast 
                            delivery and secure payments.
                        </p>
                        <div style={styles.socialLinks}>
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={styles.socialIcon}>
                                <FaFacebook />
                            </a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={styles.socialIcon}>
                                <FaTwitter />
                            </a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={styles.socialIcon}>
                                <FaInstagram />
                            </a>
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" style={styles.socialIcon}>
                                <FaLinkedin />
                            </a>
                            <a href="https://t.me" target="_blank" rel="noopener noreferrer" style={styles.socialIcon}>
                                <FaTelegram />
                            </a>
                            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" style={styles.socialIcon}>
                                <FaTiktok />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>Quick Links</h3>
                        <ul style={styles.linkList}>
                            <li style={styles.linkItem}>
                                <Link to="/" style={styles.link}>Home</Link>
                            </li>
                            <li style={styles.linkItem}>
                                <Link to="/products" style={styles.link}>Products</Link>
                            </li>
                            <li style={styles.linkItem}>
                                <Link to="/about" style={styles.link}>About Us</Link>
                            </li>
                            <li style={styles.linkItem}>
                                <Link to="/contact" style={styles.link}>Contact Us</Link>
                            </li>
                            <li style={styles.linkItem}>
                                <Link to="/faq" style={styles.link}>FAQ</Link>
                            </li>
                            <li style={styles.linkItem}>
                                <Link to="/blog" style={styles.link}>Blog</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>Customer Service</h3>
                        <ul style={styles.linkList}>
                            <li style={styles.linkItem}>
                                <Link to="/track-order" style={styles.link}>Track Order</Link>
                            </li>
                            <li style={styles.linkItem}>
                                <Link to="/returns" style={styles.link}>Returns & Exchanges</Link>
                            </li>
                            <li style={styles.linkItem}>
                                <Link to="/shipping" style={styles.link}>Shipping Info</Link>
                            </li>
                            <li style={styles.linkItem}>
                                <Link to="/privacy" style={styles.link}>Privacy Policy</Link>
                            </li>
                            <li style={styles.linkItem}>
                                <Link to="/terms" style={styles.link}>Terms of Service</Link>
                            </li>
                            <li style={styles.linkItem}>
                                <Link to="/sitemap" style={styles.link}>Sitemap</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact & Newsletter */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>Contact Us</h3>
                        <div style={styles.contactInfo}>
                            <FaMapMarkerAlt style={styles.contactIcon} />
                            <span>Addis Ababa, Ethiopia</span>
                        </div>
                        <div style={styles.contactInfo}>
                            <FaPhone style={styles.contactIcon} />
                            <span>+251 912 345 678</span>
                        </div>
                        <div style={styles.contactInfo}>
                            <FaEnvelope style={styles.contactIcon} />
                            <span>support@estore.com</span>
                        </div>

                        {/* Payment Methods */}
                        <h3 style={{...styles.sectionTitle, marginTop: '20px'}}>Payment Methods</h3>
                        <div style={styles.paymentMethods}>
                            <FaCcVisa style={styles.paymentIcon} />
                            <FaCcMastercard style={styles.paymentIcon} />
                            <FaCcAmex style={styles.paymentIcon} />
                            <FaPaypal style={styles.paymentIcon} />
                            <FaApple style={styles.paymentIcon} />
                            <FaGooglePay style={styles.paymentIcon} />
                        </div>

                        {/* Mobile App */}
                        <h3 style={{...styles.sectionTitle, marginTop: '20px'}}>Download Our App</h3>
                        <div style={styles.appButtons}>
                            <a href="#" style={styles.appButton}>
                                <FaApple /> App Store
                            </a>
                            <a href="#" style={styles.appButton}>
                                <FaGooglePay /> Play Store
                            </a>
                        </div>
                    </div>
                </div>

                {/* Newsletter Subscription */}
                <div style={styles.newsletter}>
                    <h3 style={styles.sectionTitle}>Subscribe to Our Newsletter</h3>
                    <p style={{color: 'rgba(255,255,255,0.8)', marginBottom: '15px'}}>
                        Get the latest updates on new products and upcoming sales
                    </p>
                    <div style={{display: 'flex', gap: '10px', maxWidth: '500px'}}>
                        <input 
                            type="email" 
                            placeholder="Your email address" 
                            style={styles.newsletterInput}
                        />
                        <button style={styles.newsletterButton}>
                            Subscribe
                        </button>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div style={styles.bottomBar}>
                    <div style={styles.copyright}>
                        © {currentYear} E-Store. All rights reserved.
                    </div>
                    <div style={styles.bottomLinks}>
                        <Link to="/privacy" style={styles.bottomLink}>Privacy Policy</Link>
                        <Link to="/terms" style={styles.bottomLink}>Terms of Service</Link>
                        <Link to="/cookies" style={styles.bottomLink}>Cookie Policy</Link>
                        <Link to="/accessibility" style={styles.bottomLink}>Accessibility</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;