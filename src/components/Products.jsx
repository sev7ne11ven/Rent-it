import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { addCart } from "../redux/action";
import { Link } from "react-router-dom";
//used for notifications
import toast from "react-hot-toast";

const Products = () => {
  // State will be populated from the API
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState([]);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();

  // --- FETCH DATA FROM API ---
  useEffect(() => {
    const getProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:8000/items");
        if (response.ok) {
          const products = await response.json();
          setData(products);
          setFilter(products);
        } else {
          console.error("Failed to fetch products from API");
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
      setLoading(false);
    };

    getProducts();
  }, []); // Empty dependency array ensures this runs only once when the component mounts

  const addProduct = (product) => {
    dispatch(addCart(product));
  };

  const filterProduct = (cat) => {
    const updatedList = data.filter((item) => item.category === cat);
    setFilter(updatedList);
  };

  const Loading = () => {
    return (
        <div className="col-12 text-center py-5">
            <h2>Loading...</h2>
        </div>
    );
  };

  const ShowProducts = () => {
    return (
      <>
        <div className="buttons text-center py-5">
          <button
            className="btn btn-outline-dark btn-sm m-2"
            onClick={() => setFilter(data)}
          >
            All
          </button>
          {/* Note: Ensure these category names exactly match the ones in your database */}
          <button
            className="btn btn-outline-dark btn-sm m-2"
            onClick={() => filterProduct("bike")} 
          >
            Bikes
          </button>
          <button
            className="btn btn-outline-dark btn-sm m-2"
            onClick={() => filterProduct("car")}
          >
            Cars
          </button>
          <button
            className="btn btn-outline-dark btn-sm m-2"
            onClick={() => filterProduct("appliance")}
          >
            Appliances
          </button>
        </div>

        {filter.map((product) => {
          return (
            <div
              id={product.id}
              key={product.id}
              className="col-md-4 col-sm-6 col-xs-8 col-12 mb-4"
            >
              <div className="card text-center h-100" key={product.id}>
                <img
                  className="card-img-top p-3"
                  src={product.image}
                  alt={product.name} // Use product name for alt text
                  height={300}
                />
                <div className="card-body">
                  <h5 className="card-title">
                    {/* UPDATED: Use 'name' from API */}
                    {product.name.substring(0, 20)}...
                  </h5>
                  <p className="card-text">
                    {product.description.substring(0, 90)}...
                  </p>
                </div>
                <ul className="list-group list-group-flush">
                  {/* UPDATED: Use 'price_per_day' from API */}
                  <li className="list-group-item lead">₹{product.price_per_day} per/day</li>
                  <li className="list-group-item">
                    Available: {product.quantity} units
                  </li>
                </ul>
                <div className="card-body">
                  <Link
                    to={"/product/" + product.id}
                    className="btn btn-dark m-1"
                  >
                    Rent Now
                  </Link>
                  <button
                    className="btn btn-dark m-1"
                    onClick={() => {
                      toast.success("Added to cart");
                      addProduct(product);
                    }}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </>
    );
  };

  return (
    <>
      <div className="container my-3 py-3">
        <div className="row">
          <div className="col-12">
            <h2 className="display-5 text-center">Latest Products</h2>
            <hr />
          </div>
        </div>
        <div className="row justify-content-center">
          {loading ? <Loading /> : <ShowProducts />}
        </div>
      </div>
    </>
  );
};

export default Products;
