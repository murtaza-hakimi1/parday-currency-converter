import {
  ArrowLeftRight,
  BellRing,
  ChartNoAxesCombined,
  CircleDollarSign,
  History,
  Moon,
  Sun,
} from "lucide-react";

interface HeaderProps {
  dark: boolean;
  onToggleTheme: () => void;
  active: string;
  onNavigate: (section: string) => void;
  alertCount: number;
}

const navItems = [
  { id: "converter", label: "Converter", icon: CircleDollarSign },
  { id: "history", label: "History", icon: History },
  { id: "charts", label: "Market trends", icon: ChartNoAxesCombined },
  { id: "alerts", label: "Rate alerts", icon: BellRing },
];

export default function Header({
  dark,
  onToggleTheme,
  active,
  onNavigate,
  alertCount,
}: HeaderProps) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <button
          className="brand"
          onClick={() => onNavigate("converter")}
          aria-label="Parday Exchange home"
        >
          <span className="brand-mark">
            <ArrowLeftRight size={21} />
          </span>
          <span className="brand-copy">
            <strong>
              Parday<span>Exchange</span>
            </strong>
            <small>Currency tools, made clear</small>
          </span>
        </button>
        <nav className="main-nav" aria-label="Main navigation">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-link ${active === id ? "active" : ""}`}
              onClick={() => onNavigate(id)}
            >
              <Icon size={16} /> <span>{label}</span>
              {id === "alerts" && alertCount > 0 && (
                <span className="nav-count">{alertCount}</span>
              )}
            </button>
          ))}
        </nav>
        <button
          className="icon-button theme-button"
          onClick={onToggleTheme}
          aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
          title="Toggle theme"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
