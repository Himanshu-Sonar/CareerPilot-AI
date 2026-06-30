import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  TrendingUp, 
  Sparkles, 
  Award, 
  BookOpen, 
  Compass, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Zap, 
  Calendar,
  FileText
} from "lucide-react";
import { PlacementReadinessResult, UserProfile, ResumeAnalysisResult, InterviewSession, JobMatchResult } from "../types";

interface PlacementReadinessProps {
  userProfile: UserProfile;
  resumeAnalyses: ResumeAnalysisResult[];
  savedJobMatches: JobMatchResult[];
  interviewSessions: InterviewSession[];
  onSaveReadiness: (result: PlacementReadinessResult) => void;
  savedReadiness: PlacementReadinessResult | null;
  demoMode: boolean;
}

export default function PlacementReadiness({
  userProfile,
  resumeAnalyses,
  savedJobMatches,
  interviewSessions,
  onSaveReadiness,
  savedReadiness,
  demoMode
}: PlacementReadinessProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PlacementReadinessResult | null>(savedReadiness);

  // Deriving scores to send
  const resumeScore = resumeAnalyses.length > 0 ? resumeAnalyses[0].score : 0;
  const matchRate = savedJobMatches.length > 0 ? savedJobMatches[0].matchRate : 0;
  const interviewScore = interviewSessions.length > 0 ? interviewSessions[0].overallScore || 0 : 0;

  const handleAppraise = async () => {
    setLoading(true);
    setError(null);

    if (demoMode) {
      setTimeout(() => {
        const calculatedReadinessScore = Math.round(
          (resumeScore || 70) * 0.4 + 
          (matchRate || 75) * 0.3 + 
          (interviewScore || 70) * 0.3
        );

        const simulatedReadiness: PlacementReadinessResult = {
          id: "ready-demo-" + Date.now(),
          timestamp: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          targetRole: userProfile.targetRole || "Software Developer",
          readinessScore: calculatedReadinessScore,
          technicalRating: Math.round((resumeScore || 70) * 0.5 + 40),
          softSkillsRating: Math.round((interviewScore || 70) * 0.4 + 48),
          portfolioRating: Math.round((matchRate || 75) * 0.5 + 42),
          skillGaps: [
            { skill: "Next.js App Router", priority: "high", action: "Build a prototype server-side React app with SSR" },
            { skill: "CI/CD & DevOps basics", priority: "medium", action: "Deploy a project using GitHub Actions to Cloud Run" },
            { skill: "Behavioral Pitching (STAR)", priority: "low", action: "Prepare 3 stories on leadership and complex debugs" }
          ],
          learningPath: [
            { timeframe: "Week 1", step: "Master React Server Components", resource: "Official Next.js Learn Tutorial" },
            { timeframe: "Week 2", step: "Establish Automated Workflows", resource: "GitHub Actions starter workflows" },
            { timeframe: "Week 3", step: "Simulate Technical Coding Challenges", resource: "LeetCode top 75 and system design" },
            { timeframe: "Week 4", step: "Conduct Mock Panels", resource: "CareerPilot Interview Simulator with Gemini" }
          ],
          actionPlan: [
            "Revise resume formatting to include exact quantitative impact metrics.",
            "Complete 2 full sessions in the CareerPilot Interview Simulator.",
            "Refine the portfolio readmes to emphasize system architecture diagrams."
          ]
        };

        setResult(simulatedReadiness);
        onSaveReadiness(simulatedReadiness);
        setLoading(false);
      }, 1500);
      return;
    }

    try {
      const response = await fetch("/api/placement-readiness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills: userProfile.skills,
          experienceYears: userProfile.experienceYears,
          projectsCount: userProfile.projectsCount,
          targetRole: userProfile.targetRole,
          resumeScore: resumeScore || undefined
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to appraise placement readiness.");
      }

      const data = await response.json();

      const newReadiness: PlacementReadinessResult = {
        id: "ready-" + Date.now(),
        timestamp: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        targetRole: userProfile.targetRole || "Software Developer",
        ...data
      };

      setResult(newReadiness);
      onSaveReadiness(newReadiness);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during appraisal.");
    } finally {
      setLoading(false);
    }
  };

  const getReadinessLabel = (score: number) => {
    if (score >= 80) return { title: "PLACEMENT READY", color: "text-emerald-400 border-emerald-500/20 bg-emerald-950/20" };
    if (score >= 60) return { title: "INTERMEDIATE STANDING", color: "text-amber-400 border-amber-500/20 bg-amber-950/20" };
    return { title: "NEEDS ACTIVE PREPARATION", color: "text-rose-400 border-rose-500/20 bg-rose-950/20" };
  };

  const currentStatus = result ? getReadinessLabel(result.readinessScore) : { title: "UNAPPRAISED", color: "text-purple-300 border-purple-500/20 bg-purple-950/20" };

  return (
    <div id="readiness-root" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left side: Centerpiece dynamic progress wheel and appraisals */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Appraisal Card */}
        <div className="glass-panel p-6 rounded-3xl glow-purple text-center flex flex-col items-center">
          <h2 className="font-display font-bold text-lg text-white mb-4 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-violet-400" />
            <span>Cumulative Preparedness Index</span>
          </h2>

          <p className="text-xs text-purple-200/50 mb-6 leading-relaxed max-w-sm">
            Based on your active skills alignment, experience metrics, resume ratings, and mock-interview simulations.
          </p>

          {/* Central Conic circle */}
          <div className="relative w-48 h-48 flex items-center justify-center mb-6">
            <div 
              className="absolute inset-0 rounded-full" 
              style={{
                background: `conic-gradient(#a855f7 0% ${result?.readinessScore || 0}%, #1e1b4b ${result?.readinessScore || 0}% 100%)`
              }}
            />
            <div className="absolute inset-4.5 bg-[#0d071e] rounded-full flex flex-col items-center justify-center">
              <span className="font-display font-extrabold text-5xl text-white">{result?.readinessScore || "—"}%</span>
              <span className="text-[10px] text-purple-200/40 uppercase tracking-widest mt-1">Hiring Index</span>
            </div>
          </div>

          <div className={`px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider mb-6 ${currentStatus.color}`}>
            {currentStatus.title}
          </div>

          <button
            id="btn-recalculate-readiness"
            onClick={handleAppraise}
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-sm font-semibold rounded-2xl shadow-xl transition-all cursor-pointer flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Evaluating Readiness metrics...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Compile Gemini AI Evaluation</span>
              </>
            )}
          </button>
        </div>

        {/* Dynamic subratings from active page scores */}
        <div className="glass-panel p-5 rounded-3xl space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-purple-200/40">
            Source Component Metrics
          </h3>

          {/* Resume ATS Score */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-purple-200/70">
              <span className="flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 text-violet-400" />
                <span>Resume ATS Compatibility</span>
              </span>
              <span className="font-semibold text-white">{resumeScore ? `${resumeScore}%` : "Not Scanned"}</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-violet-500 rounded-full" style={{ width: `${resumeScore || 10}%` }} />
            </div>
          </div>

          {/* Job Match Rate */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-purple-200/70">
              <span className="flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-violet-400" />
                <span>Job Listing Match Rate</span>
              </span>
              <span className="font-semibold text-white">{matchRate ? `${matchRate}%` : "Not Compared"}</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${matchRate || 10}%` }} />
            </div>
          </div>

          {/* Mock Interview Score */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-purple-200/70">
              <span className="flex items-center space-x-1.5">
                <Award className="w-3.5 h-3.5 text-violet-400" />
                <span>Simulated Interview Rating</span>
              </span>
              <span className="font-semibold text-white">{interviewScore ? `${interviewScore}%` : "No Sessions Completed"}</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-fuchsia-500 rounded-full" style={{ width: `${interviewScore || 10}%` }} />
            </div>
          </div>
        </div>

      </div>

      {/* Right side: Detailed roadmaps, skill deficit lists, learning actions */}
      <div className="lg:col-span-7">
        {result ? (
          <div className="space-y-6" id="readiness-results-container">
            {/* Horizontal progress sliders for subratings from AI */}
            <div className="glass-panel p-6 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-wider text-purple-200/40 block">Technical Score</span>
                <span className="font-display font-extrabold text-2xl text-white block">{result.technicalRating}%</span>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${result.technicalRating}%` }} />
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-wider text-purple-200/40 block">Soft Skills Rating</span>
                <span className="font-display font-extrabold text-2xl text-white block">{result.softSkillsRating}%</span>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${result.softSkillsRating}%` }} />
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-wider text-purple-200/40 block">Portfolio Rating</span>
                <span className="font-display font-extrabold text-2xl text-white block">{result.portfolioRating}%</span>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-fuchsia-500 rounded-full" style={{ width: `${result.portfolioRating}%` }} />
                </div>
              </div>

            </div>

            {/* AI Action plan checklists */}
            <div className="glass-panel p-6 rounded-3xl">
              <h3 className="font-display font-bold text-base text-white mb-3 flex items-center space-x-2">
                <Zap className="w-4.5 h-4.5 text-yellow-400" />
                <span>Immediate Priority Action Plan</span>
              </h3>
              <div className="space-y-2.5">
                {result.actionPlan && result.actionPlan.map((action, idx) => (
                  <div key={idx} className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-start space-x-3 text-xs leading-relaxed text-purple-200/80">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <p>{action}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Structured Skill Gaps */}
            <div className="glass-panel p-6 rounded-3xl">
              <h3 className="font-display font-bold text-base text-white mb-4 flex items-center space-x-2">
                <AlertTriangle className="w-4.5 h-4.5 text-violet-400" />
                <span>Skill Deficits & Recommended Mitigation</span>
              </h3>

              <div className="space-y-3">
                {result.skillGaps && result.skillGaps.map((item, idx) => (
                  <div key={idx} className="p-4 bg-violet-950/20 border border-violet-500/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-white">{item.skill}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          item.priority === "high" 
                            ? "bg-red-500/20 text-red-400 border border-red-500/20" 
                            : item.priority === "medium"
                            ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/20"
                            : "bg-blue-500/20 text-blue-400 border border-blue-500/20"
                        }`}>
                          {item.priority}
                        </span>
                      </div>
                      <p className="text-xs text-purple-200/50 leading-relaxed">{item.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom learning syllabus path */}
            <div className="glass-panel p-6 rounded-3xl border-violet-500/25">
              <h3 className="font-display font-bold text-base text-white mb-4 flex items-center space-x-2">
                <BookOpen className="w-4.5 h-4.5 text-violet-400" />
                <span>Structured Study Curriculum</span>
              </h3>

              <div className="space-y-4 relative pl-4 border-l border-violet-500/20">
                {result.learningPath && result.learningPath.map((step, idx) => (
                  <div key={idx} className="relative space-y-1">
                    {/* Bullet pointer */}
                    <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-violet-500 border border-[#0b0616]" />
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider font-mono">{step.timeframe}</span>
                    </div>
                    <h4 className="font-bold text-white text-sm">{step.step}</h4>
                    <p className="text-xs text-purple-200/60 leading-relaxed font-sans">{step.resource}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-12 glass-panel rounded-3xl min-h-[450px]">
            <div className="w-16 h-16 bg-violet-950/40 border border-violet-500/20 rounded-2xl flex items-center justify-center mb-6">
              <TrendingUp className="w-8 h-8 text-violet-400/50" />
            </div>
            <h3 className="font-display font-bold text-lg text-white mb-2">Ready to Appraise Placement Fitment</h3>
            <p className="text-sm text-purple-200/40 max-w-sm mb-6 leading-relaxed">
              Compile and trigger the career index appraisal engine on the left column. CareerPilot AI will output complete metrics, skill deficits, and learning tracks.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
