import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import {
  ArrowRight,
  Menu,
  X,
  Zap,
  Users,
  Globe,
  Sparkles,
  Instagram,
  Twitter,
  Linkedin,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Briefcase,
  Target,
  Mail,
} from "lucide-react";
import { platform } from "node:os";
import ContactSection from "./components/ContactSection";
import Orb from "./components/Orb";

// ─── Keyframe styles injected once ──────────────────────────────────────────
function GlobalStyles() {
  return (
    <style>{`
      *, *::before, *::after { box-sizing: border-box; }
      html { font-family: 'Plus Jakarta Sans', sans-serif; scroll-behavior: smooth; }
      h1, h2, h3, h4, h5, h6 { font-family: 'Bricolage Grotesque', sans-serif; }

      @keyframes marquee-scroll {
        from { transform: translateX(0); }
        to   { transform: translateX(-50%); }
      }
      @keyframes float-y {
        0%,100% { transform: translateY(0px) rotate(0deg); }
        50%     { transform: translateY(-10px) rotate(2deg); }
      }
      @keyframes glow-pulse {
        0%,100% { box-shadow: 0 0 18px rgba(0,255,102,0.25); }
        50%      { box-shadow: 0 0 36px rgba(0,255,102,0.55); }
      }
      @keyframes scan-line {
        0%   { top: 0; opacity: 0.6; }
        100% { top: 100%; opacity: 0; }
      }
      @keyframes cursor-blink {
        0%,100% { opacity: 1; }
        60%     { opacity: 0; }
      }

      @keyframes marquee-brands-scroll {
        from { transform: translateX(0); }
        to   { transform: translateX(-50%); }
      }
      .marquee-track { animation: marquee-scroll 30s linear infinite; }
      .marquee-track:hover { animation-play-state: paused; }
      .marquee-brands-track {
        display: flex;
        gap: 6rem;
        width: max-content;
        animation: marquee-brands-scroll 50s linear infinite;
      }
      .marquee-brands-track:hover {
        animation-play-state: paused;
      }
      .float-icon { animation: float-y 4s ease-in-out infinite; }
      .glow-btn   { animation: glow-pulse 2.5s ease-in-out infinite; }

      .service-card {
        background: rgba(20,20,20,0.7);
        border: 1px solid rgba(255,255,255,0.07);
        backdrop-filter: blur(16px);
        transition: border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
      }
      .service-card:hover {
        border-color: #00FF66;
        box-shadow: 0 0 0 1px rgba(0,255,102,0.15), 0 0 40px rgba(0,255,102,0.1), inset 0 0 40px rgba(0,255,102,0.03);
        transform: translateY(-4px);
      }

      .nav-link {
        position: relative;
        color: #B3B3B3;
        transition: color 0.2s ease;
      }
      .nav-link::after {
        content: '';
        position: absolute;
        bottom: -2px; left: 0;
        width: 0; height: 1px;
        background: #00FF66;
        transition: width 0.25s ease;
      }
      .nav-link:hover { color: #fff; }
      .nav-link:hover::after { width: 100%; }

      ::-webkit-scrollbar { display: none; }
      * { scrollbar-width: none; }

      .green-glow-text {
        text-shadow: 0 0 30px rgba(0,255,102,0.4);
      }

      .stat-card {
        position: relative;
        overflow: hidden;
      }
      .stat-card::before {
        content: '';
        position: absolute;
        top: -50%; left: -50%;
        width: 200%; height: 200%;
        background: radial-gradient(circle, rgba(0,255,102,0.04) 0%, transparent 60%);
        opacity: 0;
        transition: opacity 0.4s ease;
      }
      .stat-card:hover::before { opacity: 1; }

      .orb-container {
        position: relative;
        z-index: 0;
        width: 100%;
        height: 100%;
      }
    `}</style>
  );
}

// ─── Animated node network canvas ───────────────────────────────────────────
interface NodeData {
  x: number; y: number;
  vx: number; vy: number;
  radius: number; color: string; pulsePhase: number;
}

function NodeNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -999, y: -999 });
  const nodesRef = useRef<NodeData[]>([]);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const colors = ["#00FF66", "#00FF66", "#00FF66", "#8A2BE2", "#00F0FF"];

    const setup = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (nodesRef.current.length === 0) {
        nodesRef.current = Array.from({ length: 65 }, () => ({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.45,
          radius: Math.random() * 2.2 + 0.8,
          color: colors[Math.floor(Math.random() * colors.length)],
          pulsePhase: Math.random() * Math.PI * 2,
        }));
      }
    };
    setup();

    const animate = (t: number) => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      const nodes = nodesRef.current;
      const { x: mx, y: my } = mouseRef.current;

      nodes.forEach((n) => {
        const dx = mx - n.x;
        const dy = my - n.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 160 && d > 0) {
          n.vx += (dx / d) * 0.012;
          n.vy += (dy / d) * 0.012;
        }
        n.vx *= 0.992;
        n.vy *= 0.992;
        const spd = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
        if (spd > 1.3) { n.vx = (n.vx / spd) * 1.3; n.vy = (n.vy / spd) * 1.3; }
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0) { n.x = 0; n.vx = Math.abs(n.vx); }
        if (n.x > w) { n.x = w; n.vx = -Math.abs(n.vx); }
        if (n.y < 0) { n.y = 0; n.vy = Math.abs(n.vy); }
        if (n.y > h) { n.y = h; n.vy = -Math.abs(n.vy); }
      });

      // connections
      ctx.save();
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 145) {
            const alpha = (1 - d / 145) * 0.38;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(0, 255, 102, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      ctx.restore();

      // nodes
      nodes.forEach((n) => {
        const pulse = Math.sin(t * 0.0009 + n.pulsePhase) * 0.28 + 0.72;
        ctx.save();
        ctx.shadowBlur = 14;
        ctx.shadowColor = n.color;
        ctx.globalAlpha = pulse;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius * pulse, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.fill();
        ctx.restore();
      });

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    const onMouse = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onTouch = (e: TouchEvent) => {
      const r = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.touches[0].clientX - r.left, y: e.touches[0].clientY - r.top };
    };
    canvas.addEventListener("mousemove", onMouse);
    canvas.addEventListener("touchmove", onTouch, { passive: true });

    const onResize = () => setup();
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animRef.current);
      canvas.removeEventListener("mousemove", onMouse);
      canvas.removeEventListener("touchmove", onTouch);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full" />;
}

// ─── Animated counter ────────────────────────────────────────────────────────
function useCounter(target: number, duration = 1800) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setCount(Math.floor(ease * target));
      if (p < 1) requestAnimationFrame(tick);
      else setCount(target);
    };
    requestAnimationFrame(tick);
  }, [inView, target, duration]);

  return { count, ref };
}

// ─── Brand Logos ──────────────────────────────────────────────────────────────
const brandLogos = [
  "https://res.cloudinary.com/ddlx80coh/image/upload/v1782378933/PROD-3f46dd85-5920-4905-b54f-cd8fcf50baff_fjt54g.png",
  "https://res.cloudinary.com/ddlx80coh/image/upload/v1782378932/Coca-Cola_logo.svg_fis8hk.png",
  "https://res.cloudinary.com/ddlx80coh/image/upload/v1782378933/mcdonalds-logo-png_seeklogo-257977_usu92o.png",
  "https://res.cloudinary.com/ddlx80coh/image/upload/v1782378932/images-1_wfnfen.png",
  "https://res.cloudinary.com/ddlx80coh/image/upload/v1782378932/images_cume3s.png",
  "https://res.cloudinary.com/ddlx80coh/image/upload/v1782378931/46b18e138809549.Y3JvcCw5OTksNzgyLDAsMTA4_mpz3tx.jpg",
  "https://res.cloudinary.com/ddlx80coh/image/upload/v1782378931/fast-and-up_izvpqt.webp"
];

