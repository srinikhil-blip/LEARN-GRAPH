import { simulateDelay } from "./client";
import type {
  SupportedLanguage,
  WeakConceptDetectorResult,
  StudySchedulePayload,
  CodingAssistantResponse,
  SessionMemory,
  OrchestrationResult,
  OrchestratorIntent,
} from "@/types/orchestrator";

const DEFAULT_SESSION_MEMORY: SessionMemory = {
  studentName: "Alex Morgan",
  learningGoals: ["Master Graph Algorithms for Technical Interviews", "Achieve >= 90% in Calculus II"],
  weakConcepts: ["Edge Relaxation in Dijkstra", "Negative Edge Weights", "Limits & Continuity Removable Points"],
  preferredLanguage: "Python",
  preferredExplanationStyle: "Intuitive & Analogies",
  currentCourse: "CS 202: Advanced Data Structures & Graph Algorithms",
  masteredConcepts: ["Breadth-First Search", "Adjacency Lists", "Binary Min-Heaps", "Functions & Slopes"],
  quizHistory: [
    { title: "Graph Traversal Basics", score: 85, passed: true, date: "2026-11-08" },
    { title: "Shortest Paths Diagnostic", score: 46, passed: false, date: "2026-11-09" },
    { title: "Heap Operations & Priority Queues", score: 92, passed: true, date: "2026-11-07" },
  ],
  recommendations: [
    "Review Edge Relaxation invariant with MIT Demaine visualization",
    "Complete LeetCode 743 (Network Delay Time)",
    "Build Autonomous Drone Flight Router project",
  ],
};

const STORAGE_KEY = "learngraph_session_memory_v1";

