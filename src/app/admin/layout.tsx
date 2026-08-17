"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import Footers from "@/components/Footers";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "User Management", href: "/admin/users", icon: Users },
    {
      name: "Patient Management",
      href: "/admin/clinical-data",
      icon: FileText,
    },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const userName = session?.user?.name || "Admin";
  const userEmail = session?.user?.email || "";
  const initials = userName.substring(0, 2).toUpperCase();

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100">
      {/* ========== SIDEBAR ========== */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800">
          <ShieldCheck className="text-blue-500" size={28} />
          {sidebarOpen && (
            <span className="font-bold text-lg tracking-tight">
              AuthGuardian
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-600/20 text-blue-400"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {sidebarOpen && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="m-3 flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          {sidebarOpen ? (
            <>
              <X size={16} />
              <span>Collapse</span>
            </>
          ) : (
            <Menu size={16} />
          )}
        </button>
      </aside>

      {/* ========== MAIN CONTENT ========== */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur flex items-center justify-between px-6">
          <div>
            <h1 className="text-lg font-semibold">Admin Dashboard</h1>
            <p className="text-xs text-slate-400">User Management</p>
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-3 hover:bg-slate-800 px-3 py-1.5 rounded-xl transition"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-sm font-bold">
                {initials}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium leading-tight">{userName}</p>
                <p className="text-xs text-slate-400">Admin</p>
              </div>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-xl py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-800">
                  <p className="text-sm font-medium truncate">{userEmail}</p>
                </div>
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    router.push("/admin/profile");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-800 transition"
                >
                  <Users size={16} />
                  My Profile
                </button>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-900/20 transition"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 bg-slate-950">
          {children}
        </main>
        <Footers />
      </div>
    </div>
  );
}
