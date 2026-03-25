import Navbar from "@/components/Navbar";
import ThreeBackground from "@/components/ThreeBackground";

const pharmacistImg = "https://media.istockphoto.com/id/1480000045/photo/pharmacy-black-man-and-woman-with-healthcare-medicine-and-conversation-for-instructions.webp?a=1&b=1&s=612x612&w=0&k=20&c=oHW3NwoZVLOjooFW-HagSpbeZ1cCFZ7lKPllsjgUa88=";
const teamImg = "https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&q=80&w=1280&h=720";

const values = [
  { icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z", title: "Trusted Network", desc: "Every pharmacy in our network is verified for quality and reliability." },
  { icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z", title: "Real-Time Data", desc: "Live stock updates so you never waste a trip to an out-of-stock pharmacy." },
  { icon: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z", title: "Location-First", desc: "Precision geolocation connects you to the closest pharmacies instantly." },
  { icon: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z", title: "Community Care", desc: "Built by healthcare professionals who understand patient needs." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background relative">
      <ThreeBackground />
      <Navbar />

      <div className="relative z-[1] pt-24 pb-20 px-5">
        <div className="max-w-5xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-16" style={{ animation: "mfFadeUp 0.8s ease both" }}>
            <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full border border-primary/25 bg-primary/5 mb-7">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" style={{ animation: "mfPulse 2s infinite" }} />
              <span className="font-display text-xs font-semibold tracking-wider uppercase text-muted-foreground">About Us</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-extrabold text-foreground leading-tight mb-4">
              Connecting Patients to <span className="gradient-text">Pharmacies</span>
            </h1>
            <div className="w-16 h-0.5 mx-auto mb-5" style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)" }} />
            <p className="font-body text-muted-foreground max-w-xl mx-auto leading-relaxed">
              We're on a mission to eliminate delays in accessing prescribed medications by bridging the gap between patients and pharmacies with real-time technology.
            </p>
          </div>

          {/* Image + text row */}
          <div className="grid md:grid-cols-2 gap-10 items-center mb-20" style={{ animation: "mfFadeUp 0.8s ease 0.15s both" }}>
            <div className="rounded-2xl overflow-hidden border border-white/[0.07]" style={{ boxShadow: "0 20px 60px rgba(79,142,247,0.08)" }}>
              <img src={pharmacistImg} alt="Professional pharmacist in modern pharmacy" width={1280} height={720} className="w-full h-auto object-cover" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">Our Story</h2>
              <p className="font-body text-muted-foreground leading-relaxed mb-4">
                Founded by healthcare professionals and technologists, MedFind was born from a simple frustration — too many patients driving from pharmacy to pharmacy only to find their medication out of stock.
              </p>
              <p className="font-body text-muted-foreground leading-relaxed">
                We built a platform that aggregates real-time inventory data from a growing network of verified pharmacies, overlays it onto an intelligent mapping system, and delivers instant answers to the question: <em className="text-primary">"Where can I get my medication right now?"</em>
              </p>
            </div>
          </div>

          {/* Team image */}
          <div className="rounded-2xl overflow-hidden border border-white/[0.07] mb-16 max-w-3xl mx-auto" style={{ animation: "mfFadeUp 0.8s ease 0.25s both", boxShadow: "0 20px 60px rgba(159,92,247,0.08)" }}>
            <img src={teamImg} alt="Team of pharmacists collaborating" width={1280} height={720} loading="lazy" className="w-full h-auto object-cover" />
          </div>

          {/* Values */}
          <div className="text-center mb-10" style={{ animation: "mfFadeUp 0.8s ease 0.3s both" }}>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">What We Stand For</h2>
            <p className="font-body text-muted-foreground text-sm">The principles that drive every feature we build.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5" style={{ animation: "mfFadeUp 0.8s ease 0.35s both" }}>
            {values.map((v, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 border border-white/[0.07] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1"
                style={{ background: "rgba(255,255,255,0.025)" }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: "rgba(79,142,247,0.1)" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="hsl(var(--primary))"><path d={v.icon} /></svg>
                </div>
                <h3 className="font-display text-sm font-bold text-foreground mb-2">{v.title}</h3>
                <p className="font-body text-xs text-muted-foreground leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
