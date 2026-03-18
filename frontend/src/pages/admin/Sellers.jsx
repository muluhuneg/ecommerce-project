import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import adminApi from '../../services/adminApi';
import { FaCheck, FaTimes, FaStore, FaMoneyBillWave } from 'react-icons/fa';

const Sellers = () => {
    const [sellers, setSellers] = useState([]);
    const [pendingSellers, setPendingSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending');

    useEffect(() => {
        fetchSellers();
    }, []);

    const fetchSellers = async () => {
        try {
            const [allSellers, pending] = await Promise.all([
                adminApi.getUsers('seller'),
                adminApi.getPendingSellers()
            ]);
            setSellers(allSellers);
            setPendingSellers(pending);
        } catch (error) {
            console.error('Error fetching sellers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveSeller = async (sellerId, approve) => {
        try {
            await adminApi.approveSeller(sellerId, approve);
            fetchSellers(); // Refresh the list
        } catch (error) {
            console.error('Error approving seller:', error);
        }
    };

    const styles = {
        container: {
            display: 'flex',
            backgroundColor: '#f5f5f5',
            minHeight: '100vh'
        },
        mainContent: {
            flex: 1,
            marginLeft: '280px',
            padding: '2rem'
        },
        header: {
            marginBottom: '2rem'
        },
        tabs: {
            display: 'flex',
            gap: '1rem',
            marginBottom: '2rem',
            borderBottom: '2px solid #dee2e6'
        },
        tab: {
            padding: '0.75rem 1.5rem',
            cursor: 'pointer',
            border: 'none',
            background: 'none',
            fontSize: '1rem',
            fontWeight: '500',
            position: 'relative',
            color: '#666'
        },
        activeTab: {
            color: '#3498db',
            borderBottom: '2px solid #3498db'
        },
        statsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.5rem',
            marginBottom: '2rem'
        },
        statCard: {
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
        },
        statIcon: {
            width: '50px',
            height: '50px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem'
        },
        statInfo: {
            flex: 1
        },
        statValue: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            margin: 0
        },
        statLabel: {
            color: '#666',
            margin: '0.2rem 0 0'
        },
        table: {
            width: '100%',
            backgroundColor: 'white',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        },
        tableHeader: {
            backgroundColor: '#f8f9fa',
            padding: '1rem',
            textAlign: 'left',
            borderBottom: '2px solid #dee2e6'
        },
        tableRow: {
            borderBottom: '1px solid #dee2e6'
        },
        tableCell: {
            padding: '1rem'
        },
        sellerInfo: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
        },
        businessIcon: {
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#f39c12',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        approveButton: {
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            marginRight: '0.5rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        loadingContainer: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '400px'
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

    if (loading) {
        return (
            <div className="admin-page" style={styles.container}>
                <AdminSidebar />
                <div className="admin-main-content" style={styles.mainContent}>
                    <div style={styles.loadingContainer}>
                        <div style={styles.spinner}></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page" style={styles.container}>
            <AdminSidebar />
            <div className="admin-main-content" style={styles.mainContent}>
                <div style={styles.header}>
                    <h1>Seller Management</h1>
                </div>

                <div style={styles.statsGrid}>
                    <div style={styles.statCard}>
                        <div style={{...styles.statIcon, backgroundColor: '#e8f4fd', color: '#3498db'}}>
                            <FaStore />
                        </div>
                        <div style={styles.statInfo}>
                            <p style={styles.statValue}>{sellers.length}</p>
                            <p style={styles.statLabel}>Total Sellers</p>
                        </div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={{...styles.statIcon, backgroundColor: '#fef2e9', color: '#f39c12'}}>
                            <FaStore />
                        </div>
                        <div style={styles.statInfo}>
                            <p style={styles.statValue}>{pendingSellers.length}</p>
                            <p style={styles.statLabel}>Pending Approval</p>
                        </div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={{...styles.statIcon, backgroundColor: '#e3fce9', color: '#2ecc71'}}>
                            <FaMoneyBillWave />
                        </div>
                        <div style={styles.statInfo}>
                            <p style={styles.statValue}>
                                {sellers.filter(s => s.is_verified).length}
                            </p>
                            <p style={styles.statLabel}>Active Sellers</p>
                        </div>
                    </div>
                </div>

                <div style={styles.tabs}>
                    <button
                        style={{
                            ...styles.tab,
                            ...(activeTab === 'pending' ? styles.activeTab : {})
                        }}
                        onClick={() => setActiveTab('pending')}
                    >
                        Pending Approval ({pendingSellers.length})
                    </button>
                    <button
                        style={{
                            ...styles.tab,
                            ...(activeTab === 'all' ? styles.activeTab : {})
                        }}
                        onClick={() => setActiveTab('all')}
                    >
                        All Sellers ({sellers.length})
                    </button>
                </div>

                {activeTab === 'pending' ? (
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.tableHeader}>Business</th>
                                <th style={styles.tableHeader}>Owner</th>
                                <th style={styles.tableHeader}>Contact</th>
                                <th style={styles.tableHeader}>Email</th>
                                <th style={styles.tableHeader}>Tax ID</th>
                                <th style={styles.tableHeader}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingSellers.map(seller => (
                                <tr key={seller.id} style={styles.tableRow}>
                                    <td style={styles.tableCell}>
                                        <div style={styles.sellerInfo}>
                                            <div style={styles.businessIcon}>
                                                <FaStore />
                                            </div>
                                            <div>
                                                <strong>{seller.business_name}</strong>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={styles.tableCell}>{seller.name}</td>
                                    <td style={styles.tableCell}>{seller.business_phone || seller.phone}</td>
                                    <td style={styles.tableCell}>{seller.business_email || seller.email}</td>
                                    <td style={styles.tableCell}>{seller.tax_id || 'N/A'}</td>
                                    <td style={styles.tableCell}>
                                        <button
                                            style={{
                                                ...styles.approveButton,
                                                backgroundColor: '#d4edda',
                                                color: '#155724'
                                            }}
                                            onClick={() => handleApproveSeller(seller.id, true)}
                                        >
                                            <FaCheck /> Approve
                                        </button>
                                        <button
                                            style={{
                                                ...styles.approveButton,
                                                backgroundColor: '#f8d7da',
                                                color: '#721c24'
                                            }}
                                            onClick={() => handleApproveSeller(seller.id, false)}
                                        >
                                            <FaTimes /> Reject
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.tableHeader}>Business</th>
                                <th style={styles.tableHeader}>Owner</th>
                                <th style={styles.tableHeader}>Status</th>
                                <th style={styles.tableHeader}>Products</th>
                                <th style={styles.tableHeader}>Sales</th>
                                <th style={styles.tableHeader}>Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sellers.map(seller => (
                                <tr key={seller.id} style={styles.tableRow}>
                                    <td style={styles.tableCell}>
                                        <div style={styles.sellerInfo}>
                                            <div style={styles.businessIcon}>
                                                <FaStore />
                                            </div>
                                            <div>
                                                <strong>{seller.business_name}</strong>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={styles.tableCell}>{seller.name}</td>
                                    <td style={styles.tableCell}>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '4px',
                                            backgroundColor: seller.is_verified ? '#d4edda' : '#f8d7da',
                                            color: seller.is_verified ? '#155724' : '#721c24'
                                        }}>
                                            {seller.is_verified ? 'Active' : 'Pending'}
                                        </span>
                                    </td>
                                    <td style={styles.tableCell}>0</td>
                                    <td style={styles.tableCell}>$0.00</td>
                                    <td style={styles.tableCell}>
                                        {new Date(seller.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Sellers;