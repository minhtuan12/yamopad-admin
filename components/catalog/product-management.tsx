"use client";

import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Form, Image, Popconfirm, Space, Spin, Switch, Table, Tag, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import { AdminPanel } from "@/components/admin/admin-panel";
import { useAdminSearch } from "@/components/admin/admin-context";
import { PageHeading } from "@/components/admin/page-heading";
import { productInitialValues } from "@/lib/catalog-form-defaults";
import type { Product, ProductPayload } from "@/types/catalog";
import { useCatalog } from "@/hooks/use-catalog";
import { ApiWarning } from "./api-warning";
import { ProductModal } from "./product-modal";

const { Text } = Typography;

export function ProductManagement() {
  const { query } = useAdminSearch();
  const { categories, products, loading, apiWarning, reload } = useCatalog();
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [updatingNewId, setUpdatingNewId] = useState<string | null>(null);
  const [form] = Form.useForm<ProductPayload>();

  const categoryBySlug = useMemo(() => {
    return new Map(categories.map((category) => [category.slug, category]));
  }, [categories]);

  const filteredProducts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return products;
    return products.filter((product) =>
      [product.title.en, product.title.vi, product.slug, product.categorySlug].some((value) =>
        value.toLowerCase().includes(needle)
      )
    );
  }, [products, query]);

  const columns: ColumnsType<Product> = [
    {
      title: "Tên sản phẩm",
      dataIndex: "title",
      render: (_, record) => (
        <Space>
          <Image src={record.images[0]} alt={record.title.en} width={48} height={48} className="rounded-md object-cover" fallback="/placeholder.svg" preview={false} />
          <Space direction="vertical" size={0}>
            <Text strong>{record.title.en}</Text>
            <Text type="secondary">{record.title.vi}</Text>
          </Space>
        </Space>
      )
    },
    { title: "Slug", dataIndex: "slug", responsive: ["lg"] },
    {
      title: "Danh mục",
      dataIndex: "categorySlug",
      responsive: ["md"],
      render: (categorySlug) => {
        const category = categoryBySlug.get(categorySlug);
        if (!category) return <Text type="secondary">{categorySlug}</Text>;
        return (
          <Space direction="vertical" size={0}>
            <Text>{category.title.vi}</Text>
            <Text type="secondary">{category.title.en}</Text>
          </Space>
        );
      }
    },
    {
      title: "Giá",
      dataIndex: "priceUsd",
      render: (price, record) => (
        <Space direction="vertical" size={0}>
          <Text>${price.toLocaleString()}</Text>
          {record.salePercent > 0 && <Tag color="red">-{record.salePercent}%</Tag>}
        </Space>
      )
    },
    {
      title: "Sản phẩm mới",
      render: (_, record) => (
        <Switch
          checked={record.isNew}
          loading={updatingNewId === record._id}
          onChange={(checked) => updateProductIsNew(record, checked)}
        />
      )
    },
    {
      title: "Hành động",
      width: 130,
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm title="Delete product?" onConfirm={() => deleteProduct(record._id)}>
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  function openCreate() {
    setMode("create");
    setEditingId(null);
    form.setFieldsValue(productInitialValues as Parameters<typeof form.setFieldsValue>[0]);
    setModalOpen(true);
  }

  function openEdit(product: Product) {
    setMode("edit");
    setEditingId(product._id);
    form.setFieldsValue(product as Parameters<typeof form.setFieldsValue>[0]);
    setModalOpen(true);
  }

  async function saveProduct(values: ProductPayload) {
    setSaving(true);
    try {
      const response = await fetch(mode === "edit" ? `/api/products/${editingId}` : "/api/products", {
        method: mode === "edit" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Product save failed");
      message.success(mode === "edit" ? "Product updated" : "Product created");
      setModalOpen(false);
      await reload();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Product save failed");
    } finally {
      setSaving(false);
    }
  }

  async function updateProductIsNew(product: Product, isNew: boolean) {
    setUpdatingNewId(product._id);
    try {
      const response = await fetch(`/api/products/${product._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...product, isNew })
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Product update failed");
      message.success("Cập nhật sản phẩm mới thành công");
      await reload();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Product update failed");
    } finally {
      setUpdatingNewId(null);
    }
  }

  async function deleteProduct(id: string) {
    const response = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (!response.ok) {
      message.error("Product delete failed");
      return;
    }
    message.success("Product deleted");
    await reload();
  }

  return (
    <>
      <PageHeading title="Quản lý sản phẩm" />
      <ApiWarning message={apiWarning} />
      <Spin spinning={loading}>
        <AdminPanel title="Sản phẩm" action={<Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Thêm mới</Button>}>
          <Table rowKey="_id" columns={columns} dataSource={filteredProducts} pagination={{ pageSize: 8 }} scroll={{ x: 980 }} />
        </AdminPanel>
      </Spin>
      <ProductModal
        categories={categories}
        mode={mode}
        open={modalOpen}
        saving={saving}
        form={form}
        onCancel={() => setModalOpen(false)}
        onSubmit={saveProduct}
      />
    </>
  );
}
