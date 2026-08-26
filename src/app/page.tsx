"use client";

import { useState } from "react";

import Link from "next/link";
import Image from "next/image";
import "./home.css";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";
/* ============================================================
   FEATURES
============================================================ */

const features = [
  {
    title: "Personalized Learning",
    text: "AI creates a learning path designed around every student's needs.",
  },
  {
    title: "Gamified Experience",
    text: "Earn XP, unlock badges, build streaks and complete exciting challenges.",
  },
  {
    title: "Interactive Lessons",
    text: "Learn through stories, visuals, animations and engaging activities.",
  },
  {
    title: "Level Up",
    text: "Track XP, skills, streaks and learning progress as you grow.",
  },
  {
    title: "Safe & Secure",
    text: "A trusted and secure learning environment for students.",
  },
  {
    title: "AI Learning Buddy",
    text: "Get hints, explanations and personalized help whenever you need it.",
  },
];

/* ============================================================
   LEARNING JOURNEY
   Wonder → Story → Simulate → Play → Reflect
============================================================ */

const steps = [
  {
    number: "01",
    image: "/assets/home/wonder-3d.png",
    title: "Wonder",
    text: "Spark curiosity with an exciting question, visual or real-world problem.",
  },
  {
    number: "02",
    image: "/assets/home/story-3d.png",
    title: "Story",
    text: "Learn the concept through engaging stories, explanations and visual examples.",
  },
  {
    number: "03",
    image: "/assets/home/simulate-3d.png",
    title: "Simulate",
    text: "Explore the concept through interactive visuals and hands-on simulations.",
  },
  {
    number: "04",
    image: "/assets/home/play-3d.png",
    title: "Play",
    text: "Apply what you learned through games, challenges, quizzes and activities.",
  },
  {
    number: "05",
    image: "/assets/home/reflect-3d.png",
    title: "Reflect",
    text: "Review your learning, track your progress and celebrate your achievements.",
  },
];

/* ============================================================
   SHOWCASE
============================================================ */

const showcase = [
  {
    image: "/assets/home/interactive-demo.png",
    title: "Interactive Lessons",
    description:
      "Visual, interactive and concept-based learning that makes mathematics easy to understand.",
  },
  {
    image: "/assets/home/gamified-demo.png",
    title: "Gamified Practice",
    description:
      "Practice through games, challenges and quizzes while earning XP and rewards.",
  },
  {
    image: "/assets/home/progress-demo.png",
    title: "AI Progress Tracking",
    description:
      "AI tracks performance, identifies learning gaps and personalizes the learning journey.",
  },
];

/* ============================================================
   COURSES
============================================================ */

const courses = [
  {
    grade: "LKG",
    title: "LKG Mathematics",
    subtitle: "Numbers • Shapes • Patterns",
    color: "orange",
    students: "Early Learners",
    lessons: "12+ Lessons",
  },
  {
    grade: "UKG",
    title: "UKG Mathematics",
    subtitle: "Counting • Addition • Shapes",
    color: "purple",
    students: "Early Learners",
    lessons: "18+ Lessons",
  },
  {
    grade: "1",
    title: "Grade 1 Math",
    subtitle: "Numbers • Counting • Addition",
    color: "blue",
    students: "Primary",
    lessons: "24+ Lessons",
  },
  {
    grade: "2",
    title: "Grade 2 Math",
    subtitle: "Addition • Subtraction • Patterns",
    color: "green",
    students: "Primary",
    lessons: "28+ Lessons",
  },
  {
    grade: "3",
    title: "Grade 3 Math",
    subtitle: "Multiplication • Division • Fractions",
    color: "pink",
    students: "Primary",
    lessons: "32+ Lessons",
  },
  {
    grade: "4",
    title: "Grade 4 Math",
    subtitle: "Fractions • Geometry • Decimals",
    color: "orange",
    students: "Primary",
    lessons: "36+ Lessons",
  },
  {
    grade: "5",
    title: "Grade 5 Math",
    subtitle: "Fractions • Geometry • Problem Solving",
    color: "purple",
    students: "Primary",
    lessons: "40+ Lessons",
  },
  {
    grade: "6",
    title: "Grade 6 Math",
    subtitle: "Algebra • Ratios • Geometry",
    color: "blue",
    students: "Middle School",
    lessons: "44+ Lessons",
  },
  {
    grade: "7",
    title: "Grade 7 Math",
    subtitle: "Algebra • Equations • Data",
    color: "green",
    students: "Middle School",
    lessons: "48+ Lessons",
  },
  {
    grade: "8",
    title: "Grade 8 Math",
    subtitle: "Linear Equations • Geometry • Graphs",
    color: "pink",
    students: "Middle School",
    lessons: "52+ Lessons",
  },
  {
    grade: "9",
    title: "Grade 9 Math",
    subtitle: "Algebra • Coordinate Geometry",
    color: "orange",
    students: "Secondary",
    lessons: "56+ Lessons",
  },
  {
    grade: "10",
    title: "Grade 10 Math",
    subtitle: "Quadratics • Trigonometry • Statistics",
    color: "purple",
    students: "Secondary",
    lessons: "60+ Lessons",
  },
  {
    grade: "11",
    title: "Grade 11 Math",
    subtitle: "Functions • Calculus • Probability",
    color: "blue",
    students: "Senior Secondary",
    lessons: "65+ Lessons",
  },
  {
    grade: "12",
    title: "Grade 12 Math",
    subtitle: "Calculus • Vectors • Probability",
    color: "green",
    students: "Senior Secondary",
    lessons: "70+ Lessons",
  },
];

