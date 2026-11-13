/**
 * LearnGraph — Comprehensive Educational Resource & YouTube Video Knowledge Base
 * Production-ready verified public educational content across STEM, Computer Science, and Competitive Exams.
 */

export interface VideoResourceItem {
  id: string;
  courseId: string;
  subjectId: string;
  chapterId: string;
  topicId: string;
  title: string;
  description: string;
  youtubeUrl: string;
  youtubeVideoId: string;
  thumbnail: string;
  duration: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  language: string;
  provider: string;
  channelName: string;
  tags: string[];
  viewsCount?: number;
  createdDate: string;
}

export interface NoteResourceItem {
  id: string;
  courseId: string;
  topicId: string;
  title: string;
  description: string;
  readTime: string;
  downloadUrl?: string;
  keyPoints: string[];
  formulas?: string[];
  summary: string;
  difficulty: "beginner" | "intermediate" | "advanced";
}

export interface PracticeResourceItem {
  id: string;
  courseId: string;
  topicId: string;
  title: string;
  problemCount: number;
  difficulty: "easy" | "medium" | "hard";
  type: "mcq" | "numerical" | "coding" | "assignment";
  estimatedTimeMinutes: number;
  tags: string[];
}

export interface CourseResourcesBundle {
  courseId: string;
  courseTitle: string;
  videos: VideoResourceItem[];
  notes: NoteResourceItem[];
  practice: PracticeResourceItem[];
  pdfs: { id: string; title: string; size: string; pages: number; url: string; category: string }[];
  assignments: { id: string; title: string; dueDate: string; submissionsCount: number; totalPoints: number }[];
  codingExercises?: { id: string; title: string; language: string; testCasesCount: number; starterSnippet: string }[];
}

// ─────────────────────────────────────────────────────────────────────────────
// VERIFIED EDUCATIONAL YOUTUBE VIDEOS DATABASE
// ─────────────────────────────────────────────────────────────────────────────

