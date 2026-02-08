"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { getBookings, getClinics, getDoctors, getPaymentsForBooking } from "@/data/mock";
import { format } from "date-fns";
import { SlotStatusBadge } from "@/components/SlotStatusBadge";

export default function BookingDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const booking = getBookings().find((b) => b.id === id);
  const clinics = getClinics();
  const doctors = getDoctors();
  const payments = booking ? getPaymentsForBooking(booking.id) : [];

  if (!booking) {
    return (
      <div className="space-y-4">
        <Link href="/receptionist/bookings" className="text-calm-600 hover:underline">
          ← Back to bookings
        </Link>
        <p className="text-sage-600">Booking not found.</p>
      </div>
    );
  }

  const clinic = clinics.find((c) => c.id === booking.clinicId);
  const doctor = doctors.find((d) => d.id === booking.doctorId);
  const totalDue = booking.totalAmount ?? booking.baseAmount;
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const slotStatus =
    booking.status === "pending_approval"
      ? "pending_approval"
      : booking.status === "approved" && !booking.sessionStartTime
        ? "booked"
        : booking.sessionStartTime && !booking.sessionEndTime
          ? "in_session"
          : "completed";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/receptionist/bookings" className="text-calm-600 hover:underline">
          ← Back to bookings
        </Link>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-sage-200 bg-sage-50/50 px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="font-semibold text-sage-800">Booking #{booking.id}</h1>
            <SlotStatusBadge status={slotStatus} />
          </div>
        </div>
        <div className="divide-y divide-sage-100 p-4 space-y-4">
          <div>
            <h3 className="text-sm font-medium text-sage-500">Patient</h3>
            <p className="font-medium text-sage-800">{booking.patientName}</p>
            <p className="text-sm text-sage-600">{booking.patientContact}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-sage-500">Session</h3>
            <p className="text-sage-800">{booking.sessionTime}</p>
            <p className="text-sm text-sage-600">{clinic?.name} · {booking.clinicAddress}</p>
            <p className="text-sm text-sage-600">Doctor: {doctor?.name}</p>
          </div>
          {(booking.sessionStartTime || booking.sessionEndTime) && (
            <div>
              <h3 className="text-sm font-medium text-sage-500">Session timing</h3>
              <p className="text-sm text-sage-700">
                Start: {booking.sessionStartTime ? format(new Date(booking.sessionStartTime), "PPp") : "—"}
              </p>
              <p className="text-sm text-sage-700">
                End: {booking.sessionEndTime ? format(new Date(booking.sessionEndTime), "PPp") : "—"}
              </p>
              {booking.extraMinutes != null && booking.extraMinutes > 0 && (
                <p className="text-sm text-amber-600">
                  Extra time: {booking.extraMinutes} min · +${booking.extraCharges ?? 0}
                </p>
              )}
            </div>
          )}
          <div>
            <h3 className="text-sm font-medium text-sage-500">Payment</h3>
            <p className="text-sage-800">Base: ${booking.baseAmount}</p>
            {booking.extraCharges != null && booking.extraCharges > 0 && (
              <p className="text-sage-700">Extra: ${booking.extraCharges}</p>
            )}
            <p className="font-medium text-sage-800">Total: ${totalDue}</p>
            <p className="text-sm text-sage-600">Paid: ${totalPaid} · Status: {booking.paymentStatus}</p>
            {payments.length > 0 && (
              <ul className="mt-2 text-sm text-sage-600">
                {payments.map((p) => (
                  <li key={p.id}>
                    ${p.amount} ({p.mode}) at {format(new Date(p.paidAt), "PPp")}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="border-t border-sage-200 bg-sage-50/30 px-4 py-3 flex gap-2">
          <Link
            href={`/receptionist/payments?booking=${booking.id}`}
            className="btn-primary text-sm"
          >
            Record payment
          </Link>
        </div>
      </div>
    </div>
  );
}