/* ============================================================
   AUDIENCE
============================================================ */

const audiences = [
  {
    image: "/assets/home/parents-3d.png",
    title: "For Parents",
    color: "blue",
    points: [
      "Track your child's progress",
      "Identify learning gaps",
      "Encourage consistent practice",
      "Support independent learning",
    ],
  },
  {
    image: "/assets/home/school-3d.png",
    title: "For Schools",
    color: "purple",
    points: [
      "Digital learning infrastructure",
      "Student management",
      "Progress monitoring",
      "AI-assisted learning",
      "Scalable & secure platform",
    ],
  },
  {
    image: "/assets/home/coaching-3d.png",
    title: "For Coaching Centres",
    color: "orange",
    points: [
      "Interactive curriculum",
      "Performance analytics",
      "Gamification",
      "Easy deployment",
    ],
  },
  {
    image: "/assets/home/student-achievement-3d.png",
    title: "Loved by Learners",
    color: "pink",
    points: [
      "Fun mathematics",
      "Games and rewards",
      "Interactive learning",
      "Personalized experience",
    ],
  },
];

/* ============================================================
   CLICK-OPEN DROPDOWNS
   The CSS classes dropdown-open, dropdown-trigger-active and
   mega-menu-open are intentionally controlled by React state.
   This keeps the header in the same position while the dropdown
   opens and only changes the trigger to a light-blue active shade.
============================================================ */

/* ============================================================
   PAGE
============================================================ */