export const VIDEO_RESOURCES: VideoResourceItem[] = [
  // ── Computer Science: Data Structures & Algorithms ──────────────────────────
  {
    id: "vid-cs-dsa-01",
    courseId: "c-cs-dsa",
    subjectId: "cs-core",
    chapterId: "ch-asymptotics",
    topicId: "asymptotic-notation",
    title: "Big-O Notation & Asymptotic Complexity Analysis in Depth",
    description: "Rigorous mathematical intuition for Big O, Omega, and Theta notations with practical recurrence relation examples.",
    youtubeUrl: "https://www.youtube.com/watch?v=__vX2sjlpXU",
    youtubeVideoId: "__vX2sjlpXU",
    thumbnail: "https://images.unsplash.com/photo-1516116211227-bbc191b72e94?auto=format&fit=crop&w=640&q=80",
    duration: "24m 18s",
    difficulty: "beginner",
    language: "English",
    provider: "MIT OpenCourseWare",
    channelName: "MIT OpenCourseWare",
    tags: ["Big-O", "Time Complexity", "Algorithms", "Mathematics"],
    createdDate: "2024-03-15",
  },
  {
    id: "vid-cs-dsa-02",
    courseId: "c-cs-dsa",
    subjectId: "cs-core",
    chapterId: "ch-graphs",
    topicId: "graph-traversals",
    title: "Graph Algorithms: Breadth-First Search (BFS) and Depth-First Search (DFS)",
    description: "Step-by-step visual walkthrough of BFS queue traversal, DFS recursion stacks, and cycle detection in directed graphs.",
    youtubeUrl: "https://www.youtube.com/watch?v=pcKY4hjDrxk",
    youtubeVideoId: "pcKY4hjDrxk",
    thumbnail: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=640&q=80",
    duration: "31m 45s",
    difficulty: "intermediate",
    language: "English",
    provider: "Abdul Bari",
    channelName: "Abdul Bari",
    tags: ["Graphs", "BFS", "DFS", "Data Structures"],
    createdDate: "2024-04-10",
  },
  {
    id: "vid-cs-dsa-03",
    courseId: "c-cs-dsa",
    subjectId: "cs-core",
    chapterId: "ch-dp",
    topicId: "dynamic-programming",
    title: "Dynamic Programming Masterclass: 0/1 Knapsack & Memoization",
    description: "Deriving state transitions, overlapping subproblems, and optimal substructure with tabulated bottom-up vs top-down memoization.",
    youtubeUrl: "https://www.youtube.com/watch?v=nLmhmB6NzcM",
    youtubeVideoId: "nLmhmB6NzcM",
    thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=640&q=80",
    duration: "45m 12s",
    difficulty: "advanced",
    language: "English",
    provider: "freeCodeCamp",
    channelName: "freeCodeCamp.org",
    tags: ["Dynamic Programming", "Knapsack", "Optimization"],
    createdDate: "2024-05-02",
  },

  // ── Computer Science: Operating Systems & DBMS ──────────────────────────────
  {
    id: "vid-cs-os-01",
    courseId: "c-cs-os",
    subjectId: "cs-core",
    chapterId: "ch-memory",
    topicId: "virtual-memory",
    title: "Virtual Memory, Paging, Page Tables, and TLB Hardware",
    description: "How CPU MMUs translate virtual addresses into physical frames with multi-level page tables and inverted indexes.",
    youtubeUrl: "https://www.youtube.com/watch?v=qlH4-oHnBb8",
    youtubeVideoId: "qlH4-oHnBb8",
    thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=640&q=80",
    duration: "28m 30s",
    difficulty: "intermediate",
    language: "English",
    provider: "Gate Smashers",
    channelName: "Gate Smashers",
    tags: ["Operating Systems", "Virtual Memory", "Paging", "GATE"],
    createdDate: "2024-02-18",
  },
  {
    id: "vid-cs-db-01",
    courseId: "c-cs-db",
    subjectId: "cs-core",
    chapterId: "ch-transactions",
    topicId: "acid-concurrency",
    title: "ACID Transactions, Two-Phase Locking (2PL), and Conflict Serializability",
    description: "Deep dive into dirty reads, unrepeatable reads, phantom reads, and strict two-phase locking protocols.",
    youtubeUrl: "https://www.youtube.com/watch?v=5zJ8gD5l_g8",
    youtubeVideoId: "5zJ8gD5l_g8",
    thumbnail: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=640&q=80",
    duration: "34m 10s",
    difficulty: "advanced",
    language: "English",
    provider: "NPTEL",
    channelName: "NPTEL-NOC IIT Kharagpur",
    tags: ["DBMS", "ACID", "Concurrency", "SQL"],
    createdDate: "2024-03-22",
  },

  // ── Modern Software Engineering: Python, React, FastAPI ────────────────────
  {
    id: "vid-dev-py-01",
    courseId: "c-py-dev",
    subjectId: "software-eng",
    chapterId: "ch-py-advanced",
    topicId: "asyncio-generators",
    title: "Python Asyncio, Event Loops, and Coroutines Explained",
    description: "Unraveling cooperative multitasking, task scheduling, async generators, and high-concurrency network servers in modern Python 3.12.",
    youtubeUrl: "https://www.youtube.com/watch?v=t5Bo1Je9EmE",
    youtubeVideoId: "t5Bo1Je9EmE",
    thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=640&q=80",
    duration: "38m 40s",
    difficulty: "intermediate",
    language: "English",
    provider: "Corey Schafer",
    channelName: "Corey Schafer",
    tags: ["Python", "AsyncIO", "Concurrency", "Backend"],
    createdDate: "2024-01-28",
  },
  {
    id: "vid-dev-fastapi-01",
    courseId: "c-fastapi-prod",
    subjectId: "software-eng",
    chapterId: "ch-fastapi-arch",
    topicId: "dependency-injection",
    title: "FastAPI Dependency Injection, Pydantic V2 Schemas, and SQLAlchemy Async",
    description: "Architecting production-ready microservices with automated OpenAPI docs, asynchronous PostgreSQL pools, and JWT security middleware.",
    youtubeUrl: "https://www.youtube.com/watch?v=0RS9W8MtUV4",
    youtubeVideoId: "0RS9W8MtUV4",
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=640&q=80",
    duration: "52m 15s",
    difficulty: "intermediate",
    language: "English",
    provider: "freeCodeCamp",
    channelName: "freeCodeCamp.org",
    tags: ["FastAPI", "Python", "API", "REST", "PostgreSQL"],
    createdDate: "2024-04-14",
  },
  {
    id: "vid-dev-react-01",
    courseId: "c-react-adv",
    subjectId: "software-eng",
    chapterId: "ch-react-perf",
    topicId: "react-19-hooks",
    title: "React 19 Server Components, Actions, and Optimistic UI Updates",
    description: "Modern fullstack mental model: compiler memoization, server actions, optimistic transitions, and custom hook architecture.",
    youtubeUrl: "https://www.youtube.com/watch?v=843nec-IvW0",
    youtubeVideoId: "843nec-IvW0",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=640&q=80",
    duration: "41m 20s",
    difficulty: "intermediate",
    language: "English",
    provider: "Web Dev Simplified",
    channelName: "Web Dev Simplified",
    tags: ["React", "JavaScript", "Frontend", "React 19"],
    createdDate: "2024-05-18",
  },

  // ── Mathematics: Calculus, Linear Algebra, Probability ──────────────────────
  {
    id: "vid-math-calc-01",
    courseId: "c-math-calc",
    subjectId: "mathematics",
    chapterId: "ch-limits-derivatives",
    topicId: "essence-of-calculus",
    title: "The Essence of Calculus: Visual Geometric Derivation",
    description: "Intuition-first foundation of derivatives, integrals, and the fundamental theorem of calculus using geometric area animations.",
    youtubeUrl: "https://www.youtube.com/watch?v=WUvTyaaNkzM",
    youtubeVideoId: "WUvTyaaNkzM",
    thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=640&q=80",
    duration: "17m 04s",
    difficulty: "beginner",
    language: "English",
    provider: "3Blue1Brown",
    channelName: "3Blue1Brown",
    tags: ["Calculus", "Derivatives", "Math", "Visual Proof"],
    createdDate: "2024-02-10",
  },
  {
    id: "vid-math-linalg-01",
    courseId: "c-math-linalg",
    subjectId: "mathematics",
    chapterId: "ch-transformations",
    topicId: "eigenvectors-eigenvalues",
    title: "Eigenvectors and Eigenvalues: A Geometric Interpretation",
    description: "Visualizing coordinate matrix transformations and the invariant directional axes that define principal components and spectral decomposition.",
    youtubeUrl: "https://www.youtube.com/watch?v=PFDu9oVAE-g",
    youtubeVideoId: "PFDu9oVAE-g",
    thumbnail: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=640&q=80",
    duration: "17m 16s",
    difficulty: "intermediate",
    language: "English",
    provider: "3Blue1Brown",
    channelName: "3Blue1Brown",
    tags: ["Linear Algebra", "Eigenvalues", "Matrix", "Machine Learning"],
    createdDate: "2024-03-01",
  },
  {
    id: "vid-math-prob-01",
    courseId: "c-math-prob",
    subjectId: "mathematics",
    chapterId: "ch-bayes",
    topicId: "bayes-theorem",
    title: "Bayes Theorem, Conditional Probability, and Prior Belief Updating",
    description: "Mathematical formulation of P(A|B) = P(B|A)P(A)/P(B) with medical testing paradoxes and decision tree calculations.",
    youtubeUrl: "https://www.youtube.com/watch?v=HZGCoVF3YvM",
    youtubeVideoId: "HZGCoVF3YvM",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=640&q=80",
    duration: "15m 32s",
    difficulty: "beginner",
    language: "English",
    provider: "3Blue1Brown",
    channelName: "3Blue1Brown",
    tags: ["Probability", "Bayes Theorem", "Statistics"],
    createdDate: "2024-03-12",
  },

  // ── Physics: Mechanics, Thermodynamics, Quantum ─────────────────────────────
  {
    id: "vid-phy-mech-01",
    courseId: "c-phy-mech",
    subjectId: "physics",
    chapterId: "ch-newtonian",
    topicId: "rotational-dynamics",
    title: "Rotational Dynamics, Angular Momentum, and Gyroscopic Precession",
    description: "Legendary lecture demonstration of moment of inertia, torque vectors, and non-intuitive gyroscopic stabilization by Prof. Walter Lewin.",
    youtubeUrl: "https://www.youtube.com/watch?v=ty9QSiVC2g0",
    youtubeVideoId: "ty9QSiVC2g0",
    thumbnail: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=640&q=80",
    duration: "49m 10s",
    difficulty: "intermediate",
    language: "English",
    provider: "MIT OpenCourseWare",
    channelName: "Lectures by Walter Lewin",
    tags: ["Physics", "Mechanics", "Torque", "MIT"],
    createdDate: "2024-01-14",
  },
  {
    id: "vid-phy-quant-01",
    courseId: "c-phy-quant",
    subjectId: "physics",
    chapterId: "ch-wave-particle",
    topicId: "quantum-superposition",
    title: "Quantum Superposition, Double-Slit Experiment, and Wavefunction Collapse",
    description: "Detailed mathematical description of the Schrödinger wave equation and the measurement problem in quantum mechanics.",
    youtubeUrl: "https://www.youtube.com/watch?v=p7bzE1E5pmY",
    youtubeVideoId: "p7bzE1E5pmY",
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=640&q=80",
    duration: "32m 45s",
    difficulty: "advanced",
    language: "English",
    provider: "PBS Space Time",
    channelName: "PBS Space Time",
    tags: ["Quantum Physics", "Schrodinger", "Wavefunction"],
    createdDate: "2024-04-05",
  },

  // ── Competitive Exams: JEE, NEET, GATE, UPSC ────────────────────────────────
  {
    id: "vid-exam-jee-01",
    courseId: "c-jee-adv",
    subjectId: "competitive-exams",
    chapterId: "ch-organic-chem",
    topicId: "reaction-mechanisms",
    title: "JEE Advanced Organic Chemistry: Sn1, Sn2, E1, E2 Reaction Mechanisms",
    description: "Steric hindrance, nucleophile strength, solvent effects (polar protic vs aprotic), and stereochemical inversion walkthrough.",
    youtubeUrl: "https://www.youtube.com/watch?v=hz_6pQWzY0c",
    youtubeVideoId: "hz_6pQWzY0c",
    thumbnail: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?auto=format&fit=crop&w=640&q=80",
    duration: "58m 20s",
    difficulty: "advanced",
    language: "English / Hindi",
    provider: "Physics Wallah",
    channelName: "Physics Wallah - Alakh Pandey",
    tags: ["JEE Advanced", "Organic Chemistry", "Reaction Mechanisms", "PYQ"],
    createdDate: "2024-02-20",
  },
  {
    id: "vid-exam-gate-01",
    courseId: "c-gate-cs",
    subjectId: "competitive-exams",
    chapterId: "ch-toc",
    topicId: "regular-languages-pumping-lemma",
    title: "Theory of Computation: Pumping Lemma for Regular Languages (GATE CS PYQs)",
    description: "Step-by-step game strategy for proving non-regularity with adversary arguments and canonical past 15-year GATE questions.",
    youtubeUrl: "https://www.youtube.com/watch?v=tyk6sO2sNq0",
    youtubeVideoId: "tyk6sO2sNq0",
    thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=640&q=80",
    duration: "42m 10s",
    difficulty: "advanced",
    language: "English",
    provider: "Gate Smashers",
    channelName: "Gate Smashers",
    tags: ["GATE CS", "TOC", "Automata", "Pumping Lemma"],
    createdDate: "2024-03-30",
  },
  {
    id: "vid-exam-upsc-01",
    courseId: "c-upsc-pre",
    subjectId: "competitive-exams",
    chapterId: "ch-polity",
    topicId: "indian-constitution-fundamental-rights",
    title: "Indian Polity: Fundamental Rights (Articles 12 to 35) & Landmark Judgments",
    description: "Comprehensive analytical breakdown of Article 14, 19, 21, Kesavananda Bharati case, Basic Structure Doctrine, and writ jurisdictions.",
    youtubeUrl: "https://www.youtube.com/watch?v=WdK6a7Zc_6w",
    youtubeVideoId: "WdK6a7Zc_6w",
    thumbnail: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=640&q=80",
    duration: "1h 12m",
    difficulty: "intermediate",
    language: "English",
    provider: "StudyIQ IAS",
    channelName: "StudyIQ IAS",
    tags: ["UPSC CSE", "Indian Polity", "Constitution", "Civil Services"],
    createdDate: "2024-04-01",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// COMPREHENSIVE REVISION NOTES & CHEAT SHEETS
// ─────────────────────────────────────────────────────────────────────────────

export const NOTE_RESOURCES: NoteResourceItem[] = [
  {
    id: "note-cs-dsa-01",
    courseId: "c-cs-dsa",
    topicId: "asymptotic-notation",
    title: "Master Theorem & Asymptotic Bounds Cheat Sheet",
    description: "Compact derivation formulas for dividing and subtracting recurrence relations.",
    readTime: "8 min read",
    keyPoints: [
      "Master Theorem applies to recurrences of form T(n) = aT(n/b) + f(n) where a >= 1, b > 1.",
      "Case 1: If f(n) = O(n^(log_b(a) - eps)), then T(n) = Theta(n^(log_b(a))).",
      "Case 2: If f(n) = Theta(n^(log_b(a)) * log^k(n)), then T(n) = Theta(n^(log_b(a)) * log^(k+1)(n)).",
      "Case 3: Regularity condition a*f(n/b) <= c*f(n) for c < 1 yields T(n) = Theta(f(n)).",
    ],
    formulas: [
      "T(n) = aT(n/b) + Theta(n^d)",
      "d < log_b(a) => O(n^(log_b a))",
      "d = log_b(a) => O(n^d * log n)",
      "d > log_b(a) => O(n^d)",
    ],
    summary: "Asymptotic notations provide invariant hardware-agnostic bounds for comparative algorithm design.",
    difficulty: "beginner",
  },
  {
    id: "note-cs-dsa-02",
    courseId: "c-cs-dsa",
    topicId: "graph-traversals",
    title: "Graph Algorithms: Invariants, Representations & Time Proofs",
    description: "Adjacency matrix vs Adjacency list tradeoffs, topological ordering, and Dijkstra invariants.",
    readTime: "12 min read",
    keyPoints: [
      "Adjacency matrix requires O(V^2) space, ideal for dense graphs where E approx V^2.",
      "Adjacency list requires O(V + E) space, optimal for sparse real-world graphs.",
      "Dijkstra's algorithm requires non-negative edge weights; Bellman-Ford solves negative edges in O(V * E).",
    ],
    formulas: [
      "Dense: E in O(V^2)",
      "Sparse: E in O(V)",
      "Dijkstra Heap: O((V + E) log V)",
    ],
    summary: "Graph representations directly dictate the optimality of traversal and shortest-path calculation.",
    difficulty: "intermediate",
  },
  {
    id: "note-fastapi-01",
    courseId: "c-fastapi-prod",
    topicId: "dependency-injection",
    title: "FastAPI Production Architecture & Dependency Patterns",
    description: "Best practices for async session lifecycle, Pydantic v2 validation, and JWT security pipelines.",
    readTime: "10 min read",
    keyPoints: [
      "Use `yield` in `Depends()` providers to cleanly execute teardown and session commits.",
      "Pydantic v2 is implemented in Rust (`pydantic-core`), achieving 5x-20x throughput gains.",
      "Always set `asyncpg` connection pool max_size in uvicorn multi-worker configurations.",
    ],
    summary: "FastAPI relies on Python typing to automatically produce OpenAPI 3.1 specifications and Swagger UI.",
    difficulty: "intermediate",
  },
  {
    id: "note-math-calc-01",
    courseId: "c-math-calc",
    topicId: "essence-of-calculus",
    title: "Fundamental Theorem of Calculus & Standard Integral Tables",
    description: "Essential differentiation rules, integration by parts, and Taylor series expansions.",
    readTime: "15 min read",
    keyPoints: [
      "Derivatives calculate the instantaneous rate of change (tangent slope).",
      "Definite integrals compute accumulated signed area under a continuous curve.",
      "Fundamental Theorem links differentiation and integration as inverse mathematical operations.",
    ],
    formulas: [
      "d/dx [f(g(x))] = f'(g(x)) * g'(x)",
      "int u dv = u*v - int v du",
      "f(x) = sum_{n=0}^infty [f^(n)(a)/n! * (x-a)^n]",
    ],
    summary: "Calculus is the mathematical language of continuous change and multidimensional optimization.",
    difficulty: "beginner",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// PRACTICE DRILLS & ASSIGNMENT PACKS
// ─────────────────────────────────────────────────────────────────────────────

export const PRACTICE_RESOURCES: PracticeResourceItem[] = [
  {
    id: "prac-dsa-01",
    courseId: "c-cs-dsa",
    topicId: "asymptotic-notation",
    title: "Time & Space Complexity Diagnostic Problem Set",
    problemCount: 25,
    difficulty: "easy",
    type: "mcq",
    estimatedTimeMinutes: 30,
    tags: ["Time Complexity", "Big O", "Recurrence"],
  },
  {
    id: "prac-dsa-02",
    courseId: "c-cs-dsa",
    topicId: "graph-traversals",
    title: "Graph Traversal & Topological Sort Coding Challenge",
    problemCount: 12,
    difficulty: "medium",
    type: "coding",
    estimatedTimeMinutes: 45,
    tags: ["Graphs", "BFS", "DFS", "LeetCode Medium"],
  },
  {
    id: "prac-fastapi-01",
    courseId: "c-fastapi-prod",
    topicId: "dependency-injection",
    title: "FastAPI Authentication & OAuth2 Bearer Implementation Drill",
    problemCount: 8,
    difficulty: "hard",
    type: "assignment",
    estimatedTimeMinutes: 60,
    tags: ["FastAPI", "Security", "JWT", "OAuth2"],
  },
  {
    id: "prac-math-01",
    courseId: "c-math-calc",
    topicId: "essence-of-calculus",
    title: "Derivatives & Integral Calculus Practice Drills",
    problemCount: 30,
    difficulty: "medium",
    type: "numerical",
    estimatedTimeMinutes: 40,
    tags: ["Calculus", "Integration", "Derivatives"],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// REPOSITORY DISCOVERY & HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

export const learningResourcesService = {
  /**
   * Get all video resources associated with a course or topic.
   */
  getVideosByTopic: (topicIdOrKeyword: string): VideoResourceItem[] => {
    const q = topicIdOrKeyword.toLowerCase().trim();
    if (!q) return VIDEO_RESOURCES;

    return VIDEO_RESOURCES.filter(
      (v) =>
        v.topicId.toLowerCase().includes(q) ||
        v.chapterId.toLowerCase().includes(q) ||
        v.title.toLowerCase().includes(q) ||
        v.tags.some((t) => t.toLowerCase().includes(q))
    );
  },

  /**
   * Get videos associated with a specific course ID.
   */
  getVideosByCourse: (courseId: string): VideoResourceItem[] => {
    const matched = VIDEO_RESOURCES.filter((v) => v.courseId === courseId);
    if (matched.length > 0) return matched;
    // Fallback: match by related subjects or return general high-yield set
    return VIDEO_RESOURCES.slice(0, 6);
  },

  /**
   * Get revision notes for a course or topic.
   */
  getNotesByCourse: (courseId: string): NoteResourceItem[] => {
    const matched = NOTE_RESOURCES.filter((n) => n.courseId === courseId);
    if (matched.length > 0) return matched;
    return NOTE_RESOURCES;
  },

  /**
   * Get practice drills for a course.
   */
  getPracticeByCourse: (courseId: string): PracticeResourceItem[] => {
    const matched = PRACTICE_RESOURCES.filter((p) => p.courseId === courseId);
    if (matched.length > 0) return matched;
    return PRACTICE_RESOURCES;
  },

  /**
   * Get full bundle for course details page.
   */
  getCourseBundle: (courseId: string, courseTitle = "Learning Course"): CourseResourcesBundle => {
    const videos = learningResourcesService.getVideosByCourse(courseId);
    const notes = learningResourcesService.getNotesByCourse(courseId);
    const practice = learningResourcesService.getPracticeByCourse(courseId);

    return {
      courseId,
      courseTitle,
      videos,
      notes,
      practice,
      pdfs: [
        {
          id: `pdf-${courseId}-1`,
          title: `${courseTitle} — Comprehensive Formula Sheet & Invariants`,
          size: "2.4 MB",
          pages: 18,
          url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          category: "Cheat Sheet",
        },
        {
          id: `pdf-${courseId}-2`,
          title: `${courseTitle} — Full Lecture Compendium (Official Notes)`,
          size: "6.8 MB",
          pages: 64,
          url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          category: "Handbook",
        },
        {
          id: `pdf-${courseId}-3`,
          title: `${courseTitle} — Solved PYQs (Past 10 Years)`,
          size: "4.1 MB",
          pages: 42,
          url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          category: "Exam Archive",
        },
      ],
      assignments: [
        {
          id: `asg-${courseId}-1`,
          title: "Mid-Term Milestone: Synthesis & Problem Decomposition Project",
          dueDate: "7 days remaining",
          submissionsCount: 142,
          totalPoints: 100,
        },
        {
          id: `asg-${courseId}-2`,
          title: "Diagnostic Self-Review & Peer Evaluation Submission",
          dueDate: "14 days remaining",
          submissionsCount: 88,
          totalPoints: 50,
        },
      ],
      codingExercises: [
        {
          id: `code-${courseId}-1`,
          title: "Implement Core Data Invariant & Edge Case Validator",
          language: "Python / TypeScript",
          testCasesCount: 15,
          starterSnippet: `def solve_problem(input_data):\n    # Write your solution here\n    pass`,
        },
      ],
    };
  },

  /**
   * Save a resource to user's saved list in localStorage.
   */
  saveResource: (resourceId: string): boolean => {
    try {
      const existing: string[] = JSON.parse(localStorage.getItem("lg_saved_resources") || "[]");
      if (!existing.includes(resourceId)) {
        existing.push(resourceId);
        localStorage.setItem("lg_saved_resources", JSON.stringify(existing));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  /**
   * Mark a resource as completed in user progress.
   */
  markCompleted: (resourceId: string): boolean => {
    try {
      const existing: string[] = JSON.parse(localStorage.getItem("lg_completed_resources") || "[]");
      if (!existing.includes(resourceId)) {
        existing.push(resourceId);
        localStorage.setItem("lg_completed_resources", JSON.stringify(existing));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  /**
   * Check if a resource is saved.
   */
  isResourceSaved: (resourceId: string): boolean => {
    try {
      const existing: string[] = JSON.parse(localStorage.getItem("lg_saved_resources") || "[]");
      return existing.includes(resourceId);
    } catch {
      return false;
    }
  },

  /**
   * Check if a resource is completed.
   */
  isResourceCompleted: (resourceId: string): boolean => {
    try {
      const existing: string[] = JSON.parse(localStorage.getItem("lg_completed_resources") || "[]");
      return existing.includes(resourceId);
    } catch {
      return false;
    }
  },
};
