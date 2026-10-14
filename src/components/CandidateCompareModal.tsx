import React from 'react';
import { CandidateResume, JobPosition, ScreeningResult } from '../types/index.ts';
import { X, CheckCircle2, XCircle, Zap, Briefcase, GraduationCap, Scale } from 'lucide-react';

interface CandidateCompareModalProps {
  candidates: CandidateResume[];
  results: Record<string, ScreeningResult>;
  job: JobPosition;
  onClose: () => void;
  onRemoveFromCompare: (id: string) => void;
}

export const CandidateCompareModal: React.FC<CandidateCompareModalProps> = ({
  candidates,
  results,
  job,
  onClose,
  onRemoveFromCompare,
}) => {
  if (candidates.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white w-full max-w-6xl max-h-[92vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
              <Scale className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Side-by-Side Candidate Evaluation
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Benchmarking {candidates.length} candidates against {job.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Table Grid */}
        <div className="p-6 overflow-x-auto overflow-y-auto flex-1">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="p-3 font-semibold text-slate-500 w-44 min-w-[160px] bg-slate-50/50">
                  Criteria
                </th>
                {candidates.map((c) => {
                  const r = results[c.id];
                  return (
                    <th key={c.id} className="p-3 font-bold text-slate-900 min-w-[220px]">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-sm font-bold text-slate-900">{c.name}</div>
                          <div className="text-xs text-slate-500 font-normal truncate max-w-[160px]">{c.currentTitle}</div>
                        </div>
                        <button
                          onClick={() => onRemoveFromCompare(c.id)}
                          className="text-slate-400 hover:text-rose-500 p-0.5"
                          title="Remove from comparison"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Overall Score */}
              <tr className="bg-slate-50/30">
                <td className="p-3 font-bold text-slate-700 bg-slate-50/80">Overall ATS Fit</td>
                {candidates.map((c) => {
                  const score = results[c.id]?.overallScore ?? null;
                  return (
                    <td key={c.id} className="p-3 font-mono font-bold text-base text-indigo-600">
                      {score !== null ? (
                        <div className="flex items-center gap-1">
                          <Zap className="w-4 h-4" />
                          <span>{score}%</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-normal italic">N/A</span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Recommendation */}
              <tr>
                <td className="p-3 font-semibold text-slate-600 bg-slate-50/80">AI Recommendation</td>
                {candidates.map((c) => {
                  const rec = results[c.id]?.aiEvaluation?.recommendation;
                  return (
                    <td key={c.id} className="p-3">
                      {rec ? (
                        <span className="font-semibold text-slate-800">
                          {rec}
                        </span>
                      ) : '-'}
                    </td>
                  );
                })}
              </tr>

              {/* Cosine Similarity */}
              <tr>
                <td className="p-3 font-semibold text-slate-600 bg-slate-50/80">Cosine Similarity</td>
                {candidates.map((c) => (
                  <td key={c.id} className="p-3 font-mono text-slate-800 font-semibold">
                    {results[c.id]?.breakdown.cosineSimilarityPct ?? 0}%
                  </td>
                ))}
              </tr>

              {/* Jaccard Similarity */}
              <tr>
                <td className="p-3 font-semibold text-slate-600 bg-slate-50/80">Jaccard Index</td>
                {candidates.map((c) => (
                  <td key={c.id} className="p-3 font-mono text-slate-800 font-semibold">
                    {results[c.id]?.breakdown.jaccardSimilarityPct ?? 0}%
                  </td>
                ))}
              </tr>

              {/* Experience */}
              <tr>
                <td className="p-3 font-semibold text-slate-600 bg-slate-50/80">Experience</td>
                {candidates.map((c) => (
                  <td key={c.id} className="p-3 text-slate-800">
                    <span className="font-semibold">{c.experienceYears} years</span>
                    <span className="text-slate-400 block text-[11px]">
                      Required: {job.minExperienceYears}+ yrs
                    </span>
                  </td>
                ))}
              </tr>

              {/* Education */}
              <tr>
                <td className="p-3 font-semibold text-slate-600 bg-slate-50/80">Education</td>
                {candidates.map((c) => (
                  <td key={c.id} className="p-3 text-slate-700">
                    {c.education}
                  </td>
                ))}
              </tr>

              {/* Matched Required Skills */}
              <tr>
                <td className="p-3 font-semibold text-slate-600 bg-slate-50/80">Matched Skills</td>
                {candidates.map((c) => {
                  const matched = results[c.id]?.nlpDetails.matchedRequiredSkills || [];
                  return (
                    <td key={c.id} className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {matched.map(s => (
                          <span key={s} className="font-mono text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Missing Skills */}
              <tr>
                <td className="p-3 font-semibold text-slate-600 bg-slate-50/80">Missing Skills</td>
                {candidates.map((c) => {
                  const missing = results[c.id]?.nlpDetails.missingRequiredSkills || [];
                  return (
                    <td key={c.id} className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {missing.map(s => (
                          <span key={s} className="font-mono text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Recruiter Verdict */}
              <tr>
                <td className="p-3 font-semibold text-slate-600 bg-slate-50/80">Recruiter Verdict</td>
                {candidates.map((c) => (
                  <td key={c.id} className="p-3 text-slate-600 leading-relaxed italic">
                    {results[c.id]?.aiEvaluation?.summary || '-'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
