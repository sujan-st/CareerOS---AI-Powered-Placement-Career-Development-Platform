import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API client safely
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
    console.log('Gemini API key is not set or set to placeholder. Operating in Simulated Intelligence mode.');
    return null;
  }
  try {
    return new GoogleGenerativeAI(apiKey);
  } catch (error) {
    console.error('Error initializing Gemini client:', error);
    return null;
  }
};

const genAI = getGeminiClient();

// Helper to interact with Gemini
const callGemini = async (prompt, systemInstruction = '') => {
  if (!genAI) return null;
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: systemInstruction,
    });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini Request Failed, falling back to simulator:', error);
    return null;
  }
};

// ==========================================
// FEATURE 1: AI Resume Analyzer
// ==========================================
export const analyzeResume = async (resumeText) => {
  const systemInstruction = 'You are an expert technical recruiter analyzing a resume.';
  const prompt = `Analyze this resume text and provide: 
  1. Resume Score (0-100)
  2. Formatting Quality Rating
  3. Keyword Density list
  4. Missing Skills
  5. Suggestions for improvement
  6. Weak Sections
  Please format the output as JSON with fields: resumeScore (number), formatting (string), keywordDensity (array of objects with word and count), missingSkills (array of strings), suggestions (array of strings), weakSections (array of strings).
  Resume Text: ${resumeText}`;

  const responseText = await callGemini(prompt, systemInstruction);
  if (responseText) {
    try {
      // Extract json from response
      const cleaned = responseText.replace(/```json|```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (e) {
      console.warn('Failed to parse Gemini response as JSON. Retrying fallback.');
    }
  }

  // Simulated Fallback
  return {
    resumeScore: 78,
    formatting: 'Good structure, could highlight achievements better with active verbs.',
    keywordDensity: [
      { keyword: 'React', count: 5 },
      { keyword: 'Node.js', count: 3 },
      { keyword: 'MongoDB', count: 2 },
    ],
    missingSkills: ['Docker', 'AWS', 'CI/CD Pipelines', 'TypeScript'],
    suggestions: [
      'Include quantifiable metrics in project experience (e.g., improved load speed by 20%)',
      'Add a dedicated skills summary section at the top',
      'Optimize layout margins and visual hierarchy',
    ],
    weakSections: ['Summary Statement', 'Professional Experience description density'],
  };
};

// ==========================================
// FEATURE 2: ATS Checker
// ==========================================
export const checkATSScore = async (resumeText, jobDescription) => {
  const prompt = `Compare this resume against the job description.
  Compute:
  1. Match Score Percentage (0-100)
  2. Matching Skills
  3. Missing Skills / Gaps
  4. Keyword Density Analysis
  5. Suggestions for improvement
  Format as JSON with keys: atsScore (number), matchingSkills (array), missingSkills (array), keywordDensity (array of objects), suggestions (array).
  Resume: ${resumeText}
  Job Description: ${jobDescription}`;

  const response = await callGemini(prompt);
  if (response) {
    try {
      const cleaned = response.replace(/```json|```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (e) {
      console.warn('Failed to parse ATS response as JSON');
    }
  }

  return {
    atsScore: 72,
    matchingSkills: ['Javascript', 'React.js', 'Redux Toolkit', 'Tailwind CSS', 'Node.js', 'Express.js', 'MongoDB'],
    missingSkills: ['TypeScript', 'GraphQL', 'Jest Unit Testing', 'Docker Containers'],
    keywordDensity: [
      { keyword: 'development', count: 6 },
      { keyword: 'frontend', count: 4 },
      { keyword: 'backend', count: 3 },
    ],
    suggestions: [
      'Add the keyword "TypeScript" if you have experience with it, as it is heavily featured in the description.',
      'Explicitly write out unit testing details in your project workflows.',
    ],
  };
};

// ==========================================
// FEATURE 3: AI Resume Builder Content
// ==========================================
export const generateResumeDraftContent = async (sectionType, data) => {
  const prompt = `Draft content for a resume ${sectionType} section. Input details: ${JSON.stringify(data)}. Generate professional summary or project descriptions that are ATS friendly. Return just the text content.`;
  const response = await callGemini(prompt);
  if (response) return response.trim();

  if (sectionType === 'summary') {
    return 'Results-driven Full Stack Engineer with expertise in building responsive client-facing web applications. Skilled in React, Node.js, and Express, with a strong focus on clean architecture, performance optimization, and scalable database schemas.';
  }
  return 'Designed and implemented an enterprise-grade dashboard, leveraging Redux Toolkit for state synchronization. Integrated third-party REST API endpoints, reducing page render times by 25% and improving student onboarding retention rates.';
};

// ==========================================
// FEATURE 4: AI Skill Gap Analyzer & Roadmap
// ==========================================
export const analyzeSkillGapAndRoadmap = async (dreamCompany, targetRole, currentSkills) => {
  const prompt = `Analyze skill gap for role: ${targetRole} at ${dreamCompany}. Current skills: ${currentSkills.join(', ')}.
  Provide:
  1. Gaps (Missing critical skills)
  2. Weekly roadmap tasks for a 4-week prep course.
  3. Estimated completion times.
  Format as JSON with keys: missingSkills (array), weeklyTasks (array of objects with weekNumber, topic, goals (array of strings)), completionPercentage (number).`;

  const response = await callGemini(prompt);
  if (response) {
    try {
      const cleaned = response.replace(/```json|```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (e) {
      console.warn('Roadmap JSON parsing failed.');
    }
  }

  return {
    missingSkills: ['System Design (LLD/HLD)', 'Redis Caching', 'Webpack/Vite Configs', 'CI/CD Pipelines'],
    weeklyTasks: [
      {
        weekNumber: 1,
        topic: 'Advanced Algorithms & System Design Basics',
        goals: ['Master dynamic programming patterns', 'Understand Load Balancing and Horizontal Scaling concepts'],
      },
      {
        weekNumber: 2,
        topic: 'Backend Performance Optimization',
        goals: ['Configure Redis caches for Mongo queries', 'Optimize complex aggregations and indexes'],
      },
      {
        weekNumber: 3,
        topic: 'Frontend Development Systems',
        goals: ['Build advanced custom Hooks in React', 'Optimize bundle splitting and image CDNs'],
      },
      {
        weekNumber: 4,
        topic: 'Docker, CI/CD, and Cloud Deployments',
        goals: ['Containerize application using Docker', 'Configure GitHub actions workflow to verify build'],
      },
    ],
    completionPercentage: 0,
  };
};

// ==========================================
// FEATURE 5: AI Daily Planner
// ==========================================
export const generateDailyPlannerTasks = async (skills, weaknesses, goals) => {
  const prompt = `Generate a daily planner checklist for a student with target career goals: "${goals}". Weak areas: ${weaknesses.join(', ')}. Skills: ${skills.join(', ')}.
  Provide:
  1. Today's coding goal
  2. Today's resume improvement task
  3. Today's revision topic
  4. Today's mock interview focus
  5. Today's job application count
  6. Daily motivation text
  7. Estimated completion time (minutes)
  Format as JSON with keys: codingGoal, resumeTask, revisionTopic, mockInterviewGoal, jobApplicationGoal, dailyMotivation, estimatedCompletionTimeMinutes.`;

  const response = await callGemini(prompt);
  if (response) {
    try {
      const cleaned = response.replace(/```json|```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (e) {
      console.warn('Planner JSON parsing failed.');
    }
  }

  return {
    codingGoal: 'Solve 2 LeetCode Medium questions on Dynamic Programming (e.g. Longest Common Subsequence).',
    resumeTask: 'Re-write the project descriptions for your e-commerce repository using active action verbs.',
    revisionTopic: 'Review database normalization forms and explain indexing structures.',
    mockInterviewGoal: 'Conduct a 30-minute mock coding round focusing on explanation clarity.',
    jobApplicationGoal: 'Apply to at least 3 software developer openings on LinkedIn or Zoho Careers.',
    dailyMotivation: 'Your consistency today builds the foundation of your career tomorrow. Keep coding!',
    estimatedCompletionTimeMinutes: 180,
  };
};

// ==========================================
// FEATURE 6: AI Placement Predictor
// ==========================================
export const predictPlacementProbability = async (skills, resumeScore, interviewCount, codingStreak) => {
  const companies = ['Google', 'Amazon', 'Microsoft', 'Zoho', 'Infosys', 'TCS'];
  const prompt = `Based on student profile: Skills (${skills.join(', ')}), Resume Score (${resumeScore}), Mock Interviews Done (${interviewCount}), Coding Streak (${codingStreak} days).
  Predict placement probability (0-100%) for each of these companies: ${companies.join(', ')}.
  Format output as JSON with fields: predictions (array of objects with company (string), probability (number), reason (string), recommendations (array of strings)).`;

  const response = await callGemini(prompt);
  if (response) {
    try {
      const cleaned = response.replace(/```json|```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (e) {
      console.warn('Predictor JSON parsing failed.');
    }
  }

  // Fallback
  return {
    predictions: [
      {
        company: 'Google',
        probability: 35,
        reason: 'Algorithms and System Design requirements are extremely rigorous. Candidate needs structured preparation in graph traversals and advanced data structures.',
        recommendations: ['Practice Hard DFS/BFS trees on Leetcode', 'Conduct System Design mock runs'],
      },
      {
        company: 'Amazon',
        probability: 45,
        reason: 'Strong JavaScript skills, but behavior leadership principles and complex systems design need active practice.',
        recommendations: ['Review Amazon Leadership principles', 'Practice array hash-map optimization problems'],
      },
      {
        company: 'Microsoft',
        probability: 40,
        reason: 'Solid coding background, but lacks experience in native systems development or low-level configurations.',
        recommendations: ['Learn memory allocations and operating system fundamentals', 'Review thread architectures'],
      },
      {
        company: 'Zoho',
        probability: 75,
        reason: 'Strong Full Stack capabilities align with Zoho product design teams. Core Java/JS foundation is sound.',
        recommendations: ['Practice Zoho past paper questions', 'Optimize simple JS component libraries from scratch'],
      },
      {
        company: 'Infosys',
        probability: 85,
        reason: 'Excellent academic profiles and core tech credentials meet and exceed entry parameters.',
        recommendations: ['Practice coding speed tests', 'Prepare logical puzzles and basic SQL structures'],
      },
      {
        company: 'TCS',
        probability: 90,
        reason: 'Resume parameters, certification lists, and coding records show excellent readiness for TCS Digital level roles.',
        recommendations: ['Review TCS NQT coding questions', 'Run basic verbal communication mock preps'],
      },
    ],
  };
};

// ==========================================
// FEATURE 7: AI Portfolio Analyzer
// ==========================================
export const analyzePortfolioUrl = async (portfolioUrl) => {
  const prompt = `Analyze the web portfolio URL: "${portfolioUrl}". Check design aesthetics, technical deployment metrics, SEO presence, accessibility, and resume alignment.
  Format as JSON with keys: uiuxScore (number), performanceScore (number), seoScore (number), accessibilityScore (number), resumeWorthinessScore (number), suggestions (array of strings), summary (string).`;

  const response = await callGemini(prompt);
  if (response) {
    try {
      const cleaned = response.replace(/```json|```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (e) {
      console.warn('Portfolio JSON parsing failed.');
    }
  }

  return {
    uiuxScore: 82,
    performanceScore: 88,
    seoScore: 75,
    accessibilityScore: 80,
    resumeWorthinessScore: 85,
    suggestions: [
      'Implement custom font combinations (e.g. Outfit and Inter) instead of system font defaults.',
      'Optimize image assets using modern WebP formats to decrease page initialization load times.',
      'Add semantic HTML header landmarks to pass automated accessibility audits.',
      'Add meta description and title attributes to improve SEO scores.',
    ],
    summary: 'The portfolio represents a modern, responsive single-page application with strong visual layouts. Key areas for improvement lie in search discoverability and file footprint optimizations.',
  };
};

// ==========================================
// FEATURE 8: AI LinkedIn Optimizer
// ==========================================
export const optimizeLinkedInProfile = async (resumeText) => {
  const prompt = `Create a high-impact LinkedIn optimization report based on this resume text.
  Generate:
  1. Professional Headline
  2. "About" summary section
  3. Job experience bullet highlights
  4. Core skills list
  5. Banner theme suggestions
  6. High-yield search keywords
  Format output as JSON with keys: headline, about, experienceHighlights (array), skills (array), bannerSuggestions (string), searchKeywords (array).
  Resume: ${resumeText}`;

  const response = await callGemini(prompt);
  if (response) {
    try {
      const cleaned = response.replace(/```json|```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (e) {
      console.warn('LinkedIn JSON parsing failed.');
    }
  }

  return {
    headline: 'Software Engineer | Full Stack Developer | React, Node.js, Express, MongoDB | Open to Opportunities',
    about: 'Passionate Full Stack Engineer focused on building responsive, secure, and user-centric web applications. Proven track record in structuring MVC express backends and creating responsive dashboards with Redux Toolkit and Tailwind CSS. Eager to solve challenging problems and contribute to scaling cloud application structures.',
    experienceHighlights: [
      'Spearheaded development of a student dashboard, deploying modular components and increasing client load speeds.',
      'Optimized backend API controllers, integrating custom middleware to enforce secure JWT role authorizations.',
    ],
    skills: ['React.js', 'Redux Toolkit', 'Node.js', 'Express.js', 'MongoDB', 'REST APIs', 'Tailwind CSS', 'Git & CI/CD'],
    bannerSuggestions: 'A professional dark tech-gradient banner showcasing logos of core tools like React, Node, MongoDB, and git, alongside a text tag: "Building Scalable Digital Applications".',
    searchKeywords: ['Web Developer', 'Full Stack Developer', 'React Engineer', 'JavaScript Developer', 'Node Express Developer'],
  };
};

// ==========================================
// FEATURE 9: AI Cover Letter Generator
// ==========================================
export const generateCoverLetterText = async (resumeText, jobDescription, company, role) => {
  const prompt = `Draft a compelling cover letter for the role: ${role} at ${company}. Use skills and projects from this resume to map to this job description.
  Resume: ${resumeText}
  Job Description: ${jobDescription}`;

  const response = await callGemini(prompt);
  if (response) return response.trim();

  return `Dear Hiring Team at ${company},\n\nI am writing to express my strong interest in the ${role} position. Having reviewed your job parameters, I am confident that my technical skills in full-stack JavaScript and clean architecture align perfectly with your team's goals.\n\nMy experience includes building responsive frontends and secure Express REST APIs. I look forward to the opportunity to contribute to ${company}.\n\nSincerely,\n[Student Name]`;
};

// ==========================================
// FEATURE 10: AI Email Writer
// ==========================================
export const generateEmailText = async (emailType, details) => {
  const prompt = `Write a professional email for a student seeking: "${emailType}". Detail context: ${JSON.stringify(details)}. Keep it short, professional, and clear.`;
  const response = await callGemini(prompt);
  if (response) return response.trim();

  if (emailType === 'Referral Request') {
    return `Subject: Referral Request: Software Engineer Role\n\nHi ${details.recipientName || 'Name'},\n\nI hope you are doing well. I am a software engineer focused on full-stack MERN development. I recently noticed an open role for a Software Developer at your company and believe my skill set matches the requirements. Would you be open to providing a referral for me?\n\nThank you,\n[Student Name]`;
  }
  return `Subject: Thank You - Interview for ${details.roleName || 'Software Developer'}\n\nHi ${details.interviewerName || 'Team'},\n\nThank you for taking the time to speak with me today regarding the ${details.roleName || 'Software Developer'} position. I enjoyed learning more about your engineering systems and look forward to the next steps.\n\nBest regards,\n[Student Name]`;
};

// ==========================================
// FEATURE 11: AI Project Reviewer
// ==========================================
export const reviewGithubProject = async (githubUrl, repoStructure = '') => {
  const prompt = `Review this GitHub project: "${githubUrl}". Structure: ${repoStructure}.
  Evaluate:
  1. Folder Structure (standard vs messy)
  2. Code Readability
  3. Architecture and Best Practices
  4. Documentation Quality
  5. Resume Worthiness Score (0-100)
  Format as JSON with keys: folderStructureFeedback (string), readabilityFeedback (string), architectureFeedback (string), documentationFeedback (string), score (number), suggestions (array of strings).`;

  const response = await callGemini(prompt);
  if (response) {
    try {
      const cleaned = response.replace(/```json|```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (e) {
      console.warn('Project JSON parsing failed.');
    }
  }

  return {
    folderStructureFeedback: 'Standard modular structure with distinct folders separating routes, models, and controllers. Adheres to MVC.',
    readabilityFeedback: 'Functions are clean and named appropriately. ESLint and formatting standards are well represented.',
    architectureFeedback: 'Separation of concerns is maintained, database operations are secure, and errors are handled in middleware.',
    documentationFeedback: 'README.md is detailed but could list setup commands and environment variables explicitly.',
    score: 84,
    suggestions: [
      'Document configuration keys inside a dedicated `.env.example` file.',
      'Refactor repetitive utility routes into a single shared helper file.',
      'Add unit testing blocks (e.g. Jest files) to increase code coverage metrics.',
    ],
  };
};

// ==========================================
// FEATURE 12: AI Virtual Interview Question Generator & Answer Evaluator
// ==========================================
export const getNextInterviewQuestion = async (company, role, type, difficulty, history = []) => {
  const prompt = `Generate the next mock interview question for target company "${company}", role "${role}", type "${type}", difficulty level "${difficulty}".
  Prior question history: ${JSON.stringify(history)}. 
  Keep the question clear and realistic. Return ONLY the question string, nothing else.`;

  const response = await callGemini(prompt);
  if (response) return response.trim();

  // Fallbacks
  if (type === 'Technical') {
    return 'How do database indexes speed up lookups, and what are the trade-offs of adding too many indexes on a write-heavy collection?';
  } else if (type === 'Coding') {
    return 'Given an array of integers, write a function that finds the longest contiguous subarray with a sum equal to target.';
  } else if (type === 'System Design') {
    return 'Design a URL shortener service like Bit.ly, focusing on high availability, database scaling, and URL redirection flow.';
  } else if (type === 'HR' || type === 'Behavioral') {
    return 'Describe a time you faced a difficult conflict within a engineering team project, and how you went about resolving it.';
  }
  return 'Can you describe your experience working with MVC Node Express configurations, and explain how you handle secure JWT logins?';
};

export const evaluateInterviewAnswer = async (question, answer) => {
  const prompt = `Evaluate the candidate response to the question.
  Question: "${question}"
  Response: "${answer}"
  Generate:
  1. Content Quality Score (0-100)
  2. Grammatical feedback and vocal pauses comments
  3. Dynamic Context-Aware Follow-up Question based on their response.
  Format as JSON with keys: score (number), feedback (string), followUpQuestion (string).`;

  const response = await callGemini(prompt);
  if (response) {
    try {
      const cleaned = response.replace(/```json|```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (e) {
      console.warn('Answer evaluation parsing failed.');
    }
  }

  return {
    score: 75,
    feedback: 'Answer was conceptually correct and addressed core indexing principles, but could improve by explaining indexing storage structures like B-Trees.',
    followUpQuestion: 'That makes sense. Can you explain the difference between a clustered and non-clustered index, and how Mongoose default _id index fits into this?',
  };
};

export const generateFinalInterviewReport = async (questionsList) => {
  const prompt = `Based on this interview dialogue log: ${JSON.stringify(questionsList)}.
  Evaluate performance across communication, technical competency, confidence, and problem solving.
  Format as JSON with keys:
  1. scorecard: { communication (number 0-100), technical (number), confidence (number), problemSolving (number), overall (number) }
  2. strengths (array of strings)
  3. weaknesses (array of strings)
  4. likelyResult (string: Selected, Rejected, Borderline)
  5. improvementPlan (array of strings)
  6. detailedFeedback (string)`;

  const response = await callGemini(prompt);
  if (response) {
    try {
      const cleaned = response.replace(/```json|```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (e) {
      console.warn('Final interview scorecard parsing failed.');
    }
  }

  return {
    scorecard: {
      communication: 76,
      technical: 80,
      confidence: 72,
      problemSolving: 78,
      overall: 77,
    },
    strengths: [
      'Strong conceptual knowledge of NodeJS, Express architectures, and Mongo queries.',
      'Clear coding methodology, with logical structured layouts.',
    ],
    weaknesses: [
      'Frequent vocal pauses ("um", "like") during System Design discussions.',
      'Struggles with memory complexity optimizations.',
    ],
    likelyResult: 'Borderline',
    improvementPlan: [
      'Engage in speech exercise runs to lower use of filler keywords.',
      'Implement multiple indexing solutions in hobby projects and measure performance improvements.',
    ],
    detailedFeedback: 'The candidate demonstrated solid software engineering basics. To succeed in top tier interviews, the candidate needs to practice behavioral storytelling techniques and work on pacing their speed of explanation.',
  };
};
