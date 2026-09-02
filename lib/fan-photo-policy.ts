export type FanPhotoReviewRecord = {
  status?: string;
  adultConfirmed?: boolean;
  consentConfirmed?: boolean;
  moderation?: {
    status?: string;
    flagged?: boolean;
  };
  moderationOverrideConfirmed?: boolean;
  reviewNotes?: string;
};

export function queueStatusForModeration(flagged: boolean) {
  return flagged ? "flagged" : "pending";
}

export function manualReviewModeration(note: string) {
  return {
    status: "unavailable",
    flagged: true,
    model: "omni-moderation-latest",
    categories: ["manual-review-required"],
    categoryScores: {},
    note,
  };
}

export function resolvePrivateFanPhotoDataset(
  serverDataset: string | undefined,
  studioDataset: string | undefined,
  publicDataset: string,
) {
  if (!serverDataset || !studioDataset) {
    return { configured: false, dataset: "", reason: "The private fan-photo dataset has not been configured." };
  }
  if (serverDataset !== studioDataset) {
    return { configured: false, dataset: "", reason: "The server and review Studio dataset names do not match." };
  }
  if (serverDataset === publicDataset) {
    return { configured: false, dataset: "", reason: "The fan-photo dataset must be separate from the public content dataset." };
  }
  return { configured: true, dataset: serverDataset, reason: "" };
}

export function isEligibleForPublication(record: FanPhotoReviewRecord) {
  if (
    record.status !== "approved" ||
    record.adultConfirmed !== true ||
    record.consentConfirmed !== true
  ) {
    return false;
  }

  const automaticPass =
    record.moderation?.status === "passed" && record.moderation?.flagged === false;
  const documentedHumanOverride =
    record.moderationOverrideConfirmed === true &&
    typeof record.reviewNotes === "string" &&
    record.reviewNotes.trim().length >= 10;

  return automaticPass || documentedHumanOverride;
}

export function isTrustedSanityImageUrl(
  value: string,
  projectId: string,
  dataset: string,
) {
  try {
    const url = new URL(value);
    const expectedPrefix = `/images/${projectId}/${dataset}/`;

    return (
      url.protocol === "https:" &&
      url.hostname === "cdn.sanity.io" &&
      url.port === "" &&
      url.username === "" &&
      url.password === "" &&
      url.pathname.startsWith(expectedPrefix) &&
      !url.pathname.slice(expectedPrefix.length).includes("/") &&
      url.hash === ""
    );
  } catch {
    return false;
  }
}

export function toPublicFanPhoto<T extends {
  _id: string;
  assetId: string;
  caption?: string;
  credit: string;
  altText?: string;
}>(record: T) {
  return {
    _id: record._id,
    assetId: record.assetId,
    caption: record.caption,
    credit: record.credit,
    altText: record.altText,
  };
}
