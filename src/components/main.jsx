import React from "react";
import slider from "../assests/images/main.png.jpg"

const Home = () => {
  return (
    <>
      <div className="hero border-1 pb-3 main-content">
        <div className="card bg-dark text-white border-0 mx-3">
          <img
            className="card-img img-fluid"
            src={slider}
            alt="Card"
            height={500}
          />
          <div className="card-img-overlay d-flex align-items-center">
            <div className="container">
              <h5 className="card-title fs-1 text fw-lighter">New Arrivals</h5>
              <p className="card-text fs-5 d-none d-sm-block ">
                Discover our latest products
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;