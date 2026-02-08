"use client";

import { useAuth } from "@/contexts/AuthContext";
import { getBookingsForClinic, getClinics, getDoctors } from "@/data/mock";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { SlotStatusBadge } from "@/components/SlotStatusBadge";
import { Plus } from "lucide-react";

export default function BookingsPage() {
  const { user } = useAuth();
  const clinicIds = user?.clinicIds ?? [];
  const clinics = getClinics().filter((c) => clinicIds.includes(c.id));
  const doctors = getDoctors();
  const bookings = clinicIds.flatMap((cid) =>
    getBookingsForClinic(cid).sort(
      (a, b) =>
        new Date(b.sessionTime).getTime() - new Date(a.sessionTime).getTime()
    )
  );

  const getDoctorName = (id: string) => doctors.find((d) => d.id === id)?.name ?? id;
  const getClinicName = (id: string) => clinics.find((c) => c.id === id)?.name ?? id;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-sage-800">Bookings</h1>
          <p className="text-sage-600">View and manage session bookings</p>
        </div>
        <Link href="/receptionist/bookings/new" className="btn-primary inline-flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New booking
        </Link>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-sage-200 bg-sage-50/70">
              <tr>
                <th className="px-4 py-3 font-medium text-sage-700">Patient</th>
                <th className="px-4 py-3 font-medium text-sage-700">Doctor</th>
                <th className="px-4 py-3 font-medium text-sage-700">Clinic</th>
                <th className="px-4 py-3 font-medium text-sage-700">Session</th>
                <th className="px-4 py-3 font-medium text-sage-700">Status</th>
                <th className="px-4 py-3 font-medium text-sage-700">Payment</th>
                <th className="px-4 py-3 font-medium text-sage-700">Amount</th>
                <th className="px-4 py-3 font-medium text-sage-700"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-100">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-sage-50/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-sage-800">{b.patientName}</p>
                    <p className="text-xs text-sage-500">{b.patientContact}</p>
                  </td>
                  <td className="px-4 py-3 text-sage-700">
                    {getDoctorName(b.doctorId)}
                  </td>
                  <td className="px-4 py-3 text-sage-700">
                    {getClinicName(b.clinicId)}
                  </td>
                  <td className="px-4 py-3 text-sage-700">{b.sessionTime}</td>
                  <td className="px-4 py-3">
                    <SlotStatusBadge
                      status={
                        b.status === "pending_approval"
                          ? "pending_approval"
                          : b.status === "approved"
                            ? "booked"
                            : b.status === "rejected"
                              ? "completed"
                              : "booked"
                      }
                    />
                    {b.status === "rejected" && (
                      <span className="ml-1 text-xs text-red-600">Rejected</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        b.paymentStatus === "paid"
                          ? "text-emerald-600"
                          : b.paymentStatus === "partial"
                            ? "text-amber-600"
                            : "text-sage-600"
                      }
                    >
                      {b.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sage-700">
                    ${b.totalAmount ?? b.baseAmount}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/receptionist/bookings/${b.id}`}
                      className="text-calm-600 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {bookings.length === 0 && (
          <p className="p-8 text-center text-sage-500">No bookings yet.</p>
        )}
      </div>
    </div>
  );
}
