"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  getBookingsForDoctor,
  approveBooking,
  rejectBooking,
  getClinics,
} from "@/data/mock";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, X } from "lucide-react";

export default function ApprovalsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const doctorId = user?.doctorId ?? user?.id;
  const pending = getBookingsForDoctor(doctorId).filter(
    (b) => b.status === "pending_approval"
  );
  const clinics = getClinics();

  const [processing, setProcessing] = useState<string | null>(null);

  const handleApprove = (id: string) => {
    setProcessing(id);
    approveBooking(id);
    setProcessing(null);
    router.refresh();
  };
  const handleReject = (id: string) => {
    setProcessing(id);
    rejectBooking(id);
    setProcessing(null);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-sage-800">Approvals</h1>
        <p className="text-sage-600">Approve or reject booking requests</p>
      </div>

      <div className="space-y-4">
        {pending.length === 0 ? (
          <div className="card p-8 text-center text-sage-500">
            No pending approval requests.
          </div>
        ) : (
          pending.map((b) => {
            const clinic = clinics.find((c) => c.id === b.clinicId);
            return (
              <div key={b.id} className="card p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold text-sage-800">{b.patientName}</p>
                    <p className="text-sm text-sage-600">{b.patientContact}</p>
                    <p className="mt-1 text-sage-700">
                      Session: {b.sessionTime}
                    </p>
                    <p className="text-sm text-sage-500">
                      {clinic?.name} · {b.clinicAddress}
                    </p>
                    <p className="mt-2 text-sm text-sage-600">
                      Base amount: ${b.baseAmount}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(b.id)}
                      disabled={processing === b.id}
                      className="btn-primary inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                    >
                      <Check className="h-4 w-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(b.id)}
                      disabled={processing === b.id}
                      className="btn-secondary inline-flex items-center gap-2 border-red-200 text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
