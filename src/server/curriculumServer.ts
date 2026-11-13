/**
 * curriculumServer.ts
 * Vite server-side curriculum API handlers.
 * Serves all /api/v1/curriculum/* and /api/v1/courses* routes.
 * Loaded dynamically from the generated catalog JSON.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { IncomingMessage, ServerResponse } from 'node:http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Load catalog ─────────────────────────────────────────────────────────────
let _catalog: any = null;

function getCatalog(): any {
  if (_catalog && _catalog.courses && _catalog.courses.length > 0) return _catalog;

  const candidatePaths = [
    path.resolve(__dirname, '../data/generatedCurriculumCatalog.json'),
    path.resolve(process.cwd(), 'src/data/generatedCurriculumCatalog.json'),
    path.resolve(process.cwd(), 'backend/data/curriculum_catalog.json'),
    path.resolve(__dirname, '../../backend/data/curriculum_catalog.json'),
  ];

  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate)) {
      try {
        _catalog = JSON.parse(fs.readFileSync(candidate, 'utf-8'));
        if (_catalog.courses && _catalog.courses.length > 0) {
          console.log(
            `[curriculumServer] ✅ Loaded ${_catalog.courses.length} courses from: ${candidate}`
          );
          return _catalog;
        }
      } catch (e) {
        console.error('[curriculumServer] Parse error in:', candidate, e);
      }
    }
  }

  console.warn('[curriculumServer] Catalog NOT found in candidate paths');
  return { courses: [], levels: [], programs: [], competitiveExams: [] };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function sendJson(res: ServerResponse, data: unknown, status = 200): void {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
    'Access-Control-Allow-Origin': '*',
  });
  res.end(body);
}

/** Parse URL into { pathname, searchParams } without throwing */
function parseUrl(raw: string): { pathname: string; searchParams: URLSearchParams } {
  try {
    const u = new URL(raw, 'http://localhost');
    return { pathname: u.pathname, searchParams: u.searchParams };
  } catch {
    const [pathname, qs = ''] = raw.split('?');
    return { pathname, searchParams: new URLSearchParams(qs) };
  }
}

// ── Route constants ───────────────────────────────────────────────────────────
const CURRICULUM_PREFIX = '/api/v1/curriculum';
const COURSES_PREFIX    = '/api/v1/courses';