export const orchestratorApi = {
  // ── Session Memory Store ───────────────────────────────────────────────────
  getSessionMemory: (): SessionMemory => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback to default
    }
    return DEFAULT_SESSION_MEMORY;
  },

  updateSessionMemory: (updates: Partial<SessionMemory>): SessionMemory => {
    const current = orchestratorApi.getSessionMemory();
    const updated = { ...current, ...updates };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore write errors
    }
    return updated;
  },

  resetSessionMemory: (): SessionMemory => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SESSION_MEMORY));
    } catch {
      // Ignore write errors
    }
    return DEFAULT_SESSION_MEMORY;
  },

  // ── AI Orchestrator: Multi-Agent Intent Detection ──────────────────────────
  detectIntentAndOrchestrate: async (
    prompt: string,
    memory?: SessionMemory
  ): Promise<OrchestrationResult> => {
    const mem = memory || orchestratorApi.getSessionMemory();
    const lower = prompt.toLowerCase();

    // 1. Coding Assistant Intent
    if (
      lower.includes("code") ||
      lower.includes("python") ||
      lower.includes("java") ||
      lower.includes("c++") ||
      lower.includes("typescript") ||
      lower.includes("sql") ||
      lower.includes("bug") ||
      lower.includes("syntax error") ||
      lower.includes("function") ||
      lower.includes("optimize this") ||
      lower.includes("complexity")
    ) {
      return simulateDelay<OrchestrationResult>(
        {
          detectedIntent: "Coding",
          confidence: 0.96,
          tutorReply: `Hello ${mem.studentName}! 💻 I've routed this to our **Dedicated Coding Assistant**. I specialize in ${mem.preferredLanguage}, Java, C++, TypeScript, and SQL. I will provide clean, secure code with asymptotic complexity breakdown and step-by-step debugging.`,
          actionDestination: "coding",
          actionLabel: "Open Coding Studio",
        },
        300
      );
    }

    // 2. Study Plan / Schedule Intent
    if (
      lower.includes("schedule") ||
      lower.includes("plan") ||
      lower.includes("exam date") ||
      lower.includes("timetable") ||
      lower.includes("pomodoro") ||
      lower.includes("calendar") ||
      lower.includes("revision")
    ) {
      return simulateDelay<OrchestrationResult>(
        {
          detectedIntent: "Study Plan",
          confidence: 0.95,
          tutorReply: `I hear you, ${mem.studentName}! 📅 I've activated the **AI Study Planner**. Based on your target goals (${mem.learningGoals[0]}) and current weak concepts (${mem.weakConcepts.slice(0, 2).join(", ")}), I can formulate a personalized day-by-day study schedule with spaced repetition intervals and Pomodoro breaks.`,
          actionDestination: "planner",
          actionLabel: "Open Study Schedule Planner",
        },
        300
      );
    }

    // 3. Weak Concept Detector Intent
    if (
      lower.includes("weak concept") ||
      lower.includes("why did i fail") ||
      lower.includes("mistake") ||
      lower.includes("my gaps") ||
      lower.includes("repeated error") ||
      lower.includes("score dropped")
    ) {
      return simulateDelay<OrchestrationResult>(
        {
          detectedIntent: "Weak Concept",
          confidence: 0.97,
          tutorReply: `Great proactive mindset, ${mem.studentName}! 🔍 I've audited your recent quiz history (including the 46% score on Shortest Paths). I've routed this to the **Weak Concept Detector** to diagnose the exact root causes, error patterns, and calculate your estimated improvement time.`,
          actionDestination: "weak_concept",
          actionLabel: "Inspect Weak Concept Audit",
        },
        300
      );
    }

    // 4. PDF Document Analyzer Intent
    if (
      lower.includes("pdf") ||
      lower.includes("upload") ||
      lower.includes("document") ||
      lower.includes("lecture notes") ||
      lower.includes("mind map")
    ) {
      return simulateDelay<OrchestrationResult>(
        {
          detectedIntent: "PDF",
          confidence: 0.94,
          tutorReply: `📄 Perfect! I've engaged the **Deep Document Analyzer**. I will decompose your materials into mind maps, mathematical formulas, structured study notes, and Neo4j knowledge graphs.`,
          actionDestination: "pdf_analyzer",
          actionLabel: "Open PDF Analyzer",
        },
        300
      );
    }

    // 5. Quiz Generator Intent
    if (
      lower.includes("quiz") ||
      lower.includes("test me") ||
      lower.includes("practice questions") ||
      lower.includes("diagnostic")
    ) {
      return simulateDelay<OrchestrationResult>(
        {
          detectedIntent: "Quiz",
          confidence: 0.93,
          tutorReply: `Ready to test your recall, ${mem.studentName}? 🎯 I've loaded the **Adaptive Quiz Lab**, calibrated across all 7 question types (MCQ, True/False, Coding, Fill-in, Long Answer, Case Studies) with Bloom's taxonomy tags and stepped hints.`,
          actionDestination: "quiz_generator",
          actionLabel: "Launch Adaptive Quiz Lab",
        },
        300
      );
    }

    // 6. Recommendation Engine Intent
    if (
      lower.includes("recommend") ||
      lower.includes("next step") ||
      lower.includes("what should i learn next")
    ) {
      return simulateDelay<OrchestrationResult>(
        {
          detectedIntent: "Recommendations",
          confidence: 0.92,
          tutorReply: `🧭 Based on your ${mem.currentCourse} progress and recent quiz results, the **Learning Path Engine** has identified your next cognitive frontier, complete with explicit 'WHY' rationales for each recommended video, reading, and project.`,
          actionDestination: "path_recommender",
          actionLabel: "View Learning Path",
        },
        300
      );
    }

    // 7. Knowledge Graph Intent
    if (lower.includes("knowledge graph") || lower.includes("neo4j") || lower.includes("cypher")) {
      return simulateDelay<OrchestrationResult>(
        {
          detectedIntent: "Knowledge Graph",
          confidence: 0.95,
          tutorReply: `🕸️ I've loaded the **Knowledge Graph Builder**, visualizing your concepts, prerequisite dependencies, and generating idempotent Neo4j Cypher scripts.`,
          actionDestination: "graph_builder",
          actionLabel: "Open Graph Builder",
        },
        300
      );
    }

    // Default: AI Tutor (Conversational)
    return simulateDelay<OrchestrationResult>(
      {
        detectedIntent: "Learning",
        confidence: 0.90,
        tutorReply: `Hi ${mem.studentName}! 😊 I remember that you're currently working on **${mem.currentCourse}** with a focus on **${mem.learningGoals[0]}**. Using your preferred style (${mem.preferredExplanationStyle}), let's break this down together step-by-step!`,
        actionDestination: "chat",
      },
      300
    );
  },

  // ── Weak Concept & Mistake Analyzer ─────────────────────────────────────────
  analyzeWeakConcepts: async (params?: {
    history?: SessionMemory["quizHistory"];
    weakList?: string[];
  }): Promise<WeakConceptDetectorResult> => {
    const result: WeakConceptDetectorResult = {
      analyzedAt: new Date().toISOString(),
      totalQuizzesAudited: 8,
      repeatedErrorPatterns: [
        {
          quizTitle: "Shortest Paths Diagnostic",
          questionText: "Why does Dijkstra fail on negative edge weights?",
          userAnswer: "It creates an infinite loop because edges get smaller indefinitely.",
          correctAnswer: "Once a vertex is extracted from the min-heap, its shortest distance is finalized and never re-evaluated.",
          errorPattern: "Confusing negative edge weights with negative cycles",
          frequency: 3,
        },
        {
          quizTitle: "Graph Optimization Invariants",
          questionText: "Can adding a constant K > 0 make Dijkstra work on negative edges?",
          userAnswer: "Yes, because all edge weights become positive.",
          correctAnswer: "No, because longer paths receive proportionally more penalty K than shorter paths.",
          errorPattern: "Path length scaling fallacy",
          frequency: 2,
        },
      ],
      skippedTopics: ["Johnson's Algorithm & Vertex Potentials", "Fibonacci Heap Amortized Bounds"],
      weakConcepts: [
        {
          concept: "Edge Relaxation in Dijkstra",
          severity: "Critical",
          confidence: 0.94,
          reason: "Repeated confusion between path re-weighting and monotonic distance bounds. Student missed 3 questions related to greedy finalization.",
          suggestedLearningPath: [
            "1. Review physical 'expanding water' analogy for greedy choice.",
            "2. Trace step-by-step 3-node counterexample with weight -10.",
            "3. Complete 5 targeted True/False invariant checks.",
          ],
          estimatedImprovementTime: "45 minutes",
          relatedPrerequisites: ["Breadth-First Search", "Binary Min-Heap"],
        },
        {
          concept: "Negative Weight Cycles vs Negative Edges",
          severity: "High",
          confidence: 0.89,
          reason: "Student assumes single negative edge behaves identically to negative cycles. Failed to identify Bellman-Ford V-th relaxation trigger.",
          suggestedLearningPath: [
            "1. Study Bellman-Ford V-1 simple path bound.",
            "2. Run negative cycle detection simulation.",
          ],
          estimatedImprovementTime: "30 minutes",
          relatedPrerequisites: ["Dynamic Programming", "Edge Relaxation"],
        },
        {
          concept: "Limits at Removable Discontinuities",
          severity: "Moderate",
          confidence: 0.82,
          reason: "Occasional hesitation when evaluating factoring vs algebraic rationalization techniques.",
          suggestedLearningPath: [
            "1. Review difference of squares factoring shortcuts.",
            "2. Practice 4 epsilon-delta algebraic limit proofs.",
          ],
          estimatedImprovementTime: "25 minutes",
          relatedPrerequisites: ["Algebraic Functions", "Slopes"],
        },
      ],
      globalImprovementPlan:
        "Focus on fundamental invariant proofs before advancing to network flow algorithms. Estimated total time to clear all critical and high severity gaps: 1 hour 40 minutes.",
    };

    return simulateDelay(result, 500);
  },

  // ── Personalized Study Schedule Generator ───────────────────────────────────
  generateStudySchedule: async (params: {
    examDate: string;
    hoursPerDay: number;
    weakConcepts: string[];
    difficulty: "Beginner" | "Intermediate" | "Advanced";
  }): Promise<StudySchedulePayload> => {
    const examDateObj = new Date(params.examDate);
    const today = new Date();
    const diffTime = Math.max(1, examDateObj.getTime() - today.getTime());
    const daysRemaining = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const payload: StudySchedulePayload = {
      examDate: params.examDate,
      daysRemaining,
      dailyHoursAvailable: params.hoursPerDay,
      difficulty: params.difficulty,
      weeklyGoals: [
        {
          weekNumber: 1,
          focusArea: "Remediate Critical Knowledge Gaps",
          targetConcepts: ["Edge Relaxation Mechanics", "Greedy Invariants", "Negative Edge Counterexamples"],
          checkpointGoal: "Achieve >= 80% on Shortest Paths Diagnostic Retake",
        },
        {
          weekNumber: 2,
          focusArea: "Algorithmic Synthesis & Mock Exams",
          targetConcepts: ["Bellman-Ford Implementation", "Johnson's Algorithm", "Comprehensive Mock Tests"],
          checkpointGoal: "Complete 2 Full-length timed mock tests with >= 85% score",
        },
      ],
      dailyPlan: [
        {
          dayNumber: 1,
          dateString: "Day 1 (Today)",
          dayName: "Foundations & Diagnostic Review",
          totalStudyHours: params.hoursPerDay,
          pomodoroBreakSchedule: "25m focus / 5m break × 4 blocks; 15m restorative break halfway",
          slots: [
            {
              timeSlot: "09:00 - 10:15",
              topic: "Edge Relaxation Intuition & Counterexample Tracing",
              activityType: "Concept Review",
              durationMinutes: 75,
              objectives: ["Draw out 3-node negative edge failure", "Verify monotonic distance invariant"],
            },
            {
              timeSlot: "10:30 - 11:30",
              topic: "Targeted MCQ & True/False Practice",
              activityType: "Practice Problems",
              durationMinutes: 60,
              objectives: ["Complete 8 personalized quiz questions", "Review explanations for missed choices"],
            },
          ],
        },
        {
          dayNumber: 2,
          dateString: "Day 2",
          dayName: "Priority Queues & Implementation",
          totalStudyHours: params.hoursPerDay,
          pomodoroBreakSchedule: "50m deep work / 10m break × 2 blocks",
          slots: [
            {
              timeSlot: "09:00 - 10:15",
              topic: "Min-Heap Backing & Indexed Heaps",
              activityType: "Practice Problems",
              durationMinutes: 75,
              objectives: ["Implement relax_edge() in Python", "Derive O((V+E)log V) bound"],
            },
            {
              timeSlot: "10:30 - 11:30",
              topic: "Active Recall Flashcards Review",
              activityType: "Flashcard Revision",
              durationMinutes: 60,
              objectives: ["Review memory tips and mnemonics for greedy choice"],
            },
          ],
        },
        {
          dayNumber: 3,
          dateString: "Day 3",
          dayName: "Bellman-Ford & Negative Cycles",
          totalStudyHours: params.hoursPerDay,
          pomodoroBreakSchedule: "25m focus / 5m break",
          slots: [
            {
              timeSlot: "09:00 - 10:30",
              topic: "Bellman-Ford Dynamic Programming Iterations",
              activityType: "Concept Review",
              durationMinutes: 90,
              objectives: ["Trace V-1 relaxation passes", "Write negative cycle verification loop"],
            },
          ],
        },
      ],
      breakReminders: [
        "Hydrate and stretch eyes every 25 minutes during deep coding blocks.",
        "Take a brisk 10-minute walk after completing the edge relaxation session.",
        "Avoid screen exposure for 30 minutes before sleep to facilitate memory consolidation.",
      ],
      revisionSchedule: [
        {
          interval: "Day 1 (Immediate)",
          conceptsToReview: ["Edge Relaxation Formula", "Negative Weight Counterexample"],
          technique: "Immediate active recall self-test using Flashcard Lab",
        },
        {
          interval: "Day 3 (Reinforcement)",
          conceptsToReview: ["Min-Heap decrease-key bounds", "Dijkstra vs Bellman-Ford matrix"],
          technique: "Blind problem solving without hints on LeetCode 743",
        },
        {
          interval: "Day 7 (Retention)",
          conceptsToReview: ["All Graph Invariants", "Calculus Limits factoring tricks"],
          technique: "Full diagnostic re-assessment with 10 questions",
        },
      ],
      mockTests: [
        {
          testDate: "3 days before exam",
          title: "Mid-Term Comprehensive Mock Assessment 1",
          topicsCovered: ["Graph Traversal", "Dijkstra", "Bellman-Ford", "Asymptotics"],
          durationMinutes: 60,
          passTargetScore: 80,
        },
        {
          testDate: "1 day before exam",
          title: "Final Exam Simulation Assessment 2",
          topicsCovered: ["All Curriculum Concepts", "Complex Case Studies"],
          durationMinutes: 90,
          passTargetScore: 88,
        },
      ],
      progressCheckpoints: [
        {
          milestone: "Checkpoint A: Invariants Solidified",
          targetDate: "Day 2",
          criteria: "Zero errors on negative edge re-weighting questions",
        },
        {
          milestone: "Checkpoint B: Implementation Fluidity",
          targetDate: "Day 4",
          criteria: "Code Dijkstra and Bellman-Ford from memory in under 8 minutes",
        },
      ],
    };

    return simulateDelay(payload, 500);
  },

  // ── ChatGPT-Style Dedicated Coding Assistant ────────────────────────────────
  codeAssistant: async (params: {
    language: SupportedLanguage;
    task: "explain_algorithm" | "debug_code" | "optimize_code" | "generate_examples";
    prompt: string;
    code?: string;
  }): Promise<CodingAssistantResponse> => {
    const lang = params.language;

    // Secure, production-ready Python example
    if (lang === "Python") {
      const resp: CodingAssistantResponse = {
        language: "Python",
        codeSnippet: `import heapq
from typing import Dict, List, Tuple

def dijkstra_shortest_path(
    graph: Dict[str, List[Tuple[str, float]]], 
    start_node: str
) -> Tuple[Dict[str, float], Dict[str, str]]:
    """
    Computes single-source shortest paths using an indexed min-priority queue.
    Guarantees O((V + E) log V) time complexity and O(V) space complexity.
    """
    # 1. Distances initialized to infinity, predecessor pointers to None
    distances: Dict[str, float] = {node: float('inf') for node in graph}
    predecessors: Dict[str, str] = {node: None for node in graph}
    distances[start_node] = 0.0

    # 2. Priority queue stores tuples of (current_shortest_distance, node_id)
    pq: List[Tuple[float, str]] = [(0.0, start_node)]
    visited = set()

    while pq:
        current_dist, u = heapq.heappop(pq)

        # Skip stale entries in heap
        if u in visited:
            continue
        visited.add(u)

        # 3. Edge relaxation for all outgoing neighbors
        for v, weight in graph.get(u, []):
            if weight < 0:
                raise ValueError(f"Negative edge ({u} -> {v}, weight={weight}) violates Dijkstra invariant!")

            if v not in visited:
                new_distance = current_dist + weight
                if new_distance < distances[v]:
                    distances[v] = new_distance
                    predecessors[v] = u
                    heapq.heappush(pq, (new_distance, v))

    return distances, predecessors`,
        explanation: `Here is the clean, idiomatic Python implementation. Notice three critical engineering safeguards:
1. **Monotonicity Guard**: Line 31 explicitly validates that edge weights are non-negative, raising a \`ValueError\` if negative weights are detected.
2. **Stale Heap Entry Pruning**: Lines 24-27 maintain a \`visited\` set to skip outdated distance tuples popped from Python's standard \`heapq\`.
3. **Predecessor Tracking**: Returns a predecessor map to reconstruct exact shortest routes in $\\mathcal{O}(V)$ time.`,
        complexity: {
          timeComplexity: "O((V + E) log V)",
          timeExplanation: "Each vertex is pushed and popped from the binary heap at most once (V log V); each directed edge is relaxed once, triggering a heap push (E log V).",
          spaceComplexity: "O(V + E)",
          spaceExplanation: "Adjacency list stores V vertices and E edges; distances dictionary and priority queue consume O(V) space.",
        },
        optimizationTips: [
          "Use integer node IDs (0..V-1) with a direct fixed-size array rather than hash map dictionaries for 3x speedup.",
          "If edges are unweighted, replace the min-heap with a collections.deque for O(V + E) linear time BFS.",
          "In high-density graphs where E ~ V^2, an O(V^2) matrix Dijkstra without a heap is often faster due to zero heap overhead.",
        ],
        debuggingAdvice: [
          "Check for floating point inaccuracies: when dealing with fractional weights, use math.isclose() or scaled integers.",
          "Verify graph connectivity: if a vertex is unreachable from start_node, distances[v] remains float('inf').",
        ],
        practiceQuestions: [
          {
            title: "Reconstruct Full Route Path",
            description: "Write a function reconstruct_path(predecessors, target_node) that returns the list of vertex IDs from start to target.",
            difficulty: "Easy",
            starterSnippet: "def reconstruct_path(predecessors: dict, target: str) -> list:\n    # TODO\n    pass",
            solutionSnippet: "def reconstruct_path(predecessors: dict, target: str) -> list:\n    path = []\n    curr = target\n    while curr is not None:\n        path.append(curr)\n        curr = predecessors.get(curr)\n    return path[::-1]",
          },
        ],
        synthesisProjectIdea: "Build a real-time GPS route server using OpenStreetMap geo-data with Flask/FastAPI and Python heapq.",
        securityNotice: "Verified safe: Pure algorithmic implementation with typed parameters, input validation, and zero unsafe evals or injection points.",
      };
      return simulateDelay(resp, 400);
    }

    // Secure SQL / Multi-language response
    const resp: CodingAssistantResponse = {
      language: lang,
      codeSnippet: `-- Parameterized SQL Query with Window Functions & Zero SQL-Injection
WITH ranked_attempts AS (
    SELECT 
        student_id,
        quiz_id,
        score,
        percentage,
        created_at,
        ROW_NUMBER() OVER (
            PARTITION BY student_id, quiz_id 
            ORDER BY score DESC, created_at DESC
        ) AS rank_order
    FROM quiz_attempts
    WHERE student_id = :student_id_param
)
SELECT 
    student_id,
    quiz_id,
    score,
    percentage,
    created_at AS best_attempt_time
FROM ranked_attempts
WHERE rank_order = 1;`,
      explanation: `This SQL query utilizes a Common Table Expression (CTE) and the \`ROW_NUMBER()\` window function to retrieve the single best quiz attempt for each student without slow N+1 subqueries. It uses parameterized binding (\`:student_id_param\`) to mathematically prevent SQL Injection attacks.`,
      complexity: {
        timeComplexity: "O(N log K)",
        timeExplanation: "N is the number of attempts; window partitioning and sorting by index runs in logarithmic sort time per partition.",
        spaceComplexity: "O(N)",
        spaceExplanation: "Temporary buffer used by Postgres engine during window frame evaluation.",
      },
      optimizationTips: [
        "Create a composite index on (student_id, quiz_id, score DESC) to enable an index-only scan.",
      ],
      debuggingAdvice: [
        "Ensure parameterized inputs are used in application code (e.g. session.execute(query, {'student_id_param': id})).",
      ],
      practiceQuestions: [
        {
          title: "Filter by 70% Mastery Threshold",
          description: "Modify query to only return students whose highest percentage is >= 70%.",
          difficulty: "Easy",
          starterSnippet: "-- Add WHERE filter\n",
          solutionSnippet: "WHERE rank_order = 1 AND percentage >= 70.0;",
        },
      ],
      synthesisProjectIdea: "Build a real-time student leaderboard aggregation query with PostgreSQL materialized views.",
      securityNotice: "Security Verified: Strictly parameterized query design preventing SQL Injection vulnerabilities.",
    };

    return simulateDelay(resp, 400);
  },
};
