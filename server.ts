import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Uploads directory configuration
  const uploadsDir = path.resolve(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Serve uploaded files statically with correct download headers
  app.use("/uploads", express.static(uploadsDir, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".apk")) {
        res.setHeader("Content-Type", "application/vnd.android.package-archive");
      }
    }
  }));

  // Multer storage
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      const safeBase = path.basename(file.originalname, ext)
        .replace(/[^a-zA-Z0-9_\u0980-\u09FF-]/g, "_")
        .substring(0, 40);
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e4);
      cb(null, `${safeBase}-${uniqueSuffix}${ext}`);
    },
  });

  const upload = multer({
    storage,
    limits: {
      fileSize: 250 * 1024 * 1024, // 250MB limit
    },
  });

  // API Route: Upload App File / Icon / APK
  app.post("/api/upload-file", upload.single("file"), (req: any, res: any) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: "কোনো ফাইল প্রদান করা হয়নি।" });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      const sizeBytes = req.file.size;
      const sizeFormatted = sizeBytes > 1024 * 1024 
        ? `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB` 
        : `${(sizeBytes / 1024).toFixed(0)} KB`;

      res.json({
        success: true,
        fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        sizeFormatted,
        sizeBytes,
      });
    } catch (err: any) {
      console.error("Upload error:", err);
      res.status(500).json({ success: false, error: err.message || "ফাইল আপলোড ব্যর্থ হয়েছে।" });
    }
  });

  // Vite development middleware vs Static Production bundle
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