function BrandsSection() {
  const doubledLogos = [...brandLogos, ...brandLogos, ...brandLogos, ...brandLogos];

  return (
    <section className="py-16 bg-black/20 border-y border-white/5 overflow-hidden relative animate-fade-in">
      <div className="max-w-7xl mx-auto px-6 mb-10 text-center">
        <div
          className="text-xs font-semibold tracking-widest text-[#00FF66] uppercase mb-3"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          — Associated —
        </div>
        <h2 className="font-['Bricolage_Grotesque'] font-extrabold text-4xl md:text-6xl text-white tracking-[0.2em] uppercase">
          Brands
        </h2>
      </div>

      {/* Fade edges */}
      <div
        className="absolute left-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
        style={{ background: "linear-gradient(90deg, #0D0D0D 0%, transparent 100%)" }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
        style={{ background: "linear-gradient(-90deg, #0D0D0D 0%, transparent 100%)" }}
      />

      <div className="flex overflow-hidden">
        <div className="marquee-brands-track whitespace-nowrap py-4">
          {doubledLogos.map((url, i) => {
            const isJpg = url.includes('.jpg') || url.includes('.jpeg');
            return (
              <div
                key={i}
                className="w-80 h-40 flex items-center justify-center bg-neutral-900/30 border border-white/5 rounded-3xl px-10 py-6 hover:bg-neutral-900 hover:border-[#00FF66]/20 transition-all duration-300 hover:scale-105 shrink-0"
              >
                <img
                  src={url}
                  alt={`Brand logo ${i + 1}`}
                  className={`max-w-full max-h-full object-contain transition-all duration-300 ${isJpg
                    ? "invert brightness-200 opacity-60 hover:opacity-100"
                    : "filter grayscale opacity-60 hover:grayscale-0 hover:opacity-100"
                    }`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = ["Home", "About", "Work", "Contact"];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(13,13,13,0.9)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-4 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-3 group">
          <img
            src="https://res.cloudinary.com/ddlx80coh/image/upload/v1782492657/Unigreen_Symbol_logo_green-removebg-preview_1_p4zthd.png"
            alt="Unigreen Symbol Logo"
            className="h-12 w-12 rounded-xl object-contain bg-black transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(0,255,102,0.35)]"
          />
          <div className="flex flex-col justify-center">
            <span className="font-['Bricolage_Grotesque'] font-bold text-xl md:text-2xl text-white tracking-tight leading-none">
              Unigreen
            </span>
            <span className="text-[8px] md:text-[9px] text-[#B3B3B3] tracking-[0.14em] uppercase font-bold mt-1.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              INTERNATIONALS PRIVATE LTD.
            </span>
          </div>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a key={l} href={`#${l.toLowerCase()}`} className="nav-link text-sm font-medium">
              {l}
            </a>
          ))}
        </div>


        {/* Mobile burger */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          className="md:hidden px-6 pb-6 pt-2 flex flex-col gap-4"
          style={{ background: "rgba(13,13,13,0.97)", borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          {links.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase()}`}
              onClick={() => setOpen(false)}
              className="text-[#B3B3B3] hover:text-white text-base font-medium transition-colors"
            >
              {l}
            </a>
          ))}

        </div>
      )}
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section id="home" className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-black pt-24 pb-16">
      {/* Centered WebGL Orb */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="w-[320px] h-[320px] sm:w-[500px] sm:h-[500px] md:w-[680px] md:h-[680px] lg:w-[780px] lg:h-[780px] opacity-80">
          <Orb
            hoverIntensity={2}
            rotateOnHover={true}
            hue={0}
            forceHoverState={false}
          />
        </div>
      </div>

      {/* Grid overlay for tech/corporate styling */}
      <div
        className="absolute inset-0 pointer-events-none z-10 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,255,102,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,102,0.03) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      {/* Centered Content Overlay */}
      <div className="max-w-5xl mx-auto px-6 z-20 pointer-events-none text-center flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-6 items-center"
        >
          {/* Headline - "Transforming Brands Through Authentic Connections." */}
          <h1
            className="font-['Bricolage_Grotesque'] font-extrabold leading-[0.98] text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white max-w-4xl tracking-tight"
          >
            Transforming Brands
            <br />
            Through <span
              className="green-glow-text"
              style={{
                background: "linear-gradient(135deg, #00FF66 0%, #00F0FF 60%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Authentic Connections.
            </span>
          </h1>

          {/* Sub-headline: Redesigned to be humble & professional for corporate terms */}
          <p
            className="text-neutral-400 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl font-light mt-4 px-4"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            We Build Brands That People Talk About.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6 pointer-events-auto">
            <a
              href="#contact"
              className="glow-btn inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-bold text-black text-sm transition-transform duration-200 hover:scale-105 active:scale-95"
              style={{ background: "#00FF66" }}
            >
              Partner With Us
              <ArrowRight size={16} />
            </a>
          </div>

          {/* Quick stats row */}
          <div className="flex items-center justify-center gap-8 sm:gap-16 mt-12 pt-8 border-t border-white/5 w-full max-w-xl pointer-events-auto">
            {[
              { val: "50+", label: "Corporate Brands" },
              { val: "50+", label: "Campaigns" },
              { val: "500+", label: "Verified Creators" }
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div
                  className="font-['Bricolage_Grotesque'] font-bold text-2xl sm:text-3xl text-white"
                  style={{ textShadow: "0 0 20px rgba(0,255,102,0.3)" }}
                >
                  {s.val}
                </div>
                <div className="text-[10px] text-neutral-500 font-bold tracking-wider uppercase mt-1.5 font-mono">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40 z-20">
        <div className="w-px h-10 bg-gradient-to-b from-transparent to-[#00FF66]" />
        <span
          className="text-[10px] tracking-[0.2em] text-[#00FF66] uppercase"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          scroll
        </span>
      </div>
    </section>
  );
}

// ─── Featured Works ───────────────────────────────────────────────────────────
const works = [
  {
    image: "https://res.cloudinary.com/ddlx80coh/image/upload/v1782379726/Image_19-03-26_at_1.26_PM_ciifdf.jpg",
    tag: "Strategic Brand Alliances and Partnerships",
    title: "On-Ground Experiential Events",
    desc: "Managed brand sponsorships and strategic partnerships with leading global media organizations. From identifying the right brand fit to executing seamless collaborations, we ensured every partnership created maximum value for both brands and media partners.",
    color: "#00FF66",
  },
  {
    image: "https://res.cloudinary.com/ddlx80coh/image/upload/v1782380295/Post_8_tkyzen.png",
    tag: "Brand Strategy and Sponsorships",
    title: "Targeted Creator Campaigns",
    desc: "Unigreen led the brand curation and alliance strategy for the Indian Coast Guard 10K Run, connecting premium brands with a distinguished defense audience. Our strategic execution delivered maximum visibility, meaningful engagement, and impactful brand experiences.",
    color: "#8A2BE2",
  },
  {
    image: "https://res.cloudinary.com/ddlx80coh/image/upload/v1782380294/13_id0ech.png",
    tag: "Brand Campaign Execution",
    title: "Integrated Media & Branding",
    desc: "Unigreen successfully onboarded McDonald's as a sponsor for TEDx IGDTUW, ensuring impactful brand visibility and authentic engagement with a vibrant student audience.",
    color: "#00F0FF",
  },
];

function ServicesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="work" className="py-28 px-6 lg:px-10" ref={ref}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16"
        >
          <div
            className="text-xs font-semibold tracking-widest text-[#00FF66] uppercase mb-4"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            — Our Featured Work
          </div>
          <div className="flex flex-col md:flex-row md:items-end gap-6">
            <h2
              className="font-['Bricolage_Grotesque'] font-extrabold text-4xl md:text-5xl text-white leading-tight max-w-lg"
            >
              Transforming ideas into digital and experiential reality.
            </h2>
            <p className="text-[#666] text-sm leading-relaxed max-w-xs md:ml-auto md:text-right">
              A showcase of recent campaigns, live activations, and digital success stories crafted for modern brands.
            </p>
          </div>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {works.map((w, i) => (
            <motion.div
              key={w.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 + i * 0.1 }}
              className="bg-neutral-900/30 border border-white/5 rounded-2xl overflow-hidden flex flex-col hover:border-white/10 hover:bg-neutral-900/50 transition-all duration-300 hover:scale-[1.02] group cursor-default"
            >
              {/* Image Container */}
              <div className="h-72 w-full overflow-hidden relative border-b border-white/5">
                <img
                  src={w.image}
                  alt={w.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Text Content */}
              <div className="p-6 flex flex-col gap-3 flex-grow">
                {/* Tag */}
                <div
                  className="text-[10px] tracking-widest font-semibold uppercase"
                  style={{ fontFamily: "'JetBrains Mono', monospace", color: w.color }}
                >
                  {w.tag}
                </div>

                <h3
                  className="font-['Bricolage_Grotesque'] font-bold text-xl text-white leading-tight"
                >
                  {w.title}
                </h3>
                <p className="text-[#888] text-sm leading-relaxed flex-grow">{w.desc}</p>

                {/* Learn More link removed */}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Marquee ──────────────────────────────────────────────────────────────────
const marqueeItems = [
  { text: "50+ Brands Worked With", outline: false },
  { text: "•", outline: false },
  { text: "50+ Campaigns Executed", outline: true },
  { text: "•", outline: false },
  { text: "500+ Influencers in Our Network", outline: false },
  { text: "•", outline: false },
  { text: "10+ Cities Reached", outline: true },
  { text: "•", outline: false },
  { text: "95% Client Satisfaction Rate", outline: false },
  { text: "•", outline: false },
  { text: "Creator Economy Experts", outline: true },
  { text: "•", outline: false },
  { text: "Digital-First Growth", outline: false },
  { text: "•", outline: false },
];

function MarqueeSection() {
  const doubled = [...marqueeItems, ...marqueeItems];

  return (
    <div
      className="relative py-5 overflow-hidden"
      style={{
        background: "linear-gradient(90deg, rgba(0,255,102,0.04) 0%, rgba(138,43,226,0.04) 100%)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Fade edges */}
      <div
        className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
        style={{ background: "linear-gradient(90deg, #0D0D0D, transparent)" }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
        style={{ background: "linear-gradient(-90deg, #0D0D0D, transparent)" }}
      />

      <div className="marquee-track flex items-center gap-6 whitespace-nowrap">
        {doubled.map((item, i) => (
          <span
            key={i}
            className="font-['Bricolage_Grotesque'] font-bold text-base shrink-0"
            style={
              item.text === "•"
                ? { color: "#333", fontSize: "10px" }
                : item.outline
                  ? {
                    color: "transparent",
                    WebkitTextStroke: "1px #00FF66",
                    fontSize: "15px",
                    letterSpacing: "0.06em",
                  }
                  : {
                    color: "#00FF66",
                    fontSize: "15px",
                    letterSpacing: "0.06em",
                  }
            }
          >
            {item.text}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Stats section ───────────────────────────────────────────────────────────
const statsData = [
  { value: 50, suffix: "+", label: "Brands Worked With", sub: "Established Partnerships" },
  { value: 50, suffix: "+", label: "Campaigns Executed", sub: "Successful Deliveries" },
  { value: 500, suffix: "+", label: "Influencers in Our Network", sub: "Active Creator Connections" },
  { value: 10, suffix: "+", label: "Cities Reached", sub: "Pan-India Presence" },
  { value: 95, suffix: "%", label: "Client Satisfaction Rate", sub: "Post-Campaign Reviews" },
];

function StatItem({ stat, delay }: { stat: typeof statsData[0]; delay: number }) {
  const { count, ref } = useCounter(stat.value);

  return (
    <motion.div
      ref={ref as React.RefObject<HTMLDivElement>}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
      className="stat-card flex flex-col gap-2 px-8 py-6 border-r border-white/5 last:border-r-0"
    >
      <div
        className="font-['Bricolage_Grotesque'] font-extrabold text-5xl md:text-6xl leading-none"
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #00FF66 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        {count}
        {stat.suffix}
      </div>
      <div className="text-white text-sm font-semibold mt-1">{stat.label}</div>
      <div
        className="text-[10px] tracking-widest uppercase text-[#444]"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        {stat.sub}
      </div>
    </motion.div>
  );
}

// ─── About Section ────────────────────────────────────────────────────────────
function AboutSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="py-28 px-6 lg:px-10 bg-black/10 relative overflow-hidden" ref={ref}>
      {/* Glow effects */}
      <div
        className="absolute top-1/4 left-1/4 -translate-x-1/2 w-[500px] h-[500px] pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(0,255,102,0.02) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="absolute bottom-1/4 right-0 w-[600px] h-[600px] pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(0,240,255,0.02) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-20 text-center max-w-4xl mx-auto"
        >
          <div
            className="text-xs font-semibold tracking-widest text-[#00FF66] uppercase mb-4"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            — About Unigreen —
          </div>
          <h2
            className="font-['Bricolage_Grotesque'] font-extrabold text-3xl md:text-5xl lg:text-6xl text-white leading-tight mb-6"
            style={{
              background: "linear-gradient(135deg, #ffffff 0%, #a8ffcc 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Transforming Brands Through Strategic Marketing, Influencer Partnerships & Experiential Excellence
          </h2>
        </motion.div>

        {/* Grid Content - Narrative */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-20">
          {/* Left: Manifesto / Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="lg:col-span-5"
          >
            <p className="font-['Bricolage_Grotesque'] font-bold text-2xl md:text-3xl text-white leading-snug">
              Bridging the gap between brands and modern consumers through creator-led innovation.
            </p>
            <div className="w-16 h-1 bg-[#00FF66] mt-6 rounded-full" />
          </motion.div>

          {/* Right: Corporate Narrative Description */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="lg:col-span-7 flex flex-col gap-6 text-[#aaa] text-base md:text-lg leading-relaxed font-light"
          >
            <p>
              Founded with a clear vision to redefine modern consumer engagement,{" "}
              <strong className="text-white font-semibold">Unigreen</strong> is a full-service marketing, brand partnerships, and influencer solutions agency. In a rapidly evolving digital landscape, we empower forward-thinking brands to cut through the noise and establish genuine connections with their target audiences.
            </p>
            <p>
              By combining data-driven strategies with creative storytelling, we bridge digital activations and on-ground experiential events. We believe that successful marketing is built on authentic community-building, seamless execution, and measurable business growth.
            </p>
          </motion.div>
        </div>

        {/* Strategic Pillars List */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          className="border-t border-b border-white/10 py-12 mb-20 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {[
            {
              num: "01",
              title: "Strategic Partnerships",
              desc: "Collaborating with premium brands to build long-term influencer networks and robust corporate alliances."
            },
            {
              num: "02",
              title: "Experiential Marketing",
              desc: "Conceptualizing and delivering end-to-end physical activations and high-engagement corporate events."
            },
            {
              num: "03",
              title: "Enterprise Solutions",
              desc: "Deploying sophisticated reporting tools and data analytics to optimize campaign performance and ensure verified ROI."
            }
          ].map((pillar) => (
            <div key={pillar.num} className="flex flex-col gap-3">
              <span className="text-[#00FF66] font-mono text-xs font-bold tracking-widest">{pillar.num} /</span>
              <h4 className="text-white font-['Bricolage_Grotesque'] font-bold text-lg">{pillar.title}</h4>
              <p className="text-neutral-400 text-sm leading-relaxed font-light">{pillar.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Vision & Mission Side-by-Side */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20"
        >
          {/* Vision Box */}
          <div className="flex flex-col gap-4 border-l-2 border-[#00F0FF] pl-6 py-2">
            <h3 className="font-['Bricolage_Grotesque'] font-bold text-2xl text-white">Our Vision</h3>
            <p className="text-neutral-400 text-sm md:text-base leading-relaxed font-light">
              To bridge the gap between brands and modern consumers globally, empowering businesses to stand out through innovative storytelling, creator-led campaigns, strategic partnerships, and impactful experiential activations that lead the industry.
            </p>
          </div>

          {/* Mission Box */}
          <div className="flex flex-col gap-4 border-l-2 border-[#00FF66] pl-6 py-2">
            <h3 className="font-['Bricolage_Grotesque'] font-bold text-2xl text-white">Our Mission</h3>
            <p className="text-neutral-400 text-sm md:text-base leading-relaxed font-light">
              To help brands create highly impactful, authentic, and measurable marketing campaigns by connecting them with the right audiences, creators, and experiential spaces, redefining consumer engagement through growth-driven marketing solutions.
            </p>
          </div>
        </motion.div>

        {/* Office Photos Row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          <div className="relative group overflow-hidden rounded-2xl border border-white/5 h-80 bg-neutral-900/30">
            <img
              src="https://res.cloudinary.com/ddlx80coh/image/upload/v1782380397/office_photo_3_r4lxzl.jpg"
              alt="Unigreen Office Space 1"
              className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-500 opacity-80"
            />
          </div>
          <div className="relative group overflow-hidden rounded-2xl border border-white/5 h-80 bg-neutral-900/30">
            <img
              src="https://res.cloudinary.com/ddlx80coh/image/upload/v1782380395/office_photo_3_zblkqr.jpg"
              alt="Unigreen Office Space 2"
              className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-500 opacity-80"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function StatsSection() {
  return (
    <section className="py-24 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "rgba(20,20,20,0.6)",
            border: "1px solid rgba(255,255,255,0.07)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Header strip */}
          <div
            className="px-8 py-4 flex items-center justify-between"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <span
              className="text-[10px] tracking-widest text-[#00FF66] uppercase"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              Performance Metrics · 2026
            </span>
            <span
              className="flex items-center gap-1.5 text-[10px] tracking-widest text-[#444] uppercase"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full bg-[#00FF66]"
                style={{ animation: "cursor-blink 1.4s ease-in-out infinite", boxShadow: "0 0 4px #00FF66" }}
              />
              Live data
            </span>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-y md:divide-y-0 divide-white/5">
            {statsData.map((stat, i) => (
              <StatItem key={stat.label} stat={stat} delay={i * 0.08} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Social Proof / Clients ───────────────────────────────────────────────────
function SocialProofSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const brands = ["TIMES INTERNET", "COCA COLA", "FASTRACK", "TRACER", "FAST & UP", "MAX PROTEIN"];

  return (
    <section className="py-24 px-6 lg:px-10 relative overflow-hidden" ref={ref}>
      {/* Background glow effects */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] pointer-events-none opacity-20"
        style={{
          background: "radial-gradient(circle, rgba(0, 255, 102, 0.04) 0%, transparent 70%)",
          filter: "blur(50px)"
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div
            className="text-xs font-semibold tracking-[0.25em] text-[#00FF66] uppercase mb-3"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            — Partnership Network —
          </div>
          <h2
            className="font-['Bricolage_Grotesque'] font-extrabold text-2xl md:text-3xl text-white tracking-wide uppercase"
          >
            Trusted by forward-thinking brands
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {brands.map((b, i) => (
            <motion.div
              key={b}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.5,
                delay: i * 0.05
              }}
              className="flex items-center justify-center gap-3 px-6 py-6 bg-neutral-900/30 border border-white/5 rounded-2xl cursor-default select-none transition-all duration-300 relative group overflow-hidden hover:scale-[1.03] hover:border-[#00FF66]/30 hover:bg-neutral-900/60 hover:shadow-[0_0_25px_rgba(0,255,102,0.08)]"
            >
              {/* Subtle top light overlay */}
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />

              {/* Small green active indicator dot inside the card that pulses on hover */}
              <div
                className="w-1.5 h-1.5 rounded-full bg-[#00FF66] opacity-40 group-hover:opacity-100 group-hover:scale-125 transition-all duration-300"
                style={{
                  boxShadow: "0 0 8px #00FF66"
                }}
              />

              <span
                className="font-['Bricolage_Grotesque'] font-bold text-sm md:text-base text-white/70 group-hover:text-white tracking-widest uppercase transition-colors duration-200"
              >
                {b}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}



// ─── Advertisement Section ────────────────────────────────────────────────────
const adCampaigns = [
  {
    image: "https://res.cloudinary.com/ddlx80coh/image/upload/v1782380674/Post_1_f6cd85.png",
    format: "Event Sponsorships",
    roi: "3.4x",
    impressions: "100k ",
    platform: "Instagram Feed"
  },
  {
    image: "https://res.cloudinary.com/ddlx80coh/image/upload/v1782380674/Post_9_ady7pn.png",
    format: "Strategic Alliance",
    roi: "4.1x",
    impressions: "70k",
    platform: "Instagram Feed"
  },
  {
    image: "https://res.cloudinary.com/ddlx80coh/image/upload/v1782380674/Post_7_flvfzr.png",
    format: "Brands Partnerships",
    roi: "2.8x",
    impressions: "19K +",
    platform: "Instagram Feed"
  },
  {
    image: "https://res.cloudinary.com/ddlx80coh/image/upload/v1782380672/10_ppokvl.png",
    format: "Exclusive Brand Campaign (BTL)",
    roi: "3.7x",
    impressions: "110K +",
    platform: "Instagram Feed"
  },
  {
    image: "https://res.cloudinary.com/ddlx80coh/image/upload/v1782380673/19_eyrc3r.png",
    format: "Concert & Celebrity Endorsement",
    roi: "4.5x",
    impressions: "50K",
    platform: "Instagram Feed"
  },
  {
    image: "https://res.cloudinary.com/ddlx80coh/image/upload/v1782380674/18_clhsiq.png",
    format: "Events Execution",
    roi: "3.2x",
    impressions: "100k",
    platform: "Instagram Feed"
  },
  {
    image: "https://res.cloudinary.com/ddlx80coh/image/upload/v1782380674/Post_6_y61dul.png",
    format: "Targeted Campaigns",
    roi: "3.9x",
    impressions: "80K",
    platform: "Instagram Feed"
  },
  {
    image: " https://res.cloudinary.com/ddlx80coh/image/upload/v1782414794/16_md6gvf.png",
    format: "Brand Partnerships-Times Marathon",
    roi: "3.7x",
    impressions: "1.4M",
    platform: "Instagram Feed"
  }
];

function AdvertisementSection() {
  const ref = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  const scroll = (direction: "left" | "right") => {
    const container = scrollRef.current;
    if (container) {
      const scrollAmount = 340; // card width + gap
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const container = scrollRef.current;
    if (!container) return;
    setIsDown(true);
    setStartX(e.pageX - container.offsetLeft);
    setScrollLeftState(container.scrollLeft);
  };

  const handleMouseLeaveOrUp = () => {
    setIsDown(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown) return;
    e.preventDefault();
    const container = scrollRef.current;
    if (!container) return;
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 1.5; // scroll speed multiplier
    container.scrollLeft = scrollLeftState - walk;
  };

  return (
    <section className="py-28 px-6 lg:px-10 bg-black/10 relative overflow-hidden" ref={ref}>
      {/* Ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[900px] h-[500px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, rgba(0,255,102,0.04) 0%, transparent 70%)",
          filter: "blur(70px)",
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header with Navigation Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl"
          >
            <div
              className="text-xs font-semibold tracking-widest text-[#00FF66] uppercase mb-4"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              — Ad Campaigns
            </div>
            <h2 className="font-['Bricolage_Grotesque'] font-extrabold text-3xl md:text-5xl text-white leading-tight mb-4">
              Thumb-Stopping Social Creatives
            </h2>
            <p className="text-[#666] text-sm md:text-base leading-relaxed">
              Data-backed, scroll-stopping advertisement designs built to convert casual viewers into dedicated customers.
            </p>
          </motion.div>

          {/* Nav Buttons */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            className="flex items-center gap-3"
          >
            <button
              onClick={() => scroll("left")}
              className="w-12 h-12 rounded-full border border-white/5 bg-neutral-900/40 hover:bg-neutral-800 hover:border-[#00FF66]/20 transition-all duration-300 flex items-center justify-center text-white active:scale-95 group"
              aria-label="Scroll left"
            >
              <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-12 h-12 rounded-full border border-white/5 bg-neutral-900/40 hover:bg-neutral-800 hover:border-[#00FF66]/20 transition-all duration-300 flex items-center justify-center text-white active:scale-95 group"
              aria-label="Scroll right"
            >
              <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </motion.div>
        </div>

        {/* Scrollable container */}
        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeaveOrUp}
          onMouseUp={handleMouseLeaveOrUp}
          onMouseMove={handleMouseMove}
          className="flex gap-8 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-10 cursor-grab active:cursor-grabbing select-none no-scrollbar px-4"
        >
          {adCampaigns.map((ad, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.08 }}
              className="snap-center shrink-0 w-[285px] md:w-[310px] aspect-[9/18.5] bg-[#090909] border border-white/10 rounded-[40px] p-3 shadow-2xl relative hover:border-[#00FF66]/20 transition-all duration-300 hover:scale-[1.02] group"
              style={{
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
              }}
            >
              {/* iPhone bezel highlights / Glass glare */}
              <div className="absolute inset-0.5 rounded-[38px] border border-white/5 pointer-events-none z-30" />

              {/* Top Dynamic Island / Speaker notch */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-2xl z-40 flex items-center justify-center">
                {/* Selfie Camera dot */}
                <div className="absolute right-3 w-2 h-2 rounded-full bg-neutral-900 border border-neutral-800" />
                {/* Speaker slit */}
                <div className="absolute top-1 w-10 h-0.5 bg-neutral-800 rounded-full" />
              </div>

              {/* Phone Screen content wrapper */}
              <div className="w-full h-full rounded-[30px] overflow-hidden relative bg-neutral-950 border border-black z-10 flex flex-col justify-between">
                {/* Mock phone status bar */}
                <div className="h-9 px-6 pt-1 flex items-center justify-between text-[10px] text-white/50 font-medium z-20 pointer-events-none shrink-0">
                  <span>9:41</span>
                  <div className="flex items-center gap-1.5">
                    {/* Signal icon */}
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 16 16">
                      <rect x="1" y="11" width="2" height="3" rx="0.5" fill="currentColor" />
                      <rect x="4" y="8" width="2" height="6" rx="0.5" fill="currentColor" />
                      <rect x="7" y="5" width="2" height="9" rx="0.5" fill="currentColor" />
                      <rect x="10" y="2" width="2" height="12" rx="0.5" fill="currentColor" />
                    </svg>
                    {/* Battery icon */}
                    <div className="w-5 h-2.5 border border-white/30 rounded-sm p-0.5 flex items-center">
                      <div className="h-full w-3.5 bg-white/70 rounded-[1px]" />
                    </div>
                  </div>
                </div>

                {/* The campaign image itself */}
                <div className="flex-grow w-full relative overflow-hidden bg-[#050505]">
                  <img
                    src={ad.image}
                    alt={`Campaign design - ${ad.format}`}
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                    draggable="false"
                    loading="lazy"
                  />
                </div>

                {/* Bottom glassmorphic overlay for details (non-absolute/inline) */}
                <div className="p-5 bg-black/60 backdrop-blur-md border-t border-white/10 z-20 flex flex-col gap-3 shrink-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-widest text-[#00FF66] uppercase font-mono">
                      {ad.platform}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-semibold text-white/70">
                      UGC Format
                    </span>
                  </div>

                  <div>
                    <h4 className="text-white text-sm font-bold font-['Bricolage_Grotesque']">
                      {ad.format}
                    </h4>
                  </div>

                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer
      id="footer"
      className="relative overflow-hidden"
      style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
        {/* Footer columns */}
        <div
          className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12"
        >
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <a href="#" className="flex items-center gap-3 group self-start">
              <img
                src="https://res.cloudinary.com/ddlx80coh/image/upload/v1782492657/Unigreen_Symbol_logo_green-removebg-preview_1_p4zthd.png"
                alt="Unigreen Symbol Logo"
                className="h-11 w-11 rounded-lg object-contain bg-black transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(0,255,102,0.25)]"
              />
              <div className="flex flex-col justify-center">
                <span className="font-['Bricolage_Grotesque'] font-bold text-lg md:text-xl text-white tracking-tight leading-none">
                  Unigreen
                </span>
                <span className="text-[8px] text-[#888] tracking-[0.14em] uppercase font-bold mt-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  INTERNATIONALS PRIVATE LTD.
                </span>
              </div>
            </a>
            <p className="text-[#555] text-sm leading-relaxed max-w-xs">
              A full-service marketing, brand partnerships, and influencer solutions agency
              transforming how brands connect with modern consumers.
            </p>
            <div className="flex items-center gap-4 mt-2">
              {[
                {
                  Icon: Instagram,
                  label: "Instagram",
                  href: "https://www.instagram.com/unigreen.in?igsh=cTFpZG5xb2VoNXYw"
                },
                {
                  Icon: Linkedin,
                  label: "LinkedIn",
                  href: "https://www.linkedin.com/company/unigreen-internationals/"
                },
                {
                  Icon: Mail,
                  label: "Email",
                  href: "mailto:subhamsahoo@unigreenin.in"
                },
              ].map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target={href !== "#" ? "_blank" : undefined}
                  rel={href !== "#" ? "noopener noreferrer" : undefined}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-[#555] transition-all duration-200 hover:text-[#00FF66] hover:border-[#00FF66]/30"
                  style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-4">
            <div
              className="text-[10px] tracking-widest text-[#444] uppercase"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              Navigation
            </div>
            {[
              { label: "Services", href: "#work" },
              { label: "About Us", href: "#about" },
              { label: "Contact", href: "#contact" }
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-[#666] text-sm hover:text-white transition-colors duration-200 w-fit"
              >
                {label}
              </a>
            ))}
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-4">
            <div
              className="text-[10px] tracking-widest text-[#444] uppercase"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              Get in Touch
            </div>
            <a
              href="mailto:subhamsahoo@unigreenin.in"
              className="text-[#00FF66] text-sm font-medium hover:underline underline-offset-4 w-fit"
            >
              subhamsahoo@unigreenin.in
            </a>
            <p className="text-[#555] text-sm leading-relaxed">
              Mumbai · Delhi · Bangalore
              <br />
              International clients welcome.
            </p>
          </div>

          {/* Headquarters */}
          <div className="flex flex-col gap-4 bg-neutral-900/30 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
            <div className="flex items-center gap-2 text-[#00FF66]">
              <MapPin size={16} />
              <span className="text-[10px] tracking-widest uppercase font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Headquarters</span>
            </div>
            <span className="text-white text-xs font-bold w-fit px-2 py-0.5 rounded bg-white/5 border border-white/10">Gurugram, Haryana</span>

            <address className="text-[#aaa] text-xs not-italic leading-relaxed font-medium">
              Landmark, Cyber Park, Sector 67, Gurugram, Haryana 122022, IN
            </address>

            <a
              href="https://www.google.com/maps/dir/?api=1&destination=Landmark+Cyber+Park+Sector+67+Gurugram+Haryana+122022+IN"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-black transition-all duration-200 hover:scale-[1.02] active:scale-95 text-center cursor-pointer"
              style={{
                background: "#00FF66",
                boxShadow: "0 0 12px rgba(0,255,102,0.15)",
              }}
            >
              Get Directions
              <ArrowRight size={10} />
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col md:flex-row items-center justify-between gap-3 pt-8"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <span
            className="text-[#333] text-xs"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            © 2024 Unigreen Internationals. All rights reserved.
          </span>
          <div className="flex items-center gap-6">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((l) => (
              <a
                key={l}
                href="#"
                className="text-[#333] text-xs hover:text-[#666] transition-colors duration-200"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <div className="bg-background text-foreground min-h-screen overflow-x-hidden">
      <GlobalStyles />
      <Navbar />
      <HeroSection />
      <AboutSection />
      <BrandsSection />
      <ServicesSection />
      <MarqueeSection />
      <StatsSection />
      <SocialProofSection />
      <AdvertisementSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
