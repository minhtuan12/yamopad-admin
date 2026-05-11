import { NextResponse } from "next/server";
import { apiError } from "../../../lib/api-response";
import { connectMongo } from "../../../lib/mongodb";
import { validateCategoryPayload } from "../../../lib/validators/catalog";
import CategoryModel from "../../../models/category";

type CategoryLean = {
  _id: unknown;
  parentId?: string | null;
  slug: string;
};

export async function GET() {
  try {
    await connectMongo();
    const categories = await CategoryModel.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ categories });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const validation = validateCategoryPayload(await request.json());
    if (!validation.ok) {
      return NextResponse.json({ errors: validation.errors }, { status: 422 });
    }

    await connectMongo();
    if (validation.data.parentId) {
      const parent = await CategoryModel.findOne({ slug: validation.data.parentId }).lean<CategoryLean>();
      if (!parent) return NextResponse.json({ error: "Parent category not found" }, { status: 422 });
      if (parent.parentId) return NextResponse.json({ error: "Only two category levels are allowed" }, { status: 422 });
    }
    const category = await CategoryModel.create(validation.data);
    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
