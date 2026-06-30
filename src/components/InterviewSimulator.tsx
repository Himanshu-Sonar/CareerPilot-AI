import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Terminal, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Award, 
  Cpu, 
  MessageSquare,
  RefreshCw,
  Compass,
  FileText
} from "lucide-react";
import { InterviewQuestion, InterviewSession, UserProfile } from "../types";

interface InterviewSimulatorProps {
  userProfile: UserProfile;
  onSaveSession: (session: InterviewSession) => void;
  savedSessions: InterviewSession[];
  demoMode: boolean;
}

export default function InterviewSimulator({
  userProfile,
  onSaveSession,
  savedSessions,
  demoMode
}: InterviewSimulatorProps) {
  const [role, setRole] = useState(userProfile.targetRole || "Software Engineer");
  const [experienceLevel, setExperienceLevel] = useState(userProfile.experienceLevel || "Mid-Level");
  const [questionsCount, setQuestionsCount] = useState(5);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Active session states
  const [activeSession, setActiveSession] = useState<InterviewSession | null>(
    savedSessions.length > 0 ? savedSessions[0] : null
  );
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  
  // Single question evaluation states
  const [evaluatingAnswer, setEvaluatingAnswer] = useState(false);
  const [evalError, setEvalError] = useState<string | null>(null);

  // Initialize and generate questions
  const handleStartSession = async () => {
    setLoading(true);
    setError(null);

    if (demoMode) {
      setTimeout(() => {
        const simulatedQuestions = [
          { id: "q1", question: `Explain the core architectural approach you would take to optimize a high-traffic web application built for the role of ${role}.`, type: "technical", difficulty: "medium", tips: "Discuss lazy loading, virtual DOM optimizations, asset bundling, and state persistence." },
          { id: "q2", question: "Describe a complex technical bug or system bottleneck you resolved. What metrics proved the fix succeeded?", type: "technical", difficulty: "hard", tips: "Use STAR framework. Detail debugging methodology, Profiler analysis, and before/after latency measurements." },
          { id: "q3", question: "How do you align with product managers when business requirements demand speed but the codebase needs technical debt remediation?", type: "behavioral", difficulty: "medium", tips: "Emphasize negotiation, incremental refactoring, tracking technical debt tickets, and transparent risk assessments." },
          { id: "q4", question: "Explain how React concurrent features and automated state batching enhance performance under high-frequency updates.", type: "technical", difficulty: "hard", tips: "Discuss useTransition, micro-tasks scheduling, and fiber priority tree calculations." },
          { id: "q5", question: "Tell me about a time you had to deliver critical code on an extremely tight deadline with incomplete design mocks.", type: "behavioral", difficulty: "easy", tips: "Explain your process of prioritizing key user pathways, building robust wireframes, and managing project milestones." }
        ];

        const newSession: InterviewSession = {
          id: "session-demo-" + Date.now(),
          timestamp: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          role,
          experienceLevel,
          questions: simulatedQuestions.slice(0, questionsCount),
          answers: {},
          evaluations: {},
          completed: false
        };

        setActiveSession(newSession);
        setCurrentQuestionIdx(0);
        setCurrentAnswer("");
        setLoading(false);
      }, 1500);
      return;
    }

    try {
      const response = await fetch("/api/interview-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, experienceLevel, questionsCount }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to generate interview questions.");
      }

      const data = await response.json();
      
      const newSession: InterviewSession = {
        id: "session-" + Date.now(),
        timestamp: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        role,
        experienceLevel,
        questions: data.questions || [],
        answers: {},
        evaluations: {},
        completed: false
      };

      setActiveSession(newSession);
      setCurrentQuestionIdx(0);
      setCurrentAnswer("");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred generating questions.");
    } finally {
      setLoading(false);
    }
  };

  // Evaluate the current answer using server API
  const handleEvaluateAnswer = async () => {
    if (!activeSession) return;
    const currentQuestion = activeSession.questions[currentQuestionIdx];
    if (!currentAnswer.trim()) {
      setEvalError("Please type or provide your answer before moving forward.");
      return;
    }

    setEvaluatingAnswer(true);
    setEvalError(null);

    if (demoMode) {
      setTimeout(() => {
        const evalData = {
          score: Math.round(75 + Math.random() * 20),
          feedback: `The candidate provided a highly structured response to the question on: "${currentQuestion.question}". They touched upon practical architectural patterns and used strong action words.`,
          strengths: [
            "Strong application of professional engineering concepts.",
            "Utilized structured descriptions mapping directly to STAR conventions."
          ],
          weaknesses: [
            "Could elevate the quantitative impact metrics in the behavioral narrative.",
            "Slightly passive technical description near the summary."
          ],
          sampleAnswer: "An exemplary response should define precise state optimizations, code-splitting with React.lazy(), and explain concurrent tree rendering mechanics to maintain 60 FPS interfaces..."
        };

        const updatedAnswers = {
          ...activeSession.answers,
          [currentQuestion.id]: currentAnswer
        };

        const updatedEvaluations = {
          ...activeSession.evaluations,
          [currentQuestion.id]: evalData
        };

        const updatedSession = {
          ...activeSession,
          answers: updatedAnswers,
          evaluations: updatedEvaluations
        };

        setActiveSession(updatedSession);

        if (currentQuestionIdx < activeSession.questions.length - 1) {
          setCurrentQuestionIdx(prev => prev + 1);
          setCurrentAnswer(updatedSession.answers[activeSession.questions[currentQuestionIdx + 1]?.id] || "");
        } else {
          const totalEvaluations = Object.values(updatedEvaluations);
          let totalScore = 0;
          totalEvaluations.forEach((ev: any) => {
            totalScore += ev?.score || 0;
          });
          const overallScore = totalEvaluations.length > 0 ? Math.round(totalScore / totalEvaluations.length) : 0;

          const finalizedSession: InterviewSession = {
            ...updatedSession,
            overallScore,
            completed: true
          };

          setActiveSession(finalizedSession);
          onSaveSession(finalizedSession);
        }
        setEvaluatingAnswer(false);
      }, 1200);
      return;
    }

    try {
      const response = await fetch("/api/interview-evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currentQuestion.question,
          userAnswer: currentAnswer,
          role: activeSession.role
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to evaluate answer.");
      }

      const evalData = await response.json();

      // Update active session locally
      const updatedAnswers = {
        ...activeSession.answers,
        [currentQuestion.id]: currentAnswer
      };

      const updatedEvaluations = {
        ...activeSession.evaluations,
        [currentQuestion.id]: evalData
      };

      const updatedSession = {
        ...activeSession,
        answers: updatedAnswers,
        evaluations: updatedEvaluations
      };

      setActiveSession(updatedSession);

      // Advance question or complete session
      if (currentQuestionIdx < activeSession.questions.length - 1) {
        setCurrentQuestionIdx(prev => prev + 1);
        // Load existing answer if any, or empty out
        setCurrentAnswer(updatedSession.answers[activeSession.questions[currentQuestionIdx + 1]?.id] || "");
      } else {
        // Calculate overall average score
        const totalEvaluations = Object.values(updatedEvaluations);
        let totalScore = 0;
        totalEvaluations.forEach((ev: any) => {
          totalScore += ev?.score || 0;
        });
        const overallScore = totalEvaluations.length > 0 ? Math.round(totalScore / totalEvaluations.length) : 0;

        const finalizedSession: InterviewSession = {
          ...updatedSession,
          overallScore,
          completed: true
        };

        setActiveSession(finalizedSession);
        onSaveSession(finalizedSession);
      }
    } catch (err: any) {
      setEvalError(err.message || "Error submitting answer evaluation.");
    } finally {
      setEvaluatingAnswer(false);
    }
  };

  // Navigating between questions (prev/next) for reviewing answers or editing
  const handlePrevQuestion = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(prev => prev - 1);
      setCurrentAnswer(activeSession?.answers[activeSession.questions[currentQuestionIdx - 1].id] || "");
      setEvalError(null);
    }
  };

  const handleSkipOrNextNoEval = () => {
    if (!activeSession) return;
    if (currentQuestionIdx < activeSession.questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setCurrentAnswer(activeSession.answers[activeSession.questions[currentQuestionIdx + 1]?.id] || "");
      setEvalError(null);
    }
  };

  const resetSession = () => {
    setActiveSession(null);
    setCurrentQuestionIdx(0);
    setCurrentAnswer("");
    setError(null);
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff?.toLowerCase()) {
      case "easy": return "bg-emerald-950/40 text-emerald-400 border-emerald-500/20";
      case "medium": return "bg-amber-950/40 text-amber-400 border-amber-500/20";
      case "hard": return "bg-rose-950/40 text-rose-400 border-rose-500/20";
      default: return "bg-white/5 text-purple-300 border-white/10";
    }
  };

  return (
    <div id="interview-simulator-root" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Settings / Controls Column (Col: 4) */}
      <div className="lg:col-span-4 space-y-6">
        <div className="glass-panel p-6 rounded-3xl glow-purple">
          <h2 className="font-display font-bold text-xl text-white flex items-center space-x-2 mb-4">
            <Terminal className="w-5 h-5 text-violet-400" />
            <span>Simulator Engine</span>
          </h2>

          <p className="text-xs text-purple-200/50 mb-6 leading-relaxed">
            Configure custom interview structures evaluated by real-time recruiting models mimicking top-tier hiring pipelines.
          </p>

          <div className="space-y-4">
            <div>
              <label htmlFor="input-sim-role" className="block text-xs font-semibold text-purple-200/70 mb-2">Target Interview Role</label>
              <input
                id="input-sim-role"
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g., Lead React Engineer"
                disabled={activeSession && !activeSession.completed}
                className="w-full bg-violet-950/20 border border-violet-500/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500 disabled:opacity-50 transition-all"
              />
            </div>

            <div>
              <label htmlFor="select-experience-level" className="block text-xs font-semibold text-purple-200/70 mb-2">Target Seniority Level</label>
              <select
                id="select-experience-level"
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                disabled={activeSession && !activeSession.completed}
                className="w-full bg-[#110926] border border-violet-500/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500 disabled:opacity-50 transition-all"
              >
                <option value="Junior / Entry">Junior / Intern</option>
                <option value="Mid-Level">Mid-Level Associate</option>
                <option value="Senior / Principal">Senior / Principal Lead</option>
              </select>
            </div>

            <div>
              <label htmlFor="select-questions-count" className="block text-xs font-semibold text-purple-200/70 mb-2">Number of Questions</label>
              <select
                id="select-questions-count"
                value={questionsCount}
                onChange={(e) => setQuestionsCount(parseInt(e.target.value))}
                disabled={activeSession && !activeSession.completed}
                className="w-full bg-[#110926] border border-violet-500/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500 disabled:opacity-50 transition-all"
              >
                <option value={3}>3 Questions Quick-Run</option>
                <option value={5}>5 Questions Standard-Loop</option>
                <option value={8}>8 Questions Deep-Dive</option>
              </select>
            </div>

            {error && (
              <div className="p-3 bg-red-950/30 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {!activeSession || activeSession.completed ? (
              <button
                id="btn-trigger-interview-sim"
                onClick={handleStartSession}
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-violet-950/50 hover:shadow-violet-600/20 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Generating Questions...</span>
                  </>
                ) : (
                  <>
                    <Cpu className="w-4 h-4" />
                    <span>Launch AI Mock Loop</span>
                  </>
                )}
              </button>
            ) : (
              <button
                id="btn-reset-session"
                onClick={resetSession}
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Abort & Restart Setup</span>
              </button>
            )}
          </div>
        </div>

        {/* Saved Session list history */}
        {savedSessions.length > 0 && (
          <div className="glass-panel p-5 rounded-3xl">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-purple-200/40 mb-3">
              Interview Records ({savedSessions.length})
            </h3>
            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-2">
              {savedSessions.map((item) => (
                <button
                  key={item.id}
                  id={`btn-session-history-${item.id}`}
                  onClick={() => {
                    setActiveSession(item);
                    setCurrentQuestionIdx(0);
                    setCurrentAnswer("");
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex items-center justify-between cursor-pointer ${
                    activeSession?.id === item.id 
                      ? "bg-violet-950/40 border-violet-500/40 text-white" 
                      : "bg-transparent border-transparent text-purple-200/50 hover:bg-violet-950/20 hover:text-purple-200"
                  }`}
                >
                  <div className="truncate pr-2">
                    <div className="font-semibold truncate">{item.role}</div>
                    <div className="text-[10px] text-purple-200/40">{item.timestamp}</div>
                  </div>
                  <div className={`font-mono font-bold px-2 py-0.5 rounded-md bg-violet-950/80 border border-violet-500/20 ${
                    item.overallScore && item.overallScore >= 80 ? "text-green-400" : item.overallScore && item.overallScore >= 60 ? "text-amber-400" : "text-rose-400"
                  }`}>
                    {item.overallScore || "—"}%
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Interactive Active Area Column (Col: 8) */}
      <div className="lg:col-span-8">
        <AnimatePresence mode="wait">
          {activeSession ? (
            !activeSession.completed ? (
              /* Active Simulator Screen */
              <motion.div
                key="active-session-sim"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                id="active-interview-simulator-screen"
                className="space-y-6"
              >
                {/* Progress bar info */}
                <div className="glass-panel p-4 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-white">Mock Interviewing:</span>
                    <span className="text-purple-300">{activeSession.role}</span>
                  </div>
                  <div className="font-mono text-purple-200/50">
                    Question {currentQuestionIdx + 1} of {activeSession.questions.length}
                  </div>
                </div>

                {/* Main dynamic question card */}
                <div className="glass-panel p-6 rounded-3xl border-violet-500/20 glow-purple relative overflow-hidden min-h-[300px] flex flex-col justify-between">
                  <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-violet-500/5 rounded-full blur-2xl pointer-events-none" />
                  
                  {/* Question header info */}
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-violet-950/80 border border-violet-500/30 text-violet-300">
                        {activeSession.questions[currentQuestionIdx]?.type || "technical"}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getDifficultyBadge(activeSession.questions[currentQuestionIdx]?.difficulty)}`}>
                        {activeSession.questions[currentQuestionIdx]?.difficulty || "medium"}
                      </span>
                    </div>

                    {/* Question text itself */}
                    <h3 className="font-display font-bold text-lg sm:text-xl text-white leading-relaxed">
                      "{activeSession.questions[currentQuestionIdx]?.question}"
                    </h3>
                  </div>

                  {/* Hints/tips foldout */}
                  <div className="mt-6 p-4 bg-violet-950/20 rounded-2xl border border-violet-500/10 text-xs text-purple-200/70 leading-relaxed">
                    <span className="font-semibold text-violet-400 block mb-1">Interviewer's Focus Point:</span>
                    {activeSession.questions[currentQuestionIdx]?.tips}
                  </div>
                </div>

                {/* Candidate Answer Box */}
                <div className="glass-panel p-6 rounded-3xl space-y-4">
                  <div className="flex justify-between items-center">
                    <label htmlFor="textarea-candidate-answer" className="text-xs font-semibold text-purple-200/70">Type Your Professional Answer</label>
                    <span className="text-[10px] text-purple-200/40">Aim for 2-4 comprehensive sentences</span>
                  </div>

                  <textarea
                    id="textarea-candidate-answer"
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Wield the STAR framework (Situation, Task, Action, Result) or list technical constraints clearly..."
                    rows={6}
                    className="w-full bg-violet-950/20 border border-violet-500/20 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500 font-sans resize-none"
                  />

                  {evalError && (
                    <div className="p-3 bg-red-950/30 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <span>{evalError}</span>
                    </div>
                  )}

                  {/* Navigation & Submit buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-between">
                    <button
                      id="btn-sim-prev-q"
                      onClick={handlePrevQuestion}
                      disabled={currentQuestionIdx === 0 || evaluatingAnswer}
                      className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold rounded-xl disabled:opacity-30 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Previous Question</span>
                    </button>

                    <div className="flex gap-3">
                      <button
                        id="btn-sim-skip-q"
                        onClick={handleSkipOrNextNoEval}
                        disabled={currentQuestionIdx === activeSession.questions.length - 1 || evaluatingAnswer}
                        className="px-4 py-3 bg-transparent border border-transparent hover:bg-white/5 text-purple-200/60 hover:text-purple-200 text-xs font-semibold rounded-xl disabled:opacity-30 transition-all cursor-pointer"
                      >
                        Skip
                      </button>

                      <button
                        id="btn-sim-submit-answer"
                        onClick={handleEvaluateAnswer}
                        disabled={evaluatingAnswer}
                        className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl disabled:opacity-50 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                      >
                        {evaluatingAnswer ? (
                          <>
                            <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span>Checking Response...</span>
                          </>
                        ) : (
                          <>
                            <span>{currentQuestionIdx === activeSession.questions.length - 1 ? "Finish & Grade Session" : "Analyze & Next"}</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* Completed Session Scorecard Screen */
              <motion.div
                key="completed-session-screen"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                id="completed-session-summary"
                className="space-y-6"
              >
                {/* Score highlight panel */}
                <div className="glass-panel p-8 rounded-3xl border-violet-500/20 glow-purple flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-[300px] h-full bg-gradient-to-l from-violet-600/10 via-fuchsia-600/5 to-transparent pointer-events-none" />
                  
                  <div className="space-y-3 text-center md:text-left">
                    <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-xs text-emerald-400 font-semibold">
                      <Award className="w-4 h-4" />
                      <span>Interview Loop Complete</span>
                    </div>
                    <h3 className="font-display font-bold text-2xl text-white">Gemini Performance Scorecard</h3>
                    <p className="text-xs text-purple-200/50">
                      Evaluated for the target role: <strong className="text-purple-200">{activeSession.role}</strong> ({activeSession.experienceLevel})
                    </p>
                  </div>

                  <div className="w-32 h-32 bg-violet-950/40 border border-violet-500/30 rounded-full flex flex-col items-center justify-center shrink-0 shadow-2xl">
                    <span className="font-display font-extrabold text-4xl text-violet-400">{activeSession.overallScore}%</span>
                    <span className="text-[10px] text-purple-200/40 uppercase tracking-widest mt-1">Average Score</span>
                  </div>
                </div>

                {/* Iterative breakdown of questions and qualitative evaluations */}
                <h4 className="font-display font-bold text-base text-white">Detailed Response Analysis</h4>
                
                <div className="space-y-4">
                  {activeSession.questions.map((q, idx) => {
                    const evaluation = activeSession.evaluations[q.id];
                    const givenAnswer = activeSession.answers[q.id];

                    return (
                      <div key={q.id} className="glass-panel p-6 rounded-3xl space-y-4 border-violet-500/10">
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase tracking-wider text-purple-200/40 block">Question {idx + 1} ({q.type})</span>
                            <h5 className="font-bold text-white text-sm">"{q.question}"</h5>
                          </div>
                          <span className={`font-mono text-xs font-bold px-2 py-1 rounded border shrink-0 ${
                            evaluation?.score >= 80 ? "text-green-400 border-green-500/20 bg-green-950/20" : evaluation?.score >= 60 ? "text-amber-400 border-amber-500/20 bg-amber-950/20" : "text-rose-400 border-rose-500/20 bg-rose-950/20"
                          }`}>
                            Score: {evaluation?.score || 0}/100
                          </span>
                        </div>

                        {givenAnswer && (
                          <div className="p-3 bg-violet-950/20 rounded-xl text-xs text-purple-200/80 border border-violet-500/5">
                            <strong className="text-violet-300 block mb-1">Your Answer:</strong>
                            "{givenAnswer}"
                          </div>
                        )}

                        {evaluation ? (
                          <div className="space-y-3 pt-2">
                            <div className="text-xs text-purple-200/70 leading-relaxed">
                              <strong className="text-violet-400 block mb-1">AI Critique:</strong>
                              {evaluation.feedback}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="p-3 bg-emerald-950/10 border border-emerald-500/10 rounded-xl space-y-1">
                                <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold block">Key Strengths</span>
                                <ul className="space-y-1 text-xs text-purple-200/80 list-disc list-inside">
                                  {evaluation.strengths && evaluation.strengths.map((str, i) => (
                                    <li key={i}>{str}</li>
                                  ))}
                                </ul>
                              </div>

                              <div className="p-3 bg-amber-950/10 border border-amber-500/10 rounded-xl space-y-1">
                                <span className="text-[10px] uppercase tracking-widest text-amber-400 font-bold block">Missing / Improvement Needs</span>
                                <ul className="space-y-1 text-xs text-purple-200/80 list-disc list-inside">
                                  {evaluation.weaknesses && evaluation.weaknesses.map((weak, i) => (
                                    <li key={i}>{weak}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            <div className="p-3.5 bg-violet-950/40 border border-violet-500/20 rounded-xl text-xs">
                              <span className="text-[10px] uppercase tracking-wider text-violet-300 font-semibold block mb-1.5">Model Sample Answer:</span>
                              <p className="text-purple-200/80 leading-relaxed italic">"{evaluation.sampleAnswer}"</p>
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-purple-200/40 italic">Not evaluated or skipped.</div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    id="btn-re-run-simulator"
                    onClick={resetSession}
                    className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-xs font-semibold rounded-xl shadow-lg transition-all cursor-pointer"
                  >
                    Start New Mock Loop
                  </button>
                </div>
              </motion.div>
            )
          ) : (
            /* Default Setup Welcome Screen */
            <motion.div
              key="default-setup-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center text-center p-12 glass-panel rounded-3xl min-h-[450px]"
            >
              <div className="w-16 h-16 bg-violet-950/40 border border-violet-500/20 rounded-2xl flex items-center justify-center mb-6">
                <Terminal className="w-8 h-8 text-violet-400/50" />
              </div>
              <h3 className="font-display font-bold text-lg text-white mb-2">No Active Mock Interview</h3>
              <p className="text-sm text-purple-200/40 max-w-sm mb-6 leading-relaxed">
                Choose your desired interview role, specify seniority level, and compile a tailored Gemini question set to test your verbal or coding skills.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
