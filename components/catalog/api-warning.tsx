"use client";

import { Alert } from "antd";

export function ApiWarning({ message }: { message: string }) {
  if (!message) return null;

  return (
    <Alert
      type="warning"
      showIcon
      className="mb-6"
      message="API is not connected"
      description={`${message}. Add MONGODB_URI to .env.local, then restart the dev server.`}
    />
  );
}
