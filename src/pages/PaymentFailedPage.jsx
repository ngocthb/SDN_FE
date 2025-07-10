// src/pages/PaymentFailedPage.js

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { IoCloseCircle, IoArrowBack } from "react-icons/io5";

const PaymentFailedPage = () => {
  const location = useLocation();
  const errorMessage =
    location.state?.message ||
    "Giao dịch của bạn đã bị hủy hoặc đã xảy ra lỗi. Vui lòng thử lại.";
  const [redirectPath, setRedirectPath] = useState("/user/membership");
  const [buttonText, setButtonText] = useState("Quay lại trang Gói");

  useEffect(() => {
    const paymentInfoString = localStorage.getItem("paymentInfo");
    localStorage.removeItem("paymentInfo");

    if (paymentInfoString) {
      try {
        const info = JSON.parse(paymentInfoString);
        if (info.intent === "renew") {
          setRedirectPath("/user/my-membership");
          setButtonText("Quay lại quản lý gói");
        }
      } catch (e) {
        console.error("Lỗi parse paymentInfo từ localStorage:", e);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900/20 to-gray-900 text-white flex items-center justify-center p-4">
      <div className="glass-card max-w-lg w-full p-8 rounded-2xl text-center">
        <IoCloseCircle className="text-red-500 text-7xl mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white">
          Thanh toán không thành công
        </h2>
        <p className="text-white/70 mt-2">{errorMessage}</p>
        <div className="mt-8">
          <Link
            to={redirectPath}
            className="gradient-button-alt inline-flex items-center space-x-2 px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            <IoArrowBack />
            <span>{buttonText}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailedPage;
