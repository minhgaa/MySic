import { useState } from "react";
import { HiOutlineCog8Tooth } from "react-icons/hi2";
import { CiSearch, CiHeart } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/authContext";

export default function Header({ setIsSearching, setSearchQuery }) {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const { user, logout } = useAuth();

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setSearchQuery(value);
    setIsSearching(value.trim() !== "");
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="pb-2 h-[50px] w-full flex items-center justify-between text-white relative">
      {/* Search bar */}
      <div className="relative w-1/3">
        <div className="flex items-center bg-zinc-800 rounded-full px-4 py-3">
          <input
            type="text"
            placeholder="Search for a song"
            value={inputValue}
            onChange={handleInputChange}
            className="bg-transparent outline-none text-sm text-white placeholder-gray-400 w-full"
          />
          <CiSearch className="text-gray-400 ml-2" />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-2">
            <img
              src={user.avatarUrl || '/default-avatar.png'}
              alt="Avatar"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-semibold">{user.name}</p>
              <span className={`text-xs text-black px-2 py-[2px] rounded-full ${
                user.role === "premium" ? "bg-emerald-600" : "bg-gray-400"
              }`}>
                {user.role === "premium" ? "Premium" : "Free"}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="ml-4 bg-red-600 px-3 py-1 rounded text-xs hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
          >
            Login / Sign Up
          </button>
        )}

        {/* Action Icons */}
        <div className="flex items-center gap-3 ml-4">
          <button className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700">
            <CiHeart />
          </button>
          <button className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700">
            <HiOutlineCog8Tooth />
          </button>
        </div>
      </div>
    </div>
  );
}