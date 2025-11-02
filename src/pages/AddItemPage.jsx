import React, { useState, useEffect } from 'react';
import { Navbar, Footer } from "../components";
import AddItemForm from "../components/AddItemForm";
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { jwtDecode } from 'jwt-decode'; // Add this import

const AddItemPage = () => {
  const [existingItems, setExistingItems] = useState([]);
  const [showExistingItems, setShowExistingItems] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Check for the auth token and admin role
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;

  useEffect(() => {
    if (isLoggedIn) {
      checkAdminStatus();
      fetchExistingItems();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);

  const checkAdminStatus = () => {
  try {
    const decodedToken = jwtDecode(token);
    // Check if user has admin role - using the same email as backend
    const userIsAdmin = decodedToken.role === 'admin' || 
                       decodedToken.email === 'admin@rentit.com';
    setIsAdmin(userIsAdmin);
  } catch (error) {
    console.error('Error decoding token:', error);
    setIsAdmin(false);
  }
  setLoading(false);
};

  const fetchExistingItems = async () => {
    try {
      const response = await axios.get('http://localhost:8000/items');
      setExistingItems(response.data);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    }
  };

  const handleAddQuantity = async (itemId, additionalQuantity) => {
    try {
      const item = existingItems.find(i => i.id === itemId);
      const newQuantity = item.quantity + additionalQuantity;
      
      await axios.post(`http://localhost:8000/admin/update_quantity?item_id=${itemId}&new_quantity=${newQuantity}`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      toast.success(`Added ${additionalQuantity} units to ${item.name}`);
      fetchExistingItems(); // Refresh the list
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const NotLoggedIn = () => (
    <div className="container my-5 py-5">
      <div className="row">
        <div className="col-md-12 text-center">
          <h2 className="display-5">Access Denied</h2>
          <p className="lead mb-4">You must be logged in to access this page.</p>
          <Link to="/login" className="btn btn-primary">
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );

  const NotAdmin = () => (
    <div className="container my-5 py-5">
      <div className="row">
        <div className="col-md-12 text-center">
          <h2 className="display-5">Access Denied</h2>
          <p className="lead mb-4">You do not have permission to access this page. Admin privileges required.</p>
          <Link to="/" className="btn btn-primary">
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );

  const ExistingItemsList = () => (
    <div className="container my-4">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Manage Existing Items</h4>
          <button 
            className="btn btn-outline-secondary"
            onClick={() => setShowExistingItems(false)}
          >
            Back to Add New Item
          </button>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Current Quantity</th>
                  <th>Price/Day</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {existingItems.map(item => (
                  <tr key={item.id}>
                    <td>
                      <img 
                        src={item.image} 
                        alt={item.name}
                        style={{ width: '50px', height: '50px', objectFit: 'cover', marginRight: '10px' }}
                      />
                      {item.name}
                    </td>
                    <td>
                      <span className="badge bg-info text-dark">{item.category}</span>
                    </td>
                    <td>{item.quantity}</td>
                    <td>₹{item.price_per_day}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-success me-2"
                        onClick={() => handleAddQuantity(item.id, 1)}
                      >
                        +1 Unit
                      </button>
                      <button
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => handleAddQuantity(item.id, 5)}
                      >
                        +5 Units
                      </button>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => {
                          const quantity = prompt(`Enter additional quantity for ${item.name}:`, '1');
                          if (quantity && !isNaN(quantity)) {
                            handleAddQuantity(item.id, parseInt(quantity));
                          }
                        }}
                      >
                        Custom
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="d-flex flex-column min-vh-100">
        <Navbar />
        <div className="container flex-grow-1 text-center my-5">
          <h2>Loading...</h2>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <div className="flex-grow-1" style={{ paddingTop: '20px' }}>
        {!isLoggedIn ? (
          <NotLoggedIn />
        ) : !isAdmin ? (
          <NotAdmin />
        ) : (
          <>
            {showExistingItems ? (
              <ExistingItemsList />
            ) : (
              <>
                <div className="container text-center my-4">
                  <button 
                    className="btn btn-info mb-3"
                    onClick={() => setShowExistingItems(true)}
                  >
                     Manage Existing Items & Add Quantity
                  </button>
                </div>
                <AddItemForm />
              </>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default AddItemPage;