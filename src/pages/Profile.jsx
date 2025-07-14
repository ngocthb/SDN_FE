import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import CustomSelect from "../components/CustomSelect";
import CustomDatePicker from "../components/CustomDatePicker";
import {
  IoPerson,
  IoLockClosed,
  IoCamera,
  IoCheckmarkCircle,
  IoAlertCircle,
  IoMail,
  IoDocumentText,
  IoRefresh,
  IoSync,
  IoSave,
  IoKey,
  IoClose,
  IoShieldCheckmark,
  IoPeople,
  IoCalendar,
  IoMale,
  IoFemale,
  IoTrophy,
  IoRibbon,
  // THÊM MỚI CÁC ICON SAU
  IoStatsChart,
  IoChatbubbleEllipses,
  IoTime,
} from "react-icons/io5";
import api from "../config/axios";
import { useNavigate } from "react-router-dom";

// Component con để hiển thị một thành tích (không thay đổi)
const AchievementCard = ({ icon, name, points, delay }) => (
  <div
    className="glass-card p-4 text-center rounded-2xl flex flex-col items-center justify-center space-y-3 transition-all duration-300 hover:border-purple-400 border border-transparent hover:scale-105 animate-slide-up"
    style={{ animationDelay: `${delay}s` }}
  >
    <div className="relative">
      <img
        src={icon}
        alt={name}
        className="w-24 h-24 rounded-full object-cover ring-2 ring-purple-500/30 p-1"
      />
      <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center">
        <IoRibbon size={12} className="mr-1" />
        {points}
      </div>
    </div>
    <p className="text-white font-semibold text-sm h-10 flex items-center text-center">
      {name}
    </p>
  </div>
);

