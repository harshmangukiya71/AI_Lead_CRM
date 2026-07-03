import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarClock, Mail, Save, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Badge from "../components/Badge";
import { deleteLead, getLead, updateLead } from "../api/client";
import type { Lead, LeadStatus } from "../types/lead";

const formatInputDate = (date?: string | null) => (date ? new Date(date).toISOString().slice(0, 10) : "");

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [form, setForm] = useState({ status: "New" as LeadStatus, owner: "", notes: "", followUpDate: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    getLead(id)
      .then((data) => {
        setLead(data);
        setForm({
          status: data.status,
          owner: data.owner ?? "",
          notes: data.notes ?? "",
          followUpDate: formatInputDate(data.followUpDate)
        });
      })
      .catch(() => toast.error("Lead not found."))
      .finally(() => setIsLoading(false));
  }, [id]);

  const followUpEmail = useMemo(() => {
    if (!lead) return "";
    return `Subject: Next steps for your ${lead.industry ?? "project"} initiative

Hi ${lead.name},

Thanks again for sharing your goals around ${lead.projectDescription}. Based on what you submitted, the best next step is: ${lead.nextAction ?? "schedule a short discovery call"}.

Would you be open to a 20-minute conversation this week?

Best,
Sales Team`;
  }, [lead]);

  const handleSave = async () => {
    if (!id) return;
    setIsSaving(true);
    try {
      const updated = await updateLead(id, {
        status: form.status,
        owner: form.owner || null,
        notes: form.notes || null,
        followUpDate: form.followUpDate || null
      });
      setLead(updated);
      toast.success("Lead updated.");
    } catch (error) {
      toast.error("Could not save lead.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    const confirmed = window.confirm("Delete this lead permanently?");
    if (!confirmed) return;
    await deleteLead(id);
    toast.success("Lead deleted.");
    navigate("/dashboard");
  };

  if (isLoading) {
    return <div className="mx-auto max-w-5xl px-4 py-10 text-slate-500">Loading lead...</div>;
  }

  if (!lead) {
    return <div className="mx-auto max-w-5xl px-4 py-10 text-slate-500">Lead could not be loaded.</div>;
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-ink">
        <ArrowLeft size={17} />
        Back to dashboard
      </Link>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-6">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <h1 className="text-3xl font-bold text-ink">{lead.name}</h1>
                <p className="mt-2 text-slate-600">{lead.company || "No company"} · {lead.industry || "No industry"}</p>
              </div>
              <div className="flex gap-2">
                {lead.temperature && <Badge>{lead.temperature}</Badge>}
                <Badge>{lead.status}</Badge>
              </div>
            </div>

            <div className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <p className="font-semibold text-slate-500">Email</p>
                <p className="mt-1 text-ink">{lead.email}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-500">Phone</p>
                <p className="mt-1 text-ink">{lead.phone}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-500">Company Size</p>
                <p className="mt-1 text-ink">{lead.companySize || "-"}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-500">Budget</p>
                <p className="mt-1 text-ink">{lead.budget || "-"}</p>
              </div>
            </div>

            <div className="mt-6">
              <p className="font-semibold text-slate-500">Project Description</p>
              <p className="mt-2 rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-700">{lead.projectDescription}</p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-ink">AI qualification</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="rounded-md bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-500">Lead Score</p>
                <p className="mt-2 text-3xl font-bold text-ink">{lead.leadScore ?? "-"}</p>
              </div>
              <div className="rounded-md bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-500">Confidence</p>
                <p className="mt-2 text-3xl font-bold text-ink">{lead.confidence ?? "-"}%</p>
              </div>
              <div className="rounded-md bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-500">Temperature</p>
                <p className="mt-3">{lead.temperature ? <Badge>{lead.temperature}</Badge> : "-"}</p>
              </div>
            </div>
            <div className="mt-5 grid gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-500">Reasoning</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{lead.reasoning || "No reasoning available."}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">Next Action</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{lead.nextAction || "No next action available."}</p>
              </div>
            </div>
          </div>
        </div>

        <aside className="grid content-start gap-6">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-ink">Edit CRM fields</h2>
            <div className="mt-4 grid gap-4">
              <div>
                <label className="label" htmlFor="status">
                  Status
                </label>
                <select id="status" className="field mt-1" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as LeadStatus })}>
                  <option value="New">New</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>
              <div>
                <label className="label" htmlFor="owner">
                  Owner
                </label>
                <input id="owner" className="field mt-1" value={form.owner} onChange={(event) => setForm({ ...form, owner: event.target.value })} />
              </div>
              <div>
                <label className="label" htmlFor="followUpDate">
                  Follow-up Date
                </label>
                <input
                  id="followUpDate"
                  type="date"
                  className="field mt-1"
                  value={form.followUpDate}
                  onChange={(event) => setForm({ ...form, followUpDate: event.target.value })}
                />
              </div>
              <div>
                <label className="label" htmlFor="notes">
                  Notes
                </label>
                <textarea id="notes" className="field mt-1 min-h-28" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
              </div>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-mint px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-60"
              >
                <Save size={17} />
                {isSaving ? "Saving..." : "Save changes"}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-coral px-4 py-2.5 text-sm font-bold text-coral hover:bg-coral/10"
              >
                <Trash2 size={17} />
                Delete lead
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
              <Mail size={18} />
              Follow-up email
            </h2>
            <textarea className="field mt-4 min-h-56 text-xs leading-5" readOnly value={followUpEmail} />
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
              <CalendarClock size={18} />
              Timeline
            </h2>
            <div className="mt-4 grid gap-4 text-sm">
              <div className="border-l-2 border-mint pl-3">
                <p className="font-semibold text-ink">Lead created</p>
                <p className="text-slate-500">{new Date(lead.createdAt).toLocaleString()}</p>
              </div>
              <div className="border-l-2 border-gold pl-3">
                <p className="font-semibold text-ink">Last updated</p>
                <p className="text-slate-500">{new Date(lead.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
