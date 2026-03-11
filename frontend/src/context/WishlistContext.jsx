import React, { createContext, useState, useContext, useEffect } from 'react';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [wishlistCount, setWishlistCount] = useState(0);

    // Load wishlist from localStorage on startup
    useEffect(() => {
        const savedWishlist = localStorage.getItem('wishlist');
        if (savedWishlist) {
            setWishlistItems(JSON.parse(savedWishlist));
        }
    }, []);

    // Update localStorage and count whenever wishlist changes
    useEffect(() => {
        localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
        setWishlistCount(wishlistItems.length);
    }, [wishlistItems]);

    const addToWishlist = (product) => {
        setWishlistItems(prevItems => {
            // Check if item already exists
            const exists = prevItems.some(item => item.id === product.id);
            
            if (!exists) {
                return [...prevItems, { ...product, addedAt: new Date().toISOString() }];
            }
            return prevItems;
        });
    };

    const removeFromWishlist = (productId) => {
        setWishlistItems(prevItems => prevItems.filter(item => item.id !== productId));
    };

    const moveToCart = (productId, addToCartFunction) => {
        const item = wishlistItems.find(item => item.id === productId);
        if (item) {
            addToCartFunction(item, 1);
            removeFromWishlist(productId);
        }
    };

    const clearWishlist = () => {
        setWishlistItems([]);
    };

    const isInWishlist = (productId) => {
        return wishlistItems.some(item => item.id === productId);
    };

    const value = {
        wishlistItems,
        wishlistCount,
        addToWishlist,
        removeFromWishlist,
        moveToCart,
        clearWishlist,
        isInWishlist
    };

    return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};