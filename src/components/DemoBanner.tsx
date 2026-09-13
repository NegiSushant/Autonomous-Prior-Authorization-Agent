"use client";

import { useState } from "react";
import { RequestAccessModal } from "./RequestAccessForm";
import { Info, Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";
import { SessionUser } from "@/types/users.dto";

export default function DemoBanner() {
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const user = session?.user as SessionUser | undefined;

  // If not org 1, return null immediately. The component remains invisible.
  if (user?.orgId !== 1) return null;
  return (
    <div>
      {/* 2. DEMO BANNER: Conditionally rendered if orgId === 1 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900/50 dark:bg-blue-900/20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-800/50">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200">
              You are viewing Demo Data
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300/80">
              This workspace contains simulated patient records. Request a full
              account to connect your own data sources.
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="shrink-0 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 shadow-sm"
        >
          <Sparkles className="h-4 w-4" />
          Request Full Access
        </button>
      </div>

      {/* 3. MODAL RENDERER */}
      {isModalOpen && (
        <RequestAccessModal
          userEmail={user.email}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
