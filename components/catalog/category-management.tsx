"use client";

import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Form, Image, Popconfirm, Space, Spin, Table, Tag, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import { AdminPanel } from "@/components/admin/admin-panel";
import { useAdminSearch } from "@/components/admin/admin-context";
import { PageHeading } from "@/components/admin/page-heading";
import { categoryInitialValues } from "@/lib/catalog-form-defaults";
import type { Category, CategoryPayload } from "@/types/catalog";
import { useCatalog } from "@/hooks/use-catalog";
import { ApiWarning } from "./api-warning";
import { CategoryModal } from "./category-modal";

const { Text } = Typography;

export function CategoryManagement() {
  const { query } = useAdminSearch();
  const { categories, loading, apiWarning, productCountByCategory, reload } = useCatalog();
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm<CategoryPayload>();

  const filteredCategories = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return categories;
    return categories.filter((category) =>
      [category.title.en, category.title.vi, category.slug].some((value) => value.toLowerCase().includes(needle))
    );
  }, [categories, query]);

  const columns: ColumnsType<Category> = [
    {
      title: "Category",
      dataIndex: "title",
      render: (_, record) => (
        <Space>
          <Image src={record.coverImage} alt={record.title.en} width={44} height={44} className="rounded-md object-cover" fallback="/placeholder.svg" preview={false} />
          <Space direction="vertical" size={0}>
            <Text strong>{record.title.en}</Text>
            <Text type="secondary">{record.title.vi}</Text>
          </Space>
        </Space>
      )
    },
    { title: "Slug", dataIndex: "slug", responsive: ["md"] },
    {
      title: "Parent",
      dataIndex: "parentId",
      responsive: ["lg"],
      render: (value) => value || <Text type="secondary">Root</Text>
    },
    {
      title: "Products",
      dataIndex: "slug",
      render: (slug) => <Tag color="blue">{productCountByCategory[slug] || 0}</Tag>
    },
    {
      title: "Actions",
      width: 130,
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm title="Delete category?" onConfirm={() => deleteCategory(record._id)}>
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  function openCreate() {
    setMode("create");
    setEditingId(null);
    form.setFieldsValue(categoryInitialValues);
    setModalOpen(true);
  }

  function openEdit(category: Category) {
    setMode("edit");
    setEditingId(category._id);
    form.setFieldsValue(category);
    setModalOpen(true);
  }

  async function saveCategory(values: CategoryPayload) {
    setSaving(true);
    try {
      const response = await fetch(mode === "edit" ? `/api/categories/${editingId}` : "/api/categories", {
        method: mode === "edit" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Category save failed");
      message.success(mode === "edit" ? "Category updated" : "Category created");
      setModalOpen(false);
      await reload();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Category save failed");
    } finally {
      setSaving(false);
    }
  }

  async function deleteCategory(id: string) {
    const response = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (!response.ok) {
      message.error("Category delete failed");
      return;
    }
    message.success("Category deleted");
    await reload();
  }

  return (
    <>
      <PageHeading title="Quản lý danh mục" />
      <ApiWarning message={apiWarning} />
      <Spin spinning={loading}>
        <AdminPanel title="Danh mục" action={<Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Thêm mới</Button>}>
          <Table rowKey="_id" columns={columns} dataSource={filteredCategories} pagination={{ pageSize: 8 }} scroll={{ x: 860 }} />
        </AdminPanel>
      </Spin>
      <CategoryModal
        categories={categories}
        mode={mode}
        open={modalOpen}
        saving={saving}
        form={form}
        onCancel={() => setModalOpen(false)}
        onSubmit={saveCategory}
      />
    </>
  );
}
