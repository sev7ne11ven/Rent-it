import React from "react";
import { Footer, Navbar } from "../components";

const ContactPage = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <div className="container flex-grow-1" style={{ paddingTop: '20px', paddingBottom: '0' }}>
        <h1 className="text-center mb-3">Contact Us</h1>
        <hr className="mb-4" />
        <div className="row">
          <div className="col-md-6 col-lg-6 col-sm-10 mx-auto">
            <form>
              <div className="form-group mb-2">
                <label htmlFor="Name">Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="Name"
                  placeholder="Enter your name"
                />
              </div>
              <div className="form-group mb-2">
                <label htmlFor="Email">Email</label>
                <input
                  type="email"
                  className="form-control"
                  id="Email"
                  placeholder="rentitteam@gmail.com"
                />
              </div>
              <div className="form-group mb-2">
                <label htmlFor="Message">Message</label>
                <textarea
                  rows={3}
                  className="form-control"
                  id="Message"
                  placeholder="Enter your message"
                ></textarea>
              </div>
              <div className="text-center mt-3 mb-4">
                <button
                  className="btn btn-dark px-4"
                  type="submit"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ContactPage;