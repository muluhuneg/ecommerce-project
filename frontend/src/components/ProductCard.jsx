import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { FaHeart, FaShoppingCart, FaRegHeart } from 'react-icons/fa';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

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
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '15px',
            textAlign: 'center',
            background: 'white',
            position: 'relative',
            transition: 'transform 0.3s, box-shadow 0.3s'
        },
        wishlistBtn: {
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '35px',
            height: '35px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            zIndex: 2
        },
        link: {
            textDecoration: 'none',
            color: 'inherit'
        },
        image: {
            width: '100%',
            height: '150px',
            objectFit: 'cover',
            borderRadius: '4px',
            marginBottom: '10px'
        },
        name: {
            fontSize: '1.1rem',
            margin: '10px 0',
            color: '#333'
        },
        price: {
            color: '#e44d26',
            fontWeight: 'bold',
            fontSize: '1.2rem'
        },
        addButton: {
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            width: '100%',
            fontSize: '1rem',
            marginTop: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px'
        }
    };

    return (
        <div style={styles.card}>
            <button 
                style={{
                    ...styles.wishlistBtn,
                    color: isInWishlist(product.id) ? '#ff6b6b' : '#999'
                }}
                onClick={handleWishlistToggle}
            >
                {isInWishlist(product.id) ? <FaHeart /> : <FaRegHeart />}
            </button>
            
            <Link to={`/product/${product.id}`} style={styles.link}>
                <img 
                    src={product.image_url || 'https://via.placeholder.com/200'} 
                    alt={product.name}
                    style={styles.image}
                />
                <h3 style={styles.name}>{product.name}</h3>
                <p style={styles.price}>${product.price}</p>
            </Link>
            
            <button 
                style={styles.addButton}
                onClick={handleAddToCart}
            >
                <FaShoppingCart /> Add to Cart
            </button>
        </div>
    );
};

export default ProductCard;