import { Link, NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Sparkles } from "lucide-react";

const navClass = ({ isActive }: { isActive: boolean }) =>
  `inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition ${
    isActive ? "bg-ink text-white" : "text-slate-700 hover:bg-slate-200"
  }`;

export default function App() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 text-base font-bold text-ink">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-mint text-white">
              <Sparkles size={18} />
            </span>
            AI Lead CRM
          </Link>
          <nav className="flex items-center gap-2">
            <NavLink to="/" className={navClass}>
              Capture
            </NavLink>
            <NavLink to="/dashboard" className={navClass}>
              <LayoutDashboard size={16} />
              CRM
            </NavLink>
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
