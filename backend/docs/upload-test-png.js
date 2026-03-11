const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");

const endpoint = process.env.MINIO_ENDPOINT || "https://minio.lynxsolution.vn";
const region = process.env.MINIO_REGION || "us-east-1";
const bucket = process.env.MINIO_BUCKET;

if (!bucket) {
  console.error("Missing env MINIO_BUCKET");
  process.exit(1);
}

const accessKeyId = process.env.MINIO_ACCESS_KEY || "admin";
const secretAccessKey = process.env.MINIO_SECRET_KEY;

if (!secretAccessKey) {
  console.error("Missing env MINIO_SECRET_KEY");
  process.exit(1);
}

const client = new S3Client({
  region,
  endpoint,
  forcePathStyle: true,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

async function main() {
  const filePath = path.resolve(__dirname, "test2.jpg");
  const body = fs.createReadStream(filePath);

  const key = process.env.MINIO_OBJECT_KEY || `uploads/test-${Date.now()}.PNG`;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: "image/png",
  });

  await client.send(command);

  const url = `${endpoint.replace(/\/$/, "")}/${bucket}/${encodeURIComponent(key)}`;
  console.log("Uploaded:");
  console.log(JSON.stringify({ bucket, key, url }, null, 2));
}

main().catch((err) => {
  console.error("Upload failed:", err);
  process.exit(1);
});
