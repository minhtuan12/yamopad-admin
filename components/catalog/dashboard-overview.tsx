"use client";

import { PlusOutlined, ProductOutlined, TagsOutlined } from "@ant-design/icons";
import { Button, Image, Space, Spin, Statistic, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import Link from "next/link";
import { useMemo } from "react";
import { AdminPanel } from "@/components/admin/admin-panel";
import { useAdminSearch } from "@/components/admin/admin-context";
import { PageHeading } from "@/components/admin/page-heading";
import { useCatalog } from "@/hooks/use-catalog";
import type { Product } from "@/types/catalog";
import { ApiWarning } from "./api-warning";

const { Text } = Typography;

export function DashboardOverview() {
  const { query } = useAdminSearch();
  const { categories, products, loading, apiWarning } = useCatalog();
  const filteredProducts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return products;
    return products.filter((product) =>
      [product.title.en, product.title.vi, product.slug, product.categorySlug].some((value) =>
        value.toLowerCase().includes(needle)
      )
    );
  }, [products, query]);

  const totals = useMemo(() => {
    const revenue = products.reduce((sum, product) => sum + product.priceUsd * (1 - product.salePercent / 100), 0);
    const saleItems = products.filter((product) => product.salePercent > 0).length;
    return { revenue, saleItems };
  }, [products]);

  const columns: ColumnsType<Product> = [
    {
      title: "Product",
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
    { title: "Category", dataIndex: "categorySlug", responsive: ["md"] },
    {
      title: "Price",
      dataIndex: "priceUsd",
      render: (price, record) => (
        <Space>
          <Text>${price.toLocaleString()}</Text>
          {record.salePercent > 0 && <Tag color="red">-{record.salePercent}%</Tag>}
        </Space>
      )
    }
  ];

  return (
    <>
      <PageHeading title="Dashboard" />
      <ApiWarning message={apiWarning} />
      <Spin spinning={loading}>
        <Space direction="vertical" size={24} className="w-full">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="metric-card"><Statistic title="Products" value={products.length} prefix={<ProductOutlined />} /></div>
            <div className="metric-card"><Statistic title="Categories" value={categories.length} prefix={<TagsOutlined />} /></div>
            <div className="metric-card"><Statistic title="Sale items" value={totals.saleItems} suffix="items" /></div>
            <div className="metric-card"><Statistic title="Catalog value" value={totals.revenue} prefix="$" precision={0} /></div>
          </div>
          <AdminPanel title="Recent Products" action={<Link href="/products"><Button type="primary" icon={<PlusOutlined />}>Manage products</Button></Link>}>
            <Table rowKey="_id" columns={columns} dataSource={filteredProducts.slice(0, 5)} pagination={false} scroll={{ x: 720 }} />
          </AdminPanel>
        </Space>
      </Spin>
    </>
  );
}
