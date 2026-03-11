import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { 
    FaShoppingCart, 
    FaTrash, 
    FaHeart, 
    FaArrowLeft,
    FaArrowRight,
    FaTag,
    FaShieldAlt,
    FaTruck,
    FaCreditCard,
    FaPlus,
    FaMinus,
    FaStore
} from 'react-icons/fa';

const Cart = () => {
    const navigate = useNavigate();
    const {
        cartItems,
        savedForLater,
        cartCount,
        cartTotal,
        updateQuantity,
        removeFromCart,
        moveToSaved,
        moveToCart,
        removeFromSaved,
        clearCart,
        applyCoupon
    } = useCart();

    const [couponCode, setCouponCode] = useState('');
    const [couponApplied, setCouponApplied] = useState(null);
    const [couponError, setCouponError] = useState('');
    const [shippingMethod, setShippingMethod] = useState('standard');
    const [giftWrap, setGiftWrap] = useState(false);

    // Shipping costs
    const shippingCosts = {
        standard: 5.99,
        express: 12.99,
        nextDay: 19.99
    };

    // Calculate totals
    const subtotal = cartTotal;
    const shipping = shippingMethod ? shippingCosts[shippingMethod] : 0;
    const tax = subtotal * 0.15; // 15% tax (adjust based on your location)
    
    let discount = 0;
    if (couponApplied?.valid) {
        discount = couponApplied.type === 'percentage' 
            ? (subtotal * couponApplied.discount / 100)
            : couponApplied.discount;
    }
    
    const total = subtotal + shipping + tax - discount;

    const handleApplyCoupon = () => {
        const result = applyCoupon(couponCode);
        if (result.valid) {
            setCouponApplied({ code: couponCode, ...result });
            setCouponError('');
        } else {
            setCouponError('Invalid coupon code');
            setCouponApplied(null);
        }
    };

    const handleCheckout = () => {
        navigate('/checkout', {
            state: {
                subtotal,
                shipping,
                tax,
                discount,
                total,
                shippingMethod,
                giftWrap
            }
        });
    };

    const CartItem = ({ item, isSaved = false }) => (
        <div style={styles.cartItem}>
            <div style={styles.itemImageContainer}>
                <img 
                    src={item.image_url || 'https://via.placeholder.com/100x100?text=Product'} 
                    alt={item.name}
                    style={styles.itemImage}
                    onClick={() => navigate(`/product/${item.id}`)}
                />
            </div>
            
            <div style={styles.itemDetails}>
                <h3 style={styles.itemName} onClick={() => navigate(`/product/${item.id}`)}>
                    {item.name}
                </h3>
                
                {item.variant && (
                    <div style={styles.itemVariants}>
                        {item.variant.color && (
                            <span style={styles.variantTag}>
                                Color: <span style={styles.variantValue}>{item.variant.color}</span>
                            </span>
                        )}
                        {item.variant.size && (
                            <span style={styles.variantTag}>
                                Size: <span style={styles.variantValue}>{item.variant.size}</span>
                            </span>
                        )}
                    </div>
                )}
                
                <div style={styles.itemSeller}>
                    <FaStore size={12} />
                    <span>{item.seller_name || 'E-Store Official'}</span>
                </div>
                
                <div style={styles.itemPrice}>
                    {item.discount_price ? (
                        <>
                            <span style={styles.discountPrice}>${item.discount_price}</span>
                            <span style={styles.originalPrice}>${item.price}</span>
                        </>
                    ) : (
                        <span style={styles.price}>${item.price}</span>
                    )}
                </div>

                {!isSaved && (
                    <div style={styles.itemActions}>
                        <div style={styles.quantityControl}>
                            <button 
                                style={styles.quantityBtn}
                                onClick={() => updateQuantity(item.id, item.quantity - 1, item.variant)}
                                disabled={item.quantity <= 1}
                            >
                                <FaMinus size={10} />
                            </button>
                            <span style={styles.quantityValue}>{item.quantity}</span>
                            <button 
                                style={styles.quantityBtn}
                                onClick={() => updateQuantity(item.id, item.quantity + 1, item.variant)}
                                disabled={item.quantity >= (item.stock || 10)}
                            >
                                <FaPlus size={10} />
                            </button>
                        </div>
                        
                        <div style={styles.actionButtons}>
                            <button 
                                style={styles.actionButton}
                                onClick={() => moveToSaved(item.id, item.variant)}
                            >
                                <FaHeart /> Save for Later
                            </button>
                            <button 
                                style={{...styles.actionButton, color: '#dc3545'}}
                                onClick={() => removeFromCart(item.id, item.variant)}
                            >
                                <FaTrash /> Remove
                            </button>
                        </div>
                    </div>
                )}

                {isSaved && (
                    <div style={styles.savedActions}>
                        <button 
                            style={styles.moveToCartBtn}
                            onClick={() => moveToCart(item.id, item.variant)}
                        >
                            Move to Cart
                        </button>
                        <button 
                            style={styles.removeSavedBtn}
                            onClick={() => removeFromSaved(item.id, item.variant)}
                        >
                            Remove
                        </button>
                    </div>
                )}
            </div>

            <div style={styles.itemTotal}>
                ${((item.discount_price || item.price) * item.quantity).toFixed(2)}
            </div>
        </div>
    );

    if (cartItems.length === 0 && savedForLater.length === 0) {
        return (
            <div style={styles.emptyCart}>
                <FaShoppingCart style={styles.emptyIcon} />
                <h2>Your cart is empty</h2>
                <p>Looks like you haven't added anything to your cart yet</p>
                <Link to="/products" style={styles.shopNowBtn}>
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Shopping Cart</h1>
                {cartItems.length > 0 && (
                    <button style={styles.clearCartBtn} onClick={clearCart}>
                        Clear Cart
                    </button>
                )}
            </div>

            <div style={styles.mainContent}>
                {/* Cart Items Section */}
                <div style={styles.cartSection}>
                    {/* Cart Items */}
                    {cartItems.length > 0 ? (
                        <>
                            <div style={styles.cartHeader}>
                                <span style={styles.headerProduct}>Product</span>
                                <span style={styles.headerQuantity}>Quantity</span>
                                <span style={styles.headerTotal}>Total</span>
                            </div>
                            
                            <div style={styles.cartItemsList}>
                                {cartItems.map((item, index) => (
                                    <CartItem key={`${item.id}-${index}`} item={item} />
                                ))}
                            </div>
                        </>
                    ) : (
                        <div style={styles.noItems}>
                            <p>No items in your cart</p>
                        </div>
                    )}

                    {/* Saved for Later */}
                    {savedForLater.length > 0 && (
                        <div style={styles.savedSection}>
                            <h3 style={styles.savedTitle}>
                                <FaHeart style={styles.savedIcon} /> Saved for Later ({savedForLater.length})
                            </h3>
                            <div style={styles.savedList}>
                                {savedForLater.map((item, index) => (
                                    <CartItem key={`saved-${item.id}-${index}`} item={item} isSaved />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Order Summary Section */}
                <div style={styles.summarySection}>
                    <div style={styles.summaryCard}>
                        <h2 style={styles.summaryTitle}>Order Summary</h2>
                        
                        {/* Coupon Code */}
                        <div style={styles.couponSection}>
                            <div style={styles.couponInput}>
                                <FaTag style={styles.couponIcon} />
                                <input
                                    type="text"
                                    placeholder="Enter coupon code"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    style={styles.couponField}
                                />
                                <button 
                                    style={styles.applyBtn}
                                    onClick={handleApplyCoupon}
                                >
                                    Apply
                                </button>
                            </div>
                            {couponError && <p style={styles.couponError}>{couponError}</p>}
                            {couponApplied && (
                                <p style={styles.couponSuccess}>
                                    Coupon {couponApplied.code} applied! 
                                    {couponApplied.type === 'percentage' 
                                        ? ` ${couponApplied.discount}% off` 
                                        : ` $${couponApplied.discount} off`}
                                </p>
                            )}
                        </div>

                        {/* Shipping Method */}
                        <div style={styles.shippingSection}>
                            <h3 style={styles.sectionLabel}>Shipping Method</h3>
                            <select 
                                value={shippingMethod} 
                                onChange={(e) => setShippingMethod(e.target.value)}
                                style={styles.shippingSelect}
                            >
                                <option value="standard">Standard Shipping ($5.99) - 3-5 days</option>
                                <option value="express">Express Shipping ($12.99) - 1-2 days</option>
                                <option value="nextDay">Next Day Delivery ($19.99)</option>
                            </select>
                        </div>

                        {/* Gift Wrap Option */}
                        <div style={styles.giftWrapSection}>
                            <label style={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={giftWrap}
                                    onChange={(e) => setGiftWrap(e.target.checked)}
                                />
                                Add gift wrap (+$3.99)
                            </label>
                            {giftWrap && (
                                <input
                                    type="text"
                                    placeholder="Gift message (optional)"
                                    style={styles.giftMessage}
                                />
                            )}
                        </div>

                        {/* Price Breakdown */}
                        <div style={styles.priceBreakdown}>
                            <div style={styles.priceRow}>
                                <span>Subtotal ({cartCount} items)</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div style={styles.priceRow}>
                                <span>Shipping</span>
                                <span>${shipping.toFixed(2)}</span>
                            </div>
                            <div style={styles.priceRow}>
                                <span>Tax (15%)</span>
                                <span>${tax.toFixed(2)}</span>
                            </div>
                            {discount > 0 && (
                                <div style={{...styles.priceRow, color: '#28a745'}}>
                                    <span>Discount</span>
                                    <span>-${discount.toFixed(2)}</span>
                                </div>
                            )}
                            {giftWrap && (
                                <div style={styles.priceRow}>
                                    <span>Gift Wrap</span>
                                    <span>$3.99</span>
                                </div>
                            )}
                            <div style={{...styles.priceRow, ...styles.totalRow}}>
                                <span>Total</span>
                                <span style={styles.totalAmount}>
                                    ${(total + (giftWrap ? 3.99 : 0)).toFixed(2)}
                                </span>
                            </div>
                        </div>

                        {/* Checkout Button */}
                        <button 
                            style={styles.checkoutBtn}
                            onClick={handleCheckout}
                            disabled={cartItems.length === 0}
                        >
                            Proceed to Checkout
                        </button>

                        {/* Payment Icons */}
                        <div style={styles.paymentIcons}>
                            <FaCreditCard size={24} color="#1a73e8" />
                            <span style={styles.paymentText}>Secure Checkout</span>
                            <FaShieldAlt size={20} color="#28a745" />
                        </div>

                        {/* Continue Shopping */}
                        <Link to="/products" style={styles.continueShopping}>
                            <FaArrowLeft /> Continue Shopping
                        </Link>
                    </div>

                    {/* Shipping Info */}
                    <div style={styles.infoCard}>
                        <div style={styles.infoItem}>
                            <FaTruck style={styles.infoIcon} />
                            <div>
                                <h4 style={styles.infoTitle}>Free Shipping</h4>
                                <p style={styles.infoText}>On orders over $50</p>
                            </div>
                        </div>
                        <div style={styles.infoItem}>
                            <FaShieldAlt style={styles.infoIcon} />
                            <div>
                                <h4 style={styles.infoTitle}>Secure Payment</h4>
                                <p style={styles.infoText}>SSL encrypted</p>
                            </div>
                        </div>
                        <div style={styles.infoItem}>
                            <FaArrowRight style={styles.infoIcon} />
                            <div>
                                <h4 style={styles.infoTitle}>Easy Returns</h4>
                                <p style={styles.infoText}>30-day return policy</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

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
    title: {
        fontSize: '2rem',
        color: '#333',
        margin: 0
    },
    clearCartBtn: {
        padding: '8px 16px',
        background: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    mainContent: {
        display: 'grid',
        gridTemplateColumns: '1fr 350px',
        gap: '30px'
    },
    cartSection: {
        background: 'white',
        borderRadius: '8px',
        padding: '20px'
    },
    cartHeader: {
        display: 'grid',
        gridTemplateColumns: '3fr 1fr 1fr',
        padding: '10px 0',
        borderBottom: '2px solid #eee',
        color: '#666',
        fontWeight: '500'
    },
    headerProduct: {
        paddingLeft: '120px'
    },
    headerQuantity: {
        textAlign: 'center'
    },
    headerTotal: {
        textAlign: 'right'
    },
    cartItemsList: {
        marginTop: '10px'
    },
    cartItem: {
        display: 'grid',
        gridTemplateColumns: '120px 1fr 120px',
        gap: '20px',
        padding: '20px 0',
        borderBottom: '1px solid #eee',
        position: 'relative'
    },
    itemImageContainer: {
        width: '120px',
        height: '120px',
        cursor: 'pointer'
    },
    itemImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: '8px'
    },
    itemDetails: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    itemName: {
        fontSize: '1.1rem',
        color: '#333',
        cursor: 'pointer',
        margin: 0
    },
    itemVariants: {
        display: 'flex',
        gap: '15px'
    },
    variantTag: {
        fontSize: '0.9rem',
        color: '#666'
    },
    variantValue: {
        color: '#333',
        fontWeight: '500',
        marginLeft: '5px'
    },
    itemSeller: {
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        fontSize: '0.9rem',
        color: '#666'
    },
    itemPrice: {
        marginBottom: '10px'
    },
    price: {
        fontSize: '1.1rem',
        fontWeight: 'bold',
        color: '#333'
    },
    discountPrice: {
        fontSize: '1.1rem',
        fontWeight: 'bold',
        color: '#e44d26',
        marginRight: '8px'
    },
    originalPrice: {
        fontSize: '0.9rem',
        color: '#999',
        textDecoration: 'line-through'
    },
    itemActions: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px'
    },
    quantityControl: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        padding: '2px'
    },
    quantityBtn: {
        width: '28px',
        height: '28px',
        border: 'none',
        background: '#f8f9fa',
        cursor: 'pointer',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    quantityValue: {
        minWidth: '30px',
        textAlign: 'center'
    },
    actionButtons: {
        display: 'flex',
        gap: '15px'
    },
    actionButton: {
        background: 'none',
        border: 'none',
        color: '#3498db',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        fontSize: '0.9rem'
    },
    savedActions: {
        display: 'flex',
        gap: '10px',
        marginTop: '10px'
    },
    moveToCartBtn: {
        padding: '6px 12px',
        background: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.9rem'
    },
    removeSavedBtn: {
        padding: '6px 12px',
        background: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.9rem'
    },
    itemTotal: {
        fontSize: '1.1rem',
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'right'
    },
    noItems: {
        textAlign: 'center',
        padding: '40px',
        color: '#666'
    },
    savedSection: {
        marginTop: '40px'
    },
    savedTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: '#666'
    },
    savedIcon: {
        color: '#ff6b6b'
    },
    savedList: {
        marginTop: '20px'
    },
    summarySection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    summaryCard: {
        background: 'white',
        borderRadius: '8px',
        padding: '20px',
        position: 'sticky',
        top: '20px'
    },
    summaryTitle: {
        margin: '0 0 20px',
        fontSize: '1.3rem'
    },
    couponSection: {
        marginBottom: '20px'
    },
    couponInput: {
        display: 'flex',
        gap: '10px'
    },
    couponIcon: {
        position: 'absolute',
        left: '35px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#999'
    },
    couponField: {
        flex: 1,
        padding: '10px 10px 10px 35px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '0.9rem'
    },
    applyBtn: {
        padding: '10px 20px',
        background: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    couponError: {
        color: '#dc3545',
        fontSize: '0.85rem',
        margin: '5px 0 0'
    },
    couponSuccess: {
        color: '#28a745',
        fontSize: '0.85rem',
        margin: '5px 0 0'
    },
    shippingSection: {
        marginBottom: '20px'
    },
    sectionLabel: {
        fontSize: '1rem',
        margin: '0 0 10px',
        color: '#333'
    },
    shippingSelect: {
        width: '100%',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '0.9rem'
    },
    giftWrapSection: {
        marginBottom: '20px'
    },
    checkboxLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer'
    },
    giftMessage: {
        width: '100%',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        marginTop: '10px',
        fontSize: '0.9rem'
    },
    priceBreakdown: {
        borderTop: '1px solid #eee',
        paddingTop: '15px',
        marginBottom: '20px'
    },
    priceRow: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '10px',
        color: '#666'
    },
    totalRow: {
        borderTop: '1px solid #eee',
        paddingTop: '10px',
        marginTop: '10px',
        fontSize: '1.1rem',
        color: '#333'
    },
    totalAmount: {
        fontWeight: 'bold',
        color: '#e44d26'
    },
    checkoutBtn: {
        width: '100%',
        padding: '15px',
        background: '#2ecc71',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '1.1rem',
        cursor: 'pointer',
        marginBottom: '15px'
    },
    paymentIcons: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        marginBottom: '15px'
    },
    paymentText: {
        color: '#666',
        fontSize: '0.9rem'
    },
    continueShopping: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '5px',
        color: '#3498db',
        textDecoration: 'none',
        fontSize: '0.9rem'
    },
    infoCard: {
        background: 'white',
        borderRadius: '8px',
        padding: '20px'
    },
    infoItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        marginBottom: '15px'
    },
    infoIcon: {
        fontSize: '1.5rem',
        color: '#3498db'
    },
    infoTitle: {
        margin: '0 0 5px',
        fontSize: '0.9rem'
    },
    infoText: {
        margin: 0,
        fontSize: '0.8rem',
        color: '#666'
    },
    emptyCart: {
        textAlign: 'center',
        padding: '80px 20px',
        maxWidth: '500px',
        margin: '0 auto'
    },
    emptyIcon: {
        fontSize: '5rem',
        color: '#ddd',
        marginBottom: '20px'
    },
    shopNowBtn: {
        display: 'inline-block',
        padding: '12px 30px',
        background: '#3498db',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '4px',
        marginTop: '20px'
    }
};

export default Cart;