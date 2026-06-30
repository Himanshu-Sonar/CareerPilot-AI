import React from "react";
import { motion } from "motion/react";
import { 
  Award, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  Terminal, 
  TrendingUp, 
  ShieldCheck, 
  Lock 
} from "lucide-react";
import { ResumeAnalysisResult, JobMatchResult, InterviewSession, PlacementReadinessResult } from "../types";

interface AchievementsProps {
  resumeAnalyses: ResumeAnalysisResult[];
  jobMatches: JobMatchResult[];
  interviewSessions: InterviewSession[];
  placementReadiness: PlacementReadinessResult | null;
}

export default function Achievements({
  resumeAnalyses,
  jobMatches,
  interviewSessions,
  placementReadiness
}: AchievementsProps) {
  // Compute unlock conditions
  const isResumeAnalyzed = resumeAnalyses.length > 0;
  const isAtsAbove80 = resumeAnalyses.some(item => item.score >= 80);
  const isJobMatchCompleted = jobMatches.length > 0;
  const isInterviewCompleted = interviewSessions.some(item => item.completed);
  const isPlacementReady = placementReadiness && placementReadiness.readinessScore >= 80;

  // Badge configuration lists
  const badges = [
    {
      id: "badge-resume-uploaded",
      title: "First Draft Complete",
      description: "Trigger your first AI Resume Analysis loop.",
      unlocked: isResumeAnalyzed,
      icon: FileText,
      rarity: "Common",
      color: "from-violet-500/20 to-purple-500/10 border-violet-500/30",
      accent: "text-violet-400"
    },
    {
      id: "badge-ats-80",
      title: "Elite Candidate Rank",
      description: "Obtain an ATS compatibility score of 80% or greater.",
      unlocked: isAtsAbove80,
      icon: ShieldCheck,
      rarity: "Rare",
      color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30",
      accent: "text-emerald-400"
    },
    {
      id: "badge-job-matched",
      title: "Active Prospector",
      description: "Complete a custom Job Description match analysis.",
      unlocked: isJobMatchCompleted,
      icon: CheckCircle2,
      rarity: "Common",
      color: "from-indigo-500/20 to-blue-500/10 border-indigo-500/30",
      accent: "text-indigo-400"
    },
    {
      id: "badge-interview-completed",
      title: "Sim Gladiator",
      description: "Complete at least one multi-question AI mock interview session.",
      unlocked: isInterviewCompleted,
      icon: Terminal,
      rarity: "Epic",
      color: "from-pink-500/20 to-fuchsia-500/10 border-pink-500/30",
      accent: "text-pink-400"
    },
    {
      id: "badge-placement-ready",
      title: "Ultimate Ready State",
      description: "Achieve a cumulative Placement Readiness index of 80% or higher.",
      unlocked: isPlacementReady,
      icon: TrendingUp,
      rarity: "Legendary",
      color: "from-amber-500/20 to-yellow-500/10 border-amber-500/30",
      accent: "text-amber-400 animate-pulse"
    }
  ];

  const totalUnlockedCount = badges.filter(b => b.unlocked).length;

  return (
    <div id="achievements-container" className="space-y-6">
      {/* Overview stats */}
      <div className="glass-panel p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[250px] h-full bg-gradient-to-l from-purple-500/10 to-transparent pointer-events-none" />
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-500 flex items-center justify-center font-display font-bold text-white text-lg shadow-lg">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Career Credentials & Achievements</h2>
            <p className="text-xs text-purple-200/50">
              Unlock prestigious badges as you optimize your profiles and ready your applications.
            </p>
          </div>
        </div>

        <div className="text-center sm:text-right">
          <span className="font-mono text-3xl font-extrabold text-white">{totalUnlockedCount} <span className="text-sm font-normal text-purple-200/40">/ {badges.length}</span></span>
          <span className="text-[10px] text-purple-200/40 block uppercase tracking-widest mt-1">Badges Unlocked</span>
        </div>
      </div>

      {/* Grid of badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {badges.map((badge) => {
          const IconComponent = badge.icon;
          return (
            <div
              key={badge.id}
              id={badge.id}
              className={`glass-panel p-6 rounded-3xl border transition-all flex flex-col justify-between relative overflow-hidden ${
                badge.unlocked 
                  ? `bg-gradient-to-br ${badge.color} glow-purple shadow-lg shadow-purple-900/10` 
                  : "opacity-40 bg-white/[0.02] border-white/5"
              }`}
            >
              <div className="absolute top-2 right-2 flex items-center space-x-1.5">
                <span className={`text-[9px] font-bold font-mono uppercase px-1.5 py-0.5 rounded border border-white/5 bg-black/30 ${
                  badge.rarity === "Legendary" ? "text-amber-400" : badge.rarity === "Epic" ? "text-pink-400" : badge.rarity === "Rare" ? "text-emerald-400" : "text-purple-300"
                }`}>
                  {badge.rarity}
                </span>
              </div>

              <div className="space-y-4">
                {/* Icon display */}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border bg-violet-950/40 border-violet-500/20 ${badge.accent}`}>
                  {badge.unlocked ? (
                    <IconComponent className="w-6 h-6 text-violet-400" />
                  ) : (
                    <Lock className="w-5 h-5 text-purple-200/40" />
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="font-display font-bold text-base text-white">{badge.title}</h3>
                  <p className="text-xs text-purple-200/60 leading-relaxed">{badge.description}</p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-white/5 flex justify-between items-center">
                <span className="text-[10px] text-purple-200/40 font-mono">
                  {badge.unlocked ? "Unlocked Successfully" : "Credentials Locked"}
                </span>
                {badge.unlocked && (
                  <Sparkles className="w-4 h-4 text-violet-400 animate-pulse" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
