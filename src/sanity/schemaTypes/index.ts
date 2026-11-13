import type { SchemaTypeDefinition } from "sanity";
import { author } from "./author";
import { blockContent } from "./blockContent";
import { category } from "./category";
import { inquiry } from "./inquiry";
import { jobApplication } from "./jobApplication";
import { jobPosting } from "./jobPosting";
import { post } from "./post";

export const schemaTypes: SchemaTypeDefinition[] = [
  post,
  author,
  category,
  blockContent,
  inquiry,
  jobPosting,
  jobApplication,
];
