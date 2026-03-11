import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/seller/Sidebar';
import sellerApi from '../../services/sellerApi';
import { 
    FaImage, 
    FaTrash, 
    FaPlus, 
    FaSpinner, 
    FaCheckCircle,
    FaExclamationCircle,
    FaTimes,
    FaCloudUploadAlt,
    FaInfoCircle
} from 'react-icons/fa';

const AddProduct = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [additionalImages, setAdditionalImages] = useState([]);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category_id: '',
        stock: '',
        discount_price: '',
        brand: '',
        weight: '',
        dimensions: '',
        tags: ''
    });

    const [categories, setCategories] = useState([]);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        // Add CSS for spinner animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            .spinner {
                animation: spin 1s linear infinite;
                display: inline-block;
                margin-right: 8px;
            }
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
            .pulse {
                animation: pulse 2s infinite;
            }
        `;
        document.head.appendChild(style);
        
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await sellerApi.getCategories();
            setCategories(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setErrors(prev => ({ 
                ...prev, 
                categories: 'Failed to load categories' 
            }));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        // Clear error for this field
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched({
            ...touched,
            [name]: true
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setErrors({ ...errors, image: 'Please select an image file' });
                return;
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setErrors({ ...errors, image: 'Image size should be less than 5MB' });
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
            if (errors.image) {
                setErrors({ ...errors, image: '' });
            }
            setUploadError(null);
        }
    };

    const handleAdditionalImages = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = [];
        const newErrors = [];

        // Check total images limit (max 5 additional images)
        if (additionalImages.length + files.length > 5) {
            newErrors.push(`You can only upload up to 5 additional images. You already have ${additionalImages.length}`);
        } else {
            files.forEach(file => {
                if (file.type.startsWith('image/')) {
                    if (file.size <= 5 * 1024 * 1024) {
                        validFiles.push(file);
                        
                        // Create preview
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            setAdditionalImages(prev => [...prev, {
                                file: file,
                                preview: reader.result,
                                name: file.name
                            }]);
                        };
                        reader.readAsDataURL(file);
                    } else {
                        newErrors.push(`${file.name} is too large (max 5MB)`);
                    }
                } else {
                    newErrors.push(`${file.name} is not an image`);
                }
            });
        }

        if (newErrors.length > 0) {
            setErrors({ ...errors, additionalImages: newErrors.join(', ') });
        }
        
        // Reset file input
        e.target.value = null;
    };

    const removeAdditionalImage = (index) => {
        setAdditionalImages(prev => prev.filter((_, i) => i !== index));
        if (errors.additionalImages) {
            setErrors({ ...errors, additionalImages: '' });
        }
    };

    const removeMainImage = () => {
        setImagePreview(null);
        setImageFile(null);
        setErrors({ ...errors, image: '' });
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) newErrors.name = 'Product name is required';
        else if (formData.name.length < 3) newErrors.name = 'Product name must be at least 3 characters';
        
        if (!formData.price) newErrors.price = 'Price is required';
        else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) newErrors.price = 'Price must be a positive number';
        
        if (!formData.stock) newErrors.stock = 'Stock is required';
        else if (isNaN(formData.stock) || parseInt(formData.stock) < 0) newErrors.stock = 'Stock must be a positive number';
        
        if (!imageFile) newErrors.image = 'Product image is required';
        
        if (formData.discount_price && (isNaN(formData.discount_price) || parseFloat(formData.discount_price) < 0)) {
            newErrors.discount_price = 'Discount price must be a positive number';
        }
        
        if (formData.discount_price && parseFloat(formData.discount_price) >= parseFloat(formData.price)) {
            newErrors.discount_price = 'Discount price must be less than regular price';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            // Scroll to first error
            const firstError = document.querySelector('.error-text');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        setLoading(true);
        setUploadProgress(0);
        setUploadError(null);

        try {
            // Create FormData for file upload
            const productData = new FormData();
            productData.append('name', formData.name.trim());
            productData.append('description', formData.description.trim() || '');
            productData.append('price', formData.price);
            productData.append('category_id', formData.category_id || '');
            productData.append('stock', formData.stock);
            productData.append('discount_price', formData.discount_price || '');
            productData.append('brand', formData.brand.trim() || '');
            productData.append('weight', formData.weight || '');
            productData.append('dimensions', formData.dimensions.trim() || '');
            productData.append('tags', formData.tags.trim() || '');
            
            // Append the main image
            if (imageFile) {
                productData.append('productImage', imageFile);
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
            }, 200);

            // Upload product with image
            const response = await sellerApi.addProduct(productData);
            
            clearInterval(progressInterval);
            setUploadProgress(100);
            setUploadSuccess(true);

            // Upload additional images if any
            if (additionalImages.length > 0) {
                try {
                    const additionalFormData = new FormData();
                    additionalImages.forEach(img => {
                        additionalFormData.append('productImages', img.file);
                    });
                    
                    await sellerApi.addProductImages(response.productId, additionalFormData);
                } catch (imageError) {
                    console.warn('Additional images upload failed:', imageError);
                    // Don't fail the whole product if additional images fail
                }
            }

            // Show success and redirect
            setTimeout(() => {
                navigate('/seller/products', { 
                    state: { 
                        message: 'Product added successfully!',
                        type: 'success'
                    }
                });
            }, 1500);

        } catch (error) {
            console.error('Error adding product:', error);
            setUploadError(error.response?.data?.message || 'Failed to add product');
            setErrors({ 
                ...errors, 
                submit: error.response?.data?.message || 'Failed to add product' 
            });
            setUploadProgress(0);
        } finally {
            setLoading(false);
        }
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
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        title: {
            fontSize: '2rem',
            color: '#333',
            margin: 0
        },
        backButton: {
            padding: '0.5rem 1rem',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            transition: 'background-color 0.3s'
        },
        form: {
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            maxWidth: '900px',
            margin: '0 auto'
        },
        formGrid: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1.5rem'
        },
        formGroup: {
            marginBottom: '1.5rem'
        },
        label: {
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: '600',
            color: '#333',
            fontSize: '0.95rem'
        },
        requiredStar: {
            color: '#dc3545',
            marginLeft: '4px'
        },
        input: {
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '1rem',
            transition: 'border-color 0.3s, box-shadow 0.3s',
            outline: 'none'
        },
        textarea: {
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '1rem',
            minHeight: '120px',
            resize: 'vertical',
            fontFamily: 'inherit',
            transition: 'border-color 0.3s, box-shadow 0.3s',
            outline: 'none'
        },
        select: {
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '1rem',
            backgroundColor: 'white',
            cursor: 'pointer',
            outline: 'none'
        },
        errorText: {
            color: '#dc3545',
            fontSize: '0.85rem',
            marginTop: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
        },
        imageUploadArea: {
            border: '2px dashed #3498db',
            borderRadius: '12px',
            padding: '2rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s',
            marginBottom: '1rem',
            backgroundColor: '#f8f9fa',
            position: 'relative'
        },
        imagePreviewContainer: {
            position: 'relative',
            display: 'inline-block',
            marginTop: '1rem'
        },
        imagePreview: {
            maxWidth: '300px',
            maxHeight: '300px',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
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
            transition: 'all 0.3s',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        },
        additionalImagesGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: '1rem',
            marginTop: '1rem'
        },
        additionalImageCard: {
            position: 'relative',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'transform 0.3s'
        },
        additionalImage: {
            width: '100%',
            height: '120px',
            objectFit: 'cover'
        },
        imageName: {
            fontSize: '0.7rem',
            padding: '4px',
            backgroundColor: '#f8f9fa',
            textAlign: 'center',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
        },
        removeAdditionalBtn: {
            position: 'absolute',
            top: '5px',
            right: '5px',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '12px',
            transition: 'all 0.3s'
        },
        uploadProgress: {
            marginTop: '1.5rem',
            height: '6px',
            backgroundColor: '#f0f0f0',
            borderRadius: '3px',
            overflow: 'hidden'
        },
        progressBar: {
            height: '100%',
            backgroundColor: '#28a745',
            transition: 'width 0.3s ease'
        },
        successMessage: {
            backgroundColor: '#d4edda',
            color: '#155724',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            border: '1px solid #c3e6cb'
        },
        errorMessage: {
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            border: '1px solid #f5c6cb'
        },
        infoText: {
            fontSize: '0.85rem',
            color: '#666',
            marginTop: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
        },
        button: {
            backgroundColor: '#3498db',
            color: 'white',
            padding: '1rem 2rem',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: 'pointer',
            width: '100%',
            marginTop: '2rem',
            transition: 'all 0.3s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem'
        },
        buttonDisabled: {
            opacity: 0.6,
            cursor: 'not-allowed'
        },
        buttonHover: {
            backgroundColor: '#2980b9',
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
        }
    };

    return (
        <div style={styles.container}>
            <Sidebar />
            <div style={styles.mainContent}>
                <div style={styles.header}>
                    <h1 style={styles.title}>Add New Product</h1>
                    <button 
                        style={styles.backButton}
                        onClick={() => navigate('/seller/products')}
                    >
                        Cancel
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    {errors.submit && (
                        <div style={styles.errorMessage}>
                            <FaExclamationCircle /> {errors.submit}
                        </div>
                    )}

                    {uploadSuccess && (
                        <div style={styles.successMessage}>
                            <FaCheckCircle className="pulse" /> Product added successfully! Redirecting...
                        </div>
                    )}

                    {uploadError && (
                        <div style={styles.errorMessage}>
                            <FaExclamationCircle /> {uploadError}
                        </div>
                    )}

                    {/* Main Image Upload */}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>
                            Product Image <span style={styles.requiredStar}>*</span>
                        </label>
                        <div 
                            style={{
                                ...styles.imageUploadArea,
                                borderColor: errors.image ? '#dc3545' : '#3498db',
                                backgroundColor: errors.image ? '#fff8f8' : '#f8f9fa'
                            }}
                            onClick={() => document.getElementById('imageInput').click()}
                        >
                            <FaCloudUploadAlt size={48} color="#3498db" />
                            <p style={{ marginTop: '1rem', fontWeight: '500' }}>
                                Click to upload main product image
                            </p>
                            <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                                Supported formats: JPEG, PNG, GIF, WebP (Max 5MB)
                            </p>
                        </div>
                        <input
                            id="imageInput"
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
                                    onClick={removeMainImage}
                                    title="Remove image"
                                >
                                    <FaTimes />
                                </button>
                            </div>
                        )}
                        
                        {errors.image && (
                            <div style={styles.errorText}>
                                <FaExclamationCircle /> {errors.image}
                            </div>
                        )}
                    </div>

                    {/* Additional Images */}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Additional Images (Optional - Max 5)</label>
                        <div 
                            style={styles.imageUploadArea}
                            onClick={() => document.getElementById('additionalImages').click()}
                        >
                            <FaPlus size={40} color="#666" />
                            <p style={{ marginTop: '0.5rem' }}>Click to add more images</p>
                            <p style={{ fontSize: '0.8rem', color: '#999' }}>
                                {additionalImages.length}/5 images selected
                            </p>
                        </div>
                        <input
                            id="additionalImages"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleAdditionalImages}
                            style={{ display: 'none' }}
                            disabled={additionalImages.length >= 5}
                        />
                        
                        {additionalImages.length > 0 && (
                            <div style={styles.additionalImagesGrid}>
                                {additionalImages.map((img, index) => (
                                    <div key={index} style={styles.additionalImageCard}>
                                        <img 
                                            src={img.preview} 
                                            alt={`Additional ${index + 1}`} 
                                            style={styles.additionalImage}
                                        />
                                        <div style={styles.imageName}>{img.name}</div>
                                        <button
                                            type="button"
                                            style={styles.removeAdditionalBtn}
                                            onClick={() => removeAdditionalImage(index)}
                                            title="Remove image"
                                        >
                                            <FaTimes size={10} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {errors.additionalImages && (
                            <div style={styles.errorText}>
                                <FaExclamationCircle /> {errors.additionalImages}
                            </div>
                        )}
                        
                        <div style={styles.infoText}>
                            <FaInfoCircle /> You can upload up to 5 additional images (each max 5MB)
                        </div>
                    </div>

                    <div style={styles.formGrid}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                Product Name <span style={styles.requiredStar}>*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                style={{
                                    ...styles.input,
                                    borderColor: touched.name && errors.name ? '#dc3545' : '#ddd'
                                }}
                                placeholder="e.g., Smartphone X"
                            />
                            {touched.name && errors.name && (
                                <div style={styles.errorText}>
                                    <FaExclamationCircle /> {errors.name}
                                </div>
                            )}
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Category</label>
                            <select
                                name="category_id"
                                value={formData.category_id}
                                onChange={handleChange}
                                style={styles.select}
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            {errors.categories && (
                                <div style={styles.errorText}>
                                    <FaExclamationCircle /> {errors.categories}
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            style={styles.textarea}
                            placeholder="Product description..."
                        />
                    </div>

                    <div style={styles.formGrid}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                Price (Br) <span style={styles.requiredStar}>*</span>
                            </label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                style={{
                                    ...styles.input,
                                    borderColor: touched.price && errors.price ? '#dc3545' : '#ddd'
                                }}
                                placeholder="e.g., 5000"
                                min="0"
                                step="0.01"
                            />
                            {touched.price && errors.price && (
                                <div style={styles.errorText}>
                                    <FaExclamationCircle /> {errors.price}
                                </div>
                            )}
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Discount Price (Br)</label>
                            <input
                                type="number"
                                name="discount_price"
                                value={formData.discount_price}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                style={{
                                    ...styles.input,
                                    borderColor: touched.discount_price && errors.discount_price ? '#dc3545' : '#ddd'
                                }}
                                placeholder="e.g., 4500"
                                min="0"
                                step="0.01"
                            />
                            {touched.discount_price && errors.discount_price && (
                                <div style={styles.errorText}>
                                    <FaExclamationCircle /> {errors.discount_price}
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={styles.formGrid}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                Stock <span style={styles.requiredStar}>*</span>
                            </label>
                            <input
                                type="number"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                style={{
                                    ...styles.input,
                                    borderColor: touched.stock && errors.stock ? '#dc3545' : '#ddd'
                                }}
                                placeholder="e.g., 50"
                                min="0"
                                step="1"
                            />
                            {touched.stock && errors.stock && (
                                <div style={styles.errorText}>
                                    <FaExclamationCircle /> {errors.stock}
                                </div>
                            )}
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Brand</label>
                            <input
                                type="text"
                                name="brand"
                                value={formData.brand}
                                onChange={handleChange}
                                style={styles.input}
                                placeholder="e.g., Samsung"
                            />
                        </div>
                    </div>

                    <div style={styles.formGrid}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Weight (kg)</label>
                            <input
                                type="number"
                                name="weight"
                                value={formData.weight}
                                onChange={handleChange}
                                style={styles.input}
                                placeholder="e.g., 0.5"
                                min="0"
                                step="0.01"
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Dimensions</label>
                            <input
                                type="text"
                                name="dimensions"
                                value={formData.dimensions}
                                onChange={handleChange}
                                style={styles.input}
                                placeholder="e.g., 10x5x3 cm"
                            />
                        </div>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Tags</label>
                        <input
                            type="text"
                            name="tags"
                            value={formData.tags}
                            onChange={handleChange}
                            style={styles.input}
                            placeholder="e.g., smartphone, android, 5g (comma separated)"
                        />
                        <div style={styles.infoText}>
                            <FaInfoCircle /> Separate tags with commas
                        </div>
                    </div>

                    {/* Upload Progress */}
                    {uploadProgress > 0 && uploadProgress < 100 && (
                        <div style={styles.uploadProgress}>
                            <div style={{ ...styles.progressBar, width: `${uploadProgress}%` }} />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || uploadSuccess}
                        style={{
                            ...styles.button,
                            ...(loading || uploadSuccess ? styles.buttonDisabled : {}),
                            backgroundColor: loading ? '#6c757d' : '#3498db'
                        }}
                        onMouseEnter={(e) => {
                            if (!loading && !uploadSuccess) {
                                e.currentTarget.style.backgroundColor = '#2980b9';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!loading && !uploadSuccess) {
                                e.currentTarget.style.backgroundColor = '#3498db';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }
                        }}
                    >
                        {loading ? (
                            <>
                                <FaSpinner className="spinner" /> Adding Product... {uploadProgress}%
                            </>
                        ) : uploadSuccess ? (
                            <>
                                <FaCheckCircle /> Added Successfully!
                            </>
                        ) : (
                            <>
                                <FaCloudUploadAlt /> Add Product
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddProduct;