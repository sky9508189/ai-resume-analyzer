import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { resumeAPI } from "../api/axios";
import {
  ArrowLeft,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Award,
  Target,
  BarChart3,
  FileText,
  Lightbulb,
} from "lucide-react";

const sectionColors = {
  "Contact Information": "bg-blue-50 text-blue-700",
  "Professional Summary": "bg-purple-50 text-purple-700",
  "Work Experience": "bg-green-50 text-green-700",
  Education: "bg-yellow-50 text-yellow-700",
  Skills: "bg-pink-50 text-pink-700",
};

export default function ResumeDetail() {
  const { id } = useParams();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const { data } = await resumeAPI.getById(id);
        setResume(data);
      } catch (err) {
        console.error("Failed to fetch resume", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResume();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Resume not found</p>
        <Link to="/dashboard" className="text-indigo-600 mt-4 inline-block">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const { analysis } = resume;

  if (resume.status === "pending" || resume.status === "analyzing") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Analyzing your resume...</p>
          <p className="text-sm text-gray-400">This may take a moment</p>
        </div>
      </div>
    );
  }

  if (resume.status === "failed") {
    return (
      <div className="text-center py-20">
        <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Analysis Failed</h2>
        <p className="text-gray-500 mb-6">Something went wrong. Please try again.</p>
        <Link
          to="/upload"
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition"
        >
          Upload Again
        </Link>
      </div>
    );
  }

  const ScoreBadge = ({ label, score, icon: Icon, color }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        {Icon && <Icon size={20} className={color} />}
      </div>
      <div className="flex items-end gap-2">
        <span className={`text-3xl font-bold ${score >= 70 ? "text-green-600" : score >= 50 ? "text-yellow-600" : "text-red-600"}`}>
          {score}
        </span>
        <span className="text-gray-400 mb-1">/100</span>
      </div>
      <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${score >= 70 ? "bg-green-500" : score >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link
        to="/dashboard"
        className="flex items-center gap-1 text-gray-500 hover:text-indigo-600 transition mb-6"
      >
        <ArrowLeft size={18} />
        Back to Dashboard
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <FileText size={28} className="text-indigo-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{resume.originalName}</h1>
          <p className="text-sm text-gray-400">
            Analyzed on {new Date(resume.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <ScoreBadge
          label="Overall Score"
          score={analysis.overallScore}
          icon={Award}
          color="text-indigo-500"
        />
        <ScoreBadge
          label="ATS Score"
          score={analysis.atsScore}
          icon={Target}
          color="text-green-500"
        />
        <ScoreBadge
          label="Formatting"
          score={analysis.formattingScore}
          icon={BarChart3}
          color="text-purple-500"
        />
        <ScoreBadge
          label="Keywords"
          score={Math.round(
            (analysis.keywordAnalysis?.filter((k) => k.found).length /
              Math.max(analysis.keywordAnalysis?.length, 1)) *
              100
          )}
          icon={Target}
          color="text-blue-500"
        />
      </div>

      {analysis.summary && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Summary</h2>
          <p className="text-gray-600 leading-relaxed">{analysis.summary}</p>
        </div>
      )}

      {analysis.sections?.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Section Analysis</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {analysis.sections.map((section) => (
              <div
                key={section.name}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      sectionColors[section.name] || "bg-gray-50 text-gray-700"
                    }`}
                  >
                    {section.name}
                  </span>
                  <span
                    className={`font-bold text-lg ${
                      section.score >= 70 ? "text-green-600" : section.score >= 50 ? "text-yellow-600" : "text-red-600"
                    }`}
                  >
                    {section.score}/100
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
                  <div
                    className={`h-1.5 rounded-full ${
                      section.score >= 70 ? "bg-green-500" : section.score >= 50 ? "bg-yellow-500" : "bg-red-500"
                    }`}
                    style={{ width: `${section.score}%` }}
                  />
                </div>
                {section.feedback && (
                  <p className="text-sm text-gray-500">{section.feedback}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {analysis.strengths?.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-green-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle size={20} className="text-green-500" />
              <h2 className="text-lg font-semibold text-gray-900">Strengths</h2>
            </div>
            <ul className="space-y-2">
              {analysis.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-green-500 mt-0.5">•</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {analysis.weaknesses?.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <XCircle size={20} className="text-red-500" />
              <h2 className="text-lg font-semibold text-gray-900">Weaknesses</h2>
            </div>
            <ul className="space-y-2">
              {analysis.weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-red-500 mt-0.5">•</span>
                  {w}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {analysis.suggestions?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-indigo-200 p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={20} className="text-indigo-500" />
            <h2 className="text-lg font-semibold text-gray-900">Suggestions</h2>
          </div>
          <ul className="space-y-2">
            {analysis.suggestions.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-indigo-500 font-medium mt-0.5">{i + 1}.</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {analysis.keywordAnalysis?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Target size={20} className="text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900">Keyword Analysis</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {analysis.keywordAnalysis.map((kw, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                  kw.found
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {kw.found ? (
                  <CheckCircle size={14} />
                ) : (
                  <XCircle size={14} />
                )}
                <span>{kw.keyword}</span>
                {kw.category && (
                  <span className="text-xs opacity-60 ml-auto">({kw.category})</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {analysis.missingKeywords?.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={18} className="text-amber-600" />
            <h2 className="font-semibold text-amber-800">Missing Keywords</h2>
          </div>
          <p className="text-sm text-amber-700 mb-2">
            Consider adding these keywords to improve ATS score:
          </p>
          <div className="flex flex-wrap gap-2">
            {analysis.missingKeywords.map((kw, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-white rounded-full text-sm text-amber-700 border border-amber-300"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
