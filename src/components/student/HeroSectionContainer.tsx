"use client";
import { useState, useEffect, useMemo } from "react";
import type { DashboardHeroSlide } from "@/types/student";

interface HeroSectionContainerProps {
  slide?: DashboardHeroSlide;
  slides?: DashboardHeroSlide[];
  totalSlides?: number;
  activeSlideIndex?: number;
  activeLessonId?: string;
  onCtaClick?: (slide: DashboardHeroSlide, slideIndex: number) => void;
}



// Particles for the floating effects
const HERO_PARTICLES = ["✨", "⭐", "+", "×", "=", "💡", "🔢", "✦"];

export default function HeroSectionContainer({
  slide,
  slides: inputSlides,
  totalSlides = 4,
  activeSlideIndex: initialSlideIndex = 0,
  activeLessonId = "",
  onCtaClick,
}: HeroSectionContainerProps) {
  // Construct array of slides
  const slides: DashboardHeroSlide[] = inputSlides && inputSlides.length > 0
    ? inputSlides
    : slide
      ? [slide]
      : [];

  const [activeIndex, setActiveIndex] = useState(initialSlideIndex);
  const [motivationIndex, setMotivationIndex] = useState(0);

  // Reset slide index when active lesson changes
  useEffect(() => {
    setActiveIndex(0);
  }, [activeLessonId]);

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length, activeLessonId]);



  const currentSlide = slides[activeIndex] || slides[0] || slide;
  const slideCount = slides.length || totalSlides;

  if (!currentSlide) return null;

  const handleCtaClick = (e: React.MouseEvent) => {
    if (onCtaClick) {
      onCtaClick(currentSlide, activeIndex);
    }
  };

  return (
    <section className="hero-section-container">
      {/* Floating Particles Layer */}
      <div className="hero-particles-layer">
        {HERO_PARTICLES.map((particle, idx) => (
          <span key={idx} className="hero-particle">{particle}</span>
        ))}
      </div>

      {/* Left Content */}
      <div
        key={`hero-banner-${activeIndex}-${activeLessonId}`}
        className="hero-banner-content"
      >
        <div className="hero-tag-ribbon">
          <span className="star-icon">⭐</span> {currentSlide.tag}
        </div>

        <h1 className="hero-title">{currentSlide.title}</h1>
        <p className="hero-subtitle">{currentSlide.subtitle}</p>

        <div className="hero-mascot-cta">


          {currentSlide.ctaUrl ? (
            <a
              href={currentSlide.ctaUrl}
              target={currentSlide.ctaUrl.startsWith("http") ? "_blank" : "_self"}
              rel="noopener noreferrer"
              className="btn-primary-hero"
              style={{ textDecoration: "none", display: "inline-flex" }}
              onClick={handleCtaClick}
            >
              ▶ {currentSlide.ctaText}
            </a>
          ) : (
            <button className="btn-primary-hero" onClick={handleCtaClick}>
              ▶ {currentSlide.ctaText}
            </button>
          )}


        </div>

        <div className="carousel-dots-group">
          {Array.from({ length: slideCount }).map((_, idx) => (
            <span
              key={idx}
              role="button"
              tabIndex={0}
              aria-label={`Slide ${idx + 1}`}
              className={`carousel-dot ${idx === activeIndex ? "active" : ""}`}
              onClick={() => setActiveIndex(idx)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setActiveIndex(idx);
                }
              }}
              style={{ cursor: "pointer" }}
            />
          ))}
        </div>
      </div>

      {/* Right Visualizer */}
      <div className="hero-visualizer-slot">
        <div
          key={`hero-vis-${activeIndex}-${activeLessonId}`}
          className="math-visualizer-card"
        >
          {renderVisualizerScene(currentSlide)}
        </div>
      </div>
    </section>
  );
}



