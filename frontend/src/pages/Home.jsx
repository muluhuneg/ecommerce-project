import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { 
    FaStar, 
    FaArrowRight, 
    FaShoppingCart, 
    FaHeart,
    FaTruck,
    FaShieldAlt,
    FaUndo,
    FaHeadphones,
    FaMobile,
    FaLaptop,
    FaTshirt,
    FaBook,
    FaHome as FaHomeIcon,
    FaCamera,
    FaGamepad,
    FaGem,
    FaUtensils,
    FaCar,
    FaDog,
    FaFutbol,
    FaMusic,
    FaPaintBrush,
    FaGift,
    FaFire,
    FaBolt,
    FaPercent,
    FaEye,
    FaClock,
    FaShippingFast,
    FaCreditCard,
    FaSmile,
    FaMedal,
    FaCheckCircle
} from 'react-icons/fa';

const Home = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [newArrivals, setNewArrivals] = useState([]);
    const [bestSellers, setBestSellers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const heroRef = useRef(null);
    const navigate = useNavigate();

    // Format Birr price
    const formatBirr = (price) => {
        return Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    // Show toast message
    const showToastMessage = (message) => {
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => {
            setShowToast(false);
        }, 3000);
    };
    
    const heroSlides = [
        {
            id: 1,
            title: "⚡ Flash Sale",
            subtitle: "Up to 70% off on electronics. Today only!",
            image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
            cta: "Shop Now"
        },
        {
            id: 2,
            title: "New Season",
            subtitle: "Discover the latest trends in fashion",
            image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
            cta: "Explore Collection"
        },
        {
            id: 3,
            title: "Summer Sale",
            subtitle: "Up to 50% off on outdoor gear",
            image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
            cta: "Shop Sale"
        },
        {
            id: 4,
            title: "Free Shipping",
            subtitle: "On all home decor orders over $50",
            image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
            cta: "Shop Now"
        },
        {
            id: 5,
            title: "Premium Collection",
            subtitle: "Hand-picked luxury items for you",
            image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
            cta: "View Collection"
        },
        {
            id: 6,
            title: "Customer Favorites",
            subtitle: "See what everyone's buying this week",
            image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
            cta: "Shop Best Sellers"
        }
    ];
    
    // Brand logos
    const brandLogos = [
        { id: 1, name: 'Nike', image: 'https://logos-world.net/wp-content/uploads/2020/04/Nike-Logo.png' },
        { id: 2, name: 'Apple', image: 'https://www.freepnglogos.com/uploads/apple-logo-png-file-apple-logo-png-28.png' },
        { id: 3, name: 'Samsung', image: 'https://logos-world.net/wp-content/uploads/2020/09/Samsung-Logo.png' },
        { id: 4, name: 'Adidas', image: 'https://1000logos.net/wp-content/uploads/2019/06/Adidas-Logo-1991.png' },
        { id: 5, name: 'Sony', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Sony_logo.svg/2560px-Sony_logo.svg.png' },
        { id: 6, name: 'Dell', image: 'https://logos-world.net/wp-content/uploads/2020/09/Dell-Logo-1989-2016.png' }
    ];

    // Category images
    const categoryImages = {
        electronics: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        fashion: "https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        computers: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        books: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        home: "https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        gaming: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    };

    const getCategoryImage = (categoryName) => {
        const name = categoryName.toLowerCase();
        if (name.includes('electron')) return categoryImages.electronics;
        if (name.includes('fashion') || name.includes('cloth')) return categoryImages.fashion;
        if (name.includes('computer') || name.includes('laptop')) return categoryImages.computers;
        if (name.includes('book')) return categoryImages.books;
        if (name.includes('home')) return categoryImages.home;
        if (name.includes('game')) return categoryImages.gaming;
        return "https://images.unsplash.com/photo-1472851294608-062f824d29cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
    };

    const getCategoryIcon = (categoryName) => {
        const name = categoryName.toLowerCase();
        if (name.includes('electron')) return <FaMobile />;
        if (name.includes('fashion')) return <FaTshirt />;
        if (name.includes('computer')) return <FaLaptop />;
        if (name.includes('book')) return <FaBook />;
        if (name.includes('home')) return <FaHomeIcon />;
        if (name.includes('game')) return <FaGamepad />;
        if (name.includes('camera')) return <FaCamera />;
        if (name.includes('headphone')) return <FaHeadphones />;
        if (name.includes('beauty')) return <FaGem />;
        if (name.includes('sport')) return <FaFutbol />;
        return <FaGift />;
    };

    useEffect(() => {
        fetchHomeData();
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }, 6000);
        return () => clearInterval(interval);
    }, []);

    const fetchHomeData = async () => {
        try {
            const productsRes = await API.get('/products');
            const allProducts = productsRes.data;
            
            setFeaturedProducts(allProducts.slice(0, 4));
            setNewArrivals(allProducts.slice(4, 8));
            setBestSellers(allProducts.slice(2, 6));
            
            try {
                const categoriesRes = await API.get('/categories');
                if (Array.isArray(categoriesRes.data) && categoriesRes.data.length > 0) {
                    const categoriesWithDetails = categoriesRes.data.map(cat => ({
                        ...cat,
                        image: getCategoryImage(cat.name),
                        icon: getCategoryIcon(cat.name)
                    }));
                    setCategories(categoriesWithDetails);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        } catch (error) {
            console.error('Error fetching home data:', error);
            setFeaturedProducts(Array(4).fill({
                id: 1,
                name: 'Sample Product',
                price: 5999,
                image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300'
            }));
        } finally {
            setLoading(false);
        }
    };

    // Product Card with working add to cart and success popup
    const ProductCard = ({ product, index }) => {
        const [isHovered, setIsHovered] = useState(false);
        const [isAdding, setIsAdding] = useState(false);
        const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
        const { addToCart } = useCart();
        const API_BASE_URL = 'https://ecommerce-backend-39jf.onrender.com';
        
        const getImageUrl = (imagePath) => {
            if (!imagePath) return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300';
            if (imagePath.startsWith('http')) return imagePath;
            return `${API_BASE_URL}${imagePath}`;
        };
        
        const inWishlist = isInWishlist(product.id);
        
        const handleAddToCart = async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (product.stock === 0) return;
            
            setIsAdding(true);
            try {
                await addToCart(product, 1);
                showToastMessage(`${product.name} added to cart!`);
                setTimeout(() => {
                    setIsAdding(false);
                }, 500);
            } catch (error) {
                console.error('Error adding to cart:', error);
                setIsAdding(false);
                showToastMessage('Failed to add to cart');
            }
        };
        
        const handleWishlistToggle = (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (inWishlist) {
                removeFromWishlist(product.id);
                showToastMessage(`${product.name} removed from wishlist`);
            } else {
                addToWishlist(product);
                showToastMessage(`${product.name} added to wishlist!`);
            }
        };
        
        const handleCardClick = (e) => {
            // Only navigate if the click wasn't on a button
            if (!e.target.closest('button')) {
                navigate(`/product/${product.id}`);
            }
        };
        
        return (
            <div 
                style={{
                    ...styles.productCard,
                    transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                    boxShadow: isHovered ? '0 10px 20px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.05)',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                }}
                onMouseEnter={() => window.innerWidth > 768 && setIsHovered(true)}
                onMouseLeave={() => window.innerWidth > 768 && setIsHovered(false)}
                onClick={handleCardClick}
            >
                <div style={styles.productBadge}>
                    {index === 0 && <span style={styles.badgeNew}>NEW</span>}
                    {product.discount_price && <span style={styles.badgeSale}>SALE</span>}
                </div>
                <button 
                    style={{
                        ...styles.wishlistButton,
                        color: inWishlist ? '#ff6b6b' : '#999',
                        backgroundColor: 'white'
                    }}
                    onClick={handleWishlistToggle}
                >
                    <FaHeart size={window.innerWidth <= 480 ? 12 : 14} />
                </button>
                <div style={styles.productImageContainer}>
                    <img 
                        src={getImageUrl(product.image_url)}
                        alt={product.name}
                        style={{
                            ...styles.productImage,
                            transform: isHovered ? 'scale(1.05)' : 'scale(1)'
                        }}
                        onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300';
                        }}
                        loading="lazy"
                    />
                </div>
                <div style={styles.productInfo}>
                    <h3 style={styles.productName}>{product.name}</h3>
                    <div style={styles.productRating}>
                        {[1,2,3,4,5].map(star => (
                            <FaStar key={star} color={star <= 4 ? '#f1c40f' : '#e4e5e9'} size={window.innerWidth <= 480 ? 10 : 12} />
                        ))}
                        <span style={styles.reviewCount}>({product.review_count || 0})</span>
                    </div>
                    <div style={styles.productPriceRow}>
                        {product.discount_price ? (
                            <>
                                <span style={styles.discountPrice}>{formatBirr(product.discount_price)} Br</span>
                                <span style={styles.originalPrice}>{formatBirr(product.price)} Br</span>
                            </>
                        ) : (
                            <span style={styles.productPrice}>{formatBirr(product.price)} Br</span>
                        )}
                    </div>
                    <button 
                        style={{
                            ...styles.addToCartBtn,
                            background: isAdding ? '#27ae60' : (product.stock === 0 ? '#95a5a6' : '#3498db'),
                            cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                            opacity: product.stock === 0 ? 0.6 : 1
                        }}
                        onClick={handleAddToCart}
                        disabled={product.stock === 0 || isAdding}
                    >
                        <FaShoppingCart size={window.innerWidth <= 480 ? 10 : 12} /> 
                        {isAdding ? 'Added!' : (product.stock > 0 ? 'Add' : 'Out')}
                    </button>
                </div>
            </div>
        );
    };

    // Category Card with elegant hover effect - FIXED to match product card proportions
    const CategoryCard = ({ category, index }) => {
        const [isHovered, setIsHovered] = useState(false);
        
        return (
            <Link 
                to={`/products?category=${category.id}`} 
                style={{
                    ...styles.categoryCard,
                    transform: isHovered ? 'scale(1.03)' : 'scale(1)',
                    transition: 'transform 0.3s ease'
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div style={styles.categoryImageContainer}>
                    <img 
                        src={category.image} 
                        alt={category.name} 
                        style={{
                            ...styles.categoryImage,
                            transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                            transition: 'transform 0.4s ease'
                        }}
                        loading="lazy"
                    />
                    <div style={styles.categoryOverlay}>
                        <div style={styles.categoryIcon}>{category.icon}</div>
                        <h3 style={styles.categoryName}>{category.name}</h3>
                    </div>
                </div>
            </Link>
        );
    };

    // Hero Banner - NO SLIDE ANIMATION, just fade
    const Banner = ({ slide, isActive }) => (
        <div style={{
            ...styles.heroSlide,
            opacity: isActive ? 1 : 0,
            zIndex: isActive ? 1 : 0,
            transition: 'opacity 0.8s ease'
        }}>
            <img src={slide.image} alt={slide.title} style={styles.heroImage} loading="lazy" />
            <div style={styles.heroOverlay}></div>
            <div style={styles.heroContent}>
                <h1 style={styles.heroTitle}>{slide.title}</h1>
                <p style={styles.heroSubtitle}>{slide.subtitle}</p>
                <button style={styles.heroButton} onClick={() => navigate('/products')}>
                    {slide.cta} <FaArrowRight />
                </button>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p style={styles.loadingText}>Loading...</p>
            </div>
        );
    }

    return (
        <div style={styles.container} ref={heroRef}>
            {/* Toast Notification */}
            {showToast && (
                <div style={styles.toast}>
                    <FaCheckCircle style={{ color: '#27ae60', marginRight: '8px' }} />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Hero Section - Full width */}
            <div style={styles.heroSection}>
                <div style={styles.contentWrapper}>
                    {heroSlides.map((slide, index) => (
                        <Banner key={slide.id} slide={slide} isActive={index === currentSlide} />
                    ))}
                    <div style={styles.slideIndicators}>
                        {heroSlides.map((_, index) => (
                            <button
                                key={index}
                                style={{
                                    ...styles.slideIndicator,
                                    backgroundColor: index === currentSlide ? '#fff' : 'rgba(255,255,255,0.4)',
                                    width: index === currentSlide ? '30px' : '10px'
                                }}
                                onClick={() => setCurrentSlide(index)}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div style={styles.contentWrapper}>
                <div style={styles.featuresSection}>
                    <div style={styles.featureCard}>
                        <FaTruck style={styles.featureIcon} />
                        <h4 style={styles.featureTitle}>Free Shipping</h4>
                        <p style={styles.featureText}>On orders 3,000 Br+</p>
                    </div>
                    <div style={styles.featureCard}>
                        <FaShieldAlt style={styles.featureIcon} />
                        <h4 style={styles.featureTitle}>Secure Payment</h4>
                        <p style={styles.featureText}>100% protected</p>
                    </div>
                    <div style={styles.featureCard}>
                        <FaUndo style={styles.featureIcon} />
                        <h4 style={styles.featureTitle}>30 Days Return</h4>
                        <p style={styles.featureText}>Money back guarantee</p>
                    </div>
                    <div style={styles.featureCard}>
                        <FaHeadphones style={styles.featureIcon} />
                        <h4 style={styles.featureTitle}>24/7 Support</h4>
                        <p style={styles.featureText}>Dedicated help</p>
                    </div>
                </div>
            </div>

            {/* Categories Section - FIXED to match product grid proportions */}
            <div style={styles.contentWrapper}>
                <section style={styles.section}>
                    <div style={styles.sectionHeader}>
                        <h2 style={styles.sectionTitle}>Shop by Category</h2>
                        <Link to="/products" style={styles.viewAllLink}>
                            View All <FaArrowRight />
                        </Link>
                    </div>
                    
                    {categories.length === 0 ? (
                        <div style={styles.noCategories}>
                            <p>No categories available yet.</p>
                        </div>
                    ) : (
                        <div style={styles.categoriesGrid}>
                            {categories.map((category, index) => (
                                <CategoryCard key={category.id} category={category} index={index} />
                            ))}
                        </div>
                    )}
                </section>
            </div>

            {/* Featured Products */}
            <div style={styles.contentWrapper}>
                <section style={{...styles.section, backgroundColor: '#f8f9fa', borderRadius: '20px'}}>
                    <div style={styles.sectionHeader}>
                        <h2 style={styles.sectionTitle}>Featured Products</h2>
                        <Link to="/products" style={styles.viewAllLink}>
                            View All <FaArrowRight />
                        </Link>
                    </div>
                    <div style={styles.productsGrid}>
                        {featuredProducts.map((product, index) => (
                            <ProductCard key={product.id} product={product} index={index} />
                        ))}
                    </div>
                </section>
            </div>

            {/* Promotional Banner - Full width with constrained content */}
            <div style={styles.promoBanner}>
                <div style={styles.contentWrapper}>
                    <div style={styles.promoContent}>
                        <span style={styles.promoTag}>Limited Offer</span>
                        <h2 style={styles.promoTitle}>Summer Sale</h2>
                        <p style={styles.promoText}>Up to 50% off on selected items</p>
                        <button style={styles.promoButton} onClick={() => navigate('/products')}>
                            Shop Now <FaArrowRight />
                        </button>
                    </div>
                    <img 
                        src="https://images.unsplash.com/photo-1607082350899-7e105aa886ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
                        alt="Summer Sale" 
                        style={styles.promoImage}
                        loading="lazy"
                    />
                </div>
            </div>

            {/* New Arrivals */}
            <div style={styles.contentWrapper}>
                <section style={styles.section}>
                    <div style={styles.sectionHeader}>
                        <h2 style={styles.sectionTitle}>New Arrivals</h2>
                        <Link to="/products?sort=newest" style={styles.viewAllLink}>
                            View All <FaArrowRight />
                        </Link>
                    </div>
                    <div style={styles.productsGrid}>
                        {newArrivals.map((product, index) => (
                            <ProductCard key={product.id} product={product} index={index + 4} />
                        ))}
                    </div>
                </section>
            </div>

            {/* Brand Showcase */}
            <div style={styles.contentWrapper}>
                <div style={styles.brandsSection}>
                    <h2 style={styles.brandsTitle}>Trusted by Leading Brands</h2>
                    <div style={styles.brandsGrid}>
                        {brandLogos.map(brand => (
                            <div key={brand.id} style={styles.brandCard}>
                                <img src={brand.image} alt={brand.name} style={styles.brandImage} loading="lazy" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Newsletter */}
            <div style={styles.newsletterSection}>
                <div style={styles.contentWrapper}>
                    <div style={styles.newsletterContent}>
                        <h2 style={styles.newsletterTitle}>Stay Updated</h2>
                        <p style={styles.newsletterText}>
                            Subscribe to get exclusive offers and updates
                        </p>
                        <div style={styles.newsletterForm}>
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
                </div>
            </div>

            {/* CSS Animations and Responsive Styles */}
            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }

                    @keyframes slideIn {
                        from {
                            transform: translateX(100%);
                            opacity: 0;
                        }
                        to {
                            transform: translateX(0);
                            opacity: 1;
                        }
                    }

                    /* FIX: Ensure mobile menu appears above all content */
                    .mobile-menu-open {
                        overflow: hidden !important;
                        position: fixed !important;
                        width: 100% !important;
                        height: 100% !important;
                    }
                    
                    /* Lower z-index for hero content when mobile menu is open */
                    body.mobile-menu-open .hero-section,
                    body.mobile-menu-open .hero-slide,
                    body.mobile-menu-open .hero-content,
                    body.mobile-menu-open .slide-indicators {
                        z-index: 1 !important;
                    }

                    /* Responsive Styles */
                    @media (max-width: 1024px) {
                        .products-grid,
                        .categories-grid,
                        .brands-grid {
                            grid-template-columns: repeat(3, 1fr) !important;
                        }
                    }

                    @media (max-width: 768px) {
                        .hero-title {
                            font-size: 2rem !important;
                        }
                        .hero-subtitle {
                            font-size: 1rem !important;
                        }
                        .hero-button {
                            padding: 10px 20px !important;
                            font-size: 0.9rem !important;
                        }
                        .features-section {
                            grid-template-columns: repeat(2, 1fr) !important;
                            gap: 15px !important;
                        }
                        .products-grid {
                            grid-template-columns: repeat(2, 1fr) !important;
                            gap: 12px !important;
                        }
                        .categories-grid {
                            grid-template-columns: repeat(2, 1fr) !important;
                            gap: 12px !important;
                        }
                        .brands-grid {
                            grid-template-columns: repeat(3, 1fr) !important;
                            gap: 12px !important;
                        }
                        .section-title {
                            font-size: 1.5rem !important;
                        }
                        .promo-banner {
                            flex-direction: column !important;
                        }
                        .promo-content {
                            left: 5% !important;
                            right: 5% !important;
                            text-align: center !important;
                        }
                        .promo-title {
                            font-size: 1.8rem !important;
                        }
                        .newsletter-form {
                            flex-direction: column !important;
                        }
                    }

                    @media (max-width: 600px) {
                        .hero-title {
                            font-size: 1.8rem !important;
                        }
                        .hero-subtitle {
                            font-size: 0.9rem !important;
                        }
                    }

                    @media (max-width: 480px) {
                        .hero-title {
                            font-size: 1.5rem !important;
                            margin-bottom: 8px !important;
                        }
                        .hero-subtitle {
                            font-size: 0.8rem !important;
                            margin-bottom: 12px !important;
                        }
                        .hero-button {
                            padding: 8px 16px !important;
                            font-size: 0.8rem !important;
                        }
                        .hero-section {
                            height: 350px !important;
                        }
                        .hero-content {
                            left: 5% !important;
                            right: 5% !important;
                            width: 90% !important;
                            max-width: 100% !important;
                        }
                        .features-section {
                            grid-template-columns: 1fr !important;
                            gap: 12px !important;
                            margin: 30px auto !important;
                        }
                        .feature-card {
                            padding: 15px !important;
                        }
                        .feature-icon {
                            font-size: 1.5rem !important;
                            margin-bottom: 8px !important;
                        }
                        .feature-title {
                            font-size: 0.9rem !important;
                            margin-bottom: 4px !important;
                        }
                        .feature-text {
                            font-size: 0.8rem !important;
                        }
                        .products-grid {
                            grid-template-columns: repeat(2, 1fr) !important;
                            gap: 8px !important;
                            padding: 0 5px !important;
                        }
                        .categories-grid {
                            grid-template-columns: repeat(2, 1fr) !important;
                            gap: 8px !important;
                        }
                        .brands-grid {
                            grid-template-columns: repeat(2, 1fr) !important;
                            gap: 8px !important;
                        }
                        .section-header {
                            flex-direction: column !important;
                            gap: 10px !important;
                            text-align: center !important;
                        }
                        .section-title {
                            font-size: 1.3rem !important;
                        }
                        .view-all-link {
                            font-size: 0.85rem !important;
                        }
                        .product-card {
                            margin: 0 !important;
                            max-width: 100% !important;
                            width: 100% !important;
                        }
                        .product-image-container {
                            height: auto !important;
                            aspect-ratio: 1/1 !important;
                            width: 100% !important;
                        }
                        .product-info {
                            padding: 8px !important;
                        }
                        .product-name {
                            font-size: 0.7rem !important;
                            margin-bottom: 4px !important;
                            white-space: nowrap !important;
                            overflow: hidden !important;
                            text-overflow: ellipsis !important;
                        }
                        .product-rating svg {
                            width: 8px !important;
                            height: 8px !important;
                        }
                        .review-count {
                            font-size: 0.55rem !important;
                        }
                        .product-price {
                            font-size: 0.8rem !important;
                        }
                        .discount-price {
                            font-size: 0.8rem !important;
                        }
                        .original-price {
                            font-size: 0.6rem !important;
                        }
                        .add-to-cart-btn {
                            padding: 4px !important;
                            font-size: 0.65rem !important;
                            gap: 3px !important;
                        }
                        .add-to-cart-btn svg {
                            width: 8px !important;
                            height: 8px !important;
                        }
                        .wishlist-button {
                            width: 24px !important;
                            height: 24px !important;
                            font-size: 0.7rem !important;
                            top: 4px !important;
                            right: 4px !important;
                        }
                        .product-badge span {
                            font-size: 0.5rem !important;
                            padding: 2px 4px !important;
                        }
                        .category-card {
                            height: 130px !important;
                            max-width: 100% !important;
                            width: 100% !important;
                        }
                        .category-icon {
                            font-size: 1.3rem !important;
                        }
                        .category-name {
                            font-size: 0.8rem !important;
                        }
                        .promo-banner {
                            height: 280px !important;
                            margin: 20px 0 !important;
                        }
                        .promo-content {
                            padding: 0 10px !important;
                        }
                        .promo-tag {
                            font-size: 0.6rem !important;
                            padding: 2px 6px !important;
                        }
                        .promo-title {
                            font-size: 1.3rem !important;
                        }
                        .promo-text {
                            font-size: 0.8rem !important;
                        }
                        .promo-button {
                            padding: 6px 15px !important;
                            font-size: 0.75rem !important;
                        }
                        .brands-section {
                            margin: 30px auto !important;
                        }
                        .brands-title {
                            font-size: 1.2rem !important;
                            margin-bottom: 15px !important;
                        }
                        .brand-card {
                            padding: 6px !important;
                        }
                        .brand-image {
                            height: 18px !important;
                        }
                        .newsletter-section {
                            padding: 30px 0 !important;
                        }
                        .newsletter-title {
                            font-size: 1.3rem !important;
                        }
                        .newsletter-text {
                            font-size: 0.8rem !important;
                            margin-bottom: 15px !important;
                        }
                        .newsletter-input {
                            padding: 8px !important;
                            font-size: 0.8rem !important;
                        }
                        .newsletter-button {
                            padding: 8px !important;
                            font-size: 0.8rem !important;
                        }
                    }

                    @media (max-width: 360px) {
                        .hero-title {
                            font-size: 1.3rem !important;
                        }
                        .hero-subtitle {
                            font-size: 0.75rem !important;
                        }
                        .hero-button {
                            padding: 6px 12px !important;
                            font-size: 0.75rem !important;
                        }
                        .hero-section {
                            height: 250px !important;
                        }
                        .products-grid {
                            gap: 5px !important;
                        }
                        .product-image-container {
                            aspect-ratio: 1/1 !important;
                        }
                        .product-name {
                            font-size: 0.65rem !important;
                        }
                        .product-price {
                            font-size: 0.75rem !important;
                        }
                        .category-card {
                            height: 110px !important;
                        }
                        .category-icon {
                            font-size: 1.1rem !important;
                        }
                        .category-name {
                            font-size: 0.7rem !important;
                        }
                        .brands-grid {
                            grid-template-columns: repeat(2, 1fr) !important;
                        }
                        .brand-card {
                            padding: 4px !important;
                        }
                        .brand-image {
                            height: 15px !important;
                        }
                    }
                `}
            </style>
        </div>
    );
};

const styles = {
    container: {
        width: '100%',
        overflow: 'hidden',
        position: 'relative'
    },
    
    // Toast Notification
    toast: {
        position: 'fixed',
        top: '80px',
        right: '20px',
        backgroundColor: 'white',
        color: '#333',
        padding: '12px 20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        animation: 'slideIn 0.3s ease',
        fontSize: '0.9rem',
        '@media (max-width: 480px)': {
            top: '70px',
            right: '10px',
            left: '10px',
            width: 'calc(100% - 20px)',
            fontSize: '0.8rem'
        }
    },
    
    // Content wrapper for consistent width
    contentWrapper: {
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px',
        '@media (max-width: 768px)': {
            padding: '0 15px'
        },
        '@media (max-width: 480px)': {
            padding: '0 10px'
        }
    },
    
    // Hero Section - Full width with constrained content
    heroSection: {
        position: 'relative',
        height: '600px',
        overflow: 'hidden',
        width: '100%',
        '@media (max-width: 768px)': {
            height: '450px'
        },
        '@media (max-width: 480px)': {
            height: '350px'
        },
        '@media (max-width: 360px)': {
            height: '250px'
        }
    },
    heroSlide: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
    },
    heroImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
    },
    heroOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(to right, rgba(0,0,0,0.6), rgba(0,0,0,0.3))'
    },
    heroContent: {
        position: 'absolute',
        top: '50%',
        left: '10%',
        transform: 'translateY(-50%)',
        color: 'white',
        maxWidth: '600px',
        zIndex: 2,
        '@media (max-width: 768px)': {
            left: '5%',
            right: '5%',
            maxWidth: '90%'
        }
    },
    heroTitle: {
        fontSize: '3.5rem',
        marginBottom: '15px',
        fontWeight: '700',
        textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
        '@media (max-width: 1024px)': {
            fontSize: '3rem'
        },
        '@media (max-width: 768px)': {
            fontSize: '2rem'
        },
        '@media (max-width: 600px)': {
            fontSize: '1.8rem'
        },
        '@media (max-width: 480px)': {
            fontSize: '1.5rem',
            marginBottom: '8px'
        },
        '@media (max-width: 360px)': {
            fontSize: '1.3rem'
        }
    },
    heroSubtitle: {
        fontSize: '1.3rem',
        marginBottom: '25px',
        opacity: 0.95,
        '@media (max-width: 768px)': {
            fontSize: '1rem'
        },
        '@media (max-width: 600px)': {
            fontSize: '0.9rem'
        },
        '@media (max-width: 480px)': {
            fontSize: '0.8rem',
            marginBottom: '12px'
        },
        '@media (max-width: 360px)': {
            fontSize: '0.75rem'
        }
    },
    heroButton: {
        padding: '12px 35px',
        background: '#fff',
        color: '#333',
        border: 'none',
        borderRadius: '4px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        transition: 'background 0.3s ease',
        '@media (max-width: 768px)': {
            padding: '10px 20px',
            fontSize: '0.9rem'
        },
        '@media (max-width: 600px)': {
            padding: '8px 16px',
            fontSize: '0.85rem'
        },
        '@media (max-width: 480px)': {
            padding: '8px 16px',
            fontSize: '0.8rem',
            gap: '5px'
        },
        '@media (max-width: 360px)': {
            padding: '6px 12px',
            fontSize: '0.75rem'
        }
    },
    slideIndicators: {
        position: 'absolute',
        bottom: '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '10px',
        zIndex: 2
    },
    slideIndicator: {
        height: '4px',
        borderRadius: '2px',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
    },

    // Features Section
    featuresSection: {
        width: '100%',
        margin: '50px auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '30px',
        '@media (max-width: 1024px)': {
            gap: '20px'
        },
        '@media (max-width: 768px)': {
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '15px'
        },
        '@media (max-width: 480px)': {
            gridTemplateColumns: '1fr',
            gap: '12px',
            margin: '30px auto'
        }
    },
    featureCard: {
        textAlign: 'center',
        padding: '25px',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
        transition: 'box-shadow 0.3s ease',
        '@media (max-width: 768px)': {
            padding: '20px'
        },
        '@media (max-width: 480px)': {
            padding: '15px'
        }
    },
    featureIcon: {
        fontSize: '2.2rem',
        color: '#3498db',
        marginBottom: '15px',
        '@media (max-width: 768px)': {
            fontSize: '1.8rem'
        },
        '@media (max-width: 480px)': {
            fontSize: '1.5rem',
            marginBottom: '8px'
        }
    },
    featureTitle: {
        fontSize: '1.1rem',
        fontWeight: '600',
        color: '#333',
        marginBottom: '8px',
        '@media (max-width: 768px)': {
            fontSize: '1rem'
        },
        '@media (max-width: 480px)': {
            fontSize: '0.9rem',
            marginBottom: '4px'
        }
    },
    featureText: {
        fontSize: '0.9rem',
        color: '#666',
        margin: 0,
        '@media (max-width: 768px)': {
            fontSize: '0.85rem'
        },
        '@media (max-width: 480px)': {
            fontSize: '0.8rem'
        }
    },

    // Section Styles
    section: {
        width: '100%',
        margin: '60px auto',
        padding: '40px 0',
        '@media (max-width: 768px)': {
            margin: '40px auto',
            padding: '30px 0'
        },
        '@media (max-width: 480px)': {
            margin: '30px auto',
            padding: '20px 0'
        }
    },
    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        '@media (max-width: 480px)': {
            flexDirection: 'column',
            gap: '10px',
            textAlign: 'center',
            marginBottom: '20px'
        }
    },
    sectionTitle: {
        fontSize: '2rem',
        color: '#333',
        fontWeight: '600',
        margin: 0,
        '@media (max-width: 1024px)': {
            fontSize: '1.8rem'
        },
        '@media (max-width: 768px)': {
            fontSize: '1.5rem'
        },
        '@media (max-width: 480px)': {
            fontSize: '1.3rem'
        }
    },
    viewAllLink: {
        color: '#3498db',
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        fontSize: '0.95rem',
        fontWeight: '500',
        transition: 'color 0.3s ease',
        '@media (max-width: 480px)': {
            fontSize: '0.85rem'
        }
    },

    // Categories Grid - FIXED to match product grid proportions
    categoriesGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px',
        '@media (max-width: 1024px)': {
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '15px'
        },
        '@media (max-width: 768px)': {
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px'
        },
        '@media (max-width: 480px)': {
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px',
            padding: '0 5px'
        }
    },
    categoryCard: {
        position: 'relative',
        height: '220px',
        borderRadius: '8px',
        overflow: 'hidden',
        textDecoration: 'none',
        boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
        width: '100%',
        '@media (max-width: 1024px)': {
            height: '180px'
        },
        '@media (max-width: 768px)': {
            height: '150px'
        },
        '@media (max-width: 480px)': {
            height: '130px',
            maxWidth: '100%',
            margin: '0'
        },
        '@media (max-width: 360px)': {
            height: '110px'
        }
    },
    categoryImageContainer: {
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden'
    },
    categoryImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
    },
    categoryOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
        padding: '15px',
        color: 'white',
        textAlign: 'center',
        '@media (max-width: 768px)': {
            padding: '10px'
        },
        '@media (max-width: 480px)': {
            padding: '8px'
        }
    },
    categoryIcon: {
        fontSize: '1.8rem',
        marginBottom: '5px',
        opacity: 0.9,
        '@media (max-width: 768px)': {
            fontSize: '1.5rem'
        },
        '@media (max-width: 480px)': {
            fontSize: '1.3rem',
            marginBottom: '2px'
        },
        '@media (max-width: 360px)': {
            fontSize: '1.1rem'
        }
    },
    categoryName: {
        fontSize: '1rem',
        margin: 0,
        fontWeight: '500',
        '@media (max-width: 768px)': {
            fontSize: '0.85rem'
        },
        '@media (max-width: 480px)': {
            fontSize: '0.8rem'
        },
        '@media (max-width: 360px)': {
            fontSize: '0.7rem'
        }
    },

   // Products Grid - Increased size to match categories
productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
    padding: '0',
    '@media (max-width: 1024px)': {
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '15px'
    },
    '@media (max-width: 768px)': {
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px',
        padding: '0 5px'
    },
    '@media (max-width: 480px)': {
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '8px',
        padding: '0 5px'
    },
    '@media (max-width: 360px)': {
        gap: '5px',
        padding: '0 3px'
    }
},

// Product card - INCREASED SIZE to match categories
productCard: {
    background: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    position: 'relative',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    width: '100%',
    maxWidth: '100%', // Changed from 280px to 100%
    margin: '0',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    '@media (max-width: 768px)': {
        maxWidth: '100%',
        margin: 0,
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    },
    '@media (max-width: 480px)': {
        maxWidth: '100%',
        borderRadius: '6px',
        margin: 0,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    },
    '@media (max-width: 360px)': {
        borderRadius: '4px'
    }
},

// Product image container - Make taller like categories
productImageContainer: {
    width: '100%',
    height: '220px', // Fixed height like categories
    overflow: 'hidden',
    backgroundColor: '#f8f9fa',
    position: 'relative',
    '@media (max-width: 1024px)': {
        height: '200px'
    },
    '@media (max-width: 768px)': {
        height: '180px'
    },
    '@media (max-width: 480px)': {
        height: '150px' // Increased from 130px to 150px
    },
    '@media (max-width: 360px)': {
        height: '130px' // Increased from 110px to 130px
    }
},

// Product name - Larger font
productName: {
    fontSize: '1rem',
    marginBottom: '8px',
    color: '#333',
    fontWeight: '600',
    lineHeight: '1.4',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    '@media (max-width: 768px)': {
        fontSize: '0.9rem',
        marginBottom: '5px'
    },
    '@media (max-width: 480px)': {
        fontSize: '0.8rem',
        marginBottom: '4px'
    },
    '@media (max-width: 360px)': {
        fontSize: '0.75rem'
    }
},

// Product price - Larger
productPrice: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#333',
    '@media (max-width: 768px)': {
        fontSize: '1.1rem'
    },
    '@media (max-width: 480px)': {
        fontSize: '1rem'
    },
    '@media (max-width: 360px)': {
        fontSize: '0.9rem'
    }
},

// Discount price - Larger
discountPrice: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#e74c3c',
    '@media (max-width: 768px)': {
        fontSize: '1.1rem'
    },
    '@media (max-width: 480px)': {
        fontSize: '1rem'
    },
    '@media (max-width: 360px)': {
        fontSize: '0.9rem'
    }
},

// Add to cart button - Larger
addToCartBtn: {
    width: '100%',
    padding: '10px', // Increased from 8px
    background: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    '@media (max-width: 768px)': {
        padding: '8px',
        fontSize: '0.8rem',
        gap: '6px'
    },
    '@media (max-width: 480px)': {
        padding: '6px',
        fontSize: '0.75rem',
        gap: '4px',
        borderRadius: '4px'
    },
    '@media (max-width: 360px)': {
        padding: '5px',
        fontSize: '0.7rem',
        gap: '3px'
    },
    ':hover': {
        background: '#2980b9'
    },
    ':active': {
        transform: 'scale(0.98)'
    }
},

// Product info section - More padding
productInfo: {
    padding: '15px', // Increased from 12px
    '@media (max-width: 768px)': {
        padding: '12px'
    },
    '@media (max-width: 480px)': {
        padding: '10px 8px'
    },
    '@media (max-width: 360px)': {
        padding: '8px 6px'
    }
},
    // Promo Banner
    promoBanner: {
        position: 'relative',
        height: '350px',
        margin: '40px 0',
        overflow: 'hidden',
        background: '#f8f9fa',
        width: '100%',
        '@media (max-width: 768px)': {
            height: '300px'
        },
        '@media (max-width: 480px)': {
            height: '280px',
            margin: '20px 0'
        },
        '@media (max-width: 360px)': {
            height: '250px'
        }
    },
    promoContent: {
        position: 'absolute',
        top: '50%',
        left: '10%',
        transform: 'translateY(-50%)',
        zIndex: 2,
        maxWidth: '500px',
        '@media (max-width: 768px)': {
            left: '5%',
            right: '5%',
            maxWidth: '90%',
            textAlign: 'center'
        },
        '@media (max-width: 480px)': {
            padding: '0 10px'
        }
    },
    promoTag: {
        display: 'inline-block',
        padding: '4px 12px',
        background: '#e74c3c',
        color: 'white',
        fontSize: '0.8rem',
        fontWeight: '600',
        borderRadius: '20px',
        marginBottom: '15px',
        '@media (max-width: 480px)': {
            fontSize: '0.6rem',
            padding: '2px 6px',
            marginBottom: '8px'
        }
    },
    promoTitle: {
        fontSize: '2.5rem',
        color: '#333',
        marginBottom: '10px',
        fontWeight: '700',
        '@media (max-width: 768px)': {
            fontSize: '2rem'
        },
        '@media (max-width: 480px)': {
            fontSize: '1.3rem',
            marginBottom: '5px'
        }
    },
    promoText: {
        fontSize: '1.1rem',
        color: '#666',
        marginBottom: '20px',
        '@media (max-width: 768px)': {
            fontSize: '1rem'
        },
        '@media (max-width: 480px)': {
            fontSize: '0.8rem',
            marginBottom: '12px'
        }
    },
    promoButton: {
        padding: '10px 30px',
        background: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '1rem',
        fontWeight: '500',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        '@media (max-width: 768px)': {
            padding: '8px 20px'
        },
        '@media (max-width: 480px)': {
            padding: '6px 15px',
            fontSize: '0.75rem',
            gap: '4px'
        }
    },
    promoImage: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: '50%',
        height: '100%',
        objectFit: 'cover',
        opacity: 0.8,
        '@media (max-width: 768px)': {
            width: '40%'
        },
        '@media (max-width: 480px)': {
            width: '100%',
            opacity: 0.2
        }
    },

    // Brands Section
    brandsSection: {
        width: '100%',
        margin: '60px auto',
        textAlign: 'center',
        '@media (max-width: 480px)': {
            margin: '30px auto'
        }
    },
    brandsTitle: {
        fontSize: '1.8rem',
        color: '#333',
        marginBottom: '30px',
        fontWeight: '600',
        '@media (max-width: 768px)': {
            fontSize: '1.5rem'
        },
        '@media (max-width: 480px)': {
            fontSize: '1.2rem',
            marginBottom: '15px'
        }
    },
    brandsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '20px',
        '@media (max-width: 1024px)': {
            gridTemplateColumns: 'repeat(4, 1fr)'
        },
        '@media (max-width: 768px)': {
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px'
        },
        '@media (max-width: 480px)': {
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px'
        }
    },
    brandCard: {
        padding: '15px',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 3px 10px rgba(0,0,0,0.05)',
        transition: 'box-shadow 0.3s ease',
        '@media (max-width: 768px)': {
            padding: '12px'
        },
        '@media (max-width: 480px)': {
            padding: '6px'
        },
        '@media (max-width: 360px)': {
            padding: '4px'
        }
    },
    brandImage: {
        width: '100%',
        height: '35px',
        objectFit: 'contain',
        opacity: 0.7,
        transition: 'opacity 0.3s ease',
        '@media (max-width: 768px)': {
            height: '25px'
        },
        '@media (max-width: 480px)': {
            height: '18px'
        },
        '@media (max-width: 360px)': {
            height: '15px'
        }
    },

    // Newsletter Section
    newsletterSection: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '60px 0',
        marginTop: '40px',
        width: '100%',
        '@media (max-width: 768px)': {
            padding: '40px 0'
        },
        '@media (max-width: 480px)': {
            padding: '30px 0',
            marginTop: '20px'
        }
    },
    newsletterContent: {
        maxWidth: '500px',
        margin: '0 auto',
        textAlign: 'center',
        color: 'white',
        '@media (max-width: 480px)': {
            maxWidth: '100%',
            padding: '0 15px'
        }
    },
    newsletterTitle: {
        fontSize: '2rem',
        marginBottom: '10px',
        fontWeight: '600',
        '@media (max-width: 768px)': {
            fontSize: '1.8rem'
        },
        '@media (max-width: 480px)': {
            fontSize: '1.3rem',
            marginBottom: '5px'
        }
    },
    newsletterText: {
        fontSize: '1rem',
        marginBottom: '25px',
        opacity: 0.9,
        '@media (max-width: 480px)': {
            fontSize: '0.8rem',
            marginBottom: '15px'
        }
    },
    newsletterForm: {
        display: 'flex',
        gap: '10px',
        '@media (max-width: 480px)': {
            flexDirection: 'column',
            gap: '8px'
        }
    },
    newsletterInput: {
        flex: 1,
        padding: '12px 15px',
        border: 'none',
        borderRadius: '4px',
        fontSize: '0.95rem',
        outline: 'none',
        '@media (max-width: 480px)': {
            width: '100%',
            padding: '8px',
            fontSize: '0.8rem'
        }
    },
    newsletterButton: {
        padding: '12px 25px',
        background: '#fff',
        color: '#667eea',
        border: 'none',
        borderRadius: '4px',
        fontSize: '0.95rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'transform 0.3s ease',
        '@media (max-width: 480px)': {
            padding: '8px',
            fontSize: '0.8rem'
        }
    },

    // Loading
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '500px'
    },
    spinner: {
        border: '3px solid #f3f3f3',
        borderTop: '3px solid #3498db',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        animation: 'spin 1s linear infinite'
    },
    loadingText: {
        marginTop: '15px',
        color: '#666',
        fontSize: '1rem'
    },

    // No Categories
    noCategories: {
        textAlign: 'center',
        padding: '40px',
        color: '#666',
        background: '#f8f9fa',
        borderRadius: '8px',
        '@media (max-width: 480px)': {
            padding: '20px',
            fontSize: '0.9rem'
        }
    }
};

export default Home;