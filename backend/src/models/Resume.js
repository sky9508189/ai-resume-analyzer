const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  extractedText: {
    type: String,
    default: "",
  },
  analysis: {
    overallScore: { type: Number, default: 0 },
    summary: { type: String, default: "" },
    sections: [
      {
        name: String,
        score: Number,
        feedback: String,
      },
    ],
    strengths: [String],
    weaknesses: [String],
    suggestions: [String],
    atsScore: { type: Number, default: 0 },
    keywordAnalysis: [
      {
        keyword: String,
        found: Boolean,
        category: String,
      },
    ],
    missingKeywords: [String],
    formattingScore: { type: Number, default: 0 },
  },
  status: {
    type: String,
    enum: ["pending", "analyzing", "completed", "failed"],
    default: "pending",
  },
},
{
  timestamps: true,
}
);

module.exports = mongoose.model("Resume", resumeSchema);