export default function HomePage() {
  const [openDropdown, setOpenDropdown] = useState<"math" | "schools" | null>(null);

  const handleDropdown = (dropdown: "math" | "schools") => {
    setOpenDropdown((current) => (current === dropdown ? null : dropdown));
  };

  return (
    <main className="home-page">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="home-header">





        {/* ==================================================
      MAIN HEADER
  ================================================== */}

        <div className="header-main">

          <div className="home-container header-inner">

            {/* LOGO */}

            <Link
              href="/"
              className="home-logo"
              aria-label="Intellia360 Home"
            >
              <Image
                src="/assets/logo/intellia360-log.png"
                alt="Intellia360"
                width={170}
                height={70}
                priority
                className="home-logo-image"
              />
            </Link>


            {/* ==================================================
          NAVIGATION
      ================================================== */}

            <nav className="desktop-nav">


              {/* HOME */}

              <Link
                href="/"
                className="header-nav-link active"
              >
                Home
              </Link>


              {/* ==================================================
            MATH PROGRAM DROPDOWN
        ================================================== */}

              <div
                className={`header-mega-dropdown ${openDropdown === "math" ? "dropdown-open" : ""
                  }`}
              >

                <button
                  type="button"
                  className={`header-dropdown-trigger ${openDropdown === "math" ? "dropdown-trigger-active" : ""
                    }`}
                  aria-expanded={openDropdown === "math"}
                  onClick={() => handleDropdown("math")}
                >
                  Math Program
                  <span className="dropdown-arrow">
                    {openDropdown === "math" ? "⌃" : "⌄"}
                  </span>
                </button>


                <div
                  className={`header-mega-menu math-menu ${openDropdown === "math" ? "mega-menu-open" : ""
                    }`}
                >

                  {/* MATH GRADES */}

                  <div className="mega-column">

                    <h4>
                      MATH GRADES
                    </h4>

                    <div className="mega-divider" />

                    <Link href="/login?grade=1">
                      Grade 1
                    </Link>

                    <Link href="/login?grade=2">
                      Grade 2
                    </Link>

                    <Link href="/login?grade=3">
                      Grade 3
                    </Link>

                    <Link href="/login?grade=4">
                      Grade 4
                    </Link>

                    <Link href="/login?grade=5">
                      Grade 5
                    </Link>


                    <Link
                      href="/login"
                      className="mega-dashboard-btn"
                    >
                      STUDENT DASHBOARD
                    </Link>

                  </div>




                  <div className="mega-column">

                    <h4>
                      COMING SHORTLY
                    </h4>

                    <div className="mega-divider" />

                    <Link href="/login?grade=6">
                      Grade 6
                    </Link>

                    <Link href="/login?grade=7">
                      Grade 7
                    </Link>

                    <Link href="/login?grade=8">
                      Grade 8
                    </Link>

                    <Link href="/login?grade=9">
                      Grade 9
                    </Link>

                    <Link href="/login?grade=10">
                      Grade 10
                    </Link>

                  </div>


                  {/* PROGRAM DESCRIPTION */}

                  <div className="mega-column mega-description">

                    <h4>
                      MATH PROGRAM
                    </h4>

                    <p>
                      The Intellia360 Mathematics Program is a
                      comprehensive, gamified learning solution
                      designed to help students develop strong
                      mathematical concepts, logical thinking,
                      and real-world problem-solving skills.
                      Aligned with leading national and
                      international curricula, the program
                      transforms traditional mathematics education
                      into an engaging and interactive learning
                      experience.
                    </p>

                    <div className="mega-description-line" />

                  </div>


                  {/* IMAGE */}

                  <div className="mega-image-wrap">

                    <Image
                      src="/assets/home/math-program-menu.png"
                      alt="Intellia360 Math Program"
                      width={580}
                      height={330}
                      className="mega-image"
                    />

                  </div>


                  {/* BOTTOM TITLE */}

                  <div className="mega-bottom-title">
                    <span>
                      Play. Learn. Evolve
                    </span>

                    <div className="mega-title-decoration">
                      <i />
                      <i />
                      <i />
                      <b />
                    </div>
                  </div>

                </div>

              </div>


              {/* THINK TALES */}

              <Link
                href="#thinktales"
                className="header-nav-link"
              >
                ThinkTales
              </Link>


              {/* INTELLIAPLAY */}

              <Link
                href="#intelliaplay"
                className="header-nav-link"
              >
                IntelliaPlay
              </Link>


              {/* ==================================================
            SCHOOLS DROPDOWN
        ================================================== */}

              <div
                className={`header-mega-dropdown ${openDropdown === "schools" ? "dropdown-open" : ""
                  }`}
              >

                <button
                  type="button"
                  className={`header-dropdown-trigger ${openDropdown === "schools" ? "dropdown-trigger-active" : ""
                    }`}
                  aria-expanded={openDropdown === "schools"}
                  onClick={() => handleDropdown("schools")}
                >
                  Intellia360 For Schools
                  <span className="dropdown-arrow">
                    {openDropdown === "schools" ? "⌃" : "⌄"}
                  </span>
                </button>


                <div
                  className={`header-mega-menu school-menu ${openDropdown === "schools" ? "mega-menu-open" : ""
                    }`}
                >

                  {/* ABOUT */}

                  <div className="school-menu-left">

                    <h4>
                      ABOUT
                    </h4>

                    <Link href="#schools">
                      Intellia 360 School Program
                    </Link>

                    <Link href="#contact">
                      Book A Free Demo
                    </Link>

                    <Link href="#contact">
                      Partner With Us
                    </Link>

                    <Link href="#contact">
                      FAQs
                    </Link>


                    <Link
                      href="/login"
                      className="school-start-btn"
                    >
                      GET STARTED TODAY
                    </Link>

                  </div>


                  {/* ABOUT PROGRAM */}

                  <div className="school-menu-description">

                    <h4>
                      ABOUT PROGRAM
                    </h4>

                    <p>
                      More than a digital learning platform,
                      Intellia360 is a complete mathematics
                      ecosystem designed to improve conceptual
                      understanding, strengthen logical reasoning,
                      and develop critical thinking skills.
                    </p>

                    <p>
                      Built for modern classrooms, it empowers
                      every learner through personalized
                      experiences while giving educators powerful
                      tools to monitor progress and drive success.
                    </p>

                  </div>


                  {/* SCHOOL IMAGE */}

                  <div className="school-menu-image-wrap">

                    <Image
                      src="/assets/home/school.png"
                      alt="Intellia360 School Program"
                      width={650}
                      height={360}
                      className="school-menu-image"
                    />

                  </div>


                  {/* BOTTOM TITLE */}

                  <div className="school-bottom-title">
                    Let's Build Future-Ready Learners Together. 🚀

                    <div className="mega-title-decoration">
                      <i />
                      <i />
                      <i />
                      <b />
                    </div>

                  </div>

                </div>

              </div>

            </nav>


            {/* ==================================================
          HEADER ACTIONS
      ================================================== */}

            <div className="header-actions">


              {/* SEARCH */}

              <button
                type="button"
                className="header-icon-btn"
                aria-label="Search"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="7"
                  />

                  <path d="M16.5 16.5L21 21" />
                </svg>
              </button>


              {/* CART */}

              <button
                type="button"
                className="header-cart-btn"
                aria-label="Shopping cart"
              >

                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 7H6" />

                  <circle
                    cx="10"
                    cy="20"
                    r="1.2"
                  />

                  <circle
                    cx="18"
                    cy="20"
                    r="1.2"
                  />
                </svg>


                <span className="cart-count">
                  0
                </span>

              </button>


              {/* LOGIN */}

              <Link
                href="/login"
                className="header-login-btn"
              >
                Login
              </Link>

            </div>

          </div>

        </div>

      </header>
      {/* ======================================================
    HERO
====================================================== */}

      <section className="hero-section">

        <div className="home-container hero-grid">

          {/* HERO CONTENT */}

          <div className="hero-content">

            <div className="hero-eyebrow">
              Play. Learn. Evolve
            </div>

            <h1>
              Intelligence Through
              <br />
              Exploration.
            </h1>

            <div className="hero-underline" />

            <Link
              href="/courses"
              className="hero-course-btn"
            >
              Explore Course Packages
            </Link>


            {/* RATING CARD */}

            <div className="hero-rating-card">

              <div className="rating-score">
                4.85
              </div>

              <div className="rating-content">

                <strong>
                  Average Rating
                </strong>

                <span>
                  183,406 Learner reviews
                </span>

              </div>

            </div>

          </div>




        </div>

      </section>

      {/* ======================================================
          FEATURES
      ====================================================== */}

      {/* ======================================================
    WHY INTELLIA360
====================================================== */}

      <section
        className="features-section"
        id="learning"
      >
        <div className="home-container">

          <div className="section-heading">

            <span className="section-eyebrow">
              WHY INTELLIA360?
            </span>

            <h2>
              Learning That Feels Like
              <span> an Adventure</span>
            </h2>

            <p>
              Everything students need to learn, practice, play and grow.
            </p>

          </div>


          <div className="features-grid">

            {features.map((feature) => (

              <div
                className="feature-item"
                key={feature.title}
              >



                <div className="feature-content">

                  <h3>
                    {feature.title}
                  </h3>

                  <p>
                    {feature.text}
                  </p>

                </div>

              </div>

            ))}

          </div>

        </div>

        {/* Decorative paper planes */}
        <div className="feature-plane feature-plane-left">
          ➤
        </div>

        <div className="feature-plane feature-plane-right">
          ➤
        </div>

      </section>

      {/* ======================================================
          COURSES
      ====================================================== */}

      <section
        className="courses-section"
        id="courses"
      >

        <div className="home-container">

          <div className="section-heading courses-heading">

            <span className="section-eyebrow">
              OUR COURSES
            </span>

            <h2>
              Explore Math
              <span>
                {" "}Program
              </span>
            </h2>

            <p>
              Choose your grade and start your personalized
              math learning adventure.
            </p>

          </div>


          <div className="courses-carousel">

            <button
              type="button"
              className="course-arrow course-arrow-left"
              aria-label="Previous courses"
            >
              ←
            </button>


            <div className="courses-grid">

              {courses.slice(0, 4).map((course) => (

                <div
                  className={`course-card ${course.color}`}
                  key={course.grade}
                >

                  <div className="course-visual">

                    <div className="course-stars">
                      ✦
                    </div>


                    <div className="grade-badge">

                      <span className="grade-label">
                        GRADE
                      </span>

                      <strong>
                        {course.grade}
                      </strong>

                      <span className="badge-star">
                        ★
                      </span>

                    </div>


                    <div className="course-sparkle sparkle-one">
                      ✦
                    </div>

                    <div className="course-sparkle sparkle-two">
                      ✦
                    </div>

                  </div>


                  <div className="course-content">

                    <div className="course-meta">

                      <span>
                        {course.students}
                      </span>

                      <span className="course-price">
                        Explore
                      </span>

                    </div>


                    <h3>
                      {course.title}
                    </h3>


                    <p>
                      {course.subtitle}
                    </p>


                    <div className="course-info">

                      <span>
                        🎓 {course.students}
                      </span>

                      <span>
                        📚 {course.lessons}
                      </span>

                    </div>


                    <Link
                      href={`/login?grade=${course.grade.toLowerCase()}`}
                      className="course-button"
                    >
                      Start Learning →
                    </Link>

                  </div>

                </div>

              ))}

            </div>


            <button
              type="button"
              className="course-arrow course-arrow-right"
              aria-label="Next courses"
            >
              →
            </button>

          </div>


          <div className="courses-bottom">

            <div className="course-progress">

              <span className="active" />
              <span />
              <span />
              <span />
              <span />

            </div>


            <Link
              href="#courses"
              className="view-all-courses"
            >
              View All Courses
            </Link>

          </div>

        </div>

      </section>


      {/* ======================================================
          HOW IT WORKS
          Wonder → Story → Simulate → Play → Reflect
      ====================================================== */}

      <section
        className="how-section"
        id="how-it-works"
      >
        <div className="how-overlay" />

        <div className="home-container how-container">

          {/* =========================
        SECTION HEADING
    ========================== */}

          <div className="section-heading how-heading">

            <span className="section-eyebrow">
              YOUR LEARNING JOURNEY
            </span>

            <h2>
              How
              <span> Intellia360 </span>
              Works
            </h2>

            <p>
              Wonder. Discover. Explore. Play. Reflect.
            </p>

          </div>


          {/* =========================
        JOURNEY TIMELINE
    ========================== */}

          <div className="learning-journey">

            <div className="journey-line" />

            {steps.map((step, index) => (

              <div
                className={`journey-step ${index % 2 === 0
                  ? "journey-step-top"
                  : "journey-step-bottom"
                  }`}
                key={step.number}
              >

                {/* STEP CARD */}

                <div className="journey-card">

                  <div className="journey-image-wrap">

                    <div className="journey-image-glow" />

                    <img
                      src={step.image}
                      alt={step.title}
                      className="journey-image"
                    />

                  </div>

                  <div className="journey-card-content">

                    <span className="journey-number">
                      {String(step.number).padStart(2, "0")}
                    </span>

                    <h3>
                      {step.title}
                    </h3>

                    <p>
                      {step.text}
                    </p>

                  </div>

                </div>


                {/* TIMELINE DOT */}

                <div className="journey-node">

                  <span>
                    {index + 1}
                  </span>

                </div>


                {/* CONNECTOR */}

                {index < steps.length - 1 && (
                  <div className="journey-connector">
                    <span>→</span>
                  </div>
                )}

              </div>

            ))}

          </div>


          {/* =========================
        BOTTOM MESSAGE
    ========================== */}

          <div className="journey-bottom">

            <span className="journey-bottom-icon">
              ✦
            </span>

            <span>
              Learn. Play. Grow. Achieve.
            </span>

            <span className="journey-bottom-icon">
              ✦
            </span>

          </div>

        </div>
      </section>


      {/* ======================================================
          SHOWCASE
      ====================================================== */}

      <section className="showcase-section">

        <div className="home-container">

          <div className="section-heading">

            <span className="section-eyebrow">
              EXPERIENCE INTELLIA360
            </span>

            <h2>
              See
              <span>
                {" "}Intellia360
              </span>
              {" "}in Action
            </h2>

          </div>


          <div className="showcase-grid">

            {showcase.map((item, index) => (

              <div
                className="showcase-card"
                key={item.title}
              >

                <div
                  className={`showcase-image showcase-${index}`}
                >

                  <div className="showcase-label">
                    {item.title}
                  </div>


                  <img
                    src={item.image}
                    alt={item.title}
                    className="showcase-3d-image"
                  />


                  <button
                    type="button"
                    className="showcase-play"
                    aria-label={`Play ${item.title}`}
                  >
                    ▶
                  </button>


                  <div className="showcase-time">
                    01:02
                  </div>

                </div>


                <p>
                  {item.description}
                </p>

              </div>

            ))}

          </div>


          <div className="carousel-dots">

            <span className="selected" />
            <span />
            <span />
            <span />
            <span />

          </div>

        </div>

      </section>


      {/* ======================================================
          GAMIFIED STATS
      ====================================================== */}

      <section className="stats-section">

        <div className="home-container stats-grid">

          <div className="stat">

            <div className="stat-visual">
              🎓
            </div>

            <div>

              <strong>
                58K+
              </strong>

              <p>
                Students Enrolled
              </p>

            </div>

          </div>


          <div className="stat">

            <div className="stat-visual">
              ⭐
            </div>

            <div>

              <strong>
                25K+
              </strong>

              <p>
                Lessons Completed
              </p>

            </div>

          </div>


          <div className="stat">

            <div className="stat-visual">
              💎
            </div>

            <div>

              <strong>
                98%
              </strong>

              <p>
                Happy Learners
              </p>

            </div>

          </div>


          <div className="stat">

            <div className="stat-visual">
              🏫
            </div>

            <div>

              <strong>
                10K+
              </strong>

              <p>
                Schools & Institutes
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* ======================================================
          AUDIENCES
      ====================================================== */}

      <section className="audience-section" id="parents">
        <div className="home-container">

          <div className="section-heading audience-heading">
            <span className="section-eyebrow">
              BUILT FOR EVERYONE
            </span>

            <h2>
              One Platform.
              <span> Everyone Grows.</span>
            </h2>

            <p>
              One connected learning ecosystem for students,
              parents, schools and coaching centres.
            </p>
          </div>


          <div className="audience-ecosystem">

            {/* CONNECTING LINES */}
            <div className="ecosystem-line line-top-left" />
            <div className="ecosystem-line line-top-right" />
            <div className="ecosystem-line line-bottom-left" />
            <div className="ecosystem-line line-bottom-right" />


            {/* CENTER HUB */}
            <div className="ecosystem-center">

              <div className="ecosystem-orbit orbit-one" />
              <div className="ecosystem-orbit orbit-two" />

              <div className="ecosystem-hub">

                <img
                  src="/assets/logo/intellia360-log.png"
                  alt="Intellia360"
                  className="ecosystem-logo-image"
                />

                <small>
                  ONE LEARNING ECOSYSTEM
                </small>

              </div>

              <div className="ecosystem-dot dot-blue" />
              <div className="ecosystem-dot dot-purple" />
              <div className="ecosystem-dot dot-orange" />
              <div className="ecosystem-dot dot-green" />

            </div>


            {/* AUDIENCE CARDS */}
            <div className="audience-card-grid">

              {audiences.map((audience, index) => (

                <div
                  className={`audience-card ${audience.color} audience-card-${index + 1}`}
                  key={audience.title}
                  id={
                    audience.title === "For Schools"
                      ? "schools"
                      : undefined
                  }
                >

                  <div className="audience-card-content">

                    <span className="audience-label">
                      {audience.title === "For Parents" && "FAMILY"}
                      {audience.title === "For Schools" && "EDUCATION"}
                      {audience.title === "For Coaching Centres" && "COACHING"}
                      {audience.title === "Loved by Learners" && "STUDENTS"}
                    </span>

                    <h2>
                      {audience.title}
                    </h2>

                    <ul>
                      {audience.points.map((point) => (
                        <li key={point}>
                          <span className="check-icon">✓</span>
                          {point}
                        </li>
                      ))}
                    </ul>

                    <Link href="/login" className="audience-btn">
                      Explore
                      <span>→</span>
                    </Link>

                  </div>




                </div>

              ))}

            </div>

          </div>

        </div>
      </section>

      {/* ======================================================
          CTA
      ====================================================== */}

      <section className="cta-section">

        <div className="home-container">

          <div className="cta-card">

            <div className="cta-visual">

              <img
                src="/assets/home/rocket-3d.png"
                alt="Start learning adventure"
              />

            </div>


            <div className="cta-content">

              <span className="cta-eyebrow">
                ✨ YOUR NEXT ADVENTURE
              </span>


              <h2>

                Ready to Become a

                <span>
                  {" "}Math Champion?
                </span>

              </h2>


              <p>
                Learn. Play. Earn XP. Level up.
                Your math adventure starts here.
              </p>

            </div>


            <div className="cta-actions">

              <Link
                href="/login"
                className="cta-primary"
              >
                Start Learning →
              </Link>


              <Link
                href="#courses"
                className="cta-secondary"
              >
                Explore Intellia360
              </Link>

            </div>

          </div>

        </div>

      </section>


      {/* ======================================================
          FOOTER
      ====================================================== */}

      <footer className="site-footer" id="contact">

        {/* =========================
      FOOTER LOGO
  ========================= */}

        <div className="footer-logo-wrap">

          <Link href="/" className="footer-main-logo">
            <Image
              src="/assets/logo/intellia360-log.png"
              alt="Intellia360"
              width={190}
              height={80}
              className="footer-logo-image"
            />
          </Link>

        </div>


        {/* =========================
      FOOTER NAVIGATION
  ========================= */}

        <nav className="footer-nav">

          <Link href="/">
            Home
          </Link>

          <Link href="#courses">
            Math Program
          </Link>

          <Link href="#thinktales">
            ThinkTales
          </Link>

          <Link href="#intelliaplay">
            IntelliaPlay
          </Link>

          <Link href="#schools">
            Intellia360 For Schools
          </Link>

          <Link href="#about">
            About Us
          </Link>

          <Link href="#contact">
            Contact
          </Link>

        </nav>


        {/* =========================
      SOCIAL ICONS
  ========================= */}

        <div className="footer-social">

          <Link
            href="https://www.facebook.com/people/Intellia-360/61591746767595/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
          >
            <FaFacebookF />
          </Link>


          <Link
            href="https://www.instagram.com/intellia360/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <FaInstagram />
          </Link>


          <Link
            href="https://www.linkedin.com/company/intellia360/posts/?feedView=all"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
          >
            <FaLinkedinIn />
          </Link>


          <Link
            href="https://www.youtube.com/@Intellia360"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube"
          >
            <FaYoutube />
          </Link>

        </div>


        {/* =========================
      CUSTOMER SUPPORT
  ========================= */}

        <div className="footer-support">

          <h3>
            Customer Support:
          </h3>

          <a
            href="mailto:contact@intellia360.com"
            className="footer-email"
          >
            <span>✉</span>
            contact@intellia360.com
          </a>

        </div>


        {/* =========================
      ADDRESS
  ========================= */}

        <div className="footer-address">

          <span>
            Intellia360
          </span>

          <span>
            Pune, Maharashtra, India
          </span>

        </div>


        {/* =========================
      BIG CTA
  ========================= */}

        <div className="footer-cta">

          <h2>
            Learn Math the
            <br />
            <span>#Intellia360Way</span>
          </h2>


          <div className="footer-cta-box">

            <p>
              Hurry up!! Limited seats are available
            </p>

            <Link
              href="/login"
              className="footer-cta-button"
            >
              Book A Free Math Class
              <span>→</span>
            </Link>

          </div>

        </div>


        {/* =========================
      COPYRIGHT
  ========================= */}

        <div className="footer-copyright">

          <p>
            © {new Date().getFullYear()} Intellia360.
            All rights reserved.
          </p>

        </div>

      </footer>
    </main>
  );
}