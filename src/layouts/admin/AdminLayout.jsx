/* eslint-disable react/prop-types */
import AdminNavbar from "../../components/admin/AdminNavbar";
import AdminSidebar from "../../components/admin/AdminSidebar";

const AdminLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <AdminSidebar className="h-screen w-64" />

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        <AdminNavbar className="w-full" />
        <div className="flex-1 bg-gradient-to-br from-dark-900 via-purple-900/20 to-pink-900/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;