import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UploadCloud,
  FileText,
  Sparkles,
  Bot,
  Trash2,
  CheckCircle2,
  Clock,
  ArrowRight,
  Eye,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { ROUTES } from "@/constants/routes";

interface UploadedDocument {
  id: string;
  name: string;
  fileSize: string;
  uploadedAt: string;
  status: "Indexed" | "Processing" | "Ready";
  pageCount: number;
  extractedConcepts: number;
}

const INITIAL_UPLOADS: UploadedDocument[] = [];

function getUploadsKey(): string {
  try {
    const raw = localStorage.getItem("learngraph_v2_auth_state");
    if (raw) {
      const parsed = JSON.parse(raw);
      const user = parsed?.state?.user;
      if (user?.id) return `learngraph_uploads_${user.id}`;
      if (user?.email) return `learngraph_uploads_${user.email}`;
    }
  } catch { /* ignore */ }
  return "learngraph_uploads_guest";
}

function loadUploads(): UploadedDocument[] {
  try {
    const saved = localStorage.getItem(getUploadsKey());
    if (saved) return JSON.parse(saved) as UploadedDocument[];
  } catch { /* ignore */ }
  return [];
}

function persistUploads(docs: UploadedDocument[]): void {
  try {
    localStorage.setItem(getUploadsKey(), JSON.stringify(docs));
  } catch { /* ignore */ }
}

export function UploadsPage() {
  const navigate = useNavigate();
  const [uploads, setUploads] = useState<UploadedDocument[]>(() => loadUploads());
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setTimeout(() => {
        const newDoc: UploadedDocument = {
          id: `doc-${Date.now()}`,
          name: file.name,
          fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          uploadedAt: "Just now",
          status: "Ready",
          pageCount: 8,
          extractedConcepts: 12,
        };
        setUploads((prev) => {
          const updated = [newDoc, ...prev];
          persistUploads(updated);
          return updated;
        });
        setIsUploading(false);
      }, 1200);
    }
  };

  const handleDelete = (id: string) => {
    setUploads((prev) => {
      const updated = prev.filter((d) => d.id !== id);
      persistUploads(updated);
      return updated;
    });
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        eyebrow="INDEXED KNOWLEDGE & DOCUMENTS"
        title="Uploaded Study Materials"
        description="Manage your uploaded textbooks, syllabi, lecture slides, and research papers for retrieval-augmented tutoring."
        action={
          <Button onClick={() => navigate(ROUTES.PDF_ASSISTANT)}>
            <FileText size={16} /> Open PDF Assistant
          </Button>
        }
      />

      {/* Upload Dropzone */}
      <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-500 rounded-2xl bg-white dark:bg-slate-900 text-center space-y-3 transition-colors">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
          <UploadCloud size={24} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Upload new PDF or Lecture Slide Deck
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Supports PDF, DOCX, TXT up to 50MB. Automatically generates mind maps & flashcards.
          </p>
        </div>
        <label className="inline-block cursor-pointer">
          <span className="button primary text-xs">
            {isUploading ? "Indexing..." : "Select Document"}
          </span>
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isUploading}
          />
        </label>
      </div>

      {/* Uploads List */}
      <div className="space-y-3">
        {uploads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
            <span className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400">
              <FileText size={28} />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No documents uploaded yet</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                Upload a PDF, DOCX, or TXT file above to start retrieving notes and generating AI-powered quizzes from it.
              </p>
            </div>
          </div>
        ) : (
          uploads.map((doc) => (
          <div
            key={doc.id}
            className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
          >
            <div className="flex items-center gap-3">
              <span className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <FileText size={20} />
              </span>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {doc.name}
                </h4>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  <span>{doc.fileSize}</span>
                  <span>·</span>
                  <span>{doc.pageCount} pages</span>
                  <span>·</span>
                  <span>{doc.extractedConcepts} concepts extracted</span>
                  <span>·</span>
                  <span>{doc.uploadedAt}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <Tag tone="emerald">
                <CheckCircle2 size={12} className="mr-1" /> {doc.status}
              </Tag>
              <Button
                variant="secondary"
                onClick={() =>
                  navigate(
                    `${ROUTES.AI_TUTOR}?prompt=${encodeURIComponent(
                      `Summarize key concepts from ${doc.name} and generate a 5-question quiz.`
                    )}`
                  )
                }
                className="text-xs gap-1.5"
              >
                <Bot size={13} /> Chat with Document
              </Button>
              <button
                onClick={() => handleDelete(doc.id)}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Delete document"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))
        )}
      </div>
    </div>
  );
}

export default UploadsPage;
