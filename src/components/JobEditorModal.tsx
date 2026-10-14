import React, { useState } from 'react';
import { JobPosition } from '../types/index.ts';
import { 
  X, 
  Sparkles, 
  Sliders, 
  Plus, 
  Trash2, 
  Loader2, 
  Check, 
  Briefcase 
} from 'lucide-react';

interface JobEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveJob: (job: JobPosition) => void;
  existingJob?: JobPosition | null;
}

export const JobEditorModal: React.FC<JobEditorModalProps> = ({
  isOpen,
  onClose,
  onSaveJob,
  existingJob
}) => {
  const [title, setTitle] = useState(existingJob?.title || '');
  const [department, setDepartment] = useState(existingJob?.department || 'Engineering');
  const [level, setLevel] = useState(existingJob?.level || 'Senior');
  const [minExp, setMinExp] = useState(existingJob?.minExperienceYears || 4);
  const [education, setEducation] = useState(existingJob?.minEducation || 'Bachelor\'s Degree');
  const [requiredSkills, setRequiredSkills] = useState<string[]>(
    existingJob?.requiredSkills || ['python', 'docker', 'system design', 'rest api', 'git']
  );
  const [preferredSkills, setPreferredSkills] = useState<string[]>(
    existingJob?.preferredSkills || ['kubernetes', 'aws', 'ci/cd']
  );
  const [description, setDescription] = useState(existingJob?.description || '');
  const [weights, setWeights] = useState(existingJob?.weights || {
    skills: 35,
    experience: 25,
    semanticNlp: 25,
    education: 15
  });

  const [newRequiredSkill, setNewRequiredSkill] = useState('');
  const [newPreferredSkill, setNewPreferredSkill] = useState('');
  const [generating, setGenerating] = useState(false);

  if (!isOpen) return null;

  const handleAddRequiredSkill = () => {
    if (newRequiredSkill.trim()) {
      setRequiredSkills([...requiredSkills, newRequiredSkill.trim().toLowerCase()]);
      setNewRequiredSkill('');
    }
  };

  const handleRemoveRequiredSkill = (idx: number) => {
    setRequiredSkills(requiredSkills.filter((_, i) => i !== idx));
  };

  const handleAddPreferredSkill = () => {
    if (newPreferredSkill.trim()) {
      setPreferredSkills([...preferredSkills, newPreferredSkill.trim().toLowerCase()]);
      setNewPreferredSkill('');
    }
  };

  const handleRemovePreferredSkill = (idx: number) => {
    setPreferredSkills(preferredSkills.filter((_, i) => i !== idx));
  };

  const handleGenerateWithAI = async () => {
    if (!title.trim()) {
      alert('Please enter a Role Title first (e.g. Senior Machine Learning Engineer)');
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch('/api/generate-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleTitle: title, department, seniority: level })
      });
      const data = await res.json();
      if (data.job) {
        setTitle(data.job.title || title);
        setDepartment(data.job.department || department);
        setLevel(data.job.level || level);
        setMinExp(data.job.minExperienceYears || minExp);
        setEducation(data.job.minEducation || education);
        setRequiredSkills(data.job.requiredSkills || requiredSkills);
        setPreferredSkills(data.job.preferredSkills || preferredSkills);
        setDescription(data.job.description || description);
        if (data.job.weights) setWeights(data.job.weights);
      }
    } catch (e) {
      console.error('Failed to generate job with AI:', e);
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = () => {
    if (!title.trim()) return;

    const jobToSave: JobPosition = {
      id: existingJob?.id || `job-${Date.now()}`,
      title: title.trim(),
      department: department.trim(),
      level,
      minExperienceYears: Number(minExp) || 0,
      minEducation: education,
      requiredSkills,
      preferredSkills,
      description: description.trim() || `Position for ${title}`,
      weights
    };

    onSaveJob(jobToSave);
    onClose();
  };

  const totalWeight = weights.skills + weights.experience + weights.semanticNlp + weights.education;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {existingJob ? 'Edit Job Position & Criteria' : 'Create New Job Position'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Define required skills, experience thresholds, and ATS scoring weights.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* AI Autofill bar */}
          <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-indigo-900">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                Want Gemini AI to draft the entire job spec and required technical skills?
              </span>
            </div>
            <button
              type="button"
              onClick={handleGenerateWithAI}
              disabled={generating}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 shrink-0 flex items-center gap-1.5"
            >
              {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>Draft with Gemini AI</span>
            </button>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Job Position Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Machine Learning & NLP Engineer"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. AI Research"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Seniority Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
              >
                <option value="Entry / Junior">Entry / Junior (0-2 yrs)</option>
                <option value="Mid-Level">Mid-Level (3-4 yrs)</option>
                <option value="Senior">Senior (5-7 yrs)</option>
                <option value="Lead / Staff">Lead / Staff (8+ yrs)</option>
                <option value="Principal / Director">Principal / Director (10+ yrs)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Min Experience (Years)
              </label>
              <input
                type="number"
                min="0"
                max="25"
                value={minExp}
                onChange={(e) => setMinExp(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Minimum Education
              </label>
              <select
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
              >
                <option value="Associate Degree / Diploma">Associate Degree / Diploma</option>
                <option value="Bachelor's Degree">Bachelor's Degree</option>
                <option value="Master's Degree">Master's Degree</option>
                <option value="Ph.D. / Doctorate">Ph.D. / Doctorate</option>
              </select>
            </div>
          </div>

          {/* Required Skills Tag Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mandatory Required Skills (Hard ATS Gate)
            </label>
            <div className="flex flex-wrap gap-1.5 p-2 border border-slate-300 rounded-lg bg-slate-50 min-h-[46px] items-center">
              {requiredSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 font-mono text-xs bg-white border border-slate-200 text-slate-800 px-2 py-0.5 rounded shadow-2xs"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRequiredSkill(idx)}
                    className="text-slate-400 hover:text-rose-500"
                  >
                    ×
                  </button>
                </span>
              ))}
              <div className="flex items-center gap-1 flex-1 min-w-[140px]">
                <input
                  type="text"
                  value={newRequiredSkill}
                  onChange={(e) => setNewRequiredSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddRequiredSkill();
                    }
                  }}
                  placeholder="+ Add skill (e.g. pytorch)"
                  className="text-xs bg-transparent focus:outline-none flex-1 px-1"
                />
                <button
                  type="button"
                  onClick={handleAddRequiredSkill}
                  className="text-[11px] font-semibold text-indigo-600 px-1.5 py-0.5 rounded hover:bg-indigo-50"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Preferred Skills */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Preferred / Nice-to-Have Skills
            </label>
            <div className="flex flex-wrap gap-1.5 p-2 border border-slate-300 rounded-lg bg-slate-50 min-h-[46px] items-center">
              {preferredSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 font-mono text-xs bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded shadow-2xs"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemovePreferredSkill(idx)}
                    className="text-slate-400 hover:text-rose-500"
                  >
                    ×
                  </button>
                </span>
              ))}
              <div className="flex items-center gap-1 flex-1 min-w-[140px]">
                <input
                  type="text"
                  value={newPreferredSkill}
                  onChange={(e) => setNewPreferredSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddPreferredSkill();
                    }
                  }}
                  placeholder="+ Add preferred skill (e.g. kubernetes)"
                  className="text-xs bg-transparent focus:outline-none flex-1 px-1"
                />
                <button
                  type="button"
                  onClick={handleAddPreferredSkill}
                  className="text-[11px] font-semibold text-indigo-600 px-1.5 py-0.5 rounded hover:bg-indigo-50"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Scoring Weights Sliders */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-slate-500" />
                ATS Scoring Weight Distribution (Total: {totalWeight}%)
              </span>
              {totalWeight !== 100 && (
                <span className="text-[11px] font-semibold text-amber-600">
                  Weights should ideally sum to 100%
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>Skills Overlap Weight</span>
                  <span className="font-mono font-bold">{weights.skills}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={weights.skills}
                  onChange={(e) => setWeights({ ...weights, skills: Number(e.target.value) })}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>Experience Years Weight</span>
                  <span className="font-mono font-bold">{weights.experience}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={weights.experience}
                  onChange={(e) => setWeights({ ...weights, experience: Number(e.target.value) })}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>Semantic & NLP Cosine Weight</span>
                  <span className="font-mono font-bold">{weights.semanticNlp}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={weights.semanticNlp}
                  onChange={(e) => setWeights({ ...weights, semanticNlp: Number(e.target.value) })}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>Education Tier Weight</span>
                  <span className="font-mono font-bold">{weights.education}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={weights.education}
                  onChange={(e) => setWeights({ ...weights, education: Number(e.target.value) })}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Job Description Textarea */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Job Description (Used for TF-IDF Vectorization & Semantic Analysis)
            </label>
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Paste or write the job requirements and responsibilities..."
              className="w-full text-xs font-mono p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!title.trim()}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 transition-colors flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save Job Position</span>
          </button>
        </div>
      </div>
    </div>
  );
};
