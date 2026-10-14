import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  DEFAULT_JOB_POSITIONS, 
  DEFAULT_CANDIDATE_RESUMES, 
  JobPosition, 
  CandidateResume 
} from './data/defaultData.ts';
import { ScreeningResult, ActiveTab } from './types/index.ts';
import { 
  tokenizeAndFilter, 
  calculateCosineSimilarity, 
  calculateJaccardSimilarity, 
  extractSkills,
  inspectDataCleaningPipeline
} from './utils/nlpEngine.ts';
import { CandidateCard } from './components/CandidateCard.tsx';
import { CandidateModal } from './components/CandidateModal.tsx';
import { ResumeUploadModal } from './components/ResumeUploadModal.tsx';
import { JobEditorModal } from './components/JobEditorModal.tsx';
import { NlpMethodologyLab } from './components/NlpMethodologyLab.tsx';
import { CandidateCompareModal } from './components/CandidateCompareModal.tsx';
import { 
  Briefcase, 
  Upload, 
  Plus, 
  Search, 
  SlidersHorizontal, 
  Download, 
  Sparkles, 
  RefreshCw, 
  Scale, 
  BookOpen, 
  CheckCircle2, 
  BarChart3, 
  Layers, 
  Zap,
  Users,
  Award,
  ChevronDown,
  Loader2,
  FileSpreadsheet
} from 'lucide-react';

