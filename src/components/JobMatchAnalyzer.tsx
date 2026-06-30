import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Briefcase, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Compass, 
  Map, 
  AlertCircle 
} from "lucide-react";
import { JobMatchResult } from "../types";

interface JobMatchAnalyzerProps {
  initialResumeText: string;
  onSaveJobMatch: (result: JobMatchResult) => void;
  savedJobMatches: JobMatchResult[];
  demoMode: boolean;
}

export default function JobMatchAnalyzer({
  initialResumeText,
  onSaveJobMatch,
  savedJobMatches,
  demoMode
}: JobMatchAnalyzerProps) {
  const [resumeText, setResumeText] = useState(initialResumeText || "");
  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<JobMatchResult | null>(
    savedJobMatches.length > 0 ? savedJobMatches[0] : null
  );

  const handleAnalyze = async () => {
    // If resumeText is empty but initialResumeText is populated, auto sync it
    const activeResumeText = resumeText.trim() || initialResumeText.trim();
    if (!activeResumeText) {
      setError("Please paste your resume text first (or run the Resume Analyzer first to pre-fill).");
      return;
    }
    if (!jobDescription.trim()) {
      setError("Please paste the job description you want to match against.");
      return;
    }
    if (!jobTitle.trim()) {
      setError("Please enter a job title (e.g., Software Engineer Intern).");
      return;
    }

    setLoading(true);
    setError(null);

    if (demoMode) {
      setTimeout(() => {
        const simulatedMatch: JobMatchResult = {
          id: "match-demo-" + Date.now(),
          timestamp: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          jobTitle: jobTitle || "Frontend Engineer Intern",
          matchRate: 85,
          skillsAlignment: "You match 8 out of 10 key tech stack items requested. Strong alignment on React, Tailwind, and Git.",
          experienceMatch: "The role requests 1-2 years of experience; your resume showcases 1 year of active startup contributions, which fits the intermediate requirement perfectly.",
          toneSuitability: "Your resume tone is active and developer-focused. It aligns well with the innovative startup culture.",
          keyGaps: ["Unit Testing", "Next.js SSR", "State management (Zustand/Redux)"],
          recommendations: [
            "Inject keyword 'Zustand' or 'Redux' in your skills catalog.",
            "Add a brief description of a hobby project built using server components."
          ]
        };
        setResult(simulatedMatch);
        onSaveJobMatch(simulatedMatch);
        setLoading(false);
      }, 1500);
      return;
    }

    try {
      const response = await fetch("/api/match-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: activeResumeText, jobDescription }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to analyze job matching.");
      }

      const data = await response.json();
      const newMatch: JobMatchResult = {
        id: "match-" + Date.now(),
        timestamp: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        jobTitle,
        ...data
      };

      setResult(newMatch);
      onSaveJobMatch(newMatch);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during matching.");
    } finally {
      setLoading(false);
    }
  };

  const loadSampleJob = () => {
    setJobTitle("Frontend Engineer Intern");
    setJobDescription(`Position Summary:\nWe are looking for a Frontend Engineer Intern to join our web application team. You will build user-facing components using React, Tailwind CSS, and TypeScript. Collaborating with product designers and backend engineers, you'll deliver high-performance user interfaces.\n\nKey Qualifications:\n- Strong knowledge of modern JavaScript/TypeScript and React\n- Familiarity with Tailwind CSS or CSS-in-JS frameworks\n- Basic understanding of state management (Redux, Context API)\n- Experience with git workflows and version control\n- Excellent written and verbal communication skills\n- Bonus: Experience with Next.js or Vite build tools.`);
  };

  const getMatchColor = (rate: number) => {
    if (rate >= 80) return "text-emerald-400 border-emerald-500/20 bg-emerald-950/20";
    if (rate >= 60) return "text-amber-400 border-amber-500/20 bg-amber-950/20";
    return "text-rose-400 border-rose-500/20 bg-rose-950/20";
  };

  return (
    <div id="job-match-root" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Input panel - left */}
      <div className="lg:col-span-5 space-y-6">
        <div className="glass-panel p-6 rounded-3xl glow-purple">
          <h2 className="font-display font-bold text-xl text-white flex items-center space-x-2 mb-4">
            <Briefcase className="w-5 h-5 text-violet-400" />
            <span>Job Comparison Panel</span>
          </h2>

          <p className="text-xs text-purple-200/50 mb-4">
            Compare your resume text against a target job listing to find skill alignments, keyword deficits, and receive a tailor-made roadmap.
          </p>

          <div className="mb-4">
            <button
              id="btn-load-sample-job"
              onClick={loadSampleJob}
              className="text-xs px-3 py-1.5 rounded-xl bg-violet-950/40 border border-violet-500/20 text-violet-300 hover:border-violet-400 hover:text-white transition-all cursor-pointer"
            >
              Load Demo Frontend Intern Job Listing
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="input-job-title" className="block text-xs font-semibold text-purple-200/70 mb-2">Job Title</label>
              <input
                id="input-job-title"
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g., Associate Product Manager"
                className="w-full bg-violet-950/20 border border-violet-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-purple-200/30 focus:outline-none focus:border-violet-500 transition-all"
              />
            </div>

            <div>
              <label htmlFor="textarea-compare-resume" className="block text-xs font-semibold text-purple-200/70 mb-2">Your Resume Content</label>
              <textarea
                id="textarea-compare-resume"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your current resume here..."
                rows={6}
                className="w-full bg-violet-950/20 border border-violet-500/20 rounded-xl px-4 py-3 text-xs text-white placeholder-purple-200/30 focus:outline-none focus:border-violet-500 transition-all font-mono resize-none"
              />
              <p className="text-[10px] text-purple-200/40 mt-1">
                Tip: You can use the same text analyzed in the Resume tab.
              </p>
            </div>

            <div>
              <label htmlFor="textarea-job-description" className="block text-xs font-semibold text-purple-200/70 mb-2">Job Description</label>
              <textarea
                id="textarea-job-description"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description or requirement bullet points here..."
                rows={8}
                className="w-full bg-violet-950/20 border border-violet-500/20 rounded-xl px-4 py-3 text-xs text-white placeholder-purple-200/30 focus:outline-none focus:border-violet-500 transition-all font-mono resize-none"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-950/30 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              id="btn-run-match-analysis"
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-violet-950/50 hover:shadow-violet-600/20 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Gauging Alignment Match...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Verify Job Fitment</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* History sidebar list */}
        {savedJobMatches.length > 0 && (
          <div className="glass-panel p-5 rounded-3xl">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-purple-200/40 mb-3">
              Matched Listings History ({savedJobMatches.length})
            </h3>
            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-2">
              {savedJobMatches.map((item) => (
                <button
                  key={item.id}
                  id={`btn-match-history-${item.id}`}
                  onClick={() => setResult(item)}
                  className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex items-center justify-between cursor-pointer ${
                    result?.id === item.id 
                      ? "bg-violet-950/40 border-violet-500/40 text-white" 
                      : "bg-transparent border-transparent text-purple-200/50 hover:bg-violet-950/20 hover:text-purple-200"
                  }`}
                >
                  <div className="truncate pr-2">
                    <div className="font-semibold truncate">{item.jobTitle}</div>
                    <div className="text-[10px] text-purple-200/40">{item.timestamp}</div>
                  </div>
                  <div className={`font-mono font-bold px-2 py-0.5 rounded-md bg-violet-950/80 border border-violet-500/20 ${
                    item.matchRate >= 80 ? "text-green-400" : item.matchRate >= 60 ? "text-amber-400" : "text-rose-400"
                  }`}>
                    {item.matchRate}%
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results panel - Right Column */}
      <div className="lg:col-span-7">
        {result ? (
          <div id="match-results-container" className="space-y-6">
            {/* Header score card */}
            <div className={`glass-panel p-6 rounded-3xl border ${getMatchColor(result.matchRate)} flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-white/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r="46"
                    strokeWidth="8"
                    stroke="rgba(255, 255, 255, 0.05)"
                    fill="transparent"
                  />
                  <motion.circle
                    cx="56"
                    cy="56"
                    r="46"
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 46}
                    initial={{ strokeDashoffset: 2 * Math.PI * 46 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 46 * (1 - result.matchRate / 100) }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    fill="transparent"
                    className="stroke-violet-400"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="font-display font-extrabold text-2xl text-white">{result.matchRate}%</span>
                  <span className="text-[9px] text-purple-200/60 uppercase tracking-wider">Fit Score</span>
                </div>
              </div>

              <div className="flex-grow space-y-2 text-center sm:text-left">
                <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-violet-950/80 border border-violet-500/20 text-[10px] text-violet-300 font-medium">
                  <Compass className="w-3 h-3" />
                  <span>Job Compatibility Analysis</span>
                </div>
                <h3 className="font-display font-bold text-xl text-white">{result.jobTitle}</h3>
                <p className="text-xs text-purple-200/60 font-mono">
                  Analyzed on {result.timestamp}
                </p>
              </div>
            </div>

            {/* Analysis segments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Skills Alignment */}
              <div className="glass-panel p-6 rounded-3xl">
                <h4 className="font-display font-bold text-sm text-white mb-3 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Skills Alignment Overview</span>
                </h4>
                <p className="text-xs text-purple-200/70 leading-relaxed bg-violet-950/20 p-3 rounded-xl border border-violet-500/10">
                  {result.skillsAlignment}
                </p>
              </div>

              {/* Experience Suitability */}
              <div className="glass-panel p-6 rounded-3xl">
                <h4 className="font-display font-bold text-sm text-white mb-3 flex items-center space-x-2">
                  <Compass className="w-4 h-4 text-violet-400" />
                  <span>Experience Suitability</span>
                </h4>
                <p className="text-xs text-purple-200/70 leading-relaxed bg-violet-950/20 p-3 rounded-xl border border-violet-500/10">
                  {result.experienceMatch}
                </p>
              </div>

            </div>

            {/* Resume tone and phrasing */}
            <div className="glass-panel p-6 rounded-3xl">
              <h4 className="font-display font-bold text-sm text-white mb-2 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-violet-400" />
                <span>Resume Phrasing & Style Tone Audit</span>
              </h4>
              <p className="text-xs text-purple-200/70 leading-relaxed">
                {result.toneSuitability}
              </p>
            </div>

            {/* Critical Deficits */}
            <div className="glass-panel p-6 rounded-3xl">
              <h4 className="font-display font-bold text-sm text-white mb-3 flex items-center space-x-2">
                <XCircle className="w-4.5 h-4.5 text-rose-400" />
                <span>Critical Job Gaps (Missing Requirements)</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.keyGaps && result.keyGaps.length > 0 ? (
                  result.keyGaps.map((gap, idx) => (
                    <div key={idx} className="p-3 bg-rose-950/20 border border-rose-500/20 rounded-xl text-xs text-rose-300 flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-1.5" />
                      <span>{gap}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-purple-200/40 italic col-span-2">No critical structural deficits detected! Your profile is extremely solid.</p>
                )}
              </div>
            </div>

            {/* Custom optimization recommendation checklist */}
            <div className="glass-panel p-6 rounded-3xl border-violet-500/25">
              <h4 className="font-display font-bold text-sm text-white mb-4 flex items-center space-x-2">
                <Map className="w-4.5 h-4.5 text-violet-400" />
                <span>Actionable Tailoring Strategy Roadmap</span>
              </h4>
              <div className="space-y-3">
                {result.recommendations && result.recommendations.map((rec, idx) => (
                  <div key={idx} className="p-3.5 bg-violet-950/30 border border-violet-500/10 rounded-2xl flex items-start space-x-3 text-xs text-purple-200/80 leading-relaxed">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-violet-500/20 text-violet-300 text-[10px] font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <p>{rec}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-12 glass-panel rounded-3xl min-h-[450px]">
            <div className="w-16 h-16 bg-violet-950/40 border border-violet-500/20 rounded-2xl flex items-center justify-center mb-6">
              <Briefcase className="w-8 h-8 text-violet-400/50" />
            </div>
            <h3 className="font-display font-bold text-lg text-white mb-2">No Job Match Calculated</h3>
            <p className="text-sm text-purple-200/40 max-w-sm mb-6 leading-relaxed">
              Enter the target job title, paste your resume text, and the target listing description to build a custom fit alignment score.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
