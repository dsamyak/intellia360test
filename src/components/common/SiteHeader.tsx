"use client";

/**
 * The public site header.
 *
 * Lifted verbatim out of the home page so every public route — and the auth
 * pages the "Login" button leads to — render the same navigation instead of
 * each carrying its own. The markup and class names are unchanged, so the
 * existing home.css rules keep applying.
 *
 * The wrapper carries `home-page` purely as a scope hook: nearly every header
 * rule in home.css is written as `.home-page .header-…`. `.site-chrome` then
 * neutralises the page-level parts of that class (the 100vh min-height and the
 * page background) so the header stays a header wherever it is used.
 */

// The chrome ships its own styles, so any route can mount it without
// having to remember to import home.css.
import "@/app/home.css";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type DropdownKey = "math" | "schools";

export default function SiteHeader() {
  const [openDropdown, setOpenDropdown] = useState<DropdownKey | null>(null);

  // Which menu the user pinned open by clicking. Never rendered directly — it
  // only decides whether the next click on the same trigger toggles it shut —
  // so it is a ref rather than state, and changing it costs no re-render.
  const pinnedDropdown = useRef<DropdownKey | null>(null);

  const handleDropdown = (dropdown: DropdownKey) => {
    const next = pinnedDropdown.current === dropdown ? null : dropdown;
    pinnedDropdown.current = next;
    setOpenDropdown(next);
  };

  // A click anywhere outside an open mega-menu closes it.
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".header-mega-dropdown")) {
        pinnedDropdown.current = null;
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div className="site-chrome home-page">
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
                width={350}
                height={150}
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

                    <Link href="/login">
                      LKG
                    </Link>

                    <Link href="/login">
                      UKG
                    </Link>

                    <Link href="/login">
                      Grade 1
                    </Link>

                    <Link href="/login">
                      Grade 2
                    </Link>

                    <Link href="/login">
                      Grade 3
                    </Link>

                    <Link href="/login">
                      Grade 4
                    </Link>

                    <Link href="/login">
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

                    <Link href="/login">
                      Grade 6
                    </Link>

                    <Link href="/login">
                      Grade 7
                    </Link>

                    <Link href="/login">
                      Grade 8
                    </Link>

                    <Link href="/login">
                      Grade 9
                    </Link>

                    <Link href="/login">
                      Grade 10
                    </Link>

                    <Link href="/login">
                      Grade 11
                    </Link>

                    <Link href="/login">
                      Grade 12
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

              <Link href="/thinktales">
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
                    Let&apos;s Build Future-Ready Learners Together. 🚀

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
    </div>
  );
}
