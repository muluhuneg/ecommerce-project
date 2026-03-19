import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ allowedRoles = ['seller', 'admin'], requireApproved = true }) => {
    const { user, loading, hasRole, isSellerApproved } = useAuth();

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p>Loading...</p>
            </div>
        );
    }

    // Not logged in
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Check role
    const hasAllowedRole = allowedRoles.some(role => hasRole(role));
    if (!hasAllowedRole) {
        return <Navigate to="/" replace />;
    }

    // Check if seller is approved (only for sellers)
    if (requireApproved && user.role === 'seller' && !isSellerApproved()) {
        return (
            <div style={styles.pendingContainer}>
                <h2 style={styles.pendingTitle}>Account Pending Approval</h2>
                <p style={styles.pendingText}>Your seller account is waiting for admin approval.</p>
                <p style={styles.pendingText}>You'll be able to access the dashboard once approved.</p>
            </div>
        );
    }

    return <Outlet />;
};

const styles = {
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh'
    },
    spinner: {
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #1e3c72',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        animation: 'spin 1s linear infinite',
        marginBottom: '1rem'
    },
    pendingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        textAlign: 'center',
        padding: '2rem'
    },
    pendingTitle: {
        color: '#000',
        marginBottom: '10px'
    },
    pendingText: {
        color: '#000',
        maxWidth: '420px',
        lineHeight: '1.5'
    }
};

export default ProtectedRoute;