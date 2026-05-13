import { model, models, Schema, type InferSchemaType } from "mongoose";
import { localizedTextSchema } from "./shared";

const categorySchema = new Schema(
  {
    parentId: { type: String, default: null, trim: true, index: true },
    slug: { type: String, required: true, unique: true, trim: true },
    title: { type: localizedTextSchema, required: true },
    description: { type: localizedTextSchema, required: true },
    coverImage: { type: String, required: true, trim: true },
    banner: { type: String, required: true, trim: true },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export type CategoryDocument = InferSchemaType<typeof categorySchema>;

const CategoryModel = models.Category || model("Category", categorySchema);

export default CategoryModel;
