import express, { Request, Response } from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Lazily initialize Gemini client to prevent startup crashes if GEMINI_API_KEY is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured. Please add it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper middleware for API key checking
const checkApiKey = (req: Request, res: Response, next: any) => {
  try {
    getGeminiClient();
    next();
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Gemini API key is missing." });
  }
};

// 1. Resume Analyzer Endpoint
app.post("/api/analyze-resume", checkApiKey, async (req: Request, res: Response) => {
  try {
    const { resumeText, pdfBase64, targetRole } = req.body;
    if (!resumeText && !pdfBase64) {
      return res.status(400).json({ error: "Either resume text or PDF content is required for analysis." });
    }

    const ai = getGeminiClient();
    
    // Build content payload
    const contents: any[] = [];
    if (pdfBase64) {
      contents.push({
        inlineData: {
          mimeType: "application/pdf",
          data: pdfBase64
        }
      });
    }

    const rolePrompt = targetRole ? `target role: "${targetRole}"` : "suitable job role";
    const prompt = `Analyze the provided resume for the ${rolePrompt}.
    Please evaluate the candidate's name, target role (matching their credentials), target experience level (must be exactly one of "Junior / Entry", "Mid-Level", or "Senior / Principal"), calculate an ATS compatibility score (0 to 100), identify detected technical skills, find missing keywords for their target role, highlight structural strengths/weaknesses, actionable suggestions, and write a summary.
    
    ${resumeText ? `Resume Text Content:\n"""\n${resumeText}\n"""` : ""}`;
    
    contents.push(prompt);

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: "You are an expert ATS (Applicant Tracking System) parser and technical recruiter with 15+ years of experience helping candidates optimize their resumes.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["name", "targetRole", "experienceLevel", "score", "skills", "missingKeywords", "structuralFeedback", "suggestions", "summary"],
          properties: {
            name: {
              type: Type.STRING,
              description: "The candidate's full name detected. Default to 'Future Developer' if not found or blank.",
            },
            targetRole: {
              type: Type.STRING,
              description: "Target job title matching their primary skillset (e.g., Full Stack Engineer, Frontend Developer, Product Manager).",
            },
            experienceLevel: {
              type: Type.STRING,
              description: "Detected seniority level. Must be exactly one of 'Junior / Entry', 'Mid-Level', or 'Senior / Principal'.",
            },
            score: {
              type: Type.INTEGER,
              description: "ATS compatibility score out of 100",
            },
            skills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of top 6-12 technical and professional skills detected",
            },
            missingKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Important industry-standard keywords missing from the resume for this role",
            },
            structuralFeedback: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Feedback regarding spacing, sections, formatting, or bullet points quality",
            },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Actionable, direct bullet points to rewrite or improve the resume",
            },
            summary: {
              type: Type.STRING,
              description: "A brief, professional assessment summary (2-3 sentences)",
            },
          },
        },
      },
    });

    const data = JSON.parse(response.text?.trim() || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Resume analysis error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze resume." });
  }
});

// 2. Job Match Analyzer Endpoint
app.post("/api/match-job", checkApiKey, async (req: Request, res: Response) => {
  try {
    const { resumeText, jobDescription } = req.body;
    if (!resumeText || !jobDescription) {
      return res.status(400).json({ error: "Both resume content and job description are required." });
    }

    const ai = getGeminiClient();
    const prompt = `Perform a deep comparative analysis between the user's resume and the job description provided below. Assess skills alignment, experience levels, tone suitability, and output a detailed match report including a percentage match rate (0 to 100).

Resume:
"""
${resumeText}
"""

Job Description:
"""
${jobDescription}
"""`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an advanced talent matching system and career coach. Be objective, realistic, and highly helpful.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["matchRate", "skillsAlignment", "experienceMatch", "toneSuitability", "keyGaps", "recommendations"],
          properties: {
            matchRate: {
              type: Type.INTEGER,
              description: "Overall suitability match percentage from 0 to 100",
            },
            skillsAlignment: {
              type: Type.STRING,
              description: "Detailed overview of how well hard/soft skills align between the resume and the job",
            },
            experienceMatch: {
              type: Type.STRING,
              description: "Comparison of years/level of experience required vs what is shown on the resume",
            },
            toneSuitability: {
              type: Type.STRING,
              description: "Assessment of resume tone (e.g., highly technical, action-oriented, too passive)",
            },
            keyGaps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Crucial requirements or skills from the job description that are missing on the resume",
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Actionable advice on how the candidate can customize their resume for this exact job description",
            },
          },
        },
      },
    });

    const data = JSON.parse(response.text?.trim() || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Job match analyzer error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze job match." });
  }
});

