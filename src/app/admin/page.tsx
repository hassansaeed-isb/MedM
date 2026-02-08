"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  getClinics,
  getDoctors,
  getBookings,
  getSlotsForClinic,
} from "@/data/mock";
import { format, subDays, isWithinInterval } from "date-fns";
import Link from "next/link";
import { Building2, Users, DollarSign, Calendar } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const clinicIds = user?.clinicIds ?? [];
  const clinics = getClinics().filter((c) => clinicIds.includes(c.id));
  const doctors = getDoctors();
  const bookings = getBookings();
  const now = new Date();
  const last30 = { start: subDays(now, 30), end: now };

  const clinicStats = clinics.map((c) => {
    const clinicBookings = bookings.filter(
      (b) =>
        b.clinicId === c.id &&
        isWithinInterval(new Date(b.sessionTime), last30)
    );
    const revenue = clinicBookings
      .filter((b) => b.paymentStatus === "paid")
      .reduce((s, b) => s + (b.totalAmount ?? b.baseAmount), 0);
    const slots = getSlotsForClinic(c.id, now, 7);
    const freeSlots = slots.filter((s) => s.status === "free").length;
    const docCount = doctors.filter((d) => d.clinicId === c.id).length;
    return {
      clinic: c,
      bookings: clinicBookings.length,
      revenue,
      freeSlots,
      docCount,
    };
  });

  const totalRevenue = clinicStats.reduce((s, x) => s + x.revenue, 0);
  const totalBookings = clinicStats.reduce((s, x) => s + x.bookings, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-sage-800">Admin Dashboard</h1>
        <p className="text-sage-600">Clinic performance and utilization</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-calm-100 p-2">
              <Building2 className="h-5 w-5 text-calm-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-sage-800">
                {clinics.length}
              </p>
              <p className="text-sm text-sage-600">Clinics</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-violet-100 p-2">
              <Users className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-sage-800">
                {doctors.length}
              </p>
              <p className="text-sm text-sage-600">Doctors</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-100 p-2">
              <Calendar className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-sage-800">
                {totalBookings}
              </p>
              <p className="text-sm text-sage-600">Bookings (30d)</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2">
              <DollarSign className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-sage-800">
                ${totalRevenue.toFixed(0)}
              </p>
              <p className="text-sm text-sage-600">Revenue (30d)</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-sage-200 bg-sage-50/50 px-4 py-3">
          <h2 className="font-semibold text-sage-800">Clinic performance</h2>
        </div>
        <div className="divide-y divide-sage-100">
          {clinicStats.map(({ clinic, bookings: count, revenue, freeSlots, docCount }) => (
            <div
              key={clinic.id}
              className="flex flex-wrap items-center justify-between gap-4 px-4 py-4"
            >
              <div>
                <p className="font-medium text-sage-800">{clinic.name}</p>
                <p className="text-sm text-sage-500">{clinic.address}</p>
                <p className="text-xs text-sage-500">
                  {docCount} doctors · {freeSlots} free slots (next 7 days)
                </p>
              </div>
              <div className="flex gap-6 text-sm">
                <span className="text-sage-700">{count} bookings</span>
                <span className="font-medium text-sage-800">
                  ${revenue.toFixed(0)} revenue
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-sage-200 bg-sage-50/30 px-4 py-2">
          <Link
            href="/admin/clinics"
            className="text-sm font-medium text-calm-600 hover:underline"
          >
            Manage clinics →
          </Link>
          {" · "}
          <Link
            href="/admin/reports"
            className="text-sm font-medium text-calm-600 hover:underline"
          >
            Reports →
          </Link>
        </div>
      </div>
    </div>
  );
}
