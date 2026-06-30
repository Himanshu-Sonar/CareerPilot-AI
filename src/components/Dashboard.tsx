import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  FileText, 
  Briefcase, 
  Terminal, 
  TrendingUp, 
  ArrowRight, 
  ChevronRight,
  Plus, 
  Award,
  BookOpen,
  User,
  Activity,
  UserCheck,
  MessageSquare,
  Send,
  CheckCircle2,
  Building,
  Clock,
  Compass,
  AlertCircle
} from "lucide-react";
import { 
  ResumeAnalysisResult, 
  JobMatchResult, 
  InterviewSession, 
  PlacementReadinessResult, 
  UserProfile, 
  MentorMessage, 
  DailyMission, 
  CompanyRecommendation, 
  SkillRoadmapStep 
} from "../types";

interface DashboardProps {
  userProfile: UserProfile;
  resumeAnalyses: ResumeAnalysisResult[];
  jobMatches: JobMatchResult[];
  interviewSessions: InterviewSession[];
  placementReadiness: PlacementReadinessResult | null;
  onNavigate: (tab: string) => void;
  onOpenSettings: () => void;
  demoMode: boolean;
}

export default function Dashboard({
  userProfile,
  resumeAnalyses,
  jobMatches,
  interviewSessions,
  placementReadiness,
  onNavigate,
  onOpenSettings,
  demoMode
}: DashboardProps) {
  // Compute some high-quality analytics derived from states
  const latestResumeScore = resumeAnalyses.length > 0 ? resumeAnalyses[0].score : 0;
  const latestJobMatch = jobMatches.length > 0 ? jobMatches[0] : null;
  const latestInterviewSession = interviewSessions.length > 0 ? interviewSessions[0] : null;

  // Compute stats or default values
  const readinessScore = placementReadiness ? placementReadiness.readinessScore : 45;
  const skillGaps = placementReadiness?.skillGaps || [
    { skill: "Next.js / SSR", priority: "high", action: "Build a prototype server-side React app" },
    { skill: "System Design Patterns", priority: "medium", action: "Study horizontal vs vertical scaling" },
    { skill: "Behavioral Pitching", priority: "low", action: "Structure answers using the STAR format" }
  ];

  const recommendations = placementReadiness?.actionPlan || [
    `Optimize resume with key credentials like "${userProfile.skills.slice(0, 2).join(", ") || "Cloud Systems"}" to boost ATS visibility.`,
    latestJobMatch ? `Your experience matches "${latestJobMatch.jobTitle}" closely. Optimize your resume's experience section and apply.` : "Run your first Job Match Analysis to view targeted AI opportunities.",
    "Practice behavioral interview questions under simulation pressure to raise interview scores."
  ];

  // Helper rating display
  const getRatingLabel = (score: number) => {
    if (score >= 80) return "EXCELLENT";
    if (score >= 60) return "GOOD";
    return "NEEDS WORK";
  };

  // --- Daily Mission State ---
  const [dailyMission, setDailyMission] = useState<DailyMission | null>(null);
  const [loadingMission, setLoadingMission] = useState(false);

  // --- Mentor Message State ---
  const [messages, setMessages] = useState<MentorMessage[]>([
    {
      id: "msg-init",
      sender: "ai",
      text: "Hello, Future Developer! 👋 I'm your AI Career Mentor. I've compiled your professional data. Ask me any career path queries, advice on resume optimization, or interview preparation tips!",
      timestamp: "Now"
    }
  ]);
  const [mentorInput, setMentorInput] = useState("");
  const [mentorLoading, setMentorLoading] = useState(false);

  // --- Company Recommendations State ---
  const [companies, setCompanies] = useState<CompanyRecommendation[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  // --- Skill Roadmap Checklist State ---
  const [roadmap, setRoadmap] = useState<SkillRoadmapStep[]>([]);

  useEffect(() => {
    // 1. Load Daily Mission
    const loadDailyMission = async () => {
      setLoadingMission(true);
      if (demoMode) {
        setTimeout(() => {
          setDailyMission({
            id: "mission-demo",
            task: "Simulate a live 5-question technical session under role-based constraints.",
            completionTime: "15 mins",
            difficulty: "Medium",
            improvement: "+5% interview readiness",
            completed: false
          });
          setLoadingMission(false);
        }, 800);
      } else {
        try {
          const response = await fetch("/api/daily-mission", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              targetRole: userProfile.targetRole,
              skills: userProfile.skills
            })
          });
          if (response.ok) {
            const data = await response.json();
            setDailyMission({
              id: "mission-live",
              task: data.task,
              completionTime: data.completionTime || "12 mins",
              difficulty: data.difficulty || "Medium",
              improvement: data.improvement || "+4% Placement Index",
              completed: false
            });
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingMission(false);
        }
      }
    };

    // 2. Load Company Recommendations
    const loadCompanyRecommendations = async () => {
      setLoadingCompanies(true);
      if (demoMode) {
        setTimeout(() => {
          setCompanies([
            {
              companyName: "Google",
              logoColor: "from-blue-600 to-red-500",
              compatibilityScore: 92,
              openRoles: ["Associate Web Engineer", "Cloud Systems Consultant"],
              whySuitable: "Matches strong modern JavaScript patterns, React workflows, and robust state engines defined in your resume.",
              skillsMatchPercent: 94
            },
            {
              companyName: "Stripe",
              logoColor: "from-purple-600 to-indigo-500",
              compatibilityScore: 88,
              openRoles: ["Frontend Specialist", "Integrations Developer"],
              whySuitable: "Aligns with advanced TypeScript schemas and state serialization layers.",
              skillsMatchPercent: 89
            },
            {
              companyName: "Vercel",
              logoColor: "from-black to-slate-800",
              compatibilityScore: 85,
              openRoles: ["React UI Engineer", "Framework Specialist"],
              whySuitable: "Matches Tailwind utility usage and modular code structure optimization.",
              skillsMatchPercent: 87
            }
          ]);
          setLoadingCompanies(false);
        }, 900);
      } else {
        try {
          const response = await fetch("/api/recommend-companies", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              skills: userProfile.skills,
              targetRole: userProfile.targetRole,
              atsScore: latestResumeScore || 70
            })
          });
          if (response.ok) {
            const data = await response.json();
            setCompanies(data.companies || []);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingCompanies(false);
        }
      }
    };

    // 3. Load 4-week learning roadmap
    const loadRoadmap = () => {
      if (placementReadiness?.learningPath && placementReadiness.learningPath.length > 0) {
        const customRoadmap: SkillRoadmapStep[] = placementReadiness.learningPath.map((step, i) => ({
          week: i + 1,
          milestone: step.step,
          skills: [step.resource.split(" ")[0] || "Advanced Core"],
          resources: [step.resource],
          completed: false
        }));
        setRoadmap(customRoadmap);
      } else {
        setRoadmap([
          {
            week: 1,
            milestone: "Master client-side React lifecycle hooks & state serialization",
            skills: ["React 19 Hooks", "localStorage sync", "State consistency"],
            resources: ["Beta React Docs: State Management", "Vite Environment references"],
            completed: false
          },
          {
            week: 2,
            milestone: "Optimize ATS Keyword alignment and structured formatting",
            skills: ["PDF parser mapping", "Semantic industry headers", "STAR achievements"],
            resources: ["ATS standard parsing guidelines", "Google Resume Writing rules"],
            completed: false
          },
          {
            week: 3,
            milestone: "Simulate high-pressure technical coding algorithms",
            skills: ["State machine flow", "Complexity calculations", "Debugging diagnostics"],
            resources: ["LeetCode Top Interview Questions", "Frontend engineering design patterns"],
            completed: false
          },
          {
            week: 4,
            milestone: "Practice behavioral interview delivery and confidence feedback",
            skills: ["Quantitative metrics", "STAR format", "Voice delivery structure"],
            resources: ["Google Interview Prep Guide", "CareerPilot Live Mock panels"],
            completed: false
          }
        ]);
      }
    };

    loadDailyMission();
    loadCompanyRecommendations();
    loadRoadmap();
  }, [demoMode, userProfile.targetRole, latestResumeScore, placementReadiness]);

  const handleSendMentorMessage = async () => {
    if (!mentorInput.trim() || mentorLoading) return;
    const userMsg: MentorMessage = {
      id: "msg-user-" + Date.now(),
      sender: "user",
      text: mentorInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    const originalInput = mentorInput;
    setMentorInput("");
    setMentorLoading(true);

    if (demoMode) {
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: "msg-ai-" + Date.now(),
            sender: "ai",
            text: `Based on your goal to be a successful "${userProfile.targetRole}", I recommend prioritizing the following actions: \n\n1. Ensure your resume achieves over 80 points in the ATS Analyzer.\n2. Complete at least one simulated interview. To answer your question "${originalInput}": stay focused on modular architecture and practice explaining complex algorithms clearly!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setMentorLoading(false);
      }, 1000);
      return;
    }

    try {
      const response = await fetch("/api/career-mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: originalInput,
          skills: userProfile.skills,
          targetRole: userProfile.targetRole,
          resumeScore: latestResumeScore || 70,
          readinessScore
        })
      });

      if (!response.ok) {
        throw new Error("Mentor failed to respond.");
      }

      const data = await response.json();
      setMessages(prev => [
        ...prev,
        {
          id: "msg-ai-" + Date.now(),
          sender: "ai",
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: "msg-ai-err-" + Date.now(),
          sender: "ai",
          text: "I encountered an error connecting to my core brain. Please check your credentials or toggle Demo Mode.",
          timestamp: "Now"
        }
      ]);
    } finally {
      setMentorLoading(false);
    }
  };

  return (
    <div id="dashboard-container" className="space-y-6">
      {/* Profile Welcome Bar */}
      <div className="glass-panel p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[300px] h-full bg-gradient-to-l from-violet-500/10 to-transparent pointer-events-none" />
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-500 flex items-center justify-center font-display font-bold text-white text-lg shadow-lg shadow-violet-900/30">
            {userProfile.fullName ? userProfile.fullName.charAt(0).toUpperCase() : "F"}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              {userProfile.fullName ? `Welcome back, ${userProfile.fullName} 👋` : "Welcome, Future Developer 👋"}
            </h2>
            <p className="text-xs text-purple-200/50 flex items-center space-x-1">
              <span className="font-semibold text-violet-400">{userProfile.targetRole || "Productive User"}</span>
              <span>•</span>
              <span>{userProfile.experienceLevel} Level</span>
            </p>
          </div>
        </div>
        
        <button
          id="btn-dashboard-profile-edit"
          onClick={onOpenSettings}
          className="text-xs px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-all flex items-center space-x-2 cursor-pointer"
        >
          <User className="w-3.5 h-3.5" />
          <span>Configure Profile</span>
        </button>
      </div>

      {/* 1. Career Progress Timeline (Gamified Step pipeline) */}
      <div className="glass-panel p-6 rounded-3xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-purple-200/40">Career Progress Timeline</h3>
          <span className="text-[10px] text-green-400 bg-green-950/40 px-2 py-0.5 rounded border border-green-500/20 flex items-center gap-1">
            <Activity className="w-3 h-3" /> Live Pipeline
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {[
            { label: "Resume Analysis", desc: "Upload & Scoring", isDone: resumeAnalyses.length > 0, num: "01" },
            { label: "Job Description Match", desc: "Alignment Quotient", isDone: jobMatches.length > 0, num: "02" },
            { label: "Interview Simulation", desc: "STAR Feedback Loop", isDone: interviewSessions.length > 0, num: "03" },
            { label: "Placement Ready", desc: "Certified standing", isDone: placementReadiness !== null && placementReadiness.readinessScore >= 75, num: "04" }
          ].map((step, idx) => (
            <div 
              key={idx} 
              className={`p-4 rounded-2xl border transition-all ${
                step.isDone 
                  ? "bg-purple-950/20 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]" 
                  : "bg-white/5 border-white/5 opacity-50"
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-mono font-bold text-violet-400">{step.num}</span>
                {step.isDone ? (
                  <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-600" />
                )}
              </div>
              <h4 className="text-sm font-bold text-white">{step.label}</h4>
              <p className="text-[11px] text-purple-200/40 mt-1">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Primary Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Placement Readiness Chart (Col: 4) */}
        <div id="widget-readiness" className="lg:col-span-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-between min-h-[380px]">
          <div className="w-full flex justify-between items-center mb-4">
            <h3 className="font-display font-semibold text-white flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span>Placement Readiness</span>
            </h3>
            <span className="text-[10px] text-purple-300 font-mono bg-purple-950/40 px-2 py-0.5 rounded border border-purple-500/20 uppercase tracking-wider">
              Gemini Index
            </span>
          </div>

          {/* Conic Ring representation */}
          <div className="relative w-40 h-40 flex items-center justify-center my-2">
            <div 
              className="absolute inset-0 rounded-full" 
              style={{
                background: `conic-gradient(#a855f7 0% ${readinessScore}%, #1e1b4b ${readinessScore}% 100%)`
              }}
            />
            <div className="absolute inset-3 bg-[#0d071e] rounded-full flex flex-col items-center justify-center">
              <span className="text-4xl font-extrabold text-white font-display">{readinessScore}%</span>
              <span className="text-[10px] text-purple-400 font-semibold uppercase tracking-wider">
                {readinessScore >= 75 ? "Ready" : readinessScore >= 55 ? "Average" : "Prep Needed"}
              </span>
            </div>
          </div>

          <div className="w-full grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/5">
            <div>
              <p className="text-[10px] text-purple-200/40 uppercase tracking-widest">Skill Alignment</p>
              <p className="text-sm font-semibold text-green-400">
                {placementReadiness ? getRatingLabel(placementReadiness.technicalRating) : "Pending"}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-purple-200/40 uppercase tracking-widest">Market Status</p>
              <p className="text-sm font-semibold text-purple-400">High Demand</p>
            </div>
          </div>

          <button
            id="btn-widget-readiness-go"
            onClick={() => onNavigate("readiness")}
            className="w-full mt-4 py-2 bg-purple-950/30 hover:bg-purple-900/30 border border-purple-500/20 text-xs font-semibold text-purple-200 rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>Run Readiness Appraisal</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ATS Scoring Widget & Matches (Col: 8) */}
        <div className="lg:col-span-8 flex flex-col justify-between gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 flex-grow">
            
            {/* ATS Resume Scoring */}
            <div id="widget-ats" className="sm:col-span-7 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xs font-semibold text-purple-200/40 uppercase tracking-widest">ATS Scoring Engine</h3>
                  <p className="text-3xl font-extrabold text-white mt-1">
                    {latestResumeScore || "—"} <span className="text-xs font-normal text-purple-200/40">/ 100</span>
                  </p>
                </div>
                <div className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                  latestResumeScore >= 80 
                    ? "bg-green-500/20 text-green-400 border-green-500/30" 
                    : latestResumeScore >= 60 
                    ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                    : latestResumeScore > 0
                    ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                    : "bg-white/5 text-purple-200/50 border-white/5"
                }`}>
                  {latestResumeScore > 0 ? getRatingLabel(latestResumeScore) : "NO DATA"}
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <div className="flex justify-between text-[11px] text-purple-200/70">
                  <span>Formatting & Structure</span>
                  <span className="text-purple-400 font-semibold">{latestResumeScore ? `${latestResumeScore}%` : "—"}</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-1000" 
                    style={{ width: `${latestResumeScore || 15}%` }}
                  />
                </div>
              </div>

              <button
                id="btn-widget-ats-go"
                onClick={() => onNavigate("resume")}
                className="w-full mt-4 py-2 bg-white/5 hover:bg-white/10 text-xs font-medium text-white rounded-xl transition-all flex items-center justify-center space-x-1 cursor-pointer"
              >
                <span>{latestResumeScore ? "Re-analyze Resume" : "Start First Resume Scan"}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Active Job Matches */}
            <div id="widget-job-matches" className="sm:col-span-5 bg-gradient-to-br from-purple-900 to-indigo-950 rounded-3xl p-6 text-white shadow-xl shadow-purple-900/20 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-medium uppercase tracking-wider text-purple-200/60">Job Match Quotient</h3>
                <p className="text-4xl font-extrabold mt-1">
                  {latestJobMatch ? `${latestJobMatch.matchRate}%` : "—"}
                </p>
                <p className="text-xs text-purple-200/60 mt-1">
                  {latestJobMatch ? `Match with: ${latestJobMatch.jobTitle}` : "No match scored yet."}
                </p>
              </div>

              <div className="flex gap-2 mt-4">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center font-bold text-[10px] text-white">G</div>
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center font-bold text-[10px] text-white">M</div>
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center font-bold text-[10px] text-white">A</div>
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[10px] text-purple-200">+12</div>
              </div>

              <button
                id="btn-widget-jobs-go"
                onClick={() => onNavigate("job-match")}
                className="w-full mt-4 py-2 bg-white/10 hover:bg-white/20 text-xs font-semibold text-white rounded-xl transition-all flex items-center justify-center space-x-1 cursor-pointer"
              >
                <span>Job Analyzer</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* AI recommendations feed */}
          <div id="widget-recommendations" className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            <h3 className="text-xs font-semibold text-purple-200/40 uppercase tracking-widest mb-3">
              AI Career Path Guidance
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recommendations.slice(0, 2).map((rec, i) => (
                <div key={i} className="p-3 bg-white/5 border border-white/5 rounded-2xl flex items-start space-x-3 text-xs leading-relaxed text-purple-200/80">
                  <div className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${i === 0 ? "bg-purple-500 shadow-[0_0_8px_#a855f7]" : "bg-blue-500 shadow-[0_0_8px_#3b82f6]"}`} />
                  <p>{rec}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Middle row: 2. Daily Mission & 3. Company Recommendation Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Daily Mission Widget */}
        <div className="lg:col-span-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xs font-semibold text-purple-200/40 uppercase tracking-widest">Daily Placement Mission</h3>
                <span className="text-[10px] text-purple-300 font-mono">Personalized micro-learning</span>
              </div>
              <span className="p-1 rounded-lg bg-purple-500/10 text-purple-400">
                <Sparkles className="w-4 h-4" />
              </span>
            </div>

            {loadingMission ? (
              <div className="flex items-center justify-center py-8 space-x-2">
                <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce [animation-delay:0.4s]" />
              </div>
            ) : dailyMission ? (
              <div className="space-y-4">
                <div className={`p-4 rounded-2xl border transition-all ${
                  dailyMission.completed 
                    ? "bg-green-950/20 border-green-500/30" 
                    : "bg-violet-950/10 border-violet-500/15"
                }`}>
                  <p className={`text-xs leading-relaxed font-bold ${dailyMission.completed ? "line-through text-green-300" : "text-white"}`}>
                    {dailyMission.task}
                  </p>
                  
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/5 text-[10px] text-purple-200/50 uppercase tracking-wider">
                    <div>
                      <span className="block text-[8px] text-purple-200/30 font-semibold">EST. TIME</span>
                      <span className="font-mono font-bold text-white">{dailyMission.completionTime}</span>
                    </div>
                    <div>
                      <span className="block text-[8px] text-purple-200/30 font-semibold">DIFFICULTY</span>
                      <span className="font-bold text-violet-400">{dailyMission.difficulty}</span>
                    </div>
                    <div>
                      <span className="block text-[8px] text-purple-200/30 font-semibold">IMPACT</span>
                      <span className="font-bold text-green-400">{dailyMission.improvement}</span>
                    </div>
                  </div>
                </div>

                <button
                  id="btn-complete-mission"
                  onClick={() => setDailyMission(prev => prev ? { ...prev, completed: !prev.completed } : null)}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer border ${
                    dailyMission.completed 
                      ? "bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20" 
                      : "bg-purple-600 border-purple-500 text-white hover:bg-purple-500 shadow-md shadow-purple-950/40"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{dailyMission.completed ? "Completed! Awesome job" : "Mark as Completed"}</span>
                </button>
              </div>
            ) : (
              <p className="text-xs text-purple-200/40">No mission generated for today.</p>
            )}
          </div>
        </div>

        {/* Company Recommendation Engine */}
        <div className="lg:col-span-7 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xs font-semibold text-purple-200/40 uppercase tracking-widest font-display">
                  Compatible Company Recommendation
                </h3>
                <span className="text-[10px] text-purple-300 font-mono">Ranked by skills alignment & compatibility</span>
              </div>
              <Building className="w-4 h-4 text-purple-400 shrink-0" />
            </div>

            {loadingCompanies ? (
              <div className="flex items-center justify-center py-10 space-x-2">
                <div className="w-2 h-2 rounded-full bg-violet-400 animate-ping" />
              </div>
            ) : companies.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {companies.map((comp, idx) => (
                  <div key={idx} className="p-3 bg-white/5 border border-white/5 rounded-2xl flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-gradient-to-r ${comp.logoColor} text-white uppercase`}>
                          {comp.companyName}
                        </span>
                        <span className="text-xs font-bold text-purple-300 font-mono">{comp.compatibilityScore}%</span>
                      </div>
                      <p className="text-[10px] text-purple-200/40 leading-relaxed truncate-2-lines min-h-[44px]">
                        {comp.whySuitable}
                      </p>
                    </div>
                    
                    <div className="pt-2 mt-2 border-t border-white/5">
                      <span className="block text-[8px] text-purple-200/30 uppercase tracking-wider font-semibold">Open Positions</span>
                      <span className="text-[9px] font-bold text-white block truncate">{comp.openRoles[0]}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-purple-200/40">Please complete the Resume Analyzer module first to view matched organizations.</p>
            )}
          </div>
        </div>

      </div>

      {/* Bottom Row: 4. AI Career Mentor Conversational Assistant & 5. Skill Roadmap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* AI Career Mentor Chat Widget (Col: 6) */}
        <div className="lg:col-span-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col justify-between min-h-[440px]">
          <div>
            <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-violet-400" />
                <h3 className="font-display font-semibold text-white">AI Career Mentor</h3>
              </div>
              <span className="text-[10px] text-violet-400 bg-violet-950/40 px-2 py-0.5 rounded border border-violet-500/20 font-mono">
                Conversational Assistant
              </span>
            </div>

            {/* Chat Messages Log */}
            <div className="space-y-3 h-64 overflow-y-auto pr-2 scrollbar-thin">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === "user" 
                      ? "bg-violet-600 text-white rounded-br-none" 
                      : "bg-white/5 border border-white/5 text-purple-200 rounded-bl-none"
                  }`}>
                    <p className="whitespace-pre-line">{msg.text}</p>
                    <span className="block text-[8px] text-purple-200/40 mt-1 text-right">{msg.timestamp}</span>
                  </div>
                </div>
              ))}
              {mentorLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/5 p-3 rounded-2xl rounded-bl-none flex items-center space-x-1.5">
                    <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
            <input
              id="input-mentor-chat"
              type="text"
              value={mentorInput}
              onChange={(e) => setMentorInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMentorMessage()}
              placeholder="Ask anything (e.g. 'How can I master react concurrent features?')"
              className="flex-grow bg-violet-950/20 border border-violet-500/20 rounded-xl px-4 py-2.5 text-xs text-white placeholder-purple-200/30 focus:outline-none focus:border-violet-500 transition-all"
            />
            <button
              id="btn-mentor-chat-send"
              onClick={handleSendMentorMessage}
              disabled={mentorLoading}
              className="p-2.5 bg-purple-600 border border-purple-500 hover:bg-purple-500 text-white rounded-xl transition-all cursor-pointer shadow-lg shadow-purple-950/30 disabled:opacity-50 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4-Week Skill Learning Roadmap Checklist (Col: 6) */}
        <div className="lg:col-span-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/5">
              <div className="flex items-center space-x-2">
                <Compass className="w-4 h-4 text-violet-400" />
                <h3 className="font-display font-semibold text-white">4-Week Learning Roadmap</h3>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20 font-mono font-bold">
                Checklist
              </span>
            </div>

            <div className="space-y-4">
              {roadmap.map((weekStep, i) => (
                <div key={i} className="flex gap-3 items-start p-3 bg-white/5 border border-white/5 rounded-2xl">
                  <input
                    id={`checkbox-roadmap-week-${i}`}
                    type="checkbox"
                    checked={weekStep.completed}
                    onChange={() => {
                      setRoadmap(prev => prev.map((item, idx) => idx === i ? { ...item, completed: !item.completed } : item));
                    }}
                    className="w-4 h-4 rounded border-violet-500/30 text-purple-600 focus:ring-purple-500 cursor-pointer mt-1"
                  />
                  <div className="flex-grow">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-mono font-bold text-violet-400 uppercase tracking-widest">
                        Week {weekStep.week}
                      </span>
                      {weekStep.completed && (
                        <span className="text-[9px] font-bold text-green-400 bg-green-950/20 px-1.5 py-0.2 rounded border border-green-500/10">
                          Complete
                        </span>
                      )}
                    </div>
                    <h4 className={`text-xs font-bold leading-relaxed ${weekStep.completed ? "line-through text-purple-200/30" : "text-white"}`}>
                      {weekStep.milestone}
                    </h4>
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {weekStep.skills.map((skill, skIdx) => (
                        <span key={skIdx} className="text-[9px] bg-purple-950/40 border border-purple-500/10 text-purple-200 px-1.5 py-0.5 rounded font-mono">
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="mt-2 text-[10px] text-purple-200/40 italic flex items-center space-x-1">
                      <BookOpen className="w-3 h-3 text-violet-400" />
                      <span className="truncate max-w-[280px]">Curated: {weekStep.resources[0]}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Hook elements: Interview Simulator Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Top Skill Gaps (Col: 5) */}
        <div id="widget-skill-gaps" className="lg:col-span-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-semibold text-purple-200/40 uppercase tracking-widest mb-4">
              Priority Skill Gaps
            </h3>
            <div className="space-y-3">
              {skillGaps.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs">
                  <div className="flex flex-col">
                    <span className="font-semibold text-white">{item.skill}</span>
                    <span className="text-[10px] text-purple-200/50 truncate max-w-[180px] sm:max-w-xs">{item.action}</span>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                    item.priority === "high" 
                      ? "bg-red-500/20 text-red-400" 
                      : item.priority === "medium"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-blue-500/20 text-blue-400"
                  }`}>
                    {item.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            id="btn-widget-gaps-explore"
            onClick={() => onNavigate("readiness")}
            className="w-full mt-4 py-2 bg-white/5 hover:bg-white/10 text-xs font-medium text-white rounded-xl transition-all flex items-center justify-center space-x-1 cursor-pointer"
          >
            <span>View Roadmap</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Interview Simulator Hook Banner (Col: 7) */}
        <div id="widget-interview-sim" className="lg:col-span-7 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 border border-white/10 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5 text-center sm:text-left flex-col sm:flex-row">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-white/5">
              🎙️
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Next: Virtual Interview Simulator</h4>
              <p className="text-xs text-purple-200/60 leading-relaxed mt-1">
                {latestInterviewSession 
                  ? `Completed session scored ${latestInterviewSession.overallScore || "—"}% on "${latestInterviewSession.role}".` 
                  : "Practice technical coding algorithms or behavioral leadership questions with Gemini AI instant feedback."}
              </p>
            </div>
          </div>
          <button
            id="btn-widget-interview-go"
            onClick={() => onNavigate("interview")}
            className="px-6 py-3 bg-white text-purple-900 font-bold text-xs rounded-xl hover:bg-purple-100 transition-colors shadow-lg shadow-white/10 cursor-pointer shrink-0"
          >
            Start Session
          </button>
        </div>

      </div>
    </div>
  );
}