// 3. Interview Questions Generation Endpoint
app.post("/api/interview-generate", checkApiKey, async (req: Request, res: Response) => {
  try {
    const { role, experienceLevel, questionsCount } = req.body;
    const count = parseInt(questionsCount) || 5;

    const ai = getGeminiClient();
    const prompt = `Generate ${count} realistic, challenging interview questions for the role: "${role || "Software Engineer"}" at an experience level of "${experienceLevel || "Mid-Level"}". 
    Include a mixture of technical (coding/design/architecture/concept) and behavioral/situational questions. Give tailored tips for each on what the interviewer is looking for.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a professional technical interviewer who has conducted thousands of loops at tier-1 tech companies (FAANG/MAMAA).",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["questions"],
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["id", "question", "type", "difficulty", "tips"],
                properties: {
                  id: { type: Type.STRING, description: "Unique short identifier (e.g., q1, q2)" },
                  question: { type: Type.STRING, description: "The full question text" },
                  type: { type: Type.STRING, enum: ["technical", "behavioral"], description: "The nature of the question" },
                  difficulty: { type: Type.STRING, enum: ["easy", "medium", "hard"], description: "The difficulty rating" },
                  tips: { type: Type.STRING, description: "Key concepts or points the candidate should touch upon when answering" },
                },
              },
            },
          },
        },
      },
    });

    const data = JSON.parse(response.text?.trim() || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Interview questions generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate interview questions." });
  }
});

// 4. Interview Answer Evaluator Endpoint
app.post("/api/interview-evaluate", checkApiKey, async (req: Request, res: Response) => {
  try {
    const { question, userAnswer, role } = req.body;
    if (!question || !userAnswer) {
      return res.status(400).json({ error: "Both question and user answer are required." });
    }

    const ai = getGeminiClient();
    const prompt = `Evaluate this user answer for a mock interview question.
Role: "${role || "Software Engineer"}"
Question: "${question}"
User's Answer:
"${userAnswer}"

Grade the answer objectively out of 100, provide qualitative feedback, highlights of their strengths, key weaknesses/omitted details, and a high-quality model sample answer they could study.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a constructive, critical, yet encouraging mock interview evaluator.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["score", "feedback", "strengths", "weaknesses", "sampleAnswer"],
          properties: {
            score: { type: Type.INTEGER, description: "Score out of 100" },
            feedback: { type: Type.STRING, description: "Detailed critical and constructive evaluation of the candidate's answer" },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific good points or structuring they used" },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Missing content, logical gaps, or poor delivery elements" },
            sampleAnswer: { type: Type.STRING, description: "A robust, excellent exemplary answer representing top 1% standard" },
          },
        },
      },
    });

    const data = JSON.parse(response.text?.trim() || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Interview answer evaluation error:", error);
    res.status(500).json({ error: error.message || "Failed to evaluate answer." });
  }
});

