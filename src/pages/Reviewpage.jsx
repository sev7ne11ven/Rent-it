import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Footer } from "../components"; // Assuming components are in this path
import toast from 'react-hot-toast';

const ReviewsPage = () => {
    // State to hold the list of reviews
    const [reviews, setReviews] = useState([]);
    
    // State for the new review form inputs
    const [newReview, setNewReview] = useState({
        comment: '',
        rating: 5 // Default rating
    });
    
    // State to track login status
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    
    // State for form validation errors
    const [errors, setErrors] = useState({});
    
    // Check login status and fetch reviews on component mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);

        const fetchReviews = async () => {
            try {
                const response = await fetch('http://localhost:8000/reviews');
                const data = await response.json();
                setReviews(data);
            } catch (error) {
                console.error("Failed to fetch reviews:", error);
            }
        };

        fetchReviews();
    }, []);

    // Handle changes in the form inputs
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewReview({ ...newReview, [name]: value });
        if (errors[name]) {
            setErrors({ ...errors, [name]: null });
        }
    };

    // Handle form submission
    const handleAddReview = async (e) => {
        e.preventDefault();

        // Retrieve token for the API call
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error("You must be logged in to submit a review.");
            return;
        }

        // Simple validation
        const newErrors = {};
        if (!newReview.comment.trim()) newErrors.comment = "Comment is required.";
        if (!newReview.rating) newErrors.rating = "Rating is required.";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            // Send the new review to the backend API with the auth token
            const response = await fetch('http://localhost:8000/add_review', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Include the token
                },
                body: JSON.stringify({
                    comment: newReview.comment,
                    rating: parseInt(newReview.rating)
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit review. Please try again.');
            }

            const savedReviewData = await response.json();
            
            // Re-fetch reviews to get the most up-to-date list including the new one
            const reviewsResponse = await fetch('http://localhost:8000/reviews');
            const updatedReviews = await reviewsResponse.json();
            setReviews(updatedReviews);

            toast.success("Review submitted successfully!");

            // Reset the form fields
            setNewReview({ comment: '', rating: 5 });
            setErrors({});

        } catch (error) {
            console.error("Error submitting review:", error);
            toast.error(error.message || "An error occurred.");
        }
    };

    // Component to show when user is not logged in
    const LoginPrompt = () => (
        <div className="text-center p-4 border rounded bg-light">
            <h4>Want to share your thoughts?</h4>
            <p>Please <Link to="/login">log in</Link> to leave a review.</p>
        </div>
    );

    // The form for logged-in users to add a review
    const AddReviewForm = () => (
        <div className="card">
            <div className="card-header">
                <h4 className="mb-0">Leave a Review</h4>
            </div>
            <div className="card-body">
                <form onSubmit={handleAddReview}>
                    <div className="mb-3">
                        <label htmlFor="comment" className="form-label">Comment</label>
                        <textarea 
                            className={`form-control ${errors.comment ? 'is-invalid' : ''}`}
                            id="comment" 
                            name="comment"
                            rows="3"
                            value={newReview.comment}
                            onChange={handleInputChange}
                            placeholder="Tell us about your experience..."
                        ></textarea>
                        {errors.comment && <div className="invalid-feedback">{errors.comment}</div>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="rating" className="form-label">Rating</label>
                        <select 
                            className={`form-select ${errors.rating ? 'is-invalid' : ''}`}
                            id="rating"
                            name="rating"
                            value={newReview.rating}
                            onChange={handleInputChange}
                        >
                            <option value="5">5 - Excellent</option>
                            <option value="4">4 - Very Good</option>
                            <option value="3">3 - Good</option>
                            <option value="2">2 - Fair</option>
                            <option value="1">1 - Poor</option>
                        </select>
                        {errors.rating && <div className="invalid-feedback">{errors.rating}</div>}
                    </div>
                    <button type="submit" className="btn btn-primary">Submit Review</button>
                </form>
            </div>
        </div>
    );

    return (
        <div className="d-flex flex-column min-vh-100">
            <Navbar />
            <div className="container flex-grow-1 my-5">
                
                {/* --- Conditionally render the form or the login prompt --- */}
                <div className="row justify-content-center mb-5">
                    <div className="col-md-8">
                        {isLoggedIn ? <AddReviewForm /> : <LoginPrompt />}
                    </div>
                </div>

                {/* --- Display Reviews --- */}
                <h2 className="text-center mb-4">Customer Reviews</h2>
                <div className="row">
                    {reviews.map((review) => (
                        <div className="col-md-4 mb-4" key={review.id}>
                            <div className="card h-100">
                                <div className="card-body d-flex flex-column">
                                    {/* The name is now the user's email from the backend */}
                                    <h5 className="card-title">{review.name}</h5>
                                    <p className="card-text flex-grow-1">"{review.comment}"</p>
                                    <p className="card-text mt-auto"><strong>Rating: {review.rating}/5</strong></p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ReviewsPage;
