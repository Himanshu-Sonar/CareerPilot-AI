import React, { useState, useEffect } from "react";
import LandingPage from "./components/LandingPage";
import Dashboard from "./components/Dashboard";
import ResumeAnalyzer from "./components/ResumeAnalyzer";
import JobMatchAnalyzer from "./components/JobMatchAnalyzer";
import InterviewSimulator from "./components/InterviewSimulator";
import PlacementReadiness from "./components/PlacementReadiness";
import Achievements from "./components/Achievements";
import { 
  Sparkles, 
  FileText, 
  Briefcase, 
  Terminal, 
  TrendingUp, 
  Award, 
  Settings, 
  ChevronRight, 
  Menu, 
  X, 
  LogOut,
  Info
} from "lucide-react";
import { ResumeAnalysisResult, JobMatchResult, InterviewSession, PlacementReadinessResult, UserProfile } from "./types";

// Default user profile
const DEFAULT_PROFILE: UserProfile = {
  fullName: "", // Clean default for Welcome to CareerPilot AI 👋 greeting
  targetRole: "Productive CareerPilot User",
  experienceLevel: "Junior / Entry",
  experienceYears: 1,
  projectsCount: 3,
  skills: ["React", "TypeScript", "Tailwind CSS", "Node.js", "Express", "SQL"],
  resumeText: ""
};

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("landing");
  const [demoMode, setDemoMode] = useState<boolean>(() => localStorage.getItem("cp_demomode") !== "false");
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [resumeAnalyses, setResumeAnalyses] = useState<ResumeAnalysisResult[]>([]);
  const [jobMatches, setJobMatches] = useState<JobMatchResult[]>([]);
  const [interviewSessions, setInterviewSessions] = useState<InterviewSession[]>([]);
  const [placementReadiness, setPlacementReadiness] = useState<PlacementReadinessResult | null>(null);

  // Settings / Profile Edit Modal
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedRole, setEditedRole] = useState("");
  const [editedLevel, setEditedLevel] = useState("");
  const [editedYears, setEditedYears] = useState(1);
  const [editedProjects, setEditedProjects] = useState(3);
  const [editedSkills, setEditedSkills] = useState("");

  // Load from local storage
  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem("cp_profile");
      if (storedProfile) {
        const parsed = JSON.parse(storedProfile);
        setProfile(parsed);
        // Pre-populate settings inputs
        setEditedName(parsed.fullName);
        setEditedRole(parsed.targetRole);
        setEditedLevel(parsed.experienceLevel);
        setEditedYears(parsed.experienceYears);
        setEditedProjects(parsed.projectsCount);
        setEditedSkills(parsed.skills.join(", "));
      } else {
        setEditedName(DEFAULT_PROFILE.fullName);
        setEditedRole(DEFAULT_PROFILE.targetRole);
        setEditedLevel(DEFAULT_PROFILE.experienceLevel);
        setEditedYears(DEFAULT_PROFILE.experienceYears);
        setEditedProjects(DEFAULT_PROFILE.projectsCount);
        setEditedSkills(DEFAULT_PROFILE.skills.join(", "));
      }

      const storedResumes = localStorage.getItem("cp_resumes");
      if (storedResumes) setResumeAnalyses(JSON.parse(storedResumes));

      const storedMatches = localStorage.getItem("cp_matches");
      if (storedMatches) setJobMatches(JSON.parse(storedMatches));

      const storedSessions = localStorage.getItem("cp_sessions");
      if (storedSessions) setInterviewSessions(JSON.parse(storedSessions));

      const storedReadiness = localStorage.getItem("cp_readiness");
      if (storedReadiness) setPlacementReadiness(JSON.parse(storedReadiness));
    } catch (err) {
      console.error("Local storage restoration failed:", err);
    }
  }, []);

  // Save changes helper
  const saveProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem("cp_profile", JSON.stringify(newProfile));
  };

  const handleUpdateProfileResume = (resumeText: string, targetRole: string) => {
    const updated = { ...profile, resumeText, targetRole };
    saveProfile(updated);
    setEditedRole(targetRole);
  };

  const handleSaveAnalysis = async (newAnalysis: ResumeAnalysisResult, extractedProfile?: any) => {
    const updatedResumes = [newAnalysis, ...resumeAnalyses];
    setResumeAnalyses(updatedResumes);
    localStorage.setItem("cp_resumes", JSON.stringify(updatedResumes));

    // Dynamically update profile from extracted metadata
    const updatedProfile: UserProfile = {
      ...profile,
      fullName: extractedProfile?.fullName || newAnalysis.name || profile.fullName,
      targetRole: extractedProfile?.targetRole || newAnalysis.targetRole || profile.targetRole,
      experienceLevel: extractedProfile?.experienceLevel || newAnalysis.experienceLevel || profile.experienceLevel,
      skills: extractedProfile?.skills || newAnalysis.skills || profile.skills,
      resumeText: extractedProfile?.resumeText || profile.resumeText
    };
    saveProfile(updatedProfile);

    // Sync input fields
    setEditedName(updatedProfile.fullName);
    setEditedRole(updatedProfile.targetRole);
    setEditedLevel(updatedProfile.experienceLevel);
    setEditedSkills(updatedProfile.skills.join(", "));

    // Auto-recalculate readiness in the background
    await autoRecalculateReadiness(updatedProfile, newAnalysis.score);
  };

  const autoRecalculateReadiness = async (currentProfile: UserProfile, rScore: number) => {
    if (demoMode) {
      const simulatedReadiness: PlacementReadinessResult = {
        id: "ready-demo-" + Date.now(),
        timestamp: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        targetRole: currentProfile.targetRole || "Software Developer",
        readinessScore: Math.round((rScore + 78) / 2),
        technicalRating: rScore,
        softSkillsRating: 75,
        portfolioRating: 80,
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
      setPlacementReadiness(simulatedReadiness);
      localStorage.setItem("cp_readiness", JSON.stringify(simulatedReadiness));
      return;
    }

    try {
      const response = await fetch("/api/placement-readiness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills: currentProfile.skills,
          experienceYears: currentProfile.experienceYears,
          projectsCount: currentProfile.projectsCount,
          targetRole: currentProfile.targetRole,
          resumeScore: rScore
        }),
      });
      if (response.ok) {
        const data = await response.json();
        const newReadiness: PlacementReadinessResult = {
          id: "ready-" + Date.now(),
          timestamp: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          targetRole: currentProfile.targetRole || "Software Developer",
          ...data
        };
        setPlacementReadiness(newReadiness);
        localStorage.setItem("cp_readiness", JSON.stringify(newReadiness));
      }
    } catch (err) {
      console.error("Auto recalculation failed:", err);
    }
  };

  const handleSaveJobMatch = (newMatch: JobMatchResult) => {
    const updated = [newMatch, ...jobMatches];
    setJobMatches(updated);
    localStorage.setItem("cp_matches", JSON.stringify(updated));
  };

  const handleSaveSession = (newSession: InterviewSession) => {
    const updated = [newSession, ...interviewSessions];
    setInterviewSessions(updated);
    localStorage.setItem("cp_sessions", JSON.stringify(updated));
  };

  const handleSaveReadiness = (newReadiness: PlacementReadinessResult) => {
    setPlacementReadiness(newReadiness);
    localStorage.setItem("cp_readiness", JSON.stringify(newReadiness));
  };

  const handleApplySettings = () => {
    const skillList = editedSkills
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    const updated: UserProfile = {
      ...profile,
      fullName: editedName,
      targetRole: editedRole,
      experienceLevel: editedLevel,
      experienceYears: Number(editedYears) || 0,
      projectsCount: Number(editedProjects) || 0,
      skills: skillList
    };

    saveProfile(updated);
    setIsSettingsOpen(false);
  };

  // Render proper subpage content
  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard
            userProfile={profile}
            resumeAnalyses={resumeAnalyses}
            jobMatches={jobMatches}
            interviewSessions={interviewSessions}
            placementReadiness={placementReadiness}
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            demoMode={demoMode}
          />
        );
      case "resume":
        return (
          <ResumeAnalyzer
            onSaveAnalysis={handleSaveAnalysis}
            savedAnalyses={resumeAnalyses}
            initialResumeText={profile.resumeText}
            initialTargetRole={profile.targetRole}
            onUpdateProfileResume={handleUpdateProfileResume}
            demoMode={demoMode}
          />
        );
      case "job-match":
        return (
          <JobMatchAnalyzer
            initialResumeText={profile.resumeText}
            onSaveJobMatch={handleSaveJobMatch}
            savedJobMatches={jobMatches}
            demoMode={demoMode}
          />
        );
      case "interview":
        return (
          <InterviewSimulator
            userProfile={profile}
            onSaveSession={handleSaveSession}
            savedSessions={interviewSessions}
            demoMode={demoMode}
          />
        );
      case "readiness":
        return (
          <PlacementReadiness
            userProfile={profile}
            resumeAnalyses={resumeAnalyses}
            savedJobMatches={jobMatches}
            interviewSessions={interviewSessions}
            onSaveReadiness={handleSaveReadiness}
            savedReadiness={placementReadiness}
            demoMode={demoMode}
          />
        );
      case "achievements":
        return (
          <Achievements
            resumeAnalyses={resumeAnalyses}
            jobMatches={jobMatches}
            interviewSessions={interviewSessions}
            placementReadiness={placementReadiness}
          />
        );
      default:
        return null;
    }
  };

  // If tab is landing, render pure full landing
  if (activeTab === "landing") {
    return <LandingPage onStart={() => setActiveTab("dashboard")} />;
  }

  return (
    <div className="min-h-screen bg-[#07030e] text-[#f3f1f6] flex relative overflow-hidden">
      {/* Decorative Blur Backdrops */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] bg-pink-600/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Sidebar Navigation (Matching exact Design style) */}
      <aside className="w-64 bg-white/5 backdrop-blur-2xl border-r border-white/10 flex flex-col justify-between shrink-0 hidden md:flex z-20">
        <div>
          {/* Logo brand */}
          <div className="p-8 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-white">CareerPilot AI</span>
          </div>

          {/* Navigation Links */}
          <nav className="px-4 space-y-2">
            <button
              id="nav-btn-dashboard"
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-white/10 text-white font-semibold"
                  : "text-purple-200/50 hover:bg-white/5 hover:text-purple-200"
              }`}
            >
              <TrendingUp className="w-4.5 h-4.5 shrink-0" />
              <span>Dashboard</span>
            </button>

            <button
              id="nav-btn-resume"
              onClick={() => setActiveTab("resume")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                activeTab === "resume"
                  ? "bg-white/10 text-white font-semibold"
                  : "text-purple-200/50 hover:bg-white/5 hover:text-purple-200"
              }`}
            >
              <FileText className="w-4.5 h-4.5 shrink-0" />
              <span>Resume Analyzer</span>
            </button>

            <button
              id="nav-btn-job-match"
              onClick={() => setActiveTab("job-match")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                activeTab === "job-match"
                  ? "bg-white/10 text-white font-semibold"
                  : "text-purple-200/50 hover:bg-white/5 hover:text-purple-200"
              }`}
            >
              <Briefcase className="w-4.5 h-4.5 shrink-0" />
              <span>Job Matcher</span>
            </button>

            <button
              id="nav-btn-interview"
              onClick={() => setActiveTab("interview")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                activeTab === "interview"
                  ? "bg-white/10 text-white font-semibold"
                  : "text-purple-200/50 hover:bg-white/5 hover:text-purple-200"
              }`}
            >
              <Terminal className="w-4.5 h-4.5 shrink-0" />
              <span>Interview Sim</span>
            </button>

            <button
              id="nav-btn-readiness"
              onClick={() => setActiveTab("readiness")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                activeTab === "readiness"
                  ? "bg-white/10 text-white font-semibold"
                  : "text-purple-200/50 hover:bg-white/5 hover:text-purple-200"
              }`}
            >
              <TrendingUp className="w-4.5 h-4.5 shrink-0" />
              <span>Readiness Index</span>
            </button>

            <button
              id="nav-btn-achievements"
              onClick={() => setActiveTab("achievements")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                activeTab === "achievements"
                  ? "bg-white/10 text-white font-semibold"
                  : "text-purple-200/50 hover:bg-white/5 hover:text-purple-200"
              }`}
            >
              <Award className="w-4.5 h-4.5 shrink-0" />
              <span>Badges</span>
            </button>
          </nav>
        </div>

        {/* Footer Info of Sidebar */}
        <div className="p-6">
          <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 p-4 rounded-2xl border border-white/10">
            <p className="text-[10px] text-purple-300 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gemini AI Engine</span>
            </p>
            <p className="text-[11px] text-slate-400">
              Personalized roadmap updated in real time.
            </p>
          </div>
          <button 
            id="btn-sidebar-logout"
            onClick={() => setActiveTab("landing")}
            className="w-full flex items-center gap-2 mt-4 text-xs text-purple-200/40 hover:text-purple-200 transition-colors py-1 px-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Return to Landing</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header Bar */}
        <header className="h-20 flex items-center justify-between px-6 sm:px-10 border-b border-white/5 relative z-10">
          <div className="flex items-center space-x-3">
            {/* Mobile menu trigger */}
            <button
              id="btn-mobile-nav-toggle"
              className="md:hidden p-2 text-purple-200"
              onClick={() => {
                // simple cycle tabs on mobile or open overlays
              }}
            >
              <Menu className="w-5 h-5" />
            </button>

            <h1 className="text-xl sm:text-2xl font-bold font-display text-white capitalize">
              {activeTab === "job-match" ? "Job Match Analyzer" : activeTab === "readiness" ? "Placement Readiness" : `${activeTab}`}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Demo Mode Toggle capsules */}
            <div className="flex items-center bg-white/5 border border-white/10 p-1.5 rounded-2xl">
              <button
                id="btn-toggle-live-mode"
                onClick={() => {
                  setDemoMode(false);
                  localStorage.setItem("cp_demomode", "false");
                }}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer ${
                  !demoMode
                    ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                    : "text-purple-200/40 hover:text-purple-200"
                }`}
              >
                Live AI
              </button>
              <button
                id="btn-toggle-demo-mode"
                onClick={() => {
                  setDemoMode(true);
                  localStorage.setItem("cp_demomode", "true");
                }}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer ${
                  demoMode
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                    : "text-purple-200/40 hover:text-purple-200"
                }`}
              >
                Demo Mode
              </button>
            </div>

            <button
              id="btn-header-settings"
              onClick={() => setIsSettingsOpen(true)}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-purple-200 cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Profile badge header */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">{profile.fullName || "Future Developer"}</p>
                <p className="text-[11px] text-slate-400 font-mono">{profile.targetRole}</p>
              </div>
              <div 
                onClick={() => setIsSettingsOpen(true)}
                className="w-10 h-10 rounded-full border-2 border-purple-500 p-0.5 cursor-pointer hover:scale-105 transition-transform"
              >
                <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center text-xs font-bold uppercase text-violet-300">
                  {profile.fullName ? profile.fullName.substring(0, 2) : "FD"}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex overflow-x-auto gap-2 px-6 py-2 bg-white/5 border-b border-white/5 text-xs">
          <button onClick={() => setActiveTab("dashboard")} className={`px-3 py-1.5 rounded-lg shrink-0 ${activeTab === "dashboard" ? "bg-purple-600 text-white" : "text-purple-200/60"}`}>Dashboard</button>
          <button onClick={() => setActiveTab("resume")} className={`px-3 py-1.5 rounded-lg shrink-0 ${activeTab === "resume" ? "bg-purple-600 text-white" : "text-purple-200/60"}`}>Resume</button>
          <button onClick={() => setActiveTab("job-match")} className={`px-3 py-1.5 rounded-lg shrink-0 ${activeTab === "job-match" ? "bg-purple-600 text-white" : "text-purple-200/60"}`}>Job Matcher</button>
          <button onClick={() => setActiveTab("interview")} className={`px-3 py-1.5 rounded-lg shrink-0 ${activeTab === "interview" ? "bg-purple-600 text-white" : "text-purple-200/60"}`}>Interview</button>
          <button onClick={() => setActiveTab("readiness")} className={`px-3 py-1.5 rounded-lg shrink-0 ${activeTab === "readiness" ? "bg-purple-600 text-white" : "text-purple-200/60"}`}>Readiness</button>
          <button onClick={() => setActiveTab("achievements")} className={`px-3 py-1.5 rounded-lg shrink-0 ${activeTab === "achievements" ? "bg-purple-600 text-white" : "text-purple-200/60"}`}>Badges</button>
        </div>

        {/* Dynamic subpage content area */}
        <main className="flex-1 p-6 sm:p-10 overflow-y-auto max-w-7xl w-full mx-auto relative z-10">
          {renderTabContent()}
        </main>
      </div>

      {/* Settings / Profile Drawer Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-[#07030ee6]/90 backdrop-blur-md z-50 flex justify-end">
          <div className="w-full max-w-lg bg-[#0e0720] border-l border-white/10 p-8 flex flex-col justify-between overflow-y-auto shadow-2xl h-full">
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <h3 className="font-display font-bold text-lg text-white flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-violet-400" />
                  <span>Configure Professional Profile</span>
                </h3>
                <button
                  id="btn-close-settings"
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-1 rounded-lg bg-white/5 text-purple-200 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="input-settings-name" className="block text-xs font-semibold text-purple-200/70 mb-2">Full Name</label>
                  <input
                    id="input-settings-name"
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="w-full bg-violet-950/20 border border-violet-500/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500 transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="input-settings-role" className="block text-xs font-semibold text-purple-200/70 mb-2">Target Job Title</label>
                  <input
                    id="input-settings-role"
                    type="text"
                    value={editedRole}
                    onChange={(e) => setEditedRole(e.target.value)}
                    className="w-full bg-violet-950/20 border border-violet-500/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500 transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="select-settings-level" className="block text-xs font-semibold text-purple-200/70 mb-2">Target Experience Tier</label>
                  <select
                    id="select-settings-level"
                    value={editedLevel}
                    onChange={(e) => setEditedLevel(e.target.value)}
                    className="w-full bg-[#110926] border border-violet-500/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                  >
                    <option value="Junior / Entry">Junior / Entry</option>
                    <option value="Mid-Level">Mid-Level</option>
                    <option value="Senior / Principal">Senior / Principal</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="input-settings-years" className="block text-xs font-semibold text-purple-200/70 mb-2">Years of Experience</label>
                    <input
                      id="input-settings-years"
                      type="number"
                      min={0}
                      value={editedYears}
                      onChange={(e) => setEditedYears(Number(e.target.value))}
                      className="w-full bg-violet-950/20 border border-violet-500/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="input-settings-projects" className="block text-xs font-semibold text-purple-200/70 mb-2 font-sans">Projects Completed</label>
                    <input
                      id="input-settings-projects"
                      type="number"
                      min={0}
                      value={editedProjects}
                      onChange={(e) => setEditedProjects(Number(e.target.value))}
                      className="w-full bg-violet-950/20 border border-violet-500/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="textarea-settings-skills" className="block text-xs font-semibold text-purple-200/70 mb-2">Core Skills (Comma separated)</label>
                  <textarea
                    id="textarea-settings-skills"
                    value={editedSkills}
                    onChange={(e) => setEditedSkills(e.target.value)}
                    rows={4}
                    className="w-full bg-violet-950/20 border border-violet-500/20 rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                    placeholder="React, TypeScript, SQL..."
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 space-y-3">
              <button
                id="btn-apply-settings"
                onClick={handleApplySettings}
                className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer"
              >
                Apply & Save Changes
              </button>
              <button
                id="btn-cancel-settings"
                onClick={() => setIsSettingsOpen(false)}
                className="w-full py-3 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
