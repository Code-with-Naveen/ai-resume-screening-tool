import React from 'react';
import { CandidateResume, JobPosition, ScreeningResult } from '../types/index.ts';
import { 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  MessageSquare, 
  ChevronRight, 
  Scale, 
  Briefcase, 
  GraduationCap, 
  MapPin, 
  Sparkles,
  Zap
} from 'lucide-react';

interface CandidateCardProps {
  candidate: CandidateResume;
  result?: ScreeningResult;
  job: JobPosition;
  rank: number;
  isSelectedForCompare: boolean;
  onSelectForCompare: () => void;
  onViewDetails: () => void;
  onStatusChange: (status: CandidateResume['status']) => void;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  result,
  job,
  rank,
  isSelectedForCompare,
  onSelectForCompare,
  onViewDetails,
  onStatusChange,
}) => {
  const score = result?.overallScore ?? null;
  const recommendation = result?.aiEvaluation?.recommendation;

  // Visual styling for recommendation
  const getRecommendationBadge = (rec?: string) => {
    switch (rec) {
      case 'Strong Match':
        return 'text-emerald-700 bg-emerald-50 border border-emerald-200';
      case 'Good Match':
        return 'text-blue-700 bg-blue-50 border border-blue-200';
      case 'Borderline / Review':
        return 'text-amber-700 bg-amber-50 border border-amber-200';
      case 'Not a Match':
        return 'text-rose-700 bg-rose-50 border border-rose-200';
      default:
        return 'text-slate-600 bg-slate-100 border border-slate-200';
    }
  };

  const getScoreColor = (sc: number) => {
    if (sc >= 85) return 'text-emerald-600 border-emerald-500 bg-emerald-50/50';
    if (sc >= 70) return 'text-blue-600 border-blue-500 bg-blue-50/50';
    if (sc >= 50) return 'text-amber-600 border-amber-500 bg-amber-50/50';
    return 'text-rose-600 border-rose-500 bg-rose-50/50';
  };

  return (
    <div className={`group relative bg-white rounded-xl border transition-all duration-200 hover:shadow-md ${
      isSelectedForCompare ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-slate-200 hover:border-slate-300'
    }`}>
      <div className="p-5">
        {/* Top Header: Rank, Candidate Name, Title, and Overall Match Score */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            {/* Rank Indicator */}
            <div className={`flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold font-mono shrink-0 ${
              rank === 1 ? 'bg-amber-100 text-amber-900 border border-amber-300' :
              rank === 2 ? 'bg-slate-200 text-slate-800' :
              rank === 3 ? 'bg-amber-50 text-amber-800' : 'bg-slate-100 text-slate-600'
            }`}>
              #{rank}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 
                  onClick={onViewDetails}
                  className="text-base font-semibold text-slate-900 truncate hover:text-indigo-600 cursor-pointer transition-colors"
                >
                  {candidate.name}
                </h3>
                {recommendation && (
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${getRecommendationBadge(recommendation)}`}>
                    {recommendation}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600 font-medium truncate mt-0.5">
                {candidate.currentTitle}
              </p>
            </div>
          </div>

          {/* Overall Match Score */}
          <div className="text-right shrink-0">
            {score !== null ? (
              <div className="flex flex-col items-end">
                <div className={`px-2.5 py-1 rounded-lg border font-mono font-bold text-lg flex items-center gap-1 ${getScoreColor(score)}`}>
                  <Zap className="w-3.5 h-3.5" />
                  {score}%
                </div>
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-1">
                  ATS Match Score
                </span>
              </div>
            ) : (
              <span className="text-xs text-slate-400 italic">Not evaluated</span>
            )}
          </div>
        </div>

        {/* Unboxed Metadata (Zero-Pill discipline) */}
        <div className="mt-3 flex items-center flex-wrap gap-y-1 gap-x-2 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            <strong className="text-slate-700">{candidate.experienceYears} yrs</strong> experience
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="flex items-center gap-1 truncate max-w-[200px]" title={candidate.education}>
            <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{candidate.education}</span>
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{candidate.location}</span>
          </span>
        </div>

        {/* NLP & Metric Scores Grid */}
        {result && (
          <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-slate-50/80 rounded-lg p-2 border border-slate-100">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
                Cosine Sim
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-sm font-bold font-mono text-slate-800">
                  {result.breakdown.cosineSimilarityPct}%
                </span>
                <span className="text-[10px] text-slate-400">TF-IDF</span>
              </div>
            </div>

            <div className="bg-slate-50/80 rounded-lg p-2 border border-slate-100">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
                Jaccard Index
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-sm font-bold font-mono text-slate-800">
                  {result.breakdown.jaccardSimilarityPct}%
                </span>
                <span className="text-[10px] text-slate-400">Skills</span>
              </div>
            </div>

            <div className="bg-slate-50/80 rounded-lg p-2 border border-slate-100">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
                Req Skills
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-sm font-bold font-mono text-slate-800">
                  {result.nlpDetails.matchedRequiredSkills.length}/{job.requiredSkills.length}
                </span>
                <span className="text-[10px] text-slate-400">matched</span>
              </div>
            </div>

            <div className="bg-slate-50/80 rounded-lg p-2 border border-slate-100">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
                Semantic Fit
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-sm font-bold font-mono text-slate-800">
                  {result.breakdown.semanticScore}%
                </span>
                <span className="text-[10px] text-slate-400">BERT/AI</span>
              </div>
            </div>
          </div>
        )}

        {/* Matched vs Missing Skills Quick Preview */}
        {result && (
          <div className="mt-3 flex items-start gap-2 text-xs">
            {result.nlpDetails.matchedRequiredSkills.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                <span className="text-slate-400 font-medium shrink-0">Matches:</span>
                {result.nlpDetails.matchedRequiredSkills.slice(0, 4).map(skill => (
                  <span key={skill} className="font-mono text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                    {skill}
                  </span>
                ))}
                {result.nlpDetails.matchedRequiredSkills.length > 4 && (
                  <span className="text-slate-400 text-[11px]">
                    +{result.nlpDetails.matchedRequiredSkills.length - 4} more
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* AI Strengths Snippet or Summary */}
        {result?.aiEvaluation?.summary && (
          <p className="mt-3 text-xs text-slate-600 line-clamp-2 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
            <span className="font-semibold text-slate-700">Recruiter Note: </span>
            {result.aiEvaluation.summary}
          </p>
        )}
      </div>

      {/* Card Footer: Action Buttons & Status Selector */}
      <div className="px-5 py-3 bg-slate-50/60 border-t border-slate-100 rounded-b-xl flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          {/* Status Dropdown */}
          <select
            value={candidate.status}
            onChange={(e) => onStatusChange(e.target.value as CandidateResume['status'])}
            className="text-xs font-medium bg-white border border-slate-300 rounded-md px-2.5 py-1 text-slate-700 shadow-xs hover:border-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="new">New</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="interview">Interview Scheduled</option>
            <option value="reserve">Reserve Pool</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Compare Checkbox */}
          <button
            type="button"
            onClick={onSelectForCompare}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${
              isSelectedForCompare 
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            {isSelectedForCompare ? 'Compared' : 'Compare'}
          </button>
        </div>

        {/* View Full Analysis Modal Trigger */}
        <button
          onClick={onViewDetails}
          className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors py-1"
        >
          <span>View Full NLP Analysis</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
