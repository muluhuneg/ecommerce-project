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
                stars.push(<FaStar key={i} color="#FFD700" size={window.innerWidth <= 480 ? 8 : 12} />);
            } else if (i === fullStars && hasHalfStar) {
                stars.push(<FaStarHalfAlt key={i} color="#FFD700" size={window.innerWidth <= 480 ? 8 : 12} />);
            } else {
                stars.push(<FaStar key={i} color="#e4e5e9" size={window.innerWidth <= 480 ? 8 : 12} />);
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
            await addToCart(product, 1);
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
        if (!e.target.closest('button')) {
            navigate(`/product/${product.id}`);
        }
    };

    const discountPercentage = getDiscountPercentage();
    const hasDiscount = discountPercentage > 0;
    const isInWishlistFlag = isInWishlist(product.id);

    const styles = {
        card: {
            border: 'none',
            borderRadius: '8px',
            padding: '0',
            textAlign: 'center',
            background: 'white',
            position: 'relative',
            transition: 'all 0.2s ease',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            cursor: 'pointer',
            '@media (min-width: 481px)': {
                borderRadius: '12px',
                boxShadow: isHovered ? '0 20px 30px -10px rgba(0,0,0,0.2)' : '0 5px 15px rgba(0,0,0,0.08)',
                transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
            }
        },
        imageWrapper: {
            position: 'relative',
            width: '100%',
            aspectRatio: '1/1',
            overflow: 'hidden',
            backgroundColor: '#f8f9fa',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
            '@media (min-width: 481px)': {
                borderTopLeftRadius: '12px',
                borderTopRightRadius: '12px',
            }
        },
        image: {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
        },
        overlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.3))',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.3s ease',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            '@media (min-width: 769px)': {
                display: 'flex',
            }
        },
        quickViewBtn: {
            background: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
            color: '#333',
            fontSize: '16px',
            transform: isHovered ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.3s ease',
            opacity: isHovered ? 1 : 0,
            zIndex: 10,
            '@media (max-width: 480px)': {
                display: 'none',
            }
        },
        wishlistBtn: {
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            zIndex: 10,
            fontSize: '12px',
            transition: 'all 0.2s ease',
            color: isInWishlistFlag ? '#ff4757' : '#747d8c',
            backgroundColor: 'white',
            '@media (min-width: 481px)': {
                top: '12px',
                right: '12px',
                width: '35px',
                height: '35px',
                fontSize: '14px',
            }
        },
        badgeContainer: {
            position: 'absolute',
            top: '8px',
            left: '8px',
            zIndex: 5,
            display: 'flex',
            flexDirection: 'row',
            gap: '4px',
            flexWrap: 'wrap',
            '@media (min-width: 481px)': {
                top: '12px',
                left: '12px',
                flexDirection: 'column',
                gap: '5px',
            }
        },
        badgeNew: {
            background: 'linear-gradient(135deg, #2ecc71, #27ae60)',
            color: 'white',
            padding: '2px 6px',
            borderRadius: '12px',
            fontSize: '0.5rem',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            boxShadow: '0 2px 5px rgba(46, 204, 113, 0.3)',
            whiteSpace: 'nowrap',
            '@media (min-width: 481px)': {
                padding: '4px 10px',
                fontSize: '0.65rem',
                borderRadius: '20px',
            }
        },
        badgeSale: {
            background: 'linear-gradient(135deg, #ff4757, #ee5a24)',
            color: 'white',
            padding: '2px 6px',
            borderRadius: '12px',
            fontSize: '0.5rem',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            boxShadow: '0 2px 5px rgba(255, 71, 87, 0.3)',
            whiteSpace: 'nowrap',
            '@media (min-width: 481px)': {
                padding: '4px 10px',
                fontSize: '0.65rem',
                borderRadius: '20px',
            }
        },
        content: {
            padding: '8px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            background: 'white',
            '@media (min-width: 481px)': {
                padding: '12px',
            }
        },
        category: {
            fontSize: '0.6rem',
            color: '#747d8c',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '3px',
            textAlign: 'left',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            '@media (min-width: 481px)': {
                fontSize: '0.7rem',
                marginBottom: '5px',
            }
        },
        name: {
            fontSize: '0.7rem',
            margin: '0 0 4px 0',
            color: '#2c3e50',
            fontWeight: '600',
            lineHeight: '1.3',
            textAlign: 'left',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            '@media (min-width: 481px)': {
                fontSize: '0.9rem',
                margin: '0 0 6px 0',
                whiteSpace: 'normal',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                minHeight: '2.4rem',
            }
        },
        ratingContainer: {
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            marginBottom: '4px',
            textAlign: 'left',
            flexWrap: 'wrap',
            '@media (min-width: 481px)': {
                gap: '5px',
                marginBottom: '8px',
            }
        },
        ratingStars: {
            display: 'flex',
            gap: '1px',
            '@media (min-width: 481px)': {
                gap: '2px',
            }
        },
        reviewCount: {
            fontSize: '0.55rem',
            color: '#a4b0be',
            marginLeft: '2px',
            '@media (min-width: 481px)': {
                fontSize: '0.7rem',
                marginLeft: '5px',
            }
        },
        priceContainer: {
            display: 'flex',
            alignItems: 'baseline',
            gap: '4px',
            marginBottom: '6px',
            textAlign: 'left',
            flexWrap: 'wrap',
            '@media (min-width: 481px)': {
                gap: '8px',
                marginBottom: '12px',
            }
        },
        currentPrice: {
            fontSize: '0.8rem',
            fontWeight: '700',
            color: '#2c3e50',
            '@media (min-width: 481px)': {
                fontSize: '1rem',
            }
        },
        originalPrice: {
            fontSize: '0.6rem',
            color: '#a4b0be',
            textDecoration: 'line-through',
            '@media (min-width: 481px)': {
                fontSize: '0.85rem',
            }
        },
        stockStatus: {
            fontSize: '0.55rem',
            color: '#27ae60',
            marginBottom: '4px',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            '@media (min-width: 481px)': {
                fontSize: '0.7rem',
                marginBottom: '6px',
                gap: '5px',
            }
        },
        outOfStock: {
            color: '#ff4757'
        },
        addButton: {
            background: product.stock === 0 ? '#95a5a6' : isAddingToCart ? '#27ae60' : '#3498db',
            color: 'white',
            border: 'none',
            padding: '6px 8px',
            borderRadius: '4px',
            cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
            width: '100%',
            fontSize: '0.65rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            transition: 'all 0.2s ease',
            marginTop: 'auto',
            opacity: product.stock === 0 ? 0.6 : 1,
            boxShadow: product.stock > 0 ? '0 3px 8px rgba(52, 152, 219, 0.3)' : 'none',
            zIndex: 10,
            '@media (min-width: 481px)': {
                padding: '8px 12px',
                fontSize: '0.8rem',
                gap: '6px',
                borderRadius: '6px',
                background: product.stock === 0 ? '#95a5a6' : isAddingToCart ? '#27ae60' : 'linear-gradient(135deg, #3498db, #2980b9)',
            }
        }
    };

    const discount = hasDiscount ? discountPercentage : 0;

    return (
        <div 
            style={styles.card}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
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
                            width: '6px', 
                            height: '6px', 
                            background: '#27ae60', 
                            borderRadius: '50%', 
                            display: 'inline-block' 
                        }}></span>
                        In Stock
                    </div>
                ) : (
                    <div style={{...styles.stockStatus, ...styles.outOfStock}}>
                        <span style={{ 
                            width: '6px', 
                            height: '6px', 
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
                    {isAddingToCart ? 'Added!' : (product.stock > 0 ? 'Add' : 'Out')}
                </button>
            </div>
        </div>
    );
};

export default ProductCard;