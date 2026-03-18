import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/seller/Sidebar';
import sellerApi from '../../services/sellerApi';

const EditProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        image_url: '',
        brand: ''
    });

    useEffect(() => {
        fetchProduct();
    }, []);

    const fetchProduct = async () => {
        try {
            const products = await sellerApi.getProducts();
            const product = products.find(p => p.id === parseInt(id));
            if (product) {
                setFormData(product);
            }
        } catch (error) {
            console.error('Error fetching product:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await sellerApi.updateProduct(id, formData);
            alert('Product updated successfully!');
            navigate('/seller/products');
        } catch (error) {
            console.error('Error updating product:', error);
            alert('Failed to update product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="seller-page" style={{ display: 'flex', flexWrap: 'wrap', overflowX: 'hidden' }}>
            <Sidebar />
            <div className="seller-main-content" style={{ marginLeft: '0', padding: '2rem', flex: 1, minWidth: 0 }}>
                <h1>Edit Product</h1>
                <form onSubmit={handleSubmit} style={styles.form}>
                    {/* Same form as AddProduct */}
                    <div style={styles.formGroup}>
                        <label>Product Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            style={{...styles.input, minHeight: '100px'}}
                        />
                    </div>
                    <div style={styles.row}>
                        <div style={styles.formGroup}>
                            <label>Price ($)</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label>Stock</label>
                            <input
                                type="number"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                                required
                                style={styles.input}
                            />
                        </div>
                    </div>
                    <div style={styles.formGroup}>
                        <label>Image URL</label>
                        <input
                            type="text"
                            name="image_url"
                            value={formData.image_url}
                            onChange={handleChange}
                            style={styles.input}
                        />
                    </div>
                    <button type="submit" disabled={loading} style={styles.button}>
                        {loading ? 'Updating...' : 'Update Product'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const styles = {
    form: { maxWidth: '600px', marginTop: '2rem' },
    formGroup: { marginBottom: '1.5rem' },
    row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
    input: { width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem', marginTop: '0.5rem' },
    button: { backgroundColor: '#1e3c72', color: 'white', padding: '0.75rem 2rem', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer' }
};

export default EditProduct;