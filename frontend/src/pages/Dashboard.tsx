import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { userReducerInitialState } from "../types/reducerTypes";
import { FaPlus, FaTrashAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

type Category = "users" | "services" | "orders";

const Dashboard = () => {
  const { user } = useSelector(
    (state: { userReducer: userReducerInitialState }) => state.userReducer
  );
  const [data, setData] = useState<Record<Category, any[]>>({
    users: [],
    services: [],
    orders: [],
  });

  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [email, setEmail] = useState(user?.email || "");
  const [pincode, setPincode] = useState(user?.pincode || "");
  const [photo, setPhoto] = useState(user?.photo || "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [activeTab, setActiveTab] = useState<Category>("users");

  const handleDelete = async (id: number, category: Category) => {
    if (category == "users") {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_SERVER}/api/v1/user/delete-user?id=${
            user?._id
          }`,
          {
            targetId: id,
          }
        );
        if (response.data.success) fetchUsers();
        else {
          toast.error(`${response.data.message}`);
        }
      } catch (error) {
        console.log(error);
        toast.error("Some Error in Server");
      }
    }
    if (category == "services") {
      try {
        const response = await axios.put(
          `${import.meta.env.VITE_SERVER}/api/v1/service/${id}?id=${user?._id}`
        );
        if (response.data.success) fetchServices();
        else {
          toast.error(`${response.data.message}`);
        }
      } catch (error) {
        console.log(error);
        toast.error("Some Error in Server");
      }
    }
    if (category == "orders") {
      try {
        const response = await axios.delete(
          `${import.meta.env.VITE_SERVER}/api/v1/order/${id}?id=${user?._id}`
        );
        if (response.data.success)
          setData((prev) => ({
            ...prev,
            orders: prev.orders.filter((order: any) => order.orderId !== id),
          }));
        else {
          toast.error(`${response.data.message}`);
        }
      } catch (error) {
        console.log(error);
        toast.error("Some Error in Server");
      }
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER}/api/v1/user/get-all-users?id=${
          user?._id
        }`
      );
      if (response.data.success) {
        const temp = response.data.users.filter(
          (userFetched: any) => userFetched._id !== user?._id
        );
        setData((prev) => ({ ...prev, users: temp }));
      } else {
        toast.error("Error fetching users");
      }
    } catch (error) {
      console.log("Failed to fetch users");
      toast.error("Server error in fetching users");
    }
  };

  const fetchServices = async () => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_SERVER
        }/api/v1/service/all-distributor-services?id=${user?._id}`
      );
      if (response.data.success) {
        setData((prev) => ({ ...prev, services: response.data.services }));
      } else {
        toast.error(`${response.data.message}`);
      }
    } catch (error) {
      toast.error("Server error in fetching Services");
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_SERVER
        }/api/v1/order/all-distributor-orders?id=${user?._id}`
      );
      if (response.data.success) {
        setData((prev) => ({
          ...prev,
          orders: response.data.distributorOrders,
        }));
      } else {
        if (response.data.message) toast.error(`${response.data.message}`);
      }
    } catch (error) {
      toast.error("Server error in fetching Services");
    }
  };

  const handleRoleChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
    email: string
  ) => {
    const newRole = e.target.value;

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_SERVER}/api/v1/user/change-role?id=${
          user?._id
        }`,
        { email, role: newRole }
      );

      if (response.data.success) {
        toast.success("Role updated successfully!");
        fetchUsers();
      } else {
        toast.error(`${response.data.message}`);
      }
    } catch (error) {
      console.log(error);
      toast.error("Server error in updating role");
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER}/api/v1/order/change-order-status?id=${
          user?._id
        }`,
        {
          orderId,
          status: newStatus,
        }
      );
      if (response.data.success) {
        fetchOrders();
        toast.success("Order status updated successfully");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error updating order status");
    }
  };

  const renderCards = (category: Category) => {
    const allowedKeys: Record<Category, string[]> = {
      users: [
        "name",
        "email",
        "phoneNumber",
        "role",
        "pincode",
        "createdAt",
        "updatedAt",
      ],
      services: ["name", "createdAt", "updatedAt"],
      orders: [
        "state",
        "status",
        "address",
        "city",
        "pincode",
        "services",
        "user",
        "orderDate",
      ],
    };

    if (!data[category] || data[category].length === 0) {
      return (
        <div className="no-data-message">
          {`No ${
            category.charAt(0).toUpperCase() + category.slice(1)
          } added yet`}
        </div>
      );
    }

    const sortedData =
      category === "orders"
        ? [...data[category]].sort((a, b) => {
            if (a.status === "processing" && b.status === "processed")
              return -1;
            if (a.status === "processed" && b.status === "processing") return 1;
            return 0;
          })
        : data[category];

    return sortedData.map((item) => (
      <div key={item.orderId || item._id} className="dashboard-card">
        {(category === "users" && item.photo) ||
        (category === "orders" && item.user?.photo) ||
        (category === "services" && item.photo) ? (
          <div className="dashboard-card-image">
            <img
              src={
                category === "users"
                  ? item.photo
                  : category === "orders"
                  ? item.user.photo
                  : item.photo
              }
              alt={
                category === "users"
                  ? item.name
                  : category === "orders"
                  ? item.user.name
                  : item.name
              }
              style={{ width: "3rem" }}
            />
          </div>
        ) : null}

        {Object.entries(item).map(([key, value]: [string, any]) => {
          if (allowedKeys[category].includes(key)) {
            return (
              <div key={key}>
                <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong>{" "}
                {key === "createdAt" ||
                key === "updatedAt" ||
                key === "orderDate" ? (
                  new Date(value).toLocaleString()
                ) : key === "role" && category === "users" ? (
                  <select
                    value={value}
                    onChange={(e) => handleRoleChange(e, item.email)}
                  >
                    <option value="user">User</option>
                    <option value="distributor">Distributor</option>
                    <option value="admin">Admin</option>
                  </select>
                ) : key === "status" && category === "orders" ? (
                  value === "processed" ? (
                    <span>Processed</span>
                  ) : (
                    <select
                      value={value}
                      onChange={(e) =>
                        handleStatusChange(item.orderId, e.target.value)
                      }
                    >
                      <option value="pending">Pending</option>
                      <option value="processed">Processed</option>
                    </select>
                  )
                ) : key === "user" && category === "orders" ? (
                  <>
                    <div>
                      <strong>User Name:</strong> {value.name}
                    </div>
                    <div>
                      <strong>Phone Number:</strong> {value.phoneNumber}
                    </div>
                  </>
                ) : key === "services" && category === "orders" ? (
                  value.join(", ")
                ) : (
                  value
                )}
              </div>
            );
          }
          return null;
        })}

        {/* Delete Icon */}
        <FaTrashAlt
          className="dashboard-card-delete-icon"
          onClick={() => handleDelete(item.orderId || item._id, category)}
        />
      </div>
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let photoBase64 = photo;
    if (photoFile) {
      setLoading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        photoBase64 = reader.result as string;

        try {
          const response = await axios.put(
            `${
              import.meta.env.VITE_SERVER
            }/api/v1/user/update-user-profile?id=${user?._id}`,
            { name, email, phoneNumber, pincode, photo: photoBase64 }
          );

          if (response.data.success) {
            toast.success("User details updated successfully!");
            localStorage.setItem("user", JSON.stringify(response.data.user));
          } else {
            toast.error("Failed to update user details.");
          }
          setLoading(false);
        } catch (error) {
          setLoading(false);
          toast.error("Photo size is too large to upload");
        }
      };
      reader.readAsDataURL(photoFile);
    } else {
      setLoading(true);
      try {
        const response = await axios.put(
          `${import.meta.env.VITE_SERVER}/api/v1/user/update-user-profile?id=${
            user?._id
          }`,
          { name, email, phoneNumber, pincode, photo: photoBase64 }
        );

        if (response.data.success) {
          toast.success("User details updated successfully!");
        } else {
          toast.error("Failed to update user details.");
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        toast.error("Error updating user details.");
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

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "services") {
      fetchServices();
    } else if (activeTab === "orders") {
      fetchOrders();
    }
  }, [activeTab]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-left">
        <h2 className="dashboard-title">Update User Details</h2>
        <form onSubmit={handleSubmit} className="dashboard-form">
          <div className="dashboard-form-group">
            <label htmlFor="photo">Photo:</label>
            <div
              className="dashboard-photo-container"
              onClick={handlePhotoClick}
            >
              <input
                type="file"
                id="photo"
                ref={fileInputRef}
                className="dashboard-file-input"
                onChange={handleFileChange}
                accept="image/*"
              />
              <img src={photo} alt="User" className="dashboard-photo" />
            </div>
          </div>

          <div className="dashboard-form-group">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="dashboard-input"
            />
          </div>

          <div className="dashboard-form-group">
            <label htmlFor="phoneNumber">Phone Number:</label>
            <input
              type="tel"
              id="phoneNumber"
              value={phoneNumber}
              maxLength={10}
              minLength={10}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              className="dashboard-input"
            />
          </div>

          <div className="dashboard-form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="dashboard-input"
            />
          </div>

          <div className="dashboard-form-group">
            <label htmlFor="pincode">Pincode:</label>
            <input
              type="text"
              id="pincode"
              value={pincode}
              maxLength={6}
              minLength={6}
              onChange={(e) => setPincode(e.target.value)}
              required
              className="dashboard-input"
            />
          </div>

          <button
            type="submit"
            className="dashboard-submit-button"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </form>
      </div>
      <div className="dashboard-right">
        <div className="dashboard-tabs">
          <button
            className={`dashboard-tab ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            Users
          </button>
          <button
            className={`dashboard-tab ${
              activeTab === "services" ? "active" : ""
            }`}
            onClick={() => setActiveTab("services")}
          >
            Services
          </button>
          <button
            className={`dashboard-tab ${
              activeTab === "orders" ? "active" : ""
            }`}
            onClick={() => setActiveTab("orders")}
          >
            Orders
          </button>
          <FaPlus
            className="dashboard-add-icon"
            onClick={() => navigate(`/add-service`)}
          />
        </div>
        <div className="dashboard-cards-container">
          {renderCards(activeTab)}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
