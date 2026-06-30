import React from "react";
import { motion } from "motion/react";
import { 
  Sparkles, 
  FileText, 
  Briefcase, 
  Terminal, 
  TrendingUp, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Users 
} from "lucide-react";

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div id="landing-container" className="min-h-screen bg-[#07030e] text-[#f3f1f6] relative overflow-hidden flex flex-col justify-between">
      {/* Ambient background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#581c87]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#7c3aed]/15 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] bg-[#d946ef]/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="max-w-7xl w-full mx-auto px-6 py-6 flex justify-between items-center z-10">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-tr from-violet-600 to-fuchsia-500 p-2.5 rounded-xl shadow-lg shadow-violet-900/30">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <span className="font-display font-bold text-xl tracking-wide bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            CareerPilot <span className="text-violet-400">AI</span>
          </span>
        </div>
        <button 
          id="btn-header-launch"
          onClick={onStart}
          className="glass-panel px-5 py-2 rounded-xl text-sm font-semibold text-violet-200 hover:text-white hover:border-violet-400/50 transition-all cursor-pointer flex items-center space-x-2"
        >
          <span>Launch Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl w-full mx-auto px-6 py-12 md:py-20 z-10 flex flex-col items-center justify-center text-center flex-grow">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-3xl flex flex-col items-center"
        >
          {/* Badge */}
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center space-x-2 bg-violet-950/50 border border-violet-500/30 rounded-full px-4 py-1.5 mb-8 backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-xs font-semibold tracking-wider text-violet-300 uppercase">
              Powered by Google Gemini 3.5 AI
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1 
            variants={itemVariants}
            className="font-display text-4xl sm:text-6xl font-bold tracking-tight mb-6 leading-[1.1] text-white"
          >
            Navigate Your Next <br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent glow-purple">
              Career Milestone
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            variants={itemVariants}
            className="text-base sm:text-lg text-purple-200/70 mb-10 max-w-2xl font-light leading-relaxed"
          >
            An elite, comprehensive SaaS platform designed to optimize your resume, cross-examine jobs, simulate tech/behavioral interviews, and map your ultimate path to hiring readiness.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center gap-4 mb-20"
          >
            <button
              id="btn-hero-cta"
              onClick={onStart}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-2xl shadow-xl shadow-purple-900/40 hover:shadow-purple-600/30 transition-all flex items-center justify-center space-x-3 group cursor-pointer"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              id="btn-hero-secondary"
              onClick={onStart}
              className="w-full sm:w-auto px-8 py-4 glass-panel border-purple-500/20 text-purple-200 hover:text-white hover:bg-violet-950/20 font-semibold rounded-2xl transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Explore Features</span>
            </button>
          </motion.div>
        </motion.div>

        {/* Feature Grid */}
        <div id="landing-features" className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
          {/* Feature 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="glass-panel glass-panel-hover p-6 rounded-3xl"
          >
            <div className="w-12 h-12 bg-violet-950/50 border border-violet-500/30 rounded-2xl flex items-center justify-center mb-5">
              <FileText className="w-6 h-6 text-violet-400" />
            </div>
            <h3 className="font-display font-bold text-lg text-white mb-2">Resume Analyzer</h3>
            <p className="text-sm text-purple-200/60 leading-relaxed">
              Deep-scan your resume against real recruiter standards. Obtain exact ATS scoring, feedback, and skill keywords.
            </p>
          </motion.div>

          {/* Feature 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="glass-panel glass-panel-hover p-6 rounded-3xl"
          >
            <div className="w-12 h-12 bg-violet-950/50 border border-violet-500/30 rounded-2xl flex items-center justify-center mb-5">
              <Briefcase className="w-6 h-6 text-violet-400" />
            </div>
            <h3 className="font-display font-bold text-lg text-white mb-2">Job Match Analyzer</h3>
            <p className="text-sm text-purple-200/60 leading-relaxed">
              Upload a job listing to audit gap compatibility. Identify missing keywords, requirements, and tone gaps.
            </p>
          </motion.div>

          {/* Feature 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="glass-panel glass-panel-hover p-6 rounded-3xl"
          >
            <div className="w-12 h-12 bg-violet-950/50 border border-violet-500/30 rounded-2xl flex items-center justify-center mb-5">
              <Terminal className="w-6 h-6 text-violet-400" />
            </div>
            <h3 className="font-display font-bold text-lg text-white mb-2">Interview Simulator</h3>
            <p className="text-sm text-purple-200/60 leading-relaxed">
              Experience dynamic, interactive technical and behavioral questions evaluated in real time with grading reports.
            </p>
          </motion.div>

          {/* Feature 4 */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="glass-panel glass-panel-hover p-6 rounded-3xl"
          >
            <div className="w-12 h-12 bg-violet-950/50 border border-violet-500/30 rounded-2xl flex items-center justify-center mb-5">
              <TrendingUp className="w-6 h-6 text-violet-400" />
            </div>
            <h3 className="font-display font-bold text-lg text-white mb-2">Readiness Index</h3>
            <p className="text-sm text-purple-200/60 leading-relaxed">
              Measure cumulative job readiness, study structured learning paths, and execute high-priority roadmap milestones.
            </p>
          </motion.div>
        </div>

        {/* Stats strip */}
        <div className="w-full max-w-5xl mt-16 pt-8 border-t border-purple-950/50 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          <div>
            <div className="font-display font-bold text-3xl text-white">88%</div>
            <div className="text-xs text-purple-200/40 uppercase tracking-widest mt-1">Average ATS Boost</div>
          </div>
          <div>
            <div className="font-display font-bold text-3xl text-white">10k+</div>
            <div className="text-xs text-purple-200/40 uppercase tracking-widest mt-1">Interviews Simmed</div>
          </div>
          <div>
            <div className="font-display font-bold text-3xl text-white">2.5x</div>
            <div className="text-xs text-purple-200/40 uppercase tracking-widest mt-1">Hiring Speedup</div>
          </div>
          <div>
            <div className="font-display font-bold text-3xl text-white">100%</div>
            <div className="text-xs text-purple-200/40 uppercase tracking-widest mt-1">Secure & Local Storage</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl w-full mx-auto px-6 py-8 border-t border-purple-950/30 text-center text-xs text-purple-200/40 z-10 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>© 2026 CareerPilot AI. Built with state-of-the-art server-side Gemini intelligence.</div>
        <div className="flex space-x-6">
          <span className="hover:text-purple-200 transition-colors">Privacy Policy</span>
          <span className="hover:text-purple-200 transition-colors">Terms of Service</span>
          <span className="hover:text-purple-200 transition-colors">Security Sandbox</span>
        </div>
      </footer>
    </div>
  );
}
