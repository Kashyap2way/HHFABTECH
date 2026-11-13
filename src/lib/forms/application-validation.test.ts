import assert from "node:assert/strict";
import { test } from "node:test";
import {
  cleanApplication,
  MAX_RESUME_BYTES,
  validateApplication,
} from "./application-validation.ts";

const valid = () => {
  const d = new FormData();
  d.set("name", "Ravi Patel");
  d.set("email", "ravi@example.com");
  d.set("phone", "+91 98765 43210");
  d.set("qualification", "Diploma Mechanical");
  d.set("job_position", "Quality Inspector");
  d.set("consent", "yes");
  d.set(
    "resume",
    new File(["%PDF-1.4"], "resume.pdf", { type: "application/pdf" }),
  );
  return d;
};

test("accepts a complete application", () => {
  assert.deepEqual(validateApplication(valid()), {});
});

test("requires name, email, phone, qualification, position, résumé and consent", () => {
  const e = validateApplication(new FormData());
  assert.deepEqual(Object.keys(e).sort(), [
    "consent",
    "email",
    "job_position",
    "name",
    "phone",
    "qualification",
    "resume",
  ]);
});

test("rejects bad email and short phone", () => {
  const d = valid();
  d.set("email", "ravi@");
  d.set("phone", "12345");
  const e = validateApplication(d);
  assert.ok(e.email);
  assert.ok(e.phone);
});

test("rejects disallowed résumé types and oversize files", () => {
  const d = valid();
  d.set(
    "resume",
    new File(["x"], "cv.exe", { type: "application/x-msdownload" }),
  );
  assert.ok(validateApplication(d).resume);
  d.set(
    "resume",
    new File([new Uint8Array(MAX_RESUME_BYTES + 1)], "cv.pdf", {
      type: "application/pdf",
    }),
  );
  assert.match(validateApplication(d).resume ?? "", /5 MB/);
});

test("accepts .docx with a generic MIME type", () => {
  const d = valid();
  d.set("resume", new File(["x"], "CV.DOCX", { type: "" }));
  assert.equal(validateApplication(d).resume, undefined);
});

test("cleanApplication trims and caps lengths, drops unknown keys", () => {
  const d = valid();
  d.set("name", `  ${"a".repeat(200)}  `);
  d.set("evil", "x");
  const c = cleanApplication(d);
  assert.equal(c.name.length, 80);
  assert.equal(c.evil, undefined);
});
