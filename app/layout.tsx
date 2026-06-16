import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Brie — Official Website",
  description: "Shows, music, blog, and booking for Bri.",
};

const nav = [
  { href: "/", label: "Home" },
  { href: "/shows", label: "Shows" },
  { href: "/music", label: "Music" },
  { href: "/gallery", label: "Gallery" },
  {
    href: "https://stores.middlecreekprinting.com/briellasteiner/all-items",
    label: "Merch",
    external: true,
  },
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
        {/* Background */}
        <div className="site-bg" aria-hidden="true" />

        {/* Page chrome */}
        <div className="site-shell">
          <header className="site-header">
            <div className="container">
              <div className="brand-row">
                <Link href="/" className="brand">
                  Brie
                </Link>

                <nav className="nav">
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
                      <Link
                        key={item.href}
                        href={item.href}
                        className="nav-link"
                      >
                        {item.label}
                      </Link>
                    )
                  )}
                </nav>
              </div>
            </div>
          </header>

          <main className="container site-main">{children}</main>

          <footer className="site-footer">
            <div className="container footer-row">
              <p className="muted">
                © {new Date().getFullYear()} Bri. All rights reserved.
              </p>
              <p className="muted">
                For booking:{" "}
                <Link className="link" href="/contact">
                  Contact
                </Link>
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}