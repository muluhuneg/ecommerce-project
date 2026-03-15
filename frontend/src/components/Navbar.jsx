import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import NotificationBell from './NotificationBell';
import { 
    FaShoppingCart, 
    FaUser, 
    FaSignOutAlt, 
    FaTachometerAlt,
    FaStore,
    FaHeart,
    FaBox,
    FaClipboardList,
    FaHome,
    FaTag,
    FaSearch,
    FaTimes,
    FaGem,
    FaCrown,
    FaStar,
    FaBolt,
    FaFire,
    FaMoon,
    FaSun,
    FaBell,
    FaGift,
    FaRocket,
    FaMagic,
    FaBars
} from 'react-icons/fa';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { cartCount } = useCart();
    const { wishlistCount } = useWishlist();
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Detect scroll for navbar effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsDropdownOpen(false);
    }, [location]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsMobileMenuOpen(false);
        setIsDropdownOpen(false);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
            setSearchTerm('');
            setIsSearchOpen(false);
            setIsMobileMenuOpen(false);
        }
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
        if (isSearchOpen) setIsSearchOpen(false);
    };

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
        document.body.style.backgroundColor = !isDarkMode ? '#1a1a2e' : '#f5f5f5';
    };

    // Logo component
    const Logo = () => (
        <Link to="/" style={styles.logoLink}>
            <div style={styles.logoContainer}>
                <div style={styles.logoIconWrapper}>
                    <div style={styles.logoIcon}>
                        <FaBolt style={styles.logoLightning} />
                        <FaStar style={styles.logoStar1} />
                        <FaStar style={styles.logoStar2} />
                    </div>
                </div>
                <div style={styles.logoTextWrapper}>
                    <span style={styles.logoMain}>E-Store</span>
                    <span style={styles.logoBadge}>PRO</span>
                </div>
            </div>
        </Link>
    );

    // Desktop NavLink
    const NavLink = ({ to, icon, children }) => {
        const isActive = location.pathname === to;
        return (
            <Link 
                to={to} 
                style={{
                    ...styles.navLink,
                    background: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                }}
                className="nav-link"
            >
                <span style={styles.navLinkIcon}>{icon}</span>
                <span style={styles.navLinkText}>{children}</span>
                {isActive && <span style={styles.navLinkActive}></span>}
            </Link>
        );
    };

    // Mobile NavLink
    const MobileNavLink = ({ to, icon, children }) => {
        const isActive = location.pathname === to;
        return (
            <Link 
                to={to} 
                style={{
                    ...styles.mobileNavLink,
                    background: isActive ? 'rgba(255,215,0,0.2)' : 'transparent',
                }}
                onClick={() => setIsMobileMenuOpen(false)}
            >
                <span style={styles.mobileNavIcon}>{icon}</span>
                <span style={styles.mobileNavText}>{children}</span>
            </Link>
        );
    };

    // Shiny button
    const ShinyButton = ({ to, children, primary = false, icon }) => (
        <Link 
            to={to} 
            style={{
                ...styles.shinyButton,
                ...(primary ? styles.shinyButtonPrimary : {})
            }}
            className="shiny-button"
        >
            {icon && <span style={styles.buttonIcon}>{icon}</span>}
            <span>{children}</span>
        </Link>
    );

    const styles = {
        navbar: {
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            background: isScrolled 
                ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 30%, #ff6b6b 70%, #ffd93d 100%)',
            padding: isScrolled ? '0.8rem 2rem' : '1.2rem 2rem',
            boxShadow: isScrolled ? '0 10px 30px rgba(0,0,0,0.3)' : '0 15px 35px rgba(0,0,0,0.2)',
            transition: 'all 0.4s ease',
            borderBottom: '2px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
        },
        container: {
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative'
        },
        // Logo styles
        logoLink: {
            textDecoration: 'none',
            display: 'block',
            position: 'relative',
            zIndex: 1002
        },
        logoContainer: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
        },
        logoIconWrapper: {
            position: 'relative',
            animation: 'float 3s ease-in-out infinite'
        },
        logoIcon: {
            position: 'relative',
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #FFD700, #FFA500, #FF6B6B)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'rotate(5deg)',
            boxShadow: '0 10px 20px rgba(255,215,0,0.4)',
            overflow: 'hidden'
        },
        logoLightning: {
            color: '#1a1a2e',
            fontSize: '1.4rem',
            animation: 'pulse 2s ease-in-out infinite'
        },
        logoStar1: {
            position: 'absolute',
            top: '3px',
            right: '3px',
            color: '#fff',
            fontSize: '0.6rem',
            animation: 'spin 3s linear infinite'
        },
        logoStar2: {
            position: 'absolute',
            bottom: '3px',
            left: '3px',
            color: '#fff',
            fontSize: '0.6rem',
            animation: 'spin 4s linear infinite reverse'
        },
        logoTextWrapper: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start'
        },
        logoMain: {
            fontSize: '1.5rem',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #fff, #FFD700, #FFA500)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '2px',
            lineHeight: '1'
        },
        logoBadge: {
            background: 'linear-gradient(135deg, #FFD700, #FF6B6B)',
            color: '#1a1a2e',
            fontSize: '0.55rem',
            fontWeight: 'bold',
            padding: '2px 6px',
            borderRadius: '10px',
            marginTop: '2px',
            textTransform: 'uppercase',
            boxShadow: '0 2px 10px rgba(255,215,0,0.5)',
            animation: 'pulse 2s infinite'
        },
        // Desktop Navigation
        desktopNav: {
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            flex: 1,
            justifyContent: 'flex-end',
            '@media (max-width: 1024px)': {
                display: 'none'
            }
        },
        desktopNavLinks: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginRight: '1rem'
        },
        desktopActions: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem'
        },
        // Mobile Navigation
        mobileNav: {
            display: 'none',
            alignItems: 'center',
            gap: '0.5rem',
            '@media (max-width: 1024px)': {
                display: 'flex'
            }
        },
        hamburgerButton: {
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,215,0,0.3)',
            color: 'white',
            width: '45px',
            height: '45px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            transition: 'all 0.3s ease',
            zIndex: 1002
        },
        // Mobile Menu Overlay - FIXED: Appears OVER content
        mobileMenuOverlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9998,
            display: isMobileMenuOpen ? 'block' : 'none',
            animation: 'fadeIn 0.3s ease',
            backdropFilter: 'blur(5px)',
        },
        // Mobile Menu - FIXED: Appears OVER content
        mobileMenu: {
            position: 'fixed',
            top: 0,
            right: 0,
            width: '85%',
            maxWidth: '400px',
            height: '100vh',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            zIndex: 9999,
            padding: '80px 20px 30px',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.3s ease-in-out',
            boxShadow: '-5px 0 20px rgba(0,0,0,0.3)',
        },
        mobileMenuHeader: {
            position: 'absolute',
            top: '20px',
            left: '20px',
            right: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(255,215,0,0.2)',
            paddingBottom: '15px'
        },
        mobileUserInfo: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        },
        mobileUserAvatar: {
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FFD700, #FFA500, #FF6B6B)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: '#1a1a2e'
        },
        mobileUserDetails: {
            display: 'flex',
            flexDirection: 'column'
        },
        mobileUserName: {
            color: 'white',
            fontWeight: '600',
            fontSize: '1rem'
        },
        mobileUserEmail: {
            color: 'rgba(255,255,255,0.7)',
            fontSize: '0.8rem'
        },
        closeButton: {
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: 'white',
            width: '35px',
            height: '35px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '1.2rem'
        },
        mobileMenuContent: {
            marginTop: '20px'
        },
        mobileNavLinks: {
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            marginBottom: '2rem'
        },
        mobileNavLink: {
            color: 'white',
            textDecoration: 'none',
            fontSize: '1.1rem',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem 1.5rem',
            borderRadius: '12px',
            transition: 'all 0.3s ease',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)'
        },
        mobileNavIcon: {
            fontSize: '1.2rem',
            color: '#FFD700',
            width: '24px'
        },
        mobileNavText: {
            flex: 1
        },
        mobileSection: {
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
            padding: '1rem',
            marginTop: '1rem'
        },
        mobileSectionTitle: {
            color: '#FFD700',
            fontSize: '0.9rem',
            fontWeight: '600',
            marginBottom: '0.5rem',
            paddingLeft: '0.5rem',
            textTransform: 'uppercase',
            letterSpacing: '1px'
        },
        mobileAuthButtons: {
            display: 'flex',
            flexDirection: 'column',
            gap: '0.8rem',
            marginTop: '1rem'
        },
        mobileButton: {
            padding: '1rem',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(255,255,255,0.1)',
            color: 'white',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontSize: '1rem',
            fontWeight: '600'
        },
        mobileButtonPrimary: {
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            border: 'none',
            color: '#1a1a2e'
        },
        // Desktop nav link
        navLink: {
            color: 'white',
            textDecoration: 'none',
            fontSize: '0.95rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            borderRadius: '30px',
            transition: 'all 0.3s ease',
            position: 'relative',
            whiteSpace: 'nowrap'
        },
        navLinkIcon: {
            fontSize: '1rem',
            color: '#FFD700',
        },
        navLinkText: {
            background: 'linear-gradient(135deg, #fff, #f0f0f0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: '600'
        },
        navLinkActive: {
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80%',
            height: '3px',
            background: 'linear-gradient(90deg, #FFD700, #FF6B6B)',
            borderRadius: '3px 3px 0 0',
            animation: 'slideIn 0.3s ease'
        },
        // Search button
        searchButton: {
            background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))',
            border: '1px solid rgba(255,255,255,0.3)',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '30px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.95rem',
            fontWeight: '600',
            whiteSpace: 'nowrap'
        },
        searchContainer: {
            position: 'absolute',
            top: 'calc(100% + 15px)',
            right: '60px',
            background: 'rgba(26, 26, 46, 0.98)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            display: isSearchOpen ? 'block' : 'none',
            zIndex: 1001,
            width: '300px',
            border: '2px solid rgba(255,215,0,0.3)',
        },
        searchForm: {
            display: 'flex',
            gap: '10px'
        },
        searchInput: {
            flex: 1,
            padding: '12px',
            border: '2px solid rgba(255,215,0,0.3)',
            borderRadius: '12px',
            fontSize: '1rem',
            background: 'rgba(255,255,255,0.1)',
            color: 'white',
            outline: 'none',
        },
        searchSubmit: {
            padding: '12px 15px',
            background: 'linear-gradient(135deg, #667eea, #764ba2, #ff6b6b)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem'
        },
        closeSearch: {
            padding: '12px',
            background: 'rgba(255,255,255,0.1)',
            color: 'white',
            border: '2px solid rgba(255,255,255,0.2)',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        // Cart link
        cartLink: {
            position: 'relative',
            color: 'white',
            textDecoration: 'none',
            fontSize: '0.95rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            borderRadius: '30px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))',
            border: '1px solid rgba(255,215,0,0.3)',
            whiteSpace: 'nowrap'
        },
        cartBadge: {
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            background: 'linear-gradient(135deg, #ff6b6b, #ff4757, #ff0000)',
            color: 'white',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            fontSize: '0.7rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            border: '2px solid white',
            animation: 'pulse 2s infinite',
        },
        // Dark mode toggle
        darkModeToggle: {
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,215,0,0.3)',
            color: 'white',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
        },
        // Auth buttons
        authButtons: {
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center'
        },
        shinyButton: {
            padding: '0.5rem 1.2rem',
            borderRadius: '30px',
            border: '1px solid rgba(255,255,255,0.3)',
            background: 'rgba(255,255,255,0.15)',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: '600',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        shinyButtonPrimary: {
            background: 'linear-gradient(135deg, #FFD700, #FFA500, #FF6B6B)',
            border: 'none',
            color: '#1a1a2e',
            boxShadow: '0 5px 20px rgba(255,215,0,0.5)'
        },
        buttonIcon: {
            fontSize: '1rem',
            color: '#1a1a2e'
        },
        // User menu dropdown
        userMenu: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            position: 'relative',
            cursor: 'pointer'
        },
        userName: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            padding: '0.3rem 1rem 0.3rem 0.5rem',
            borderRadius: '30px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))',
            border: '1px solid rgba(255,215,0,0.3)',
        },
        userAvatar: {
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FFD700, #FFA500, #FF6B6B)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem',
            fontWeight: 'bold',
            color: '#1a1a2e',
            animation: 'pulse 2s infinite'
        },
        userNameText: {
            maxWidth: '120px',
            color: 'white',
            fontWeight: '600',
            fontSize: '0.9rem',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        },
        dropdown: {
            position: 'absolute',
            top: 'calc(100% + 15px)',
            right: 0,
            background: 'rgba(26, 26, 46, 0.98)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            display: isDropdownOpen ? 'block' : 'none',
            minWidth: '280px',
            zIndex: 1000,
            overflow: 'hidden',
            border: '2px solid rgba(255,215,0,0.3)',
        },
        dropdownHeader: {
            padding: '1.5rem',
            background: 'linear-gradient(135deg, #667eea, #764ba2, #ff6b6b)',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
        },
        dropdownUserInfo: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
        },
        dropdownAvatar: {
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#1a1a2e',
            border: '2px solid white'
        },
        dropdownUserDetails: {
            flex: 1
        },
        dropdownUserName: {
            fontWeight: 'bold',
            fontSize: '1.1rem',
            color: 'white',
            marginBottom: '4px'
        },
        dropdownUserEmail: {
            fontSize: '0.8rem',
            color: 'rgba(255,255,255,0.8)'
        },
        dropdownItem: {
            padding: '0.9rem 1.2rem',
            color: 'white',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            transition: 'all 0.3s',
            border: 'none',
            background: 'none',
            width: '100%',
            cursor: 'pointer',
            fontSize: '0.95rem',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
        },
        dropdownIcon: {
            color: '#FFD700',
            width: '18px',
            fontSize: '1.1rem'
        },
        dropdownDivider: {
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.3), transparent)',
            margin: '0.5rem 0'
        },
        roleBadge: {
            fontSize: '0.7rem',
            padding: '2px 8px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            color: '#1a1a2e',
            marginLeft: 'auto',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
        },
        countBadge: {
            fontSize: '0.7rem',
            padding: '2px 6px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #ff6b6b, #ff4757)',
            color: 'white',
            marginLeft: 'auto'
        }
    };

    // Add animations
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideIn {
                from { transform: translateX(-100%); }
                to { transform: translateX(0); }
            }
            
            @keyframes slideInRight {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
            }
            
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
            
            @keyframes float {
                0% { transform: translateY(0px) rotate(5deg); }
                50% { transform: translateY(-5px) rotate(5deg); }
                100% { transform: translateY(0px) rotate(5deg); }
            }
            
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            
            .nav-link:hover {
                background: rgba(255,255,255,0.15) !important;
                transform: translateY(-2px);
            }
            
            .shiny-button:hover {
                transform: translateY(-2px) scale(1.02);
                box-shadow: 0 10px 20px rgba(255,215,0,0.3);
            }
            
            .dropdown-item:hover {
                background: rgba(255,215,0,0.15);
                padding-left: 1.8rem;
            }
            
            .cart-link:hover {
                background: linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.2));
                transform: translateY(-2px);
            }
            
            .mobile-nav-link:hover {
                background: rgba(255,215,0,0.15) !important;
                transform: translateX(5px);
            }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    return (
        <nav style={styles.navbar}>
            <div style={styles.container}>
                <Logo />

                {/* Desktop Navigation */}
                <div style={styles.desktopNav}>
                    <div style={styles.desktopNavLinks}>
                        <NavLink to="/" icon={<FaHome />}>Home</NavLink>
                        <NavLink to="/products" icon={<FaTag />}>Products</NavLink>
                    </div>

                    <div style={styles.desktopActions}>
                        <button 
                            style={styles.searchButton} 
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                        >
                            <FaSearch /> Search
                        </button>

                        {isSearchOpen && (
                            <div style={styles.searchContainer}>
                                <form onSubmit={handleSearch} style={styles.searchForm}>
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={styles.searchInput}
                                        autoFocus
                                    />
                                    <button type="submit" style={styles.searchSubmit}>
                                        <FaSearch />
                                    </button>
                                    <button type="button" style={styles.closeSearch} onClick={() => setIsSearchOpen(false)}>
                                        <FaTimes />
                                    </button>
                                </form>
                            </div>
                        )}
                        
                        <button 
                            style={styles.darkModeToggle}
                            onClick={toggleDarkMode}
                        >
                            {isDarkMode ? <FaSun /> : <FaMoon />}
                        </button>
                        
                        {user && <NotificationBell />}
                        
                        <Link to="/cart" style={styles.cartLink}>
                            <FaShoppingCart size={18} />
                            Cart
                            {cartCount > 0 && (
                                <span style={styles.cartBadge}>{cartCount}</span>
                            )}
                        </Link>
                        
                        {user ? (
                            <div 
                                style={styles.userMenu}
                                className="user-menu"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            >
                                <div style={styles.userName}>
                                    <div style={styles.userAvatar}>
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <span style={styles.userNameText}>{user.name}</span>
                                </div>
                                
                                {isDropdownOpen && (
                                    <div style={styles.dropdown}>
                                        <div style={styles.dropdownHeader}>
                                            <div style={styles.dropdownUserInfo}>
                                                <div style={styles.dropdownAvatar}>
                                                    {user.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div style={styles.dropdownUserDetails}>
                                                    <div style={styles.dropdownUserName}>
                                                        {user.name || 'User'}
                                                    </div>
                                                    <div style={styles.dropdownUserEmail}>
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {user.role === 'seller' && (
                                            <>
                                                <Link to="/seller/dashboard" style={styles.dropdownItem}>
                                                    <FaTachometerAlt style={styles.dropdownIcon} />
                                                    Seller Dashboard
                                                    <span style={styles.roleBadge}>Seller</span>
                                                </Link>
                                                <Link to="/seller/products" style={styles.dropdownItem}>
                                                    <FaBox style={styles.dropdownIcon} />
                                                    My Products
                                                </Link>
                                                <Link to="/seller/orders" style={styles.dropdownItem}>
                                                    <FaClipboardList style={styles.dropdownIcon} />
                                                    Orders
                                                </Link>
                                            </>
                                        )}
                                        
                                        {user.role === 'admin' && (
                                            <>
                                                <Link to="/admin/dashboard" style={styles.dropdownItem}>
                                                    <FaTachometerAlt style={styles.dropdownIcon} />
                                                    Admin Dashboard
                                                    <span style={styles.roleBadge}>Admin</span>
                                                </Link>
                                                <Link to="/admin/users" style={styles.dropdownItem}>
                                                    <FaUser style={styles.dropdownIcon} />
                                                    Users
                                                </Link>
                                                <Link to="/admin/products" style={styles.dropdownItem}>
                                                    <FaBox style={styles.dropdownIcon} />
                                                    Products
                                                </Link>
                                            </>
                                        )}
                                        
                                        {user.role === 'customer' && (
                                            <>
                                                <Link to="/profile" style={styles.dropdownItem}>
                                                    <FaUser style={styles.dropdownIcon} />
                                                    My Profile
                                                </Link>
                                                <Link to="/orders" style={styles.dropdownItem}>
                                                    <FaClipboardList style={styles.dropdownIcon} />
                                                    My Orders
                                                </Link>
                                                <Link to="/wishlist" style={styles.dropdownItem}>
                                                    <FaHeart style={styles.dropdownIcon} />
                                                    Wishlist 
                                                    {wishlistCount > 0 && (
                                                        <span style={styles.countBadge}>{wishlistCount}</span>
                                                    )}
                                                </Link>
                                            </>
                                        )}
                                        
                                        <div style={styles.dropdownDivider}></div>
                                        
                                        <Link to="/notifications" style={styles.dropdownItem}>
                                            <FaBell style={styles.dropdownIcon} />
                                            Notifications
                                        </Link>
                                        
                                        <Link to="/cart" style={styles.dropdownItem}>
                                            <FaShoppingCart style={styles.dropdownIcon} />
                                            Cart 
                                            {cartCount > 0 && (
                                                <span style={styles.countBadge}>{cartCount}</span>
                                            )}
                                        </Link>
                                        
                                        <button onClick={handleLogout} style={styles.dropdownItem}>
                                            <FaSignOutAlt style={styles.dropdownIcon} />
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={styles.authButtons}>
                                <ShinyButton to="/login" icon={<FaUser />}>Login</ShinyButton>
                                <ShinyButton to="/register" primary={true} icon={<FaGift />}>Register</ShinyButton>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div style={styles.mobileNav}>
                    <Link to="/cart" style={{...styles.cartLink, padding: '0.5rem'}}>
                        <FaShoppingCart size={18} />
                        {cartCount > 0 && (
                            <span style={{...styles.cartBadge, top: '-5px', right: '-5px'}}>{cartCount}</span>
                        )}
                    </Link>

                    <button 
                        style={{...styles.darkModeToggle, width: '40px', height: '40px'}}
                        onClick={toggleDarkMode}
                    >
                        {isDarkMode ? <FaSun /> : <FaMoon />}
                    </button>

                    <button 
                        style={styles.hamburgerButton}
                        onClick={toggleMobileMenu}
                    >
                        {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
                    </button>
                </div>

                {/* Mobile Menu Overlay - Appears OVER homepage content */}
                {isMobileMenuOpen && (
                    <div style={styles.mobileMenuOverlay} onClick={() => setIsMobileMenuOpen(false)} />
                )}

                {/* Mobile Menu - Slides in from right OVER content */}
                <div style={styles.mobileMenu}>
                    <div style={styles.mobileMenuHeader}>
                        {user ? (
                            <div style={styles.mobileUserInfo}>
                                <div style={styles.mobileUserAvatar}>
                                    {user.name?.charAt(0).toUpperCase()}
                                </div>
                                <div style={styles.mobileUserDetails}>
                                    <span style={styles.mobileUserName}>{user.name}</span>
                                    <span style={styles.mobileUserEmail}>{user.email}</span>
                                </div>
                            </div>
                        ) : (
                            <div style={styles.mobileUserInfo}>
                                <div style={styles.mobileUserAvatar}>
                                    <FaUser />
                                </div>
                                <div style={styles.mobileUserDetails}>
                                    <span style={styles.mobileUserName}>Guest</span>
                                    <span style={styles.mobileUserEmail}>Sign in to continue</span>
                                </div>
                            </div>
                        )}
                        <button style={styles.closeButton} onClick={() => setIsMobileMenuOpen(false)}>
                            <FaTimes />
                        </button>
                    </div>

                    <div style={styles.mobileMenuContent}>
                        {/* Search Bar */}
                        <form onSubmit={handleSearch} style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        flex: 1,
                                        padding: '0.8rem',
                                        border: '2px solid rgba(255,215,0,0.3)',
                                        borderRadius: '8px',
                                        fontSize: '0.95rem',
                                        background: 'rgba(255,255,255,0.1)',
                                        color: 'white',
                                        outline: 'none'
                                    }}
                                />
                                <button 
                                    type="submit"
                                    style={{
                                        padding: '0.8rem 1rem',
                                        background: 'linear-gradient(135deg, #667eea, #764ba2, #ff6b6b)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <FaSearch />
                                </button>
                            </div>
                        </form>

                        {/* Navigation Links */}
                        <div style={styles.mobileNavLinks}>
                            <MobileNavLink to="/" icon={<FaHome />}>Home</MobileNavLink>
                            <MobileNavLink to="/products" icon={<FaTag />}>Products</MobileNavLink>
                        </div>

                        {user ? (
                            <>
                                {/* Role-based sections */}
                                {user.role === 'seller' && (
                                    <div style={styles.mobileSection}>
                                        <div style={styles.mobileSectionTitle}>Seller Panel</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <MobileNavLink to="/seller/dashboard" icon={<FaTachometerAlt />}>Dashboard</MobileNavLink>
                                            <MobileNavLink to="/seller/products" icon={<FaBox />}>My Products</MobileNavLink>
                                            <MobileNavLink to="/seller/orders" icon={<FaClipboardList />}>Orders</MobileNavLink>
                                        </div>
                                    </div>
                                )}
                                
                                {user.role === 'admin' && (
                                    <div style={styles.mobileSection}>
                                        <div style={styles.mobileSectionTitle}>Admin Panel</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <MobileNavLink to="/admin/dashboard" icon={<FaTachometerAlt />}>Dashboard</MobileNavLink>
                                            <MobileNavLink to="/admin/users" icon={<FaUser />}>Users</MobileNavLink>
                                            <MobileNavLink to="/admin/products" icon={<FaBox />}>Products</MobileNavLink>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Common links for logged in users */}
                                <div style={styles.mobileSection}>
                                    <div style={styles.mobileSectionTitle}>Account</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <MobileNavLink to="/profile" icon={<FaUser />}>My Profile</MobileNavLink>
                                        <MobileNavLink to="/orders" icon={<FaClipboardList />}>My Orders</MobileNavLink>
                                        <MobileNavLink to="/wishlist" icon={<FaHeart />}>
                                            Wishlist
                                            {wishlistCount > 0 && (
                                                <span style={{ ...styles.countBadge, marginLeft: 'auto' }}>{wishlistCount}</span>
                                            )}
                                        </MobileNavLink>
                                        <MobileNavLink to="/notifications" icon={<FaBell />}>Notifications</MobileNavLink>
                                        <MobileNavLink to="/cart" icon={<FaShoppingCart />}>
                                            Cart
                                            {cartCount > 0 && (
                                                <span style={{ ...styles.countBadge, marginLeft: 'auto' }}>{cartCount}</span>
                                            )}
                                        </MobileNavLink>
                                    </div>
                                </div>

                                <button 
                                    onClick={handleLogout}
                                    style={{ ...styles.mobileButton, width: '100%', marginTop: '1rem' }}
                                >
                                    <FaSignOutAlt /> Logout
                                </button>
                            </>
                        ) : (
                            <div style={styles.mobileAuthButtons}>
                                <Link to="/login" style={styles.mobileButton} onClick={() => setIsMobileMenuOpen(false)}>
                                    <FaUser /> Login
                                </Link>
                                <Link to="/register" style={{...styles.mobileButton, ...styles.mobileButtonPrimary}} onClick={() => setIsMobileMenuOpen(false)}>
                                    <FaGift /> Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;