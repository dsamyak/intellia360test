"use client";
import { useState, useEffect } from "react";
import type { DashboardHeroSlide } from "@/types/student";

interface HeroSectionContainerProps {
  slide?: DashboardHeroSlide;
  slides?: DashboardHeroSlide[];
  totalSlides?: number;
  activeSlideIndex?: number;
  activeLessonId?: string;
  onCtaClick?: (slide: DashboardHeroSlide, slideIndex: number) => void;
}

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

  const hundreds = currentSlide.visualizerData?.hundreds ?? 1;
  const tens = currentSlide.visualizerData?.tens ?? 3;
  const ones = currentSlide.visualizerData?.ones ?? 5;
  const number = currentSlide.visualizerData?.number ?? (hundreds * 100 + tens * 10 + ones);

  const handleCtaClick = (e: React.MouseEvent) => {
    if (onCtaClick) {
      onCtaClick(currentSlide, activeIndex);
    }
  };

  return (
    <section className="hero-section-container">
      <div 
        key={`hero-banner-${activeIndex}-${activeLessonId}`} 
        className="hero-banner-content"
        style={{
          transition: "all 0.4s ease-in-out",
        }}
      >
        <div className="hero-tag-ribbon">
          <span className="star-icon">⭐</span> {currentSlide.tag}
        </div>

        <h1 className="hero-title">{currentSlide.title}</h1>
        <p className="hero-subtitle">{currentSlide.subtitle}</p>

        <div className="hero-mascot-cta">
          <div className="hero-mascot-placeholder" title="Kid Mascot">
            👦⭐
          </div>
          {currentSlide.ctaUrl ? (
            <a 
              href={currentSlide.ctaUrl} 
              target={currentSlide.ctaUrl.startsWith("http") ? "_blank" : "_self"} 
              rel="noopener noreferrer" 
              className="btn-primary-hero" 
              style={{textDecoration: "none", display: "inline-block"}}
              onClick={handleCtaClick}
            >
              {currentSlide.ctaText}
            </a>
          ) : (
            <button className="btn-primary-hero" onClick={handleCtaClick}>
              {currentSlide.ctaText}
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

      <div className="hero-visualizer-slot">
        <div 
          key={`hero-vis-${activeIndex}-${activeLessonId}`} 
          className="math-visualizer-card"
          style={{ transition: "all 0.4s ease-in-out" }}
        >
          {/* Dynamic Educational Visualizer Scene based on slide & lesson topic */}
          {renderVisualizerScene(currentSlide)}
        </div>
      </div>
    </section>
  );
}

function renderVisualizerScene(slide: DashboardHeroSlide) {
  const key = (slide.visualizerKey || "").toLowerCase();
  const title = (slide.title || "").toLowerCase();

  // Determine topic domain
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

  // Default: Place Value / Hundreds, Tens, Ones scene
  const hundreds = slide.visualizerData?.hundreds ?? 1;
  const tens = slide.visualizerData?.tens ?? 3;
  const ones = slide.visualizerData?.ones ?? 5;
  const number = slide.visualizerData?.number ?? (hundreds * 100 + tens * 10 + ones);

  return (
    <PlaceValueVisualizerScene hundreds={hundreds} tens={tens} ones={ones} number={number} />
  );
}

/* ─── Place Value Visualizer Scene (Hundreds Cube, Tens Rods, Ones Cubes) ─── */
function PlaceValueVisualizerScene({ hundreds, tens, ones, number }: { hundreds: number; tens: number; ones: number; number: number }) {
  return (
    <>
      <div className="visualizer-blocks-container">
        {/* Hundreds 3D Cube */}
        <div className="base10-block hundreds-block" title={`${hundreds} Hundred(s) (${hundreds * 100})`}>
          <svg viewBox="0 0 100 100" width="80" height="80">
            <rect x="0" y="0" width="100" height="100" fill="rgba(37, 99, 235, 0.1)" stroke="var(--color-primary)" strokeWidth="2" />
            <path d="M10,0 L10,100 M20,0 L20,100 M30,0 L30,100 M40,0 L40,100 M50,0 L50,100 M60,0 L60,100 M70,0 L70,100 M80,0 L80,100 M90,0 L90,100" stroke="rgba(37, 99, 235, 0.2)" strokeWidth="1" />
            <path d="M0,10 L100,10 M0,20 L100,20 M0,30 L100,30 M0,40 L100,40 M0,50 L100,50 M0,60 L100,60 M0,70 L100,70 M0,80 L100,80 M0,90 L100,90" stroke="rgba(37, 99, 235, 0.2)" strokeWidth="1" />
          </svg>
          <span className="block-label" style={{ color: "var(--color-primary)" }}>{hundreds * 100}</span>
        </div>

        {/* Tens Rods */}
        <div className="base10-group" title={`${tens} Ten(s) (${tens * 10})`}>
          <div className="tens-row">
            {Array.from({ length: Math.min(tens, 5) }).map((_, i) => (
              <div key={`ten-${i}`} className="base10-block tens-block">
                <svg viewBox="0 0 10 100" width="12" height="80">
                  <rect x="0" y="0" width="10" height="100" fill="rgba(249, 115, 22, 0.15)" stroke="var(--color-accent-orange)" strokeWidth="1.5" />
                  <path d="M0,10 L10,10 M0,20 L10,20 M0,30 L10,30 M0,40 L10,40 M0,50 L10,50 M0,60 L10,60 M0,70 L10,70 M0,80 L10,80 M0,90 L10,90" stroke="rgba(249, 115, 22, 0.3)" strokeWidth="1" />
                </svg>
              </div>
            ))}
          </div>
          <span className="block-label" style={{ color: "var(--color-accent-orange)" }}>{tens * 10}</span>
        </div>

        {/* Ones Cubes */}
        <div className="base10-group" title={`${ones} One(s)`}>
          <div className="ones-grid">
            {Array.from({ length: Math.min(ones, 5) }).map((_, i) => (
              <div key={`one-${i}`} className="base10-block ones-block">
                <svg viewBox="0 0 10 10" width="14" height="14">
                  <rect x="0" y="0" width="10" height="10" fill="rgba(139, 92, 246, 0.15)" stroke="var(--color-accent-purple)" strokeWidth="1.5" />
                </svg>
              </div>
            ))}
          </div>
          <span className="block-label" style={{ color: "var(--color-accent-purple)" }}>{ones}</span>
        </div>
      </div>
      <div className="visualizer-equation">
        <span style={{ color: "var(--color-primary)", fontWeight: "bold" }}>{hundreds * 100}</span> +{" "}
        <span style={{ color: "var(--color-accent-orange)", fontWeight: "bold" }}>{tens * 10}</span> +{" "}
        <span style={{ color: "var(--color-accent-purple)", fontWeight: "bold" }}>{ones}</span> ={" "}
        <span style={{ fontWeight: "800", marginLeft: "6px", fontSize: "1.2rem" }}>{number}</span>
      </div>
    </>
  );
}

/* ─── Triangle Visualizer Scene (3D Triangle, Vertices, Angles, Ruler & Compass) ─── */
function TriangleVisualizerScene() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
      <svg viewBox="0 0 200 140" width="160" height="110">
        <polygon points="100,20 30,120 170,120" fill="rgba(37, 99, 235, 0.12)" stroke="var(--color-primary)" strokeWidth="3" />
        {/* Vertices */}
        <circle cx="100" cy="20" r="5" fill="#ef4444" />
        <circle cx="30" cy="120" r="5" fill="#ef4444" />
        <circle cx="170" cy="120" r="5" fill="#ef4444" />
        {/* Labels */}
        <text x="100" y="12" fill="#ef4444" fontSize="10" fontWeight="bold" textAnchor="middle">A (60°)</text>
        <text x="15" y="130" fill="#ef4444" fontSize="10" fontWeight="bold">B (60°)</text>
        <text x="175" y="130" fill="#ef4444" fontSize="10" fontWeight="bold">C (60°)</text>
        {/* Arc */}
        <path d="M 90,37 A 15 15 0 0 0 110 37" fill="none" stroke="#f59e0b" strokeWidth="2" />
      </svg>
      <div style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#2563eb" }}>Equilateral Triangle (Sum = 180°)</div>
    </div>
  );
}

