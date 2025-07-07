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
} from "react-icons/io5";
import api from "../../../config/axios";

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

  const renderStars = (ratingValue) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} className="text-yellow-400 text-xl">
        {index < ratingValue ? <IoStar /> : <IoStarOutline />}
      </span>
    ));
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

  const getMembershipColor = (membership) => {
    switch (membership) {
      case "vip":
        return "text-purple-300 bg-purple-500/20 border-purple-500/30";
      case "premium":
        return "text-yellow-300 bg-yellow-500/20 border-yellow-500/30";
      case "basic":
        return "text-blue-300 bg-blue-500/20 border-blue-500/30";
      default:
        return "text-gray-300 bg-gray-500/20 border-gray-500/30";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/20">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-white">Rating Details</h2>
            <div className="flex items-center gap-2">
              {renderStars(rating.rating)}
              <span
                className={`ml-2 font-bold text-lg ${getRatingColor(
                  rating.rating
                )}`}
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
            className="text-white/70 hover:text-white transition-colors"
          >
            <IoCloseOutline size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* User & Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <img
                  src={rating.user?.picture || "/default-avatar.png"}
                  alt={rating.user?.name}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <IoPersonOutline />
                    {rating.user?.name}
                  </h3>
                  <p className="text-white/70">{rating.user?.email}</p>
                  <span
                    className={`inline-block mt-2 px-3 py-1 rounded-full text-sm capitalize border ${getMembershipColor(
                      rating.membershipPackage
                    )}`}
                  >
                    {rating.membershipPackage || "Free"} Member
                  </span>
                </div>
              </div>
            </div>

            {/* Rating Meta */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <label className="text-white/70 text-sm">Aspect Rated:</label>
                  <div className="flex items-center gap-2 mt-1">
                    {getAspectIcon(rating.aspectRated)}
                    <span className="text-white capitalize font-medium">
                      {rating.aspectRated?.replace("-", " ") ||
                        "Overall Experience"}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <label className="text-white/70 text-sm">Submitted:</label>
                  <p className="text-white flex items-center gap-2 mt-1">
                    <IoCalendarOutline />
                    {formatDate(rating.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Rating Breakdown */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">
              Rating Breakdown
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Rating Visual */}
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="text-center">
                  <div
                    className={`text-6xl font-bold mb-2 ${getRatingColor(
                      rating.rating
                    )}`}
                  >
                    {rating.rating}
                  </div>
                  <div className="flex justify-center mb-2">
                    {renderStars(rating.rating)}
                  </div>
                  <p className="text-white/70 text-sm">
                    {getRatingLabel(rating.rating)} Rating
                  </p>
                </div>
              </div>

              {/* Recommendation */}
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <label className="text-white/70 text-sm block mb-2">
                  Would Recommend:
                </label>
                <div className="flex items-center gap-2">
                  {rating.wouldRecommend ? (
                    <>
                      <IoThumbsUpOutline className="text-green-400 text-xl" />
                      <span className="text-green-400 font-medium">
                        Yes, would recommend
                      </span>
                    </>
                  ) : rating.wouldRecommend === false ? (
                    <>
                      <IoThumbsDownOutline className="text-red-400 text-xl" />
                      <span className="text-red-400 font-medium">
                        Would not recommend
                      </span>
                    </>
                  ) : (
                    <>
                      <IoCloseOutline className="text-gray-400 text-xl" />
                      <span className="text-gray-400 font-medium">
                        Not specified
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Comment */}
          {rating.comment && (
            <div className="space-y-2">
              <label className="text-white/70 text-sm">User Comment:</label>
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-white leading-relaxed whitespace-pre-wrap">
                  {rating.comment}
                </p>
              </div>
            </div>
          )}

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Context */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">User Context</h3>
              <div className="space-y-3">
                <div className="p-3 bg-white/5 rounded-lg">
                  <label className="text-white/70 text-xs">
                    Membership Package:
                  </label>
                  <p className="text-white capitalize font-medium">
                    {rating.membershipPackage || "Free"}
                  </p>
                </div>

                {rating.daysUsed !== undefined && (
                  <div className="p-3 bg-white/5 rounded-lg">
                    <label className="text-white/70 text-xs">
                      Days Used App:
                    </label>
                    <p className="text-white font-medium">
                      {rating.daysUsed} days
                    </p>
                  </div>
                )}

                {rating.user?.joinedAt && (
                  <div className="p-3 bg-white/5 rounded-lg">
                    <label className="text-white/70 text-xs">
                      Member Since:
                    </label>
                    <p className="text-white font-medium">
                      {formatDate(rating.user.joinedAt)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Rating Analytics */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Analytics</h3>
              <div className="space-y-3">
                <div className="p-3 bg-white/5 rounded-lg">
                  <label className="text-white/70 text-xs">Rating ID:</label>
                  <p className="text-white font-mono text-sm">{rating._id}</p>
                </div>

                <div className="p-3 bg-white/5 rounded-lg">
                  <label className="text-white/70 text-xs">Submitted:</label>
                  <p className="text-white font-medium">
                    {formatDate(rating.createdAt)}
                  </p>
                </div>

                <div className="p-3 bg-white/5 rounded-lg">
                  <label className="text-white/70 text-xs">Last Updated:</label>
                  <p className="text-white font-medium">
                    {formatDate(rating.updatedAt || rating.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-white/20">
          <div className="text-white/50 text-sm">
            Rating submitted on {formatDate(rating.createdAt)}
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 text-white/70 hover:text-white border border-white/20 rounded-lg hover:border-white/40 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminRatingModal;
