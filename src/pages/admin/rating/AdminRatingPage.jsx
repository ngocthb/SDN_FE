// AdminRatingPage.jsx
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
  IoStar,
  IoStarOutline,
  IoTrendingUpOutline,
  IoTrendingDownOutline,
} from "react-icons/io5";
import AdminRatingModal from "./AdminRatingModal";
import api from "../../../config/axios";

function AdminRatingPage() {
  const [ratings, setRatings] = useState([]);
  const [selectedRating, setSelectedRating] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalRatings: 0,
    averageRating: 0,
    ratingDistribution: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    },
  });

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    rating: "",
    aspectRated: "",
    membershipPackage: "",
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

  const fetchRatings = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await api.get(`/admin/ratings?${queryParams}`);
      if (response.data.status === "OK") {
        setRatings(response.data.data.ratings);
        setPagination(response.data.data.pagination);
        calculateStats(response.data.data.ratings);
      } else {
        console.error("Failed to fetch ratings:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching ratings:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (ratingsData) => {
    const total = ratingsData.length;
    const sum = ratingsData.reduce((acc, rating) => acc + rating.rating, 0);
    const average = total > 0 ? (sum / total).toFixed(1) : 0;

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingsData.forEach((rating) => {
      distribution[rating.rating]++;
    });

    setStats({
      totalRatings: total,
      averageRating: average,
      ratingDistribution: distribution,
    });
  };

  useEffect(() => {
    fetchRatings();
  }, [filters]);

  const handleView = (rating) => {
    setSelectedRating(rating);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this rating?")) {
      try {
        await api.delete(`/admin/ratings/${id}`, {
          data: { reason: "Deleted by admin" },
        });
        fetchRatings();
      } catch (error) {
        console.error("Error deleting rating:", error);
        console.error("Failed to delete rating");
      }
    }
  };

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
      rating: "",
      aspectRated: "",
      membershipPackage: "",
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

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} className="text-yellow-400">
        {index < rating ? <IoStar /> : <IoStarOutline />}
      </span>
    ));
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return "text-green-400";
    if (rating >= 3) return "text-yellow-400";
    if (rating >= 2) return "text-orange-400";
    return "text-red-400";
  };

  const getAspectIcon = (aspect) => {
    switch (aspect) {
      case "overall":
        return <IoStatsChartOutline className="text-blue-400" />;
      case "features":
        return <IoTrendingUpOutline className="text-green-400" />;
      case "coach-quality":
        return <IoStar className="text-yellow-400" />;
      case "content":
        return <IoEyeOutline className="text-purple-400" />;
      case "user-interface":
        return <IoStatsChartOutline className="text-cyan-400" />;
      case "support":
        return <IoTrendingDownOutline className="text-pink-400" />;
      default:
        return <IoStatsChartOutline className="text-gray-400" />;
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
                  Rating Management
                </h1>
                <p className="text-white/70 mt-2">
                  Total: {pagination.total} rating(s) • Page {pagination.page}{" "}
                  of {pagination.pages}
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Total Ratings */}
              <div className="glass-card p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Total Ratings</p>
                    <p className="text-3xl font-bold text-white">
                      {stats.totalRatings}
                    </p>
                  </div>
                  <IoStatsChartOutline className="text-blue-400 text-2xl" />
                </div>
              </div>

              {/* Average Rating */}
              <div className="glass-card p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Average Rating</p>
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-3xl font-bold ${getRatingColor(
                          stats.averageRating
                        )}`}
                      >
                        {stats.averageRating}
                      </p>
                      <div className="flex">
                        {renderStars(Math.round(stats.averageRating))}
                      </div>
                    </div>
                  </div>
                  <IoStar className="text-yellow-400 text-2xl" />
                </div>
              </div>

              {/* Rating Distribution */}
              <div className="glass-card p-6 rounded-xl">
                <p className="text-white/70 text-sm mb-3">
                  Rating Distribution
                </p>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-white text-sm w-3">{star}</span>
                      <IoStar className="text-yellow-400 text-sm" />
                      <div className="flex-1 bg-white/10 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{
                            width: `${
                              stats.totalRatings > 0
                                ? (stats.ratingDistribution[star] /
                                    stats.totalRatings) *
                                  100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-white/70 text-sm w-8">
                        {stats.ratingDistribution[star]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="glass-card p-6 rounded-xl mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 items-end">
                {/* Rating Filter */}
                <div>
                  <label className="text-white/70 text-sm mb-2 block">
                    Rating
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    value={filters.rating}
                    onChange={(e) =>
                      handleFilterChange("rating", e.target.value)
                    }
                  >
                    <option value="">All Ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                </div>

                {/* Aspect Filter */}
                <div>
                  <label className="text-white/70 text-sm mb-2 block">
                    Aspect
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    value={filters.aspectRated}
                    onChange={(e) =>
                      handleFilterChange("aspectRated", e.target.value)
                    }
                  >
                    <option value="">All Aspects</option>
                    <option value="overall">Overall</option>
                    <option value="features">Features</option>
                    <option value="coach-quality">Coach Quality</option>
                    <option value="content">Content</option>
                    <option value="user-interface">User Interface</option>
                    <option value="support">Support</option>
                  </select>
                </div>

                {/* Membership Filter */}
                <div>
                  <label className="text-white/70 text-sm mb-2 block">
                    Membership
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    value={filters.membershipPackage}
                    onChange={(e) =>
                      handleFilterChange("membershipPackage", e.target.value)
                    }
                  >
                    <option value="">All Members</option>
                    <option value="free">Free</option>
                    <option value="basic">Basic</option>
                    <option value="premium">Premium</option>
                    <option value="vip">VIP</option>
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

            {/* Ratings Table */}
            <div className="glass-card p-6 rounded-xl">
              {loading ? (
                <div className="text-center py-8">
                  <div className="text-white/70">Loading...</div>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-white">
                      <thead>
                        <tr className="border-b border-white/20">
                          <th className="text-left py-3 w-48">User</th>
                          <th className="text-left py-3 w-32">Rating</th>
                          <th className="text-left py-3 w-32">Aspect</th>
                          <th className="text-left py-3 w-60">Comment</th>
                          <th className="text-left py-3 w-28">Membership</th>
                          <th className="text-left py-3 w-32">Date</th>
                          <th className="text-left py-3 w-20">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ratings.length > 0 ? (
                          ratings.map((rating) => (
                            <tr
                              key={rating._id}
                              className="border-b border-white/10 hover:bg-white/5"
                            >
                              <td className="py-3">
                                <div className="flex items-center gap-3 max-w-[180px]">
                                  <img
                                    src={
                                      rating.user?.picture ||
                                      "/default-avatar.png"
                                    }
                                    alt={rating.user?.name}
                                    className="w-8 h-8 rounded-full flex-shrink-0"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <span
                                      className="block text-white truncate"
                                      title={rating.user?.name}
                                    >
                                      {rating.user?.name}
                                    </span>
                                    <span
                                      className="text-xs text-white/50 truncate block"
                                      title={rating.user?.email}
                                    >
                                      {rating.user?.email}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3">
                                <div className="flex items-center gap-2">
                                  <div className="flex">
                                    {renderStars(rating.rating)}
                                  </div>
                                  <span
                                    className={`font-medium ${getRatingColor(
                                      rating.rating
                                    )}`}
                                  >
                                    {rating.rating}/5
                                  </span>
                                </div>
                              </td>
                              <td className="py-3">
                                <div className="flex items-center gap-2">
                                  {getAspectIcon(rating.aspectRated)}
                                  <span className="capitalize text-sm">
                                    {rating.aspectRated?.replace("-", " ") ||
                                      "Overall"}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3">
                                <p
                                  className="text-sm text-white/80 truncate max-w-[200px]"
                                  title={rating.comment || "No comment"}
                                >
                                  {rating.comment
                                    ? rating.comment.length > 50
                                      ? `${rating.comment.substring(0, 50)}...`
                                      : rating.comment
                                    : "No comment"}
                                </p>
                              </td>
                              <td className="py-3">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs capitalize ${
                                    rating.membershipPackage === "vip"
                                      ? "text-purple-300 bg-purple-500/20"
                                      : rating.membershipPackage === "premium"
                                      ? "text-yellow-300 bg-yellow-500/20"
                                      : rating.membershipPackage === "basic"
                                      ? "text-blue-300 bg-blue-500/20"
                                      : "text-gray-300 bg-gray-500/20"
                                  }`}
                                >
                                  {rating.membershipPackage || "Free"}
                                </span>
                              </td>
                              <td className="py-3 text-sm text-white/70">
                                {formatDate(rating.createdAt)}
                              </td>
                              <td className="py-3 flex gap-4">
                                <button
                                  onClick={() => handleView(rating)}
                                  className="text-blue-400 hover:text-blue-300"
                                  title="View Details"
                                >
                                  <IoEyeOutline />
                                </button>
                                <button
                                  onClick={() => handleDelete(rating._id)}
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
                              No ratings found.
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
            <AdminRatingModal
              rating={selectedRating}
              onClose={() => setIsModalOpen(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminRatingPage;
