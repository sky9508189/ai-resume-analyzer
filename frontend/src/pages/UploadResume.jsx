import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { resumeAPI } from "../api/axios";
import { Upload, FileText, X, Loader2, CheckCircle } from "lucide-react";

export default function UploadResume() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const inputRef = useRef();
  const navigate = useNavigate();

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) validateAndSet(droppedFile);
  };

  const validateAndSet = (f) => {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    if (!allowed.includes(f.type)) {
      setError("Only PDF, DOC, DOCX, and TXT files are supported");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError("File size must be under 5MB");
      return;
    }
    setError("");
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const { data } = await resumeAPI.upload(formData);
      setSuccess("File uploaded! Now analyzing...");

      setAnalyzing(true);
      const analyzed = await resumeAPI.analyze(data._id);
      setAnalyzing(false);

      navigate(`/resumes/${analyzed.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
      setUploading(false);
      setAnalyzing(false);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Upload Resume</h1>
        <p className="text-gray-500 mt-2">
          Upload your resume for AI-powered analysis
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
          <CheckCircle size={16} />
          {success}
        </div>
      )}

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition ${
          file
            ? "border-indigo-500 bg-indigo-50"
            : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          className="hidden"
          onChange={(e) => e.target.files[0] && validateAndSet(e.target.files[0])}
        />

        {file ? (
          <div className="flex flex-col items-center gap-2">
            <FileText size={48} className="text-indigo-600" />
            <p className="font-medium text-gray-900">{file.name}</p>
            <p className="text-sm text-gray-500">{formatSize(file.size)}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}
              className="flex items-center gap-1 text-red-500 hover:text-red-600 text-sm mt-2"
            >
              <X size={16} />
              Remove
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload size={48} className="text-gray-300" />
            <p className="text-gray-600 font-medium">
              Drag & drop or click to browse
            </p>
            <p className="text-sm text-gray-400">
              PDF, DOC, DOCX, TXT (max 5MB)
            </p>
          </div>
        )}
      </div>

      {file && (
        <button
          onClick={handleUpload}
          disabled={uploading || analyzing}
          className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
        >
          {analyzing ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Analyzing with AI...
            </>
          ) : uploading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload size={18} />
              Upload & Analyze
            </>
          )}
        </button>
      )}
    </div>
  );
}
