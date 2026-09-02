import Image from "next/image";
import Link from "next/link";

const bookingEmail = "BriellaSteinerBooking@gmail.com";

export const metadata = {
  title: "Contact",
  description: "Booking and contact information for Briella Steiner.",
};

export default function ContactPage() {
  return (
    <div className="interior-page">
      <section className="contact-layout">
        <div className="contact-copy">
          <p className="eyebrow">Booking &amp; inquiries</p>
          <h1>Let&apos;s make some noise.</h1>
          <p className="interior-lead">
            For booking, press, venue, or event inquiries, reach out directly
            by email.
          </p>
          <a className="contact-email" href={`mailto:${bookingEmail}`}>
            {bookingEmail}
          </a>
          <div className="booking-representation booking-representation-dark">
            <span>Artist representation</span>
            <a href="https://www.semperfibooking.com/" target="_blank" rel="noopener noreferrer">
              Semper Fi Booking ↗
            </a>
          </div>

          <div className="contact-details">
            <h2>Helpful details to include</h2>
            <ul>
              <li>Venue or event name and location</li>
              <li>Preferred date or dates and set length</li>
              <li>Sound and PA details, if available</li>
              <li>Your best contact information</li>
            </ul>
          </div>

          <div className="text-links">
            <Link href="/shows">View show dates <span aria-hidden="true">→</span></Link>
            <Link href="/music">Listen to Briella <span aria-hidden="true">→</span></Link>
          </div>
        </div>

        <div className="contact-image-wrap">
          <Image
            src="/gallery/gallery7.jpg"
            alt="Briella Steiner walking in silver boots"
            fill
            priority
            sizes="(max-width: 820px) 100vw, 45vw"
          />
        </div>
      </section>
    </div>
  );
}
