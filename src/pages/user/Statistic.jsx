import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../../components/Navbar";
import {
  getProgressStatistics,
  getProgressChart,
  clearError,
  clearProgressLogState,
} from "../../redux/features/progressLog/progressLogSlice";
import { getMySubscription } from "../../redux/features/subscription/subscriptionSlice";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function Statistic() {
  const dispatch = useDispatch();
  const { statistics, chartData, loading, error } = useSelector(
    (state) => state.progressLog
  );

  const {
    mySubscription,
    hasActiveSubscription,
    loading: subscriptionLoading,
  } = useSelector((state) => state.subscription);

  const [chartDays, setChartDays] = useState(30);

  useEffect(() => {
    dispatch(getMySubscription());
  }, [dispatch]);

  useEffect(() => {
    if (!hasActiveSubscription && !subscriptionLoading) {
      dispatch(clearProgressLogState());
    }
  }, [hasActiveSubscription, subscriptionLoading, dispatch]);

  useEffect(() => {
    if (hasActiveSubscription && !subscriptionLoading) {
      dispatch(getProgressStatistics());
      dispatch(getProgressChart(chartDays));
    }
  }, [dispatch, chartDays, hasActiveSubscription, subscriptionLoading]);

  useEffect(() => {
    // Clear error after 5 seconds
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleChartDaysChange = (days) => {
    setChartDays(days);
  };

  // Format currency for VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Format date for chart
  const formatChartDate = (dateString) => {
    // Parse date string as local date (not UTC)
    const [year, month, day] = dateString.split("-");
    const date = new Date(year, month - 1, day); // month is 0-indexed

    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  // Get mood color
  const getMoodColor = (mood) => {
    const colors = {
      excellent: "#10B981", // green
      good: "#3B82F6", // blue
      normal: "#F59E0B", // yellow
      stressed: "#F97316", // orange
      difficult: "#EF4444", // red
    };
    return colors[mood] || "#6B7280";
  };

  // Chart.js options
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#9CA3AF",
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(31, 41, 55, 0.9)",
        titleColor: "#F3F4F6",
        bodyColor: "#D1D5DB",
        borderColor: "#4B5563",
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function (context) {
            return `🚬 ${context.parsed.y} điếu`;
          },
          title: function (context) {
            // ✅ FIX: Use the raw label (date string) directly
            return `📅 ${formatChartDate(context[0].label)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "#374151",
          drawBorder: false,
        },
        ticks: {
          color: "#9CA3AF",
          font: {
            size: 11,
          },
          // ✅ FIX: Format ticks correctly
          callback: function (value, index, values) {
            const label = this.getLabelForValue(value);
            return formatChartDate(label);
          },
          maxTicksLimit: 10, // Limit number of ticks shown
        },
      },
      y: {
        grid: {
          color: "#374151",
          drawBorder: false,
        },
        ticks: {
          color: "#9CA3AF",
          font: {
            size: 11,
          },
        },
        beginAtZero: true,
      },
    },
    elements: {
      point: {
        radius: 4,
        hoverRadius: 6,
        backgroundColor: "#3B82F6",
        borderColor: "#60A5FA",
        borderWidth: 2,
      },
      line: {
        tension: 0.1,
      },
    },
  };

  // Prepare line chart data
  const lineChartData = chartData?.chartData
    ? {
        labels: chartData.chartData.map((item) => item.date), // Keep as date strings
        datasets: [
          {
            label: "Số điếu/ngày",
            data: chartData.chartData.map((item) => item.cigarettesPerDay),
            borderColor: "#3B82F6",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            fill: true,
            tension: 0.3,
            pointBackgroundColor: chartData.chartData.map((item) =>
              item.cigarettesPerDay === 0 ? "#10B981" : "#3B82F6"
            ),
            pointBorderColor: chartData.chartData.map((item) =>
              item.cigarettesPerDay === 0 ? "#059669" : "#60A5FA"
            ),
            pointHoverBackgroundColor: "#60A5FA",
            pointHoverBorderColor: "#93C5FD",
            // ✅ FIX: Highlight points with data
            pointRadius: chartData.chartData.map((item) =>
              item.cigarettesPerDay !== null ? 4 : 0
            ),
            spanGaps: false, // Don't connect null values
          },
        ],
      }
    : { labels: [], datasets: [] };

  // Prepare mood distribution chart (Doughnut)
  const moodChartData = statistics?.moodTrends
    ? {
        labels: Object.keys(statistics.moodTrends).map((mood) => {
          const moodLabels = {
            excellent: "Tuyệt vời",
            good: "Tốt",
            normal: "Bình thường",
            stressed: "Căng thẳng",
            difficult: "Khó khăn",
          };
          return moodLabels[mood] || mood;
        }),
        datasets: [
          {
            data: Object.values(statistics.moodTrends),
            backgroundColor: [
              "#10B981", // excellent
              "#3B82F6", // good
              "#F59E0B", // normal
              "#F97316", // stressed
              "#EF4444", // difficult
            ],
            borderColor: [
              "#059669",
              "#2563EB",
              "#D97706",
              "#EA580C",
              "#DC2626",
            ],
            borderWidth: 2,
            hoverOffset: 4,
          },
        ],
      }
    : { labels: [], datasets: [] };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#9CA3AF",
          font: {
            size: 11,
          },
          padding: 15,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: "rgba(31, 41, 55, 0.9)",
        titleColor: "#F3F4F6",
        bodyColor: "#D1D5DB",
        borderColor: "#4B5563",
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function (context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((context.raw / total) * 100);
            return `${context.label}: ${context.raw} lần (${percentage}%)`;
          },
        },
      },
    },
    cutout: "50%",
  };

  if (loading && !statistics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-purple-900/20 to-pink-900/20">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400 text-lg">Đang tải thống kê...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-purple-900/20 to-pink-900/20">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Không thể tải thống kê
            </h2>
            <p className="text-gray-400 mb-8">{error}</p>
            <button
              onClick={() => {
                dispatch(getProgressStatistics());
                dispatch(getProgressChart(chartDays));
              }}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!hasActiveSubscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-purple-900/20 to-pink-900/20">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 py-3">
              Thống Kê Tiến Trình
            </h1>
            <p className="text-gray-400">
              Theo dõi và phân tích hành trình cai thuốc của bạn
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

  if (!statistics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-purple-900/20 to-pink-900/20">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Chưa có dữ liệu thống kê
            </h2>
            <p className="text-gray-400">
              Hãy bắt đầu ghi nhận tiến trình để xem thống kê chi tiết
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-purple-900/20 to-pink-900/20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 py-3">
            Thống Kê Tiến Trình
          </h1>
          <p className="text-gray-400">
            Theo dõi và phân tích hành trình cai thuốc của bạn
          </p>
        </div>

        {!hasActiveSubscription && (
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
        )}

        {!statistics && (
          <div className="min-h-screen bg-gradient-to-br from-dark-900 via-purple-900/20 to-pink-900/20">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8">
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📊</div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Chưa có dữ liệu thống kê
                </h2>
                <p className="text-gray-400">
                  Hãy bắt đầu ghi nhận tiến trình để xem thống kê chi tiết
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Days Logged */}
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="bg-blue-500/20 p-3 rounded-xl">
                <span className="text-2xl">📅</span>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Tổng ngày ghi nhận</p>
                <p className="text-2xl font-bold text-blue-300">
                  {statistics.totalDaysLogged}
                </p>
              </div>
            </div>
          </div>

          {/* Days Without Smoking */}
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="bg-green-500/20 p-3 rounded-xl">
                <span className="text-2xl">🎉</span>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Số ngày không hút thuốc</p>
                <p className="text-2xl font-bold text-green-300">
                  {statistics.daysWithoutSmoking}
                </p>
              </div>
            </div>
          </div>

          {/* Longest Streak */}
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-500/20 p-3 rounded-xl">
                <span className="text-2xl">🔥</span>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Streak dài nhất</p>
                <p className="text-2xl font-bold text-yellow-300">
                  {statistics.longestStreakWithoutSmoking} ngày
                </p>
              </div>
            </div>
          </div>

          {/* Money Saved */}
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="bg-purple-500/20 p-3 rounded-xl">
                <span className="text-2xl">💰</span>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Tiền tiết kiệm</p>
                <p className="text-2xl font-bold text-purple-300">
                  {formatCurrency(statistics.totalMoneySaved)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Stats Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Average Stats */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="text-blue-400">📈</span>
              Thống kê trung bình
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">TB tổng thể:</span>
                <span className="text-white font-medium">
                  {statistics.averageCigarettesPerDay} điếu/ngày
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">TB 7 ngày gần nhất:</span>
                <span className="text-white font-medium">
                  {statistics.current7DaysAverage} điếu/ngày
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Số điếu đã bỏ được:</span>
                <span className="text-green-400 font-medium">
                  {statistics.totalSavedCigarettes} điếu
                </span>
              </div>
            </div>
          </div>

          {/* Progress Percentage */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="text-green-400">🎯</span>
              Tiến độ kế hoạch
            </h3>
            <div className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-600"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${
                      (statistics.progressPercentage / 100) * 351.86
                    } 351.86`}
                    className="text-green-400"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-green-400">
                    {statistics.progressPercentage}%
                  </span>
                </div>
              </div>
              {statistics.planInfo && (
                <div className="text-center">
                  <p className="text-gray-400 text-sm mb-1">Mục tiêu:</p>
                  <p className="text-white text-sm">
                    {new Date(
                      statistics.planInfo.expectedQuitDate
                    ).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Mood Trends Chart */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="text-purple-400">😊</span>
              Xu hướng tâm trạng
            </h3>
            {Object.keys(statistics.moodTrends || {}).length > 0 ? (
              <div className="h-48">
                <Doughnut data={moodChartData} options={doughnutOptions} />
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center">
                <p className="text-gray-400 text-center">
                  Chưa có dữ liệu tâm trạng
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Progress Chart */}
        <div className="glass-card p-6 rounded-2xl mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="text-blue-400">📊</span>
              Biểu đồ tiến trình
            </h3>

            {/* Chart Days Selector */}
            <div className="flex items-center gap-3">
              <label className="text-gray-400 text-sm">Khoảng thời gian:</label>
              <div className="flex gap-2">
                {[7, 14, 30, 60, 90].map((days) => (
                  <button
                    key={days}
                    onClick={() => handleChartDaysChange(days)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 ${
                      chartDays === days
                        ? "bg-blue-500/30 text-blue-300 border border-blue-500/50"
                        : "bg-gray-600/20 text-gray-400 hover:bg-gray-600/30"
                    }`}
                  >
                    {days} ngày
                  </button>
                ))}
              </div>
            </div>
          </div>

          {chartData && chartData.chartData ? (
            <>
              {/* Chart Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/30">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📊</span>
                    <div>
                      <p className="text-blue-300 text-sm">
                        Số tiến trình đã ghi nhận
                      </p>
                      <p className="text-white font-bold">
                        {chartData.summary.totalLogs}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/30">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📈</span>
                    <div>
                      <p className="text-yellow-300 text-sm">
                        Số điếu thuốc trung bình/ngày
                      </p>
                      <p className="text-white font-bold">
                        {chartData.summary.averageCigarettes}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/30">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🎉</span>
                    <div>
                      <p className="text-green-300 text-sm">
                        Số ngày không hút
                      </p>
                      <p className="text-white font-bold">
                        {chartData.summary.smokeFreedays}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Line Chart */}
              <div className="h-80">
                <Line data={lineChartData} options={lineChartOptions} />
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📈</div>
              <p className="text-gray-400">Chưa có dữ liệu biểu đồ</p>
            </div>
          )}
        </div>

        {/* Health Improvements */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-green-400">🩺</span>
            Dự đoán cải thiện sức khỏe
          </h3>

          {statistics.healthImprovements?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {statistics.healthImprovements.map((improvement, index) => (
                <div
                  key={index}
                  className={`rounded-xl p-4 border transition-all duration-300 ${
                    improvement.achieved
                      ? "bg-green-500/10 border-green-500/30"
                      : "bg-gray-600/10 border-gray-600/30"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">
                      {improvement.achieved ? "✅" : "⏳"}
                    </span>
                    <div>
                      <h4
                        className={`font-semibold mb-1 ${
                          improvement.achieved
                            ? "text-green-300"
                            : "text-gray-400"
                        }`}
                      >
                        {improvement.milestone}
                      </h4>
                      <p
                        className={`text-sm ${
                          improvement.achieved
                            ? "text-green-200"
                            : "text-gray-500"
                        }`}
                      >
                        {improvement.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🏥</div>
              <p className="text-gray-400">
                Chưa có dự đoán cải thiện sức khỏe
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Statistic;
