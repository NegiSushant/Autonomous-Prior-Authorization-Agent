import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import Footers from "@/components/Footers";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Changed bg-slate-950 to bg-slate-50 dark:bg-slate-950
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden w-full transition-colors duration-300">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminTopbar />

        {/* Changed bg-slate-950 to bg-slate-50 dark:bg-slate-950 */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
          {children}
        </main>

        <Footers />
      </div>
    </div>
  );
}
