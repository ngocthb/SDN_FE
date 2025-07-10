import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Navbar from "../../components/Navbar";
import {
  getSuggestedPlan,
  createQuitPlan,
  getCurrentPlan,
  getCurrentStage,
  updateQuitPlan,
  cancelPlan,
  clearError,
  clearSuccess,
  clearQuitPlanState,
} from "../../redux/features/quitPlan/quitPlanSlice";
import {
  getSmokingStatus,
  clearSmokingStatusState,
} from "../../redux/features/smokingStatus/smokingStatusSlice";
import { getMySubscription } from "../../redux/features/subscription/subscriptionSlice";
function QuitPlan() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    suggestedPlan,
    currentPlan,
    currentStage,
    loading,
    error,
    success,
    message,
  } = useSelector((state) => state.quitPlan);

  const {
    mySubscription,
    hasActiveSubscription,
    loading: subscriptionLoading,
  } = useSelector((state) => state.subscription);

  const { smokingStatus } = useSelector((state) => state.smokingStatus);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [planFormData, setPlanFormData] = useState({
    reason: "",
    customStages: [],
  });

  useEffect(() => {
    dispatch(getMySubscription());
  }, [dispatch]);

  useEffect(() => {
    if (!hasActiveSubscription && !subscriptionLoading) {
      dispatch(clearQuitPlanState());
      dispatch(clearSmokingStatusState());
    }
  }, [hasActiveSubscription, subscriptionLoading, dispatch]);

  useEffect(() => {
    if (hasActiveSubscription && !subscriptionLoading) {
      dispatch(getCurrentPlan());
      dispatch(getCurrentStage());
      dispatch(getSmokingStatus());
    }
  }, [dispatch, hasActiveSubscription, subscriptionLoading]);

  const clearFormData = () => {
    setPlanFormData({
      reason: "",
      customStages: [],
    });
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
    if (success) {
      toast.success(message);
      dispatch(clearSuccess());
      setShowOnboarding(false);
      setShowUpdateModal(false);
      // Refresh data after successful operations
      clearFormData(); // ✅ Clear form sau khi success
      dispatch(getCurrentPlan());
      dispatch(getCurrentStage());
    }
  }, [error, success, message, dispatch]);

  // Hàm tính tổng số ngày của các custom stages
  const calculateTotalDays = (stages) => {
    return stages.reduce(
      (total, stage) => total + (stage.daysToComplete || 0),
      0
    );
  };

  // Hàm validate subscription
  const validateSubscriptionLimits = (stages) => {
    if (!hasActiveSubscription || !mySubscription) {
      toast.error("Bạn cần có gói đăng ký để tạo kế hoạch cai thuốc");
      return false;
    }

    const totalDays = calculateTotalDays(stages);
    const daysRemaining = mySubscription.daysRemaining || 0;

    if (totalDays > daysRemaining) {
      toast.error(
        `Tổng số ngày kế hoạch (${totalDays} ngày) vượt quá số ngày còn lại trong gói đăng ký (${daysRemaining} ngày). Vui lòng giảm thời gian hoặc nâng cấp gói.`
      );
      return false;
    }

    return true;
  };

  const handleGetSuggestions = async () => {
    if (!hasActiveSubscription) {
      toast.error("Bạn cần có gói đăng ký để sử dụng tính năng này");
      return;
    }

    // ✅ CLEAR form data trước khi mở modal
    setPlanFormData({
      reason: "",
      customStages: [],
    });

    try {
      await dispatch(getSuggestedPlan()).unwrap();
      setShowOnboarding(true);
      setOnboardingStep(1);
    } catch (error) {
      console.error("Error getting suggestions:", error);
    }
  };

  const handleCreatePlan = async (useTemplate = false) => {
    if (!planFormData.reason.trim()) {
      toast.error("Vui lòng nhập lý do cai thuốc");
      return;
    }

    // ✅ Xác định data sẽ gửi dựa vào useTemplate
    const requestData = useTemplate
      ? {
          // Chỉ gửi reason khi sử dụng template
          reason: planFormData.reason,
          // Không gửi customStages - backend sẽ tự tạo từ template
        }
      : {
          // Gửi đầy đủ khi tạo custom plan
          reason: planFormData.reason,
          customStages: planFormData.customStages,
        };

    // Validate subscription limits chỉ khi dùng custom stages
    if (
      !useTemplate &&
      !validateSubscriptionLimits(planFormData.customStages)
    ) {
      return;
    }

    try {
      await dispatch(createQuitPlan(requestData)).unwrap();
    } catch (error) {
      console.error("Error creating plan:", error);
    }
  };

  // Cập nhật handleUpdatePlan function trong QuitPlan.jsx
  const handleUpdatePlan = async () => {
    if (!currentPlan?.plan?._id) return;

    // Validate subscription limits
    if (!validateSubscriptionLimits(planFormData.customStages)) {
      return;
    }

    try {
      // ✅ QUAN TRỌNG: Gửi đúng cấu trúc data mà backend expect
      const updateData = {
        reason: planFormData.reason,
        stages: planFormData.customStages.map((stage) => ({
          // Giữ nguyên _id nếu có (để backend biết đây là existing stage)
          ...(stage._id && { _id: stage._id }),
          title: stage.title,
          description: stage.description,
          daysToComplete: stage.daysToComplete,
          // Không gửi orderNumber - để backend tự xử lý
        })),
      };

      console.log("🔍 Update data being sent:", updateData);
      console.log("📊 Stages count:", updateData.stages.length);
      console.log(
        "🆔 Stage IDs:",
        updateData.stages.filter((s) => s._id).map((s) => s._id)
      );

      await dispatch(
        updateQuitPlan({
          planId: currentPlan.plan._id,
          updates: updateData,
        })
      ).unwrap();
    } catch (error) {
      console.error("Error updating plan:", error);
      // Error sẽ được handle ở useEffect với error state từ Redux
    }
  };

  const handleCancelPlan = async () => {
    if (!currentPlan?.plan?._id) return;

    if (
      window.confirm(
        "Bạn có chắc chắn muốn hủy kế hoạch cai thuốc hiện tại không?"
      )
    ) {
      try {
        await dispatch(cancelPlan(currentPlan.plan._id)).unwrap();
      } catch (error) {
        console.error("Error cancelling plan:", error);
      }
    }
  };

  const addCustomStage = () => {
    setPlanFormData((prev) => ({
      ...prev,
      customStages: [
        ...prev.customStages,
        {
          title: "",
          description: "",
          daysToComplete: 7,
        },
      ],
    }));
  };

  const updateCustomStage = (index, field, value) => {
    setPlanFormData((prev) => ({
      ...prev,
      customStages: prev.customStages.map((stage, i) =>
        i === index ? { ...stage, [field]: value } : stage
      ),
    }));
  };

  const removeCustomStage = (index) => {
    setPlanFormData((prev) => {
      const newStages = prev.customStages.filter((_, i) => i !== index);

      // ✅ Debug log
      console.log(`🗑️ Removing stage at index ${index}`);
      console.log("📊 Stages before removal:", prev.customStages.length);
      console.log("📊 Stages after removal:", newStages.length);
      console.log(
        "🆔 Remaining stage IDs:",
        newStages.filter((s) => s._id).map((s) => s._id)
      );

      return {
        ...prev,
        customStages: newStages,
      };
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const getStageStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-400";
      case "in_progress":
        return "text-blue-400";
      case "upcoming":
        return "text-gray-400";
      default:
        return "text-gray-400";
    }
  };

  const getStageStatusBg = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 border-green-500/30";
      case "in_progress":
        return "bg-blue-500/20 border-blue-500/30";
      case "upcoming":
        return "bg-gray-500/20 border-gray-500/30";
      default:
        return "bg-gray-500/20 border-gray-500/30";
    }
  };

  // Thêm function hasChanges() vào component
  const hasChanges = () => {
    if (!currentPlan?.plan || !currentStage?.allStagesWithProgress) return true;

    // Kiểm tra thay đổi reason
    const reasonChanged =
      planFormData.reason.trim() !== currentPlan.plan.reason.trim();

    // Kiểm tra thay đổi stages
    const currentStages = currentStage.allStagesWithProgress || [];
    const newStages = planFormData.customStages;

    // So sánh số lượng stages
    if (currentStages.length !== newStages.length) return true;

    // So sánh từng stage
    const stagesChanged = newStages.some((newStage, index) => {
      const currentStage = currentStages[index];
      if (!currentStage) return true;

      return (
        newStage.title.trim() !== currentStage.title.trim() ||
        (newStage.description || "").trim() !==
          (currentStage.description || "").trim() ||
        newStage.daysToComplete !== currentStage.daysToComplete
      );
    });

    return reasonChanged || stagesChanged;
  };

  if (!hasActiveSubscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-purple-900/20 to-pink-900/20">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 py-3">
              Kế Hoạch Cai Thuốc
            </h1>
            <p className="text-gray-400">
              Tạo và theo dõi kế hoạch cai thuốc của bạn một cách khoa học
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
              <button onClick={() => navigate("/user/membership")} className="ml-auto bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300">
                Đăng ký ngay
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Thêm các hàm tính toán ngày dự kiến hoàn thành
  const calculateExpectedCompletionDate = (stages, isUpdate = false) => {
    const totalDays = calculateTotalDays(stages);
    if (totalDays === 0) return null;

    // Nếu là update, dùng startDate của kế hoạch hiện tại
    // Nếu là add mới, dùng ngày hiện tại
    const startDate =
      isUpdate && currentPlan?.plan?.startDate
        ? new Date(currentPlan.plan.startDate)
        : new Date();

    const completionDate = new Date(startDate);
    completionDate.setDate(startDate.getDate() + totalDays);

    return completionDate;
  };

  // Hàm format ngày dự kiến
  const formatExpectedDate = (date) => {
    if (!date) return "Chưa xác định";

    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    return date.toLocaleDateString("vi-VN", options);
  };

  // Component hiển thị thông tin kế hoạch
  const PlanSummaryCard = ({
    stages,
    title = "Tổng quan kế hoạch",
    isUpdate = false,
  }) => {
    const totalDays = calculateTotalDays(stages);
    const expectedDate = calculateExpectedCompletionDate(stages, isUpdate);

    if (totalDays === 0) return null;

    // Ngày bắt đầu
    const startDate =
      isUpdate && currentPlan?.plan?.startDate
        ? new Date(currentPlan.plan.startDate)
        : new Date();

    return (
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-4 border border-blue-500/30 mb-6">
        <h5 className="text-blue-300 font-semibold mb-3 flex items-center gap-2">
          <span>📊</span>
          {title}
        </h5>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Tổng số giai đoạn:</span>
            <span className="text-white font-medium">{stages.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Tổng thời gian:</span>
            <span className="text-white font-medium">{totalDays} ngày</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">
              {isUpdate ? "Ngày bắt đầu gốc:" : "Bắt đầu:"}
            </span>
            <span className="text-white font-medium">
              {formatDate(startDate)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Dự kiến hoàn thành:</span>
            <span className="text-green-400 font-medium">
              {formatExpectedDate(expectedDate)}
            </span>
          </div>
        </div>

        {/* Progress timeline visual */}
        <div className="mt-4 p-3 bg-black/20 rounded-lg">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span>{isUpdate ? "Ngày bắt đầu" : "Hôm nay"}</span>
            <span>{totalDays} ngày</span>
            <span>Hoàn thành</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full w-full animate-pulse"></div>
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>{formatDate(startDate)}</span>
            <span>{formatExpectedDate(expectedDate)}</span>
          </div>
        </div>
      </div>
    );
  };

  // Component so sánh kế hoạch (chỉ cho Update Modal)
  const PlanComparisonCard = ({ currentStages, newStages }) => {
    const currentTotal = calculateTotalDays(currentStages || []);
    const newTotal = calculateTotalDays(newStages);

    // Dùng startDate của kế hoạch hiện tại
    const startDate = currentPlan?.plan?.startDate
      ? new Date(currentPlan.plan.startDate)
      : new Date();

    const currentExpected = calculateExpectedCompletionDate(
      currentStages || [],
      true
    );
    const newExpected = calculateExpectedCompletionDate(newStages, true);

    const daysDifference = newTotal - currentTotal;

    return (
      <div className="bg-gradient-to-r from-orange-500/10 to-blue-500/10 rounded-xl p-4 border border-orange-500/30 mb-6">
        <h5 className="text-orange-300 font-semibold mb-3 flex items-center gap-2">
          <span>🔄</span>
          So sánh thay đổi
        </h5>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Kế hoạch hiện tại */}
          <div className="space-y-2">
            <h6 className="text-gray-300 font-medium">Kế hoạch hiện tại:</h6>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Tổng thời gian:</span>
                <span className="text-white">{currentTotal} ngày</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Ngày bắt đầu:</span>
                <span className="text-white text-xs">
                  {formatDate(startDate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Dự kiến hoàn thành:</span>
                <span className="text-white text-xs">
                  {formatExpectedDate(currentExpected)}
                </span>
              </div>
            </div>
          </div>

          {/* Kế hoạch mới */}
          <div className="space-y-2">
            <h6 className="text-blue-300 font-medium">Sau khi cập nhật:</h6>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Tổng thời gian:</span>
                <span
                  className={`font-medium ${
                    daysDifference > 0
                      ? "text-orange-400"
                      : daysDifference < 0
                      ? "text-green-400"
                      : "text-white"
                  }`}
                >
                  {newTotal} ngày
                  {daysDifference !== 0 && (
                    <span className="text-xs ml-1">
                      ({daysDifference > 0 ? "+" : ""}
                      {daysDifference})
                    </span>
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Ngày bắt đầu:</span>
                <span className="text-blue-300 text-xs">
                  {formatDate(startDate)} (giữ nguyên)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Dự kiến hoàn thành:</span>
                <span className="text-blue-300 text-xs">
                  {formatExpectedDate(newExpected)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Thông báo thay đổi */}
        {daysDifference !== 0 && (
          <div
            className={`mt-3 p-2 rounded-lg text-xs ${
              daysDifference > 0
                ? "bg-orange-500/10 border border-orange-500/30 text-orange-300"
                : "bg-green-500/10 border border-green-500/30 text-green-300"
            }`}
          >
            {daysDifference > 0
              ? `⚠️ Kế hoạch sẽ dài hơn ${daysDifference} ngày so với hiện tại`
              : `✅ Kế hoạch sẽ ngắn hơn ${Math.abs(
                  daysDifference
                )} ngày so với hiện tại`}
          </div>
        )}

        {/* Hiển thị ngày hoàn thành thay đổi */}
        {currentExpected && newExpected && daysDifference !== 0 && (
          <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-xs">
            <p className="text-blue-300">
              📅 Ngày hoàn thành sẽ thay đổi từ{" "}
              <span className="font-medium">
                {formatExpectedDate(currentExpected)}
              </span>{" "}
              thành{" "}
              <span className="font-medium">
                {formatExpectedDate(newExpected)}
              </span>
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-purple-900/20 to-pink-900/20">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 py-3">
            Kế Hoạch Cai Thuốc
          </h1>
          <p className="text-gray-400">
            Tạo và theo dõi kế hoạch cai thuốc của bạn một cách khoa học
          </p>
        </div>

        {/* Subscription Status Banner */}
        {hasActiveSubscription && mySubscription && (
          <div
            className={`glass-card p-4 rounded-xl mb-6 border ${
              mySubscription.isExpiringSoon
                ? "border-orange-500/30 bg-orange-500/10"
                : "border-green-500/30 bg-green-500/10"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`text-2xl ${
                    mySubscription.isExpiringSoon
                      ? "text-orange-400"
                      : "text-green-400"
                  }`}
                >
                  {mySubscription.isExpiringSoon ? "⚠️" : "✅"}
                </div>
                <div>
                  <h3
                    className={`font-semibold ${
                      mySubscription.isExpiringSoon
                        ? "text-orange-300"
                        : "text-green-300"
                    }`}
                  >
                    Gói đăng ký: {mySubscription.membershipId?.name}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Còn {mySubscription.daysRemaining} ngày sử dụng
                  </p>
                </div>
              </div>
              {mySubscription.isExpiringSoon && (
                <button className="bg-orange-500/20 text-orange-300 border border-orange-500/30 hover:bg-orange-500/30 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300">
                  Gia hạn ngay
                </button>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-red-400 text-xl">❌</span>
              <p className="text-red-300">{error}</p>
            </div>
          </div>
        )}

        {!currentPlan?.plan ? (
          // No Plan State - Welcome Screen
          <div className="glass-card p-8 rounded-2xl text-center">
            <div className="text-8xl mb-6">🎯</div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Bắt đầu hành trình cai thuốc
            </h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Chúng tôi sẽ giúp bạn tạo một kế hoạch cai thuốc phù hợp dựa trên
              tình trạng hiện tại. Hãy để chúng tôi đồng hành cùng bạn trong
              hành trình này!
            </p>

            {hasActiveSubscription && !smokingStatus && (
              <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                <div className="flex items-center gap-3 flex-col">
                  <span className="text-yellow-400 text-xl">⚠️</span>
                  <div>
                    <h3 className="font-semibold text-yellow-300 mb-1">
                      Cần khai báo tình trạng hút thuốc
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Vui lòng khai báo tình trạng hút thuốc hiện tại để chúng
                      tôi có thể tạo kế hoạch phù hợp cho bạn.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      // Navigate to smoking status page hoặc mở modal
                      navigate("/smoking-status"); // Hoặc sử dụng router
                    }}
                    className="mx-auto bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 hover:bg-yellow-500/30 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
                  >
                    Khai báo ngay
                  </button>
                </div>
              </div>
            )}
            {hasActiveSubscription && smokingStatus && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <button
                  onClick={handleGetSuggestions}
                  disabled={
                    loading ||
                    subscriptionLoading ||
                    !hasActiveSubscription ||
                    !smokingStatus
                  }
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? "Đang tải..."
                    : !smokingStatus
                    ? "Vui lòng khai báo tình trạng hút thuốc trước"
                    : "Tạo kế hoạch"}
                </button>
              </div>
            )}
            <div className="mt-12 grid md:grid-cols-3 gap-6">
              <div className="bg-purple-500/10 rounded-xl p-6 border border-purple-500/20">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-lg font-semibold text-purple-300 mb-2">
                  Kế hoạch cá nhân
                </h3>
                <p className="text-gray-400 text-sm">
                  Được thiết kế dựa trên thói quen hút thuốc hiện tại của bạn
                </p>
              </div>

              <div className="bg-blue-500/10 rounded-xl p-6 border border-blue-500/20">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-lg font-semibold text-blue-300 mb-2">
                  Theo dõi tiến độ
                </h3>
                <p className="text-gray-400 text-sm">
                  Giám sát quá trình và đạt được mục tiêu từng giai đoạn
                </p>
              </div>

              <div className="bg-green-500/10 rounded-xl p-6 border border-green-500/20">
                <div className="text-4xl mb-4">🏆</div>
                <h3 className="text-lg font-semibold text-green-300 mb-2">
                  Thành công
                </h3>
                <p className="text-gray-400 text-sm">
                  Hoàn thành mục tiêu và duy trì lối sống khỏe mạnh
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Has Plan State - Dashboard
          <div className="space-y-8">
            {/* Plan Overview */}
            <div className="glass-card p-8 rounded-2xl">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Kế hoạch hiện tại
                  </h2>
                  <p className="text-gray-400">
                    <strong>Lý do:</strong> {currentPlan.plan.reason}
                  </p>
                  {/* THÊM MỚI: Thông tin ngày bắt đầu và dự kiến hoàn thành */}
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-blue-400">🗓️</span>
                        <span className="text-blue-300 font-medium text-sm">
                          Ngày bắt đầu
                        </span>
                      </div>
                      <p className="text-white font-semibold">
                        {formatDate(currentPlan.plan.startDate)}
                      </p>
                    </div>
                    <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-green-400">🎯</span>
                        <span className="text-green-300 font-medium text-sm">
                          Dự kiến hoàn thành
                        </span>
                      </div>
                      <p className="text-white font-semibold">
                        {formatDate(currentPlan.plan.expectedQuitDate)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-4 lg:mt-0">
                  <button
                    onClick={() => {
                      setPlanFormData({
                        reason: currentPlan.plan.reason,
                        customStages:
                          currentStage?.allStagesWithProgress ||
                          currentPlan.stages ||
                          [],
                      });
                      setShowUpdateModal(true);
                    }}
                    className="bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30 px-4 py-2 rounded-lg font-medium transition-all duration-300"
                  >
                    Chỉnh sửa
                  </button>
                  <button
                    onClick={handleCancelPlan}
                    className="bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 px-4 py-2 rounded-lg font-medium transition-all duration-300"
                  >
                    Hủy kế hoạch
                  </button>
                </div>
              </div>

              {/* THÊM MỚI: Timeline Overview */}
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/20 mb-6">
                <h4 className="text-lg font-semibold text-purple-300 mb-3 flex items-center gap-2">
                  <span>📅</span>
                  Timeline kế hoạch
                </h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl mb-1">🚀</div>
                    <p className="text-gray-400 text-sm">Bắt đầu</p>
                    <p className="text-white font-medium">
                      {formatDate(currentPlan.plan.startDate)}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">⏱️</div>
                    <p className="text-gray-400 text-sm">Hôm nay</p>
                    <p className="text-white font-medium">
                      {formatDate(new Date())}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">🏁</div>
                    <p className="text-gray-400 text-sm">Hoàn thành</p>
                    <p className="text-white font-medium">
                      {formatDate(currentPlan.plan.expectedQuitDate)}
                    </p>
                  </div>
                </div>

                {/* THÊM MỚI: Progress Bar cho timeline */}
                {currentPlan.progress && (
                  <div className="mt-4">
                    <div className="flex justify-between items-center text-sm text-gray-400 mb-2">
                      <span>Tiến độ tổng thể</span>
                      <span>{currentPlan.progress.progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300 relative"
                        style={{
                          width: `${currentPlan.progress.progressPercentage}%`,
                        }}
                      >
                        <div className="absolute right-0 top-0 h-full w-1 bg-white/50 rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      <span>Ngày 1</span>
                      <span>
                        Ngày {currentPlan.progress.daysPassed}/
                        {currentPlan.progress.totalDays}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress Overview */}
              {currentPlan.progress && (
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-blue-500/10 rounded-xl p-6 border border-blue-500/20">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-blue-300 mb-2">
                        Ngày đã trải qua
                      </h3>
                      <p className="text-3xl font-bold text-white">
                        {currentPlan.progress.daysPassed}
                      </p>
                      <span className="text-gray-400 text-sm">ngày</span>
                    </div>
                  </div>

                  <div className="bg-green-500/10 rounded-xl p-6 border border-green-500/20">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-green-300 mb-2">
                        Tiến độ
                      </h3>
                      <p className="text-3xl font-bold text-white">
                        {currentPlan.progress.progressPercentage}%
                      </p>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${currentPlan.progress.progressPercentage}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-orange-500/10 rounded-xl p-6 border border-orange-500/20">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-orange-300 mb-2">
                        Còn lại
                      </h3>
                      <p className="text-3xl font-bold text-white">
                        {currentPlan.progress.remainingDays}
                      </p>
                      <span className="text-gray-400 text-sm">ngày</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Current Stage */}
              {currentStage?.currentStage ? (
                <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl p-6 border border-purple-500/20 mb-6">
                  <h3 className="text-xl font-bold text-white mb-3">
                    🎯 Giai đoạn hiện tại: {currentStage.currentStage.title}
                  </h3>
                  <p className="text-gray-300 mb-4">
                    {currentStage.currentStage.description}
                  </p>

                  <div className="flex justify-between items-center text-sm text-gray-400 mb-2">
                    <span>Tiến độ giai đoạn</span>
                    <span>
                      {currentStage.currentStage.stageProgressPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                      style={{
                        width: `${currentStage.currentStage.stageProgressPercentage}%`,
                      }}
                    ></div>
                  </div>

                  <div className="flex justify-between mt-3 text-sm">
                    <span className="text-purple-300">
                      Ngày {currentStage.currentStage.daysInCurrentStage}/
                      {currentStage.currentStage.daysToComplete}
                    </span>
                    <span className="text-blue-300">
                      Còn {currentStage.currentStage.remainingDaysInStage} ngày
                    </span>
                  </div>
                </div>
              ) : (
                // ✅ THÊM MỚI: Hiển thị khi chưa có giai đoạn hiện tại
                <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl p-6 border border-yellow-500/20 mb-6">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-xl font-bold text-yellow-300 mb-3">
                      Chưa có giai đoạn nào được thiết lập
                    </h3>
                    <p className="text-gray-300 mb-4">
                      Kế hoạch của bạn chưa có giai đoạn cụ thể. Hãy cập nhật kế
                      hoạch để thêm các giai đoạn chi tiết.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                      <button
                        onClick={() => {
                          setPlanFormData({
                            reason: currentPlan.plan.reason,
                            customStages:
                              currentStage?.allStagesWithProgress ||
                              currentPlan.stages ||
                              [],
                          });
                          setShowUpdateModal(true);
                        }}
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2"
                      >
                        <span>✏️</span>
                        Cập nhật kế hoạch
                      </button>

                      <div className="text-yellow-400 text-sm">
                        hoặc liên hệ hỗ trợ nếu cần thiết
                      </div>
                    </div>

                    {/* Thông tin bổ sung */}
                    <div className="mt-4 p-3 bg-yellow-500/5 border border-yellow-500/10 rounded-lg">
                      <p className="text-yellow-200 text-sm">
                        💡 <strong>Gợi ý:</strong> Bạn có thể thêm các giai đoạn
                        như "Giảm số lượng thuốc", "Thay thế thói quen", "Ngừng
                        hoàn toàn" để có kế hoạch chi tiết hơn.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* All Stages */}
            {currentStage?.allStagesWithProgress &&
            currentStage.allStagesWithProgress.length > 0 ? (
              <div className="glass-card p-8 rounded-2xl">
                <h3 className="text-2xl font-bold text-white mb-6">
                  Tất cả giai đoạn
                </h3>

                <div className="space-y-4">
                  {currentStage.allStagesWithProgress.map((stage, index) => (
                    <div
                      key={stage._id}
                      className={`rounded-xl p-6 border transition-all duration-300 ${getStageStatusBg(
                        stage.status
                      )}`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span
                              className={`text-sm font-medium px-3 py-1 rounded-full ${
                                stage.status === "completed"
                                  ? "bg-green-500/20 text-green-300"
                                  : stage.status === "in_progress"
                                  ? "bg-blue-500/20 text-blue-300"
                                  : "bg-gray-500/20 text-gray-300"
                              }`}
                            >
                              {stage.status === "completed"
                                ? "✅ Hoàn thành"
                                : stage.status === "in_progress"
                                ? "🔄 Đang thực hiện"
                                : "⏳ Sắp tới"}
                            </span>
                            <span className="text-gray-400 text-sm">
                              Giai đoạn {stage.stageIndex}
                            </span>
                          </div>

                          <h4
                            className={`text-lg font-semibold mb-2 ${getStageStatusColor(
                              stage.status
                            )}`}
                          >
                            {stage.title}
                          </h4>
                          <p className="text-gray-300 text-sm mb-3">
                            {stage.description}
                          </p>

                          {stage.status !== "upcoming" && (
                            <div className="mb-3">
                              <div className="flex justify-between items-center text-sm text-gray-400 mb-1">
                                <span>Tiến độ</span>
                                <span>{stage.progressPercentage}%</span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    stage.status === "completed"
                                      ? "bg-green-500"
                                      : "bg-blue-500"
                                  }`}
                                  style={{
                                    width: `${stage.progressPercentage}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="text-right ml-4">
                          <div className="text-sm text-gray-400">
                            {stage.daysToComplete} ngày
                          </div>
                          {stage.status === "in_progress" && (
                            <div className="text-sm text-blue-300 mt-1">
                              Còn {stage.remainingDays} ngày
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // ✅ THÊM MỚI: Hiển thị khi chưa có giai đoạn nào trong danh sách
              <div className="glass-card p-8 rounded-2xl">
                <h3 className="text-2xl font-bold text-white mb-6">
                  Tất cả giai đoạn
                </h3>

                <div className="bg-gradient-to-r from-gray-500/10 to-purple-500/10 rounded-xl p-8 border border-gray-500/20">
                  <div className="text-center">
                    <div className="text-8xl mb-6">📋</div>
                    <h4 className="text-2xl font-bold text-purple-300 mb-3">
                      Chưa có giai đoạn nào được tạo
                    </h4>
                    <p className="text-gray-300 mb-6 max-w-lg mx-auto">
                      Kế hoạch của bạn chưa có các giai đoạn chi tiết. Để có một
                      kế hoạch hoàn chỉnh, hãy thêm các giai đoạn cụ thể để theo
                      dõi tiến độ tốt hơn.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                      <button
                        onClick={() => {
                          setPlanFormData({
                            reason: currentPlan.plan.reason,
                            customStages:
                              currentStage?.allStagesWithProgress ||
                              currentPlan.stages ||
                              [],
                          });
                          setShowUpdateModal(true);
                        }}
                        className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-3 shadow-lg"
                      >
                        <span>✨</span>
                        Thêm giai đoạn ngay
                      </button>

                      <button
                        onClick={handleGetSuggestions}
                        className="bg-gray-600/20 text-gray-300 border border-gray-600/30 hover:bg-gray-600/30 px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center gap-3"
                      >
                        <span>🔄</span>
                        Tạo lại kế hoạch
                      </button>
                    </div>

                    {/* Thông tin hướng dẫn */}
                    <div className="mt-8 grid md:grid-cols-3 gap-4">
                      <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                        <div className="text-3xl mb-2">🎯</div>
                        <h5 className="text-blue-300 font-medium mb-1">
                          Mục tiêu rõ ràng
                        </h5>
                        <p className="text-gray-400 text-sm">
                          Chia nhỏ quá trình cai thuốc thành các mục tiêu có thể
                          đạt được
                        </p>
                      </div>

                      <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                        <div className="text-3xl mb-2">📈</div>
                        <h5 className="text-green-300 font-medium mb-1">
                          Theo dõi tiến độ
                        </h5>
                        <p className="text-gray-400 text-sm">
                          Giám sát từng bước để duy trì động lực và điều chỉnh
                          kế hoạch
                        </p>
                      </div>

                      <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
                        <div className="text-3xl mb-2">🏆</div>
                        <h5 className="text-purple-300 font-medium mb-1">
                          Thành công bền vững
                        </h5>
                        <p className="text-gray-400 text-sm">
                          Xây dựng thói quen lành mạnh để duy trì kết quả lâu
                          dài
                        </p>
                      </div>
                    </div>

                    {/* Gợi ý các giai đoạn phổ biến */}
                    <div className="mt-6 p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-lg">
                      <h6 className="text-yellow-300 font-medium mb-2">
                        💡 Gợi ý các giai đoạn phổ biến:
                      </h6>
                      <div className="text-yellow-200 text-sm space-y-1">
                        <p>
                          • <strong>Giai đoạn 1:</strong> Giảm dần số lượng
                          thuốc lá (7-14 ngày)
                        </p>
                        <p>
                          • <strong>Giai đoạn 2:</strong> Thay thế thói quen hút
                          thuốc (7-10 ngày)
                        </p>
                        <p>
                          • <strong>Giai đoạn 3:</strong> Ngừng hoàn toàn và
                          củng cố (14-21 ngày)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Onboarding Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {onboardingStep === 1 && suggestedPlan && (
              <div>
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-white mb-4">
                    🎯 Kế hoạch được đề xuất
                  </h3>
                  <p className="text-gray-400">
                    Dựa trên tình trạng hút thuốc hiện tại, chúng tôi đề xuất kế
                    hoạch sau:
                  </p>
                </div>

                {/* Subscription validation info */}
                {hasActiveSubscription && mySubscription && (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-blue-400">📅</div>
                      <h4 className="text-blue-300 font-semibold">
                        Thông tin gói đăng ký
                      </h4>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Gói hiện tại:</span>
                        <span className="text-white ml-2">
                          {mySubscription.membershipId?.name}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Ngày còn lại:</span>
                        <span className="text-white ml-2">
                          {mySubscription.daysRemaining} ngày
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Kế hoạch đề xuất:</span>
                        <span className="text-white ml-2">
                          {suggestedPlan.suggestedDuration} ngày
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Trạng thái:</span>
                        <span
                          className={`ml-2 ${
                            suggestedPlan.suggestedDuration <=
                            mySubscription.daysRemaining
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {suggestedPlan.suggestedDuration <=
                          mySubscription.daysRemaining
                            ? "✅ Phù hợp"
                            : "❌ Vượt quá gói"}
                        </span>
                      </div>
                    </div>
                    {suggestedPlan.suggestedDuration >
                      mySubscription.daysRemaining && (
                      <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <p className="text-red-300 text-sm">
                          ⚠️ Kế hoạch đề xuất ({suggestedPlan.suggestedDuration}{" "}
                          ngày) vượt quá số ngày còn lại trong gói (
                          {mySubscription.daysRemaining} ngày). Vui lòng tùy
                          chỉnh kế hoạch hoặc nâng cấp gói.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-blue-500/10 rounded-xl p-6 border border-blue-500/20">
                    <h4 className="text-lg font-semibold text-blue-300 mb-2">
                      Thông tin cơ bản
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-300">
                        <strong>Số điếu/ngày:</strong>{" "}
                        {suggestedPlan.cigarettesPerDay}
                      </p>
                      <p className="text-gray-300">
                        <strong>Thời gian:</strong>{" "}
                        {suggestedPlan.suggestedDuration} ngày
                      </p>
                      <p className="text-gray-300">
                        <strong>Độ khó:</strong>{" "}
                        {suggestedPlan.recommendations.difficulty}
                      </p>
                      <p className="text-gray-300">
                        <strong>Tỷ lệ thành công:</strong>{" "}
                        {suggestedPlan.recommendations.successRate}
                      </p>
                    </div>
                  </div>

                  <div className="bg-green-500/10 rounded-xl p-6 border border-green-500/20">
                    <h4 className="text-lg font-semibold text-green-300 mb-2">
                      Lời khuyên
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-300">
                      {suggestedPlan.recommendations.tips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-400 mt-1">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mb-8">
                  <h4 className="text-xl font-semibold text-white mb-4">
                    Các giai đoạn đề xuất
                  </h4>
                  <div className="space-y-4">
                    {suggestedPlan.suggestedStages.map((stage, index) => (
                      <div
                        key={index}
                        className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h5 className="font-semibold text-purple-300 mb-2">
                              Giai đoạn {stage.orderNumber}: {stage.title}
                            </h5>
                            <p className="text-gray-300 text-sm">
                              {stage.description}
                            </p>
                          </div>
                          <span className="text-purple-400 font-medium ml-4">
                            {stage.daysToComplete} ngày
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setOnboardingStep(2)}
                    disabled={
                      !hasActiveSubscription ||
                      suggestedPlan.suggestedDuration >
                        (mySubscription?.daysRemaining || 0)
                    }
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                  >
                    Sử dụng kế hoạch này
                  </button>
                  <button
                    onClick={() => setOnboardingStep(3)}
                    disabled={!hasActiveSubscription}
                    className="flex-1 bg-gray-600/20 text-gray-300 border border-gray-600/30 hover:bg-gray-600/30 px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                  >
                    Tùy chỉnh
                  </button>
                  <button
                    onClick={() => setShowOnboarding(false)}
                    className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}

            {onboardingStep === 2 && (
              <div>
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-white mb-4">
                    📝 Lý do cai thuốc
                  </h3>
                  <p className="text-gray-400">
                    Hãy chia sẻ lý do tại sao bạn muốn cai thuốc. Điều này sẽ
                    giúp bạn có động lực hơn.
                  </p>
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-semibold text-purple-300 mb-3">
                    Lý do cai thuốc của bạn
                  </label>
                  <textarea
                    value={planFormData.reason}
                    onChange={(e) =>
                      setPlanFormData((prev) => ({
                        ...prev,
                        reason: e.target.value,
                      }))
                    }
                    className="w-full bg-gray-800/50 border border-purple-500/30 rounded-xl px-4 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 h-32 resize-none"
                    placeholder="Ví dụ: Vì sức khỏe của tôi và gia đình, để tiết kiệm chi phí, để có một cuộc sống khỏe mạnh hơn..."
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Hãy viết một lý do có ý nghĩa với bạn để tạo động lực trong
                    suốt hành trình
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setOnboardingStep(1)}
                    className="bg-gray-600/20 text-gray-300 border border-gray-600/30 hover:bg-gray-600/30 px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                  >
                    Quay lại
                  </button>
                  {/* <button
                    onClick={() => {
                      setPlanFormData((prev) => ({
                        ...prev,
                        customStages: suggestedPlan?.suggestedStages || [],
                      }));
                      handleCreatePlan();
                    }}
                    disabled={loading || !planFormData.reason.trim()}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Đang tạo..." : "Tạo kế hoạch"}
                  </button> */}
                  <button
                    onClick={() => handleCreatePlan(true)} // ✅ useTemplate = true
                    disabled={loading || !planFormData.reason.trim()}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Đang tạo..." : "Tạo kế hoạch"}
                  </button>
                </div>
              </div>
            )}

            {onboardingStep === 3 && (
              <div>
                {/* Real-time validation display */}
                {hasActiveSubscription &&
                  mySubscription &&
                  planFormData.customStages.length > 0 && (
                    <div className="mb-6">
                      <div
                        className={`p-4 rounded-xl border ${
                          calculateTotalDays(planFormData.customStages) <=
                          mySubscription.daysRemaining
                            ? "bg-green-500/10 border-green-500/30"
                            : "bg-red-500/10 border-red-500/30"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h5
                              className={`font-semibold ${
                                calculateTotalDays(planFormData.customStages) <=
                                mySubscription.daysRemaining
                                  ? "text-green-300"
                                  : "text-red-300"
                              }`}
                            >
                              Validation kế hoạch
                            </h5>
                            <p className="text-gray-400 text-sm">
                              Tổng số ngày:{" "}
                              {calculateTotalDays(planFormData.customStages)} /{" "}
                              {mySubscription.daysRemaining} ngày có sẵn
                            </p>
                          </div>
                          <div
                            className={`text-2xl ${
                              calculateTotalDays(planFormData.customStages) <=
                              mySubscription.daysRemaining
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {calculateTotalDays(planFormData.customStages) <=
                            mySubscription.daysRemaining
                              ? "✅"
                              : "❌"}
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="mt-3">
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                calculateTotalDays(planFormData.customStages) <=
                                mySubscription.daysRemaining
                                  ? "bg-green-500"
                                  : "bg-red-500"
                              }`}
                              style={{
                                width: `${Math.min(
                                  (calculateTotalDays(
                                    planFormData.customStages
                                  ) /
                                    mySubscription.daysRemaining) *
                                    100,
                                  100
                                )}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                {/* ✅ THÊM MỚI: Validation cho minimum duration */}
                {planFormData.customStages.length > 0 &&
                  calculateTotalDays(planFormData.customStages) <= 15 && (
                    <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                      <div className="flex items-start gap-3">
                        <div className="text-orange-400 text-xl">⚠️</div>
                        <div>
                          <h5 className="text-orange-300 font-semibold mb-1">
                            Kế hoạch quá ngắn
                          </h5>
                          <p className="text-orange-200 text-sm">
                            Tổng thời gian kế hoạch hiện tại là{" "}
                            <strong>
                              {calculateTotalDays(planFormData.customStages)}{" "}
                              ngày
                            </strong>
                            . Để đảm bảo hiệu quả, kế hoạch cai thuốc nên có ít
                            nhất <strong>16 ngày</strong>. Hãy tăng thời gian
                            hoặc thêm giai đoạn để có kế hoạch hiệu quả hơn.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                {/* ✅ THÊM MỚI: Plan Summary Card cho Add Modal */}
                {planFormData.customStages.length > 0 && (
                  <PlanSummaryCard
                    stages={planFormData.customStages}
                    title="Kế hoạch tùy chỉnh của bạn"
                    isUpdate={false} // Add modal = false
                  />
                )}
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-white mb-4">
                    🛠️ Tùy chỉnh kế hoạch
                  </h3>
                  <p className="text-gray-400">
                    Tạo kế hoạch theo cách riêng của bạn
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-purple-300 mb-3">
                    Lý do cai thuốc
                  </label>
                  <textarea
                    value={planFormData.reason}
                    onChange={(e) =>
                      setPlanFormData((prev) => ({
                        ...prev,
                        reason: e.target.value,
                      }))
                    }
                    className="w-full bg-gray-800/50 border border-purple-500/30 rounded-xl px-4 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 h-24 resize-none"
                    placeholder="Nhập lý do cai thuốc..."
                    required
                  />
                </div>

                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold text-white">
                      Các giai đoạn tùy chỉnh
                      <span className="text-sm font-normal text-blue-300 bg-blue-500/10 px-2 py-1 rounded-lg border border-blue-500/20 ml-2 inline-flex items-center gap-1">
                        <span className="text-blue-400">ℹ️</span>
                        Vui lòng cuộn xuống để xem nếu thêm giai đoạn
                      </span>
                    </h4>
                    <button
                      onClick={addCustomStage}
                      disabled={
                        !mySubscription ||
                        calculateTotalDays(planFormData.customStages) >=
                          mySubscription.daysRemaining
                      }
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                        !mySubscription ||
                        calculateTotalDays(planFormData.customStages) >=
                          mySubscription.daysRemaining
                          ? "bg-gray-500/20 text-gray-500 border border-gray-500/30 cursor-not-allowed"
                          : "bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30"
                      }`}
                      title={
                        !mySubscription
                          ? "Không có thông tin gói đăng ký"
                          : calculateTotalDays(planFormData.customStages) >=
                            mySubscription.daysRemaining
                          ? `Đã đạt giới hạn ${mySubscription.daysRemaining} ngày`
                          : "Thêm giai đoạn mới"
                      }
                    >
                      + Thêm giai đoạn
                    </button>
                  </div>

                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {planFormData.customStages.map((stage, index) => (
                      <div
                        key={index}
                        className="bg-gray-800/50 rounded-xl p-4 border border-gray-600/30"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h5 className="font-medium text-blue-300">
                            Giai đoạn {index + 1}
                          </h5>
                          <button
                            onClick={() => removeCustomStage(index)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            Xóa
                          </button>
                        </div>

                        <div className="space-y-3">
                          <input
                            type="text"
                            value={stage.title}
                            onChange={(e) =>
                              updateCustomStage(index, "title", e.target.value)
                            }
                            className="w-full bg-gray-700/50 border border-gray-600/30 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Tiêu đề giai đoạn (Bắt buộc)"
                          />
                          <textarea
                            value={stage.description}
                            onChange={(e) =>
                              updateCustomStage(
                                index,
                                "description",
                                e.target.value
                              )
                            }
                            className="w-full bg-gray-700/50 border border-gray-600/30 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                            placeholder="Mô tả chi tiết giai đoạn"
                          />
                          <div className="flex items-center gap-3">
                            <label className="text-gray-300 text-sm">
                              Số ngày:
                            </label>
                            <input
                              type="number"
                              value={stage.daysToComplete}
                              onChange={(e) =>
                                updateCustomStage(
                                  index,
                                  "daysToComplete",
                                  parseInt(e.target.value) || 1
                                )
                              }
                              className="bg-gray-700/50 border border-gray-600/30 rounded-lg px-3 py-2 text-white w-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              min="1"
                              max="365"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {planFormData.customStages.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <p>Chưa có giai đoạn nào. Hãy thêm giai đoạn đầu tiên!</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setOnboardingStep(1)}
                    className="bg-gray-600/20 text-gray-300 border border-gray-600/30 hover:bg-gray-600/30 px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                  >
                    Quay lại
                  </button>
                  {/* <button
                    onClick={handleCreatePlan}
                    disabled={
                      loading ||
                      !planFormData.reason.trim() ||
                      planFormData.customStages.length === 0
                    }
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Đang tạo..." : "Tạo kế hoạch tùy chỉnh"}
                  </button> */}
                  <button
                    onClick={() => handleCreatePlan(false)} // ✅ useTemplate = false
                    disabled={
                      loading ||
                      !planFormData.reason.trim() ||
                      planFormData.customStages.length === 0 ||
                      calculateTotalDays(planFormData.customStages) <= 15 ||
                      planFormData.customStages.some(
                        (stage) => !stage.title.trim()
                      ) ||
                      calculateTotalDays(planFormData.customStages) >
                        mySubscription.daysRemaining
                    }
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Đang tạo..." : "Tạo kế hoạch tùy chỉnh"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Update Modal - Enhanced */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">
                Chỉnh sửa kế hoạch
              </h3>
              <button
                onClick={() => setShowUpdateModal(false)}
                className="text-gray-400 hover:text-white text-2xl font-bold transition-colors duration-200 hover:bg-red-500/20 rounded-full w-8 h-8 flex items-center justify-center"
              >
                ×
              </button>
            </div>

            {/* Real-time validation display */}
            {hasActiveSubscription &&
              mySubscription &&
              planFormData.customStages.length > 0 && (
                <div className="mb-6">
                  <div
                    className={`p-4 rounded-xl border ${
                      calculateTotalDays(planFormData.customStages) <=
                      mySubscription.daysRemaining
                        ? "bg-green-500/10 border-green-500/30"
                        : "bg-red-500/10 border-red-500/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h5
                          className={`font-semibold ${
                            calculateTotalDays(planFormData.customStages) <=
                            mySubscription.daysRemaining
                              ? "text-green-300"
                              : "text-red-300"
                          }`}
                        >
                          Validation kế hoạch
                        </h5>
                        <p className="text-gray-400 text-sm">
                          Tổng số ngày:{" "}
                          {calculateTotalDays(planFormData.customStages)} /{" "}
                          {mySubscription.daysRemaining} ngày có sẵn
                        </p>
                      </div>
                      <div
                        className={`text-2xl ${
                          calculateTotalDays(planFormData.customStages) <=
                          mySubscription.daysRemaining
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {calculateTotalDays(planFormData.customStages) <=
                        mySubscription.daysRemaining
                          ? "✅"
                          : "❌"}
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3">
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            calculateTotalDays(planFormData.customStages) <=
                            mySubscription.daysRemaining
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                          style={{
                            width: `${Math.min(
                              (calculateTotalDays(planFormData.customStages) /
                                mySubscription.daysRemaining) *
                                100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            {/* ✅ THÊM MỚI: Validation cho minimum duration */}
            {planFormData.customStages.length > 0 &&
              calculateTotalDays(planFormData.customStages) <= 15 && (
                <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="text-orange-400 text-xl">⚠️</div>
                    <div>
                      <h5 className="text-orange-300 font-semibold mb-1">
                        Kế hoạch quá ngắn
                      </h5>
                      <p className="text-orange-200 text-sm">
                        Tổng thời gian kế hoạch hiện tại là{" "}
                        <strong>
                          {calculateTotalDays(planFormData.customStages)} ngày
                        </strong>
                        . Để đảm bảo hiệu quả, kế hoạch cai thuốc nên có ít nhất{" "}
                        <strong>16 ngày</strong>. Hãy tăng thời gian hoặc thêm
                        giai đoạn để có kế hoạch hiệu quả hơn.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            {/* ✅ THÊM MỚI: Plan Comparison Card cho Update Modal */}
            {planFormData.customStages.length > 0 && (
              <PlanComparisonCard
                currentStages={currentStage?.allStagesWithProgress || []}
                newStages={planFormData.customStages}
              />
            )}

            <div className="space-y-6">
              {/* Reason Section */}
              <div>
                <label className="block text-sm font-semibold text-purple-300 mb-3">
                  Lý do cai thuốc
                </label>
                <textarea
                  value={planFormData.reason}
                  onChange={(e) =>
                    setPlanFormData((prev) => ({
                      ...prev,
                      reason: e.target.value,
                    }))
                  }
                  className="w-full bg-gray-800/50 border border-purple-500/30 rounded-xl px-4 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 h-24 resize-none"
                  placeholder="Nhập lý do cai thuốc..."
                />
              </div>

              {/* Stages Section */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-white">
                    Quản lý giai đoạn
                    <span className="text-sm font-normal text-blue-300 bg-blue-500/10 px-2 py-1 rounded-lg border border-blue-500/20 ml-2 inline-flex items-center gap-1">
                      <span className="text-blue-400">ℹ️</span>
                      Vui lòng cuộn xuống để xem giai đoạn
                    </span>
                  </h4>
                  <button
                    onClick={addCustomStage}
                    disabled={
                      !mySubscription ||
                      calculateTotalDays(planFormData.customStages) >=
                        mySubscription.daysRemaining
                    }
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                      !mySubscription ||
                      calculateTotalDays(planFormData.customStages) >=
                        mySubscription.daysRemaining
                        ? "bg-gray-500/20 text-gray-500 border border-gray-500/30 cursor-not-allowed"
                        : "bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30"
                    }`}
                    title={
                      !mySubscription
                        ? "Không có thông tin gói đăng ký"
                        : calculateTotalDays(planFormData.customStages) >=
                          mySubscription.daysRemaining
                        ? `Đã đạt giới hạn ${mySubscription.daysRemaining} ngày`
                        : "Thêm giai đoạn mới"
                    }
                  >
                    + Thêm giai đoạn
                  </button>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="text-yellow-400 text-xl">⚠️</div>
                    <div>
                      <h5 className="text-yellow-300 font-semibold mb-1">
                        Lưu ý khi chỉnh sửa giai đoạn
                      </h5>
                      <p className="text-yellow-200 text-sm">
                        Việc thay đổi giai đoạn có thể ảnh hưởng đến tiến độ
                        hiện tại. Các giai đoạn đã hoàn thành sẽ được giữ
                        nguyên, giai đoạn đang thực hiện có thể bị reset.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {planFormData.customStages.map((stage, index) => (
                    <div
                      key={index}
                      className="bg-gray-800/50 rounded-xl p-4 border border-gray-600/30"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <h5 className="font-medium text-blue-300">
                            Giai đoạn {index + 1}
                          </h5>
                          {/* Hiển thị trạng thái nếu giai đoạn đã tồn tại */}
                          {stage._id && currentStage?.allStagesWithProgress && (
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                currentStage.allStagesWithProgress.find(
                                  (s) => s._id === stage._id
                                )?.status === "completed"
                                  ? "bg-green-500/20 text-green-300"
                                  : currentStage.allStagesWithProgress.find(
                                      (s) => s._id === stage._id
                                    )?.status === "in_progress"
                                  ? "bg-blue-500/20 text-blue-300"
                                  : "bg-gray-500/20 text-gray-300"
                              }`}
                            >
                              {currentStage.allStagesWithProgress.find(
                                (s) => s._id === stage._id
                              )?.status === "completed"
                                ? "Hoàn thành"
                                : currentStage.allStagesWithProgress.find(
                                    (s) => s._id === stage._id
                                  )?.status === "in_progress"
                                ? "Đang thực hiện"
                                : "Chưa bắt đầu"}
                            </span>
                          )}
                        </div>
                        {/* <button
                          onClick={() => removeCustomStage(index)}
                          disabled={
                            stage._id &&
                            currentStage?.allStagesWithProgress?.find(
                              (s) => s._id === stage._id
                            )?.status === "completed"
                          }
                          className={`text-sm transition-colors ${
                            stage._id &&
                            currentStage?.allStagesWithProgress?.find(
                              (s) => s._id === stage._id
                            )?.status === "completed"
                              ? "text-gray-600 cursor-not-allowed"
                              : "text-red-400 hover:text-red-300"
                          }`}
                          title={
                            stage._id &&
                            currentStage?.allStagesWithProgress?.find(
                              (s) => s._id === stage._id
                            )?.status === "completed"
                              ? "Không thể xóa giai đoạn đã hoàn thành"
                              : "Xóa giai đoạn"
                          }
                        >
                          {stage._id &&
                          currentStage?.allStagesWithProgress?.find(
                            (s) => s._id === stage._id
                          )?.status === "completed"
                            ? "🔒 Đã hoàn thành"
                            : "Xóa"}
                        </button> */}

                        {/* Delete button */}
                        <button
                          onClick={() => removeCustomStage(index)}
                          disabled={
                            stage._id &&
                            (currentStage?.allStagesWithProgress?.find(
                              (s) => s._id === stage._id
                            )?.status === "completed" ||
                              currentStage?.allStagesWithProgress?.find(
                                (s) => s._id === stage._id
                              )?.status === "in_progress")
                          }
                          className={`text-sm transition-colors ${
                            stage._id &&
                            (currentStage?.allStagesWithProgress?.find(
                              (s) => s._id === stage._id
                            )?.status === "completed" ||
                              currentStage?.allStagesWithProgress?.find(
                                (s) => s._id === stage._id
                              )?.status === "in_progress")
                              ? "text-gray-600 cursor-not-allowed"
                              : "text-red-400 hover:text-red-300"
                          }`}
                          title={
                            stage._id &&
                            currentStage?.allStagesWithProgress?.find(
                              (s) => s._id === stage._id
                            )?.status === "completed"
                              ? "Không thể xóa giai đoạn đã hoàn thành"
                              : stage._id &&
                                currentStage?.allStagesWithProgress?.find(
                                  (s) => s._id === stage._id
                                )?.status === "in_progress"
                              ? "Không thể xóa giai đoạn đang thực hiện"
                              : "Xóa giai đoạn"
                          }
                        >
                          {stage._id &&
                          currentStage?.allStagesWithProgress?.find(
                            (s) => s._id === stage._id
                          )?.status === "completed"
                            ? "🔒 Đã hoàn thành"
                            : stage._id &&
                              currentStage?.allStagesWithProgress?.find(
                                (s) => s._id === stage._id
                              )?.status === "in_progress"
                            ? "🔄 Đang thực hiện"
                            : "Xóa"}
                        </button>
                      </div>

                      <div className="space-y-3">
                        {/* <input
                          type="text"
                          value={stage.title}
                          onChange={(e) =>
                            updateCustomStage(index, "title", e.target.value)
                          }
                          disabled={
                            stage._id &&
                            currentStage?.allStagesWithProgress?.find(
                              (s) => s._id === stage._id
                            )?.status === "completed"
                          }
                          className={`w-full border rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                            stage._id &&
                            currentStage?.allStagesWithProgress?.find(
                              (s) => s._id === stage._id
                            )?.status === "completed"
                              ? "bg-gray-700/30 border-gray-600/30 cursor-not-allowed text-gray-400"
                              : "bg-gray-700/50 border-gray-600/30 focus:ring-blue-500"
                          }`}
                          placeholder="Tiêu đề giai đoạn"
                        />

                        <textarea
                          value={stage.description}
                          onChange={(e) =>
                            updateCustomStage(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          disabled={
                            stage._id &&
                            currentStage?.allStagesWithProgress?.find(
                              (s) => s._id === stage._id
                            )?.status === "completed"
                          }
                          className={`w-full border rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 h-20 resize-none transition-all ${
                            stage._id &&
                            currentStage?.allStagesWithProgress?.find(
                              (s) => s._id === stage._id
                            )?.status === "completed"
                              ? "bg-gray-700/30 border-gray-600/30 cursor-not-allowed text-gray-400"
                              : "bg-gray-700/50 border-gray-600/30 focus:ring-blue-500"
                          }`}
                          placeholder="Mô tả chi tiết giai đoạn"
                        /> */}

                        {/* Title input */}
                        <input
                          type="text"
                          value={stage.title}
                          onChange={(e) =>
                            updateCustomStage(index, "title", e.target.value)
                          }
                          disabled={
                            stage._id &&
                            (currentStage?.allStagesWithProgress?.find(
                              (s) => s._id === stage._id
                            )?.status === "completed" ||
                              currentStage?.allStagesWithProgress?.find(
                                (s) => s._id === stage._id
                              )?.status === "in_progress")
                          }
                          className={`w-full border rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                            stage._id &&
                            (currentStage?.allStagesWithProgress?.find(
                              (s) => s._id === stage._id
                            )?.status === "completed" ||
                              currentStage?.allStagesWithProgress?.find(
                                (s) => s._id === stage._id
                              )?.status === "in_progress")
                              ? "bg-gray-700/30 border-gray-600/30 cursor-not-allowed text-gray-400"
                              : "bg-gray-700/50 border-gray-600/30 focus:ring-blue-500"
                          }`}
                          placeholder="Tiêu đề giai đoạn (Bắt buộc)"
                        />

                        {/* Description textarea */}
                        <textarea
                          value={stage.description}
                          onChange={(e) =>
                            updateCustomStage(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          disabled={
                            stage._id &&
                            (currentStage?.allStagesWithProgress?.find(
                              (s) => s._id === stage._id
                            )?.status === "completed" ||
                              currentStage?.allStagesWithProgress?.find(
                                (s) => s._id === stage._id
                              )?.status === "in_progress")
                          }
                          className={`w-full border rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 h-20 resize-none transition-all ${
                            stage._id &&
                            (currentStage?.allStagesWithProgress?.find(
                              (s) => s._id === stage._id
                            )?.status === "completed" ||
                              currentStage?.allStagesWithProgress?.find(
                                (s) => s._id === stage._id
                              )?.status === "in_progress")
                              ? "bg-gray-700/30 border-gray-600/30 cursor-not-allowed text-gray-400"
                              : "bg-gray-700/50 border-gray-600/30 focus:ring-blue-500"
                          }`}
                          placeholder="Mô tả chi tiết giai đoạn"
                        />

                        <div className="flex items-center gap-3">
                          <label className="text-gray-300 text-sm">
                            Số ngày:
                          </label>
                          {/* <input
                            type="number"
                            value={stage.daysToComplete}
                            onChange={(e) =>
                              updateCustomStage(
                                index,
                                "daysToComplete",
                                parseInt(e.target.value) || 1
                              )
                            }
                            disabled={
                              stage._id &&
                              currentStage?.allStagesWithProgress?.find(
                                (s) => s._id === stage._id
                              )?.status === "completed"
                            }
                            className={`border rounded-lg px-3 py-2 text-white w-20 focus:outline-none focus:ring-2 transition-all ${
                              stage._id &&
                              currentStage?.allStagesWithProgress?.find(
                                (s) => s._id === stage._id
                              )?.status === "completed"
                                ? "bg-gray-700/30 border-gray-600/30 cursor-not-allowed text-gray-400"
                                : "bg-gray-700/50 border-gray-600/30 focus:ring-blue-500"
                            }`}
                            min="1"
                            max="365"
                          /> */}
                          <input
                            type="number"
                            value={stage.daysToComplete}
                            onChange={(e) =>
                              updateCustomStage(
                                index,
                                "daysToComplete",
                                parseInt(e.target.value) || 1
                              )
                            }
                            disabled={
                              (stage._id &&
                                currentStage?.allStagesWithProgress?.find(
                                  (s) => s._id === stage._id
                                )?.status === "completed") ||
                              (stage._id &&
                                currentStage?.allStagesWithProgress?.find(
                                  (s) => s._id === stage._id
                                )?.status === "in_progress")
                            }
                            className={`border rounded-lg px-3 py-2 text-white w-20 focus:outline-none focus:ring-2 transition-all ${
                              stage._id &&
                              (currentStage?.allStagesWithProgress?.find(
                                (s) => s._id === stage._id
                              )?.status === "completed" ||
                                currentStage?.allStagesWithProgress?.find(
                                  (s) => s._id === stage._id
                                )?.status === "in_progress")
                                ? "bg-gray-700/30 border-gray-600/30 cursor-not-allowed text-gray-400"
                                : "bg-gray-700/50 border-gray-600/30 focus:ring-blue-500"
                            }`}
                            min="1"
                            max="365"
                          />
                          {stage._id &&
                            currentStage?.allStagesWithProgress?.find(
                              (s) => s._id === stage._id
                            )?.status === "in_progress" && (
                              <span className="text-blue-300 text-sm">
                                (Không thể chỉnh sửa khi đang thực hiện)
                              </span>
                            )}
                        </div>
                      </div>
                      {/* Warning message for in_progress stages */}
                      {stage._id &&
                        currentStage?.allStagesWithProgress?.find(
                          (s) => s._id === stage._id
                        )?.status === "in_progress" && (
                          <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                            <p className="text-blue-300 text-xs">
                              ⚠️ Giai đoạn này đang được thực hiện và không thể
                              chỉnh sửa
                            </p>
                          </div>
                        )}
                    </div>
                  ))}
                </div>

                {planFormData.customStages.length === 0 && (
                  <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-600/30 rounded-xl">
                    <div className="text-4xl mb-2">📝</div>
                    <p>Chưa có giai đoạn nào. Hãy thêm giai đoạn đầu tiên!</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-gray-600/30">
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="flex-1 bg-gray-600/20 text-gray-300 border border-gray-600/30 hover:bg-gray-600/30 px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                >
                  Hủy
                </button>
                <button
                  onClick={handleUpdatePlan}
                  disabled={
                    loading ||
                    !planFormData.reason.trim() ||
                    planFormData.customStages.length === 0 ||
                    calculateTotalDays(planFormData.customStages) <= 15 ||
                    planFormData.customStages.some(
                      (stage) => !stage.title.trim()
                    ) ||
                    !hasChanges() ||
                    calculateTotalDays(planFormData.customStages) >
                      mySubscription.daysRemaining
                  }
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Đang cập nhật..." : "Cập nhật kế hoạch"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuitPlan;
