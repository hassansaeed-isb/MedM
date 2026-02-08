"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  getClinics,
  getDoctors,
  getSlotsForClinic,
  addBooking,
} from "@/data/mock";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { addDays, format } from "date-fns";
import { SlotStatusBadge } from "@/components/SlotStatusBadge";
import Link from "next/link";

export default function NewBookingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const clinicIds = user?.clinicIds ?? [];
  const clinics = getClinics().filter((c) => clinicIds.includes(c.id));

  const [clinicId, setClinicId] = useState(clinicIds[0] ?? "");
  const [doctorId, setDoctorId] = useState("");
  const [fromDate] = useState(new Date());
  const days = 7;

  const doctorsInClinic = useMemo(
    () => getDoctors().filter((d) => d.clinicId === clinicId),
    [clinicId]
  );
  const slots = useMemo(
    () =>
      clinicId
        ? getSlotsForClinic(clinicId, fromDate, days).filter(
            (s) => s.status === "free" && (doctorId ? s.doctorId === doctorId : true)
          )
        : [],
    [clinicId, fromDate, doctorId]
  );
  const nextSlot = useMemo(
    () => slots.find((s) => s.status === "free"),
    [slots]
  );

  const [selectedSlot, setSelectedSlot] = useState<typeof slots[0] | null>(null);
  const [patientName, setPatientName] = useState("");
  const [patientContact, setPatientContact] = useState("");
  const [baseAmount, setBaseAmount] = useState(120);

  const clinic = clinics.find((c) => c.id === clinicId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !clinic) return;
    const sessionTime = `${selectedSlot.date} ${selectedSlot.startTime}`;
    addBooking({
      slotId: selectedSlot.id,
      doctorId: selectedSlot.doctorId,
      clinicId: selectedSlot.clinicId,
      patientName,
      patientContact,
      sessionTime,
      clinicAddress: clinic.address,
      status: "pending_approval",
      baseAmount,
      paymentStatus: "unpaid",
    });
    router.push("/receptionist/bookings");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/receptionist/bookings"
          className="text-sage-600 hover:text-sage-800"
        >
          ← Back
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-sage-800">New booking</h1>
          <p className="text-sage-600">Select slot and enter patient details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="card p-6">
          <h2 className="mb-4 font-semibold text-sage-800">Clinic & doctor</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-sage-700">
                Clinic
              </label>
              <select
                value={clinicId}
                onChange={(e) => {
                  setClinicId(e.target.value);
                  setDoctorId("");
                  setSelectedSlot(null);
                }}
                className="w-full rounded-lg border border-sage-300 px-3 py-2 text-sage-900 focus:border-calm-500 focus:outline-none focus:ring-1 focus:ring-calm-500"
                required
              >
                <option value="">Select clinic</option>
                {clinics.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-sage-700">
                Doctor (optional filter)
              </label>
              <select
                value={doctorId}
                onChange={(e) => {
                  setDoctorId(e.target.value);
                  setSelectedSlot(null);
                }}
                className="w-full rounded-lg border border-sage-300 px-3 py-2 text-sage-900 focus:border-calm-500 focus:outline-none focus:ring-1 focus:ring-calm-500"
              >
                <option value="">All doctors</option>
                {doctorsInClinic.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="mb-2 font-semibold text-sage-800">Available slots</h2>
          {nextSlot && (
            <p className="mb-4 text-sm text-calm-600">
              Next available: {nextSlot.date} at {nextSlot.startTime} (highlighted)
            </p>
          )}
          <div className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3 md:grid-cols-4">
            {slots.map((slot) => {
              const doctor = doctorsInClinic.find((d) => d.id === slot.doctorId);
              const isNext = nextSlot?.id === slot.id;
              const isSelected = selectedSlot?.id === slot.id;
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`rounded-lg border p-3 text-left text-sm transition ${
                    isSelected
                      ? "border-calm-500 bg-calm-50 ring-2 ring-calm-500"
                      : isNext
                        ? "border-calm-300 bg-calm-50/50 hover:border-calm-400"
                        : "border-sage-200 hover:border-sage-300 hover:bg-sage-50"
                  }`}
                >
                  <p className="font-medium text-sage-800">
                    {slot.date} {slot.startTime}
                  </p>
                  <p className="text-xs text-sage-500">{doctor?.name}</p>
                  <SlotStatusBadge status={slot.status} />
                </button>
              );
            })}
          </div>
          {slots.length === 0 && (
            <p className="py-4 text-center text-sage-500">
              No free slots in the selected range. Try another clinic or doctor.
            </p>
          )}
        </div>

        <div className="card p-6">
          <h2 className="mb-4 font-semibold text-sage-800">Patient details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-sage-700">
                Patient name
              </label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full rounded-lg border border-sage-300 px-3 py-2 text-sage-900 focus:border-calm-500 focus:outline-none focus:ring-1 focus:ring-calm-500"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-sage-700">
                Contact number
              </label>
              <input
                type="tel"
                value={patientContact}
                onChange={(e) => setPatientContact(e.target.value)}
                className="w-full rounded-lg border border-sage-300 px-3 py-2 text-sage-900 focus:border-calm-500 focus:outline-none focus:ring-1 focus:ring-calm-500"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-sage-700">
                Session base amount ($)
              </label>
              <input
                type="number"
                min={0}
                value={baseAmount}
                onChange={(e) => setBaseAmount(Number(e.target.value))}
                className="w-full rounded-lg border border-sage-300 px-3 py-2 text-sage-900 focus:border-calm-500 focus:outline-none focus:ring-1 focus:ring-calm-500"
              />
            </div>
          </div>
          {selectedSlot && clinic && (
            <p className="mt-3 text-sm text-sage-600">
              Session: {selectedSlot.date} {selectedSlot.startTime} ·{" "}
              {clinic.address}
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={!selectedSlot || !patientName || !patientContact}
            className="btn-primary disabled:opacity-50"
          >
            Create booking (pending doctor approval)
          </button>
          <Link href="/receptionist/bookings" className="btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
