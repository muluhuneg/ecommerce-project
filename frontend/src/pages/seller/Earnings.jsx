import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/seller/Sidebar';
import sellerApi from '../../services/sellerApi';

const Earnings = () => {
    const [earnings, setEarnings] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [earningsData, transactionsData] = await Promise.all([
                sellerApi.getEarnings(),
                sellerApi.getWalletTransactions()
            ]);
            setEarnings(earningsData);
            setTransactions(transactionsData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async () => {
        if (!withdrawAmount || withdrawAmount <= 0) {
            alert('Please enter a valid amount');
            return;
        }
        try {
            await sellerApi.requestWithdrawal(withdrawAmount);
            alert('Withdrawal request submitted');
            setWithdrawAmount('');
            fetchData();
        } catch (error) {
            console.error('Error requesting withdrawal:', error);
            alert('Failed to request withdrawal');
        }
    };

    return (
        <div className="seller-page" style={{ display: 'flex' }}>
            <Sidebar />
            <div className="seller-main-content" style={{ marginLeft: '280px', padding: '2rem', flex: 1 }}>
                <h1>Earnings & Wallet</h1>
                
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <>
                        <div className="earnings-stats-grid" style={styles.statsGrid}>
                            <div className="earnings-stat-card" style={styles.statCard}>
                                <h3>Wallet Balance</h3>
                                <p style={styles.statValue}>${earnings?.wallet_balance || 0}</p>
                            </div>
                            <div style={styles.statCard}>
                                <h3>Total Earnings</h3>
                                <p style={styles.statValue}>${earnings?.total_earnings || 0}</p>
                            </div>
                            <div style={styles.statCard}>
                                <h3>Pending Withdrawal</h3>
                                <p style={styles.statValue}>${earnings?.pending_withdrawal || 0}</p>
                            </div>
                        </div>

                        <div className="earnings-withdraw-section" style={styles.withdrawSection}>
                            <h2>Request Withdrawal</h2>
                            <div className="earnings-withdraw-form" style={styles.withdrawForm}>
                                <input
                                    type="number"
                                    value={withdrawAmount}
                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                    placeholder="Enter amount"
                                    style={styles.input}
                                />
                                <button onClick={handleWithdraw} style={styles.button}>
                                    Request Withdrawal
                                </button>
                            </div>
                        </div>

                        <div style={styles.transactions}>
                            <h2>Transaction History</h2>
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Type</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map(t => (
                                        <tr key={t.id}>
                                            <td data-label="Date">{new Date(t.created_at).toLocaleDateString()}</td>
                                            <td data-label="Type">{t.type}</td>
                                            <td data-label="Amount">${t.amount}</td>
                                            <td data-label="Status">
                                                <span style={{
                                                    ...styles.statusBadge,
                                                    backgroundColor: 
                                                        t.status === 'completed' ? '#28a745' :
                                                        t.status === 'pending' ? '#ffc107' : '#dc3545'
                                                }}>
                                                    {t.status}
                                                </span>
                                            </td>
                                            <td data-label="Description">{t.description}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const styles = {
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
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    statValue: {
        fontSize: '2rem',
        fontWeight: 'bold',
        color: '#1e3c72',
        marginTop: '0.5rem'
    },
    withdrawSection: {
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        marginBottom: '2rem'
    },
    withdrawForm: {
        display: 'flex',
        gap: '1rem',
        marginTop: '1rem'
    },
    input: {
        flex: 1,
        padding: '0.75rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '1rem'
    },
    button: {
        backgroundColor: '#1e3c72',
        color: 'white',
        padding: '0.75rem 2rem',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    transactions: {
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '1rem'
    },
    statusBadge: {
        padding: '0.25rem 0.5rem',
        borderRadius: '4px',
        color: 'white',
        fontSize: '0.875rem'
    }
};

export default Earnings;