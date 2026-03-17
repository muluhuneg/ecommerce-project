import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { 
    FaSearch, 
    FaFilter, 
    FaStar, 
    FaShoppingCart, 
    FaHeart,
    FaTimes,
    FaChevronDown,
    FaChevronUp,
    FaCheckCircle
} from 'react-icons/fa';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedBrand, setSelectedBrand] = useState('all');
    const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
    const [selectedRating, setSelectedRating] = useState(0);
    const [inStockOnly, setInStockOnly] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage] = useState(12);
    const [addingToCart, setAddingToCart] = useState({});
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const location = useLocation();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

    // Format Birr price with commas
    const formatBirr = (price) => {
        return Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    // Show toast message
    const showToastMessage = (message) => {
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => {
            setShowToast(false);
        }, 3000);
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        // Parse URL params
        const params = new URLSearchParams(location.search);
        const categoryParam = params.get('category');
        if (categoryParam) {
            setSelectedCategory(categoryParam);
        }
    }, [location]);

    useEffect(() => {
        filterAndSortProducts();
    }, [products, selectedCategory, selectedBrand, priceRange, selectedRating, inStockOnly, searchTerm, sortBy]);

    const fetchProducts = async () => {
        try {
            const response = await API.get('/products');
            setProducts(response.data);
            
            // Extract unique brands
            const uniqueBrands = [...new Set(response.data.map(p => p.brand).filter(Boolean))];
            setBrands(uniqueBrands);
            
            // Set max price from products
            const maxProductPrice = Math.max(...response.data.map(p => p.price));
            setPriceRange(prev => ({ ...prev, max: maxProductPrice }));
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await API.get('/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            // Mock categories if API fails
            setCategories([
                { id: 1, name: 'Electronics' },
                { id: 2, name: 'Fashion' },
                { id: 3, name: 'Home & Garden' },
                { id: 4, name: 'Books' },
                { id: 5, name: 'Sports' }
            ]);
        }
    };

    const filterAndSortProducts = () => {
        let filtered = [...products];

        // Filter by category
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(p => p.category_id === parseInt(selectedCategory));
        }

        // Filter by brand
        if (selectedBrand !== 'all') {
            filtered = filtered.filter(p => p.brand === selectedBrand);
        }

        // Filter by price range
        filtered = filtered.filter(p => p.price >= priceRange.min && p.price <= priceRange.max);

        // Filter by rating
        if (selectedRating > 0) {
            filtered = filtered.filter(p => (p.rating || 4) >= selectedRating);
        }

        // Filter by stock
        if (inStockOnly) {
            filtered = filtered.filter(p => p.stock > 0);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Sort products
        switch(sortBy) {
            case 'price-low':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'newest':
                filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
            case 'popular':
                filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
                break;
            case 'rating':
                filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            default:
                break;
        }

        setFilteredProducts(filtered);
    };

    const clearFilters = () => {
        setSelectedCategory('all');
        setSelectedBrand('all');
        setPriceRange({ min: 0, max: Math.max(...products.map(p => p.price)) });
        setSelectedRating(0);
        setInStockOnly(false);
        setSearchTerm('');
        setSortBy('newest');
    };

    const handleAddToCart = async (e, product) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (product.stock <= 0) {
            showToastMessage(`${product.name} is out of stock`);
            return;
        }
        
        setAddingToCart(prev => ({ ...prev, [product.id]: true }));
        
        try {
            await addToCart(product, 1);
            showToastMessage(`${product.name} added to cart!`);
            setTimeout(() => {
                setAddingToCart(prev => ({ ...prev, [product.id]: false }));
            }, 500);
        } catch (error) {
            console.error('Error adding to cart:', error);
            showToastMessage('Failed to add to cart');
            setAddingToCart(prev => ({ ...prev, [product.id]: false }));
        }
    };

    const handleWishlistToggle = (e, product) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (isInWishlist(product.id)) {
            removeFromWishlist(product.id);
            showToastMessage(`${product.name} removed from wishlist`);
        } else {
            addToWishlist(product);
            showToastMessage(`${product.name} added to wishlist!`);
        }
    };

    // Get current products for pagination
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    const ProductCard = ({ product }) => {
        const inWishlist = isInWishlist(product.id);
        const isAdding = addingToCart[product.id];

        return (
            <div 
                style={styles.productCard}
                onClick={() => navigate(`/product/${product.id}`)}
            >
                <div style={styles.productImageContainer}>
                    <img 
                        src={product.image_url || 'https://via.placeholder.com/300x200?text=Product'} 
                        alt={product.name}
                        style={styles.productImage}
                        onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x200?text=Product';
                        }}
                    />
                    {product.discount_price && (
                        <span style={styles.discountBadge}>
                            {Math.round((1 - product.discount_price/product.price) * 100)}% OFF
                        </span>
                    )}
                    <button 
                        style={{
                            ...styles.wishlistButton,
                            color: inWishlist ? '#ff4757' : '#747d8c'
                        }}
                        onClick={(e) => handleWishlistToggle(e, product)}
                    >
                        <FaHeart />
                    </button>
                </div>
                <div style={styles.productInfo}>
                    <h3 style={styles.productName}>{product.name}</h3>
                    <div style={styles.productRating}>
                        {[1,2,3,4,5].map(star => (
                            <FaStar 
                                key={star} 
                                color={star <= (product.rating || 4) ? '#ffc107' : '#e4e5e9'} 
                                size={14} 
                            />
                        ))}
                        <span style={styles.reviewCount}>({product.review_count || 24})</span>
                    </div>
                    <div style={styles.productPriceRow}>
                        {product.discount_price ? (
                            <>
                                <span style={styles.discountPrice}>{formatBirr(product.discount_price)} Br</span>
                                <span style={styles.originalPrice}>{formatBirr(product.price)} Br</span>
                            </>
                        ) : (
                            <span style={styles.productPrice}>{formatBirr(product.price)} Br</span>
                        )}
                    </div>
                    <p style={styles.stockStatus}>
                        {product.stock > 0 ? (
                            <span style={{color: '#28a745'}}>In Stock ({product.stock})</span>
                        ) : (
                            <span style={{color: '#dc3545'}}>Out of Stock</span>
                        )}
                    </p>
                    <button 
                        style={{
                            ...styles.addToCartBtn,
                            backgroundColor: isAdding ? '#27ae60' : (product.stock === 0 ? '#95a5a6' : '#3498db'),
                            cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                            opacity: product.stock === 0 ? 0.6 : 1
                        }}
                        onClick={(e) => handleAddToCart(e, product)}
                        disabled={product.stock === 0 || isAdding}
                    >
                        <FaShoppingCart /> 
                        {isAdding ? 'Adding...' : (product.stock > 0 ? 'Add to Cart' : 'Out of Stock')}
                    </button>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Toast Notification */}
            {showToast && (
                <div style={styles.toast}>
                    <FaCheckCircle style={{ color: '#27ae60', marginRight: '8px' }} />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Header with Search and Filter Toggle */}
            <div style={styles.header}>
                <h1 style={styles.title}>All Products</h1>
                <div style={styles.searchBar}>
                    <FaSearch style={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={styles.searchInput}
                    />
                </div>
                <button 
                    style={styles.filterToggle}
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <FaFilter /> Filters
                    {showFilters ? <FaChevronUp /> : <FaChevronDown />}
                </button>
            </div>

            {/* Main Content */}
            <div style={styles.mainContent}>
                {/* Filters Sidebar */}
                {showFilters && (
                    <div style={styles.filtersSidebar}>
                        <div style={styles.filtersHeader}>
                            <h3>Filters</h3>
                            <button onClick={clearFilters} style={styles.clearFilters}>
                                Clear All
                            </button>
                        </div>

                        {/* Category Filter */}
                        <div style={styles.filterSection}>
                            <h4>Category</h4>
                            <select 
                                value={selectedCategory} 
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                style={styles.filterSelect}
                            >
                                <option value="all">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Brand Filter */}
                        {brands.length > 0 && (
                            <div style={styles.filterSection}>
                                <h4>Brand</h4>
                                <select 
                                    value={selectedBrand} 
                                    onChange={(e) => setSelectedBrand(e.target.value)}
                                    style={styles.filterSelect}
                                >
                                    <option value="all">All Brands</option>
                                    {brands.map(brand => (
                                        <option key={brand} value={brand}>{brand}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Price Range Filter */}
                        <div style={styles.filterSection}>
                            <h4>Price Range (Br)</h4>
                            <div style={styles.priceRange}>
                                <input
                                    type="number"
                                    value={priceRange.min}
                                    onChange={(e) => setPriceRange({...priceRange, min: Number(e.target.value)})}
                                    style={styles.priceInput}
                                    placeholder="Min"
                                />
                                <span style={styles.priceSeparator}>-</span>
                                <input
                                    type="number"
                                    value={priceRange.max}
                                    onChange={(e) => setPriceRange({...priceRange, max: Number(e.target.value)})}
                                    style={styles.priceInput}
                                    placeholder="Max"
                                />
                            </div>
                            <input
                                type="range"
                                min={0}
                                max={Math.max(...products.map(p => p.price))}
                                value={priceRange.max}
                                onChange={(e) => setPriceRange({...priceRange, max: Number(e.target.value)})}
                                style={styles.rangeSlider}
                            />
                        </div>

                        {/* Rating Filter */}
                        <div style={styles.filterSection}>
                            <h4>Minimum Rating</h4>
                            {[4,3,2,1].map(rating => (
                                <label key={rating} style={styles.ratingLabel}>
                                    <input
                                        type="radio"
                                        name="rating"
                                        value={rating}
                                        checked={selectedRating === rating}
                                        onChange={() => setSelectedRating(rating)}
                                    />
                                    <div style={styles.ratingStars}>
                                        {[1,2,3,4,5].map(star => (
                                            <FaStar 
                                                key={star} 
                                                color={star <= rating ? '#ffc107' : '#e4e5e9'} 
                                                size={14} 
                                            />
                                        ))}
                                        <span style={styles.ratingText}>& up</span>
                                    </div>
                                </label>
                            ))}
                            <label style={styles.ratingLabel}>
                                <input
                                    type="radio"
                                    name="rating"
                                    value={0}
                                    checked={selectedRating === 0}
                                    onChange={() => setSelectedRating(0)}
                                />
                                <span>All Ratings</span>
                            </label>
                        </div>

                        {/* Availability Filter */}
                        <div style={styles.filterSection}>
                            <label style={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={inStockOnly}
                                    onChange={() => setInStockOnly(!inStockOnly)}
                                />
                                In Stock Only
                            </label>
                        </div>
                    </div>
                )}

                {/* Products Grid */}
                <div style={{
                    ...styles.productsContainer,
                    width: showFilters ? 'calc(100% - 280px)' : '100%'
                }}>
                    {/* Sort and Results Count */}
                    <div style={styles.toolbar}>
                        <p style={styles.resultsCount}>
                            {filteredProducts.length} products found
                        </p>
                        <select 
                            value={sortBy} 
                            onChange={(e) => setSortBy(e.target.value)}
                            style={styles.sortSelect}
                        >
                            <option value="newest">Newest</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="popular">Most Popular</option>
                            <option value="rating">Top Rated</option>
                        </select>
                    </div>

                    {/* Products Grid */}
                    {currentProducts.length === 0 ? (
                        <div style={styles.noProducts}>
                            <h3>No products found</h3>
                            <p>Try adjusting your filters or search terms</p>
                            <button onClick={clearFilters} style={styles.clearFiltersBtn}>
                                Clear All Filters
                            </button>
                        </div>
                    ) : (
                        <div style={styles.productsGrid}>
                            {currentProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div style={styles.pagination}>
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                style={styles.pageButton}
                            >
                                Previous
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setCurrentPage(i + 1)}
                                    style={{
                                        ...styles.pageButton,
                                        ...styles.pageNumber,
                                        backgroundColor: currentPage === i + 1 ? '#3498db' : 'white',
                                        color: currentPage === i + 1 ? 'white' : '#333'
                                    }}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                style={styles.pageButton}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    @keyframes slideIn {
                        from {
                            transform: translateX(100%);
                            opacity: 0;
                        }
                        to {
                            transform: translateX(0);
                            opacity: 1;
                        }
                    }
                `}
            </style>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '20px',
        position: 'relative'
    },
    // Toast Notification
    toast: {
        position: 'fixed',
        top: '80px',
        right: '20px',
        backgroundColor: 'white',
        color: '#333',
        padding: '12px 20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        animation: 'slideIn 0.3s ease',
        fontSize: '0.9rem',
        '@media (max-width: 480px)': {
            top: '70px',
            right: '10px',
            left: '10px',
            width: 'calc(100% - 20px)',
            fontSize: '0.8rem'
        }
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        gap: '20px',
        '@media (max-width: 768px)': {
            flexDirection: 'column',
            alignItems: 'stretch'
        }
    },
    title: {
        fontSize: '2rem',
        color: '#333',
        margin: 0,
        '@media (max-width: 768px)': {
            fontSize: '1.5rem'
        }
    },
    searchBar: {
        flex: 1,
        maxWidth: '400px',
        position: 'relative',
        '@media (max-width: 768px)': {
            maxWidth: '100%'
        }
    },
    searchIcon: {
        position: 'absolute',
        left: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#999'
    },
    searchInput: {
        width: '100%',
        padding: '12px 12px 12px 40px',
        border: '1px solid #ddd',
        borderRadius: '25px',
        fontSize: '1rem',
        '@media (max-width: 768px)': {
            padding: '10px 10px 10px 35px'
        }
    },
    filterToggle: {
        padding: '10px 20px',
        background: 'white',
        border: '1px solid #ddd',
        borderRadius: '25px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        '@media (max-width: 768px)': {
            width: '100%',
            justifyContent: 'center'
        }
    },
    mainContent: {
        display: 'flex',
        gap: '20px',
        position: 'relative',
        '@media (max-width: 768px)': {
            flexDirection: 'column'
        }
    },
    filtersSidebar: {
        width: '260px',
        background: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        height: 'fit-content',
        position: 'sticky',
        top: '20px',
        '@media (max-width: 768px)': {
            width: '100%',
            position: 'static',
            marginBottom: '20px'
        }
    },
    filtersHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '10px',
        borderBottom: '1px solid #eee'
    },
    clearFilters: {
        background: 'none',
        border: 'none',
        color: '#3498db',
        cursor: 'pointer'
    },
    filterSection: {
        marginBottom: '20px',
        paddingBottom: '20px',
        borderBottom: '1px solid #eee'
    },
    filterSelect: {
        width: '100%',
        padding: '8px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        marginTop: '5px'
    },
    priceRange: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '10px'
    },
    priceInput: {
        flex: 1,
        padding: '8px',
        border: '1px solid #ddd',
        borderRadius: '4px'
    },
    priceSeparator: {
        color: '#999'
    },
    rangeSlider: {
        width: '100%'
    },
    ratingLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '8px',
        cursor: 'pointer'
    },
    ratingStars: {
        display: 'flex',
        alignItems: 'center',
        gap: '2px'
    },
    ratingText: {
        marginLeft: '5px',
        fontSize: '0.9rem',
        color: '#666'
    },
    checkboxLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer'
    },
    productsContainer: {
        transition: 'width 0.3s',
        '@media (max-width: 768px)': {
            width: '100% !important'
        }
    },
    toolbar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        '@media (max-width: 480px)': {
            flexDirection: 'column',
            gap: '10px',
            alignItems: 'flex-start'
        }
    },
    resultsCount: {
        color: '#666',
        '@media (max-width: 480px)': {
            fontSize: '0.9rem'
        }
    },
    sortSelect: {
        padding: '8px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        '@media (max-width: 480px)': {
            width: '100%'
        }
    },
    productsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px',
        '@media (max-width: 480px)': {
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '10px'
        }
    },
    productCard: {
        background: 'white',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'transform 0.3s',
        cursor: 'pointer',
        position: 'relative',
        '@media (max-width: 480px)': {
            borderRadius: '8px'
        }
    },
    productImageContainer: {
        position: 'relative',
        height: '200px',
        overflow: 'hidden',
        '@media (max-width: 480px)': {
            height: '130px'
        }
    },
    productImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
    },
    discountBadge: {
        position: 'absolute',
        top: '10px',
        left: '10px',
        background: '#ff6b6b',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '0.8rem',
        fontWeight: 'bold',
        '@media (max-width: 480px)': {
            padding: '2px 6px',
            fontSize: '0.7rem',
            top: '5px',
            left: '5px'
        }
    },
    wishlistButton: {
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
        transition: 'all 0.2s',
        '@media (max-width: 480px)': {
            width: '28px',
            height: '28px',
            top: '5px',
            right: '5px'
        }
    },
    productInfo: {
        padding: '15px',
        '@media (max-width: 480px)': {
            padding: '8px'
        }
    },
    productName: {
        fontSize: '1rem',
        margin: '0 0 10px',
        color: '#333',
        height: '40px',
        overflow: 'hidden',
        '@media (max-width: 480px)': {
            fontSize: '0.8rem',
            height: 'auto',
            margin: '0 0 5px',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis'
        }
    },
    productRating: {
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
        marginBottom: '10px',
        '@media (max-width: 480px)': {
            marginBottom: '5px'
        }
    },
    reviewCount: {
        fontSize: '0.8rem',
        color: '#666',
        marginLeft: '5px',
        '@media (max-width: 480px)': {
            fontSize: '0.7rem'
        }
    },
    productPriceRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '5px',
        '@media (max-width: 480px)': {
            gap: '5px',
            flexWrap: 'wrap'
        }
    },
    productPrice: {
        fontSize: '1.2rem',
        fontWeight: 'bold',
        color: '#333',
        '@media (max-width: 480px)': {
            fontSize: '1rem'
        }
    },
    discountPrice: {
        fontSize: '1.2rem',
        fontWeight: 'bold',
        color: '#e44d26',
        '@media (max-width: 480px)': {
            fontSize: '1rem'
        }
    },
    originalPrice: {
        fontSize: '0.9rem',
        color: '#999',
        textDecoration: 'line-through',
        '@media (max-width: 480px)': {
            fontSize: '0.75rem'
        }
    },
    stockStatus: {
        fontSize: '0.9rem',
        marginBottom: '10px',
        '@media (max-width: 480px)': {
            fontSize: '0.7rem',
            marginBottom: '5px'
        }
    },
    addToCartBtn: {
        width: '100%',
        padding: '8px',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '5px',
        transition: 'all 0.2s',
        '@media (max-width: 480px)': {
            padding: '5px',
            fontSize: '0.7rem'
        }
    },
    noProducts: {
        textAlign: 'center',
        padding: '60px',
        background: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        '@media (max-width: 480px)': {
            padding: '30px'
        }
    },
    clearFiltersBtn: {
        padding: '10px 20px',
        background: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        marginTop: '20px'
    },
    pagination: {
        display: 'flex',
        justifyContent: 'center',
        gap: '5px',
        marginTop: '30px',
        flexWrap: 'wrap'
    },
    pageButton: {
        padding: '8px 12px',
        border: '1px solid #ddd',
        background: 'white',
        cursor: 'pointer',
        borderRadius: '4px',
        '@media (max-width: 480px)': {
            padding: '6px 10px',
            fontSize: '0.9rem'
        }
    },
    pageNumber: {
        minWidth: '40px',
        '@media (max-width: 480px)': {
            minWidth: '35px'
        }
    },
    loadingContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '500px'
    },
    spinner: {
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #3498db',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        animation: 'spin 1s linear infinite'
    }
};

export default Products;