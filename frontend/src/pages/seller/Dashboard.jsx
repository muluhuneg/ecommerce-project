import React, { useState, useEffect } from 'react';
import { 
    FaBox, 
    FaShoppingCart, 
    FaWallet, 
    FaDollarSign,
    FaTachometerAlt,
    FaStore,
    FaClipboardList,
    FaExclamationTriangle,
    FaHistory,
    FaMoneyBillWave,
    FaChartLine,
    FaDownload,
    FaCalendarAlt,
    FaCheckCircle,
    FaTimesCircle,
    FaClock,
    FaPlus,
    FaEye,
    FaFileInvoice,
    FaPercent
} from 'react-icons/fa';
import Sidebar from '../../components/seller/Sidebar';
import { useAuth } from '../../context/AuthContext';
import sellerApi from '../../services/sellerApi';
import { Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [recentOrders, setRecentOrders] = useState([]);
    const [error, setError] = useState(null);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawHistory, setWithdrawHistory] = useState([]);
    const [showWithdrawHistory, setShowWithdrawHistory] = useState(false);
    const [transactionHistory, setTransactionHistory] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState('week');
    const [salesData, setSalesData] = useState(null);
    const [products, setProducts] = useState([]);
    const [discounts, setDiscounts] = useState([
        { id: 1, code: 'SAVE10', description: '10% off on orders over 100 Br', expires: 'In 5 days' },
        { id: 2, code: 'FREESHIP', description: 'Free shipping on next 3 orders', expires: 'In 7 days' }
    ]);
    const [reviews, setReviews] = useState([
        { id: 1, name: 'Amina', rating: 4.8, text: 'Great service, fast shipping.', date: '2026-03-15' },
        { id: 2, name: 'Bekele', rating: 4.4, text: 'Good quality product.', date: '2026-03-14' },
        { id: 3, name: 'Sara', rating: 4.9, text: 'Excellent communication and delivery', date: '2026-03-13' }
    ]);
    const [loadingMore, setLoadingMore] = useState(false);
    const [withdrawError, setWithdrawError] = useState('');
    const [withdrawSuccess, setWithdrawSuccess] = useState('');
    const [bankDetails, setBankDetails] = useState({
        bankName: '',
        accountName: '',
        accountNumber: '',
        branch: ''
    });
    const [showBankForm, setShowBankForm] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const { user } = useAuth();

    useEffect(() => {
        fetchDashboardData();
        fetchWithdrawHistory();
        fetchTransactionHistory();
        fetchSalesData();
        fetchProducts();
    }, [selectedPeriod]);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768) {
                setIsMobileMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [statsData, ordersData] = await Promise.all([
                sellerApi.getDashboardStats(),
                sellerApi.getOrders()
            ]);
            
            const safeStats = {
                total_products: statsData?.total_products || 0,
                total_orders: statsData?.total_orders || 0,
                total_sales: statsData?.total_sales || 0,
                pending_orders: statsData?.pending_orders || 0,
                wallet: {
                    wallet_balance: statsData?.wallet?.wallet_balance || 0,
                    total_earnings: statsData?.wallet?.total_earnings || 0,
                    pending_withdrawal: statsData?.wallet?.pending_withdrawal || 0
                }
            };
            
            setStats(safeStats);
            setRecentOrders(ordersData?.slice(0, 5) || []);
            setError(null);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const fetchWithdrawHistory = async () => {
        try {
            const history = await sellerApi.getWithdrawalHistory();
            setWithdrawHistory(history || []);
        } catch (error) {
            console.error('Error fetching withdrawal history:', error);
        }
    };

    const fetchTransactionHistory = async () => {
        try {
            const transactions = await sellerApi.getWalletTransactions();
            setTransactionHistory(transactions?.slice(0, 10) || []);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        }
    };

    const fetchSalesData = async () => {
        try {
            let days = 7;
            if (selectedPeriod === 'month') days = 30;
            if (selectedPeriod === 'year') days = 365;

            const data = await sellerApi.getSalesReport(
                new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                new Date().toISOString().split('T')[0],
                selectedPeriod === 'year' ? 'month' : 'day'
            );

            setSalesData(data);
        } catch (error) {
            console.error('Error fetching sales data:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            const productsData = await sellerApi.getProducts();
            setProducts(productsData?.slice(0, 5) || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const formatCurrency = (value) => {
        if (value === undefined || value === null) return '0.00 Br';
        const num = Number(value);
        if (isNaN(num)) return '0.00 Br';
        return `${num.toFixed(2)} Br`;
    };

    const handleWithdrawRequest = async () => {
        setWithdrawError('');
        setWithdrawSuccess('');

        const amount = parseFloat(withdrawAmount);
        
        if (!amount || amount <= 0) {
            setWithdrawError('Please enter a valid amount');
            return;
        }

        if (amount > (stats?.wallet?.wallet_balance || 0)) {
            setWithdrawError('Insufficient balance');
            return;
        }

        if (amount < 100) {
            setWithdrawError('Minimum withdrawal amount is 100 Br');
            return;
        }

        if (!bankDetails.bankName || !bankDetails.accountName || !bankDetails.accountNumber) {
            setWithdrawError('Please complete your bank details first');
            setShowBankForm(true);
            return;
        }

        setLoadingMore(true);
        try {
            const result = await sellerApi.requestWithdrawal(amount);
            if (result.success) {
                setWithdrawSuccess('Withdrawal request submitted successfully!');
                setWithdrawAmount('');
                setShowWithdrawModal(false);
                fetchDashboardData();
                fetchWithdrawHistory();
                fetchTransactionHistory();
            } else {
                setWithdrawError(result.message || 'Failed to request withdrawal');
            }
        } catch (error) {
            setWithdrawError(error.response?.data?.message || 'Failed to request withdrawal');
        } finally {
            setLoadingMore(false);
        }
    };

    const handleSaveBankDetails = async () => {
        try {
            await sellerApi.updateSellerInfo({ bank_details: bankDetails });
            setShowBankForm(false);
            setWithdrawSuccess('Bank details saved successfully');
        } catch (error) {
            setWithdrawError('Failed to save bank details');
        }
    };

    const StatCard = ({ icon, title, value, bgColor, subtitle }) => (
        <div style={{ ...styles.statCard, backgroundColor: bgColor }}>
            <div style={styles.statIcon}>{icon}</div>
            <div style={styles.statContent}>
                <h3 style={styles.statTitle}>{title}</h3>
                <p style={styles.statValue}>{value}</p>
                {subtitle && <p style={styles.statSubtitle}>{subtitle}</p>}
            </div>
        </div>
    );

    const TransactionItem = ({ transaction }) => (
        <div style={styles.transactionItem}>
            <div style={styles.transactionIcon}>
                {transaction.type === 'credit' ? <FaMoneyBillWave color="#28a745" /> : 
                 transaction.type === 'withdrawal' ? <FaWallet color="#dc3545" /> : 
                 <FaClock color="#ffc107" />}
            </div>
            <div style={styles.transactionDetails}>
                <div style={styles.transactionHeader}>
                    <strong>{transaction.description}</strong>
                    <span style={{
                        ...styles.transactionAmount,
                        color: transaction.type === 'credit' ? '#28a745' : 
                               transaction.type === 'withdrawal' ? '#dc3545' : '#666'
                    }}>
                        {transaction.type === 'credit' ? '+' : '-'} {formatCurrency(transaction.amount)}
                    </span>
                </div>
                <div style={styles.transactionMeta}>
                    <span>{new Date(transaction.created_at).toLocaleString()}</span>
                    <span style={{
                        ...styles.transactionStatus,
                        backgroundColor: 
                            transaction.status === 'completed' ? '#d4edda' :
                            transaction.status === 'pending' ? '#fff3cd' :
                            transaction.status === 'failed' ? '#f8d7da' : '#e2e3e5',
                        color: 
                            transaction.status === 'completed' ? '#155724' :
                            transaction.status === 'pending' ? '#856404' :
                            transaction.status === 'failed' ? '#721c24' : '#383d41'
                    }}>
                        {transaction.status}
                    </span>
                </div>
            </div>
        </div>
    );

    const WithdrawModal = () => (
        <div style={styles.modalOverlay} onClick={() => setShowWithdrawModal(false)}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
                <h2 style={styles.modalTitle}>Request Withdrawal</h2>
                
                {withdrawError && (
                    <div style={styles.modalError}>
                        <FaExclamationTriangle /> {withdrawError}
                    </div>
                )}
                
                {withdrawSuccess && (
                    <div style={styles.modalSuccess}>
                        <FaCheckCircle /> {withdrawSuccess}
                    </div>
                )}

                <div style={styles.balanceInfo}>
                    <span>Available Balance:</span>
                    <strong style={{color: '#28a745', fontSize: '1.2rem'}}>
                        {formatCurrency(stats?.wallet?.wallet_balance)}
                    </strong>
                </div>

                <div style={styles.inputGroup}>
                    <label>Amount (Br)</label>
                    <input
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="Enter amount"
                        min="100"
                        max={stats?.wallet?.wallet_balance}
                        style={styles.modalInput}
                    />
                    <small>Minimum withdrawal: 100 Br</small>
                </div>

                {showBankForm && (
                    <div style={styles.bankForm}>
                        <h3>Bank Details</h3>
                        <input
                            type="text"
                            placeholder="Bank Name"
                            value={bankDetails.bankName}
                            onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                            style={styles.modalInput}
                        />
                        <input
                            type="text"
                            placeholder="Account Name"
                            value={bankDetails.accountName}
                            onChange={(e) => setBankDetails({...bankDetails, accountName: e.target.value})}
                            style={styles.modalInput}
                        />
                        <input
                            type="text"
                            placeholder="Account Number"
                            value={bankDetails.accountNumber}
                            onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                            style={styles.modalInput}
                        />
                        <input
                            type="text"
                            placeholder="Branch (Optional)"
                            value={bankDetails.branch}
                            onChange={(e) => setBankDetails({...bankDetails, branch: e.target.value})}
                            style={styles.modalInput}
                        />
                        <button 
                            onClick={handleSaveBankDetails}
                            style={styles.saveBankButton}
                        >
                            Save Bank Details
                        </button>
                    </div>
                )}

                <div style={styles.modalButtons}>
                    <button 
                        onClick={() => setShowWithdrawModal(false)}
                        style={styles.modalCancelButton}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleWithdrawRequest}
                        disabled={loadingMore}
                        style={{
                            ...styles.modalSubmitButton,
                            opacity: loadingMore ? 0.7 : 1
                        }}
                    >
                        {loadingMore ? 'Processing...' : 'Submit Request'}
                    </button>
                </div>
            </div>
        </div>
    );

    const WithdrawHistoryModal = () => (
        <div style={styles.modalOverlay} onClick={() => setShowWithdrawHistory(false)}>
            <div style={{...styles.modal, maxWidth: '600px'}} onClick={e => e.stopPropagation()}>
                <h2 style={styles.modalTitle}>Withdrawal History</h2>
                
                <div style={styles.historyList}>
                    {withdrawHistory.length === 0 ? (
                        <p style={styles.noData}>No withdrawal history</p>
                    ) : (
                        withdrawHistory.map((item, index) => (
                            <div key={index} style={styles.historyItem}>
                                <div style={styles.historyHeader}>
                                    <span style={styles.historyAmount}>{formatCurrency(item.amount)}</span>
                                    <span style={{
                                        ...styles.historyStatus,
                                        backgroundColor: 
                                            item.status === 'completed' ? '#d4edda' :
                                            item.status === 'pending' ? '#fff3cd' :
                                            item.status === 'failed' ? '#f8d7da' : '#e2e3e5',
                                        color: 
                                            item.status === 'completed' ? '#155724' :
                                            item.status === 'pending' ? '#856404' :
                                            item.status === 'failed' ? '#721c24' : '#383d41'
                                    }}>
                                        {item.status}
                                    </span>
                                </div>
                                <div style={styles.historyDate}>
                                    {new Date(item.created_at).toLocaleString()}
                                </div>
                                {item.reference && (
                                    <div style={styles.historyRef}>Ref: {item.reference}</div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                <button 
                    onClick={() => setShowWithdrawHistory(false)}
                    style={styles.modalCloseButton}
                >
                    Close
                </button>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div style={styles.container}>
                <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
                <div style={styles.mainContent}>
                    <div style={styles.loadingContainer}>
                        <div style={styles.spinner}></div>
                        <p>Loading dashboard...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.container}>
                <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
                <div style={styles.mainContent}>
                    <div style={styles.errorContainer}>
                        <FaExclamationTriangle size={50} color="#dc3545" />
                        <h2>Error Loading Dashboard</h2>
                        <p>{error}</p>
                        <button onClick={fetchDashboardData} style={styles.retryButton}>
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="seller-page" style={styles.container}>
            <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
            
            {/* Mobile Header */}
            <div style={styles.mobileHeader}>
                <button 
                    style={styles.menuButton}
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    ☰
                </button>
                <h2 style={styles.mobileTitle}>Seller Dashboard</h2>
                <div style={styles.mobileHeaderRight}>
                    <button 
                        style={styles.mobileHistoryButton}
                        onClick={() => setShowWithdrawHistory(true)}
                    >
                        <FaHistory />
                    </button>
                </div>
            </div>

            <div className="seller-main-content" style={styles.mainContent}>
                {/* Header */}
                <div style={styles.header}>
                    <div>
                        <h1 style={styles.welcomeTitle}>Welcome back, {user?.name || 'Seller'}!</h1>
                        <p style={styles.date}>
                            {new Date().toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}
                        </p>
                    </div>
                    <div style={styles.headerActions}>
                        <div style={styles.storeBadge}>
                            <FaStore />
                            <span>{user?.seller?.business_name || 'Your Store'}</span>
                        </div>
                        <button 
                            style={styles.historyButton}
                            onClick={() => setShowWithdrawHistory(true)}
                            title="View Withdrawal History"
                        >
                            <FaHistory /> History
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="statsGrid" style={styles.statsGrid}>
                    <StatCard
                        icon={<FaBox size={24} />}
                        title="Total Products"
                        value={stats?.total_products || 0}
                        bgColor="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                        subtitle="Active products"
                    />
                    <StatCard
                        icon={<FaShoppingCart size={24} />}
                        title="Total Orders"
                        value={stats?.total_orders || 0}
                        bgColor="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                        subtitle={`${stats?.pending_orders || 0} pending`}
                    />
                    <StatCard
                        icon={<FaDollarSign size={24} />}
                        title="Total Sales"
                        value={formatCurrency(stats?.total_sales)}
                        bgColor="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                        subtitle="Lifetime sales"
                    />
                    <StatCard
                        icon={<FaWallet size={24} />}
                        title="Wallet Balance"
                        value={formatCurrency(stats?.wallet?.wallet_balance)}
                        bgColor="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
                        subtitle="Available for withdrawal"
                    />
                </div>

                {/* Earnings & Quick Actions */}
                <div className="statsRow" style={styles.statsRow}>
                    <div style={styles.statsCard}>
                        <div style={styles.cardHeader}>
                            <h3>Earnings Overview</h3>
                            <div style={styles.periodSelector}>
                                <button 
                                    style={{...styles.periodButton, backgroundColor: selectedPeriod === 'week' ? '#667eea' : '#f0f0f0', color: selectedPeriod === 'week' ? 'white' : '#666'}}
                                    onClick={() => setSelectedPeriod('week')}
                                >
                                    Week
                                </button>
                                <button 
                                    style={{...styles.periodButton, backgroundColor: selectedPeriod === 'month' ? '#667eea' : '#f0f0f0', color: selectedPeriod === 'month' ? 'white' : '#666'}}
                                    onClick={() => setSelectedPeriod('month')}
                                >
                                    Month
                                </button>
                                <button 
                                    style={{...styles.periodButton, backgroundColor: selectedPeriod === 'year' ? '#667eea' : '#f0f0f0', color: selectedPeriod === 'year' ? 'white' : '#666'}}
                                    onClick={() => setSelectedPeriod('year')}
                                >
                                    Year
                                </button>
                            </div>
                        </div>
                        
                        <div style={styles.earningStats}>
                            <div style={styles.earningItem}>
                                <span>Total Earnings</span>
                                <strong style={{color: '#28a745', fontSize: '1.2rem'}}>
                                    {formatCurrency(stats?.wallet?.total_earnings)}
                                </strong>
                            </div>
                            <div style={styles.earningItem}>
                                <span>Pending Withdrawal</span>
                                <strong style={{color: '#ffc107'}}>
                                    {formatCurrency(stats?.wallet?.pending_withdrawal)}
                                </strong>
                            </div>
                            <div style={styles.earningItem}>
                                <span>Available Balance</span>
                                <strong style={{color: '#28a745', fontSize: '1.2rem'}}>
                                    {formatCurrency(stats?.wallet?.wallet_balance)}
                                </strong>
                            </div>
                        </div>

                        <div style={styles.withdrawSection}>
                            <button 
                                style={styles.withdrawButton}
                                onClick={() => setShowWithdrawModal(true)}
                            >
                                <FaMoneyBillWave /> Request Withdrawal
                            </button>
                            <button 
                                style={styles.downloadButton}
                                onClick={() => window.print()}
                            >
                                <FaDownload /> Export
                            </button>
                        </div>
                    </div>

                    <div style={styles.statsCard}>
                        <h3>Quick Actions</h3>
                        <div style={styles.quickActions}>
                            <button style={styles.quickAction}>
                                <FaPlus /> Add Product
                            </button>
                            <button style={styles.quickAction}>
                                <FaClipboardList /> View Orders
                            </button>
                            <button style={styles.quickAction}>
                                <FaStore /> Update Store
                            </button>
                            <button style={styles.quickAction}>
                                <FaFileInvoice /> Invoice
                            </button>
                        </div>
                    </div>
                </div>

                {/* Analytics Snapshot */}
                <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>Analytics Snapshot</h3>
                    <div style={styles.analyticsGrid}>
                        <div style={styles.analyticsCard}>
                            <h4>Weekly Sales</h4>
                            <p style={styles.analyticsValue}>{formatCurrency(salesData?.total_sales || stats?.total_sales)}</p>
                        </div>
                        <div style={styles.analyticsCard}>
                            <h4>Orders This Week</h4>
                            <p style={styles.analyticsValue}>{salesData?.orders_count || stats?.total_orders}</p>
                        </div>
                        <div style={styles.analyticsCard}>
                            <h4>Returns</h4>
                            <p style={styles.analyticsValue}>{salesData?.return_count || '0'}</p>
                        </div>
                    </div>
                </div>

                {/* Discounts & Promotions */}
                <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>Discounts & Promotions</h3>
                    <div style={styles.discountList}>
                        {discounts.map(d => (
                            <div key={d.id} style={styles.discountCard}>
                                <div>
                                    <strong>{d.code}</strong>
                                    <p>{d.description}</p>
                                </div>
                                <span style={styles.discountExpiry}>{d.expires}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Reviews */}
                <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>Latest Reviews</h3>
                    <div style={styles.reviewList}>
                        {reviews.map(r => (
                            <div key={r.id} style={styles.reviewCard}>
                                <div style={styles.reviewHeader}>
                                    <strong>{r.name}</strong>
                                    <span>{r.rating} ★</span>
                                </div>
                                <p>{r.text}</p>
                                <small>{new Date(r.date).toLocaleDateString()}</small>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="transactionsSection" style={styles.transactionsSection}>
                    <h3>Recent Transactions</h3>
                    <div style={styles.transactionsList}>
                        {transactionHistory.length === 0 ? (
                            <p style={styles.noData}>No transactions yet</p>
                        ) : (
                            transactionHistory.map((transaction, index) => (
                                <TransactionItem key={index} transaction={transaction} />
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="recentOrders" style={styles.recentOrders}>
                    <div style={styles.sectionHeader}>
                        <h2>Recent Orders</h2>
                        <a href="/seller/orders" style={styles.viewAllLink}>View All →</a>
                    </div>
                    
                    {recentOrders.length === 0 ? (
                        <div style={styles.noOrders}>
                            <p>No orders yet</p>
                        </div>
                    ) : (
                        <div className="tableContainer" style={styles.tableContainer}>
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.tableHeader}>Order #</th>
                                        <th style={styles.tableHeader}>Customer</th>
                                        <th style={styles.tableHeader}>Items</th>
                                        <th style={styles.tableHeader}>Total</th>
                                        <th style={styles.tableHeader}>Status</th>
                                        <th style={styles.tableHeader}>Date</th>
                                        <th style={styles.tableHeader}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map(order => (
                                        <tr key={order.id} style={styles.tableRow}>
                                            <td style={styles.tableCell}>#{order.order_number}</td>
                                            <td style={styles.tableCell}>{order.customer_name || 'N/A'}</td>
                                            <td style={styles.tableCell}>{order.item_count || 0}</td>
                                            <td style={styles.tableCell}>{formatCurrency(order.grand_total)}</td>
                                            <td style={styles.tableCell}>
                                                <span style={{
                                                    ...styles.statusBadge,
                                                    backgroundColor: 
                                                        order.status === 'delivered' ? '#d4edda' :
                                                        order.status === 'processing' ? '#fff3cd' :
                                                        order.status === 'shipped' ? '#cce5ff' :
                                                        order.status === 'pending' ? '#f8d7da' : '#e2e3e5',
                                                    color: 
                                                        order.status === 'delivered' ? '#155724' :
                                                        order.status === 'processing' ? '#856404' :
                                                        order.status === 'shipped' ? '#004085' :
                                                        order.status === 'pending' ? '#721c24' : '#383d41'
                                                }}>
                                                    {order.status || 'pending'}
                                                </span>
                                            </td>
                                            <td style={styles.tableCell}>
                                                {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td style={styles.tableCell}>
                                                <button style={styles.viewButton}>
                                                    <FaEye /> View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Top Products */}
                {products.length > 0 && (
                    <div style={styles.topProducts}>
                        <h3>Top Products</h3>
                        <div style={styles.productList}>
                            {products.map(product => (
                                <div key={product.id} style={styles.productItem}>
                                    <img 
                                        src={product.image_url || 'https://via.placeholder.com/50'} 
                                        alt={product.name}
                                        style={styles.productImage}
                                    />
                                    <div style={styles.productInfo}>
                                        <strong>{product.name}</strong>
                                        <span>{product.sold_count || 0} sold</span>
                                    </div>
                                    <span style={styles.productRevenue}>
                                        {formatCurrency(product.price * (product.sold_count || 0))}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {showWithdrawModal && <WithdrawModal />}
            {showWithdrawHistory && <WithdrawHistoryModal />}
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexWrap: 'wrap',
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        position: 'relative',
        overflowX: 'hidden',
        '@media (max-width: 768px)': {
            flexDirection: 'column'
        }
    },
    mainContent: {
        flex: 1,
        marginLeft: '0',
        padding: '2rem',
        transition: 'all 0.3s ease',
        '@media (max-width: 1024px)': {
            padding: '1.5rem'
        },
        '@media (max-width: 768px)': {
            marginLeft: '0',
            padding: '1rem',
            paddingTop: '70px'
        },
        '@media (max-width: 480px)': {
            padding: '0.8rem',
            paddingTop: '60px'
        }
    },
    // Mobile Header
    mobileHeader: {
        display: 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '60px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        zIndex: 999,
        padding: '0 1rem',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        '@media (max-width: 768px)': {
            display: 'flex'
        }
    },
    menuButton: {
        background: 'rgba(255,255,255,0.2)',
        border: 'none',
        color: 'white',
        width: '40px',
        height: '40px',
        borderRadius: '8px',
        fontSize: '1.5rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    mobileTitle: {
        color: 'white',
        fontSize: '1.2rem',
        margin: 0
    },
    mobileHeaderRight: {
        display: 'flex',
        gap: '0.5rem'
    },
    mobileHistoryButton: {
        background: 'rgba(255,255,255,0.2)',
        border: 'none',
        color: 'white',
        width: '40px',
        height: '40px',
        borderRadius: '8px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.2rem'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        '@media (max-width: 768px)': {
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '1rem',
            marginBottom: '1.5rem'
        },
        '@media (max-width: 480px)': {
            marginBottom: '1rem'
        }
    },
    welcomeTitle: {
        fontSize: '1.8rem',
        color: '#333',
        margin: '0 0 0.5rem',
        '@media (max-width: 768px)': {
            fontSize: '1.5rem'
        },
        '@media (max-width: 480px)': {
            fontSize: '1.3rem'
        }
    },
    date: {
        color: '#666',
        margin: 0,
        '@media (max-width: 480px)': {
            fontSize: '0.9rem'
        }
    },
    headerActions: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        '@media (max-width: 768px)': {
            width: '100%',
            justifyContent: 'space-between'
        }
    },
    storeBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        '@media (max-width: 480px)': {
            padding: '0.4rem 0.8rem',
            fontSize: '0.9rem'
        }
    },
    historyButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        background: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.3s',
        '@media (max-width: 768px)': {
            padding: '0.5rem 1rem'
        },
        '@media (max-width: 480px)': {
            padding: '0.4rem 0.8rem',
            fontSize: '0.9rem'
        }
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1.5rem',
        marginBottom: '1.5rem',
        '@media (max-width: 1024px)': {
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem'
        },
        '@media (max-width: 768px)': {
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.8rem'
        },
        '@media (max-width: 480px)': {
            display: 'flex',
            flexWrap: 'nowrap',
            overflowX: 'auto',
            padding: '0.3rem 0',
            gap: '0.8rem',
            minWidth: '100vw',
            width: '100%'
        }
    },
    statCard: {
        padding: '1.5rem',
        borderRadius: '10px',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        '@media (max-width: 768px)': {
            padding: '1rem'
        },
        '@media (max-width: 480px)': {
            padding: '1rem'
        }
    },
    statIcon: {
        width: '50px',
        height: '50px',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '@media (max-width: 768px)': {
            width: '40px',
            height: '40px'
        }
    },
    statContent: {
        flex: 1
    },
    statTitle: {
        fontSize: '0.9rem',
        margin: '0 0 0.3rem',
        opacity: 0.9,
        '@media (max-width: 768px)': {
            fontSize: '0.8rem'
        }
    },
    statValue: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        margin: '0 0 0.2rem',
        '@media (max-width: 768px)': {
            fontSize: '1.2rem'
        },
        '@media (max-width: 480px)': {
            fontSize: '1.1rem'
        }
    },
    statSubtitle: {
        fontSize: '0.8rem',
        margin: 0,
        opacity: 0.8,
        '@media (max-width: 768px)': {
            fontSize: '0.7rem'
        }
    },
    statsRow: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1.5rem',
        marginBottom: '2rem',
        '@media (max-width: 768px)': {
            gridTemplateColumns: '1fr',
            gap: '1rem'
        }
    },
    statsCard: {
        background: 'white',
        padding: '1.5rem',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        '@media (max-width: 768px)': {
            padding: '1rem'
        }
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        '@media (max-width: 480px)': {
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '0.5rem'
        }
    },
    periodSelector: {
        display: 'flex',
        gap: '0.5rem',
        '@media (max-width: 480px)': {
            width: '100%',
            justifyContent: 'space-between'
        }
    },
    periodButton: {
        padding: '0.3rem 0.8rem',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.8rem',
        transition: 'all 0.3s',
        '@media (max-width: 480px)': {
            flex: 1,
            padding: '0.4rem'
        }
    },
    earningStats: {
        margin: '1rem 0'
    },
    earningItem: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0.5rem 0',
        borderBottom: '1px solid #eee',
        '@media (max-width: 480px)': {
            fontSize: '0.9rem'
        }
    },
    withdrawSection: {
        display: 'flex',
        gap: '1rem',
        marginTop: '1rem',
        '@media (max-width: 480px)': {
            flexDirection: 'column'
        }
    },
    withdrawButton: {
        flex: 2,
        padding: '0.75rem',
        background: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        '@media (max-width: 480px)': {
            padding: '0.6rem',
            fontSize: '0.9rem'
        }
    },
    downloadButton: {
        flex: 1,
        padding: '0.75rem',
        background: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        '@media (max-width: 480px)': {
            padding: '0.6rem',
            fontSize: '0.9rem'
        }
    },
    quickActions: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '0.5rem',
        marginTop: '1rem',
        '@media (max-width: 480px)': {
            gridTemplateColumns: '1fr'
        }
    },
    quickAction: {
        padding: '0.75rem',
        background: '#f8f9fa',
        border: '1px solid #ddd',
        borderRadius: '4px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        transition: 'background 0.3s',
        '@media (max-width: 480px)': {
            padding: '0.6rem',
            fontSize: '0.9rem'
        }
    },
    transactionsSection: {
        background: 'white',
        padding: '1.5rem',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '2rem',
        '@media (max-width: 768px)': {
            padding: '1rem'
        }
    },
    transactionsList: {
        marginTop: '1rem'
    },
    transactionItem: {
        display: 'flex',
        gap: '1rem',
        padding: '1rem 0',
        borderBottom: '1px solid #f0f0f0',
        '@media (max-width: 480px)': {
            flexDirection: 'column',
            gap: '0.5rem'
        }
    },
    transactionIcon: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: '#f8f9fa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '@media (max-width: 480px)': {
            width: '35px',
            height: '35px'
        }
    },
    transactionDetails: {
        flex: 1
    },
    transactionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.3rem',
        '@media (max-width: 480px)': {
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '0.3rem'
        }
    },
    transactionAmount: {
        fontWeight: 'bold'
    },
    transactionMeta: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.8rem',
        color: '#666',
        '@media (max-width: 480px)': {
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '0.3rem'
        }
    },
    transactionStatus: {
        padding: '0.2rem 0.5rem',
        borderRadius: '4px',
        fontSize: '0.7rem'
    },
    recentOrders: {
        background: 'white',
        padding: '1.5rem',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '2rem',
        '@media (max-width: 768px)': {
            padding: '1rem'
        }
    },
    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        '@media (max-width: 480px)': {
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '0.5rem'
        }
    },
    section: {
        background: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        padding: '1rem',
        marginBottom: '1.5rem'
    },
    sectionTitle: {
        margin: '0 0 1rem',
        fontSize: '1.2rem',
        color: '#333'
    },
    analyticsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        gap: '1rem'
    },
    analyticsCard: {
        background: '#f8f9ff',
        borderRadius: '8px',
        padding: '1rem',
        minHeight: '100px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
    },
    analyticsValue: {
        marginTop: '0.5rem',
        fontSize: '1.25rem',
        fontWeight: '700'
    },
    discountList: {
        display: 'grid',
        gap: '0.75rem'
    },
    discountCard: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        border: '1px solid #e4e7ec',
        borderRadius: '8px',
        padding: '0.75rem',
        background: '#fbfcff'
    },
    discountExpiry: {
        color: '#666',
        fontSize: '0.8rem'
    },
    reviewList: {
        display: 'grid',
        gap: '0.75rem'
    },
    reviewCard: {
        border: '1px solid #e4e7ec',
        borderRadius: '8px',
        padding: '0.75rem',
        background: '#fff'
    },
    reviewHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.35rem'
    }
        '@media (max-width: 480px)': {
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '0.5rem'
        }
    },
    viewAllLink: {
        color: '#667eea',
        textDecoration: 'none'
    },
    tableContainer: {
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        margin: '0 -1rem',
        padding: '0 1rem'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        minWidth: '600px'
    },
    tableHeader: {
        textAlign: 'left',
        padding: '1rem',
        borderBottom: '2px solid #dee2e6',
        color: '#666',
        fontWeight: '600',
        '@media (max-width: 768px)': {
            padding: '0.8rem',
            fontSize: '0.9rem'
        }
    },
    tableRow: {
        borderBottom: '1px solid #eee',
        transition: 'background 0.3s'
    },
    tableCell: {
        padding: '1rem',
        color: '#333',
        '@media (max-width: 768px)': {
            padding: '0.8rem',
            fontSize: '0.9rem'
        }
    },
    statusBadge: {
        padding: '0.25rem 0.5rem',
        borderRadius: '4px',
        fontSize: '0.85rem',
        '@media (max-width: 768px)': {
            fontSize: '0.8rem'
        }
    },
    viewButton: {
        padding: '0.25rem 0.5rem',
        background: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.3rem',
        fontSize: '0.8rem'
    },
    topProducts: {
        background: 'white',
        padding: '1.5rem',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        '@media (max-width: 768px)': {
            padding: '1rem'
        }
    },
    productList: {
        marginTop: '1rem'
    },
    productItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '0.75rem 0',
        borderBottom: '1px solid #f0f0f0',
        '@media (max-width: 480px)': {
            gap: '0.5rem'
        }
    },
    productImage: {
        width: '50px',
        height: '50px',
        borderRadius: '4px',
        objectFit: 'cover',
        '@media (max-width: 480px)': {
            width: '40px',
            height: '40px'
        }
    },
    productInfo: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.2rem',
        '@media (max-width: 480px)': {
            fontSize: '0.9rem'
        }
    },
    productRevenue: {
        fontWeight: 'bold',
        color: '#28a745',
        '@media (max-width: 480px)': {
            fontSize: '0.9rem'
        }
    },
    noOrders: {
        textAlign: 'center',
        padding: '3rem',
        color: '#666',
        '@media (max-width: 480px)': {
            padding: '2rem'
        }
    },
    noData: {
        textAlign: 'center',
        padding: '2rem',
        color: '#999'
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        gap: '1rem'
    },
    spinner: {
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #667eea',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        animation: 'spin 1s linear infinite'
    },
    errorContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        gap: '1rem',
        textAlign: 'center',
        padding: '1rem'
    },
    retryButton: {
        padding: '0.75rem 2rem',
        background: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        marginTop: '1rem'
    },
    // Modal Styles
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem'
    },
    modal: {
        background: 'white',
        padding: '2rem',
        borderRadius: '10px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '80vh',
        overflow: 'auto',
        '@media (max-width: 480px)': {
            padding: '1.5rem'
        }
    },
    modalTitle: {
        marginBottom: '1.5rem',
        color: '#333',
        '@media (max-width: 480px)': {
            fontSize: '1.3rem'
        }
    },
    modalError: {
        backgroundColor: '#f8d7da',
        color: '#721c24',
        padding: '1rem',
        borderRadius: '4px',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        '@media (max-width: 480px)': {
            padding: '0.8rem',
            fontSize: '0.9rem'
        }
    },
    modalSuccess: {
        backgroundColor: '#d4edda',
        color: '#155724',
        padding: '1rem',
        borderRadius: '4px',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        '@media (max-width: 480px)': {
            padding: '0.8rem',
            fontSize: '0.9rem'
        }
    },
    balanceInfo: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
        background: '#f8f9fa',
        borderRadius: '4px',
        marginBottom: '1rem',
        '@media (max-width: 480px)': {
            flexDirection: 'column',
            gap: '0.5rem'
        }
    },
    inputGroup: {
        marginBottom: '1rem'
    },
    modalInput: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '1rem',
        marginTop: '0.3rem',
        '@media (max-width: 480px)': {
            padding: '0.6rem'
        }
    },
    bankForm: {
        background: '#f8f9fa',
        padding: '1rem',
        borderRadius: '4px',
        marginBottom: '1rem'
    },
    saveBankButton: {
        width: '100%',
        padding: '0.75rem',
        background: '#17a2b8',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        marginTop: '0.5rem',
        '@media (max-width: 480px)': {
            padding: '0.6rem'
        }
    },
    modalButtons: {
        display: 'flex',
        gap: '1rem',
        marginTop: '1rem',
        '@media (max-width: 480px)': {
            flexDirection: 'column'
        }
    },
    modalCancelButton: {
        flex: 1,
        padding: '0.75rem',
        background: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        '@media (max-width: 480px)': {
            padding: '0.6rem'
        }
    },
    modalSubmitButton: {
        flex: 1,
        padding: '0.75rem',
        background: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        '@media (max-width: 480px)': {
            padding: '0.6rem'
        }
    },
    modalCloseButton: {
        width: '100%',
        padding: '0.75rem',
        background: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        marginTop: '1rem',
        '@media (max-width: 480px)': {
            padding: '0.6rem'
        }
    },
    historyList: {
        maxHeight: '400px',
        overflow: 'auto',
        marginBottom: '1rem'
    },
    historyItem: {
        padding: '1rem',
        borderBottom: '1px solid #eee',
        '@media (max-width: 480px)': {
            padding: '0.8rem'
        }
    },
    historyHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.5rem',
        '@media (max-width: 480px)': {
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '0.3rem'
        }
    },
    historyAmount: {
        fontSize: '1.1rem',
        fontWeight: 'bold',
        color: '#333',
        '@media (max-width: 480px)': {
            fontSize: '1rem'
        }
    },
    historyStatus: {
        padding: '0.25rem 0.5rem',
        borderRadius: '4px',
        fontSize: '0.8rem'
    },
    historyDate: {
        fontSize: '0.9rem',
        color: '#666',
        marginBottom: '0.3rem'
    },
    historyRef: {
        fontSize: '0.8rem',
        color: '#999'
    }
};

export default Dashboard;