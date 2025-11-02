
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { addCart } from "../redux/action";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Navbar, Footer } from "../components";

const Products = () => {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rentingItem, setRentingItem] = useState(null);
  const [rentDays, setRentDays] = useState(1);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:8000/items');
        console.log("Product data:", response.data); // 👈 Add this

        setData(response.data);
        setFilter(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products');
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  const addProduct = (product) => {
    dispatch(addCart(product));
    toast.success("Added to cart");
  };

  const addRentalToCart = (product, days) => {
    const rentalCost = product.price_per_day * days;
    const securityDeposit = product.security_deposit || 0;
    const totalPrice = rentalCost + securityDeposit;
    
    // Create a rental item with the specified days and security deposit
    const rentalItem = {
      ...product,
      rental_days: days,
      rental_cost: rentalCost,
      security_deposit: securityDeposit,
      total_price: totalPrice,
      isRental: true // Flag to identify rental items
    };
    
    dispatch(addCart(rentalItem));
    
    // Show appropriate success message based on security deposit
    if (securityDeposit > 0) {
      toast.success(`${product.name} rental added to cart! Includes ₹${securityDeposit} security deposit.`);
    } else {
      toast.success(`Added ${product.name} rental for ${days} days to cart!`);
    }
    
    setRentingItem(null);
    setRentDays(1);
  };

 const filterProduct = (cat) => {
  const updatedList = data.filter(
    (item) => item.category?.toLowerCase() === cat.toLowerCase()
  );
  console.log("Filtering for:", cat, "Found:", updatedList.length);
  setFilter(updatedList);
};


  const handleRentNow = (product) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to rent items');
      navigate('/login');
      return;
    }
    setRentingItem(product);
  };

  const ShowProducts = () => {
    return (
      <>
        <div className="buttons text-center py-5">
          <button
            className="btn btn-outline-dark btn-sm m-2"
            onClick={() => setFilter(data)}
          >
            All
          </button>
          <button
            className="btn btn-outline-dark btn-sm m-2"
            onClick={() => filterProduct("bike")}
          >
            Bikes
          </button>
          <button
            className="btn btn-outline-dark btn-sm m-2"
            onClick={() => filterProduct("car")}
          >
            Cars
          </button>
          <button
            className="btn btn-outline-dark btn-sm m-2"
            onClick={() => filterProduct("appliance")}
          >
            Appliances
          </button>
        </div>

        {filter.map((product) => {
          const hasSecurityDeposit = product.security_deposit > 0;
          
          return (
            <div
              id={product.id}
              key={product.id}
              className="col-md-4 col-sm-6 col-xs-8 col-12 mb-4"
            >
              <div className="card text-center h-100" key={product.id}>
                <img
                  className="card-img-top p-3"
                  src={product.image}
                  alt={product.name}
                  height={300}
                  style={{objectFit: 'cover'}}
                />
                <div className="card-body">
                  <h5 className="card-title">
                    {product.name.substring(0, 20)}...
                  </h5>
                  <p className="card-text">
                    {product.description.substring(0, 90)}...
                  </p>
                </div>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item lead">₹ {product.price_per_day} per/day</li>
                  {hasSecurityDeposit && (
                    <li className="list-group-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-warning">
                          <i className="fas fa-shield-alt me-1"></i>
                          Security Deposit: ₹{product.security_deposit}
                        </small>
                        <span className="badge bg-warning text-dark">Refundable</span>
                      </div>
                    </li>
                  )}
                  <li className={`list-group-item ${product.quantity === 0 ? 'text-danger' : 'text-success'}`}>
                    <div className="d-flex justify-content-between align-items-center">
                      <span>Available: {product.quantity} units</span>
                      {hasSecurityDeposit && (
                        <i className="fas fa-info-circle text-info" title="Includes security deposit for damage protection"></i>
                      )}
                    </div>
                  </li>
                </ul>
                <div className="card-body">
                  <button
                    className="btn btn-dark m-1"
                    onClick={() => handleRentNow(product)}
                    disabled={product.quantity === 0}
                  >
                    {product.quantity === 0 ? 'Out of Stock' : 'Rent Now'}
                  </button>
                  <button
                    className="btn btn-outline-dark m-1"
                    onClick={() => {
                      addProduct(product);
                    }}
                    disabled={product.quantity === 0}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </>
    );
  };

  const Loading = () => {
    return (
      <div className="container my-5 py-5">
        <div className="row">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div className="col-md-4 col-sm-6 col-xs-8 col-12 mb-4" key={item}>
              <div className="card text-center h-100">
                <div className="card-body">
                  <div className="placeholder-glow">
                    <div className="placeholder col-12" style={{height: "300px"}}></div>
                    <h5 className="card-title placeholder-glow">
                      <span className="placeholder col-6"></span>
                    </h5>
                    <p className="card-text placeholder-glow">
                      <span className="placeholder col-7"></span>
                      <span className="placeholder col-4"></span>
                      <span className="placeholder col-4"></span>
                      <span className="placeholder col-6"></span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <div className="container my-3 py-3" style={{paddingTop: '100px'}}>
        <div className="row">
          <div className="col-12">
            <h2 className="display-5 text-center">Available Products</h2>
            <hr />
          </div>
        </div>
        <div className="row justify-content-center">
          {loading ? <Loading /> : <ShowProducts />}
        </div>
      </div>

      {/* Rental Modal */}
      {rentingItem && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-calendar-alt me-2"></i>
                  Rent {rentingItem.name}
                </h5>
                <button type="button" className="btn-close" onClick={() => setRentingItem(null)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">
                    <strong>Rental Days</strong>
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    min="1"
                    max="30"
                    value={rentDays}
                    onChange={(e) => setRentDays(parseInt(e.target.value) || 1)}
                  />
                  <div className="form-text">Choose how many days you want to rent this item</div>
                </div>
                
                <div className="rental-breakdown">
                  <h6 className="mb-3">Cost Breakdown:</h6>
                  
                  <div className="d-flex justify-content-between mb-2">
                    <span>Price per day:</span>
                    <span>₹{rentingItem.price_per_day}</span>
                  </div>
                  
                  <div className="d-flex justify-content-between mb-2">
                    <span>Rental cost ({rentDays} days):</span>
                    <span>₹{rentingItem.price_per_day * rentDays}</span>
                  </div>
                  
                  {/* Security Deposit Section */}
                  {rentingItem.security_deposit > 0 && (
                    <>
                      <div className="d-flex justify-content-between mb-2">
                        <span>
                          <i className="fas fa-shield-alt me-1 text-warning"></i>
                          Security Deposit:
                        </span>
                        <span className="text-warning">₹{rentingItem.security_deposit}</span>
                      </div>
                      
                      <div className="alert alert-warning py-2 mb-3">
                        <small>
                          <i className="fas fa-info-circle me-1"></i>
                          <strong>Damage Protection:</strong> This security deposit covers any potential damages during your rental period. The full amount will be refunded after the item is returned in good condition.
                        </small>
                      </div>
                    </>
                  )}
                  
                  <hr />
                  
                  <div className="d-flex justify-content-between fw-bold fs-5">
                    <span>Total amount to pay:</span>
                    <span className="text-primary">
                      ₹{(rentingItem.price_per_day * rentDays) + (rentingItem.security_deposit || 0)}
                    </span>
                  </div>
                  
                  <div className="mt-3">
                    <small className="text-muted">
                      <i className="fas fa-box me-1"></i>
                      <strong>Available units:</strong> {rentingItem.quantity}
                    </small>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setRentingItem(null)}>
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={() => addRentalToCart(rentingItem, rentDays)}
                >
                  <i className="fas fa-cart-plus me-1"></i>
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </>
  );
};

export default Products;