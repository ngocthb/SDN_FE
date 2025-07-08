import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Navbar from "../../components/Navbar";
import {
  getSmokingStatus,
  createOrUpdateSmokingStatus,
  deleteSmokingStatus,
  calculateSmokingCost,
  clearError,
  clearSuccess,
  clearSmokingStatusState,
} from "../../redux/features/smokingStatus/smokingStatusSlice";
import { getMySubscription } from "../../redux/features/subscription/subscriptionSlice";
function SmokingStatus() {
  const dispatch = useDispatch();
  const { smokingStatus, costCalculation, loading, error, success, message } =
    useSelector((state) => state.smokingStatus);

  const {
    mySubscription,
    hasActiveSubscription,
    loading: subscriptionLoading,
  } = useSelector((state) => state.subscription);

  const [showModal, setShowModal] = useState(false);
  const [showCostModal, setShowCostModal] = useState(false);
  const [modalType, setModalType] = useState(""); // 'create' or 'update'
  const [formData, setFormData] = useState({
    cigarettesPerDay: "",
    pricePerCigarette: "",
  });
  const [costDays, setCostDays] = useState(30);

  useEffect(() => {
    dispatch(getMySubscription());
  }, [dispatch]);

  useEffect(() => {
    if (!hasActiveSubscription && !subscriptionLoading) {
      dispatch(clearSmokingStatusState());
    }
  }, [hasActiveSubscription, subscriptionLoading, dispatch]);

  useEffect(() => {
    if (hasActiveSubscription && !subscriptionLoading) {
      dispatch(getSmokingStatus());
    }
  }, [dispatch, hasActiveSubscription, subscriptionLoading]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
    if (success) {
      toast.success(message);
      dispatch(clearSuccess());
      setShowModal(false);
      if (modalType === "create" || modalType === "update") {
        dispatch(getSmokingStatus());
      }
    }
  }, [error, success, message, dispatch, modalType]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openModal = (type) => {
    setModalType(type);
    if (type === "update" && smokingStatus) {
      setFormData({
        cigarettesPerDay: smokingStatus.cigarettesPerDay.toString(),
        pricePerCigarette: smokingStatus.pricePerCigarette.toString(),
      });
    } else {
      setFormData({
        cigarettesPerDay: "",
        pricePerCigarette: "",
      });
    }
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.cigarettesPerDay || !formData.pricePerCigarette) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    const cigarettesPerDay = parseFloat(formData.cigarettesPerDay);
    const pricePerCigarette = parseFloat(formData.pricePerCigarette);

    if (cigarettesPerDay <= 0 || pricePerCigarette <= 0) {
      toast.error("Số lượng thuốc và giá tiền phải lớn hơn 0");
      return;
    }

    dispatch(
      createOrUpdateSmokingStatus({
        cigarettesPerDay,
        pricePerCigarette,
      })
    );
  };

  const handleDelete = () => {
    if (
      window.confirm("Bạn có chắc chắn muốn xóa thông tin hút thuốc không?")
    ) {
      dispatch(deleteSmokingStatus());
    }
  };

  const handleCalculateCost = () => {
    if (smokingStatus) {
      dispatch(calculateSmokingCost(costDays));
      setShowCostModal(true);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (!hasActiveSubscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-purple-900/20 to-pink-900/20">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 py-3">
              Tình Trạng Hút Thuốc
            </h1>
            <p className="text-gray-400">
              Theo dõi và quản lý thông tin hút thuốc của bạn
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
              <button className="ml-auto bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300">
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

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 py-3">
            Tình Trạng Hút Thuốc
          </h1>
          <p className="text-gray-400">
            Theo dõi và quản lý thông tin hút thuốc của bạn
          </p>
        </div>

        <div className="glass-card p-8 rounded-2xl">
          {smokingStatus ? (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="text-6xl text-orange-400 mx-auto mb-4">🚬</div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Thông Tin Hiện Tại
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-purple-500/10 rounded-xl p-6 border border-purple-500/20">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-purple-300 mb-2">
                      Số điếu thuốc/ngày
                    </h3>
                    <p className="text-3xl font-bold text-white">
                      {smokingStatus.cigarettesPerDay}
                    </p>
                    <span className="text-gray-400 text-sm">điếu</span>
                  </div>
                </div>

                <div className="bg-orange-500/10 rounded-xl p-6 border border-orange-500/20">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-orange-300 mb-2">
                      Giá tiền/điếu
                    </h3>
                    <p className="text-3xl font-bold text-white">
                      {formatCurrency(smokingStatus.pricePerCigarette)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-red-500/10 rounded-xl p-6 border border-red-500/20">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-red-300 mb-2">
                    Chi phí hàng ngày
                  </h3>
                  <p className="text-4xl font-bold text-red-400">
                    {formatCurrency(
                      smokingStatus.cigarettesPerDay *
                        smokingStatus.pricePerCigarette
                    )}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 justify-center mt-8">
                <button
                  onClick={() => openModal("update")}
                  className="bg-cyan-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30 px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2"
                  disabled={loading}
                >
                  Cập nhật
                </button>

                <button
                  onClick={handleCalculateCost}
                  className="bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30 px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2"
                  disabled={loading}
                >
                  Tính chi phí
                </button>

                {/* <button
                  onClick={handleDelete}
                  className="bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2"
                  disabled={loading}
                >
                  Xóa thông tin
                </button> */}
              </div>
            </div>
          ) : (
            <div className="text-center space-y-6">
              <div className="text-8xl text-gray-500 mx-auto">🚬</div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Chưa có thông tin về tình trạng hút thuốc
                </h2>
                <p className="text-gray-400 mb-6">
                  Vui lòng khai báo để bắt đầu theo dõi
                </p>
                <button
                  onClick={() => openModal("create")}
                  className="btn-primary flex items-center gap-2 mx-auto"
                  disabled={loading}
                >
                  Khai báo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Create/Update */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-8 w-full max-w-md">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-white">
                {modalType === "create" ? "Khai báo" : "Cập nhật"} tình trạng
                hút thuốc
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white text-2xl font-bold transition-colors duration-200 hover:bg-red-500/20 rounded-full w-8 h-8 flex items-center justify-center"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                {/* Cigarettes Per Day Input */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-purple-300 mb-3">
                    Số điếu thuốc hút mỗi ngày
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="cigarettesPerDay"
                      value={formData.cigarettesPerDay}
                      onChange={handleInputChange}
                      className="w-full bg-gray-800/50 border border-purple-500/30 rounded-xl px-4 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 pr-16"
                      placeholder="10"
                      min="0"
                      step="0.1"
                      required
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm font-medium">
                      điếu
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Nhập số điếu thuốc bạn hút trung bình mỗi ngày
                  </p>
                </div>

                {/* Price Per Cigarette Input */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-orange-300 mb-3">
                    Giá tiền mỗi điếu thuốc
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm font-medium">
                      ₫
                    </div>
                    <input
                      type="number"
                      name="pricePerCigarette"
                      value={formData.pricePerCigarette}
                      onChange={handleInputChange}
                      className="w-full bg-gray-800/50 border border-orange-500/30 rounded-xl pl-10 pr-4 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                      placeholder="1000"
                      min="0"
                      step="100"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Giá tiền một điếu thuốc tính bằng VNĐ
                  </p>
                </div>

                {/* Preview calculation */}
                {formData.cigarettesPerDay && formData.pricePerCigarette && (
                  <div className="bg-gradient-to-r from-purple-500/10 to-orange-500/10 rounded-xl p-4 border border-purple-500/20">
                    <div className="text-center">
                      <p className="text-sm text-gray-300 mb-1">
                        Chi phí dự kiến hàng ngày:
                      </p>
                      <p className="text-xl font-bold text-white">
                        {formatCurrency(
                          parseFloat(formData.cigarettesPerDay || 0) *
                            parseFloat(formData.pricePerCigarette || 0)
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-600/20 text-gray-300 border border-gray-600/30 hover:bg-gray-600/30 px-6 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Đang lưu...
                    </>
                  ) : (
                    "Lưu thông tin"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cost Calculation Modal */}
      {showCostModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-8 w-full max-w-lg">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-white">
                Tính toán chi phí hút thuốc
              </h3>
              <button
                onClick={() => setShowCostModal(false)}
                className="text-gray-400 hover:text-white text-2xl font-bold transition-colors duration-200 hover:bg-red-500/20 rounded-full w-8 h-8 flex items-center justify-center"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Enhanced Days Input */}
              <div className="relative">
                <label className="block text-sm font-semibold text-blue-300 mb-3">
                  Số ngày tính toán
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={costDays}
                    onChange={(e) =>
                      setCostDays(parseInt(e.target.value) || 30)
                    }
                    className="w-full bg-gray-800/50 border border-blue-500/30 rounded-xl px-4 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 pr-16"
                    placeholder="30"
                    min="1"
                    max="365"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm font-medium">
                    ngày
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Nhập số ngày muốn tính toán chi phí (1-365 ngày)
                </p>

                {/* Quick preset buttons */}
                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => setCostDays(7)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                      costDays === 7
                        ? "bg-blue-500/30 text-blue-300 border border-blue-500/50"
                        : "bg-gray-700/30 text-gray-400 border border-gray-600/30 hover:bg-gray-600/30"
                    }`}
                  >
                    1 tuần
                  </button>
                  <button
                    type="button"
                    onClick={() => setCostDays(30)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                      costDays === 30
                        ? "bg-blue-500/30 text-blue-300 border border-blue-500/50"
                        : "bg-gray-700/30 text-gray-400 border border-gray-600/30 hover:bg-gray-600/30"
                    }`}
                  >
                    1 tháng
                  </button>
                  <button
                    type="button"
                    onClick={() => setCostDays(90)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                      costDays === 90
                        ? "bg-blue-500/30 text-blue-300 border border-blue-500/50"
                        : "bg-gray-700/30 text-gray-400 border border-gray-600/30 hover:bg-gray-600/30"
                    }`}
                  >
                    3 tháng
                  </button>
                  <button
                    type="button"
                    onClick={() => setCostDays(365)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                      costDays === 365
                        ? "bg-blue-500/30 text-blue-300 border border-blue-500/50"
                        : "bg-gray-700/30 text-gray-400 border border-gray-600/30 hover:bg-gray-600/30"
                    }`}
                  >
                    1 năm
                  </button>
                </div>
              </div>

              {costCalculation && (
                <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-xl p-6 border border-red-500/20">
                  <h4 className="text-lg font-bold text-white mb-4">
                    Kết quả tính toán ({costCalculation.days} ngày)
                  </h4>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Tổng số điếu thuốc:</span>
                      <span className="text-white font-semibold">
                        {costCalculation.totalCigarettes} điếu
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-300">Chi phí hàng ngày:</span>
                      <span className="text-white font-semibold">
                        {formatCurrency(costCalculation.dailyCost)}
                      </span>
                    </div>

                    <hr className="border-gray-600" />

                    <div className="flex justify-between text-lg">
                      <span className="text-red-300 font-bold">
                        Tổng chi phí:
                      </span>
                      <span className="text-red-400 font-bold text-xl">
                        {formatCurrency(costCalculation.totalCost)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => handleCalculateCost()}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Đang tính...
                    </>
                  ) : (
                    "Tính toán lại"
                  )}
                </button>
                <button
                  onClick={() => setShowCostModal(false)}
                  className="flex-1 bg-gray-600/20 text-gray-300 border border-gray-600/30 hover:bg-gray-600/30 px-6 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SmokingStatus;
