import { createClient } from "next-sanity";
import {
  isEligibleForPublication,
  resolvePrivateFanPhotoDataset,
  toPublicFanPhoto,
} from "./fan-photo-policy";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "m3m672rb";
const apiVersion = "2024-01-01";
const publicDataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export type ApprovedFanPhoto = {
  _id: string;
  assetId: string;
  caption?: string;
  credit: string;
  altText?: string;
};

type FanPhotoCandidate = ApprovedFanPhoto & {
  status?: string;
  adultConfirmed?: boolean;
  consentConfirmed?: boolean;
  moderation?: { status?: string; flagged?: boolean };
  moderationOverrideConfirmed?: boolean;
  reviewNotes?: string;
};

export function getFanPhotoConfiguration() {
  const serverDataset = process.env.SANITY_FAN_PHOTO_DATASET;
  const studioDataset = process.env.NEXT_PUBLIC_SANITY_FAN_PHOTO_DATASET;
  const resolution = resolvePrivateFanPhotoDataset(serverDataset, studioDataset, publicDataset);

  return {
    projectId,
    ...resolution,
  };
}

function createFanPhotoClient(token: string | undefined) {
  const configuration = getFanPhotoConfiguration();

  if (!token || !configuration.configured) {
    return null;
  }

  return createClient({
    projectId,
    dataset: configuration.dataset,
    apiVersion,
    token,
    useCdn: false,
    perspective: "published",
  });
}

export function getFanPhotoReadClient() {
  return createFanPhotoClient(process.env.SANITY_FAN_PHOTO_READ_TOKEN);
}

export function getFanPhotoWriteClient() {
  return createFanPhotoClient(process.env.SANITY_API_WRITE_TOKEN);
}

export async function getApprovedFanPhotos(): Promise<ApprovedFanPhoto[]> {
  const client = getFanPhotoReadClient();

  if (!client) {
    return [];
  }

  try {
    const candidates = await client.fetch<FanPhotoCandidate[]>(
      `*[
        _type == "fanPhotoSubmission" &&
        status == "approved" &&
        adultConfirmed == true &&
        consentConfirmed == true &&
        defined(image.asset) &&
        (
          (moderation.status == "passed" && moderation.flagged == false) ||
          (moderationOverrideConfirmed == true && length(reviewNotes) >= 10)
        )
      ] | order(_updatedAt desc)[0...18] {
        _id,
        "assetId": image.asset._ref,
        caption,
        credit,
        altText,
        status,
        adultConfirmed,
        consentConfirmed,
        moderation { status, flagged },
        moderationOverrideConfirmed,
        reviewNotes
      }`,
      {},
    );

    return candidates.filter(isEligibleForPublication).map(toPublicFanPhoto);
  } catch {
    return [];
  }
}
