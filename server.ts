import express from 'express';
import dotenv from 'dotenv';
import multer from 'multer';
import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import {
  cleanText,
  tokenizeAndFilter,
  extractSkills,
  extractExperienceYears,
  extractEducationLevel,
  calculateCosineSimilarity,
  calculateJaccardSimilarity,
  inspectDataCleaningPipeline
} from './src/utils/nlpEngine.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Multer memory storage for resume uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Server-side Gemini client
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

/**
 * Health check endpoint
 */
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString()
  });
});

/**
 * Upload & Parse Resume File (PDF, DOCX, TXT)
 */
app.post('/api/upload-resume', upload.single('resumeFile'), async (req, res) => {
  try {
    let extractedText = '';
    const filename = req.file?.originalname || 'Uploaded_Resume.txt';

    if (req.file) {
      const mime = req.file.mimetype;
      const buffer = req.file.buffer;

      if (mime.includes('pdf') || filename.toLowerCase().endsWith('.pdf')) {
        try {
          const parser = new PDFParse({ data: buffer });
          const textResult = await parser.getText();
          extractedText = textResult.text || '';
          await parser.destroy();
        } catch (pdfErr) {
          console.warn('PDFParse error, trying text extraction fallback:', pdfErr);
          extractedText = buffer.toString('utf-8');
        }
      } else if (
        mime.includes('word') ||
        mime.includes('officedocument') ||
        filename.toLowerCase().endsWith('.docx')
      ) {
        const mammothResult = await mammoth.extractRawText({ buffer });
        extractedText = mammothResult.value;
      } else {
        // Plain text / markdown / fallback
        extractedText = buffer.toString('utf-8');
      }
    } else if (req.body.text) {
      extractedText = req.body.text;
    } else {
      res.status(400).json({ error: 'No resume file or text provided' });
      return;
    }

    if (!extractedText.trim()) {
      res.status(400).json({ error: 'Could not extract text from document. Please ensure it is not an image-only scanned PDF.' });
      return;
    }

    // Extract basic information using NLP utilities
    const detectedSkills = extractSkills(extractedText);
    const expYears = extractExperienceYears(extractedText);
    const education = extractEducationLevel(extractedText);

    // Heuristics for candidate name and email
    const emailMatch = extractedText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    const email = emailMatch ? emailMatch[0] : 'candidate@email.com';

    const lines = extractedText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const candidateName = lines.length > 0 && lines[0].length < 40 && !lines[0].includes('@')
      ? lines[0]
      : filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

    const titleGuess = lines.length > 1 && lines[1].length < 60 && !lines[1].includes('@')
      ? lines[1]
      : 'Technical Candidate';

    res.json({
      success: true,
      candidate: {
        id: `cand-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: candidateName,
        currentTitle: titleGuess,
        email,
        phone: '+1 (555) 000-0000',
        location: 'Remote / Unspecified',
        experienceYears: expYears || 3,
        education,
        skills: detectedSkills,
        summary: extractedText.slice(0, 240) + '...',
        fullRawText: extractedText,
        status: 'new',
        uploadedAt: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('Error parsing resume:', error);
    res.status(500).json({ error: error.message || 'Failed to process resume document' });
  }
});

/**
 * Screen Candidate Resume against Job Description
 * Combines Classical NLP (TF-IDF Cosine & Jaccard) with Gemini 3.8 Flash Semantic Screening
 */
app.post('/api/screen-candidate', async (req, res) => {
  try {
    const { jobPosition, resume } = req.body;
    if (!jobPosition || !resume) {
      res.status(400).json({ error: 'Missing jobPosition or resume payload' });
      return;
    }

    // 1. Classical NLP Calculations
    const jdTokens = tokenizeAndFilter(jobPosition.description + ' ' + (jobPosition.requiredSkills || []).join(' ') + ' ' + (jobPosition.preferredSkills || []).join(' '));
    const resumeTokens = tokenizeAndFilter(resume.fullRawText || resume.summary + ' ' + (resume.skills || []).join(' '));

    const cosineResult = calculateCosineSimilarity(jdTokens, resumeTokens);
    const cosineScorePct = Math.round(cosineResult.score * 100);

    // Jaccard similarity on required + preferred skills vs candidate skills
    const jdSkills = [...(jobPosition.requiredSkills || []), ...(jobPosition.preferredSkills || [])];
    const candidateSkills = resume.skills && resume.skills.length > 0
      ? resume.skills
      : extractSkills(resume.fullRawText || '');

    const jaccardResult = calculateJaccardSimilarity(jdSkills, candidateSkills);
    const jaccardScorePct = Math.round(jaccardResult.score * 100);

    // Matched and Missing required skills
    const requiredSkills = (jobPosition.requiredSkills || []).map((s: string) => s.toLowerCase());
    const candSkillsLower = new Set(candidateSkills.map((s: string) => s.toLowerCase()));
    const matchedRequired = requiredSkills.filter((s: string) => candSkillsLower.has(s));
    const missingRequired = requiredSkills.filter((s: string) => !candSkillsLower.has(s));

    // Rule-based heuristic scores
    const reqSkillPct = requiredSkills.length > 0 ? (matchedRequired.length / requiredSkills.length) * 100 : 80;
    const expRatio = Math.min(1.2, (resume.experienceYears || 0) / Math.max(1, jobPosition.minExperienceYears || 1));
    const ruleExpScore = Math.min(100, Math.round(expRatio * 100));

    // Inspect data cleaning pipeline for explainability
    const cleaningInspection = inspectDataCleaningPipeline(resume.fullRawText || resume.summary);

    // 2. Gemini AI Deep Semantic Analysis (if API key available)
    let aiEvaluation = null;

    if (aiClient) {
      try {
        const prompt = `You are a Principal Talent Acquisition Evaluator and Senior Technical Hiring Manager.
Evaluate this candidate resume against the given Job Position.

=== JOB POSITION ===
Title: ${jobPosition.title}
Department: ${jobPosition.department || 'Engineering'}
Required Minimum Experience: ${jobPosition.minExperienceYears} years
Minimum Education: ${jobPosition.minEducation}
Required Skills: ${jobPosition.requiredSkills.join(', ')}
Preferred Skills: ${(jobPosition.preferredSkills || []).join(', ')}
Full Job Description:
${jobPosition.description}

=== CANDIDATE RESUME ===
Name: ${resume.name}
Current Title: ${resume.currentTitle}
Stated Experience: ${resume.experienceYears} years
Education: ${resume.education}
Detected Skills: ${candidateSkills.join(', ')}
Resume Text:
${(resume.fullRawText || resume.summary).slice(0, 4500)}

=== INSTRUCTIONS ===
1. Analyze semantic fit (BERT/transformer level understanding of domain depth, real projects, responsibilities).
2. Assess skill overlap for both required and preferred technologies.
3. Assess candidate seniority vs required experience.
4. Highlight concrete strengths, missing critical skills, and potential red flags.
5. Create 3 tailored, insightful technical/behavioral interview questions to test their specific gap areas and claimed achievements.

Return ONLY a valid JSON object matching this schema:
{
  "semanticScore": number (0 to 100),
  "skillsScore": number (0 to 100),
  "experienceScore": number (0 to 100),
  "educationScore": number (0 to 100),
  "strengths": ["string", "string", "string"],
  "gaps": ["string", "string"],
  "interviewQuestions": [
    {
      "question": "string",
      "category": "string (e.g. System Design, NLP Depth, Gap Validation, Behavioral)",
      "whyAsk": "string (rationale for why this question is crucial for this candidate)"
    }
  ],
  "summary": "string (2-3 concise sentences summarizing recruiter verdict)",
  "recommendation": "Strong Match" | "Good Match" | "Borderline / Review" | "Not a Match"
}`;

        const geminiRes = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        });

        const rawJson = geminiRes.text?.trim() || '{}';
        aiEvaluation = JSON.parse(rawJson);
      } catch (geminiError) {
        console.warn('Gemini AI screening failed or returned invalid JSON, using NLP fallback:', geminiError);
      }
    }

    // Default / fallback AI evaluation if not present
    if (!aiEvaluation || typeof aiEvaluation.semanticScore !== 'number') {
      const fallbackSemantic = Math.round(cosineScorePct * 0.65 + jaccardScorePct * 0.35);
      const fallbackSkills = Math.round(reqSkillPct * 0.7 + jaccardScorePct * 0.3);
      const isStrong = fallbackSkills >= 75 && ruleExpScore >= 80;
      const isGood = fallbackSkills >= 55 && ruleExpScore >= 60;

      aiEvaluation = {
        semanticScore: Math.min(98, Math.max(15, fallbackSemantic + 10)),
        skillsScore: Math.min(100, Math.round(fallbackSkills)),
        experienceScore: ruleExpScore,
        educationScore: resume.education?.toLowerCase().includes('master') || resume.education?.toLowerCase().includes('ph.d') ? 95 : 85,
        strengths: [
          `Demonstrated proficiency in ${matchedRequired.slice(0, 3).join(', ') || 'core technologies'}`,
          `${resume.experienceYears} years of practical industry background`,
          `High textual cosine similarity (${cosineScorePct}%) with job requirements`
        ],
        gaps: missingRequired.length > 0
          ? [`Missing explicit mention of required skills: ${missingRequired.slice(0, 3).join(', ')}`]
          : ['Check depth of production scaling and hands-on system architecture'],
        interviewQuestions: [
          {
            question: `Could you walk us through a challenging project where you utilized ${matchedRequired[0] || 'your core stack'} to solve a performance bottleneck?`,
            category: 'Technical Depth',
            whyAsk: 'Evaluates hands-on problem-solving and architectural depth'
          },
          {
            question: missingRequired[0]
              ? `The role relies heavily on ${missingRequired[0]}. What is your familiarity with this or related equivalents?`
              : 'How do you approach testing, CI/CD, and maintaining high reliability in production?',
            category: 'Gap Validation',
            whyAsk: 'Verifies proficiency in role requirements'
          }
        ],
        summary: `${resume.name} presents a ${isStrong ? 'strong' : isGood ? 'solid' : 'partial'} profile matching ${matchedRequired.length} of ${requiredSkills.length} required skills with ${resume.experienceYears} years of experience.`,
        recommendation: isStrong ? 'Strong Match' : isGood ? 'Good Match' : fallbackSkills >= 40 ? 'Borderline / Review' : 'Not a Match'
      };
    }

    // Calculate Final Composite ATS Score
    const weights = jobPosition.weights || { skills: 35, experience: 25, semanticNlp: 25, education: 15 };
    const nlpComposite = Math.round(cosineScorePct * 0.55 + jaccardScorePct * 0.45);
    const semanticBlended = Math.round(aiEvaluation.semanticScore * 0.6 + nlpComposite * 0.4);

    const overallScore = Math.round(
      (aiEvaluation.skillsScore * (weights.skills / 100)) +
      (aiEvaluation.experienceScore * (weights.experience / 100)) +
      (semanticBlended * (weights.semanticNlp / 100)) +
      (aiEvaluation.educationScore * (weights.education / 100))
    );

    res.json({
      success: true,
      candidateId: resume.id,
      overallScore: Math.min(99, Math.max(10, overallScore)),
      breakdown: {
        skillsScore: aiEvaluation.skillsScore,
        experienceScore: aiEvaluation.experienceScore,
        semanticScore: aiEvaluation.semanticScore,
        educationScore: aiEvaluation.educationScore,
        cosineSimilarityPct: cosineScorePct,
        jaccardSimilarityPct: jaccardScorePct,
        nlpComposite
      },
      nlpDetails: {
        cosine: cosineResult,
        jaccard: jaccardResult,
        matchedRequiredSkills: matchedRequired,
        missingRequiredSkills: missingRequired,
        cleaningInspection
      },
      aiEvaluation: {
        strengths: aiEvaluation.strengths,
        gaps: aiEvaluation.gaps,
        interviewQuestions: aiEvaluation.interviewQuestions,
        summary: aiEvaluation.summary,
        recommendation: aiEvaluation.recommendation
      }
    });
  } catch (error: any) {
    console.error('Error screening candidate:', error);
    res.status(500).json({ error: error.message || 'Screening calculation failed' });
  }
});

/**
 * Generate / Enrich Job Position via Gemini AI
 */
app.post('/api/generate-job', async (req, res) => {
  try {
    const { roleTitle, department, seniority } = req.body;
    if (!roleTitle) {
      res.status(400).json({ error: 'Role title is required' });
      return;
    }

    if (!aiClient) {
      // Fallback template
      res.json({
        success: true,
        job: {
          id: `job-${Date.now()}`,
          title: roleTitle,
          department: department || 'Engineering',
          level: seniority || 'Senior',
          minExperienceYears: 4,
          minEducation: 'Bachelor\'s Degree',
          requiredSkills: ['python', 'docker', 'system design', 'rest api', 'git'],
          preferredSkills: ['aws', 'kubernetes', 'ci/cd', 'unit testing'],
          description: `We are looking for a talented ${seniority || 'Senior'} ${roleTitle} to join our growing engineering organization.`,
          weights: { skills: 35, experience: 25, semanticNlp: 25, education: 15 }
        }
      });
      return;
    }

    const prompt = `You are a tech recruiter creating a comprehensive, industry-standard Job Description.
Role Title: ${roleTitle}
Department: ${department || 'Engineering'}
Seniority: ${seniority || 'Senior'}

Generate an ATS-optimized job specification. Return ONLY a valid JSON object matching:
{
  "title": "string",
  "department": "string",
  "level": "string",
  "minExperienceYears": number,
  "minEducation": "string (e.g. Bachelor's Degree, Master's Degree)",
  "requiredSkills": ["lowercase skill", "lowercase skill"],
  "preferredSkills": ["lowercase skill", "lowercase skill"],
  "description": "string (formatted with Key Responsibilities, Technical Requirements, and Impact)",
  "weights": {
    "skills": 35,
    "experience": 25,
    "semanticNlp": 25,
    "education": 15
  }
}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    parsed.id = `job-${Date.now()}`;

    res.json({ success: true, job: parsed });
  } catch (error: any) {
    console.error('Error generating job:', error);
    res.status(500).json({ error: error.message || 'Failed to generate job position' });
  }
});

/**
 * Tailor Deep Interview Questions for Candidate
 */
app.post('/api/tailor-questions', async (req, res) => {
  try {
    const { candidateName, jobTitle, candidateSummary, missingSkills, matchedSkills } = req.body;

    if (!aiClient) {
      res.json({
        success: true,
        questions: [
          {
            question: `How have you used ${matchedSkills?.[0] || 'your core skillset'} in designing high-availability systems?`,
            category: 'Core Competency',
            whyAsk: 'Validates architectural depth.'
          },
          {
            question: `How would you quickly adapt to using ${missingSkills?.[0] || 'tools outside your daily workflow'}?`,
            category: 'Adaptability & Growth',
            whyAsk: 'Assesses learning curve for team tooling.'
          }
        ]
      });
      return;
    }

    const prompt = `Generate 4 sharp, non-generic interview questions for candidate ${candidateName} applying for ${jobTitle}.
Target their verified strengths (${(matchedSkills || []).join(', ')}) and specifically test their identified skill gaps (${(missingSkills || []).join(', ')}).
Candidate summary: ${candidateSummary}

Return ONLY valid JSON:
{
  "questions": [
    {
      "question": "string",
      "category": "string",
      "whyAsk": "string"
    }
  ]
}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    res.json({ success: true, questions: parsed.questions || [] });
  } catch (error: any) {
    console.error('Error generating questions:', error);
    res.status(500).json({ error: error.message || 'Failed to generate tailored questions' });
  }
});

// Mount Vite in development
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Resume Screening server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
