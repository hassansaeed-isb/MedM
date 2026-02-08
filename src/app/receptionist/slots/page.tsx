"use client";

import { useAuth } from "@/contexts/AuthContext";
import { getSlotsForClinic, getClinics, getDoctors } from "@/data/mock";
import { useSearchParams } from "next/navigation";
import { useState, useMemo } from "react";
import { addDays, format } from "date-fns";
import { SlotStatusBadge } from "@/components/SlotStatusBadge";

export default function SlotsPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const clinicIds = user?.clinicIds ?? [];
  const clinics = getClinics().filter((c) => clinicIds.includes(c.id));
  const doctors = getDoctors();

  const [clinicId, setClinicId] = useState(
    searchParams.get("clinic") ?? clinicIds[0] ?? ""
  );
  const [startDate, setStartDate] = useState(new Date());
  const days = 14;

  const slots = useMemo(
    () =>
      clinicId
        ? getSlotsForClinic(clinicId, startDate, days).sort(
            (a, b) =>
              new Date(a.date + " " + a.startTime).getTime() -
              new Date(b.date + " " + b.startTime).getTime()
          )
        : [],
    [clinicId, startDate]
  );

  const nextFree = useMemo(
    () => slots.find((s) => s.status === "free"),
    [slots]
  );

  const byDate = useMemo(() => {
    const map: Record<string, typeof slots> = {};
    for (const s of slots) {
      if (!map[s.date]) map[s.date] = [];
      map[s.date].push(s);
    }
    return map;
  }, [slots]);

  const clinic = clinics.find((c) => c.id === clinicId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-sage-800">Slots</h1>
        <p className="text-sage-600">View all doctor slots and availability</p>
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-sage-700">
              Clinic
            </label>
            <select
              value={clinicId}
              onChange={(e) => setClinicId(e.target.value)}
              className="rounded-lg border border-sage-300 px-3 py-2 text-sage-900 focus:border-calm-500 focus:outline-none focus:ring-1 focus:ring-calm-500"
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
              From date
            </label>
            <input
              type="date"
              value={format(startDate, "yyyy-MM-dd")}
              onChange={(e) => setStartDate(new Date(e.target.value))}
              className="rounded-lg border border-sage-300 px-3 py-2 text-sage-900 focus:border-calm-500 focus:outline-none focus:ring-1 focus:ring-calm-500"
            />
          </div>
          {nextFree && (
            <p className="self-end text-sm text-calm-600">
              Next available: <strong>{nextFree.date} {nextFree.startTime}</strong>
            </p>
          )}
        </div>
      </div>

      {!clinicId ? (
        <p className="text-sage-500">Select a clinic to view slots.</p>
      ) : (
        <div className="space-y-6">
          {Object.entries(byDate)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, daySlots]) => (
              <div key={date} className="card overflow-hidden">
                <div className="border-b border-sage-200 bg-sage-50/70 px-4 py-2">
                  <h2 className="font-medium text-sage-800">
                    {format(new Date(date + "T12:00:00"), "EEEE, MMM d, yyyy")}
                  </h2>
                </div>
                <div className="grid gap-2 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {daySlots.map((slot) => {
                    const doc = doctors.find((d) => d.id === slot.doctorId);
                    const isNext = nextFree?.id === slot.id;
                    return (
                      <div
                        key={slot.id}
                        className={`flex items-center justify-between rounded-lg border p-3 ${
                          isNext ? "border-calm-300 bg-calm-50/50" : "border-sage-200 bg-white"
                        }`}
                      >
                        <div>
                          <p className="font-medium text-sage-800">
                            {slot.startTime} – {slot.endTime}
                          </p>
                          <p className="text-sm text-sage-500">{doc?.name}</p>
                        </div>
                        <SlotStatusBadge status={slot.status} />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
