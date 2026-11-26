import assert from "node:assert/strict";
import { test } from "node:test";
import { pageContext } from "./page-type.ts";

test("groups every route of the site", () => {
  const cases: Array<[string, string, string | undefined]> = [
    ["/", "home", undefined],
    ["/products", "products", undefined],
    ["/petroleum-tanker", "product", "petroleum-tanker"],
    ["/water-tanker/", "product", "water-tanker"],
    ["/calculator", "calculator", undefined],
    ["/about", "about", undefined],
    ["/contact", "contact", undefined],
    ["/career", "careers", undefined],
    ["/career/quality-inspector", "job", "quality-inspector"],
    ["/blog", "blog", undefined],
    ["/blog/page/2", "blog", undefined],
    ["/blog/choosing-a-tanker", "blog_post", "choosing-a-tanker"],
    ["/blog/category/guides", "blog_category", "guides"],
    ["/blog/author/devarsh", "blog_author", "devarsh"],
    ["/something-else", "other", undefined],
  ];
  for (const [path, type, slug] of cases) {
    const c = pageContext(path);
    assert.equal(c.page_type, type, path);
    assert.equal(c.page_slug, slug, path);
    assert.ok(c.content_group);
  }
});
