import { NextResponse } from "next/server";
import { apiError } from "../../../../lib/api-response";
import { connectMongo } from "../../../../lib/mongodb";
import { validateCategoryPayload } from "../../../../lib/validators/catalog";
import CategoryModel from "../../../../models/category";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type CategoryLean = {
  _id: unknown;
  parentId?: string | null;
  slug: string;
};

export async function PUT(request: Request, context: RouteContext) {
  try {
    const validation = validateCategoryPayload(await request.json());
    if (!validation.ok) {
      return NextResponse.json({ errors: validation.errors }, { status: 422 });
    }

    await connectMongo();
    const { id } = await context.params;
    const currentCategory = await CategoryModel.findById(id).lean<CategoryLean>();
    if (!currentCategory) return NextResponse.json({ error: "Category not found" }, { status: 404 });

    if (validation.data.parentId) {
      const parent = await CategoryModel.findOne({ slug: validation.data.parentId }).lean<CategoryLean>();
      if (!parent) return NextResponse.json({ error: "Parent category not found" }, { status: 422 });
      if (String(parent._id) === id) return NextResponse.json({ error: "Category cannot be its own parent" }, { status: 422 });
      if (parent.parentId) return NextResponse.json({ error: "Only two category levels are allowed" }, { status: 422 });
      const hasChildren = await CategoryModel.exists({ parentId: currentCategory.slug });
      if (hasChildren) {
        return NextResponse.json({ error: "A parent category with children cannot become a child category" }, { status: 422 });
      }
    }
    const category = await CategoryModel.findByIdAndUpdate(id, validation.data, {
      new: true,
      runValidators: true
    });
    if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });
    if (currentCategory.slug !== category.slug) {
      await CategoryModel.updateMany({ parentId: currentCategory.slug }, { parentId: category.slug });
    }
    return NextResponse.json({ category });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await connectMongo();
    const { id } = await context.params;
    const category = await CategoryModel.findByIdAndDelete(id);
    if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
