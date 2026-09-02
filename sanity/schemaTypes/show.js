import { defineField, defineType } from "sanity";

export default defineType({
  name: "show",
  title: "Show",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Event or show name",
      type: "string",
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: "startDate",
      title: "Date and time",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "venue", title: "Venue", type: "string", validation: (Rule) => Rule.max(120) }),
    defineField({ name: "city", title: "City", type: "string", validation: (Rule) => Rule.required().max(80) }),
    defineField({ name: "stateRegion", title: "State or region", type: "string", validation: (Rule) => Rule.max(80) }),
    defineField({
      name: "timezone",
      title: "Venue time zone",
      description: "Choose the time zone where the show takes place so its local date and time stay correct.",
      type: "string",
      initialValue: "America/Chicago",
      options: {
        list: [
          { title: "Eastern — America/New_York", value: "America/New_York" },
          { title: "Central — America/Chicago", value: "America/Chicago" },
          { title: "Mountain — America/Denver", value: "America/Denver" },
          { title: "Arizona — America/Phoenix", value: "America/Phoenix" },
          { title: "Pacific — America/Los_Angeles", value: "America/Los_Angeles" },
          { title: "Alaska — America/Anchorage", value: "America/Anchorage" },
          { title: "Hawaii — Pacific/Honolulu", value: "Pacific/Honolulu" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "details", title: "Details", type: "text", rows: 3, validation: (Rule) => Rule.max(300) }),
    defineField({
      name: "ticketUrl",
      title: "Tickets or venue URL",
      type: "url",
      validation: (Rule) => Rule.uri({ scheme: ["https"] }),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      initialValue: "scheduled",
      options: {
        layout: "radio",
        list: [
          { title: "Scheduled", value: "scheduled" },
          { title: "Canceled", value: "canceled" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
  ],
  orderings: [{ title: "Soonest first", name: "startDateAsc", by: [{ field: "startDate", direction: "asc" }] }],
  preview: {
    select: { title: "title", date: "startDate", venue: "venue", status: "status" },
    prepare({ title, date, venue, status }) {
      const day = date ? new Date(date).toLocaleDateString() : "No date";
      return { title: title || "Untitled show", subtitle: `${day} · ${venue || "Venue TBA"} · ${status || "scheduled"}` };
    },
  },
});
