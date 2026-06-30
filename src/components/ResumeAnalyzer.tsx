import React, { useState, useRef } from "react";
import { motion } from "motion/react";
import { 
  FileText, 
  Sparkles, 
  Briefcase, 
  CheckCircle2, 
  AlertTriangle, 
  Compass, 
  CheckSquare, 
  Square,
  HelpCircle,
  Upload,
  Check
} from "lucide-react";
import { ResumeAnalysisResult } from "../types";

interface ResumeAnalyzerProps {
  onSaveAnalysis: (result: ResumeAnalysisResult, extractedProfile?: any) => void;
  savedAnalyses: ResumeAnalysisResult[];
  initialResumeText: string;
  initialTargetRole: string;
  onUpdateProfileResume: (resumeText: string, targetRole: string) => void;
  demoMode: boolean;
}

const SAMPLE_RESUMES = {
  software_eng: {
    name: "Alex Mercer",
    role: "Senior Full Stack Engineer",
    skills: ["React", "JavaScript", "HTML", "CSS", "Git", "Node.js", "REST APIs", "TypeScript", "SQL"],
    experienceLevel: "Senior / Principal",
    text: `Alex Mercer\nsf_alex@example.com | San Francisco, CA | github.com/alexm\n\nEXPERIENCE\nSoftware Developer | AppCo | 2023 - Present\n- Built web apps using JavaScript and React.\n- Worked with database teams to query tables.\n- Fixed bugs and participated in standups.\n- Improved system loading speed by some percentage.\n\nJunior Developer | Startup Inc | 2021 - 2023\n- Wrote CSS and HTML for landing pages.\n- Collaborated with senior engineers on features.\n- Researched code problems.\n\nSKILLS\nReact, JavaScript, HTML, CSS, Git, Node.js, REST APIs`
  },
  pm: {
    name: "Sarah Jenkins",
    role: "Product Manager",
    skills: ["Product Roadmap", "Agile", "User Stories", "Jira", "Communication", "PowerPoint"],
    experienceLevel: "Mid-Level",
    text: `Sarah Jenkins\nsarah_pm@example.com | Austin, TX\n\nSUMMARY\nMotivated PM with a couple of years of experience managing simple web features. Good at talking to customers and drafting requirements.\n\nWORK EXPERIENCE\nAssociate PM | TechCorp | 2022 - Present\n- Led launch of a new messaging feature.\n- Gathered user feedback via surveys.\n- Created PowerPoint slides for management.\n- Tracked daily project updates in Jira.\n\nSKILLS\nProduct Roadmap, Agile, User Stories, Jira, Communication, PowerPoint`
  },
  data_analyst: {
    name: "Daniel Vance",
    role: "Data Analyst",
    skills: ["SQL", "Excel", "Tableau", "Python", "CSV", "PowerBI"],
    experienceLevel: "Junior / Entry",
    text: `Daniel Vance\ndaniel_data@example.com | Chicago, IL\n\nEXPERIENCE\nData Intern | AnalyticsOrg | 2023 - 2024\n- Pulled reports using basic SQL SELECT queries.\n- Updated Excel spreadsheets weekly.\n- Built simple bar charts using Tableau for business reviews.\n- Cleansed CSV files with Python scripts.\n\nSKILLS\nSQL, Excel, Tableau, Python, CSV, PowerBI`
  }
};

