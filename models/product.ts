import { model, models, Schema, type InferSchemaType } from "mongoose";
import { localizedTextSchema } from "./shared";

const productPropertySchema = new Schema(
  {
    slug: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    values: [{ type: String, required: true, trim: true }]
  },
  { _id: false }
);

const productSchema = new Schema(
  {
    slug: { type: String, required: true, index: true, trim: true },
    title: { type: localizedTextSchema, required: true },
    description: { type: localizedTextSchema, required: true },
    categorySlug: { type: String, required: true, index: true, trim: true },
    priceUsd: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    images: [{ type: String, required: true, trim: true }],
    colors: [{ type: String }],
    properties: { type: [productPropertySchema], default: [] },
    details: { type: localizedTextSchema },
    materialsAndCare: { type: localizedTextSchema },
    shipping: { type: localizedTextSchema },
    returns: { type: localizedTextSchema },
    giftPackaging: { type: localizedTextSchema },
    isNew: { type: Boolean, default: false },
    salePercent: { type: Number, default: 0, min: 0 },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null }
  },
  {
    timestamps: true,
    versionKey: false,
    suppressReservedKeysWarning: true
  }
);

export type ProductDocument = InferSchemaType<typeof productSchema>;

const ProductModel = models.Product || model("Product", productSchema);

export default ProductModel;
