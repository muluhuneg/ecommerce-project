import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import API from '../services/api';
import reviewApi from '../services/reviewApi';
import ReviewStars from '../components/ReviewStars';
import ReviewCard from '../components/ReviewCard';
import { 
    FaStar, 
    FaShoppingCart, 
    FaHeart, 
    FaShare, 
    FaCheck,
    FaTruck,
    FaShieldAlt,
    FaUndo,
    FaMinus,
    FaPlus,
    FaArrowLeft,
    FaStore,
    FaUser,
    FaCalendar,
    FaCamera,
    FaSpinner,
    FaRegHeart,
    FaFacebook,
    FaTwitter,
    FaWhatsapp,
    FaTelegram,
    FaCopy,
    FaCheckCircle,
    FaRocket,
    FaGift,
    FaFire
} from 'react-icons/fa';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { user } = useAuth();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [activeTab, setActiveTab] = useState('description');
    const [showShareOptions, setShowShareOptions] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    
    // Review states
    const [reviews, setReviews] = useState([]);
    const [reviewSummary, setReviewSummary] = useState(null);
    const [reviewPage, setReviewPage] = useState(1);
    const [hasMoreReviews, setHasMoreReviews] = useState(false);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [canReview, setCanReview] = useState(null);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewForm, setReviewForm] = useState({
        rating: 5,
        title: '',
        comment: ''
    });
    const [addedToCart, setAddedToCart] = useState(false);
    const [wishlistAdded, setWishlistAdded] = useState(false);

    // Mock product images - using working image URLs
    const productImages = [
        product?.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
        'https://images.unsplash.com/photo-1504275107627-0c2ba7a43dba?w=600'
    ];

    // Mock variants
    const variants = {
        colors: ['Red', 'Blue', 'Black', 'White'],
        sizes: ['S', 'M', 'L', 'XL', 'XXL']
    };

    useEffect(() => {
        fetchProductDetails();
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        if (product) {
            fetchReviews();
            fetchReviewSummary();
            checkCanReview();
        }
    }, [product, user]);

    const fetchProductDetails = async () => {
        try {
            const response = await API.get(`/products/${id}`);
            setProduct(response.data);
            
            // Fetch related products (same category)
            if (response.data.category_id) {
                const relatedRes = await API.get(`/products?category=${response.data.category_id}`);
                setRelatedProducts(relatedRes.data.filter(p => p.id !== parseInt(id)).slice(0, 4));
            }
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async (page = 1) => {
        try {
            setLoadingReviews(true);
            const data = await reviewApi.getProductReviews(id, page);
            if (page === 1) {
                setReviews(data.reviews);
            } else {
                setReviews(prev => [...prev, ...data.reviews]);
            }
            setHasMoreReviews(data.pagination.page < data.pagination.pages);
            setReviewPage(page);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoadingReviews(false);
        }
    };

    const fetchReviewSummary = async () => {
        try {
            const data = await reviewApi.getReviewSummary(id);
            setReviewSummary(data);
        } catch (error) {
            console.error('Error fetching review summary:', error);
        }
    };

    const checkCanReview = async () => {
        if (!user) return;
        try {
            const data = await reviewApi.canReview(id);
            setCanReview(data);
        } catch (error) {
            console.error('Error checking review eligibility:', error);
        }
    };

    const handleQuantityChange = (delta) => {
        setQuantity(prev => Math.max(1, Math.min(prev + delta, product?.stock || 10)));
    };

    const handleAddToCart = () => {
        const productToAdd = {
            ...product,
            selectedVariant: selectedVariant
        };
        
        addToCart(productToAdd, quantity);
        setAddedToCart(true);
        
        // Show success animation
        setTimeout(() => setAddedToCart(false), 2000);
        
        // Optional: Show toast notification
        // You can add a toast library later
    };

    const handleBuyNow = () => {
        const productToAdd = {
            ...product,
            selectedVariant: selectedVariant
        };
        addToCart(productToAdd, quantity);
        
        // Add a small delay to show the animation before redirect
        setAddedToCart(true);
        setTimeout(() => {
            navigate('/checkout');
        }, 500);
    };

    const handleWishlistToggle = () => {
        if (isInWishlist(product.id)) {
            removeFromWishlist(product.id);
            setWishlistAdded(false);
        } else {
            addToWishlist(product);
            setWishlistAdded(true);
            setTimeout(() => setWishlistAdded(false), 2000);
        }
    };

    const handleShare = (platform) => {
        const url = window.location.href;
        const text = `Check out this product: ${product?.name}`;
        
        let shareUrl = '';
        switch(platform) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
                break;
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
                break;
            case 'telegram':
                shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
                break;
            case 'copy':
                navigator.clipboard.writeText(url);
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000);
                return;
            default:
                return;
        }
        
        window.open(shareUrl, '_blank', 'width=600,height=400');
        setShowShareOptions(false);
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setSubmittingReview(true);
        
        try {
            await reviewApi.createReview({
                product_id: parseInt(id),
                order_id: canReview?.order_id,
                ...reviewForm
            });
            
            setShowReviewForm(false);
            setReviewForm({ rating: 5, title: '', comment: '' });
            fetchReviews();
            fetchReviewSummary();
            checkCanReview();
            
            alert('Review submitted successfully!');
        } catch (error) {
            console.error('Error submitting review:', error);
            alert(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmittingReview(false);
        }
    };

    const handleLoadMoreReviews = () => {
        fetchReviews(reviewPage + 1);
    };

    const handleReviewUpdate = () => {
        fetchReviews();
        fetchReviewSummary();
        checkCanReview();
    };

    const handleReviewDelete = () => {
        fetchReviews();
        fetchReviewSummary();
        checkCanReview();
    };

    const ProductImage = () => (
        <div style={styles.imageSection}>
            <div style={styles.mainImageContainer}>
                <img 
                    src={productImages[selectedImage]} 
                    alt={product?.name}
                    style={styles.mainImage}
                />
                <div style={styles.imageBadges}>
                    {product?.discount_price && (
                        <span style={styles.discountBadge}>-{Math.round((1 - product.discount_price/product.price) * 100)}%</span>
                    )}
                    {product?.is_new && (
                        <span style={styles.newBadge}>NEW</span>
                    )}
                </div>
            </div>
            <div style={styles.thumbnailGrid}>
                {productImages.map((img, index) => (
                    <div 
                        key={index}
                        style={{
                            ...styles.thumbnail,
                            border: selectedImage === index ? '3px solid #667eea' : '1px solid #ddd'
                        }}
                        onClick={() => setSelectedImage(index)}
                        onMouseEnter={() => setSelectedImage(index)}
                    >
                        <img src={img} alt={`Thumbnail ${index + 1}`} style={styles.thumbnailImage} />
                    </div>
                ))}
            </div>
        </div>
    );

    const ProductInfo = () => (
        <div style={styles.infoSection}>
            {/* Breadcrumb */}
            <div style={styles.breadcrumb}>
                <Link to="/" style={styles.breadcrumbLink}>Home</Link>
                <span style={styles.breadcrumbSeparator}>/</span>
                <Link to="/products" style={styles.breadcrumbLink}>Products</Link>
                <span style={styles.breadcrumbSeparator}>/</span>
                <span style={styles.breadcrumbCurrent}>{product?.category_name}</span>
            </div>

            {/* Product Title */}
            <h1 style={styles.productTitle}>{product?.name}</h1>

            {/* Seller Info */}
            <div style={styles.sellerInfo}>
                <div style={styles.sellerAvatar}>
                    <FaStore />
                </div>
                <div style={styles.sellerDetails}>
                    <span style={styles.sellerName}>{product?.seller_name || 'E-Store Official'}</span>
                    <span style={styles.sellerBadge}>
                        <FaCheckCircle /> Verified Seller
                    </span>
                </div>
            </div>

            {/* Rating - Updated with real data */}
            <div style={styles.ratingContainer}>
                <ReviewStars rating={reviewSummary?.averageRating || product?.rating || 0} size={20} />
                <span style={styles.ratingText}>
                    {reviewSummary?.averageRating || product?.rating || 0} out of 5
                </span>
                <span style={styles.reviewCount}>
                    ({reviewSummary?.totalReviews || 0} reviews)
                </span>
            </div>

            {/* Price - Enhanced styling */}
            <div style={styles.priceContainer}>
                {product?.discount_price ? (
                    <>
                        <div style={styles.priceWrapper}>
                            <span style={styles.discountPrice}>{product.discount_price} Br</span>
                            <span style={styles.originalPrice}>{product.price} Br</span>
                        </div>
                        <span style={styles.saveBadge}>
                            Save {(product.price - product.discount_price).toFixed(2)} Br
                        </span>
                    </>
                ) : (
                    <span style={styles.price}>{product?.price} Br</span>
                )}
            </div>

            {/* Availability with enhanced styling */}
            <div style={styles.availability}>
                <div style={styles.availabilityIcon}>
                    <FaCheckCircle color="#28a745" size={24} />
                </div>
                <div style={styles.availabilityText}>
                    <span style={styles.stockStatus}>
                        {product?.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                    {product?.stock > 0 && (
                        <span style={styles.stockCount}>{product.stock} units available</span>
                    )}
                </div>
            </div>

            {/* Variants - Enhanced */}
            <div style={styles.variantsContainer}>
                {/* Colors */}
                <div style={styles.variantSection}>
                    <h4 style={styles.variantTitle}>Color:</h4>
                    <div style={styles.colorOptions}>
                        {variants.colors.map(color => (
                            <button
                                key={color}
                                style={{
                                    ...styles.colorButton,
                                    backgroundColor: color.toLowerCase(),
                                    border: selectedVariant?.color === color ? '3px solid #667eea' : '1px solid #ddd',
                                    transform: selectedVariant?.color === color ? 'scale(1.1)' : 'scale(1)'
                                }}
                                onClick={() => setSelectedVariant({...selectedVariant, color})}
                                title={color}
                            >
                                {selectedVariant?.color === color && <FaCheck color="white" size={14} />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sizes */}
                <div style={styles.variantSection}>
                    <h4 style={styles.variantTitle}>Size:</h4>
                    <div style={styles.sizeOptions}>
                        {variants.sizes.map(size => (
                            <button
                                key={size}
                                style={{
                                    ...styles.sizeButton,
                                    background: selectedVariant?.size === size ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
                                    color: selectedVariant?.size === size ? 'white' : '#333',
                                    border: selectedVariant?.size === size ? 'none' : '1px solid #ddd',
                                    transform: selectedVariant?.size === size ? 'scale(1.05)' : 'scale(1)'
                                }}
                                onClick={() => setSelectedVariant({...selectedVariant, size})}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quantity - Enhanced */}
            <div style={styles.quantitySection}>
                <h4 style={styles.quantityTitle}>Quantity:</h4>
                <div style={styles.quantityWrapper}>
                    <div style={styles.quantityControl}>
                        <button 
                            style={styles.quantityBtn}
                            onClick={() => handleQuantityChange(-1)}
                            disabled={quantity <= 1}
                        >
                            <FaMinus />
                        </button>
                        <span style={styles.quantityValue}>{quantity}</span>
                        <button 
                            style={styles.quantityBtn}
                            onClick={() => handleQuantityChange(1)}
                            disabled={quantity >= (product?.stock || 10)}
                        >
                            <FaPlus />
                        </button>
                    </div>
                    <span style={styles.maxQuantity}>Max: {product?.stock || 10}</span>
                </div>
            </div>

            {/* Action Buttons - Enhanced with beautiful styling */}
            <div style={styles.actionButtons}>
                <button 
                    style={{
                        ...styles.addToCartBtn,
                        background: addedToCart ? 'linear-gradient(135deg, #28a745 0%, #20c997 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    }}
                    onClick={handleAddToCart}
                    disabled={product?.stock === 0}
                >
                    {addedToCart ? (
                        <>
                            <FaCheckCircle className="pulse" /> Added to Cart!
                        </>
                    ) : (
                        <>
                            <FaShoppingCart /> Add to Cart
                        </>
                    )}
                </button>
                
                <button 
                    style={styles.buyNowBtn}
                    onClick={handleBuyNow}
                    disabled={product?.stock === 0}
                >
                    <FaRocket /> Buy Now
                </button>

                <button 
                    style={{
                        ...styles.wishlistBtn,
                        color: isInWishlist(product?.id) ? '#ff6b6b' : '#666'
                    }}
                    onClick={handleWishlistToggle}
                    title={isInWishlist(product?.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                >
                    {isInWishlist(product?.id) ? <FaHeart /> : <FaRegHeart />}
                </button>
            </div>

            {/* Quick Actions */}
            <div style={styles.quickActions}>
                <div style={styles.shareWrapper}>
                    <button 
                        style={styles.shareBtn}
                        onClick={() => setShowShareOptions(!showShareOptions)}
                    >
                        <FaShare /> Share
                    </button>
                    
                    {showShareOptions && (
                        <div style={styles.shareOptions}>
                            <button onClick={() => handleShare('facebook')}><FaFacebook /> Facebook</button>
                            <button onClick={() => handleShare('twitter')}><FaTwitter /> Twitter</button>
                            <button onClick={() => handleShare('whatsapp')}><FaWhatsapp /> WhatsApp</button>
                            <button onClick={() => handleShare('telegram')}><FaTelegram /> Telegram</button>
                            <button onClick={() => handleShare('copy')}>
                                <FaCopy /> {copySuccess ? 'Copied!' : 'Copy Link'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Success Message Animation */}
            {addedToCart && (
                <div style={styles.successMessage}>
                    <FaCheckCircle /> Added {quantity} item(s) to cart! 
                    <Link to="/cart" style={styles.viewCartLink}>View Cart</Link>
                </div>
            )}

            {wishlistAdded && (
                <div style={styles.wishlistMessage}>
                    <FaHeart /> Added to wishlist!
                </div>
            )}

            {/* Shipping Info - Enhanced cards */}
            <div style={styles.shippingInfo}>
                <div style={styles.shippingItem}>
                    <div style={styles.shippingIconWrapper}>
                        <FaTruck />
                    </div>
                    <div>
                        <h4 style={styles.shippingTitle}>Free Shipping</h4>
                        <p style={styles.shippingText}>On orders over 3,000 Br</p>
                    </div>
                </div>
                <div style={styles.shippingItem}>
                    <div style={styles.shippingIconWrapper}>
                        <FaShieldAlt />
                    </div>
                    <div>
                        <h4 style={styles.shippingTitle}>Secure Payment</h4>
                        <p style={styles.shippingText}>SSL encrypted</p>
                    </div>
                </div>
                <div style={styles.shippingItem}>
                    <div style={styles.shippingIconWrapper}>
                        <FaUndo />
                    </div>
                    <div>
                        <h4 style={styles.shippingTitle}>30 Days Return</h4>
                        <p style={styles.shippingText}>Money back guarantee</p>
                    </div>
                </div>
            </div>
        </div>
    );

    const ReviewSummary = () => {
        if (!reviewSummary || reviewSummary.totalReviews === 0) {
            return (
                <div style={styles.noReviews}>
                    <p>No reviews yet. Be the first to review this product!</p>
                </div>
            );
        }

        const distribution = reviewSummary.distribution;
        const total = reviewSummary.totalReviews;

        return (
            <div style={styles.reviewSummaryContainer}>
                <div style={styles.summaryLeft}>
                    <div style={styles.averageRating}>
                        <span style={styles.bigRating}>{reviewSummary.averageRating}</span>
                        <ReviewStars rating={parseFloat(reviewSummary.averageRating)} size={28} />
                    </div>
                    <div style={styles.totalReviews}>
                        Based on {total} {total === 1 ? 'review' : 'reviews'}
                    </div>
                </div>
                
                <div style={styles.summaryRight}>
                    {[5,4,3,2,1].map(stars => (
                        <div key={stars} style={styles.distributionRow}>
                            <span style={styles.starLabel}>{stars} stars</span>
                            <div style={styles.progressBarContainer}>
                                <div 
                                    style={{
                                        ...styles.progressBar,
                                        width: `${(distribution[stars] / total) * 100}%`
                                    }}
                                />
                            </div>
                            <span style={styles.countLabel}>{distribution[stars]}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const ProductTabs = () => (
        <div style={styles.tabsSection}>
            <div style={styles.tabHeaders}>
                <button
                    style={{
                        ...styles.tabHeader,
                        borderBottom: activeTab === 'description' ? '3px solid #667eea' : 'none',
                        color: activeTab === 'description' ? '#667eea' : '#666'
                    }}
                    onClick={() => setActiveTab('description')}
                >
                    Description
                </button>
                <button
                    style={{
                        ...styles.tabHeader,
                        borderBottom: activeTab === 'specifications' ? '3px solid #667eea' : 'none',
                        color: activeTab === 'specifications' ? '#667eea' : '#666'
                    }}
                    onClick={() => setActiveTab('specifications')}
                >
                    Specifications
                </button>
                <button
                    style={{
                        ...styles.tabHeader,
                        borderBottom: activeTab === 'reviews' ? '3px solid #667eea' : 'none',
                        color: activeTab === 'reviews' ? '#667eea' : '#666'
                    }}
                    onClick={() => setActiveTab('reviews')}
                >
                    Reviews ({reviewSummary?.totalReviews || 0})
                </button>
                <button
                    style={{
                        ...styles.tabHeader,
                        borderBottom: activeTab === 'shipping' ? '3px solid #667eea' : 'none',
                        color: activeTab === 'shipping' ? '#667eea' : '#666'
                    }}
                    onClick={() => setActiveTab('shipping')}
                >
                    Shipping
                </button>
            </div>

            <div style={styles.tabContent}>
                {activeTab === 'description' && (
                    <div style={styles.description}>
                        <p>{product?.description}</p>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
                    </div>
                )}

                {activeTab === 'specifications' && (
                    <div style={styles.specsGrid}>
                        <div style={styles.specRow}>
                            <span style={styles.specLabel}>Brand</span>
                            <span style={styles.specValue}>{product?.brand || 'Generic'}</span>
                        </div>
                        <div style={styles.specRow}>
                            <span style={styles.specLabel}>Model</span>
                            <span style={styles.specValue}>XYZ-123</span>
                        </div>
                        <div style={styles.specRow}>
                            <span style={styles.specLabel}>Weight</span>
                            <span style={styles.specValue}>{product?.weight || '0.5'} kg</span>
                        </div>
                        <div style={styles.specRow}>
                            <span style={styles.specLabel}>Dimensions</span>
                            <span style={styles.specValue}>{product?.dimensions || '10 x 5 x 3 cm'}</span>
                        </div>
                        <div style={styles.specRow}>
                            <span style={styles.specLabel}>Material</span>
                            <span style={styles.specValue}>Premium Quality</span>
                        </div>
                        <div style={styles.specRow}>
                            <span style={styles.specLabel}>Warranty</span>
                            <span style={styles.specValue}>1 Year</span>
                        </div>
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <div>
                        <div style={styles.reviewsHeader}>
                            <h2 style={styles.reviewsTitle}>Customer Reviews</h2>
                            {user && canReview?.canReview && (
                                <button 
                                    style={styles.writeReviewBtn}
                                    onClick={() => setShowReviewForm(!showReviewForm)}
                                >
                                    Write a Review
                                </button>
                            )}
                        </div>

                        <ReviewSummary />

                        {showReviewForm && (
                            <form onSubmit={handleReviewSubmit} style={styles.reviewForm}>
                                <h3 style={styles.formTitle}>Write Your Review</h3>
                                
                                {canReview?.warning && (
                                    <div style={styles.warningMessage}>
                                        ⚠️ {canReview.warning}
                                    </div>
                                )}
                                
                                <div style={styles.formGroup}>
                                    <label style={styles.formLabel}>Rating *</label>
                                    <div style={styles.ratingInput}>
                                        {[1,2,3,4,5].map(star => (
                                            <FaStar
                                                key={star}
                                                size={32}
                                                color={star <= reviewForm.rating ? '#ffc107' : '#e4e5e9'}
                                                onClick={() => setReviewForm({...reviewForm, rating: star})}
                                                style={styles.ratingStar}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.formLabel}>Review Title *</label>
                                    <input
                                        type="text"
                                        value={reviewForm.title}
                                        onChange={(e) => setReviewForm({...reviewForm, title: e.target.value})}
                                        placeholder="Summarize your experience"
                                        style={styles.formInput}
                                        required
                                        maxLength="100"
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.formLabel}>Review *</label>
                                    <textarea
                                        value={reviewForm.comment}
                                        onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                                        placeholder="Share your experience with this product"
                                        style={styles.formTextarea}
                                        rows="5"
                                        required
                                        maxLength="1000"
                                    />
                                    <div style={styles.charCount}>
                                        {reviewForm.comment.length}/1000
                                    </div>
                                </div>

                                <div style={styles.formActions}>
                                    <button 
                                        type="submit" 
                                        style={styles.submitReviewBtn}
                                        disabled={submittingReview}
                                    >
                                        {submittingReview ? (
                                            <>
                                                <FaSpinner className="spinner" /> Submitting...
                                            </>
                                        ) : (
                                            'Submit Review'
                                        )}
                                    </button>
                                    <button 
                                        type="button" 
                                        style={styles.cancelReviewBtn}
                                        onClick={() => setShowReviewForm(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}

                        <div style={styles.reviewsList}>
                            {reviews.map(review => (
                                <ReviewCard 
                                    key={review.id} 
                                    review={review} 
                                    onUpdate={handleReviewUpdate}
                                    onDelete={handleReviewDelete}
                                />
                            ))}
                        </div>

                        {hasMoreReviews && (
                            <div style={styles.loadMoreContainer}>
                                <button 
                                    style={styles.loadMoreBtn}
                                    onClick={handleLoadMoreReviews}
                                    disabled={loadingReviews}
                                >
                                    {loadingReviews ? (
                                        <>
                                            <FaSpinner className="spinner" /> Loading...
                                        </>
                                    ) : (
                                        'Load More Reviews'
                                    )}
                                </button>
                            </div>
                        )}

                        {!loadingReviews && reviews.length === 0 && (
                            <div style={styles.noReviewsContainer}>
                                <p style={styles.noReviewsText}>
                                    No reviews yet. Be the first to share your experience!
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'shipping' && (
                    <div>
                        <h4 style={styles.shippingTabTitle}>Shipping Information</h4>
                        <ul style={styles.shippingList}>
                            <li>Free shipping on orders over 3,000 Br</li>
                            <li>Standard shipping: 200 Br (3-5 business days)</li>
                            <li>Express shipping: 400 Br (1-2 business days)</li>
                            <li>International shipping available</li>
                            <li>Tracking number provided via email</li>
                        </ul>
                        
                        <h4 style={styles.shippingTabTitle}>Return Policy</h4>
                        <ul style={styles.shippingList}>
                            <li>30-day money-back guarantee</li>
                            <li>Free returns within 30 days</li>
                            <li>Item must be in original condition</li>
                            <li>Refund processed within 5-7 business days</li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );

    const RelatedProducts = () => (
        <div style={styles.relatedSection}>
            <h2 style={styles.relatedTitle}>You May Also Like</h2>
            <div style={styles.relatedGrid}>
                {relatedProducts.map(product => (
                    <div 
                        key={product.id} 
                        style={styles.relatedCard}
                        onClick={() => navigate(`/product/${product.id}`)}
                    >
                        <img 
                            src={product.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200'} 
                            alt={product.name}
                            style={styles.relatedImage}
                        />
                        <h4 style={styles.relatedName}>{product.name}</h4>
                        <ReviewStars rating={product.rating || 0} size={12} />
                        <div style={styles.relatedPrice}>
                            {product.discount_price || product.price} Br
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p>Loading product details...</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Back Button */}
            <button style={styles.backButton} onClick={() => navigate(-1)}>
                <FaArrowLeft /> Back to Products
            </button>

            {/* Product Main Section */}
            <div style={styles.productMain}>
                <ProductImage />
                <ProductInfo />
            </div>

            {/* Tabs Section */}
            <ProductTabs />

            {/* Related Products */}
            {relatedProducts.length > 0 && <RelatedProducts />}

            {/* CSS Animations */}
            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    .spinner {
                        animation: spin 1s linear infinite;
                        margin-right: 8px;
                    }
                    @keyframes pulse {
                        0% { transform: scale(1); }
                        50% { transform: scale(1.05); }
                        100% { transform: scale(1); }
                    }
                    .pulse {
                        animation: pulse 1s infinite;
                    }
                    @keyframes slideIn {
                        from {
                            opacity: 0;
                            transform: translateY(20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    .slideIn {
                        animation: slideIn 0.3s ease-out;
                    }
                `}
            </style>
        </div>
    );
};

// Enhanced styles with beautiful button designs
const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px'
    },
    backButton: {
        background: 'none',
        border: 'none',
        color: '#666',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        marginBottom: '20px',
        fontSize: '0.9rem',
        transition: 'color 0.3s',
        ':hover': {
            color: '#667eea'
        }
    },
    productMain: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '40px',
        marginBottom: '40px'
    },
    imageSection: {
        position: 'relative'
    },
    mainImageContainer: {
        position: 'relative',
        marginBottom: '10px',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    mainImage: {
        width: '100%',
        height: 'auto',
        display: 'block',
        transition: 'transform 0.3s',
        ':hover': {
            transform: 'scale(1.05)'
        }
    },
    imageBadges: {
        position: 'absolute',
        top: '20px',
        left: '20px',
        display: 'flex',
        gap: '10px',
        zIndex: 2
    },
    discountBadge: {
        background: '#ff6b6b',
        color: 'white',
        padding: '5px 10px',
        borderRadius: '5px',
        fontSize: '0.9rem',
        fontWeight: 'bold',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    newBadge: {
        background: '#4facfe',
        color: 'white',
        padding: '5px 10px',
        borderRadius: '5px',
        fontSize: '0.9rem',
        fontWeight: 'bold',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    thumbnailGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '10px'
    },
    thumbnail: {
        borderRadius: '5px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.3s',
        ':hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        }
    },
    thumbnailImage: {
        width: '100%',
        height: '80px',
        objectFit: 'cover'
    },
    infoSection: {
        padding: '20px 0'
    },
    breadcrumb: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '15px',
        fontSize: '0.9rem'
    },
    breadcrumbLink: {
        color: '#666',
        textDecoration: 'none',
        transition: 'color 0.3s',
        ':hover': {
            color: '#667eea'
        }
    },
    breadcrumbSeparator: {
        color: '#999'
    },
    breadcrumbCurrent: {
        color: '#333',
        fontWeight: '500'
    },
    productTitle: {
        fontSize: '2rem',
        color: '#333',
        margin: '0 0 15px'
    },
    sellerInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        marginBottom: '15px',
        padding: '10px',
        background: '#f8f9fa',
        borderRadius: '10px'
    },
    sellerAvatar: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '1.2rem'
    },
    sellerDetails: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
    },
    sellerName: {
        fontSize: '1rem',
        fontWeight: '600',
        color: '#333'
    },
    sellerBadge: {
        fontSize: '0.8rem',
        color: '#28a745',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
    },
    ratingContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '15px',
        padding: '10px 0'
    },
    ratingText: {
        color: '#666',
        fontSize: '0.9rem'
    },
    reviewCount: {
        color: '#999',
        fontSize: '0.9rem'
    },
    priceContainer: {
        marginBottom: '20px',
        padding: '15px',
        background: '#f8f9fa',
        borderRadius: '10px'
    },
    priceWrapper: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        marginBottom: '10px'
    },
    price: {
        fontSize: '2.5rem',
        fontWeight: 'bold',
        color: '#333',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
    },
    discountPrice: {
        fontSize: '2.5rem',
        fontWeight: 'bold',
        color: '#e44d26'
    },
    originalPrice: {
        fontSize: '1.3rem',
        color: '#999',
        textDecoration: 'line-through'
    },
    saveBadge: {
        display: 'inline-block',
        padding: '5px 15px',
        background: '#28a745',
        color: 'white',
        borderRadius: '20px',
        fontSize: '0.9rem',
        fontWeight: '600'
    },
    availability: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        marginBottom: '20px',
        padding: '15px',
        background: '#f8f9fa',
        borderRadius: '10px'
    },
    availabilityIcon: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: '#d4edda',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    availabilityText: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
    },
    stockStatus: {
        fontSize: '1.1rem',
        fontWeight: '600',
        color: '#28a745'
    },
    stockCount: {
        fontSize: '0.9rem',
        color: '#666'
    },
    variantsContainer: {
        marginBottom: '20px'
    },
    variantSection: {
        marginBottom: '20px'
    },
    variantTitle: {
        fontSize: '1rem',
        marginBottom: '10px',
        color: '#333',
        fontWeight: '600'
    },
    colorOptions: {
        display: 'flex',
        gap: '15px'
    },
    colorButton: {
        width: '45px',
        height: '45px',
        borderRadius: '50%',
        cursor: 'pointer',
        transition: 'all 0.3s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    sizeOptions: {
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap'
    },
    sizeButton: {
        minWidth: '50px',
        height: '45px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.95rem',
        fontWeight: '500',
        transition: 'all 0.3s',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    quantitySection: {
        marginBottom: '20px',
        padding: '15px',
        background: '#f8f9fa',
        borderRadius: '10px'
    },
    quantityTitle: {
        fontSize: '1rem',
        marginBottom: '10px',
        color: '#333',
        fontWeight: '600'
    },
    quantityWrapper: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px'
    },
    quantityControl: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        background: 'white',
        borderRadius: '8px',
        padding: '5px'
    },
    quantityBtn: {
        width: '35px',
        height: '35px',
        borderRadius: '6px',
        border: 'none',
        background: '#f0f0f0',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s',
        ':hover': {
            background: '#e0e0e0'
        },
        ':disabled': {
            opacity: 0.5,
            cursor: 'not-allowed'
        }
    },
    quantityValue: {
        minWidth: '40px',
        textAlign: 'center',
        fontSize: '1.2rem',
        fontWeight: '600'
    },
    maxQuantity: {
        color: '#666',
        fontSize: '0.9rem'
    },
    actionButtons: {
        display: 'flex',
        gap: '15px',
        marginBottom: '15px'
    },
    addToCartBtn: {
        flex: 2,
        padding: '15px',
        border: 'none',
        borderRadius: '10px',
        fontSize: '1.1rem',
        fontWeight: '600',
        cursor: 'pointer',
        color: 'white',
        transition: 'all 0.3s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
        ':hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)'
        },
        ':disabled': {
            opacity: 0.5,
            cursor: 'not-allowed',
            transform: 'none'
        }
    },
    buyNowBtn: {
        flex: 1,
        padding: '15px',
        border: 'none',
        borderRadius: '10px',
        fontSize: '1.1rem',
        fontWeight: '600',
        cursor: 'pointer',
        background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
        color: 'white',
        transition: 'all 0.3s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        boxShadow: '0 4px 15px rgba(40, 167, 69, 0.4)',
        ':hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px rgba(40, 167, 69, 0.6)'
        },
        ':disabled': {
            opacity: 0.5,
            cursor: 'not-allowed',
            transform: 'none'
        }
    },
    wishlistBtn: {
        width: '55px',
        height: '55px',
        borderRadius: '10px',
        border: '1px solid #ddd',
        background: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.3rem',
        transition: 'all 0.3s',
        ':hover': {
            transform: 'scale(1.1)',
            borderColor: '#ff6b6b'
        }
    },
    quickActions: {
        marginBottom: '20px',
        position: 'relative'
    },
    shareWrapper: {
        position: 'relative'
    },
    shareBtn: {
        padding: '10px 20px',
        background: 'white',
        border: '1px solid #ddd',
        borderRadius: '8px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '0.95rem',
        transition: 'all 0.3s',
        ':hover': {
            background: '#f8f9fa',
            borderColor: '#667eea'
        }
    },
    shareOptions: {
        position: 'absolute',
        top: '100%',
        left: 0,
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        padding: '10px',
        zIndex: 10,
        marginTop: '5px',
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
        minWidth: '200px'
    },
    successMessage: {
        backgroundColor: '#d4edda',
        color: '#155724',
        padding: '15px',
        borderRadius: '10px',
        marginBottom: '15px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        animation: 'slideIn 0.3s ease-out',
        border: '1px solid #c3e6cb'
    },
    wishlistMessage: {
        backgroundColor: '#fff3cd',
        color: '#856404',
        padding: '15px',
        borderRadius: '10px',
        marginBottom: '15px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        animation: 'slideIn 0.3s ease-out',
        border: '1px solid #ffeeba'
    },
    viewCartLink: {
        color: '#155724',
        fontWeight: '600',
        marginLeft: 'auto',
        textDecoration: 'none',
        ':hover': {
            textDecoration: 'underline'
        }
    },
    shippingInfo: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
        padding: '20px',
        background: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    },
    shippingItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
    },
    shippingIconWrapper: {
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '1.3rem'
    },
    shippingTitle: {
        margin: 0,
        fontSize: '1rem',
        fontWeight: '600'
    },
    shippingText: {
        margin: '5px 0 0',
        fontSize: '0.85rem',
        color: '#666'
    },
    tabsSection: {
        marginBottom: '40px',
        background: 'white',
        borderRadius: '10px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    },
    tabHeaders: {
        display: 'flex',
        gap: '30px',
        borderBottom: '1px solid #ddd',
        marginBottom: '20px'
    },
    tabHeader: {
        padding: '10px 0',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '500',
        transition: 'all 0.3s',
        ':hover': {
            color: '#667eea'
        }
    },
    tabContent: {
        padding: '20px 0'
    },
    description: {
        lineHeight: '1.8',
        color: '#666'
    },
    specsGrid: {
        display: 'grid',
        gap: '10px'
    },
    specRow: {
        display: 'grid',
        gridTemplateColumns: '150px 1fr',
        padding: '10px',
        background: '#f8f9fa',
        borderRadius: '8px'
    },
    specLabel: {
        color: '#666',
        fontWeight: '500'
    },
    specValue: {
        color: '#333',
        fontWeight: '600'
    },
    reviewsHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
    },
    reviewsTitle: {
        fontSize: '1.3rem',
        color: '#333',
        margin: 0
    },
    writeReviewBtn: {
        padding: '10px 20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.95rem',
        fontWeight: '500',
        transition: 'all 0.3s',
        ':hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
        }
    },
    reviewSummaryContainer: {
        background: '#f8f9fa',
        padding: '30px',
        borderRadius: '10px',
        marginBottom: '30px',
        display: 'flex',
        gap: '40px',
        flexWrap: 'wrap'
    },
    summaryLeft: {
        flex: 1,
        minWidth: '200px',
        textAlign: 'center'
    },
    averageRating: {
        marginBottom: '10px'
    },
    bigRating: {
        fontSize: '3rem',
        fontWeight: 'bold',
        color: '#333',
        display: 'block',
        marginBottom: '5px'
    },
    totalReviews: {
        color: '#666',
        fontSize: '0.9rem'
    },
    summaryRight: {
        flex: 2,
        minWidth: '300px'
    },
    distributionRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '8px'
    },
    starLabel: {
        minWidth: '60px',
        color: '#666'
    },
    progressBarContainer: {
        flex: 1,
        height: '8px',
        background: '#e0e0e0',
        borderRadius: '4px',
        overflow: 'hidden'
    },
    progressBar: {
        height: '100%',
        background: '#ffc107',
        borderRadius: '4px',
        transition: 'width 0.3s'
    },
    countLabel: {
        minWidth: '40px',
        color: '#666',
        fontSize: '0.9rem'
    },
    noReviews: {
        textAlign: 'center',
        padding: '30px',
        background: '#f8f9fa',
        borderRadius: '8px',
        marginBottom: '20px',
        color: '#666'
    },
    reviewForm: {
        background: 'white',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        marginBottom: '30px'
    },
    formTitle: {
        fontSize: '1.2rem',
        marginBottom: '20px',
        color: '#333'
    },
    formGroup: {
        marginBottom: '20px'
    },
    formLabel: {
        display: 'block',
        marginBottom: '8px',
        color: '#333',
        fontWeight: '500'
    },
    ratingInput: {
        display: 'flex',
        gap: '8px'
    },
    ratingStar: {
        cursor: 'pointer',
        transition: 'transform 0.2s',
        ':hover': {
            transform: 'scale(1.1)'
        }
    },
    formInput: {
        width: '100%',
        padding: '12px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        fontSize: '0.95rem',
        transition: 'border-color 0.3s',
        ':focus': {
            outline: 'none',
            borderColor: '#667eea'
        }
    },
    formTextarea: {
        width: '100%',
        padding: '12px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        fontSize: '0.95rem',
        resize: 'vertical',
        fontFamily: 'inherit',
        transition: 'border-color 0.3s',
        ':focus': {
            outline: 'none',
            borderColor: '#667eea'
        }
    },
    charCount: {
        textAlign: 'right',
        fontSize: '0.8rem',
        color: '#999',
        marginTop: '5px'
    },
    warningMessage: {
        background: '#fff3cd',
        color: '#856404',
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '20px',
        fontSize: '0.95rem'
    },
    formActions: {
        display: 'flex',
        gap: '15px',
        justifyContent: 'flex-end',
        marginTop: '20px'
    },
    submitReviewBtn: {
        padding: '12px 25px',
        background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.95rem',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        transition: 'all 0.3s',
        ':hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(40, 167, 69, 0.4)'
        },
        ':disabled': {
            opacity: 0.7,
            cursor: 'not-allowed',
            transform: 'none'
        }
    },
    cancelReviewBtn: {
        padding: '12px 25px',
        background: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.95rem',
        transition: 'all 0.3s',
        ':hover': {
            background: '#5a6268'
        }
    },
    reviewsList: {
        marginTop: '20px'
    },
    loadMoreContainer: {
        textAlign: 'center',
        marginTop: '30px'
    },
    loadMoreBtn: {
        padding: '12px 30px',
        background: 'white',
        color: '#667eea',
        border: '2px solid #667eea',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '1rem',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        transition: 'all 0.3s',
        ':hover': {
            background: '#667eea',
            color: 'white'
        },
        ':disabled': {
            opacity: 0.5,
            cursor: 'not-allowed'
        }
    },
    noReviewsContainer: {
        textAlign: 'center',
        padding: '40px',
        background: '#f8f9fa',
        borderRadius: '8px'
    },
    noReviewsText: {
        color: '#666',
        fontSize: '1rem'
    },
    shippingTabTitle: {
        margin: '20px 0 10px',
        color: '#333'
    },
    shippingList: {
        margin: '0 0 20px',
        paddingLeft: '20px',
        lineHeight: '2',
        color: '#666'
    },
    relatedSection: {
        marginTop: '40px'
    },
    relatedTitle: {
        fontSize: '1.5rem',
        marginBottom: '20px',
        color: '#333'
    },
    relatedGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px'
    },
    relatedCard: {
        cursor: 'pointer',
        textAlign: 'center',
        padding: '15px',
        border: '1px solid #eee',
        borderRadius: '10px',
        transition: 'all 0.3s',
        ':hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
            borderColor: '#667eea'
        }
    },
    relatedImage: {
        width: '100%',
        height: '150px',
        objectFit: 'cover',
        borderRadius: '8px',
        marginBottom: '10px'
    },
    relatedName: {
        fontSize: '0.95rem',
        margin: '5px 0',
        color: '#333'
    },
    relatedPrice: {
        fontWeight: 'bold',
        color: '#e44d26',
        marginTop: '5px'
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '500px',
        gap: '20px'
    },
    spinner: {
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #667eea',
        borderRadius: '50%',
        width: '60px',
        height: '60px',
        animation: 'spin 1s linear infinite'
    }
};

export default ProductDetails;