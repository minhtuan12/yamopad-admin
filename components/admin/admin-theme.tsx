"use client";

import { ConfigProvider } from "antd";

export function AdminTheme({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        token: { colorPrimary: "#6b46ff", borderRadius: 8, fontFamily: "Arial, Helvetica, sans-serif" },
        components: {
          Layout: { headerBg: "#ffffff", bodyBg: "#f5f5f8", siderBg: "#ffffff" },
          Menu: { itemSelectedBg: "#6b46ff", itemSelectedColor: "#ffffff", itemBorderRadius: 7 }
        }
      }}
    >
      {children}
    </ConfigProvider>
  );
}
