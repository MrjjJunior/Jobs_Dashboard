import { ResumeItem } from '../types';

export const INITIAL_RESUMES: ResumeItem[] = [
  {
    id: 'resume-1',
    name: 'Frontend Specialist (React & TypeScript).pdf',
    fileName: 'Alex_Chen_Frontend_Lead_2026.pdf',
    fileSize: '142 KB',
    uploadDate: '2026-08-01',
    targetRole: 'Senior Frontend / UI Engineer',
    summary: 'Senior Frontend Engineer with 6+ years of experience building modern responsive web applications using React, TypeScript, Next.js, and Tailwind CSS. Specialized in performance optimization, design systems, and frontend state management.',
    experienceYears: 6,
    education: 'B.S. in Computer Science - UC Berkeley',
    isDefault: true,
    skills: [
      'React',
      'TypeScript',
      'JavaScript',
      'Next.js',
      'Tailwind CSS',
      'HTML5',
      'CSS3',
      'Redux',
      'Zustand',
      'GraphQL',
      'REST APIs',
      'Jest',
      'React Testing Library',
      'Cypress',
      'Webpack',
      'Vite',
      'Performance Optimization',
      'Web Accessibility (a11y)',
      'Git',
      'Figma',
    ],
    content: `ALEX CHEN
San Francisco, CA | alex.chen@example.com | linkedin.com/in/alexchen-dev | github.com/alexchen

PROFESSIONAL SUMMARY
Senior Frontend Engineer with 6+ years of experience designing and scaling web applications in high-growth tech environments. Expert in React, TypeScript, modern frontend architecture, and web performance optimization. Led cross-functional design system adoption and improved page load times by 45%.

TECHNICAL SKILLS
• Languages: TypeScript, JavaScript (ES6+), HTML5, CSS3, SQL
• Frameworks & Libraries: React, Next.js, Redux Toolkit, Zustand, Tailwind CSS, Material UI, Framer Motion
• Testing & Tooling: Jest, React Testing Library, Cypress, Vite, Webpack, Babel, ESLint, Git, CI/CD pipelines
• Architecture: Component-driven development, Micro-frontends, Responsive Design, Web Accessibility (WCAG 2.1), RESTful APIs, GraphQL

PROFESSIONAL EXPERIENCE
Senior Frontend Engineer | Lumina Cloud Inc. | 2023 - Present
• Spearheaded migration of legacy core portal to React 18 and Next.js, boosting Core Web Vitals score from 62 to 96.
• Engineered modular UI design system with 40+ accessible components adopted by 12 engineering teams.
• Implemented client-side caching with React Query and Zustand, reducing server API calls by 35%.
• Mentored 4 junior and mid-level engineers through code reviews and weekly technical workshops.

Frontend Software Engineer | Streamline Media | 2020 - 2023
• Built high-throughput real-time collaboration canvas using React, TypeScript, and WebSockets.
• Developed automated end-to-end testing suite using Cypress and GitHub Actions, lowering deployment regression bugs by 60%.
• Collaborated with UX designers in Figma to translate wireframes into pixel-perfect responsive layouts.

EDUCATION
Bachelor of Science in Computer Science | University of California, Berkeley | 2016 - 2020

PROJECTS
• React Flow State Manager: Open-source visual graph workflow builder with over 2.4k GitHub stars.
• FastBundle CLI: Lightning-fast asset bundler benchmark and optimization tool.`,
  },
  {
    id: 'resume-2',
    name: 'Full-Stack & Cloud Architecture.pdf',
    fileName: 'Alex_Chen_FullStack_Engineer.pdf',
    fileSize: '168 KB',
    uploadDate: '2026-07-15',
    targetRole: 'Full-Stack Software Engineer',
    summary: 'Full-Stack Engineer with strong expertise across the entire stack: React/Node.js, PostgreSQL, Docker, AWS cloud infrastructure, and microservices architecture.',
    experienceYears: 6,
    education: 'B.S. in Computer Science - UC Berkeley',
    isDefault: false,
    skills: [
      'React',
      'TypeScript',
      'Node.js',
      'Express',
      'Python',
      'PostgreSQL',
      'MongoDB',
      'Redis',
      'Docker',
      'Kubernetes',
      'AWS',
      'GCP',
      'Microservices',
      'REST APIs',
      'GraphQL',
      'CI/CD',
      'System Design',
      'Git',
      'Kafka',
    ],
    content: `ALEX CHEN
San Francisco, CA | alex.chen@example.com | linkedin.com/in/alexchen-dev

PROFESSIONAL SUMMARY
Full-Stack Software Engineer with 6 years of expertise building scalable distributed systems, microservices, and end-to-end web platforms. Proven track record architecting Node.js and Python backend services with PostgreSQL and Redis, integrated with reactive React/TypeScript frontends deployed on AWS and Docker.

CORE COMPETENCIES
• Backend: Node.js, Express, Python (FastAPI/Django), RESTful APIs, GraphQL, gRPC, Microservices
• Frontend: React, TypeScript, Next.js, Tailwind CSS, State Management
• Databases & Caching: PostgreSQL, MySQL, MongoDB, Redis, Elasticsearch
• Cloud & DevOps: AWS (EC2, S3, RDS, Lambda, CloudFront), Docker, Kubernetes, Terraform, GitHub Actions, CI/CD
• Practices: System Design, Database Indexing, Agile/Scrum, Distributed Systems, TDD

WORK EXPERIENCE
Full-Stack Software Engineer | Lumina Cloud Inc. | 2023 - Present
• Designed and shipped multi-tenant SaaS backend with Node.js and PostgreSQL, processing 5M+ daily requests.
• Built containerized microservices using Docker and Kubernetes deployed on AWS EKS with Terraform.
• Optimized complex SQL queries and Redis caching layers, dropping 99th percentile API latency from 450ms to 65ms.
• Created asynchronous event processing pipeline with Apache Kafka and AWS SQS.

Software Engineer | Streamline Media | 2020 - 2023
• Developed full-stack features using React, Node.js, and MongoDB for media streaming platform serving 200k MAU.
• Automated CI/CD deployment pipelines using GitHub Actions, cutting release deployment time by 50%.
• Integrated payment and billing infrastructure with Stripe API, handling subscriptions and automated invoicing.

EDUCATION
B.S. in Computer Science | UC Berkeley | 2016 - 2020`,
  },
  {
    id: 'resume-3',
    name: 'Backend & Distributed Systems CV.pdf',
    fileName: 'Alex_Chen_Backend_Distributed.pdf',
    fileSize: '155 KB',
    uploadDate: '2026-06-20',
    targetRole: 'Senior Backend Engineer / Systems',
    summary: 'Backend Engineer specializing in high-concurrency distributed systems, database scaling, API design, and asynchronous event-driven architectures in Go, Node.js, and Python.',
    experienceYears: 6,
    education: 'B.S. in Computer Science - UC Berkeley',
    isDefault: false,
    skills: [
      'Go',
      'Node.js',
      'Python',
      'PostgreSQL',
      'Redis',
      'Kafka',
      'Docker',
      'Kubernetes',
      'AWS',
      'Microservices',
      'System Design',
      'gRPC',
      'Distributed Systems',
      'SQL',
      'NoSQL',
      'Linux',
      'CI/CD',
    ],
    content: `ALEX CHEN
San Francisco, CA | alex.chen@example.com | linkedin.com/in/alexchen-dev

BACKEND & SYSTEMS ENGINEER
Results-driven Backend Engineer with 6+ years of experience architecting resilient, fault-tolerant backend infrastructure, message queues, and high-throughput APIs in Go, Node.js, and Python.

TECHNICAL EXPERTISE
• Languages: Go (Golang), Python, TypeScript, SQL, Bash
• Infrastructure: Docker, Kubernetes, AWS, GCP, Terraform, Linux/Unix
• Data Stores: PostgreSQL, Redis, DynamoDB, MongoDB, Cassandra
• Messaging & Streaming: Apache Kafka, RabbitMQ, AWS SQS/SNS
• Concepts: Distributed Consensus, High Availability, Database Sharding, Concurrency, Microservices

EXPERIENCE
Senior Backend Engineer | CloudScale Systems | 2023 - Present
• Designed distributed rate-limiting and authentication service in Go capable of handling 50k requests/second.
• Scaled PostgreSQL database using read-replicas, connection pooling with PgBouncer, and partition indexing.
• Implemented robust event-driven pipeline using Apache Kafka for data synchronization between 8 microservices.

Software Engineer | Streamline Media | 2020 - 2023
• Built REST and gRPC API microservices with Python and Node.js.
• Maintained 99.99% uptime for core authentication and subscription services.

EDUCATION
B.S. in Computer Science, UC Berkeley (2016 - 2020)`,
  },
];
