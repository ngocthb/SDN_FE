import { useState } from "react";
import {
  IoCloseOutline,
  IoPersonOutline,
  IoCalendarOutline,
  IoSendOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoHourglassOutline,
  IoTimeOutline,
  IoAlertCircleOutline,
} from "react-icons/io5";
import api from "../../../config/axios";

// AdminFeedbackModal.jsx
function AdminFeedbackModal({ feedback, onClose, onUpdate }) {
  const [adminResponse, setAdminResponse] = useState(
    feedback.adminResponse?.message || ""
  );
  const [selectedStatus, setSelectedStatus] = useState(feedback.status);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
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
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "in-review":
        return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      case "resolved":
        return "text-green-400 bg-green-400/10 border-green-400/20";
      case "rejected":
        return "text-red-400 bg-red-400/10 border-red-400/20";
      default:
        return "text-gray-400 bg-gray-400/10 border-gray-400/20";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "text-red-500 bg-red-500/10 border-red-500/20";
      case "high":
        return "text-orange-400 bg-orange-400/10 border-orange-400/20";
      case "medium":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "low":
        return "text-green-400 bg-green-400/10 border-green-400/20";
      default:
        return "text-gray-400 bg-gray-400/10 border-gray-400/20";
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "urgent":
        return <IoAlertCircleOutline className="text-red-500" />;
      case "high":
        return <IoAlertCircleOutline className="text-orange-400" />;
      default:
        return <IoAlertCircleOutline className="text-yellow-400" />;
    }
  };

  const handleStatusUpdate = async () => {
    if (selectedStatus === feedback.status) return;

    setIsSubmitting(true);
    try {
      await api.put(`/admin/feedback/${feedback._id}/status`, {
        status: selectedStatus,
      });
      onUpdate(); // Refresh list
      alert("Status updated successfully!");
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Please try again.");
      setSelectedStatus(feedback.status); // Revert
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitResponse = async () => {
    if (!adminResponse.trim()) {
      alert("Please enter a response message");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(`/admin/feedback/${feedback._id}/respond`, {
        message: adminResponse.trim(),
        status: selectedStatus,
      });
      onUpdate(); // Refresh list
      alert("Response sent successfully!");
      onClose(); // Close modal after successful response
    } catch (error) {
      console.error("Error sending response:", error);
      alert("Failed to send response. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/20">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-white">Feedback Details</h2>
            <span
              className={`px-3 py-1 rounded-full text-sm capitalize flex items-center gap-2 border ${getStatusColor(
                feedback.status
              )}`}
            >
              {getStatusIcon(feedback.status)}
              {feedback.status.replace("-", " ")}
            </span>
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
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                <img
                  src={feedback.user?.picture || "/default-avatar.png"}
                  alt={feedback.user?.name}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <IoPersonOutline />
                    {feedback.user?.name}
                  </h3>
                  <p className="text-white/70">{feedback.user?.email}</p>
                  {feedback.user?.membershipPackage && (
                    <span className="inline-block mt-1 px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full capitalize">
                      {feedback.user.membershipPackage} Member
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Feedback Meta */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white/70 text-sm">Type:</label>
                  <p className="text-white capitalize font-medium">
                    {feedback.type}
                  </p>
                </div>
                <div>
                  <label className="text-white/70 text-sm">Priority:</label>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm capitalize border ${getPriorityColor(
                      feedback.priority
                    )}`}
                  >
                    {getPriorityIcon(feedback.priority)}
                    {feedback.priority}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-white/70 text-sm">Created:</label>
                <p className="text-white flex items-center gap-2">
                  <IoCalendarOutline />
                  {formatDate(feedback.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <label className="text-white/70 text-sm">Subject:</label>
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <h3 className="text-white font-medium text-lg">
                {feedback.subject}
              </h3>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <label className="text-white/70 text-sm">Message:</label>
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-white leading-relaxed whitespace-pre-wrap">
                {feedback.message}
              </p>
            </div>
          </div>

          {/* Previous Admin Response */}
          {feedback.adminResponse?.message && (
            <div className="space-y-2">
              <label className="text-white/70 text-sm">
                Previous Admin Response:
              </label>
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-white mb-2">
                  {feedback.adminResponse.message}
                </p>
                <div className="flex items-center gap-4 text-sm text-white/50">
                  <span>
                    By: {feedback.adminResponse.respondedBy?.name || "Admin"}
                  </span>
                  {feedback.adminResponse.respondedAt && (
                    <span>
                      On: {formatDate(feedback.adminResponse.respondedAt)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Status Update */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-white/70 text-sm">Update Status:</label>
              <div className="flex gap-2">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="pending">Pending</option>
                  <option value="in-review">In Review</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
                {selectedStatus !== feedback.status && (
                  <button
                    onClick={handleStatusUpdate}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50"
                  >
                    Update
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Admin Response Form */}
          <div className="space-y-4">
            <label className="text-white/70 text-sm">
              {feedback.adminResponse?.message
                ? "Update Response:"
                : "Send Response:"}
            </label>
            <div className="space-y-3">
              <textarea
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                placeholder="Type your response to the user..."
                className="w-full h-32 p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500 resize-none"
                maxLength={2000}
              />
              <div className="flex justify-between items-center">
                <span className="text-white/50 text-sm">
                  {adminResponse.length}/2000 characters
                </span>
                <button
                  onClick={handleSubmitResponse}
                  disabled={!adminResponse.trim() || isSubmitting}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <IoSendOutline />
                  {isSubmitting
                    ? "Sending..."
                    : feedback.adminResponse?.message
                    ? "Update Response"
                    : "Send Response"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-white/20">
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

export default AdminFeedbackModal;
