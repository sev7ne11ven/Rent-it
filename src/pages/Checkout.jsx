import React, { useState, useEffect } from "react";
import { Footer, Navbar } from "../components";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast"; // Add this import

const Checkout = () => {
  const state = useSelector((state) => state.handleCart);
  const navigate = useNavigate();

  // Function to load the Razorpay script dynamically
  const loadRazorpayScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Run this effect when the component mounts to ensure the script is loaded
  useEffect(() => {
    loadRazorpayScript("https://checkout.razorpay.com/v1/checkout.js");
  }, []);

  const EmptyCart = () => {
    return (
      <div className="container">
        <div className="row">
          <div className="col-md-12 py-5 bg-light text-center">
            <h4 className="p-3 display-5">No items in Cart</h4>
            <Link to="/" className="btn btn-outline-dark mx-4">
              <i className="fa fa-arrow-left me-2"></i> Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  };

  const ShowCheckout = () => {
    // State for form inputs and validation errors
    const [formData, setFormData] = useState({
      firstName: "",
      lastName: "",
      email: "",
      address: "",
      phone: ""
    });
    const [errors, setErrors] = useState({});
    const [isProcessing, setIsProcessing] = useState(false);

    // Calculate totals properly for both rental and regular items including security deposit
    const { totalItems, subtotal, rentalItemsCount, regularItemsCount } = state.reduce(
      (acc, item) => {
        let itemPrice = 0;
        let deposit = 0;
        
        if (item.isRental) {
          // For rental items, calculate rental cost and security deposit separately
          const rentalCost = item.rental_cost || (item.price_per_day * item.rental_days);
          deposit = item.security_deposit || 0;
          itemPrice = rentalCost;
          acc.rentalItemsCount += 1;
        } else {
          // For regular items, use price_per_day * quantity
          itemPrice = item.price_per_day * (item.qty || 1);
          acc.regularItemsCount += 1;
        }
        
        acc.totalItems += item.qty || 1;
        acc.subtotal += itemPrice;
        acc.securityDeposit += deposit;
        return acc;
      },
      { totalItems: 0, subtotal: 0, securityDeposit: 0, rentalItemsCount: 0, regularItemsCount: 0 }
    );
    
    const shipping = 30.0;
    const securityDeposit = 1000.0;
    const totalAmount = Math.round(subtotal + securityDeposit + shipping);

    // Debug log to check security deposit calculation
    console.log('Security Deposit Calculation:', {
      state,
      subtotal,
      securityDeposit,
      shipping,
      totalAmount
    });

    // Handle input changes
    const handleInputChange = (e) => {
      const { id, value } = e.target;
      setFormData({ ...formData, [id]: value });
      // Clear error for the field being edited
      if (errors[id]) {
        setErrors({ ...errors, [id]: null });
      }
    };

    // --- FORM VALIDATION ---
    const validateForm = () => {
      const newErrors = {};
      if (!formData.firstName.trim()) newErrors.firstName = "First name is required.";
      if (!formData.lastName.trim()) newErrors.lastName = "Last name is required.";
      if (!formData.email.trim()) {
        newErrors.email = "Email is required.";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Email address is invalid.";
      }
      if (!formData.phone.trim()) {
        newErrors.phone = "Phone number is required.";
      } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
        newErrors.phone = "Please enter a valid 10-digit phone number.";
      }
      if (!formData.address.trim()) newErrors.address = "Address is required.";
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    // --- PROCESS RENTALS ON BACKEND ---
    const processRentals = async (paymentId) => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const rentalPromises = state
          .filter(item => item.isRental)
          .map(async (item) => {
            const response = await axios.post('http://localhost:8000/rent_item', 
              {
                item_id: item.id,
                days: item.rental_days,
                security_deposit: item.security_deposit || 0 // Explicitly send security deposit
              },
              {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              }
            );
            return response.data;
          });

        const rentalResults = await Promise.all(rentalPromises);
        return rentalResults;
      } catch (error) {
        console.error('Failed to process rentals:', error);
        if (error.response?.data?.detail) {
          throw new Error(error.response.data.detail);
        }
        throw error;
      }
    };

    // --- RAZORPAY PAYMENT HANDLER ---
    const handlePayment = async () => {
      // Step 1: Validate the form
      const isFormValid = validateForm();
      if (!isFormValid) {
        toast.error('Please fix the form errors before proceeding.');
        return;
      }

      // Step 2: Check if user is logged in
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to complete your purchase.');
        navigate('/login');
        return;
      }

      setIsProcessing(true);

      try {
        // Step 3: Proceed with payment
        const options = {
          key: "rzp_test_R9Bl4ju2Ddpq7j",
          amount: totalAmount * 100,
          currency: "INR",
          name: "Rent-It",
          description: `Rental Order - ${rentalItemsCount} rental item(s), ${regularItemsCount} regular item(s)`,
          image: "/logo.png",
          handler: async function (response) {
            try {
              // Process rentals after successful payment
              if (rentalItemsCount > 0) {
                const rentalResults = await processRentals(response.razorpay_payment_id);
                
                if (rentalResults.length > 0) {
                  const firstRentalId = rentalResults[0].rental_id;
                  if (window.confirm('Payment successful! Would you like to view your rental receipt?')) {
                    window.location.href = `/rental-receipt/${firstRentalId}`;
                  } else {
                    window.location.href = '/';
                  }
                }
              } else {
                // For non-rental purchases
                if (window.confirm('Payment successful! Thank you for your purchase. Continue shopping?')) {
                  window.location.href = '/';
                } else {
                  window.location.href = '/';
                }
              }
              
              // Clear cart after successful payment
              localStorage.removeItem('reduxState');
              
            } catch (error) {
              console.error('Rental processing error:', error);
              alert(`Payment successful but there was an issue processing your rental: ${error.message}. Please contact support.`);
              window.location.href = '/';
            } finally {
              setIsProcessing(false);
            }
          },
          prefill: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            contact: formData.phone,
          },
          notes: {
            address: formData.address,
            items: state.map(item => item.name).join(', '),
            security_deposit: `₹${securityDeposit} (Refundable)`,
            rental_items: rentalItemsCount,
            regular_items: regularItemsCount
          },
          theme: {
            color: "#3399cc",
          },
        };

        const rzp1 = new window.Razorpay(options);

        rzp1.on("payment.failed", function (response) {
          console.error('Payment failed:', response.error);
          alert(`Payment Failed: ${response.error.description}. Please try again.`);
          setIsProcessing(false);
        });

        rzp1.open();

      } catch (error) {
        console.error('Payment initialization error:', error);
        alert('Failed to initialize payment. Please try again.');
        setIsProcessing(false);
      }
    };

    return (
      <>
        <div className="container py-5">
          <div className="row my-4">
            <div className="col-md-5 col-lg-4 order-md-last">
              <div className="card mb-4 shadow-sm">
                <div className="card-header py-3 bg-light">
                  <h5 className="mb-0">
                    <i className="fas fa-receipt me-2"></i>
                    Order Summary
                  </h5>
                </div>
                <div className="card-body">
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item d-flex justify-content-between align-items-center border-0 px-0 pb-0">
                      <div>
                        <i className="fas fa-boxes me-2"></i>
                        Products ({totalItems})
                      </div>
                      <span>₹{Math.round(subtotal)}</span>
                    </li>
                    
                    {/* Security Deposit Line - Always show if there are rental items */}
                    {rentalItemsCount > 0 && (
                      <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                        <div>
                          <i className="fas fa-shield-alt me-2 text-warning"></i>
                          Security Deposit
                          <small className="d-block text-muted ms-4">(Fully refundable)</small>
                        </div>
                        <span className="text-warning fw-bold">₹{securityDeposit}</span>
                      </li>
                    )}
                    
                    <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                      <div>
                        <i className="fas fa-truck me-2"></i>
                        Shipping
                      </div>
                      <span>₹{shipping}</span>
                    </li>
                    
                    <li className="list-group-item d-flex justify-content-between align-items-center border-0 px-0 mb-3">
                      <div>
                        <strong>
                          <i className="fas fa-wallet me-2"></i>
                          Total Amount
                        </strong>
                      </div>
                      <span>
                        <strong className="fs-5 text-primary">₹{totalAmount}</strong>
                      </span>
                    </li>
                  </ul>
                  
                  {/* Security Deposit Notice */}
                  {securityDeposit > 0 && (
                    <div className="alert alert-warning mt-3">
                      <div className="d-flex">
                        <i className="fas fa-shield-alt me-2 mt-1 fs-5"></i>
                        <div>
                          <strong>Security Deposit Protection</strong>
                          <div className="mt-2">
                            <p className="mb-1">
                              <strong>Amount:</strong> ₹{Math.round(securityDeposit)}
                            </p>
                            <p className="mb-1">
                              <strong>Purpose:</strong> Covers potential damages during rental period
                            </p>
                            <p className="mb-0">
                              <strong>Refund:</strong> Full amount refunded within 3-5 business days after item return
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Display cart items for verification */}
                  <div className="mt-3 p-3 border rounded bg-light">
                    <h6 className="mb-3">
                      <i className="fas fa-shopping-cart me-2"></i>
                      Items in Your Cart:
                    </h6>
                    {state.map((item, index) => {
                      const isRental = item.isRental;
                      let displayText = '';
                      
                      if (isRental) {
                        const rentalCost = item.rental_cost || (item.price_per_day * item.rental_days);
                        const deposit = item.security_deposit || 0;
                        displayText = `${item.rental_days} days rental: ₹${rentalCost}`;
                        if (deposit > 0) {
                          displayText += ` + ₹${deposit} deposit`;
                        }
                      } else {
                        displayText = `Qty: ${item.qty} × ₹${item.price_per_day} = ₹${item.price_per_day * item.qty}`;
                      }
                      
                      return (
                        <div key={index} className="small text-muted mb-2 d-flex justify-content-between">
                          <span className="text-dark fw-medium">{item.name}</span>
                          <span>{displayText}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-md-7 col-lg-8">
              <div className="card mb-4 shadow-sm">
                <div className="card-header py-3">
                  <h4 className="mb-0">
                    <i className="fas fa-address-card me-2"></i>
                    Billing Information
                  </h4>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-sm-6 my-1">
                      <label htmlFor="firstName" className="form-label">
                        <i className="fas fa-user me-1"></i>
                        First Name *
                      </label>
                      <input 
                        type="text" 
                        className={`form-control ${errors.firstName ? 'is-invalid' : ''}`} 
                        id="firstName" 
                        value={formData.firstName} 
                        onChange={handleInputChange} 
                        required 
                        placeholder="Enter your first name"
                      />
                      {errors.firstName && <div className="invalid-feedback d-block">{errors.firstName}</div>}
                    </div>
                    
                    <div className="col-sm-6 my-1">
                      <label htmlFor="lastName" className="form-label">
                        <i className="fas fa-user me-1"></i>
                        Last Name *
                      </label>
                      <input 
                        type="text" 
                        className={`form-control ${errors.lastName ? 'is-invalid' : ''}`} 
                        id="lastName" 
                        value={formData.lastName} 
                        onChange={handleInputChange} 
                        required 
                        placeholder="Enter your last name"
                      />
                      {errors.lastName && <div className="invalid-feedback d-block">{errors.lastName}</div>}
                    </div>
                    
                    <div className="col-12 my-1">
                      <label htmlFor="email" className="form-label">
                        <i className="fas fa-envelope me-1"></i>
                        Email Address *
                      </label>
                      <input 
                        type="email" 
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`} 
                        id="email" 
                        placeholder="you@example.com" 
                        value={formData.email} 
                        onChange={handleInputChange} 
                        required 
                      />
                      {errors.email && <div className="invalid-feedback d-block">{errors.email}</div>}
                    </div>

                    <div className="col-12 my-1">
                      <label htmlFor="phone" className="form-label">
                        <i className="fas fa-phone me-1"></i>
                        Phone Number *
                      </label>
                      <input 
                        type="tel" 
                        className={`form-control ${errors.phone ? 'is-invalid' : ''}`} 
                        id="phone" 
                        placeholder="10-digit mobile number" 
                        value={formData.phone} 
                        onChange={handleInputChange} 
                        required 
                      />
                      {errors.phone && <div className="invalid-feedback d-block">{errors.phone}</div>}
                    </div>
                    
                    <div className="col-12 my-1">
                      <label htmlFor="address" className="form-label">
                        <i className="fas fa-home me-1"></i>
                        Delivery Address *
                      </label>
                      <textarea
                        className={`form-control ${errors.address ? 'is-invalid' : ''}`} 
                        id="address" 
                        rows="3"
                        placeholder="1234 Main Street, City, State, PIN Code" 
                        value={formData.address} 
                        onChange={handleInputChange} 
                        required 
                      />
                      {errors.address && <div className="invalid-feedback d-block">{errors.address}</div>}
                    </div>
                  </div>
                  
                  <hr className="my-4" />
                  
                  <h4 className="mb-3">
                    <i className="fas fa-credit-card me-2"></i>
                    Payment Details
                  </h4>
                  
                  {/* Payment Information with Security Deposit Notice */}
                  <div className="alert alert-info border-0">
                    <div className="d-flex">
                      <i className="fas fa-lock me-3 fs-4 mt-1"></i>
                      <div>
                        <h6 className="alert-heading mb-2">Secure Payment Processing</h6>
                        <div className="payment-breakdown bg-white p-3 rounded mt-2">
                          <h6 className="border-bottom pb-2">Payment Breakdown:</h6>
                          <div className="d-flex justify-content-between mb-2">
                            <span>Rental/Product Cost:</span>
                            <span>₹{Math.round(subtotal)}</span>
                          </div>
                          
                          {/* SECURITY DEPOSIT - Always show if there are rental items */}
                          {rentalItemsCount > 0 && (
                            <div className="d-flex justify-content-between mb-2">
                              <span className="text-warning">
                                <i className="fas fa-shield-alt me-1"></i>
                                Security Deposit:
                              </span>
                              <span className="text-warning">₹{Math.round(securityDeposit)}</span>
                            </div>
                          )}
                          
                          <div className="d-flex justify-content-between mb-2">
                            <span>Shipping Fee:</span>
                            <span>₹{shipping}</span>
                          </div>
                          <hr />
                          <div className="d-flex justify-content-between fw-bold fs-5">
                            <span>Total Amount:</span>
                            <span className="text-primary">₹{totalAmount}</span>
                          </div>
                        </div>
                        
                        {/* Enhanced Security Deposit Information */}
                        {securityDeposit > 0 && (
                          <div className="mt-3 p-3 bg-warning bg-opacity-10 rounded border border-warning">
                            <div className="d-flex">
                              <i className="fas fa-shield-alt me-2 text-warning mt-1"></i>
                              <div>
                                <strong className="text-warning">Security Deposit Protection</strong>
                                <div className="mt-2">
                                  <p className="mb-1">
                                    <strong>Amount:</strong> ₹{Math.round(securityDeposit)}
                                  </p>
                                  <p className="mb-1">
                                    <strong>Coverage:</strong> Protects against damages, loss, or late returns
                                  </p>
                                  <p className="mb-0">
                                    <strong>Refund Policy:</strong> Full amount refunded within 3-5 business days after all rented items are returned in good condition
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-center text-muted mb-4">
                    <i className="fas fa-lock me-1"></i>
                    All transactions are secure and encrypted. Your payment details are safe with us.
                  </p>
                  
                  <hr className="my-4" />
                  
                  <button
                    className="w-100 btn btn-primary btn-lg py-3"
                    type="button"
                    onClick={handlePayment}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-lock me-2"></i>
                        Pay Securely ₹{totalAmount}
                      </>
                    )}
                  </button>
                  
                  <div className="text-center mt-3">
                    <Link to="/cart" className="btn btn-outline-secondary btn-sm">
                      <i className="fas fa-arrow-left me-1"></i>
                      Back to Cart
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      <Navbar />
      <div className="container my-3 py-3">
        <h1 className="text-center">
          <i className="fas fa-check-circle me-3 text-success"></i>
          Checkout
        </h1>
        <p className="text-center text-muted">Complete your rental order securely</p>
        <hr />
        {state.length ? <ShowCheckout /> : <EmptyCart />}
      </div>
      <Footer />
    </>
  );
};

export default Checkout;