"use client";

import { useState, useRef, useEffect } from "react";
import {
  User,
  Settings,
  HelpCircle,
  FileText,
  LogOut,
  ChevronDown,
  ShieldAlert,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function ProfileDropdown() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Extract user info safely from session
  const userName = session?.user?.name || "User Account";
  const userEmail = session?.user?.email || "user@authguardian.ai";
  const userInitials = userName.substring(0, 2).toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl transition-all duration-200 shadow-sm"
      >
        {/* User Avatar Initials Badge */}
        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-inner">
          {userInitials}
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
            {userName}
          </p>
        </div>
        <ChevronDown
          size={14}
          className={`text-slate-500 dark:text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu Popup */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 transition-colors">
          {/* Header Profile Info inside Dropdown */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {userName}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {userEmail}
            </p>
          </div>

          {/* Navigation Links */}
          <div className="py-1 text-sm text-slate-700 dark:text-slate-300">
            <button
              onClick={() => {
                setIsOpen(false);
                // router.push("/profile");
              }}
              className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <User size={16} className="text-slate-500 dark:text-slate-400" />
              <span>My Profile</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                // router.push("/apa-agent");
              }}
              className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <ShieldAlert
                size={16}
                className="text-slate-500 dark:text-slate-400"
              />
              <span>Admin Panel</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                // router.push("/settings");
              }}
              className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Settings
                size={16}
                className="text-slate-500 dark:text-slate-400"
              />
              <span>Settings</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                // router.push("/support");
              }}
              className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <HelpCircle
                size={16}
                className="text-slate-500 dark:text-slate-400"
              />
              <span>Help & Support</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                // router.push("/documentation");
              }}
              className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <FileText
                size={16}
                className="text-slate-500 dark:text-slate-400"
              />
              <span>Documentation</span>
            </button>
          </div>

          {/* Sign Out Action */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-1 mt-1">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full flex items-center space-x-3 px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-semibold text-sm"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
