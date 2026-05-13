"use client";

import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Form, Image, notification, Popconfirm, Space, Spin, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import { AdminPanel } from "../../components/admin/admin-panel";
import { useAdminSearch } from "../../components/admin/admin-context";
import { PageHeading } from "../../components/admin/page-heading";
import { categoryInitialValues } from "../../lib/catalog-form-defaults";
import type { Category, CategoryPayload } from "../../types/catalog";
import { useCatalog } from "../../hooks/use-catalog";
import { ApiWarning } from "./api-warning";
import { CategoryModal } from "./category-modal";

const { Text } = Typography;
const notificationPlacement = "topRight" as const;

export function CategoryManagement() {
  const { query } = useAdminSearch();
  const { categories, loading, apiWarning, productCountByCategory, reload } = useCatalog();
  const [notificationApi, notificationContextHolder] = notification.useNotification();
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
      title: "Tên danh mục",
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
      title: "Số lượng sản phẩm",
      dataIndex: "slug",
      render: (slug) => <Tag color="blue">{productCountByCategory[slug] || 0}</Tag>
    },
    {
      title: "Hành động",
      width: 130,
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm okText="Xóa" cancelText="Hủy" title="Xóa danh mục này?" onConfirm={() => deleteCategory(record._id)}>
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
      await response.json();
      if (!response.ok) throw new Error("CATEGORY_SAVE_FAILED");
      notificationApi.success({
        message: mode === "edit" ? "Đã cập nhật danh mục" : "Đã tạo danh mục",
        description: mode === "edit" ? "Thông tin danh mục đã được lưu thành công." : "Danh mục mới đã được thêm vào hệ thống.",
        placement: notificationPlacement
      });
      setModalOpen(false);
      await reload();
    } catch {
      notificationApi.error({
        message: mode === "edit" ? "Không thể cập nhật danh mục" : "Không thể tạo danh mục",
        description: "Vui lòng kiểm tra lại thông tin và thử lại.",
        placement: notificationPlacement
      });
    } finally {
      setSaving(false);
    }
  }

  async function deleteCategory(id: string) {
    const response = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (!response.ok) {
      notificationApi.error({
        message: "Không thể xóa danh mục",
        description: "Vui lòng thử lại sau.",
        placement: notificationPlacement
      });
      return;
    }
    notificationApi.success({
      message: "Đã xóa danh mục",
      description: "Danh mục đã được xóa khỏi danh sách quản lý.",
      placement: notificationPlacement
    });
    await reload();
  }

  return (
    <>
      {notificationContextHolder}
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
