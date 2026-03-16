import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { FaHeart, FaShoppingCart, FaRegHeart, FaStar, FaStarHalfAlt, FaEye } from 'react-icons/fa';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const [imageError, setImageError] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

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
                stars.push(<FaStar key={i} color="#FFD700" size={14} />);
            } else if (i === fullStars && hasHalfStar) {
                stars.push(<FaStarHalfAlt key={i} color="#FFD700" size={14} />);
            } else {
                stars.push(<FaStar key={i} color="#e4e5e9" size={14} />);
            }
        }
        
        return stars;
    };

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product, 1);
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

    const discountPercentage = getDiscountPercentage();
    const hasDiscount = discountPercentage > 0;

    const styles = {
        card: {
            border: 'none',
            borderRadius: '12px',
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
            maxWidth: '300px',
            margin: '0 auto',
            width: '100%',
            transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
            cursor: 'pointer'
        },
        imageWrapper: {
            position: 'relative',
            width: '100%',
            aspectRatio: '1/1',
            overflow: 'hidden',
            backgroundColor: '#f8f9fa',
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px'
        },
        image: {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.6s ease',
            transform: isHovered ? 'scale(1.1)' : 'scale(1)'
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
        },
        quickViewBtn: {
            background: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '45px',
            height: '45px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
            color: '#333',
            fontSize: '1.2rem',
            transform: isHovered ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.3s ease',
            opacity: isHovered ? 1 : 0
        },
        wishlistBtn: {
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
            zIndex: 3,
            fontSize: '1.1rem',
            transition: 'all 0.2s ease',
            color: isInWishlist(product.id) ? '#ff4757' : '#747d8c',
            backgroundColor: 'white',
            transform: isHovered ? 'scale(1.1)' : 'scale(1)'
        },
        badgeContainer: {
            position: 'absolute',
            top: '15px',
            left: '15px',
            zIndex: 3,
            display: 'flex',
            flexDirection: 'column',
            gap: '5px'
        },
        badgeNew: {
            background: 'linear-gradient(135deg, #2ecc71, #27ae60)',
            color: 'white',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '0.7rem',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            boxShadow: '0 3px 10px rgba(46, 204, 113, 0.3)'
        },
        badgeSale: {
            background: 'linear-gradient(135deg, #ff4757, #ee5a24)',
            color: 'white',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '0.7rem',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            boxShadow: '0 3px 10px rgba(255, 71, 87, 0.3)'
        },
        content: {
            padding: '16px 15px 20px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            background: 'white'
        },
        category: {
            fontSize: '0.7rem',
            color: '#747d8c',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '5px',
            textAlign: 'left'
        },
        name: {
            fontSize: '1rem',
            margin: '0 0 8px 0',
            color: '#2c3e50',
            fontWeight: '600',
            lineHeight: '1.4',
            textAlign: 'left',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            minHeight: '2.8rem'
        },
        ratingContainer: {
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            marginBottom: '10px',
            textAlign: 'left'
        },
        ratingStars: {
            display: 'flex',
            gap: '2px'
        },
        reviewCount: {
            fontSize: '0.7rem',
            color: '#a4b0be',
            marginLeft: '5px'
        },
        priceContainer: {
            display: 'flex',
            alignItems: 'baseline',
            gap: '8px',
            marginBottom: '15px',
            textAlign: 'left',
            flexWrap: 'wrap'
        },
        currentPrice: {
            fontSize: '1.3rem',
            fontWeight: '700',
            color: '#2c3e50'
        },
        originalPrice: {
            fontSize: '0.9rem',
            color: '#a4b0be',
            textDecoration: 'line-through'
        },
        discountBadge: {
            background: '#ff4757',
            color: 'white',
            padding: '2px 8px',
            borderRadius: '20px',
            fontSize: '0.7rem',
            fontWeight: 'bold',
            marginLeft: 'auto'
        },
        addButton: {
            background: 'linear-gradient(135deg, #3498db, #2980b9)',
            color: 'white',
            border: 'none',
            padding: '10px 15px',
            borderRadius: '8px',
            cursor: 'pointer',
            width: '100%',
            fontSize: '0.9rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.3s ease',
            marginTop: 'auto',
            boxShadow: '0 5px 15px rgba(52, 152, 219, 0.3)',
            transform: isHovered ? 'translateY(-2px)' : 'translateY(0)'
        },
        stockStatus: {
            fontSize: '0.7rem',
            color: '#27ae60',
            marginBottom: '8px',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
        },
        outOfStock: {
            color: '#ff4757'
        }
    };

    const discount = hasDiscount ? discountPercentage : 0;

    return (
        <div 
            style={styles.card}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Image Section */}
            <div style={styles.imageWrapper}>
                <img 
                    src={!imageError 
                        ? (product.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400') 
                        : 'https://via.placeholder.com/400x400?text=Product+Image'
                    } 
                    alt={product.name}
                    style={styles.image}
                    onError={() => setImageError(true)}
                />
                
                {/* Overlay with Quick View */}
                <div style={styles.overlay}>
                    <button 
                        style={styles.quickViewBtn}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.location.href = `/product/${product.id}`;
                        }}
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
                        if (!isInWishlist(product.id)) {
                            e.currentTarget.style.color = '#ff4757';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!isInWishlist(product.id)) {
                            e.currentTarget.style.color = '#747d8c';
                        }
                    }}
                >
                    {isInWishlist(product.id) ? <FaHeart /> : <FaRegHeart />}
                </button>
            </div>

            {/* Content Section */}
            <div style={styles.content}>
                {product.category && (
                    <div style={styles.category}>{product.category.name || 'Category'}</div>
                )}
                
                <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
                    <h3 style={styles.name}>{product.name}</h3>
                </Link>
                
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
                        <span style={{ width: '8px', height: '8px', background: '#27ae60', borderRadius: '50%', display: 'inline-block' }}></span>
                        In Stock ({product.stock})
                    </div>
                ) : (
                    <div style={{...styles.stockStatus, ...styles.outOfStock}}>
                        <span style={{ width: '8px', height: '8px', background: '#ff4757', borderRadius: '50%', display: 'inline-block' }}></span>
                        Out of Stock
                    </div>
                )}
                
                {/* Price */}
                <div style={styles.priceContainer}>
                    <span style={styles.currentPrice}>
                        {formatPrice(hasDiscount ? product.discount_price : product.price)} Br
                    </span>
                    {hasDiscount && (
                        <>
                            <span style={styles.originalPrice}>{formatPrice(product.price)} Br</span>
                        </>
                    )}
                </div>
                
                {/* Add to Cart Button */}
                <button 
                    style={{
                        ...styles.addButton,
                        opacity: product.stock === 0 ? 0.5 : 1,
                        cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                        background: product.stock === 0 ? '#95a5a6' : 'linear-gradient(135deg, #3498db, #2980b9)'
                    }}
                    onClick={product.stock > 0 ? handleAddToCart : null}
                    disabled={product.stock === 0}
                >
                    <FaShoppingCart size={14} /> 
                    {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>
            </div>
        </div>
    );
};

export default ProductCard;