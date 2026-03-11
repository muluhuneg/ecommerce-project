import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [savedForLater, setSavedForLater] = useState([]);
    const [cartCount, setCartCount] = useState(0);
    const [cartTotal, setCartTotal] = useState(0);

    // Load cart from localStorage on initial load
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        const savedItems = localStorage.getItem('savedForLater');
        
        if (savedCart) {
            setCartItems(JSON.parse(savedCart));
        }
        if (savedItems) {
            setSavedForLater(JSON.parse(savedItems));
        }
    }, []);

    // Update localStorage and calculate totals whenever cart changes
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
        
        // Calculate total items and price
        const count = cartItems.reduce((total, item) => total + item.quantity, 0);
        const total = cartItems.reduce((sum, item) => 
            sum + (item.discount_price || item.price) * item.quantity, 0
        );
        
        setCartCount(count);
        setCartTotal(total);
    }, [cartItems]);

    // Update localStorage for saved items
    useEffect(() => {
        localStorage.setItem('savedForLater', JSON.stringify(savedForLater));
    }, [savedForLater]);

    // Add item to cart
    const addToCart = (product, quantity = 1, variant = null) => {
        setCartItems(prevItems => {
            // Check if item already exists in cart
            const existingItemIndex = prevItems.findIndex(item => 
                item.id === product.id && 
                JSON.stringify(item.variant) === JSON.stringify(variant)
            );

            if (existingItemIndex >= 0) {
                // Update quantity of existing item
                const updatedItems = [...prevItems];
                updatedItems[existingItemIndex].quantity += quantity;
                return updatedItems;
            } else {
                // Add new item
                return [...prevItems, {
                    ...product,
                    quantity,
                    variant,
                    addedAt: new Date().toISOString()
                }];
            }
        });
    };

    // Update item quantity
    const updateQuantity = (itemId, newQuantity, variant = null) => {
        if (newQuantity < 1) {
            removeFromCart(itemId, variant);
            return;
        }

        setCartItems(prevItems =>
            prevItems.map(item => 
                item.id === itemId && JSON.stringify(item.variant) === JSON.stringify(variant)
                    ? { ...item, quantity: newQuantity }
                    : item
            )
        );
    };

    // Remove item from cart
    const removeFromCart = (itemId, variant = null) => {
        setCartItems(prevItems =>
            prevItems.filter(item => 
                !(item.id === itemId && JSON.stringify(item.variant) === JSON.stringify(variant))
            )
        );
    };

    // Move item to saved for later
    const moveToSaved = (itemId, variant = null) => {
        const itemToMove = cartItems.find(item => 
            item.id === itemId && JSON.stringify(item.variant) === JSON.stringify(variant)
        );
        
        if (itemToMove) {
            removeFromCart(itemId, variant);
            setSavedForLater(prev => [...prev, { ...itemToMove, movedAt: new Date().toISOString() }]);
        }
    };

    // Move item from saved to cart
    const moveToCart = (itemId, variant = null) => {
        const itemToMove = savedForLater.find(item => 
            item.id === itemId && JSON.stringify(item.variant) === JSON.stringify(variant)
        );
        
        if (itemToMove) {
            setSavedForLater(prev => prev.filter(item => 
                !(item.id === itemId && JSON.stringify(item.variant) === JSON.stringify(variant))
            ));
            addToCart(itemToMove, itemToMove.quantity, itemToMove.variant);
        }
    };

    // Remove from saved for later
    const removeFromSaved = (itemId, variant = null) => {
        setSavedForLater(prev => prev.filter(item => 
            !(item.id === itemId && JSON.stringify(item.variant) === JSON.stringify(variant))
        ));
    };

    // Clear entire cart
    const clearCart = () => {
        setCartItems([]);
    };

    // Apply coupon
    const applyCoupon = (couponCode) => {
        // In a real app, you would validate the coupon with your backend
        // For now, we'll just return a mock response
        if (couponCode === 'SAVE10') {
            return { valid: true, discount: 10, type: 'percentage' };
        } else if (couponCode === 'SAVE20') {
            return { valid: true, discount: 20, type: 'fixed' };
        }
        return { valid: false };
    };

    const value = {
        cartItems,
        savedForLater,
        cartCount,
        cartTotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        moveToSaved,
        moveToCart,
        removeFromSaved,
        clearCart,
        applyCoupon
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};