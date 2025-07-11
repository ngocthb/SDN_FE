import { useState } from "react";
import PropTypes from "prop-types";
import api from "../../../config/axios";
import { toast } from "react-toastify";

function AdminMembershipForm({ membership, onClose }) {
  const [formData, setFormData] = useState(
    membership || {
      name: "",
      price: "",
      duration: "",
      description: "",
    }
  );

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration, 10),
        description: formData.description,
      };

      let response;
      if (membership) {
        response = await api.put(`admin/membership/update/${membership._id}`, payload);
      } else {
        response = await api.post("admin/membership/create", payload);
      }

      toast.success(response.data.message);
      onClose();
    } catch (error) {
      console.error("Error saving membership:", error);
      toast.error(error.response?.data.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="relative w-full max-w-lg glass-card p-6 rounded-xl">
        <h2 className="text-2xl font-bold text-white mb-4">
          {membership ? "Edit Membership" : "Add New Membership"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input-glass w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Price</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="input-glass w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Duration (days)</label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="input-glass w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input-glass w-full"
            ></textarea>
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:scale-105 transition-all duration-300"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

AdminMembershipForm.propTypes = {
  membership: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    price: PropTypes.number,
    duration: PropTypes.number,
    description: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
};

export default AdminMembershipForm;