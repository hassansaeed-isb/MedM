"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  getBookingsForDoctor,
  startSession,
  endSession,
  getClinics,
} from "@/data/mock";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Play, Square } from "lucide-react";

export default function SessionsPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const doctorId = user?.doctorId ?? user?.id ?? "";
  const focusedId = searchParams.get("id");

  const bookings = getBookingsForDoctor(doctorId).filter(
    (b) => b.status === "approved" || b.status === "completed"
  );
  const upcoming = bookings
    .filter(
      (b) =>
        b.status === "approved" &&
        !b.sessionStartTime &&
        new Date(b.sessionTime) >= new Date()
    )
    .sort(
      (a, b) =>
        new Date(a.sessionTime).getTime() - new Date(b.sessionTime).getTime()
    );
  const inProgress = bookings.filter(
    (b) => b.sessionStartTime && !b.sessionEndTime
  );
  const completed = bookings
    .filter((b) => b.sessionEndTime)
    .sort(
      (a, b) =>
        new Date(b.sessionTime).getTime() - new Date(a.sessionTime).getTime()
    )
    .slice(0, 10);

  const [extraMinutes, setExtraMinutes] = useState(0);
  const [extraCharges, setExtraCharges] = useState(0);

  const handleStart = (bookingId: string) => {
    startSession(bookingId);
    router.refresh();
  };

  const handleEnd = (bookingId: string) => {
    const b = bookings.find((x) => x.id === bookingId);
    if (!b) return;
    endSession(bookingId, extraMinutes, extraCharges);
    setExtraMinutes(0);
    setExtraCharges(0);
    router.refresh();
  };

  const clinics = getClinics();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-sage-800">Sessions</h1>
        <p className="text-sage-600">Start and end sessions, track extra time</p>
      </div>

      {inProgress.length > 0 && (
        <div className="card p-6">
          <h2 className="mb-4 font-semibold text-sage-800">In progress</h2>
          {inProgress.map((b) => {
            const clinic = clinics.find((c) => c.id === b.clinicId);
            const isFocused = b.id === focusedId;
            return (
              <div
                key={b.id}
                className={`rounded-lg border p-4 ${
                  isFocused ? "border-calm-500 bg-calm-50/50" : "border-sage-200"
                }`}
              >
                <p className="font-medium text-sage-800">{b.patientName}</p>
                <p className="text-sm text-sage-600">
                  Started: {b.sessionStartTime ? new Date(b.sessionStartTime).toLocaleString() : "—"}
                </p>
                <p className="text-sm text-sage-600">{clinic?.name}</p>
                <div className="mt-4 flex flex-wrap items-end gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-sage-600">
                      Extra minutes
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={extraMinutes}
                      onChange={(e) => setExtraMinutes(Number(e.target.value))}
                      className="w-24 rounded border border-sage-300 px-2 py-1 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-sage-600">
                      Extra charges ($)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={extraCharges}
                      onChange={(e) => setExtraCharges(Number(e.target.value))}
                      className="w-24 rounded border border-sage-300 px-2 py-1 text-sm"
                    />
                  </div>
                  <button
                    onClick={() => handleEnd(b.id)}
                    className="btn-primary inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700"
                  >
                    <Square className="h-4 w-4" />
                    End session
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="card p-6">
        <h2 className="mb-4 font-semibold text-sage-800">Upcoming</h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-sage-500">No upcoming sessions.</p>
        ) : (
          <div className="space-y-2">
            {upcoming.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between rounded-lg border border-sage-200 p-3"
              >
                <div>
                  <p className="font-medium text-sage-800">{b.patientName}</p>
                  <p className="text-sm text-sage-600">{b.sessionTime}</p>
                </div>
                <button
                  onClick={() => handleStart(b.id)}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Start session
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card p-6">
        <h2 className="mb-4 font-semibold text-sage-800">Recent completed</h2>
        {completed.length === 0 ? (
          <p className="text-sm text-sage-500">No completed sessions yet.</p>
        ) : (
          <ul className="space-y-2 text-sm text-sage-700">
            {completed.map((b) => (
              <li key={b.id} className="flex justify-between border-b border-sage-100 py-2">
                <span>{b.patientName} · {b.sessionTime}</span>
                <span>
                  {b.extraMinutes ? `+${b.extraMinutes} min` : ""}{" "}
                  {b.extraCharges ? `+$${b.extraCharges}` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
