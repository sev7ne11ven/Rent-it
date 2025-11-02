import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Footer } from '../components';
import axios from 'axios';
import toast from 'react-hot-toast';
import { jwtDecode } from 'jwt-decode';

const DashboardPage = () => {
    const [userItems, setUserItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userEmail, setUserEmail] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
            try {
                const decodedToken = jwtDecode(token);
                const email = decodedToken.sub; // 'sub' is the standard claim for subject (user's email)
                setUserEmail(email);

                const fetchUserItems = async () => {
                    setLoading(true);
                    try {
                        const response = await axios.get('http://localhost:8000/items');
                        // Filter items to show only those owned by the current user
                        const filteredItems = response.data.filter(item => item.owner_id === email);
                        setUserItems(filteredItems);
                    } catch (error) {
                        console.error("Failed to fetch items:", error);
                        toast.error("Could not load your items.");
                    }
                    setLoading(false);
                };

                fetchUserItems();
            } catch (error) {
                console.error("Invalid token:", error);
                toast.error("Your session is invalid. Please log in again.");
                setIsLoggedIn(false);
                setLoading(false);
            }
        } else {
            setIsLoggedIn(false);
            setLoading(false);
        }
    }, []);

    const handleDelete = async (itemId) => {
        if (!window.confirm("Are you sure you want to delete this item? This action cannot be undone.")) {
            return;
        }

        const token = localStorage.getItem('token');
        try {
            await axios.delete(`http://localhost:8000/items/${itemId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            toast.success("Item deleted successfully!");
            // Update the UI by removing the deleted item from the state
            setUserItems(userItems.filter(item => item.id !== itemId));
        } catch (error) {
            console.error("Failed to delete item:", error);
            toast.error("Failed to delete item. Please try again.");
        }
    };

    const Loading = () => (
        <div className="text-center my-5">
            <h2>Loading Dashboard...</h2>
        </div>
    );

    const NotLoggedIn = () => (
        <div className="container my-5 py-5">
            <div className="row">
                <div className="col-md-12 text-center">
                    <h2 className="display-5">Access Denied</h2>
                    <p className="lead mb-4">You must be logged in to view your dashboard.</p>
                    <Link to="/login" className="btn btn-primary">
                        Go to Login
                    </Link>
                </div>
            </div>
        </div>
    );

    const ShowDashboard = () => (
        <div className="container my-3 py-3">
            <h1 className="text-center">My Dashboard</h1>
            <p className="text-center text-muted">Manage your listed items, {userEmail}</p>
            <hr />
            {userItems.length > 0 ? (
                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead>
                            <tr>
                                <th scope="col">Image</th>
                                <th scope="col">Name</th>
                                <th scope="col">Price/Day</th>
                                <th scope="col">Quantity</th>
                                <th scope="col">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userItems.map(item => (
                                <tr key={item.id}>
                                    <td>
                                        <img src={item.image || 'https://placehold.co/60x60/EEE/31343C?text=No+Image'} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                                    </td>
                                    <td>{item.name}</td>
                                    <td>₹{item.price_per_day}</td>
                                    <td>{item.quantity}</td>
                                    <td>
                                        <button onClick={() => handleDelete(item.id)} className="btn btn-danger btn-sm">
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center my-5">
                    <h4>You haven't listed any items yet.</h4>
                    <Link to="/add-item" className="btn btn-success mt-3">
                        List Your First Item
                    </Link>
                </div>
            )}
        </div>
    );

    return (
        <div className="d-flex flex-column min-vh-100">
            <Navbar />
            <div className="flex-grow-1">
                {loading ? <Loading /> : (isLoggedIn ? <ShowDashboard /> : <NotLoggedIn />)}
            </div>
            <Footer />
        </div>
    );
};

export default DashboardPage;
