import { AtsMatchResult, ResumeItem } from '../types';

// Curated tech & domain skill taxonomy for robust ATS matching
export const ATS_KEYWORD_DICTIONARY: Record<string, string[]> = {
  frontend: [
    'React', 'TypeScript', 'JavaScript', 'Next.js', 'Vue', 'Angular', 'Svelte',
    'HTML5', 'CSS3', 'Tailwind CSS', 'Sass', 'Redux', 'Zustand', 'GraphQL',
    'REST APIs', 'Webpack', 'Vite', 'Jest', 'Cypress', 'Playwright', 'Figma',
    'Responsive Design', 'Web Accessibility', 'WCAG', 'State Management',
    'Performance Optimization', 'Micro-frontends', 'SSR', 'PWA'
  ],
  backend: [
    'Node.js', 'Express', 'Python', 'Django', 'FastAPI', 'Java', 'Spring Boot',
    'Go', 'Golang', 'Ruby on Rails', 'PHP', 'C#', '.NET', 'Rust', 'C++',
    'Microservices', 'RESTful APIs', 'GraphQL', 'gRPC', 'WebSockets', 'System Design',
    'Distributed Systems', 'Message Queue', 'Concurrency', 'API Design'
  ],
  database: [
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'DynamoDB',
    'Cassandra', 'SQLite', 'Oracle', 'SQL', 'NoSQL', 'Prisma', 'Drizzle',
    'Database Optimization', 'Indexing', 'Data Modeling', 'Database Sharding'
  ],
  cloud_devops: [
    'AWS', 'Amazon Web Services', 'GCP', 'Google Cloud', 'Azure', 'Docker',
    'Kubernetes', 'K8s', 'Terraform', 'CI/CD', 'GitHub Actions', 'Jenkins',
    'GitLab CI', 'Linux', 'Serverless', 'Lambda', 'S3', 'CloudFront',
    'Monitoring', 'Datadog', 'Prometheus', 'Grafana'
  ],
  soft_skills_practices: [
    'Agile', 'Scrum', 'Leadership', 'Mentorship', 'Code Review', 'Collaboration',
    'Communication', 'Problem Solving', 'Test-Driven Development', 'TDD',
    'Design Patterns', 'Unit Testing', 'End-to-End Testing', 'Continuous Delivery',
    'Cross-functional', 'Project Management', 'Stakeholder Management'
  ]
};

// Flattened keyword dictionary with normalized lookup
const ALL_KEYWORDS: { display: string; normalized: string }[] = [];
Object.values(ATS_KEYWORD_DICTIONARY).forEach((list) => {
  list.forEach((kw) => {
    ALL_KEYWORDS.push({
      display: kw,
      normalized: kw.toLowerCase(),
    });
  });
});

/**
 * Clean and tokenize text
 */
function cleanText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9+#.\s-]/g, ' ');
}

/**
 * Extract keywords found in a given text block
 */
