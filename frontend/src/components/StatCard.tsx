import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: "mint" | "gold" | "coral" | "ink";
};

const toneClass = {
  mint: "bg-mint/10 text-mint",
  gold: "bg-gold/20 text-amber-700",
  coral: "bg-coral/10 text-coral",
  ink: "bg-ink/10 text-ink"
};

export default function StatCard({ label, value, icon: Icon, tone }: StatCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-ink">{value}</p>
        </div>
        <div className={`grid h-11 w-11 place-items-center rounded-md ${toneClass[tone]}`}>
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}
