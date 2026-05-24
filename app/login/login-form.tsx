"use client";

import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Alert, Button, Form, Input } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Logo from "../../public/logo.svg";

type LoginValues = {
  username: string;
  password: string;
};

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(values: LoginValues) {
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        setError(payload.error || "Unable to sign in");
        return;
      }

      const nextPath = new URLSearchParams(window.location.search).get("next") || "/categories";
      router.replace(nextPath);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f5f8] px-4 py-10">
      <section className="w-full max-w-[420px] rounded-lg border border-[#e6e7ee] bg-white p-7 shadow-[0_16px_44px_rgba(20,20,43,0.08)]">
        <div className="mb-8 flex justify-center">
          <Image src={Logo} width={150} height={60} alt="Manito Silk" priority />
        </div>
        <Form<LoginValues> layout="vertical" requiredMark={false} onFinish={handleSubmit}>
          {error && <Alert type="error" message={error} showIcon className="mb-5" />}
          <Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true, message: "Nhập tên đăng nhập" }]}>
            <Input prefix={<UserOutlined />} autoComplete="username" size="large" />
          </Form.Item>
          <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: "Nhập mật khẩu" }]}>
            <Input.Password prefix={<LockOutlined />} autoComplete="current-password" size="large" />
          </Form.Item>
          <Button type="primary" htmlType="submit" size="large" loading={loading} block>
            Đăng nhập
          </Button>
        </Form>
      </section>
    </main>
  );
}
