"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Users, LogOut, ChevronDown, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function AdminTopbar() {
  const router = useRouter();
  const { data: session } = useSession();
  const [profileOpen, setProfileOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileOpen]);

  const userName = session?.user?.name || "Admin";
  const userEmail = session?.user?.email || "";
  const initials = userName.substring(0, 2).toUpperCase();

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur flex items-center justify-between px-6 shrink-0 transition-colors duration-300">
      <div>
        <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Management Panel</p>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle Button */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-full transition-colors"
            aria-label="Toggle Dark Mode"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        )}

        {/* Profile Dropdown Container */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-1.5 rounded-xl transition text-slate-900 dark:text-white"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-sm font-bold text-white shadow-sm">
              {initials}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium leading-tight">{userName}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Admin</p>
            </div>
            <ChevronDown 
              size={14} 
              className={`text-slate-500 dark:text-slate-400 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} 
            />
          </button>

          {/* Dropdown Menu */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-2 z-50 text-slate-900 dark:text-white animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-sm font-medium truncate">{userEmail}</p>
              </div>
              <button
                onClick={() => {
                  setProfileOpen(false);
                  router.push("/admin/profile");
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                <Users size={16} />
                My Profile
              </button>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}