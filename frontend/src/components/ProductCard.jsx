import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { FaHeart, FaShoppingCart, FaRegHeart, FaStar } from 'react-icons/fa';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const [imageError, setImageError] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const formatPrice = (price) => {
        return Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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

    const styles = {
        card: {
            border: '1px solid #f0f0f0',
            borderRadius: '10px',
            overflow: 'hidden',
            background: 'white',
            position: 'relative',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            maxWidth: '200px', // Fixed width for mobile
            width: '100%',
            margin: '0 auto'
        },
        imageWrapper: {
            position: 'relative',
            width: '100%',
            aspectRatio: '1/1', // Square image
            backgroundColor: '#fafafa',
            overflow: 'hidden'
        },
        image: {
            width: '100%',
            height: '100%',
            objectFit: 'cover'
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
            zIndex: 2,
            fontSize: '0.8rem',
            color: isInWishlist(product.id) ? '#ff4757' : '#999'
        },
        badge: {
            position: 'absolute',
            top: '8px',
            left: '8px',
            background: '#ff4757',
            color: 'white',
            padding: '2px 6px',
            borderRadius: '3px',
            fontSize: '0.55rem',
            fontWeight: 'bold',
            zIndex: 2
        },
        content: {
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
        },
        name: {
            fontSize: '0.8rem',
            color: '#333',
            fontWeight: '500',
            margin: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        },
        rating: {
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            fontSize: '0.7rem'
        },
        ratingStars: {
            display: 'flex',
            gap: '1px',
            color: '#FFD700'
        },
        reviewCount: {
            color: '#999',
            fontSize: '0.6rem',
            marginLeft: '2px'
        },
        price: {
            fontSize: '0.9rem',
            fontWeight: '600',
            color: '#2c3e50',
            margin: '2px 0'
        },
        addButton: {
            background: '#3498db',
            color: 'white',
            border: 'none',
            padding: '6px 0',
            borderRadius: '5px',
            cursor: 'pointer',
            width: '100%',
            fontSize: '0.7rem',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            marginTop: '4px',
            transition: 'background 0.2s ease'
        }
    };

    // Generate 5 stars
    const renderStars = () => {
        const rating = product.rating || 4;
        const stars = [];
        for (let i = 0; i < 5; i++) {
            stars.push(
                <FaStar 
                    key={i} 
                    size={10} 
                    color={i < rating ? '#FFD700' : '#e4e5e9'} 
                />
            );
        }
        return stars;
    };

    return (
        <div 
            style={styles.card}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Image */}
            <div style={styles.imageWrapper}>
                <img 
                    src={!imageError 
                        ? (product.image_url || 'https://via.placeholder.com/200') 
                        : 'https://via.placeholder.com/200'
                    } 
                    alt={product.name}
                    style={styles.image}
                    onError={() => setImageError(true)}
                />
                
                {/* Sale Badge */}
                {product.discount_price && (
                    <span style={styles.badge}>SALE</span>
                )}
                
                {/* Wishlist Button */}
                <button 
                    style={styles.wishlistBtn}
                    onClick={handleWishlistToggle}
                >
                    {isInWishlist(product.id) ? <FaHeart /> : <FaRegHeart />}
                </button>
            </div>

            {/* Content */}
            <div style={styles.content}>
                <h4 style={styles.name}>{product.name}</h4>
                
                {/* Rating */}
                <div style={styles.rating}>
                    <div style={styles.ratingStars}>
                        {renderStars()}
                    </div>
                    <span style={styles.reviewCount}>({product.review_count || 0})</span>
                </div>
                
                {/* Price */}
                <div style={styles.price}>
                    {formatPrice(product.discount_price || product.price)} Br
                </div>
                
                {/* Add to Cart */}
                <button 
                    style={styles.addButton}
                    onClick={handleAddToCart}
                >
                    <FaShoppingCart size={10} /> Add
                </button>
            </div>
        </div>
    );
};

export default ProductCard;