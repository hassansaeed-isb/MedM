"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  getBookingsForClinic,
  getSlotsForClinic,
  getNextAvailableSlot,
  getClinics,
} from "@/data/mock";
import { format, parseISO, isToday } from "date-fns";
import Link from "next/link";
import { Calendar, Clock, DollarSign, Sparkles } from "lucide-react";
import { SlotStatusBadge } from "@/components/SlotStatusBadge";

export default function ReceptionistDashboard() {
  const { user } = useAuth();
  const clinicIds = user?.clinicIds ?? [];
  const clinics = getClinics().filter((c) => clinicIds.includes(c.id));

  const todayBookings = clinicIds.flatMap((cid) =>
    getBookingsForClinic(cid).filter((b) => {
      const d = b.sessionTime?.split(" ")[0];
      return d && isToday(parseISO(d));
    })
  );
  const pendingPayments = todayBookings.filter(
    (b) => b.paymentStatus !== "paid" && b.status === "approved"
  );
  const freeSlotsCount = clinicIds.reduce((acc, cid) => {
    const from = new Date();
    const slots = getSlotsForClinic(cid, from, 7);
    return acc + slots.filter((s) => s.status === "free").length;
  }, 0);
  const nextSlot = clinicIds.length
    ? getNextAvailableSlot(clinicIds[0])
    : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-sage-800">
          Receptionist Dashboard
        </h1>
        <p className="text-sage-600">
          Today&apos;s overview for your clinic(s)
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-calm-100 p-2">
              <Calendar className="h-5 w-5 text-calm-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-sage-800">
                {todayBookings.length}
              </p>
              <p className="text-sm text-sage-600">Today&apos;s bookings</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-100 p-2">
              <Sparkles className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-sage-800">
                {freeSlotsCount}
              </p>
              <p className="text-sm text-sage-600">Free slots (7 days)</p>
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
                {pendingPayments.length}
              </p>
              <p className="text-sm text-sage-600">Pending payments</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-violet-100 p-2">
              <Clock className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-sage-800">
                {nextSlot
                  ? `${nextSlot.startTime} · ${nextSlot.date}`
                  : "—"}
              </p>
              <p className="text-sm text-sage-600">Next available slot</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card overflow-hidden">
          <div className="border-b border-sage-200 bg-sage-50/50 px-4 py-3">
            <h2 className="font-semibold text-sage-800">Today&apos;s bookings</h2>
          </div>
          <div className="divide-y divide-sage-100">
            {todayBookings.length === 0 ? (
              <p className="p-4 text-sm text-sage-500">No bookings today.</p>
            ) : (
              todayBookings.slice(0, 8).map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-sage-800">{b.patientName}</p>
                    <p className="text-sm text-sage-500">{b.sessionTime}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <SlotStatusBadge
                      status={
                        b.status === "pending_approval"
                          ? "pending_approval"
                          : b.status === "approved"
                            ? "booked"
                            : "completed"
                      }
                    />
                    {b.paymentStatus !== "paid" && (
                      <span className="text-xs text-amber-600">Unpaid</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="border-t border-sage-200 bg-sage-50/30 px-4 py-2">
            <Link
              href="/receptionist/bookings"
              className="text-sm font-medium text-calm-600 hover:underline"
            >
              View all bookings →
            </Link>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="border-b border-sage-200 bg-sage-50/50 px-4 py-3">
            <h2 className="font-semibold text-sage-800">Your clinics</h2>
          </div>
          <div className="divide-y divide-sage-100">
            {clinics.map((c) => (
              <Link
                key={c.id}
                href={`/receptionist/slots?clinic=${c.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-sage-50/50"
              >
                <div>
                  <p className="font-medium text-sage-800">{c.name}</p>
                  <p className="text-sm text-sage-500">{c.address}</p>
                </div>
                <span className="text-sm text-calm-600">View slots →</span>
              </Link>
            ))}
          </div>
          <div className="border-t border-sage-200 bg-sage-50/30 px-4 py-2">
            <Link
              href="/receptionist/bookings/new"
              className="text-sm font-medium text-calm-600 hover:underline"
            >
              New booking →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
