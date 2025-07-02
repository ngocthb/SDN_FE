import { useEffect, useState } from "react";
import AdminNavbar from "../../components/admin/AdminNavbar";
import Sidebar from "../../components/Sidebar";
import { IoAddCircleOutline, IoTrashOutline, IoPencilOutline } from "react-icons/io5";
import AdminMembershipForm from "../../components/admin/AdminMembershipForm";
import api from "../../config/axios";

function AdminMembershipPage() {
  const [memberships, setMemberships] = useState([]);
  const [selectedMembership, setSelectedMembership] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchMemberships = async () => {
    try {
      const response = await api.get("membership/all");
      if (response.data.status === "OK") {
        setMemberships(response.data.data);
      } else {
        console.error("Failed to fetch memberships:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching memberships:", error);
    }
  };

  useEffect(() => {
    fetchMemberships();
  }, []);

  const handleEdit = (membership) => {
    setSelectedMembership(membership);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this membership?")) {
      try {
        await api.delete(`/membership/delete/${id}`);
        fetchMemberships();
      } catch (error) {
        console.error("Error deleting membership:", error);
      }
    }
  };

  const handleAddNew = () => {
    setSelectedMembership(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    fetchMemberships();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AdminNavbar />
      <div className="flex flex-1">
        <Sidebar className="h-full" />
        <div className="flex-1 bg-gradient-to-br from-dark-900 via-purple-900/20 to-pink-900/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-white">Membership Management</h1>
              <button
                onClick={handleAddNew}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:scale-105 transition-all duration-300"
              >
                <IoAddCircleOutline />
                Add New
              </button>
            </div>

            <div className="glass-card p-6 rounded-xl">
              <table className="w-full text-white">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-2">Name</th>
                    <th className="text-left py-2">Price</th>
                    <th className="text-left py-2">Duration</th>
                    <th className="text-left py-2">Tier</th>
                    <th className="text-left py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(memberships) && memberships.length > 0 ? (
                    memberships.map((membership) => (
                      <tr key={membership._id} className="border-b border-white/10">
                        <td className="py-2">{membership.name}</td>
                        <td className="py-2">${membership.price}</td>
                        <td className="py-2">{membership.duration} days</td>
                        <td className="py-2 capitalize">{membership.tier}</td>
                        <td className="py-2 flex gap-4">
                          <button
                            onClick={() => handleEdit(membership)}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <IoPencilOutline />
                          </button>
                          <button
                            onClick={() => handleDelete(membership._id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <IoTrashOutline />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-white/70">
                        No memberships found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {isFormOpen && (
            <AdminMembershipForm
              membership={selectedMembership}
              onClose={handleCloseForm}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminMembershipPage;