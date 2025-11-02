import React from "react";
import { Footer, Navbar } from "../components";
import { useSelector, useDispatch } from "react-redux";
import { addCart, delCart } from "../redux/action";
import { Link } from "react-router-dom";

const Cart = () => {
  const state = useSelector((state) => state.handleCart);
  const dispatch = useDispatch();

  const EmptyCart = () => {
    return (
      <div className="container">
        <div className="row">
          <div className="col-md-12 py-5 bg-light text-center">
            <h4 className="p-3 display-5">Your Cart is Empty</h4>
            <Link to="/" className="btn btn-outline-dark mx-4">
              <i className="fa fa-arrow-left"></i> Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  };

  const addItem = (product) => {
    dispatch(addCart(product));
  };
  const removeItem = (product) => {
    dispatch(delCart(product));
  };

  const ShowCart = () => {
    let subtotal = 0;
    let securityDeposit = 0;
    let shipping = 30.0;
    let totalItems = 0;
    
    state.map((item) => {
      // Calculate price based on whether it's a rental or regular item
      if (item.isRental) {
        const rentalCost = item.rental_cost || (item.price_per_day * item.rental_days);
        const deposit = item.security_deposit || 0;
        subtotal += rentalCost;
        securityDeposit += deposit;
      } else {
        subtotal += item.price_per_day * item.qty;
      }
      return null;
    });

    state.map((item) => {
      return (totalItems += item.qty || 1);
    });

    const totalAmount = subtotal + securityDeposit + shipping;
    
    return (
      <div className="container py-5">
        <div className="row d-flex justify-content-center my-4">
          <div className="col-md-8">
            <div className="card mb-4">
              <div className="card-header py-3">
                <h5 className="mb-0">
                  <i className="fas fa-shopping-cart me-2"></i>
                  Item List
                </h5>
              </div>
              <div className="card-body">
                {state.map((item) => {
                  const isRental = item.isRental;
                  let itemTotal = 0;
                  let rentalCost = 0;
                  let deposit = 0;

                  if (isRental) {
                    rentalCost = item.rental_cost || (item.price_per_day * item.rental_days);
                    deposit = item.security_deposit || 0;
                    itemTotal = rentalCost + deposit;
                  } else {
                    itemTotal = item.price_per_day * item.qty;
                  }
                  
                  return (
                    <div key={item.id}>
                      <div className="row d-flex align-items-center">
                        {/* Product Image */}
                        <div className="col-lg-2 col-md-3">
                          <div className="bg-image rounded">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="img-fluid rounded"
                              style={{ width: "80px", height: "80px", objectFit: "cover" }}
                            />
                          </div>
                        </div>

                        {/* Product Name and Info */}
                        <div className="col-lg-4 col-md-4">
                          <h6 className="mb-1">
                            <strong>{item.name}</strong>
                            {isRental && (
                              <span className="badge bg-primary ms-2">Rental</span>
                            )}
                          </h6>
                          <p className="text-muted mb-0">
                            {isRental ? (
                              <>
                                <div className="d-flex align-items-center mb-1">
                                  <i className="fas fa-calendar-day text-success me-1"></i>
                                  <span>₹{item.price_per_day} per day</span>
                                </div>
                                <div className="d-flex align-items-center mb-1">
                                  <i className="fas fa-clock text-info me-1"></i>
                                  <small className="text-success">{item.rental_days} day rental</small>
                                </div>
                                {item.security_deposit > 0 && (
                                  <div className="d-flex align-items-center">
                                    <i className="fas fa-shield-alt text-warning me-1"></i>
                                    <small className="text-warning">
                                      Security Deposit: ₹{item.security_deposit}
                                    </small>
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="d-flex align-items-center">
                                <i className="fas fa-tag text-success me-1"></i>
                                <span>₹{item.price_per_day} per day</span>
                              </div>
                            )}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="col-lg-3 col-md-3">
                          {isRental ? (
                            <div className="text-center">
                              <span className="badge bg-info fs-6">{item.rental_days} days</span>
                              <br/>
                              <small className="text-muted">Fixed Rental Period</small>
                              {item.security_deposit > 0 && (
                                <div className="mt-2">
                                  <span className="badge bg-warning text-dark">
                                    <i className="fas fa-shield-alt me-1"></i>
                                    Deposit Included
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="d-flex align-items-center justify-content-center">
                              <button
                                className="btn btn-outline-dark btn-sm px-3"
                                onClick={() => removeItem(item)}
                                title="Decrease quantity"
                              >
                                <i className="fas fa-minus"></i>
                              </button>

                              <span 
                                className="mx-3 fw-bold" 
                                style={{ minWidth: "30px", textAlign: "center" }}
                              >
                                {item.qty}
                              </span>

                              <button
                                className="btn btn-outline-dark btn-sm px-3"
                                onClick={() => addItem(item)}
                                title="Increase quantity"
                              >
                                <i className="fas fa-plus"></i>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Price */}
                        <div className="col-lg-3 col-md-2 text-end">
                          <div className="mb-1">
                            <strong className="fs-5 text-primary">
                              ₹{itemTotal.toFixed(2)}
                            </strong>
                          </div>
                          {isRental && item.security_deposit > 0 && (
                            <div className="small text-muted">
                              <div>Rental: ₹{rentalCost.toFixed(2)}</div>
                              <div>Deposit: ₹{deposit.toFixed(2)}</div>
                            </div>
                          )}
                          {!isRental && (
                            <div className="small text-muted">
                              {item.qty} × ₹{item.price_per_day}
                            </div>
                          )}
                        </div>
                      </div>

                      <hr className="my-4" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card mb-4">
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
                  
                  {/* Security Deposit Line - Only show if there's any deposit */}
                  {securityDeposit > 0 && (
                    <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                      <div>
                        <i className="fas fa-shield-alt me-2 text-warning"></i>
                        Security Deposit
                        <small className="d-block text-muted ms-4">(Fully refundable - covers damages)</small>
                      </div>
                      <span className="text-warning">₹{Math.round(securityDeposit)}</span>
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
                        Total amount
                      </strong>
                    </div>
                    <span>
                      <strong className="fs-5 text-primary">₹{Math.round(totalAmount)}</strong>
                    </span>
                  </li>
                </ul>

                {/* Security Deposit Notice */}
                {securityDeposit > 0 && (
                  <div className="alert alert-warning mt-3">
                    <div className="d-flex">
                      <i className="fas fa-info-circle me-2 mt-1"></i>
                      <div>
                        <strong>Security Deposit Information</strong>
                        <small className="d-block mt-1">
                          Your security deposit of ₹{Math.round(securityDeposit)} will be fully refunded when all rented items are returned in good condition. This amount covers any potential damages during the rental period.
                        </small>
                      </div>
                    </div>
                  </div>
                )}

                <Link
                  to="/checkout"
                  className="btn btn-primary btn-lg w-100 py-3"
                >
                  <i className="fas fa-lock me-2"></i>
                  Proceed to Checkout
                </Link>
                
                <div className="text-center mt-3">
                  <Link to="/" className="btn btn-outline-secondary btn-sm">
                    <i className="fas fa-arrow-left me-1"></i>
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1">
        <div className="container my-3 py-3">
          <h1 className="text-center">
            <i className="fas fa-shopping-cart me-3"></i>
            Shopping Cart
          </h1>
          <hr />
          {state.length > 0 ? <ShowCart /> : <EmptyCart />}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;