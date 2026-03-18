import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/seller/Sidebar';
import sellerApi from '../../services/sellerApi';
import { useAuth } from '../../context/AuthContext';
import { FaCamera, FaSpinner } from 'react-icons/fa';

const Profile = () => {
    const { user, updateUser } = useAuth(); // Make sure updateUser exists in your AuthContext
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        business_name: '',
        business_address: '',
        business_phone: '',
        business_email: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                business_name: user.seller?.business_name || '',
                business_address: user.seller?.business_address || '',
                business_phone: user.seller?.business_phone || '',
                business_email: user.seller?.business_email || ''
            });
            
            // Set profile image if exists
            if (user.profile_image) {
                setImagePreview(user.profile_image);
            } else {
                // Set default avatar based on name initials
                const initials = user.name ? user.name.charAt(0).toUpperCase() : 'U';
                setImagePreview(`https://ui-avatars.com/api/?name=${initials}&background=1e3c72&color=fff&size=150`);
            }
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Handle image selection from gallery
    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.match('image.*')) {
                alert('Please select an image file (JPEG, PNG, etc.)');
                return;
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size should be less than 5MB');
                return;
            }

            setProfileImage(file);
            
            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle profile image upload
    const handleImageUpload = async () => {
        if (!profileImage) return null;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('profileImage', profileImage);
            
            const response = await sellerApi.uploadProfileImage(formData);
            
            if (response.success) {
                // Return the new image URL from response
                return response.image_url || response.profile_image;
            }
            return null;
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload profile image');
            return null;
        } finally {
            setUploading(false);
        }
    };

    // Refresh user data from server
    const refreshUserData = async () => {
        try {
            const profileData = await sellerApi.getProfile();
            if (profileData && updateUser) {
                updateUser(profileData);
            }
        } catch (error) {
            console.error('Error refreshing user data:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Upload image first if selected
            if (profileImage) {
                await handleImageUpload();
            }
            
            // Update profile information
            await sellerApi.updateProfile(formData);
            await sellerApi.updateSellerInfo(formData);
            
            // Refresh user data to get updated profile image
            await refreshUserData();
            
            alert('Profile updated successfully!');
            
            // Clear the selected file after successful upload
            setProfileImage(null);
            
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="seller-page" style={{ display: 'flex', flexWrap: 'wrap', overflowX: 'hidden' }}>
            <Sidebar />
            <div className="seller-main-content" style={{ marginLeft: '0', padding: '2rem', flex: 1, minWidth: 0 }}>
                <h1>Seller Profile</h1>
                
                {/* Profile Image Section */}
                <div style={styles.imageSection}>
                    <div style={styles.imageContainer}>
                        {imagePreview ? (
                            <img 
                                src={imagePreview} 
                                alt="Profile" 
                                style={styles.profileImage}
                                onError={(e) => {
                                    // Fallback if image fails to load
                                    e.target.src = `https://ui-avatars.com/api/?name=${user?.name?.charAt(0) || 'U'}&background=1e3c72&color=fff&size=150`;
                                }}
                            />
                        ) : (
                            <div style={styles.imagePlaceholder}>
                                <FaCamera size={40} color="#999" />
                            </div>
                        )}
                        
                        <label htmlFor="profile-image" style={styles.imageUploadLabel}>
                            <FaCamera />
                            <span>Change Photo</span>
                            <input
                                id="profile-image"
                                type="file"
                                accept="image/*"
                                onChange={handleImageSelect}
                                style={styles.imageInput}
                                disabled={uploading}
                            />
                        </label>
                        
                        {uploading && (
                            <div style={styles.uploadingOverlay}>
                                <FaSpinner className="spinner" size={30} color="#fff" />
                            </div>
                        )}
                    </div>
                    {profileImage && (
                        <p style={styles.imageSelectedText}>
                            New image selected. Save profile to upload.
                        </p>
                    )}
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <h3>Personal Information</h3>
                    <div style={styles.formGroup}>
                        <label>Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            style={styles.input}
                            readOnly // Email usually shouldn't be changed
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label>Phone</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            style={styles.input}
                        />
                    </div>

                    <h3 style={{ marginTop: '2rem' }}>Business Information</h3>
                    <div style={styles.formGroup}>
                        <label>Business Name</label>
                        <input
                            type="text"
                            name="business_name"
                            value={formData.business_name}
                            onChange={handleChange}
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label>Business Address</label>
                        <textarea
                            name="business_address"
                            value={formData.business_address}
                            onChange={handleChange}
                            style={{...styles.input, minHeight: '100px'}}
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label>Business Phone</label>
                        <input
                            type="tel"
                            name="business_phone"
                            value={formData.business_phone}
                            onChange={handleChange}
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label>Business Email</label>
                        <input
                            type="email"
                            name="business_email"
                            value={formData.business_email}
                            onChange={handleChange}
                            style={styles.input}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading || uploading} 
                        style={{
                            ...styles.button,
                            opacity: (loading || uploading) ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Updating...' : uploading ? 'Uploading Image...' : 'Update Profile'}
                    </button>
                </form>
            </div>

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
    );
};

const styles = {
    imageSection: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '2rem'
    },
    imageContainer: {
        position: 'relative',
        width: '150px',
        height: '150px'
    },
    profileImage: {
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        objectFit: 'cover',
        border: '3px solid #1e3c72'
    },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        backgroundColor: '#f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px dashed #ccc'
    },
    imageUploadLabel: {
        position: 'absolute',
        bottom: '5px',
        right: '5px',
        backgroundColor: '#1e3c72',
        color: 'white',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        border: '2px solid white',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        transition: 'background-color 0.3s',
        overflow: 'hidden'
    },
    imageInput: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: 0,
        cursor: 'pointer'
    },
    uploadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    imageSelectedText: {
        marginTop: '10px',
        color: '#1e3c72',
        fontSize: '0.9rem',
        fontStyle: 'italic'
    },
    form: {
        maxWidth: '600px',
        marginTop: '2rem'
    },
    formGroup: {
        marginBottom: '1.5rem'
    },
    input: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '1rem',
        marginTop: '0.5rem'
    },
    button: {
        backgroundColor: '#1e3c72',
        color: 'white',
        padding: '0.75rem 2rem',
        border: 'none',
        borderRadius: '4px',
        fontSize: '1rem',
        cursor: 'pointer',
        transition: 'opacity 0.3s'
    }
};

export default Profile;