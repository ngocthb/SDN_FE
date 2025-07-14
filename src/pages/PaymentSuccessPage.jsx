// src/pages/PaymentSuccessPage.js

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  confirmMembershipPayment,
  extendSubscription,
  resetMembershipPaymentState,
} from "../redux/features/userMembership/userMembershipSlice";
import { IoCheckmarkCircle, IoCloseCircle } from "react-icons/io5";

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const hasDispatchedRef = useRef(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState("new");

  const { loading, error, confirmedSubscription } = useSelector(
    (state) => state.membership
  );

  useEffect(() => {
    const paymentInfoString = localStorage.getItem("paymentInfo");
    localStorage.removeItem("paymentInfo");

    let info = { intent: "new" };
    if (paymentInfoString) {
      try {
        info = JSON.parse(paymentInfoString);
        if (info.intent === "renew") {
          setPaymentIntent("renew");
        }
      } catch (e) {
        console.error("Lỗi parse paymentInfo từ localStorage:", e);
      }
    }

    const vnp_ResponseCode = searchParams.get("vnp_ResponseCode");
    const vnp_TransactionStatus = searchParams.get("vnp_TransactionStatus");
    const vnp_TxnRef = searchParams.get("vnp_TxnRef");

    if (!vnp_TxnRef) {
      navigate("/");
      return;
    }

    if (
      (vnp_ResponseCode === "00" || vnp_TransactionStatus === "00") &&
      !hasDispatchedRef.current
    ) {
      hasDispatchedRef.current = true;

      if (info.intent === "renew" && info.subscriptionId) {
        dispatch(extendSubscription({ subscriptionId: info.subscriptionId }));
      } else {
        const vnpayData = Object.fromEntries([...searchParams]);
        dispatch(confirmMembershipPayment(vnpayData));
      }
    } else if (vnp_ResponseCode !== "00" && vnp_TransactionStatus !== "00") {
      setIsRedirecting(true);
      const messages = {
        "01": "Giao dịch đã tồn tại.",
        "02": "Merchant không hợp lệ.",
        "07": "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên hệ VNPAY).",
        "09": "Thẻ/Tài khoản chưa đăng ký Internet Banking.",
        10: "Thẻ/Tài khoản bị khóa.",
        11: "Sai mật khẩu xác thực.",
        12: "Thẻ/Tài khoản đã hết hạn.",
        13: "Sai mã OTP.",
        24: "Bạn đã hủy giao dịch.",
        51: "Tài khoản không đủ số dư.",
        65: "Vượt quá hạn mức trong ngày.",
        default: "Giao dịch không thành công do lỗi không xác định.",
      };
      const errorCode = vnp_ResponseCode || vnp_TransactionStatus;
      const errorMessage = messages[errorCode] || messages["default"];
      navigate("/user/payment/failed", {
        state: { message: errorMessage },
        replace: true,
      });
    }

    return () => {
      dispatch(resetMembershipPaymentState());
    };
  }, [dispatch, searchParams, navigate]);

  if (isRedirecting) return null;

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center">
          <svg
            className="animate-spin mx-auto h-12 w-12 text-white mb-4"
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
          <h2 className="text-2xl font-bold text-white">
            Giao dịch thành công! Đang xác nhận...
          </h2>
          <p className="text-white/70 mt-2">
            Vui lòng đợi trong giây lát, hệ thống đang ghi nhận đăng ký của bạn.
          </p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="text-center">
          <IoCloseCircle className="text-red-500 text-7xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white">
            Xác nhận thanh toán thất bại
          </h2>
          <p className="text-white/70 mt-2">{error}</p>
          <p className="text-sm text-yellow-400 mt-4">
            Giao dịch có thể đã thành công nhưng hệ thống gặp lỗi khi tạo gói.
            Vui lòng liên hệ hỗ trợ để kiểm tra.
          </p>
          <Link
            to="/contact"
            className="gradient-button mt-6 inline-flex items-center space-x-2 px-6 py-3 rounded-lg"
          >
            <span>Liên hệ hỗ trợ</span>
          </Link>
        </div>
      );
    }
    if (confirmedSubscription) {
      const isRenewal = paymentIntent === "renew";
      const title = isRenewal ? "Gia hạn thành công!" : "Đăng ký thành công!";
      const message = isRenewal
        ? "Gói của bạn đã được gia hạn. Cảm ơn bạn đã tiếp tục đồng hành!"
        : "Gói của bạn đã được kích hoạt. Cảm ơn bạn đã tin tưởng!";
      const buttonText = isRenewal ? "Xem gói của bạn" : "Tới trang cá nhân";
      const redirectPath = isRenewal ? "/user/my-membership" : "/profile";
      return (
        <div className="text-center">
          <IoCheckmarkCircle className="text-green-500 text-7xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <p className="text-white/70 mt-2">{message}</p>
          <div className="bg-white/10 p-4 rounded-lg mt-4 text-left max-w-sm mx-auto space-y-2">
            <p className="break-all">
              <strong>Mã giao dịch:</strong>{" "}
              <span className="font-mono break-all block">
                {confirmedSubscription.paymentId || "N/A"}
              </span>
            </p>
            <p>
              <strong>Ngày bắt đầu:</strong>{" "}
              {new Date(confirmedSubscription.startDate).toLocaleDateString(
                "vi-VN"
              )}
            </p>
            <p>
              <strong>Ngày kết thúc:</strong>{" "}
              {new Date(confirmedSubscription.endDate).toLocaleDateString(
                "vi-VN"
              )}
            </p>
          </div>
          <Link
            to={redirectPath}
            className="gradient-button mt-6 inline-flex items-center space-x-2 px-6 py-3 rounded-lg"
          >
            <span>{buttonText}</span>
          </Link>
        </div>
      );
    }
    return null;
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-pink-900/20 text-white flex items-center justify-center p-4">
      <div className="glass-card max-w-lg w-full p-8 rounded-2xl">
        {renderContent()}
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
