import type {
  User,
  Clinic,
  Doctor,
  TimeSlot,
  Booking,
  Payment,
} from "@/types";
import {
  addDays,
  format,
  setHours,
  setMinutes,
  addMinutes,
  startOfWeek,
  isWithinInterval,
} from "date-fns";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const mockClinics: Clinic[] = [
  {
    id: "c1",
    name: "MindCare Downtown",
    address: "123 Peace St, Downtown",
    doctorIds: ["d1", "d2"],
    receptionistIds: ["r1"],
  },
  {
    id: "c2",
    name: "Wellness Hub North",
    address: "456 Calm Ave, North District",
    doctorIds: ["d2", "d3"],
    receptionistIds: ["r2"],
  },
];

export const mockDoctors: Doctor[] = [
  {
    id: "d1",
    name: "Dr. Sarah Chen",
    email: "sarah.chen@clinic.com",
    clinicId: "c1",
    workingDays: [1, 2, 3, 4, 5],
    startTime: "09:00",
    endTime: "17:00",
    sessionDurationMinutes: 50,
    commissionType: "percentage",
    commissionValue: 30,
  },
  {
    id: "d2",
    name: "Dr. James Wilson",
    email: "james.wilson@clinic.com",
    clinicId: "c1",
    workingDays: [2, 3, 4, 5, 6],
    startTime: "10:00",
    endTime: "18:00",
    sessionDurationMinutes: 60,
    commissionType: "fixed",
    commissionValue: 45,
  },
  {
    id: "d3",
    name: "Dr. Emma Foster",
    email: "emma.foster@clinic.com",
    clinicId: "c2",
    workingDays: [1, 3, 5],
    startTime: "09:00",
    endTime: "15:00",
    sessionDurationMinutes: 50,
    commissionType: "percentage",
    commissionValue: 25,
  },
];

export const mockUsers: User[] = [
  {
    id: "a1",
    name: "Admin User",
    email: "admin@clinic.com",
    role: "admin",
    clinicIds: ["c1", "c2"],
  },
  {
    id: "r1",
    name: "Receptionist One",
    email: "reception@clinic.com",
    role: "receptionist",
    clinicIds: ["c1"],
  },
  {
    id: "r2",
    name: "Receptionist Two",
    email: "reception2@clinic.com",
    role: "receptionist",
    clinicIds: ["c2"],
  },
  {
    id: "d1",
    name: "Dr. Sarah Chen",
    email: "sarah.chen@clinic.com",
    role: "doctor",
    clinicIds: ["c1"],
    doctorId: "d1",
  },
  {
    id: "d2",
    name: "Dr. James Wilson",
    email: "james.wilson@clinic.com",
    role: "doctor",
    clinicIds: ["c1"],
    doctorId: "d2",
  },
  {
    id: "d3",
    name: "Dr. Emma Foster",
    email: "emma.foster@clinic.com",
    role: "doctor",
    clinicIds: ["c2"],
    doctorId: "d3",
  },
];

// In-memory mutable state (replace with API later)
let bookingsStore: Booking[] = [
  {
    id: "b1",
    slotId: "s1",
    doctorId: "d1",
    clinicId: "c1",
    patientName: "Alex Johnson",
    patientContact: "+1 555-0101",
    sessionTime: format(addDays(new Date(), 0), "yyyy-MM-dd") + " 09:00",
    clinicAddress: "123 Peace St, Downtown",
    status: "approved",
    createdAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    sessionStartTime: undefined,
    sessionEndTime: undefined,
    baseAmount: 120,
    paymentStatus: "unpaid",
    totalAmount: 120,
  },
  {
    id: "b2",
    slotId: "s2",
    doctorId: "d1",
    clinicId: "c1",
    patientName: "Maria Garcia",
    patientContact: "+1 555-0102",
    sessionTime: format(addDays(new Date(), 0), "yyyy-MM-dd") + " 10:00",
    clinicAddress: "123 Peace St, Downtown",
    status: "pending_approval",
    createdAt: new Date().toISOString(),
    baseAmount: 120,
    paymentStatus: "unpaid",
  },
  {
    id: "b3",
    slotId: "s3",
    doctorId: "d2",
    clinicId: "c1",
    patientName: "Chris Lee",
    patientContact: "+1 555-0103",
    sessionTime: format(addDays(new Date(), 1), "yyyy-MM-dd") + " 11:00",
    clinicAddress: "123 Peace St, Downtown",
    status: "approved",
    createdAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    baseAmount: 150,
    extraMinutes: 15,
    extraCharges: 30,
    totalAmount: 180,
    paymentStatus: "paid",
    paymentMode: "card",
  },
];

let paymentsStore: Payment[] = [
  {
    id: "p1",
    bookingId: "b3",
    amount: 180,
    mode: "card",
    paidAt: new Date().toISOString(),
    recordedBy: "r1",
  },
];

