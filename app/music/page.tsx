import Image from "next/image";

export const metadata = {
  title: "Music",
  description: "Listen to Briella Steiner on Spotify and watch featured performances.",
};

export default function MusicPage() {
  return (
    <div className="interior-page">
      <section className="interior-hero interior-hero-split">
        <div>
          <p className="eyebrow">Listen &amp; watch</p>
          <h1>Music</h1>
          <p className="interior-lead">
            Hear Briella on Spotify and watch featured performances from the
            official video collection.
          </p>
        </div>
        <div className="interior-hero-image">
          <Image
            src="/gallery/official-live-performance.jpg"
            alt="Briella Steiner singing onstage"
            fill
            priority
            sizes="(max-width: 780px) 100vw, 44vw"
            className="music-hero-photo"
          />
        </div>
      </section>

      <section className="media-section" aria-labelledby="spotify-heading">
        <div className="section-kicker">
          <span>01</span>
          <p>Streaming</p>
        </div>
        <div className="media-content">
          <h2 id="spotify-heading">Listen on Spotify</h2>
          <iframe
            className="spotify-embed"
            title="Briella Steiner on Spotify"
            src="https://open.spotify.com/embed/artist/7gl3QOgIew8NLttIjus3sS?utm_source=generator"
            width="100%"
            height="352"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        </div>
      </section>

      <section className="media-section media-section-dark" aria-labelledby="video-heading">
        <div className="section-kicker">
          <span>02</span>
          <p>Featured video</p>
        </div>
        <div className="media-content">
          <h2 id="video-heading">Watch Briella perform</h2>
          <div className="video-frame">
            <iframe
              src="https://www.youtube.com/embed/4WxbhncIAF4"
              title="Briella Steiner featured video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </section>
    </div>
  );
}
