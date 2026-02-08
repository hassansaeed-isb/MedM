"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { UserRole } from "@/types";
import { LayoutDashboard, LogIn } from "lucide-react";

const ROLES: { value: UserRole; label: string }[] = [
  { value: "admin", label: "Admin / Clinic Owner" },
  { value: "receptionist", label: "Receptionist" },
  { value: "doctor", label: "Doctor (Psychologist)" },
];

export default function HomePage() {
  const { user, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("receptionist");

  useEffect(() => {
    if (user) {
      if (user.role === "admin") router.push("/admin");
      else if (user.role === "receptionist") router.push("/receptionist");
      else if (user.role === "doctor") router.push("/doctor");
    }
  }, [user, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email || "demo@clinic.com", role);
  };

  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sage-50">
        <div className="text-center text-sage-600">
          <LayoutDashboard className="mx-auto h-12 w-12 animate-pulse" />
          <p className="mt-2">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-sage-50 via-calm-50/30 to-sage-100 px-4">
      <div className="w-full max-w-md">
        <div className="card p-8 shadow-lg">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold text-sage-800">
              Psychologist Clinic
            </h1>
            <p className="mt-1 text-sm text-sage-600">
              Management System
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-sage-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@clinic.com"
                className="w-full rounded-lg border border-sage-300 px-3 py-2 text-sage-900 placeholder:text-sage-400 focus:border-calm-500 focus:outline-none focus:ring-1 focus:ring-calm-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-sage-700">
                Sign in as
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full rounded-lg border border-sage-300 px-3 py-2 text-sage-900 focus:border-calm-500 focus:outline-none focus:ring-1 focus:ring-calm-500"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-primary flex w-full items-center justify-center gap-2">
              <LogIn className="h-4 w-4" />
              Sign in
            </button>
          </form>
          <p className="mt-4 text-center text-xs text-sage-500">
            Demo: use any email and pick a role to enter that dashboard.
          </p>
        </div>
        <p className="mt-6 text-center text-sm text-sage-600">
          <Link href="/receptionist" className="text-calm-600 hover:underline">
            Skip login → Receptionist
          </Link>
          {" · "}
          <Link href="/doctor" className="text-calm-600 hover:underline">
            Doctor
          </Link>
          {" · "}
          <Link href="/admin" className="text-calm-600 hover:underline">
            Admin
          </Link>
        </p>
      </div>
    </div>
  );
}
