import { NextRequest, NextResponse } from "next/server";
import {
  manualReviewModeration,
  queueStatusForModeration,
} from "../../../lib/fan-photo-policy";
import { getFanPhotoWriteClient } from "../../../lib/fan-photos";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const MAX_REQUEST_SIZE = MAX_FILE_SIZE + 1024 * 1024;
const MIN_IMAGE_EDGE = 320;
const MAX_IMAGE_EDGE = 12_000;
const MAX_IMAGE_PIXELS = 48_000_000;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const RATE_LIMIT_WINDOW = 30 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

type RateLimitEntry = { count: number; expiresAt: number };
const submissionCounts = new Map<string, RateLimitEntry>();

function jsonError(message: string, status: number) {
  return NextResponse.json({ ok: false, message }, { status });
}

function getText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function detectedImageType(bytes: Uint8Array) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }

  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }

  if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  ) {
    return "image/webp";
  }

  return null;
}

function rateLimitKey(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "local";
}

function exceedsRateLimit(request: NextRequest) {
  const key = rateLimitKey(request);
  const now = Date.now();

  if (submissionCounts.size > 2_000) {
    for (const [entryKey, entry] of submissionCounts) {
      if (entry.expiresAt <= now) submissionCounts.delete(entryKey);
    }
    if (submissionCounts.size > 2_000 && !submissionCounts.has(key)) return true;
  }

  const current = submissionCounts.get(key);

  if (!current || current.expiresAt <= now) {
    submissionCounts.set(key, { count: 1, expiresAt: now + RATE_LIMIT_WINDOW });
    return false;
  }

  current.count += 1;
  return current.count > RATE_LIMIT_MAX;
}

async function moderateSubmission(
  imageBytes: Uint8Array,
  mimeType: string,
  publicText: string,
) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return manualReviewModeration(
      "Automatic moderation is not configured; submission was held for manual review.",
    );
  }

  const imageData = Buffer.from(imageBytes).toString("base64");
  const response = await fetch("https://api.openai.com/v1/moderations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "omni-moderation-latest",
      input: [
        {
          type: "text",
          text: publicText || "Fan-submitted event photograph",
        },
        {
          type: "image_url",
          image_url: { url: `data:${mimeType};base64,${imageData}` },
        },
      ],
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Moderation request failed");
  }

  const body = await response.json();
  const result = body?.results?.[0];

  if (!result || typeof result.flagged !== "boolean") {
    throw new Error("Moderation response was incomplete");
  }

  const categories = Object.entries(result.categories || {})
    .filter(([, value]) => value === true)
    .map(([key]) => key);

  return {
    status: result.flagged ? "flagged" : "passed",
    flagged: result.flagged,
    model: body.model || "omni-moderation-latest",
    categories,
    categoryScores: result.category_scores || {},
    note: result.flagged
      ? "Automatically flagged; manual rejection or approval is required."
      : "Automatic screen passed; manual approval is still required.",
  };
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) {
    return jsonError("This submission could not be accepted.", 403);
  }

  if (request.headers.get("sec-fetch-site") === "cross-site") {
    return jsonError("This submission could not be accepted.", 403);
  }

  if (exceedsRateLimit(request)) {
    return jsonError("Too many submissions. Please try again later.", 429);
  }

  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_REQUEST_SIZE) {
    return jsonError("The upload is too large.", 413);
  }

  const client = getFanPhotoWriteClient();
  if (!client) {
    return jsonError("Photo submissions are not configured yet.", 503);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError("The upload could not be read.", 400);
  }

  if (getText(formData, "website")) {
    return NextResponse.json({ ok: true, message: "Thanks — your photo is in review." });
  }

  const file = formData.get("photo");
  const credit = getText(formData, "credit");
  const email = getText(formData, "email").toLowerCase();
  const caption = getText(formData, "caption");
  const altText = getText(formData, "altText");
  const consent = getText(formData, "consent") === "yes";
  const adult = getText(formData, "adult") === "yes";

  if (!(file instanceof File)) {
    return jsonError("Choose a photo to upload.", 400);
  }

  if (!ALLOWED_TYPES.has(file.type) || file.size === 0 || file.size > MAX_FILE_SIZE) {
    return jsonError("Use a JPG, PNG, or WebP image no larger than 8 MB.", 400);
  }

  if (!credit || credit.length > 80) {
    return jsonError("Enter a name or photo credit under 80 characters.", 400);
  }

  if (!email || email.length > 160 || !isValidEmail(email)) {
    return jsonError("Enter a valid email address.", 400);
  }

  if (caption.length > 400 || altText.length > 240) {
    return jsonError("Please shorten the caption or image description.", 400);
  }

  if (!consent || !adult) {
    return jsonError("The age and photo-rights confirmations are required.", 400);
  }

  const imageBytes = new Uint8Array(await file.arrayBuffer());
  const actualType = detectedImageType(imageBytes);

  if (!actualType || actualType !== file.type) {
    return jsonError("The file does not match a supported image format.", 400);
  }

  let moderation;
  try {
    moderation = await moderateSubmission(
      imageBytes,
      actualType,
      [`Photo credit: ${credit}`, `Caption: ${caption}`, `Image description: ${altText}`].join("\n"),
    );
  } catch {
    moderation = manualReviewModeration(
      "Automatic moderation failed; submission was held for manual review.",
    );
  }

  let assetId: string | undefined;

  try {
    const extension = actualType === "image/jpeg" ? "jpg" : actualType.split("/")[1];
    const asset = await client.assets.upload("image", Buffer.from(imageBytes), {
      filename: `fan-photo-${crypto.randomUUID()}.${extension}`,
      contentType: actualType,
    });
    assetId = asset._id;

    const assetDocument = await client.getDocument<{
      metadata?: { dimensions?: { width?: number; height?: number } };
    }>(asset._id);
    const width = assetDocument?.metadata?.dimensions?.width;
    const height = assetDocument?.metadata?.dimensions?.height;
    const dimensionsAreSafe =
      typeof width === "number" &&
      typeof height === "number" &&
      width >= MIN_IMAGE_EDGE &&
      height >= MIN_IMAGE_EDGE &&
      width <= MAX_IMAGE_EDGE &&
      height <= MAX_IMAGE_EDGE &&
      width * height <= MAX_IMAGE_PIXELS;

    if (!dimensionsAreSafe) {
      await client.delete(asset._id);
      assetId = undefined;
      return jsonError(
        "The image could not be decoded or its dimensions are outside the allowed range.",
        400,
      );
    }

    await client.create({
      _type: "fanPhotoSubmission",
      image: {
        _type: "image",
        asset: { _type: "reference", _ref: asset._id },
      },
      credit,
      email,
      caption: caption || undefined,
      altText: altText || undefined,
      consentConfirmed: true,
      adultConfirmed: true,
      status: queueStatusForModeration(moderation.flagged),
      submittedAt: new Date().toISOString(),
      moderation: {
        _type: "fanPhotoModeration",
        status: moderation.status,
        flagged: moderation.flagged,
        model: moderation.model,
        checkedAt: new Date().toISOString(),
        categories: moderation.categories,
        categoryScoresJson: JSON.stringify(moderation.categoryScores),
        note: moderation.note,
      },
    });
  } catch {
    if (assetId) {
      await client.delete(assetId).catch(() => undefined);
    }
    return jsonError("The photo could not be saved. Please try again later.", 500);
  }

  return NextResponse.json({
    ok: true,
    message: "Thanks — your photo is in review and will stay private unless approved.",
  });
}
