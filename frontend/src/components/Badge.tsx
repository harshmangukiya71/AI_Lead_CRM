import type { LeadStatus, LeadTemperature } from "../types/lead";

type BadgeProps = {
  children: LeadStatus | LeadTemperature | string;
};

export default function Badge({ children }: BadgeProps) {
  const value = String(children);
  const className =
    value === "Hot" || value === "Qualified"
      ? "bg-mint/10 text-mint"
      : value === "Warm" || value === "New"
        ? "bg-gold/20 text-amber-700"
        : "bg-coral/10 text-coral";

  return <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-bold ${className}`}>{value}</span>;
}
