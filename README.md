This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Content management

The private editing tools are intentionally not linked from the public navigation:

- Open `/studio` locally to add or edit **Blog posts**, **Shows**, and **Social updates**. Publishing a Show updates both the homepage's next-show listing and the full `/shows` page; choose the venue time zone so its date and time render correctly. Social updates accept a Facebook or Instagram post link, headline, and short summary for the Blog page.
- Open `/fan-photo-review` to check pending or automatically flagged fan-photo submissions, record a review decision, and approve or reject them.

The fan-photo review area remains locked until the private moderation dataset and server-only credentials below are configured. This is deliberate: unreviewed photos and fan email addresses must never enter the public content dataset or appear publicly.

## Fan photo moderation setup

Fan uploads are private by default and use a separate **private Sanity dataset** so pending photos and contact emails cannot be read from the public content dataset. Before enabling submissions in a hosted environment:

1. Create a private Sanity dataset named `fan-photos` (or choose another private name).
2. Configure `NEXT_PUBLIC_SANITY_FAN_PHOTO_DATASET` and `SANITY_FAN_PHOTO_DATASET` with that same dataset name. The application refuses to use the normal public content dataset for fan submissions.
3. Configure a server-only `SANITY_API_WRITE_TOKEN` with the minimum private-dataset permissions needed to upload assets, read the newly uploaded asset's decoded dimensions, create review records, and delete rejected/orphaned assets. It must not have access to the public content dataset.
4. Configure a separate server-only, read-only `SANITY_FAN_PHOTO_READ_TOKEN` for the public approved-photo query and guarded image proxy. Never prefix either token with `NEXT_PUBLIC_`.
5. Configure the server-only `OPENAI_API_KEY` for `omni-moderation-latest` image and public-text screening.
6. Review submissions at `/fan-photo-review`. Approval requires recorded age/consent plus either a passed automatic screen or a documented human override.

If moderation is missing or fails, the submission is saved as `flagged` for manual review. No submission is ever automatically published. The image endpoint re-checks the full approval policy, only sends the read-only token to the exact expected Sanity CDN project/dataset path, rejects redirects and unexpected response types, and serves a transformed JPEG derivative rather than the metadata-bearing original.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