export function extractKeywords(text: string): string[] {
  if (!text) return [];
  const normalizedText = ` ${cleanText(text)} `;
  const found = new Set<string>();

  ALL_KEYWORDS.forEach(({ display, normalized }) => {
    // Exact word boundary matching or substring for symbols like c++, c#
    const regex = new RegExp(`(?:^|[^a-z0-9])${escapeRegExp(normalized)}(?:$|[^a-z0-9])`, 'i');
    if (regex.test(normalizedText)) {
      found.add(display);
    }
  });

  return Array.from(found);
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Check if resume contains standard essential ATS sections
 */
export function detectSections(resumeText: string) {
  const lower = resumeText.toLowerCase();
  return {
    experience: /experience|work history|employment|career history/i.test(lower),
    education: /education|degree|university|college|academic/i.test(lower),
    skills: /skills|technologies|proficiencies|competencies|tools/i.test(lower),
    projects: /projects|open source|portfolio|personal projects/i.test(lower),
    contact: /@|phone|\+?[0-9]{3}[-.\s]?[0-9]{3}|linkedin\.com|github\.com/i.test(lower),
  };
}

/**
 * Main ATS Match Calculation Engine
 */
export function calculateAtsMatch(
  resumeText: string,
  jobDescriptionText: string,
  targetJobRole?: string
): AtsMatchResult {
  const resumeNorm = cleanText(resumeText || '');
  const jobNorm = cleanText(`${targetJobRole || ''} ${jobDescriptionText || ''}`);

  const wordCountResume = resumeText.trim().split(/\s+/).filter(Boolean).length;
  const wordCountJob = jobDescriptionText.trim().split(/\s+/).filter(Boolean).length;

  // Extract keywords from job description
  const jobKeywords = extractKeywords(jobNorm);
  const resumeKeywords = extractKeywords(resumeNorm);

  // If job description is very brief, inject common keywords from role
  if (jobKeywords.length < 3 && targetJobRole) {
    const roleKws = extractKeywords(targetJobRole);
    roleKws.forEach((k) => {
      if (!jobKeywords.includes(k)) jobKeywords.push(k);
    });
  }

  // Fallback if job has no recognized keywords: extract significant words
  if (jobKeywords.length === 0 && jobDescriptionText.trim()) {
    const stopWords = new Set(['the', 'and', 'with', 'for', 'you', 'will', 'this', 'that', 'our', 'are', 'from', 'have', 'your', 'about', 'join', 'team', 'work', 'role', 'looking', 'who']);
    const jobWords = Array.from(new Set(
      jobNorm.split(/\s+/)
        .filter((w) => w.length > 3 && !stopWords.has(w))
    )).slice(0, 10);

    jobWords.forEach((w) => {
      const displayWord = w.charAt(0).toUpperCase() + w.slice(1);
      jobKeywords.push(displayWord);
    });
  }

  // Hard vs Soft skills separation
  const softKeywordsSet = new Set(ATS_KEYWORD_DICTIONARY.soft_skills_practices.map(s => s.toLowerCase()));

  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];
  const matchedSoftSkills: string[] = [];
  const missingSoftSkills: string[] = [];

  jobKeywords.forEach((kw) => {
    const isSoft = softKeywordsSet.has(kw.toLowerCase());
    const isPresent = resumeKeywords.some((rKw) => rKw.toLowerCase() === kw.toLowerCase()) || 
                      resumeNorm.includes(kw.toLowerCase());

    if (isPresent) {
      if (isSoft) matchedSoftSkills.push(kw);
      else matchedKeywords.push(kw);
    } else {
      if (isSoft) missingSoftSkills.push(kw);
      else missingKeywords.push(kw);
    }
  });

  // Calculate Keyword Score (0 - 100)
  const totalKeywords = jobKeywords.length || 1;
  const totalMatched = matchedKeywords.length + matchedSoftSkills.length;
  const keywordMatchRatio = totalKeywords > 0 ? (totalMatched / totalKeywords) : 0.8;
  const keywordScore = Math.min(Math.round(keywordMatchRatio * 100), 100);

  // Section Presence Score
  const sections = detectSections(resumeText);
  const sectionCount = Object.values(sections).filter(Boolean).length;
  const sectionScore = (sectionCount / 5) * 100;

  // Length / Density check (ideal resume: 250 - 900 words)
  let lengthScore = 100;
  if (wordCountResume < 150) lengthScore = 50;
  else if (wordCountResume < 250) lengthScore = 80;
  else if (wordCountResume > 1200) lengthScore = 85;

  // Weighted Final Score
  // 65% Keyword Match, 20% Section Completeness, 15% Content Length & Formatting
  const finalScore = Math.min(
    Math.max(
      Math.round(keywordScore * 0.65 + sectionScore * 0.20 + lengthScore * 0.15),
      0
    ),
    100
  );

  // Rating bracket
  let rating: AtsMatchResult['rating'] = 'Low Match';
  if (finalScore >= 85) rating = 'Exceptional';
  else if (finalScore >= 70) rating = 'Strong Match';
  else if (finalScore >= 50) rating = 'Moderate';
  else rating = 'Low Match';

  // Actionable recommendations
  const recommendations: string[] = [];

  if (missingKeywords.length > 0) {
    const topMissing = missingKeywords.slice(0, 4).join(', ');
    recommendations.push(`Add key technical skills highlighted in the job description: ${topMissing}`);
  }

  if (missingSoftSkills.length > 0) {
    const topMissingSoft = missingSoftSkills.slice(0, 3).join(', ');
    recommendations.push(`Incorporate teamwork & methodology terms: ${topMissingSoft}`);
  }

  if (!sections.skills) {
    recommendations.push('Create a dedicated "Technical Skills" section near the top of your resume for ATS parsers.');
  }

  if (!sections.projects) {
    recommendations.push('Include a "Projects" or "Open Source" section with measurable outcomes to boost keyword density.');
  }

  if (wordCountResume < 300) {
    recommendations.push('Your resume length is relatively brief (<300 words). Add detail to your bullet points using the Action Verb + Context + Result format.');
  }

  if (finalScore >= 85) {
    recommendations.push('Great match! Your resume contains strong keyword alignment for this role.');
  }

  return {
    score: finalScore,
    rating,
    matchedKeywords,
    missingKeywords,
    matchedSoftSkills,
    missingSoftSkills,
    sectionsFound: sections,
    recommendations: recommendations.slice(0, 4),
    wordCountResume,
    wordCountJob,
    analyzedAt: new Date().toISOString().split('T')[0],
  };
}
