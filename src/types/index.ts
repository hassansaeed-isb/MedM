export type UserRole = "admin" | "receptionist" | "doctor";

export type SlotStatus =
  | "free"
  | "pending_approval"
  | "booked"
  | "in_session"
  | "completed";

export type PaymentMode = "cash" | "card" | "other";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  clinicIds: string[];
  doctorId?: string; // when role is doctor
}

export interface Clinic {
  id: string;
  name: string;
  address: string;
  doctorIds: string[];
  receptionistIds: string[];
}

export interface Doctor {
  id: string;
  name: string;
  email: string;
  clinicId: string;
  workingDays: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  startTime: string; // "09:00"
  endTime: string;   // "17:00"
  sessionDurationMinutes: number;
  commissionType: "fixed" | "percentage";
  commissionValue: number;
}

export interface TimeSlot {
  id: string;
  doctorId: string;
  clinicId: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  status: SlotStatus;
  bookingId?: string;
}

export interface Booking {
  id: string;
  slotId: string;
  doctorId: string;
  clinicId: string;
  patientName: string;
  patientContact: string;
  sessionTime: string;
  clinicAddress: string;
  status: "pending_approval" | "approved" | "rejected" | "completed";
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  sessionStartTime?: string;
  sessionEndTime?: string;
  extraMinutes?: number;
  baseAmount: number;
  extraCharges?: number;
  totalAmount?: number;
  paymentStatus: "unpaid" | "partial" | "paid";
  paymentMode?: PaymentMode;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  mode: PaymentMode;
  paidAt: string;
  recordedBy: string;
}

export type ReportPeriod = "daily" | "weekly" | "monthly";