function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showImageUrlModal, setShowImageUrlModal] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState("");

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    bio: "",
    gender: null,
    dateOfBirth: "",
    picture: "",
    grantedAchievements: [],
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const tabs = [
    {
      id: "profile",
      label: "Profile Info",
      icon: IoPerson,
      gradient: "from-blue-500 to-purple-500",
    },
    {
      id: "achievements",
      label: "Achievements",
      icon: IoTrophy,
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      id: "password",
      label: "Security",
      icon: IoLockClosed,
      gradient: "from-purple-500 to-pink-500",
    },
  ];

  const genderOptions = [
    {
      value: "male",
      label: "Male",
      icon: IoMale,
      gradient: "from-blue-500 to-indigo-500",
    },
    {
      value: "female",
      label: "Female",
      icon: IoFemale,
      gradient: "from-pink-500 to-purple-500",
    },
  ];

  const fetchDataUser = async () => {
    setIsPageLoading(true);
    setPageError(null);
    try {
      const response = await api.get("user/profile");
      if (response.data && response.data.data) {
        const userData = response.data.data;
        setProfileData({
          name: userData.name || "",
          email: userData.email || "",
          bio: userData.bio || "",
          gender: userData.gender !== undefined ? userData.gender : null,
          picture:
            userData.picture ||
            "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
          dateOfBirth: userData.dateOfBirth || "",
          grantedAchievements: userData.grantedAchievements || [],
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setPageError("Failed to load profile data. Please try again.");
    } finally {
      setIsPageLoading(false);
    }
  };

  useEffect(() => {
    fetchDataUser();
  }, []);

  // ... các hàm handler khác giữ nguyên không đổi ...
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };
  const handleGenderChange = (value) => {
    let genderValue = null;
    if (value === "female") genderValue = true;
    if (value === "male") genderValue = false;
    setProfileData({ ...profileData, gender: genderValue });
  };
  const handleDateChange = (value) => {
    setProfileData({ ...profileData, dateOfBirth: value });
  };
  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };
  const handleImageUrlSubmit = () => {
    if (tempImageUrl.trim()) {
      setProfileData({ ...profileData, picture: tempImageUrl.trim() });
      setMessage({ type: "success", text: "Profile picture updated!" });
    }
    setShowImageUrlModal(false);
    setTempImageUrl("");
  };
  const handleImageUrlCancel = () => {
    setShowImageUrlModal(false);
    setTempImageUrl("");
  };
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const updateData = {
        name: profileData.name,
        bio: profileData.bio,
        dateOfBirth: profileData.dateOfBirth,
        picture: profileData?.picture || null,
        gender: profileData.gender,
      };
      const response = await api.put("user/update-profile", updateData);
      if (response.data && response.data.data) {
        setProfileData((prev) => ({
          ...prev,
          ...response.data.data,
          email: prev.email,
        }));
        setMessage({ type: "success", text: "Profile updated successfully!" });
      } else {
        setMessage({ type: "error", text: "Failed to update profile." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update profile." });
    } finally {
      setIsLoading(false);
    }
  };
  const hasPasswordChanged = () => {
    return (
      passwordData.currentPassword.trim() &&
      passwordData.newPassword.trim() &&
      passwordData.confirmPassword.trim() &&
      passwordData.currentPassword !== passwordData.newPassword
    );
  };
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      setMessage({ type: "error", text: "Please fill in all password fields" });
      setIsLoading(false);
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      setIsLoading(false);
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "New password must be at least 6 characters long",
      });
      setIsLoading(false);
      return;
    }
    if (passwordData.currentPassword === passwordData.newPassword) {
      setMessage({
        type: "error",
        text: "New password must be different from current password",
      });
      setIsLoading(false);
      return;
    }
    try {
      const response = await api.put("user/change-password", {
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      if (response.data && response.data.data) {
        setMessage({
          type: "success",
          text: "Password changed successfully! You will be logged out.",
        });
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setTimeout(() => {
          localStorage.clear();
          navigate("/login");
        }, 3000);
      } else {
        setMessage({
          type: "error",
          text: response.data.message || "Failed to change password.",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to change password.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-purple-900/20 to-pink-900/20">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-12 text-center animate-fade-in">
          <h1 className="text-5xl font-bold text-white mb-4 gradient-text">
            Profile Settings
          </h1>
          <p className="text-white/70 text-xl max-w-2xl mx-auto leading-relaxed">
            Manage your account settings and preferences with ease
          </p>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          <div className="xl:col-span-1">
            <div className="glass-card p-8 animate-slide-up glow-effect">
              <div className="text-center">
                <div className="relative inline-block mb-6">
                  <img
                    src={profileData.picture}
                    alt={profileData.name}
                    className="w-32 h-32 rounded-2xl ring-4 ring-purple-400/50 mx-auto shadow-2xl object-cover"
                  />
                  <button
                    onClick={() => setShowImageUrlModal(true)}
                    className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white hover:scale-110 transition-all duration-300 shadow-xl"
                  >
                    <IoCamera size={20} color="white" />
                  </button>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-white/20 text-center">
                <button
                  onClick={() => navigate("/user/my-membership")}
                  className="gradient-button flex items-center justify-center w-full space-x-2 px-6 py-3 text-base shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  <IoShieldCheckmark size={18} />
                  <span>View Membership</span>
                </button>
              </div>
            </div>

            {/* --- ACTIVITY OVERVIEW ĐÃ ĐƯỢC THÊM VÀO ĐÂY --- */}
            <div
              className="glass-card p-6 mt-6 animate-slide-up glow-effect"
              style={{ animationDelay: "0.1s" }}
            >
              <h4 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <IoStatsChart size={16} color="white" />
                </div>
                <span>Activity Overview</span>
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <IoChatbubbleEllipses size={14} color="white" />
                    </div>
                    <span className="text-white/70 text-sm">Messages Sent</span>
                  </div>
                  <span className="text-purple-400 font-bold">1,234</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <IoPeople size={14} color="white" />
                    </div>
                    <span className="text-white/70 text-sm">Active Chats</span>
                  </div>
                  <span className="text-pink-400 font-bold">12</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-orange-500 rounded-lg flex items-center justify-center">
                      <IoTime size={14} color="white" />
                    </div>
                    <span className="text-white/70 text-sm">Online Hours</span>
                  </div>
                  <span className="text-orange-400 font-bold">156h</span>
                </div>
              </div>
            </div>
          </div>

          <div className="xl:col-span-3">
            <div
              className="glass-card rounded-3xl overflow-hidden animate-slide-up glow-effect shadow-2xl"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="flex bg-white/5 border-b border-white/20">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 px-8 py-6 text-sm font-medium transition-all duration-300 flex items-center justify-center space-x-3 relative group ${
                      activeTab === tab.id
                        ? "text-white"
                        : "text-white/70 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        activeTab === tab.id
                          ? `bg-gradient-to-r ${tab.gradient} shadow-lg`
                          : "bg-white/10 group-hover:bg-white/20"
                      }`}
                    >
                      <tab.icon size={20} color="white" />
                    </div>
                    <span className="text-lg">{tab.label}</span>
                    {activeTab === tab.id && (
                      <div
                        className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${tab.gradient} rounded-t-full`}
                      ></div>
                    )}
                  </button>
                ))}
              </div>

              <div className="p-10">
                {message.text && (
                  <div
                    className={`mb-8 px-6 py-4 rounded-2xl text-sm backdrop-blur-md animate-slide-up flex items-center space-x-3 shadow-lg ${
                      message.type === "success"
                        ? "bg-green-500/20 border border-green-500/30 text-green-300"
                        : "bg-red-500/20 border border-red-500/30 text-red-300"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.type === "success"
                          ? "bg-green-500/30"
                          : "bg-red-500/30"
                      }`}
                    >
                      {message.type === "success" ? (
                        <IoCheckmarkCircle size={18} />
                      ) : (
                        <IoAlertCircle size={18} />
                      )}
                    </div>
                    <span className="font-medium">{message.text}</span>
                  </div>
                )}

                {activeTab === "profile" && (
                  <form
                    onSubmit={handleProfileSubmit}
                    className="space-y-8 animate-fade-in"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div>
                        <label className="flex text-sm font-semibold text-white/90 mb-3 items-center space-x-2">
                          <IoPerson />
                          <span>Full Name</span>
                        </label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          value={profileData.name}
                          onChange={handleProfileChange}
                          className="input-glass h-14 text-lg"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <label className="flex text-sm font-semibold text-white/90 mb-3 items-center space-x-2">
                          <IoMail />
                          <span>Email Address</span>
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={profileData.email}
                          disabled
                          className="input-glass h-14 text-lg"
                        />
                      </div>
                      <div>
                        <label className="flex text-sm font-semibold text-white/90 mb-3 items-center space-x-2">
                          <IoPeople />
                          <span>Gender</span>
                        </label>
                        <CustomSelect
                          value={
                            profileData.gender === null
                              ? ""
                              : profileData.gender
                              ? "female"
                              : "male"
                          }
                          onChange={handleGenderChange}
                          options={genderOptions}
                          placeholder="Select your gender"
                        />
                      </div>
                      <div>
                        <label className="flex text-sm font-semibold text-white/90 mb-3 items-center space-x-2">
                          <IoCalendar />
                          <span>Date of Birth</span>
                        </label>
                        <CustomDatePicker
                          value={profileData.dateOfBirth}
                          onChange={handleDateChange}
                          placeholder="Select your date of birth"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="flex text-sm font-semibold text-white/90 mb-3 items-center space-x-2">
                        <IoDocumentText />
                        <span>Bio</span>
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        rows={4}
                        value={profileData.bio}
                        onChange={handleProfileChange}
                        className="input-glass resize-none text-lg"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                    <div className="flex justify-end space-x-4 pt-6 border-t border-white/20">
                      <button
                        type="button"
                        className="glass-button flex items-center space-x-2 px-8 py-4 text-lg"
                        onClick={fetchDataUser}
                      >
                        <IoRefresh size={20} />
                        <span>Reset</span>
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className={`gradient-button flex items-center space-x-2 px-8 py-4 text-lg ${
                          isLoading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        {isLoading ? (
                          <>
                            <IoSync size={20} className="animate-spin" />
                            <span>Updating...</span>
                          </>
                        ) : (
                          <>
                            <IoSave size={20} />
                            <span>Update Profile</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {activeTab === "achievements" && (
                  <div className="animate-fade-in">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      My Achievements
                    </h3>
                    <p className="text-white/60 mb-8">
                      A collection of all the milestones you've reached.
                    </p>
                    {isPageLoading && (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                          <div
                            key={i}
                            className="glass-card p-4 h-48 animate-pulse"
                          ></div>
                        ))}
                      </div>
                    )}
                    {pageError && (
                      <div className="bg-red-500/20 border border-red-500/30 text-red-300 p-6 rounded-2xl text-center">
                        <p>{pageError}</p>
                      </div>
                    )}
                    {!isPageLoading &&
                      !pageError &&
                      (profileData.grantedAchievements.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                          {profileData.grantedAchievements.map((ach, index) => (
                            <AchievementCard
                              key={ach._id}
                              icon={ach.icon}
                              name={ach.name}
                              points={ach.points}
                              delay={index * 0.05}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 glass-card rounded-2xl">
                          <IoTrophy
                            size={48}
                            className="mx-auto text-purple-400/50 mb-4"
                          />
                          <h4 className="text-xl font-semibold text-white">
                            No Achievements Yet
                          </h4>
                          <p className="text-white/60 mt-2">
                            Keep going! Your first milestone is just around the
                            corner.
                          </p>
                        </div>
                      ))}
                  </div>
                )}

                {activeTab === "password" && (
                  <form
                    onSubmit={handlePasswordSubmit}
                    className="space-y-8 animate-fade-in"
                  >
                    <div className="max-w-lg space-y-8">
                      <div>
                        <label className="flex text-sm font-semibold text-white/90 mb-3 items-center space-x-2">
                          <IoLockClosed />
                          <span>Current Password</span>
                        </label>
                        <input
                          id="currentPassword"
                          name="currentPassword"
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className="input-glass h-14 text-lg"
                        />
                      </div>
                      <div>
                        <label className="flex text-sm font-semibold text-white/90 mb-3 items-center space-x-2">
                          <IoKey />
                          <span>New Password</span>
                        </label>
                        <input
                          id="newPassword"
                          name="newPassword"
                          type="password"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className="input-glass h-14 text-lg"
                        />
                      </div>
                      <div>
                        <label className="flex text-sm font-semibold text-white/90 mb-3 items-center space-x-2">
                          <IoCheckmarkCircle />
                          <span>Confirm New Password</span>
                        </label>
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className="input-glass h-14 text-lg"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-4 pt-6 border-t border-white/20">
                      <button
                        type="button"
                        className="glass-button flex items-center space-x-2 px-8 py-4 text-lg"
                        onClick={() =>
                          setPasswordData({
                            currentPassword: "",
                            newPassword: "",
                            confirmPassword: "",
                          })
                        }
                      >
                        <IoClose size={20} />
                        <span>Clear</span>
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading || !hasPasswordChanged()}
                        className={`gradient-button flex items-center space-x-2 px-8 py-4 text-lg ${
                          isLoading || !hasPasswordChanged()
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        {isLoading ? (
                          <>
                            <IoSync size={20} className="animate-spin" />
                            <span>Changing...</span>
                          </>
                        ) : (
                          <>
                            <IoLockClosed size={20} />
                            <span>Change Password</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {showImageUrlModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="glass-card p-8 max-w-md w-full mx-4 rounded-2xl animate-slide-up">
            <h3 className="text-2xl font-bold text-white mb-2 text-center">
              Update Profile Picture
            </h3>
            <p className="text-white/70 text-center mb-6">
              Enter the URL of your new profile picture
            </p>
            <input
              type="url"
              value={tempImageUrl}
              onChange={(e) => setTempImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="input-glass h-12 text-base w-full"
              autoFocus
            />
            {tempImageUrl && (
              <div className="text-center mt-4">
                <img
                  src={tempImageUrl}
                  alt="Preview"
                  className="w-20 h-20 rounded-xl mx-auto object-cover ring-2 ring-purple-400/50"
                  onError={(e) => (e.target.style.display = "none")}
                  onLoad={(e) => (e.target.style.display = "block")}
                />
              </div>
            )}
            <div className="flex space-x-4 mt-6">
              <button
                onClick={handleImageUrlCancel}
                className="flex-1 glass-button py-3"
              >
                Cancel
              </button>
              <button
                onClick={handleImageUrlSubmit}
                disabled={!tempImageUrl.trim()}
                className={`flex-1 gradient-button py-3 ${
                  !tempImageUrl.trim() ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
