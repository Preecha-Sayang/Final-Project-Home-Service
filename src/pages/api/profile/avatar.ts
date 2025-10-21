import type { NextApiRequest, NextApiResponse } from "next";
import { v2 as cloudinary } from "cloudinary";
import formidable from "formidable";
import fs from "fs";
import os from "os";
import { withAuth, AuthenticatedNextApiRequest } from "@/middlewere/auth";

// ปิด bodyParser ของ Next.js เพื่อให้ formidable จัดการไฟล์ได้
export const config = {
  api: {
    bodyParser: false,
  },
};

// ตั้งค่า Cloudinary สำหรับอัพโหลดรูปภาพ
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ฟังก์ชันแปลงข้อมูลฟอร์มเป็นไฟล์
async function parseForm(req: NextApiRequest): Promise<{ file?: formidable.File }> {
  const form = formidable({
    multiples: false,
    maxFileSize: 2 * 1024 * 1024, // 2MB
    uploadDir: os.tmpdir(),
    keepExtensions: true,
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, _fields, files) => {
      if (err) return reject(err);
      const raw = (files as { file?: formidable.File | formidable.File[] }).file;
      const file = Array.isArray(raw) ? (raw[0] as formidable.File) : (raw as formidable.File | undefined);
      resolve({ file });
    });
  });
}

// POST /api/profile/avatar
// อัพโหลดรูปอวาตาร์ไปยัง Cloudinary และคืนค่า URL
async function handler(req: AuthenticatedNextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    // แปลงข้อมูลฟอร์มและดึงไฟล์
    const { file } = await parseForm(req);
    if (!file) return res.status(400).json({ error: "Missing file" });

    const filepath = (file as formidable.File).filepath;
    if (!filepath) {
      return res.status(400).json({ error: "Uploaded file has no path. Please try again." });
    }

    // ตรวจสอบประเภทไฟล์ MIME (ไม่บังคับ)
    // if (!["image/jpeg", "image/png"].includes(file.mimetype || "")) {
    //   return res.status(400).json({ error: "Invalid file type" });
    // }

    // อัพโหลดไฟล์ไปยัง Cloudinary
    const uploadResult: { secure_url: string } = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "profiles", resource_type: "image", overwrite: true },
        (err, result) => {
          if (err || !result) return reject(err || new Error("Upload failed"));
          resolve(result as { secure_url: string });
        }
      );

      fs.createReadStream(filepath).pipe(stream);
    });

    // คืนค่า URL ของรูปที่อัพโหลด
    return res.status(200).json({ url: uploadResult.secure_url });
  } catch (err) {
    console.error("/api/profile/avatar error", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export default withAuth(handler);
