## Hướng dẫn dùng MinIO (S3) với TypeScript

MinIO của bạn:

- **Endpoint**: `https://minio.lynxsolution.vn`
- **Access key**: `admin` (hoặc user khác nếu bạn tạo sau này)
- **Secret key**: giá trị `MINIO_ROOT_PASSWORD` trong `docker-compose.yml`
- **Region gợi ý**: `us-east-1`

Bạn có thể dùng **AWS SDK for JavaScript v3** (TypeScript-first, 2026 vẫn ổn định).

---

## 1. Cài đặt dependencies

```bash
npm install @aws-sdk/client-s3 @aws-sdk/lib-storage @aws-sdk/s3-request-presigner
```

Nếu dùng `yarn`:

```bash
yarn add @aws-sdk/client-s3 @aws-sdk/lib-storage @aws-sdk/s3-request-presigner
```

---

## 2. Tạo client S3 cho MinIO

Tạo file `src/minioClient.ts`:

```ts
import { S3Client } from "@aws-sdk/client-s3";

export const minioClient = new S3Client({
  region: "us-east-1",
  endpoint: "https://minio.lynxsolution.vn",
  forcePathStyle: true, // BẮT BUỘC với MinIO / S3-compatible
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || "admin",
    secretAccessKey: process.env.MINIO_SECRET_KEY || "YOUR_MINIO_ROOT_PASSWORD",
  },
});
```

Gợi ý `.env`:

```env
MINIO_ACCESS_KEY=admin
MINIO_SECRET_KEY=pTBJ92nSN$*qFv#x9coJ   # ví dụ, thay bằng pass thực tế
MINIO_BUCKET=app-uploads
```

Và load env trong app (ví dụ Node.js):

```ts
import "dotenv/config";
```

---

## 3. Upload file lên MinIO bằng TypeScript

Ví dụ đơn giản: upload buffer/string.

```ts
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { minioClient } from "./minioClient";

const BUCKET = process.env.MINIO_BUCKET || "app-uploads";

export async function uploadTextExample() {
  const key = `examples/hello-${Date.now()}.txt`;
  const body = "Xin chào từ TypeScript + MinIO!";

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: body,
    ContentType: "text/plain; charset=utf-8",
  });

  await minioClient.send(command);

  console.log("Uploaded object:", {
    bucket: BUCKET,
    key,
    url: `https://minio.lynxsolution.vn/${BUCKET}/${encodeURIComponent(key)}`,
  });
}
```

Nếu bạn đang ở backend (Express/Fastify) và muốn upload file user gửi (Multer, busboy, …), chỉ cần truyền `Buffer` hoặc stream vào `Body`.

---

## 4. Upload file lớn (stream / multipart)

Với file lớn (vài trăm MB/GB), nên dùng high-level uploader:

```ts
import { Upload } from "@aws-sdk/lib-storage";
import { minioClient } from "./minioClient";

const BUCKET = process.env.MINIO_BUCKET || "app-uploads";

export async function uploadLargeFileFromFs(filePath: string, key: string) {
  const fs = await import("node:fs");
  const stream = fs.createReadStream(filePath);

  const upload = new Upload({
    client: minioClient,
    params: {
      Bucket: BUCKET,
      Key: key,
      Body: stream,
    },
    leavePartsOnError: false,
  });

  upload.on("httpUploadProgress", (progress) => {
    if (progress.loaded && progress.total) {
      const percent = (progress.loaded / progress.total) * 100;
      console.log(`Upload progress: ${percent.toFixed(2)}%`);
    }
  });

  await upload.done();
  console.log("Upload done:", key);
}
```

---

## 5. Download file từ MinIO

```ts
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { minioClient } from "./minioClient";
import { Readable } from "node:stream";

const BUCKET = process.env.MINIO_BUCKET || "app-uploads";

export async function downloadToBuffer(key: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  const res = await minioClient.send(command);

  const stream = res.Body as Readable;

  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}
```

---

## 6. Tạo pre-signed URL cho frontend upload/download

Để client (web/app mobile) **upload trực tiếp lên MinIO** mà không đi qua backend, bạn có thể tạo pre-signed URL ở backend.

```ts
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { minioClient } from "./minioClient";

const BUCKET = process.env.MINIO_BUCKET || "app-uploads";

export async function createUploadUrl(key: string, expiresInSeconds = 900) {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  const url = await getSignedUrl(minioClient, command, {
    expiresIn: expiresInSeconds,
  });

  return url; // client dùng PUT trực tiếp vào URL này
}

export async function createDownloadUrl(key: string, expiresInSeconds = 900) {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  const url = await getSignedUrl(minioClient, command, {
    expiresIn: expiresInSeconds,
  });

  return url; // client dùng GET trực tiếp
}
```

Ví dụ endpoint Express tạo pre-signed URL:

```ts
import express from "express";
import { createUploadUrl } from "./minioPresign";

const app = express();
app.use(express.json());

app.post("/api/upload-url", async (req, res) => {
  const { filename } = req.body;
  if (!filename) {
    return res.status(400).json({ error: "filename is required" });
  }

  const key = `uploads/${Date.now()}-${filename}`;
  const url = await createUploadUrl(key, 900);

  res.json({ uploadUrl: url, key });
});

app.listen(3000, () => {
  console.log("Server listening on http://localhost:3000");
});
```

---

## 7. Lưu ý quan trọng cho MinIO + TypeScript

- **forcePathStyle: true** là bắt buộc, nếu không nhiều SDK sẽ dùng dạng `bucket.minio.lynxsolution.vn` và dễ lỗi.
- Nếu bạn đổi domain hoặc thêm Cloudflare, nhớ:
  - Giữ **HTTPS** tới MinIO.
  - Cho phép **body size lớn** (Nginx đã set `client_max_body_size 2G` trong script).
- Root user `admin` dùng được cho dev, nhưng **nên tạo user riêng** cho từng app về sau để giới hạn quyền.  
  Khi bạn sẵn sàng, tôi có thể viết thêm 1 version guide dùng user/policy riêng. 