export default function App() {
  // Core State
  const [jobs, setJobs] = useState<JobPosition[]>(DEFAULT_JOB_POSITIONS);
  const [selectedJobId, setSelectedJobId] = useState<string>(DEFAULT_JOB_POSITIONS[0].id);
  const [candidates, setCandidates] = useState<CandidateResume[]>(DEFAULT_CANDIDATE_RESUMES);
  const [screeningResults, setScreeningResults] = useState<Record<string, ScreeningResult>>({});
  
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<ActiveTab>('leaderboard');
  const [inspectCandidateId, setInspectCandidateId] = useState<string | null>(null);
  const [comparedIds, setComparedIds] = useState<string[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPosition | null>(null);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'shortlisted' | 'interview' | 'new' | 'reserve' | 'rejected'>('all');
  const [sortBy, setSortBy] = useState<'score' | 'cosine' | 'jaccard' | 'experience'>('score');
  
  // Loading & Progress
  const [isScreening, setIsScreening] = useState(false);
  const [screeningProgress, setScreeningProgress] = useState<{ current: number; total: number } | null>(null);

  // Active Job helper
  const activeJob = useMemo(() => {
    return jobs.find(j => j.id === selectedJobId) || jobs[0];
  }, [jobs, selectedJobId]);

  /**
   * Fast Client-Side Screening Fallback / Immediate State
   * Ensures instant calculation while Gemini AI analyzes in parallel
   */
  const computeLocalScreening = useCallback((job: JobPosition, cand: CandidateResume): ScreeningResult => {
    const jdTokens = tokenizeAndFilter(job.description + ' ' + job.requiredSkills.join(' ') + ' ' + (job.preferredSkills || []).join(' '));
    const resumeTokens = tokenizeAndFilter(cand.fullRawText || cand.summary + ' ' + cand.skills.join(' '));

    const cosineResult = calculateCosineSimilarity(jdTokens, resumeTokens);
    const cosineScorePct = Math.round(cosineResult.score * 100);

    const jdSkills = [...job.requiredSkills, ...(job.preferredSkills || [])];
    const candSkills = cand.skills.length > 0 ? cand.skills : extractSkills(cand.fullRawText || '');
    const jaccardResult = calculateJaccardSimilarity(jdSkills, candSkills);
    const jaccardScorePct = Math.round(jaccardResult.score * 100);

    const requiredSkills = job.requiredSkills.map(s => s.toLowerCase());
    const candSkillsLower = new Set(candSkills.map(s => s.toLowerCase()));
    const matchedRequired = requiredSkills.filter(s => candSkillsLower.has(s));
    const missingRequired = requiredSkills.filter(s => !candSkillsLower.has(s));

    const reqSkillPct = requiredSkills.length > 0 ? (matchedRequired.length / requiredSkills.length) * 100 : 70;
    const expRatio = Math.min(1.2, (cand.experienceYears || 0) / Math.max(1, job.minExperienceYears || 1));
    const ruleExpScore = Math.min(100, Math.round(expRatio * 100));

    const skillsScore = Math.round(reqSkillPct * 0.75 + jaccardScorePct * 0.25);
    const semanticScore = Math.min(98, Math.max(15, Math.round(cosineScorePct * 0.7 + jaccardScorePct * 0.3) + 8));
    const educationScore = cand.education.toLowerCase().includes('master') || cand.education.toLowerCase().includes('ph.d') ? 95 : 85;

    const weights = job.weights || { skills: 35, experience: 25, semanticNlp: 25, education: 15 };
    const nlpComposite = Math.round(cosineScorePct * 0.55 + jaccardScorePct * 0.45);
    const semanticBlended = Math.round(semanticScore * 0.6 + nlpComposite * 0.4);

    const overallScore = Math.round(
      (skillsScore * (weights.skills / 100)) +
      (ruleExpScore * (weights.experience / 100)) +
      (semanticBlended * (weights.semanticNlp / 100)) +
      (educationScore * (weights.education / 100))
    );

    const isStrong = skillsScore >= 75 && ruleExpScore >= 80;
    const isGood = skillsScore >= 55 && ruleExpScore >= 60;

    return {
      candidateId: cand.id,
      overallScore: Math.min(99, Math.max(10, overallScore)),
      breakdown: {
        skillsScore,
        experienceScore: ruleExpScore,
        semanticScore,
        educationScore,
        cosineSimilarityPct: cosineScorePct,
        jaccardSimilarityPct: jaccardScorePct,
        nlpComposite
      },
      nlpDetails: {
        cosine: cosineResult,
        jaccard: jaccardResult,
        matchedRequiredSkills: matchedRequired,
        missingRequiredSkills: missingRequired,
        cleaningInspection: inspectDataCleaningPipeline(cand.fullRawText || cand.summary)
      },
      aiEvaluation: {
        strengths: [
          `Proficient in ${matchedRequired.slice(0, 3).join(', ') || 'required tools'}`,
          `${cand.experienceYears} years engineering experience`,
          `High TF-IDF Cosine match (${cosineScorePct}%) against JD terminology`
        ],
        gaps: missingRequired.length > 0
          ? [`No verified mention of required tools: ${missingRequired.slice(0, 3).join(', ')}`]
          : ['Verify scale of production architectures'],
        interviewQuestions: [
          {
            question: `Could you detail an architecture where you deployed ${matchedRequired[0] || 'core technologies'} at scale?`,
            category: 'Technical Depth',
            whyAsk: 'Evaluates hands-on engineering capabilities'
          },
          {
            question: missingRequired[0]
              ? `How quickly could you ramp up on ${missingRequired[0]}, given your previous background?`
              : 'What are your strategies for testing and zero-downtime deployments?',
            category: 'Skill Gap',
            whyAsk: 'Validates learning curve and production readiness'
          }
        ],
        summary: `${cand.name} demonstrates a ${isStrong ? 'strong' : isGood ? 'solid' : 'moderate'} profile matching ${matchedRequired.length}/${requiredSkills.length} mandatory skills.`,
        recommendation: isStrong ? 'Strong Match' : isGood ? 'Good Match' : skillsScore >= 40 ? 'Borderline / Review' : 'Not a Match'
      }
    };
  }, []);

  /**
   * Run Comprehensive Screening across all candidates for the active job
   */
  const runScreening = useCallback(async (jobToScreen: JobPosition = activeJob, candidatesList: CandidateResume[] = candidates) => {
    setIsScreening(true);
    setScreeningProgress({ current: 0, total: candidatesList.length });

    // Step 1: Immediate local calculation for zero latency
    const localMap: Record<string, ScreeningResult> = {};
    for (const cand of candidatesList) {
      localMap[cand.id] = computeLocalScreening(jobToScreen, cand);
    }
    setScreeningResults(localMap);

    // Step 2: Query Gemini AI Screening endpoint for deep semantic enrichment
    try {
      let completedCount = 0;
      for (const cand of candidatesList) {
        try {
          const res = await fetch('/api/screen-candidate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jobPosition: jobToScreen, resume: cand })
          });

          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              setScreeningResults(prev => ({
                ...prev,
                [cand.id]: {
                  candidateId: cand.id,
                  overallScore: data.overallScore,
                  breakdown: data.breakdown,
                  nlpDetails: data.nlpDetails,
                  aiEvaluation: data.aiEvaluation,
                  screenedAt: new Date().toISOString()
                }
              }));
            }
          }
        } catch (err) {
          console.warn(`Screening failed for candidate ${cand.name}:`, err);
        }

        completedCount += 1;
        setScreeningProgress({ current: completedCount, total: candidatesList.length });
      }
    } catch (error) {
      console.error('Error during batch screening:', error);
    } finally {
      setIsScreening(false);
      setScreeningProgress(null);
    }
  }, [activeJob, candidates, computeLocalScreening]);

  // Initial screening on mount or job change
  useEffect(() => {
    runScreening(activeJob, candidates);
  }, [selectedJobId]);

  // Recalculate weights if job weights change
  const handleWeightChange = (newWeights: JobPosition['weights']) => {
    const updatedJob = { ...activeJob, weights: newWeights };
    setJobs(jobs.map(j => j.id === updatedJob.id ? updatedJob : j));
    // Re-evaluate scores with new weights
    runScreening(updatedJob, candidates);
  };

  // Add Candidate handler
  const handleAddCandidate = (newCand: CandidateResume) => {
    const updated = [newCand, ...candidates];
    setCandidates(updated);
    // Immediately screen this candidate
    const localRes = computeLocalScreening(activeJob, newCand);
    setScreeningResults(prev => ({ ...prev, [newCand.id]: localRes }));

    // Async AI screening
    fetch('/api/screen-candidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobPosition: activeJob, resume: newCand })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setScreeningResults(prev => ({
            ...prev,
            [newCand.id]: {
              candidateId: newCand.id,
              overallScore: data.overallScore,
              breakdown: data.breakdown,
              nlpDetails: data.nlpDetails,
              aiEvaluation: data.aiEvaluation
            }
          }));
        }
      })
      .catch(console.error);
  };

  // Save / Add Job handler
  const handleSaveJob = (savedJob: JobPosition) => {
    const exists = jobs.some(j => j.id === savedJob.id);
    if (exists) {
      setJobs(jobs.map(j => j.id === savedJob.id ? savedJob : j));
    } else {
      setJobs([...jobs, savedJob]);
    }
    setSelectedJobId(savedJob.id);
  };

  // Candidate Status Updater
  const handleStatusChange = (candId: string, newStatus: CandidateResume['status']) => {
    setCandidates(candidates.map(c => c.id === candId ? { ...c, status: newStatus } : c));
  };

  // Toggle Compare
  const toggleCompare = (id: string) => {
    if (comparedIds.includes(id)) {
      setComparedIds(comparedIds.filter(i => i !== id));
    } else {
      if (comparedIds.length >= 4) {
        alert('You can compare a maximum of 4 candidates at once.');
        return;
      }
      setComparedIds([...comparedIds, id]);
    }
  };

  // Filtered & Ranked Candidates
  const filteredAndRankedCandidates = useMemo(() => {
    return candidates
      .filter(cand => {
        // Status filter
        if (statusFilter !== 'all' && cand.status !== statusFilter) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = cand.name.toLowerCase().includes(q);
          const matchTitle = cand.currentTitle.toLowerCase().includes(q);
          const matchSkills = cand.skills.some(s => s.toLowerCase().includes(q));
          return matchName || matchTitle || matchSkills;
        }
        return true;
      })
      .sort((a, b) => {
        const resA = screeningResults[a.id];
        const resB = screeningResults[b.id];

        if (sortBy === 'score') {
          return (resB?.overallScore ?? 0) - (resA?.overallScore ?? 0);
        }
        if (sortBy === 'cosine') {
          return (resB?.breakdown.cosineSimilarityPct ?? 0) - (resA?.breakdown.cosineSimilarityPct ?? 0);
        }
        if (sortBy === 'jaccard') {
          return (resB?.breakdown.jaccardSimilarityPct ?? 0) - (resA?.breakdown.jaccardSimilarityPct ?? 0);
        }
        if (sortBy === 'experience') {
          return b.experienceYears - a.experienceYears;
        }
        return a.name.localeCompare(b.name);
      });
  }, [candidates, screeningResults, searchQuery, statusFilter, sortBy]);

  // Export Shortlist CSV
  const handleExportCSV = () => {
    const shortlisted = candidates.filter(c => c.status === 'shortlisted' || (screeningResults[c.id]?.overallScore ?? 0) >= 75);
    if (shortlisted.length === 0) {
      alert('No candidates shortlisted yet.');
      return;
    }

    const headers = ['Rank', 'Name', 'Current Title', 'Overall ATS Score', 'Cosine Similarity', 'Jaccard Index', 'Experience (Yrs)', 'Recommendation', 'Email'];
    const rows = shortlisted.map((c, idx) => {
      const res = screeningResults[c.id];
      return [
        idx + 1,
        `"${c.name}"`,
        `"${c.currentTitle}"`,
        `${res?.overallScore ?? 0}%`,
        `${res?.breakdown.cosineSimilarityPct ?? 0}%`,
        `${res?.breakdown.jaccardSimilarityPct ?? 0}%`,
        c.experienceYears,
        `"${res?.aiEvaluation?.recommendation || 'Evaluated'}"`,
        `"${c.email}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Shortlisted_Candidates_${activeJob.title.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // High-level Stats
  const stats = useMemo(() => {
    const total = candidates.length;
    const shortlistedCount = candidates.filter(c => c.status === 'shortlisted').length;
    const scores = Object.values(screeningResults).map(r => r.overallScore);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const topCandidate = filteredAndRankedCandidates[0];
    const topScore = topCandidate ? screeningResults[topCandidate.id]?.overallScore : null;

    return { total, shortlistedCount, avgScore, topCandidate, topScore };
  }, [candidates, screeningResults, filteredAndRankedCandidates]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Branding */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none">
                  TalentMatch AI
                </h1>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  AI & NLP Resume Screening Engine
                </p>
              </div>
            </div>

            {/* Active Job Selector */}
            <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 max-w-md">
              <Briefcase className="w-4 h-4 text-indigo-600 shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider leading-none">
                  Active Position
                </span>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer truncate max-w-[280px]"
                >
                  {jobs.map(j => (
                    <option key={j.id} value={j.id}>
                      {j.title} ({j.department})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Global Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 shadow-2xs transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Upload Resumes</span>
              </button>

              <button
                onClick={() => {
                  setEditingJob(null);
                  setIsJobModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 shadow-2xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Job</span>
              </button>

              <button
                onClick={() => runScreening()}
                disabled={isScreening}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 shadow-xs transition-colors"
              >
                {isScreening ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>{isScreening ? 'Screening...' : 'Screen All'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Primary Functional Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100 flex items-center justify-between overflow-x-auto">
          <nav className="flex items-center gap-1 py-1">
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'leaderboard'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Candidate Leaderboard</span>
              <span className="text-[11px] font-mono bg-white px-1.5 py-0.2 rounded border border-slate-200 text-slate-600">
                {candidates.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('job_spec')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'job_spec'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Job Requirements & Criteria</span>
            </button>

            <button
              onClick={() => setActiveTab('nlp_lab')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'nlp_lab'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>NLP Methodology & Lab</span>
            </button>

            {comparedIds.length > 0 && (
              <button
                onClick={() => setIsCompareModalOpen(true)}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 transition-colors flex items-center gap-1.5"
              >
                <Scale className="w-4 h-4" />
                <span>Compare Selected ({comparedIds.length})</span>
              </button>
            )}
          </nav>

          {/* Export Shortlist Button */}
          <div className="py-1">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              title="Download Shortlisted Candidates CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export Shortlist</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Screening Progress Banner */}
        {isScreening && screeningProgress && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-indigo-600 animate-spin shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-indigo-900">
                  Running AI & NLP Screening Pipeline...
                </h4>
                <p className="text-xs text-indigo-700 mt-0.5">
                  Calculating TF-IDF Cosine Similarity, Jaccard Index, and Gemini 3.8 Flash semantic fit for candidate {screeningProgress.current} of {screeningProgress.total}
                </p>
              </div>
            </div>
            <div className="font-mono text-xs font-bold text-indigo-800 bg-white px-2.5 py-1 rounded-md border border-indigo-200">
              {Math.round((screeningProgress.current / screeningProgress.total) * 100)}%
            </div>
          </div>
        )}

        {/* TAB 1: CANDIDATE LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-6">
            {/* Quick Summary Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Target Role
                </span>
                <div className="text-sm font-bold text-slate-900 truncate mt-1" title={activeJob.title}>
                  {activeJob.title}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {activeJob.minExperienceYears}+ yrs · {activeJob.requiredSkills.length} required skills
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Candidate Pool
                </span>
                <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                  {stats.total}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {stats.shortlistedCount} shortlisted for interview
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Average Match Fit
                </span>
                <div className="text-2xl font-bold font-mono text-indigo-600 mt-1">
                  {stats.avgScore}%
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Across all {stats.total} candidates
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Top Recommended
                </span>
                <div className="text-sm font-bold text-emerald-700 truncate mt-1">
                  {stats.topCandidate?.name || 'Evaluating...'}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {stats.topScore ? `${stats.topScore}% ATS Fit Score` : 'Running calculations'}
                </div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-4 flex-wrap">
              {/* Search */}
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by candidate name, skill, or role..."
                  className="w-full pl-9 pr-4 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50/50"
                />
              </div>

              {/* Status Segmented Buttons */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
                {(['all', 'shortlisted', 'interview', 'new', 'reserve', 'rejected'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors capitalize whitespace-nowrap ${
                      statusFilter === st
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st === 'all' ? 'All Candidates' : st}
                  </button>
                ))}
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-medium">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-white border border-slate-200 rounded-md px-2.5 py-1 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="score">Highest ATS Score</option>
                  <option value="cosine">TF-IDF Cosine Similarity</option>
                  <option value="jaccard">Jaccard Skill Overlap</option>
                  <option value="experience">Experience (Years)</option>
                  <option value="name">Candidate Name</option>
                </select>
              </div>
            </div>

            {/* Candidate Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAndRankedCandidates.map((candidate, idx) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  result={screeningResults[candidate.id]}
                  job={activeJob}
                  rank={idx + 1}
                  isSelectedForCompare={comparedIds.includes(candidate.id)}
                  onSelectForCompare={() => toggleCompare(candidate.id)}
                  onViewDetails={() => setInspectCandidateId(candidate.id)}
                  onStatusChange={(status) => handleStatusChange(candidate.id, status)}
                />
              ))}

              {filteredAndRankedCandidates.length === 0 && (
                <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <Search className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">
                    No candidates matched your filters
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Try clearing the search query or changing the recruitment stage filter.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                    }}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    Reset all filters
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: JOB SPECIFICATION & SCORING WEIGHTS */}
        {activeTab === 'job_spec' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header / Actions */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex items-start justify-between gap-4 flex-wrap">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-indigo-600 font-bold block mb-1">
                  Active Hiring Position Spec
                </span>
                <h2 className="text-2xl font-bold text-slate-900">
                  {activeJob.title}
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                  <span>{activeJob.department}</span>
                  <span>·</span>
                  <span>{activeJob.level}</span>
                  <span>·</span>
                  <span>Min {activeJob.minExperienceYears} Years Experience</span>
                  <span>·</span>
                  <span>{activeJob.minEducation}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingJob(activeJob);
                    setIsJobModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-2xs"
                >
                  Edit Job Requirements
                </button>
              </div>
            </div>

            {/* Weights Adjuster Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                    ATS Scoring Weight Calibration
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Adjust how much each dimension influences candidate ranking. Changes immediately re-score all resumes.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                  Total: {activeJob.weights.skills + activeJob.weights.experience + activeJob.weights.semanticNlp + activeJob.weights.education}%
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 text-xs">
                <div className="space-y-1.5">
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>1. Required Skills Match Weight</span>
                    <span className="font-mono text-indigo-600">{activeJob.weights.skills}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    value={activeJob.weights.skills}
                    onChange={(e) => handleWeightChange({ ...activeJob.weights, skills: Number(e.target.value) })}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-400">Evaluates intersection of mandatory technical tools.</p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>2. Experience Seniority Weight</span>
                    <span className="font-mono text-indigo-600">{activeJob.weights.experience}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    value={activeJob.weights.experience}
                    onChange={(e) => handleWeightChange({ ...activeJob.weights, experience: Number(e.target.value) })}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-400">Compares candidate years in industry against target {activeJob.minExperienceYears}+ yrs.</p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>3. Semantic & NLP Cosine Weight</span>
                    <span className="font-mono text-indigo-600">{activeJob.weights.semanticNlp}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    value={activeJob.weights.semanticNlp}
                    onChange={(e) => handleWeightChange({ ...activeJob.weights, semanticNlp: Number(e.target.value) })}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-400">Blends TF-IDF Cosine vector angle with BERT semantic contextual understanding.</p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>4. Education Degree Tier Weight</span>
                    <span className="font-mono text-indigo-600">{activeJob.weights.education}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    value={activeJob.weights.education}
                    onChange={(e) => handleWeightChange({ ...activeJob.weights, education: Number(e.target.value) })}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-400">Scores academic degree level relative to minimum {activeJob.minEducation}.</p>
                </div>
              </div>
            </div>

            {/* Skills Requirement Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Mandatory Required Skills ({activeJob.requiredSkills.length})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {activeJob.requiredSkills.map(skill => (
                    <span key={skill} className="font-mono text-xs px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md font-semibold">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Preferred / Nice-to-Have Skills ({activeJob.preferredSkills.length})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {activeJob.preferredSkills.map(skill => (
                    <span key={skill} className="font-mono text-xs px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-md">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Raw Job Description Text */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Full Job Description Text
              </h4>
              <div className="font-mono text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                {activeJob.description}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: NLP METHODOLOGY & LAB */}
        {activeTab === 'nlp_lab' && (
          <NlpMethodologyLab />
        )}
      </main>

      {/* Candidate Full Analysis Modal */}
      {inspectCandidateId && (
        <CandidateModal
          candidate={candidates.find(c => c.id === inspectCandidateId) || null}
          result={screeningResults[inspectCandidateId]}
          job={activeJob}
          onClose={() => setInspectCandidateId(null)}
          onStatusChange={(status) => handleStatusChange(inspectCandidateId, status)}
        />
      )}

      {/* Upload Resumes Modal */}
      <ResumeUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onAddCandidate={handleAddCandidate}
      />

      {/* Job Editor Modal */}
      <JobEditorModal
        isOpen={isJobModalOpen}
        existingJob={editingJob}
        onClose={() => {
          setIsJobModalOpen(false);
          setEditingJob(null);
        }}
        onSaveJob={handleSaveJob}
      />

      {/* Compare Modal */}
      {isCompareModalOpen && (
        <CandidateCompareModal
          candidates={candidates.filter(c => comparedIds.includes(c.id))}
          results={screeningResults}
          job={activeJob}
          onClose={() => setIsCompareModalOpen(false)}
          onRemoveFromCompare={(id) => setComparedIds(comparedIds.filter(i => i !== id))}
        />
      )}
    </div>
  );
}