function generateSlotsForDate(doctor: Doctor, date: Date): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const day = date.getDay();
  if (!doctor.workingDays.includes(day)) return slots;

  const [startH, startM] = doctor.startTime.split(":").map(Number);
  const [endH, endM] = doctor.endTime.split(":").map(Number);
  let current = setMinutes(setHours(date, startH), startM);
  const end = setMinutes(setHours(date, endH), endM);
  const dateStr = format(date, "yyyy-MM-dd");
  let index = 0;

  while (current < end) {
    const slotEnd = addMinutes(current, doctor.sessionDurationMinutes);
    if (slotEnd > end) break;
    const slotId = `s-${doctor.id}-${dateStr}-${index}`;
    const booking = bookingsStore.find(
      (b) =>
        b.doctorId === doctor.id &&
        b.sessionTime.startsWith(dateStr) &&
        b.sessionTime.includes(format(current, "HH:mm"))
    );
    let status: TimeSlot["status"] = "free";
    if (booking) {
      if (booking.status === "pending_approval") status = "pending_approval";
      else if (booking.status === "approved" && !booking.sessionStartTime)
        status = "booked";
      else if (booking.sessionStartTime && !booking.sessionEndTime)
        status = "in_session";
      else if (booking.sessionEndTime) status = "completed";
    }
    slots.push({
      id: slotId,
      doctorId: doctor.id,
      clinicId: doctor.clinicId,
      date: dateStr,
      startTime: format(current, "HH:mm"),
      endTime: format(slotEnd, "HH:mm"),
      status,
      bookingId: booking?.id,
    });
    current = slotEnd;
    index++;
  }
  return slots;
}

export function getSlotsForClinic(
  clinicId: string,
  fromDate: Date,
  days: number
): TimeSlot[] {
  const doctors = mockDoctors.filter((d) => d.clinicId === clinicId);
  const all: TimeSlot[] = [];
  for (let i = 0; i < days; i++) {
    const d = addDays(fromDate, i);
    for (const doctor of doctors) {
      all.push(...generateSlotsForDate(doctor, d));
    }
  }
  return all.sort(
    (a, b) =>
      new Date(a.date + " " + a.startTime).getTime() -
      new Date(b.date + " " + b.startTime).getTime()
  );
}

export function getBookings(): Booking[] {
  return [...bookingsStore];
}

export function getBookingsForClinic(clinicId: string): Booking[] {
  return bookingsStore.filter((b) => b.clinicId === clinicId);
}

export function getBookingsForDoctor(doctorId: string): Booking[] {
  return bookingsStore.filter((b) => b.doctorId === doctorId);
}

export function addBooking(booking: Omit<Booking, "id" | "createdAt">): Booking {
  const newBooking: Booking = {
    ...booking,
    id: "b" + (bookingsStore.length + 1),
    createdAt: new Date().toISOString(),
  };
  bookingsStore.push(newBooking);
  return newBooking;
}

export function updateBooking(
  id: string,
  updates: Partial<Booking>
): Booking | null {
  const i = bookingsStore.findIndex((b) => b.id === id);
  if (i === -1) return null;
  bookingsStore[i] = { ...bookingsStore[i], ...updates };
  return bookingsStore[i];
}

export function approveBooking(id: string): Booking | null {
  return updateBooking(id, {
    status: "approved",
    approvedAt: new Date().toISOString(),
  });
}

export function rejectBooking(id: string): Booking | null {
  return updateBooking(id, {
    status: "rejected",
    rejectedAt: new Date().toISOString(),
  });
}

export function startSession(id: string): Booking | null {
  return updateBooking(id, {
    sessionStartTime: new Date().toISOString(),
  });
}

export function endSession(
  id: string,
  extraMinutes?: number,
  extraCharges?: number
): Booking | null {
  return updateBooking(id, {
    sessionEndTime: new Date().toISOString(),
    status: "completed",
    ...(extraMinutes != null && { extraMinutes }),
    ...(extraCharges != null && {
      extraCharges,
      totalAmount:
        (bookingsStore.find((b) => b.id === id)?.baseAmount ?? 0) + extraCharges,
    }),
  });
}

export function addPayment(payment: Omit<Payment, "id">): Payment {
  const newPayment: Payment = {
    ...payment,
    id: "p" + (paymentsStore.length + 1),
  };
  paymentsStore.push(newPayment);
  const booking = bookingsStore.find((b) => b.id === payment.bookingId);
  if (booking) {
    const totalPaid = paymentsStore
      .filter((p) => p.bookingId === payment.bookingId)
      .reduce((s, p) => s + p.amount, 0);
    const total = booking.totalAmount ?? booking.baseAmount;
    updateBooking(payment.bookingId, {
      paymentStatus:
        totalPaid >= total ? "paid" : totalPaid > 0 ? "partial" : "unpaid",
      paymentMode: payment.mode,
    });
  }
  return newPayment;
}

export function getPaymentsForBooking(bookingId: string): Payment[] {
  return paymentsStore.filter((p) => p.bookingId === bookingId);
}

export function getNextAvailableSlot(clinicId: string): TimeSlot | null {
  const from = new Date();
  const slots = getSlotsForClinic(clinicId, from, 14);
  return slots.find((s) => s.status === "free") ?? null;
}

export function getClinics(): Clinic[] {
  return [...mockClinics];
}

export function getDoctors(): Doctor[] {
  return [...mockDoctors];
}

export function getUsers(): User[] {
  return [...mockUsers];
}
