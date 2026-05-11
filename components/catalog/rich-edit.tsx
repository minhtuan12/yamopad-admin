"use client";

import { Collapse, Form } from "antd";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";

export function RichEdit({
  value,
  onChange
}: {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}) {
  return <SimpleEditor value={value} onChange={onChange} />;
}

export function LocalizedRichEditFields({
  prefix,
  label,
  optional
}: {
  prefix: string;
  label: string;
  optional?: boolean;
}) {
  return (
    <Collapse
      className="!mb-5 no-padding-collapse"
      destroyOnHidden
      items={[
        {
          key: `${prefix}-en`,
          label: `${label} (Tiếng Anh)`,
          children: <RichEditFormItem name={[prefix, "en"]} label={`${label} EN`} optional={optional} />
        },
        {
          key: `${prefix}-vi`,
          label: `${label} (Tiếng Việt)`,
          children: <RichEditFormItem name={[prefix, "vi"]} label={`${label} VI`} optional={optional} />
        }
      ]}
    />
  );
}

function RichEditFormItem({
  name,
  label,
  optional
}: {
  name: (string | number)[];
  label: string;
  optional?: boolean;
}) {
  return (
    <Form.Item name={name} rules={optional ? [] : [{ required: true }]} className="w-full !mb-0">
      <RichEdit />
    </Form.Item>
  );
}
