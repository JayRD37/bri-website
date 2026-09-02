import Image from "next/image";
import Link from "next/link";
import { sanityClient } from "../lib/sanity.client";
import { NEXT_SHOW_QUERY } from "../lib/sanity.queries";

export const dynamic = "force-dynamic";

const spotifyArtistUrl = "https://open.spotify.com/artist/7gl3QOgIew8NLttIjus3sS";
const merchUrl = "https://stores.middlecreekprinting.com/briellasteiner/all-items";

const videos = ["BaumMPEcJtw", "4WxbhncIAF4"];

type NextShow = {
  _id: string;
  title?: string;
  startDate?: string;
  venue?: string;
  city?: string;
  stateRegion?: string;
  timezone?: string;
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

export default async function HomePage() {
  const nextShow = (await sanityClient.fetch(NEXT_SHOW_QUERY).catch(() => null)) as NextShow | null;
  const showDate = getShowDate(nextShow?.startDate, nextShow?.timezone);
  const showLocation = [nextShow?.city, nextShow?.stateRegion].filter(Boolean).join(", ");
  const ticketUrl = getSafeTicketUrl(nextShow?.ticketUrl);

  return (
    <>
      <section className="reference-hero" aria-labelledby="hero-title">
        <div className="reference-hero-shade" aria-hidden="true" />
        <div className="reference-hero-inner">
          <div className="reference-hero-copy">
            <h1 id="hero-title" className="reference-title">
              <span className="reference-script">Briella</span>
              <span className="reference-surname">Steiner</span>
            </h1>
            <div className="western-divider" aria-hidden="true"><span>★</span></div>
            <p className="reference-tagline">Country artist. Storyteller. Performer.</p>
            <div className="reference-actions">
              <a className="western-button western-button-gold" href={spotifyArtistUrl} target="_blank" rel="noopener noreferrer">
                Listen now <span aria-hidden="true">↗</span>
              </a>
              <Link className="western-button western-button-outline" href="/shows">View shows</Link>
            </div>
          </div>

          <div className="hero-portrait-frame">
            <Image
              src="/gallery/official-profile-guitar.jpg"
              alt="Briella Steiner standing outdoors with a black guitar"
              fill
              priority
              sizes="(max-width: 760px) 78vw, 38vw"
              className="hero-portrait"
            />
            <span className="frame-corner frame-corner-tl" aria-hidden="true" />
            <span className="frame-corner frame-corner-tr" aria-hidden="true" />
            <span className="frame-corner frame-corner-bl" aria-hidden="true" />
            <span className="frame-corner frame-corner-br" aria-hidden="true" />
          </div>
        </div>
        <div className="paper-tear paper-tear-bottom" aria-hidden="true" />
      </section>

      <section className="release-stage" aria-labelledby="spotify-home-title">
        <div className="release-stage-shade" aria-hidden="true" />
        <div className="release-grid">
          <div className="release-copy">
            <p className="western-kicker">Official artist player</p>
            <h2 id="spotify-home-title">Listen on Spotify</h2>
            <p>Play Briella&apos;s current music directly from her official Spotify artist profile.</p>
            <a className="western-button western-button-gold" href={spotifyArtistUrl} target="_blank" rel="noopener noreferrer">
              Open Spotify <span aria-hidden="true">↗</span>
            </a>
          </div>

          <div className="spotify-home-card">
            <iframe
              title="Briella Steiner official Spotify artist player"
              src="https://open.spotify.com/embed/artist/7gl3QOgIew8NLttIjus3sS?utm_source=generator&theme=0"
              width="100%"
              height="352"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            />
          </div>
        </div>

        <div className="stage-flourish" aria-hidden="true" />

        <div className="featured-video-block" aria-labelledby="videos-title">
          <p className="western-kicker" id="videos-title">Featured videos</p>
          <div className="reference-video-grid">
            {videos.map((videoId) => (
              <div className="reference-video-card" key={videoId}>
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="Briella Steiner featured video"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ))}
          </div>
          <Link className="western-button western-button-outline video-button" href="/gallery">View all videos</Link>
        </div>
        <div className="paper-tear paper-tear-bottom" aria-hidden="true" />
      </section>

      <section className="road-section" aria-labelledby="road-title">
        <div className="road-heading">
          <p className="road-script">See you</p>
          <h2 id="road-title">On the road</h2>
          <p>Real stages. Real songs. Come hear Briella live.</p>
          <Link className="western-button western-button-ink" href="/shows">View all shows</Link>
        </div>
        <div className="show-list" aria-label="Next show">
          {nextShow ? (
            <div className="show-row">
              <time dateTime={nextShow.startDate}>
                <strong>{showDate?.day || "TBA"}</strong>
                <span>{showDate?.year || ""}</span>
              </time>
              <div>
                <strong>{nextShow.title || "Briella Steiner live"}</strong>
                <span>{nextShow.venue || "Venue details coming soon"}</span>
              </div>
              <div>
                <strong>{showLocation || "Location coming soon"}</strong>
                <span>{showDate?.time || "Time TBA"}</span>
                {ticketUrl ? <a href={ticketUrl} target="_blank" rel="noopener noreferrer">Event details ↗</a> : null}
              </div>
            </div>
          ) : (
            <div className="show-row show-row-empty">
              <div>
                <strong>New dates coming soon.</strong>
                <span>Check back for Briella&apos;s next show announcement.</span>
              </div>
            </div>
          )}
        </div>
        <div className="paper-tear paper-tear-bottom paper-tear-dark" aria-hidden="true" />
      </section>

      <section className="home-showcase" aria-label="Explore Briella Steiner">
        <article className="showcase-panel gallery-panel">
          <p className="western-kicker">Gallery preview</p>
          <div className="mini-gallery">
            <Image src="/gallery/gallery8.jpg" alt="Black-and-white portrait of Briella Steiner" width={240} height={300} />
            <Image src="/gallery/official-live-performance.jpg" alt="Briella Steiner singing onstage" width={240} height={300} />
            <Image src="/gallery/gallery9.jpg" alt="Black-and-white sidewalk portrait of Briella Steiner" width={240} height={300} />
          </div>
          <Link className="western-button western-button-outline" href="/gallery">View gallery</Link>
        </article>

        <article className="showcase-panel merch-panel">
          <p className="western-kicker">Merch spotlight</p>
          <div className="merch-card">
            <span>Official</span>
            <strong>Briella Steiner</strong>
            <em>Merchandise</em>
          </div>
          <a className="western-button western-button-outline" href={merchUrl} target="_blank" rel="noopener noreferrer">Shop merch ↗</a>
        </article>

        <article className="showcase-panel about-panel">
          <p className="western-kicker">About Briella</p>
          <div className="about-preview-image">
            <Image src="/briabout.jpg" alt="Portrait of Briella Steiner wearing a cowboy hat" fill sizes="(max-width: 760px) 88vw, 28vw" />
          </div>
          <p>A country artist pairing heartfelt storytelling with a modern edge and a confident live presence.</p>
          <Link className="western-button western-button-outline" href="/about">Read more</Link>
        </article>
        <div className="paper-tear paper-tear-bottom" aria-hidden="true" />
      </section>

      <section className="booking-paper" aria-labelledby="booking-title">
        <div>
          <p className="western-kicker">Booking &amp; inquiries</p>
          <h2 id="booking-title">Bring Briella to your stage.</h2>
          <p>For booking, press, and event inquiries, send the venue, date, location, and set details.</p>
          <div className="booking-representation">
            <span>Artist representation</span>
            <a href="https://www.semperfibooking.com/" target="_blank" rel="noopener noreferrer">Semper Fi Booking ↗</a>
          </div>
        </div>
        <Link className="western-button western-button-ink" href="/contact">Get in touch</Link>
      </section>
    </>
  );
}
