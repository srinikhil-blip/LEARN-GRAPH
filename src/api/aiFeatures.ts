import { simulateDelay } from "./client";
import type {
  PersonalizedQuizPayload,
  PersonalizedQuizQuestion,
  LearningPathRecommendationOutput,
  FlashcardDeckPayload,
  AdvancedFlashcardItem,
  DeepPdfAnalysisResult,
  QuestionTypeEnum,
  EducationLevel,
} from "@/types/aiFeatures";

export const aiFeaturesApi = {
  // ── 1. Personalized Quiz Generator ──────────────────────────────────────────
  generatePersonalizedQuiz: async (params: {
    studentMastery: number;
    weakConcepts: string[];
    difficulty: EducationLevel;
    questionCount: number;
    questionTypes: QuestionTypeEnum[];
    topic?: string;
  }): Promise<PersonalizedQuizPayload> => {
    const topic = params.topic || (params.weakConcepts[0] || "Computer Science & Graph Algorithms");
    const activeTypes: QuestionTypeEnum[] =
      params.questionTypes.length > 0
        ? params.questionTypes
        : [
            "MCQ",
            "True/False",
            "Fill in the blanks",
            "Coding",
            "Short answer",
            "Long answer",
            "Case study",
          ];

    const samplePool: PersonalizedQuizQuestion[] = [
      {
        id: "q-mcq-1",
        type: "MCQ",
        question: `In ${topic}, what is the invariant that prevents Dijkstra's algorithm from functioning correctly with negative edge weights?`,
        options: [
          "Once a vertex is extracted from the min-heap, its shortest distance is finalized and never re-evaluated.",
          "The algorithm uses a FIFO queue which cannot sort negative numbers.",
          "It converts all graphs into unweighted multigraphs during preprocessing.",
          "Negative weights trigger an infinite recursive call stack in all graph representations.",
        ],
        correctAnswer: "Once a vertex is extracted from the min-heap, its shortest distance is finalized and never re-evaluated.",
        explanation: "Dijkstra relies on a greedy contract: because all weights are assumed >= 0, relaxing through any unvisited node cannot yield a path shorter than the current minimum in the heap. Negative weights violate this monotonic assumption.",
        difficulty: params.difficulty,
        concept: "Dijkstra's Algorithm & Greedy Choice",
        bloomsTaxonomyLevel: "Analyze",
        hints: [
          "Think about what happens to a node's distance once it is added to the 'visited' set.",
          "Does Dijkstra ever re-insert a finalized vertex back into the min-heap?",
        ],
        estimatedSolvingTime: "90 seconds",
      },
      {
        id: "q-tf-2",
        type: "True/False",
        question: `True or False: If a constant K > 0 is added to every edge in a graph with negative edges to make them all positive, Dijkstra's algorithm will find the true shortest path on the original graph.`,
        options: ["True", "False"],
        correctAnswer: "False",
        explanation: "False! Adding a constant K to every edge unfairly penalizes paths with more edges. If Path 1 has 1 edge and Path 2 has 4 edges, Path 2 receives a penalty of 4K while Path 1 only receives 1K, potentially reversing their relative optimality.",
        difficulty: params.difficulty,
        concept: "Edge Weight Re-weighting Pitfall",
        bloomsTaxonomyLevel: "Evaluate",
        hints: [
          "Compare a path with 1 heavy edge versus a path with 5 lightweight edges.",
          "How many times is K added to each candidate path?",
        ],
        estimatedSolvingTime: "45 seconds",
      },
      {
        id: "q-fill-3",
        type: "Fill in the blanks",
        question: `The operation that tests whether an intermediate vertex u improves the current shortest path to vertex v is known as _______.`,
        correctAnswer: "edge relaxation",
        explanation: "Edge relaxation evaluates: if dist[u] + w(u, v) < dist[v], then dist[v] := dist[u] + w(u, v). It is the atomic step in both Dijkstra and Bellman-Ford algorithms.",
        difficulty: "Beginner",
        concept: "Edge Relaxation Mechanics",
        bloomsTaxonomyLevel: "Remember",
        hints: [
          "It starts with 'edge' and refers to relaxing an upper bound on path length.",
        ],
        estimatedSolvingTime: "30 seconds",
      },
      {
        id: "q-code-4",
        type: "Coding",
        question: `Complete the Python edge relaxation logic inside the Dijkstra helper function.`,
        codeSnippet: `import heapq

def relax_edge(u, v, weight, dist, pq):
    # TODO: Implement relaxation condition
    # Update dist[v] and push (new_distance, v) into pq
    pass`,
        starterCode: `if dist[u] + weight < dist[v]:\n    dist[v] = dist[u] + weight\n    heapq.heappush(pq, (dist[v], v))`,
        correctAnswer: `if dist[u] + weight < dist[v]:\n    dist[v] = dist[u] + weight\n    heapq.heappush(pq, (dist[v], v))`,
        explanation: "We verify if reaching v via u reduces dist[v]. If true, we assign the smaller value and push the updated tuple into the min-priority queue.",
        difficulty: "Intermediate",
        concept: "Algorithm Implementation",
        bloomsTaxonomyLevel: "Apply",
        hints: [
          "Check if dist[u] + weight is strictly less than dist[v].",
          "Remember to push the updated (distance, vertex) tuple to the heap.",
        ],
        estimatedSolvingTime: "3 minutes",
      },
      {
        id: "q-short-5",
        type: "Short answer",
        question: `What is the time complexity of Dijkstra's algorithm implemented with an indexed binary min-heap for a graph with V vertices and E edges? Explain each term.`,
        correctAnswer: "O((V + E) log V)",
        explanation: "Extracting the minimum vertex occurs V times, taking O(V log V). Relaxing edges occurs at most E times, each performing a decrease-key/heap-push taking O(E log V). Combined, this yields O((V + E) log V).",
        difficulty: "Intermediate",
        concept: "Asymptotic Analysis",
        bloomsTaxonomyLevel: "Understand",
        hints: [
          "Consider the cost of extracting vertices from the heap versus updating edge distances.",
        ],
        estimatedSolvingTime: "2 minutes",
      },
      {
        id: "q-long-6",
        type: "Long answer",
        question: `Compare and contrast Dijkstra's algorithm with the Bellman-Ford algorithm in terms of: 1) Algorithm paradigm (greedy vs dynamic programming), 2) Edge weight constraints, 3) Time complexity, and 4) Detection of negative cycles.`,
        correctAnswer: "Dijkstra is greedy, requires non-negative weights, runs in O((V + E) log V), and cannot handle negative cycles. Bellman-Ford uses dynamic programming, allows negative edges, runs in O(V * E), and detects negative cycles by verifying if an additional V-th relaxation step still decreases distance.",
        explanation: "Bellman-Ford iterates over all edges V-1 times. If a V-th iteration still relaxes an edge, a negative cycle exists because a simple shortest path can contain at most V-1 edges.",
        difficulty: "Advanced",
        concept: "Comparative Algorithmics",
        bloomsTaxonomyLevel: "Evaluate",
        hints: [
          "Think about the number of iterations required by Bellman-Ford to guarantee convergence.",
          "How does Bellman-Ford detect that a path can decrease indefinitely?",
        ],
        estimatedSolvingTime: "4 minutes",
      },
      {
        id: "q-case-7",
        type: "Case study",
        question: `CASE STUDY: You are an architect designing a low-latency navigation engine for autonomous drones. Some aerial corridors offer tailwinds (positive effective cost savings or negative time penalties), while others face headwinds. Drone battery reserves cannot drop below zero. Which shortest path strategy would you deploy and how would you protect against cyclic wind loops?`,
        correctAnswer: "Deploy Bellman-Ford or Johnson's algorithm with cycle detection to identify negative wind loops. If cycles exist, raise an unroutable flight alert; otherwise, use vertex potentials to convert edge weights to non-negative values and execute Dijkstra for real-time low latency queries.",
        explanation: "Johnson's algorithm computes vertex potentials using Bellman-Ford once, then reweights all edges to non-negative values: w'(u,v) = w(u,v) + h(u) - h(v) >= 0. Once reweighted, subsequent real-time point-to-point queries can run Dijkstra with O((V+E)log V) latency without negative weight traps.",
        difficulty: "Advanced",
        concept: "Real-world Engineering Architecture",
        bloomsTaxonomyLevel: "Create",
        hints: [
          "Notice that tailwinds introduce negative costs.",
          "Is there an algorithm that runs Bellman-Ford once to enable Dijkstra on reweighted graphs?",
        ],
        estimatedSolvingTime: "5 minutes",
      },
    ];

    // Filter to selected question types and limit to count
    const filteredQuestions = samplePool.filter((q) => activeTypes.includes(q.type));
    const finalQuestions = filteredQuestions.slice(0, Math.max(1, params.questionCount));

    const payload: PersonalizedQuizPayload = {
      title: `Personalized Diagnostic: ${topic}`,
      targetMasteryScore: params.studentMastery,
      targetedWeakConcepts: params.weakConcepts.length > 0 ? params.weakConcepts : ["Greedy Choice", "Negative Weights"],
      difficulty: params.difficulty,
      totalQuestions: finalQuestions.length,
      questionTypes: activeTypes,
      questions: finalQuestions,
    };

    return simulateDelay(payload, 500);
  },

  // ── 2. Next Learning Path Recommender ────────────────────────────────────────
  recommendLearningPath: async (params: {
    studentProgress: number;
    weakConcepts: string[];
    completedLessons: string[];
    quizScores: Array<{ topic: string; score: number }>;
  }): Promise<LearningPathRecommendationOutput> => {
    const weakList = params.weakConcepts.length > 0 ? params.weakConcepts : ["Limits & Continuity", "Edge Relaxation"];

    const output: LearningPathRecommendationOutput = {
      pathTitle: "Adaptive Mastery Path: From Graph Foundations to Algorithmic Mastery",
      studentCurrentProgress: params.studentProgress,
      estimatedTotalLearningTime: "4 hours 30 mins",
      confidenceScore: 0.94,
      whySummary: `Generated based on your current 68% progress and recent quiz analysis. The graph identified that your mastery in '${weakList[0]}' is below the 70% threshold, which directly blocks your understanding of advanced Dynamic Programming and Network Flow algorithms.`,
      nextConcepts: [
        {
          name: "Edge Relaxation Mechanics",
          rationale: "WHY: Your recent assessment showed 46% mastery here. This is the exact mathematical foundation needed for Dijkstra and Bellman-Ford.",
          urgency: "High",
          estimatedMinutes: 30,
          prerequisitesMet: true,
        },
        {
          name: "Min-Priority Queue Implementation",
          rationale: "WHY: Prerequisite mastery verified (Heap Data Structures · 88%). You are ready to combine heaps with graph relaxation.",
          urgency: "Next Frontier",
          estimatedMinutes: 45,
          prerequisitesMet: true,
        },
        {
          name: "Bellman-Ford & Negative Cycles",
          rationale: "WHY: Resolves the conceptual boundary where Dijkstra's greedy choice fails.",
          urgency: "Medium",
          estimatedMinutes: 50,
          prerequisitesMet: false,
        },
      ],
      videos: [
        {
          title: "Dijkstra's Algorithm in 4 Minutes with Visual Proof",
          authorOrSource: "MIT OpenCourseWare (Prof. Erik Demaine)",
          durationOrPages: "12 min",
          type: "video",
          difficulty: "Beginner",
          why: "WHY: Visual animations clarify the 'expanding water' analogy, resolving your weakness in monotonic greedy selection.",
        },
        {
          title: "Why Negative Edges Break Dijkstra (Step-by-Step Counterexample)",
          authorOrSource: "LearnGraph Visual Academy",
          durationOrPages: "8 min",
          type: "video",
          difficulty: "Intermediate",
          why: "WHY: Directly addresses the exact question you missed on path reweighting.",
        },
      ],
      books: [
        {
          title: "Introduction to Algorithms (CLRS) — Chapter 24",
          authorOrSource: "Cormen, Leiserson, Rivest, Stein",
          durationOrPages: "Pages 643-664",
          type: "book",
          difficulty: "Intermediate",
          why: "WHY: Standard academic reference with formal invariant proofs for Single-Source Shortest Paths.",
        },
      ],
      articles: [
        {
          title: "From Dijkstra to Johnson's Algorithm: Reweighting Graphs via Vertex Potentials",
          authorOrSource: "ACM Computing Surveys",
          durationOrPages: "15 min read",
          type: "article",
          difficulty: "Advanced",
          why: "WHY: Prepares you for the advanced systems engineering case studies in your target goal.",
        },
      ],
      practiceProblems: [
        {
          title: "Network Delay Time (LeetCode 743)",
          authorOrSource: "LeetCode Graph Exploration Set",
          durationOrPages: "1 Problem",
          type: "problem",
          difficulty: "Intermediate",
          why: "WHY: Tests implementation of min-priority queue Dijkstra on directed weighted graphs.",
        },
        {
          title: "Cheapest Flights Within K Stops (LeetCode 787)",
          authorOrSource: "Dynamic Programming & Shortest Paths",
          durationOrPages: "1 Problem",
          type: "problem",
          difficulty: "Advanced",
          why: "WHY: Reinforces the boundary where edge-count constraints require Bellman-Ford instead of greedy Dijkstra.",
        },
      ],
      projects: [
        {
          title: "Autonomous Drone Flight Router with Micro-Weather Hazards",
          description: "Build a Python & Neo4j route planner that computes flight paths across windy aerial grids, automatically detecting wind cycle vortices.",
          technologies: ["Python", "Neo4j", "FastAPI", "NetworkX"],
          estimatedHours: "3 hours",
          why: "WHY: Synthesizes graph modeling, edge relaxation, and negative cycle detection into a portfolio project.",
        },
      ],
    };

    return simulateDelay(output, 500);
  },

  // ── 3. Advanced Flashcard Generator ─────────────────────────────────────────
  generateAdvancedFlashcards: async (params: {
    topic: string;
    count?: number;
  }): Promise<FlashcardDeckPayload> => {
    const cards: AdvancedFlashcardItem[] = [
      {
        id: "fc-1",
        question: "What is the core Edge Relaxation formula in Dijkstra's algorithm?",
        answer: "if dist[u] + w(u, v) < dist[v]:\n    dist[v] = dist[u] + w(u, v)",
        difficulty: "Beginner",
        category: "Graph Mechanics",
        tags: ["Dijkstra", "Shortest Path", "Relaxation"],
        memoryTip: "Think of dist[v] as an elastic band stretched tight: whenever a shortcut through u is found, the band 'relaxes' to a shorter length.",
        mnemonic: "R.E.L.A.X. = Reach Earlier Length, Adjust X (destination)",
      },
      {
        id: "fc-2",
        question: "Why does Dijkstra fail on negative-weight edges?",
        answer: "Because Dijkstra assumes that once a vertex is extracted from the min-heap, its shortest path is final. A negative weight later can create an alternate path that is shorter, but Dijkstra never revisits extracted vertices.",
        difficulty: "Intermediate",
        category: "Algorithmic Invariants",
        tags: ["Greedy Choice", "Negative Weights", "Counterexample"],
        memoryTip: "Greedy Lock-In: Dijkstra locks the door behind it. Negative edges are secret trapdoors it cannot see once locked.",
        mnemonic: "P.O.S. = Positive Only Strategy (Dijkstra)",
      },
      {
        id: "fc-3",
        question: "What is the time complexity of Dijkstra using a Min-Heap?",
        answer: "O((V + E) log V), where V is the number of vertices and E is the number of edges.",
        difficulty: "Intermediate",
        category: "Complexity Analysis",
        tags: ["Big-O", "Heap", "Efficiency"],
        memoryTip: "Every vertex is popped once (V log V); every edge can trigger a heap decrease-key (E log V).",
        mnemonic: "V pops, E drops, log V hops!",
      },
      {
        id: "fc-4",
        question: "How does the Bellman-Ford algorithm detect negative weight cycles?",
        answer: "It relaxes all edges V-1 times. If a V-th relaxation step still decreases any distance, a negative cycle must exist.",
        difficulty: "Advanced",
        category: "Dynamic Programming",
        tags: ["Bellman-Ford", "Cycles", "Verification"],
        memoryTip: "Any simple path on V vertices can have at most V-1 edges. If step V still shrinks distance, it's looping negatively forever.",
        mnemonic: "V-1 is Done, V is None (or negative cycle won!)",
      },
    ];

    const payload: FlashcardDeckPayload = {
      title: `Advanced Flashcard Deck: ${params.topic}`,
      subject: "Computer Science & Graph Theory",
      flashcards: cards.slice(0, params.count || cards.length),
    };

    return simulateDelay(payload, 400);
  },

  // ── 4. Deep PDF & Document Analyzer ─────────────────────────────────────────
  analyzePdfDeep: async (params: {
    filename: string;
    text?: string;
  }): Promise<DeepPdfAnalysisResult> => {
    const docTitle = params.filename.replace(/\.[^/.]+$/, "");

    const result: DeepPdfAnalysisResult = {
      documentTitle: docTitle,
      summary: `Comprehensive academic document analysis of '${docTitle}'. Deconstructs fundamental graph theory, single-source shortest paths, priority queue data structures, and edge relaxation algorithms. Highlights the mathematical prerequisites, greedy invariants, and boundary conditions separating Dijkstra from Bellman-Ford.`,
      important_concepts: [
        {
          name: "Single-Source Shortest Path (SSSP)",
          definition: "The problem of determining the shortest paths from a single designated source vertex to all other vertices in a directed weighted graph.",
          importanceScore: 1.0,
        },
        {
          name: "Greedy Choice Property",
          definition: "An algorithmic paradigm that makes the locally optimal choice at each stage with the assumption that this leads to a globally optimal solution.",
          importanceScore: 0.95,
        },
        {
          name: "Substructure Optimality",
          definition: "A property where an optimal solution to a problem contains within it optimal solutions to subproblems (e.g. any subpath of a shortest path is also a shortest path).",
          importanceScore: 0.92,
        },
        {
          name: "Indexed Min-Priority Queue",
          definition: "A priority queue data structure supporting decrease-key operations in O(log V) time by maintaining an internal index lookup table.",
          importanceScore: 0.88,
        },
      ],
      important_formulas: [
        {
          name: "Edge Relaxation Invariant",
          formula: "dist[v] = min(dist[v], dist[u] + w(u, v))",
          explanation: "Guarantees monotonic convergence toward the shortest path by tightening triangle inequalities.",
          variables: {
            "dist[v]": "Current upper bound on shortest distance from source to vertex v",
            "dist[u]": "Current shortest distance to intermediate vertex u",
            "w(u, v)": "Weight of directed edge connecting u to v",
          },
        },
        {
          name: "Dijkstra Time Complexity",
          formula: "T(V, E) = O(|V| * T_extract_min + |E| * T_decrease_key) = O((V + E) log V)",
          explanation: "Derived from V extract-min operations and at most E decrease-key operations on a binary min-heap.",
          variables: {
            "V": "Total vertices in the graph",
            "E": "Total edges in the graph",
          },
        },
      ],
      mind_map: {
        rootTopic: docTitle,
        branches: [
          {
            name: "1. Graph Foundations",
            subtopics: ["Adjacency List vs Matrix", "Directed vs Undirected", "Weighted Edges", "Triangle Inequality"],
          },
          {
            name: "2. Traversal Algorithms",
            subtopics: ["Breadth-First Search (Unweighted)", "Depth-First Search (Backtracking)", "Dijkstra (Non-Negative Weights)", "Bellman-Ford (Negative Weights)"],
          },
          {
            name: "3. Implementation Details",
            subtopics: ["Min-Priority Queue", "Edge Relaxation", "Visited Set (Locked Nodes)", "Parent Pointer Reconstruct"],
          },
          {
            name: "4. Algorithmic Pitfalls",
            subtopics: ["Negative Weight Failure", "Negative Cycles", "Constant K Addition Error", "Infinite Loops"],
          },
        ],
      },
      knowledge_graph: {
        nodes: [
          { id: "n1", name: "Graph Theory", type: "Subject" },
          { id: "n2", name: "Shortest Paths", type: "Topic" },
          { id: "n3", name: "Dijkstra's Algorithm", type: "Concept" },
          { id: "n4", name: "Edge Relaxation", type: "Concept" },
          { id: "n5", name: "Min-Heap", type: "Concept" },
          { id: "n6", name: "Bellman-Ford", type: "Concept" },
          { id: "n7", name: "Network Routing", type: "Skill" },
        ],
        relationships: [
          { from: "n2", to: "n1", type: "PART_OF", confidence: 1.0 },
          { from: "n3", to: "n2", type: "PART_OF", confidence: 1.0 },
          { from: "n4", to: "n3", type: "PREREQUISITE", confidence: 0.98 },
          { from: "n5", to: "n3", type: "PREREQUISITE", confidence: 0.94 },
          { from: "n3", to: "n6", type: "RELATED_TO", confidence: 0.86 },
          { from: "n3", to: "n7", type: "IMPROVES", confidence: 0.95 },
        ],
      },
      flashcards: [
        {
          id: "fc-pdf-1",
          question: "What is the greedy condition that allows Dijkstra to skip backtracking?",
          answer: "Dijkstra assumes non-negative edge weights; therefore, any future path reaching an already extracted vertex will have greater or equal cost.",
          difficulty: "Beginner",
          category: "Greedy Algorithms",
          tags: ["Dijkstra", "Proof"],
          memoryTip: "Water flows downhill: once it pools at a local lowest point, it won't be replaced by water from a higher hill.",
          mnemonic: "N.N.W. = Non-Negative Weights are Required",
        },
        {
          id: "fc-pdf-2",
          question: "How does Johnson's algorithm allow Dijkstra on negative weights?",
          answer: "It uses vertex potentials h(u) computed by Bellman-Ford to reweight edges: w'(u, v) = w(u, v) + h(u) - h(v) >= 0 without altering shortest paths.",
          difficulty: "Advanced",
          category: "Advanced Reweighting",
          tags: ["Johnson", "Potentials"],
          memoryTip: "Think of gravitational potential energy: going up or down hills balances out over complete round trips.",
          mnemonic: "H.I.K.E. = Height Invariant Keeps Equivalence",
        },
      ],
      quiz: [
        {
          id: "q-pdf-1",
          type: "MCQ",
          question: "Which data structure guarantees O((V + E) log V) time for Dijkstra?",
          options: ["Indexed Binary Min-Heap", "Simple Linked List", "Unsorted Array", "Stack"],
          correctAnswer: "Indexed Binary Min-Heap",
          explanation: "Binary heaps provide O(log V) extract-min and decrease-key operations.",
          difficulty: "Intermediate",
          concept: "Priority Queues",
          bloomsTaxonomyLevel: "Understand",
          hints: ["Consider which structure efficiently maintains minimum order."],
          estimatedSolvingTime: "45 seconds",
        },
      ],
      prerequisites: [
        "Graph Representation (Adjacency Lists & Matrices)",
        "Binary Heap & Priority Queue Operations",
        "Big-O Asymptotic Notation & Proof by Induction",
      ],
      study_notes: [
        {
          heading: "1. Core Mathematical Preconditions",
          content: "Dijkstra operates strictly on directed or undirected graphs where edge weights w(u, v) >= 0. When weights can be negative, the greedy selection fails and Bellman-Ford must be chosen instead.",
          keyTakeaways: [
            "Greedy selection requires non-negative weights.",
            "Adding a constant K does not solve negative weights because longer paths are penalized more.",
          ],
        },
        {
          heading: "2. The Edge Relaxation Process",
          content: "For each neighbor v of extracted vertex u, evaluate if dist[u] + w(u, v) < dist[v]. If so, update dist[v] and update the priority queue.",
          keyTakeaways: [
            "Relaxation is monotonic: distance bounds only decrease, never increase.",
            "Triangle inequality is satisfied when relaxation completes.",
          ],
        },
      ],
      weak_concepts: [
        {
          concept: "Graph Reweighting Fallacy",
          pitfallExplanation: "Students frequently assume that adding a constant K to make all edges positive allows running Dijkstra. This fails because paths with more edges receive more penalties.",
          remediationAdvice: "Study Johnson's algorithm vertex potentials w'(u,v) = w(u,v) + h(u) - h(v), which preserves the relative lengths of all paths between any pair of vertices.",
        },
        {
          concept: "Negative Weight Cycle Traps",
          pitfallExplanation: "Failing to check for negative cycles causes infinite relaxation loops in routing engines.",
          remediationAdvice: "Run the V-th relaxation check in Bellman-Ford to confirm no cycle reduces total cost indefinitely.",
        },
      ],
    };

    return simulateDelay(result, 600);
  },
};
