import React, { useState, useEffect } from "react";
import {
  IoBugOutline,
  IoBulbOutline,
  IoSadOutline,
  IoHappyOutline,
  IoHelpCircleOutline,
  IoSendOutline,
  IoTimeOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoCreateOutline,
  IoTrashOutline,
  IoEyeOutline,
  IoPersonOutline,
  IoCalendarOutline,
  IoArrowBackOutline,
  IoFilterOutline,
  IoRefreshOutline,
  IoAddOutline,
  IoAlertCircleOutline,
  IoWarningOutline,
  IoFlashOutline,
  IoSearchOutline,
} from "react-icons/io5";
import api from "../config/axios";

// Feedback Form Component
const FeedbackForm = ({
  onSubmit,
  onCancel,
  initialData = null,
  className = "",
}) => {
  const [formData, setFormData] = useState({
    type: initialData?.type || "bug",
    subject: initialData?.subject || "",
    message: initialData?.message || "",
    priority: initialData?.priority || "medium",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const typeOptions = [
    {
      value: "bug",
      label: "Bug Report",
      icon: IoBugOutline,
      color: "text-red-400",
      description: "Report a problem or error",
    },
    {
      value: "suggestion",
      label: "Suggestion",
      icon: IoBulbOutline,
      color: "text-yellow-400",
      description: "Share an idea for improvement",
    },
    {
      value: "complaint",
      label: "Complaint",
      icon: IoSadOutline,
      color: "text-orange-400",
      description: "Express dissatisfaction",
    },
    {
      value: "compliment",
      label: "Compliment",
      icon: IoHappyOutline,
      color: "text-green-400",
      description: "Share positive feedback",
    },
    {
      value: "other",
      label: "Other",
      icon: IoHelpCircleOutline,
      color: "text-blue-400",
      description: "Something else",
    },
  ];

  const priorityOptions = [
    {
      value: "low",
      label: "Low",
      icon: IoTimeOutline,
      color: "text-gray-400",
      description: "Not urgent",
    },
    {
      value: "medium",
      label: "Medium",
      icon: IoAlertCircleOutline,
      color: "text-blue-400",
      description: "Normal priority",
    },
    {
      value: "high",
      label: "High",
      icon: IoWarningOutline,
      color: "text-orange-400",
      description: "Important",
    },
    {
      value: "urgent",
      label: "Urgent",
      icon: IoFlashOutline,
      color: "text-red-400",
      description: "Needs immediate attention",
    },
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = "Subject must be at least 5 characters";
    } else if (formData.subject.trim().length > 200) {
      newErrors.subject = "Subject must not exceed 200 characters";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    } else if (formData.message.trim().length > 2000) {
      newErrors.message = "Message must not exceed 2000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      if (error.response?.data?.errors) {
        const apiErrors = {};
        error.response.data.errors.forEach((err) => {
          apiErrors[err.path] = err.msg;
        });
        setErrors(apiErrors);
      } else {
        alert(
          error.response?.data?.message ||
            "Failed to submit feedback. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedType = typeOptions.find(
    (option) => option.value === formData.type
  );
  const selectedPriority = priorityOptions.find(
    (option) => option.value === formData.priority
  );

  return (
    <div className={`glass-card p-6 rounded-xl ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 rounded-lg bg-white/10 ${selectedType?.color}`}>
          <selectedType.icon className="text-xl" />
        </div>
        <h3 className="text-xl font-semibold text-white">
          {initialData ? "Edit Feedback" : "Submit Feedback"}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type Selection */}
        <div>
          <label className="text-white/70 text-sm mb-3 block">
            Feedback Type *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {typeOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, type: option.value }))
                  }
                  className={`p-4 rounded-lg border transition-all text-left ${
                    formData.type === option.value
                      ? `bg-white/10 border-white/30 ${option.color}`
                      : "border-white/20 text-white/70 hover:border-white/30 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="text-lg" />
                    <span className="font-medium">{option.label}</span>
                  </div>
                  <p className="text-xs text-white/50">{option.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Priority Selection */}
        <div>
          <label className="text-white/70 text-sm mb-3 block">
            Priority Level
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {priorityOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, priority: option.value }))
                  }
                  className={`p-3 rounded-lg border transition-all text-center ${
                    formData.priority === option.value
                      ? `bg-white/10 border-white/30 ${option.color}`
                      : "border-white/20 text-white/70 hover:border-white/30 hover:bg-white/5"
                  }`}
                >
                  <Icon className="text-lg mx-auto mb-1" />
                  <div className="text-sm font-medium">{option.label}</div>
                  <div className="text-xs text-white/50">
                    {option.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="text-white/70 text-sm mb-2 block">Subject *</label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, subject: e.target.value }))
            }
            placeholder="Brief description of your feedback..."
            maxLength={200}
            className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500 ${
              errors.subject ? "border-red-500" : "border-white/20"
            }`}
          />
          <div className="flex justify-between items-center mt-1">
            <div className="text-white/50 text-xs">
              {formData.subject.length}/200 characters
            </div>
            {errors.subject && (
              <div className="text-red-400 text-xs">{errors.subject}</div>
            )}
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="text-white/70 text-sm mb-2 block">Message *</label>
          <textarea
            value={formData.message}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, message: e.target.value }))
            }
            placeholder="Please provide detailed information about your feedback..."
            maxLength={2000}
            rows={6}
            className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500 resize-none ${
              errors.message ? "border-red-500" : "border-white/20"
            }`}
          />
          <div className="flex justify-between items-center mt-1">
            <div className="text-white/50 text-xs">
              {formData.message.length}/2000 characters
            </div>
            {errors.message && (
              <div className="text-red-400 text-xs">{errors.message}</div>
            )}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <IoSendOutline />
            {isSubmitting
              ? "Submitting..."
              : initialData
              ? "Update Feedback"
              : "Submit Feedback"}
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

// Feedback Card Component
const FeedbackCard = ({
  feedback,
  onEdit,
  onDelete,
  onView,
  showActions = true,
}) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTypeConfig = (type) => {
    const configs = {
      bug: {
        label: "Bug Report",
        icon: IoBugOutline,
        color: "text-red-400",
        bgColor: "bg-red-500/20",
      },
      suggestion: {
        label: "Suggestion",
        icon: IoBulbOutline,
        color: "text-yellow-400",
        bgColor: "bg-yellow-500/20",
      },
      complaint: {
        label: "Complaint",
        icon: IoSadOutline,
        color: "text-orange-400",
        bgColor: "bg-orange-500/20",
      },
      compliment: {
        label: "Compliment",
        icon: IoHappyOutline,
        color: "text-green-400",
        bgColor: "bg-green-500/20",
      },
      other: {
        label: "Other",
        icon: IoHelpCircleOutline,
        color: "text-blue-400",
        bgColor: "bg-blue-500/20",
      },
    };
    return configs[type] || configs.other;
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        label: "Pending",
        icon: IoTimeOutline,
        color: "text-yellow-400",
        bgColor: "bg-yellow-500/20",
      },
      "in-review": {
        label: "In Review",
        icon: IoEyeOutline,
        color: "text-blue-400",
        bgColor: "bg-blue-500/20",
      },
      resolved: {
        label: "Resolved",
        icon: IoCheckmarkCircleOutline,
        color: "text-green-400",
        bgColor: "bg-green-500/20",
      },
      rejected: {
        label: "Rejected",
        icon: IoCloseCircleOutline,
        color: "text-red-400",
        bgColor: "bg-red-500/20",
      },
    };
    return configs[status] || configs.pending;
  };

  const getPriorityConfig = (priority) => {
    const configs = {
      low: { label: "Low", color: "text-gray-400" },
      medium: { label: "Medium", color: "text-blue-400" },
      high: { label: "High", color: "text-orange-400" },
      urgent: { label: "Urgent", color: "text-red-400" },
    };
    return configs[priority] || configs.medium;
  };

  const typeConfig = getTypeConfig(feedback.type);
  const statusConfig = getStatusConfig(feedback.status);
  const priorityConfig = getPriorityConfig(feedback.priority);
  const TypeIcon = typeConfig.icon;
  const StatusIcon = statusConfig.icon;

  return (
    <div className="glass-card p-6 rounded-xl">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          {feedback.user?.picture ? (
            <img
              src={feedback.user.picture}
              alt={feedback.user.name}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
              {feedback.user?.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h4 className="text-white font-medium">{feedback.user?.name}</h4>
            <p className="text-white/50 text-sm">
              {formatDate(feedback.createdAt)}
            </p>
          </div>
        </div>

        {showActions && (
          <div className="flex gap-2">
            <button
              onClick={() => onView(feedback)}
              className="text-blue-400 hover:text-blue-300 p-1"
              title="View Details"
            >
              <IoEyeOutline />
            </button>
            {feedback.status === "pending" && (
              <>
                <button
                  onClick={() => onEdit(feedback)}
                  className="text-green-400 hover:text-green-300 p-1"
                  title="Edit Feedback"
                >
                  <IoCreateOutline />
                </button>
                <button
                  onClick={() => onDelete(feedback._id)}
                  className="text-red-400 hover:text-red-300 p-1"
                  title="Delete Feedback"
                >
                  <IoTrashOutline />
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="space-y-3">
        {/* Type and Status */}
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full ${typeConfig.bgColor}`}
          >
            <TypeIcon className={`text-sm ${typeConfig.color}`} />
            <span className={`text-sm font-medium ${typeConfig.color}`}>
              {typeConfig.label}
            </span>
          </div>
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusConfig.bgColor}`}
          >
            <StatusIcon className={`text-sm ${statusConfig.color}`} />
            <span className={`text-sm font-medium ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
          </div>
          <div className={`text-sm ${priorityConfig.color}`}>
            {priorityConfig.label} Priority
          </div>
        </div>

        {/* Subject */}
        <h3 className="text-white font-medium text-lg">{feedback.subject}</h3>

        {/* Message Preview */}
        <p className="text-white/80 leading-relaxed">
          {feedback.message.length > 200
            ? `${feedback.message.substring(0, 200)}...`
            : feedback.message}
        </p>

        {/* Admin Response */}
        {feedback.adminResponse && (
          <div className="mt-4 p-4 bg-purple-500/20 border border-purple-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <IoPersonOutline className="text-purple-400" />
              <span className="text-purple-400 font-medium text-sm">
                Admin Response
              </span>
              <span className="text-white/50 text-xs">
                {formatDate(feedback.adminResponse.respondedAt)}
              </span>
            </div>
            <p className="text-white/90 text-sm">
              {feedback.adminResponse.message}
            </p>
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center gap-4 text-sm text-white/60 pt-2">
          <span className="flex items-center gap-1">
            <IoCalendarOutline />
            {formatDate(feedback.updatedAt)}
          </span>
          <span>ID: {feedback._id.slice(-6)}</span>
        </div>
      </div>
    </div>
  );
};

