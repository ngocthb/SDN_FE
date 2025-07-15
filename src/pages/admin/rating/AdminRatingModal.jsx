// AdminRatingModal.jsx
import {
  IoCloseOutline,
  IoPersonOutline,
  IoCalendarOutline,
  IoStar,
  IoStarOutline,
  IoStatsChartOutline,
  IoTrendingUpOutline,
  IoEyeOutline,
  IoThumbsUpOutline,
  IoThumbsDownOutline,
  IoHeartOutline,
  IoHeart,
  IoTimeOutline,
  IoCheckmarkCircleOutline,
  IoInformationCircleOutline,
  IoShieldCheckmarkOutline,
} from "react-icons/io5";
import { LuCrown } from "react-icons/lu";
import api from "../../../config/axios";

// Membership Badge Component (reused from other components)
const MembershipBadge = ({ membershipType, membershipName, size = "md" }) => {
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
      className={`inline-flex items-center gap-2 rounded-full border ${config.bgColor} ${config.borderColor} ${config.color} ${sizeClasses}`}
    >
      {config.icon}
      <span className="font-medium">{config.label}</span>
    </div>
  );
};

// Star Rating Component
const StarRating = ({ rating, size = "text-xl" }) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={`text-yellow-400 ${size}`}>
          {star <= rating ? <IoStar /> : <IoStarOutline />}
        </span>
      ))}
    </div>
  );
};

