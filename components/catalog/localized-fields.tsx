"use client";

import { Form, Input } from "antd";

const { TextArea } = Input;

export function LocalizedFields({
  prefix,
  label,
  textarea,
  optional
}: {
  prefix: string;
  label: string;
  textarea?: boolean;
  optional?: boolean;
}) {
  const Control = textarea ? TextArea : Input;
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Form.Item name={[prefix, "en"]} label={`${label} (Tiếng Anh)`} rules={optional ? [] : [{ required: true }]}>
        <Control rows={textarea ? 3 : undefined} />
      </Form.Item>
      <Form.Item name={[prefix, "vi"]} label={`${label} (Tiếng Việt)`} rules={optional ? [] : [{ required: true }]}>
        <Control rows={textarea ? 3 : undefined} />
      </Form.Item>
    </div>
  );
}
