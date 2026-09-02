import { defineArrayMember, defineField, defineType } from "sanity";

export default defineType({
  name: "fanPhotoSubmission",
  title: "Fan photo submission",
  type: "document",
  groups: [
    { name: "submission", title: "Submission", default: true },
    { name: "screening", title: "Automatic screening" },
    { name: "review", title: "Human review" },
  ],
  fields: [
    defineField({
      name: "image",
      title: "Photo",
      type: "image",
      group: "submission",
      description: "Original file remains in the private review dataset. The public site serves only a transformed derivative after approval.",
      options: { metadata: ["dimensions"] },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "credit", title: "Public photo credit", type: "string", group: "submission", validation: (Rule) => Rule.required().max(80) }),
    defineField({ name: "email", title: "Private contact email", type: "string", group: "submission", validation: (Rule) => Rule.required().email() }),
    defineField({ name: "caption", title: "Caption", type: "text", rows: 3, group: "submission", validation: (Rule) => Rule.max(400) }),
    defineField({ name: "altText", title: "Image description", type: "string", group: "submission", validation: (Rule) => Rule.max(240) }),
    defineField({ name: "submittedAt", title: "Submitted at", type: "datetime", group: "submission", readOnly: true }),
    defineField({ name: "adultConfirmed", title: "Submitter confirmed age 18+", type: "boolean", group: "submission", readOnly: true }),
    defineField({ name: "consentConfirmed", title: "Rights and consent confirmed", type: "boolean", group: "submission", readOnly: true }),
    defineField({
      name: "moderation",
      title: "Automatic screening result",
      type: "object",
      group: "screening",
      readOnly: true,
      fields: [
        defineField({ name: "status", title: "Status", type: "string" }),
        defineField({ name: "flagged", title: "Flagged", type: "boolean" }),
        defineField({ name: "model", title: "Model", type: "string" }),
        defineField({ name: "checkedAt", title: "Checked at", type: "datetime" }),
        defineField({ name: "categories", title: "Flagged categories", type: "array", of: [defineArrayMember({ type: "string" })] }),
        defineField({ name: "categoryScoresJson", title: "Category scores (JSON)", type: "text", rows: 8 }),
        defineField({ name: "note", title: "Screening note", type: "text", rows: 3 }),
      ],
    }),
    defineField({
      name: "status",
      title: "Review decision",
      type: "string",
      group: "review",
      description: "Only Approved photos can appear publicly. Review the full image and permissions before approving.",
      initialValue: "pending",
      options: {
        layout: "radio",
        list: [
          { title: "Pending review", value: "pending" },
          { title: "Automatically flagged", value: "flagged" },
          { title: "Approved for the fan gallery", value: "approved" },
          { title: "Rejected", value: "rejected" },
        ],
      },
      validation: (Rule) =>
        Rule.required().custom((value, context) => {
          if (value !== "approved") return true;

          const document = context.document || {};
          if (document.adultConfirmed !== true || document.consentConfirmed !== true) {
            return "Approval requires the submitter's age and rights/consent confirmations.";
          }

          const moderationPassed =
            document.moderation?.status === "passed" && document.moderation?.flagged === false;
          const reviewNotes = typeof document.reviewNotes === "string" ? document.reviewNotes.trim() : "";
          const overrideDocumented =
            document.moderationOverrideConfirmed === true && reviewNotes.length >= 10;

          return moderationPassed || overrideDocumented
            ? true
            : "Approval requires a passed automatic screen or a documented human override with review notes.";
        }),
    }),
    defineField({
      name: "moderationOverrideConfirmed",
      title: "Human moderation override confirmed",
      type: "boolean",
      group: "review",
      description: "Use only after personally inspecting a flagged/unavailable submission. Explain the decision in review notes.",
      initialValue: false,
    }),
    defineField({
      name: "reviewNotes",
      title: "Private review notes",
      type: "text",
      rows: 4,
      group: "review",
      validation: (Rule) =>
        Rule.custom((value, context) => {
          if (context.document?.moderationOverrideConfirmed !== true) return true;
          return typeof value === "string" && value.trim().length >= 10
            ? true
            : "Add at least 10 characters explaining a human override.";
        }),
    }),
  ],
  orderings: [
    { title: "Newest submissions", name: "submittedAtDesc", by: [{ field: "submittedAt", direction: "desc" }] },
  ],
  preview: {
    select: { title: "credit", status: "status", media: "image", submittedAt: "submittedAt" },
    prepare({ title, status, media, submittedAt }) {
      const date = submittedAt ? new Date(submittedAt).toLocaleDateString() : "Unknown date";
      return { title: title || "Fan photo", subtitle: `${status || "pending"} · ${date}`, media };
    },
  },
});
