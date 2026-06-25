import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { LogOut, User as UserIcon, Settings, ChevronDown } from "lucide-react";

export default function UserMenu() {
  const { currentUser, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!currentUser) return null;

  const initials = currentUser.displayName
    ? currentUser.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : currentUser.email
    ? currentUser.email.slice(0, 2).toUpperCase()
    : "U";

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Failed to sign out:", err);
    }
  };

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-xl bg-white/50 border border-[#2563eb]/20 hover:bg-white/75 hover:border-[#2563eb]/40 transition-all cursor-pointer active:scale-95"
      >
        {currentUser.photoURL ? (
          <img
            src={currentUser.photoURL}
            alt={currentUser.displayName || "User"}
            className="w-7 h-7 rounded-lg object-cover border border-[#2563eb]/20"
          />
        ) : (
          <div className="w-7 h-7 rounded-lg bg-[#2563eb] text-white flex items-center justify-center text-xs font-bold font-mono">
            {initials}
          </div>
        )}
        <span className="hidden sm:inline text-xs font-medium text-[#1d4ed8]">
          {currentUser.displayName || currentUser.email}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-[#1d4ed8] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white/85 border border-white/80 rounded-xl shadow-2xl backdrop-blur-xl p-2 space-y-1">
          <div className="px-3 py-2.5 border-b border-gray-100">
            <p className="text-xs font-semibold text-[#0c4a6e] truncate">
              {currentUser.displayName || "User Account"}
            </p>
            <p className="text-[10px] text-[#0369a1] font-mono truncate mt-0.5">
              {currentUser.email}
            </p>
          </div>

          <div className="py-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-600 text-xs font-semibold rounded-lg transition duration-150 text-left cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
