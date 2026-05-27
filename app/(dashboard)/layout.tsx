import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full bg-slate-50">
      <Sidebar />
      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-full min-w-0 lg:overflow-hidden">
        <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">
          {children}
        </main>
      </div>
    </div>
  );
}
