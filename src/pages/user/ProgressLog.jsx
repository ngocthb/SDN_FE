import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../../components/Navbar";
import {
  logDailyProgress,
  getTodayProgress,
  getProgressLogs,
  clearError,
  clearSuccess,
  clearNewAchievements,
  clearProgressLogState,
} from "../../redux/features/progressLog/progressLogSlice";
import {
  getCurrentPlan,
  clearQuitPlanState,
} from "../../redux/features/quitPlan/quitPlanSlice";
import { getMySubscription } from "../../redux/features/subscription/subscriptionSlice";
function ProgressLog() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    todayProgress,
    progressLogs,
    newAchievements,
    loading,
    error,
    success,
    message,
  } = useSelector((state) => state.progressLog);

  const {
    mySubscription,
    hasActiveSubscription,
    loading: subscriptionLoading,
  } = useSelector((state) => state.subscription);

  const { currentPlan } = useSelector((state) => state.quitPlan);

  // Form states
  const [formData, setFormData] = useState({
    cigarettesPerDay: 0,
    healthNote: "",
    mood: "",
  });
  const [limit, setLimit] = useState(30);
  const [showLogModal, setShowLogModal] = useState(false);

  // ✅ THÊM MỚI: Date filter states
  const [dateFilters, setDateFilters] = useState({
    startDate: "",
    endDate: "",
    useDateFilter: false,
  });

  // Mood options
  const moodOptions = [
    { value: "", label: "Chọn tâm trạng" },
    { value: "excellent", label: "😊 Tuyệt vời" },
    { value: "good", label: "🙂 Tốt" },
    { value: "normal", label: "😐 Bình thường" },
    { value: "stressed", label: "😰 Căng thẳng" },
    { value: "difficult", label: "😣 Khó khăn" },
  ];

  useEffect(() => {
    dispatch(getMySubscription());
  }, [dispatch]);

  useEffect(() => {
    if (!hasActiveSubscription && !subscriptionLoading) {
      dispatch(clearQuitPlanState());
      dispatch(clearProgressLogState());
    }
  }, [hasActiveSubscription, subscriptionLoading, dispatch]);

  useEffect(() => {
    if (hasActiveSubscription && !subscriptionLoading) {
      dispatch(getCurrentPlan());
      dispatch(getTodayProgress());
      if (
        dateFilters.useDateFilter &&
        dateFilters.startDate &&
        dateFilters.endDate
      ) {
        dispatch(
          getProgressLogs({
            startDate: dateFilters.startDate,
            endDate: dateFilters.endDate,
            limit,
          })
        );
      } else {
        dispatch(getProgressLogs({ limit }));
      }
    }
  }, [
    dispatch,
    limit,
    dateFilters,
    hasActiveSubscription,
    subscriptionLoading,
  ]);

  useEffect(() => {
    // Populate form data if updating existing progress
    if (todayProgress && showLogModal) {
      setFormData({
        cigarettesPerDay: todayProgress.cigarettesPerDay || 0,
        healthNote: todayProgress.healthNote || "",
        mood: todayProgress.mood || "",
      });
    } else if (!todayProgress && showLogModal) {
      // Reset form for new entry
      setFormData({
        cigarettesPerDay: 0,
        healthNote: "",
        mood: "",
      });
    }
  }, [todayProgress, showLogModal]);

  useEffect(() => {
    // Clear success message after 3 seconds
    if (success) {
      const timer = setTimeout(() => {
        dispatch(clearSuccess());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "cigarettesPerDay" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(logDailyProgress(formData));
    if (result.type === "progressLog/logDailyProgress/fulfilled") {
      setFormData({
        cigarettesPerDay: 0,
        healthNote: "",
        mood: "",
      });
      setShowLogModal(false);
      // Reload today's progress and logs after successful submission
      dispatch(getTodayProgress());
      dispatch(getProgressLogs({ limit }));
    }
  };

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value) || 30;
    setLimit(newLimit);
  };

  // ✅ THÊM MỚI: Handle date filter changes
  const handleDateFilterChange = (field, value) => {
    setDateFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleToggleDateFilter = () => {
    setDateFilters((prev) => ({
      ...prev,
      useDateFilter: !prev.useDateFilter,
      startDate: !prev.useDateFilter ? "" : prev.startDate,
      endDate: !prev.useDateFilter ? "" : prev.endDate,
    }));
  };

  const handleApplyDateFilter = () => {
    if (dateFilters.startDate && dateFilters.endDate) {
      // Validate dates
      const start = new Date(dateFilters.startDate);
      const end = new Date(dateFilters.endDate);

      if (start > end) {
        // Show error or swap dates
        setDateFilters((prev) => ({
          ...prev,
          startDate: dateFilters.endDate,
          endDate: dateFilters.startDate,
        }));
        return;
      }

      dispatch(
        getProgressLogs({
          startDate: dateFilters.startDate,
          endDate: dateFilters.endDate,
          limit,
        })
      );
    }
  };

  const handleClearDateFilter = () => {
    setDateFilters({
      startDate: "",
      endDate: "",
      useDateFilter: false,
    });
  };

  // ✅ THÊM MỚI: Quick date presets
  const handleQuickDateFilter = (preset) => {
    const today = new Date();
    const startDate = new Date();

    switch (preset) {
      case "week":
        startDate.setDate(today.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(today.getMonth() - 1);
        break;
      case "3months":
        startDate.setMonth(today.getMonth() - 3);
        break;
      case "year":
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      default:
        return;
    }

    setDateFilters({
      startDate: startDate.toISOString().split("T")[0],
      endDate: today.toISOString().split("T")[0],
      useDateFilter: true,
    });
  };

  const handleOpenModal = () => {
    setShowLogModal(true);
    // Clear any previous errors when opening modal
    if (error) {
      dispatch(clearError());
    }
  };

  const handleCloseModal = () => {
    setShowLogModal(false);
    // Reset form when closing
    if (!todayProgress) {
      setFormData({
        cigarettesPerDay: 0,
        healthNote: "",
        mood: "",
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  const getMoodDisplay = (mood) => {
    const moodOption = moodOptions.find((option) => option.value === mood);
    return moodOption ? moodOption.label : mood;
  };

  const getCigaretteStatusColor = (count) => {
    if (count === 0) return "text-green-400";
    if (count <= 5) return "text-yellow-400";
    if (count <= 10) return "text-orange-400";
    return "text-red-400";
  };

  const getCigaretteStatusBg = (count) => {
    if (count === 0) return "bg-green-500/10 border-green-500/30";
    if (count <= 5) return "bg-yellow-500/10 border-yellow-500/30";
    if (count <= 10) return "bg-orange-500/10 border-orange-500/30";
    return "bg-red-500/10 border-red-500/30";
  };

  if (!hasActiveSubscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-purple-900/20 to-pink-900/20">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 py-3">
              Nhật Ký Tiến Trình
            </h1>
            <p className="text-gray-400">
              Ghi nhận và theo dõi hành trình cai thuốc của bạn
            </p>
          </div>
          <div className="glass-card p-6 rounded-xl mb-6 border border-red-500/30 bg-red-500/10">
            <div className="flex items-center gap-3">
              <div className="text-red-400 text-2xl">🚫</div>
              <div>
                <h3 className="font-semibold text-red-300 mb-1">
                  Cần gói đăng ký để sử dụng
                </h3>
                <p className="text-gray-400 text-sm">
                  Bạn cần có gói đăng ký để sử dụng tính năng này
                </p>
              </div>
              <button
                onClick={() => navigate("/user/membership")}
                className="ml-auto bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
              >
                Đăng ký ngay
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-purple-900/20 to-pink-900/20">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 py-3">
            Nhật Ký Tiến Trình
          </h1>
          <p className="text-gray-400">
            Ghi nhận và theo dõi hành trình cai thuốc của bạn
          </p>
        </div>

        {/* Error Message */}
        {error && !showLogModal && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-red-400 text-xl">❌</span>
              <p className="text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-green-400 text-xl">✅</span>
              <p className="text-green-300">{message}</p>
            </div>
          </div>
        )}

        {/* New Achievements */}
        {newAchievements && newAchievements.length > 0 && (
          <div className="mb-6 p-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-yellow-400 text-3xl animate-bounce">
                🏆
              </span>
              <div>
                <h3 className="text-xl font-bold text-yellow-300">
                  Chúc mừng! Bạn đã đạt được{" "}
                  {newAchievements.length > 1
                    ? `${newAchievements.length} thành tựu mới`
                    : "thành tựu mới"}
                  !
                </h3>
                <p className="text-yellow-200 text-sm mt-1">
                  {newAchievements.length > 1
                    ? "Tuyệt vời! Bạn vừa mở khóa nhiều thành tựu cùng lúc!"
                    : "Tiếp tục phấn đấu để đạt được nhiều thành tựu hơn!"}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              {newAchievements.map((achievement, index) => (
                <div
                  key={achievement._id || index}
                  className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg p-4 border border-yellow-500/30 transform hover:scale-105 transition-all duration-300"
                >
                  <div className="flex items-start gap-3">
                    {/* <span className="text-2xl">{achievement.icon || "🏅"}</span> */}
                    {achievement.icon ? (
                      <img
                        src={achievement.icon}
                        alt={achievement.name || "Achievement"}
                        className="w-8 h-8 object-cover rounded-full border-2 border-yellow-400/50"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "inline-block";
                        }}
                      />
                    ) : (
                      <span className="text-2xl">🏅</span>
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-yellow-300 mb-1">
                        {achievement.name}
                      </h4>
                      <p className="text-yellow-200 text-sm mb-2">
                        {achievement.description}
                      </p>
                      {/* Hiển thị điểm nếu có */}
                      {achievement.points && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-yellow-400">⭐</span>
                          <span className="text-xs text-yellow-400 font-medium">
                            +{achievement.points} điểm
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tổng kết điểm thưởng */}
            {newAchievements.some((ach) => ach.points) && (
              <div className="bg-yellow-500/10 rounded-lg p-3 mb-4 border border-yellow-500/20">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-yellow-300">
                    🎯 Tổng điểm thưởng:
                    <span className="font-bold ml-1">
                      +
                      {newAchievements.reduce(
                        (sum, ach) => sum + (ach.points || 0),
                        0
                      )}{" "}
                      điểm
                    </span>
                  </span>
                  <span className="text-yellow-400 text-xs">
                    🏆 {newAchievements.length} thành tựu
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                onClick={() => dispatch(clearNewAchievements())}
                className="text-yellow-400 hover:text-yellow-300 text-sm font-medium transition-colors duration-200 hover:underline"
              >
                ✨ Đóng thông báo
              </button>

              {/* Có thể thêm nút xem tất cả achievements nếu cần */}
              <div className="text-yellow-400 text-xs">Tuyệt vời! 🎉</div>
            </div>
          </div>
        )}

        {/* Today's Progress Status */}
        <div className="mb-8">
          {todayProgress ? (
            <div className="glass-card p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="text-green-400">📝</span>
                  Tiến trình hôm nay
                </h2>
                {/* <button
                  onClick={handleOpenModal}
                  className="bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30 px-4 py-2 rounded-lg font-medium transition-all duration-300"
                >
                  Cập nhật
                </button> */}
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div
                  className={`rounded-xl p-4 border ${getCigaretteStatusBg(
                    todayProgress.cigarettesPerDay
                  )}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🚬</span>
                    <div>
                      <p className="text-gray-400 text-sm">Số điếu đã hút</p>
                      <p
                        className={`text-2xl font-bold ${getCigaretteStatusColor(
                          todayProgress.cigarettesPerDay
                        )}`}
                      >
                        {todayProgress.cigarettesPerDay}
                      </p>
                    </div>
                  </div>
                </div>

                {todayProgress.mood && (
                  <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/30">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💭</span>
                      <div>
                        <p className="text-gray-400 text-sm">Tâm trạng</p>
                        <p className="text-purple-300 font-medium">
                          {getMoodDisplay(todayProgress.mood)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/30">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📅</span>
                    <div>
                      <p className="text-gray-400 text-sm">Ngày ghi nhận</p>
                      <p className="text-blue-300 font-medium">
                        {formatDate(todayProgress.date)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {todayProgress.healthNote && (
                <div className="mt-4 p-4 bg-green-500/10 rounded-xl border border-green-500/30">
                  <h4 className="text-green-300 font-semibold mb-2 flex items-center gap-2">
                    <span>🩺</span>
                    Ghi chú sức khỏe
                  </h4>
                  <p className="text-green-200">{todayProgress.healthNote}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card p-8 rounded-2xl text-center">
              <div className="text-6xl mb-4">📊</div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Bạn chưa ghi nhận tiến trình hôm nay
              </h2>
              <p className="text-gray-400 mb-6">
                Hãy ghi nhận tiến trình hôm nay để theo dõi hành trình cai thuốc
                của bạn
              </p>
              {hasActiveSubscription && !currentPlan && (
                <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                  <div className="flex items-center gap-3 flex-col">
                    <span className="text-yellow-400 text-xl">⚠️</span>
                    <div>
                      <h3 className="font-semibold text-yellow-300 mb-1">
                        Cần tạo kế hoạch cai thuốc
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Vui lòng tạo kế hoạch cai thuốc để bắt đầu ghi nhận tiến
                        trình
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        // Navigate to smoking status page hoặc mở modal
                        navigate("/quit-plan"); // Hoặc sử dụng router
                      }}
                      className="mx-auto bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 hover:bg-yellow-500/30 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
                    >
                      Tạo kế hoạch ngay
                    </button>
                  </div>
                </div>
              )}
              {hasActiveSubscription && currentPlan && (
                <button
                  onClick={handleOpenModal}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                >
                  Ghi nhận ngay
                </button>
              )}
            </div>
          )}
        </div>

        {/* Progress Logs */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex flex-col gap-6 mb-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-blue-400">📈</span>
                Lịch sử tiến trình
              </h3>

              {/* ✅ THÊM MỚI: Date Filter Toggle */}
              <button
                onClick={handleToggleDateFilter}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  dateFilters.useDateFilter
                    ? "bg-purple-500/30 text-purple-300 border border-purple-500/30"
                    : "bg-gray-600/20 text-gray-300 border border-gray-600/30 hover:bg-gray-600/30"
                }`}
              >
                {dateFilters.useDateFilter
                  ? "🗓️ Bộ lọc ngày (ON)"
                  : "🗓️ Bộ lọc ngày"}
              </button>
            </div>

            {/* ✅ THÊM MỚI: Date Filter Panel */}
            {dateFilters.useDateFilter && (
              <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-600/30">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Quick Presets */}
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Bộ lọc nhanh:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { key: "week", label: "7 ngày qua" },
                        { key: "month", label: "1 tháng qua" },
                        { key: "3months", label: "3 tháng qua" },
                        { key: "year", label: "1 năm qua" },
                      ].map((preset) => (
                        <button
                          key={preset.key}
                          onClick={() => handleQuickDateFilter(preset.key)}
                          className="text-xs bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full hover:bg-blue-500/30 transition-all duration-200"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Date Range */}
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tùy chọn khoảng thời gian:
                    </label>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <input
                          type="date"
                          value={dateFilters.startDate}
                          onChange={(e) =>
                            handleDateFilterChange("startDate", e.target.value)
                          }
                          max={new Date().toISOString().split("T")[0]}
                          className="w-full bg-gray-700/50 border border-gray-600/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Từ ngày"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="date"
                          value={dateFilters.endDate}
                          onChange={(e) =>
                            handleDateFilterChange("endDate", e.target.value)
                          }
                          min={dateFilters.startDate}
                          max={new Date().toISOString().split("T")[0]}
                          className="w-full bg-gray-700/50 border border-gray-600/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Đến ngày"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={handleApplyDateFilter}
                      disabled={!dateFilters.startDate || !dateFilters.endDate}
                      className="bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Áp dụng
                    </button>
                    <button
                      onClick={handleClearDateFilter}
                      className="bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
                    >
                      Xóa bộ lọc
                    </button>
                  </div>
                </div>

                {/* ✅ Date Range Display */}
                {dateFilters.startDate && dateFilters.endDate && (
                  <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-blue-300 text-sm">
                      📅 Hiển thị dữ liệu từ{" "}
                      <span className="font-medium">
                        {new Date(dateFilters.startDate).toLocaleDateString(
                          "vi-VN"
                        )}
                      </span>{" "}
                      đến{" "}
                      <span className="font-medium">
                        {new Date(dateFilters.endDate).toLocaleDateString(
                          "vi-VN"
                        )}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ✅ CHỈNH SỬA: Limit selector khi không dùng date filter */}
            {!dateFilters.useDateFilter && (
              <div className="flex items-center justify-end gap-3">
                <label className="text-gray-400 text-sm">Hiển thị:</label>
                <select
                  value={limit}
                  onChange={handleLimitChange}
                  className="bg-gray-800/50 border border-gray-600/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={10}>10 ngày gần nhất</option>
                  <option value={30}>30 ngày gần nhất</option>
                  <option value={60}>60 ngày gần nhất</option>
                  <option value={90}>90 ngày gần nhất</option>
                </select>
              </div>
            )}
          </div>

          {/* ✅ THÊM MỚI: Results Summary */}
          {progressLogs.length > 0 && (
            <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <span className="text-purple-300">
                    📊 Tìm thấy <strong>{progressLogs.length}</strong> bản ghi
                  </span>
                  {dateFilters.useDateFilter &&
                    dateFilters.startDate &&
                    dateFilters.endDate && (
                      <span className="text-gray-400">
                        trong khoảng{" "}
                        {Math.ceil(
                          (new Date(dateFilters.endDate) -
                            new Date(dateFilters.startDate)) /
                            (1000 * 60 * 60 * 24)
                        ) + 1}{" "}
                        ngày
                      </span>
                    )}
                </div>

                {progressLogs.length > 0 && (
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-green-400">
                      🎉{" "}
                      {
                        progressLogs.filter((log) => log.cigarettesPerDay === 0)
                          .length
                      }{" "}
                      ngày không hút thuốc
                    </span>
                    <span className="text-blue-400">
                      📈 TB:{" "}
                      {Math.round(
                        (progressLogs.reduce(
                          (sum, log) => sum + log.cigarettesPerDay,
                          0
                        ) /
                          progressLogs.length) *
                          10
                      ) / 10}{" "}
                      điếu/ngày
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {loading && !todayProgress ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Đang tải dữ liệu...</p>
            </div>
          ) : progressLogs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h4 className="text-xl font-semibold text-white mb-2">
                {dateFilters.useDateFilter
                  ? "Không có dữ liệu trong khoảng thời gian đã chọn"
                  : "Chưa có dữ liệu tiến trình"}
              </h4>
              <p className="text-gray-400">
                {dateFilters.useDateFilter
                  ? "Hãy thử chọn khoảng thời gian khác hoặc bỏ bộ lọc ngày"
                  : "Hãy bắt đầu ghi nhận tiến trình hàng ngày để theo dõi hành trình cai thuốc"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {progressLogs.map((log, index) => (
                <div
                  key={log._id}
                  className={`rounded-xl p-4 border transition-all duration-300 hover:scale-[1.02] ${getCigaretteStatusBg(
                    log.cigarettesPerDay
                  )}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-gray-400 text-sm">
                          {formatDate(log.date)}
                        </span>
                        {/* ✅ CHỈNH SỬA: Chỉ hiện "Mới nhất" khi không dùng date filter */}
                        {index === 0 && !dateFilters.useDateFilter && (
                          <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded-full">
                            Mới nhất
                          </span>
                        )}
                      </div>

                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🚬</span>
                          <div>
                            <p className="text-gray-400 text-xs">Số điếu</p>
                            <p
                              className={`font-bold ${getCigaretteStatusColor(
                                log.cigarettesPerDay
                              )}`}
                            >
                              {log.cigarettesPerDay}
                            </p>
                          </div>
                        </div>

                        {log.mood && (
                          <div className="flex items-center gap-2">
                            <span className="text-lg">💭</span>
                            <div>
                              <p className="text-gray-400 text-xs">Tâm trạng</p>
                              <p className="text-white text-sm">
                                {getMoodDisplay(log.mood)}
                              </p>
                            </div>
                          </div>
                        )}

                        {log.cigarettesPerDay === 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🎉</span>
                            <div>
                              <p className="text-green-400 text-sm font-medium">
                                Không hút thuốc!
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {log.healthNote && (
                        <div className="mt-3 p-3 bg-black/20 rounded-lg">
                          <p className="text-gray-300 text-sm">
                            <span className="text-green-400 font-medium">
                              💚 Ghi chú:{" "}
                            </span>
                            {log.healthNote}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Log Progress Modal */}
      {showLogModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-purple-400">✏️</span>
                {todayProgress
                  ? "Cập nhật tiến trình hôm nay"
                  : "Ghi nhận tiến trình hôm nay"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white text-2xl font-bold transition-colors duration-200 hover:bg-red-500/20 rounded-full w-8 h-8 flex items-center justify-center"
              >
                ×
              </button>
            </div>

            {/* Error Message in Modal */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-red-400 text-xl">❌</span>
                  <p className="text-red-300">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Cigarettes Per Day */}
                <div>
                  <label className="block text-sm font-semibold text-purple-300 mb-3">
                    Số điếu thuốc đã hút hôm nay
                  </label>
                  <input
                    type="number"
                    name="cigarettesPerDay"
                    value={formData.cigarettesPerDay}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    className="w-full bg-gray-800/50 border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    placeholder="Nhập số điếu..."
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Nhập 0 nếu bạn không hút thuốc hôm nay
                  </p>
                </div>

                {/* Mood */}
                <div>
                  <label className="block text-sm font-semibold text-purple-300 mb-3">
                    Tâm trạng hôm nay
                  </label>
                  <select
                    name="mood"
                    value={formData.mood}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800/50 border border-purple-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  >
                    {moodOptions.map((option) => (
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
              </div>

              {/* Health Note */}
              <div>
                <label className="block text-sm font-semibold text-purple-300 mb-3">
                  Ghi chú về sức khỏe (tùy chọn)
                </label>
                <textarea
                  name="healthNote"
                  value={formData.healthNote}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800/50 border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 h-24 resize-none"
                  placeholder="Ví dụ: Cảm thấy khỏe hơn, ít ho hơn, ngủ ngon hơn..."
                />
              </div>

              {/* Quick Health Note Suggestions */}
              <div>
                <p className="text-sm text-gray-400 mb-2">
                  Gợi ý ghi chú nhanh:
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Cảm thấy khỏe hơn",
                    "Ít ho hơn",
                    "Ngủ ngon hơn",
                    "Hơi thở thơm hơn",
                    "Tiết kiệm được tiền",
                    "Cảm thấy tự tin hơn",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          healthNote: prev.healthNote
                            ? `${prev.healthNote}, ${suggestion}`
                            : suggestion,
                        }))
                      }
                      className="text-xs bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full hover:bg-purple-500/30 transition-all duration-200"
                    >
                      + {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-gray-600/30">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-600/20 text-gray-300 border border-gray-600/30 hover:bg-gray-600/30 px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? "Đang lưu..."
                    : todayProgress
                    ? "Cập nhật"
                    : "Ghi nhận"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProgressLog;