// Feedback Detail Modal
const FeedbackDetailModal = ({ feedback, onClose }) => {
  if (!feedback) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTypeConfig = (type) => {
    const configs = {
      bug: { label: "Bug Report", icon: IoBugOutline, color: "text-red-400" },
      suggestion: {
        label: "Suggestion",
        icon: IoBulbOutline,
        color: "text-yellow-400",
      },
      complaint: {
        label: "Complaint",
        icon: IoSadOutline,
        color: "text-orange-400",
      },
      compliment: {
        label: "Compliment",
        icon: IoHappyOutline,
        color: "text-green-400",
      },
      other: {
        label: "Other",
        icon: IoHelpCircleOutline,
        color: "text-blue-400",
      },
    };
    return configs[type] || configs.other;
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        label: "Pending",
        icon: IoTimeOutline,
        color: "text-yellow-400",
      },
      "in-review": {
        label: "In Review",
        icon: IoEyeOutline,
        color: "text-blue-400",
      },
      resolved: {
        label: "Resolved",
        icon: IoCheckmarkCircleOutline,
        color: "text-green-400",
      },
      rejected: {
        label: "Rejected",
        icon: IoCloseCircleOutline,
        color: "text-red-400",
      },
    };
    return configs[status] || configs.pending;
  };

  const typeConfig = getTypeConfig(feedback.type);
  const statusConfig = getStatusConfig(feedback.status);
  const TypeIcon = typeConfig.icon;
  const StatusIcon = statusConfig.icon;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="glass-card p-6 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-white">Feedback Details</h2>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white p-1"
          >
            <IoCloseCircleOutline className="text-2xl" />
          </button>
        </div>

        <div className="space-y-6">
          {/* User Info */}
          <div className="flex items-center gap-3">
            {feedback.user?.picture ? (
              <img
                src={feedback.user.picture}
                alt={feedback.user.name}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                {feedback.user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="text-white font-medium">{feedback.user?.name}</h3>
              <p className="text-white/50 text-sm">{feedback.user?.email}</p>
            </div>
          </div>

          {/* Type and Status */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <TypeIcon className={`text-lg ${typeConfig.color}`} />
              <span className={`font-medium ${typeConfig.color}`}>
                {typeConfig.label}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <StatusIcon className={`text-lg ${statusConfig.color}`} />
              <span className={`font-medium ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
            </div>
            <div className="text-white/70">{feedback.priority} Priority</div>
          </div>

          {/* Subject */}
          <div>
            <h4 className="text-white/70 text-sm mb-2">Subject</h4>
            <p className="text-white text-lg font-medium">{feedback.subject}</p>
          </div>

          {/* Message */}
          <div>
            <h4 className="text-white/70 text-sm mb-2">Message</h4>
            <div className="p-4 bg-white/5 rounded-lg">
              <p className="text-white/90 leading-relaxed whitespace-pre-wrap">
                {feedback.message}
              </p>
            </div>
          </div>

          {/* Admin Response */}
          {feedback.adminResponse && (
            <div>
              <h4 className="text-white/70 text-sm mb-2">Admin Response</h4>
              <div className="p-4 bg-purple-500/20 border border-purple-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <IoPersonOutline className="text-purple-400" />
                  <span className="text-purple-400 font-medium">
                    {feedback.adminResponse.respondedBy?.name || "Admin"}
                  </span>
                  <span className="text-white/50 text-sm">
                    {formatDate(feedback.adminResponse.respondedAt)}
                  </span>
                </div>
                <p className="text-white/90 whitespace-pre-wrap">
                  {feedback.adminResponse.message}
                </p>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4 text-sm text-white/60">
            <div>
              <span className="block text-white/40">Created</span>
              <span>{formatDate(feedback.createdAt)}</span>
            </div>
            <div>
              <span className="block text-white/40">Last Updated</span>
              <span>{formatDate(feedback.updatedAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Feedback List Component
const FeedbackList = ({ feedbacks, onEdit, onDelete, onView, loading }) => {
  if (loading) {
    return (
      <div className="glass-card p-8 rounded-xl text-center">
        <div className="text-white/70">Loading feedbacks...</div>
      </div>
    );
  }

  if (feedbacks.length === 0) {
    return (
      <div className="glass-card p-8 rounded-xl text-center">
        <h3 className="text-white text-lg mb-2">No feedback found</h3>
        <p className="text-white/70">
          No feedback matches your current filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {feedbacks.map((feedback) => (
        <FeedbackCard
          key={feedback._id}
          feedback={feedback}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
        />
      ))}
    </div>
  );
};

// Filters Component
const FeedbackFilters = ({ filters, onFiltersChange, onRefresh }) => {
  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "in-review", label: "In Review" },
    { value: "resolved", label: "Resolved" },
    { value: "rejected", label: "Rejected" },
  ];

  const typeOptions = [
    { value: "", label: "All Types" },
    { value: "bug", label: "Bug Report" },
    { value: "suggestion", label: "Suggestion" },
    { value: "complaint", label: "Complaint" },
    { value: "compliment", label: "Compliment" },
    { value: "other", label: "Other" },
  ];

  return (
    <div className="glass-card p-4 rounded-xl">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <IoFilterOutline className="text-white/70" />
          <span className="text-white/70 text-sm">Filters:</span>
        </div>

        <select
          value={filters.status}
          onChange={(e) =>
            onFiltersChange({ ...filters, status: e.target.value })
          }
          className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
        >
          {statusOptions.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-gray-800"
            >
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={filters.type}
          onChange={(e) =>
            onFiltersChange({ ...filters, type: e.target.value })
          }
          className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
        >
          {typeOptions.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-gray-800"
            >
              {option.label}
            </option>
          ))}
        </select>

        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-3 py-2 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
        >
          <IoRefreshOutline />
          <span className="text-sm">Refresh</span>
        </button>

        <button
          onClick={() => onFiltersChange({ status: "", type: "" })}
          className="text-white/50 hover:text-white text-sm"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};

// Main Feedback Component
const FeedbackComponent = () => {
  const [activeTab, setActiveTab] = useState("list"); // 'list', 'create', 'edit'
  const [feedbacks, setFeedbacks] = useState([]);
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [filters, setFilters] = useState({ status: "", type: "" });

  useEffect(() => {
    fetchMyFeedbacks();
  }, [filters, pagination.page]);

  const fetchMyFeedbacks = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: 10,
        ...(filters.status && { status: filters.status }),
        ...(filters.type && { type: filters.type }),
      };

      const response = await api.get("/feedback/my-feedback", { params });
      if (response.data.status === "OK") {
        setFeedbacks(response.data.data.feedback);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      if (error.response?.status === 401) {
        alert("Please login to view your feedback");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFeedback = async (formData) => {
    try {
      const response = await api.post("/feedback", formData);
      if (response.data.status === "OK") {
        alert(response.data.message);
        setActiveTab("list");
        fetchMyFeedbacks();
      }
    } catch (error) {
      throw error;
    }
  };

  const handleUpdateFeedback = async (formData) => {
    try {
      const response = await api.put(
        `/feedback/${editingFeedback._id}`,
        formData
      );
      if (response.data.status === "OK") {
        alert(response.data.message);
        setEditingFeedback(null);
        setActiveTab("list");
        fetchMyFeedbacks();
      }
    } catch (error) {
      throw error;
    }
  };

  const handleEditFeedback = (feedback) => {
    setEditingFeedback(feedback);
    setActiveTab("edit");
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (window.confirm("Are you sure you want to delete this feedback?")) {
      try {
        const response = await api.delete(`/feedback/${feedbackId}`);
        if (response.data.status === "OK") {
          alert(response.data.message);
          fetchMyFeedbacks();
        }
      } catch (error) {
        console.error("Error deleting feedback:", error);
        if (error.response?.data?.message) {
          alert(error.response.data.message);
        } else {
          alert("Failed to delete feedback. Please try again.");
        }
      }
    }
  };

  const handleViewFeedback = (feedback) => {
    setSelectedFeedback(feedback);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-purple-900/20 to-pink-900/20 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Feedback Center
          </h1>
          <p className="text-white/70">
            Share your thoughts and help us improve our services
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="glass-card p-1 rounded-lg">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab("list")}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  activeTab === "list"
                    ? "bg-purple-500 text-white"
                    : "text-white/70 hover:text-white"
                }`}
              >
                My Feedback ({pagination.total})
              </button>
              <button
                onClick={() => setActiveTab("create")}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors ${
                  activeTab === "create"
                    ? "bg-purple-500 text-white"
                    : "text-white/70 hover:text-white"
                }`}
              >
                <IoAddOutline />
                Submit Feedback
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === "list" && (
            <>
              {/* Filters */}
              <FeedbackFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onRefresh={fetchMyFeedbacks}
              />

              {/* Feedback List */}
              <FeedbackList
                feedbacks={feedbacks}
                onEdit={handleEditFeedback}
                onDelete={handleDeleteFeedback}
                onView={handleViewFeedback}
                loading={loading}
              />

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="glass-card p-4 rounded-xl">
                  <div className="flex justify-between items-center">
                    <div className="text-white/70 text-sm">
                      Showing {(pagination.page - 1) * 10 + 1} to{" "}
                      {Math.min(pagination.page * 10, pagination.total)} of{" "}
                      {pagination.total} results
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="px-3 py-1 bg-white/10 border border-white/20 text-white/70 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
                      >
                        Previous
                      </button>
                      <span className="px-3 py-1 text-white/70">
                        Page {pagination.page} of {pagination.pages}
                      </span>
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.pages}
                        className="px-3 py-1 bg-white/10 border border-white/20 text-white/70 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === "create" && (
            <FeedbackForm
              onSubmit={handleCreateFeedback}
              onCancel={() => setActiveTab("list")}
            />
          )}

          {activeTab === "edit" && editingFeedback && (
            <FeedbackForm
              onSubmit={handleUpdateFeedback}
              onCancel={() => {
                setEditingFeedback(null);
                setActiveTab("list");
              }}
              initialData={editingFeedback}
            />
          )}
        </div>

        {/* Detail Modal */}
        {selectedFeedback && (
          <FeedbackDetailModal
            feedback={selectedFeedback}
            onClose={() => setSelectedFeedback(null)}
          />
        )}
      </div>
    </div>
  );
};

export default FeedbackComponent;
