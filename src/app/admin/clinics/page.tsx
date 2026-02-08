"use client";

import { useAuth } from "@/contexts/AuthContext";
import { getClinics, getDoctors } from "@/data/mock";
import { Building2, MapPin, Users } from "lucide-react";

export default function ClinicsPage() {
  const { user } = useAuth();
  const clinicIds = user?.clinicIds ?? [];
  const clinics = getClinics().filter((c) => clinicIds.includes(c.id));
  const doctors = getDoctors();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-sage-800">Clinics</h1>
        <p className="text-sage-600">View and manage clinics</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {clinics.map((c) => {
          const clinicDoctors = doctors.filter((d) => d.clinicId === c.id);
          return (
            <div key={c.id} className="card overflow-hidden">
              <div className="border-b border-sage-200 bg-sage-50/50 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-calm-100 p-2">
                    <Building2 className="h-5 w-5 text-calm-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-sage-800">{c.name}</h2>
                    <div className="flex items-center gap-1 text-sm text-sage-500">
                      <MapPin className="h-3.5 w-3.5" />
                      {c.address}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <p className="mb-2 text-sm font-medium text-sage-600">
                  Doctors ({clinicDoctors.length})
                </p>
                <ul className="space-y-1 text-sm text-sage-700">
                  {clinicDoctors.map((d) => (
                    <li key={d.id} className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-sage-400" />
                      {d.name}
                      <span className="text-sage-500">
                        · {d.workingDays.length} days · {d.startTime}–{d.endTime}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
