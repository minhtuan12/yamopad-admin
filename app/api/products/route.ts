import { NextResponse } from "next/server";
import { apiError } from "../../../lib/api-response";
import { connectMongo } from "../../../lib/mongodb";
import { validateProductPayload } from "../../../lib/validators/catalog";
import ProductModel from "../../../models/product";
import CategoryModel from "../../../models/category";

export async function GET() {
  try {
    await connectMongo();
    const products = await ProductModel.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ products });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const validation = validateProductPayload(await request.json());
    if (!validation.ok) {
      return NextResponse.json({ errors: validation.errors }, { status: 422 });
    }

    await connectMongo();
    const category = await CategoryModel.findOne({
      slug: validation.data.categorySlug,
      isDeleted: { $ne: true }
    }).lean();
    if (!category) return NextResponse.json({ error: "Category not found" }, { status: 422 });
    const product = await ProductModel.create(validation.data);
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
