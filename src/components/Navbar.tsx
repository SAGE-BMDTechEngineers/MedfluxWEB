import { Link, useLocation } from "react-router-dom";
import { BookOpen } from "lucide-react";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/policy", label: "Policy" },
];

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl"
      style={{
        background: "rgba(2,8,22,0.75)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="Medflux Logo" className="h-6 w-auto" />
        </Link>

        <div className="flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="font-body text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200"
              style={{
                color: pathname === link.to ? "hsl(var(--primary))" : "rgba(255,255,255,0.5)",
                background: pathname === link.to ? "rgba(79,142,247,0.1)" : "transparent",
              }}
            >
              {link.label}
            </Link>
          ))}

          <Link
            to="/delete-account"
            className="flex items-center gap-1.5 font-body text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200"
            style={{
              color: pathname === "/delete-account" ? "hsl(var(--primary))" : "rgba(255,255,255,0.5)",
              background: pathname === "/delete-account" ? "rgba(79,142,247,0.1)" : "transparent",
            }}
            aria-label="Guide"
            title="Guide"
          >
            <BookOpen size={16} />
            <span className="hidden sm:inline">Guide</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
