export interface ResumeAnalysisResult {
  id: string;
  timestamp: string;
  targetRole: string;
  score: number;
  skills: string[];
  missingKeywords: string[];
  structuralFeedback: string[];
  suggestions: string[];
  summary: string;
}

export interface JobMatchResult {
  id: string;
  timestamp: string;
  jobTitle: string;
  matchRate: number;
  skillsAlignment: string;
  experienceMatch: string;
  toneSuitability: string;
  keyGaps: string[];
  recommendations: string[];
}

export interface InterviewQuestion {
  id: string;
  question: string;
  type: "technical" | "behavioral";
  difficulty: "easy" | "medium" | "hard";
  tips: string;
}

export interface InterviewSession {
  id: string;
  timestamp: string;
  role: string;
  experienceLevel: string;
  questions: InterviewQuestion[];
  answers: { [questionId: string]: string };
  evaluations: {
    [questionId: string]: {
      score: number;
      feedback: string;
      strengths: string[];
      weaknesses: string[];
      sampleAnswer: string;
    };
  };
  overallScore?: number;
  completed: boolean;
}

export interface PlacementReadinessResult {
  id: string;
  timestamp: string;
  targetRole: string;
  readinessScore: number;
  technicalRating: number;
  softSkillsRating: number;
  portfolioRating: number;
  skillGaps: {
    skill: string;
    priority: "high" | "medium" | "low";
    action: string;
  }[];
  learningPath: {
    step: string;
    resource: string;
    timeframe: string;
  }[];
  actionPlan: string[];
}

export interface UserProfile {
  fullName: string;
  targetRole: string;
  experienceLevel: string;
  experienceYears: number;
  projectsCount: number;
  skills: string[];
  resumeText: string;
}

export interface MentorMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

export interface DailyMission {
  id: string;
  task: string;
  completionTime: string;
  difficulty: "Easy" | "Medium" | "Hard";
  improvement: string;
  completed: boolean;
}

export interface CompanyRecommendation {
  companyName: string;
  logoColor: string;
  compatibilityScore: number;
  openRoles: string[];
  whySuitable: string;
  skillsMatchPercent: number;
}

export interface SkillRoadmapStep {
  week: number;
  milestone: string;
  skills: string[];
  resources: string[];
  completed: boolean;
}

export interface AISmartNotification {
  id: string;
  type: "warning" | "success" | "info" | "tip";
  title: string;
  message: string;
  actionLabel?: string;
  actionTab?: string;
}
