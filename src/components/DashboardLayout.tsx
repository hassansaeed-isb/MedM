"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/types";
import {
  LayoutDashboard,
  LogOut,
  Calendar,
  Users,
  Building2,
  BarChart3,
  ClipboardList,
  DollarSign,
} from "lucide-react";

const roleNav: Record<
  UserRole,
  { href: string; label: string; icon: React.ElementType }[]
> = {
  admin: [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/clinics", label: "Clinics", icon: Building2 },
    { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  ],
  receptionist: [
    { href: "/receptionist", label: "Dashboard", icon: LayoutDashboard },
    { href: "/receptionist/bookings", label: "Bookings", icon: Calendar },
    { href: "/receptionist/slots", label: "Slots", icon: ClipboardList },
    { href: "/receptionist/payments", label: "Payments", icon: DollarSign },
  ],
  doctor: [
    { href: "/doctor", label: "Dashboard", icon: LayoutDashboard },
    { href: "/doctor/approvals", label: "Approvals", icon: ClipboardList },
    { href: "/doctor/sessions", label: "Sessions", icon: Calendar },
    { href: "/doctor/earnings", label: "Earnings", icon: DollarSign },
  ],
};

export default function DashboardLayout({
  children,
  role,
}: {
  children: React.ReactNode;
  role: UserRole;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!user) {
    router.replace("/");
    return null;
  }

  const nav = roleNav[role];

  return (
    <div className="flex min-h-screen bg-sage-50">
      <aside className="fixed left-0 top-0 z-10 flex h-full w-56 flex-col border-r border-sage-200 bg-white shadow-sm">
        <div className="border-b border-sage-200 p-4">
          <p className="font-medium text-sage-800">Clinic Management</p>
          <p className="text-xs text-sage-500 capitalize">{role}</p>
        </div>
        <nav className="flex-1 space-y-0.5 p-2">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-calm-100 text-calm-800"
                    : "text-sage-600 hover:bg-sage-100 hover:text-sage-800"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sage-200 p-2">
          <p className="truncate px-3 py-1 text-xs text-sage-500">{user.email}</p>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-sage-600 hover:bg-sage-100"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 pl-56">
        <div className="min-h-screen p-6">{children}</div>
      </main>
    </div>
  );
}
