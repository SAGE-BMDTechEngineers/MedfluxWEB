import { Blog } from "@/types/blog";

/* ─────────────────────────────────────────────────────────────
   Enhanced blogData  –  cinematic dark-cosmos suite
   Extended fields power the SingleBlog / Blog / RelatedPost
   components: slug, excerpt, readTime, accent, category, featured.
   The original Blog type fields are fully preserved.
   ───────────────────────────────────────────────────────────── */

const blogData: Blog[] = [
  /* ── 01 ── Featured post ─────────────────────────────────── */
  {
    id: 1,
    title: "How Geolocation is Revolutionizing Pharmacy Access",
    paragraph:
      "Discover how geolocation technology helps locate pharmacies and ensures timely access to essential medicines across urban and rural communities.",
    image: "/images/blog/blog1.jpg",
    author: {
      name: "Mr. Evaliz",
      image: "/images/blog/blog1.jpg",
      designation: "Technology Expert",
    },
    tags: ["Geolocation", "Technology"],
    publishDate: "Mar 18, 2025",

    /* ── Extended cinematic fields ── */
    // @ts-ignore – augmented fields not in base Blog type
    slug: "geolocation-revolutionizing-pharmacy-access",
    excerpt:
      "Real-time GPS mapping is changing how patients find medications, cutting average search time from hours to under two minutes across urban and rural areas. Pharmacies adopting geo-aware platforms report a 40 % increase in foot traffic.",
    readTime: "5 min read",
    category: "Geolocation Tech",
    accent: "#4f8ef7",
    featured: true,
  },

  /* ── 02 ─────────────────────────────────────────────────── */
  {
    id: 2,
    title: "Top 5 Ways to Enhance Patient Support with Technology",
    paragraph:
      "Learn how pharmacies are leveraging technology to improve patient care and provide better support services.",
    image: "/images/blog/blog2.jpg",
    author: {
      name: "Raydos",
      image: "/images/blog/blog2.jpg",
      designation: "Health Writer",
    },
    tags: ["Healthcare", "Pharmacy"],
    publishDate: "Mar 8, 2025",

    // @ts-ignore
    slug: "enhance-patient-support-technology",
    excerpt:
      "From AI-powered chatbots to same-day prescription alerts, digital tools are closing the gap between pharmacists and the patients who need them most.",
    readTime: "4 min read",
    category: "Pharmacy AI",
    accent: "#9f5cf7",
    featured: false,
  },

  /* ── 03 ─────────────────────────────────────────────────── */
  {
    id: 3,
    title: "Why Data Accuracy Matters in Pharmacy Systems",
    paragraph:
      "Explore the importance of accurate data in geolocation-based pharmacy systems to ensure reliability and trust.",
    image: "/images/blog/blog7.jpg",
    author: {
      name: "Klan",
      image: "/images/blog/blog7.jpg",
      designation: "Pharmacy Consultant",
    },
    tags: ["Data", "Pharmacy"],
    publishDate: "Feb 28, 2025",

    // @ts-ignore
    slug: "data-accuracy-pharmacy-systems",
    excerpt:
      "Inaccurate stock records cost pharmacies an average of 12 % in lost sales annually. Here is how geolocation-integrated systems enforce data integrity at every point of the supply chain.",
    readTime: "6 min read",
    category: "Data Systems",
    accent: "#00d4ff",
    featured: false,
  },

  /* ── 04 ─────────────────────────────────────────────────── */
  {
    id: 4,
    title: "Smart Inventory: AI Predicting Medicine Shortages",
    paragraph:
      "Machine learning models now predict stock shortages weeks in advance, helping pharmacies maintain near-perfect availability.",
    image: "/images/blog/blog4.jpg",
    author: {
      name: "Dr. Ama Mensah",
      image: "/images/blog/blog4.jpg",
      designation: "Chief Medical Editor",
    },
    tags: ["AI", "Inventory"],
    publishDate: "Feb 15, 2025",

    // @ts-ignore
    slug: "smart-inventory-ai-medicine-shortages",
    excerpt:
      "Predictive models trained on three years of pharmacy sales data achieved 94 % accuracy in forecasting shortfalls — two to four weeks before they occurred.",
    readTime: "7 min read",
    category: "Pharmacy AI",
    accent: "#5ff7c4",
    featured: false,
  },

  /* ── 05 ─────────────────────────────────────────────────── */
  {
    id: 5,
    title: "Delivery Tracking: The Last Mile in Pharmacy Logistics",
    paragraph:
      "End-to-end shipment visibility with live driver location and push notifications is redefining customer expectations.",
    image: "/images/blog/blog5.jpg",
    author: {
      name: "Samuel Boateng",
      image: "/images/blog/blog5.jpg",
      designation: "Logistics Analyst",
    },
    tags: ["Delivery", "Logistics"],
    publishDate: "Jan 30, 2025",

    // @ts-ignore
    slug: "delivery-tracking-pharmacy-logistics",
    excerpt:
      "Live tracking reduced failed deliveries by 28 % and improved customer satisfaction scores by 19 points in a pilot across 60 partner pharmacies.",
    readTime: "4 min read",
    category: "Supply Chain",
    accent: "#f7c14f",
    featured: false,
  },

  /* ── 06 ─────────────────────────────────────────────────── */
  {
    id: 6,
    title: "Digital Health Platforms and the Patient Experience",
    paragraph:
      "From virtual consultations to same-day prescription delivery, digital-first pharmacy platforms are setting a new standard.",
    image: "/images/blog/blog6.jpg",
    author: {
      name: "Dr. Ewurabena Quaye",
      image: "/images/blog/blog6.jpg",
      designation: "Health Tech Editor",
    },
    tags: ["Digital Health", "UX"],
    publishDate: "Jan 18, 2025",

    // @ts-ignore
    slug: "digital-health-patient-experience",
    excerpt:
      "Patients using digital pharmacy platforms report 35 % faster prescription fulfilment and rate their overall experience 4.7 / 5 — significantly above the industry average of 3.9.",
    readTime: "5 min read",
    category: "Digital Health",
    accent: "#f75f8e",
    featured: false,
  },
];

export default blogData;