"use client";

import { PlusOutlined } from "@ant-design/icons";
import { Upload, message } from "antd";
import type { UploadFile, UploadProps } from "antd";

function urlsToFiles(urls: string[]): UploadFile[] {
  return urls.map((url, index) => ({
    uid: `${url}-${index}`,
    name: url.split("/").pop() || `image-${index + 1}`,
    status: "done",
    url
  }));
}

async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch("/api/uploads", {
    method: "POST",
    body: formData
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || "Upload failed");
  return json.url as string;
}

export function ImageUploadField({
  value,
  onChange,
  multiple
}: {
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  multiple?: boolean;
}) {
  const urls = Array.isArray(value) ? value : value ? [value] : [];

  const uploadProps: UploadProps = {
    accept: "image/*",
    listType: "picture-card",
    maxCount: multiple ? undefined : 1,
    fileList: urlsToFiles(urls),
    customRequest: async ({ file, onError, onSuccess }) => {
      try {
        const url = await uploadImage(file as File);
        onChange?.(multiple ? [...urls, url] : url);
        onSuccess?.({ url });
      } catch (error) {
        const uploadError = error instanceof Error ? error : new Error("Upload failed");
        message.error(uploadError.message);
        onError?.(uploadError);
      }
    },
    onRemove: (file) => {
      const next = urls.filter((url) => url !== file.url);
      onChange?.(multiple ? next : "");
    }
  };

  return (
    <Upload {...uploadProps}>
      {(multiple || urls.length === 0) && (
        <div>
          <PlusOutlined />
          <div className="mt-2">Upload</div>
        </div>
      )}
    </Upload>
  );
}
