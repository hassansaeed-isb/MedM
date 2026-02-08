import type { SlotStatus } from "@/types";

const statusConfig: Record<
  SlotStatus,
  { label: string; className: string }
> = {
  free: { label: "Free", className: "bg-emerald-100 text-emerald-800" },
  pending_approval: {
    label: "Pending",
    className: "bg-amber-100 text-amber-800",
  },
  booked: { label: "Booked", className: "bg-blue-100 text-blue-800" },
  in_session: { label: "In Session", className: "bg-violet-100 text-violet-800" },
  completed: { label: "Completed", className: "bg-sage-200 text-sage-700" },
};

export function SlotStatusBadge({ status }: { status: SlotStatus }) {
  const { label, className } = statusConfig[status];
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}
