import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "About",
  description: "Meet country artist and performer Briella Steiner.",
};

export default function AboutPage() {
  return (
    <div className="interior-page">
      <section className="interior-hero about-hero">
        <div>
          <p className="eyebrow">The artist</p>
          <h1>About Briella</h1>
          <p className="interior-lead">
            Heartfelt storytelling, a modern edge, and a live presence built
            around real connection.
          </p>
        </div>
        <div className="about-portrait">
          <Image
            src="/briabout.jpg"
            alt="Briella Steiner wearing a cowboy hat"
            width={1027}
            height={1011}
            priority
          />
        </div>
      </section>

      <section className="bio-section" aria-labelledby="story-heading">
        <div className="section-kicker">
          <span>Story</span>
          <p>Briella Steiner</p>
        </div>
        <div className="bio-copy">
          <h2 id="story-heading">Timeless roots. A fresh voice.</h2>
          <p>
            Briella Steiner is a rising country artist with a voice that feels
            both timeless and fresh. Blending heartfelt storytelling with a
            modern edge, Briella brings emotion, grit, and charm to every song
            she sings. Whether she&apos;s performing an intimate acoustic set or
            lighting up a full stage, her music connects because it comes from
            a real place.
          </p>
          <p>
            Her debut tracks, <strong>“Good Boy”</strong> and{" "}
            <strong>“A Better Feeling”</strong>, introduce listeners to both
            sides of her artistry—playful confidence on one hand, and honest,
            emotional depth on the other.
          </p>
          <p>
            Raised on classic country influences and inspired by today&apos;s
            powerful female artists, Briella&apos;s sound lives at the crossroads
            of tradition and evolution. Her music explores love, resilience,
            small-town roots, and big dreams.
          </p>
          <p>
            On stage, Briella&apos;s presence is magnetic. With her signature
            style, warm smile, and confidence, she turns every performance
            into an experience built around the audience and the song.
          </p>
          <div className="text-links">
            <Link href="/music">Hear the music <span aria-hidden="true">→</span></Link>
            <Link href="/shows">View shows <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
