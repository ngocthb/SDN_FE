import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import ChatPopup from "../components/ChatPopup";
import {
  IoArrowForwardSharp,
  IoSparkles,
  IoBarChartOutline,
  IoPeopleOutline,
  IoBulbOutline,
  IoTrophyOutline,
  IoRibbonOutline,
  IoChatbubblesSharp,
} from "react-icons/io5";
import { fetchLeaderboard } from "../redux/features/achievement/achievementSlice";
import { getMySubscription } from "../redux/features/subscription/subscriptionSlice";
import UserRatingPage from "../components/Rating";
import FeedbackComponent from "../components/Feedback";

const FeatureCard = ({ icon, title, description, gradient }) => (
  <div className="glass-card p-6 text-center animate-slide-up glow-effect">
    <div
      className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${gradient} flex items-center justify-center text-3xl shadow-lg text-white`}
    >
      {icon}
    </div>
    <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
    <p className="text-sm text-white/60">{description}</p>
  </div>
);

const TestimonialCard = ({ quote, name, detail, avatar }) => (
  <div className="glass-card p-8 animate-slide-up">
    <p className="text-white/80 italic mb-4">"{quote}"</p>
    <div className="flex items-center">
      <img src={avatar} alt={name} className="w-12 h-12 rounded-full mr-4" />
      <div>
        <p className="font-bold text-white">{name}</p>
        <p className="text-sm text-purple-300">{detail}</p>
      </div>
    </div>
  </div>
);

const Leaderboard = () => {
  const { leaderboard, loading, error } = useSelector(
    (state) => state.achievement
  );

  const rankStyles = [
    {
      bg: "bg-yellow-500/20",
      border: "border-yellow-400",
      iconColor: "text-yellow-400",
      medal: "🥇",
    },
    {
      bg: "bg-gray-400/20",
      border: "border-gray-300",
      iconColor: "text-gray-300",
      medal: "🥈",
    },
    {
      bg: "bg-orange-600/20",
      border: "border-orange-500",
      iconColor: "text-orange-500",
      medal: "🥉",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="glass-card p-4 h-20 animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-8 text-center text-red-400">
        <p className="font-semibold">Đã xảy ra lỗi</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <div className="glass-card p-8 text-center text-white/70">
        <p className="font-semibold">Chưa có ai trên bảng xếp hạng</p>
        <p className="text-sm">Hãy là người đầu tiên ghi danh!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {leaderboard.map((user, index) => {
        const style =
          index < 3
            ? rankStyles[index]
            : {
                bg: "bg-white/10",
                border: "border-transparent",
                iconColor: "text-purple-400",
              };

        return (
          <div
            key={user._id}
            className={`flex items-center p-4 rounded-xl transition-all duration-300 animate-slide-in ${style.bg} border ${style.border}`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div
              className={`text-2xl font-bold w-12 text-center ${style.iconColor}`}
            >
              {index < 3 ? style.medal : `#${index + 1}`}
            </div>

            <div className="flex items-center flex-1 ml-4">
              <img
                src={user.picture}
                alt={user.name}
                className="w-12 h-12 rounded-full ring-2 ring-purple-500/50 object-cover"
              />
              <div className="ml-4 min-w-0">
                <p className="font-semibold text-white truncate">{user.name}</p>
                <p className="text-sm text-white/60">
                  {user.grantedAchievements?.length || 0} thành tựu
                </p>
              </div>
            </div>

            <div className="flex items-center text-lg font-bold text-yellow-400 ml-4">
              <IoRibbonOutline className="mr-2" />
              {user.totalPoints}
            </div>
          </div>
        );
      })}
    </div>
  );
};

