import { Link } from "react-router-dom";
import { ArrowRight, Brain, MailCheck, ShieldCheck } from "lucide-react";
import LeadForm from "../components/LeadForm";

export default function LandingPage() {
  return (
    <div className="bg-slate-50">
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-14">
        <div className="flex flex-col justify-center">
          <p className="text-sm font-bold uppercase tracking-wide text-mint">AI-powered lead operations</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight text-ink sm:text-5xl">Capture, qualify, and respond to leads in one flow.</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
            A production-ready MVP for collecting prospects, scoring them with AI, managing CRM updates, and sending instant email acknowledgement.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-md bg-mint px-4 py-2.5 text-sm font-bold text-white transition hover:bg-teal-700"
            >
              Open CRM
              <ArrowRight size={17} />
            </Link>
          </div>
          <div className="mt-8 grid gap-3 text-sm text-slate-700 sm:grid-cols-3">
            <div className="flex items-center gap-2">
              <Brain className="text-mint" size={18} /> AI scoring
            </div>
            <div className="flex items-center gap-2">
              <MailCheck className="text-mint" size={18} /> Auto email
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-mint" size={18} /> Validated data
            </div>
          </div>
        </div>
        <LeadForm />
      </section>
    </div>
  );
}