/* ─── Visualizer Scene Router ─── */
function renderVisualizerScene(slide: DashboardHeroSlide) {
  const key = (slide.visualizerKey || "").toLowerCase();
  const title = (slide.title || "").toLowerCase();

  if (key.includes("triangle") || title.includes("triangle")) {
    return <TriangleVisualizerScene />;
  }
  if (key.includes("circle") || title.includes("circle")) {
    return <CircleVisualizerScene />;
  }
  if (key.includes("symmetry") || title.includes("symmetry") || title.includes("pattern")) {
    return <SymmetryVisualizerScene />;
  }
  if (key.includes("fraction") || title.includes("fraction") || title.includes("group")) {
    return <FractionsVisualizerScene />;
  }
  if (key.includes("money") || title.includes("money") || title.includes("coin") || title.includes("word problem")) {
    return <MoneyVisualizerScene />;
  }
  if (key.includes("measure") || title.includes("measure") || title.includes("length")) {
    return <MeasurementVisualizerScene />;
  }
  if (key.includes("time") || title.includes("time") || title.includes("clock")) {
    return <TimeVisualizerScene />;
  }

  // Default: Place Value
  const hundreds = slide.visualizerData?.hundreds ?? 1;
  const tens = slide.visualizerData?.tens ?? 3;
  const ones = slide.visualizerData?.ones ?? 5;
  const number = slide.visualizerData?.number ?? (hundreds * 100 + tens * 10 + ones);

  return (
    <PlaceValueVisualizerScene hundreds={hundreds} tens={tens} ones={ones} number={number} />
  );
}

