/**
 * Core NLP & Similarity Engine for Resume Screening
 * Implements NLTK-style preprocessing, Stopword Removal, Tokenization,
 * TF-IDF Vectorization, Cosine Similarity, and Jaccard Similarity.
 */

// Comprehensive English stopwords list (equivalent to NLTK stopwords.words('english'))
export const ENGLISH_STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can\'t', 'cannot', 'could',
  'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during', 'each', 'few', 'for',
  'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s',
  'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i', 'i\'d', 'i\'ll', 'i\'m',
  'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s', 'me', 'more', 'most', 'mustn\'t',
  'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours',
  'ourselves', 'out', 'over', 'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll', 'she\'s', 'should', 'shouldn\'t',
  'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there',
  'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve', 'this', 'those', 'through', 'to', 'too',
  'under', 'until', 'up', 'very', 'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t',
  'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which', 'while', 'who', 'who\'s', 'whom', 'why', 'why\'s',
  'with', 'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d', 'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself',
  'yourselves', 'also', 'etc', 'including', 'various', 'using', 'used', 'use', 'across', 'within', 'well', 'via', 'per'
]);

// Common technical skills and phrases dictionary for high-precision extraction
export const COMMON_SKILLS = [
  // Programming Languages
  'python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'c', 'go', 'golang', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'scala', 'r', 'julia', 'sql', 'bash', 'shell',
  // AI / ML / Data Science
  'machine learning', 'deep learning', 'nlp', 'natural language processing', 'computer vision', 'bert', 'transformers', 'llm', 'llms', 'large language models', 'generative ai', 'genai', 'pytorch', 'tensorflow', 'keras', 'scikit-learn', 'nltk', 'spacy', 'hugging face', 'opencv', 'pandas', 'numpy', 'scipy', 'matplotlib', 'seaborn', 'xgboost', 'lightgbm', 'langchain', 'llamaindex', 'rag', 'vector database', 'chromadb', 'pinecone', 'milvus', 'faiss', 'mlflow', 'kubeflow',
  // Big Data & Cloud
  'apache spark', 'pyspark', 'hadoop', 'kafka', 'airflow', 'dbt', 'snowflake', 'databricks', 'bigquery', 'redshift', 'aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'k8s', 'terraform', 'ansible', 'helm', 'ci/cd', 'github actions', 'jenkins', 'gitlab ci',
  // Web Development & Backend
  'react', 'react.js', 'reactjs', 'next.js', 'vue', 'vue.js', 'angular', 'node.js', 'nodejs', 'express', 'express.js', 'fastapi', 'flask', 'django', 'spring boot', 'graphql', 'rest api', 'restful', 'grpc', 'tailwind css', 'html5', 'css3', 'redux', 'zustand',
  // Databases
  'postgresql', 'postgres', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'cassandra', 'dynamodb', 'sqlite', 'neo4j', 'prisma', 'drizzle',
  // Engineering Practices
  'agile', 'scrum', 'system design', 'microservices', 'unit testing', 'jest', 'pytest', 'tdd', 'git', 'linux', 'clean architecture', 'monitoring', 'prometheus', 'grafana', 'datadog'
];

/**
 * Step 1: Clean raw text
 * Removes emails, phone numbers, special characters, converts to lowercase
 */
