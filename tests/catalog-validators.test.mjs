import assert from "node:assert/strict";
import test from "node:test";

import { validateCategoryPayload, validateProductPayload } from "../dist-test/lib/validators/catalog.js";
import { createSlugFromViTitle } from "../dist-test/lib/slug.js";

test("creates slug from Vietnamese title", () => {
  assert.equal(createSlugFromViTitle("Đầm lụa màu ngà cao cấp"), "dam-lua-mau-nga-cao-cap");
});

test("category payload requires both English and Vietnamese localized fields", () => {
  const result = validateCategoryPayload({
    title: { en: "Scarves" },
    description: { en: "Silk scarves", vi: "" },
    coverImage: "/cover.jpg",
    banner: "/banner.jpg"
  });

  assert.equal(result.ok, false);
  assert.equal(result.errors["title.vi"], "Vietnamese text is required");
  assert.equal(result.errors["description.vi"], "Vietnamese text is required");
});

test("product payload preserves image and color URLs", () => {
  const result = validateProductPayload({
    title: { en: "Ivory Dress", vi: "Dam lua mau nga" },
    description: { en: "Soft silk dress", vi: "Dam lua mem" },
    categorySlug: "dresses",
    priceUsd: "189",
    stock: "12",
    images: "/a.jpg, /b.jpg",
    colors: ["/colors/ivory.jpg", "/colors/black.jpg"],
    salePercent: 10,
    isNew: true
  });

  assert.equal(result.ok, true);
  assert.deepEqual(result.data.images, ["/a.jpg", "/b.jpg"]);
  assert.deepEqual(result.data.colors, ["/colors/ivory.jpg", "/colors/black.jpg"]);
  assert.equal(result.data.priceUsd, 189);
  assert.equal(result.data.slug, "dam-lua-mau-nga");
});

test("product payload normalizes editable property groups with generated slugs", () => {
  const result = validateProductPayload({
    title: { en: "Silk Shirt", vi: "Ao lua" },
    description: { en: "Soft shirt", vi: "Ao lua mem" },
    categorySlug: "shirts",
    priceUsd: 120,
    stock: 7,
    images: ["/shirt.jpg"],
    colors: ["Ivory"],
    properties: [
      { name: "Sizes", values: [" M ", "S", "", "L"] },
      { name: "Types", values: ["Long sleeve", "Short sleeve"] }
    ]
  });

  assert.equal(result.ok, true);
  assert.deepEqual(result.data.properties, [
    { slug: "sizes", name: "Sizes", values: ["M", "S", "L"] },
    { slug: "types", name: "Types", values: ["Long sleeve", "Short sleeve"] }
  ]);
});

test("product payload preserves rich HTML content fields", () => {
  const result = validateProductPayload({
    title: { en: "Silk Robe", vi: "Ao choang lua" },
    description: { en: "Soft robe", vi: "Ao choang mem" },
    categorySlug: "robes",
    priceUsd: 160,
    stock: 4,
    images: ["/robe.jpg"],
    colors: ["/colors/ivory.jpg"],
    details: {
      en: "<p><strong>Relaxed fit</strong></p>",
      vi: "<p><strong>Dang rong</strong></p>"
    },
    materialsAndCare: {
      en: "<ul><li>Dry clean</li></ul>",
      vi: "<ul><li>Giat kho</li></ul>"
    },
    shipping: {
      en: "<p>Ships in 2 days</p>",
      vi: "<p>Giao trong 2 ngay</p>"
    },
    returns: {
      en: "<p>Return in 14 days</p>",
      vi: "<p>Doi tra trong 14 ngay</p>"
    },
    giftPackaging: {
      en: "<p>Premium gift box</p>",
      vi: "<p>Hop qua cao cap</p>"
    }
  });

  assert.equal(result.ok, true);
  assert.equal(result.data.details.en, "<p><strong>Relaxed fit</strong></p>");
  assert.equal(result.data.materialsAndCare.en, "<ul><li>Dry clean</li></ul>");
  assert.equal(result.data.shipping.en, "<p>Ships in 2 days</p>");
  assert.equal(result.data.returns.en, "<p>Return in 14 days</p>");
  assert.equal(result.data.giftPackaging.en, "<p>Premium gift box</p>");
  assert.equal(result.data.giftPackaging.vi, "<p>Hop qua cao cap</p>");
});

test("product payload omits empty optional rich content fields", () => {
  const result = validateProductPayload({
    title: { en: "Silk Robe", vi: "Ao choang lua" },
    description: { en: "Soft robe", vi: "Ao choang mem" },
    categorySlug: "robes",
    priceUsd: 160,
    stock: 0,
    images: ["/robe.jpg"],
    colors: ["/colors/ivory.jpg"],
    details: { en: "", vi: "" },
    materialsAndCare: { en: "<p></p>", vi: "<p></p>" },
    shipping: undefined,
    returns: { en: "", vi: "" },
    giftPackaging: { en: "", vi: "" }
  });

  assert.equal(result.ok, true);
  assert.equal("details" in result.data, false);
  assert.equal("materialsAndCare" in result.data, false);
  assert.equal("shipping" in result.data, false);
  assert.equal("returns" in result.data, false);
  assert.equal("giftPackaging" in result.data, false);
});

test("product payload requires numeric stock", () => {
  const result = validateProductPayload({
    title: { en: "Silk Robe", vi: "Ao choang lua" },
    description: { en: "Soft robe", vi: "Ao choang mem" },
    categorySlug: "robes",
    priceUsd: 160,
    images: ["/robe.jpg"],
    colors: ["/colors/ivory.jpg"]
  });

  assert.equal(result.ok, false);
  assert.equal(result.errors.stock, "Stock must be a positive number");
});