/* ─── Place Value Visualizer Scene ─── */
function PlaceValueVisualizerScene({ hundreds, tens, ones, number }: { hundreds: number; tens: number; ones: number; number: number }) {
  return (
    <>
      <div className="visualizer-blocks-container">
        {/* Hundreds 3D Cube */}
        <div className="base10-block hundreds-block" title={`${hundreds} Hundred(s) (${hundreds * 100})`}>
          <svg viewBox="0 0 100 100" width="80" height="80">
            <defs>
              <linearGradient id="hundredGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(37, 99, 235, 0.15)" />
                <stop offset="100%" stopColor="rgba(67, 56, 202, 0.08)" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="100" height="100" fill="url(#hundredGrad)" stroke="#2563eb" strokeWidth="2" rx="4" />
            <path d="M10,0 L10,100 M20,0 L20,100 M30,0 L30,100 M40,0 L40,100 M50,0 L50,100 M60,0 L60,100 M70,0 L70,100 M80,0 L80,100 M90,0 L90,100" stroke="rgba(37, 99, 235, 0.15)" strokeWidth="1" />
            <path d="M0,10 L100,10 M0,20 L100,20 M0,30 L100,30 M0,40 L100,40 M0,50 L100,50 M0,60 L100,60 M0,70 L100,70 M0,80 L100,80 M0,90 L100,90" stroke="rgba(37, 99, 235, 0.15)" strokeWidth="1" />
          </svg>
          <span className="block-label" style={{ color: "#2563eb" }}>{hundreds * 100}</span>
          <span style={{ fontSize: "0.7rem", color: "#64748b" }}>(Hundreds)</span>
        </div>

        {/* Tens Rods */}
        <div className="base10-group" title={`${tens} Ten(s) (${tens * 10})`}>
          <div className="tens-row">
            {Array.from({ length: Math.min(tens, 5) }).map((_, i) => (
              <div key={`ten-${i}`} className="base10-block tens-block">
                <svg viewBox="0 0 10 100" width="12" height="80">
                  <rect x="0" y="0" width="10" height="100" fill="rgba(249, 115, 22, 0.15)" stroke="#f97316" strokeWidth="1.5" rx="2" />
                  <path d="M0,10 L10,10 M0,20 L10,20 M0,30 L10,30 M0,40 L10,40 M0,50 L10,50 M0,60 L10,60 M0,70 L10,70 M0,80 L10,80 M0,90 L10,90" stroke="rgba(249, 115, 22, 0.25)" strokeWidth="1" />
                </svg>
              </div>
            ))}
          </div>
          <span className="block-label" style={{ color: "#f97316" }}>{tens * 10}</span>
          <span style={{ fontSize: "0.7rem", color: "#64748b" }}>(Tens)</span>
        </div>

        {/* Ones Cubes */}
        <div className="base10-group" title={`${ones} One(s)`}>
          <div className="ones-grid">
            {Array.from({ length: Math.min(ones, 5) }).map((_, i) => (
              <div key={`one-${i}`} className="base10-block ones-block">
                <svg viewBox="0 0 10 10" width="14" height="14">
                  <rect x="0" y="0" width="10" height="10" fill="rgba(139, 92, 246, 0.15)" stroke="#8b5cf6" strokeWidth="1.5" rx="2" />
                </svg>
              </div>
            ))}
          </div>
          <span className="block-label" style={{ color: "#8b5cf6" }}>{ones}</span>
          <span style={{ fontSize: "0.7rem", color: "#64748b" }}>(Ones)</span>
        </div>
      </div>
      <div className="visualizer-equation">
        <span style={{ color: "#2563eb", fontWeight: "bold" }}>{hundreds * 100}</span> +{" "}
        <span style={{ color: "#f97316", fontWeight: "bold" }}>{tens * 10}</span> +{" "}
        <span style={{ color: "#8b5cf6", fontWeight: "bold" }}>{ones}</span> ={" "}
        <span style={{ fontWeight: "800", marginLeft: "6px", fontSize: "1.2rem", background: "linear-gradient(135deg, #2563eb, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{number}</span>
      </div>
    </>
  );
}

/* ─── Triangle Visualizer Scene ─── */
function TriangleVisualizerScene() {
  return (
    <div className="visualizer-scene-animated" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
      <svg viewBox="0 0 200 140" width="160" height="110">
        <defs>
          <linearGradient id="triGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(37, 99, 235, 0.15)" />
            <stop offset="100%" stopColor="rgba(139, 92, 246, 0.08)" />
          </linearGradient>
        </defs>
        <polygon points="100,20 30,120 170,120" fill="url(#triGrad)" stroke="#2563eb" strokeWidth="3" />
        <circle cx="100" cy="20" r="5" fill="#ef4444" />
        <circle cx="30" cy="120" r="5" fill="#ef4444" />
        <circle cx="170" cy="120" r="5" fill="#ef4444" />
        <text x="100" y="12" fill="#ef4444" fontSize="10" fontWeight="bold" textAnchor="middle">A (60°)</text>
        <text x="15" y="130" fill="#ef4444" fontSize="10" fontWeight="bold">B (60°)</text>
        <text x="175" y="130" fill="#ef4444" fontSize="10" fontWeight="bold">C (60°)</text>
        <path d="M 90,37 A 15 15 0 0 0 110 37" fill="none" stroke="#f59e0b" strokeWidth="2" />
      </svg>
      <div style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#2563eb" }}>Equilateral Triangle (Sum = 180°)</div>
    </div>
  );
}

/* ─── Circle Visualizer Scene ─── */
function CircleVisualizerScene() {
  return (
    <div className="visualizer-scene-animated" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
      <svg viewBox="0 0 160 140" width="150" height="120">
        <circle cx="80" cy="70" r="55" fill="rgba(16, 185, 129, 0.1)" stroke="#10b981" strokeWidth="3" />
        <circle cx="80" cy="70" r="4" fill="#10b981" />
        <line x1="80" y1="70" x2="135" y2="70" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="3 3" />
        <text x="105" y="64" fill="#ef4444" fontSize="9" fontWeight="bold">Radius (r)</text>
        <line x1="25" y1="70" x2="80" y2="70" stroke="#3b82f6" strokeWidth="2" />
        <text x="45" y="64" fill="#3b82f6" fontSize="9" fontWeight="bold">d = 2r</text>
      </svg>
      <div style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#10b981" }}>Circle Geometry (Center, Radius & Diameter)</div>
    </div>
  );
}

/* ─── Symmetry Visualizer Scene ─── */
function SymmetryVisualizerScene() {
  return (
    <div className="visualizer-scene-animated" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
      <svg viewBox="0 0 160 120" width="150" height="110">
        <defs>
          <linearGradient id="symGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(168, 85, 247, 0.35)" />
            <stop offset="100%" stopColor="rgba(139, 92, 246, 0.15)" />
          </linearGradient>
        </defs>
        <path d="M 80,60 C 50,20 20,40 30,70 C 40,90 70,80 80,60 Z" fill="url(#symGrad)" stroke="#8b5cf6" strokeWidth="2" />
        <path d="M 80,60 C 110,20 140,40 130,70 C 120,90 90,80 80,60 Z" fill="url(#symGrad)" stroke="#8b5cf6" strokeWidth="2" />
        <line x1="80" y1="10" x2="80" y2="110" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 4" />
      </svg>
      <div style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#8b5cf6" }}>Line of Symmetry (Mirror Reflection)</div>
    </div>
  );
}

/* ─── Fractions Visualizer Scene ─── */
function FractionsVisualizerScene() {
  return (
    <div className="visualizer-scene-animated" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
      <svg viewBox="0 0 140 120" width="130" height="100">
        <circle cx="70" cy="60" r="45" fill="#fed7aa" stroke="#ea580c" strokeWidth="3" />
        <path d="M 70 60 L 70 15 A 45 45 0 0 1 115 60 Z" fill="#f97316" stroke="#ea580c" strokeWidth="2" />
        <path d="M 70 60 L 115 60 A 45 45 0 0 1 70 105 Z" fill="#ea580c" stroke="#c2410c" strokeWidth="2" />
        <line x1="70" y1="15" x2="70" y2="105" stroke="#ffffff" strokeWidth="2" />
        <line x1="25" y1="60" x2="115" y2="60" stroke="#ffffff" strokeWidth="2" />
      </svg>
      <div style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#ea580c" }}>Fraction Circles (3 / 4 Slices)</div>
    </div>
  );
}

/* ─── Money Visualizer Scene ─── */
function MoneyVisualizerScene() {
  return (
    <div className="visualizer-scene-animated" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg, #fef08a, #fbbf24)", border: "3px solid #eab308", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "#a16207", boxShadow: "0 4px 12px rgba(234, 179, 8, 0.3)" }}>$1</div>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #e2e8f0, #cbd5e1)", border: "3px solid #64748b", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "#334155", boxShadow: "0 4px 12px rgba(100, 116, 139, 0.2)" }}>25¢</div>
        <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, #fed7aa, #fdba74)", border: "3px solid #c2410c", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "#9a3412", boxShadow: "0 4px 12px rgba(194, 65, 12, 0.2)" }}>10¢</div>
      </div>
      <div style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#eab308" }}>Coins & Currency Counter</div>
    </div>
  );
}

/* ─── Measurement Visualizer Scene ─── */
function MeasurementVisualizerScene() {
  return (
    <div className="visualizer-scene-animated" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
      <svg viewBox="0 0 180 60" width="160" height="50">
        <defs>
          <linearGradient id="rulerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="100%" stopColor="#fde68a" />
          </linearGradient>
        </defs>
        <rect x="10" y="10" width="160" height="40" fill="url(#rulerGrad)" stroke="#d97706" strokeWidth="2" rx="4" />
        {Array.from({ length: 15 }).map((_, i) => (
          <line key={i} x1={20 + i * 10} y1="10" x2={20 + i * 10} y2={i % 5 === 0 ? "28" : "20"} stroke="#92400e" strokeWidth={i % 5 === 0 ? "2" : "1"} />
        ))}
      </svg>
      <div style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#d97706" }}>Measuring Scale & Ruler</div>
    </div>
  );
}

/* ─── Time Visualizer Scene ─── */
function TimeVisualizerScene() {
  return (
    <div className="visualizer-scene-animated" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
      <svg viewBox="0 0 120 120" width="100" height="100">
        <defs>
          <radialGradient id="clockGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f0f9ff" />
            <stop offset="100%" stopColor="#e0f2fe" />
          </radialGradient>
        </defs>
        <circle cx="60" cy="60" r="50" fill="url(#clockGrad)" stroke="#0284c7" strokeWidth="4" />
        <circle cx="60" cy="60" r="4" fill="#0369a1" />
        {/* Hour markers */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180);
          const x1 = 60 + 42 * Math.cos(angle);
          const y1 = 60 + 42 * Math.sin(angle);
          const x2 = 60 + 48 * Math.cos(angle);
          const y2 = 60 + 48 * Math.sin(angle);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#0369a1" strokeWidth={i % 3 === 0 ? "2.5" : "1"} />;
        })}
        <line x1="60" y1="60" x2="60" y2="28" stroke="#0369a1" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="60" y1="60" x2="82" y2="60" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <div style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#0284c7" }}>Analog Clock (3:00)</div>
    </div>
  );
}
