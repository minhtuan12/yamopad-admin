import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-response";
import { connectMongo } from "@/lib/mongodb";
import { validateProductPayload } from "@/lib/validators/catalog";
import ProductModel from "@/models/product";
import CategoryModel from "@/models/category";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  try {
    const validation = validateProductPayload(await request.json());
    if (!validation.ok) {
      return NextResponse.json({ errors: validation.errors }, { status: 422 });
    }

    await connectMongo();
    const category = await CategoryModel.findOne({ slug: validation.data.categorySlug }).lean();
    if (!category) return NextResponse.json({ error: "Category not found" }, { status: 422 });
    const { id } = await context.params;
    const product = await ProductModel.findByIdAndUpdate(id, validation.data, {
      new: true,
      runValidators: true
    });
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    return NextResponse.json({ product });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await connectMongo();
    const { id } = await context.params;
    const product = await ProductModel.findByIdAndDelete(id);
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
