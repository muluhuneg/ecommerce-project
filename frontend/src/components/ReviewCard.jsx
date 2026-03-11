import React, { useState } from 'react';
import { FaUser, FaCheckCircle, FaThumbsUp, FaTrash, FaEdit, FaStar } from 'react-icons/fa'; // Added FaStar here
import { useAuth } from '../context/AuthContext';
import ReviewStars from './ReviewStars';
import reviewApi from '../services/reviewApi';

const ReviewCard = ({ review, onUpdate, onDelete }) => {
    const { user } = useAuth();
    const [helpful, setHelpful] = useState(review.user_helped || false);
    const [helpfulCount, setHelpfulCount] = useState(review.helpful_count || 0);
    const [showFullImage, setShowFullImage] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        rating: review.rating,
        title: review.title,
        comment: review.comment
    });

    const handleHelpful = async () => {
        try {
            if (!user) {
                alert('Please login to mark reviews as helpful');
                return;
            }

            if (helpful) {
                await reviewApi.unmarkHelpful(review.id);
                setHelpfulCount(prev => prev - 1);
            } else {
                await reviewApi.markHelpful(review.id);
                setHelpfulCount(prev => prev + 1);
            }
            setHelpful(!helpful);
        } catch (error) {
            console.error('Error toggling helpful:', error);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await reviewApi.updateReview(review.id, editForm);
            setIsEditing(false);
            onUpdate?.();
        } catch (error) {
            console.error('Error updating review:', error);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this review?')) {
            try {
                await reviewApi.deleteReview(review.id);
                onDelete?.();
            } catch (error) {
                console.error('Error deleting review:', error);
            }
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return `${Math.floor(diffDays / 365)} years ago`;
    };

    if (isEditing) {
        return (
            <div style={styles.editForm}>
                <h4>Edit Review</h4>
                <form onSubmit={handleEditSubmit}>
                    <div style={styles.formGroup}>
                        <label>Rating</label>
                        <div style={styles.ratingInput}>
                            {[1,2,3,4,5].map(star => (
                                <FaStar
                                    key={star}
                                    size={30}
                                    color={star <= editForm.rating ? '#ffc107' : '#e4e5e9'}
                                    onClick={() => setEditForm({...editForm, rating: star})}
                                    style={{ cursor: 'pointer' }}
                                />
                            ))}
                        </div>
                    </div>
                    
                    <div style={styles.formGroup}>
                        <label>Title</label>
                        <input
                            type="text"
                            value={editForm.title}
                            onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                            style={styles.input}
                            required
                        />
                    </div>
                    
                    <div style={styles.formGroup}>
                        <label>Review</label>
                        <textarea
                            value={editForm.comment}
                            onChange={(e) => setEditForm({...editForm, comment: e.target.value})}
                            style={styles.textarea}
                            rows="4"
                            required
                        />
                    </div>
                    
                    <div style={styles.buttonGroup}>
                        <button type="submit" style={styles.saveButton}>Save Changes</button>
                        <button type="button" onClick={() => setIsEditing(false)} style={styles.cancelButton}>Cancel</button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div style={styles.card}>
            {/* User Info */}
            <div style={styles.userInfo}>
                <div style={styles.avatar}>
                    {review.user_image ? (
                        <img src={review.user_image} alt={review.user_name} style={styles.avatarImage} />
                    ) : (
                        <FaUser size={20} />
                    )}
                </div>
                <div style={styles.userDetails}>
                    <div style={styles.userName}>
                        {review.user_name}
                        {review.is_verified_purchase && (
                            <span style={styles.verifiedBadge}>
                                <FaCheckCircle size={12} /> Verified Purchase
                            </span>
                        )}
                    </div>
                    <ReviewStars rating={review.rating} size={14} />
                </div>
                <span style={styles.date}>{formatDate(review.created_at)}</span>
            </div>

            {/* Review Content */}
            <div style={styles.content}>
                {review.title && <h4 style={styles.title}>{review.title}</h4>}
                <p style={styles.comment}>{review.comment}</p>
            </div>

            {/* Review Images */}
            {review.images && review.images.length > 0 && (
                <div style={styles.imageGrid}>
                    {review.images.map((image, index) => (
                        <div
                            key={index}
                            style={styles.imageThumbnail}
                            onClick={() => setShowFullImage(image)}
                        >
                            <img src={image} alt={`Review ${index + 1}`} style={styles.thumbnailImg} />
                        </div>
                    ))}
                </div>
            )}

            {/* Full Image Modal */}
            {showFullImage && (
                <div style={styles.modal} onClick={() => setShowFullImage(null)}>
                    <img src={showFullImage} alt="Full size" style={styles.fullImage} />
                </div>
            )}

            {/* Actions */}
            <div style={styles.actions}>
                <button 
                    style={{
                        ...styles.helpfulButton,
                        color: helpful ? '#3498db' : '#666'
                    }}
                    onClick={handleHelpful}
                >
                    <FaThumbsUp /> Helpful ({helpfulCount})
                </button>

                {user && user.id === review.user_id && (
                    <>
                        <button style={styles.actionButton} onClick={handleEdit}>
                            <FaEdit /> Edit
                        </button>
                        <button style={styles.actionButton} onClick={handleDelete}>
                            <FaTrash /> Delete
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

const styles = {
    card: {
        background: 'white',
        borderRadius: '10px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    },
    userInfo: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '15px',
        position: 'relative'
    },
    avatar: {
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        backgroundColor: '#3498db',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.2rem',
        marginRight: '15px',
        overflow: 'hidden'
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
    },
    userDetails: {
        flex: 1
    },
    userName: {
        fontWeight: 'bold',
        marginBottom: '5px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    verifiedBadge: {
        fontSize: '0.7rem',
        color: '#28a745',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '3px'
    },
    date: {
        color: '#999',
        fontSize: '0.85rem'
    },
    content: {
        marginBottom: '15px'
    },
    title: {
        fontSize: '1.1rem',
        marginBottom: '10px',
        color: '#333'
    },
    comment: {
        color: '#666',
        lineHeight: '1.6'
    },
    imageGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
        gap: '10px',
        marginBottom: '15px'
    },
    imageThumbnail: {
        width: '80px',
        height: '80px',
        borderRadius: '5px',
        overflow: 'hidden',
        cursor: 'pointer',
        border: '1px solid #eee'
    },
    thumbnailImg: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
    },
    actions: {
        display: 'flex',
        gap: '15px',
        borderTop: '1px solid #eee',
        paddingTop: '15px'
    },
    helpfulButton: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        fontSize: '0.9rem',
        padding: '5px 10px',
        borderRadius: '5px',
        transition: 'all 0.3s'
    },
    actionButton: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        fontSize: '0.9rem',
        color: '#666',
        padding: '5px 10px',
        borderRadius: '5px'
    },
    modal: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        cursor: 'pointer'
    },
    fullImage: {
        maxWidth: '90%',
        maxHeight: '90%',
        objectFit: 'contain'
    },
    editForm: {
        background: 'white',
        borderRadius: '10px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    },
    formGroup: {
        marginBottom: '15px'
    },
    ratingInput: {
        display: 'flex',
        gap: '5px',
        marginTop: '5px'
    },
    input: {
        width: '100%',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        fontSize: '0.95rem',
        marginTop: '5px'
    },
    textarea: {
        width: '100%',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        fontSize: '0.95rem',
        marginTop: '5px',
        resize: 'vertical'
    },
    buttonGroup: {
        display: 'flex',
        gap: '10px',
        justifyContent: 'flex-end'
    },
    saveButton: {
        padding: '10px 20px',
        background: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
    },
    cancelButton: {
        padding: '10px 20px',
        background: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
    }
};

export default ReviewCard;