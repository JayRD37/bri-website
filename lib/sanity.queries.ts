import { groq } from "next-sanity";

/**
 * Used if you ever want a list view (titles only)
 * Not required for the current blog page, but safe to keep.
 */
export const POSTS_QUERY = groq`
  *[_type == "post" && defined(slug.current)]
  | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    publishedAt
  }
`;

/**
 * Used if you ever re-enable single post pages
 */
export const POST_BY_SLUG_QUERY = groq`
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    body,
    publishedAt
  }
`;

/**
 * ✅ THIS IS THE ONE YOUR BLOG PAGE IS USING
 * Shows ALL posts WITH body
 * Newest posts FIRST
 */
export const POSTS_WITH_BODY_QUERY = groq`
  *[_type == "post" && defined(slug.current)]
  | order(publishedAt desc) {
    _id,
    title,
    excerpt,
    body,
    publishedAt
  }
`;

export const UPCOMING_SHOWS_QUERY = groq`
  *[_type == "show" && status == "scheduled" && defined(startDate) && defined(timezone) && startDate >= now()]
  | order(startDate asc) {
    _id,
    title,
    startDate,
    venue,
    city,
    stateRegion,
    timezone,
    details,
    ticketUrl
  }
`;

export const NEXT_SHOW_QUERY = groq`
  *[_type == "show" && status == "scheduled" && defined(startDate) && defined(timezone) && startDate >= now()]
  | order(startDate asc)[0] {
    _id,
    title,
    startDate,
    venue,
    city,
    stateRegion,
    timezone,
    ticketUrl
  }
`;

export const SOCIAL_UPDATES_QUERY = groq`
  *[_type == "socialUpdate" && defined(platform) && defined(url) && defined(publishedAt)]
  | order(publishedAt desc)[0...8] {
    _id,
    platform,
    title,
    summary,
    url,
    publishedAt
  }
`;
