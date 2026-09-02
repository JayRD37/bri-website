import Image from "next/image";
import { getApprovedFanPhotos } from "../../lib/fan-photos";
import FanPhotoForm from "./FanPhotoForm";
import styles from "./gallery.module.css";

const images = [
  { src: "/gallery/gallery3.jpg", alt: "Briella Steiner performing under warm stage lights", cls: "hero" },
  { src: "/gallery/official-profile-guitar.jpg", alt: "Briella Steiner standing outdoors with a black guitar", cls: "guitar" },
  { src: "/gallery/official-live-performance.jpg", alt: "Briella Steiner singing onstage", cls: "live" },
  { src: "/gallery/gallery2.jpg", alt: "Briella Steiner singing under colorful concert lights", cls: "tall" },
  { src: "/gallery/gallery8.jpg", alt: "Black-and-white portrait of Briella Steiner wearing boots", cls: "portrait" },
  { src: "/gallery/owner-live-closeup.jpg", alt: "Briella Steiner singing into a handheld microphone onstage", cls: "ownerLive" },
  { src: "/gallery/official-tour-bus.jpg", alt: "Briella Steiner standing beside a black tour bus", cls: "road" },
  { src: "/gallery/gallery9.jpg", alt: "Black-and-white sidewalk portrait of Briella Steiner", cls: "portraitTwo" },
  { src: "/gallery/gallery7.jpg", alt: "Briella Steiner walking in silver boots", cls: "walk" },
];

const videos = [
  { title: "Briella Steiner featured video", youtubeId: "BaumMPEcJtw" },
  { title: "Briella Steiner performance video", youtubeId: "4WxbhncIAF4" },
];

// Keep the completed fan-photo workflow in source while the public directory is paused.
const fanPhotoFeatureEnabled = false;

export const metadata = {
  title: "Gallery",
  description: "Photos and featured videos from Briella Steiner.",
};

export const revalidate = 300;

export default async function GalleryPage() {
  const fanPhotos = fanPhotoFeatureEnabled ? await getApprovedFanPhotos() : [];

  return (
    <div className="interior-page">
      <section className="interior-hero gallery-heading">
        <p className="eyebrow">On stage &amp; off</p>
        <h1>Gallery</h1>
        <p className="interior-lead">
          Live energy, quiet moments, and a look behind the music.
        </p>
      </section>

      <section className={styles.photoSection} aria-label="Briella Steiner photos">
        <div className={styles.grid}>
          {images.map((image, index) => (
            <figure key={image.src} className={`${styles.tile} ${styles[image.cls]}`}>
              <Image
                src={image.src}
                alt={image.alt}
                fill
                priority={index < 2}
                sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 34vw"
                className={styles.image}
              />
            </figure>
          ))}
        </div>
      </section>

      {fanPhotoFeatureEnabled && fanPhotos.length > 0 && (
        <section className={styles.fanGallery} aria-labelledby="fan-gallery-heading">
          <div className={styles.fanHeading}>
            <p className="eyebrow">Seen through your lens</p>
            <h2 id="fan-gallery-heading">Fan photos</h2>
            <p>Moments shared by the people in the crowd.</p>
          </div>
          <div className={styles.fanGrid}>
            {fanPhotos.map((photo) => (
              <figure className={styles.fanTile} key={photo._id}>
                <div className={styles.fanImage}>
                  <Image
                    src={`/api/fan-photos/image/${encodeURIComponent(photo.assetId)}`}
                    alt={photo.altText || photo.caption || `Photo shared by ${photo.credit}`}
                    fill
                    unoptimized
                    sizes="(max-width: 680px) 100vw, (max-width: 1000px) 50vw, 33vw"
                  />
                </div>
                <figcaption>
                  {photo.caption && <span>{photo.caption}</span>}
                  <strong>Photo: {photo.credit}</strong>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {fanPhotoFeatureEnabled && (
        <section className={styles.submitSection} aria-labelledby="fan-submit-heading">
          <div className={styles.submitIntro}>
            <p className="eyebrow">Share a moment</p>
            <h2 id="fan-submit-heading">Got a great shot?</h2>
            <p>
              Send us your favorite photo from a Briella show. Every submission stays
              private while it is screened and reviewed.
            </p>
          </div>
          <FanPhotoForm />
        </section>
      )}

      <section className="video-gallery" aria-labelledby="gallery-video-heading">
        <div className="section-kicker">
          <span>Watch</span>
          <p>Featured videos</p>
        </div>
        <div>
          <h2 id="gallery-video-heading">From the screen</h2>
          <div className="video-grid">
            {videos.map((video) => (
              <div className="video-frame" key={video.youtubeId}>
                <iframe
                  src={`https://www.youtube.com/embed/${video.youtubeId}`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
