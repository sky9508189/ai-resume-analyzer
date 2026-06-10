import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { resumeAPI } from "../api/axios";
import {
  FileText,
  Upload,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
} from "lucide-react";

const statusIcons = {
  completed: <CheckCircle size={16} className="text-green-500" />,
  analyzing: <Loader2 size={16} className="text-blue-500 animate-spin" />,
  pending: <Clock size={16} className="text-yellow-500" />,
  failed: <AlertCircle size={16} className="text-red-500" />,
};

export default function Dashboard() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchResumes = async () => {
    try {
      const { data } = await resumeAPI.getAll();
      setResumes(data);
    } catch (err) {
      console.error("Failed to fetch resumes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this resume?")) return;
    try {
      await resumeAPI.delete(id);
      setResumes((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Resumes</h1>
          <p className="text-gray-500 mt-1">
            {resumes.length} resume{resumes.length !== 1 && "s"} analyzed
          </p>
        </div>
        <Link
          to="/upload"
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition flex items-center gap-2"
        >
          <Upload size={18} />
          Upload New
        </Link>
      </div>

      {resumes.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <FileText size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">No resumes yet</h2>
          <p className="text-gray-400 mb-6">Upload your first resume to get started</p>
          <Link
            to="/upload"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition inline-flex items-center gap-2"
          >
            <Upload size={18} />
            Upload Resume
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume) => (
            <div
              key={resume._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileText size={24} className="text-indigo-600" />
                  <div>
                    <p className="font-medium text-gray-900 truncate max-w-[180px]">
                      {resume.originalName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(resume.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {statusIcons[resume.status]}
                  <button
                    onClick={() => handleDelete(resume._id)}
                    className="text-gray-400 hover:text-red-500 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {resume.status === "completed" && resume.analysis?.overallScore ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <BarChart3 size={16} className="text-indigo-500" />
                    <span className="text-sm font-medium">
                      Overall: {resume.analysis.overallScore}/100
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart3 size={16} className="text-green-500" />
                    <span className="text-sm font-medium">
                      ATS: {resume.analysis.atsScore}/100
                    </span>
                  </div>
                  <Link
                    to={`/resumes/${resume._id}`}
                    className="text-indigo-600 text-sm font-medium hover:text-indigo-700 inline-block mt-2"
                  >
                    View Details →
                  </Link>
                </div>
              ) : resume.status === "failed" ? (
                <p className="text-sm text-red-500">Analysis failed</p>
              ) : (
                <p className="text-sm text-gray-400">Waiting for analysis...</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
