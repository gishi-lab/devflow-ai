import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Proxy handles most redirects, but this is a secure server-side guard.
  if (!user) {
    redirect("/login");
  }

  const userName =
    user.user_metadata?.full_name ||
    user.user_metadata?.display_name ||
    user.email?.split("@")[0] ||
    "Developer";

  return (
    <div className="flex h-full bg-slate-50">
      <Sidebar userName={userName} userEmail={user.email ?? ""} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-full min-w-0 lg:overflow-hidden">
        <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">
          {children}
        </main>
      </div>
    </div>
  );
}
