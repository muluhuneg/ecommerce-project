import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import adminApi from '../../services/adminApi';
import { FaDownload, FaChartLine, FaBox, FaStore } from 'react-icons/fa';

const AdminReports = () => {
    const [salesReport, setSalesReport] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [topSellers, setTopSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchReports();
    }, [dateRange]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const [sales, products, sellers] = await Promise.all([
                adminApi.getSalesReport(dateRange.startDate, dateRange.endDate),
                adminApi.getTopProducts(5),
                adminApi.getTopSellers(5)
            ]);
            setSalesReport(sales);
            setTopProducts(products);
            setTopSellers(sellers);
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (type) => {
        try {
            const data = await adminApi.exportData(type, 'csv');
            const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${type}_report.csv`);
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error('Error exporting data:', error);
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
            marginLeft: '0',
            padding: '0'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem'
        },
        title: {
            fontSize: '2rem',
            color: '#333'
        },
        exportButtons: {
            display: 'flex',
            gap: '1rem'
        },
        exportButton: {
            padding: '0.75rem 1.5rem',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        dateRangePicker: {
            display: 'flex',
            gap: '1rem',
            marginBottom: '2rem',
            padding: '1rem',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        },
        dateInput: {
            padding: '0.5rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '1rem'
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
        chartContainer: {
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '2rem'
        },
        chartTitle: {
            fontSize: '1.2rem',
            marginBottom: '1rem',
            color: '#333'
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '1rem'
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

    // Calculate totals
    const totalRevenue = salesReport.reduce((sum, item) => sum + parseFloat(item.total_sales || 0), 0);
    const totalOrders = salesReport.reduce((sum, item) => sum + parseInt(item.order_count || 0), 0);
    const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0;

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
                    <h1 style={styles.title}>Reports & Analytics</h1>
                    <div style={styles.exportButtons}>
                        <button style={styles.exportButton} onClick={() => handleExport('sales')}>
                            <FaDownload /> Export Sales
                        </button>
                        <button style={styles.exportButton} onClick={() => handleExport('products')}>
                            <FaDownload /> Export Products
                        </button>
                    </div>
                </div>

                <div style={styles.dateRangePicker}>
                    <input
                        type="date"
                        value={dateRange.startDate}
                        onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                        style={styles.dateInput}
                    />
                    <span>to</span>
                    <input
                        type="date"
                        value={dateRange.endDate}
                        onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                        style={styles.dateInput}
                    />
                </div>

                <div style={styles.statsGrid}>
                    <div style={styles.statCard}>
                        <div style={{...styles.statIcon, backgroundColor: '#e3f2fd', color: '#1976d2'}}>
                            <FaChartLine />
                        </div>
                        <div style={styles.statInfo}>
                            <p style={styles.statValue}>${totalRevenue.toFixed(2)}</p>
                            <p style={styles.statLabel}>Total Revenue</p>
                        </div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={{...styles.statIcon, backgroundColor: '#e8f5e8', color: '#2e7d32'}}>
                            <FaBox />
                        </div>
                        <div style={styles.statInfo}>
                            <p style={styles.statValue}>{totalOrders}</p>
                            <p style={styles.statLabel}>Total Orders</p>
                        </div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={{...styles.statIcon, backgroundColor: '#fff3e0', color: '#ed6c02'}}>
                            <FaChartLine />
                        </div>
                        <div style={styles.statInfo}>
                            <p style={styles.statValue}>${avgOrderValue}</p>
                            <p style={styles.statLabel}>Avg. Order Value</p>
                        </div>
                    </div>
                </div>

                <div style={styles.chartContainer}>
                    <h3 style={styles.chartTitle}>Sales Overview</h3>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.tableHeader}>Period</th>
                                <th style={styles.tableHeader}>Orders</th>
                                <th style={styles.tableHeader}>Sales</th>
                                <th style={styles.tableHeader}>Average</th>
                            </tr>
                        </thead>
                        <tbody>
                            {salesReport.map((item, index) => (
                                <tr key={index} style={styles.tableRow}>
                                    <td style={styles.tableCell}>{item.period}</td>
                                    <td style={styles.tableCell}>{item.order_count}</td>
                                    <td style={styles.tableCell}>${parseFloat(item.total_sales).toFixed(2)}</td>
                                    <td style={styles.tableCell}>${parseFloat(item.average_order_value).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div style={styles.chartContainer}>
                        <h3 style={styles.chartTitle}>Top Products</h3>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.tableHeader}>Product</th>
                                    <th style={styles.tableHeader}>Sold</th>
                                    <th style={styles.tableHeader}>Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topProducts.map((product, index) => (
                                    <tr key={index} style={styles.tableRow}>
                                        <td style={styles.tableCell}>{product.name}</td>
                                        <td style={styles.tableCell}>{product.total_sold || 0}</td>
                                        <td style={styles.tableCell}>${parseFloat(product.revenue || 0).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div style={styles.chartContainer}>
                        <h3 style={styles.chartTitle}>Top Sellers</h3>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.tableHeader}>Seller</th>
                                    <th style={styles.tableHeader}>Orders</th>
                                    <th style={styles.tableHeader}>Sales</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topSellers.map((seller, index) => (
                                    <tr key={index} style={styles.tableRow}>
                                        <td style={styles.tableCell}>{seller.business_name}</td>
                                        <td style={styles.tableCell}>{seller.order_count || 0}</td>
                                        <td style={styles.tableCell}>${parseFloat(seller.total_sales || 0).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminReports;