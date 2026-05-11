"use client";

import { Form, Modal, Select } from "antd";
import { categoryInitialValues } from "@/lib/catalog-form-defaults";
import type { Category, CategoryPayload } from "@/types/catalog";
import { ImageUploadField } from "./image-upload-field";
import { LocalizedFields } from "./localized-fields";

export function CategoryModal({
  categories,
  mode,
  open,
  saving,
  form,
  onCancel,
  onSubmit
}: {
  categories: Category[];
  mode: "create" | "edit";
  open: boolean;
  saving: boolean;
  form: ReturnType<typeof Form.useForm<CategoryPayload>>[0];
  onCancel: () => void;
  onSubmit: (values: CategoryPayload) => void;
}) {
  const categoryOptions = categories.filter((category) => !category.parentId).map((category) => ({
    label: `${category.title.en} / ${category.title.vi}`,
    value: category.slug
  }));

  return (
    <Modal
      title={mode === "edit" ? "Cập nhật" : "Thêm mới"}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText={mode === "edit" ? "Lưu" : "Tạo"}
      cancelText="Đóng"
      confirmLoading={saving}
      width={760}
    >
      <Form layout="vertical" form={form} onFinish={onSubmit} initialValues={categoryInitialValues}>
        <Form.Item name="parentId" label="Danh mục cha">
          <Select allowClear options={categoryOptions} placeholder="Chọn danh mục cha (nếu có)" />
        </Form.Item>
        <LocalizedFields prefix="title" label="Tên danh mục" />
        <LocalizedFields prefix="description" label="Mô tả" textarea />
        <div className="grid gap-3 md:grid-cols-2">
          <Form.Item name="coverImage" label="Thumbnail" rules={[{ required: true }]}>
            <ImageUploadField />
          </Form.Item>
          <Form.Item name="banner" label="Banner" rules={[{ required: true }]}>
            <ImageUploadField />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
