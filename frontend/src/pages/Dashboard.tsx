import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Award, Circle, Search, Target, Users } from "lucide-react";
import toast from "react-hot-toast";
import Badge from "../components/Badge";
import StatCard from "../components/StatCard";
import { getDashboard, getLeads } from "../api/client";
import type { DashboardStats, Lead, LeadStatus } from "../types/lead";

const statusOptions: Array<LeadStatus | ""> = ["", "New", "Qualified", "Lost"];

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(date));

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<LeadStatus | "">("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(async () => {
      try {
        setIsLoading(true);
        const [leadData, dashboardData] = await Promise.all([getLeads({ search, status }), getDashboard()]);
        setLeads(leadData);
        setStats(dashboardData);
      } catch (error) {
        toast.error("Could not load dashboard data.");
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [search, status]);

  const maxTemperatureCount = useMemo(() => Math.max(1, ...(stats?.temperatures.map((item) => item.count) ?? [1])), [stats]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-mint">CRM Dashboard</p>
          <h1 className="mt-2 text-3xl font-bold text-ink">Lead pipeline</h1>
        </div>
        <Link to="/" className="inline-flex items-center justify-center rounded-md bg-ink px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800">
          Add lead
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Leads" value={stats?.totalLeads ?? 0} icon={Users} tone="ink" />
        <StatCard label="New Leads" value={stats?.newLeads ?? 0} icon={Circle} tone="gold" />
        <StatCard label="Qualified Leads" value={stats?.qualifiedLeads ?? 0} icon={Award} tone="mint" />
        <StatCard label="Lost Leads" value={stats?.lostLeads ?? 0} icon={Target} tone="coral" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input className="field pl-10" placeholder="Search name, email, company, industry" value={search} onChange={(event) => setSearch(event.target.value)} />
            </div>
            <select className="field sm:w-44" value={status} onChange={(event) => setStatus(event.target.value as LeadStatus | "")}>
              {statusOptions.map((item) => (
                <option key={item || "all"} value={item}>
                  {item || "All statuses"}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Industry</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Temperature</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created Date</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-slate-500" colSpan={8}>
                      Loading leads...
                    </td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-slate-500" colSpan={8}>
                      No leads found.
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-ink">{lead.name}</td>
                      <td className="px-4 py-3 text-slate-600">{lead.company || "-"}</td>
                      <td className="px-4 py-3 text-slate-600">{lead.industry || "-"}</td>
                      <td className="px-4 py-3 font-bold text-ink">{lead.leadScore ?? "-"}</td>
                      <td className="px-4 py-3">{lead.temperature ? <Badge>{lead.temperature}</Badge> : "-"}</td>
                      <td className="px-4 py-3">
                        <Badge>{lead.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(lead.createdAt)}</td>
                      <td className="px-4 py-3">
                        <Link className="font-bold text-mint hover:text-teal-700" to={`/leads/${lead.id}`}>
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="grid gap-6">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-ink">Temperature mix</h2>
            <div className="mt-4 grid gap-3">
              {(stats?.temperatures ?? []).map((item) => (
                <div key={item.temperature}>
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-slate-700">{item.temperature}</span>
                    <span className="text-slate-500">{item.count}</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-mint" style={{ width: `${(item.count / maxTemperatureCount) * 100}%` }} />
                  </div>
                </div>
              ))}
              {stats?.temperatures.length === 0 && <p className="text-sm text-slate-500">No AI-qualified leads yet.</p>}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-ink">Activity timeline</h2>
            <div className="mt-4 grid gap-4">
              {(stats?.recentLeads ?? []).map((lead) => (
                <div key={lead.id} className="border-l-2 border-mint pl-3">
                  <p className="text-sm font-semibold text-ink">{lead.name} submitted a lead</p>
                  <p className="text-xs text-slate-500">{formatDate(lead.createdAt)}</p>
                </div>
              ))}
              {stats?.recentLeads.length === 0 && <p className="text-sm text-slate-500">Activity will appear after lead capture.</p>}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
