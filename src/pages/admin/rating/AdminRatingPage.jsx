// AdminRatingPage.jsx
import { useEffect, useState } from "react";
import AdminLayout from "../../../layouts/admin/AdminLayout";
import {
  IoEyeOutline,
  IoTrashOutline,
  IoStatsChartOutline,
  IoStar,
  IoStarOutline,
  IoTrendingUpOutline,
  IoTrendingDownOutline,
  IoDownloadOutline,
  IoRefreshOutline,
  IoSearchOutline,
  IoCheckmarkCircleOutline,
  IoHeartOutline,
  IoHeart,
  IoThumbsUpOutline,
  IoThumbsDownOutline,
  IoTimeOutline,
} from "react-icons/io5";
import { LuCrown } from "react-icons/lu";
import AdminRatingModal from "./AdminRatingModal";
import api from "../../../config/axios";

// Membership Badge Component (reused from UserRatingPage)
const MembershipBadge = ({ membershipType, membershipName, size = "sm" }) => {
  // Use membershipName as display text, fallback to membershipType
  const displayText = membershipName || membershipType || "Free";

  // Determine styling - if has membershipName (real subscription), use premium styling
  const isPremium =
    membershipName &&
    membershipName !== "Free" &&
    membershipName !== "Free Users";

  const config = isPremium
    ? {
        icon: <LuCrown />,
        color: "text-purple-400",
        bgColor: "bg-purple-500/20",
        borderColor: "border-purple-500/50",
        label: displayText,
      }
    : {
        icon: <IoCheckmarkCircleOutline />,
        color: "text-gray-400",
        bgColor: "bg-gray-500/20",
        borderColor: "border-gray-500/50",
        label: displayText,
      };

  const sizeClasses = size === "sm" ? "text-xs px-2 py-1" : "text-sm px-3 py-2";

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border ${config.bgColor} ${config.borderColor} ${config.color} ${sizeClasses}`}
    >
      {config.icon}
      <span>{config.label}</span>
    </div>
  );
};

// Star Rating Component
const StarRating = ({ rating, size = "text-sm", showNumber = false }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= rating;
          return (
            <span key={star} className={size}>
              {isFilled ? (
                <IoStar className="text-yellow-400" />
              ) : (
                <IoStarOutline className="text-gray-400" />
              )}
            </span>
          );
        })}
      </div>
      {showNumber && (
        <span className="text-white/70 text-sm ml-1">
          {rating > 0 ? `${rating}/5` : "No rating"}
        </span>
      )}
    </div>
  );
};

function AdminRatingPage() {
  const [ratings, setRatings] = useState([]);
  const [selectedRating, setSelectedRating] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [membershipOptions, setMembershipOptions] = useState([]);

  // Enhanced stats from backend
  const [dashboardStats, setDashboardStats] = useState({
    overview: {
      totalRatings: 0,
      averageRating: 0,
      recommendationRate: "0%",
    },
    distribution: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    },
    aspectStats: [],
    membershipStats: [],
    trend: [],
  });

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    rating: "",
    aspectRated: "",
    membershipPackage: "",
    membershipType: "",
    dateFrom: "",
    dateTo: "",
    sortBy: "createdAt",
    sortOrder: "desc",
    search: "",
  });

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
    limit: 10,
  });

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    setDashboardLoading(true);
    try {
      const response = await api.get("/admin/ratings/dashboard", {
        params: {
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
        },
      });

      if (response.data.status === "OK") {
        setDashboardStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setDashboardLoading(false);
    }
  };

  // Fetch ratings with enhanced backend support
  const fetchRatings = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await api.get(`/admin/ratings?${queryParams}`);

      if (response.data.status === "OK") {
        const ratings = response.data.data.ratings;

        setRatings(ratings);
        setPagination(response.data.data.pagination);
      } else {
        console.error("Failed to fetch ratings:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching ratings:", error);
    } finally {
      setLoading(false);
    }
  };

  // Export functionality
  const handleExport = async () => {
    try {
      const response = await api.get("/admin/ratings/export", {
        params: {
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
        },
      });

      if (response.data.status === "OK") {
        // Convert to CSV and download
        const csvData = response.data.data;
        const csv = convertToCSV(csvData);
        downloadCSV(csv, "ratings-export.csv");
        alert("Export completed successfully!");
      }
    } catch (error) {
      console.error("Export error:", error);
      alert("Export failed. Please try again.");
    }
  };

  const convertToCSV = (data) => {
    if (!data.length) return "";

    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((row) =>
      Object.values(row)
        .map((value) =>
          typeof value === "string" ? `"${value.replace(/"/g, '""')}"` : value
        )
        .join(",")
    );

    return [headers, ...rows].join("\n");
  };

  const downloadCSV = (csv, filename) => {
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchRatings();
  }, [filters]);

  useEffect(() => {
    fetchDashboardStats();
  }, [filters.dateFrom, filters.dateTo]);

  // Fetch membership options on component mount
  // useEffect(() => {
  //   const fetchMembershipOptions = async () => {
  //     try {
  //       console.log("🔄 Fetching membership options...");

  //       // Try to get from dashboard stats first
  //       const dashboardResponse = await api.get("/admin/ratings/dashboard");
  //       if (
  //         dashboardResponse.data.status === "OK" &&
  //         dashboardResponse.data.data.membershipStats
  //       ) {
  //         const membershipStats = dashboardResponse.data.data.membershipStats;
  //         console.log("📊 Dashboard membershipStats:", membershipStats);

  //         const uniqueMemberships = membershipStats.map((stat) => ({
  //           name: stat._id || "Free Users",
  //           type: stat._id || "free",
  //         }));

  //         if (uniqueMemberships.length > 0) {
  //           console.log(
  //             "🎯 Membership options from dashboard:",
  //             uniqueMemberships
  //           );
  //           setMembershipOptions(uniqueMemberships);
  //           return;
  //         }
  //       }

  //       // Fallback: Get unique membership names from ratings list
  //       const ratingsResponse = await api.get("/admin/ratings", {
  //         params: { limit: 100 }, // Get first 100 records to sample membership types
  //       });

  //       if (ratingsResponse.data.status === "OK") {
  //         const allRatings = ratingsResponse.data.data.ratings;
  //         console.log(
  //           "📦 Sample ratings for membership extraction:",
  //           allRatings.length
  //         );

  //         const membershipMap = new Map();

  //         allRatings.forEach((rating) => {
  //           console.log("🔍 Processing rating membership data:", {
  //             subscriptionName: rating.subscription?.membershipId?.name,
  //             membershipName: rating.membershipName,
  //             membershipPackage: rating.membershipPackage,
  //             membershipType: rating.membershipType,
  //           });

  //           const membershipName =
  //             rating.subscription?.membershipId?.name ||
  //             rating.membershipName ||
  //             (rating.membershipPackage && rating.membershipPackage !== "free"
  //               ? rating.membershipPackage.charAt(0).toUpperCase() +
  //                 rating.membershipPackage.slice(1) +
  //                 " Plan"
  //               : null) ||
  //             (rating.membershipType && rating.membershipType !== "free"
  //               ? rating.membershipType.charAt(0).toUpperCase() +
  //                 rating.membershipType.slice(1) +
  //                 " Plan"
  //               : "Free Users");

  //           const membershipType =
  //             rating.subscription?.membershipId?.type ||
  //             rating.membershipType ||
  //             rating.membershipPackage ||
  //             "free";

  //           const key = membershipType;
  //           if (!membershipMap.has(key)) {
  //             membershipMap.set(key, {
  //               name: membershipName,
  //               type: membershipType,
  //             });
  //           }
  //         });

  //         const uniqueMemberships = Array.from(membershipMap.values()).sort(
  //           (a, b) => {
  //             // Sort: Free first, then alphabetically
  //             if (a.type === "free") return -1;
  //             if (b.type === "free") return 1;
  //             return a.name.localeCompare(b.name);
  //           }
  //         );

  //         console.log("🎯 Final membership options:", uniqueMemberships);
  //         setMembershipOptions(uniqueMemberships);
  //       }
  //     } catch (error) {
  //       console.error("❌ Error fetching membership options:", error);
  //       // Fallback to default options
  //       const fallbackOptions = [
  //         { name: "Free Users", type: "free" },
  //         { name: "Basic Plan", type: "basic" },
  //         { name: "Premium Plan", type: "premium" },
  //         { name: "VIP Plan", type: "vip" },
  //       ];
  //       console.log("🔄 Using fallback membership options:", fallbackOptions);
  //       setMembershipOptions(fallbackOptions);
  //     }
  //   };

  //   fetchMembershipOptions();
  // }, []);

  // Fetch membership options on component mount
  useEffect(() => {
    const fetchMembershipOptions = async () => {
      try {
        const response = await api.get("/admin/ratings", {
          params: { limit: 1000 },
        });

        if (response.data.status === "OK") {
          const allRatings = response.data.data.ratings;
          const membershipMap = new Map();

          allRatings.forEach((rating) => {
            // Use computedMembershipName as both display and filter value
            const membershipName =
              rating.computedMembershipName || "Free Users";

            if (!membershipMap.has(membershipName)) {
              membershipMap.set(membershipName, {
                name: membershipName,
                type: membershipName, // Use name as type for filtering
              });
            }
          });

          const uniqueMemberships = Array.from(membershipMap.values()).sort(
            (a, b) => {
              if (a.name === "Free Users") return -1;
              if (b.name === "Free Users") return 1;
              return a.name.localeCompare(b.name);
            }
          );

          setMembershipOptions(uniqueMemberships);
        }
      } catch (error) {
        console.error("Error fetching membership options:", error);
        setMembershipOptions([{ name: "Free Users", type: "Free Users" }]);
      }
    };

    fetchMembershipOptions();
  }, []);

  const handleView = (rating) => {
    setSelectedRating(rating);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const reason = prompt("Please provide a reason for deletion:");
    if (!reason) return;

    if (window.confirm("Are you sure you want to delete this rating?")) {
      try {
        await api.delete(`/admin/ratings/${id}`, {
          data: { reason },
        });
        alert("Rating deleted successfully");
        fetchRatings();
        fetchDashboardStats(); // Refresh stats
      } catch (error) {
        console.error("Error deleting rating:", error);
        alert("Failed to delete rating");
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
      membershipType: "",
      dateFrom: "",
      dateTo: "",
      sortBy: "createdAt",
      sortOrder: "desc",
      search: "",
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

  const getAspectLabel = (aspect) => {
    const labels = {
      overall: "Overall Experience",
      features: "Features",
      "coach-quality": "Coach Quality",
      content: "Content",
      "user-interface": "User Interface",
      support: "Customer Support",
    };
    return labels[aspect] || aspect;
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Rating Management</h1>
            <p className="text-white/70 mt-2">
              Total: {pagination.total} rating(s) • Page {pagination.page} of{" "}
              {pagination.pages}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                console.log("🔄 Manual refresh triggered");
                fetchDashboardStats();
                // Also refresh membership options
                window.location.reload();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              <IoRefreshOutline />
              Refresh
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              <IoDownloadOutline />
              Export CSV
            </button>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Total Ratings */}
          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Total Ratings</p>
                <p className="text-3xl font-bold text-white">
                  {dashboardLoading
                    ? "..."
                    : dashboardStats.overview.totalRatings}
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
                      dashboardStats.overview.averageRating
                    )}`}
                  >
                    {dashboardLoading
                      ? "..."
                      : dashboardStats.overview.averageRating}
                  </p>
                  <StarRating
                    rating={Math.round(dashboardStats.overview.averageRating)}
                    size="text-lg"
                  />
                </div>
              </div>
              <IoStar className="text-yellow-400 text-2xl" />
            </div>
          </div>

          {/* Recommendation Rate */}
          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Recommendation Rate</p>
                <p className="text-3xl font-bold text-green-400">
                  {dashboardLoading
                    ? "..."
                    : dashboardStats.overview.recommendationRate}
                </p>
              </div>
              <IoHeartOutline className="text-green-400 text-2xl" />
            </div>
          </div>

          {/* 5-Star Ratings */}
          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">5-Star Ratings</p>
                <p className="text-3xl font-bold text-yellow-400">
                  {dashboardLoading ? "..." : dashboardStats.distribution[5]}
                </p>
              </div>
              <IoStar className="text-yellow-400 text-2xl" />
            </div>
          </div>
        </div>

        {/* Rating Distribution Chart */}
        <div className="glass-card p-6 rounded-xl mb-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            Rating Distribution
          </h3>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = dashboardStats.distribution[star] || 0;
              const percentage =
                dashboardStats.overview.totalRatings > 0
                  ? (count / dashboardStats.overview.totalRatings) * 100
                  : 0;

              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-white/70 text-sm w-8">{star}★</span>
                  <div className="flex-1 bg-white/10 rounded-full h-3">
                    <div
                      className="bg-yellow-400 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-white/60 text-sm w-16">
                    {count} ({percentage.toFixed(1)}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="glass-card p-6 rounded-xl mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 items-end">
            {/* Search */}
            <div>
              <label className="text-white/70 text-sm mb-2 block">Search</label>
              <div className="relative">
                <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
                <input
                  type="text"
                  placeholder="Search users or comments..."
                  className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                />
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="text-white/70 text-sm mb-2 block">Rating</label>
              <select
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                value={filters.rating}
                onChange={(e) => handleFilterChange("rating", e.target.value)}
              >
                <option className="bg-gray-800" value="">
                  All Ratings
                </option>
                <option className="bg-gray-800" value="5">
                  5 Stars
                </option>
                <option className="bg-gray-800" value="4">
                  4 Stars
                </option>
                <option className="bg-gray-800" value="3">
                  3 Stars
                </option>
                <option className="bg-gray-800" value="2">
                  2 Stars
                </option>
                <option className="bg-gray-800" value="1">
                  1 Star
                </option>
              </select>
            </div>

            {/* Aspect Filter */}
            <div>
              <label className="text-white/70 text-sm mb-2 block">Aspect</label>
              <select
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                value={filters.aspectRated}
                onChange={(e) =>
                  handleFilterChange("aspectRated", e.target.value)
                }
              >
                <option className="bg-gray-800" value="">
                  All Aspects
                </option>
                <option className="bg-gray-800" value="overall">
                  Overall
                </option>
                <option className="bg-gray-800" value="features">
                  Features
                </option>
                <option className="bg-gray-800" value="coach-quality">
                  Coach Quality
                </option>
                <option className="bg-gray-800" value="content">
                  Content
                </option>
                <option className="bg-gray-800" value="user-interface">
                  User Interface
                </option>
                <option className="bg-gray-800" value="support">
                  Support
                </option>
              </select>
            </div>

            {/* Membership Filter */}
            <div>
              <label className="text-white/70 text-sm mb-2 block">
                Membership
              </label>
              <select
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                value={filters.membershipType}
                onChange={(e) => {
                  console.log(
                    "🎛️ Membership filter changed to:",
                    e.target.value
                  );
                  handleFilterChange("membershipType", e.target.value);
                }}
              >
                <option value="" className="bg-gray-800">
                  All Members
                </option>
                {membershipOptions.map((membership, index) => (
                  <option
                    key={`${membership.type}-${index}`}
                    value={membership.type}
                    className="bg-gray-800"
                  >
                    {membership.name}
                  </option>
                ))}
                {membershipOptions.length === 0 && (
                  <option disabled className="bg-gray-800 text-gray-500">
                    Loading memberships...
                  </option>
                )}
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
                onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
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
                onChange={(e) => handleFilterChange("dateTo", e.target.value)}
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

        {/* Enhanced Ratings Table */}
        <div className="glass-card p-6 rounded-xl">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-white/70">Loading ratings...</div>
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
                      <th className="text-left py-3 w-32">Membership</th>
                      <th className="text-left py-3 w-24">Recommend</th>
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
                              {rating.user?.picture ? (
                                <img
                                  src={rating.user.picture}
                                  alt={rating.user?.name}
                                  className="w-8 h-8 rounded-full flex-shrink-0"
                                />
                              ) : (
                                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                                  {rating.user?.name?.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <span
                                  className="block text-white truncate font-medium"
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
                              <StarRating rating={rating.rating} />
                              <span
                                className={`font-medium text-sm ${getRatingColor(
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
                              <span className="text-sm">
                                {getAspectLabel(rating.aspectRated)}
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
                            <MembershipBadge
                              membershipName={
                                rating.subscription?.membershipId?.name ||
                                rating.membershipName ||
                                (rating.membershipPackage !== "free"
                                  ? rating.membershipPackage
                                  : null) ||
                                (rating.membershipType !== "free"
                                  ? rating.membershipType
                                  : "Free")
                              }
                              size="sm"
                            />
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-1">
                              {rating.wouldRecommend ? (
                                <IoHeart className="text-green-400" />
                              ) : (
                                <IoThumbsDownOutline className="text-red-400" />
                              )}
                              <span
                                className={`text-xs ${
                                  rating.wouldRecommend
                                    ? "text-green-400"
                                    : "text-red-400"
                                }`}
                              >
                                {rating.wouldRecommend ? "Yes" : "No"}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 text-sm text-white/70">
                            {formatDate(rating.createdAt)}
                          </td>
                          <td className="py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleView(rating)}
                                className="text-blue-400 hover:text-blue-300 p-1"
                                title="View Details"
                              >
                                <IoEyeOutline />
                              </button>
                              <button
                                onClick={() => handleDelete(rating._id)}
                                className="text-red-400 hover:text-red-300 p-1"
                                title="Delete"
                              >
                                <IoTrashOutline />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="8"
                          className="text-center py-8 text-white/70"
                        >
                          No ratings found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Enhanced Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-between items-center mt-6 pt-6 border-t border-white/20">
                  <div className="text-white/70 text-sm">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
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
                      { length: Math.min(pagination.pages, 5) },
                      (_, i) => {
                        const startPage = Math.max(1, pagination.page - 2);
                        return startPage + i;
                      }
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
    </AdminLayout>
  );
}

export default AdminRatingPage;
