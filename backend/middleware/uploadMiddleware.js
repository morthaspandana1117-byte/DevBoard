const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");

const uploadDir = path.join(__dirname, "..", "uploads");

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${extension}`;
    cb(null, uniqueName);
  },
});

const allowedExtensions = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".pdf",
  ".doc",
  ".docx",
  ".txt",
  ".zip",
]);

const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.has(extension)) {
    cb(null, true);
    return;
  }

  cb(
    new Error(
      "Unsupported file type. Allowed types: jpg, jpeg, png, gif, pdf, doc, docx, txt, zip",
    ),
  );
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter,
});

const uploadAttachments = (req, res, next) => {
  upload.array("attachment", 10)(req, res, (error) => {
    if (error) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          message: "File size cannot exceed 10 MB",
        });
      }

      return res.status(400).json({
        message: error.message || "File upload failed",
      });
    }

    next();
  });
};

module.exports = {
  uploadAttachments,
  uploadDir,
};
