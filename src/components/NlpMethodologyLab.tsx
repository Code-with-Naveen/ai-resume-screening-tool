import React, { useState } from 'react';
import { 
  cleanText, 
  tokenizeAndFilter, 
  calculateCosineSimilarity, 
  calculateJaccardSimilarity, 
  extractSkills,
  inspectDataCleaningPipeline,
  ENGLISH_STOPWORDS
} from '../utils/nlpEngine.ts';
import { 
  BookOpen, 
  Play, 
  Sparkles, 
  Binary, 
  Cpu, 
  Filter, 
  Layers, 
  RefreshCw,
  CheckCircle2
} from 'lucide-react';

export const NlpMethodologyLab: React.FC = () => {
  // Playground state
  const [sampleJD, setSampleJD] = useState(
    'Seeking a Senior Machine Learning Engineer with deep expertise in Python, PyTorch, Transformers, BERT, and NLP. Experience with Docker and vector databases required.'
  );
  const [sampleResume, setSampleResume] = useState(
    'Experienced ML and NLP specialist with 5 years building deep learning systems using PyTorch, Hugging Face Transformers, and BERT. Deployed Docker microservices and ChromaDB vector search.'
  );

  // Live Calculations
  const jdCleaning = inspectDataCleaningPipeline(sampleJD);
  const resumeCleaning = inspectDataCleaningPipeline(sampleResume);

  const jdTokens = tokenizeAndFilter(sampleJD);
  const resumeTokens = tokenizeAndFilter(sampleResume);

  const cosineSim = calculateCosineSimilarity(jdTokens, resumeTokens);
  const jaccardSim = calculateJaccardSimilarity(
    extractSkills(sampleJD),
    extractSkills(sampleResume)
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Overview Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
                <Cpu className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-900">
                NLP Architecture & Methodology Lab
              </h2>
            </div>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              Transparent explainability for how the AI-based Resume Screening Tool extracts text, cleans noisy tokens, evaluates vector space similarity, and benchmarks candidates.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <span>Stack: NLTK / TF-IDF / BERT / Cosine / Jaccard</span>
          </div>
        </div>
      </div>

      {/* 4 Core Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pillar 1: Data Cleaning */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-indigo-600">
            <Filter className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-900">
              1. Data Cleaning & Preprocessing (NLTK)
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Raw resumes contain unformatted headers, contact emails, phone numbers, and formatting noise. The preprocessing pipeline applies:
          </p>
          <ul className="text-xs space-y-1 text-slate-700">
            <li className="flex items-center gap-1.5">
              <span className="text-indigo-600 font-bold">•</span>
              <strong>Regex Sanitization:</strong> Strips URLs, email addresses, phone patterns, and special punctuation.
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-indigo-600 font-bold">•</span>
              <strong>Case Normalization:</strong> Lowercases all words while preserving tech symbols (e.g., C++, C#, .NET).
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-indigo-600 font-bold">•</span>
              <strong>Stopword Filtering:</strong> Removes 180+ standard English stopwords (NLTK corpus) like "the", "with", "from".
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-indigo-600 font-bold">•</span>
              <strong>Skill Entity Extraction:</strong> Multi-word boundary matching (e.g., "machine learning", "apache spark").
            </li>
          </ul>
        </div>

        {/* Pillar 2: TF-IDF & Cosine Similarity */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-blue-600">
            <Binary className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-900">
              2. TF-IDF & Cosine Similarity
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Transforms both Job Description and Resume into high-dimensional vector spaces and computes the cosine angle between them:
          </p>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono text-xs text-slate-800">
            Cosine(A, B) = (A · B) / (||A|| × ||B||)
          </div>
          <ul className="text-xs space-y-1 text-slate-700">
            <li className="flex items-center gap-1.5">
              <span className="text-blue-600 font-bold">•</span>
              <strong>Term Frequency (TF):</strong> Frequency of a token divided by total tokens in the document.
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-blue-600 font-bold">•</span>
              <strong>Inverse Document Frequency (IDF):</strong> Penalizes ubiquitous words, prioritizing unique requirements.
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-blue-600 font-bold">•</span>
              <strong>Range:</strong> Normalized between 0.0 (no overlap) to 1.0 (identical vector distribution).
            </li>
          </ul>
        </div>

        {/* Pillar 3: Jaccard Similarity */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-emerald-600">
            <Layers className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-900">
              3. Jaccard Similarity Index
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Measures the mathematical intersection over union between the candidate's exact technical skill set and the job's requirements:
          </p>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono text-xs text-slate-800">
            J(A, B) = |A ∩ B| / |A ∪ B|
          </div>
          <ul className="text-xs space-y-1 text-slate-700">
            <li className="flex items-center gap-1.5">
              <span className="text-emerald-600 font-bold">•</span>
              <strong>Intersection (A ∩ B):</strong> Skills present in both the Job Position and the candidate's CV.
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-emerald-600 font-bold">•</span>
              <strong>Union (A ∪ B):</strong> Total set of all distinct skills mentioned across both.
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-emerald-600 font-bold">•</span>
              <strong>Benefit:</strong> Unlike keyword counters, Jaccard penalizes resume keyword stuffing.
            </li>
          </ul>
        </div>

        {/* Pillar 4: Transformer & BERT Semantic Screening */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-purple-600">
            <Sparkles className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-900">
              4. BERT & Transformer Semantic AI
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Classical n-grams miss contextual synonyms (e.g. "authored neural architectures" vs "built deep learning models"). The transformer layer evaluates:
          </p>
          <ul className="text-xs space-y-1 text-slate-700">
            <li className="flex items-center gap-1.5">
              <span className="text-purple-600 font-bold">•</span>
              <strong>Contextual Semantics:</strong> Differentiates between junior toy projects and enterprise architecture.
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-purple-600 font-bold">•</span>
              <strong>Domain Seniority:</strong> Checks if years of experience correspond to senior engineering responsibilities.
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-purple-600 font-bold">•</span>
              <strong>Gap Probing:</strong> Synthesizes tailored interview questions specifically targeting identified omissions.
            </li>
          </ul>
        </div>
      </div>

      {/* Interactive NLP Simulator / Playground */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Play className="w-4 h-4 text-indigo-600" />
              Live Interactive NLP Playground
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Edit the text below to observe real-time vectorization, token sanitization, Cosine Similarity, and Jaccard Index.
            </p>
          </div>
          <button
            onClick={() => {
              setSampleJD('Seeking Senior NLP Engineer with Python, PyTorch, BERT, and Transformers for document processing.');
              setSampleResume('Experienced Machine Learning Engineer with 6 years Python, PyTorch, BERT, Transformers, and Docker.');
            }}
            className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-md border border-slate-200 hover:bg-slate-50"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo Snippets</span>
          </button>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Job Description Requirements (Snippet)
            </label>
            <textarea
              rows={4}
              value={sampleJD}
              onChange={(e) => setSampleJD(e.target.value)}
              className="w-full text-xs font-mono p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
              <span>{jdCleaning.rawWordsCount} words · {jdTokens.length} cleaned tokens</span>
              <span>Detected Skills: {extractSkills(sampleJD).join(', ') || 'None'}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Candidate Resume Profile (Snippet)
            </label>
            <textarea
              rows={4}
              value={sampleResume}
              onChange={(e) => setSampleResume(e.target.value)}
              className="w-full text-xs font-mono p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
              <span>{resumeCleaning.rawWordsCount} words · {resumeTokens.length} cleaned tokens</span>
              <span>Detected Skills: {extractSkills(sampleResume).join(', ') || 'None'}</span>
            </div>
          </div>
        </div>

        {/* Live Similarity Results Output */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Metric 1 */}
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 block">
                TF-IDF Cosine Similarity
              </span>
              <div className="text-3xl font-black font-mono text-indigo-600 mt-1">
                {Math.round(cosineSim.score * 100)}%
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Dot product: {cosineSim.dotProduct} · ||JD||: {cosineSim.magnitude1}
              </p>
            </div>

            {/* Metric 2 */}
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 block">
                Jaccard Skill Overlap
              </span>
              <div className="text-3xl font-black font-mono text-emerald-600 mt-1">
                {Math.round(jaccardSim.score * 100)}%
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Intersection: {jaccardSim.intersection.length} / Union: {jaccardSim.union.length}
              </p>
            </div>

            {/* Metric 3 */}
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 block">
                Blended Screening Fit
              </span>
              <div className="text-3xl font-black font-mono text-slate-900 mt-1">
                {Math.round((cosineSim.score * 0.6 + jaccardSim.score * 0.4) * 100)}%
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Composite of vector & set matching
              </p>
            </div>
          </div>

          {/* Shared Vector Components */}
          <div className="mt-4 pt-3 border-t border-slate-200">
            <span className="text-xs font-bold text-slate-700 block mb-2">
              Shared High-Weight Vector Tokens:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {cosineSim.sharedTokens.length > 0 ? (
                cosineSim.sharedTokens.map(token => (
                  <span key={token.token} className="font-mono text-xs px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-900">
                    {token.token}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">No shared tokens found</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
