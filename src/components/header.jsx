import { useState } from "react";
import { HiOutlineCog8Tooth } from "react-icons/hi2";
import { CiSearch, CiHeart } from "react-icons/ci";
import { IoCloudUploadOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/authContext";
import UploadSong from "./UploadSong";

export default function Header({ setIsSearching, setSearchQuery }) {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const { user } = useAuth();
  const [showUpload, setShowUpload] = useState(false);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setSearchQuery(value);
    setIsSearching(value.trim() !== "");
  };

  const handleUploadSuccess = () => {
    // You might want to refresh the song list or show a success message
    setShowUpload(false);
  };

  return (
    <>
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
          

          {/* Action Icons */}
          <div className="flex items-center gap-3 ml-4">
            {user && (
              <button 
                onClick={() => setShowUpload(true)}
                className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center hover:bg-orange-700"
                title="Upload Song"
              >
                <IoCloudUploadOutline size={20} />
              </button>
            )}

          </div>
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/profile')}
                className="hover:opacity-80 transition-opacity"
              >
                <img
                  src={user.avatarUrl || '/default-avatar.png'}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-orange-500/50 hover:ring-orange-500 transition-all"
                />
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
        </div>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <UploadSong 
          onClose={() => setShowUpload(false)}
          onSuccess={handleUploadSuccess}
        />
      )}
    </>
  );
}