const Resume = require("../models/Resume");
const { analyzeResume } = require("../services/aiService");
const path = require("path");
const fs = require("fs");

const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const resume = await Resume.create({
      user: req.user._id,
      originalName: req.file.originalname,
      fileName: req.file.filename,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
    });

    res.status(201).json(resume);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const analyzeResumeText = async (req, res) => {
  try {
    const { id } = req.params;

    const resume = await Resume.findOne({ _id: id, user: req.user._id });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    resume.status = "analyzing";
    await resume.save();

    let extractedText = resume.extractedText;

    if (!extractedText) {
      const filePath = path.join(__dirname, "../../uploads", resume.fileName);

      if (resume.fileType === "application/pdf") {
        const { PDFParse } = require("pdf-parse");
        const dataBuffer = fs.readFileSync(filePath);
        const pdf = new PDFParse({ data: dataBuffer });
        const pdfData = await pdf.getText();
        extractedText = pdfData.text;
      } else if (
        resume.fileType ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        resume.fileType === "application/msword"
      ) {
        const mammoth = require("mammoth");
        const dataBuffer = fs.readFileSync(filePath);
        const result = await mammoth.extractRawText({ buffer: dataBuffer });
        extractedText = result.value;
      } else {
        extractedText = fs.readFileSync(filePath, "utf-8");
      }

      resume.extractedText = extractedText;
      await resume.save();
    }

    const analysis = await analyzeResume(extractedText);

    resume.analysis = {
      overallScore: analysis.overallScore,
      summary: analysis.summary,
      sections: analysis.sections,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      suggestions: analysis.suggestions,
      atsScore: analysis.atsScore,
      keywordAnalysis: analysis.keywordAnalysis,
      missingKeywords: analysis.missingKeywords,
      formattingScore: analysis.formattingScore,
    };
    resume.status = "completed";
    await resume.save();

    res.json(resume);
  } catch (error) {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (resume) {
      resume.status = "failed";
      await resume.save();
    }
    res.status(500).json({ message: error.message });
  }
};

const getUserResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select("-extractedText");

    res.json(resumes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    res.json(resume);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    const filePath = path.join(__dirname, "../../uploads", resume.fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ message: "Resume deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadResume,
  analyzeResumeText,
  getUserResumes,
  getResumeById,
  deleteResume,
};
