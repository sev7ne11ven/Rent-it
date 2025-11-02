import React, { useState } from 'react';
import axios from 'axios';
import toast from "react-hot-toast";

const AddItemForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price_per_day: '',
    security_deposit: '', // Security deposit field
    quantity: 1,
    image: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Retrieve the auth token from local storage
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('You must be logged in to add an item.');
      setIsSubmitting(false);
      return;
    }

    // Validate all required fields
    if (!formData.name || !formData.description || !formData.category || !formData.price_per_day) {
      toast.error('Please fill in all required fields.');
      setIsSubmitting(false);
      return;
    }

    // Validate price is positive
    if (parseFloat(formData.price_per_day) <= 0) {
      toast.error('Price per day must be greater than 0.');
      setIsSubmitting(false);
      return;
    }

    // Validate security deposit is not negative
    const securityDeposit = parseFloat(formData.security_deposit) || 0;
    if (securityDeposit < 0) {
      toast.error('Security deposit cannot be negative.');
      setIsSubmitting(false);
      return;
    }

    // Validate quantity
    if (parseInt(formData.quantity) < 1) {
      toast.error('Quantity must be at least 1.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Prepare the request with the Authorization header
      const response = await axios.post('http://localhost:8000/add_item', 
        {
          name: formData.name.trim(),
          description: formData.description.trim(),
          category: formData.category,
          price_per_day: parseFloat(formData.price_per_day),
          security_deposit: securityDeposit, // Use the validated security deposit
          quantity: parseInt(formData.quantity),
          image: formData.image.trim()
        }, 
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      toast.success('Item added successfully!');
      
      // Reset the form after successful submission
      setFormData({
        name: '',
        description: '',
        category: '',
        price_per_day: '',
        security_deposit: '', // Reset security deposit field
        quantity: 1,
        image: ''
      });

    } catch (error) {
      console.error('Error adding item:', error);
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        toast.error('Authentication failed. Please log in again.');
      } else if (error.response && error.response.data && error.response.data.detail) {
        toast.error(`Failed to add item: ${error.response.data.detail}`);
      } else {
        toast.error('Failed to add item. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Helper function to calculate suggested security deposit based on category and price
  const getSuggestedDeposit = () => {
    if (!formData.price_per_day || !formData.category) return 0;
    
    const price = parseFloat(formData.price_per_day);
    switch(formData.category) {
      case 'car':
        return price * 3; // 3 days worth for cars (higher value items)
      case 'bike':
        return price * 2; // 2 days worth for bikes
      case 'appliance':
        return price * 1; // 1 day worth for appliances
      default:
        return price * 1;
    }
  };

  const applySuggestedDeposit = () => {
    const suggested = getSuggestedDeposit();
    setFormData({
      ...formData,
      security_deposit: suggested.toFixed(2)
    });
    toast.success(`Applied suggested security deposit: ₹${suggested.toFixed(2)}`);
  };

  const clearSecurityDeposit = () => {
    setFormData({
      ...formData,
      security_deposit: ''
    });
    toast.success('Security deposit cleared');
  };

  const suggestedDeposit = getSuggestedDeposit();

  return (
    <div className="container my-3 py-3">
      <h2 className="text-center">Add Rental Item</h2>
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Item Name *</label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter item name"
                maxLength="100"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Description *</label>
              <textarea
                className="form-control"
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Describe the item, features, condition, etc."
                maxLength="500"
              />
              <div className="form-text">{formData.description.length}/500 characters</div>
            </div>

            <div className="mb-3">
              <label className="form-label">Category *</label>
              <select 
                className="form-select"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                <option value="car">Car</option>
                <option value="bike">Bike</option>
                <option value="appliance">Appliance</option>
                <option value="electronics">Electronics</option>
                <option value="furniture">Furniture</option>
                <option value="tools">Tools</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Price per Day (₹) *</label>
              <input
                type="number"
                className="form-control"
                name="price_per_day"
                value={formData.price_per_day}
                onChange={handleChange}
                required
                step="0.01"
                min="0.01"
                placeholder="0.00"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Security Deposit (₹)</label>
              <div className="input-group">
                <input
                  type="number"
                  className="form-control"
                  name="security_deposit"
                  value={formData.security_deposit}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  placeholder="Optional - amount to cover potential damages"
                />
                <button 
                  type="button" 
                  className="btn btn-outline-success"
                  onClick={applySuggestedDeposit}
                  disabled={!formData.price_per_day || !formData.category}
                  title="Calculate based on category and daily price"
                >
                  Suggest
                </button>
                <button 
                  type="button" 
                  className="btn btn-outline-danger"
                  onClick={clearSecurityDeposit}
                  disabled={!formData.security_deposit}
                  title="Clear security deposit"
                >
                  Clear
                </button>
              </div>
              <div className="form-text">
                <strong>Purpose:</strong> This security deposit will be charged to customers and fully refunded when the item is returned in good condition. It covers any potential damages during rental.
                {formData.price_per_day && formData.category && (
                  <span className="d-block mt-1">
                    <strong>Suggested:</strong> ₹{suggestedDeposit.toFixed(2)} (based on {formData.category} category)
                    {suggestedDeposit > 0 && (
                      <button 
                        type="button"
                        className="btn btn-link btn-sm p-0 ms-2"
                        onClick={applySuggestedDeposit}
                      >
                        Apply
                      </button>
                    )}
                  </span>
                )}
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Quantity Available *</label>
              <input
                type="number"
                className="form-control"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                max="1000"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Image URL</label>
              <input
                type="url"
                className="form-control"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
              <div className="form-text">
                Provide a direct image URL for the item. If left empty, a placeholder image will be used.
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-100 py-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Adding Item...
                </>
              ) : (
                'Add Item'
              )}
            </button>

            {/* Security Deposit Information Card */}
            {formData.security_deposit > 0 && (
              <div className="alert alert-info mt-3">
                <h6 className="alert-heading">
                  <i className="fas fa-shield-alt me-2"></i>
                  Security Deposit Information
                </h6>
                <p className="mb-1">
                  <strong>Amount:</strong> ₹{parseFloat(formData.security_deposit).toFixed(2)}
                </p>
                <p className="mb-0">
                  <strong>Note:</strong> This amount will be charged to customers as a refundable deposit to cover potential damages during rental.
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddItemForm;