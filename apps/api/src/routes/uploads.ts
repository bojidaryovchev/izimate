import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;
const R2_BUCKET = process.env.R2_BUCKET ?? "izimate-uploads";
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL ?? `https://pub-${R2_ACCOUNT_ID}.r2.dev`;

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

const PresignBody = z.object({
  filename: z.string().min(1),
  contentType: z.string().refine((t) => ALLOWED_TYPES.includes(t), {
    message: `Content type must be one of: ${ALLOWED_TYPES.join(", ")}`,
  }),
  contentLength: z.number().int().positive().max(MAX_SIZE),
});

const PresignResponse = z.object({
  uploadUrl: z.string().url(),
  publicUrl: z.string().url(),
  key: z.string(),
});

export const uploadsRoutes: FastifyPluginAsync = async (app) => {
  // POST /api/uploads/presign — get a presigned PUT URL for direct upload to R2
  app.post("/presign", {
    schema: {
      body: PresignBody,
      response: { 200: PresignResponse },
    },
    handler: async (req) => {
      const { filename, contentType, contentLength } = req.body as z.infer<typeof PresignBody>;
      const userId = req.userId;

      // Generate unique key: users/<userId>/<timestamp>-<filename>
      const ext = filename.split(".").pop() ?? "bin";
      const key = `users/${userId}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

      const command = new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        ContentType: contentType,
        ContentLength: contentLength,
      });

      const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 900 }); // 15 min

      return {
        uploadUrl,
        publicUrl: `${R2_PUBLIC_URL}/${key}`,
        key,
      };
    },
  });
};
