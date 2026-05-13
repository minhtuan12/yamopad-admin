"use client";

import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Form, Image, notification, Popconfirm, Space, Spin, Switch, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import { AdminPanel } from "../../components/admin/admin-panel";
import { useAdminSearch } from "../../components/admin/admin-context";
import { PageHeading } from "../../components/admin/page-heading";
import { productInitialValues } from "../../lib/catalog-form-defaults";
import type { Product, ProductPayload } from "../../types/catalog";
import { useCatalog } from "../../hooks/use-catalog";
import { ApiWarning } from "./api-warning";
import { ProductModal } from "./product-modal";

const { Text } = Typography;
const notificationPlacement = "topRight" as const;

export function ProductManagement() {
  const { query } = useAdminSearch();
  const { categories, products, loading, apiWarning, reload } = useCatalog();
  const [notificationApi, notificationContextHolder] = notification.useNotification();
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
      align: 'right',
      width: 100,
      render: (price, record) => (
        <Space direction="vertical" size={0}>
          <Text>${price.toLocaleString()}</Text>
          {record.salePercent > 0 && <Tag color="red">-{record.salePercent}%</Tag>}
        </Space>
      )
    },
    {
      title: "Sản phẩm mới",
      align: 'center',
      width: 150,
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
          <Popconfirm title="Xóa sản phẩm này?" okText="Xóa" cancelText="Hủy" onConfirm={() => deleteProduct(record._id)}>
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
      await response.json();
      if (!response.ok) throw new Error("PRODUCT_SAVE_FAILED");
      notificationApi.success({
        message: mode === "edit" ? "Đã cập nhật sản phẩm" : "Đã tạo sản phẩm",
        description: mode === "edit" ? "Thông tin sản phẩm đã được lưu thành công." : "Sản phẩm mới đã được thêm vào hệ thống.",
        placement: notificationPlacement
      });
      setModalOpen(false);
      await reload();
    } catch {
      notificationApi.error({
        message: mode === "edit" ? "Không thể cập nhật sản phẩm" : "Không thể tạo sản phẩm",
        description: "Vui lòng kiểm tra lại thông tin và thử lại.",
        placement: notificationPlacement
      });
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
        body: JSON.stringify({ ...product, stock: product.stock ?? 0, isNew })
      });
      await response.json();
      if (!response.ok) throw new Error("PRODUCT_UPDATE_FAILED");
      notificationApi.success({
        message: "Đã cập nhật trạng thái sản phẩm",
        description: isNew ? "Sản phẩm đã được đánh dấu là sản phẩm mới." : "Sản phẩm đã được bỏ đánh dấu sản phẩm mới.",
        placement: notificationPlacement
      });
      await reload();
    } catch {
      notificationApi.error({
        message: "Không thể cập nhật trạng thái sản phẩm",
        description: "Vui lòng thử lại sau.",
        placement: notificationPlacement
      });
    } finally {
      setUpdatingNewId(null);
    }
  }

  async function deleteProduct(id: string) {
    const response = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (!response.ok) {
      notificationApi.error({
        message: "Không thể xóa sản phẩm",
        description: "Vui lòng thử lại sau.",
        placement: notificationPlacement
      });
      return;
    }
    notificationApi.success({
      message: "Đã xóa sản phẩm",
      description: "Sản phẩm đã được xóa khỏi danh sách quản lý.",
      placement: notificationPlacement
    });
    await reload();
  }

  return (
    <>
      {notificationContextHolder}
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
