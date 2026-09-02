import Link from "next/link";
import { sanityClient } from "../../lib/sanity.client";
import { UPCOMING_SHOWS_QUERY } from "../../lib/sanity.queries";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Shows",
  description: "View Briella Steiner's posted show schedule and booking information.",
};

type Show = {
  _id: string;
  title?: string;
  startDate?: string;
  venue?: string;
  city?: string;
  stateRegion?: string;
  timezone?: string;
  details?: string;
  ticketUrl?: string;
};

function getShowDate(iso?: string, timezone?: string) {
  if (!iso || !timezone) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;

  try {
    return {
      day: new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", timeZone: timezone }).format(date),
      year: new Intl.DateTimeFormat("en-US", { year: "numeric", timeZone: timezone }).format(date),
      time: new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: timezone }).format(date),
    };
  } catch {
    return null;
  }
}

function getSafeTicketUrl(raw?: string) {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

export default async function ShowsPage() {
  const shows = ((await sanityClient.fetch(UPCOMING_SHOWS_QUERY).catch(() => [])) || []) as Show[];

  return (
    <div className="interior-page">
      <section className="interior-hero shows-hero">
        <p className="eyebrow">On the road</p>
        <h1>Live shows</h1>
        <p className="interior-lead">
          View Briella&apos;s posted schedule below. Confirm event details with
          the venue before making plans.
        </p>
      </section>

      <section className="schedule-section" aria-labelledby="upcoming-shows-heading">
        <div className="schedule-heading">
          <p className="eyebrow">Upcoming dates</p>
          <h2 id="upcoming-shows-heading">See you out there.</h2>
        </div>

        {shows.length > 0 ? (
          <div className="cms-show-list">
            {shows.map((show) => {
              const date = getShowDate(show.startDate, show.timezone);
              const ticketUrl = getSafeTicketUrl(show.ticketUrl);
              const location = [show.city, show.stateRegion].filter(Boolean).join(", ");

              return (
                <article className="cms-show-card" key={show._id}>
                  <time className="cms-show-date" dateTime={show.startDate}>
                    <strong>{date?.day || "TBA"}</strong>
                    <span>{date?.year || ""}</span>
                  </time>
                  <div className="cms-show-main">
                    <h3>{show.title || "Briella Steiner live"}</h3>
                    <p>{[show.venue, location].filter(Boolean).join(" · ")}</p>
                    {show.details ? <p className="cms-show-details">{show.details}</p> : null}
                  </div>
                  <div className="cms-show-action">
                    {date?.time ? <span>{date.time}</span> : null}
                    {ticketUrl ? (
                      <a href={ticketUrl} target="_blank" rel="noopener noreferrer">
                        Event details ↗
                      </a>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="schedule-empty">
            <strong>New dates coming soon.</strong>
            <span>Follow Briella for the next show announcement.</span>
          </div>
        )}
      </section>

      <section className="route-cta">
        <div>
          <p className="eyebrow">Venues &amp; events</p>
          <h2>Want Briella at your next event?</h2>
        </div>
        <Link className="button button-primary" href="/contact">
          Booking information
        </Link>
      </section>
    </div>
  );
}
