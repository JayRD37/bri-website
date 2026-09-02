import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: {
    default: "Briella Steiner | Official Website",
    template: "%s | Briella Steiner",
  },
  description:
    "The official website of country artist Briella Steiner. Explore music, live shows, videos, and booking information.",
};

const nav = [
  { href: "/", label: "Home" },
  { href: "/music", label: "Music" },
  { href: "/gallery", label: "Gallery" },
  { href: "https://stores.middlecreekprinting.com/briellasteiner/all-items", label: "Merch", external: true },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>

        <div className="site-shell">
          <header className="site-header">
            <div className="site-header-inner">
              <Link href="/" className="brand" aria-label="Briella Steiner home">
                <span>Briella</span>
                <span>Steiner</span>
              </Link>

              <nav className="nav desktop-nav" aria-label="Main navigation">
                {nav.map((item) =>
                  item.external ? (
                    <a
                      key={item.href}
                      href={item.href}
                      className="nav-link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link key={item.href} href={item.href} className="nav-link">
                      {item.label}
                    </Link>
                  ),
                )}
              </nav>

              <Link className="header-booking" href="/contact">
                Booking <span aria-hidden="true">↗</span>
              </Link>

              <details className="mobile-menu">
                <summary>Menu</summary>
                <nav aria-label="Mobile navigation">
                  {nav.map((item) =>
                    item.external ? (
                      <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer">
                        {item.label} <span aria-hidden="true">↗</span>
                      </a>
                    ) : (
                      <Link key={item.href} href={item.href}>{item.label}</Link>
                    ),
                  )}
                </nav>
              </details>
            </div>
          </header>

          <main id="main-content" className="site-main">
            {children}
          </main>

          <footer className="site-footer">
            <div className="footer-grid">
              <div className="footer-brand">
                <span>Briella</span>
                <span>Steiner</span>
              </div>
              <div className="footer-nav-wrap">
                <p>Site navigation</p>
                <nav className="footer-nav" aria-label="Footer navigation">
                  {nav.filter((item) => !item.external).map((item) => (
                    <Link key={item.href} href={item.href}>{item.label}</Link>
                  ))}
                </nav>
              </div>
              <div className="footer-contact">
                <p>Booking &amp; inquiries</p>
                <a href="mailto:BriellaSteinerBooking@gmail.com">BriellaSteinerBooking@gmail.com</a>
                <div className="booking-representation booking-representation-footer">
                  <span>Artist representation</span>
                  <a href="https://www.semperfibooking.com/" target="_blank" rel="noopener noreferrer">
                    Semper Fi Booking ↗
                  </a>
                </div>
              </div>
            </div>
            <div className="footer-meta-row">
              <p>Country artist · Storyteller · Performer</p>
              <p>© {new Date().getFullYear()} Briella Steiner</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
