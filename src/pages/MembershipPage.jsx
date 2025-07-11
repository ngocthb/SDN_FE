// src/pages/MembershipPage.js

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { IoCubeOutline, IoKey, IoTimeOutline } from "react-icons/io5";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import Navbar from "../components/Navbar";
import {
  fetchMemberships,
  createMembershipOrder,
  resetMembershipPaymentState,
} from "../redux/features/userMembership/userMembershipSlice";

const MembershipCard = ({ plan, onRegisterClick, isLoading }) => {
  const formattedPrice = plan.price.toLocaleString("vi-VN");
  const [title, subtitle] = plan.name.split("–").map((s) => s.trim());
  return (
    <div className="glass-card p-8 flex flex-col h-full rounded-3xl border border-transparent hover:border-purple-400 transition-all duration-300 ease-in-out transform hover:-translate-y-2 cursor-pointer shadow-lg hover:shadow-purple-500/20">
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600">
          <IoCubeOutline size={32} color="white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white leading-tight">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-purple-300 font-medium">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="flex justify-between items-center my-4">
        <span className="text-4xl font-extrabold text-white">
          {formattedPrice}đ
        </span>
        <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-full text-sm">
          <IoTimeOutline className="text-cyan-400" />
          <span className="text-white/80">{plan.duration} ngày</span>
        </div>
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent my-4"></div>
      <div className="flex-grow my-2">
        <p className="text-white/70 text-center leading-relaxed">
          {plan.description}
        </p>
      </div>
      <div className="mt-auto pt-4">
        <button
          onClick={() => onRegisterClick(plan._id)}
          disabled={isLoading}
          className="gradient-button w-full flex items-center justify-center space-x-2 px-6 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Đang xử lý...</span>
            </>
          ) : (
            <>
              <IoKey size={18} />
              <span>Đăng ký gói</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

function MembershipPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    memberships,
    loading: loadingMemberships,
    error: fetchError,
  } = useSelector((state) => state.membership);
  const {
    loading: paymentLoading,
    error: paymentError,
    paymentUrl,
  } = useSelector((state) => state.membership);
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  useEffect(() => {
    dispatch(resetMembershipPaymentState());
    dispatch(fetchMemberships());
  }, [dispatch]);

  const handleRegisterClick = (membershipId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Vui lòng đăng nhập để đăng ký gói.");
      navigate("/login");
      return;
    }
    try {
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.id || decodedToken._id;
      if (!userId) {
        toast.error("Token không hợp lệ. Vui lòng đăng nhập lại.");
        navigate("/login");
        return;
      }

      const paymentInfo = { intent: "new" };
      localStorage.setItem("paymentInfo", JSON.stringify(paymentInfo));

      setSelectedPlanId(membershipId);
      dispatch(
        createMembershipOrder({ userId, membershipId, mode: "register" })
      );
    } catch (error) {
      toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
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
      setSelectedPlanId(null);
    }
  }, [paymentError, dispatch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-pink-900/20 text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-5xl lg:text-6xl font-bold mb-4">
            <span className="gradient-text from-purple-400 to-pink-500">
              Khai Phá Tiềm Năng Của Bạn
            </span>
          </h1>
          <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
            Hãy chọn một gói phù hợp với nhu cầu của bạn để mở khóa các tính
            năng độc quyền và tham gia cộng đồng đầy năng lượng.
          </p>
        </div>
        {loadingMemberships && (
          <p className="text-center text-white/60">Đang tải các gói...</p>
        )}
        {fetchError && (
          <p className="text-center text-red-500 font-semibold">{fetchError}</p>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 animate-slide-up">
          {memberships
            .filter((plan) => !plan.isDeleted)
            .map((plan) => (
              <MembershipCard
                key={plan._id}
                plan={plan}
                onRegisterClick={handleRegisterClick}
                isLoading={paymentLoading && selectedPlanId === plan._id}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

export default MembershipPage;
