import Navbar from "@/components/Navbar";
import ThreeBackground from "@/components/ThreeBackground";
import { ShieldCheck, UserX, Lock, AlertTriangle, CheckCircle } from "lucide-react";

const steps = [
  { icon: <UserX size={20} />, title: "Navigate to Account Settings", desc: "Open the app and tap on your profile icon, then select 'Account Settings' from the menu." },
  { icon: <AlertTriangle size={20} />, title: "Select 'Delete My Account'", desc: "Scroll to the bottom of the settings page and tap the 'Delete My Account' option highlighted in red." },
  { icon: <Lock size={20} />, title: "Verify Your Identity", desc: "Enter your password or confirm via OTP sent to your registered email or phone number for security." },
  { icon: <CheckCircle size={20} />, title: "Confirm Deletion", desc: "Review the summary of what will be removed, then tap 'Confirm Delete' to permanently remove your account." },
];

const confidentialItems = [
  "Your email address and phone number are encrypted at rest and never shared with third parties.",
  "Search history and medication queries are session-based and not stored on our servers.",
  "Location data is used only during active sessions and permanently discarded afterward.",
  "Payment information, if any, is handled by certified PCI-compliant processors — we never store card details.",
  "Upon account deletion, all personal data is permanently erased within 30 days from our systems.",
];

export default function DeleteAccountPage() {
  return (
    <div className="min-h-screen bg-background relative">
      <ThreeBackground />
      <Navbar />

      <div className="relative z-[1] pt-24 pb-20 px-5">
        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-14" style={{ animation: "mfFadeUp 0.8s ease both" }}>
            <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full border border-primary/25 bg-primary/5 mb-7">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" style={{ animation: "mfPulse 2s infinite" }} />
              <span className="font-display text-xs font-semibold tracking-wider uppercase text-muted-foreground">Account Guide</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-extrabold text-foreground leading-tight mb-4">
              Delete My <span className="gradient-text">Account</span>
            </h1>
            <div className="w-16 h-0.5 mx-auto mb-5" style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)" }} />
            <p className="font-body text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Follow the steps below to permanently delete your account. Your data and credentials are always kept confidential.
            </p>
          </div>

          {/* Steps */}
          <div className="mb-16" style={{ animation: "mfFadeUp 0.8s ease 0.15s both" }}>
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">How to Delete Your Account</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {steps.map((step, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-6 border border-white/[0.07] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1"
                  style={{ background: "rgba(255,255,255,0.025)" }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(79,142,247,0.1)" }}>
                      <span className="text-primary">{step.icon}</span>
                    </div>
                    <span className="font-display text-xs font-bold text-muted-foreground tracking-wider uppercase">Step {i + 1}</span>
                  </div>
                  <h3 className="font-display text-sm font-bold text-foreground mb-2">{step.title}</h3>
                  <p className="font-body text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Confidentiality */}
          <div
            className="rounded-2xl p-7 border border-white/[0.07] backdrop-blur-xl mb-10"
            style={{ background: "rgba(255,255,255,0.025)", animation: "mfFadeUp 0.8s ease 0.25s both" }}
          >
            <h2 className="font-display text-lg font-bold text-foreground mb-5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(79,142,247,0.1)" }}>
                <ShieldCheck size={18} className="text-primary" />
              </div>
              Your Credentials Are Confidential
            </h2>
            <p className="font-body text-sm text-muted-foreground leading-relaxed mb-5">
              At Medflux, protecting your privacy is our highest priority. Here's how we safeguard your information:
            </p>
            <ul className="space-y-3">
              {confidentialItems.map((item, j) => (
                <li key={j} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">{item}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Note */}
          <div
            className="rounded-2xl p-6 border border-destructive/20 backdrop-blur-xl text-center"
            style={{ background: "rgba(239,68,68,0.04)", animation: "mfFadeUp 0.8s ease 0.35s both" }}
          >
            <AlertTriangle size={24} className="text-destructive mx-auto mb-3" />
            <p className="font-display text-sm font-bold text-foreground mb-1">This action is irreversible</p>
            <p className="font-body text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
              Once your account is deleted, all associated data will be permanently removed and cannot be recovered. Please ensure you no longer need access before proceeding.
            </p>
          </div>

          <p className="font-body text-xs text-muted-foreground/50 text-center mt-10">
            Need help? Contact our support team at support@Medflux.com
          </p>
        </div>
      </div>
    </div>
  );
}
