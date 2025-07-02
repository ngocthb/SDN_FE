import { Link, useLocation, useNavigate } from 'react-router-dom';
import { IoHomeOutline, IoLogOutOutline, IoSparklesOutline } from 'react-icons/io5';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const userName = localStorage.getItem('userName');
  const userAvatar = localStorage.getItem('userAvatar');

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="nav-glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Side */}
          <div className="flex items-center space-x-8">
            <Link to="/home" className="text-2xl font-bold gradient-text flex items-center gap-2">
              <IoSparklesOutline className="text-purple-400 text-2xl" />
              ChatFlow
            </Link>
            <div className="hidden md:flex space-x-1">
              <Link
                to="/home"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${isActive('/home')
                    ? 'bg-purple-500/20 text-purple-300 shadow-lg shadow-purple-500/25'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
              >
                <IoHomeOutline />
                Home
              </Link>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {!token ? (
              <Link
                to="/login"
                className="text-white/70 hover:text-white text-sm font-medium transition-colors px-4 py-2 rounded-xl hover:bg-white/10"
              >
                Login
              </Link>
            ) : (
              <>
                <div className="flex items-center space-x-3 glass-card px-4 py-2">
                  {userAvatar ? (
                    <img
                      src={userAvatar}
                      alt={userName}
                      className="w-8 h-8 rounded-full ring-2 ring-purple-400/50"
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
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
