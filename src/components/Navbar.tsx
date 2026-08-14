"use client";

import { ShieldCheck, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import ProfileDropdown from "./ProfileDropdown";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { status } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const isLoggedIn = status === "authenticated";

  const handleRequestDemo = () => {
    if (isLoggedIn) {
      router.push("/apa-agent");
    } else {
      router.push("/signin");
    }
  };

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-all">
      {/* Brand */}
      <div className="flex items-center space-x-2 text-blue-600 group cursor-pointer">
        <ShieldCheck
          size={32}
          className="transition-transform duration-200 group-hover:scale-110"
        />
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-500 transition-colors"
        >
          AuthGuardian AI
        </Link>
      </div>

      {/* Center Links */}
      <div className="space-x-2 hidden md:flex items-center text-sm font-medium text-slate-600 dark:text-slate-300">
        <a
          href="architecture"
          className="px-3 py-2 rounded-md hover:text-blue-700 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-200"
        >
          Architecture
        </a>
        <a
          href="#how-it-works"
          className="px-3 py-2 rounded-md hover:text-blue-700 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-200"
        >
          How It Works
        </a>
        <a
          href="#safety"
          className="px-3 py-2 rounded-md hover:text-blue-700 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-200"
        >
          Compliance & Safety
        </a>
      </div>

      {/* Right Action Area */}
      <div className="flex items-center space-x-3">
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

        {status === "loading" ? (
          <div className="h-10 w-24 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" />
        ) : !isLoggedIn ? (
          <>
            {pathname !== "/apa-agent" && (
              <button
                onClick={handleRequestDemo}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm hover:bg-blue-700 hover:shadow-md transition-all duration-200 active:scale-95 ring-1 ring-blue-600/50"
              >
                Request Demo
              </button>
            )}
            <button
              onClick={() => router.push("/signin")}
              className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-5 py-2.5 rounded-lg text-sm font-semibold border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all duration-200 active:scale-95"
            >
              Sign In
            </button>
          </>
        ) : (
          <ProfileDropdown />
        )}
      </div>
    </nav>
  );
}
