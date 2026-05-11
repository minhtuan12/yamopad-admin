"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Category, Product } from '../types/catalog';

export function useCatalog() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiWarning, setApiWarning] = useState("");

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    setApiWarning("");
    try {
      const [categoryResponse, productResponse] = await Promise.all([
        fetch("/api/categories", { cache: "no-store" }),
        fetch("/api/products", { cache: "no-store" })
      ]);
      const categoryJson = await categoryResponse.json();
      const productJson = await productResponse.json();

      if (!categoryResponse.ok) throw new Error(categoryJson.error || "Failed to load categories");
      if (!productResponse.ok) throw new Error(productJson.error || "Failed to load products");

      setCategories(categoryJson.categories || []);
      setProducts(productJson.products || []);
    } catch (error) {
      setApiWarning(error instanceof Error ? error.message : "Failed to load catalog data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  const productCountByCategory = useMemo(() => {
    return products.reduce<Record<string, number>>((acc, product) => {
      acc[product.categorySlug] = (acc[product.categorySlug] || 0) + 1;
      return acc;
    }, {});
  }, [products]);

  return {
    categories,
    products,
    loading,
    apiWarning,
    productCountByCategory,
    reload: loadCatalog
  };
}
