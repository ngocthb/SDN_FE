import { Link, NavLink } from "react-router-dom";
import {
  IoPeopleOutline,
  IoStatsChartOutline,
  IoCardOutline,
  IoSparklesOutline,
} from "react-icons/io5";
import { MdFeedback, MdOutlineRateReview } from "react-icons/md";

const AdminSidebar = () => {
  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: <IoStatsChartOutline />,
    },
    { name: "User Profiles", path: "/admin/users", icon: <IoPeopleOutline /> },
    { name: "Ratings", path: "/admin/ratings", icon: <MdFeedback /> },
    {
      name: "Feedback",
      path: "/admin/feedback",
      icon: <MdOutlineRateReview />,
    },
    {
      name: "Membership Management",
      path: "/admin/memberships",
      icon: <IoCardOutline />,
    },
  ];

  return (
    <div className="w-64 h-screen flex flex-col nav-glass sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-16 text-2xl font-bold gradient-text">
        <Link to="/admin/dashboard" className="flex items-center gap-2 px-4 h-16 text-2xl font-bold gradient-text hover:opacity-80 transition">
          <IoSparklesOutline className="text-purple-400 text-2xl" />
          Admin Panel
        </Link>
      </div>

      {/* Divider */}
      <div className="border-t border-purple-400/50 mx-4"></div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${isActive
                ? "bg-purple-500/20 text-purple-300 shadow-lg shadow-purple-500/25"
                : "text-white/70 hover:text-white hover:bg-white/10"
              }`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default AdminSidebar;