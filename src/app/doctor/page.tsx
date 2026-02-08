"use client";

import { useAuth } from "@/contexts/AuthContext";
import { getBookingsForDoctor, getDoctors } from "@/data/mock";
import { format, parseISO, isToday, isAfter } from "date-fns";
import Link from "next/link";
import { Calendar, ClipboardCheck, DollarSign, Users } from "lucide-react";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const doctorId = user?.doctorId ?? user?.id;
  const doctor = getDoctors().find((d) => d.id === doctorId);
  const bookings = getBookingsForDoctor(doctorId).filter(
    (b) => b.status === "approved" || b.status === "completed"
  );
  const now = new Date();
  const upcoming = bookings
    .filter((b) => {
      const d = b.sessionTime?.split(" ")[0];
      const t = b.sessionTime?.split(" ")[1];
      if (!d || !t) return false;
      const sessionDate = new Date(d + "T" + t);
      return sessionDate >= now && b.status === "approved";
    })
    .sort(
      (a, b) =>
        new Date(a.sessionTime).getTime() - new Date(b.sessionTime).getTime()
    )
    .slice(0, 5);
  const pendingApprovals = getBookingsForDoctor(doctorId).filter(
    (b) => b.status === "pending_approval"
  );
  const completedCount = bookings.filter((b) => b.status === "completed").length;
  const earnings = bookings
    .filter((b) => b.status === "completed" && b.paymentStatus === "paid")
    .reduce((sum, b) => {
      const total = b.totalAmount ?? b.baseAmount;
      const commission = doctor?.commissionType === "percentage"
        ? (total * (doctor.commissionValue / 100))
        : doctor?.commissionValue ?? 0;
      return sum + commission;
    }, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-sage-800">Doctor Dashboard</h1>
        <p className="text-sage-600">Sessions, approvals, and earnings</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2">
              <ClipboardCheck className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-sage-800">
                {pendingApprovals.length}
              </p>
              <p className="text-sm text-sage-600">Pending approvals</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-calm-100 p-2">
              <Calendar className="h-5 w-5 text-calm-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-sage-800">
                {upcoming.length}
              </p>
              <p className="text-sm text-sage-600">Upcoming sessions</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-100 p-2">
              <Users className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-sage-800">
                {completedCount}
              </p>
              <p className="text-sm text-sage-600">Patients (completed)</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-violet-100 p-2">
              <DollarSign className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-sage-800">
                ${earnings.toFixed(0)}
              </p>
              <p className="text-sm text-sage-600">Earnings (paid)</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card overflow-hidden">
          <div className="border-b border-sage-200 bg-sage-50/50 px-4 py-3 flex justify-between items-center">
            <h2 className="font-semibold text-sage-800">Pending approvals</h2>
            {pendingApprovals.length > 0 && (
              <Link
                href="/doctor/approvals"
                className="text-sm font-medium text-calm-600 hover:underline"
              >
                View all →
              </Link>
            )}
          </div>
          <div className="divide-y divide-sage-100">
            {pendingApprovals.length === 0 ? (
              <p className="p-4 text-sm text-sage-500">No pending approvals.</p>
            ) : (
              pendingApprovals.slice(0, 5).map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-sage-800">{b.patientName}</p>
                    <p className="text-sm text-sage-500">{b.sessionTime}</p>
                  </div>
                  <Link
                    href="/doctor/approvals"
                    className="text-sm text-calm-600 hover:underline"
                  >
                    Review
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="card overflow-hidden">
          <div className="border-b border-sage-200 bg-sage-50/50 px-4 py-3 flex justify-between items-center">
            <h2 className="font-semibold text-sage-800">Upcoming sessions</h2>
            <Link
              href="/doctor/sessions"
              className="text-sm font-medium text-calm-600 hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="divide-y divide-sage-100">
            {upcoming.length === 0 ? (
              <p className="p-4 text-sm text-sage-500">No upcoming sessions.</p>
            ) : (
              upcoming.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-sage-800">{b.patientName}</p>
                    <p className="text-sm text-sage-500">{b.sessionTime}</p>
                  </div>
                  <Link
                    href={`/doctor/sessions?id=${b.id}`}
                    className="text-sm text-calm-600 hover:underline"
                  >
                    Start
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
