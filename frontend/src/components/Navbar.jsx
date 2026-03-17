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
            document.body.classList.add('mobile-menu-open');
        } else {
            document.body.style.overflow = 'unset';
            document.body.classList.remove('mobile-menu-open');
        }
        return () => {
            document.body.style.overflow = 'unset';
            document.body.classList.remove('mobile-menu-open');
        };
    }, [isMobileMenuOpen]);

    const handleLogout = () => {
        logout();
        navigate('/');
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
                <div style={styles.logoIcon}>
                    <FaBolt style={styles.logoLightning} />
                    <FaStar style={styles.logoStar1} />
                    <FaStar style={styles.logoStar2} />
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

    // Mobile Menu Item - EXACTLY like the image
    const MobileMenuItem = ({ to, icon, children, badge, count, onClick }) => {
        const isActive = location.pathname === to;
        return (
            <Link 
                to={to} 
                style={{
                    ...styles.mobileMenuItem,
                    background: isActive ? 'rgba(255,215,0,0.15)' : 'transparent',
                    borderLeft: isActive ? '4px solid #FFD700' : '4px solid transparent',
                }}
                onClick={onClick}
            >
                <span style={styles.mobileMenuIcon}>{icon}</span>
                <span style={styles.mobileMenuText}>{children}</span>
                {badge && <span style={styles.mobileMenuBadge}>{badge}</span>}
                {count > 0 && <span style={styles.mobileCountBadge}>{count}</span>}
            </Link>
        );
    };

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
        // Logo styles
        logoLink: {
            textDecoration: 'none',
            display: 'block',
            zIndex: 1002
        },
        logoContainer: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
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
            '@media (max-width: 768px)': {
                width: '35px',
                height: '35px',
            }
        },
        logoLightning: {
            color: '#1a1a2e',
            fontSize: '1.4rem',
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
        },
        logoStar2: {
            position: 'absolute',
            bottom: '3px',
            left: '3px',
            color: '#fff',
            fontSize: '0.6rem',
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
            '@media (max-width: 768px)': {
                fontSize: '0.5rem',
                padding: '1px 4px',
            }
        },
        // Desktop Navigation
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
        },
        // Mobile Navigation
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
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            transition: 'all 0.3s ease',
            zIndex: 1002
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
        },
        
        // ===== MOBILE MENU - EXACTLY LIKE THE IMAGE =====
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
            display: 'flex',
            flexDirection: 'column',
        },
        // User Info Section - Like in the image
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
        mobileUserRole: {
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
        // Search Bar - Like in the image
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
        // Menu Items Container
        mobileMenuItems: {
            flex: 1,
            padding: '10px 0',
            overflowY: 'auto',
        },
        mobileMenuItem: {
            display: 'flex',
            alignItems: 'center',
            padding: '12px 20px',
            margin: '2px 0',
            color: 'white',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
            fontSize: '0.95rem',
            ':hover': {
                background: 'rgba(255,215,0,0.1)',
            }
        },
        mobileMenuIcon: {
            width: '24px',
            marginRight: '15px',
            color: '#FFD700',
            fontSize: '1.1rem',
        },
        mobileMenuText: {
            flex: 1,
        },
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
        mobileCountBadge: {
            background: 'linear-gradient(135deg, #ff6b6b, #ff4757)',
            color: 'white',
            fontSize: '0.65rem',
            padding: '2px 6px',
            borderRadius: '12px',
            marginLeft: '8px',
        },
        // Section Divider - Like in the image
        mobileDivider: {
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.3), transparent)',
            margin: '10px 0',
        },
        // Logout Button - Like in the image
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
            ':hover': {
                background: 'rgba(255,107,107,0.25)',
            }
        },
        // Open indicator - Like in the image
        mobileOpenIndicator: {
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            background: 'rgba(255,215,0,0.2)',
            color: '#FFD700',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.7rem',
            fontWeight: 'bold',
            border: '1px solid rgba(255,215,0,0.3)',
        },
    };

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
                            <div style={styles.userMenu}>
                                <div style={styles.userName}>
                                    <div style={styles.userAvatar}>
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={styles.authButtons}>
                                <Link to="/login" style={styles.shinyButton}>
                                    <FaUser /> Login
                                </Link>
                                <Link to="/register" style={{...styles.shinyButton, ...styles.shinyButtonPrimary}}>
                                    <FaGift /> Register
                                </Link>
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
                        style={{...styles.darkModeToggle, width: '36px', height: '36px'}}
                        onClick={toggleDarkMode}
                    >
                        {isDarkMode ? <FaSun /> : <FaMoon />}
                    </button>

                    <button 
                        style={styles.hamburgerButton}
                        onClick={toggleMobileMenu}
                    >
                        <FaBars />
                    </button>
                </div>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div style={styles.mobileMenuOverlay} onClick={() => setIsMobileMenuOpen(false)} />
                )}

                {/* Mobile Menu - EXACTLY LIKE THE IMAGE */}
                <div style={styles.mobileMenu}>
                    {/* User Info Section - Like in the image */}
                    <div style={styles.mobileUserSection}>
                        <div style={styles.mobileUserAvatar}>
                            {user ? user.name?.charAt(0).toUpperCase() : <FaUser />}
                        </div>
                        <div style={styles.mobileUserDetails}>
                            <div style={styles.mobileUserName}>
                                {user ? user.name : 'Guest User'}
                            </div>
                            <div style={styles.mobileUserEmail}>
                                {user ? user.email : 'Sign in to continue'}
                            </div>
                            {user && (
                                <div style={styles.mobileUserRole}>{user.role}</div>
                            )}
                        </div>
                    </div>

                    {/* Search Bar - Like in the image */}
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

                    {/* Menu Items - Like in the image */}
                    <div style={styles.mobileMenuItems}>
                        {/* Main Navigation */}
                        <MobileMenuItem to="/" icon={<FaHome />} onClick={() => setIsMobileMenuOpen(false)}>
                            Home
                        </MobileMenuItem>
                        <MobileMenuItem to="/products" icon={<FaTag />} onClick={() => setIsMobileMenuOpen(false)}>
                            Products
                        </MobileMenuItem>

                        <div style={styles.mobileDivider} />

                        {/* Account Section */}
                        {user ? (
                            <>
                                {user.role === 'seller' && (
                                    <MobileMenuItem 
                                        to="/seller/dashboard" 
                                        icon={<FaTachometerAlt />} 
                                        badge="SELLER"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Seller Dashboard
                                    </MobileMenuItem>
                                )}
                                {user.role === 'admin' && (
                                    <MobileMenuItem 
                                        to="/admin/dashboard" 
                                        icon={<FaTachometerAlt />} 
                                        badge="ADMIN"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Admin Dashboard
                                    </MobileMenuItem>
                                )}
                                <MobileMenuItem to="/profile" icon={<FaUser />} onClick={() => setIsMobileMenuOpen(false)}>
                                    My Profile
                                </MobileMenuItem>
                                <MobileMenuItem to="/orders" icon={<FaClipboardList />} onClick={() => setIsMobileMenuOpen(false)}>
                                    My Orders
                                </MobileMenuItem>
                                <MobileMenuItem to="/wishlist" icon={<FaHeart />} count={wishlistCount} onClick={() => setIsMobileMenuOpen(false)}>
                                    Wishlist
                                </MobileMenuItem>
                                <MobileMenuItem to="/cart" icon={<FaShoppingCart />} count={cartCount} onClick={() => setIsMobileMenuOpen(false)}>
                                    Cart
                                </MobileMenuItem>
                                <MobileMenuItem to="/notifications" icon={<FaBell />} onClick={() => setIsMobileMenuOpen(false)}>
                                    Notifications
                                </MobileMenuItem>
                            </>
                        ) : (
                            <>
                                <MobileMenuItem to="/login" icon={<FaUser />} onClick={() => setIsMobileMenuOpen(false)}>
                                    Login
                                </MobileMenuItem>
                                <MobileMenuItem to="/register" icon={<FaGift />} onClick={() => setIsMobileMenuOpen(false)}>
                                    Register
                                </MobileMenuItem>
                            </>
                        )}
                    </div>

                    {/* Logout Button - Like in the image */}
                    {user && (
                        <div style={styles.mobileLogoutSection}>
                            <button style={styles.mobileLogoutButton} onClick={handleLogout}>
                                <FaSignOutAlt style={{ marginRight: '15px' }} />
                                Logout
                            </button>
                        </div>
                    )}

                    {/* Open Indicator - Like in the image */}
                    {isMobileMenuOpen && (
                        <div style={styles.mobileOpenIndicator}>
                            OPEN
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;