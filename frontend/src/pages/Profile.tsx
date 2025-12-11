import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { userReducerInitialState } from "../types/reducerTypes";
import { OrderType } from "../types/types";

const Profile = () => {
  const { user } = useSelector(
    (state: { userReducer: userReducerInitialState }) => state.userReducer
  );

  const [name, setName] = useState(user?.name || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [email, setEmail] = useState(user?.email || "");
  const [pincode, setPincode] = useState(user?.pincode || "");
  const [photo, setPhoto] = useState(user?.photo || "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [processingOrders, setProcessingOrders] = useState([]);
  const [processedOrders, setProcessedOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let photoBase64 = photo;
    if (photoFile) {
      setLoading(true)
      const reader = new FileReader();
      reader.onloadend = async () => {
        photoBase64 = reader.result as string;

        try {
          const response = await axios.put(
            `${
              import.meta.env.VITE_SERVER
            }/api/v1/user/update-user-profile?id=${user?._id}`,
            {
              name,
              email,
              phoneNumber,
              pincode,
              photo: photoBase64,
            }
          );

          if (response.data.success) {
            toast.success("User details updated successfully!");
            const updatedUserResponse = await axios.get(
              `${import.meta.env.VITE_SERVER}/api/v1/user/${user?._id}`
            );

            if (updatedUserResponse.data.success) {
              localStorage.removeItem("user");
              localStorage.setItem(
                "user",
                JSON.stringify(updatedUserResponse.data.user)
              );
            }
          } else {
            toast.error("Failed to update user details.");
          }
          setLoading(false)
        } catch (error) {
          setLoading(false)
          console.log("Error updating user details:", error);
          toast.error("Photo chosen is too large");
        }
      };
      reader.readAsDataURL(photoFile);
    } else {
      setLoading(true)
      try {
        const response = await axios.put(
          `${import.meta.env.VITE_SERVER}/api/v1/user/update-user-profile?id=${
            user?._id
          }`,
          {
            name,
            email,
            phoneNumber,
            pincode,
            photo: photoBase64,
          }
        );

        if (response.data.success) {
          toast.success("User details updated successfully!");
          localStorage.removeItem("user");
          const updatedUserResponse = await axios.get(
            `${import.meta.env.VITE_SERVER}/api/v1/user/${user?._id}`
          );

          if (updatedUserResponse.data.success) {
            localStorage.setItem(
              "user",
              JSON.stringify(updatedUserResponse.data.data)
            );
          }
        } else {
          toast.error("Failed to update user details.");
        }
        setLoading(false)
      } catch (error) {
        setLoading(false)
        console.error("Error updating user details:", error);
        toast.error("An error occurred while updating the details.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhoto(URL.createObjectURL(file));
    }
  };

  const handlePhotoClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const userOrders = async () => {
    try {
      console.log("hi");
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER}/api/v1/order/all-user-orders?id=${
          user?._id
        }`
      );

      if (response.data.success) {
        const processing = response.data.orders.filter(
          (order: OrderType) => order.status === "processing"
        );
        const processed = response.data.orders.filter(
          (order: OrderType) => order.status === "processed"
        );
        setProcessingOrders(processing);
        setProcessedOrders(processed);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    userOrders();
  }, []);

  return (
    <div className="profile-container">
      <div className="profile-left">
        <h2>Update User Details</h2>
        <form onSubmit={handleSubmit}>
          <div className="profile-form-group">
            <label htmlFor="photo">Photo:</label>
            <div className="profile-photo-container" onClick={handlePhotoClick}>
              <input
                type="file"
                id="photo"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
              />
              <img src={photo} alt="User Photo" className="profile-photo" />
            </div>
          </div>

          <div className="profile-form-group">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="profile-form-group">
            <label htmlFor="phoneNumber">Phone Number:</label>
            <input
              type="tel"
              id="phoneNumber"
              value={phoneNumber}
              maxLength={10}
              minLength={10}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>

          <div className="profile-form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="profile-form-group">
            <label htmlFor="pincode">Pincode:</label>
            <input
              type="text"
              id="pincode"
              value={pincode}
              maxLength={6}
              minLength={6}
              onChange={(e) => setPincode(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="profile-submit-button" disabled={loading}>
            {loading ? "Updating..." : "Update"}
          </button>
        </form>
      </div>

      <div className="profile-right">
        <div className="profile-orders">
          {/* Processing Orders */}
          <div className="profile-orders-section">
            <h3>Processing Orders</h3>
            {processingOrders.length > 0 ? (
              <div className="profile-orders-list">
                {processingOrders.map((order: OrderType, index) => (
                  <div
                    key={`${order.orderDate}-${index}`}
                    className="profile-order-item"
                  >
                    <span>Status:</span>
                    <p style={{ color: "green" }}>{order.status}</p>
                    <div className="profile-services-list">
                      {order.services.map((service, idx) => (
                        <div
                          key={`${service.name}-${idx}`}
                          className="profile-service-item"
                        >
                          <img
                            src={service.photo}
                            alt={service.name}
                            className="profile-service-photo"
                          />
                          <p>{service.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>Currently no orders are processing.</p>
            )}
          </div>

          {/* Processed Orders */}
          <div className="profile-orders-section">
            <h3>Processed Orders</h3>
            {processedOrders.length > 0 ? (
              <div className="profile-orders-list">
                {processedOrders.map((order: OrderType, index) => {
                  const [date] = order.orderDate!.split("T");
                  const [year, month, day] = date.split("-");
                  const formattedDate = `${day}/${month}/${year}`;

                  return (
                    <div
                      key={`${order.orderDate}-${index}`}
                      className="profile-order-item"
                    >
                      <p>Order Date: {formattedDate}</p>
                      <div className="profile-services-list">
                        {order.services.map((service, idx) => (
                          <div
                            key={`${service.name}-${idx}`}
                            className="profile-service-item"
                          >
                            <img
                              src={service.photo}
                              alt={service.name}
                              className="profile-service-photo"
                            />
                            <p>{service.name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p>You don't have any processed orders yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
