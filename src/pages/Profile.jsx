import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import CustomSelect from "../components/CustomSelect";
import CustomDatePicker from "../components/CustomDatePicker";
import {
  IoPerson,
  IoLockClosed,
  IoCamera,
  IoStatsChart,
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
  IoChatbubbleEllipses,
  IoPeople,
  IoTime,
  IoCalendar,
  IoMale,
  IoFemale,
} from "react-icons/io5";
import api from "../config/axios";
import { useNavigate } from "react-router-dom";

function Profile() {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showImageUrlModal, setShowImageUrlModal] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState("");
  const navigate = useNavigate();

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    bio: "",
    gender: "", // null for not selected, true for female, false for male
    dateOfBirth: "",
    picture: "",
    grantedAchievements: [],
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value,
    });
  };

  const handleGenderChange = (value) => {
    let genderValue = null;
    if (value === "female") genderValue = true;
    if (value === "male") genderValue = false;

    setProfileData({
      ...profileData,
      gender: genderValue,
    });
  };

  const handleDateChange = (value) => {
    setProfileData({
      ...profileData,
      dateOfBirth: value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageUrlSubmit = () => {
    if (tempImageUrl.trim()) {
      setProfileData({
        ...profileData,
        picture: tempImageUrl.trim(),
      });
      setMessage({
        type: "success",
        text: "Profile picture updated successfully!",
      });
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
        picture: profileData.picture,
        gender: profileData.gender,
      };
      const response = await api.put("user/update-profile", updateData);
      if (response.data && response.data.data) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
      } else {
        setMessage({
          type: "error",
          text: "Failed to update profile. Please try again.",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to update profile. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
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

    try {
      const response = await api.put("user/change-password", {
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      if (response.data && response.data.success) {
        setMessage({ type: "success", text: "Password changed successfully!" });
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setMessage({
          type: "error",
          text:
            response.data.message ||
            "Failed to change password. Please try again.",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Failed to change password. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    {
      id: "profile",
      label: "Profile Info",
      icon: IoPerson,
      gradient: "from-blue-500 to-purple-500",
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
    try {
      const response = await api.get("user/profile");
      if (response.data && response.data.data) {
        const userData = response.data.data;
        setProfileData({
          name: userData.name || "",
          email: userData.email || "",
          bio: userData.bio || "",
          gender: userData.gender ?? null,
          grantedAchievements: userData.grantedAchievements || [],
          picture: userData.picture || "https://via.placeholder.com/150",
          dateOfBirth: userData.dateOfBirth || "",
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setMessage({ type: "error", text: "Could not fetch user data." });
    }
  };

  useEffect(() => {
    fetchDataUser();
  }, []);

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
                  <div className="relative">
                    <img
                      src={profileData.picture}
                      alt={profileData.name}
                      className="w-32 h-32 rounded-2xl ring-4 ring-purple-400/50 mx-auto shadow-2xl object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
                  </div>
                  <button
                    onClick={() => setShowImageUrlModal(true)}
                    className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white hover:scale-110 transition-all duration-300 shadow-xl shadow-purple-500/25 group"
                  >
                    <IoCamera size={20} color="white" />
                    <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </div>
              </div>

              {/* --- START: UPDATED MEMBERSHIP SECTION --- */}
              <div className="mt-8 pt-6 border-t border-white/20 text-center">
                <button
                  onClick={() => navigate("/user/my-membership")}
                  className="gradient-button flex items-center justify-center w-full space-x-2 px-6 py-3 text-base shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  <IoShieldCheckmark size={18} />
                  <span>Xem gói thành viên</span>
                </button>
              </div>
              {/* --- END: UPDATED MEMBERSHIP SECTION --- */}
            </div>

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
                      <div className="space-y-2">
                        <label
                          htmlFor="name"
                          className="flex text-sm font-semibold text-white/90 mb-3 items-center space-x-2"
                        >
                          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <IoPerson size={14} color="white" />
                          </div>
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

                      <div className="space-y-2">
                        <label
                          htmlFor="email"
                          className="flex text-sm font-semibold text-white/90 mb-3 items-center space-x-2"
                        >
                          <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                            <IoMail size={14} color="white" />
                          </div>
                          <span>Email Address</span>
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={profileData.email}
                          onChange={handleProfileChange}
                          className="input-glass h-14 text-lg"
                          placeholder="Enter your email"
                          disabled
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="flex text-sm font-semibold text-white/90 mb-3 items-center space-x-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                            <IoPeople size={14} color="white" />
                          </div>
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
                          gradient="from-green-500 to-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="flex text-sm font-semibold text-white/90 mb-3 items-center space-x-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <IoCalendar size={14} color="white" />
                          </div>
                          <span>Date of Birth</span>
                        </label>
                        <CustomDatePicker
                          value={profileData.dateOfBirth}
                          onChange={handleDateChange}
                          placeholder="Select your date of birth"
                          gradient="from-indigo-500 to-purple-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="bio"
                        className="flex text-sm font-semibold text-white/90 mb-3 items-center space-x-2"
                      >
                        <div className="w-6 h-6 bg-gradient-to-r from-teal-500 to-green-500 rounded-lg flex items-center justify-center">
                          <IoDocumentText size={14} color="white" />
                        </div>
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
                        className={`gradient-button flex items-center space-x-2 px-8 py-4 text-lg shadow-2xl ${
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

                {activeTab === "password" && (
                  <form
                    onSubmit={handlePasswordSubmit}
                    className="space-y-8 animate-fade-in"
                  >
                    <div className="max-w-lg space-y-8">
                      <div className="space-y-2">
                        <label
                          htmlFor="currentPassword"
                          className="flex text-sm font-semibold text-white/90 mb-3 items-center space-x-2"
                        >
                          <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                            <IoLockClosed size={14} color="white" />
                          </div>
                          <span>Current Password</span>
                        </label>
                        <input
                          id="currentPassword"
                          name="currentPassword"
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className="input-glass h-14 text-lg"
                          placeholder="Enter current password"
                        />
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="newPassword"
                          className="flex text-sm font-semibold text-white/90 mb-3 items-center space-x-2"
                        >
                          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <IoKey size={14} color="white" />
                          </div>
                          <span>New Password</span>
                        </label>
                        <input
                          id="newPassword"
                          name="newPassword"
                          type="password"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className="input-glass h-14 text-lg"
                          placeholder="Enter new password"
                        />
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="confirmPassword"
                          className="flex text-sm font-semibold text-white/90 mb-3 items-center space-x-2"
                        >
                          <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                            <IoCheckmarkCircle size={14} color="white" />
                          </div>
                          <span>Confirm New Password</span>
                        </label>
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className="input-glass h-14 text-lg"
                          placeholder="Confirm new password"
                        />
                      </div>

                      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-300 px-6 py-4 rounded-2xl text-sm backdrop-blur-md">
                        <p className="font-semibold mb-3 flex items-center space-x-2 text-lg">
                          <div className="w-6 h-6 bg-blue-500/30 rounded-lg flex items-center justify-center">
                            <IoShieldCheckmark size={14} />
                          </div>
                          <span>Password Requirements:</span>
                        </p>
                        <ul className="text-sm space-y-2 text-blue-200 ml-8">
                          <li className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                            <span>At least 6 characters long</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                            <span>Must be different from current password</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                            <span>Avoid using personal information</span>
                          </li>
                        </ul>
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
                        disabled={isLoading}
                        className={`gradient-button flex items-center space-x-2 px-8 py-4 text-lg shadow-2xl ${
                          isLoading ? "opacity-50 cursor-not-allowed" : ""
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
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <IoCamera size={24} color="white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Update Profile Picture
              </h3>
              <p className="text-white/70">
                Enter the URL of your new profile picture
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={tempImageUrl}
                  onChange={(e) => setTempImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="input-glass h-12 text-base"
                  autoFocus
                />
              </div>

              {tempImageUrl && (
                <div className="text-center">
                  <p className="text-sm text-white/60 mb-2">Preview:</p>
                  <img
                    src={tempImageUrl}
                    alt="Preview"
                    className="w-20 h-20 rounded-xl mx-auto object-cover ring-2 ring-purple-400/50"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                    onLoad={(e) => {
                      e.target.style.display = "block";
                    }}
                  />
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  onClick={handleImageUrlCancel}
                  className="flex-1 glass-button flex items-center justify-center space-x-2 py-3"
                >
                  <IoClose size={18} />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleImageUrlSubmit}
                  disabled={!tempImageUrl.trim()}
                  className={`flex-1 gradient-button flex items-center justify-center space-x-2 py-3 ${
                    !tempImageUrl.trim() ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <IoSave size={18} />
                  <span>Update</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;