/* ─── Circle Visualizer Scene (Radius, Diameter, Chord, Center) ─── */
function CircleVisualizerScene() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
      <svg viewBox="0 0 160 140" width="150" height="120">
        <circle cx="80" cy="70" r="55" fill="rgba(16, 185, 129, 0.1)" stroke="#10b981" strokeWidth="3" />
        <circle cx="80" cy="70" r="4" fill="#10b981" />
        {/* Radius */}
        <line x1="80" y1="70" x2="135" y2="70" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="3 3" />
        <text x="105" y="64" fill="#ef4444" fontSize="9" fontWeight="bold">Radius (r)</text>
        {/* Diameter */}
        <line x1="25" y1="70" x2="80" y2="70" stroke="#3b82f6" strokeWidth="2" />
        <text x="45" y="64" fill="#3b82f6" fontSize="9" fontWeight="bold">d = 2r</text>
      </svg>
      <div style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#10b981" }}>Circle Geometry (Center, Radius & Diameter)</div>
    </div>
  );
}

/* ─── Symmetry Visualizer Scene (Mirror, Butterfly, Reflection) ─── */
function SymmetryVisualizerScene() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
      <svg viewBox="0 0 160 120" width="150" height="110">
        {/* Left wing */}
        <path d="M 80,60 C 50,20 20,40 30,70 C 40,90 70,80 80,60 Z" fill="rgba(168, 85, 247, 0.3)" stroke="#8b5cf6" strokeWidth="2" />
        {/* Right wing */}
        <path d="M 80,60 C 110,20 140,40 130,70 C 120,90 90,80 80,60 Z" fill="rgba(168, 85, 247, 0.3)" stroke="#8b5cf6" strokeWidth="2" />
        {/* Reflection line */}
        <line x1="80" y1="10" x2="80" y2="110" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 4" />
      </svg>
      <div style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#8b5cf6" }}>Line of Symmetry (Mirror Reflection)</div>
    </div>
  );
}

