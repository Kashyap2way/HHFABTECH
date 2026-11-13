import { CaseIcon } from "@sanity/icons/Case";
import { DocumentTextIcon } from "@sanity/icons/DocumentText";
import { EnvelopeIcon } from "@sanity/icons/Envelope";
import { InboxIcon } from "@sanity/icons/Inbox";
import { UserIcon } from "@sanity/icons/User";
import type { StructureResolver } from "sanity/structure";
import { INQUIRY_STATUSES } from "./schemaTypes/inquiry";
import { APPLICATION_STATUSES } from "./schemaTypes/jobApplication";

/** Studio sidebar: openings split by status, applications grouped by pipeline stage. */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("HH FABTECH")
    .items([
      S.listItem()
        .title("Blog")
        .icon(DocumentTextIcon)
        .child(
          S.list()
            .title("Blog")
            .items([
              S.documentTypeListItem("post").title("Posts"),
              S.documentTypeListItem("category").title("Categories"),
              S.documentTypeListItem("author").title("Authors"),
            ]),
        ),
      S.listItem()
        .title("Sales inquiries")
        .icon(EnvelopeIcon)
        .child(
          S.list()
            .title("Sales inquiries")
            .items([
              ...INQUIRY_STATUSES.map((s) =>
                S.listItem()
                  .title(s.title)
                  .icon(EnvelopeIcon)
                  .child(
                    S.documentList()
                      .title(`${s.title} inquiries`)
                      .schemaType("inquiry")
                      .filter('_type == "inquiry" && status == $status')
                      .params({ status: s.value })
                      .defaultOrdering([
                        { field: "submittedAt", direction: "desc" },
                      ]),
                  ),
              ),
              S.divider(),
              S.documentTypeListItem("inquiry").title("All inquiries"),
            ]),
        ),
      S.divider(),
      S.listItem()
        .title("Job openings")
        .icon(CaseIcon)
        .child(
          S.list()
            .title("Job openings")
            .items([
              S.listItem()
                .title("Open")
                .child(
                  S.documentList()
                    .title("Open jobs")
                    .schemaType("jobPosting")
                    .filter('_type == "jobPosting" && status == "open"')
                    .defaultOrdering([
                      { field: "datePosted", direction: "desc" },
                    ]),
                ),
              S.listItem()
                .title("Closed")
                .child(
                  S.documentList()
                    .title("Closed jobs")
                    .schemaType("jobPosting")
                    .filter('_type == "jobPosting" && status != "open"'),
                ),
              S.divider(),
              S.documentTypeListItem("jobPosting").title("All jobs"),
            ]),
        ),
      S.listItem()
        .title("Applications")
        .icon(InboxIcon)
        .child(
          S.list()
            .title("Applications")
            .items([
              ...APPLICATION_STATUSES.map((s) =>
                S.listItem()
                  .title(s.title)
                  .icon(UserIcon)
                  .child(
                    S.documentList()
                      .title(`${s.title} applications`)
                      .schemaType("jobApplication")
                      .filter('_type == "jobApplication" && status == $status')
                      .params({ status: s.value })
                      .defaultOrdering([
                        { field: "submittedAt", direction: "desc" },
                      ]),
                  ),
              ),
              S.divider(),
              S.documentTypeListItem("jobApplication").title(
                "All applications",
              ),
            ]),
        ),
    ]);
