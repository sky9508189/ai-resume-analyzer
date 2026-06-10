import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FileText, LogOut, LayoutDashboard, Upload } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-indigo-600">
            <FileText size={28} />
            Resume Analyzer
          </Link>

          {user && (
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="flex items-center gap-1 text-gray-600 hover:text-indigo-600 transition"
              >
                <LayoutDashboard size={18} />
                Dashboard
              </Link>
              <Link
                to="/upload"
                className="flex items-center gap-1 text-gray-600 hover:text-indigo-600 transition"
              >
                <Upload size={18} />
                Upload
              </Link>
              <span className="text-sm text-gray-500">Hi, {user.name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-gray-600 hover:text-red-600 transition"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
