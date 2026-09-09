/**
 * The public site footer.
 *
 * Extracted from the home page alongside SiteHeader so public and auth routes
 * share one footer. See SiteHeader for why the wrapper carries `home-page`.
 */

// The chrome ships its own styles, so any route can mount it without
// having to remember to import home.css.
import "@/app/home.css";

import Link from "next/link";
import Image from "next/image";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube } from "react-icons/fa";

export default function SiteFooter() {
  return (
    <div className="site-chrome home-page">
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
    </div>
  );
}
