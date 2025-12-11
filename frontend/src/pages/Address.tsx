import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearOrders } from "../redux/reducer/orderReducer";
import axios from "axios";
import {
  orderReducerInitialState,
  userReducerInitialState,
} from "../types/reducerTypes";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Address = () => {
  const { user } = useSelector(
    (state: { userReducer: userReducerInitialState }) => state.userReducer
  );
  const { orders } = useSelector(
    (state: { orderReducer: orderReducerInitialState }) => state.orderReducer
  );
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const orderIds = orders.map((order) => order._id);
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER}/api/v1/order/new/${user?._id}`,
        {
          serviceIds: orderIds,
          address,
          city,
          state,
          pincode: user?.pincode,
        }
      );
      if (response.data.success) {
        toast.success("Your Order has been placed");
        navigate("/")
      }
    } catch (error) {
      console.log(error);
    }

    dispatch(clearOrders());
  };

  return (
    <div className="address-container">
      <h2 className="address-heading">Enter Address</h2>
      <form onSubmit={handleSubmit} className="address-form">
        <div className="address-input-group">
          <label htmlFor="state" className="address-label">
            State:
          </label>
          <input
            type="text"
            id="state"
            value={state}
            onChange={(e) => setState(e.target.value)}
            required
            placeholder="Enter your State"
            className="address-input"
          />
        </div>

        <div className="address-input-group">
          <label htmlFor="city" className="address-label">
            City:
          </label>
          <input
            type="text"
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            placeholder="Enter your City"
            className="address-input"
          />
        </div>

        <div className="address-input-group">
          <label htmlFor="address" className="address-label">
            Address:
          </label>
          <textarea
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            placeholder="Enter your address"
            rows={4}
            className="address-textarea"
          ></textarea>
        </div>

        <button type="submit" className="address-submit-btn">
          Submit
        </button>
      </form>
    </div>
  );
};

export default Address;
