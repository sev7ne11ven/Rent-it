import React, { useState, useEffect } from 'react';
import { Navbar, Footer } from "../components";
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminPage = () => {
    const [rentals, setRentals] = useState([]);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('rentals');
    const [quantityUpdates, setQuantityUpdates] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const [rentalsRes, itemsRes] = await Promise.all([
                    axios.get('http://localhost:8000/admin/rentals', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    axios.get('http://localhost:8000/admin/items', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ]);
                setRentals(rentalsRes.data);
                setItems(itemsRes.data);
            } catch (error) {
                console.error('Admin data fetch failed:', error);
                toast.error('Access denied or failed to load admin data');
            }
            setLoading(false);
        };

        fetchData();
    }, []);

    const handleQuantityUpdate = async (itemId, newQuantity) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:8000/admin/update_quantity?item_id=${itemId}&new_quantity=${newQuantity}`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            toast.success('Quantity updated successfully');
            // Refresh items
            const itemsRes = await axios.get('http://localhost:8000/admin/items', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setItems(itemsRes.data);
        } catch (error) {
            toast.error('Failed to update quantity');
        }
    };

    if (loading) {
        return (
            <div className="d-flex flex-column min-vh-100">
                <Navbar />
                <div className="container flex-grow-1 text-center my-5">
                    <h2>Loading admin dashboard...</h2>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="d-flex flex-column min-vh-100">
            <Navbar />
            <div className="container flex-grow-1 my-5">
                <h1 className="text-center mb-4">Admin Dashboard</h1>
                
                <ul className="nav nav-tabs mb-4">
                    <li className="nav-item">
                        <button 
                            className={`nav-link ${activeTab === 'rentals' ? 'active' : ''}`}
                            onClick={() => setActiveTab('rentals')}
                        >
                            All Rentals ({rentals.length})
                        </button>
                    </li>
                    <li className="nav-item">
                        <button 
                            className={`nav-link ${activeTab === 'items' ? 'active' : ''}`}
                            onClick={() => setActiveTab('items')}
                        >
                            Manage Items ({items.length})
                        </button>
                    </li>
                </ul>

                {activeTab === 'rentals' && (
                    <div className="table-responsive">
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>Rental ID</th>
                                    <th>Item</th>
                                    <th>Customer</th>
                                    <th>Days</th>
                                    <th>Total Cost</th>
                                    <th>Rental Date</th>
                                    <th>Return Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rentals.map(rental => (
                                    <tr key={rental.id}>
                                        <td>{rental.id.slice(-8)}</td>
                                        <td>{rental.item_name}</td>
                                        <td>{rental.user_email}</td>
                                        <td>{rental.rental_days}</td>
                                        <td>₹{rental.total_cost}</td>
                                        <td>{new Date(rental.rental_date).toLocaleDateString()}</td>
                                        <td>{new Date(rental.return_date).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`badge ${rental.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                                                {rental.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'items' && (
                    <div className="table-responsive">
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>Item Name</th>
                                    <th>Category</th>
                                    <th>Price/Day</th>
                                    <th>Available</th>
                                    <th>Rented Count</th>
                                    <th>Owner</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map(item => (
                                    <tr key={item.id}>
                                        <td>{item.name}</td>
                                        <td>
                                            <span className="badge bg-info text-dark">{item.category}</span>
                                        </td>
                                        <td>₹{item.price_per_day}</td>
                                        <td>
                                            <input
                                                type="number"
                                                className="form-control form-control-sm"
                                                style={{width: '80px'}}
                                                defaultValue={item.quantity}
                                                onChange={(e) => setQuantityUpdates({
                                                    ...quantityUpdates,
                                                    [item.id]: parseInt(e.target.value)
                                                })}
                                            />
                                        </td>
                                        <td>{item.rented_count}</td>
                                        <td>{item.owner_id}</td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-primary"
                                                onClick={() => handleQuantityUpdate(item.id, quantityUpdates[item.id] || item.quantity)}
                                            >
                                                Update
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default AdminPage;