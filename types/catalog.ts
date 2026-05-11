export type LocalizedText = {
  en: string;
  vi: string;
};

export type ProductProperty = {
  slug: string;
  name: string;
  values: string[];
};

export type Category = {
  _id: string;
  parentId: string | null;
  slug: string;
  title: LocalizedText;
  description: LocalizedText;
  coverImage: string;
  banner: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Product = {
  _id: string;
  slug: string;
  title: LocalizedText;
  description: LocalizedText;
  categorySlug: string;
  priceUsd: number;
  images: string[];
  colors: string[];
  properties: ProductProperty[];
  details?: LocalizedText;
  materialsAndCare?: LocalizedText;
  shipping?: LocalizedText;
  returns?: LocalizedText;
  giftPackaging?: string;
  isNew: boolean;
  salePercent: number;
  createdAt?: string;
  updatedAt?: string;
};

export type CategoryPayload = Omit<Category, "_id" | "slug" | "createdAt" | "updatedAt"> & {
  slug?: string;
};

export type ProductPayload = Omit<Product, "_id" | "slug" | "createdAt" | "updatedAt"> & {
  slug?: string;
};
