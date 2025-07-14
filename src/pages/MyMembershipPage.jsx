// src/pages/MyMembershipPage.js

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import { getMySubscription } from "../redux/features/subscription/subscriptionSlice";
import {
  createMembershipOrder,
  cancelMySubscription,
  resetMembershipPaymentState,
} from "../redux/features/userMembership/userMembershipSlice";
import Navbar from "../components/Navbar";
import {
  IoShieldCheckmark,
  IoKey,
  IoAlertCircle,
  IoCalendar,
  IoTime,
  IoDocumentText,
  IoSync,
  IoArrowBack,
  IoWarning,
} from "react-icons/io5";

function MyMembershipPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isCancelModalOpen, setCancelModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const {
    mySubscription,
    hasActiveSubscription,
    loading: subscriptionLoading,
  } = useSelector((state) => state.subscription);
  const {
    loading: paymentLoading,
    error: paymentError,
    paymentUrl,
  } = useSelector((state) => state.membership);

  useEffect(() => {
    dispatch(resetMembershipPaymentState());
    dispatch(getMySubscription());
  }, [dispatch]);

  const handleConfirmCancel = async () => {
    if (!mySubscription?._id) return;
    setIsProcessing(true);
    try {
      await dispatch(cancelMySubscription(mySubscription._id)).unwrap();
      toast.success("Hủy gói thành viên thành công!");
      setCancelModalOpen(false);
      dispatch(getMySubscription());
    } catch (err) {
      toast.error(err?.message || "Đã có lỗi xảy ra khi hủy gói.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExtend = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Vui lòng đăng nhập lại để gia hạn.");
      return navigate("/login");
    }
    try {
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.id || decodedToken._id;
      const membershipId = mySubscription?.membershipId?._id;
      const subscriptionId = mySubscription?._id;

      if (userId && membershipId && subscriptionId) {
        const paymentInfo = { intent: "renew", subscriptionId: subscriptionId };
        localStorage.setItem("paymentInfo", JSON.stringify(paymentInfo));
        dispatch(
          createMembershipOrder({ userId, membershipId, mode: "renew" })
        );
      } else {
        toast.error("Không tìm thấy thông tin gói để gia hạn.");
      }
    } catch (error) {
      toast.error("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
      navigate("/login");
    }
  };

  useEffect(() => {
    if (paymentUrl) {
      window.location.href = paymentUrl;
      dispatch(resetMembershipPaymentState());
    }
  }, [paymentUrl, dispatch]);

  useEffect(() => {
    if (paymentError) {
      toast.error(paymentError);
      dispatch(resetMembershipPaymentState());
    }
  }, [paymentError, dispatch]);

  const renderContent = () => {
    if (subscriptionLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-10 glass-card rounded-2xl">
          <IoSync className="animate-spin text-purple-400 text-5xl mb-4" />
          <p className="text-white/80 text-lg">
            Đang tải thông tin gói của bạn...
          </p>
        </div>
      );
    }
    const isExpired =
      mySubscription && new Date(mySubscription.endDate) < new Date();
    if (!hasActiveSubscription || !mySubscription || isExpired) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-10 glass-card rounded-2xl animate-fade-in">
          <IoAlertCircle className="text-orange-400 text-6xl mb-6" />
          <h2 className="text-3xl font-bold text-white mb-2">
            Chưa có gói thành viên
          </h2>
          <p className="text-white/70 max-w-sm mb-8">
            {isExpired
              ? "Gói thành viên của bạn đã hết hạn. Hãy đăng ký gói mới để tiếp tục tận hưởng các đặc quyền."
              : "Bạn hiện chưa đăng ký bất kỳ gói thành viên nào. Hãy nâng cấp để tận hưởng các tính năng độc quyền!"}
          </p>
          <button
            onClick={() => navigate("/user/membership")}
            className="gradient-button flex items-center justify-center space-x-2 px-8 py-4 text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <IoKey size={20} />
            <span>Nâng cấp ngay</span>
          </button>
        </div>
      );
    }
    const { membershipId, startDate, endDate } = mySubscription;
    const daysRemaining = Math.ceil(
      (new Date(endDate) - new Date()) / (1000 * 3600 * 24)
    );
    const isRenewable = daysRemaining <= 3;
    return (
      <div className="glass-card p-8 md:p-10 animate-fade-in glow-effect">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 pb-8 border-b border-white/20">
          <div>
            <h2 className="text-4xl font-bold text-white">
              {membershipId.name}
            </h2>
            <p className="mt-2 flex items-center space-x-2 font-semibold text-green-400">
              <IoShieldCheckmark size={20} />
              <span>Đang hoạt động</span>
            </p>
          </div>
          <div className="text-4xl font-black text-purple-300 mt-4 md:mt-0">
            {membershipId.price.toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
            })}
          </div>
        </div>
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 flex-shrink-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <IoDocumentText size={16} color="white" />
            </div>
            <div>
              <h3 className="font-semibold text-white/80">Mô tả gói</h3>
              <p className="text-white/60 mt-1">{membershipId.description}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl">
              <div className="w-8 h-8 flex-shrink-0 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                <IoCalendar size={16} color="white" />
              </div>
              <div>
                <h3 className="font-semibold text-white/80">Ngày bắt đầu</h3>
                <p className="text-white/60 mt-1">
                  {new Date(startDate).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl">
              <div className="w-8 h-8 flex-shrink-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <IoCalendar size={16} color="white" />
              </div>
              <div>
                <h3 className="font-semibold text-white/80">Ngày kết thúc</h3>
                <p className="text-white/60 mt-1">
                  {new Date(endDate).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl">
            <div className="w-8 h-8 flex-shrink-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <IoTime size={16} color="white" />
            </div>
            <div>
              <h3 className="font-semibold text-white/80">Thời hạn</h3>
              <p className="text-white/60 mt-1">{membershipId.duration} ngày</p>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-white/20 flex flex-col md:flex-row items-center justify-end space-y-4 md:space-y-0 md:space-x-4">
          <p className="mr-auto text-sm text-white/60">
            Bạn chỉ có thể gia hạn trước ngày hết hạn 3 ngày.
          </p>
          <button
            onClick={() => setCancelModalOpen(true)}
            disabled={isProcessing}
            className="w-full md:w-auto text-center px-6 py-3 rounded-lg text-red-400 font-semibold bg-red-500/10 hover:bg-red-500/20 transition-colors duration-300 disabled:opacity-50"
          >
            Hủy gói
          </button>
          <button
            onClick={handleExtend}
            disabled={!isRenewable || paymentLoading}
            className="w-full md:w-auto text-center px-8 py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-teal-500 to-cyan-500 shadow-lg hover:shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:saturate-50 disabled:shadow-none hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
          >
            {paymentLoading ? (
              <>
                <IoSync className="animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <span>Gia hạn</span>
            )}
          </button>
        </div>
        {isRenewable && !paymentLoading && (
          <p className="text-center md:text-right mt-3 text-sm text-cyan-300 animate-pulse">
            Gói của bạn sắp hết hạn. Hãy gia hạn ngay!
          </p>
        )}

        <div className="mt-8 flex justify-center">
          <button
            onClick={() => navigate("/user/membership")}
            className="text-sm text-white/70 hover:text-white border border-white/20 px-5 py-2 rounded-lg hover:bg-white/10 transition-all"
          >
            Xem các gói thành viên khác
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-purple-900/20 to-pink-900/20">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors group"
          >
            <IoArrowBack className="group-hover:-translate-x-1 transition-transform" />
            <span>Quay lại</span>
          </button>
        </div>
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold text-white mb-4 gradient-text">
            Gói Thành Viên
          </h1>
          <p className="text-white/70 text-xl max-w-2xl mx-auto">
            Xem chi tiết thông tin gói đăng ký hiện tại của bạn.
          </p>
        </div>
        {renderContent()}
      </div>
      {isCancelModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-fade-in-fast">
          <div className="glass-card-darker p-6 md:p-8 rounded-2xl max-w-md w-full shadow-2xl animate-scale-in border border-white/10">
            <div className="flex flex-col items-center text-center">
              <div className="flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-full bg-red-900/50 mb-4 border-2 border-red-500/50">
                <IoWarning
                  className="h-8 w-8 text-red-400"
                  aria-hidden="true"
                />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Xác nhận hủy gói
              </h3>
              <p className="text-white/70">
                Bạn có chắc chắn muốn hủy gói thành viên này không? Nếu hủy, bạn
                sẽ không còn sử dụng được các tiện ích độc quyền của gói nữa.
              </p>
            </div>
            <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-center sm:space-x-4 space-y-3 space-y-reverse sm:space-y-0">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                disabled={isProcessing}
                className="w-full inline-flex justify-center rounded-lg border border-white/20 px-4 py-2.5 bg-transparent text-base font-medium text-white/80 hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={isProcessing}
                className="w-full inline-flex justify-center rounded-lg border border-transparent px-4 py-2.5 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none transition-colors disabled:opacity-50"
              >
                {isProcessing ? "Đang hủy..." : "Xác nhận hủy"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyMembershipPage;
