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
    const [activeLink, setActiveLink] = useState('/');
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

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.user-menu')) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            document.body.style.height = '100%';
            document.body.style.top = '0';
            document.body.style.left = '0';
            document.body.classList.add('mobile-menu-open');
        } else {
            document.body.style.overflow = 'unset';
            document.body.style.position = 'relative';
            document.body.style.width = 'auto';
            document.body.style.height = 'auto';
            document.body.style.top = 'auto';
            document.body.style.left = 'auto';
            document.body.classList.remove('mobile-menu-open');
        }
        return () => {
            document.body.style.overflow = 'unset';
            document.body.style.position = 'relative';
            document.body.style.width = 'auto';
            document.body.style.height = 'auto';
            document.body.style.top = 'auto';
            document.body.style.left = 'auto';
            document.body.classList.remove('mobile-menu-open');
        };
    }, [isMobileMenuOpen]);

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsDropdownOpen(false);
        setIsMobileMenuOpen(false);
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

    const toggleSearch = () => {
        setIsSearchOpen(!isSearchOpen);
        if (isMobileMenuOpen) setIsMobileMenuOpen(false);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
        if (isSearchOpen) setIsSearchOpen(false);
    };

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
        document.body.style.backgroundColor = !isDarkMode ? '#1a1a2e' : '#f5f5f5';
    };

    // Logo component with animations
    const Logo = () => (
        <Link to="/" style={styles.logoLink} className="logo">
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

    // Desktop NavLink component
    const NavLink = ({ to, icon, children, onClick }) => {
        const isActive = location.pathname === to;
        return (
            <Link 
                to={to} 
                style={{
                    ...styles.navLink,
                    background: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                    borderColor: isActive ? '#FFD700' : 'transparent'
                }}
                className="nav-link"
                onClick={onClick}
            >
                <span style={styles.navLinkIcon}>{icon}</span>
                <span style={styles.navLinkText}>{children}</span>
                {isActive && <span style={styles.navLinkActive}></span>}
            </Link>
        );
    };

    // Mobile NavLink component
    const MobileNavLink = ({ to, icon, children, onClick }) => {
        const isActive = location.pathname === to;
        return (
            <Link 
                to={to} 
                style={{
                    ...styles.mobileNavLink,
                    background: isActive ? 'rgba(255,215,0,0.2)' : 'transparent',
                    borderLeft: isActive ? '4px solid #FFD700' : '4px solid transparent'
                }}
                onClick={onClick}
            >
                <span style={styles.mobileNavIcon}>{icon}</span>
                <span style={styles.mobileNavText}>{children}</span>
                {isActive && <span style={styles.mobileNavActive}></span>}
            </Link>
        );
    };

    // Shiny button with hover effects
    const ShinyButton = ({ to, children, primary = false, icon, onClick }) => (
        <Link 
            to={to} 
            style={{
                ...styles.shinyButton,
                ...(primary ? styles.shinyButtonPrimary : {})
            }}
            className="shiny-button"
            onClick={onClick}
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
            boxShadow: isScrolled 
                ? '0 10px 30px rgba(0,0,0,0.3)'
                : '0 15px 35px rgba(0,0,0,0.2)',
            transition: 'all 0.4s ease',
            borderBottom: '2px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            '@media (max-width: 768px)': {
                padding: isScrolled ? '0.6rem 1rem' : '1rem 1rem',
            }
        },
        container: {
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative'
        },
        // Logo styles with animation
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
            position: 'relative'
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
            overflow: 'hidden',
            '@media (max-width: 768px)': {
                width: '35px',
                height: '35px',
            }
        },
        logoLightning: {
            color: '#1a1a2e',
            fontSize: '1.4rem',
            animation: 'pulse 2s ease-in-out infinite',
            '@media (max-width: 768px)': {
                fontSize: '1.2rem',
            }
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
            textShadow: '0 2px 10px rgba(255,215,0,0.3)',
            letterSpacing: '2px',
            lineHeight: '1',
            '@media (max-width: 768px)': {
                fontSize: '1.2rem',
            }
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
            animation: 'pulse 2s infinite',
            '@media (max-width: 768px)': {
                fontSize: '0.5rem',
                padding: '1px 4px',
            }
        },
        // Desktop Navigation - Only visible on desktop
        desktopNav: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            flex: 1,
            justifyContent: 'flex-end',
            '@media (max-width: 1023px)': {
                display: 'none'
            }
        },
        desktopNavLinks: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            marginRight: '1rem'
        },
        desktopActions: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        // Mobile Navigation - Only visible on mobile
        mobileNav: {
            display: 'none',
            alignItems: 'center',
            gap: '0.5rem',
            '@media (max-width: 1023px)': {
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
            zIndex: 1002,
            '@media (max-width: 768px)': {
                width: '40px',
                height: '40px',
                fontSize: '1.2rem',
            }
        },
        // FIXED: Mobile menu overlay
        mobileMenuOverlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999998,
            display: isMobileMenuOpen ? 'block' : 'none',
            backdropFilter: 'blur(3px)',
        },
        // FIXED: Mobile menu - SIDEBAR STYLE
        mobileMenu: {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '300px',
            height: '100vh',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            zIndex: 999999,
            transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.3s ease-in-out',
            boxShadow: '2px 0 20px rgba(0,0,0,0.5)',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
        },
        mobileMenuContent: {
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
        },
        // Close button
        mobileCloseButton: {
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,215,0,0.3)',
            color: 'white',
            width: '35px',
            height: '35px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            cursor: 'pointer',
            zIndex: 1000000,
            transition: 'all 0.3s ease'
        },
        // User section at the top
        mobileUserSection: {
            padding: '20px',
            borderBottom: '1px solid rgba(255,215,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
        },
        mobileUserAvatar: {
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FFD700, #FFA500, #FF6B6B)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#1a1a2e',
        },
        mobileUserDetails: {
            flex: 1,
        },
        mobileUserName: {
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1rem',
            marginBottom: '4px',
        },
        mobileUserEmail: {
            color: 'rgba(255,255,255,0.6)',
            fontSize: '0.8rem',
        },
        mobileRoleBadge: {
            display: 'inline-block',
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            color: '#1a1a2e',
            fontSize: '0.6rem',
            padding: '2px 8px',
            borderRadius: '12px',
            marginTop: '4px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
        },
        // Search bar in menu
        mobileSearchContainer: {
            padding: '15px 20px',
            borderBottom: '1px solid rgba(255,215,0,0.2)',
        },
        mobileSearchBox: {
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '8px',
            padding: '10px 15px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
        },
        mobileSearchInput: {
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: 'white',
            outline: 'none',
            fontSize: '0.9rem',
            '::placeholder': {
                color: 'rgba(255,255,255,0.5)',
            }
        },
        // Menu items container
        mobileMenuItems: {
            flex: 1,
            padding: '10px 0',
            overflowY: 'auto',
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
            fontWeight: '600',
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
        mobileNavActive: {
            width: '4px',
            height: '100%',
            background: '#FFD700',
            borderRadius: '2px'
        },
        // Badge for roles
        mobileMenuBadge: {
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            color: '#1a1a2e',
            fontSize: '0.6rem',
            padding: '2px 8px',
            borderRadius: '12px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            marginLeft: '8px',
        },
        // Count badge
        mobileCountBadge: {
            background: 'linear-gradient(135deg, #ff6b6b, #ff4757)',
            color: 'white',
            fontSize: '0.65rem',
            padding: '2px 6px',
            borderRadius: '12px',
            marginLeft: '8px',
        },
        // Divider
        mobileDivider: {
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.3), transparent)',
            margin: '10px 0',
        },
        // Auth buttons - FIXED: Vertical layout
        mobileAuthContainer: {
            padding: '10px 20px',
        },
        mobileAuthTitle: {
            color: '#FFD700',
            fontSize: '0.75rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '10px',
            paddingLeft: '5px',
        },
        mobileAuthButton: {
            display: 'flex',
            alignItems: 'center',
            padding: '12px 15px',
            marginBottom: '8px',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'white',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
            width: '100%',
            fontSize: '0.95rem',
        },
        mobileAuthButtonPrimary: {
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            border: 'none',
            color: '#1a1a2e',
            fontWeight: '600',
        },
        mobileAuthIcon: {
            width: '20px',
            marginRight: '12px',
            fontSize: '1rem',
            color: '#FFD700',
        },
        // Logout button
        mobileLogoutSection: {
            padding: '15px 20px',
            borderTop: '1px solid rgba(255,215,0,0.2)',
        },
        mobileLogoutButton: {
            display: 'flex',
            alignItems: 'center',
            padding: '12px 15px',
            borderRadius: '8px',
            background: 'rgba(255,107,107,0.15)',
            color: '#ff6b6b',
            border: '1px solid rgba(255,107,107,0.3)',
            cursor: 'pointer',
            width: '100%',
            fontSize: '0.95rem',
            transition: 'all 0.2s ease',
        },
        // Open indicator
        mobileOpenIndicator: {
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            background: 'rgba(255,215,0,0.15)',
            color: '#FFD700',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.7rem',
            fontWeight: 'bold',
            border: '1px solid rgba(255,215,0,0.3)',
            pointerEvents: 'none',
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
            overflow: 'hidden',
            letterSpacing: '0.5px',
            whiteSpace: 'nowrap'
        },
        navLinkIcon: {
            fontSize: '1rem',
            color: '#FFD700',
            transition: 'all 0.3s ease'
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
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(5px)',
            letterSpacing: '0.5px',
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
            animation: 'slideDown 0.4s ease',
            '@media (min-width: 768px)': {
                width: '400px'
            }
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
            transition: 'all 0.3s'
        },
        searchSubmit: {
            padding: '12px 15px',
            background: 'linear-gradient(135deg, #667eea, #764ba2, #ff6b6b)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.3s',
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
            transition: 'all 0.3s ease',
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
            boxShadow: '0 0 15px rgba(255,107,107,0.7)'
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
            transition: 'all 0.3s ease'
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
            transition: 'all 0.3s ease',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            backdropFilter: 'blur(5px)',
            letterSpacing: '0.5px',
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
        // User menu
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
            transition: 'all 0.3s ease'
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
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '120px',
            color: 'white',
            fontWeight: '600',
            fontSize: '0.9rem'
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
            animation: 'slideDown 0.3s ease'
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
            position: 'relative',
            overflow: 'hidden'
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
                from {
                    opacity: 0;
                }
                to {
                    opacity: 1;
                }
            }
            
            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateY(-15px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                }
                to {
                    transform: translateX(0);
                }
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(-100%);
                }
                to {
                    transform: translateX(0);
                }
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
            
            @keyframes shimmer {
                0% { left: -100%; }
                100% { left: 200%; }
            }
            
            .mobile-menu-open {
                overflow: hidden !important;
                position: fixed !important;
                width: 100% !important;
                height: 100% !important;
            }
            
            .nav-link:hover {
                background: rgba(255,255,255,0.15) !important;
                transform: translateY(-2px);
            }
            
            .nav-link:hover .nav-link-icon {
                transform: scale(1.1) rotate(3deg);
                color: #FFD700;
            }
            
            .shiny-button:hover {
                transform: translateY(-2px) scale(1.02);
                box-shadow: 0 10px 20px rgba(255,215,0,0.3);
            }
            
            .shiny-button::after {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
                transform: rotate(30deg);
                animation: shimmer 3s infinite;
                opacity: 0;
            }
            
            .shiny-button:hover::after {
                opacity: 1;
            }
            
            .dropdown-item:hover {
                background: rgba(255,215,0,0.15);
                padding-left: 1.8rem;
            }
            
            .dropdown-item:hover .dropdown-icon {
                transform: scale(1.2) rotate(5deg);
            }
            
            .cart-link:hover {
                background: linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.2));
                transform: translateY(-2px);
                box-shadow: 0 10px 20px rgba(255,215,0,0.3);
            }
            
            .search-button:hover {
                background: linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.2));
                transform: translateY(-2px);
            }

            @media (max-width: 1023px) {
                .desktopNav {
                    display: none !important;
                }
                .mobileNav {
                    display: flex !important;
                }
            }

            @media (min-width: 1024px) {
                .desktopNav {
                    display: flex !important;
                }
                .mobileNav {
                    display: none !important;
                }
            }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    return (
        <nav style={styles.navbar}>
            <div style={styles.container}>
                <Logo />

                {/* Desktop Navigation - Only visible on desktop */}
                <div className="desktopNav" style={styles.desktopNav}>
                    <div style={styles.desktopNavLinks}>
                        <NavLink to="/" icon={<FaHome />}>Home</NavLink>
                        <NavLink to="/products" icon={<FaTag />}>Products</NavLink>
                    </div>

                    <div style={styles.desktopActions}>
                        {/* Search Button */}
                        <button 
                            style={styles.searchButton} 
                            onClick={toggleSearch}
                            className="search-button"
                        >
                            <FaSearch /> Search
                        </button>

                        {/* Search Dropdown */}
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
                                    <button type="button" style={styles.closeSearch} onClick={toggleSearch}>
                                        <FaTimes />
                                    </button>
                                </form>
                            </div>
                        )}
                        
                        {/* Dark Mode Toggle */}
                        <button 
                            style={styles.darkModeToggle}
                            onClick={toggleDarkMode}
                            className="search-button"
                        >
                            {isDarkMode ? <FaSun /> : <FaMoon />}
                        </button>
                        
                        {/* Notification Bell */}
                        {user && <NotificationBell />}
                        
                        {/* Cart Icon with Badge */}
                        <Link to="/cart" style={styles.cartLink} className="cart-link">
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
                                <div style={styles.userName} className="user-name">
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

                                        {/* Role-based dashboard links */}
                                        {user.role === 'seller' && (
                                            <>
                                                <Link to="/seller/dashboard" style={styles.dropdownItem} className="dropdown-item">
                                                    <FaTachometerAlt style={styles.dropdownIcon} className="dropdown-icon" />
                                                    Seller Dashboard
                                                    <span style={styles.roleBadge}>Seller</span>
                                                </Link>
                                                <Link to="/seller/products" style={styles.dropdownItem} className="dropdown-item">
                                                    <FaBox style={styles.dropdownIcon} className="dropdown-icon" />
                                                    My Products
                                                </Link>
                                                <Link to="/seller/orders" style={styles.dropdownItem} className="dropdown-item">
                                                    <FaClipboardList style={styles.dropdownIcon} className="dropdown-icon" />
                                                    Orders
                                                </Link>
                                            </>
                                        )}
                                        
                                        {user.role === 'admin' && (
                                            <>
                                                <Link to="/admin/dashboard" style={styles.dropdownItem} className="dropdown-item">
                                                    <FaTachometerAlt style={styles.dropdownIcon} className="dropdown-icon" />
                                                    Admin Dashboard
                                                    <span style={styles.roleBadge}>Admin</span>
                                                </Link>
                                                <Link to="/admin/users" style={styles.dropdownItem} className="dropdown-item">
                                                    <FaUser style={styles.dropdownIcon} className="dropdown-icon" />
                                                    Users
                                                </Link>
                                                <Link to="/admin/products" style={styles.dropdownItem} className="dropdown-item">
                                                    <FaBox style={styles.dropdownIcon} className="dropdown-icon" />
                                                    Products
                                                </Link>
                                            </>
                                        )}
                                        
                                        {user.role === 'customer' && (
                                            <>
                                                <Link to="/profile" style={styles.dropdownItem} className="dropdown-item">
                                                    <FaUser style={styles.dropdownIcon} className="dropdown-icon" />
                                                    My Profile
                                                </Link>
                                                <Link to="/orders" style={styles.dropdownItem} className="dropdown-item">
                                                    <FaClipboardList style={styles.dropdownIcon} className="dropdown-icon" />
                                                    My Orders
                                                </Link>
                                                <Link to="/wishlist" style={styles.dropdownItem} className="dropdown-item">
                                                    <FaHeart style={styles.dropdownIcon} className="dropdown-icon" />
                                                    Wishlist 
                                                    {wishlistCount > 0 && (
                                                        <span style={styles.countBadge}>{wishlistCount}</span>
                                                    )}
                                                </Link>
                                            </>
                                        )}
                                        
                                        <div style={styles.dropdownDivider}></div>
                                        
                                        <Link to="/notifications" style={styles.dropdownItem} className="dropdown-item">
                                            <FaBell style={styles.dropdownIcon} className="dropdown-icon" />
                                            Notifications
                                        </Link>
                                        
                                        <Link to="/cart" style={styles.dropdownItem} className="dropdown-item">
                                            <FaShoppingCart style={styles.dropdownIcon} className="dropdown-icon" />
                                            Cart 
                                            {cartCount > 0 && (
                                                <span style={styles.countBadge}>{cartCount}</span>
                                            )}
                                        </Link>
                                        
                                        <button onClick={handleLogout} style={styles.dropdownItem} className="dropdown-item">
                                            <FaSignOutAlt style={styles.dropdownIcon} className="dropdown-icon" />
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

                {/* Mobile Navigation - Only visible on mobile */}
                <div className="mobileNav" style={styles.mobileNav}>
                    {/* Cart Icon for Mobile */}
                    <Link to="/cart" style={{...styles.cartLink, padding: '0.5rem'}} className="cart-link">
                        <FaShoppingCart size={18} />
                        {cartCount > 0 && (
                            <span style={{...styles.cartBadge, top: '-5px', right: '-5px'}}>{cartCount}</span>
                        )}
                    </Link>

                    {/* Dark Mode Toggle for Mobile */}
                    <button 
                        style={{...styles.darkModeToggle, width: '40px', height: '40px'}}
                        onClick={toggleDarkMode}
                    >
                        {isDarkMode ? <FaSun /> : <FaMoon />}
                    </button>

                    {/* Hamburger Menu Button */}
                    <button 
                        style={styles.hamburgerButton}
                        onClick={toggleMobileMenu}
                        aria-label="Toggle mobile menu"
                    >
                        {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
                    </button>
                </div>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div style={styles.mobileMenuOverlay} onClick={() => setIsMobileMenuOpen(false)} />
                )}

                {/* Mobile Menu - Sidebar Style */}
                {isMobileMenuOpen && (
                    <div style={styles.mobileMenu}>
                        <div style={styles.mobileMenuContent}>
                            {/* Close Button */}
                            <button 
                                style={styles.mobileCloseButton}
                                onClick={() => setIsMobileMenuOpen(false)}
                                aria-label="Close menu"
                            >
                                <FaTimes />
                            </button>

                            {/* User Info Section */}
                            <div style={styles.mobileUserSection}>
                                <div style={styles.mobileUserAvatar}>
                                    {user ? user.name?.charAt(0).toUpperCase() : <FaUser />}
                                </div>
                                <div style={styles.mobileUserDetails}>
                                    <div style={styles.mobileUserName}>
                                        {user ? user.name : 'Guest'}
                                    </div>
                                    <div style={styles.mobileUserEmail}>
                                        {user ? user.email : 'Sign in to continue'}
                                    </div>
                                    {user && (
                                        <div style={styles.mobileRoleBadge}>{user.role}</div>
                                    )}
                                </div>
                            </div>

                            {/* Search Bar */}
                            <div style={styles.mobileSearchContainer}>
                                <div style={styles.mobileSearchBox}>
                                    <FaSearch color="#FFD700" size={14} />
                                    <input 
                                        type="text"
                                        placeholder="Search products..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                                        style={styles.mobileSearchInput}
                                    />
                                </div>
                            </div>

                            {/* Menu Items Container */}
                            <div style={styles.mobileMenuItems}>
                                {/* Main Navigation */}
                                <MobileNavLink to="/" icon={<FaHome />} onClick={() => setIsMobileMenuOpen(false)}>
                                    Home
                                </MobileNavLink>
                                <MobileNavLink to="/products" icon={<FaTag />} onClick={() => setIsMobileMenuOpen(false)}>
                                    Products
                                </MobileNavLink>

                                <div style={styles.mobileDivider} />

                                {/* Auth Section - Login and Register on separate lines */}
                                {!user ? (
                                    <div style={styles.mobileAuthContainer}>
                                        <div style={styles.mobileAuthTitle}>Account</div>
                                        <Link to="/login" style={styles.mobileAuthButton} onClick={() => setIsMobileMenuOpen(false)}>
                                            <FaUser style={styles.mobileAuthIcon} />
                                            <span style={styles.mobileNavText}>Login</span>
                                        </Link>
                                        <Link to="/register" style={{...styles.mobileAuthButton, ...styles.mobileAuthButtonPrimary}} onClick={() => setIsMobileMenuOpen(false)}>
                                            <FaGift style={styles.mobileAuthIcon} />
                                            <span style={styles.mobileNavText}>Register</span>
                                        </Link>
                                    </div>
                                ) : (
                                    <>
                                        {/* Role-based links */}
                                        {user.role === 'seller' && (
                                            <>
                                                <MobileNavLink to="/seller/dashboard" icon={<FaTachometerAlt />} onClick={() => setIsMobileMenuOpen(false)}>
                                                    Seller Dashboard
                                                    <span style={styles.mobileMenuBadge}>SELLER</span>
                                                </MobileNavLink>
                                                <MobileNavLink to="/seller/products" icon={<FaBox />} onClick={() => setIsMobileMenuOpen(false)}>
                                                    My Products
                                                </MobileNavLink>
                                                <MobileNavLink to="/seller/orders" icon={<FaClipboardList />} onClick={() => setIsMobileMenuOpen(false)}>
                                                    Orders
                                                </MobileNavLink>
                                            </>
                                        )}
                                        
                                        {user.role === 'admin' && (
                                            <>
                                                <MobileNavLink to="/admin/dashboard" icon={<FaTachometerAlt />} onClick={() => setIsMobileMenuOpen(false)}>
                                                    Admin Dashboard
                                                    <span style={styles.mobileMenuBadge}>ADMIN</span>
                                                </MobileNavLink>
                                                <MobileNavLink to="/admin/users" icon={<FaUser />} onClick={() => setIsMobileMenuOpen(false)}>
                                                    Users
                                                </MobileNavLink>
                                                <MobileNavLink to="/admin/products" icon={<FaBox />} onClick={() => setIsMobileMenuOpen(false)}>
                                                    Products
                                                </MobileNavLink>
                                            </>
                                        )}
                                        
                                        {user.role === 'customer' && (
                                            <>
                                                <MobileNavLink to="/profile" icon={<FaUser />} onClick={() => setIsMobileMenuOpen(false)}>
                                                    My Profile
                                                </MobileNavLink>
                                                <MobileNavLink to="/orders" icon={<FaClipboardList />} onClick={() => setIsMobileMenuOpen(false)}>
                                                    My Orders
                                                </MobileNavLink>
                                                <MobileNavLink to="/wishlist" icon={<FaHeart />} onClick={() => setIsMobileMenuOpen(false)}>
                                                    Wishlist
                                                    {wishlistCount > 0 && (
                                                        <span style={styles.mobileCountBadge}>{wishlistCount}</span>
                                                    )}
                                                </MobileNavLink>
                                            </>
                                        )}

                                        {/* Common links */}
                                        <MobileNavLink to="/notifications" icon={<FaBell />} onClick={() => setIsMobileMenuOpen(false)}>
                                            Notifications
                                        </MobileNavLink>
                                        
                                        <MobileNavLink to="/cart" icon={<FaShoppingCart />} onClick={() => setIsMobileMenuOpen(false)}>
                                            Cart
                                            {cartCount > 0 && (
                                                <span style={styles.mobileCountBadge}>{cartCount}</span>
                                            )}
                                        </MobileNavLink>
                                    </>
                                )}
                            </div>

                            {/* Logout Button */}
                            {user && (
                                <div style={styles.mobileLogoutSection}>
                                    <button style={styles.mobileLogoutButton} onClick={handleLogout}>
                                        <FaSignOutAlt style={{ marginRight: '15px' }} />
                                        Logout
                                    </button>
                                </div>
                            )}

                            {/* Open Indicator */}
                            {isMobileMenuOpen && (
                                <div style={styles.mobileOpenIndicator}>
                                    OPEN
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;