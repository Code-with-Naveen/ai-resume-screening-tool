import React, { useState } from 'react';
import { CandidateResume, JobPosition, ScreeningResult } from '../types/index.ts';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  FileText, 
  Code, 
  HelpCircle, 
  Layers, 
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Copy,
  Check,
  Send,
  Loader2
} from 'lucide-react';

interface CandidateModalProps {
  candidate: CandidateResume | null;
  result?: ScreeningResult;
  job: JobPosition;
  onClose: () => void;
  onStatusChange: (status: CandidateResume['status']) => void;
}

export const CandidateModal: React.FC<CandidateModalProps> = ({
  candidate,
  result,
  job,
  onClose,
  onStatusChange
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'nlp' | 'resume' | 'questions' | 'pipeline'>('overview');
  const [copiedText, setCopiedText] = useState(false);
  const [customQuestions, setCustomQuestions] = useState(result?.aiEvaluation?.interviewQuestions || []);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);

  if (!candidate) return null;

  const handleCopyResume = () => {
    navigator.clipboard.writeText(candidate.fullRawText || candidate.summary);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleGenerateMoreQuestions = async () => {
    setGeneratingQuestions(true);
    try {
      const res = await fetch('/api/tailor-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateName: candidate.name,
          jobTitle: job.title,
          candidateSummary: candidate.summary,
          missingSkills: result?.nlpDetails.missingRequiredSkills || [],
          matchedSkills: result?.nlpDetails.matchedRequiredSkills || []
        })
      });
      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setCustomQuestions(data.questions);
      }
    } catch (e) {
      console.error('Error generating questions:', e);
    } finally {
      setGeneratingQuestions(false);
    }
  };

  // Function to highlight matched keywords in resume text
  const renderHighlightedResume = () => {
    const raw = candidate.fullRawText || candidate.summary;
    const matched = new Set(
      (result?.nlpDetails.matchedRequiredSkills || []).map(s => s.toLowerCase())
    );

    // Escape regex
    const wordsToHighlight = Array.from(matched).filter(w => w.length > 1);
    if (wordsToHighlight.length === 0) {
      return <pre className="font-mono text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">{raw}</pre>;
    }

    const pattern = new RegExp(`\\b(${wordsToHighlight.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'gi');
    const parts = raw.split(pattern);

    return (
      <div className="font-mono text-xs text-slate-700 whitespace-pre-wrap leading-relaxed select-text">
        {parts.map((part, i) => {
          if (wordsToHighlight.some(w => w.toLowerCase() === part.toLowerCase())) {
            return (
              <mark key={i} className="bg-emerald-100 text-emerald-900 font-bold px-1 rounded">
                {part}
              </mark>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white w-full max-w-4xl max-h-[92vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-50/70 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-slate-900 truncate">
                {candidate.name}
              </h2>
              {result?.aiEvaluation?.recommendation && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {result.aiEvaluation.recommendation}
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-slate-600 mt-0.5">
              {candidate.currentTitle}
            </p>

            {/* Unboxed Metadata */}
            <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 mt-2">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{candidate.email}</span>
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                <span>{candidate.experienceYears} Years Exp</span>
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                <span>{candidate.education}</span>
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{candidate.location}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {result?.overallScore !== undefined && (
              <div className="text-right">
                <div className="text-2xl font-black font-mono text-indigo-600">
                  {result.overallScore}%
                </div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  ATS Match
                </div>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Functional segmented button tab bar) */}
        <div className="flex items-center gap-1 px-5 border-b border-slate-200 bg-white overflow-x-auto py-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Overview & AI Verdict
          </button>
          <button
            onClick={() => setActiveTab('nlp')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'nlp'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            NLP Similarity Math
          </button>
          <button
            onClick={() => setActiveTab('resume')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'resume'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Highlighted Resume Text
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'questions'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Tailored Interview Questions
          </button>
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'pipeline'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Data Cleaning Pipeline
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Recruiter Summary Banner */}
              {result?.aiEvaluation?.summary && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    AI Recruiter Assessment
                  </h4>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">
                    {result.aiEvaluation.summary}
                  </p>
                </div>
              )}

              {/* Sub-Scores Matrix */}
              {result && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    Evaluation Dimensions Breakdown
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-white border border-slate-200 rounded-xl">
                      <span className="text-xs text-slate-500">Skills Overlap</span>
                      <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                        {result.breakdown.skillsScore}%
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${result.breakdown.skillsScore}%` }} />
                      </div>
                    </div>

                    <div className="p-3 bg-white border border-slate-200 rounded-xl">
                      <span className="text-xs text-slate-500">Experience Seniority</span>
                      <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                        {result.breakdown.experienceScore}%
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full" style={{ width: `${result.breakdown.experienceScore}%` }} />
                      </div>
                    </div>

                    <div className="p-3 bg-white border border-slate-200 rounded-xl">
                      <span className="text-xs text-slate-500">Semantic & NLP Fit</span>
                      <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                        {result.breakdown.semanticScore}%
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${result.breakdown.semanticScore}%` }} />
                      </div>
                    </div>

                    <div className="p-3 bg-white border border-slate-200 rounded-xl">
                      <span className="text-xs text-slate-500">Education Fit</span>
                      <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                        {result.breakdown.educationScore}%
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-purple-500 h-full rounded-full" style={{ width: `${result.breakdown.educationScore}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Strengths & Gaps Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Strengths */}
                <div className="border border-emerald-200 bg-emerald-50/30 rounded-xl p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5 mb-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Key Candidate Strengths
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {(result?.aiEvaluation?.strengths || [
                      `Verified technical skills matching job requirements`,
                      `${candidate.experienceYears} years background in software engineering`
                    ]).map((s, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-500 font-bold shrink-0">✓</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Gaps / Risks */}
                <div className="border border-amber-200 bg-amber-50/30 rounded-xl p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5 mb-3">
                    <XCircle className="w-4 h-4 text-amber-600" />
                    Identified Gaps & Skill Deltas
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {(result?.aiEvaluation?.gaps || [
                      `Review depth of architectural scale and microservices experience`
                    ]).map((g, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-500 font-bold shrink-0">!</span>
                        <span>{g}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Skills Matrix */}
              <div className="border border-slate-200 rounded-xl p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Required Skills Fulfillment Matrix
                </h4>
                <div className="flex flex-wrap gap-2">
                  {job.requiredSkills.map(skill => {
                    const isMatched = result?.nlpDetails.matchedRequiredSkills.includes(skill.toLowerCase());
                    return (
                      <div
                        key={skill}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono border ${
                          isMatched
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold'
                            : 'bg-rose-50 text-rose-700 border-rose-200 line-through'
                        }`}
                      >
                        {isMatched ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        )}
                        <span>{skill}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: NLP SIMILARITY MATH */}
          {activeTab === 'nlp' && (
            <div className="space-y-6">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  NLP Algorithms Formulation
                </h4>
                <p className="text-xs text-slate-600">
                  This screening engine implements classical Information Retrieval vectorization (TF-IDF Cosine Similarity) along with set-theoretic Jaccard similarity.
                </p>
              </div>

              {/* Cosine Similarity Card */}
              <div className="border border-slate-200 rounded-xl p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      1. Cosine Similarity (TF-IDF Vector Space Model)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-mono">
                      Cosine(A, B) = (A · B) / (||A|| × ||B||)
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold font-mono text-indigo-600">
                      {result?.breakdown.cosineSimilarityPct}%
                    </span>
                    <span className="block text-[10px] text-slate-400">Score</span>
                  </div>
                </div>

                {result?.nlpDetails.cosine && (
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-xs font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Dot Product (A·B)</span>
                        <span className="font-bold text-slate-800">{result.nlpDetails.cosine.dotProduct}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Magnitude ||JD||</span>
                        <span className="font-bold text-slate-800">{result.nlpDetails.cosine.magnitude1}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Magnitude ||Resume||</span>
                        <span className="font-bold text-slate-800">{result.nlpDetails.cosine.magnitude2}</span>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-xs font-bold text-slate-700 mb-2">
                        Top Shared Contributing Tokens (Term Frequency × IDF Weight)
                      </h5>
                      <div className="flex flex-wrap gap-1.5">
                        {result.nlpDetails.cosine.sharedTokens.map((item) => (
                          <span key={item.token} className="text-xs font-mono bg-indigo-50/70 border border-indigo-100 text-indigo-900 px-2 py-0.5 rounded">
                            {item.token} <span className="text-slate-400 text-[10px]">(JD:{item.weightDoc1} · CV:{item.weightDoc2})</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Jaccard Similarity Card */}
              <div className="border border-slate-200 rounded-xl p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      2. Jaccard Similarity Index (Skill Sets Overlap)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-mono">
                      J(A, B) = |A ∩ B| / |A ∪ B|
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold font-mono text-emerald-600">
                      {result?.breakdown.jaccardSimilarityPct}%
                    </span>
                    <span className="block text-[10px] text-slate-400">Score</span>
                  </div>
                </div>

                {result?.nlpDetails.jaccard && (
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
                    <div className="text-xs">
                      <span className="font-semibold text-slate-700 block mb-1">
                        Intersection Set (A ∩ B) - {result.nlpDetails.jaccard.intersection.length} overlapping skills:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {result.nlpDetails.jaccard.intersection.map(item => (
                          <span key={item} className="font-mono text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-xs pt-2">
                      <span className="font-semibold text-slate-500 block mb-1">
                        Total Unique Skills Union (A ∪ B) - {result.nlpDetails.jaccard.union.length} items
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: RESUME TEXT & KEYWORD HIGHLIGHTER */}
          {activeTab === 'resume' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300 inline-block" />
                    Highlighted Matching Job Terms
                  </span>
                </div>
                <button
                  onClick={handleCopyResume}
                  className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-md border border-slate-200 bg-white"
                >
                  {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedText ? 'Copied' : 'Copy Text'}</span>
                </button>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl max-h-[500px] overflow-y-auto">
                {renderHighlightedResume()}
              </div>
            </div>
          )}

          {/* TAB 4: TAILORED INTERVIEW QUESTIONS */}
          {activeTab === 'questions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    AI-Generated Targeted Interview Questions
                  </h4>
                  <p className="text-xs text-slate-500">
                    Formulated specifically to test {candidate.name}'s verified strengths and probe potential gaps for {job.title}.
                  </p>
                </div>
                <button
                  onClick={handleGenerateMoreQuestions}
                  disabled={generatingQuestions}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {generatingQuestions ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>Regenerate Questions</span>
                </button>
              </div>

              <div className="space-y-3">
                {customQuestions.map((q, idx) => (
                  <div key={idx} className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 hover:border-indigo-200 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        {q.category}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">Q{idx + 1}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">
                      "{q.question}"
                    </p>
                    <p className="text-xs text-slate-500 italic">
                      <strong>Recruiter Intent:</strong> {q.whyAsk}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: DATA CLEANING PIPELINE */}
          {activeTab === 'pipeline' && (
            <div className="space-y-5">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  NLP Data Cleaning & Token Transformation Pipeline
                </h4>
                <p className="text-xs text-slate-600">
                  Shows how raw resume text is stripped of noise, punctuation, stopwords, and vectorized.
                </p>
              </div>

              {result?.nlpDetails.cleaningInspection ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <span className="text-slate-400 block">Raw Word Count</span>
                      <span className="text-lg font-bold font-mono text-slate-800">
                        {result.nlpDetails.cleaningInspection.rawWordsCount}
                      </span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <span className="text-slate-400 block">Filtered Tokens</span>
                      <span className="text-lg font-bold font-mono text-slate-800">
                        {result.nlpDetails.cleaningInspection.filteredTokenCount}
                      </span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <span className="text-slate-400 block">Stopwords Removed</span>
                      <span className="text-lg font-bold font-mono text-indigo-600">
                        {result.nlpDetails.cleaningInspection.removedStopwordsCount}
                      </span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <span className="text-slate-400 block">Detected Skills</span>
                      <span className="text-lg font-bold font-mono text-emerald-600">
                        {result.nlpDetails.cleaningInspection.extractedSkills.length}
                      </span>
                    </div>
                  </div>

                  {/* Top TF-IDF Terms */}
                  <div className="border border-slate-200 rounded-xl p-4">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Highest Frequency Candidate Tokens (Normalized TF)
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {result.nlpDetails.cleaningInspection.topTerms.map(term => (
                        <div key={term.term} className="flex items-center gap-1.5 font-mono text-xs bg-slate-50 border border-slate-200 px-2 py-1 rounded">
                          <span className="text-slate-800 font-semibold">{term.term}</span>
                          <span className="text-indigo-600 font-bold">{term.freq}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sanitized Sample */}
                  <div className="border border-slate-200 rounded-xl p-4">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Step 1 Regex Sanitization Output (Sample)
                    </h5>
                    <p className="font-mono text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 whitespace-pre-wrap">
                      {result.nlpDetails.cleaningInspection.cleanedTextSample}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500">Run screening to view pipeline breakdown.</p>
              )}
            </div>
          )}
        </div>

        {/* Footer with Recruitment Status Selector */}
        <div className="p-4 px-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Recruitment Stage:</span>
            <select
              value={candidate.status}
              onChange={(e) => onStatusChange(e.target.value as CandidateResume['status'])}
              className="text-xs font-medium bg-white border border-slate-300 rounded-md px-3 py-1.5 text-slate-800 shadow-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none cursor-pointer"
            >
              <option value="new">New Candidate</option>
              <option value="shortlisted">Shortlisted for Review</option>
              <option value="interview">Interview Scheduled</option>
              <option value="reserve">Talent Reserve Pool</option>
              <option value="rejected">Disqualified / Rejected</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onStatusChange('shortlisted');
                onClose();
              }}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Shortlist Candidate</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
