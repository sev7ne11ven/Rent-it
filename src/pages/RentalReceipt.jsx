import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar, Footer } from "../components";
import axios from 'axios';
import toast from 'react-hot-toast';

const RentalReceipt = () => {
    const { rentalId } = useParams();
    const [receipt, setReceipt] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReceipt = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:8000/rental_receipt/${rentalId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setReceipt(response.data);
            } catch (error) {
                console.error('Failed to fetch receipt:', error);
                toast.error('Failed to load rental receipt');
            }
            setLoading(false);
        };

        fetchReceipt();
    }, [rentalId]);

    const printReceipt = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="d-flex flex-column min-vh-100">
                <Navbar />
                <div className="container flex-grow-1 text-center my-5">
                    <h2>Loading receipt...</h2>
                </div>
                <Footer />
            </div>
        );
    }

    if (!receipt) {
        return (
            <div className="d-flex flex-column min-vh-100">
                <Navbar />
                <div className="container flex-grow-1 text-center my-5">
                    <h2>Receipt not found</h2>
                    <Link to="/" className="btn btn-primary">Go Home</Link>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="d-flex flex-column min-vh-100">
            <Navbar />
            <div className="container flex-grow-1 my-5">
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="card shadow-lg">
                            <div className="card-header bg-primary text-white">
                                <h2 className="text-center mb-0">Rent-It Rental Receipt</h2>
                            </div>
                            <div className="card-body">
                                <div className="row mb-4">
                                    <div className="col-6">
                                        <h5>Rental Details</h5>
                                        <p><strong>Rental ID:</strong> {receipt.id}</p>
                                        <p><strong>Item:</strong> {receipt.item_name}</p>
                                        <p><strong>Rental Days:</strong> {receipt.rental_days}</p>
                                    </div>
                                    <div className="col-6 text-end">
                                        <h5>Customer Information</h5>
                                        <p><strong>Email:</strong> {receipt.user_email}</p>
                                        <p><strong>Rental Date:</strong> {new Date(receipt.rental_date).toLocaleDateString()}</p>
                                        <p><strong>Return Date:</strong> {new Date(receipt.return_date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                
                                <div className="border-top pt-3">
                                    <h5>Payment Summary</h5>
                                    <div className="row">
                                        <div className="col-6">
                                            <p>Daily Rate:</p>
                                            <p>Rental Period:</p>
                                            <p className="fw-bold fs-5">Total Amount:</p>
                                        </div>
                                        <div className="col-6 text-end">
                                            <p>₹{receipt.total_cost / receipt.rental_days}/day</p>
                                            <p>{receipt.rental_days} days</p>
                                            <p className="fw-bold fs-5">₹{receipt.total_cost}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-top mt-4 pt-3">
                                    <h6>Terms & Conditions</h6>
                                    <small className="text-muted">
                                        • Please return the item by the specified return date<br/>
                                        • Late returns will incur additional charges<br/>
                                        • Items must be returned in the same condition<br/>
                                        • Security deposit may apply for high-value items
                                    </small>
                                </div>
                            </div>
                            <div className="card-footer text-center">
                                <button onClick={printReceipt} className="btn btn-primary me-2">
                                    Print Receipt
                                </button>
                                <Link to="/" className="btn btn-secondary">
                                    Back to Home
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default RentalReceipt;