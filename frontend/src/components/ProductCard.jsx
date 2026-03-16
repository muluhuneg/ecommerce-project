import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { FaHeart, FaShoppingCart, FaRegHeart } from 'react-icons/fa';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

    // Format price (assuming it's in Birr or USD)
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
            border: '1px solid #eee',
            borderRadius: '10px',
            padding: '0',
            textAlign: 'center',
            background: 'white',
            position: 'relative',
            transition: 'transform 0.2s, box-shadow 0.2s',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            maxWidth: '280px',
            margin: '0 auto',
            width: '100%'
        },
        wishlistBtn: {
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
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            zIndex: 2,
            fontSize: '1rem',
            transition: 'all 0.2s ease',
            '@media (max-width: 768px)': {
                width: '28px',
                height: '28px',
                fontSize: '0.9rem',
                top: '8px',
                right: '8px'
            }
        },
        link: {
            textDecoration: 'none',
            color: 'inherit',
            display: 'flex',
            flexDirection: 'column',
            flex: 1
        },
        imageContainer: {
            width: '100%',
            aspectRatio: '1/1',
            overflow: 'hidden',
            backgroundColor: '#f8f9fa'
        },
        image: {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease'
        },
        content: {
            padding: '12px 10px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column'
        },
        name: {
            fontSize: '0.95rem',
            margin: '0 0 6px 0',
            color: '#333',
            fontWeight: '500',
            lineHeight: '1.3',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            height: '2.4rem',
            '@media (max-width: 768px)': {
                fontSize: '0.85rem',
                height: '2.2rem',
                marginBottom: '4px'
            }
        },
        priceContainer: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            marginBottom: '10px',
            flexWrap: 'wrap'
        },
        price: {
            color: '#e44d26',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            '@media (max-width: 768px)': {
                fontSize: '1rem'
            }
        },
        originalPrice: {
            color: '#999',
            fontSize: '0.85rem',
            textDecoration: 'line-through',
            '@media (max-width: 768px)': {
                fontSize: '0.75rem'
            }
        },
        discountBadge: {
            background: '#e44d26',
            color: 'white',
            padding: '2px 6px',
            borderRadius: '3px',
            fontSize: '0.7rem',
            fontWeight: 'bold',
            marginLeft: 'auto'
        },
        addButton: {
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            width: '100%',
            fontSize: '0.9rem',
            marginTop: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'background 0.2s ease',
            '@media (max-width: 768px)': {
                padding: '6px 10px',
                fontSize: '0.8rem',
                gap: '4px'
            }
        },
        badge: {
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
            padding: '2px 6px',
            borderRadius: '3px',
            fontSize: '0.65rem',
            fontWeight: 'bold'
        },
        badgeSale: {
            background: '#e74c3c',
            color: 'white',
            padding: '2px 6px',
            borderRadius: '3px',
            fontSize: '0.65rem',
            fontWeight: 'bold'
        }
    };

    // Check if product has discount
    const hasDiscount = product.discount_price && product.discount_price < product.price;

    return (
        <div 
            style={styles.card}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
            }}
        >
            {/* Badges */}
            <div style={styles.badge}>
                {product.is_new && <span style={styles.badgeNew}>NEW</span>}
                {hasDiscount && <span style={styles.badgeSale}>SALE</span>}
            </div>

            {/* Wishlist Button */}
            <button 
                style={{
                    ...styles.wishlistBtn,
                    color: isInWishlist(product.id) ? '#ff6b6b' : '#999'
                }}
                onClick={handleWishlistToggle}
                onMouseEnter={(e) => {
                    if (!isInWishlist(product.id)) {
                        e.currentTarget.style.color = '#ff6b6b';
                    }
                }}
                onMouseLeave={(e) => {
                    if (!isInWishlist(product.id)) {
                        e.currentTarget.style.color = '#999';
                    }
                }}
            >
                {isInWishlist(product.id) ? <FaHeart /> : <FaRegHeart />}
            </button>
            
            <Link to={`/product/${product.id}`} style={styles.link}>
                <div style={styles.imageContainer}>
                    <img 
                        src={product.image_url || 'https://via.placeholder.com/200'} 
                        alt={product.name}
                        style={styles.image}
                        onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/200';
                        }}
                    />
                </div>
                
                <div style={styles.content}>
                    <h3 style={styles.name}>{product.name}</h3>
                    
                    <div style={styles.priceContainer}>
                        {hasDiscount ? (
                            <>
                                <span style={styles.price}>{formatPrice(product.discount_price)} Br</span>
                                <span style={styles.originalPrice}>{formatPrice(product.price)} Br</span>
                            </>
                        ) : (
                            <span style={styles.price}>{formatPrice(product.price)} Br</span>
                        )}
                    </div>
                </div>
            </Link>
            
            <button 
                style={styles.addButton}
                onClick={handleAddToCart}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#218838';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#28a745';
                }}
            >
                <FaShoppingCart size={14} /> Add to Cart
            </button>
        </div>
    );
};

export default ProductCard;