import { useEffect, useState } from "react";
import AdminNavbar from "../../../components/admin/AdminNavbar";
import Sidebar from "../../../components/Sidebar";
import {
  IoSearchOutline,
  IoEyeOutline,
  IoTrashOutline,
  IoFilterOutline,
  IoCalendarOutline,
  IoStatsChartOutline,
  IoTimeOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoHourglassOutline,
} from "react-icons/io5";
import AdminFeedbackModal from "./AdminFeedbackModal";
import api from "../../../config/axios";

// AdminFeedbackPage.jsx
function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    "in-review": 0,
    resolved: 0,
    rejected: 0,
  });

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    type: "",
    status: "",
    priority: "",
    dateFrom: "",
    dateTo: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
    limit: 10,
  });

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await api.get(`/admin/feedback?${queryParams}`);
      if (response.data.status === "OK") {
        setFeedbacks(response.data.data.feedback);
        setStatusCounts(response.data.data.statusCounts);
        setPagination(response.data.data.pagination);
      } else {
        console.error("Failed to fetch feedbacks:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [filters]);

  const handleView = (feedback) => {
    setSelectedFeedback(feedback);
    setIsModalOpen(true);
  };

  const handleDelete = async (id, reason = "") => {
    if (window.confirm("Are you sure you want to delete this feedback?")) {
      try {
        await api.delete(`/admin/feedback/${id}`, {
          data: { reason },
        });
        fetchFeedbacks();
      } catch (error) {
        console.error("Error deleting feedback:", error);
        alert("Failed to delete feedback");
      }
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
      page: 1, // Reset về trang 1 khi filter
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
      type: "",
      status: "",
      priority: "",
      dateFrom: "",
      dateTo: "",
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

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <IoHourglassOutline className="text-yellow-400" />;
      case "in-review":
        return <IoTimeOutline className="text-blue-400" />;
      case "resolved":
        return <IoCheckmarkCircleOutline className="text-green-400" />;
      case "rejected":
        return <IoCloseCircleOutline className="text-red-400" />;
      default:
        return <IoHourglassOutline className="text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-400 bg-yellow-400/10";
      case "in-review":
        return "text-blue-400 bg-blue-400/10";
      case "resolved":
        return "text-green-400 bg-green-400/10";
      case "rejected":
        return "text-red-400 bg-red-400/10";
      default:
        return "text-gray-400 bg-gray-400/10";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "text-red-500 bg-red-500/10";
      case "high":
        return "text-orange-400 bg-orange-400/10";
      case "medium":
        return "text-yellow-400 bg-yellow-400/10";
      case "low":
        return "text-green-400 bg-green-400/10";
      default:
        return "text-gray-400 bg-gray-400/10";
    }
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
                  Feedback Management
                </h1>
                <p className="text-white/70 mt-2">
                  Total: {pagination.total} feedback(s) • Page {pagination.page}{" "}
                  of {pagination.pages}
                </p>
              </div>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {Object.entries(statusCounts).map(([status, count]) => (
                <div key={status} className="glass-card p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-sm capitalize">
                        {status.replace("-", " ")}
                      </p>
                      <p className="text-2xl font-bold text-white">{count}</p>
                    </div>
                    {getStatusIcon(status)}
                  </div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="glass-card p-6 rounded-xl mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 items-end">
                {/* Type Filter */}
                <div>
                  <label className="text-white/70 text-sm mb-2 block">
                    Type
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    value={filters.type}
                    onChange={(e) => handleFilterChange("type", e.target.value)}
                  >
                    <option value="">All Types</option>
                    <option value="bug">Bug</option>
                    <option value="suggestion">Suggestion</option>
                    <option value="complaint">Complaint</option>
                    <option value="compliment">Compliment</option>
                    <option value="other">Other</option>
                  </select>
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
                    <option value="pending">Pending</option>
                    <option value="in-review">In Review</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {/* Priority Filter */}
                <div>
                  <label className="text-white/70 text-sm mb-2 block">
                    Priority
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    value={filters.priority}
                    onChange={(e) =>
                      handleFilterChange("priority", e.target.value)
                    }
                  >
                    <option value="">All Priority</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                {/* Date From */}
                <div>
                  <label className="text-white/70 text-sm mb-2 block">
                    From Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    value={filters.dateFrom}
                    onChange={(e) =>
                      handleFilterChange("dateFrom", e.target.value)
                    }
                  />
                </div>

                {/* Date To */}
                <div>
                  <label className="text-white/70 text-sm mb-2 block">
                    To Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    value={filters.dateTo}
                    onChange={(e) =>
                      handleFilterChange("dateTo", e.target.value)
                    }
                  />
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

            {/* Feedback Table */}
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
                          <th className="text-left py-3 w-48">User</th>
                          <th className="text-left py-3 w-24">Type</th>
                          <th className="text-left py-3 w-60">Subject</th>
                          <th className="text-left py-3 w-28">Priority</th>
                          <th className="text-left py-3 w-32">Status</th>
                          <th className="text-left py-3 w-32">Date</th>
                          <th className="text-left py-3 w-20">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {feedbacks.length > 0 ? (
                          feedbacks.map((feedback) => (
                            <tr
                              key={feedback._id}
                              className="border-b border-white/10 hover:bg-white/5"
                            >
                              <td className="py-3">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={
                                      feedback.user?.picture ||
                                      "/default-avatar.png"
                                    }
                                    alt={feedback.user?.name}
                                    className="w-8 h-8 rounded-full"
                                  />
                                  <div>
                                    <span className="block">
                                      {feedback.user?.name}
                                    </span>
                                    <span className="text-xs text-white/50">
                                      {feedback.user?.email}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3">
                                <span className="capitalize text-sm">
                                  {feedback.type}
                                </span>
                              </td>
                              <td className="py-3 max-w-xs">
                                <p className="text-sm text-white/80 line-clamp-2">
                                  {feedback.subject}
                                </p>
                              </td>
                              <td className="py-3">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs capitalize ${getPriorityColor(
                                    feedback.priority
                                  )}`}
                                >
                                  {feedback.priority}
                                </span>
                              </td>
                              <td className="py-3">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs capitalize flex items-center gap-1 w-fit ${getStatusColor(
                                    feedback.status
                                  )}`}
                                >
                                  {getStatusIcon(feedback.status)}
                                  {feedback.status.replace("-", " ")}
                                </span>
                              </td>
                              <td className="py-3 text-sm text-white/70">
                                {formatDate(feedback.createdAt)}
                              </td>
                              <td className="py-3 flex gap-4">
                                <button
                                  onClick={() => handleView(feedback)}
                                  className="text-blue-400 hover:text-blue-300"
                                  title="View Details"
                                >
                                  <IoEyeOutline />
                                </button>
                                <button
                                  onClick={() => handleDelete(feedback._id)}
                                  className="text-red-400 hover:text-red-300"
                                  title="Delete"
                                >
                                  <IoTrashOutline />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="7"
                              className="text-center py-8 text-white/70"
                            >
                              No feedback found.
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
            <AdminFeedbackModal
              feedback={selectedFeedback}
              onClose={() => setIsModalOpen(false)}
              onUpdate={fetchFeedbacks}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminFeedbackPage;
