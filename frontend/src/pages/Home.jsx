import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
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
    FaMedal
} from 'react-icons/fa';

const Home = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [newArrivals, setNewArrivals] = useState([]);
    const [bestSellers, setBestSellers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);
    const heroRef = useRef(null);

    // Format Birr price
    const formatBirr = (price) => {
        return Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    // Hero slides with beautiful images
    const heroSlides = [
        {
            id: 1,
            title: "Summer Sale",
            subtitle: "Up to 50% off on selected items",
            image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
            cta: "Shop Now"
        },
        {
            id: 2,
            title: "New Arrivals",
            subtitle: "Discover the latest trends",
            image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
            cta: "Explore"
        },
        {
            id: 3,
            title: "Free Shipping",
            subtitle: "On orders over 3,000 Br",
            image: "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
            cta: "Learn More"
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

    // Product Card with elegant hover effect
    const ProductCard = ({ product, index }) => {
        const [isHovered, setIsHovered] = useState(false);
        
        return (
            <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
                <div 
                    style={{
                        ...styles.productCard,
                        animation: `fadeIn 0.8s ease-out ${index * 0.1}s both`,
                        transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
                        boxShadow: isHovered ? '0 20px 30px rgba(0,0,0,0.1)' : '0 10px 20px rgba(0,0,0,0.05)',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <div style={styles.productBadge}>
                        {index === 0 && <span style={styles.badgeNew}>NEW</span>}
                        {product.discount_price && <span style={styles.badgeSale}>SALE</span>}
                    </div>
                    <button style={{
                        ...styles.wishlistButton,
                        color: isHovered ? '#ff6b6b' : '#ddd',
                        transition: 'color 0.3s ease'
                    }} onClick={(e) => e.preventDefault()}>
                        <FaHeart />
                    </button>
                    <div style={styles.productImageContainer}>
                        <img 
                            src={product.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300'} 
                            alt={product.name}
                            style={{
                                ...styles.productImage,
                                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                                transition: 'transform 0.4s ease'
                            }}
                            onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300';
                            }}
                        />
                    </div>
                    <div style={styles.productInfo}>
                        <h3 style={styles.productName}>{product.name}</h3>
                        <div style={styles.productRating}>
                            {[1,2,3,4,5].map(star => (
                                <FaStar key={star} color={star <= 4 ? '#f1c40f' : '#e4e5e9'} size={14} />
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
                                background: isHovered ? '#2ecc71' : '#3498db',
                                transition: 'background 0.3s ease'
                            }}
                            onClick={(e) => e.preventDefault()}
                        >
                            <FaShoppingCart /> Add to Cart
                        </button>
                    </div>
                </div>
            </Link>
        );
    };

    // Category Card with elegant hover effect
    const CategoryCard = ({ category, index }) => {
        const [isHovered, setIsHovered] = useState(false);
        
        return (
            <Link 
                to={`/products?category=${category.id}`} 
                style={{
                    ...styles.categoryCard,
                    animation: `fadeIn 0.8s ease-out ${index * 0.1 + 0.2}s both`,
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
                    />
                    <div style={styles.categoryOverlay}>
                        <div style={styles.categoryIcon}>{category.icon}</div>
                        <h3 style={styles.categoryName}>{category.name}</h3>
                    </div>
                </div>
            </Link>
        );
    };

    // Hero Banner
    const Banner = ({ slide, isActive }) => (
        <div style={{
            ...styles.heroSlide,
            opacity: isActive ? 1 : 0,
            zIndex: isActive ? 1 : 0,
            transition: 'opacity 0.8s ease'
        }}>
            <img src={slide.image} alt={slide.title} style={styles.heroImage} />
            <div style={styles.heroOverlay}></div>
            <div style={styles.heroContent}>
                <h1 style={styles.heroTitle}>{slide.title}</h1>
                <p style={styles.heroSubtitle}>{slide.subtitle}</p>
                <button style={styles.heroButton}>
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
            {/* Hero Section */}
            <div style={styles.heroSection}>
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

            {/* Features Section */}
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

            {/* Categories Section */}
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

            {/* Featured Products */}
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

            {/* Promotional Banner */}
            <div style={styles.promoBanner}>
                <div style={styles.promoContent}>
                    <span style={styles.promoTag}>Limited Offer</span>
                    <h2 style={styles.promoTitle}>Summer Sale</h2>
                    <p style={styles.promoText}>Up to 50% off on selected items</p>
                    <button style={styles.promoButton}>
                        Shop Now <FaArrowRight />
                    </button>
                </div>
                <img 
                    src="https://images.unsplash.com/photo-1607082350899-7e105aa886ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
                    alt="Summer Sale" 
                    style={styles.promoImage}
                />
            </div>

            {/* New Arrivals */}
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

            {/* Brand Showcase */}
            <div style={styles.brandsSection}>
                <h2 style={styles.brandsTitle}>Trusted by Leading Brands</h2>
                <div style={styles.brandsGrid}>
                    {brandLogos.map(brand => (
                        <div key={brand.id} style={styles.brandCard}>
                            <img src={brand.image} alt={brand.name} style={styles.brandImage} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Newsletter */}
            <div style={styles.newsletterSection}>
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

            {/* CSS Animations */}
            <style>
                {`
                    @keyframes fadeIn {
                        from {
                            opacity: 0;
                            transform: translateY(20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}
            </style>
        </div>
    );
};

const styles = {
    container: {
        width: '100%',
        overflow: 'hidden'
    },
    
    // Hero Section
    heroSection: {
        position: 'relative',
        height: '600px',
        overflow: 'hidden'
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
        zIndex: 2
    },
    heroTitle: {
        fontSize: '3.5rem',
        marginBottom: '15px',
        fontWeight: '700',
        textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
    },
    heroSubtitle: {
        fontSize: '1.3rem',
        marginBottom: '25px',
        opacity: 0.95
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
        transition: 'background 0.3s ease'
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
        maxWidth: '1200px',
        margin: '50px auto',
        padding: '0 20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '30px'
    },
    featureCard: {
        textAlign: 'center',
        padding: '25px',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
        transition: 'box-shadow 0.3s ease'
    },
    featureIcon: {
        fontSize: '2.2rem',
        color: '#3498db',
        marginBottom: '15px'
    },
    featureTitle: {
        fontSize: '1.1rem',
        fontWeight: '600',
        color: '#333',
        marginBottom: '8px'
    },
    featureText: {
        fontSize: '0.9rem',
        color: '#666',
        margin: 0
    },

    // Section Styles
    section: {
        maxWidth: '1200px',
        margin: '60px auto',
        padding: '40px 20px'
    },
    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
    },
    sectionTitle: {
        fontSize: '2rem',
        color: '#333',
        fontWeight: '600',
        margin: 0
    },
    viewAllLink: {
        color: '#3498db',
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        fontSize: '0.95rem',
        fontWeight: '500',
        transition: 'color 0.3s ease'
    },

    // Categories Grid
    categoriesGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '20px'
    },
    categoryCard: {
        position: 'relative',
        height: '220px',
        borderRadius: '8px',
        overflow: 'hidden',
        textDecoration: 'none',
        boxShadow: '0 5px 15px rgba(0,0,0,0.08)'
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
        textAlign: 'center'
    },
    categoryIcon: {
        fontSize: '1.8rem',
        marginBottom: '5px',
        opacity: 0.9
    },
    categoryName: {
        fontSize: '1rem',
        margin: 0,
        fontWeight: '500'
    },

    // Products Grid
    productsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px'
    },
    productCard: {
        background: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 5px 15px rgba(0,0,0,0.05)'
    },
    productBadge: {
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 2,
        display: 'flex',
        gap: '5px'
    },
    badgeNew: {
        background: '#2ecc71',
        color: 'white',
        padding: '3px 6px',
        borderRadius: '3px',
        fontSize: '0.7rem',
        fontWeight: 'bold'
    },
    badgeSale: {
        background: '#e74c3c',
        color: 'white',
        padding: '3px 6px',
        borderRadius: '3px',
        fontSize: '0.7rem',
        fontWeight: 'bold'
    },
    wishlistButton: {
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 2,
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    },
    productImageContainer: {
        height: '200px',
        overflow: 'hidden'
    },
    productImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
    },
    productInfo: {
        padding: '15px'
    },
    productName: {
        fontSize: '0.95rem',
        marginBottom: '8px',
        color: '#333',
        fontWeight: '500',
        lineHeight: '1.4'
    },
    productRating: {
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
        marginBottom: '8px'
    },
    reviewCount: {
        fontSize: '0.75rem',
        color: '#999',
        marginLeft: '5px'
    },
    productPriceRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px'
    },
    productPrice: {
        fontSize: '1.1rem',
        fontWeight: '600',
        color: '#333'
    },
    discountPrice: {
        fontSize: '1.1rem',
        fontWeight: '600',
        color: '#e74c3c'
    },
    originalPrice: {
        fontSize: '0.85rem',
        color: '#999',
        textDecoration: 'line-through'
    },
    addToCartBtn: {
        width: '100%',
        padding: '8px',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '5px',
        fontSize: '0.9rem',
        fontWeight: '500'
    },

    // Promo Banner
    promoBanner: {
        position: 'relative',
        height: '350px',
        margin: '40px 0',
        overflow: 'hidden',
        background: '#f8f9fa'
    },
    promoContent: {
        position: 'absolute',
        top: '50%',
        left: '10%',
        transform: 'translateY(-50%)',
        zIndex: 2,
        maxWidth: '500px'
    },
    promoTag: {
        display: 'inline-block',
        padding: '4px 12px',
        background: '#e74c3c',
        color: 'white',
        fontSize: '0.8rem',
        fontWeight: '600',
        borderRadius: '20px',
        marginBottom: '15px'
    },
    promoTitle: {
        fontSize: '2.5rem',
        color: '#333',
        marginBottom: '10px',
        fontWeight: '700'
    },
    promoText: {
        fontSize: '1.1rem',
        color: '#666',
        marginBottom: '20px'
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
        gap: '8px'
    },
    promoImage: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: '50%',
        height: '100%',
        objectFit: 'cover',
        opacity: 0.8
    },

    // Brands Section
    brandsSection: {
        maxWidth: '1200px',
        margin: '60px auto',
        padding: '0 20px',
        textAlign: 'center'
    },
    brandsTitle: {
        fontSize: '1.8rem',
        color: '#333',
        marginBottom: '30px',
        fontWeight: '600'
    },
    brandsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '20px'
    },
    brandCard: {
        padding: '15px',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 3px 10px rgba(0,0,0,0.05)',
        transition: 'box-shadow 0.3s ease'
    },
    brandImage: {
        width: '100%',
        height: '35px',
        objectFit: 'contain',
        opacity: 0.7,
        transition: 'opacity 0.3s ease'
    },

    // Newsletter Section
    newsletterSection: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '60px 20px',
        marginTop: '40px'
    },
    newsletterContent: {
        maxWidth: '500px',
        margin: '0 auto',
        textAlign: 'center',
        color: 'white'
    },
    newsletterTitle: {
        fontSize: '2rem',
        marginBottom: '10px',
        fontWeight: '600'
    },
    newsletterText: {
        fontSize: '1rem',
        marginBottom: '25px',
        opacity: 0.9
    },
    newsletterForm: {
        display: 'flex',
        gap: '10px'
    },
    newsletterInput: {
        flex: 1,
        padding: '12px 15px',
        border: 'none',
        borderRadius: '4px',
        fontSize: '0.95rem',
        outline: 'none'
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
        transition: 'transform 0.3s ease'
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
        borderRadius: '8px'
    }
};

export default Home;