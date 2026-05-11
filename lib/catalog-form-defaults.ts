import type { CategoryPayload, ProductPayload } from "@/types/catalog";

export const emptyLocalized = { en: "", vi: "" };

export const categoryInitialValues: CategoryPayload = {
  parentId: null,
  title: emptyLocalized,
  description: emptyLocalized,
  coverImage: "",
  banner: ""
};

export const productInitialValues: ProductPayload = {
  title: emptyLocalized,
  description: emptyLocalized,
  categorySlug: "",
  priceUsd: 0,
  images: [],
  colors: [],
  properties: [],
  details: emptyLocalized,
  materialsAndCare: emptyLocalized,
  shipping: emptyLocalized,
  returns: emptyLocalized,
  giftPackaging: "",
  isNew: false,
  salePercent: 0
};