/* ─── Fractions Visualizer Scene (Pizza & Fraction Circles) ─── */
function FractionsVisualizerScene() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
      <svg viewBox="0 0 140 120" width="130" height="100">
        <circle cx="70" cy="60" r="45" fill="#fed7aa" stroke="#ea580c" strokeWidth="3" />
        {/* Slices */}
        <path d="M 70 60 L 70 15 A 45 45 0 0 1 115 60 Z" fill="#f97316" stroke="#ea580c" strokeWidth="2" />
        <path d="M 70 60 L 115 60 A 45 45 0 0 1 70 105 Z" fill="#ea580c" stroke="#c2410c" strokeWidth="2" />
        <line x1="70" y1="15" x2="70" y2="105" stroke="#ffffff" strokeWidth="2" />
        <line x1="25" y1="60" x2="115" y2="60" stroke="#ffffff" strokeWidth="2" />
      </svg>
      <div style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#ea580c" }}>Fraction Circles (3 / 4 Slices)</div>
    </div>
  );
}

/* ─── Money Visualizer Scene (Coins, Cash & Counter) ─── */
function MoneyVisualizerScene() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#fef08a", border: "3px solid #eab308", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "#a16207" }}>$1</div>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#e2e8f0", border: "3px solid #64748b", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "#334155" }}>25¢</div>
        <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#fed7aa", border: "3px solid #c2410c", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "#9a3412" }}>10¢</div>
      </div>
      <div style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#eab308" }}>Coins & Currency Counter</div>
    </div>
  );
}

/* ─── Measurement Visualizer Scene (Scale & Ruler) ─── */
function MeasurementVisualizerScene() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
      <svg viewBox="0 0 180 60" width="160" height="50">
        <rect x="10" y="10" width="160" height="40" fill="#fef3c7" stroke="#d97706" strokeWidth="2" rx="4" />
        {/* Ticks */}
        {Array.from({ length: 15 }).map((_, i) => (
          <line key={i} x1={20 + i * 10} y1="10" x2={20 + i * 10} y2={i % 5 === 0 ? "28" : "20"} stroke="#92400e" strokeWidth={i % 5 === 0 ? "2" : "1"} />
        ))}
      </svg>
      <div style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#d97706" }}>Measuring Scale & Ruler</div>
    </div>
  );
}

/* ─── Time Visualizer Scene (Clock & Calendar) ─── */
function TimeVisualizerScene() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
      <svg viewBox="0 0 120 120" width="100" height="100">
        <circle cx="60" cy="60" r="50" fill="#f0f9ff" stroke="#0284c7" strokeWidth="4" />
        <circle cx="60" cy="60" r="4" fill="#0369a1" />
        {/* Hands */}
        <line x1="60" y1="60" x2="60" y2="28" stroke="#0369a1" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="60" y1="60" x2="82" y2="60" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <div style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#0284c7" }}>Analog Clock (3:00)</div>
    </div>
  );
}

