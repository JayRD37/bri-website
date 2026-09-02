import assert from "node:assert/strict";
import test from "node:test";
import {
  isEligibleForPublication,
  isTrustedSanityImageUrl,
  manualReviewModeration,
  queueStatusForModeration,
  resolvePrivateFanPhotoDataset,
  toPublicFanPhoto,
} from "../lib/fan-photo-policy.ts";

const passedApproval = {
  status: "approved",
  adultConfirmed: true,
  consentConfirmed: true,
  moderation: { status: "passed", flagged: false },
};

test("automatic moderation can only queue pending or flagged records", () => {
  assert.equal(queueStatusForModeration(false), "pending");
  assert.equal(queueStatusForModeration(true), "flagged");
  assert.notEqual(queueStatusForModeration(false), "approved");
  assert.deepEqual(manualReviewModeration("screen failed"), {
    status: "unavailable",
    flagged: true,
    model: "omni-moderation-latest",
    categories: ["manual-review-required"],
    categoryScores: {},
    note: "screen failed",
  });
});

test("storage and review must use the same non-public dataset", () => {
  assert.equal(resolvePrivateFanPhotoDataset(undefined, undefined, "production").configured, false);
  assert.equal(resolvePrivateFanPhotoDataset("fan-photos", "other", "production").configured, false);
  assert.equal(resolvePrivateFanPhotoDataset("production", "production", "production").configured, false);
  assert.deepEqual(resolvePrivateFanPhotoDataset("fan-photos", "fan-photos", "production"), {
    configured: true,
    dataset: "fan-photos",
    reason: "",
  });
});

test("publication requires approval, consent, age confirmation, and moderation evidence", () => {
  assert.equal(isEligibleForPublication(passedApproval), true);
  assert.equal(isEligibleForPublication({ ...passedApproval, status: "pending" }), false);
  assert.equal(isEligibleForPublication({ ...passedApproval, adultConfirmed: false }), false);
  assert.equal(isEligibleForPublication({ ...passedApproval, consentConfirmed: false }), false);
  assert.equal(
    isEligibleForPublication({ ...passedApproval, moderation: { status: "flagged", flagged: true } }),
    false,
  );
  assert.equal(
    isEligibleForPublication({
      ...passedApproval,
      moderation: { status: "unavailable", flagged: true },
      moderationOverrideConfirmed: true,
      reviewNotes: "Personally inspected; this photo is safe.",
    }),
    true,
  );
  assert.equal(
    isEligibleForPublication({
      ...passedApproval,
      moderation: { status: "unavailable", flagged: true },
      moderationOverrideConfirmed: true,
      reviewNotes: "too short",
    }),
    false,
  );
});

test("credentialed image fetches allow only the expected Sanity CDN project and dataset", () => {
  const trusted = "https://cdn.sanity.io/images/m3m672rb/fan-photos/abc-800x1000.jpg";
  assert.equal(isTrustedSanityImageUrl(trusted, "m3m672rb", "fan-photos"), true);
  assert.equal(isTrustedSanityImageUrl(trusted.replace("https:", "http:"), "m3m672rb", "fan-photos"), false);
  assert.equal(isTrustedSanityImageUrl("https://cdn.sanity.io.evil.example/images/m3m672rb/fan-photos/a.jpg", "m3m672rb", "fan-photos"), false);
  assert.equal(isTrustedSanityImageUrl("https://cdn.sanity.io/images/other/fan-photos/a.jpg", "m3m672rb", "fan-photos"), false);
  assert.equal(isTrustedSanityImageUrl("https://cdn.sanity.io/images/m3m672rb/production/a.jpg", "m3m672rb", "fan-photos"), false);
  assert.equal(isTrustedSanityImageUrl("https://user:pass@cdn.sanity.io/images/m3m672rb/fan-photos/a.jpg", "m3m672rb", "fan-photos"), false);
});

test("public projection drops private contact and review fields", () => {
  const publicPhoto = toPublicFanPhoto({
    _id: "submission-1",
    assetId: "image-abc-800x1000-jpg",
    credit: "A fan",
    caption: "At the show",
    altText: "Briella singing",
    email: "private@example.com",
    reviewNotes: "private notes",
  });

  assert.deepEqual(Object.keys(publicPhoto).sort(), ["_id", "altText", "assetId", "caption", "credit"]);
  assert.equal("email" in publicPhoto, false);
  assert.equal("reviewNotes" in publicPhoto, false);
});
