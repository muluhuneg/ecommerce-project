import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import paymentApi from '../services/paymentApi';
import orderApi from '../services/orderApi';
import { 
    FaTruck, 
    FaCreditCard, 
    FaCheck, 
    FaArrowLeft,
    FaLock,
    FaMapMarkerAlt,
    FaUser,
    FaPhone,
    FaEnvelope,
    FaBox,
    FaSpinner,
    FaMobile,
    FaMoneyBillWave,
    FaFlask
} from 'react-icons/fa';

const Checkout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { cartItems, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [orderNumber, setOrderNumber] = useState('');
    const [orderId, setOrderId] = useState(null);
    
    // Shipping info from cart summary (if coming from cart)
    const cartSummary = location.state || {};
    
    // CHANGED: Default payment method to 'test'
    const [formData, setFormData] = useState({
        // Shipping Address
        fullName: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Ethiopia',
        
        // Shipping Method
        shippingMethod: cartSummary.shippingMethod || 'standard',
        
        // Payment - CHANGED DEFAULT TO 'test'
        paymentMethod: 'test',  // ← CHANGED FROM 'chapa' TO 'test'
        cardNumber: '',
        cardName: '',
        cardExpiry: '',
        cardCvv: '',
        
        // Billing
        sameAsShipping: true,
        billingAddress: '',
        billingCity: '',
        billingState: '',
        billingZip: '',
        
        // Additional
        orderNotes: '',
        saveInfo: false
    });

    const [errors, setErrors] = useState({});

    // Calculate totals
    const subtotal = cartTotal;
    const shippingCosts = {
        standard: 5.99,
        express: 12.99,
        nextDay: 19.99
    };
    const shipping = formData.shippingMethod ? shippingCosts[formData.shippingMethod] : 0;
    const tax = subtotal * 0.15; // 15% tax
    const discount = cartSummary.discount || 0;
    const giftWrap = cartSummary.giftWrap ? 3.99 : 0;
    const total = subtotal + shipping + tax - discount + giftWrap;

    // Format Birr price
    const formatBirr = (price) => {
        return Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    // Redirect if cart is empty
    useEffect(() => {
        if (cartItems.length === 0 && !orderComplete) {
            navigate('/cart');
        }
    }, [cartItems, navigate, orderComplete]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateStep = (step) => {
        const newErrors = {};
        
        if (step === 1) {
            // Validate shipping address
            if (!formData.fullName) newErrors.fullName = 'Full name is required';
            if (!formData.email) newErrors.email = 'Email is required';
            if (!formData.phone) newErrors.phone = 'Phone number is required';
            if (!formData.address) newErrors.address = 'Address is required';
            if (!formData.city) newErrors.city = 'City is required';
            if (!formData.state) newErrors.state = 'State is required';
            if (!formData.zipCode) newErrors.zipCode = 'ZIP code is required';
        }
        
        if (step === 2) {
            // Validate payment
            if (formData.paymentMethod === 'card') {
                if (!formData.cardNumber) newErrors.cardNumber = 'Card number is required';
                if (!formData.cardName) newErrors.cardName = 'Name on card is required';
                if (!formData.cardExpiry) newErrors.cardExpiry = 'Expiry date is required';
                if (!formData.cardCvv) newErrors.cardCvv = 'CVV is required';
            }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => prev + 1);
            window.scrollTo(0, 0);
        }
    };

    const handlePrevStep = () => {
        setCurrentStep(prev => prev - 1);
        window.scrollTo(0, 0);
    };

    // ============================================
    // Handle Chapa payment
    // ============================================
    const handleChapaPayment = async () => {
        try {
            setLoading(true);
            setErrors({});
            
            // Validate all steps before placing order
            if (!validateStep(1) || !validateStep(2)) {
                setCurrentStep(1);
                setLoading(false);
                return;
            }

            // Prepare complete order data
            const orderData = {
                user_id: user?.id,
                customer_name: formData.fullName,
                customer_email: formData.email,
                customer_phone: formData.phone,
                shipping_address: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}, ${formData.country}`,
                shipping_method: formData.shippingMethod,
                shipping_cost: shipping,
                items: cartItems.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity,
                    price: item.discount_price || item.price,
                    name: item.name
                })),
                subtotal: subtotal,
                shipping: shipping,
                tax: tax,
                discount: discount,
                grand_total: total,
                payment_method: 'chapa',
                notes: formData.orderNotes || null
            };

            console.log('📦 Saving pending order:', orderData);

            // STEP 1: Save pending order to database
            const saveResponse = await orderApi.savePendingOrder(orderData);
            
            if (!saveResponse.success) {
                throw new Error(saveResponse.message || 'Failed to save order');
            }

            const { tx_ref } = saveResponse;
            console.log('✅ Pending order saved with tx_ref:', tx_ref);

            // STEP 2: Initialize payment with Chapa
            const paymentData = {
                order_id: saveResponse.order_id || 'N/A',
                amount: total,
                currency: 'ETB',
                description: `Payment for order`,
                customer_email: formData.email,
                customer_name: formData.fullName,
                customer_phone: formData.phone
            };

            console.log('💳 Initializing Chapa payment:', paymentData);

            const paymentResponse = await paymentApi.initializePayment(paymentData);
            
            if (paymentResponse.success) {
                // Save tx_ref to localStorage as backup
                localStorage.setItem('pending_tx_ref', tx_ref);
                localStorage.setItem('pending_order_data', JSON.stringify({
                    tx_ref,
                    email: formData.email,
                    total: total
                }));
                
                // Redirect to Chapa checkout page
                window.location.href = paymentResponse.checkout_url;
            } else {
                throw new Error(paymentResponse.message || 'Payment initialization failed');
            }
        } catch (error) {
            console.error('❌ Chapa payment error:', error);
            setErrors({ form: error.message || 'Failed to process payment' });
            setLoading(false);
        }
    };

    // ============================================
    // Handle Cash on Delivery
    // ============================================
    const handleCashOnDelivery = async () => {
        try {
            setLoading(true);
            
            // Validate all steps
            if (!validateStep(1) || !validateStep(2)) {
                setCurrentStep(1);
                setLoading(false);
                return;
            }

            // Prepare order data
            const orderData = {
                user_id: user?.id,
                customer_name: formData.fullName,
                customer_email: formData.email,
                customer_phone: formData.phone,
                shipping_address: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}, ${formData.country}`,
                shipping_method: formData.shippingMethod,
                shipping_cost: shipping,
                items: cartItems.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity,
                    price: item.discount_price || item.price,
                    name: item.name
                })),
                subtotal: subtotal,
                shipping: shipping,
                tax: tax,
                discount: discount,
                grand_total: total,
                payment_method: 'cod',
                notes: formData.orderNotes || null
            };

            // For COD, we create the order directly
            const response = await orderApi.createCODOrder(orderData);
            
            if (response.success) {
                setOrderNumber(response.order_number);
                setOrderId(response.order_id);
                setOrderComplete(true);
                clearCart();
            } else {
                throw new Error(response.message || 'Failed to create order');
            }
        } catch (error) {
            console.error('COD order error:', error);
            setErrors({ form: error.message || 'Failed to place order' });
        } finally {
            setLoading(false);
        }
    };

    // ============================================
    // Handle Test Mode (No actual payment)
    // ============================================
    const handleTestMode = async () => {
        try {
            setLoading(true);
            setErrors({});
            
            // Validate all steps
            if (!validateStep(1) || !validateStep(2)) {
                setCurrentStep(1);
                setLoading(false);
                return;
            }

            // Prepare complete order data
            const orderData = {
                user_id: user?.id,
                customer_name: formData.fullName,
                customer_email: formData.email,
                customer_phone: formData.phone,
                shipping_address: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}, ${formData.country}`,
                shipping_method: formData.shippingMethod,
                shipping_cost: shipping,
                items: cartItems.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity,
                    price: item.discount_price || item.price,
                    name: item.name
                })),
                subtotal: subtotal,
                shipping: shipping,
                tax: tax,
                discount: discount,
                grand_total: total,
                payment_method: 'test',
                notes: formData.orderNotes || null
            };

            console.log('🧪 TEST MODE - Creating order:', orderData);

            // For test mode, we create the order directly (like COD)
            const response = await orderApi.createCODOrder(orderData);
            
            if (response.success) {
                setOrderNumber(response.order_number);
                setOrderId(response.order_id);
                setOrderComplete(true);
                clearCart();
                
                // Show success message
                console.log('✅ Test order created successfully!');
            } else {
                throw new Error(response.message || 'Failed to create test order');
            }
        } catch (error) {
            console.error('❌ Test mode error:', error);
            setErrors({ form: error.message || 'Failed to process test order' });
        } finally {
            setLoading(false);
        }
    };

    // Handle card payment (simulated)
    const handleCardPayment = async () => {
        setLoading(true);
        
        try {
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            const newOrderNumber = 'ORD-' + Date.now().toString().slice(-8);
            setOrderNumber(newOrderNumber);
            setOrderComplete(true);
            clearCart();
            
        } catch (error) {
            console.error('Card payment error:', error);
            setErrors({ form: 'Payment failed. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    // Main place order handler
    const handlePlaceOrder = async () => {
        // Choose payment method
        if (formData.paymentMethod === 'chapa') {
            await handleChapaPayment();
        } else if (formData.paymentMethod === 'cod') {
            await handleCashOnDelivery();
        } else if (formData.paymentMethod === 'test') {
            await handleTestMode();
        } else if (formData.paymentMethod === 'card') {
            await handleCardPayment();
        }
    };

    // Check for pending order on component mount
    useEffect(() => {
        const checkPendingOrder = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const tx_ref = urlParams.get('tx_ref');
            
            if (tx_ref) {
                // We're returning from Chapa, check order status
                try {
                    const response = await orderApi.checkOrderStatus(tx_ref);
                    if (response.order_id) {
                        setOrderId(response.order_id);
                        setOrderNumber(response.order_number);
                        setOrderComplete(true);
                        clearCart();
                    }
                } catch (error) {
                    console.error('Error checking order status:', error);
                }
            }
        };

        checkPendingOrder();
    }, [clearCart]);

    const OrderSummary = () => (
        <div style={styles.summaryCard}>
            <h3 style={styles.summaryTitle}>Order Summary</h3>
            
            <div style={styles.itemsList}>
                {cartItems.map((item, index) => (
                    <div key={index} style={styles.summaryItem}>
                        <img 
                            src={item.image_url || 'https://via.placeholder.com/50'} 
                            alt={item.name}
                            style={styles.itemImage}
                        />
                        <div style={styles.itemDetails}>
                            <h4 style={styles.itemName}>{item.name}</h4>
                            {item.variant && (
                                <div style={styles.itemVariants}>
                                    {item.variant.color && <span>Color: {item.variant.color}</span>}
                                    {item.variant.size && <span>Size: {item.variant.size}</span>}
                                </div>
                            )}
                            <span style={styles.itemQuantity}>Qty: {item.quantity}</span>
                        </div>
                        <span style={styles.itemPrice}>
                            {formatBirr((item.discount_price || item.price) * item.quantity)} Br
                        </span>
                    </div>
                ))}
            </div>
            
            <div style={styles.priceBreakdown}>
                <div style={styles.priceRow}>
                    <span>Subtotal</span>
                    <span>{formatBirr(subtotal)} Br</span>
                </div>
                <div style={styles.priceRow}>
                    <span>Shipping</span>
                    <span>{formatBirr(shipping)} Br</span>
                </div>
                <div style={styles.priceRow}>
                    <span>Tax (15%)</span>
                    <span>{formatBirr(tax)} Br</span>
                </div>
                {discount > 0 && (
                    <div style={{...styles.priceRow, color: '#28a745'}}>
                        <span>Discount</span>
                        <span>-{formatBirr(discount)} Br</span>
                    </div>
                )}
                {giftWrap > 0 && (
                    <div style={styles.priceRow}>
                        <span>Gift Wrap</span>
                        <span>{formatBirr(giftWrap)} Br</span>
                    </div>
                )}
                <div style={{...styles.priceRow, ...styles.totalRow}}>
                    <span>Total</span>
                    <span style={styles.totalAmount}>{formatBirr(total)} Br</span>
                </div>
            </div>
        </div>
    );

    const StepIndicator = () => (
        <div style={styles.stepIndicator}>
            <div style={styles.stepContainer}>
                <div style={{
                    ...styles.step,
                    backgroundColor: currentStep >= 1 ? '#667eea' : '#ddd',
                    color: currentStep >= 1 ? 'white' : '#666'
                }}>
                    {currentStep > 1 ? <FaCheck /> : 1}
                </div>
                <span style={styles.stepLabel}>Shipping</span>
            </div>
            <div style={{
                ...styles.stepLine,
                backgroundColor: currentStep >= 2 ? '#667eea' : '#ddd'
            }} />
            <div style={styles.stepContainer}>
                <div style={{
                    ...styles.step,
                    backgroundColor: currentStep >= 2 ? '#667eea' : '#ddd',
                    color: currentStep >= 2 ? 'white' : '#666'
                }}>
                    {currentStep > 2 ? <FaCheck /> : 2}
                </div>
                <span style={styles.stepLabel}>Payment</span>
            </div>
            <div style={{
                ...styles.stepLine,
                backgroundColor: currentStep >= 3 ? '#667eea' : '#ddd'
            }} />
            <div style={styles.stepContainer}>
                <div style={{
                    ...styles.step,
                    backgroundColor: currentStep >= 3 ? '#667eea' : '#ddd',
                    color: currentStep >= 3 ? 'white' : '#666'
                }}>
                    3
                </div>
                <span style={styles.stepLabel}>Review</span>
            </div>
        </div>
    );

    const ShippingForm = () => (
        <div style={styles.formSection}>
            <h2 style={styles.sectionTitle}>Shipping Address</h2>
            
            <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                    <label style={styles.label}>
                        <FaUser /> Full Name *
                    </label>
                    <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        style={{
                            ...styles.input,
                            borderColor: errors.fullName ? '#dc3545' : '#ddd'
                        }}
                        placeholder="John Doe"
                    />
                    {errors.fullName && <span style={styles.error}>{errors.fullName}</span>}
                </div>
                
                <div style={styles.formGroup}>
                    <label style={styles.label}>
                        <FaEnvelope /> Email *
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        style={{
                            ...styles.input,
                            borderColor: errors.email ? '#dc3545' : '#ddd'
                        }}
                        placeholder="john@example.com"
                    />
                    {errors.email && <span style={styles.error}>{errors.email}</span>}
                </div>
                
                <div style={styles.formGroup}>
                    <label style={styles.label}>
                        <FaPhone /> Phone *
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        style={{
                            ...styles.input,
                            borderColor: errors.phone ? '#dc3545' : '#ddd'
                        }}
                        placeholder="+251 912 345 678"
                    />
                    {errors.phone && <span style={styles.error}>{errors.phone}</span>}
                </div>
                
                <div style={styles.formGroupFull}>
                    <label style={styles.label}>
                        <FaMapMarkerAlt /> Address *
                    </label>
                    <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        style={{
                            ...styles.input,
                            borderColor: errors.address ? '#dc3545' : '#ddd'
                        }}
                        placeholder="Street address"
                    />
                    {errors.address && <span style={styles.error}>{errors.address}</span>}
                </div>
                
                <div style={styles.formGroup}>
                    <label style={styles.label}>City *</label>
                    <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        style={{
                            ...styles.input,
                            borderColor: errors.city ? '#dc3545' : '#ddd'
                        }}
                        placeholder="Addis Ababa"
                    />
                    {errors.city && <span style={styles.error}>{errors.city}</span>}
                </div>
                
                <div style={styles.formGroup}>
                    <label style={styles.label}>State *</label>
                    <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        style={{
                            ...styles.input,
                            borderColor: errors.state ? '#dc3545' : '#ddd'
                        }}
                        placeholder="Ethiopia"
                    />
                    {errors.state && <span style={styles.error}>{errors.state}</span>}
                </div>
                
                <div style={styles.formGroup}>
                    <label style={styles.label}>ZIP Code *</label>
                    <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        style={{
                            ...styles.input,
                            borderColor: errors.zipCode ? '#dc3545' : '#ddd'
                        }}
                        placeholder="1000"
                    />
                    {errors.zipCode && <span style={styles.error}>{errors.zipCode}</span>}
                </div>
                
                <div style={styles.formGroup}>
                    <label style={styles.label}>Country</label>
                    <select
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        style={styles.select}
                    >
                        <option value="Ethiopia">Ethiopia</option>
                        <option value="Kenya">Kenya</option>
                        <option value="Uganda">Uganda</option>
                        <option value="Tanzania">Tanzania</option>
                    </select>
                </div>
            </div>
            
            <div style={styles.shippingOptions}>
                <h3 style={styles.subTitle}>Shipping Method</h3>
                <div style={styles.optionsGrid}>
                    <label style={{
                        ...styles.optionCard,
                        border: formData.shippingMethod === 'standard' ? '2px solid #667eea' : '1px solid #ddd'
                    }}>
                        <input
                            type="radio"
                            name="shippingMethod"
                            value="standard"
                            checked={formData.shippingMethod === 'standard'}
                            onChange={handleInputChange}
                            style={styles.radio}
                        />
                        <div>
                            <strong>Standard Shipping</strong>
                            <p style={styles.optionDesc}>3-5 business days</p>
                        </div>
                        <span style={styles.optionPrice}>{formatBirr(5.99)} Br</span>
                    </label>
                    
                    <label style={{
                        ...styles.optionCard,
                        border: formData.shippingMethod === 'express' ? '2px solid #667eea' : '1px solid #ddd'
                    }}>
                        <input
                            type="radio"
                            name="shippingMethod"
                            value="express"
                            checked={formData.shippingMethod === 'express'}
                            onChange={handleInputChange}
                            style={styles.radio}
                        />
                        <div>
                            <strong>Express Shipping</strong>
                            <p style={styles.optionDesc}>1-2 business days</p>
                        </div>
                        <span style={styles.optionPrice}>{formatBirr(12.99)} Br</span>
                    </label>
                    
                    <label style={{
                        ...styles.optionCard,
                        border: formData.shippingMethod === 'nextDay' ? '2px solid #667eea' : '1px solid #ddd'
                    }}>
                        <input
                            type="radio"
                            name="shippingMethod"
                            value="nextDay"
                            checked={formData.shippingMethod === 'nextDay'}
                            onChange={handleInputChange}
                            style={styles.radio}
                        />
                        <div>
                            <strong>Next Day Delivery</strong>
                            <p style={styles.optionDesc}>Tomorrow</p>
                        </div>
                        <span style={styles.optionPrice}>{formatBirr(19.99)} Br</span>
                    </label>
                </div>
            </div>
            
            <div style={styles.formGroupFull}>
                <label style={styles.label}>Order Notes (Optional)</label>
                <textarea
                    name="orderNotes"
                    value={formData.orderNotes}
                    onChange={handleInputChange}
                    style={styles.textarea}
                    placeholder="Special instructions for delivery..."
                    rows="3"
                />
            </div>
        </div>
    );

    const PaymentForm = () => (
        <div style={styles.formSection}>
            <h2 style={styles.sectionTitle}>Payment Method</h2>
            
            <div style={styles.paymentOptions}>
                {/* TEST MODE - NOW FIRST AND DEFAULT */}
                <label style={{
                    ...styles.paymentCard,
                    border: formData.paymentMethod === 'test' ? '2px solid #ff6b6b' : '1px solid #ddd',
                    background: formData.paymentMethod === 'test' ? '#fff3f3' : 'white'
                }}>
                    <input
                        type="radio"
                        name="paymentMethod"
                        value="test"
                        checked={formData.paymentMethod === 'test'}
                        onChange={handleInputChange}
                        style={styles.radio}
                    />
                    <FaFlask size={40} color="#ff6b6b" />
                    <div>
                        <strong>Test Mode (No Payment)</strong>
                        <p style={styles.paymentDesc}>For testing - creates order instantly</p>
                    </div>
                </label>
                
                {/* CHAPA - SECOND */}
                <label style={{
                    ...styles.paymentCard,
                    border: formData.paymentMethod === 'chapa' ? '2px solid #667eea' : '1px solid #ddd'
                }}>
                    <input
                        type="radio"
                        name="paymentMethod"
                        value="chapa"
                        checked={formData.paymentMethod === 'chapa'}
                        onChange={handleInputChange}
                        style={styles.radio}
                    />
                    <img 
                        src="https://chapa.co/assets/img/logo.png" 
                        alt="Chapa"
                        style={styles.paymentLogo}
                        onError={(e) => e.target.src = 'https://via.placeholder.com/100x40?text=Chapa'}
                    />
                    <div>
                        <strong>Chapa Payment</strong>
                        <p style={styles.paymentDesc}>Pay with Telebirr, M-Pesa, or Bank Transfer</p>
                    </div>
                </label>
                
                {/* CASH ON DELIVERY - THIRD */}
                <label style={{
                    ...styles.paymentCard,
                    border: formData.paymentMethod === 'cod' ? '2px solid #667eea' : '1px solid #ddd'
                }}>
                    <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={formData.paymentMethod === 'cod'}
                        onChange={handleInputChange}
                        style={styles.radio}
                    />
                    <FaMoneyBillWave size={40} color="#28a745" />
                    <div>
                        <strong>Cash on Delivery</strong>
                        <p style={styles.paymentDesc}>Pay when you receive</p>
                    </div>
                </label>

                {/* CARD - LAST */}
                <label style={{
                    ...styles.paymentCard,
                    border: formData.paymentMethod === 'card' ? '2px solid #667eea' : '1px solid #ddd'
                }}>
                    <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={formData.paymentMethod === 'card'}
                        onChange={handleInputChange}
                        style={styles.radio}
                    />
                    <FaCreditCard size={40} color="#667eea" />
                    <div>
                        <strong>Credit / Debit Card</strong>
                        <p style={styles.paymentDesc}>Pay with Visa, Mastercard</p>
                    </div>
                </label>
            </div>
            
            {formData.paymentMethod === 'card' && (
                <div style={styles.cardDetails}>
                    <h3 style={styles.subTitle}>Card Details</h3>
                    
                    <div style={styles.formGroupFull}>
                        <label style={styles.label}>Card Number *</label>
                        <input
                            type="text"
                            name="cardNumber"
                            value={formData.cardNumber}
                            onChange={handleInputChange}
                            placeholder="**** **** **** ****"
                            maxLength="19"
                            style={{
                                ...styles.input,
                                borderColor: errors.cardNumber ? '#dc3545' : '#ddd'
                            }}
                        />
                        {errors.cardNumber && <span style={styles.error}>{errors.cardNumber}</span>}
                    </div>
                    
                    <div style={styles.formGroupFull}>
                        <label style={styles.label}>Name on Card *</label>
                        <input
                            type="text"
                            name="cardName"
                            value={formData.cardName}
                            onChange={handleInputChange}
                            placeholder="John Doe"
                            style={{
                                ...styles.input,
                                borderColor: errors.cardName ? '#dc3545' : '#ddd'
                            }}
                        />
                        {errors.cardName && <span style={styles.error}>{errors.cardName}</span>}
                    </div>
                    
                    <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Expiry Date *</label>
                            <input
                                type="text"
                                name="cardExpiry"
                                value={formData.cardExpiry}
                                onChange={handleInputChange}
                                placeholder="MM/YY"
                                maxLength="5"
                                style={{
                                    ...styles.input,
                                    borderColor: errors.cardExpiry ? '#dc3545' : '#ddd'
                                }}
                            />
                            {errors.cardExpiry && <span style={styles.error}>{errors.cardExpiry}</span>}
                        </div>
                        
                        <div style={styles.formGroup}>
                            <label style={styles.label}>CVV *</label>
                            <input
                                type="text"
                                name="cardCvv"
                                value={formData.cardCvv}
                                onChange={handleInputChange}
                                placeholder="***"
                                maxLength="3"
                                style={{
                                    ...styles.input,
                                    borderColor: errors.cardCvv ? '#dc3545' : '#ddd'
                                }}
                            />
                            {errors.cardCvv && <span style={styles.error}>{errors.cardCvv}</span>}
                        </div>
                    </div>
                </div>
            )}
            
            <div style={styles.billingSection}>
                <label style={styles.checkboxLabel}>
                    <input
                        type="checkbox"
                        name="sameAsShipping"
                        checked={formData.sameAsShipping}
                        onChange={handleInputChange}
                    />
                    Billing address same as shipping
                </label>
                
                {!formData.sameAsShipping && (
                    <div style={styles.billingForm}>
                        <h3 style={styles.subTitle}>Billing Address</h3>
                        <div style={styles.formGrid}>
                            <div style={styles.formGroupFull}>
                                <input
                                    type="text"
                                    name="billingAddress"
                                    value={formData.billingAddress}
                                    onChange={handleInputChange}
                                    placeholder="Billing address"
                                    style={styles.input}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <input
                                    type="text"
                                    name="billingCity"
                                    value={formData.billingCity}
                                    onChange={handleInputChange}
                                    placeholder="City"
                                    style={styles.input}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <input
                                    type="text"
                                    name="billingState"
                                    value={formData.billingState}
                                    onChange={handleInputChange}
                                    placeholder="State"
                                    style={styles.input}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <input
                                    type="text"
                                    name="billingZip"
                                    value={formData.billingZip}
                                    onChange={handleInputChange}
                                    placeholder="ZIP"
                                    style={styles.input}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            <div style={styles.formGroupFull}>
                <label style={styles.checkboxLabel}>
                    <input
                        type="checkbox"
                        name="saveInfo"
                        checked={formData.saveInfo}
                        onChange={handleInputChange}
                    />
                    Save this information for next time
                </label>
            </div>
        </div>
    );

    const ReviewStep = () => (
        <div style={styles.formSection}>
            <h2 style={styles.sectionTitle}>Review Your Order</h2>
            
            <div style={styles.reviewSection}>
                <h3 style={styles.reviewSubTitle}>Shipping Address</h3>
                <div style={styles.reviewContent}>
                    <p><strong>{formData.fullName}</strong></p>
                    <p>{formData.address}</p>
                    <p>{formData.city}, {formData.state} {formData.zipCode}</p>
                    <p>{formData.country}</p>
                    <p>📞 {formData.phone}</p>
                    <p>✉️ {formData.email}</p>
                </div>
            </div>
            
            <div style={styles.reviewSection}>
                <h3 style={styles.reviewSubTitle}>Shipping Method</h3>
                <p>
                    {formData.shippingMethod === 'standard' && `Standard Shipping (3-5 days) - ${formatBirr(5.99)} Br`}
                    {formData.shippingMethod === 'express' && `Express Shipping (1-2 days) - ${formatBirr(12.99)} Br`}
                    {formData.shippingMethod === 'nextDay' && `Next Day Delivery - ${formatBirr(19.99)} Br`}
                </p>
            </div>
            
            <div style={styles.reviewSection}>
                <h3 style={styles.reviewSubTitle}>Payment Method</h3>
                <p>
                    {formData.paymentMethod === 'chapa' && 'Chapa Payment (Mobile Money/Bank Transfer)'}
                    {formData.paymentMethod === 'card' && 'Credit/Debit Card'}
                    {formData.paymentMethod === 'cod' && 'Cash on Delivery'}
                    {formData.paymentMethod === 'test' && 'Test Mode (No Payment)'}
                </p>
            </div>
            
            {formData.orderNotes && (
                <div style={styles.reviewSection}>
                    <h3 style={styles.reviewSubTitle}>Order Notes</h3>
                    <p>{formData.orderNotes}</p>
                </div>
            )}
        </div>
    );

    const OrderConfirmation = () => (
        <div style={styles.confirmationContainer}>
            <div style={styles.successIcon}>
                <FaCheck size={50} color="#28a745" />
            </div>
            <h1 style={styles.confirmationTitle}>Order Placed Successfully!</h1>
            <p style={styles.confirmationMessage}>
                Thank you for your order. Your order number is:
            </p>
            <div style={styles.orderNumber}>
                {orderNumber}
            </div>
            <p style={styles.confirmationText}>
                We've sent a confirmation email to {formData.email}
            </p>
            <div style={styles.confirmationActions}>
                <button 
                    style={styles.continueBtn}
                    onClick={() => navigate('/products')}
                >
                    Continue Shopping
                </button>
                <button 
                    style={styles.viewOrderBtn}
                    onClick={() => navigate('/orders')}
                >
                    View Order
                </button>
            </div>
        </div>
    );

    if (orderComplete) {
        return (
            <div style={styles.container}>
                <OrderConfirmation />
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.checkoutContainer}>
                <div style={styles.leftColumn}>
                    <button style={styles.backButton} onClick={() => navigate('/cart')}>
                        <FaArrowLeft /> Back to Cart
                    </button>
                    
                    <StepIndicator />
                    
                    {errors.form && (
                        <div style={styles.errorMessage}>
                            {errors.form}
                        </div>
                    )}
                    
                    {currentStep === 1 && <ShippingForm />}
                    {currentStep === 2 && <PaymentForm />}
                    {currentStep === 3 && <ReviewStep />}
                    
                    <div style={styles.navigationButtons}>
                        {currentStep > 1 && (
                            <button 
                                style={styles.prevButton}
                                onClick={handlePrevStep}
                            >
                                Previous
                            </button>
                        )}
                        
                        {currentStep < 3 ? (
                            <button 
                                style={styles.nextButton}
                                onClick={handleNextStep}
                            >
                                Continue
                            </button>
                        ) : (
                            <button 
                                style={styles.placeOrderButton}
                                onClick={handlePlaceOrder}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <FaSpinner className="spinner" /> 
                                        Processing...
                                    </>
                                ) : (
                                    'Place Order'
                                )}
                            </button>
                        )}
                    </div>
                    
                    <div style={styles.securityBadge}>
                        <FaLock /> Secure Checkout
                    </div>
                </div>
                
                <div style={styles.rightColumn}>
                    <OrderSummary />
                </div>
            </div>
            
            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    .spinner {
                        animation: spin 1s linear infinite;
                    }
                `}
            </style>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px'
    },
    checkoutContainer: {
        display: 'grid',
        gridTemplateColumns: '1fr 350px',
        gap: '30px'
    },
    leftColumn: {
        background: 'white',
        borderRadius: '8px',
        padding: '30px'
    },
    rightColumn: {
        position: 'sticky',
        top: '100px',
        height: 'fit-content'
    },
    backButton: {
        background: 'none',
        border: 'none',
        color: '#666',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        marginBottom: '20px'
    },
    stepIndicator: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '40px'
    },
    stepContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px'
    },
    step: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold'
    },
    stepLabel: {
        fontSize: '0.85rem',
        color: '#666'
    },
    stepLine: {
        flex: 1,
        height: '2px',
        margin: '0 10px'
    },
    formSection: {
        marginBottom: '30px'
    },
    sectionTitle: {
        fontSize: '1.3rem',
        marginBottom: '20px',
        color: '#333'
    },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '15px'
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
    },
    formGroupFull: {
        gridColumn: 'span 2',
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
    },
    label: {
        fontSize: '0.9rem',
        color: '#666',
        display: 'flex',
        alignItems: 'center',
        gap: '5px'
    },
    input: {
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '0.95rem'
    },
    select: {
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '0.95rem',
        background: 'white'
    },
    textarea: {
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '0.95rem',
        resize: 'vertical'
    },
    error: {
        color: '#dc3545',
        fontSize: '0.8rem',
        marginTop: '2px'
    },
    errorMessage: {
        backgroundColor: '#f8d7da',
        color: '#721c24',
        padding: '12px',
        borderRadius: '4px',
        marginBottom: '20px'
    },
    shippingOptions: {
        marginTop: '20px'
    },
    subTitle: {
        fontSize: '1.1rem',
        marginBottom: '15px',
        color: '#333'
    },
    optionsGrid: {
        display: 'grid',
        gap: '10px'
    },
    optionCard: {
        padding: '15px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        cursor: 'pointer',
        background: 'white'
    },
    radio: {
        width: '18px',
        height: '18px',
        cursor: 'pointer'
    },
    optionDesc: {
        fontSize: '0.85rem',
        color: '#666',
        margin: '2px 0 0'
    },
    optionPrice: {
        marginLeft: 'auto',
        fontWeight: 'bold'
    },
    paymentOptions: {
        display: 'grid',
        gap: '10px',
        marginBottom: '20px'
    },
    paymentCard: {
        padding: '15px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        cursor: 'pointer',
        background: 'white'
    },
    paymentLogo: {
        width: '100px',
        height: '40px',
        objectFit: 'contain'
    },
    paymentDesc: {
        fontSize: '0.85rem',
        color: '#666',
        margin: '2px 0 0'
    },
    cardDetails: {
        background: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        marginTop: '15px'
    },
    formRow: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '15px'
    },
    billingSection: {
        marginTop: '20px'
    },
    billingForm: {
        marginTop: '15px',
        padding: '15px',
        background: '#f8f9fa',
        borderRadius: '8px'
    },
    checkboxLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
        fontSize: '0.95rem'
    },
    reviewSection: {
        marginBottom: '20px',
        padding: '15px',
        background: '#f8f9fa',
        borderRadius: '8px'
    },
    reviewSubTitle: {
        fontSize: '1rem',
        marginBottom: '10px',
        color: '#333'
    },
    reviewContent: {
        lineHeight: '1.6',
        color: '#666'
    },
    navigationButtons: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '30px'
    },
    prevButton: {
        padding: '12px 30px',
        background: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    nextButton: {
        padding: '12px 30px',
        background: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    placeOrderButton: {
        padding: '15px 40px',
        background: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1.1rem',
        fontWeight: 'bold'
    },
    securityBadge: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        marginTop: '20px',
        color: '#666',
        fontSize: '0.9rem'
    },
    summaryCard: {
        background: 'white',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    summaryTitle: {
        margin: '0 0 15px',
        fontSize: '1.1rem'
    },
    itemsList: {
        maxHeight: '300px',
        overflowY: 'auto',
        marginBottom: '15px'
    },
    summaryItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 0',
        borderBottom: '1px solid #eee'
    },
    itemImage: {
        width: '50px',
        height: '50px',
        borderRadius: '4px',
        objectFit: 'cover'
    },
    itemDetails: {
        flex: 1
    },
    itemName: {
        fontSize: '0.9rem',
        margin: '0 0 2px'
    },
    itemVariants: {
        fontSize: '0.8rem',
        color: '#666',
        display: 'flex',
        gap: '10px'
    },
    itemQuantity: {
        fontSize: '0.8rem',
        color: '#999'
    },
    itemPrice: {
        fontWeight: 'bold'
    },
    priceBreakdown: {
        borderTop: '2px solid #eee',
        paddingTop: '15px'
    },
    priceRow: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '8px',
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
    confirmationContainer: {
        textAlign: 'center',
        padding: '60px 20px',
        background: 'white',
        borderRadius: '8px'
    },
    successIcon: {
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        background: '#d4edda',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 20px'
    },
    confirmationTitle: {
        fontSize: '2rem',
        color: '#28a745',
        marginBottom: '20px'
    },
    confirmationMessage: {
        fontSize: '1.1rem',
        color: '#666',
        marginBottom: '10px'
    },
    orderNumber: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#667eea',
        margin: '20px 0'
    },
    confirmationText: {
        color: '#666',
        marginBottom: '30px'
    },
    confirmationActions: {
        display: 'flex',
        gap: '15px',
        justifyContent: 'center'
    },
    continueBtn: {
        padding: '12px 30px',
        background: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    viewOrderBtn: {
        padding: '12px 30px',
        background: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    }
};

export default Checkout;