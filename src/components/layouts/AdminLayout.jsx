import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IoMusicalNotesOutline, IoStatsChartOutline, IoPersonOutline, IoLogOutOutline, IoHomeOutline, IoListOutline } from 'react-icons/io5';
import { useAuth } from '../../hooks/authContext';

const menuItems = [
  { 
    path: '/admin/dashboard', 
    label: 'Dashboard', 
    icon: IoHomeOutline 
  },
  { 
    path: '/admin/songs', 
    label: 'Songs', 
    icon: IoMusicalNotesOutline 
  },
  { 
    path: '/admin/genres', 
    label: 'Genres', 
    icon: IoListOutline 
  },
  { 
    path: '/admin/users', 
    label: 'Users', 
    icon: IoPersonOutline 
  },
  { 
    path: '/admin/stats', 
    label: 'Statistics', 
    icon: IoStatsChartOutline 
  },
];

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0E15] flex">
      {/* Fixed Sidebar */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="fixed top-0 left-0 h-screen w-64 bg-zinc-900/50 backdrop-blur-xl p-6 flex flex-col z-50"
      >
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
            <span className="text-white font-bold text-xl">M</span>
          </div>
          <h1 className="text-white font-bold text-xl">MySic Admin</h1>
        </div>

        <nav className="flex-1">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <motion.li 
                  key={item.path}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <button
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-orange-500 text-white' 
                        : 'text-gray-400 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </button>
                </motion.li>
              );
            })}
          </ul>
        </nav>

        <motion.button
          whileHover={{ x: 5 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-red-500 hover:text-red-400 transition-colors"
        >
          <IoLogOutOutline size={20} />
          <span>Logout</span>
        </motion.button>
      </motion.div>

      {/* Main Content with left margin to account for fixed sidebar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 ml-64 p-8"
      >
        {children}
      </motion.div>
    </div>
  );
};

export default AdminLayout; 