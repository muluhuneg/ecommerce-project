import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchUserProfile();
        } else {
            setLoading(false);
        }
    }, [token]);

    const fetchUserProfile = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/auth/profile');
            setUser(response.data);
        } catch (error) {
            console.error('Error fetching profile:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    // Unified register function for all roles
    const register = async (userData) => {
        try {
            console.log('Sending registration data:', userData);
            
            // Determine which endpoint to use based on role
            let endpoint = 'http://localhost:5000/api/auth/register';
            
            // If your backend has separate endpoints, use this logic
            if (userData.role === 'seller') {
                endpoint = 'http://localhost:5000/api/auth/register/seller';
            } else if (userData.role === 'customer') {
                endpoint = 'http://localhost:5000/api/auth/register/customer';
            } else {
                endpoint = 'http://localhost:5000/api/auth/register';
            }
            
            const response = await axios.post(endpoint, userData);
            
            console.log('Registration response:', response.data);
            
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('userRole', user.role);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setToken(token);
            setUser(user);
            
            return { success: true, user };
        } catch (error) {
            console.error('Registration error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            
            // Better error messages
            if (error.code === 'ERR_NETWORK') {
                return { 
                    success: false, 
                    error: 'Cannot connect to server. Please make sure the backend is running at http://localhost:5000' 
                };
            } else if (error.response?.status === 400) {
                return { 
                    success: false, 
                    error: error.response.data.message || 'Invalid registration data' 
                };
            } else if (error.response?.status === 409) {
                return { 
                    success: false, 
                    error: 'User already exists with this email or phone' 
                };
            } else {
                return { 
                    success: false, 
                    error: error.response?.data?.message || 'Registration failed. Please try again.' 
                };
            }
        }
    };

    const login = async (email, password) => {
        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                email,
                password
            });
            
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('userRole', user.role);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setToken(token);
            setUser(user);
            return { success: true, user };
        } catch (error) {
            console.error('Login error:', error.response?.data || error.message);
            return { 
                success: false, 
                error: error.response?.data?.message || 'Login failed' 
            };
        }
    };

    // Keep registerSeller for backward compatibility if needed
    const registerSeller = async (sellerData) => {
        try {
            const response = await axios.post('http://localhost:5000/api/auth/register/seller', sellerData);
            
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('userRole', user.role);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setToken(token);
            setUser(user);
            return { success: true, user };
        } catch (error) {
            console.error('Seller registration error:', error.response?.data || error.message);
            return { 
                success: false, 
                error: error.response?.data?.message || 'Registration failed' 
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        delete axios.defaults.headers.common['Authorization'];
        setToken(null);
        setUser(null);
    };

    // Check if user has specific role
    const hasRole = (role) => {
        return user?.role === role;
    };

    // Check if seller is approved
    const isSellerApproved = () => {
        return user?.role === 'seller' && user?.seller?.is_approved;
    };

    const value = {
        user,
        loading,
        login,
        register,          // Add this - unified register
        registerSeller,    // Keep this for backward compatibility
        logout,
        hasRole,
        isSellerApproved,
        token
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};