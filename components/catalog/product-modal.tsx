"use client";

import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Collapse, Form, Input, InputNumber, Modal, Select, Switch, Tabs } from "antd";
import { productInitialValues } from "../../lib/catalog-form-defaults";
import type { Category, ProductPayload } from "../../types/catalog";
import { ImageUploadField } from "./image-upload-field";
import { LocalizedFields } from "./localized-fields";
import { LocalizedRichEditFields, RichEdit } from "./rich-edit";

export function ProductModal({
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
  form: ReturnType<typeof Form.useForm<ProductPayload>>[0];
  onCancel: () => void;
  onSubmit: (values: ProductPayload) => void;
}) {
  const viTitle = Form.useWatch(["title", "vi"], form);
  const rootCategories = categories.filter((category) => !category.parentId);
  const categoryOptions = rootCategories.map((parent) => {
    const children = categories.filter((category) => category.parentId === parent.slug);
    return {
      label: `${parent.title.en} / ${parent.title.vi}`,
      options: [
        { label: `${parent.title.en} / ${parent.title.vi}`, value: parent.slug },
        ...children.map((child) => ({
          label: `- ${child.title.en} / ${child.title.vi}`,
          value: child.slug
        }))
      ]
    };
  });

  return (
    <Modal
      title={mode === "edit" ? "Cập nhật" : "Thêm mới"}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText={mode === "edit" ? "Lưu" : "Tạo"}
      cancelText="Đóng"
      confirmLoading={saving}
      width={1100}
      style={{ top: 24 }}
      styles={{
        body: {
          height: "calc(100vh - 190px)",
          overflowY: "auto",
          overflowX: "hidden"
        }
      }}
    >
      <Form layout="vertical" form={form} onFinish={onSubmit} initialValues={productInitialValues}>
        <Tabs
          items={[
            {
              key: "basic",
              label: "Thông tin cơ bản",
              children: (
                <>
                  <div className="grid gap-6 md:grid-cols-2">
                    <Form.Item name="categorySlug" label="Danh mục" rules={[{ required: true }]}>
                      <Select options={categoryOptions} placeholder="Chọn danh mục" />
                    </Form.Item>
                  </div>
                  <LocalizedFields prefix="title" label="Tên sản phẩm" />
                  <LocalizedFields prefix="description" label="Mô tả sản phẩm" textarea />
                  <div className="grid gap-3 md:grid-cols-3">
                    <Form.Item name="priceUsd" label="Giá (USD)" rules={[{ required: true }]}>
                      <InputNumber min={0} className="w-full" prefix="$" />
                    </Form.Item>
                    <Form.Item name="salePercent" label="Giảm giá (%)">
                      <InputNumber min={0} max={100} className="w-full" suffix="%" />
                    </Form.Item>
                    <Form.Item name="isNew" label="Sản phẩm mới?" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </div>
                </>
              )
            },
            {
              key: "media",
              label: "Hình ảnh & Các thuộc tính",
              children: (
                <>
                  <Form.Item name="images" label="Hình ảnh" rules={[{ required: true }]}>
                    <ImageUploadField multiple />
                  </Form.Item>
                  <Form.Item name="colors" label="Màu sắc">
                    <ImageUploadField multiple />
                  </Form.Item>
                  <ProductPropertiesEditor />
                </>
              )
            },
            {
              key: "content",
              label: "Các thông tin khác",
              children: (
                <>
                  <LocalizedRichEditFields prefix="details" label="Chi tiết sản phẩm" optional />
                  <LocalizedRichEditFields prefix="materialsAndCare" label="Chất liệu và cách bảo quản" optional />
                  <LocalizedRichEditFields prefix="shipping" label="Vận chuyển" optional />
                  <LocalizedRichEditFields prefix="returns" label="Hoàn trả hàng" optional />
                  <Collapse
                    destroyOnHidden
                    items={[
                      {
                        key: "giftPackaging",
                        label: "Đóng gói",
                        children: (
                          <Form.Item name="giftPackaging">
                            <RichEdit placeholder="Nhập thông tin đóng gói" />
                          </Form.Item>
                        )
                      }
                    ]}
                  />
                </>
              )
            }
          ]}
        />
      </Form>
    </Modal>
  );
}

function ProductPropertiesEditor() {
  const form = Form.useFormInstance<ProductPayload>();
  const properties = Form.useWatch("properties", form) || [];

  return (
    <Form.List name="properties">
      {(fields, { add, remove }) => (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-medium">Các thông tin khác</div>
              <div className="text-sm text-[#74788d]">Thêm các nhóm thuộc tính như Kích cỡ và Kiểu dáng</div>
            </div>
            <button
              type="button"
              className="cursor-pointer inline-flex h-9 items-center gap-2 rounded-md bg-[#6b46ff] px-3 text-sm font-medium text-white"
              onClick={() => add({ name: "", values: [] })}
            >
              <PlusOutlined />
              Tạo
            </button>
          </div>

          {fields.map((field) => {
            return (
              <div key={field.key} className="rounded-lg border border-[#ececf2] p-4">
                <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                  <Form.Item
                    {...field}
                    name={[field.name, "name"]}
                    label="Tên thuộc tính"
                    rules={[{ required: true, message: "Vui lòng điền tên thuộc tính" }]}
                  >
                    <Input placeholder="Ví dụ: Kích cỡ" />
                  </Form.Item>
                  <button
                    type="button"
                    className="cursor-pointer mt-6.5 inline-flex h-9 items-center gap-2 rounded-md border border-[#ffccc7] px-3 text-sm text-[#cf1322]"
                    onClick={() => remove(field.name)}
                  >
                    <DeleteOutlined />
                    Xóa
                  </button>
                </div>
                <Form.Item
                  {...field}
                  name={[field.name, "values"]}
                  label="Các giá trị"
                  rules={[{ required: true, message: "Nhập ít nhất 1 giá trị và Enter để thêm" }]}
                >
                  <Select mode="tags" tokenSeparators={[","]} placeholder="M, S, L" />
                </Form.Item>
              </div>
            );
          })}
        </div>
      )}
    </Form.List>
  );
}