function AdminRatingModal({ rating, onClose }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateShort = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRatingColor = (ratingValue) => {
    if (ratingValue >= 4) return "text-green-400";
    if (ratingValue >= 3) return "text-yellow-400";
    if (ratingValue >= 2) return "text-orange-400";
    return "text-red-400";
  };

  const getRatingLabel = (ratingValue) => {
    switch (ratingValue) {
      case 5:
        return "Excellent";
      case 4:
        return "Good";
      case 3:
        return "Average";
      case 2:
        return "Poor";
      case 1:
        return "Very Poor";
      default:
        return "Unknown";
    }
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
        return <IoPersonOutline className="text-pink-400" />;
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

  // Enhanced membership name logic
  const getMembershipDisplayName = () => {
    return (
      rating.subscription?.membershipId?.name ||
      rating.membershipName ||
      (rating.membershipPackage !== "free" ? rating.membershipPackage : null) ||
      (rating.membershipType !== "free" ? rating.membershipType : "Free")
    );
  };

  const getSubscriptionStatus = () => {
    if (!rating.subscription) return null;

    const currentDate = new Date();
    const startDate = new Date(rating.subscription.startDate);
    const endDate = new Date(rating.subscription.endDate);

    const isActive =
      rating.subscription.status === "active" &&
      startDate <= currentDate &&
      endDate >= currentDate;

    return {
      status: rating.subscription.status,
      isActive,
      startDate: rating.subscription.startDate,
      endDate: rating.subscription.endDate,
    };
  };

  const subscriptionInfo = getSubscriptionStatus();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Enhanced Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/20">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-white">Rating Details</h2>
            <div className="flex items-center gap-3">
              <StarRating rating={rating.rating} size="text-lg" />
              <span
                className={`font-bold text-xl ${getRatingColor(rating.rating)}`}
              >
                {rating.rating}/5
              </span>
              <span className="text-white/70 text-sm">
                ({getRatingLabel(rating.rating)})
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
          >
            <IoCloseOutline size={24} />
          </button>
        </div>

        {/* Enhanced Content */}
        <div className="p-6 space-y-6">
          {/* User & Basic Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Enhanced User Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <IoPersonOutline />
                User Information
              </h3>

              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-4 mb-4">
                  {rating.user?.picture ? (
                    <img
                      src={rating.user.picture}
                      alt={rating.user?.name}
                      className="w-16 h-16 rounded-full"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-white text-xl font-semibold">
                      {rating.user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-white">
                      {rating.user?.name}
                    </h4>
                    <p className="text-white/70">{rating.user?.email}</p>
                  </div>
                </div>

                {/* Enhanced Membership Display */}
                <div className="space-y-3">
                  <div>
                    <label className="text-white/70 text-sm block mb-2">
                      Membership:
                    </label>
                    <MembershipBadge
                      membershipName={getMembershipDisplayName()}
                      size="md"
                    />
                  </div>

                  {/* Subscription Details */}
                  {subscriptionInfo && (
                    <div className="mt-3 p-3 bg-white/5 rounded border border-white/20">
                      <label className="text-white/70 text-xs block mb-2">
                        Subscription Status:
                      </label>
                      <div className="flex items-center gap-2 mb-2">
                        {subscriptionInfo.isActive ? (
                          <IoShieldCheckmarkOutline className="text-green-400" />
                        ) : (
                          <IoInformationCircleOutline className="text-yellow-400" />
                        )}
                        <span
                          className={`text-sm font-medium ${
                            subscriptionInfo.isActive
                              ? "text-green-400"
                              : "text-yellow-400"
                          }`}
                        >
                          {subscriptionInfo.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-xs text-white/60 space-y-1">
                        <div>
                          Start: {formatDateShort(subscriptionInfo.startDate)}
                        </div>
                        <div>
                          End: {formatDateShort(subscriptionInfo.endDate)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Days Used */}
                  {rating.daysUsed !== undefined && (
                    <div className="flex items-center gap-2 text-sm">
                      <IoTimeOutline className="text-blue-400" />
                      <span className="text-white/70">Used app for:</span>
                      <span className="text-white font-medium">
                        {rating.daysUsed} days
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Rating Meta */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <IoStatsChartOutline />
                Rating Information
              </h3>

              {/* Aspect Rated */}
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <label className="text-white/70 text-sm block mb-2">
                  Aspect Rated:
                </label>
                <div className="flex items-center gap-3">
                  {getAspectIcon(rating.aspectRated)}
                  <span className="text-white font-medium text-lg">
                    {getAspectLabel(rating.aspectRated)}
                  </span>
                </div>
              </div>

              {/* Date Information */}
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <label className="text-white/70 text-sm block mb-2">
                  Submitted:
                </label>
                <p className="text-white flex items-center gap-2">
                  <IoCalendarOutline />
                  {formatDate(rating.createdAt)}
                </p>
                {rating.updatedAt && rating.updatedAt !== rating.createdAt && (
                  <p className="text-white/60 text-sm mt-1 flex items-center gap-2">
                    <IoTimeOutline />
                    Updated: {formatDate(rating.updatedAt)}
                  </p>
                )}
              </div>

              {/* Recommendation */}
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <label className="text-white/70 text-sm block mb-3">
                  Would Recommend:
                </label>
                <div className="flex items-center gap-3">
                  {rating.wouldRecommend ? (
                    <>
                      <div className="flex items-center gap-2 px-3 py-2 bg-green-500/20 border border-green-500/50 rounded-lg">
                        <IoHeart className="text-green-400 text-xl" />
                        <span className="text-green-400 font-medium">
                          Yes, recommends it
                        </span>
                      </div>
                    </>
                  ) : rating.wouldRecommend === false ? (
                    <>
                      <div className="flex items-center gap-2 px-3 py-2 bg-red-500/20 border border-red-500/50 rounded-lg">
                        <IoThumbsDownOutline className="text-red-400 text-xl" />
                        <span className="text-red-400 font-medium">
                          Does not recommend
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-500/20 border border-gray-500/50 rounded-lg">
                      <IoInformationCircleOutline className="text-gray-400 text-xl" />
                      <span className="text-gray-400 font-medium">
                        Not specified
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Rating Display */}
          <div className="p-6 bg-white/5 rounded-xl border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">
              Rating Breakdown
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Visual Rating */}
              <div className="text-center">
                <div
                  className={`text-7xl font-bold mb-3 ${getRatingColor(
                    rating.rating
                  )}`}
                >
                  {rating.rating}
                </div>
                <div className="flex justify-center mb-3">
                  <StarRating rating={rating.rating} size="text-2xl" />
                </div>
                <p className="text-white/70 text-lg font-medium">
                  {getRatingLabel(rating.rating)} Rating
                </p>
              </div>

              {/* Rating Context */}
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {getAspectIcon(rating.aspectRated)}
                    <span className="text-white font-medium">
                      {getAspectLabel(rating.aspectRated)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarRating rating={rating.rating} size="text-sm" />
                    <span
                      className={`font-bold ${getRatingColor(rating.rating)}`}
                    >
                      {rating.rating}/5
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-lg">
                  <div className="text-white/70 text-sm mb-1">
                    Submitted by:
                  </div>
                  <div className="flex items-center gap-2">
                    <MembershipBadge
                      membershipName={getMembershipDisplayName()}
                      size="sm"
                    />
                    <span className="text-white text-sm">member</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Comment Section */}
          {rating.comment && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">User Review</h3>
              <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {rating.user?.picture ? (
                      <img
                        src={rating.user.picture}
                        alt={rating.user?.name}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {rating.user?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-white font-medium">
                        {rating.user?.name}
                      </span>
                      <span className="text-white/50 text-sm">•</span>
                      <StarRating rating={rating.rating} size="text-sm" />
                    </div>
                    <p className="text-white leading-relaxed whitespace-pre-wrap text-lg">
                      "{rating.comment}"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Technical Details for Admin */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Information */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">
                System Information
              </h3>
              <div className="space-y-2">
                <div className="p-3 bg-white/5 rounded-lg">
                  <label className="text-white/70 text-xs block">
                    Rating ID:
                  </label>
                  <p className="text-white font-mono text-sm break-all">
                    {rating._id}
                  </p>
                </div>

                <div className="p-3 bg-white/5 rounded-lg">
                  <label className="text-white/70 text-xs block">
                    User ID:
                  </label>
                  <p className="text-white font-mono text-sm break-all">
                    {rating.user?._id}
                  </p>
                </div>

                {rating.subscription && (
                  <div className="p-3 bg-white/5 rounded-lg">
                    <label className="text-white/70 text-xs block">
                      Subscription ID:
                    </label>
                    <p className="text-white font-mono text-sm break-all">
                      {rating.subscription._id}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Timestamp Information */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Timeline</h3>
              <div className="space-y-2">
                <div className="p-3 bg-white/5 rounded-lg">
                  <label className="text-white/70 text-xs block">
                    Created:
                  </label>
                  <p className="text-white font-medium">
                    {formatDate(rating.createdAt)}
                  </p>
                </div>

                {rating.updatedAt && (
                  <div className="p-3 bg-white/5 rounded-lg">
                    <label className="text-white/70 text-xs block">
                      Last Updated:
                    </label>
                    <p className="text-white font-medium">
                      {formatDate(rating.updatedAt)}
                    </p>
                  </div>
                )}

                {subscriptionInfo && (
                  <div className="p-3 bg-white/5 rounded-lg">
                    <label className="text-white/70 text-xs block">
                      Subscription Period:
                    </label>
                    <p className="text-white font-medium text-sm">
                      {formatDateShort(subscriptionInfo.startDate)} →{" "}
                      {formatDateShort(subscriptionInfo.endDate)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Footer */}
        <div className="flex justify-between items-center p-6 border-t border-white/20">
          <div className="flex items-center gap-4 text-white/50 text-sm">
            <span>Rating ID: {rating._id.slice(-8)}</span>
            <span>•</span>
            <span>Submitted {formatDate(rating.createdAt)}</span>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg hover:border-white/40 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminRatingModal;
