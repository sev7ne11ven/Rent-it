import React from "react";

const Footer = () => {
  return (
    <footer className="bg-dark text-light mt-auto py-4">
      <div className="container">
        <div className="row">
          <div className="col-12 text-center">
            <p className="mb-0">
              Made with ❤️ by {"Team Rent-it"}
            </p>
            {/* <small className="text-muted">
              © {new Date().getFullYear()} Rent-it. All rights reserved.
            </small> */}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;