"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  getBookingsForClinic,
  getPaymentsForBooking,
  getClinics,
  getDoctors,
  addPayment,
  getBookings,
} from "@/data/mock";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { DollarSign } from "lucide-react";
import { useState } from "react";

export default function PaymentsPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("booking");
  const clinicIds = user?.clinicIds ?? [];
  const clinics = getClinics().filter((c) => clinicIds.includes(c.id));
  const doctors = getDoctors();

  const bookings = clinicIds.flatMap((cid) =>
    getBookingsForClinic(cid).filter(
      (b) => b.status === "approved" || b.status === "completed"
    )
  );
  const unpaidOrPartial = bookings.filter(
    (b) => b.paymentStatus === "unpaid" || b.paymentStatus === "partial"
  );

  const getDoctorName = (id: string) => doctors.find((d) => d.id === id)?.name ?? id;
  const getClinicName = (id: string) => clinics.find((c) => c.id === id)?.name ?? id;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-sage-800">Payments</h1>
        <p className="text-sage-600">Record and track payments</p>
      </div>

      {bookingId ? (
        <RecordPaymentForm
          bookingId={bookingId}
          onDone={() => window.location.href = "/receptionist/payments"}
        />
      ) : (
        <>
          <div className="card p-4">
            <h2 className="font-semibold text-sage-800">Pending payments</h2>
            <p className="text-sm text-sage-600">
              {unpaidOrPartial.length} booking(s) with unpaid or partial payment
            </p>
          </div>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-sage-200 bg-sage-50/70">
                  <tr>
                    <th className="px-4 py-3 font-medium text-sage-700">Booking</th>
                    <th className="px-4 py-3 font-medium text-sage-700">Patient</th>
                    <th className="px-4 py-3 font-medium text-sage-700">Doctor</th>
                    <th className="px-4 py-3 font-medium text-sage-700">Session</th>
                    <th className="px-4 py-3 font-medium text-sage-700">Total</th>
                    <th className="px-4 py-3 font-medium text-sage-700">Status</th>
                    <th className="px-4 py-3 font-medium text-sage-700"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sage-100">
                  {bookings.map((b) => {
                    const total = b.totalAmount ?? b.baseAmount;
                    const payments = getPaymentsForBooking(b.id);
                    const paid = payments.reduce((s, p) => s + p.amount, 0);
                    return (
                      <tr key={b.id} className="hover:bg-sage-50/50">
                        <td className="px-4 py-3 font-medium text-sage-800">
                          #{b.id}
                        </td>
                        <td className="px-4 py-3 text-sage-700">{b.patientName}</td>
                        <td className="px-4 py-3 text-sage-700">
                          {getDoctorName(b.doctorId)}
                        </td>
                        <td className="px-4 py-3 text-sage-700">{b.sessionTime}</td>
                        <td className="px-4 py-3 text-sage-700">${total}</td>
                        <td className="px-4 py-3">
                          <span
                            className={
                              b.paymentStatus === "paid"
                                ? "text-emerald-600"
                                : "text-amber-600"
                            }
                          >
                            {b.paymentStatus} {paid > 0 && `(${paid})`}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {b.paymentStatus !== "paid" && (
                            <Link
                              href={`/receptionist/payments?booking=${b.id}`}
                              className="text-calm-600 hover:underline"
                            >
                              Record payment
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function RecordPaymentForm({
  bookingId,
  onDone,
}: {
  bookingId: string;
  onDone: () => void;
}) {
  const { user } = useAuth();
  const booking = getBookings().find((b) => b.id === bookingId);
  const payments = booking ? getPaymentsForBooking(booking.id) : [];
  const totalDue = booking ? (booking.totalAmount ?? booking.baseAmount) : 0;
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const remaining = totalDue - totalPaid;

  const [amount, setAmount] = useState(remaining);
  const [mode, setMode] = useState<"cash" | "card" | "other">("cash");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking || !user) return;
    addPayment({
      bookingId: booking.id,
      amount,
      mode,
      paidAt: new Date().toISOString(),
      recordedBy: user.id,
    });
    setSubmitted(true);
    setTimeout(onDone, 1500);
  };

  if (!booking) {
    return (
      <div className="card p-6">
        <p className="text-sage-600">Booking not found.</p>
        <Link href="/receptionist/payments" className="btn-primary mt-4">
          Back to payments
        </Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="card p-6 text-center">
        <DollarSign className="mx-auto h-12 w-12 text-emerald-500" />
        <p className="mt-2 font-medium text-sage-800">Payment recorded.</p>
        <p className="text-sm text-sage-600">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h2 className="mb-4 font-semibold text-sage-800">Record payment</h2>
      <p className="text-sm text-sage-600">
        {booking.patientName} · Session {booking.sessionTime} · Total due: $
        {totalDue} · Paid so far: ${totalPaid} · Remaining: ${remaining}
      </p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-sage-700">
            Amount ($)
          </label>
          <input
            type="number"
            min={0.01}
            step={0.01}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full max-w-xs rounded-lg border border-sage-300 px-3 py-2 text-sage-900 focus:border-calm-500 focus:outline-none focus:ring-1 focus:ring-calm-500"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-sage-700">
            Payment mode
          </label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as "cash" | "card" | "other")}
            className="w-full max-w-xs rounded-lg border border-sage-300 px-3 py-2 text-sage-900 focus:border-calm-500 focus:outline-none focus:ring-1 focus:ring-calm-500"
          >
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn-primary">
            Record payment
          </button>
          <Link href="/receptionist/payments" className="btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
