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
        setIsDropdownOpen(false);
        setIsSearchOpen(false);
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
        <Link to="/" className="logo-link" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(135deg, #FFD700, #FFA500, #FF6B6B)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: 'rotate(5deg)',
                    boxShadow: '0 10px 20px rgba(255,215,0,0.4)'
                }}>
                    <FaBolt style={{ color: '#1a1a2e', fontSize: '1.4rem' }} />
                </div>
                <div>
                    <span style={{
                        fontSize: '1.5rem',
                        fontWeight: '800',
                        background: 'linear-gradient(135deg, #fff, #FFD700)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '2px'
                    }}>E-Store</span>
                    <span style={{
                        background: 'linear-gradient(135deg, #FFD700, #FF6B6B)',
                        color: '#1a1a2e',
                        fontSize: '0.55rem',
                        fontWeight: 'bold',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        marginLeft: '5px',
                        textTransform: 'uppercase'
                    }}>PRO</span>
                </div>
            </div>
        </Link>
    );

    // NavLink component
    const NavLink = ({ to, icon, children }) => {
        const isActive = location.pathname === to;
        return (
            <Link 
                to={to} 
                style={{
                    color: 'white',
                    textDecoration: 'none',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '30px',
                    background: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                    transition: 'all 0.3s ease'
                }}
                className="nav-link"
            >
                <span style={{ color: '#FFD700' }}>{icon}</span>
                <span>{children}</span>
            </Link>
        );
    };

    // Add animations
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
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
            
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
            
            .nav-link:hover {
                background: rgba(255,255,255,0.15) !important;
                transform: translateY(-2px);
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
            
            .shiny-button:hover {
                transform: translateY(-2px) scale(1.02);
                box-shadow: 0 10px 20px rgba(255,215,0,0.3);
            }
            
            .dropdown-item:hover {
                background: rgba(255,215,0,0.15);
                padding-left: 1.8rem;
            }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    return (
        <nav style={{
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            background: isScrolled 
                ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 30%, #ff6b6b 70%, #ffd93d 100%)',
            padding: isScrolled ? '0.8rem 1rem' : '1.2rem 1rem',
            boxShadow: isScrolled 
                ? '0 10px 30px rgba(0,0,0,0.3)'
                : '0 15px 35px rgba(0,0,0,0.2)',
            transition: 'all 0.4s ease',
            borderBottom: '2px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)'
        }}>
            <div style={{
                maxWidth: '1400px',
                margin: '0 auto',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'relative'
            }}>
                <Logo />

                {/* Desktop Navigation - Visible on lg screens and up */}
                <div style={{
                    display: 'none',
                    alignItems: 'center',
                    gap: '0.5rem',
                    flex: 1,
                    justifyContent: 'flex-end',
                    '@media (min-width: 1024px)': {
                        display: 'flex'
                    }
                }} className="desktop-nav">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginRight: '1rem' }}>
                        <NavLink to="/" icon={<FaHome />}>Home</NavLink>
                        <NavLink to="/products" icon={<FaTag />}>Products</NavLink>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {/* Search Button */}
                        <button 
                            style={{
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
                                backdropFilter: 'blur(5px)'
                            }}
                            onClick={toggleSearch}
                            className="search-button"
                        >
                            <FaSearch /> Search
                        </button>

                        {/* Search Dropdown */}
                        {isSearchOpen && (
                            <div style={{
                                position: 'absolute',
                                top: 'calc(100% + 15px)',
                                right: '60px',
                                background: 'rgba(26, 26, 46, 0.98)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: '20px',
                                padding: '20px',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                                zIndex: 1001,
                                width: '400px',
                                border: '2px solid rgba(255,215,0,0.3)',
                                animation: 'slideDown 0.4s ease'
                            }}>
                                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{
                                            flex: 1,
                                            padding: '12px',
                                            border: '2px solid rgba(255,215,0,0.3)',
                                            borderRadius: '12px',
                                            fontSize: '1rem',
                                            background: 'rgba(255,255,255,0.1)',
                                            color: 'white',
                                            outline: 'none'
                                        }}
                                        autoFocus
                                    />
                                    <button type="submit" style={{
                                        padding: '12px 15px',
                                        background: 'linear-gradient(135deg, #667eea, #764ba2, #ff6b6b)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        cursor: 'pointer'
                                    }}>
                                        <FaSearch />
                                    </button>
                                    <button type="button" style={{
                                        padding: '12px',
                                        background: 'rgba(255,255,255,0.1)',
                                        color: 'white',
                                        border: '2px solid rgba(255,255,255,0.2)',
                                        borderRadius: '12px',
                                        cursor: 'pointer'
                                    }} onClick={toggleSearch}>
                                        <FaTimes />
                                    </button>
                                </form>
                            </div>
                        )}
                        
                        {/* Dark Mode Toggle */}
                        <button 
                            style={{
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
                            }}
                            onClick={toggleDarkMode}
                            className="search-button"
                        >
                            {isDarkMode ? <FaSun /> : <FaMoon />}
                        </button>
                        
                        {/* Notification Bell */}
                        {user && <NotificationBell />}
                        
                        {/* Cart Icon with Badge */}
                        <Link to="/cart" style={{
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
                            transition: 'all 0.3s ease'
                        }} className="cart-link">
                            <FaShoppingCart size={18} />
                            Cart
                            {cartCount > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    top: '-5px',
                                    right: '-5px',
                                    background: 'linear-gradient(135deg, #ff6b6b, #ff4757)',
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
                                    animation: 'pulse 2s infinite'
                                }}>{cartCount}</span>
                            )}
                        </Link>
                        
                        {user ? (
                            <div 
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    position: 'relative',
                                    cursor: 'pointer'
                                }}
                                className="user-menu"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            >
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    cursor: 'pointer',
                                    padding: '0.3rem 1rem 0.3rem 0.5rem',
                                    borderRadius: '30px',
                                    background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))',
                                    border: '1px solid rgba(255,215,0,0.3)'
                                }}>
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #FFD700, #FFA500, #FF6B6B)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1rem',
                                        fontWeight: 'bold',
                                        color: '#1a1a2e'
                                    }}>
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <span style={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        maxWidth: '120px',
                                        color: 'white',
                                        fontWeight: '600',
                                        fontSize: '0.9rem'
                                    }}>{user.name}</span>
                                </div>
                                
                                {isDropdownOpen && (
                                    <div style={{
                                        position: 'absolute',
                                        top: 'calc(100% + 15px)',
                                        right: 0,
                                        background: 'rgba(26, 26, 46, 0.98)',
                                        backdropFilter: 'blur(10px)',
                                        borderRadius: '20px',
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                                        minWidth: '280px',
                                        zIndex: 1000,
                                        overflow: 'hidden',
                                        border: '2px solid rgba(255,215,0,0.3)',
                                        animation: 'slideDown 0.3s ease'
                                    }}>
                                        <div style={{
                                            padding: '1.5rem',
                                            background: 'linear-gradient(135deg, #667eea, #764ba2, #ff6b6b)',
                                            borderBottom: '1px solid rgba(255,255,255,0.1)'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{
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
                                                }}>
                                                    {user.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'white' }}>
                                                        {user.name || 'User'}
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Role-based dashboard links */}
                                        {user.role === 'seller' && (
                                            <>
                                                <Link to="/seller/dashboard" style={{
                                                    padding: '0.9rem 1.2rem',
                                                    color: 'white',
                                                    textDecoration: 'none',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.8rem',
                                                    transition: 'all 0.3s',
                                                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                                                }} className="dropdown-item">
                                                    <FaTachometerAlt style={{ color: '#FFD700' }} />
                                                    Seller Dashboard
                                                    <span style={{
                                                        fontSize: '0.7rem',
                                                        padding: '2px 8px',
                                                        borderRadius: '20px',
                                                        background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                                                        color: '#1a1a2e',
                                                        marginLeft: 'auto',
                                                        fontWeight: 'bold'
                                                    }}>Seller</span>
                                                </Link>
                                                <Link to="/seller/products" style={{
                                                    padding: '0.9rem 1.2rem',
                                                    color: 'white',
                                                    textDecoration: 'none',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.8rem',
                                                    transition: 'all 0.3s',
                                                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                                                }} className="dropdown-item">
                                                    <FaBox style={{ color: '#FFD700' }} />
                                                    My Products
                                                </Link>
                                                <Link to="/seller/orders" style={{
                                                    padding: '0.9rem 1.2rem',
                                                    color: 'white',
                                                    textDecoration: 'none',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.8rem',
                                                    transition: 'all 0.3s',
                                                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                                                }} className="dropdown-item">
                                                    <FaClipboardList style={{ color: '#FFD700' }} />
                                                    Orders
                                                </Link>
                                            </>
                                        )}
                                        
                                        {user.role === 'admin' && (
                                            <>
                                                <Link to="/admin/dashboard" style={{
                                                    padding: '0.9rem 1.2rem',
                                                    color: 'white',
                                                    textDecoration: 'none',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.8rem',
                                                    transition: 'all 0.3s',
                                                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                                                }} className="dropdown-item">
                                                    <FaTachometerAlt style={{ color: '#FFD700' }} />
                                                    Admin Dashboard
                                                    <span style={{
                                                        fontSize: '0.7rem',
                                                        padding: '2px 8px',
                                                        borderRadius: '20px',
                                                        background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                                                        color: '#1a1a2e',
                                                        marginLeft: 'auto',
                                                        fontWeight: 'bold'
                                                    }}>Admin</span>
                                                </Link>
                                                <Link to="/admin/users" style={{
                                                    padding: '0.9rem 1.2rem',
                                                    color: 'white',
                                                    textDecoration: 'none',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.8rem',
                                                    transition: 'all 0.3s',
                                                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                                                }} className="dropdown-item">
                                                    <FaUser style={{ color: '#FFD700' }} />
                                                    Users
                                                </Link>
                                                <Link to="/admin/products" style={{
                                                    padding: '0.9rem 1.2rem',
                                                    color: 'white',
                                                    textDecoration: 'none',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.8rem',
                                                    transition: 'all 0.3s',
                                                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                                                }} className="dropdown-item">
                                                    <FaBox style={{ color: '#FFD700' }} />
                                                    Products
                                                </Link>
                                            </>
                                        )}
                                        
                                        {user.role === 'customer' && (
                                            <>
                                                <Link to="/profile" style={{
                                                    padding: '0.9rem 1.2rem',
                                                    color: 'white',
                                                    textDecoration: 'none',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.8rem',
                                                    transition: 'all 0.3s',
                                                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                                                }} className="dropdown-item">
                                                    <FaUser style={{ color: '#FFD700' }} />
                                                    My Profile
                                                </Link>
                                                <Link to="/orders" style={{
                                                    padding: '0.9rem 1.2rem',
                                                    color: 'white',
                                                    textDecoration: 'none',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.8rem',
                                                    transition: 'all 0.3s',
                                                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                                                }} className="dropdown-item">
                                                    <FaClipboardList style={{ color: '#FFD700' }} />
                                                    My Orders
                                                </Link>
                                                <Link to="/wishlist" style={{
                                                    padding: '0.9rem 1.2rem',
                                                    color: 'white',
                                                    textDecoration: 'none',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.8rem',
                                                    transition: 'all 0.3s',
                                                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                                                }} className="dropdown-item">
                                                    <FaHeart style={{ color: '#FFD700' }} />
                                                    Wishlist 
                                                    {wishlistCount > 0 && (
                                                        <span style={{
                                                            fontSize: '0.7rem',
                                                            padding: '2px 6px',
                                                            borderRadius: '20px',
                                                            background: 'linear-gradient(135deg, #ff6b6b, #ff4757)',
                                                            color: 'white',
                                                            marginLeft: 'auto'
                                                        }}>{wishlistCount}</span>
                                                    )}
                                                </Link>
                                            </>
                                        )}
                                        
                                        <div style={{
                                            height: '1px',
                                            background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.3), transparent)',
                                            margin: '0.5rem 0'
                                        }}></div>
                                        
                                        <Link to="/notifications" style={{
                                            padding: '0.9rem 1.2rem',
                                            color: 'white',
                                            textDecoration: 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.8rem',
                                            transition: 'all 0.3s',
                                            borderBottom: '1px solid rgba(255,255,255,0.05)'
                                        }} className="dropdown-item">
                                            <FaBell style={{ color: '#FFD700' }} />
                                            Notifications
                                        </Link>
                                        
                                        <Link to="/cart" style={{
                                            padding: '0.9rem 1.2rem',
                                            color: 'white',
                                            textDecoration: 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.8rem',
                                            transition: 'all 0.3s',
                                            borderBottom: '1px solid rgba(255,255,255,0.05)'
                                        }} className="dropdown-item">
                                            <FaShoppingCart style={{ color: '#FFD700' }} />
                                            Cart 
                                            {cartCount > 0 && (
                                                <span style={{
                                                    fontSize: '0.7rem',
                                                    padding: '2px 6px',
                                                    borderRadius: '20px',
                                                    background: 'linear-gradient(135deg, #ff6b6b, #ff4757)',
                                                    color: 'white',
                                                    marginLeft: 'auto'
                                                }}>{cartCount}</span>
                                            )}
                                        </Link>
                                        
                                        <button onClick={handleLogout} style={{
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
                                            borderBottom: '1px solid rgba(255,255,255,0.05)'
                                        }} className="dropdown-item">
                                            <FaSignOutAlt style={{ color: '#FFD700' }} />
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <Link to="/login" style={{
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
                                    backdropFilter: 'blur(5px)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }} className="shiny-button">
                                    <FaUser /> Login
                                </Link>
                                <Link to="/register" style={{
                                    padding: '0.5rem 1.2rem',
                                    borderRadius: '30px',
                                    background: 'linear-gradient(135deg, #FFD700, #FFA500, #FF6B6B)',
                                    border: 'none',
                                    color: '#1a1a2e',
                                    cursor: 'pointer',
                                    fontSize: '0.95rem',
                                    fontWeight: '600',
                                    transition: 'all 0.3s ease',
                                    textDecoration: 'none',
                                    boxShadow: '0 5px 20px rgba(255,215,0,0.5)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }} className="shiny-button">
                                    <FaGift /> Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Navigation - Visible on smaller screens */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    '@media (min-width: 1024px)': {
                        display: 'none'
                    }
                }}>
                    {/* Cart Icon for Mobile */}
                    <Link to="/cart" style={{
                        position: 'relative',
                        color: 'white',
                        textDecoration: 'none',
                        padding: '0.5rem',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.15)',
                        border: '1px solid rgba(255,215,0,0.3)',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }} className="cart-link">
                        <FaShoppingCart size={18} />
                        {cartCount > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: '-5px',
                                right: '-5px',
                                background: 'linear-gradient(135deg, #ff6b6b, #ff4757)',
                                color: 'white',
                                borderRadius: '50%',
                                width: '20px',
                                height: '20px',
                                fontSize: '0.7rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                border: '2px solid white'
                            }}>{cartCount}</span>
                        )}
                    </Link>

                    {/* Dark Mode Toggle for Mobile */}
                    <button 
                        style={{
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
                            fontSize: '1.2rem'
                        }}
                        onClick={toggleDarkMode}
                    >
                        {isDarkMode ? <FaSun /> : <FaMoon />}
                    </button>

                    {/* Hamburger Menu Button */}
                    <button 
                        style={{
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
                        }}
                        onClick={toggleMobileMenu}
                    >
                        {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                        zIndex: 9999,
                        padding: '80px 20px 30px',
                        overflowY: 'auto',
                        animation: 'slideInRight 0.3s ease'
                    }}>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            maxHeight: 'calc(100vh - 100px)',
                            overflowY: 'auto',
                            paddingBottom: '30px'
                        }}>
                            {/* Search Bar for Mobile */}
                            <form onSubmit={handleSearch} style={{ marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{
                                            flex: 1,
                                            padding: '1rem',
                                            border: '2px solid rgba(255,215,0,0.3)',
                                            borderRadius: '12px',
                                            fontSize: '1rem',
                                            background: 'rgba(255,255,255,0.1)',
                                            color: 'white',
                                            outline: 'none'
                                        }}
                                    />
                                    <button 
                                        type="submit"
                                        style={{
                                            padding: '1rem',
                                            background: 'linear-gradient(135deg, #667eea, #764ba2, #ff6b6b)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '12px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <FaSearch />
                                    </button>
                                </div>
                            </form>

                            {/* Navigation Links */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
                                <Link 
                                    to="/" 
                                    style={{
                                        color: 'white',
                                        textDecoration: 'none',
                                        fontSize: '1.1rem',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        padding: '1rem 1.5rem',
                                        borderRadius: '12px',
                                        background: location.pathname === '/' ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderLeft: location.pathname === '/' ? '4px solid #FFD700' : '4px solid transparent'
                                    }}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <FaHome style={{ color: '#FFD700', fontSize: '1.2rem' }} />
                                    <span style={{ flex: 1 }}>Home</span>
                                </Link>
                                <Link 
                                    to="/products" 
                                    style={{
                                        color: 'white',
                                        textDecoration: 'none',
                                        fontSize: '1.1rem',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        padding: '1rem 1.5rem',
                                        borderRadius: '12px',
                                        background: location.pathname === '/products' ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderLeft: location.pathname === '/products' ? '4px solid #FFD700' : '4px solid transparent'
                                    }}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <FaTag style={{ color: '#FFD700', fontSize: '1.2rem' }} />
                                    <span style={{ flex: 1 }}>Products</span>
                                </Link>
                            </div>

                            {/* User Section */}
                            {user ? (
                                <div style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: '20px',
                                    padding: '1.5rem',
                                    marginTop: '1rem'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        marginBottom: '1.5rem',
                                        paddingBottom: '1.5rem',
                                        borderBottom: '1px solid rgba(255,215,0,0.2)'
                                    }}>
                                        <div style={{
                                            width: '60px',
                                            height: '60px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #FFD700, #FFA500, #FF6B6B)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.8rem',
                                            fontWeight: 'bold',
                                            color: '#1a1a2e'
                                        }}>
                                            {user.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>
                                                {user.name}
                                            </div>
                                            <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
                                                {user.email}
                                            </div>
                                            <div style={{
                                                display: 'inline-block',
                                                fontSize: '0.7rem',
                                                padding: '2px 8px',
                                                borderRadius: '20px',
                                                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                                                color: '#1a1a2e',
                                                fontWeight: 'bold',
                                                textTransform: 'uppercase',
                                                marginTop: '4px'
                                            }}>
                                                {user.role}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {/* Role-based links */}
                                        {user.role === 'seller' && (
                                            <>
                                                <Link to="/seller/dashboard" style={{
                                                    color: 'white',
                                                    textDecoration: 'none',
                                                    fontSize: '1.1rem',
                                                    fontWeight: '600',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '1rem',
                                                    padding: '1rem 1.5rem',
                                                    borderRadius: '12px',
                                                    background: 'rgba(255,255,255,0.05)',
                                                    border: '1px solid rgba(255,255,255,0.1)'
                                                }} onClick={() => setIsMobileMenuOpen(false)}>
                                                    <FaTachometerAlt style={{ color: '#FFD700' }} />
                                                    Seller Dashboard
                                                </Link>
                                                <Link to="/seller/products" style={{
                                                    color: 'white',
                                                    textDecoration: 'none',
                                                    fontSize: '1.1rem',
                                                    fontWeight: '600',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '1rem',
                                                    padding: '1rem 1.5rem',
                                                    borderRadius: '12px',
                                                    background: 'rgba(255,255,255,0.05)',
                                                    border: '1px solid rgba(255,255,255,0.1)'
                                                }} onClick={() => setIsMobileMenuOpen(false)}>
                                                    <FaBox style={{ color: '#FFD700' }} />
                                                    My Products
                                                </Link>
                                                <Link to="/seller/orders" style={{
                                                    color: 'white',
                                                    textDecoration: 'none',
                                                    fontSize: '1.1rem',
                                                    fontWeight: '600',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '1rem',
                                                    padding: '1rem 1.5rem',
                                                    borderRadius: '12px',
                                                    background: 'rgba(255,255,255,0.05)',
                                                    border: '1px solid rgba(255,255,255,0.1)'
                                                }} onClick={() => setIsMobileMenuOpen(false)}>
                                                    <FaClipboardList style={{ color: '#FFD700' }} />
                                                    Orders
                                                </Link>
                                            </>
                                        )}
                                        
                                        {user.role === 'admin' && (
                                            <>
                                                <Link to="/admin/dashboard" style={{
                                                    color: 'white',
                                                    textDecoration: 'none',
                                                    fontSize: '1.1rem',
                                                    fontWeight: '600',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '1rem',
                                                    padding: '1rem 1.5rem',
                                                    borderRadius: '12px',
                                                    background: 'rgba(255,255,255,0.05)',
                                                    border: '1px solid rgba(255,255,255,0.1)'
                                                }} onClick={() => setIsMobileMenuOpen(false)}>
                                                    <FaTachometerAlt style={{ color: '#FFD700' }} />
                                                    Admin Dashboard
                                                </Link>
                                                <Link to="/admin/users" style={{
                                                    color: 'white',
                                                    textDecoration: 'none',
                                                    fontSize: '1.1rem',
                                                    fontWeight: '600',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '1rem',
                                                    padding: '1rem 1.5rem',
                                                    borderRadius: '12px',
                                                    background: 'rgba(255,255,255,0.05)',
                                                    border: '1px solid rgba(255,255,255,0.1)'
                                                }} onClick={() => setIsMobileMenuOpen(false)}>
                                                    <FaUser style={{ color: '#FFD700' }} />
                                                    Users
                                                </Link>
                                                <Link to="/admin/products" style={{
                                                    color: 'white',
                                                    textDecoration: 'none',
                                                    fontSize: '1.1rem',
                                                    fontWeight: '600',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '1rem',
                                                    padding: '1rem 1.5rem',
                                                    borderRadius: '12px',
                                                    background: 'rgba(255,255,255,0.05)',
                                                    border: '1px solid rgba(255,255,255,0.1)'
                                                }} onClick={() => setIsMobileMenuOpen(false)}>
                                                    <FaBox style={{ color: '#FFD700' }} />
                                                    Products
                                                </Link>
                                            </>
                                        )}
                                        
                                        {user.role === 'customer' && (
                                            <>
                                                <Link to="/profile" style={{
                                                    color: 'white',
                                                    textDecoration: 'none',
                                                    fontSize: '1.1rem',
                                                    fontWeight: '600',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '1rem',
                                                    padding: '1rem 1.5rem',
                                                    borderRadius: '12px',
                                                    background: 'rgba(255,255,255,0.05)',
                                                    border: '1px solid rgba(255,255,255,0.1)'
                                                }} onClick={() => setIsMobileMenuOpen(false)}>
                                                    <FaUser style={{ color: '#FFD700' }} />
                                                    My Profile
                                                </Link>
                                                <Link to="/orders" style={{
                                                    color: 'white',
                                                    textDecoration: 'none',
                                                    fontSize: '1.1rem',
                                                    fontWeight: '600',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '1rem',
                                                    padding: '1rem 1.5rem',
                                                    borderRadius: '12px',
                                                    background: 'rgba(255,255,255,0.05)',
                                                    border: '1px solid rgba(255,255,255,0.1)'
                                                }} onClick={() => setIsMobileMenuOpen(false)}>
                                                    <FaClipboardList style={{ color: '#FFD700' }} />
                                                    My Orders
                                                </Link>
                                                <Link to="/wishlist" style={{
                                                    color: 'white',
                                                    textDecoration: 'none',
                                                    fontSize: '1.1rem',
                                                    fontWeight: '600',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '1rem',
                                                    padding: '1rem 1.5rem',
                                                    borderRadius: '12px',
                                                    background: 'rgba(255,255,255,0.05)',
                                                    border: '1px solid rgba(255,255,255,0.1)'
                                                }} onClick={() => setIsMobileMenuOpen(false)}>
                                                    <FaHeart style={{ color: '#FFD700' }} />
                                                    Wishlist
                                                    {wishlistCount > 0 && (
                                                        <span style={{
                                                            fontSize: '0.7rem',
                                                            padding: '2px 6px',
                                                            borderRadius: '20px',
                                                            background: 'linear-gradient(135deg, #ff6b6b, #ff4757)',
                                                            color: 'white',
                                                            marginLeft: 'auto'
                                                        }}>{wishlistCount}</span>
                                                    )}
                                                </Link>
                                            </>
                                        )}

                                        {/* Common links */}
                                        <Link to="/notifications" style={{
                                            color: 'white',
                                            textDecoration: 'none',
                                            fontSize: '1.1rem',
                                            fontWeight: '600',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            padding: '1rem 1.5rem',
                                            borderRadius: '12px',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)'
                                        }} onClick={() => setIsMobileMenuOpen(false)}>
                                            <FaBell style={{ color: '#FFD700' }} />
                                            Notifications
                                        </Link>
                                        
                                        <Link to="/cart" style={{
                                            color: 'white',
                                            textDecoration: 'none',
                                            fontSize: '1.1rem',
                                            fontWeight: '600',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            padding: '1rem 1.5rem',
                                            borderRadius: '12px',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)'
                                        }} onClick={() => setIsMobileMenuOpen(false)}>
                                            <FaShoppingCart style={{ color: '#FFD700' }} />
                                            Cart
                                            {cartCount > 0 && (
                                                <span style={{
                                                    fontSize: '0.7rem',
                                                    padding: '2px 6px',
                                                    borderRadius: '20px',
                                                    background: 'linear-gradient(135deg, #ff6b6b, #ff4757)',
                                                    color: 'white',
                                                    marginLeft: 'auto'
                                                }}>{cartCount}</span>
                                            )}
                                        </Link>

                                        <button 
                                            onClick={handleLogout}
                                            style={{
                                                color: 'white',
                                                textDecoration: 'none',
                                                fontSize: '1.1rem',
                                                fontWeight: '600',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '1rem',
                                                padding: '1rem 1.5rem',
                                                borderRadius: '12px',
                                                background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                width: '100%',
                                                textAlign: 'left',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <FaSignOutAlt style={{ color: '#FFD700' }} />
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                    <Link to="/login" style={{
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
                                    }} onClick={() => setIsMobileMenuOpen(false)}>
                                        <FaUser /> Login
                                    </Link>
                                    <Link to="/register" style={{
                                        padding: '1rem',
                                        borderRadius: '12px',
                                        background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                                        border: 'none',
                                        color: '#1a1a2e',
                                        textDecoration: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        fontSize: '1rem',
                                        fontWeight: '600'
                                    }} onClick={() => setIsMobileMenuOpen(false)}>
                                        <FaGift /> Register
                                    </Link>
                                </div>
                            )}

                            {/* Notification Bell for Mobile */}
                            {user && (
                                <div style={{ marginTop: '1rem' }}>
                                    <NotificationBell />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Add CSS media query for responsive behavior */}
            <style>
                {`
                    @media (min-width: 1024px) {
                        .desktop-nav {
                            display: flex !important;
                        }
                    }
                `}
            </style>
        </nav>
    );
};

export default Navbar;