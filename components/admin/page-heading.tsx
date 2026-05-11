"use client";

import { Space, Typography } from "antd";

const { Title, Text } = Typography;

export function PageHeading({ title, description }: { title: string; description?: string }) {
  return (
    <Space direction="vertical" size={4} className="mb-6">
      <Title level={2} className="!mb-0">{title}</Title>
      <Text type="secondary">{description}</Text>
    </Space>
  );
}
