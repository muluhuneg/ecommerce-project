import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/seller/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Public pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import SellerLogin from './pages/seller/SellerLogin';
import SellerRegister from './pages/seller/SellerRegister';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import Wishlist from './pages/Wishlist';
import Notifications from './pages/Notifications';

// Payment callback pages
import OrderSuccess from './pages/OrderSuccess';
import OrderFailed from './pages/OrderFailed';

// Secret Admin Login Page - IMPORT THIS
import SecretAdminLogin from './pages/admin/SecretAdminLogin';

// Seller pages
import SellerDashboard from './pages/seller/Dashboard';
import SellerProducts from './pages/seller/Products';
import AddProduct from './pages/seller/AddProduct';
import EditProduct from './pages/seller/EditProduct';
import SellerOrders from './pages/seller/Orders';
import SellerEarnings from './pages/seller/Earnings';
import SellerProfile from './pages/seller/Profile';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminNotifications from './pages/admin/Notifications';
import AdminUsers from './pages/admin/Users';
import AdminSellers from './pages/admin/Sellers';
import AdminCategories from './pages/admin/Categories';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import AdminReports from './pages/admin/Reports';
import AdminSettings from './pages/admin/Settings';

function App() {
    return (
        <Router>
            <AuthProvider>
                <NotificationProvider>
                    <WishlistProvider>
                        <CartProvider>
                            <div style={styles.appContainer}>
                                <Navbar />
                                <div style={styles.mainContent}>
                                    <Routes>
                                        {/* ========== PUBLIC ROUTES ========== */}
                                        <Route path="/" element={<Home />} />
                                        <Route path="/products" element={<Products />} />
                                        <Route path="/product/:id" element={<ProductDetails />} />
                                        <Route path="/cart" element={<Cart />} />
                                        <Route path="/checkout" element={<Checkout />} />
                                        <Route path="/login" element={<Login />} />
                                        <Route path="/register" element={<Register />} />
                                        <Route path="/forgot-password" element={<ForgotPassword />} />
                                        <Route path="/reset-password" element={<ResetPassword />} />
                                        <Route path="/seller/login" element={<SellerLogin />} />
                                        <Route path="/seller/register" element={<SellerRegister />} />
                                        <Route path="/profile" element={<Profile />} />
                                        <Route path="/orders" element={<Orders />} />
                                        <Route path="/wishlist" element={<Wishlist />} />
                                        <Route path="/notifications" element={<Notifications />} />
                                        
                                        {/* 🔐 SECRET ADMIN LOGIN PAGE - Hidden route */}
                                        <Route path="/admin/secure-portal" element={<SecretAdminLogin />} />
                                        
                                        {/* Payment callback routes */}
                                        <Route path="/order-success" element={<OrderSuccess />} />
                                        <Route path="/order-failed" element={<OrderFailed />} />

                                        {/* ========== SELLER PROTECTED ROUTES ========== */}
                                        <Route element={<ProtectedRoute allowedRoles={['seller']} />}>
                                            <Route path="/seller/dashboard" element={<SellerDashboard />} />
                                            <Route path="/seller/products" element={<SellerProducts />} />
                                            <Route path="/seller/products/add" element={<AddProduct />} />
                                            <Route path="/seller/products/edit/:id" element={<EditProduct />} />
                                            <Route path="/seller/orders" element={<SellerOrders />} />
                                            <Route path="/seller/earnings" element={<SellerEarnings />} />
                                            <Route path="/seller/profile" element={<SellerProfile />} />
                                        </Route>

                                        {/* ========== ADMIN PROTECTED ROUTES ========== */}
                                        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                                            <Route path="/admin/dashboard" element={<AdminDashboard />} />
                                            <Route path="/admin/users" element={<AdminUsers />} />
                                            <Route path="/admin/sellers" element={<AdminSellers />} />
                                            <Route path="/admin/categories" element={<AdminCategories />} />
                                            <Route path="/admin/products" element={<AdminProducts />} />
                                            <Route path="/admin/orders" element={<AdminOrders />} />
                                            <Route path="/admin/reports" element={<AdminReports />} />
                                            <Route path="/admin/settings" element={<AdminSettings />} />
                                            <Route path="/admin/notifications" element={<AdminNotifications />} />
                                        </Route>

                                        {/* ========== 404 NOT FOUND ========== */}
                                        <Route path="*" element={
                                            <div style={styles.notFound}>
                                                <h1 style={styles.notFoundTitle}>404</h1>
                                                <p style={styles.notFoundText}>Page Not Found</p>
                                                <a 
                                                    href="/" 
                                                    style={styles.homeLink}
                                                    onMouseEnter={(e) => {
                                                        e.target.style.backgroundColor = '#764ba2';
                                                        e.target.style.transform = 'translateY(-2px)';
                                                        e.target.style.boxShadow = '0 4px 8px rgba(102, 126, 234, 0.4)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.target.style.backgroundColor = '#667eea';
                                                        e.target.style.transform = 'translateY(0)';
                                                        e.target.style.boxShadow = 'none';
                                                    }}
                                                >
                                                    Go Home
                                                </a>
                                            </div>
                                        } />
                                    </Routes>
                                </div>
                                <Footer />
                            </div>
                        </CartProvider>
                    </WishlistProvider>
                </NotificationProvider>
            </AuthProvider>
        </Router>
    );
}

// Styles for App container and layout
const styles = {
    appContainer: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#f8f9fa'
    },
    mainContent: {
        flex: 1,
        width: '100%'
    },
    notFound: {
        textAlign: 'center',
        padding: '100px 20px',
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        borderRadius: '12px',
        margin: '20px auto',
        maxWidth: '600px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    notFoundTitle: {
        fontSize: '4rem',
        color: '#dc3545',
        margin: 0
    },
    notFoundText: {
        fontSize: '1.5rem',
        color: '#666',
        margin: '20px 0'
    },
    homeLink: {
        display: 'inline-block',
        marginTop: '20px',
        padding: '12px 30px',
        backgroundColor: '#667eea',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '25px',
        fontSize: '1rem',
        transition: 'all 0.3s ease',
        cursor: 'pointer'
    }
};

export default App;