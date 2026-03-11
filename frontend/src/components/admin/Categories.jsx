import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import adminApi from '../../services/adminApi';
import { 
    FaEdit, 
    FaTrash, 
    FaPlus, 
    FaSave, 
    FaTimes, 
    FaExclamationTriangle,
    FaImage,
    FaCloudUploadAlt,
    FaSpinner,
    FaCheckCircle,
    FaEye,
    FaEyeSlash
} from 'react-icons/fa';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: ''
    });

    useEffect(() => {
        fetchCategories();
        
        // Add CSS animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            .spinner {
                animation: spin 1s linear infinite;
                display: inline-block;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .modal-animation {
                animation: fadeIn 0.3s ease-out;
            }
        `;
        document.head.appendChild(style);
        
        return () => {
            document.head.removeChild(style);
        };
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
        if (error) setError('');
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file');
                return;
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size should be less than 5MB');
                return;
            }

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
            
            // Store file for upload
            setImageFile(file);
            
            // Clear any previous image error
            if (error) setError('');
        }
    };

    const removeImage = () => {
        setImagePreview(null);
        setImageFile(null);
        setFormData(prev => ({ ...prev, image: '' }));
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
        
        if (!validateForm()) {
            return;
        }

        setSubmitting(true);
        setError('');
        setSuccessMessage('');
        setUploadProgress(0);

        try {
            // Create FormData for file upload
            const categoryData = new FormData();
            categoryData.append('name', formData.name.trim());
            categoryData.append('description', formData.description.trim() || '');
            
            // Append image if selected
            if (imageFile) {
                categoryData.append('categoryImage', imageFile);
            }

            // Simulate upload progress
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return prev;
                    }
                    return prev + 10;
                });
            }, 100);

            let response;
            if (editingCategory) {
                response = await adminApi.updateCategory(editingCategory.id, categoryData);
                setSuccessMessage('Category updated successfully!');
            } else {
                response = await adminApi.addCategory(categoryData);
                setSuccessMessage('Category added successfully!');
            }

            clearInterval(progressInterval);
            setUploadProgress(100);

            // Close modal after short delay
            setTimeout(() => {
                setShowModal(false);
                resetForm();
                fetchCategories();
            }, 1500);

        } catch (error) {
            console.error('Error saving category:', error);
            
            if (error.response) {
                setError(`Server error: ${error.response.data.message || 'Failed to save category'}`);
            } else if (error.request) {
                setError('No response from server. Please check your connection.');
            } else {
                setError(`Error: ${error.message || 'Failed to save category'}`);
            }
            setUploadProgress(0);
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
        setImagePreview(category.image || null);
        setImageFile(null);
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
            fetchCategories();
            
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error deleting category:', error);
            setError('Failed to delete category. It may have products linked to it.');
        }
    };

    const handleToggleStatus = async (categoryId, currentStatus) => {
        try {
            await adminApi.toggleCategoryStatus(categoryId, !currentStatus);
            setSuccessMessage(`Category ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
            fetchCategories();
            
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error toggling category status:', error);
            setError('Failed to update category status');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            image: ''
        });
        setImagePreview(null);
        setImageFile(null);
        setEditingCategory(null);
        setError('');
        setSuccessMessage('');
        setUploadProgress(0);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        resetForm();
    };

    const styles = {
        container: {
            display: 'flex',
            backgroundColor: '#f8f9fa',
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
            color: '#333',
            margin: 0
        },
        addButton: {
            backgroundColor: '#3498db',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.3s',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        },
        messageContainer: {
            marginBottom: '1rem',
            padding: '1rem',
            borderRadius: '8px',
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
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem'
        },
        categoryCard: {
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            position: 'relative',
            transition: 'all 0.3s',
            display: 'flex',
            flexDirection: 'column'
        },
        categoryImage: {
            width: '100%',
            height: '160px',
            objectFit: 'cover',
            borderRadius: '8px',
            marginBottom: '1rem',
            backgroundColor: '#f8f9fa'
        },
        categoryName: {
            fontSize: '1.2rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
            color: '#333',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        statusBadge: {
            fontSize: '0.7rem',
            padding: '2px 8px',
            borderRadius: '12px',
            display: 'inline-block',
            marginLeft: '0.5rem'
        },
        categoryDescription: {
            color: '#666',
            fontSize: '0.9rem',
            marginBottom: '1rem',
            lineHeight: '1.5',
            flex: 1
        },
        categoryMeta: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#999',
            fontSize: '0.8rem',
            borderTop: '1px solid #eee',
            paddingTop: '1rem',
            marginTop: 'auto'
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
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            transition: 'all 0.3s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px'
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
            zIndex: 1000
        },
        modalContent: {
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '550px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
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
            borderRadius: '50%',
            transition: 'all 0.3s'
        },
        formGroup: {
            marginBottom: '1.5rem'
        },
        label: {
            display: 'block',
            marginBottom: '0.5rem',
            color: '#333',
            fontWeight: '600'
        },
        required: {
            color: '#ff4444',
            marginLeft: '0.25rem'
        },
        input: {
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '1rem',
            transition: 'border-color 0.3s'
        },
        textarea: {
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '1rem',
            minHeight: '100px',
            resize: 'vertical',
            fontFamily: 'inherit'
        },
        imageUploadArea: {
            border: '2px dashed #3498db',
            borderRadius: '8px',
            padding: '2rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s',
            backgroundColor: '#f8f9fa',
            marginBottom: '1rem'
        },
        imagePreviewContainer: {
            position: 'relative',
            marginTop: '1rem'
        },
        imagePreview: {
            maxWidth: '100%',
            maxHeight: '200px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        },
        removeImageBtn: {
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s'
        },
        uploadProgress: {
            marginTop: '1rem',
            height: '4px',
            backgroundColor: '#f0f0f0',
            borderRadius: '2px',
            overflow: 'hidden'
        },
        progressBar: {
            height: '100%',
            backgroundColor: '#28a745',
            transition: 'width 0.3s'
        },
        submitButton: {
            backgroundColor: '#3498db',
            color: 'white',
            padding: '1rem',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            width: '100%',
            marginTop: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'all 0.3s'
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
            width: '50px',
            height: '50px',
            animation: 'spin 1s linear infinite'
        },
        emptyState: {
            textAlign: 'center',
            padding: '3rem',
            color: '#999',
            fontSize: '1.1rem'
        }
    };

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
                        <FaCheckCircle /> {successMessage}
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
                        <FaImage size={50} color="#ddd" />
                        <h3>No categories found</h3>
                        <p>Click "Add Category" to create your first category.</p>
                    </div>
                ) : (
                    <div style={styles.categoryGrid}>
                        {categories.map(category => (
                            <div key={category.id} style={styles.categoryCard}>
                                {category.image ? (
                                    <img 
                                        src={category.image} 
                                        alt={category.name}
                                        style={styles.categoryImage}
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/300x150?text=No+Image';
                                        }}
                                    />
                                ) : (
                                    <div style={{
                                        ...styles.categoryImage,
                                        backgroundColor: '#f0f0f0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#999'
                                    }}>
                                        <FaImage size={40} />
                                    </div>
                                )}
                                
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
                                    <button
                                        style={{
                                            ...styles.iconButton,
                                            backgroundColor: category.is_active ? '#e8f5e8' : '#fff3cd',
                                            color: category.is_active ? '#2e7d32' : '#856404'
                                        }}
                                        onClick={() => handleToggleStatus(category.id, category.is_active)}
                                        title={category.is_active ? 'Deactivate' : 'Activate'}
                                    >
                                        {category.is_active ? <FaEye /> : <FaEyeSlash />}
                                    </button>
                                </div>

                                <h3 style={styles.categoryName}>
                                    {category.name}
                                    <span style={{
                                        ...styles.statusBadge,
                                        backgroundColor: category.is_active ? '#e8f5e8' : '#fff3cd',
                                        color: category.is_active ? '#2e7d32' : '#856404'
                                    }}>
                                        {category.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </h3>
                                
                                <p style={styles.categoryDescription}>
                                    {category.description || 'No description provided'}
                                </p>
                                
                                <div style={styles.categoryMeta}>
                                    <span>📦 Products: {category.product_count || 0}</span>
                                    <span>📅 {new Date(category.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal for Add/Edit Category */}
            {showModal && (
                <div style={styles.modal} onClick={(e) => {
                    if (e.target === e.currentTarget) handleCloseModal();
                }}>
                    <div style={{...styles.modalContent, className: 'modal-animation'}}>
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
                            {/* Image Upload */}
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Category Image</label>
                                <div 
                                    style={styles.imageUploadArea}
                                    onClick={() => document.getElementById('categoryImage').click()}
                                >
                                    <FaCloudUploadAlt size={40} color="#3498db" />
                                    <p style={{ marginTop: '0.5rem', fontWeight: '500' }}>
                                        Click to upload category image
                                    </p>
                                    <p style={{ fontSize: '0.8rem', color: '#666' }}>
                                        Supported formats: JPEG, PNG, GIF, WebP (Max 5MB)
                                    </p>
                                </div>
                                <input
                                    id="categoryImage"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    style={{ display: 'none' }}
                                />
                                
                                {imagePreview && (
                                    <div style={styles.imagePreviewContainer}>
                                        <img src={imagePreview} alt="Preview" style={styles.imagePreview} />
                                        <button
                                            type="button"
                                            style={styles.removeImageBtn}
                                            onClick={removeImage}
                                            title="Remove image"
                                        >
                                            <FaTimes />
                                        </button>
                                    </div>
                                )}
                            </div>

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

                            {/* Upload Progress */}
                            {uploadProgress > 0 && uploadProgress < 100 && (
                                <div style={styles.uploadProgress}>
                                    <div style={{ ...styles.progressBar, width: `${uploadProgress}%` }} />
                                </div>
                            )}

                            <button 
                                type="submit" 
                                style={{
                                    ...styles.submitButton,
                                    backgroundColor: submitting ? '#6c757d' : '#3498db'
                                }}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <>
                                        <FaSpinner className="spinner" /> 
                                        {editingCategory ? 'Updating...' : 'Adding...'} {uploadProgress > 0 ? `${uploadProgress}%` : ''}
                                    </>
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