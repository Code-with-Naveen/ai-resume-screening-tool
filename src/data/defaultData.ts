/**
 * Benchmark Datasets: Predefined Job Positions & Realistic Candidate Resumes
 * Covering ML/NLP, Full-Stack, DevOps, and Data Engineering roles.
 */

export interface JobPosition {
  id: string;
  title: string;
  department: string;
  level: string;
  minExperienceYears: number;
  minEducation: string;
  requiredSkills: string[];
  preferredSkills: string[];
  description: string;
  weights: {
    skills: number;       // default 35
    experience: number;   // default 25
    semanticNlp: number;  // default 25
    education: number;    // default 15
  };
}

export interface CandidateResume {
  id: string;
  name: string;
  currentTitle: string;
  email: string;
  phone: string;
  location: string;
  experienceYears: number;
  education: string;
  skills: string[];
  summary: string;
  fullRawText: string;
  status: 'new' | 'shortlisted' | 'interview' | 'reserve' | 'rejected';
  notes?: string;
  uploadedAt?: string;
}

export const DEFAULT_JOB_POSITIONS: JobPosition[] = [
  {
    id: 'job-ml-nlp',
    title: 'Senior Machine Learning Engineer (NLP & LLMs)',
    department: 'Artificial Intelligence & Research',
    level: 'Senior',
    minExperienceYears: 5,
    minEducation: 'Master\'s Degree',
    requiredSkills: ['python', 'pytorch', 'nlp', 'natural language processing', 'bert', 'transformers', 'docker', 'hugging face', 'machine learning'],
    preferredSkills: ['llm', 'generative ai', 'mlflow', 'langchain', 'rag', 'vector database', 'aws', 'kubernetes', 'nltk', 'spacy'],
    description: `We are looking for an experienced Senior Machine Learning Engineer specializing in Natural Language Processing (NLP) and Large Language Models (LLMs) to build intelligent document processing and semantic search systems.

Key Responsibilities:
- Design, train, and fine-tune transformer models (BERT, RoBERTa, LLaMA, GPT architectures) for text extraction, classification, and embeddings.
- Implement NLP pipelines incorporating tokenization, lemmatization, named entity recognition (NER), and semantic cosine similarity.
- Build production-grade RAG pipelines utilizing vector databases (ChromaDB, Pinecone, FAISS) and framework tooling (LangChain, LlamaIndex).
- Containerize and deploy models using Docker, Kubernetes, and AWS SageMaker with MLflow tracking.
- Collaborate with software engineers to integrate ML microservices via REST and gRPC endpoints.

Qualifications:
- Master's or Ph.D. in Computer Science, AI, Computational Linguistics, or related field.
- 5+ years of hands-on experience in machine learning with deep NLP focus.
- Advanced proficiency in Python, PyTorch, Hugging Face Transformers, NLTK, and scikit-learn.
- Strong software engineering foundations including CI/CD, Git, and automated testing.`,
    weights: {
      skills: 35,
      experience: 25,
      semanticNlp: 25,
      education: 15
    }
  },
  {
    id: 'job-fullstack',
    title: 'Lead Full-Stack Software Engineer',
    department: 'Core Product Engineering',
    level: 'Lead / Staff',
    minExperienceYears: 6,
    minEducation: 'Bachelor\'s Degree',
    requiredSkills: ['react', 'typescript', 'node.js', 'postgresql', 'system design', 'rest api', 'docker', 'microservices'],
    preferredSkills: ['next.js', 'graphql', 'aws', 'redis', 'tailwind css', 'ci/cd', 'unit testing', 'jest'],
    description: `We are seeking a Lead Full-Stack Software Engineer to architect and scale our enterprise SaaS platform. You will lead technical design across modern frontend architectures and high-throughput backend services.

Key Responsibilities:
- Lead the architecture and implementation of responsive web applications using React, Next.js, and TypeScript.
- Design resilient backend microservices using Node.js, Express, and PostgreSQL with Redis caching.
- Drive clean system design, database indexing, GraphQL/REST API contracts, and high availability.
- Mentor junior engineers, establish coding standards, and enhance CI/CD automation.

Qualifications:
- Bachelor's or Master's in Computer Science or equivalent practical experience.
- 6+ years building commercial full-stack web applications at scale.
- Deep expertise in React, TypeScript, Node.js, and relational databases.`,
    weights: {
      skills: 40,
      experience: 30,
      semanticNlp: 20,
      education: 10
    }
  },
  {
    id: 'job-devops',
    title: 'Cloud DevOps & Platform Architect',
    department: 'Infrastructure & SRE',
    level: 'Senior',
    minExperienceYears: 5,
    minEducation: 'Bachelor\'s Degree',
    requiredSkills: ['kubernetes', 'terraform', 'aws', 'docker', 'ci/cd', 'linux', 'bash', 'monitoring'],
    preferredSkills: ['prometheus', 'grafana', 'python', 'go', 'helm', 'ansible', 'github actions'],
    description: `Seeking a senior Cloud DevOps & Infrastructure Engineer to own our multi-region Kubernetes clusters and automated deployment platforms.

Key Responsibilities:
- Manage multi-cloud AWS infrastructure as code using Terraform and Helm.
- Maintain production Kubernetes (EKS) clusters, service mesh, and observability suites (Prometheus, Grafana).
- Implement robust zero-downtime CI/CD pipelines with GitHub Actions.
- Optimize cloud spend, security posture, and Disaster Recovery readiness.`,
    weights: {
      skills: 40,
      experience: 30,
      semanticNlp: 20,
      education: 10
    }
  },
  {
    id: 'job-data-eng',
    title: 'Senior Data Engineer (Distributed Systems)',
    department: 'Data Platform & Analytics',
    level: 'Senior',
    minExperienceYears: 4,
    minEducation: 'Bachelor\'s Degree',
    requiredSkills: ['python', 'sql', 'apache spark', 'airflow', 'snowflake', 'kafka', 'etl'],
    preferredSkills: ['dbt', 'bigquery', 'pyspark', 'databricks', 'docker', 'aws', 'scrum'],
    description: `Looking for a Senior Data Engineer to design petabyte-scale data pipelines, lakehouse architectures, and streaming event ingestion systems.

Key Responsibilities:
- Construct reliable distributed ETL/ELT pipelines using Apache Spark, PySpark, and dbt.
- Orchestrate DAGs using Apache Airflow; manage real-time event streams with Apache Kafka.
- Model data schemas in Snowflake and BigQuery for business analytics and machine learning feature stores.`,
    weights: {
      skills: 40,
      experience: 25,
      semanticNlp: 25,
      education: 10
    }
  }
];

