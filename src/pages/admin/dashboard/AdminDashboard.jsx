import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  IoStatsChartOutline,
  IoPeopleOutline,
  IoPersonOutline,
  IoShieldCheckmarkOutline,
  IoBriefcaseOutline,
  IoCheckmarkCircleOutline,
  IoTrendingUpOutline,
  IoDownloadOutline,
} from "react-icons/io5";
import api from "../../../config/axios";
import AdminLayout from "../../../layouts/admin/AdminLayout";

const AdminDashboard = () => {
  const [statistics, setStatistics] = useState(null);
  const [membershipStats, setMembershipStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hàm gọi API để refresh data
  const fetchData = async () => {
    setLoading(true);
    try {
      // Gọi API thống kê users
      const statsResponse = await api.get("/admin/users/statistics");
      if (statsResponse.data.status === "OK") {
        setStatistics(statsResponse.data.data);
      }

      // Gọi API thống kê memberships
      const membershipResponse = await api.get("/admin/membership/statistics");
      if (membershipResponse.data.status === "OK") {
        setMembershipStats(membershipResponse.data.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Unable to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // useEffect để gọi API khi component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Hàm xuất báo cáo
  const handleExportReport = async () => {
    try {
      const response = await api.get("/admin/users/export");

      if (response.data.status === "OK") {
        // Tạo và download CSV file
        const csvData = response.data.data;
        const csvContent = convertToCSV(csvData);
        downloadCSV(csvContent, "users-report.csv");
      }
    } catch (error) {
      console.error("Error exporting report:", error);
      alert("Unable to export report. Please try again.");
    }
  };

  // Hàm convert array to CSV
  const convertToCSV = (data) => {
    if (!data || data.length === 0) return "";

    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(",");
    const csvRows = data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Escape commas and quotes in values
          return typeof value === "string" &&
            (value.includes(",") || value.includes('"'))
            ? `"${value.replace(/"/g, '""')}"`
            : value;
        })
        .join(",")
    );

    return [csvHeaders, ...csvRows].join("\n");
  };

  // Hàm download CSV
  const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  //format vnd
  const formatVND = (amount) => {
    if (!amount || amount === 0) return "0 VND";

    // Convert to number nếu là string
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

    // Format với dấu phẩy ngăn cách hàng nghìn
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount);
  };

  // Chart colors
  const COLORS = ["#8b5cf6", "#ec4899", "#06b6d4", "#10b981", "#f59e0b"];

  // Transform data for charts
  const roleData = statistics
    ? [
      { name: "Users", value: statistics.byRole.users, color: COLORS[0] },
      { name: "Coaches", value: statistics.byRole.coaches, color: COLORS[1] },
      { name: "Admins", value: statistics.byRole.admins, color: COLORS[2] },
    ]
    : [];

  const genderData = statistics
    ? [
      { name: "Male", value: statistics.byGender.male, color: COLORS[0] },
      { name: "Female", value: statistics.byGender.female, color: COLORS[1] },
      {
        name: "Unknown",
        value: statistics.byGender.unknown,
        color: COLORS[2],
      },
    ]
    : [];

  const trendData = statistics
    ? statistics.registrationTrend.map((item) => ({
      date: new Date(item._id).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      registrations: item.count,
    }))
    : [];

  // Membership data for charts
  const subscriptionStatusData = membershipStats
    ? [
      {
        name: "Active",
        value: membershipStats.statusDistribution.active,
        color: COLORS[0],
      },
      {
        name: "Expired",
        value: membershipStats.statusDistribution.expired,
        color: COLORS[1],
      },
      {
        name: "Cancelled",
        value: membershipStats.statusDistribution.cancelled,
        color: COLORS[2],
      },
    ].filter((item) => item.value > 0)
    : [];

  const popularPlansData = membershipStats
    ? membershipStats.popularPlans.map((plan) => ({
      name: plan.name,
      subscriptions: plan.subscriptionCount,
      revenue: plan.revenue,
    }))
    : [];

  const revenueTrendData = membershipStats
    ? membershipStats.revenueTrends.map((item) => ({
      date: new Date(item._id).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      revenue: item.dailyRevenue,
    }))
    : [];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col min-h-screen">
          <div className="flex flex-1">
            <div className="flex-1 bg-gradient-to-br from-dark-900 via-purple-900/20 to-pink-900/20 flex items-center justify-center">
              <div className="text-white text-xl">Loading...</div>
            </div>
          </div>
        </div>
      </AdminLayout>

    );
  }

  return (
    <AdminLayout>
       <div className="flex flex-col min-h-screen">
      <div className="flex flex-1">
        <div className="flex-1 bg-gradient-to-br from-dark-900 via-purple-900/20 to-pink-900/20 overflow-x-hidden">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Admin Dashboard
                </h1>
                <p className="text-white/70 mt-2">
                  System overview and user management statistics
                </p>
              </div>
              <button
                onClick={handleExportReport}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors whitespace-nowrap"
              >
                <IoDownloadOutline />
                Export Report
              </button>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Card 1: Total Users */}
              <div className="glass-card p-6 rounded-xl min-h-[140px] flex flex-col">
                <div className="flex items-start justify-between h-full">
                  <div className="flex-1 pr-3">
                    <p className="text-white/70 text-sm mb-2">Total Users</p>
                    <p className="text-2xl lg:text-3xl font-bold text-white mb-3 leading-tight">
                      {statistics?.overview.total || 0}
                    </p>
                    <div className="flex items-center gap-1 flex-wrap">
                      <IoTrendingUpOutline className="text-green-400 text-sm flex-shrink-0" />
                      <span className="text-green-400 text-xs lg:text-sm leading-relaxed">
                        +{statistics?.overview.newLast30Days || 0} in 30 days
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-purple-500/20 rounded-lg flex-shrink-0">
                    <IoPeopleOutline className="text-purple-400 text-xl lg:text-2xl" />
                  </div>
                </div>
              </div>

              {/* Card 2: Active Subscriptions */}
              <div className="glass-card p-6 rounded-xl min-h-[140px] flex flex-col">
                <div className="flex items-start justify-between h-full">
                  <div className="flex-1 pr-3">
                    <p className="text-white/70 text-sm mb-2">
                      Active Subscriptions
                    </p>
                    <p className="text-2xl lg:text-3xl font-bold text-white mb-3 leading-tight">
                      {membershipStats?.overview.activeSubscriptions || 0}
                    </p>
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-blue-400 text-xs lg:text-sm leading-relaxed">
                        {membershipStats?.overview.subscribedUsers || 0} users
                        subscribed
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-500/20 rounded-lg flex-shrink-0">
                    <IoCheckmarkCircleOutline className="text-blue-400 text-xl lg:text-2xl" />
                  </div>
                </div>
              </div>

              {/* Card 3: Total Revenue */}
              <div className="glass-card p-6 rounded-xl min-h-[140px] flex flex-col">
                <div className="flex items-start justify-between h-full">
                  <div className="flex-1 pr-3">
                    <p className="text-white/70 text-sm mb-2">Total Revenue</p>
                    <p className="text-lg lg:text-2xl xl:text-3xl font-bold text-white mb-3 leading-tight break-words">
                      {membershipStats?.overview.totalRevenue
                        ? formatVND(membershipStats.overview.totalRevenue)
                        : "0 VND"}
                    </p>
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-green-400 text-xs lg:text-sm leading-relaxed">
                        {membershipStats?.overview.totalSubscriptions || 0}{" "}
                        total subscriptions
                      </span>
                    </div>
                  </div>
                  {/* <div className="p-3 bg-green-500/20 rounded-lg flex-shrink-0">
                    <IoStatsChartOutline className="text-green-400 text-xl lg:text-2xl" />
                  </div> */}
                </div>
              </div>

              {/* Card 4: Membership Plans */}
              <div className="glass-card p-6 rounded-xl min-h-[140px] flex flex-col">
                <div className="flex items-start justify-between h-full">
                  <div className="flex-1 pr-3">
                    <p className="text-white/70 text-sm mb-2">
                      Membership Plans
                    </p>
                    <p className="text-2xl lg:text-3xl font-bold text-white mb-3 leading-tight">
                      {membershipStats?.overview.totalPlans || 0}
                    </p>
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-purple-400 text-xs lg:text-sm leading-relaxed">
                        {membershipStats?.overview.totalPlans || 0} total plans
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-purple-500/20 rounded-lg flex-shrink-0">
                    <IoBriefcaseOutline className="text-purple-400 text-xl lg:text-2xl" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Revenue Trend */}
              <div className="glass-card p-6 rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <IoStatsChartOutline className="text-green-400 text-xl" />
                  <h3 className="text-xl font-semibold text-white">
                    Revenue Trend (30 days)
                  </h3>
                </div>
                <div className="w-full overflow-hidden">
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart
                      data={revenueTrendData}
                      margin={{ top: 20, right: 30, left: 60, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
                      <XAxis
                        dataKey="date"
                        stroke="#ffffff70"
                        fontSize={12}
                        tickMargin={10}
                      />
                      <YAxis
                        stroke="#ffffff70"
                        fontSize={12}
                        tickMargin={10}
                        width={50}
                        tickFormatter={(value) => {
                          if (value >= 1000000) {
                            return `${(value / 1000000).toFixed(1)}M`;
                          } else if (value >= 1000) {
                            return `${(value / 1000).toFixed(0)}K`;
                          }
                          return value.toString();
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(0,0,0,0.9)",
                          border: "1px solid rgba(255,255,255,0.2)",
                          borderRadius: "8px",
                          color: "white",
                        }}
                        formatter={(value) => [formatVND(value), "Revenue"]}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#10b981"
                        fill="url(#revenueGradient)"
                        strokeWidth={2}
                      />
                      <defs>
                        <linearGradient
                          id="revenueGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#10b981"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#10b981"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Subscription Status Distribution */}
              <div className="glass-card p-6 rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <IoShieldCheckmarkOutline className="text-blue-400 text-xl" />
                  <h3 className="text-xl font-semibold text-white">
                    Subscription Status
                  </h3>
                </div>
                {subscriptionStatusData.length === 0 ? (
                  <div className="flex items-center justify-center h-[350px]">
                    <p className="text-gray-400 text-lg">
                      No subscription data available
                    </p>
                  </div>
                ) : (
                  <div className="w-full overflow-hidden">
                    <ResponsiveContainer width="100%" height={350}>
                      <PieChart
                        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                      >
                        <Pie
                          data={subscriptionStatusData}
                          cx="50%"
                          cy="45%"
                          labelLine={false}
                          label={({ name, percent, value, x, y }) => {
                            return (
                              <text
                                x={x}
                                y={y}
                                fill="white"
                                textAnchor={x > 200 ? "start" : "end"}
                                dominantBaseline="central"
                                fontSize="12"
                                fontWeight="500"
                              >
                                {`${name}: ${value} (${(percent * 100).toFixed(
                                  0
                                )}%)`}
                              </text>
                            );
                          }}
                          outerRadius={70}
                          innerRadius={0}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {subscriptionStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(0, 0, 0, 0.9)",
                            border: "1px solid rgba(255,255,255,0.2)",
                            borderRadius: "8px",
                            color: "white",
                          }}
                          formatter={(value, name) => [
                            `${value} subscriptions`,
                            name,
                          ]}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={40}
                          iconType="circle"
                          formatter={(value, entry) => (
                            <span
                              style={{
                                color: "white",
                                fontSize: "14px",
                                fontWeight: "500",
                              }}
                            >
                              {value} ({entry.payload.value})
                            </span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>

            {/* Secondary Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Popular Membership Plans */}
              <div className="glass-card p-6 rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <IoBriefcaseOutline className="text-purple-400 text-xl" />
                  <h3 className="text-xl font-semibold text-white">
                    Popular Membership Plans
                  </h3>
                </div>
                <div className="w-full overflow-hidden">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={popularPlansData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                      <XAxis dataKey="name" stroke="#ffffff70" />
                      <YAxis stroke="#ffffff70" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(0,0,0,0.8)",
                          border: "1px solid rgba(255,255,255,0.2)",
                          borderRadius: "8px",
                          color: "white",
                        }}
                      />
                      <Bar
                        dataKey="subscriptions"
                        fill="#8b5cf6"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* User Registration Trend */}
              <div className="glass-card p-6 rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <IoPeopleOutline className="text-pink-400 text-xl" />
                  <h3 className="text-xl font-semibold text-white">
                    User Registration (7 days)
                  </h3>
                </div>
                <div className="w-full overflow-hidden">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                      <XAxis dataKey="date" stroke="#ffffff70" />
                      <YAxis stroke="#ffffff70" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(0,0,0,0.8)",
                          border: "1px solid rgba(255,255,255,0.2)",
                          borderRadius: "8px",
                          color: "white",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="registrations"
                        stroke="#ec4899"
                        strokeWidth={3}
                        dot={{ fill: "#ec4899", strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Role Distribution */}
            <div className="glass-card p-6 rounded-xl mb-8">
              <div className="flex items-center gap-2 mb-4">
                <IoPersonOutline className="text-purple-400 text-xl" />
                <h3 className="text-xl font-semibold text-white">
                  Role Distribution
                </h3>
              </div>
              <div className="w-full overflow-hidden">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={roleData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {roleData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0,0,0,0.8)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: "8px",
                        color: "white",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gender Distribution */}
            <div className="glass-card p-6 rounded-xl mb-8">
              <div className="flex items-center gap-2 mb-4">
                <IoPersonOutline className="text-pink-400 text-xl" />
                <h3 className="text-xl font-semibold text-white">
                  Gender Distribution
                </h3>
              </div>
              <div className="w-full overflow-hidden">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={genderData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis dataKey="name" stroke="#ffffff70" />
                    <YAxis stroke="#ffffff70" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0,0,0,0.8)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: "8px",
                        color: "white",
                      }}
                    />
                    <Bar dataKey="value" fill="#ec4899" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-card p-6 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <IoStatsChartOutline className="text-purple-400 text-xl" />
                <h3 className="text-xl font-semibold text-white">
                  Quick Actions
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a
                  href="/admin/users"
                  className="flex items-center gap-3 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
                >
                  <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                    <IoPeopleOutline className="text-blue-400 text-xl" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-white font-medium">Manage Users</h4>
                    <p className="text-white/60 text-sm">
                      View, edit and manage users
                    </p>
                  </div>
                </a>

                <a
                  href="/admin/memberships"
                  className="flex items-center gap-3 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
                >
                  <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
                    <IoBriefcaseOutline className="text-green-400 text-xl" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-white font-medium">
                      Manage Memberships
                    </h4>
                    <p className="text-white/60 text-sm">
                      View and manage membership plans
                    </p>
                  </div>
                </a>

                <button
                  onClick={handleExportReport}
                  className="flex items-center gap-3 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
                >
                  <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                    <IoDownloadOutline className="text-purple-400 text-xl" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-white font-medium">Export Report</h4>
                    <p className="text-white/60 text-sm">
                      Download user data report
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </AdminLayout>
   
  );
};

export default AdminDashboard;