export default function ResumeAnalyzer({ 
  onSaveAnalysis, 
  savedAnalyses, 
  initialResumeText, 
  initialTargetRole,
  onUpdateProfileResume,
  demoMode
}: ResumeAnalyzerProps) {
  const [resumeText, setResumeText] = useState(initialResumeText || "");
  const [targetRole, setTargetRole] = useState(initialTargetRole || "Full Stack Engineer");
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [result, setResult] = useState<ResumeAnalysisResult | null>(
    savedAnalyses.length > 0 ? savedAnalyses[0] : null
  );
  const [checkedSuggestions, setCheckedSuggestions] = useState<{ [key: string]: boolean }>({});

  const processFile = (file: File) => {
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file only.");
      return;
    }
    setError(null);
    setUploadedFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      const b64 = (reader.result as string).split(",")[1];
      setPdfBase64(b64);
      // Auto trigger analysis upon upload
      setTimeout(() => {
        handleAnalyze(b64, file.name);
      }, 300);
    };
    reader.onerror = () => {
      setError("Failed to read the PDF file.");
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileBrowser = () => {
    fileInputRef.current?.click();
  };

  const handleAnalyze = async (passedBase64?: string, fileName?: string) => {
    const activeBase64 = passedBase64 || pdfBase64;
    const activeText = resumeText;

    if (!activeBase64 && !activeText.trim()) {
      setError("Please drop/select a resume PDF or select a demo template first.");
      return;
    }

    setLoading(true);
    setError(null);

    // If demoMode is enabled, simulate the high-quality analysis instantly!
    if (demoMode) {
      setTimeout(() => {
        // Build customized mock analysis based on file name or role
        const isPM = (fileName || "").toLowerCase().includes("pm") || targetRole.toLowerCase().includes("product");
        const isData = (fileName || "").toLowerCase().includes("data") || targetRole.toLowerCase().includes("analyst");
        
        let mockData = SAMPLE_RESUMES.software_eng;
        if (isPM) mockData = SAMPLE_RESUMES.pm;
        if (isData) mockData = SAMPLE_RESUMES.data_analyst;

        const mockResult: ResumeAnalysisResult = {
          id: "res-demo-" + Date.now(),
          timestamp: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          targetRole: targetRole || mockData.role,
          name: mockData.name,
          experienceLevel: mockData.experienceLevel,
          score: isPM ? 88 : isData ? 76 : 84,
          skills: mockData.skills,
          missingKeywords: isPM 
            ? ["Market Research", "SQL Data Analytics", "A/B Testing Experiments"]
            : isData
            ? ["Machine Learning models", "R statistical programming", "Data Pipelines"]
            : ["Next.js App Router", "CI/CD Deployment Pipelines", "Docker Containers"],
          structuralFeedback: [
            "Excellent chronological mapping under Work Experience.",
            "Formatting is highly parsable under applicant tracker rules v4.",
            "Consider adding quantitative KPI achievements to your latest positions."
          ],
          suggestions: [
            `Add core highlights emphasizing target role: "${targetRole || mockData.role}".`,
            "Integrate at least two of the missing keywords inside your Skills matrix.",
            "Place your structural credentials like Education at the very base."
          ],
          summary: `The candidate possesses a highly focused and well-structured professional record perfectly matching their desired ${targetRole || mockData.role} path.`
        };

        setResult(mockResult);
        onSaveAnalysis(mockResult, {
          fullName: mockResult.name,
          targetRole: mockResult.targetRole,
          experienceLevel: mockResult.experienceLevel,
          skills: mockResult.skills,
          resumeText: mockData.text
        });
        setLoading(false);
        setCheckedSuggestions({});
      }, 1500);
      return;
    }

    try {
      const response = await fetch("/api/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          resumeText: activeText || undefined, 
          pdfBase64: activeBase64 || undefined, 
          targetRole 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Server failed to analyze resume.");
      }

      const data = await response.json();
      const newAnalysis: ResumeAnalysisResult = {
        id: "res-" + Date.now(),
        timestamp: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        targetRole: targetRole || data.targetRole || "Software Developer",
        ...data
      };

      setResult(newAnalysis);
      onSaveAnalysis(newAnalysis, {
        fullName: newAnalysis.name,
        targetRole: newAnalysis.targetRole,
        experienceLevel: newAnalysis.experienceLevel,
        skills: newAnalysis.skills,
        resumeText: activeText || "Parsed PDF contents"
      });
      setCheckedSuggestions({});
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during analysis.");
    } finally {
      setLoading(false);
    }
  };

  const loadSample = (key: keyof typeof SAMPLE_RESUMES) => {
    const sample = SAMPLE_RESUMES[key];
    setResumeText(sample.text);
    setTargetRole(sample.role);
    setUploadedFileName(`demo_resume_${key}.pdf`);
    // Simulate a mock PDF base64 load
    setPdfBase64("MOCK_BASE64_FOR_DEMO");
    setError(null);
  };

  const toggleSuggestion = (index: number) => {
    setCheckedSuggestions(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400 stroke-emerald-400";
    if (score >= 60) return "text-amber-400 stroke-amber-400";
    return "text-rose-500 stroke-rose-500";
  };

  return (
    <div id="resume-analyzer-root" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Input panel - Left column */}
      <div className="lg:col-span-5 space-y-6">
        <div className="glass-panel p-6 rounded-3xl glow-purple">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-xl text-white flex items-center space-x-2">
              <FileText className="w-5 h-5 text-violet-400" />
              <span>Resume Input</span>
            </h2>
            <div className="flex space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
            </div>
          </div>

          <p className="text-xs text-purple-200/50 mb-4">
            Upload your resume as a PDF file. CareerPilot AI will parse, extract your credentials, and run instant ATS diagnostics.
          </p>

          {/* Quick templates */}
          <div className="mb-4">
            <span className="text-[10px] uppercase tracking-wider text-purple-200/40 block mb-2 font-medium">
              Load Demo Template:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                id="btn-sample-se"
                onClick={() => loadSample("software_eng")}
                className="text-xs px-3 py-1.5 rounded-xl bg-violet-950/40 border border-violet-500/20 text-violet-300 hover:border-violet-400 hover:text-white transition-all cursor-pointer"
              >
                Software Engineer
              </button>
              <button
                id="btn-sample-pm"
                onClick={() => loadSample("pm")}
                className="text-xs px-3 py-1.5 rounded-xl bg-violet-950/40 border border-violet-500/20 text-violet-300 hover:border-violet-400 hover:text-white transition-all cursor-pointer"
              >
                Product Manager
              </button>
              <button
                id="btn-sample-da"
                onClick={() => loadSample("data_analyst")}
                className="text-xs px-3 py-1.5 rounded-xl bg-violet-950/40 border border-violet-500/20 text-violet-300 hover:border-violet-400 hover:text-white transition-all cursor-pointer"
              >
                Data Analyst
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="input-target-role" className="block text-xs font-semibold text-purple-200/70 mb-2">Target Job Role</label>
              <input
                id="input-target-role"
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g., Senior Full Stack React Developer"
                className="w-full bg-violet-950/20 border border-violet-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-purple-200/30 focus:outline-none focus:border-violet-500 transition-all"
              />
            </div>

            {/* Drag & Drop Area */}
            <div
              id="resume-drop-zone"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={triggerFileBrowser}
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isDragging
                  ? "border-violet-400 bg-violet-950/40 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                  : uploadedFileName
                  ? "border-emerald-500/50 bg-emerald-950/10"
                  : "border-violet-500/20 bg-violet-950/10 hover:border-violet-500/40 hover:bg-violet-950/20"
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="application/pdf"
                className="hidden"
              />
              
              {uploadedFileName ? (
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-emerald-950/40 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                    <Check className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-semibold text-white truncate max-w-[220px]">
                    {uploadedFileName}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-mono bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/10 inline-block">
                    PDF Loaded & Ready
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-violet-950/40 border border-violet-500/20 rounded-full flex items-center justify-center mx-auto text-violet-400">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Drag & Drop Resume PDF here</span>
                    <span className="text-[11px] text-purple-200/40 block mt-1">or click to browse local files</span>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-950/30 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              id="btn-run-analysis"
              onClick={() => handleAnalyze()}
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-violet-950/50 hover:shadow-violet-600/20 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Computing ATS Insights...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze ATS Compatibility</span>
                </>
              )}
            </button>
          </div>
        </div>


        {/* History sidebar list */}
        {savedAnalyses.length > 0 && (
          <div className="glass-panel p-5 rounded-3xl">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-purple-200/40 mb-3">
              Previous Scan History ({savedAnalyses.length})
            </h3>
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2">
              {savedAnalyses.map((item) => (
                <button
                  key={item.id}
                  id={`btn-history-item-${item.id}`}
                  onClick={() => setResult(item)}
                  className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex items-center justify-between cursor-pointer ${
                    result?.id === item.id 
                      ? "bg-violet-950/40 border-violet-500/40 text-white" 
                      : "bg-transparent border-transparent text-purple-200/50 hover:bg-violet-950/20 hover:text-purple-200"
                  }`}
                >
                  <div className="truncate pr-2">
                    <div className="font-semibold truncate">{item.targetRole}</div>
                    <div className="text-[10px] text-purple-200/40">{item.timestamp}</div>
                  </div>
                  <div className={`font-mono font-bold px-2 py-0.5 rounded-md bg-violet-950/80 border border-violet-500/20 ${
                    item.score >= 80 ? "text-green-400" : item.score >= 60 ? "text-amber-400" : "text-rose-400"
                  }`}>
                    {item.score}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results panel - Right column */}
      <div className="lg:col-span-7">
        {result ? (
          <div id="analysis-results-container" className="space-y-6">
            {/* Header score card */}
            <div className="glass-panel p-6 rounded-3xl flex flex-col md:flex-row items-center gap-6 glow-purple relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />
              
              {/* Radial gauge */}
              <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="52"
                    strokeWidth="10"
                    stroke="rgba(139, 92, 246, 0.08)"
                    fill="transparent"
                  />
                  <motion.circle
                    cx="64"
                    cy="64"
                    r="52"
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 52}
                    initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - result.score / 100) }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    fill="transparent"
                    className={getScoreColor(result.score)}
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="font-display font-extrabold text-3xl text-white">{result.score}</span>
                  <span className="text-[10px] text-purple-200/40 uppercase tracking-widest">ATS Score</span>
                </div>
              </div>

              {/* Assessment summary */}
              <div className="flex-grow space-y-2 text-center md:text-left">
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-violet-950/80 border border-violet-500/20 text-[10px] text-violet-300 font-medium">
                  <Compass className="w-3.5 h-3.5" />
                  <span>{result.targetRole} Assessment</span>
                </div>
                <h3 className="font-display font-bold text-xl text-white">AI Diagnostics Report</h3>
                <p className="text-sm text-purple-200/70 leading-relaxed">
                  {result.summary}
                </p>
              </div>
            </div>

            {/* Grid of identified skills and gaps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Skills matched */}
              <div className="glass-panel p-6 rounded-3xl">
                <h3 className="font-display font-bold text-base text-white mb-3 flex items-center space-x-2">
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
                  <span>Identified Strengths</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.skills && result.skills.length > 0 ? (
                    result.skills.map((skill, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-emerald-300">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-purple-200/30 italic">No explicit key skills detected.</span>
                  )}
                </div>
              </div>

              {/* Missing keywords */}
              <div className="glass-panel p-6 rounded-3xl">
                <h3 className="font-display font-bold text-base text-white mb-3 flex items-center space-x-2">
                  <AlertTriangle className="w-4.5 h-4.5 text-amber-400" />
                  <span>Missing High-Impact Keywords</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.missingKeywords && result.missingKeywords.length > 0 ? (
                    result.missingKeywords.map((keyword, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-amber-950/20 border border-amber-500/20 text-amber-300">
                        {keyword}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-purple-200/30 italic">No major keyword omissions found! Good job.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Structural format critique */}
            <div className="glass-panel p-6 rounded-3xl">
              <h3 className="font-display font-bold text-base text-white mb-4 flex items-center space-x-2">
                <Compass className="w-4.5 h-4.5 text-violet-400" />
                <span>Layout & Structure Audit</span>
              </h3>
              <ul className="space-y-3">
                {result.structuralFeedback && result.structuralFeedback.map((feedback, i) => (
                  <li key={i} className="text-sm text-purple-200/70 flex items-start space-x-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0 mt-2" />
                    <span>{feedback}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actionable suggestions checklist */}
            <div className="glass-panel p-6 rounded-3xl border-violet-500/25">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-display font-bold text-base text-white flex items-center space-x-2">
                  <CheckSquare className="w-4.5 h-4.5 text-violet-400" />
                  <span>AI Rewrite & Optimizations Checklist</span>
                </h3>
                <span className="text-xs text-purple-200/40">
                  {Object.values(checkedSuggestions).filter(Boolean).length} / {result.suggestions?.length || 0} Done
                </span>
              </div>
              
              <div className="space-y-3">
                {result.suggestions && result.suggestions.map((suggestion, idx) => {
                  const isChecked = !!checkedSuggestions[idx];
                  return (
                    <div 
                      key={idx}
                      id={`suggestion-row-${idx}`}
                      onClick={() => toggleSuggestion(idx)}
                      className={`p-3 rounded-xl border transition-all flex items-start space-x-3 cursor-pointer ${
                        isChecked 
                          ? "bg-violet-950/10 border-violet-500/10 text-purple-200/40" 
                          : "bg-violet-950/20 border-violet-500/10 text-purple-200/80 hover:bg-violet-950/30 hover:border-violet-500/20"
                      }`}
                    >
                      <button className="shrink-0 mt-0.5 text-violet-400">
                        {isChecked ? (
                          <CheckCircle2 className="w-4.5 h-4.5 text-violet-400" />
                        ) : (
                          <span className="w-4.5 h-4.5 block rounded border border-purple-200/30 hover:border-violet-400" />
                        )}
                      </button>
                      <span className={`text-sm select-none leading-relaxed ${isChecked ? "line-through" : ""}`}>
                        {suggestion}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-12 glass-panel rounded-3xl min-h-[450px]">
            <div className="w-16 h-16 bg-violet-950/40 border border-violet-500/20 rounded-2xl flex items-center justify-center mb-6">
              <FileText className="w-8 h-8 text-violet-400/50" />
            </div>
            <h3 className="font-display font-bold text-lg text-white mb-2">No Analysis Loaded</h3>
            <p className="text-sm text-purple-200/40 max-w-sm mb-6 leading-relaxed">
              Input your target job role and paste your resume on the left, then trigger the ATS compiler to run full AI diagnostics.
            </p>
            <div className="flex items-center space-x-2 text-xs text-purple-200/30">
              <HelpCircle className="w-4 h-4" />
              <span>Demands absolute compliance with modern parsing standard v4</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
