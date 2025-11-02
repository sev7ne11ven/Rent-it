import React, { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { Link, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addCart } from "../redux/action";
import axios from "axios";
import toast from "react-hot-toast";

const Product = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();

  const addProduct = (product) => {
    dispatch(addCart(product));
    toast.success("Added to cart");
  };

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:8000/items`);
        const foundProduct = response.data.find(item => item.id === id);
        setProduct(foundProduct);
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product');
      }
      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  const Loading = () => (
    <div className="container my-5 py-2">
      <div className="row">
        <div className="col-md-6 py-3">
          <Skeleton height={400} width={400} />
        </div>
        <div className="col-md-6 py-5">
          <Skeleton height={30} width={250} />
          <Skeleton height={90} />
          <Skeleton height={40} width={70} />
          <Skeleton height={50} width={110} />
          <Skeleton height={120} />
          <Skeleton height={40} width={110} inline={true} />
          <Skeleton className="mx-3" height={40} width={110} />
        </div>
      </div>
    </div>
  );

  const ShowProduct = () => (
    <div className="container my-5 py-2">
      <div className="row">
        <div className="col-md-6 col-sm-12 py-3">
          <img
            className="img-fluid"
            src={product.image}
            alt={product.name}
            width="400px"
            height="400px"
          />
        </div>
        <div className="col-md-6 py-5">
          <h4 className="text-uppercase text-muted">{product.category}</h4>
          <h1 className="display-5">{product.name}</h1>
          <p className="lead">
            {product.rating && product.rating.rate}
          </p>
          <h3 className="display-6 my-4">₹ {product.price_per_day} per/day</h3>
          <h4 className="display-6 my-2">Available: {product.quantity} units</h4>
          <p className="lead">{product.description}</p>
          <button
            className="btn btn-outline-dark"
            onClick={() => addProduct(product)}
          >
            Add to Cart
          </button>
          <Link to="/cart" className="btn btn-dark mx-3">
            Go to Cart
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="container">
        <div className="row">{loading ? <Loading /> : product && <ShowProduct />}</div>
      </div>
    </>
  );
};

export default Product;