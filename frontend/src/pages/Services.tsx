import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { addService } from "../redux/reducer/orderReducer";
import { userReducerInitialState } from "../types/reducerTypes";
import { Service } from "../types/types";

const Services = () => {
  const { user } = useSelector(
    (state: { userReducer: userReducerInitialState }) => state.userReducer
  );
  const [search, setSearch] = useState("");
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [page, setPage] = useState(1);
  const [servicesList, setServicesList] = useState<Service[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const isNextPage = page < totalPages;
  const isPrevPage = page > 1;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getServices = async () => {
    try {
      const response = await axios.post(
        `${
          import.meta.env.VITE_SERVER
        }/api/v1/service/all-user-distributor-services?page=${page}`,
        {
          pincode: user?.pincode,
        }
      );
      if (response.data.success) {
        setServicesList(response.data.services);
        setPage(response.data.currentPage);
        setTotalPages(response.data.totalPages);
      } else {
        toast.error("Error to Fetch services in your locality");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const searchServices = async (searchTerm: string) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER}/api/v1/service/search?pincode=${
          user?.pincode
        }&search=${searchTerm}`
      );
      if (response.data.success) {
        setServicesList(response.data.services);
      } else {
        toast.error("Error searching for services");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const toggleSelection = (service: Service) => {
    setSelectedServices((prevSelected) =>
      prevSelected.find((s) => s._id === service._id)
        ? prevSelected.filter((s) => s._id !== service._id)
        : [...prevSelected, service]
    );
  };

  const checkoutHandler = () => {
    if (selectedServices.length === 0) {
      toast.error("No services selected!");
      return;
    }

    selectedServices.forEach((service) => dispatch(addService(service)));

    toast.success("Services added to the cart!");
    navigate("/address");
  };
  useEffect(() => {
    if (search) {
      searchServices(search);
    } else {
      getServices();
    }
  }, [page, search]);

  return (
    <div className="wholepage">
      <ToastContainer />
      <div className="searchbar">
        <input
          type="text"
          placeholder="Search for a service"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="bookbutton" onClick={checkoutHandler}>
          Checkout
        </button>
      </div>
      <div className="services">
        {servicesList.length > 0 ? (
          <ul className="services-list">
            {servicesList.map((service) => (
              <li key={service._id} className="service-item">
                <div
                  className={`service ${
                    selectedServices.some((s) => s._id === service._id)
                      ? "selected"
                      : ""
                  }`}
                >
                  <div className="checkbox-container">
                    <input
                      type="checkbox"
                      checked={selectedServices.some(
                        (s) => s._id === service._id
                      )}
                      onChange={() => toggleSelection(service)}
                    />
                  </div>
                  <img
                    src={service.photo}
                    alt={service.name}
                    className="service-img"
                  />
                  <div className="service-content">
                    <h3>{service.name}</h3>
                    <p>{service.description}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p
            className="no-services-message"
            style={{ textAlign: "center", fontSize: "30px" }}
          >
            No available services in your area.
          </p>
        )}
      </div>
      {totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={!isPrevPage}
            onClick={() => setPage((prev) => prev - 1)}
          >
            Prev
          </button>
          <span>
            {page} of {totalPages}
          </span>
          <button
            disabled={!isNextPage}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Services;
