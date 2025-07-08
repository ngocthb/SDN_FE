import React, { useState, useEffect } from "react";
import {
  IoStarOutline,
  IoStar,
  IoThumbsUpOutline,
  IoThumbsDownOutline,
  IoSendOutline,
  IoTimeOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoCreateOutline,
  IoTrashOutline,
  IoHeartOutline,
  IoHeart,
} from "react-icons/io5";
import api from "../config/axios";

// Star Rating Input Component
const StarRating = ({
  rating,
  onRatingChange,
  size = "text-2xl",
  interactive = true,
  showNumber = false,
}) => {
  const [hoveredStar, setHoveredStar] = useState(0);

  const handleClick = (star) => {
    if (interactive && onRatingChange) {
      onRatingChange(star);
    }
  };

  const handleMouseEnter = (star) => {
    if (interactive) {
      setHoveredStar(star);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoveredStar(0);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= (hoveredStar || rating);
          return (
            <button
              key={star}
              type="button"
              onClick={() => handleClick(star)}
              onMouseEnter={() => handleMouseEnter(star)}
              onMouseLeave={handleMouseLeave}
              className={`${
                interactive
                  ? "cursor-pointer hover:scale-110"
                  : "cursor-default"
              } transition-all duration-200 ${size}`}
              disabled={!interactive}
            >
              {isFilled ? (
                <IoStar className="text-yellow-400" />
              ) : (
                <IoStarOutline className="text-gray-400" />
              )}
            </button>
          );
        })}
      </div>
      {showNumber && (
        <span className="text-white/70 text-sm ml-2">
          {rating > 0 ? `${rating}/5` : "No rating"}
        </span>
      )}
    </div>
  );
};

// Rating Form Component
const RatingForm = ({
  onSubmit,
  onCancel,
  initialData = null,
  className = "",
}) => {
  const [formData, setFormData] = useState({
    rating: initialData?.rating || 0,
    aspectRated: initialData?.aspectRated || "overall",
    comment: initialData?.comment || "",
    membershipPackage: initialData?.membershipPackage || "",
    wouldRecommend: initialData?.wouldRecommend ?? true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const aspectOptions = [
    { value: "overall", label: "Overall Experience" },
    { value: "features", label: "Features" },
    { value: "coach-quality", label: "Coach Quality" },
    { value: "content", label: "Content" },
    { value: "user-interface", label: "User Interface" },
    { value: "support", label: "Customer Support" },
  ];

  const membershipOptions = [
    { value: "", label: "Select Package" },
    { value: "free", label: "Free" },
    { value: "basic", label: "Basic" },
    { value: "premium", label: "Premium" },
    { value: "vip", label: "VIP" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.rating === 0) {
      alert("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert("Failed to submit rating. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`glass-card p-6 rounded-xl ${className}`}>
      <h3 className="text-xl font-semibold text-white mb-6">
        {initialData ? "Edit Your Rating" : "Rate Our Platform"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating Stars */}
        <div>
          <label className="text-white/70 text-sm mb-3 block">
            Your Rating *
          </label>
          <StarRating
            rating={formData.rating}
            onRatingChange={(rating) =>
              setFormData((prev) => ({ ...prev, rating }))
            }
            size="text-3xl"
          />
        </div>

        {/* Aspect */}
        <div>
          <label className="text-white/70 text-sm mb-2 block">
            What are you rating?
          </label>
          <select
            value={formData.aspectRated}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, aspectRated: e.target.value }))
            }
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
          >
            {aspectOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className="bg-gray-800"
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Membership Package */}
        <div>
          <label className="text-white/70 text-sm mb-2 block">
            Your Membership Package
          </label>
          <select
            value={formData.membershipPackage}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                membershipPackage: e.target.value,
              }))
            }
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
          >
            {membershipOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className="bg-gray-800"
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Comment */}
        <div>
          <label className="text-white/70 text-sm mb-2 block">
            Your Review (Optional)
          </label>
          <textarea
            value={formData.comment}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, comment: e.target.value }))
            }
            placeholder="Tell us about your experience..."
            maxLength={500}
            rows={4}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500 resize-none"
          />
          <div className="text-white/50 text-xs mt-1">
            {formData.comment.length}/500 characters
          </div>
        </div>

        {/* Would Recommend */}
        <div>
          <label className="text-white/70 text-sm mb-3 block">
            Would you recommend our platform?
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, wouldRecommend: true }))
              }
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                formData.wouldRecommend
                  ? "bg-green-500/20 border-green-500 text-green-400"
                  : "border-white/20 text-white/70 hover:border-green-500/50"
              }`}
            >
              <IoThumbsUpOutline />
              Yes, I recommend it
            </button>
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, wouldRecommend: false }))
              }
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                !formData.wouldRecommend
                  ? "bg-red-500/20 border-red-500 text-red-400"
                  : "border-white/20 text-white/70 hover:border-red-500/50"
              }`}
            >
              <IoThumbsDownOutline />
              No, I don't recommend it
            </button>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting || formData.rating === 0}
            className="flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <IoSendOutline />
            {isSubmitting
              ? "Submitting..."
              : initialData
              ? "Update Rating"
              : "Submit Rating"}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-white/20 text-white/70 hover:text-white hover:border-white/40 rounded-lg transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

