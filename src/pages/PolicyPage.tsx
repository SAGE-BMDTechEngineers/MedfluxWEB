import Navbar from "@/components/Navbar";
import ThreeBackground from "@/components/ThreeBackground";

const policyImg = "https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&q=80&w=1280&h=720";

const sections = [
  {
    title: "Privacy Policy",
    items: [
      "We collect only essential information needed to provide medication search results, including your approximate location when you grant permission.",
      "Your search history is not stored on our servers and remains private to your device session.",
      "We do not sell, trade, or share your personal data with third parties for marketing purposes.",
      "Location data is used solely to identify nearby pharmacies and is never retained after your session ends.",
    ],
  },
  {
    title: "Terms of Use",
    items: [
      "MedFind is an information platform — we do not sell medications directly. All purchases are made through independent pharmacies.",
      "Medication availability shown is based on real-time data from pharmacy partners but may occasionally differ from actual stock.",
      "Pricing displayed is provided by pharmacies and may vary. Always confirm final pricing at the pharmacy.",
      "Users must be 18 years or older to use this platform. Medication information is not a substitute for professional medical advice.",
    ],
  },
  {
    title: "Data & Security",
    items: [
      "All data transmissions are encrypted using industry-standard TLS/SSL protocols.",
      "We conduct regular security audits to protect against unauthorized access to our systems.",
      "Pharmacy partner data is verified and updated in real-time to ensure accuracy and reliability.",
      "You can request deletion of any personal data by contacting our support team.",
    ],
  },
  {
    title: "Pharmacy Partners",
    items: [
      "All pharmacies in our network undergo a verification process to ensure licensing and compliance.",
      "Pharmacies are responsible for maintaining accurate inventory and pricing information on our platform.",
      "We reserve the right to remove any pharmacy that consistently provides inaccurate information.",
      "Partner pharmacies agree to uphold fair pricing practices and professional service standards.",
    ],
  },
];

export default function PolicyPage() {
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
              <span className="font-display text-xs font-semibold tracking-wider uppercase text-muted-foreground">Legal</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-extrabold text-foreground leading-tight mb-4">
              Our <span className="gradient-text">Policies</span>
            </h1>
            <div className="w-16 h-0.5 mx-auto mb-5" style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)" }} />
            <p className="font-body text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Transparency and trust are at the core of everything we do. Read our policies below.
            </p>
          </div>

          {/* Image */}
          <div
            className="rounded-2xl overflow-hidden border border-white/[0.07] mb-14 max-w-3xl mx-auto"
            style={{ animation: "mfFadeUp 0.8s ease 0.15s both", boxShadow: "0 20px 60px rgba(79,142,247,0.08)" }}
          >
            <img src={policyImg} alt="Pharmacist consulting with patient" width={1280} height={720} className="w-full h-auto object-cover" />
          </div>

          {/* Policy sections */}
          <div className="space-y-8" style={{ animation: "mfFadeUp 0.8s ease 0.25s both" }}>
            {sections.map((section, i) => (
              <div
                key={i}
                className="rounded-2xl p-7 border border-white/[0.07] backdrop-blur-xl"
                style={{ background: "rgba(255,255,255,0.025)" }}
              >
                <h2 className="font-display text-lg font-bold text-foreground mb-5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(79,142,247,0.1)" }}>
                    <span className="text-primary font-bold text-sm">{i + 1}</span>
                  </div>
                  {section.title}
                </h2>
                <ul className="space-y-3">
                  {section.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                      <p className="font-body text-sm text-muted-foreground leading-relaxed">{item}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Last updated */}
          <p className="font-body text-xs text-muted-foreground/50 text-center mt-10">
            Last updated: March 2026
          </p>
        </div>
      </div>
    </div>
  );
}
