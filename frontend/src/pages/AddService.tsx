import axios from 'axios';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { userReducerInitialState } from '../types/reducerTypes';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AddService = () => {

  const { user } = useSelector(
    (state: { userReducer: userReducerInitialState }) => state.userReducer
  );

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    photo: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate()

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          photo: reader.result as string, 
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER}/api/v1/service/new?id=${user?._id}`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        toast.success('Service created successfully!');
      } else {
        toast.error(response.data.message);
      }
      navigate("/dashboard")
    } catch (error) {
      toast.error('Failed to create service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="addservice-container">
      <h2 className="addservice-title">Add New Service</h2>
      <form className="addservice-form" onSubmit={handleSubmit}>
        <div className="addservice-form-group">
          <label htmlFor="name" className="addservice-label">Service Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="addservice-input"
            placeholder="Enter service name"
            required
          />
        </div>
        <div className="addservice-form-group">
          <label htmlFor="description" className="addservice-label">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="addservice-textarea"
            placeholder="Enter description"
            required
          />
        </div>
        <div className="addservice-form-group">
          <label htmlFor="photo" className="addservice-label">Photo</label>
          <input
            type="file"
            id="photo"
            name="photo"
            accept="image/*"
            onChange={handleFileChange}
            className="addservice-file-input"
          />
        </div>
        <button
          type="submit"
          className="addservice-submit-button"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

export default AddService;
