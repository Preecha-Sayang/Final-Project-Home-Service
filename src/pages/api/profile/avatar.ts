import type { NextApiRequest, NextApiResponse } from "next";
import { v2 as cloudinary } from "cloudinary";
import formidable from "formidable";
import fs from "fs";
import os from "os";
import { withAuth, AuthenticatedNextApiRequest } from "@/middlewere/auth";

export const config = {
  api: {
    bodyParser: false,
  },
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function parseForm(req: NextApiRequest): Promise<{ file?: formidable.File }> {
  const form = formidable({
    multiples: false,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    uploadDir: os.tmpdir(),
    keepExtensions: true,
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, _fields, files) => {
      if (err) return reject(err);
      const raw = (files as any).file;
      const file = Array.isArray(raw) ? (raw[0] as formidable.File) : (raw as formidable.File | undefined);
      resolve({ file });
    });
  });
}

async function handler(req: AuthenticatedNextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const { file } = await parseForm(req);
    if (!file) return res.status(400).json({ error: "Missing file" });

    const filepath = (file as any).filepath as string | undefined;
    if (!filepath) {
      return res.status(400).json({ error: "Uploaded file has no path. Please try again." });
    }

    // Optional MIME type check
    // if (!["image/jpeg", "image/png"].includes(file.mimetype || "")) {
    //   return res.status(400).json({ error: "Invalid file type" });
    // }

    const uploadResult: { secure_url: string } = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "profiles", resource_type: "image", overwrite: true },
        (err, result) => {
          if (err || !result) return reject(err || new Error("Upload failed"));
          resolve(result as any);
        }
      );

      fs.createReadStream(filepath).pipe(stream);
    });

    return res.status(200).json({ url: uploadResult.secure_url });
  } catch (err) {
    console.error("/api/profile/avatar error", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export default withAuth(handler);
