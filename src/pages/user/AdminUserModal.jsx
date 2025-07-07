// AdminUserModal.jsx - View Only Version
import {
  IoCloseOutline,
  IoPersonOutline,
  IoCalendarOutline,
  IoMailOutline,
  IoShieldCheckmarkOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoManOutline,
  IoWomanOutline,
} from "react-icons/io5";

function AdminUserModal({ user, onClose }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getGenderIcon = (gender) => {
    if (gender === true) return <IoWomanOutline className="text-pink-400" />;
    if (gender === false) return <IoManOutline className="text-blue-400" />;
    return <IoPersonOutline className="text-gray-400" />;
  };

  const getGenderText = (gender) => {
    if (gender === true) return "Female";
    if (gender === false) return "Male";
    return "Not specified";
  };

  const getUserRole = () => {
    if (user.isAdmin) return "Admin";
    if (user.isCoach) return "Coach";
    return "User";
  };

  const getRoleColor = () => {
    if (user.isAdmin) return "text-red-300 bg-red-500/20";
    if (user.isCoach) return "text-blue-300 bg-blue-500/20";
    return "text-green-300 bg-green-500/20";
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/20">
          <div className="flex items-center gap-4">
            <img
              src={user.picture || "/default-avatar.png"}
              alt={user.name}
              className="w-16 h-16 rounded-full"
            />
            <div>
              <h2 className="text-2xl font-bold text-white">{user.name}</h2>
              <p className="text-white/70">{user.email}</p>
              <span
                className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${getRoleColor()}`}
              >
                {getUserRole()}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <IoCloseOutline size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">
                Personal Information
              </h3>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
                  <IoPersonOutline className="text-white/70 text-xl" />
                  <div>
                    <label className="text-white/70 text-sm">Full Name</label>
                    <p className="text-white font-medium text-lg">
                      {user.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
                  <IoMailOutline className="text-white/70 text-xl" />
                  <div>
                    <label className="text-white/70 text-sm">
                      Email Address
                    </label>
                    <p className="text-white font-medium">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
                  {getGenderIcon(user.gender)}
                  <div>
                    <label className="text-white/70 text-sm">Gender</label>
                    <p className="text-white font-medium">
                      {getGenderText(user.gender)}
                    </p>
                  </div>
                </div>

                {user.dateOfBirth && (
                  <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
                    <IoCalendarOutline className="text-white/70 text-xl" />
                    <div>
                      <label className="text-white/70 text-sm">
                        Date of Birth
                      </label>
                      <p className="text-white font-medium">
                        {formatDate(user.dateOfBirth)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Account Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">
                Account Information
              </h3>

              <div className="space-y-3">
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <label className="text-white/70 text-sm">
                    Account Status
                  </label>
                  <div
                    className={`flex items-center gap-2 mt-2 ${
                      user.status ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {user.status ? (
                      <IoCheckmarkCircleOutline className="text-xl" />
                    ) : (
                      <IoCloseCircleOutline className="text-xl" />
                    )}
                    <span className="font-medium text-lg">
                      {user.status ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <label className="text-white/70 text-sm">User Role</label>
                  <div className="flex items-center gap-2 mt-2">
                    <IoShieldCheckmarkOutline className="text-purple-400 text-xl" />
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor()}`}
                    >
                      {getUserRole()}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <label className="text-white/70 text-sm">Member Since</label>
                  <div className="flex items-center gap-2 mt-2">
                    <IoCalendarOutline className="text-white/70 text-xl" />
                    <span className="text-white font-medium text-lg">
                      {formatDate(user.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <label className="text-white/70 text-sm">Last Updated</label>
                  <div className="flex items-center gap-2 mt-2">
                    <IoCalendarOutline className="text-white/70 text-xl" />
                    <span className="text-white font-medium">
                      {formatDate(user.updatedAt || user.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account Statistics */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">
                Account Details
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-white/5 rounded-lg">
                  <label className="text-white/70 text-xs">User ID</label>
                  <p className="text-white font-mono text-sm mt-1">
                    {user._id}
                  </p>
                </div>

                <div className="p-3 bg-white/5 rounded-lg">
                  <label className="text-white/70 text-xs">
                    Email Verified
                  </label>
                  <p className="text-white font-medium mt-1">
                    {user.status ? "Yes" : "Pending verification"}
                  </p>
                </div>
              </div>
            </div>

            {/* System Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">
                System Information
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-white/5 rounded-lg">
                  <label className="text-white/70 text-xs">
                    Account Created
                  </label>
                  <p className="text-white font-medium mt-1">
                    {formatDate(user.createdAt)}
                  </p>
                </div>

                <div className="p-3 bg-white/5 rounded-lg">
                  <label className="text-white/70 text-xs">
                    Profile Picture
                  </label>
                  <p className="text-white font-medium mt-1">
                    {user.picture &&
                    user.picture !==
                      "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
                      ? "Custom uploaded"
                      : "Default avatar"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-white/20">
          <div className="text-white/50 text-sm">
            Viewing user details • Read-only mode
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 text-white/70 hover:text-white border border-white/20 rounded-lg hover:border-white/40 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminUserModal;
