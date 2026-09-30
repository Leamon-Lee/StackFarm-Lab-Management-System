"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationCenter } from "@/components/notification-center";
import { LogOut } from "lucide-react";
import { useTheme } from "next-themes";

// Routes a super_admin may access (platform dashboard)
const PLATFORM_ROUTES = ["/admin", "/admin/analytics", "/admin/organizations", "/admin/org-requests", "/admin/users"];

// Routes association admin/staff may access
const ADMIN_ROUTES = ["/dashboard", "/members", "/finances", "/events", "/communications", "/elections", "/documents", "/analytics", "/workflows", "/ai", "/integrations", "/marketing"];

// Pages non-staff (member) users can access
const MEMBER_ROUTES = ["/profile", "/my-events", "/my-invoices", "/elections"];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, loading, isStaff } = useAuth();
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const isDark = resolvedTheme === "dark";
  const isSuperAdmin = user?.roles?.includes("super_admin") ?? false;

  useEffect(() => {
    if (loading || !user) return;

    // Super admin: redirect from association routes to /admin
    if (isSuperAdmin && !PLATFORM_ROUTES.includes(pathname) && !MEMBER_ROUTES.includes(pathname)) {
      router.replace("/admin");
      return;
    }

    // Non-super-admin staff: redirect from platform routes to /dashboard
    if (!isSuperAdmin && isStaff && PLATFORM_ROUTES.includes(pathname)) {
      router.replace("/dashboard");
      return;
    }

    // Members: redirect from admin routes to /profile
    if (!isStaff && !MEMBER_ROUTES.includes(pathname)) {
      router.replace("/profile");
    }
  }, [loading, user, isStaff, isSuperAdmin, pathname, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: isDark ? 'linear-gradient(160deg, #081A28 0%, #0D2336 40%, #0A2031 100%)' : 'linear-gradient(160deg, #EAF5FC 0%, #ffffff 40%, #F6F8FA 100%)' }}>
        <div className="text-center space-y-4">
          <div className="h-12 w-12 mx-auto animate-spin rounded-xl border-4 border-teal-200 border-t-[#0C74B9]" style={{ boxShadow: '0 4px 16px rgba(12,116,185,0.2)' }} />
          <p className="text-sm font-medium text-slate-500">Loading AssocHub...</p>
        </div>
      </div>
    );
  }

  if (!isStaff && !MEMBER_ROUTES.includes(pathname)) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: isDark ? 'linear-gradient(160deg, #081A28 0%, #0D2336 40%, #0A2031 100%)' : 'linear-gradient(160deg, #EAF5FC 0%, #ffffff 40%, #F6F8FA 100%)' }}>
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center" style={{ background: isDark ? 'linear-gradient(135deg, #4A9BD0, #08578C)' : 'linear-gradient(135deg, #0C74B9, #08578C)', boxShadow: '0 8px 24px rgba(12,116,185,0.2)' }}>
            <span className="text-white text-2xl">🔒</span>
          </div>
          <p className="text-slate-600 font-semibold">Redirecting to your portal...</p>
        </div>
      </div>
    );
  }

  // Non-staff users on /profile get a minimal layout without sidebar
  if (!isStaff) {
    // Force light mode for member portal — prevent dark overrides
    return (
      <div className="min-h-screen member-portal" style={{ background: 'linear-gradient(160deg, #EAF5FC 0%, #ffffff 40%, #F6F8FA 100%)' }}>
        {/* Top teal accent line */}
        <div className="h-[3px] w-full" style={{ background: 'linear-gradient(90deg, #063B60, #08578C, #0C74B9, #08578C, #063B60)' }} />
        <header className="flex h-16 items-center justify-between px-6 border-b border-slate-200/50" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px) saturate(180%)' }}>
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-slate-800">AssocHub</span>
            <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">Member Portal</span>
          </div>
          <div className="flex items-center gap-3">
            <NotificationCenter />
            <span className="text-sm text-slate-600 font-medium hidden sm:inline">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={logout} className="text-slate-600 hover:text-[#0C74B9] hover:bg-teal-50 rounded-xl px-3 py-2 h-auto transition-all font-medium">
              <LogOut className="h-4 w-4 mr-1.5" />
              Logout
            </Button>
          </div>
        </header>
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Top teal accent line */}
        <div className="h-[3px] w-full" style={{ background: 'linear-gradient(90deg, #063B60, #08578C, #0C74B9, #08578C, #063B60)' }} />
        {/* Glass morphism header — z-[20] to paint above main content */}
        <header className="flex h-16 items-center gap-3 border-b px-5" style={{ zIndex: 20, position: 'relative', background: isDark ? 'rgba(13, 35, 54, 0.95)' : 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)', boxShadow: isDark ? '0 1px 12px rgba(0,0,0,0.3)' : '0 1px 12px rgba(12,116,185,0.05)', borderColor: isDark ? 'rgba(167, 209, 236, 0.22)' : undefined }}>
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6 bg-slate-200/40" />
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <NotificationCenter />
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200/50">
              {isSuperAdmin && (
                <span className="text-[10px] bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-2.5 py-1 rounded-full font-bold tracking-wide" style={{ boxShadow: '0 2px 8px rgba(99,102,241,0.3)' }}>
                  PLATFORM
                </span>
              )}
              <div className="flex items-center justify-center w-9 h-9 rounded-xl text-white text-sm font-bold" style={{ background: isDark ? 'linear-gradient(135deg, #4A9BD0, #08578C)' : 'linear-gradient(135deg, #0C74B9, #063B60)', boxShadow: isDark ? '0 2px 10px rgba(74,155,208,0.3)' : '0 2px 10px rgba(12,116,185,0.3)' }}>
                {(user?.email?.[0] || "U").toUpperCase()}
              </div>
              <span className="text-sm text-slate-600 font-semibold hidden sm:inline">{user?.email || "User"}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={logout} className="text-slate-600 hover:text-[#0C74B9] hover:bg-teal-50 rounded-xl px-3 py-2 h-auto transition-all font-medium">
              <LogOut className="h-4 w-4 mr-1.5" />
              Logout
            </Button>
          </div>
        </header>
        {/* Main content with premium gradient background — z-[10] below header */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8" style={{ zIndex: 10, position: 'relative', background: isDark ? 'linear-gradient(160deg, #081A28 0%, #0D2336 40%, #0A2031 100%)' : 'linear-gradient(160deg, #EAF5FC 0%, #ffffff 40%, #F6F8FA 100%)' }}>
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