export function cleanText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, ' ') // Remove URLs
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, ' ') // Remove emails
    .replace(/[\+\(]?[0-9]{1,3}\)?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/g, ' ') // Remove phone numbers
    .replace(/[^a-z0-9+#.\s-]/g, ' ') // Keep technical symbols like c++, c#, .net
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Step 2: Tokenization & Stopword Filtering
 */
export function tokenizeAndFilter(text: string): string[] {
  const cleaned = cleanText(text);
  // Split on whitespace or punctuation that is not part of tech names
  const rawTokens = cleaned.split(/[\s,;/]+/).filter(t => t.length > 1);
  
  return rawTokens.filter(token => {
    // Preserve tech like c++, c#, .net, r, go
    if (['c++', 'c#', '.net', 'r', 'go', 'ai', 'ml', 'ui', 'ux'].includes(token)) return true;
    return !ENGLISH_STOPWORDS.has(token);
  });
}

/**
 * Extract multi-word and single-word skills from text
 */
export function extractSkills(text: string): string[] {
  const lower = text.toLowerCase();
  const matched = new Set<string>();

  for (const skill of COMMON_SKILLS) {
    // Word boundary check
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|[^a-zA-Z0-9+#-])${escaped}(?=[^a-zA-Z0-9+#-]|$|\\b)`, 'i');
    if (regex.test(lower)) {
      matched.add(skill);
    }
  }

  return Array.from(matched);
}

/**
 * Extract estimated years of experience from resume text
 */
export function extractExperienceYears(text: string): number {
  const matches = [
    /(\d+)\+?\s*(?:years?|yrs?)(?:\s+of)?(?:\s+experience)?/gi,
    /experience(?:\s+of)?\s*(\d+)\+?\s*(?:years?|yrs?)/gi
  ];

  let maxYears = 0;
  for (const regex of matches) {
    let match;
    while ((match = regex.exec(text)) !== null) {
      const yrs = parseInt(match[1], 10);
      if (!isNaN(yrs) && yrs > 0 && yrs < 45) {
        if (yrs > maxYears) maxYears = yrs;
      }
    }
  }

  // Also check year spans like 2018 - 2024
  const yearSpanRegex = /\b(19\d{2}|20\d{2})\s*[-–—to]+\s*(19\d{2}|20\d{2}|present|current)\b/gi;
  let spanMatch;
  let totalSpanYears = 0;
  const currentYear = new Date().getFullYear();

  while ((spanMatch = yearSpanRegex.exec(text)) !== null) {
    const start = parseInt(spanMatch[1], 10);
    const endStr = spanMatch[2].toLowerCase();
    const end = (endStr === 'present' || endStr === 'current') ? currentYear : parseInt(endStr, 10);
    if (!isNaN(start) && !isNaN(end) && end >= start) {
      totalSpanYears += Math.min(15, end - start);
    }
  }

  return Math.max(maxYears, Math.min(25, totalSpanYears));
}

/**
 * Extract education level
 */
export function extractEducationLevel(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('ph.d') || lower.includes('phd') || lower.includes('doctorate')) {
    return 'Ph.D. / Doctorate';
  }
  if (lower.includes('master') || lower.includes('m.s') || lower.includes('ms in') || lower.includes('msc') || lower.includes('m.tech') || lower.includes('mba')) {
    return 'Master\'s Degree';
  }
  if (lower.includes('bachelor') || lower.includes('b.s') || lower.includes('bs in') || lower.includes('b.tech') || lower.includes('b.e') || lower.includes('undergraduate')) {
    return 'Bachelor\'s Degree';
  }
  if (lower.includes('associate') || lower.includes('diploma')) {
    return 'Associate Degree / Diploma';
  }
  return 'Not Specified / Bachelor Equivalent';
}

/**
 * Calculate Jaccard Similarity between two sets of items (e.g. skills or words)
 * J(A, B) = |A ∩ B| / |A ∪ B|
 */
export function calculateJaccardSimilarity(setA: string[] | Set<string>, setB: string[] | Set<string>): {
  score: number;
  intersection: string[];
  union: string[];
} {
  const a = new Set(Array.from(setA).map(s => s.toLowerCase().trim()));
  const b = new Set(Array.from(setB).map(s => s.toLowerCase().trim()));

  if (a.size === 0 && b.size === 0) {
    return { score: 1.0, intersection: [], union: [] };
  }
  if (a.size === 0 || b.size === 0) {
    return { score: 0.0, intersection: [], union: Array.from(new Set([...a, ...b])) };
  }

  const intersection: string[] = [];
  a.forEach(item => {
    if (b.has(item)) {
      intersection.push(item);
    }
  });

  const union = Array.from(new Set([...a, ...b]));
  const score = union.length > 0 ? intersection.length / union.length : 0;

  return {
    score: Math.round(score * 1000) / 1000,
    intersection,
    union
  };
}

/**
 * Build Term Frequency (TF) map
 */
export function computeTF(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  if (tokens.length === 0) return tf;

  for (const token of tokens) {
    tf.set(token, (tf.get(token) || 0) + 1);
  }

  // Normalized TF (frequency / total tokens)
  for (const [key, count] of tf.entries()) {
    tf.set(key, count / tokens.length);
  }

  return tf;
}

/**
 * Calculate Cosine Similarity using TF-IDF vectors
 * Cosine(A, B) = (A · B) / (||A|| * ||B||)
 */
export function calculateCosineSimilarity(doc1Tokens: string[], doc2Tokens: string[]): {
  score: number;
  dotProduct: number;
  magnitude1: number;
  magnitude2: number;
  sharedTokens: { token: string; weightDoc1: number; weightDoc2: number }[];
} {
  if (doc1Tokens.length === 0 || doc2Tokens.length === 0) {
    return { score: 0, dotProduct: 0, magnitude1: 0, magnitude2: 0, sharedTokens: [] };
  }

  const tf1 = computeTF(doc1Tokens);
  const tf2 = computeTF(doc2Tokens);

  // Vocabulary across both documents
  const vocab = new Set([...tf1.keys(), ...tf2.keys()]);

  // Inverse Document Frequency (IDF) with smoothing: idf = log(1 + N/df)
  // For two documents (Job Description and Resume):
  const idf = new Map<string, number>();
  for (const term of vocab) {
    let df = 0;
    if (tf1.has(term)) df += 1;
    if (tf2.has(term)) df += 1;
    // Standard smoothed IDF
    idf.set(term, Math.log(1 + 2 / df));
  }

  let dotProduct = 0;
  let sumSq1 = 0;
  let sumSq2 = 0;
  const sharedTokens: { token: string; weightDoc1: number; weightDoc2: number }[] = [];

  for (const term of vocab) {
    const weight1 = (tf1.get(term) || 0) * (idf.get(term) || 1);
    const weight2 = (tf2.get(term) || 0) * (idf.get(term) || 1);

    sumSq1 += weight1 * weight1;
    sumSq2 += weight2 * weight2;
    dotProduct += weight1 * weight2;

    if (tf1.has(term) && tf2.has(term)) {
      sharedTokens.push({
        token: term,
        weightDoc1: Math.round(weight1 * 1000) / 1000,
        weightDoc2: Math.round(weight2 * 1000) / 1000
      });
    }
  }

  const mag1 = Math.sqrt(sumSq1);
  const mag2 = Math.sqrt(sumSq2);

  let score = 0;
  if (mag1 > 0 && mag2 > 0) {
    score = dotProduct / (mag1 * mag2);
  }

  // Sort shared tokens by highest mutual contribution
  sharedTokens.sort((a, b) => (b.weightDoc1 * b.weightDoc2) - (a.weightDoc1 * a.weightDoc2));

  return {
    score: Math.min(1.0, Math.max(0, Math.round(score * 1000) / 1000)),
    dotProduct: Math.round(dotProduct * 1000) / 1000,
    magnitude1: Math.round(mag1 * 1000) / 1000,
    magnitude2: Math.round(mag2 * 1000) / 1000,
    sharedTokens: sharedTokens.slice(0, 15)
  };
}

/**
 * Data Cleaning Pipeline step inspector for NLP Explainability
 */
export function inspectDataCleaningPipeline(rawText: string) {
  const step1Cleaned = cleanText(rawText);
  const step2RawTokens = step1Cleaned.split(/[\s,;/]+/).filter(t => t.length > 0);
  const step3FilteredTokens = tokenizeAndFilter(rawText);
  const step4ExtractedSkills = extractSkills(rawText);
  const step5TF = computeTF(step3FilteredTokens);

  const topTerms = Array.from(step5TF.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([term, freq]) => ({ term, freq: Math.round(freq * 1000) / 10 }));

  return {
    rawLength: rawText.length,
    rawWordsCount: rawText.trim().split(/\s+/).length,
    cleanedTextSample: step1Cleaned.slice(0, 200) + (step1Cleaned.length > 200 ? '...' : ''),
    rawTokenCount: step2RawTokens.length,
    filteredTokenCount: step3FilteredTokens.length,
    removedStopwordsCount: step2RawTokens.length - step3FilteredTokens.length,
    extractedSkills: step4ExtractedSkills,
    topTerms
  };
}
