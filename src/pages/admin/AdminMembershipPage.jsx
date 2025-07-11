import { useEffect, useState } from "react";
import AdminNavbar from "../../components/admin/AdminNavbar";
import Sidebar from "../../components/Sidebar";
import { IoAddCircleOutline, IoTrashOutline, IoPencilOutline } from "react-icons/io5";
import AdminAddMembershipForm from "../../components/admin/AdminAddMembershipForm";
import AdminEditMembershipForm from "../../components/admin/AdminEditMembershipForm";
import api from "../../config/axios";
import { toast } from 'react-toastify';

function AdminMembershipPage() {
  const [memberships, setMemberships] = useState([]);
  const [selectedMembership, setSelectedMembership] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [membershipToDelete, setMembershipToDelete] = useState(null);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [membershipToRestore, setMembershipToRestore] = useState(null);

  const fetchMemberships = async () => {
    try {
      const response = await api.get("/admin/membership");
      if (response.data.status === "OK") {
        const memberships = response.data.data.map((membership) => ({
          ...membership,
          status: membership.isDeleted ? "Inactive" : "Active",
        }));
        setMemberships(memberships);
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

  const handleOpenDeleteModal = (membership) => {
    setMembershipToDelete(membership);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setMembershipToDelete(null);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/admin/membership/delete/${membershipToDelete._id}`);
      fetchMemberships();
      toast.success("Membership deleted successfully!");
      handleCloseDeleteModal();
    } catch (error) {
      console.log("Error deleting membership:", error);
      toast.error(error.response.data.message);
    }
  };

  const handleAddNew = () => {
    setSelectedMembership({ name: '', price: 0, duration: 0, description: '' });
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    fetchMemberships();
  };

  const handleOpenRestoreModal = (membership) => {
    setMembershipToRestore(membership);
    setIsRestoreModalOpen(true);
  };

  const handleCloseRestoreModal = () => {
    setIsRestoreModalOpen(false);
    setMembershipToRestore(null);
  };

  const handleConfirmRestore = async () => {
    try {
      await api.patch(`/admin/membership/restore/${membershipToRestore._id}`);
      fetchMemberships();
      toast.success("Membership restored successfully!");
      handleCloseRestoreModal();
    } catch (error) {
      console.log("Error restoring membership:", error);
      toast.error(error.response.data.message);
    }
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
                    <th className="text-left py-2">Status</th>
                    <th className="text-left py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(memberships) && memberships.length > 0 ? (
                    memberships.map((membership) => (
                      <tr key={membership._id} className="border-b border-white/10">
                        <td className="py-2">{membership.name}</td>
                        <td className="py-2">
                          {membership.price.toLocaleString('vi-VN')} VND
                        </td>
                        <td className="py-2">{membership.duration} days</td>
                        <td className={`py-2 font-bold ${membership.status === 'Active' ? 'text-green-400' : 'text-red-400'}`}>{membership.status}</td>
                        <td className="py-2 flex gap-4">
                          <button
                            onClick={() => handleEdit(membership)}
                            className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
                          >
                            <IoPencilOutline />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(membership)}
                            className="text-red-400 hover:text-red-300 flex items-center gap-2"
                          >
                            <IoTrashOutline />
                          </button>
                          {membership.isDeleted && (
                            <button
                              onClick={() => handleOpenRestoreModal(membership)}
                              className="text-green-400 hover:text-green-300 flex items-center gap-2"
                            >
                              <IoAddCircleOutline />
                            </button>
                          )}
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
            selectedMembership && selectedMembership._id ? (
              <AdminEditMembershipForm
                membership={selectedMembership}
                onClose={handleCloseForm}
              />
            ) : (
              <AdminAddMembershipForm
                membership={selectedMembership}
                onClose={handleCloseForm}
              />
            )
          )}

          {isDeleteModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div
                className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                onClick={handleCloseDeleteModal}
              ></div>
              <div className="relative w-full max-w-md glass-card p-6 rounded-xl">
                <h2 className="text-xl font-bold text-white mb-4">Confirm Delete</h2>
                <p className="text-white/70 mb-6">
                  Are you sure you want to delete the membership &quot;{membershipToDelete?.name}&quot;?
                </p>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={handleCloseDeleteModal}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-400"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {isRestoreModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div
                className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                onClick={handleCloseRestoreModal}
              ></div>
              <div className="relative w-full max-w-md glass-card p-6 rounded-xl">
                <h2 className="text-xl font-bold text-white mb-4">Confirm Restore</h2>
                <p className="text-white/70 mb-6">
                  Are you sure you want to restore the membership &quot;{membershipToRestore?.name}&quot;?
                </p>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={handleCloseRestoreModal}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmRestore}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-400"
                  >
                    Restore
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminMembershipPage;