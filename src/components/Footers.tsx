import { ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function Footers() {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t dark:border-slate-800 py-8 border-slate-200">
      <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Copyright */}
        <div className="flex items-center space-x-2 text-slate-500 group">
          <ShieldCheck
            size={20}
            className="text-blue-600 transition-transform duration-300 group-hover:scale-110"
          />
          <p className="text-sm font-medium">
            © 2026 AuthGuardian AI. Compliant, Bounded, Secure.
          </p>
        </div>

        {/* Footer Links */}
        <div className="flex items-center space-x-6 text-sm font-medium text-slate-500">
          <Link
            href=""
            className="hover:text-blue-600 transition-colors duration-200"
          >
            Privacy Policy
          </Link>
          <Link
            href=""
            className="hover:text-blue-600 transition-colors duration-200"
          >
            Terms of Service
          </Link>
          <Link
            href=""
            className="hover:text-blue-600 transition-colors duration-200"
          >
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
