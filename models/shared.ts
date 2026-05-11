import { Schema } from "mongoose";

export const localizedTextSchema = new Schema(
  {
    en: { type: String, required: true, trim: true },
    vi: { type: String, required: true, trim: true }
  },
  { _id: false }
);
