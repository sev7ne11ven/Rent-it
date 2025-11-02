import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import '../CSS/Navbar.css'; // Import the CSS file from the correct path
import toast from 'react-hot-toast';
import { jwtDecode } from 'jwt-decode';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
    const state = useSelector(state => state.handleCart);
    const navigate = useNavigate();

    // State to track if the user is logged in
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    
    // State to track the current user data
    const [currentUser, setCurrentUser] = useState(null);
    
    // State to track if the page has been scrolled
    const [scrolled, setScrolled] = useState(false);

    // State to track if user is admin
    const [isAdmin, setIsAdmin] = useState(false);

    // Check for token on component mount and on changes
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
            // Decode the token to get user info
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setCurrentUser({ email: payload.sub });
                
                // Also decode with jwtDecode to get role information
                const decodedToken = jwtDecode(token);
                const userIsAdmin = decodedToken.role === 'admin' || 
                                   decodedToken.email === 'admin@rentit.com';
                setIsAdmin(userIsAdmin);
            } catch (error) {
                console.error('Error decoding token:', error);
            }
        } else {
            setIsLoggedIn(false);
            setCurrentUser(null);
            setIsAdmin(false);
        }
    }, []);

    // Effect to add and remove the scroll event listener
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setCurrentUser(null);
        setIsAdmin(false);
        toast.success("Logged out successfully.");
        // Navigate to home and reload to ensure all states are cleared
        navigate('/');
        window.location.reload();
    };

    // Dynamically add the 'scrolled' class to the navbar
    const navbarClasses = `navbar navbar-expand-lg floating-navbar ${scrolled ? 'scrolled' : ''}`;

    const AuthButtons = () => (
        <div className="buttons text-center">
            {isAdmin && (
                <NavLink to="/admin" className="btn btn-outline-dark m-2">
                    <i className="fa fa-cog mr-1"></i> Admin
                </NavLink>
            )}
            <NavLink to="/dashboard" className="btn btn-outline-dark m-2">
                <i className="fa fa-user-circle mr-1"></i> Dashboard
            </NavLink>
            <button onClick={handleLogout} className="btn btn-outline-dark m-2">
                <i className="fa fa-sign-out-alt mr-1"></i> Logout
            </button>
            <NavLink to="/cart" className="btn btn-outline-dark m-2">
                <i className="fa fa-cart-shopping mr-1"></i> Cart 
                <span className="cart-badge">{state.length}</span>
            </NavLink>
        </div>
    );

    const GuestButtons = () => (
        <div className="buttons text-center">
            <NavLink to="/login" className="btn btn-outline-dark m-2">
                <i className="fa fa-sign-in-alt mr-1"></i> Login
            </NavLink>
            <NavLink to="/register" className="btn btn-outline-dark m-2">
                <i className="fa fa-user-plus mr-1"></i> Register
            </NavLink>
            <NavLink to="/cart" className="btn btn-outline-dark m-2">
                <i className="fa fa-cart-shopping mr-1"></i> Cart 
                <span className="cart-badge">{state.length}</span>
            </NavLink>
        </div>
    );

    return (
        <nav className={navbarClasses}>
            <div className="container-fluid">
                <NavLink className="navbar-brand fw-bold" to="/">Rent-it</NavLink>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent" aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                
                <div className="collapse navbar-collapse" id="navbarContent">
                    <ul className="navbar-nav m-auto mb-2 mb-lg-0 text-center">
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/">Home</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/product">Products</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/about">About</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/contact">Contact</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/reviews">Reviews</NavLink>
                        </li>
                        
                        {/* Only show Add Item link for admin users */}
                        {isAdmin && (
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/add-item">Add Item</NavLink>
                            </li>
                        )}
                    </ul>
                    
                    {isLoggedIn ? <AuthButtons /> : <GuestButtons />}
                    {/* Theme toggle button */}
                    <ThemeToggle />
                </div>
            </div>
        </nav>
    );
}

export default Navbar;