export async function handleCurriculumApiRequest(
  req: IncomingMessage,
  res: ServerResponse
): Promise<boolean> {
  const rawUrl = req.url ?? '';
  const method = req.method ?? 'GET';

  // Handle curriculum, courses, topics, and recommendations routes
  const isTargetRoute =
    rawUrl.startsWith(CURRICULUM_PREFIX) ||
    rawUrl.startsWith(COURSES_PREFIX) ||
    rawUrl.startsWith('/api/v1/topics') ||
    rawUrl.startsWith('/topics') ||
    rawUrl.startsWith('/api/v1/recommendations') ||
    rawUrl.startsWith('/recommendations');

  if (!isTargetRoute) {
    return false;
  }

  // CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end();
    return true;
  }

  if (method !== 'GET') return false;

  const { pathname, searchParams } = parseUrl(rawUrl);
  const q   = (p: string) => searchParams.get(p);
  const qi  = (p: string, def = 1) => parseInt(searchParams.get(p) ?? String(def));

  const catalog  = getCatalog();
  const courses: any[] = catalog.courses ?? [];

  // ═══════════════════════════════════════════════════════════════════════════
  // /api/v1/courses  routes
  // ═══════════════════════════════════════════════════════════════════════════
  if (pathname.startsWith(COURSES_PREFIX)) {
    const afterPrefix = pathname.slice(COURSES_PREFIX.length);
    const trimmed = afterPrefix.replace(/^\//, '').trim();

    // /api/v1/courses/:id/resources
    if (trimmed.includes('/resources')) {
      const courseId = decodeURIComponent(trimmed.split('/resources')[0]);
      const course = courses.find((c: any) => c.id === courseId || c.id === courseId.toLowerCase());
      const title = course?.title || 'Learning Course';
      sendJson(res, {
        courseId,
        courseTitle: title,
        videos: [
          {
            id: `vid-${courseId}-1`,
            courseId,
            title: `${title}: Core Conceptual Foundation & Axioms`,
            description: "Rigorous lecture walkthrough of foundational principles and mathematical derivations.",
            youtubeUrl: "https://www.youtube.com/watch?v=__vX2sjlpXU",
            youtubeVideoId: "__vX2sjlpXU",
            thumbnail: "https://images.unsplash.com/photo-1516116211227-bbc191b72e94?auto=format&fit=crop&w=640&q=80",
            duration: "28m 40s",
            difficulty: "beginner",
            language: "English",
            provider: "MIT OpenCourseWare",
            channelName: "MIT OpenCourseWare",
            tags: ["Foundation", "Theory", "Syllabus"],
            createdDate: new Date().toISOString(),
          },
          {
            id: `vid-${courseId}-2`,
            courseId,
            title: `${title}: Problem Solving & Solved PYQs`,
            description: "Step-by-step analytical breakdown of previous year exam questions and algorithmic patterns.",
            youtubeUrl: "https://www.youtube.com/watch?v=pcKY4hjDrxk",
            youtubeVideoId: "pcKY4hjDrxk",
            thumbnail: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=640&q=80",
            duration: "34m 15s",
            difficulty: "intermediate",
            language: "English",
            provider: "3Blue1Brown",
            channelName: "3Blue1Brown",
            tags: ["Problem Solving", "PYQ", "Analysis"],
            createdDate: new Date().toISOString(),
          },
        ],
        notes: [
          {
            id: `note-${courseId}-1`,
            courseId,
            title: `${title}: High-Yield Revision Formula Sheet`,
            description: "Condensed summary of critical theorems, invariants, and edge-case exceptions.",
            readTime: "10 min read",
            keyPoints: [
              "Review initial boundary invariants and prerequisite constraints before computation.",
              "Verify asymptotic state transitions and invariant preservation across iterations.",
            ],
            summary: "Comprehensive exam-ready revision companion for continuous review.",
            difficulty: "intermediate",
          },
        ],
        practice: [
          {
            id: `prac-${courseId}-1`,
            courseId,
            title: `${title}: Adaptive Topic Milestone Diagnostic`,
            problemCount: 20,
            difficulty: "medium",
            type: "mcq",
            estimatedTimeMinutes: 30,
            tags: ["Adaptive", "Diagnostic", "Assessment"],
          },
        ],
        pdfs: [
          {
            id: `pdf-${courseId}-1`,
            title: `${title} — Official Syllabus Handbook`,
            size: "3.2 MB",
            pages: 28,
            url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            category: "Handbook",
          },
        ],
        assignments: [
          {
            id: `asg-${courseId}-1`,
            title: `${title} Synthesis Milestone Problem Set`,
            dueDate: "7 days remaining",
            submissionsCount: 94,
            totalPoints: 100,
          },
        ],
      });
      return true;
    }
    // /api/v1/courses/:id
    const idSegment   = afterPrefix.replace(/^\//, '').trim();

    if (idSegment && idSegment !== '') {
      // Detail endpoint
      const id = decodeURIComponent(idSegment);
      const course = courses.find(
        (c: any) => c.id === id || c.id === id.toLowerCase()
      );
      if (!course) {
        sendJson(res, { error: 'Course not found', id }, 404);
      } else {
        sendJson(res, course);
      }
      return true;
    }

    // List endpoint: /api/v1/courses
    let results = [...courses];

    const tierFilter    = q('tier');
    const subjectFilter = q('subject');
    const gradeFilter   = q('grade');
    const searchTerm    = (q('search') ?? q('q') ?? '').toLowerCase().trim();
    const page          = qi('page', 1);
    const pageSize      = Math.min(qi('pageSize', 50), 500);

    if (tierFilter)    results = results.filter((c: any) => c.tier === tierFilter);
    if (subjectFilter) results = results.filter((c: any) => c.subject === subjectFilter);
    if (gradeFilter)   results = results.filter((c: any) => (c.gradeOrYear ?? '').includes(gradeFilter));
    if (searchTerm) {
      results = results.filter((c: any) =>
        ['title', 'subject', 'description', 'gradeOrYear', 'instructor'].some((f) =>
          String(c[f] ?? '').toLowerCase().includes(searchTerm)
        )
      );
    }

    const total    = results.length;
    const start    = (page - 1) * pageSize;
    const paginated = results.slice(start, start + pageSize);

    sendJson(res, { items: paginated, total, page, pageSize, hasMore: start + pageSize < total });
    return true;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // /api/v1/curriculum  routes
  // ═══════════════════════════════════════════════════════════════════════════

  // /api/v1/curriculum  (overview)
  if (pathname === CURRICULUM_PREFIX || pathname === `${CURRICULUM_PREFIX}/`) {
    sendJson(res, {
      version:      catalog.version,
      updatedAt:    catalog.updatedAt,
      totalCourses: catalog.totalCourses,
      levels:       catalog.levels,
      programs:     catalog.programs,
    });
    return true;
  }

  if (pathname.startsWith(`${CURRICULUM_PREFIX}/levels`)) {
    sendJson(res, catalog.levels ?? []);
    return true;
  }

  if (pathname.startsWith(`${CURRICULUM_PREFIX}/programs`)) {
    const levelId   = q('levelId');
    const programs  = (catalog.programs ?? []).filter((p: any) =>
      levelId ? p.levelId === levelId : true
    );
    sendJson(res, programs);
    return true;
  }

  if (pathname.startsWith(`${CURRICULUM_PREFIX}/subjects`)) {
    const tier = q('tier');
    const filtered = tier ? courses.filter((c: any) => c.tier === tier) : courses;
    const subjects = [...new Set(filtered.map((c: any) => c.subject).filter(Boolean))].sort();
    sendJson(res, subjects.map((s: string) => ({ name: s })));
    return true;
  }

  if (pathname.startsWith(`${CURRICULUM_PREFIX}/classes`)) {
    const schoolCourses = courses.filter((c: any) => c.tier === 'School');
    const grades = [...new Set(schoolCourses.map((c: any) => c.gradeOrYear).filter(Boolean))].sort();
    sendJson(res, grades);
    return true;
  }

  if (pathname.startsWith(`${CURRICULUM_PREFIX}/chapters`)) {
    const courseId = q('courseId');
    const course   = courseId ? courses.find((c: any) => c.id === courseId) : null;
    sendJson(res, course?.chapters ?? []);
    return true;
  }

  if (pathname.startsWith(`${CURRICULUM_PREFIX}/topics`)) {
    const courseId  = q('courseId');
    const chapterId = q('chapterId');
    const course    = courseId ? courses.find((c: any) => c.id === courseId) : null;
    if (course && chapterId) {
      const chapter = (course.chapters ?? []).find((ch: any) => ch.id === chapterId);
      sendJson(res, chapter?.lessons ?? []);
    } else {
      sendJson(res, []);
    }
    return true;
  }

  if (pathname.startsWith(`${CURRICULUM_PREFIX}/competitive-exams`)) {
    sendJson(res, catalog.competitiveExams ?? []);
    return true;
  }

  if (pathname.startsWith(`${CURRICULUM_PREFIX}/search`)) {
    const searchQ   = (q('q') ?? '').toLowerCase().trim();
    const tier      = q('tier');
    const subject   = q('subject');
    const grade     = q('grade');
    const page      = qi('page', 1);
    const pageSize  = Math.min(qi('pageSize', 20), 200);

    let results = [...courses];
    if (tier)    results = results.filter((c: any) => c.tier === tier);
    if (subject) results = results.filter((c: any) => c.subject === subject);
    if (grade)   results = results.filter((c: any) => (c.gradeOrYear ?? '').includes(grade));
    if (searchQ) {
      results = results.filter((c: any) =>
        ['title', 'subject', 'description', 'gradeOrYear', 'instructor'].some((f) =>
          String(c[f] ?? '').toLowerCase().includes(searchQ)
        ) || (c.syllabus ?? []).some((s: string) => s.toLowerCase().includes(searchQ))
      );
    }

    const total    = results.length;
    const start    = (page - 1) * pageSize;
    const paginated = results.slice(start, start + pageSize);

    sendJson(res, { items: paginated, total, page, pageSize, hasMore: start + pageSize < total });
    return true;
  }

  // ── Topics Learning Resources (Videos, Notes, Practice) ──────────────────
  if (pathname.includes('/topics/') && pathname.includes('/videos')) {
    sendJson(res, [
      {
        id: "vid-topic-1",
        title: "Comprehensive Concept Lecture & Mathematical Derivation",
        channelName: "MIT OpenCourseWare",
        provider: "MIT OpenCourseWare",
        duration: "26m 10s",
        youtubeUrl: "https://www.youtube.com/watch?v=__vX2sjlpXU",
        youtubeVideoId: "__vX2sjlpXU",
        thumbnail: "https://images.unsplash.com/photo-1516116211227-bbc191b72e94?auto=format&fit=crop&w=640&q=80",
        difficulty: "intermediate",
        tags: ["Concept", "Derivation"],
      },
      {
        id: "vid-topic-2",
        title: "Visual Geometric Intuition & Solved Examples",
        channelName: "3Blue1Brown",
        provider: "3Blue1Brown",
        duration: "18m 45s",
        youtubeUrl: "https://www.youtube.com/watch?v=WUvTyaaNkzM",
        youtubeVideoId: "WUvTyaaNkzM",
        thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=640&q=80",
        difficulty: "beginner",
        tags: ["Visual", "Intuition"],
      },
    ]);
    return true;
  }

  if (pathname.includes('/topics/') && pathname.includes('/notes')) {
    sendJson(res, [
      {
        id: "note-1",
        title: "Comprehensive Revision Notes & Formula Sheet",
        readTime: "8 min read",
        keyPoints: [
          "Key invariant rules and essential boundary condition definitions.",
          "Asymptotic performance tradeoffs and canonical problem patterns.",
        ],
        summary: "Exam-aligned quick review summary.",
      },
    ]);
    return true;
  }

  if (pathname.includes('/topics/') && pathname.includes('/practice')) {
    sendJson(res, [
      {
        id: "prac-1",
        title: "Topic Diagnostic Practice Drill (20 Qs)",
        problemCount: 20,
        difficulty: "medium",
        type: "mcq",
        estimatedTimeMinutes: 25,
      },
    ]);
    return true;
  }

  // ── Recommendations: Educational Resources ────────────────────────────────
  if (pathname.includes('/recommendations/resources') || pathname.includes('/recommendations')) {
    sendJson(res, {
      recommendedVideos: [
        {
          id: "vid-rec-1",
          title: "Foundational Asymptotic Complexity & Proofs",
          channelName: "MIT OpenCourseWare",
          provider: "MIT OpenCourseWare",
          duration: "24m 18s",
          youtubeUrl: "https://www.youtube.com/watch?v=__vX2sjlpXU",
          youtubeVideoId: "__vX2sjlpXU",
          thumbnail: "https://images.unsplash.com/photo-1516116211227-bbc191b72e94?auto=format&fit=crop&w=640&q=80",
          difficulty: "beginner",
        },
        {
          id: "vid-rec-2",
          title: "Geometric Linear Transformations & Eigenvalues",
          channelName: "3Blue1Brown",
          provider: "3Blue1Brown",
          duration: "17m 16s",
          youtubeUrl: "https://www.youtube.com/watch?v=PFDu9oVAE-g",
          youtubeVideoId: "PFDu9oVAE-g",
          thumbnail: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=640&q=80",
          difficulty: "intermediate",
        },
      ],
      trendingResources: [
        {
          id: "vid-trend-1",
          title: "Essence of Calculus & Intuitive Derivations",
          channelName: "3Blue1Brown",
          provider: "3Blue1Brown",
          duration: "17m 04s",
          youtubeUrl: "https://www.youtube.com/watch?v=WUvTyaaNkzM",
          youtubeVideoId: "WUvTyaaNkzM",
          thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=640&q=80",
          difficulty: "beginner",
        },
      ],
      continueWatching: [],
      recentlyViewed: [],
      savedVideos: [],
    });
    return true;
  }

  // Unrecognised /api/v1/curriculum/* sub-path
  sendJson(res, { error: 'Not found' }, 404);
  return true;
}