function Homepage() {
  const dispatch = useDispatch();
  const { hasActiveSubscription } = useSelector((state) => state.subscription);
  const token = localStorage.getItem("token");
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchLeaderboard());
    if (token) {
      dispatch(getMySubscription());
    }
  }, [dispatch, token]);

  const handleCloseChatPopup = () => {
    setIsChatOpen(false);
  };

  const features = [
    {
      title: "Theo Dõi Tiến Trình",
      description:
        "Trực quan hóa số ngày không hút thuốc, tiền tiết kiệm và sức khỏe cải thiện.",
      icon: <IoBarChartOutline />,
      gradient: "from-blue-500 to-purple-500",
    },
    {
      title: "Cộng Đồng Hỗ Trợ 24/7",
      description:
        "Kết nối với chuyên gia và những người cùng chí hướng để được chia sẻ, động viên.",
      icon: <IoPeopleOutline />,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "Công Cụ & Kiến Thức",
      description:
        "Tiếp cận thư viện bài viết, mẹo vặt và các công cụ giúp bạn vượt qua cơn thèm thuốc.",
      icon: <IoBulbOutline />,
      gradient: "from-pink-500 to-orange-500",
    },
  ];

  const testimonials = [
    {
      quote:
        "Nhờ có cộng đồng và sự theo dõi sát sao, tôi đã bỏ thuốc được 6 tháng. Cảm ơn nền tảng rất nhiều!",
      name: "Anh Minh Tuấn",
      detail: "Đã cai thuốc được 6 tháng",
      avatar:
        "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
    },
    {
      quote:
        "Các công cụ đối phó với cơn thèm thuốc thực sự hiệu quả. Mỗi khi cảm thấy yếu lòng, tôi lại mở app ra.",
      name: "Chị Lan Anh",
      detail: "Đã cai thuốc được 92 ngày",
      avatar:
        "https://images.pexels.com/photos/1310522/pexels-photo-1310522.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-purple-900/20 to-pink-900/20 text-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="text-center py-20 animate-fade-in">
          <IoSparkles className="text-5xl text-purple-400 mx-auto mb-4" />
          <h1 className="text-5xl md:text-7xl font-bold mb-4">
            Bỏ Thuốc Lá.{" "}
            <span className="gradient-text">Bắt Đầu Cuộc Sống Mới.</span>
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto mb-8">
            Nền tảng đồng hành cùng bạn trên mọi bước đường, từ theo dõi tiến
            trình, kết nối cộng đồng đến các công cụ hỗ trợ khoa học.
          </p>
          <Link
            to="/register"
            className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:scale-105 transition-transform duration-300"
          >
            Bắt Đầu Miễn Phí{" "}
            <IoArrowForwardSharp className="inline-block ml-2" />
          </Link>
        </section>

        <section className="py-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            Tại Sao Chọn Chúng Tôi?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </section>

        <section className="py-20">
          <h2 className="text-3xl font-bold text-center mb-4 flex items-center justify-center gap-3">
            <IoTrophyOutline /> Bảng Vàng Vinh Danh
          </h2>
          <p className="text-center text-white/70 mb-12 max-w-2xl mx-auto">
            Vinh danh những thành viên có thành tích xuất sắc nhất trong hành
            trình vượt qua chính mình.
          </p>
          <div className="max-w-3xl mx-auto">
            <Leaderboard />
          </div>
        </section>

        <section className="py-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            Người Dùng Nói Về Chúng Tôi
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </div>
        </section>

        <section className="py-20">
          <div className="glass-card p-12 rounded-2xl text-center glow-effect">
            <h2 className="text-4xl font-bold mb-4">
              Sẵn Sàng Cho Một Khởi Đầu Mới?
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto mb-8">
              Hàng ngàn người đã bắt đầu hành trình sức khỏe của họ. Đừng chần
              chừ, tham gia cộng đồng của chúng tôi ngay hôm nay.
            </p>
            <Link
              to="/register"
              className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:scale-105 transition-transform duration-300"
            >
              Tham Gia Ngay
            </Link>
          </div>
        </section>
      </main>

      {token && hasActiveSubscription && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center text-3xl z-40 animate-float glow-effect"
        >
          <IoChatbubblesSharp />
        </button>
      )}

      <ChatPopup isOpen={isChatOpen} onClose={handleCloseChatPopup} />

      {/* Chỉ hiển thị UserRatingPage và FeedbackComponent khi đã đăng nhập */}
      {token && (
        <>
          <UserRatingPage />
          <FeedbackComponent />
        </>
      )}
    </div>
  );
}

export default Homepage;
