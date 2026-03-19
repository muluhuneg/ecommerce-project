import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import adminApi from '../../services/adminApi';
import { 
    FaBox, 
    FaShoppingCart, 
    FaUsers, 
    FaMoneyBillWave,
    FaSpinner,
    FaExclamationTriangle,
    FaChartLine,
    FaStore,
    FaEye,
    FaCheck,
    FaTimes
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [stats, setStats] = useState({
        total_orders: 0,
        pending_orders: 0,
        total_revenue: 0,
        total_users: 0,
        total_products: 0,
        total_sellers: 0,
        average_order_value: 0,
        monthly: []
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [pendingProducts, setPendingProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            
            // Fetch all data in parallel
            const [
                statsData,
                ordersData,
                productsData
            ] = await Promise.all([
                adminApi.getDashboardStats(),
                adminApi.getRecentOrders(),
                adminApi.getPendingProducts()
            ]);

            console.log('📊 Stats data:', statsData);
            console.log('📦 Orders data:', ordersData);
            console.log('🔄 Products data:', productsData);

            // Safely parse stats data
            setStats({
                total_orders: Number(statsData?.total_orders) || 0,
                pending_orders: Number(statsData?.pending_orders) || 0,
                total_revenue: Number(statsData?.total_revenue) || 0,
                total_users: Number(statsData?.total_users) || 0,
                total_products: Number(statsData?.total_products) || 0,
                total_sellers: Number(statsData?.total_sellers) || 0,
                average_order_value: Number(statsData?.average_order_value) || 0,
                monthly: Array.isArray(statsData?.monthly) ? statsData.monthly : []
            });

            setRecentOrders(Array.isArray(ordersData) ? ordersData : []);
            setPendingProducts(Array.isArray(productsData) ? productsData : []);

        } catch (error) {
            console.error('❌ Error fetching dashboard data:', error);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        const num = Number(amount);
        if (isNaN(num)) return '0 Br';
        return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' Br';
    };

    const formatNumber = (num) => {
        const n = Number(num);
        return isNaN(n) ? '0' : n.toString();
    };

    const StatCard = ({ icon, title, value, color }) => (
        <div style={styles.statCard}>
            <div style={{...styles.statIcon, backgroundColor: color}}>
                {icon}
            </div>
            <div style={styles.statInfo}>
                <h3 style={styles.statTitle}>{title}</h3>
                <p style={styles.statValue}>{value}</p>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div style={styles.container}>
                <AdminSidebar />
                <div style={styles.mainContent}>
                    <div style={styles.loadingContainer}>
                        <FaSpinner className="spinner" size={50} />
                        <p>Loading dashboard data...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.container}>
                <AdminSidebar />
                <div style={styles.mainContent}>
                    <div style={styles.errorContainer}>
                        <FaExclamationTriangle size={50} color="#dc3545" />
                        <h3>{error}</h3>
                        <button onClick={fetchDashboardData} style={styles.retryButton}>
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page" style={styles.container}>
            <AdminSidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
            <button style={styles.menuButton} onClick={() => setIsMobileMenuOpen(true)}>
                ☰
            </button>
            <div className="admin-main-content" style={styles.mainContent}>
                <h1 style={styles.title}>Admin Dashboard</h1>

                {/* Stats Grid */}
                <div style={styles.statsGrid}>
                    <StatCard 
                        icon={<FaShoppingCart />}
                        title="Total Orders"
                        value={formatNumber(stats.total_orders)}
                        color="#3498db"
                    />
                    <StatCard 
                        icon={<FaMoneyBillWave />}
                        title="Total Revenue"
                        value={formatCurrency(stats.total_revenue)}
                        color="#28a745"
                    />
                    <StatCard 
                        icon={<FaUsers />}
                        title="Total Users"
                        value={formatNumber(stats.total_users)}
                        color="#17a2b8"
                    />
                    <StatCard 
                        icon={<FaBox />}
                        title="Total Products"
                        value={formatNumber(stats.total_products)}
                        color="#ffc107"
                    />
                    <StatCard 
                        icon={<FaStore />}
                        title="Total Sellers"
                        value={formatNumber(stats.total_sellers)}
                        color="#6f42c1"
                    />
                    <StatCard 
                        icon={<FaExclamationTriangle />}
                        title="Pending Sellers"
                        value={formatNumber(stats.pending_sellers)}
                        color="#dc3545"
                    />
                    <StatCard 
                        icon={<FaExclamationTriangle />}
                        title="Pending Products"
                        value={formatNumber(stats.pending_products)}
                        color="#fd7e14"
                    />
                    <StatCard 
                        icon={<FaChartLine />}
                        title="Avg Order Value"
                        value={formatCurrency(stats.average_order_value)}
                        color="#fd7e14"
                    />
                </div>

                {/* Pending Products Section */}
                {pendingProducts.length > 0 && (
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>Pending Products Approval</h2>
                        <div style={styles.pendingGrid}>
                            {pendingProducts.slice(0, 5).map(product => (
                                <div key={product.id} style={styles.pendingCard}>
                                    <img 
                                        src={product.image_url || 'https://via.placeholder.com/100'} 
                                        alt={product.name}
                                        style={styles.pendingImage}
                                    />
                                    <div style={styles.pendingInfo}>
                                        <h4>{product.name}</h4>
                                        <p>Seller: {product.seller_name || 'N/A'}</p>
                                        <p>Price: {formatCurrency(product.price)}</p>
                                    </div>
                                    <div style={styles.pendingActions}>
                                        <Link to={`/admin/products/${product.id}`} style={styles.viewButton}>
                                            <FaEye /> Review
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {pendingProducts.length > 5 && (
                            <Link to="/admin/products" style={styles.viewAllLink}>
                                View All ({pendingProducts.length}) Pending Products
                            </Link>
                        )}
                    </div>
                )}

                {/* Recent Orders Section */}
                {recentOrders.length > 0 && (
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>Recent Orders</h2>
                        <div style={styles.tableContainer}>
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Order #</th>
                                        <th>Customer</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.slice(0, 10).map(order => (
                                        <tr key={order.id}>
                                            <td style={styles.tableCell}>{order.order_number}</td>
                                            <td style={styles.tableCell}>{order.customer_name || 'N/A'}</td>
                                            <td style={styles.tableCell}>{formatCurrency(order.grand_total)}</td>
                                            <td style={styles.tableCell}>
                                                <span style={{
                                                    ...styles.statusBadge,
                                                    backgroundColor: 
                                                        order.status === 'delivered' ? '#d4edda' :
                                                        order.status === 'processing' ? '#cce5ff' :
                                                        order.status === 'shipped' ? '#d1ecf1' :
                                                        order.status === 'pending' ? '#fff3cd' : '#f8d7da',
                                                    color:
                                                        order.status === 'delivered' ? '#155724' :
                                                        order.status === 'processing' ? '#004085' :
                                                        order.status === 'shipped' ? '#0c5460' :
                                                        order.status === 'pending' ? '#856404' : '#721c24'
                                                }}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td>{new Date(order.created_at).toLocaleDateString()}</td>
                                            <td>
                                                <Link to={`/admin/orders/${order.id}`} style={styles.actionLink}>
                                                    <FaEye />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Link to="/admin/orders" style={styles.viewAllLink}>
                            View All Orders
                        </Link>
                    </div>
                )}

                {/* Monthly Stats Chart (simplified) */}
                {stats.monthly && stats.monthly.length > 0 && (
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>Monthly Statistics</h2>
                        <div style={styles.monthlyGrid}>
                            {stats.monthly.slice(0, 6).map((month, index) => (
                                <div key={index} style={styles.monthlyCard}>
                                    <h4>{month.month}</h4>
                                    <p>Orders: {month.order_count || 0}</p>
                                    <p>Revenue: {formatCurrency(month.revenue)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

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
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        position: 'relative',
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
        overflowX: 'hidden'
    },
    menuButton: {
        position: 'fixed',
        top: '15px',
        left: '15px',
        zIndex: 1170,
        background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
        border: 'none',
        color: 'white',
        width: '45px',
        height: '45px',
        borderRadius: '8px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    mainContent: {
        flex: 1,
        marginLeft: '0',
        padding: '0',
        transition: 'all 0.3s ease'
    },
    title: {
        fontSize: '2rem',
        color: '#000',
        marginBottom: '2rem'
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '500px'
    },
    errorContainer: {
        textAlign: 'center',
        padding: '50px',
        background: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    retryButton: {
        marginTop: '20px',
        padding: '10px 30px',
        background: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
        marginBottom: '30px'
    },
    statCard: {
        background: 'white',
        borderRadius: '8px',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    statIcon: {
        width: '50px',
        height: '50px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.5rem',
        color: 'white'
    },
    statInfo: {
        flex: 1
    },
    statTitle: {
        fontSize: '0.9rem',
        color: '#000',
        marginBottom: '5px'
    },
    statValue: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#000',
        margin: 0
    },
    section: {
        background: 'white',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '30px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    sectionTitle: {
        fontSize: '1.3rem',
        color: '#000',
        margin: '0 0 20px',
        paddingBottom: '10px',
        borderBottom: '2px solid #f0f0f0'
    },
    pendingGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '15px',
        marginBottom: '15px'
    },
    pendingCard: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        padding: '15px',
        background: '#f8f9fa',
        borderRadius: '8px'
    },
    pendingImage: {
        width: '60px',
        height: '60px',
        borderRadius: '8px',
        objectFit: 'cover'
    },
    pendingInfo: {
        flex: 1,
        color: '#000'
    },
    pendingActions: {
        display: 'flex',
        gap: '5px'
    },
    viewButton: {
        padding: '5px 10px',
        background: '#3498db',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '4px',
        fontSize: '0.8rem',
        display: 'flex',
        alignItems: 'center',
        gap: '5px'
    },
    tableContainer: {
        overflowX: 'auto',
        marginBottom: '15px'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse'
    },
    tableCell: {
        color: '#000'
    },
    statusBadge: {
        padding: '3px 8px',
        borderRadius: '4px',
        fontSize: '0.8rem',
        display: 'inline-block'
    },
    actionLink: {
        color: '#3498db',
        textDecoration: 'none'
    },
    viewAllLink: {
        display: 'inline-block',
        color: '#3498db',
        textDecoration: 'none',
        marginTop: '10px'
    },
    monthlyGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: '15px'
    },
    monthlyCard: {
        background: '#f8f9fa',
        padding: '15px',
        borderRadius: '8px',
        textAlign: 'center'
    }
};

export default AdminDashboard;