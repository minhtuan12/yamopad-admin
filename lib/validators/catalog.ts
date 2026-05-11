import type { CategoryPayload, LocalizedText, ProductPayload, ProductProperty } from "../../types/catalog";
import { createSlugFromViTitle } from "../slug";

type FieldErrors = Record<string, string>;

type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; errors: FieldErrors };

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function cleanText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function cleanLocalized(value: unknown): LocalizedText {
  const record = asRecord(value);
  return {
    en: cleanText(record.en),
    vi: cleanText(record.vi)
  };
}

function isEmptyHtml(value: string): boolean {
  return !value.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}

function cleanOptionalLocalized(value: unknown): LocalizedText | undefined {
  const localized = cleanLocalized(value);
  const enEmpty = isEmptyHtml(localized.en);
  const viEmpty = isEmptyHtml(localized.vi);
  return enEmpty && viEmpty ? undefined : localized;
}

function cleanStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(cleanText).filter(Boolean);
  }
  if (typeof value === "string") {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

function cleanProperties(value: unknown): ProductProperty[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    const record = asRecord(item);
    const name = cleanText(record.name);
    const values = cleanStringArray(record.values);
    const slug = createSlugFromViTitle(name);

    if (!name && !values.length) return [];

    return [{ slug, name, values }];
  });
}

function requireLocalized(errors: FieldErrors, key: string, value: LocalizedText) {
  if (!value.en) errors[`${key}.en`] = "English text is required";
  if (!value.vi) errors[`${key}.vi`] = "Vietnamese text is required";
}

export function validateCategoryPayload(input: unknown): ValidationResult<CategoryPayload> {
  const record = asRecord(input);
  const data: CategoryPayload = {
    parentId: cleanText(record.parentId) || null,
    title: cleanLocalized(record.title),
    description: cleanLocalized(record.description),
    coverImage: cleanText(record.coverImage),
    banner: cleanText(record.banner)
  };
  data.slug = createSlugFromViTitle(data.title.vi);
  const errors: FieldErrors = {};

  requireLocalized(errors, "title", data.title);
  requireLocalized(errors, "description", data.description);
  if (!data.slug && data.title.vi) errors.slug = "Vietnamese title must contain letters or numbers";
  if (!data.coverImage) errors.coverImage = "Cover image is required";
  if (!data.banner) errors.banner = "Banner is required";

  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data };
}

export function validateProductPayload(input: unknown): ValidationResult<ProductPayload> {
  const record = asRecord(input);
  const priceUsd = Number(record.priceUsd);
  const salePercent = Number(record.salePercent ?? 0);
  const data: ProductPayload = {
    title: cleanLocalized(record.title),
    description: cleanLocalized(record.description),
    categorySlug: cleanText(record.categorySlug),
    priceUsd,
    images: cleanStringArray(record.images),
    colors: cleanStringArray(record.colors),
    properties: cleanProperties(record.properties),
    isNew: Boolean(record.isNew),
    salePercent: Number.isFinite(salePercent) ? salePercent : 0
  };
  const details = cleanOptionalLocalized(record.details);
  const materialsAndCare = cleanOptionalLocalized(record.materialsAndCare);
  const shipping = cleanOptionalLocalized(record.shipping);
  const returns = cleanOptionalLocalized(record.returns);
  const giftPackaging = cleanText(record.giftPackaging);
  if (details) data.details = details;
  if (materialsAndCare) data.materialsAndCare = materialsAndCare;
  if (shipping) data.shipping = shipping;
  if (returns) data.returns = returns;
  if (!isEmptyHtml(giftPackaging)) data.giftPackaging = giftPackaging;
  data.slug = createSlugFromViTitle(data.title.vi);
  const errors: FieldErrors = {};

  requireLocalized(errors, "title", data.title);
  requireLocalized(errors, "description", data.description);
  if (!data.slug && data.title.vi) errors.slug = "Vietnamese title must contain letters or numbers";
  if (!data.categorySlug) errors.categorySlug = "Category is required";
  if (!Number.isFinite(data.priceUsd) || data.priceUsd < 0) errors.priceUsd = "Price must be a positive number";
  if (!data.images.length) errors.images = "At least one image is required";
  data.properties.forEach((property, index) => {
    if (!property.name) errors[`properties.${index}.name`] = "Property name is required";
    if (!property.slug) errors[`properties.${index}.slug`] = "Property name must contain letters or numbers";
    if (!property.values.length) errors[`properties.${index}.values`] = "At least one property value is required";
  });
  if (data.salePercent < 0) errors.salePercent = "Sale percent cannot be negative";

  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data };
}
