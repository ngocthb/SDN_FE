import React, { useState, useEffect } from "react";
import {
  IoStarOutline,
  IoStar,
  IoThumbsUpOutline,
  IoThumbsDownOutline,
  IoSendOutline,
  IoTimeOutline,
  IoCheckmarkCircleOutline,
  IoCreateOutline,
  IoTrashOutline,
  IoHeartOutline,
  IoHeart,
  IoGiftOutline,
  IoDiamondOutline,
  IoInformationCircleOutline,
} from "react-icons/io5";
import { LuCrown } from "react-icons/lu";

import api from "../config/axios";

// Membership Badge Component - Simplified to show name only
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
  userSubscription = null,
}) => {
  const [formData, setFormData] = useState({
    rating: initialData?.rating || 0,
    aspectRated: initialData?.aspectRated || "overall",
    comment: initialData?.comment || "",
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
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">
          {initialData ? "Edit Your Rating" : "Rate Our Platform"}
        </h3>
        {userSubscription && (
          <MembershipBadge
            membershipType={userSubscription.membershipType}
            membershipName={userSubscription.membershipName}
            size="md"
          />
        )}
      </div>

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

// Rating Card Component
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
          {/* Display membership name only */}
          {(rating.subscription?.membershipId?.name ||
            rating.membershipName ||
            rating.membershipPackage ||
            rating.membershipType) && (
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
            />
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

// Platform Rating Stats Component with CORRECT ENDPOINTS
const PlatformRatingStats = () => {
  const [stats, setStats] = useState(null);
  const [membershipStats, setMembershipStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      console.log("🚀 Fetching rating stats...");
      console.log("📡 API Base URL:", api.defaults.baseURL);

      try {
        setLoading(true);
        setError(null);

        // ✅ CORRECT ENDPOINTS - Fixed paths
        const [statsResponse, membershipResponse] = await Promise.all([
          api.get("/ratings/stats"), // ✅ Platform stats
          api.get("/ratings/stats/membership"), // ✅ Membership stats
        ]);

        console.log("✅ Stats Response:", statsResponse.data);
        console.log("✅ Membership Response:", membershipResponse.data);

        if (statsResponse.data?.status === "OK") {
          setStats(statsResponse.data.data);
        } else {
          console.warn("⚠️ Stats response not OK:", statsResponse.data);
        }

        if (membershipResponse.data?.status === "OK") {
          setMembershipStats(membershipResponse.data.data);
        } else {
          console.warn(
            "⚠️ Membership response not OK:",
            membershipResponse.data
          );
        }
      } catch (error) {
        console.error("❌ Error fetching stats:", error);
        setError(`Failed to load stats: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="glass-card p-6 rounded-xl">
        <div className="text-white/70 text-center">🔄 Loading stats...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-6 rounded-xl bg-red-500/10 border border-red-500/30">
        <div className="text-red-400 text-center">
          <h3 className="font-semibold mb-2">❌ Error Loading Stats</h3>
          <p className="text-sm">{error}</p>
          <p className="text-xs mt-2 text-red-300">
            Check console for more details
          </p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="glass-card p-6 rounded-xl">
        <div className="text-white/70 text-center">
          <h3 className="font-semibold mb-2">📊 No Rating Stats Available</h3>
          <p className="text-sm">
            No ratings have been submitted yet or API returned empty data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Card */}
      <div className="glass-card p-6 rounded-xl">
        <h3 className="text-xl font-semibold text-white mb-6">
          📊 Platform Ratings Overview
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <StarRating
                rating={Math.round(stats.averageRating || 0)}
                interactive={false}
                size="text-lg"
              />
            </div>
            <div className="text-2xl font-bold text-white">
              {stats.averageRating || 0}
            </div>
            <div className="text-white/60 text-sm">Average Rating</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {stats.totalRatings || 0}
            </div>
            <div className="text-white/60 text-sm">Total Ratings</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {stats.recommendationRate || "0%"}
            </div>
            <div className="text-white/60 text-sm">Recommend Rate</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {stats.distribution?.[5] || 0}
            </div>
            <div className="text-white/60 text-sm">5-Star Ratings</div>
          </div>
        </div>

        {/* Rating Distribution */}
        {stats.distribution && (
          <div className="mb-6">
            <h4 className="text-white font-medium mb-3">Rating Distribution</h4>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats.distribution[star] || 0;
                const percentage =
                  stats.totalRatings > 0
                    ? (count / stats.totalRatings) * 100
                    : 0;

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
        )}

        {/* Aspect Breakdown */}
        {stats.aspectAverages &&
          Object.keys(stats.aspectAverages).length > 0 && (
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
                      <span className="text-white/60 text-sm">
                        ({data.count})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>

      {/* Membership Stats Card */}
      {membershipStats.length > 0 && (
        <div className="glass-card p-6 rounded-xl">
          <h3 className="text-xl font-semibold text-white mb-6">
            👥 Ratings by Membership
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {membershipStats.map((stat, index) => {
              // Since we removed membershipType virtual field,
              // just use membershipName from the API response
              const displayName = stat.membershipName || "Free Users";

              return (
                <div
                  key={`membership-stat-${index}-${
                    stat.membershipName || "free"
                  }`}
                  className="bg-white/5 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <MembershipBadge membershipName={displayName} size="md" />
                    <div className="text-right">
                      <div className="text-lg font-bold text-white">
                        {stat.avgRating}
                      </div>
                      <div className="text-white/60 text-xs">Avg Rating</div>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-white/70">
                    <span>{stat.totalRatings} ratings</span>
                    <span>{stat.recommendationRate}% recommend</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// Main User Rating Page Component
const UserRatingPage = () => {
  const [activeTab, setActiveTab] = useState("view");
  const [myRatings, setMyRatings] = useState([]);
  const [editingRating, setEditingRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canRateInfo, setCanRateInfo] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return; // Chưa login thì không gọi API
    checkCanRateAndFetchRatings();
  }, []);

  const checkCanRateAndFetchRatings = async () => {
    setLoading(true);
    try {
      // ✅ Check if user can rate and get subscription info
      const canRateResponse = await api.get("/ratings/can-rate");
      if (canRateResponse.data.status === "OK") {
        setCanRateInfo(canRateResponse.data.data);
        console.log("✅ Can rate info:", canRateResponse.data.data);
      }

      // ✅ CORRECT ENDPOINT - Fetch user ratings
      const ratingsResponse = await api.get("/ratings/my-ratings");
      if (ratingsResponse.data.status === "OK") {
        setMyRatings(ratingsResponse.data.data.ratings);
        setPagination(ratingsResponse.data.data.pagination);
        console.log("✅ My ratings:", ratingsResponse.data.data);
      }
    } catch (error) {
      console.error("❌ Error fetching data:", error);
      if (error.response?.status === 401) {
        alert("Please login to view your ratings");
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
        checkCanRateAndFetchRatings();
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
        checkCanRateAndFetchRatings();
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
          checkCanRateAndFetchRatings();
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

  const canRate = canRateInfo?.canRate || false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-purple-900/20 to-pink-900/20 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Rating Services
          </h1>
          <p className="text-white/70">
            Share your experience and help us improve our services
          </p>

          {/* Subscription Info */}
          {canRateInfo && (
            <div className="mt-4 flex justify-center">
              <div className="glass-card p-4 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="text-white/80 text-sm">Membership:</div>
                  <MembershipBadge
                    membershipType={canRateInfo.membershipType}
                    membershipName={canRateInfo.membershipName}
                    size="md"
                  />
                  {!canRate && (
                    <div className="text-yellow-400 text-sm flex items-center gap-1">
                      <IoInformationCircleOutline />
                      Next rating available in 30 days
                    </div>
                  )}
                </div>
              </div>
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
              userSubscription={canRateInfo}
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
              userSubscription={canRateInfo}
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