export const DEFAULT_CANDIDATE_RESUMES: CandidateResume[] = [
  {
    id: 'cand-alex-morgan',
    name: 'Alex Morgan',
    currentTitle: 'Senior NLP & Machine Learning Engineer',
    email: 'alex.morgan.ai@example.com',
    phone: '+1 (555) 234-8901',
    location: 'San Francisco, CA (Open to Remote)',
    experienceYears: 6,
    education: 'Master\'s Degree in Computer Science, Stanford University',
    skills: ['python', 'pytorch', 'nlp', 'natural language processing', 'bert', 'transformers', 'hugging face', 'docker', 'machine learning', 'llm', 'generative ai', 'langchain', 'vector database', 'chromadb', 'mlflow', 'aws', 'kubernetes', 'nltk', 'spacy', 'scikit-learn', 'git'],
    summary: 'Senior ML Engineer with 6 years of expertise in NLP, deep learning, and transformer architectures. Developed state-of-the-art document processing models using BERT, RoBERTa, and LLM orchestration.',
    fullRawText: `Alex Morgan
Senior NLP & Machine Learning Engineer
San Francisco, CA | alex.morgan.ai@example.com | (555) 234-8901 | linkedin.com/in/alexmorgan-nlp

PROFESSIONAL SUMMARY:
Results-driven Senior Machine Learning Engineer with 6+ years of specialized experience in Natural Language Processing (NLP), Transformer models, and production AI architectures. Spearheaded enterprise NLP pipelines delivering 94% text classification accuracy and 3x throughput speedups.

CORE SKILLS:
- Languages: Python, C++, SQL, Bash
- AI / ML / NLP: PyTorch, Hugging Face Transformers, BERT, RoBERTa, LLMs, LangChain, NLTK, spaCy, scikit-learn, Vector Databases, ChromaDB, FAISS, RAG, Cosine Similarity, Jaccard Index
- MLOps & Cloud: Docker, Kubernetes, AWS SageMaker, MLflow, CI/CD, Git, Linux, REST API

PROFESSIONAL EXPERIENCE:
Senior NLP Engineer | Synthetix AI Labs (2021 - Present)
- Architected enterprise semantic search and resume screening pipeline using fine-tuned BERT and dense passage retrieval, processing 500,000+ documents monthly.
- Engineered Retrieval-Augmented Generation (RAG) system with LangChain and vector databases, reducing hallucination rates by 42%.
- Deployed PyTorch transformer models into Kubernetes microservices via Docker, optimizing latency with ONNX Runtime to under 45ms.
- Implemented automated MLflow experiment tracking and model registry workflows.

Machine Learning Engineer | DataVision Technologies (2018 - 2021)
- Developed deep learning models for text classification and sentiment extraction using PyTorch and NLTK.
- Built preprocessing pipelines incorporating tokenization, lemmatization, and TF-IDF cosine similarity metrics.
- Containerized model training workflows using Docker and orchestrated AWS batch GPU jobs.

EDUCATION:
- Master of Science (M.S.) in Computer Science (AI & NLP Specialization), Stanford University (2016 - 2018)
- Bachelor of Science (B.S.) in Software Engineering, UC Berkeley (2012 - 2016)`,
    status: 'new'
  },
  {
    id: 'cand-carlos-mendez',
    name: 'Dr. Carlos Mendez',
    currentTitle: 'Staff AI Research Scientist & NLP Architect',
    email: 'carlos.mendez.phd@example.com',
    phone: '+1 (555) 872-4190',
    location: 'Boston, MA (Hybrid)',
    experienceYears: 7,
    education: 'Ph.D. / Doctorate in Computational Linguistics, MIT',
    skills: ['python', 'pytorch', 'tensorflow', 'nlp', 'natural language processing', 'bert', 'transformers', 'hugging face', 'llm', 'generative ai', 'deep learning', 'machine learning', 'nltk', 'spacy', 'scikit-learn', 'docker', 'mlflow', 'rag', 'system design'],
    summary: 'Ph.D. NLP Researcher with 7 years advancing transformer architectures, cross-lingual representations, and semantic matching algorithms.',
    fullRawText: `Dr. Carlos Mendez, Ph.D.
Staff AI Research Scientist & NLP Specialist
Boston, MA | carlos.mendez.phd@example.com | (555) 872-4190

EXECUTIVE SUMMARY:
Computational Linguist and Machine Learning Specialist with Ph.D. from MIT and 7 years of post-graduate industrial research. Published 6 papers in ACL, EMNLP on BERT attention mechanics, syntactic parsing, and semantic text similarity.

TECHNICAL SKILLS:
- Deep Learning & NLP: PyTorch, TensorFlow, Transformers, BERT, GPT, Hugging Face, NLTK, spaCy, Word2Vec, TF-IDF, Cosine Similarity, Jaccard Similarity, Information Retrieval
- Systems & Deployments: Python, C++, Docker, Linux, Git, MLflow, Ray, System Design, REST API

EXPERIENCE:
Staff Research Scientist | CogniTech AI (2020 - Present)
- Designed novel pre-training objectives for domain-specific BERT models in legal and enterprise HR matching.
- Led the implementation of high-dimensional semantic vector search over 10M+ documents using FAISS and Cosine Similarity.
- Managed ML research team of 5 engineers, establishing strict evaluation benchmarks and automated NLTK data cleaning pipelines.

Senior Research Engineer | Language Intelligence Corp (2017 - 2020)
- Built deep learning models with PyTorch and NLTK for entity extraction and document summarization.
- Integrated Dockerized inference microservices into cloud staging environments.

EDUCATION:
- Ph.D. in Computational Linguistics & Computer Science, Massachusetts Institute of Technology (MIT) (2013 - 2017)
- B.S. in Computer Science & Applied Mathematics, Carnegie Mellon University (2009 - 2013)`,
    status: 'new'
  },
  {
    id: 'cand-priya-sharma',
    name: 'Priya Sharma',
    currentTitle: 'Lead Full-Stack & Systems Engineer',
    email: 'priya.sharma.dev@example.com',
    phone: '+1 (555) 349-2184',
    location: 'Seattle, WA (Remote)',
    experienceYears: 7,
    education: 'Bachelor\'s Degree in Computer Science, University of Washington',
    skills: ['react', 'typescript', 'javascript', 'node.js', 'express', 'postgresql', 'system design', 'rest api', 'graphql', 'docker', 'microservices', 'redis', 'next.js', 'aws', 'tailwind css', 'ci/cd', 'unit testing', 'jest', 'git'],
    summary: 'Lead Full-Stack Engineer with 7 years creating high-scale web platforms. Specialized in React, TypeScript, Node.js microservices, PostgreSQL, and modern cloud deployment pipelines.',
    fullRawText: `Priya Sharma
Lead Full-Stack Software Engineer
Seattle, WA | priya.sharma.dev@example.com | (555) 349-2184 | github.com/priyasharma

OVERVIEW:
Accomplished Lead Full-Stack Engineer with 7 years of engineering experience architecting scalable React frontends and Node.js microservices handling 40,000+ requests per minute.

TECHNICAL PROFICIENCIES:
- Frontend: React, Next.js, TypeScript, JavaScript, Tailwind CSS, Redux, State Management, Responsive Design
- Backend: Node.js, Express, REST API, GraphQL, PostgreSQL, Redis, Microservices, System Design
- DevOps & Tools: Docker, AWS (ECS, S3, RDS), GitHub Actions, CI/CD, Jest, Git, Agile/Scrum

PROFESSIONAL EXPERIENCE:
Lead Full-Stack Engineer | CloudScale Commerce (2021 - Present)
- Spearheaded frontend architecture redesign using React 18, TypeScript, and Next.js, cutting Core Web Vitals LCP by 55%.
- Architected distributed backend services in Node.js and Express with PostgreSQL and Redis caching layer.
- Designed comprehensive RESTful and GraphQL API schemas used across web and mobile clients.
- Championed CI/CD automation with GitHub Actions, enforcing unit testing (Jest) and integration test suites.

Senior Software Engineer | FinTech Wave (2017 - 2021)
- Developed secure transaction portals using React, TypeScript, and Node.js.
- Engineered PostgreSQL relational schemas, query tuning, and database migrations.
- Containerized local and staging environments with Docker.

EDUCATION:
- Bachelor of Science (B.S.) in Computer Science, University of Washington (2013 - 2017)`,
    status: 'new'
  },
  {
    id: 'cand-david-chen',
    name: 'David Chen',
    currentTitle: 'Principal Cloud DevOps & SRE Architect',
    email: 'david.chen.cloud@example.com',
    phone: '+1 (555) 912-3456',
    location: 'Austin, TX',
    experienceYears: 8,
    education: 'Bachelor\'s Degree in Computer Engineering, UT Austin',
    skills: ['kubernetes', 'terraform', 'aws', 'docker', 'ci/cd', 'linux', 'bash', 'monitoring', 'prometheus', 'grafana', 'python', 'go', 'golang', 'helm', 'ansible', 'github actions', 'system design', 'git'],
    summary: 'Principal DevOps Architect with 8 years designing production AWS infrastructures, Kubernetes orchestration, GitOps automation, and zero-downtime CI/CD pipelines.',
    fullRawText: `David Chen
Principal Cloud DevOps & SRE Architect
Austin, TX | david.chen.cloud@example.com | (555) 912-3456

SUMMARY:
Results-focused DevOps & Infrastructure Architect with 8+ years experience designing immutable cloud platforms across AWS and multi-cloud Kubernetes environments.

CORE COMPETENCIES:
- Cloud & Containers: AWS (EKS, VPC, IAM, RDS), Docker, Kubernetes (K8s), Helm, Terraform, Ansible
- CI/CD & Automation: GitHub Actions, Jenkins, GitOps, Bash scripting, Python, Go (Golang)
- Observability: Prometheus, Grafana, Datadog, ELK Stack, Distributed Tracing, Linux Internals

WORK EXPERIENCE:
Principal Platform Architect | Horizon Cloud Systems (2020 - Present)
- Architected enterprise Kubernetes (EKS) clusters supporting 300+ microservices with automated autoscaling.
- Standardized Terraform Infrastructure-as-Code modules for 12 distributed engineering teams.
- Built automated GitOps release pipelines with GitHub Actions and Helm, achieving 99.99% service availability.
- Established observability dashboards using Prometheus and Grafana for latency and error budgeting.

Senior DevOps Engineer | Nexus Global (2016 - 2020)
- Automated AWS provisioning using Terraform and CloudFormation.
- Managed containerization of legacy monolithic apps into Docker microservices.
- Administered Linux production servers, hardening security and SSH configurations.

EDUCATION:
- B.S. in Computer Engineering, University of Texas at Austin (2012 - 2016)`,
    status: 'new'
  },
  {
    id: 'cand-elena-rostova',
    name: 'Elena Rostova',
    currentTitle: 'Senior Big Data & Analytics Engineer',
    email: 'elena.rostova.data@example.com',
    phone: '+1 (555) 674-8921',
    location: 'Chicago, IL',
    experienceYears: 5,
    education: 'Master\'s Degree in Data Science, Northwestern University',
    skills: ['python', 'sql', 'apache spark', 'pyspark', 'airflow', 'snowflake', 'kafka', 'etl', 'dbt', 'bigquery', 'docker', 'aws', 'git', 'pandas', 'numpy'],
    summary: 'Data Engineer with 5 years creating scalable distributed data pipelines with Spark, Snowflake, Airflow, and Kafka for analytics and real-time processing.',
    fullRawText: `Elena Rostova
Senior Big Data & Analytics Engineer
Chicago, IL | elena.rostova.data@example.com | (555) 674-8921

SUMMARY:
Data Platform Engineer with 5 years of experience architecting high-throughput data lakes and modern analytics warehouses utilizing Apache Spark, Snowflake, Airflow, and dbt.

TECHNICAL SKILLS:
- Data Processing: Apache Spark, PySpark, SQL, Python, pandas, Kafka, Airflow, dbt
- Cloud Warehouses: Snowflake, Google BigQuery, AWS S3, Redshift, Databricks
- Engineering: Docker, Git, CI/CD, Data Modeling, ETL/ELT pipelines

EXPERIENCE:
Senior Data Engineer | Apex Data Labs (2021 - Present)
- Designed distributed Spark & PySpark streaming pipelines processing 3TB of telemetry daily.
- Built modular dbt transformation workflows in Snowflake data warehouse.
- Orchestrated over 80 dependent DAGs in Apache Airflow with automated slack alerting.

Data Engineer | Metro Analytics (2019 - 2021)
- Developed batch ETL jobs in Python and SQL into AWS Redshift.
- Automated data quality validation tests, cutting pipeline discrepancies by 60%.

EDUCATION:
- M.S. in Data Science, Northwestern University (2017 - 2019)
- B.S. in Applied Statistics, University of Illinois (2013 - 2017)`,
    status: 'new'
  },
  {
    id: 'cand-marcus-vance',
    name: 'Marcus Vance',
    currentTitle: 'Junior Python & Data Analyst',
    email: 'marcus.vance.jr@example.com',
    phone: '+1 (555) 438-1920',
    location: 'Denver, CO',
    experienceYears: 2,
    education: 'Bachelor\'s Degree in Information Systems, Colorado State',
    skills: ['python', 'sql', 'pandas', 'numpy', 'scikit-learn', 'flask', 'git', 'html5', 'css3', 'machine learning'],
    summary: 'Junior developer with 2 years practical experience in Python scripting, basic scikit-learn models, SQL reporting, and Flask APIs.',
    fullRawText: `Marcus Vance
Junior Python Developer / Data Analyst
Denver, CO | marcus.vance.jr@example.com | (555) 438-1920

SUMMARY:
Enthusiastic Junior Python Developer with 2 years of professional experience writing automated ETL scripts, basic machine learning models with scikit-learn, and lightweight Flask web tools. Eager to grow in NLP and backend engineering.

SKILLS:
- Python, SQL, Flask, pandas, numpy, scikit-learn, Git, Linux, basic Docker

EXPERIENCE:
Junior Python Developer | Alpine Solutions (2022 - Present)
- Wrote Python automation scripts and pandas workflows for customer reporting.
- Built internal Flask API endpoints for data querying against PostgreSQL.
- Experimented with simple scikit-learn classification models.

Data Intern | Rocky Tech (2021 - 2022)
- Cleaned and prepared CSV datasets using Python and Excel.
- Authored SQL queries for business intelligence dashboards.

EDUCATION:
- B.S. in Information Systems, Colorado State University (2018 - 2022)`,
    status: 'new'
  },
  {
    id: 'cand-sophia-taylor',
    name: 'Sophia Taylor',
    currentTitle: 'Cybersecurity Analyst & Threat Hunter',
    email: 'sophia.taylor.sec@example.com',
    phone: '+1 (555) 555-8392',
    location: 'New York, NY',
    experienceYears: 4,
    education: 'Bachelor\'s Degree in Cybersecurity, NYU',
    skills: ['python', 'bash', 'linux', 'git', 'rest api', 'sql'],
    summary: 'Cybersecurity specialist with 4 years in security operations, threat hunting, SIEM log analysis, and incident response scripting.',
    fullRawText: `Sophia Taylor
Cybersecurity & Network Defense Analyst
New York, NY | sophia.taylor.sec@example.com | (555) 555-8392

SUMMARY:
Dedicated Information Security Analyst with 4 years safeguarding corporate infrastructure through active threat hunting, firewall management, and Python security automation.

SKILLS:
- Security: SIEM (Splunk), WireShark, Penetration Testing, Vulnerability Scanning
- Systems: Linux, Bash scripting, Python, Network Protocols (TCP/IP, DNS)

EXPERIENCE:
Cybersecurity Analyst | Vanguard Defense (2020 - Present)
- Investigated high-severity security incidents across 4,000 endpoint devices.
- Developed custom Python scripts to parse firewall logs and alert on brute-force attempts.

EDUCATION:
- B.S. in Cybersecurity & Forensics, New York University (2016 - 2020)`,
    status: 'new'
  },
  {
    id: 'cand-aisha-patel',
    name: 'Aisha Patel',
    currentTitle: 'Frontend React Engineer',
    email: 'aisha.patel.ui@example.com',
    phone: '+1 (555) 789-3210',
    location: 'San Jose, CA',
    experienceYears: 3,
    education: 'Bachelor\'s Degree in Computer Science, San Jose State University',
    skills: ['react', 'javascript', 'typescript', 'tailwind css', 'html5', 'css3', 'redux', 'git', 'jest', 'rest api'],
    summary: 'Frontend Engineer with 3 years building clean, accessible React and Tailwind CSS user interfaces. Focused on component modularity and web performance.',
    fullRawText: `Aisha Patel
Frontend React Developer
San Jose, CA | aisha.patel.ui@example.com | (555) 789-3210

PROFESSIONAL PROFILE:
Creative and detail-oriented Frontend Developer with 3 years of hands-on experience designing responsive, accessible web applications using React, TypeScript, and modern CSS frameworks.

SKILLS:
- Frontend: React, JavaScript (ES6+), TypeScript, Tailwind CSS, HTML5, CSS3, Redux Toolkit
- Tools: Git, npm, Vite, Jest, Figma, REST API integration

EXPERIENCE:
Frontend Developer | PixelCraft Studio (2021 - Present)
- Engineered 15+ customer-facing web interfaces using React and Tailwind CSS.
- Optimized bundle sizes and lazy-loaded assets, improving Lighthouse scores to 95+.
- Wrote component unit tests using Jest and React Testing Library.

Junior Web Developer | Innovate Web (2020 - 2021)
- Maintained responsive landing pages and implemented UI state in Redux.

EDUCATION:
- B.S. in Computer Science, San Jose State University (2016 - 2020)`,
    status: 'new'
  }
];
