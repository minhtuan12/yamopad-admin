"use client";

import {
  AppstoreOutlined,
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ProductOutlined,
  ShopOutlined,
  TagsOutlined,
  UserOutlined
} from "@ant-design/icons";
import { Avatar, Badge, Button, Drawer, Layout, Menu, Space, Tag, Typography } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import Logo from '@/public/logo.svg';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const navItems = [
  // { key: "/dashboard", icon: <AppstoreOutlined />, label: <Link href="/dashboard">Dashboard</Link> },
  { key: "/categories", icon: <TagsOutlined />, label: <Link href="/categories">Danh mục</Link> },
  { key: "/products", icon: <ProductOutlined />, label: <Link href="/products">Sản phẩm</Link> },
  // { key: "/orders", icon: <ShopOutlined />, label: <Link href="/orders">Orders preview</Link> }
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const selectedKey = navItems.find((item) => pathname.startsWith(item.key))?.key || "/dashboard";

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-3 border-b border-[#ececf2] px-6 justify-center">
        <Image src={Logo} width={0} height={0} className="w-30 h-auto" alt="Logo" />
      </div>
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        onClick={() => setDrawerOpen(false)}
        items={navItems}
        className="border-0 px-3 py-4"
      />
      <div className="mt-auto border-t border-[#ececf2] p-4">
        <Space>
          <Avatar icon={<UserOutlined />} />
          {!collapsed && (
            <Space direction="vertical" size={0}>
              <Text strong>Admin</Text>
            </Space>
          )}
        </Space>
      </div>
    </div>
  );

  return (
    <Layout className="!min-h-screen">
      <Sider width={276} collapsedWidth={86} collapsed={collapsed} breakpoint="lg" trigger={null} className="hidden border-r border-[#ececf2] lg:block">
        {sidebar}
      </Sider>
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} placement="left" width={290} closable={false} className="lg:hidden">
        {sidebar}
      </Drawer>
      <Layout>
        <Header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#ececf2] !px-6">
          <Space size={16}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => (window.innerWidth < 1024 ? setDrawerOpen(true) : setCollapsed((value) => !value))}
            />
          </Space>
          <Space size={18}>
            <Avatar icon={<UserOutlined />} />
          </Space>
        </Header>
        <Content className="p-4 md:p-8">
          <div className="mx-auto max-w-full">{children}</div>
        </Content>
      </Layout>
    </Layout>
  );
}
