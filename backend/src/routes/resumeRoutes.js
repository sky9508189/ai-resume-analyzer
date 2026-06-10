const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  uploadResume,
  analyzeResumeText,
  getUserResumes,
  getResumeById,
  deleteResume,
} = require("../controllers/resumeController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, DOC, DOCX, and TXT files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.use(protect);

router.post("/upload", upload.single("resume"), uploadResume);
router.post("/:id/analyze", analyzeResumeText);
router.get("/", getUserResumes);
router.get("/:id", getResumeById);
router.delete("/:id", deleteResume);

module.exports = router;
