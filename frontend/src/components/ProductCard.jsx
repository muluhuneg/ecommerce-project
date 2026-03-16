import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { FaHeart, FaShoppingCart, FaRegHeart, FaStar, FaStarHalfAlt, FaEye } from 'react-icons/fa';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const [imageError, setImageError] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const navigate = useNavigate();

    // Format price with commas
    const formatPrice = (price) => {
        return Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    // Calculate discount percentage
    const getDiscountPercentage = () => {
        if (product.discount_price && product.price) {
            return Math.round(((product.price - product.discount_price) / product.price) * 100);
        }
        return 0;
    };

    // Generate star rating
    const renderRating = () => {
        const rating = product.rating || 4.5;
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const stars = [];
        
        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<FaStar key={i} color="#FFD700" size={window.innerWidth <= 480 ? 10 : 14} />);
            } else if (i === fullStars && hasHalfStar) {
                stars.push(<FaStarHalfAlt key={i} color="#FFD700" size={window.innerWidth <= 480 ? 10 : 14} />);
            } else {
                stars.push(<FaStar key={i} color="#e4e5e9" size={window.innerWidth <= 480 ? 10 : 14} />);
            }
        }
        
        return stars;
    };

    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (product.stock <= 0) return;
        
        setIsAddingToCart(true);
        
        try {
            // Add visual feedback
            await addToCart(product, 1);
            
            // Show success feedback
            setTimeout(() => {
                setIsAddingToCart(false);
            }, 500);
        } catch (error) {
            console.error('Error adding to cart:', error);
            setIsAddingToCart(false);
        }
    };

    const handleWishlistToggle = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isInWishlist(product.id)) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist(product);
        }
    };

    const handleQuickView = (e) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(`/product/${product.id}`);
    };

    const handleCardClick = (e) => {
        // Only navigate if the click wasn't on a button
        if (!e.target.closest('button')) {
            navigate(`/product/${product.id}`);
        }
    };

    const discountPercentage = getDiscountPercentage();
    const hasDiscount = discountPercentage > 0;
    const isInWishlistFlag = isInWishlist(product.id);

    // Responsive styles based on screen size
    const getResponsiveStyles = () => {
        const isMobile = window.innerWidth <= 480;
        const isTablet = window.innerWidth <= 768 && window.innerWidth > 480;
        
        return {
            cardWidth: isMobile ? '100%' : isTablet ? '220px' : '280px',
            imageSize: isMobile ? '130px' : isTablet ? '150px' : '200px',
            fontSize: {
                name: isMobile ? '0.8rem' : isTablet ? '0.9rem' : '1rem',
                price: isMobile ? '0.9rem' : isTablet ? '1rem' : '1.1rem',
                category: isMobile ? '0.6rem' : '0.7rem',
                button: isMobile ? '0.7rem' : isTablet ? '0.8rem' : '0.9rem',
                badge: isMobile ? '0.5rem' : '0.6rem'
            },
            padding: {
                content: isMobile ? '8px' : isTablet ? '12px' : '15px',
                button: isMobile ? '6px' : isTablet ? '8px' : '10px'
            },
            iconSize: {
                wishlist: isMobile ? 12 : 14,
                cart: isMobile ? 10 : 12,
                quickView: isMobile ? 14 : 16
            }
        };
    };

    const responsive = getResponsiveStyles();

    const styles = {
        card: {
            border: 'none',
            borderRadius: window.innerWidth <= 480 ? '8px' : '12px',
            padding: '0',
            textAlign: 'center',
            background: 'white',
            position: 'relative',
            transition: 'all 0.3s ease',
            overflow: 'hidden',
            boxShadow: isHovered 
                ? '0 20px 30px -10px rgba(0,0,0,0.2)' 
                : '0 5px 15px rgba(0,0,0,0.08)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            maxWidth: responsive.cardWidth,
            margin: '0 auto',
            width: '100%',
            transform: isHovered && window.innerWidth > 768 ? 'translateY(-5px)' : 'translateY(0)',
            cursor: 'pointer'
        },
        imageWrapper: {
            position: 'relative',
            width: '100%',
            aspectRatio: '1/1',
            overflow: 'hidden',
            backgroundColor: '#f8f9fa',
            borderTopLeftRadius: window.innerWidth <= 480 ? '8px' : '12px',
            borderTopRightRadius: window.innerWidth <= 480 ? '8px' : '12px'
        },
        image: {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.6s ease',
            transform: isHovered && window.innerWidth > 768 ? 'scale(1.1)' : 'scale(1)'
        },
        overlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.3))',
            opacity: isHovered && window.innerWidth > 768 ? 1 : 0,
            transition: 'opacity 0.3s ease',
            display: window.innerWidth <= 768 ? 'none' : 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
        },
        quickViewBtn: {
            background: 'white',
            border: 'none',
            borderRadius: '50%',
            width: window.innerWidth <= 480 ? '35px' : '45px',
            height: window.innerWidth <= 480 ? '35px' : '45px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
            color: '#333',
            fontSize: responsive.iconSize.quickView,
            transform: isHovered ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.3s ease',
            opacity: isHovered ? 1 : 0,
            zIndex: 10
        },
        wishlistBtn: {
            position: 'absolute',
            top: window.innerWidth <= 480 ? '8px' : '15px',
            right: window.innerWidth <= 480 ? '8px' : '15px',
            background: 'white',
            border: 'none',
            borderRadius: '50%',
            width: window.innerWidth <= 480 ? '30px' : '38px',
            height: window.innerWidth <= 480 ? '30px' : '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
            zIndex: 10,
            fontSize: responsive.iconSize.wishlist,
            transition: 'all 0.2s ease',
            color: isInWishlistFlag ? '#ff4757' : '#747d8c',
            backgroundColor: 'white',
            transform: isHovered && window.innerWidth > 768 ? 'scale(1.1)' : 'scale(1)'
        },
        badgeContainer: {
            position: 'absolute',
            top: window.innerWidth <= 480 ? '8px' : '15px',
            left: window.innerWidth <= 480 ? '8px' : '15px',
            zIndex: 5,
            display: 'flex',
            flexDirection: window.innerWidth <= 480 ? 'row' : 'column',
            gap: window.innerWidth <= 480 ? '4px' : '5px',
            flexWrap: 'wrap'
        },
        badgeNew: {
            background: 'linear-gradient(135deg, #2ecc71, #27ae60)',
            color: 'white',
            padding: window.innerWidth <= 480 ? '2px 6px' : '4px 10px',
            borderRadius: '20px',
            fontSize: responsive.fontSize.badge,
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            boxShadow: '0 3px 10px rgba(46, 204, 113, 0.3)',
            whiteSpace: 'nowrap'
        },
        badgeSale: {
            background: 'linear-gradient(135deg, #ff4757, #ee5a24)',
            color: 'white',
            padding: window.innerWidth <= 480 ? '2px 6px' : '4px 10px',
            borderRadius: '20px',
            fontSize: responsive.fontSize.badge,
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            boxShadow: '0 3px 10px rgba(255, 71, 87, 0.3)',
            whiteSpace: 'nowrap'
        },
        content: {
            padding: responsive.padding.content,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            background: 'white'
        },
        category: {
            fontSize: responsive.fontSize.category,
            color: '#747d8c',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: window.innerWidth <= 480 ? '3px' : '5px',
            textAlign: 'left',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        },
        name: {
            fontSize: responsive.fontSize.name,
            margin: window.innerWidth <= 480 ? '0 0 4px 0' : '0 0 8px 0',
            color: '#2c3e50',
            fontWeight: '600',
            lineHeight: '1.3',
            textAlign: 'left',
            display: '-webkit-box',
            WebkitLineClamp: window.innerWidth <= 480 ? 1 : 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            minHeight: 'auto'
        },
        ratingContainer: {
            display: 'flex',
            alignItems: 'center',
            gap: window.innerWidth <= 480 ? '3px' : '5px',
            marginBottom: window.innerWidth <= 480 ? '4px' : '8px',
            textAlign: 'left',
            flexWrap: 'wrap'
        },
        ratingStars: {
            display: 'flex',
            gap: '2px'
        },
        reviewCount: {
            fontSize: window.innerWidth <= 480 ? '0.6rem' : '0.7rem',
            color: '#a4b0be',
            marginLeft: window.innerWidth <= 480 ? '2px' : '5px'
        },
        priceContainer: {
            display: 'flex',
            alignItems: 'baseline',
            gap: window.innerWidth <= 480 ? '4px' : '8px',
            marginBottom: window.innerWidth <= 480 ? '8px' : '12px',
            textAlign: 'left',
            flexWrap: 'wrap'
        },
        currentPrice: {
            fontSize: responsive.fontSize.price,
            fontWeight: '700',
            color: '#2c3e50'
        },
        originalPrice: {
            fontSize: window.innerWidth <= 480 ? '0.7rem' : '0.9rem',
            color: '#a4b0be',
            textDecoration: 'line-through'
        },
        discountBadge: {
            background: '#ff4757',
            color: 'white',
            padding: window.innerWidth <= 480 ? '2px 6px' : '2px 8px',
            borderRadius: '20px',
            fontSize: window.innerWidth <= 480 ? '0.6rem' : '0.7rem',
            fontWeight: 'bold',
            marginLeft: 'auto'
        },
        addButton: {
            background: product.stock === 0 ? '#95a5a6' : isAddingToCart ? '#27ae60' : 'linear-gradient(135deg, #3498db, #2980b9)',
            color: 'white',
            border: 'none',
            padding: responsive.padding.button,
            borderRadius: window.innerWidth <= 480 ? '4px' : '6px',
            cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
            width: '100%',
            fontSize: responsive.fontSize.button,
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: window.innerWidth <= 480 ? '4px' : '6px',
            transition: 'all 0.3s ease',
            marginTop: 'auto',
            opacity: product.stock === 0 ? 0.6 : 1,
            boxShadow: product.stock > 0 ? '0 5px 15px rgba(52, 152, 219, 0.3)' : 'none',
            zIndex: 10,
            position: 'relative'
        },
        stockStatus: {
            fontSize: window.innerWidth <= 480 ? '0.6rem' : '0.7rem',
            color: '#27ae60',
            marginBottom: window.innerWidth <= 480 ? '4px' : '6px',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: window.innerWidth <= 480 ? '3px' : '5px'
        },
        outOfStock: {
            color: '#ff4757'
        }
    };

    const discount = hasDiscount ? discountPercentage : 0;

    return (
        <div 
            style={styles.card}
            onMouseEnter={() => window.innerWidth > 768 && setIsHovered(true)}
            onMouseLeave={() => window.innerWidth > 768 && setIsHovered(false)}
            onClick={handleCardClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    handleCardClick(e);
                }
            }}
        >
            {/* Image Section */}
            <div style={styles.imageWrapper}>
                <img 
                    src={!imageError 
                        ? (product.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400') 
                        : 'https://via.placeholder.com/400x400?text=Product'
                    } 
                    alt={product.name}
                    style={styles.image}
                    onError={() => setImageError(true)}
                    loading="lazy"
                />
                
                {/* Overlay with Quick View - Desktop only */}
                <div style={styles.overlay}>
                    <button 
                        style={styles.quickViewBtn}
                        onClick={handleQuickView}
                        aria-label="Quick view"
                    >
                        <FaEye />
                    </button>
                </div>

                {/* Badges */}
                <div style={styles.badgeContainer}>
                    {product.is_new && <span style={styles.badgeNew}>New</span>}
                    {hasDiscount && <span style={styles.badgeSale}>-{discount}%</span>}
                </div>

                {/* Wishlist Button */}
                <button 
                    style={styles.wishlistBtn}
                    onClick={handleWishlistToggle}
                    onMouseEnter={(e) => {
                        if (window.innerWidth > 768 && !isInWishlistFlag) {
                            e.currentTarget.style.color = '#ff4757';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (window.innerWidth > 768 && !isInWishlistFlag) {
                            e.currentTarget.style.color = '#747d8c';
                        }
                    }}
                    aria-label={isInWishlistFlag ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                    {isInWishlistFlag ? <FaHeart /> : <FaRegHeart />}
                </button>
            </div>

            {/* Content Section */}
            <div style={styles.content}>
                {product.category && (
                    <div style={styles.category}>{product.category.name || 'Category'}</div>
                )}
                
                <h3 style={styles.name}>{product.name}</h3>
                
                {/* Rating */}
                <div style={styles.ratingContainer}>
                    <div style={styles.ratingStars}>
                        {renderRating()}
                    </div>
                    <span style={styles.reviewCount}>({product.review_count || 0})</span>
                </div>

                {/* Stock Status */}
                {product.stock > 0 ? (
                    <div style={styles.stockStatus}>
                        <span style={{ 
                            width: window.innerWidth <= 480 ? '6px' : '8px', 
                            height: window.innerWidth <= 480 ? '6px' : '8px', 
                            background: '#27ae60', 
                            borderRadius: '50%', 
                            display: 'inline-block' 
                        }}></span>
                        In Stock ({product.stock})
                    </div>
                ) : (
                    <div style={{...styles.stockStatus, ...styles.outOfStock}}>
                        <span style={{ 
                            width: window.innerWidth <= 480 ? '6px' : '8px', 
                            height: window.innerWidth <= 480 ? '6px' : '8px', 
                            background: '#ff4757', 
                            borderRadius: '50%', 
                            display: 'inline-block' 
                        }}></span>
                        Out of Stock
                    </div>
                )}
                
                {/* Price */}
                <div style={styles.priceContainer}>
                    <span style={styles.currentPrice}>
                        {formatPrice(hasDiscount ? product.discount_price : product.price)} Br
                    </span>
                    {hasDiscount && (
                        <span style={styles.originalPrice}>{formatPrice(product.price)} Br</span>
                    )}
                </div>
                
                {/* Add to Cart Button */}
                <button 
                    style={styles.addButton}
                    onClick={handleAddToCart}
                    disabled={product.stock === 0 || isAddingToCart}
                    aria-label={product.stock > 0 ? 'Add to cart' : 'Out of stock'}
                >
                    <FaShoppingCart size={window.innerWidth <= 480 ? 10 : 12} /> 
                    {isAddingToCart ? 'Adding...' : (product.stock > 0 ? 'Add to Cart' : 'Out of Stock')}
                </button>
            </div>
        </div>
    );
};

export default ProductCard;