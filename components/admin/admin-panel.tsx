"use client";

import { Space, Typography } from "antd";

const { Title } = Typography;

export function AdminPanel({
  title,
  action,
  children
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="admin-card overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-[#ececf2] px-5 py-4">
        <Space>
          <span className="section-title-mark" />
          <Title level={4} className="!mb-0">{title}</Title>
        </Space>
        {action}
      </div>
      <div className="p-4 md:p-5">{children}</div>
    </section>
  );
}
