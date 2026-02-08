"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  getClinics,
  getDoctors,
  getBookings,
} from "@/data/mock";
import { useState } from "react";
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from "date-fns";

type Period = "daily" | "weekly" | "monthly";

export default function ReportsPage() {
  const { user } = useAuth();
  const clinicIds = user?.clinicIds ?? [];
  const clinics = getClinics().filter((c) => clinicIds.includes(c.id));
  const doctors = getDoctors();
  const bookings = getBookings();
  const [period, setPeriod] = useState<Period>("monthly");

  const now = new Date();
  const range =
    period === "daily"
      ? { start: startOfDay(now), end: endOfDay(now) }
      : period === "weekly"
        ? { start: subDays(now, 7), end: now }
        : { start: subDays(now, 30), end: now };

  const inRange = bookings.filter((b) =>
    isWithinInterval(new Date(b.sessionTime), range)
  );
  const paid = inRange.filter((b) => b.paymentStatus === "paid");
  const revenue = paid.reduce(
    (s, b) => s + (b.totalAmount ?? b.baseAmount),
    0
  );

  const byDoctor = doctors
    .filter((d) => clinicIds.includes(d.clinicId))
    .map((d) => {
      const docBookings = inRange.filter((b) => b.doctorId === d.id);
      const docPaid = docBookings.filter((b) => b.paymentStatus === "paid");
      const docRevenue = docPaid.reduce(
        (s, b) => s + (b.totalAmount ?? b.baseAmount),
        0
      );
      const commission =
        d.commissionType === "percentage"
          ? docPaid.reduce(
              (s, b) =>
                s +
                (b.totalAmount ?? b.baseAmount) * (d.commissionValue / 100),
              0
            )
          : docPaid.length * d.commissionValue;
      return {
        doctor: d,
        clinic: clinics.find((c) => c.id === d.clinicId),
        patients: docBookings.length,
        revenue: docRevenue,
        commission,
      };
    })
    .sort((a, b) => b.patients - a.patients);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-sage-800">Reports</h1>
        <p className="text-sage-600">Revenue and doctor utilization</p>
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
          <p className="text-sm font-medium text-sage-500">Total sessions</p>
          <p className="text-2xl font-semibold text-sage-800">{inRange.length}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm font-medium text-sage-500">Paid sessions</p>
          <p className="text-2xl font-semibold text-sage-800">{paid.length}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm font-medium text-sage-500">Revenue</p>
          <p className="text-2xl font-semibold text-sage-800">
            ${revenue.toFixed(0)}
          </p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-sage-200 bg-sage-50/50 px-4 py-3">
          <h2 className="font-semibold text-sage-800">By doctor</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-sage-200 bg-sage-50/70">
              <tr>
                <th className="px-4 py-3 font-medium text-sage-700">Doctor</th>
                <th className="px-4 py-3 font-medium text-sage-700">Clinic</th>
                <th className="px-4 py-3 font-medium text-sage-700">Patients</th>
                <th className="px-4 py-3 font-medium text-sage-700">Revenue</th>
                <th className="px-4 py-3 font-medium text-sage-700">Commission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-100">
              {byDoctor.map(({ doctor, clinic, patients, revenue: rev, commission }) => (
                <tr key={doctor.id} className="hover:bg-sage-50/50">
                  <td className="px-4 py-3 font-medium text-sage-800">
                    {doctor.name}
                  </td>
                  <td className="px-4 py-3 text-sage-700">{clinic?.name}</td>
                  <td className="px-4 py-3 text-sage-700">{patients}</td>
                  <td className="px-4 py-3 text-sage-700">${rev.toFixed(0)}</td>
                  <td className="px-4 py-3 text-sage-700">
                    ${commission.toFixed(0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
