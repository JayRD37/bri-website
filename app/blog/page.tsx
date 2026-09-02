import type { PortableTextComponents } from "@portabletext/react";
import { PortableText } from "@portabletext/react";
import type { ComponentProps } from "react";
import { sanityClient } from "../../lib/sanity.client";
import { POSTS_WITH_BODY_QUERY, SOCIAL_UPDATES_QUERY } from "../../lib/sanity.queries";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Blog",
  description: "News and updates from Briella Steiner.",
};

type BlogPost = {
  _id: string;
  title?: string;
  publishedAt?: string;
  excerpt?: string;
  body?: ComponentProps<typeof PortableText>["value"];
};

type SocialUpdate = {
  _id: string;
  platform?: string;
  title?: string;
  summary?: string;
  url?: string;
  publishedAt?: string;
};

const socialFallbacks: SocialUpdate[] = [
  {
    _id: "facebook-channel",
    platform: "facebook",
    title: "Follow Briella on Facebook",
    summary: "Performance announcements, music updates, and moments from the road.",
    url: "https://www.facebook.com/61576749864962",
  },
  {
    _id: "instagram-channel",
    platform: "instagram",
    title: "Follow Briella on Instagram",
    summary: "Photos, reels, and behind-the-scenes updates from Briella.",
    url: "https://www.instagram.com/briellasteiner.music/",
  },
];

const internalOrigin = "https://briellasteiner.com";

function getSafeCmsLink(rawValue: unknown) {
  if (typeof rawValue !== "string") return null;

  const raw = rawValue.trim();
  if (!raw || /[\\\u0000-\u001f\u007f]/.test(raw)) return null;

  try {
    const parsed = new URL(raw, internalOrigin);
    const isExternalInput = /^https?:\/\//i.test(raw);

    if (isExternalInput && (parsed.protocol === "https:" || parsed.protocol === "http:")) {
      return { href: parsed.href, external: true };
    }

    const isInternalInput = raw.startsWith("/") && !raw.startsWith("//");
    if (isInternalInput && parsed.origin === internalOrigin) {
      return {
        href: `${parsed.pathname}${parsed.search}${parsed.hash}`,
        external: false,
      };
    }
  } catch {
    return null;
  }

  return null;
}

function formatDate(iso?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function getSafeSocialUrl(raw: unknown, platform?: string) {
  if (typeof raw !== "string" || (platform !== "facebook" && platform !== "instagram")) return null;
  try {
    const url = new URL(raw);
    const permittedHosts = platform === "facebook"
      ? new Set(["facebook.com", "www.facebook.com"])
      : new Set(["instagram.com", "www.instagram.com"]);
    return url.protocol === "https:" && permittedHosts.has(url.hostname.toLowerCase())
      ? url.href
      : null;
  } catch {
    return null;
  }
}

const portableComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p>{children}</p>,
    h2: ({ children }) => <h2>{children}</h2>,
    h3: ({ children }) => <h3>{children}</h3>,
    blockquote: ({ children }) => <blockquote>{children}</blockquote>,
  },
  marks: {
    link: ({ children, value }) => {
      const link = getSafeCmsLink(value?.href);
      if (!link) return <>{children}</>;

      return (
        <a
          href={link.href}
          target={link.external ? "_blank" : undefined}
          rel={link.external ? "noopener noreferrer" : undefined}
        >
          {children}
        </a>
      );
    },
  },
};

export default async function BlogPage() {
  const [postsResult, socialResult] = await Promise.all([
    sanityClient.fetch(POSTS_WITH_BODY_QUERY).catch(() => []),
    sanityClient.fetch(SOCIAL_UPDATES_QUERY).catch(() => []),
  ]);
  const posts = (postsResult || []) as BlogPost[];
  const curatedSocial = ((socialResult || []) as SocialUpdate[]).filter((update) =>
    Boolean(getSafeSocialUrl(update.url, update.platform)),
  );
  const socialUpdates = curatedSocial.length > 0 ? curatedSocial : socialFallbacks;

  return (
    <div className="interior-page">
      <section className="interior-hero blog-hero">
        <p className="eyebrow">From Briella</p>
        <h1>Stories &amp; updates</h1>
        <p className="interior-lead">
          News from the road, behind-the-scenes moments, and what comes next.
        </p>
      </section>

      <section className="social-section" aria-labelledby="social-heading">
        <div className="social-heading">
          <p className="eyebrow">From the socials</p>
          <h2 id="social-heading">Follow along.</h2>
        </div>
        <div className="social-grid">
          {socialUpdates.map((update) => {
            const href = getSafeSocialUrl(update.url, update.platform);
            if (!href) return null;

            return (
              <article className="social-card" key={update._id}>
                <p className="social-platform">{update.platform}</p>
                <h3>{update.title || `Briella on ${update.platform}`}</h3>
                {update.summary ? <p>{update.summary}</p> : null}
                {update.publishedAt ? <time dateTime={update.publishedAt}>{formatDate(update.publishedAt)}</time> : null}
                <a href={href} target="_blank" rel="noopener noreferrer">
                  Open {update.platform} ↗
                </a>
              </article>
            );
          })}
        </div>
      </section>

      <section className="blog-feed" aria-label="Blog posts">
        {posts.length === 0 ? (
          <div className="empty-state blog-empty-note">
            <p className="eyebrow">Blog</p>
            <h2>No blog posts yet.</h2>
            <p>In the meantime, updates are on Facebook and Instagram.</p>
          </div>
        ) : (
          posts.map((post, index) => (
            <article className="blog-post" key={post._id}>
              <div className="blog-post-number">{String(index + 1).padStart(2, "0")}</div>
              <div>
                <p className="blog-date">{formatDate(post.publishedAt)}</p>
                <h2>{post.title || "Untitled update"}</h2>
                {post.excerpt ? <p className="blog-excerpt">{post.excerpt}</p> : null}
                {Array.isArray(post.body) && post.body.length > 0 ? (
                  <div className="portable-text">
                    <PortableText value={post.body} components={portableComponents} />
                  </div>
                ) : null}
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
