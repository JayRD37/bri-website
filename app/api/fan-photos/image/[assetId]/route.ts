import { NextRequest, NextResponse } from "next/server";
import {
  isEligibleForPublication,
  isTrustedSanityImageUrl,
} from "../../../../../lib/fan-photo-policy";
import {
  getFanPhotoConfiguration,
  getFanPhotoReadClient,
} from "../../../../../lib/fan-photos";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ assetId: string }> },
) {
  const configuration = getFanPhotoConfiguration();
  const client = getFanPhotoReadClient();
  if (!client) {
    return new NextResponse("Not found", { status: 404 });
  }

  const { assetId } = await context.params;
  if (!/^image-[a-zA-Z0-9_-]+-\d+x\d+-[a-zA-Z0-9]+$/.test(assetId)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const approved = await client.fetch<{
    url?: string;
    status?: string;
    adultConfirmed?: boolean;
    consentConfirmed?: boolean;
    moderation?: { status?: string; flagged?: boolean };
    moderationOverrideConfirmed?: boolean;
    reviewNotes?: string;
  } | null>(
    `*[
      _type == "fanPhotoSubmission" &&
      image.asset._ref == $assetId
    ][0] {
      "url": image.asset->url,
      status,
      adultConfirmed,
      consentConfirmed,
      moderation { status, flagged },
      moderationOverrideConfirmed,
      reviewNotes
    }`,
    { assetId },
  );

  if (
    !approved?.url ||
    !isEligibleForPublication(approved) ||
    !isTrustedSanityImageUrl(
      approved.url,
      configuration.projectId,
      configuration.dataset,
    )
  ) {
    return new NextResponse("Not found", { status: 404 });
  }

  const transformedUrl = new URL(approved.url);
  transformedUrl.search = "";
  transformedUrl.searchParams.set("fm", "jpg");
  transformedUrl.searchParams.set("fit", "max");
  transformedUrl.searchParams.set("w", "2400");
  transformedUrl.searchParams.set("q", "88");

  const imageResponse = await fetch(transformedUrl, {
    headers: { Authorization: `Bearer ${process.env.SANITY_FAN_PHOTO_READ_TOKEN}` },
    cache: "no-store",
    redirect: "error",
  });

  const contentType = imageResponse.headers.get("content-type")?.split(";")[0].trim();
  const contentLength = Number(imageResponse.headers.get("content-length"));

  if (
    !imageResponse.ok ||
    contentType !== "image/jpeg" ||
    (Number.isFinite(contentLength) && contentLength > 10 * 1024 * 1024)
  ) {
    return new NextResponse("Not found", { status: 404 });
  }

  const imageBytes = await imageResponse.arrayBuffer();
  if (imageBytes.byteLength === 0 || imageBytes.byteLength > 10 * 1024 * 1024) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(imageBytes, {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
