"use client";

import { useAuth } from "@/contexts/AuthContext";
import { getBookingsForDoctor, getDoctors } from "@/data/mock";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { useState } from "react";

type Period = "daily" | "weekly" | "monthly";

export default function EarningsPage() {
  const { user } = useAuth();
  const doctorId = user?.doctorId ?? user?.id ?? "";
  const doctor = getDoctors().find((d) => d.id === doctorId);
  const [period, setPeriod] = useState<Period>("monthly");

  const bookings = getBookingsForDoctor(doctorId).filter(
    (b) => b.status === "completed" && b.paymentStatus === "paid"
  );

  const now = new Date();
  const range =
    period === "daily"
      ? { start: startOfDay(now), end: endOfDay(now) }
      : period === "weekly"
        ? { start: subDays(now, 7), end: now }
        : { start: subDays(now, 30), end: now };

  const inRange = bookings.filter((b) => {
    const d = b.approvedAt ? new Date(b.approvedAt) : new Date(b.sessionTime);
    return d >= range.start && d <= range.end;
  });

  const patientCount = inRange.length;
  const totalRevenue = inRange.reduce(
    (s, b) => s + (b.totalAmount ?? b.baseAmount),
    0
  );
  const commission =
    doctor?.commissionType === "percentage"
      ? inRange.reduce(
          (s, b) =>
            s + (b.totalAmount ?? b.baseAmount) * (doctor.commissionValue / 100),
          0
        )
      : inRange.length * (doctor?.commissionValue ?? 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-sage-800">Earnings</h1>
        <p className="text-sage-600">Patient count and commission</p>
      </div>

      <div className="card p-4">
        <div className="flex gap-2">
          {(["daily", "weekly", "monthly"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-lg px-4 py-2 text-sm font-medium capitalize ${
                period === p
                  ? "bg-calm-600 text-white"
                  : "bg-sage-100 text-sage-700 hover:bg-sage-200"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-sage-500">
          {format(range.start, "MMM d, yyyy")} – {format(range.end, "MMM d, yyyy")}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-6">
          <p className="text-sm font-medium text-sage-500">Patients</p>
          <p className="text-2xl font-semibold text-sage-800">{patientCount}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm font-medium text-sage-500">Session revenue</p>
          <p className="text-2xl font-semibold text-sage-800">
            ${totalRevenue.toFixed(0)}
          </p>
        </div>
        <div className="card p-6">
          <p className="text-sm font-medium text-sage-500">Your commission</p>
          <p className="text-2xl font-semibold text-calm-700">
            ${commission.toFixed(0)}
          </p>
          {doctor && (
            <p className="text-xs text-sage-500">
              {doctor.commissionType === "percentage"
                ? `${doctor.commissionValue}%`
                : `$${doctor.commissionValue} per session`}
            </p>
          )}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="mb-4 font-semibold text-sage-800">Recent sessions</h2>
        <ul className="space-y-2 text-sm">
          {inRange.slice(0, 15).map((b) => {
            const total = b.totalAmount ?? b.baseAmount;
            const comm =
              doctor?.commissionType === "percentage"
                ? total * (doctor.commissionValue / 100)
                : doctor?.commissionValue ?? 0;
            return (
              <li
                key={b.id}
                className="flex justify-between border-b border-sage-100 py-2"
              >
                <span className="text-sage-700">
                  {b.patientName} · {b.sessionTime}
                </span>
                <span className="text-sage-800">${comm.toFixed(0)}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
