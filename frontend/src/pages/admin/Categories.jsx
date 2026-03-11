import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import adminApi from '../../services/adminApi';
import { FaEdit, FaTrash, FaPlus, FaSave, FaTimes, FaExclamationTriangle } from 'react-icons/fa';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: ''
        // Removed parent_id since it doesn't exist in database
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await adminApi.getCategories();
            setCategories(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setError('Failed to load categories. Please refresh the page.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (error) setError('');
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            setError('Category name is required');
            return false;
        }
        if (formData.name.trim().length < 2) {
            setError('Category name must be at least 2 characters');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form
        if (!validateForm()) {
            return;
        }

        setSubmitting(true);
        setError('');
        setSuccessMessage('');

        try {
            // Prepare data for API - removed parent_id
            const categoryData = {
                name: formData.name.trim(),
                description: formData.description.trim() || null,
                image: formData.image.trim() || null
            };

            console.log('Submitting category data:', categoryData); // Debug log

            let response;
            if (editingCategory) {
                response = await adminApi.updateCategory(editingCategory.id, categoryData);
                console.log('Update response:', response); // Debug log
                setSuccessMessage('Category updated successfully!');
            } else {
                response = await adminApi.addCategory(categoryData);
                console.log('Add response:', response); // Debug log
                setSuccessMessage('Category added successfully!');
            }

            // Close modal after short delay to show success message
            setTimeout(() => {
                setShowModal(false);
                resetForm();
                fetchCategories(); // Refresh the list
            }, 1500);

        } catch (error) {
            console.error('Error saving category:', error);
            
            // Handle different error types
            if (error.response) {
                // Server responded with error
                const serverError = error.response.data;
                if (serverError.message) {
                    setError(`Server error: ${serverError.message}`);
                } else if (serverError.error) {
                    setError(`Error: ${serverError.error}`);
                } else {
                    setError(`Server error: ${error.response.status} - ${error.response.statusText}`);
                }
            } else if (error.request) {
                // Request made but no response
                setError('No response from server. Please check your connection.');
            } else {
                // Something else happened
                setError(`Error: ${error.message || 'Failed to save category'}`);
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name || '',
            description: category.description || '',
            image: category.image || ''
        });
        setError('');
        setShowModal(true);
    };

    const handleDelete = async (categoryId) => {
        if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
            return;
        }

        try {
            await adminApi.deleteCategory(categoryId);
            setSuccessMessage('Category deleted successfully');
            fetchCategories(); // Refresh the list
            
            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error deleting category:', error);
            setError('Failed to delete category. It may have subcategories or products.');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            image: ''
        });
        setEditingCategory(null);
        setError('');
        setSuccessMessage('');
    };

    const handleCloseModal = () => {
        setShowModal(false);
        resetForm();
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
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem'
        },
        title: {
            fontSize: '2rem',
            color: '#333'
        },
        addButton: {
            backgroundColor: '#3498db',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'background-color 0.3s'
        },
        messageContainer: {
            marginBottom: '1rem',
            padding: '1rem',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        errorMessage: {
            backgroundColor: '#f8d7da',
            color: '#721c24',
            border: '1px solid #f5c6cb'
        },
        successMessage: {
            backgroundColor: '#d4edda',
            color: '#155724',
            border: '1px solid #c3e6cb'
        },
        categoryGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem'
        },
        categoryCard: {
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '1.5rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            position: 'relative',
            transition: 'transform 0.3s, box-shadow 0.3s'
        },
        categoryName: {
            fontSize: '1.2rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
            color: '#333',
            paddingRight: '4rem'
        },
        categoryDescription: {
            color: '#666',
            fontSize: '0.9rem',
            marginBottom: '1rem',
            lineHeight: '1.5'
        },
        categoryMeta: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#999',
            fontSize: '0.8rem',
            borderTop: '1px solid #eee',
            paddingTop: '0.5rem'
        },
        actionButtons: {
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            display: 'flex',
            gap: '0.5rem'
        },
        iconButton: {
            padding: '0.5rem',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            transition: 'all 0.3s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        modal: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            animation: 'fadeIn 0.3s'
        },
        modalContent: {
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflowY: 'auto',
            animation: 'slideIn 0.3s'
        },
        modalHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
        },
        modalTitle: {
            fontSize: '1.5rem',
            color: '#333',
            margin: 0
        },
        closeButton: {
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: '#666',
            padding: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px'
        },
        formGroup: {
            marginBottom: '1rem'
        },
        label: {
            display: 'block',
            marginBottom: '0.5rem',
            color: '#333',
            fontWeight: '500'
        },
        required: {
            color: '#ff4444',
            marginLeft: '0.25rem'
        },
        input: {
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '1rem',
            transition: 'border-color 0.3s'
        },
        textarea: {
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '1rem',
            minHeight: '100px',
            resize: 'vertical',
            fontFamily: 'inherit'
        },
        submitButton: {
            backgroundColor: '#3498db',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem',
            width: '100%',
            marginTop: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'background-color 0.3s',
            opacity: submitting ? 0.7 : 1
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
        },
        emptyState: {
            textAlign: 'center',
            padding: '3rem',
            color: '#999',
            fontSize: '1.1rem'
        }
    };

    // Add CSS animations
    const styleTag = document.createElement('style');
    styleTag.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideIn {
            from { 
                transform: translateY(-30px);
                opacity: 0;
            }
            to { 
                transform: translateY(0);
                opacity: 1;
            }
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(styleTag);

    if (loading) {
        return (
            <div style={styles.container}>
                <AdminSidebar />
                <div style={styles.mainContent}>
                    <div style={styles.loadingContainer}>
                        <div style={styles.spinner}></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <AdminSidebar />
            <div style={styles.mainContent}>
                <div style={styles.header}>
                    <h1 style={styles.title}>Category Management</h1>
                    <button 
                        style={styles.addButton} 
                        onClick={() => {
                            resetForm();
                            setShowModal(true);
                        }}
                    >
                        <FaPlus /> Add Category
                    </button>
                </div>

                {/* Success Message */}
                {successMessage && (
                    <div style={{...styles.messageContainer, ...styles.successMessage}}>
                        <FaSave /> {successMessage}
                    </div>
                )}

                {/* Error Message */}
                {error && !showModal && (
                    <div style={{...styles.messageContainer, ...styles.errorMessage}}>
                        <FaExclamationTriangle /> {error}
                    </div>
                )}

                {/* Categories Grid */}
                {categories.length === 0 ? (
                    <div style={styles.emptyState}>
                        No categories found. Click "Add Category" to create one.
                    </div>
                ) : (
                    <div style={styles.categoryGrid}>
                        {categories.map(category => (
                            <div key={category.id} style={styles.categoryCard}>
                                <div style={styles.actionButtons}>
                                    <button
                                        style={{...styles.iconButton, backgroundColor: '#e3f2fd', color: '#1976d2'}}
                                        onClick={() => handleEdit(category)}
                                        title="Edit category"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        style={{...styles.iconButton, backgroundColor: '#ffebee', color: '#c62828'}}
                                        onClick={() => handleDelete(category.id)}
                                        title="Delete category"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                                <h3 style={styles.categoryName}>{category.name}</h3>
                                <p style={styles.categoryDescription}>
                                    {category.description || 'No description provided'}
                                </p>
                                <div style={styles.categoryMeta}>
                                    <span>Products: {category.product_count || 0}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal for Add/Edit Category */}
            {showModal && (
                <div style={styles.modal}>
                    <div style={styles.modalContent}>
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>
                                {editingCategory ? 'Edit Category' : 'Add New Category'}
                            </h2>
                            <button 
                                style={styles.closeButton} 
                                onClick={handleCloseModal}
                                title="Close"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Modal Error Message */}
                        {error && (
                            <div style={{...styles.messageContainer, ...styles.errorMessage, marginBottom: '1rem'}}>
                                <FaExclamationTriangle /> {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    Category Name <span style={styles.required}>*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    style={styles.input}
                                    placeholder="e.g., Electronics"
                                    disabled={submitting}
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    style={styles.textarea}
                                    placeholder="Category description (optional)"
                                    disabled={submitting}
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Image URL</label>
                                <input
                                    type="url"
                                    name="image"
                                    value={formData.image}
                                    onChange={handleInputChange}
                                    style={styles.input}
                                    placeholder="https://example.com/image.jpg (optional)"
                                    disabled={submitting}
                                />
                            </div>

                            <button 
                                type="submit" 
                                style={styles.submitButton}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <>Saving...</>
                                ) : (
                                    <>
                                        <FaSave /> {editingCategory ? 'Update Category' : 'Add Category'}
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categories;