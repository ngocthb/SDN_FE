// AdminUserPage.jsx
import { useEffect, useState } from "react";
import AdminNavbar from "../../components/admin/AdminNavbar";
import Sidebar from "../../components/Sidebar";
import {
  IoSearchOutline,
  IoEyeOutline,
  IoTrashOutline,
  IoFilterOutline,
  IoCalendarOutline,
  IoStatsChartOutline,
  IoPeopleOutline,
  IoShieldCheckmarkOutline,
  IoPersonOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoPencilOutline,
  IoLockClosedOutline,
  IoLockOpenOutline,
  IoManOutline,
  IoWomanOutline,
} from "react-icons/io5";
import AdminUserModal from "./AdminUserModal";
import api from "../../config/axios";

function AdminUserPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    overview: {
      total: 0,
      active: 0,
      inactive: 0,
      newLast30Days: 0,
    },
    byRole: {
      admins: 0,
      coaches: 0,
      users: 0,
    },
    byGender: {
      male: 0,
      female: 0,
      unknown: 0,
    },
  });

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
    status: "",
    role: "",
    gender: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
    limit: 10,
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await api.get(`/admin/users?${queryParams}`);
      if (response.data.status === "OK") {
        setUsers(response.data.data.users);
        setPagination(response.data.data.pagination);
      } else {
        console.error("Failed to fetch users:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await api.get("/admin/users/statistics");
      if (response.data.status === "OK") {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const handleView = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  // Remove handleToggleStatus and handleDelete functions

  // Remove handleRoleUpdate, handleStatusUpdate functions

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
      page: 1,
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      search: "",
      status: "",
      role: "",
      gender: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getUserRole = (user) => {
    if (user.isAdmin) return "Admin";
    if (user.isCoach) return "Coach";
    return "User";
  };

  const getRoleColor = (user) => {
    if (user.isAdmin) return "text-red-300 bg-red-500/20";
    if (user.isCoach) return "text-blue-300 bg-blue-500/20";
    return "text-green-300 bg-green-500/20";
  };

  const getGenderIcon = (gender) => {
    if (gender === true) return <IoWomanOutline className="text-pink-400" />;
    if (gender === false) return <IoManOutline className="text-blue-400" />;
    return <IoPersonOutline className="text-gray-400" />;
  };

  const getGenderText = (gender) => {
    if (gender === true) return "Female";
    if (gender === false) return "Male";
    return "Unknown";
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AdminNavbar />
      <div className="flex flex-1">
        <Sidebar className="h-full" />
        <div className="flex-1 bg-gradient-to-br from-dark-900 via-purple-900/20 to-pink-900/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white">
                  User Management
                </h1>
                <p className="text-white/70 mt-2">
                  Total: {pagination.total} user(s) • Page {pagination.page} of{" "}
                  {pagination.pages}
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {/* Total Users */}
              <div className="glass-card p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Total Users</p>
                    <p className="text-3xl font-bold text-white">
                      {stats.overview.total}
                    </p>
                  </div>
                  <IoPeopleOutline className="text-blue-400 text-2xl" />
                </div>
              </div>

              {/* Active Users */}
              <div className="glass-card p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Active Users</p>
                    <p className="text-3xl font-bold text-green-400">
                      {stats.overview.active}
                    </p>
                  </div>
                  <IoCheckmarkCircleOutline className="text-green-400 text-2xl" />
                </div>
              </div>

              {/* Admins & Coaches */}
              <div className="glass-card p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Admins & Coaches</p>
                    <p className="text-3xl font-bold text-purple-400">
                      {stats.byRole.admins + stats.byRole.coaches}
                    </p>
                  </div>
                  <IoShieldCheckmarkOutline className="text-purple-400 text-2xl" />
                </div>
              </div>

              {/* New Users (30 days) */}
              <div className="glass-card p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">New Users (30d)</p>
                    <p className="text-3xl font-bold text-yellow-400">
                      {stats.overview.newLast30Days}
                    </p>
                  </div>
                  <IoStatsChartOutline className="text-yellow-400 text-2xl" />
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="glass-card p-6 rounded-xl mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 items-end">
                {/* Search */}
                <div className="md:col-span-2">
                  <label className="text-white/70 text-sm mb-2 block">
                    Search
                  </label>
                  <div className="relative">
                    <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
                      value={filters.search}
                      onChange={(e) =>
                        handleFilterChange("search", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="text-white/70 text-sm mb-2 block">
                    Status
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    value={filters.status}
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value)
                    }
                  >
                    <option value="">All Status</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>

                {/* Role Filter */}
                <div>
                  <label className="text-white/70 text-sm mb-2 block">
                    Role
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    value={filters.role}
                    onChange={(e) => handleFilterChange("role", e.target.value)}
                  >
                    <option value="">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="coach">Coach</option>
                    <option value="user">User</option>
                  </select>
                </div>

                {/* Gender Filter */}
                <div>
                  <label className="text-white/70 text-sm mb-2 block">
                    Gender
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    value={filters.gender}
                    onChange={(e) =>
                      handleFilterChange("gender", e.target.value)
                    }
                  >
                    <option value="">All Genders</option>
                    <option value="false">Male</option>
                    <option value="true">Female</option>
                  </select>
                </div>

                {/* Clear Filters */}
                <div>
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2 text-white/70 hover:text-white border border-white/20 rounded-lg hover:border-white/40 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="glass-card p-6 rounded-xl">
              {loading ? (
                <div className="text-center py-8">
                  <div className="text-white/70">Loading...</div>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-white table-fixed">
                      <thead>
                        <tr className="border-b border-white/20">
                          <th className="text-left py-3 w-64">User</th>
                          <th className="text-left py-3 w-24">Gender</th>
                          <th className="text-left py-3 w-24">Role</th>
                          <th className="text-left py-3 w-24">Status</th>
                          <th className="text-left py-3 w-32">Joined</th>
                          <th className="text-left py-3 w-32">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.length > 0 ? (
                          users.map((user) => (
                            <tr
                              key={user._id}
                              className="border-b border-white/10 hover:bg-white/5"
                            >
                              <td className="py-3">
                                <div className="flex items-center gap-3 max-w-[240px]">
                                  <img
                                    src={user.picture || "/default-avatar.png"}
                                    alt={user.name}
                                    className="w-10 h-10 rounded-full flex-shrink-0"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <span
                                      className="block text-white font-medium truncate"
                                      title={user.name}
                                    >
                                      {user.name}
                                    </span>
                                    <span
                                      className="text-xs text-white/50 truncate block"
                                      title={user.email}
                                    >
                                      {user.email}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3">
                                <div
                                  className="flex items-center gap-1"
                                  title={getGenderText(user.gender)}
                                >
                                  {getGenderIcon(user.gender)}
                                  <span className="text-sm">
                                    {user.gender === true
                                      ? "F"
                                      : user.gender === false
                                      ? "M"
                                      : "-"}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(
                                    user
                                  )}`}
                                >
                                  {getUserRole(user)}
                                </span>
                              </td>
                              <td className="py-3">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${
                                    user.status
                                      ? "text-green-300 bg-green-500/20"
                                      : "text-red-300 bg-red-500/20"
                                  }`}
                                >
                                  {user.status ? (
                                    <>
                                      <IoCheckmarkCircleOutline />
                                      <span>Active</span>
                                    </>
                                  ) : (
                                    <>
                                      <IoCloseCircleOutline />
                                      <span>Inactive</span>
                                    </>
                                  )}
                                </span>
                              </td>
                              <td className="py-3 text-sm text-white/70">
                                {formatDate(user.createdAt)}
                              </td>
                              <td className="py-3 flex gap-2">
                                <button
                                  onClick={() => handleView(user)}
                                  className="text-blue-400 hover:text-blue-300 p-1"
                                  title="View Details"
                                >
                                  <IoEyeOutline />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="6"
                              className="text-center py-8 text-white/70"
                            >
                              No users found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {pagination.pages > 1 && (
                    <div className="flex justify-between items-center mt-6 pt-6 border-t border-white/20">
                      <div className="text-white/70 text-sm">
                        Showing {(pagination.page - 1) * pagination.limit + 1}{" "}
                        to{" "}
                        {Math.min(
                          pagination.page * pagination.limit,
                          pagination.total
                        )}{" "}
                        of {pagination.total} results
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePageChange(pagination.page - 1)}
                          disabled={pagination.page === 1}
                          className="px-3 py-1 border border-white/20 rounded text-white/70 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>

                        {Array.from(
                          { length: pagination.pages },
                          (_, i) => i + 1
                        ).map((page) => (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-1 border rounded ${
                              page === pagination.page
                                ? "bg-purple-500 border-purple-500 text-white"
                                : "border-white/20 text-white/70 hover:text-white"
                            }`}
                          >
                            {page}
                          </button>
                        ))}

                        <button
                          onClick={() => handlePageChange(pagination.page + 1)}
                          disabled={pagination.page === pagination.pages}
                          className="px-3 py-1 border border-white/20 rounded text-white/70 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Modal */}
          {isModalOpen && (
            <AdminUserModal
              user={selectedUser}
              onClose={() => setIsModalOpen(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminUserPage;
