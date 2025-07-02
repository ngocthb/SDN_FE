import { NavLink } from "react-router-dom";
import { IoHomeOutline, IoPeopleOutline, IoStatsChartOutline, IoCardOutline } from "react-icons/io5";

const Sidebar = () => {
  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: <IoStatsChartOutline /> },
    { name: "User Profiles", path: "/admin/users", icon: <IoPeopleOutline /> },
    { name: "Ratings/Feedback", path: "/admin/feedback", icon: <IoHomeOutline /> },
    { name: "Membership Management", path: "/admin/memberships", icon: <IoCardOutline /> },
  ];

  return (
    <div className="w-64 h-screen nav-glass flex flex-col shadow-lg">
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                isActive
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

export default Sidebar;