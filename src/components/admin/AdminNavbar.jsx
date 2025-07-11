import { useNavigate } from "react-router-dom";
import { IoLogOutOutline } from "react-icons/io5";

function AdminNavbar() {
  const navigate = useNavigate();

  const userName = localStorage.getItem("userName");
  const userAvatar = localStorage.getItem("userAvatar");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="nav-glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Side */}
          <div className="flex items-center space-x-8">
          
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            <div
              className="flex items-center space-x-3 glass-card px-4 py-2 cursor-pointer rounded-xl border border-white/20 hover:border-purple-400 transition"
              onClick={() => navigate('/profile')}
            >
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-8 h-8 rounded-full ring-2 ring-purple-400/50 object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm ring-2 ring-purple-400/50">
                  {userName?.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="hidden sm:block text-sm font-medium text-white">
                {userName}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium transition-colors px-4 py-2 rounded-xl hover:bg-white/10"
            >
              <IoLogOutOutline />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default AdminNavbar;