// 5. Placement Readiness Evaluation Endpoint
app.post("/api/placement-readiness", checkApiKey, async (req: Request, res: Response) => {
  try {
    const { skills, experienceYears, projectsCount, targetRole, resumeScore } = req.body;

    const skillsList = Array.isArray(skills) ? skills.join(", ") : (skills || "Not specified");
    const ai = getGeminiClient();
    const prompt = `Assess the placement readiness for a candidate with the following credentials wanting to land a "${targetRole || "Software Developer"}" role.

Details:
- Core Skills: ${skillsList}
- Years of Experience: ${experienceYears || "0"}
- Number of Projects: ${projectsCount || "0"}
- Recent Resume ATS Score: ${resumeScore || "Not analyzed yet"}

Calculate a realistic placement readiness score (0-100), give technical, soft skills, and portfolio ratings out of 100, identify critical skill gaps with priorities and action steps, lay down a custom learning path, and draft a high-impact immediate action plan.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a professional placement director and career counselor at a premier educational/training institution.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["readinessScore", "technicalRating", "softSkillsRating", "portfolioRating", "skillGaps", "learningPath", "actionPlan"],
          properties: {
            readinessScore: { type: Type.INTEGER, description: "Overall percent readiness to land top jobs in target role" },
            technicalRating: { type: Type.INTEGER, description: "Technical capability assessment rating (0-100)" },
            softSkillsRating: { type: Type.INTEGER, description: "Communication, teamwork, leadership rating (0-100)" },
            portfolioRating: { type: Type.INTEGER, description: "Rating of personal portfolio and public credentials (0-100)" },
            skillGaps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["skill", "priority", "action"],
                properties: {
                  skill: { type: Type.STRING, description: "The missing skill/technology/concept" },
                  priority: { type: Type.STRING, enum: ["high", "medium", "low"], description: "The priority of acquiring this" },
                  action: { type: Type.STRING, description: "Direct concrete task to learn/practice it" },
                },
              },
            },
            learningPath: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["step", "resource", "timeframe"],
                properties: {
                  step: { type: Type.STRING, description: "Topic to study/action" },
                  resource: { type: Type.STRING, description: "High-quality tutorial/site/course/project style suggestion" },
                  timeframe: { type: Type.STRING, description: "E.g., Week 1, Month 1, etc." },
                },
              },
            },
            actionPlan: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Immediate step-by-step 3-4 items to execute right away",
            },
          },
        },
      },
    });

    const data = JSON.parse(response.text?.trim() || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Placement readiness error:", error);
    res.status(500).json({ error: error.message || "Failed to calculate placement readiness." });
  }
});

// 6. AI Career Mentor Chat Endpoint
app.post("/api/career-mentor", checkApiKey, async (req: Request, res: Response) => {
  try {
    const { messages, profile, scores } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const ai = getGeminiClient();

    // Prepare context
    const profileText = profile ? `
Candidate Profile:
- Full Name: ${profile.fullName || "Future Developer"}
- Target Role: ${profile.targetRole || "Software Developer"}
- Skills: ${Array.isArray(profile.skills) ? profile.skills.join(", ") : "None specified"}
- Experience Level: ${profile.experienceLevel || "Junior / Entry"}
- Experience Years: ${profile.experienceYears || 0}
- Projects Completed: ${profile.projectsCount || 0}
` : "No profile set up yet.";

    const scoresText = scores ? `
Current Progress Metrics:
- Resume ATS Score: ${scores.resumeScore ? scores.resumeScore + "%" : "Not analyzed"}
- Job Description Match Rate: ${scores.jobMatchScore ? scores.jobMatchScore + "%" : "Not matched"}
- Interview Score: ${scores.interviewScore ? scores.interviewScore + "%" : "Not completed"}
- Cumulative Placement Readiness Index: ${scores.readinessScore ? scores.readinessScore + "%" : "Not appraised"}
` : "No score metrics logged yet.";

    // Chat history conversion
    const chatContents = messages.map((m: any) => {
      return {
        role: m.sender === "user" ? "user" : "model",
        parts: [{ text: m.text }]
      };
    });

    const systemInstruction = `You are "CareerPilot Mentor", an elite executive career coach and technical recruitment director.
    Use the candidate's profile and progress metrics below to answer their queries, suggest interview answers, rewrite bullet points, recommend learning pathways, or guide them.
    Be extremely practical, encouraging, and specific. Offer high-impact suggestions using industry terminology (STAR framework, resume action verbs, system design).
    
    Candidate Context:
    ${profileText}
    ${scoresText}`;

    // Get the latest message
    const lastMessage = chatContents.pop();
    if (!lastMessage) {
      return res.status(400).json({ error: "No messages in conversation." });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      // Re-add prior history
      contents: [...chatContents, lastMessage],
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text || "I am processing your career goals. How can I help you take the next step?" });
  } catch (error: any) {
    console.error("Career mentor error:", error);
    res.status(500).json({ error: error.message || "Failed to generate mentor response." });
  }
});

// 7. Daily Mission Generator Endpoint
app.post("/api/daily-mission", checkApiKey, async (req: Request, res: Response) => {
  try {
    const { profile, scores } = req.body;
    const ai = getGeminiClient();

    const targetRole = profile?.targetRole || "Software Developer";
    const skills = Array.isArray(profile?.skills) ? profile.skills.join(", ") : "React, TypeScript";

    const prompt = `Generate a single challenging, highly relevant, actionable Daily Mission (a learning challenge or a career prep task) for a candidate preparing for a "${targetRole}" role.
    Take into account their core skills: ${skills}.
    Ensure the mission targets high impact, such as optimizing a resume section, practicing a specific technical concept, designing an API, or tackling a behavioral story.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a career gamification engine and tech bootcamp director.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["task", "completionTime", "difficulty", "improvement"],
          properties: {
            task: { type: Type.STRING, description: "A detailed description of today's priority career task or technical drill" },
            completionTime: { type: Type.STRING, description: "Estimated completion time (e.g., '30 mins', '1 hour', '45 mins')" },
            difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"], description: "Challenge difficulty rating" },
            improvement: { type: Type.STRING, description: "Direct benefit or skill acquired by completing this mission" },
          },
        },
      },
    });

    const data = JSON.parse(response.text?.trim() || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Daily mission generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate daily mission." });
  }
});

