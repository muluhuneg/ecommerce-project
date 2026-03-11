import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const ReviewStars = ({ rating, size = 20, showValue = false }) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
            stars.push(<FaStar key={i} color="#ffc107" size={size} />);
        } else if (i === fullStars + 1 && hasHalfStar) {
            stars.push(<FaStarHalfAlt key={i} color="#ffc107" size={size} />);
        } else {
            stars.push(<FaRegStar key={i} color="#ffc107" size={size} />);
        }
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ display: 'flex', gap: '2px' }}>{stars}</div>
            {showValue && <span style={{ marginLeft: '5px', fontWeight: 'bold' }}>{rating.toFixed(1)}</span>}
        </div>
    );
};

export default ReviewStars;