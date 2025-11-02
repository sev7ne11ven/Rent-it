import React from 'react'
import { Footer, Navbar } from "../components";

const AboutPage = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <div className="container my-3 py-3 flex-grow-1">
        <h1 className="text-center">About Us</h1>
        <hr />
        <p className="lead text-center">
          Hello There welcome to the club
        </p>

        <h2 className="text-center py-4">Our Products</h2>
        <div className="row justify-content-center">
          <div className="col-md-3 col-sm-6 mb-3 px-3">
            <div className="card h-100 shadow-sm">
              <div className="card-body text-center">
                <i className="fas fa-car fa-3x mb-3 text-primary"></i>
                <h5 className="card-title">Cars</h5>
                <p className="card-text">Luxury and economy vehicles for all your travel needs</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6 mb-3 px-3">
            <div className="card h-100 shadow-sm">
              <div className="card-body text-center">
                <i className="fas fa-motorcycle fa-3x mb-3 text-success"></i>
                <h5 className="card-title">Bikes</h5>
                <p className="card-text">Mountain, road, and city bikes for every adventure</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6 mb-3 px-3">
            <div className="card h-100 shadow-sm">
              <div className="card-body text-center">
                <i className="fas fa-laptop fa-3x mb-3 text-info"></i>
                <h5 className="card-title">Electronics</h5>
                <p className="card-text">Latest gadgets and tech equipment for your needs</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Additional content to demonstrate the footer positioning */}
        <div className="row mt-5">
          <div className="col-12">
            <h3 className="text-center">Why Choose Us?</h3>
            <p className="text-center">
              We offer quality products at affordable prices with excellent customer service.
              Our team is dedicated to providing the best rental experience for all your needs.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default AboutPage;