// 8. Company Recommendation Engine Endpoint
app.post("/api/recommend-companies", checkApiKey, async (req: Request, res: Response) => {
  try {
    const { profile, scores } = req.body;
    const ai = getGeminiClient();

    const targetRole = profile?.targetRole || "Software Developer";
    const skills = Array.isArray(profile?.skills) ? profile.skills.join(", ") : "React, TypeScript, Tailwind, Node.js";

    const prompt = `Recommend exactly 3 real, suitable, reputable companies (spanning tech startups, mid-sized product companies, or FAANG) that fit a candidate with target role: "${targetRole}" and skills: "${skills}".
    Include custom compatibility percentage based on alignment, high-paying open positions they hire for, and a brief description of why they align.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a senior recruiting strategist who maps candidate skill matrices to real-world corporate hirers.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["recommendations"],
          properties: {
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["companyName", "logoColor", "compatibilityScore", "openRoles", "whySuitable", "skillsMatchPercent"],
                properties: {
                  companyName: { type: Type.STRING, description: "Name of the real company" },
                  logoColor: { type: Type.STRING, description: "A beautiful Tailwind-friendly background gradient class (e.g., 'from-blue-600 to-indigo-600' or 'from-orange-500 to-red-600')" },
                  compatibilityScore: { type: Type.INTEGER, description: "Percent compatibility index out of 100" },
                  openRoles: { type: Type.ARRAY, items: { type: Type.STRING }, description: "2-3 popular open roles matching this candidate at the firm" },
                  whySuitable: { type: Type.STRING, description: "A detailed 1-2 sentence alignment analysis explaining why they are an outstanding match" },
                  skillsMatchPercent: { type: Type.INTEGER, description: "Specific hard-skill overlap matching score (0-100)" },
                },
              },
            },
          },
        },
      },
    });

    const data = JSON.parse(response.text?.trim() || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Company recommendation error:", error);
    res.status(500).json({ error: error.message || "Failed to recommend companies." });
  }
});

// Configure Vite middleware for development or fallback to static build directory for production
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // SPA routing: send index.html for all non-API paths
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[CareerPilot AI] Server running at http://localhost:${PORT}`);
  });
}

setupServer();
