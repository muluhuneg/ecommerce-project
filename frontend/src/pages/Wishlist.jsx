import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { 
    FaHeart, 
    FaShoppingCart, 
    FaTrash, 
    FaArrowLeft,
    FaShare,
    FaEye
} from 'react-icons/fa';

const Wishlist = () => {
    const { wishlistItems, removeFromWishlist, moveToCart, clearWishlist } = useWishlist();
    const { addToCart } = useCart();
    const navigate = useNavigate();

    const handleMoveToCart = (item) => {
        moveToCart(item.id, addToCart);
    };

    const handleRemove = (itemId) => {
        removeFromWishlist(itemId);
    };

    const handleShare = async (item) => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: item.name,
                    text: `Check out this product: ${item.name}`,
                    url: `${window.location.origin}/product/${item.id}`
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            // Fallback - copy link to clipboard
            navigator.clipboard.writeText(`${window.location.origin}/product/${item.id}`);
            alert('Link copied to clipboard!');
        }
    };

    const WishlistItem = ({ item }) => (
        <div style={styles.wishlistItem}>
            <div style={styles.itemImageContainer} onClick={() => navigate(`/product/${item.id}`)}>
                <img 
                    src={item.image_url || 'https://via.placeholder.com/200x200?text=Product'} 
                    alt={item.name}
                    style={styles.itemImage}
                />
                {item.discount_price && (
                    <span style={styles.discountBadge}>
                        {Math.round((1 - item.discount_price/item.price) * 100)}% OFF
                    </span>
                )}
            </div>

            <div style={styles.itemDetails}>
                <h3 style={styles.itemName} onClick={() => navigate(`/product/${item.id}`)}>
                    {item.name}
                </h3>
                
                <div style={styles.itemMeta}>
                    <span style={styles.itemSeller}>{item.seller_name || 'E-Store Official'}</span>
                    <span style={styles.itemStock}>
                        {item.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                </div>

                <div style={styles.itemPriceContainer}>
                    {item.discount_price ? (
                        <>
                            <span style={styles.discountPrice}>${item.discount_price}</span>
                            <span style={styles.originalPrice}>${item.price}</span>
                        </>
                    ) : (
                        <span style={styles.price}>${item.price}</span>
                    )}
                </div>

                <div style={styles.itemActions}>
                    <button 
                        style={styles.moveToCartBtn}
                        onClick={() => handleMoveToCart(item)}
                        disabled={item.stock === 0}
                    >
                        <FaShoppingCart /> Move to Cart
                    </button>
                    <button 
                        style={styles.viewBtn}
                        onClick={() => navigate(`/product/${item.id}`)}
                    >
                        <FaEye /> View
                    </button>
                    <button 
                        style={styles.shareBtn}
                        onClick={() => handleShare(item)}
                    >
                        <FaShare />
                    </button>
                    <button 
                        style={styles.removeBtn}
                        onClick={() => handleRemove(item.id)}
                    >
                        <FaTrash />
                    </button>
                </div>
            </div>

            <div style={styles.itemPrice}>
                ${(item.discount_price || item.price).toFixed(2)}
            </div>
        </div>
    );

    const styles = {
        container: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '20px'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '30px'
        },
        titleSection: {
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
        },
        title: {
            fontSize: '2rem',
            color: '#333',
            margin: 0
        },
        wishlistCount: {
            background: '#ff6b6b',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.9rem'
        },
        clearBtn: {
            padding: '8px 16px',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
        },
        emptyWishlist: {
            textAlign: 'center',
            padding: '80px 20px',
            background: 'white',
            borderRadius: '10px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        },
        emptyIcon: {
            fontSize: '5rem',
            color: '#ff6b6b',
            marginBottom: '20px'
        },
        emptyTitle: {
            fontSize: '1.8rem',
            color: '#333',
            marginBottom: '10px'
        },
        emptyText: {
            color: '#666',
            marginBottom: '30px'
        },
        shopNowBtn: {
            display: 'inline-block',
            padding: '12px 30px',
            background: '#667eea',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '25px',
            fontSize: '1rem',
            transition: 'background-color 0.3s'
        },
        wishlistGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '20px'
        },
        wishlistItem: {
            background: 'white',
            borderRadius: '10px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'flex',
            gap: '20px',
            position: 'relative',
            transition: 'transform 0.3s, box-shadow 0.3s'
        },
        itemImageContainer: {
            width: '120px',
            height: '120px',
            borderRadius: '8px',
            overflow: 'hidden',
            cursor: 'pointer',
            position: 'relative'
        },
        itemImage: {
            width: '100%',
            height: '100%',
            objectFit: 'cover'
        },
        discountBadge: {
            position: 'absolute',
            top: '5px',
            left: '5px',
            background: '#ff6b6b',
            color: 'white',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '0.7rem',
            fontWeight: 'bold'
        },
        itemDetails: {
            flex: 1
        },
        itemName: {
            fontSize: '1.1rem',
            color: '#333',
            margin: '0 0 8px',
            cursor: 'pointer'
        },
        itemMeta: {
            display: 'flex',
            gap: '10px',
            marginBottom: '8px',
            fontSize: '0.85rem'
        },
        itemSeller: {
            color: '#666'
        },
        itemStock: {
            color: '#28a745'
        },
        itemPriceContainer: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '12px'
        },
        price: {
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: '#333'
        },
        discountPrice: {
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: '#e44d26'
        },
        originalPrice: {
            fontSize: '0.9rem',
            color: '#999',
            textDecoration: 'line-through'
        },
        itemActions: {
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap'
        },
        moveToCartBtn: {
            padding: '8px 12px',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '0.85rem'
        },
        viewBtn: {
            padding: '8px 12px',
            background: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '0.85rem'
        },
        shareBtn: {
            padding: '8px 12px',
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.85rem'
        },
        removeBtn: {
            padding: '8px 12px',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.85rem'
        },
        itemPrice: {
            position: 'absolute',
            top: '20px',
            right: '20px',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: '#e44d26'
        },
        loadingContainer: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '400px'
        },
        spinner: {
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #ff6b6b',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite'
        }
    };

    if (!wishlistItems) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.titleSection}>
                    <h1 style={styles.title}>My Wishlist</h1>
                    {wishlistItems.length > 0 && (
                        <span style={styles.wishlistCount}>{wishlistItems.length} items</span>
                    )}
                </div>
                {wishlistItems.length > 0 && (
                    <button style={styles.clearBtn} onClick={clearWishlist}>
                        <FaTrash /> Clear Wishlist
                    </button>
                )}
            </div>

            {wishlistItems.length === 0 ? (
                <div style={styles.emptyWishlist}>
                    <div style={styles.emptyIcon}>
                        <FaHeart />
                    </div>
                    <h2 style={styles.emptyTitle}>Your wishlist is empty</h2>
                    <p style={styles.emptyText}>
                        Save your favorite items here and come back to them later!
                    </p>
                    <Link to="/products" style={styles.shopNowBtn}>
                        Browse Products
                    </Link>
                </div>
            ) : (
                <div style={styles.wishlistGrid}>
                    {wishlistItems.map(item => (
                        <WishlistItem key={item.id} item={item} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Wishlist;