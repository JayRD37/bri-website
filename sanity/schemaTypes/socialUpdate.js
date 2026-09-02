import { defineField, defineType } from "sanity";

const platformHosts = {
  facebook: ["facebook.com", "www.facebook.com"],
  instagram: ["instagram.com", "www.instagram.com"],
};

export default defineType({
  name: "socialUpdate",
  title: "Social update",
  type: "document",
  fields: [
    defineField({
      name: "platform",
      title: "Platform",
      type: "string",
      options: {
        layout: "radio",
        list: [
          { title: "Facebook", value: "facebook" },
          { title: "Instagram", value: "instagram" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "title", title: "Headline", type: "string", validation: (Rule) => Rule.required().max(120) }),
    defineField({ name: "summary", title: "Short summary", type: "text", rows: 3, validation: (Rule) => Rule.required().max(320) }),
    defineField({
      name: "url",
      title: "Facebook or Instagram post URL",
      type: "url",
      validation: (Rule) =>
        Rule.required().custom((value, context) => {
          if (!value) return true;
          try {
            const parsed = new URL(value);
            const platform = context.document?.platform;
            const allowed = platformHosts[platform] || [];
            return parsed.protocol === "https:" && allowed.includes(parsed.hostname)
              ? true
              : "Use an HTTPS URL from the selected Facebook or Instagram platform.";
          } catch {
            return "Enter a valid Facebook or Instagram URL.";
          }
        }),
    }),
    defineField({
      name: "publishedAt",
      title: "Post date",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { title: "title", platform: "platform", date: "publishedAt" },
    prepare({ title, platform, date }) {
      const day = date ? new Date(date).toLocaleDateString() : "No date";
      return { title: title || "Social update", subtitle: `${platform || "social"} · ${day}` };
    },
  },
});