// Rating Display Component
const RatingCard = ({ rating, onEdit, onDelete, showActions = true }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
    <div className="glass-card p-6 rounded-xl">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          {rating.user?.picture ? (
            <img
              src={rating.user.picture}
              alt={rating.user.name}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
              {rating.user?.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h4 className="text-white font-medium">{rating.user?.name}</h4>
            <p className="text-white/50 text-sm">
              {formatDate(rating.createdAt)}
            </p>
          </div>
        </div>

        {showActions && (
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(rating)}
              className="text-blue-400 hover:text-blue-300 p-1"
              title="Edit Rating"
            >
              <IoCreateOutline />
            </button>
            <button
              onClick={() => onDelete(rating._id)}
              className="text-red-400 hover:text-red-300 p-1"
              title="Delete Rating"
            >
              <IoTrashOutline />
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {/* Rating Stars */}
        <div className="flex items-center gap-3">
          <StarRating rating={rating.rating} interactive={false} />
          <span className="text-white/70 text-sm">
            {getAspectLabel(rating.aspectRated)}
          </span>
        </div>

        {/* Comment */}
        {rating.comment && (
          <p className="text-white/80 leading-relaxed">"{rating.comment}"</p>
        )}

        {/* Metadata */}
        <div className="flex flex-wrap gap-4 text-sm text-white/60">
          {rating.membershipPackage && (
            <span className="flex items-center gap-1">
              <IoCheckmarkCircleOutline />
              {rating.membershipPackage} membership
            </span>
          )}
          {rating.daysUsed > 0 && (
            <span className="flex items-center gap-1">
              <IoTimeOutline />
              {rating.daysUsed} days using app
            </span>
          )}
          <span
            className={`flex items-center gap-1 ${
              rating.wouldRecommend ? "text-green-400" : "text-red-400"
            }`}
          >
            {rating.wouldRecommend ? <IoHeart /> : <IoThumbsDownOutline />}
            {rating.wouldRecommend ? "Recommends" : "Does not recommend"}
          </span>
        </div>
      </div>
    </div>
  );
};

// Platform Rating Stats Component
const PlatformRatingStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/ratings/stats");
        if (response.data.status === "OK") {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching platform stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="glass-card p-6 rounded-xl">
        <div className="text-white/70 text-center">Loading stats...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="glass-card p-6 rounded-xl">
        <div className="text-white/70 text-center">
          No rating stats available
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 rounded-xl">
      <h3 className="text-xl font-semibold text-white mb-6">
        Platform Ratings
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Average Rating */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <StarRating
              rating={Math.round(stats.averageRating)}
              interactive={false}
              size="text-lg"
            />
          </div>
          <div className="text-2xl font-bold text-white">
            {stats.averageRating}
          </div>
          <div className="text-white/60 text-sm">Average Rating</div>
        </div>

        {/* Total Ratings */}
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {stats.totalRatings}
          </div>
          <div className="text-white/60 text-sm">Total Ratings</div>
        </div>

        {/* Recommendation Rate */}
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">
            {stats.recommendationRate}
          </div>
          <div className="text-white/60 text-sm">Recommend Rate</div>
        </div>

        {/* 5-Star Ratings */}
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {stats.distribution[5]}
          </div>
          <div className="text-white/60 text-sm">5-Star Ratings</div>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="mb-6">
        <h4 className="text-white font-medium mb-3">Rating Distribution</h4>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = stats.distribution[star] || 0;
            const percentage =
              stats.totalRatings > 0 ? (count / stats.totalRatings) * 100 : 0;

            return (
              <div key={star} className="flex items-center gap-3">
                <span className="text-white/70 text-sm w-8">{star}★</span>
                <div className="flex-1 bg-white/10 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-white/60 text-sm w-12">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Aspect Breakdown */}
      {Object.keys(stats.aspectAverages).length > 0 && (
        <div>
          <h4 className="text-white font-medium mb-3">Rating by Aspect</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(stats.aspectAverages).map(([aspect, data]) => (
              <div
                key={aspect}
                className="flex justify-between items-center p-3 bg-white/5 rounded-lg"
              >
                <span className="text-white/80 capitalize">
                  {aspect.replace("-", " ")}
                </span>
                <div className="flex items-center gap-2">
                  <StarRating
                    rating={Math.round(data.average)}
                    interactive={false}
                    size="text-sm"
                  />
                  <span className="text-white/60 text-sm">({data.count})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Main User Rating Page Component
const UserRatingPage = () => {
  const [activeTab, setActiveTab] = useState("view"); // 'view', 'create', 'edit', 'my-ratings'
  const [myRatings, setMyRatings] = useState([]);
  const [editingRating, setEditingRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canRate, setCanRate] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
  });

  useEffect(() => {
    fetchMyRatings();
  }, []);

  const fetchMyRatings = async () => {
    setLoading(true);
    try {
      const response = await api.get("/ratings/my-ratings");
      if (response.data.status === "OK") {
        setMyRatings(response.data.data.ratings);
        setPagination(response.data.data.pagination);

        // Check if user can rate (no rating in last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentRating = response.data.data.ratings.find(
          (rating) => new Date(rating.createdAt) > thirtyDaysAgo
        );
        setCanRate(!recentRating);
      }
    } catch (error) {
      console.error("Error fetching ratings:", error);
      if (error.response?.status === 401) {
        alert("Please login to view your ratings");
        // Redirect to login page
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRating = async (formData) => {
    try {
      const response = await api.post("/ratings", formData);
      if (response.data.status === "OK") {
        alert(response.data.message);
        setActiveTab("my-ratings");
        fetchMyRatings();
      }
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  };

  const handleUpdateRating = async (formData) => {
    try {
      const response = await api.put(`/ratings/${editingRating._id}`, formData);
      if (response.data.status === "OK") {
        alert(response.data.message);
        setEditingRating(null);
        setActiveTab("my-ratings");
        fetchMyRatings();
      }
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  };

  const handleEditRating = (rating) => {
    setEditingRating(rating);
    setActiveTab("edit");
  };

  const handleDeleteRating = async (ratingId) => {
    if (window.confirm("Are you sure you want to delete this rating?")) {
      try {
        const response = await api.delete(`/ratings/${ratingId}`);
        if (response.data.status === "OK") {
          alert(response.data.message);
          fetchMyRatings();
        }
      } catch (error) {
        console.error("Error deleting rating:", error);
        if (error.response?.data?.message) {
          alert(error.response.data.message);
        } else {
          alert("Failed to delete rating. Please try again.");
        }
      }
    }
  };

  const getTabLabel = (tab) => {
    switch (tab) {
      case "view":
        return "Platform Stats";
      case "my-ratings":
        return "My Ratings";
      case "create":
        return "Add Rating";
      case "edit":
        return "Edit Rating";
      default:
        return tab;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-purple-900/20 to-pink-900/20 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Rating Services
          </h1>
          <p className="text-white/70">
            Share your experience and help us improve services
          </p>
          {!canRate && (
            <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
              <p className="text-yellow-400 text-sm">
                You can rate again after 30 days from your last rating
              </p>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="glass-card p-1 rounded-lg">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab("view")}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  activeTab === "view"
                    ? "bg-purple-500 text-white"
                    : "text-white/70 hover:text-white"
                }`}
              >
                Platform Stats
              </button>
              <button
                onClick={() => setActiveTab("my-ratings")}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  activeTab === "my-ratings"
                    ? "bg-purple-500 text-white"
                    : "text-white/70 hover:text-white"
                }`}
              >
                My Ratings ({myRatings.length})
              </button>
              {canRate && (
                <button
                  onClick={() => setActiveTab("create")}
                  className={`px-6 py-2 rounded-lg transition-colors ${
                    activeTab === "create"
                      ? "bg-purple-500 text-white"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  Add Rating
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === "view" && <PlatformRatingStats />}

          {activeTab === "my-ratings" && (
            <div>
              {loading ? (
                <div className="glass-card p-6 rounded-xl text-center text-white/70">
                  Loading your ratings...
                </div>
              ) : myRatings.length > 0 ? (
                <div className="space-y-4">
                  <div className="glass-card p-4 rounded-xl">
                    <div className="flex justify-between items-center text-white/70 text-sm">
                      <span>Total: {pagination.total} rating(s)</span>
                      {!canRate && (
                        <span className="text-yellow-400">
                          Next rating available in 30 days
                        </span>
                      )}
                    </div>
                  </div>
                  {myRatings.map((rating) => (
                    <RatingCard
                      key={rating._id}
                      rating={rating}
                      onEdit={handleEditRating}
                      onDelete={handleDeleteRating}
                    />
                  ))}
                </div>
              ) : (
                <div className="glass-card p-8 rounded-xl text-center">
                  <h3 className="text-white text-lg mb-2">No ratings yet</h3>
                  <p className="text-white/70 mb-4">
                    You haven't rated our platform yet.
                  </p>
                  {canRate && (
                    <button
                      onClick={() => setActiveTab("create")}
                      className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                    >
                      Add Your First Rating
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "create" && canRate && (
            <RatingForm
              onSubmit={handleCreateRating}
              onCancel={() => setActiveTab("view")}
            />
          )}

          {activeTab === "edit" && editingRating && (
            <RatingForm
              onSubmit={handleUpdateRating}
              onCancel={() => {
                setEditingRating(null);
                setActiveTab("my-ratings");
              }}
              initialData={editingRating}
            />
          )}

          {activeTab === "create" && !canRate && (
            <div className="glass-card p-8 rounded-xl text-center">
              <h3 className="text-white text-lg mb-2">Rating Limit Reached</h3>
              <p className="text-white/70 mb-4">
                You can only rate once every 30 days. Please wait before
                submitting another rating.
              </p>
              <button
                onClick={() => setActiveTab("my-ratings")}
                className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
              >
                View Your Ratings
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserRatingPage;
