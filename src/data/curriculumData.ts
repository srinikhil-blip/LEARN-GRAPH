import type { CurriculumNode, TopicContentPayload } from "@/types/curriculum";

/**
 * LearnGraph Universal Curriculum & Knowledge Base
 * Production-ready hierarchical educational data spanning School, Undergrad,
 * Postgrad, Placements, and 14 Specialized Career Paths.
 */

// ── 1. CANONICAL TOPIC: DIJKSTRA'S SHORTEST PATH (Algorithms / CS & FAANG) ──
export const TOPIC_DIJKSTRA_ALGORITHM: TopicContentPayload = {
  id: "topic-dijkstra-shortest-path",
  topicTitle: "Dijkstra's Shortest Path Algorithm",
  chapterTitle: "Graph Algorithms & Shortest Path",
  subjectTitle: "Data Structures & Algorithms",
  tier: "undergraduate",
  targetAudience: "B.Tech CS / MCA / FAANG Placement Aspirants",

  overview:
    "Dijkstra's algorithm is a greedy algorithm that determines the shortest paths from a single source vertex to all other vertices in a weighted graph with non-negative edge weights.",

  beginnerExplanation:
    "Imagine water flooding through a network of pipes at equal speed. The water will reach the closest pipe intersection first, then spread outward from there. Dijkstra's algorithm does the exact same thing: it visits intersections in order of their true shortest distance from home, guaranteeing you never take an accidental detour.",

  advancedExplanation:
    "Let G = (V, E, w) be a directed, non-negative edge-weighted graph. Dijkstra maintains a set of visited vertices S. At each iteration, it selects u in V \\ S minimizing d[u]. By induction, d[u] = delta(s, u) because any alternative path must leave S via an edge (x, y) where delta(s, y) >= delta(s, x) + w(x, y) >= d[x] + w(x, y) >= d[u], since all weights w >= 0. Using a Fibonacci or Binary Min-Heap, the relaxation runs in O((|V| + |E|) log |V|) time.",

  realWorldExamples: [
    "Google Maps turn-by-turn navigation across road networks with positive travel times.",
    "Open Shortest Path First (OSPF) routing protocol inside internet autonomous systems.",
    "Logistics and supply chain delivery route optimization minimizing fuel expenditure.",
  ],

  visualExplanation: {
    description:
      "A source node 'S' radiates distance wavefronts. A priority queue contains candidates (node, dist). Green nodes are finalized, yellow nodes are in the frontier queue, and dashed lines represent relaxed edges.",
    diagramType: "Graph",
    asciiOrSvgHint:
      "[Source: A (dist=0)] --(4)--> [B (dist=4)] --(1)--> [C (dist=5)]\n      |                                        ^\n      +-----------------(8)--------------------+",
  },

  stepByStepGuide: [
    {
      step: 1,
      title: "Initialize Distances",
      instruction:
        "Assign dist[source] = 0 and dist[v] = infinity for all other vertices. Insert (0, source) into min-heap.",
    },
    {
      step: 2,
      title: "Extract Minimum",
      instruction:
        "Pop (current_dist, u) with minimum distance from priority queue. If current_dist > dist[u], continue (stale entry).",
    },
    {
      step: 3,
      title: "Edge Relaxation",
      instruction:
        "For each neighbor v with edge weight w: if dist[u] + w < dist[v], update dist[v] = dist[u] + w and push (dist[v], v) to heap.",
    },
    {
      step: 4,
      title: "Termination",
      instruction:
        "Repeat until priority queue is empty. Return finalized dist map and parent pointers for path reconstruction.",
    },
  ],

  practiceExercises: [
    {
      id: "ex-1",
      question:
        "Why does Dijkstra's algorithm fail on graphs with negative edge weights?",
      hint: "Consider what happens when a node is marked visited and later a negative edge offers a shortcut.",
      solution:
        "Dijkstra assumes that once a vertex is extracted from the min-heap, its shortest path is permanently finalized. A negative edge can retroactively decrease the distance to an already-settled vertex, violating the greedy invariant.",
      difficulty: "Intermediate",
    },
    {
      id: "ex-2",
      question:
        "What is the time complexity when implemented with an Adjacency Matrix and Unsorted Array instead of a Min-Heap?",
      hint: "Finding the min vertex takes O(V), repeated V times.",
      solution:
        "O(V^2), which is actually optimal for dense graphs where |E| is approximately |V|^2.",
      difficulty: "Advanced",
    },
  ],

  codingProblems: [
    {
      id: "code-dijkstra-1",
      title: "Network Delay Time (LeetCode 743)",
      description:
        "Given a list of travel times directed edges times[i] = (u, v, w) and n nodes labeled 1 to n. Find the minimum time for all nodes to receive a signal from node k.",
      inputFormat: "times: int[][], n: int, k: int",
      outputFormat: "int (total time or -1 if unreachable)",
      sampleInput: "times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2",
      sampleOutput: "2",
      starterCode: {
        Python:
          "import heapq\n\ndef networkDelayTime(times: list[list[int]], n: int, k: int) -> int:\n    # Write your solution here\n    pass",
        Java: "import java.util.*;\n\nclass Solution {\n    public int networkDelayTime(int[][] times, int n, int k) {\n        // Write your solution here\n        return -1;\n    }\n}",
      },
      solutionCode: {
        Python:
          "import heapq\nfrom collections import defaultdict\n\ndef networkDelayTime(times: list[list[int]], n: int, k: int) -> int:\n    graph = defaultdict(list)\n    for u, v, w in times:\n        graph[u].append((v, w))\n    \n    pq = [(0, k)]\n    dist = {}\n    while pq:\n        d, node = heapq.heappop(pq)\n        if node in dist:\n            continue\n        dist[node] = d\n        for neighbor, weight in graph[node]:\n            if neighbor not in dist:\n                heapq.heappush(pq, (d + weight, neighbor))\n                \n    return max(dist.values()) if len(dist) == n else -1",
      },
      timeComplexity: "O(E log V)",
      spaceComplexity: "O(V + E)",
    },
  ],

  mcqQuiz: [
    {
      id: "mcq-d-1",
      question: "Which algorithmic paradigm does Dijkstra's algorithm adhere to?",
      options: [
        "Dynamic Programming",
        "Greedy Method",
        "Divide and Conquer",
        "Backtracking",
      ],
      correctIndex: 1,
      explanation:
        "Dijkstra makes the greedy choice of always finalizing the unvisited vertex with the minimum tentative distance.",
      bloomsLevel: "Understand",
    },
    {
      id: "mcq-d-2",
      question: "What is the optimal time complexity of Dijkstra with a Fibonacci Heap?",
      options: ["O(V^2)", "O(E + V log V)", "O(E log V)", "O(V log E)"],
      correctIndex: 1,
      explanation:
        "Fibonacci heaps perform decrease-key in amortized O(1) time and extract-min in O(log V), yielding O(E + V log V).",
      bloomsLevel: "Remember",
    },
    {
      id: "mcq-d-3",
      question: "What data structure is standard for implementing Dijkstra efficiently in technical interviews?",
      options: ["Stack", "Binary Min-Heap / Priority Queue", "Circular Queue", "Disjoint Set (Union-Find)"],
      correctIndex: 1,
      explanation: "A binary min-heap allows O(log V) extraction and insertion.",
      bloomsLevel: "Apply",
    },
    {
      id: "mcq-d-4",
      question: "Which algorithm should be preferred if a graph contains negative edge weights but no negative cycles?",
      options: ["Dijkstra's Algorithm", "Bellman-Ford Algorithm", "Kruskal's Algorithm", "Prim's Algorithm"],
      correctIndex: 1,
      explanation: "Bellman-Ford handles negative weights in O(V * E) time.",
      bloomsLevel: "Analyze",
    },
    {
      id: "mcq-d-5",
      question: "What happens if Dijkstra is executed on a graph with negative cycles reachable from the source?",
      options: [
        "It terminates with correct distances",
        "It can loop indefinitely or produce incorrect sub-optimal distances",
        "It automatically detects the cycle and raises an exception",
        "It computes maximum spanning tree instead",
      ],
      correctIndex: 1,
      explanation:
        "Negative cycles cause distances to decrease without bound, breaking the greedy invariant and causing invalid states.",
      bloomsLevel: "Analyze",
    },
    {
      id: "mcq-d-6",
      question: "In an unweighted graph, Dijkstra's algorithm behaves identically to which algorithm?",
      options: ["Depth First Search (DFS)", "Breadth First Search (BFS)", "Topological Sort", "A* Search with h=1"],
      correctIndex: 1,
      explanation:
        "When all edge weights are identical (e.g. 1), the priority queue behaves exactly like a standard FIFO queue in BFS.",
      bloomsLevel: "Evaluate",
    },
    {
      id: "mcq-d-7",
      question: "During edge relaxation from u to v with weight w, under what condition is dist[v] updated?",
      options: [
        "dist[u] + w > dist[v]",
        "dist[u] + w < dist[v]",
        "dist[u] == dist[v]",
        "w < dist[u]",
      ],
      correctIndex: 1,
      explanation: "Relaxation finds a shorter path: if dist[u] + w < dist[v], update dist[v] = dist[u] + w.",
      bloomsLevel: "Understand",
    },
    {
      id: "mcq-d-8",
      question: "How can Dijkstra be modified to find the shortest path to a single target node instead of all nodes?",
      options: [
        "Reverse the graph first",
        "Early-exit immediately when the target node is extracted from the priority queue",
        "Change the min-heap to a max-heap",
        "Run DFS after preprocessing",
      ],
      correctIndex: 1,
      explanation:
        "Because extraction from the min-heap finalizes the optimal distance, you can safely terminate once target is popped.",
      bloomsLevel: "Apply",
    },
    {
      id: "mcq-d-9",
      question: "A* search is best described as an extension of Dijkstra's algorithm with what addition?",
      options: [
        "Dynamic programming memoization table",
        "Admissible heuristic function h(n)",
        "Negative edge cycle detector",
        "Randomized pivot selection",
      ],
      correctIndex: 1,
      explanation: "A* uses f(n) = g(n) + h(n), where h(n) estimates remaining distance to goal.",
      bloomsLevel: "Evaluate",
    },
    {
      id: "mcq-d-10",
      question: "What is the space complexity of Dijkstra on an adjacency list representation?",
      options: ["O(1)", "O(V)", "O(V + E)", "O(V^2)"],
      correctIndex: 2,
      explanation: "Stores the graph O(V + E) and distance map/priority queue O(V).",
      bloomsLevel: "Remember",
    },
  ],

  flashcards: [
    {
      id: "fc-d-1",
      front: "What is Dijkstra's core greedy invariant?",
      back: "The tentative distance to the closest unvisited vertex is guaranteed to be its true shortest path in graphs with non-negative weights.",
      mnemonic: "MIN-DIST: Min In Heap Is Never Decreased If Steps Are Non-negative.",
      category: "Algorithms",
    },
    {
      id: "fc-d-2",
      front: "Edge Relaxation Formula",
      back: "if dist[u] + weight(u, v) < dist[v]: dist[v] = dist[u] + weight(u, v)",
      memoryTip: "Think of stretching an elastic cord between cities; relaxing means releasing unnecessary tension.",
      category: "Formulas",
    },
  ],

  interviewQuestions: [
    {
      question: "How would you find the K-shortest paths between source and destination?",
      sampleAnswer:
        "Use Yen's algorithm combined with Dijkstra, or modify the priority queue to allow each node to be visited up to K times with monotonically increasing distances.",
      targetCompanyType: "FAANG",
      frequency: "High",
    },
    {
      question: "Can Dijkstra handle directed acyclic graphs (DAGs) faster than O(E log V)?",
      sampleAnswer:
        "Yes! By topologically sorting the DAG in O(V + E) and relaxing edges in topological order, shortest paths are found in linear O(V + E) without any priority queue.",
      targetCompanyType: "Product",
      frequency: "Very High",
    },
  ],

  commonMistakes: [
    {
      mistake: "Allowing stale elements in the priority queue to trigger redundant relaxations.",
      whyItHappens: "Standard heaps don't support efficient decrease-key, so duplicates are pushed.",
      correctApproach: "Always check `if (d > dist[u]) continue;` immediately upon popping.",
    },
    {
      mistake: "Attempting to use Dijkstra on graphs with negative weights by adding a constant offset.",
      whyItHappens: "Intuition suggests shifting all weights positive solves the problem.",
      correctApproach: "Adding offset penalizes paths with MORE edges disproportionately. Use Johnson's or Bellman-Ford.",
    },
  ],

  revisionNotes: [
    "Dijkstra solves Single-Source Shortest Path (SSSP) for non-negative weighted graphs.",
    "Time complexity: O((V + E) log V) with Binary Min-Heap; O(E + V log V) with Fibonacci Heap.",
    "Invariant: When node u is popped from PQ, dist[u] is optimal.",
    "Fails with negative weights; use Bellman-Ford instead.",
    "A* adds heuristic h(n); BFS is Dijkstra with uniform edge weight = 1.",
  ],

  aiSummary:
    "Dijkstra's algorithm greedily expands the minimum-distance horizon from a source vertex across non-negative edge weights. Standard implementation pairs an adjacency list with a binary min-heap for O((V + E) log V) performance. It is foundational for networking, GPS mapping, and robotics motion planning.",

  graphRelationships: [
    {
      targetConcept: "Graph Traversal (BFS & DFS)",
      relationship: "PREREQUISITE",
      description: "Must understand graph representation and frontier expansion.",
      weight: 1.0,
    },
    {
      targetConcept: "Priority Queue / Min-Heap",
      relationship: "REQUIRES",
      description: "Relies on logarithmic extraction of minimum distance node.",
      weight: 0.95,
    },
    {
      targetConcept: "A* Search Algorithm",
      relationship: "ADVANCED_VERSION_OF",
      description: "A* augments Dijkstra with admissible heuristics.",
      weight: 0.9,
    },
    {
      targetConcept: "Bellman-Ford Algorithm",
      relationship: "RELATED_TO",
      description: "Alternative shortest path algorithm supporting negative weights.",
      weight: 0.85,
    },
    {
      targetConcept: "Network Routing & OSPF",
      relationship: "USED_IN",
      description: "Computes optimal routing tables across autonomous networks.",
      weight: 0.95,
    },
    {
      targetConcept: "Shortest Path Problems",
      relationship: "PART_OF",
      description: "A central member of combinatorial optimization graph problems.",
      weight: 1.0,
    },
  ],

  prerequisites: ["Graph Representations", "Breadth-First Search", "Binary Heaps", "Greedy Invariants"],
  recommendedNextTopics: ["A* Search Algorithm", "Bellman-Ford Algorithm", "Floyd-Warshall All-Pairs", "Minimum Spanning Trees (Prim's)"],
  bloomsTaxonomyLevel: "Analyze",
  estimatedStudyTimeMinutes: 45,
  difficultyRating: "Intermediate",
};

// ── 2. CANONICAL TOPIC: LIMITS & CONTINUITY (Class 11/12 Math & Calculus) ────
export const TOPIC_LIMITS_CONTINUITY: TopicContentPayload = {
  id: "topic-limits-continuity",
  topicTitle: "Limits & Continuity",
  chapterTitle: "Differential Calculus",
  subjectTitle: "Mathematics",
  tier: "school",
  targetAudience: "Class 11 & 12 / JEE / STEM Foundation",

  overview:
    "The fundamental cornerstone of calculus describing the behavior of a function near a point rather than at that point, enabling the formal definition of derivatives and integrals.",

  beginnerExplanation:
    "Imagine walking along a trail toward a bridge. Even if a plank is missing right over the river, you can still clearly see where both sides of the bridge are meeting. A limit tells you what height you are heading toward, regardless of whether there's a hole at that exact step.",

  advancedExplanation:
    "Formal epsilon-delta definition: lim_{x->c} f(x) = L if for every eps > 0, there exists delta > 0 such that 0 < |x - c| < delta implies |f(x) - L| < eps. A function is continuous at c iff: 1) f(c) is defined; 2) lim_{x->c} f(x) exists; and 3) lim_{x->c} f(x) = f(c).",

  realWorldExamples: [
    "Instantaneous velocity: calculating speedometer speed when delta t approaches zero.",
    "Economics: marginal revenue and cost curves at the infinitesimal margin.",
    "Physics: electrical current as the limit of charge delta Q over delta t.",
  ],

  visualExplanation: {
    description:
      "A Cartesian coordinate plot showing a function with a removable discontinuity (a hole at x=2) where left-hand and right-hand limits converge on y=4.",
    diagramType: "Flowchart",
    asciiOrSvgHint:
      "y = (x^2 - 4) / (x - 2)\nAs x -> 2 from left (1.9, 1.99) -> y approaches 4\nAs x -> 2 from right (2.1, 2.01) -> y approaches 4\nPoint (2, 4) is a hollow circle (undefined).",
  },

  stepByStepGuide: [
    {
      step: 1,
      title: "Direct Substitution",
      instruction: "Plug in c into f(x). If you get a finite real number, that is your limit.",
    },
    {
      step: 2,
      title: "Evaluate Indeterminate Forms",
      instruction: "If substitution yields 0/0 or inf/inf, factorize, rationalize, or apply L'Hopital's rule.",
    },
    {
      step: 3,
      title: "Check One-Sided Limits",
      instruction: "For piecewise or absolute-value functions, calculate lim_{x->c^-} and lim_{x->c^+}. Limit exists iff both are equal.",
    },
  ],

  practiceExercises: [
    {
      id: "ex-lim-1",
      question: "Evaluate lim_{x->3} (x^2 - 9) / (x - 3).",
      hint: "Factor the numerator as a difference of squares.",
      solution: "Factor: (x-3)(x+3)/(x-3) = x+3. Substitute x=3: 3+3 = 6.",
      difficulty: "Beginner",
    },
  ],

  mcqQuiz: [
    {
      id: "mcq-l-1",
      question: "What is lim_{x->0} (sin x) / x equal to (in radians)?",
      options: ["0", "1", "Infinity", "Undefined"],
      correctIndex: 1,
      explanation: "This is a fundamental trigonometric limit proven by the Squeeze Theorem: lim_{x->0} sin(x)/x = 1.",
      bloomsLevel: "Remember",
    },
    {
      id: "mcq-l-2",
      question: "When is a function f(x) continuous at x = a?",
      options: [
        "f(a) is defined",
        "lim_{x->a} f(x) exists",
        "lim_{x->a} f(x) = f(a)",
        "All of the above",
      ],
      correctIndex: 3,
      explanation: "Continuity strictly requires the value to be defined, the limit to exist, and both to be identical.",
      bloomsLevel: "Understand",
    },
    {
      id: "mcq-l-3",
      question: "Which theorem guarantees that if f is continuous on [a, b] and u is between f(a) and f(b), there exists c with f(c) = u?",
      options: [
        "Mean Value Theorem",
        "Intermediate Value Theorem (IVT)",
        "Rolle's Theorem",
        "L'Hopital's Rule",
      ],
      correctIndex: 1,
      explanation: "The Intermediate Value Theorem guarantees continuous functions take on every intermediate value.",
      bloomsLevel: "Apply",
    },
    {
      id: "mcq-l-4",
      question: "What type of discontinuity exists at x = 0 for f(x) = 1/x?",
      options: ["Removable", "Jump", "Essential / Infinite", "Oscillating"],
      correctIndex: 2,
      explanation: "As x approaches 0, values blow up to +inf and -inf, creating an infinite discontinuity.",
      bloomsLevel: "Analyze",
    },
    {
      id: "mcq-l-5",
      question: "What is the value of lim_{x->inf} (3x^2 + 5) / (7x^2 - 2x)?",
      options: ["0", "3/7", "5/-2", "Infinity"],
      correctIndex: 1,
      explanation: "Dividing numerator and denominator by highest degree x^2 leaves (3 + 5/x^2)/(7 - 2/x) -> 3/7.",
      bloomsLevel: "Apply",
    },
    {
      id: "mcq-l-6",
      question: "If left-hand limit is 5 and right-hand limit is 5, but f(c) is undefined, what can we say?",
      options: [
        "The limit does not exist",
        "The limit exists and equals 5, with a removable discontinuity",
        "The function is continuous",
        "The function has an infinite asymptote",
      ],
      correctIndex: 1,
      explanation: "Limit depends only on the neighborhood, not the value at c.",
      bloomsLevel: "Evaluate",
    },
    {
      id: "mcq-l-7",
      question: "Evaluate lim_{x->0} (e^x - 1) / x.",
      options: ["0", "1", "e", "Undefined"],
      correctIndex: 1,
      explanation: "By L'Hopital or derivative of e^x at x=0: d/dx(e^x)|_{x=0} = 1.",
      bloomsLevel: "Understand",
    },
    {
      id: "mcq-l-8",
      question: "Which indeterminate form is NOT suitable for direct L'Hopital's rule without algebraic rearrangement?",
      options: ["0 / 0", "inf / inf", "0 * inf", "Both 0/0 and inf/inf are suitable"],
      correctIndex: 2,
      explanation: "0 * inf must be rewritten as 0/(1/inf) = 0/0 or inf/(1/0) = inf/inf before applying L'Hopital.",
      bloomsLevel: "Analyze",
    },
    {
      id: "mcq-l-9",
      question: "What is lim_{x->0} x * sin(1/x)?",
      options: ["0", "1", "Does not exist", "Infinity"],
      correctIndex: 0,
      explanation: "Because -1 <= sin(1/x) <= 1, -x <= x*sin(1/x) <= x. By Squeeze Theorem, as x->0 the limit is 0.",
      bloomsLevel: "Evaluate",
    },
    {
      id: "mcq-l-10",
      question: "Which of the following functions is nowhere continuous?",
      options: [
        "Dirichlet function (1 if rational, 0 if irrational)",
        "Weierstrass function",
        "Heaviside step function",
        "Signum function",
      ],
      correctIndex: 0,
      explanation: "The Dirichlet function changes value in every open neighborhood due to density of rationals and irrationals.",
      bloomsLevel: "Remember",
    },
  ],

  flashcards: [
    {
      id: "fc-l-1",
      front: "Three Conditions for Continuity at x = c",
      back: "1. f(c) is defined\n2. lim_{x->c} f(x) exists\n3. lim_{x->c} f(x) = f(c)",
      mnemonic: "DEC: Defined, Exists, Corresponds.",
      category: "Calculus",
    },
  ],

  interviewQuestions: [
    {
      question: "Explain the geometric intuition behind the definition of a derivative in terms of limits.",
      sampleAnswer:
        "The derivative is the limit of the secant line slope [f(x+h) - f(x)] / h as h approaches 0, converging to the tangent line slope.",
      targetCompanyType: "General",
      frequency: "High",
    },
  ],

  commonMistakes: [
    {
      mistake: "Confusing f(c) being undefined with the limit not existing.",
      whyItHappens: "Students check only the point value rather than the neighborhood behavior.",
      correctApproach: "A limit never cares what happens at x = c, only what happens as x approaches c.",
    },
  ],

  revisionNotes: [
    "Limit exists iff left-hand limit equals right-hand limit.",
    "0/0 requires algebraic cancellation, rationalization, or L'Hopital.",
    "Squeeze theorem bounds tricky oscillating limits.",
  ],

  aiSummary:
    "Limits describe local convergence of function values near a point, serving as the rigorous foundation for derivatives, integrals, and mathematical analysis.",

  graphRelationships: [
    {
      targetConcept: "Functions & Graphs",
      relationship: "PREREQUISITE",
      description: "Must understand function evaluation and domain.",
      weight: 1.0,
    },
    {
      targetConcept: "Derivatives",
      relationship: "PREREQUISITE",
      description: "Derivatives are defined as limits of difference quotients.",
      weight: 1.0,
    },
    {
      targetConcept: "Integration",
      relationship: "RELATED_TO",
      description: "Definite integrals are limits of Riemann sums.",
      weight: 0.9,
    },
  ],

  prerequisites: ["Algebraic Functions", "Polynomial Division", "Trigonometric Identities"],
  recommendedNextTopics: ["Derivatives by First Principles", "Continuity & Differentiability", "L'Hopital's Rule"],
  bloomsTaxonomyLevel: "Understand",
  estimatedStudyTimeMinutes: 40,
  difficultyRating: "Beginner",
};

// ── 3. CANONICAL TOPIC: SYSTEM DESIGN - DISTRIBUTED RATE LIMITER (FAANG Prep) ─
export const TOPIC_RATE_LIMITER: TopicContentPayload = {
  id: "topic-rate-limiter-system-design",
  topicTitle: "Distributed Rate Limiter Design",
  chapterTitle: "High-Level System Design (HLD)",
  subjectTitle: "System Design & Architecture",
  tier: "interview_prep",
  targetAudience: "Senior Engineers / FAANG Tech Interviewees",

  overview:
    "A distributed rate limiter controls the rate of traffic sent or received by a network service, preventing DoS attacks, resource starvation, and cascading microservice failures.",

  beginnerExplanation:
    "Think of a bouncer outside an exclusive club with a strict capacity rule of 10 people per minute. If 15 try to enter at once, 10 enter and 5 are told to wait outside. A rate limiter protects servers from crashing under sudden surges of user clicks or automated bots.",

  advancedExplanation:
    "In high-throughput distributed systems, rate limiters employ Token Bucket or Sliding Window Counter algorithms backed by Redis cluster instances. To eliminate race conditions during high concurrent traffic, Lua scripts execute multi-key evaluation atomically within Redis, avoiding distributed locks. Synchronizing state across multi-region clusters uses eventual consistency via Redis replication or local in-memory token buckets synchronized asynchronously.",

  realWorldExamples: [
    "Stripe API rate limiting (100 read req/sec, 25 write req/sec per API key).",
    "Twitter/X tweet posting rate limits preventing spam bot floods.",
    "OpenAI API token consumption limits per organization tier.",
  ],

  visualExplanation: {
    description:
      "Client requests hit an API Gateway containing the Rate Limiter Middleware. Middleware queries Redis via atomic Lua script. Allowed requests pass to Backend Services; rejected requests return HTTP 429 Too Many Requests.",
    diagramType: "Architecture",
    asciiOrSvgHint:
      "[Client] ---> [API Gateway / Rate Limiter] ---> [Microservices]\n                      |\n                      +---> [Redis Cluster (Token Bucket + Lua)]",
  },

  stepByStepGuide: [
    {
      step: 1,
      title: "Choose the Algorithm",
      instruction:
        "Select Token Bucket (smooth bursts) or Sliding Window Counter (accurate boundary counting without memory blowup).",
    },
    {
      step: 2,
      title: "Define the Rate Limit Key",
      instruction:
        "Key by User ID, IP address, API Key, or a composite key (IP + Endpoint).",
    },
    {
      step: 3,
      title: "Implement Atomic Storage",
      instruction:
        "Use Redis Lua script to read current bucket count, refill based on elapsed time, and decrement tokens atomically.",
    },
    {
      step: 4,
      title: "Return Standard HTTP Headers",
      instruction:
        "Return X-Ratelimit-Remaining, X-Ratelimit-Limit, and Retry-After (with HTTP 429 on rejection).",
    },
  ],

  practiceExercises: [
    {
      id: "ex-rl-1",
      question:
        "What is the disadvantage of the Fixed Window Counter algorithm at window boundaries?",
      hint: "What happens if a user sends the full quota in the last second of window 1 and the first second of window 2?",
      solution:
        "A 2x traffic burst can slip through at boundary edges (e.g., 100 requests at 00:59 and 100 at 01:00 = 200 requests within a 2-second interval).",
      difficulty: "Intermediate",
    },
  ],

  mcqQuiz: [
    {
      id: "mcq-rl-1",
      question: "Which HTTP status code is universally returned when a rate limit is exceeded?",
      options: ["400 Bad Request", "403 Forbidden", "429 Too Many Requests", "503 Service Unavailable"],
      correctIndex: 2,
      explanation: "RFC 6585 explicitly defines HTTP 429 Too Many Requests.",
      bloomsLevel: "Remember",
    },
    {
      id: "mcq-rl-2",
      question: "Which rate limiting algorithm allows bursts of traffic while enforcing an average rate?",
      options: ["Leaky Bucket", "Token Bucket", "Fixed Window Counter", "Round Robin"],
      correctIndex: 1,
      explanation: "Token bucket allows bursts up to the maximum capacity of tokens accumulated in the bucket.",
      bloomsLevel: "Understand",
    },
    {
      id: "mcq-rl-3",
      question: "Why are Redis Lua scripts preferred over client-side multi-command pipelines for rate limiting?",
      options: [
        "Lua runs faster than C code",
        "Lua scripts execute atomically without race conditions between get and set",
        "Redis does not support pipelining",
        "Lua reduces Redis memory usage",
      ],
      correctIndex: 1,
      explanation: "Redis executes Lua scripts atomically in a single thread, preventing concurrency race conditions.",
      bloomsLevel: "Analyze",
    },
    {
      id: "mcq-rl-4",
      question: "What is the primary memory drawback of the Sliding Window Log algorithm?",
      options: [
        "Requires deep recursion",
        "Stores an entry with timestamp for every single request in the window, consuming heavy memory under high load",
        "Causes high CPU utilization in the client",
        "Requires persistent disk storage",
      ],
      correctIndex: 1,
      explanation: "Sliding window log stores a timestamp for each request in a Redis Sorted Set, ballooning memory.",
      bloomsLevel: "Evaluate",
    },
    {
      id: "mcq-rl-5",
      question: "Which HTTP response header tells the client when they can retry after getting a 429?",
      options: ["Retry-After", "X-Wait-Time", "Cache-Control", "X-Retry-Interval"],
      correctIndex: 0,
      explanation: "Retry-After specifies the number of seconds or HTTP date after which the client may retry.",
      bloomsLevel: "Remember",
    },
    {
      id: "mcq-rl-6",
      question: "In a multi-datacenter global deployment, how can you prevent cross-region latency on every rate limit check?",
      options: [
        "Synchronous RPC to a single centralized database in US-East",
        "Local in-memory token buckets with background asynchronous reconciliation across regions",
        "Disable rate limiting across regions",
        "Use DNS round-robin without caching",
      ],
      correctIndex: 1,
      explanation: "Local in-memory or edge rate limiting with eventual synchronization guarantees sub-millisecond API latency.",
      bloomsLevel: "Create",
    },
    {
      id: "mcq-rl-7",
      question: "What is the consequence of rate limiting strictly by Client IP address in enterprise applications?",
      options: [
        "Corporate offices sharing a NAT gateway/proxy all share one quota, inadvertently blocking innocent coworkers",
        "IP addresses are impossible to parse",
        "It consumes too much bandwidth",
        "It causes TLS handshake failures",
      ],
      correctIndex: 0,
      explanation: "Many users behind a single corporate NAT proxy share one public IP.",
      bloomsLevel: "Analyze",
    },
    {
      id: "mcq-rl-8",
      question: "Which algorithm outputs requests at a strictly constant, smoothed pace?",
      options: ["Token Bucket", "Leaky Bucket", "Sliding Window Counter", "Exponential Backoff"],
      correctIndex: 1,
      explanation: "Leaky bucket processes requests at a constant rate, smoothing out bursty traffic completely.",
      bloomsLevel: "Understand",
    },
    {
      id: "mcq-rl-9",
      question: "How does Sliding Window Counter approximate request counts efficiently?",
      options: [
        "Uses machine learning neural networks",
        "Calculates requests in current window + (overlap percentage * requests in previous window)",
        "Truncates milliseconds to integer seconds",
        "Random sampling of 10% of traffic",
      ],
      correctIndex: 1,
      explanation: "Weighted sum of previous window count + current window count provides an accurate approximation with O(1) memory.",
      bloomsLevel: "Apply",
    },
    {
      id: "mcq-rl-10",
      question: "What resilient architectural pattern should an API Gateway follow if the Redis rate-limiter cluster goes completely down?",
      options: [
        "Fail open (allow traffic through with alerting) or fail closed based on security posture",
        "Crash the API Gateway pods immediately",
        "Block all incoming user traffic permanently",
        "Redirect traffic to DNS root servers",
      ],
      correctIndex: 0,
      explanation: "High-availability services usually fail open with emergency telemetry to preserve uptime.",
      bloomsLevel: "Evaluate",
    },
  ],

  flashcards: [
    {
      id: "fc-rl-1",
      front: "Token Bucket vs Leaky Bucket",
      back: "Token Bucket allows bursts up to bucket capacity; Leaky Bucket forces a steady, strictly constant egress rate.",
      category: "System Design",
    },
  ],

  interviewQuestions: [
    {
      question: "How do you handle rate limiter synchronization across 100 API gateway instances?",
      sampleAnswer:
        "Centralize counts in a distributed cache like Redis Cluster using Lua scripts, or use local token buckets where each instance gets 1/100th of the global quota, with periodic redistribution.",
      targetCompanyType: "FAANG",
      frequency: "Very High",
    },
  ],

  commonMistakes: [
    {
      mistake: "Using separate Redis GET and SET commands in application code.",
      whyItHappens: "Developers forget concurrent threads execute in parallel.",
      correctApproach: "Always encapsulate checking and decrementing inside an atomic Lua script.",
    },
  ],

  revisionNotes: [
    "Rate limiting protects availability, prevents DoS, and enforces monetized API tiers.",
    "Token Bucket = best for bursty traffic; Sliding Window Counter = best balance of accuracy and memory.",
    "Always return standard headers: X-Ratelimit-Limit, X-Ratelimit-Remaining, Retry-After, HTTP 429.",
  ],

  aiSummary:
    "A distributed rate limiter manages incoming traffic volume using algorithms like Token Bucket or Sliding Window Counter, coordinated through in-memory datastores (Redis) with atomic Lua scripts to guarantee scalability and prevent race conditions.",

  graphRelationships: [
    {
      targetConcept: "Redis In-Memory Datastore",
      relationship: "REQUIRES",
      description: "Low-latency atomic key-value operations.",
      weight: 1.0,
    },
    {
      targetConcept: "API Gateway Architecture",
      relationship: "PART_OF",
      description: "Implemented as gateway middleware layer.",
      weight: 0.95,
    },
    {
      targetConcept: "DDoS Mitigation & Security",
      relationship: "USED_IN",
      description: "First line of defense against volumetric denial-of-service.",
      weight: 0.9,
    },
  ],

  prerequisites: ["HTTP Protocols", "Distributed Caching (Redis)", "Concurrency & Race Conditions"],
  recommendedNextTopics: ["API Gateway Design", "Circuit Breaker Pattern", "Distributed Locking (Redlock)"],
  bloomsTaxonomyLevel: "Evaluate",
  estimatedStudyTimeMinutes: 50,
  difficultyRating: "Advanced",
};

// ── 4. COMPLETE HIERARCHICAL CURRICULUM NODES ─────────────────────────────────
export const UNIVERSAL_CURRICULUM_CATALOG: CurriculumNode[] = [
  // TIER: SCHOOL
  {
    id: "tier-school-class-10",
    tier: "school",
    subCategory: "Class 10",
    title: "Class 10 Board & Foundation Mastery",
    description: "Complete foundational syllabus across Mathematics, Science, and Social Sciences.",
    targetRoleOrOutcome: "Secondary School Certification & STEM Foundation",
    subjects: [
      {
        id: "c10-math",
        title: "Class 10 Mathematics",
        category: "Mathematics",
        colorTone: "indigo",
        description: "Real numbers, polynomials, linear equations, quadratic equations, and trigonometry.",
        chapters: [
          {
            id: "c10-m-ch1",
            title: "Polynomials & Quadratic Equations",
            description: "Roots, discriminant, and graphical behavior.",
            estimatedHours: 8,
            topics: [TOPIC_LIMITS_CONTINUITY],
          },
        ],
      },
      {
        id: "c10-science",
        title: "Class 10 Science",
        category: "Science",
        colorTone: "emerald",
        description: "Physics, Chemistry, and Biology fundamentals.",
        chapters: [],
      },
    ],
  },
  {
    id: "tier-school-class-12",
    tier: "school",
    subCategory: "Class 12",
    title: "Class 12 Senior Secondary & Competitive Foundation",
    description: "Advanced Calculus, Electromagnetism, Organic Chemistry, and Modern Physics.",
    targetRoleOrOutcome: "Higher Secondary Board Examination & Competitive Engineering/Medical Entrance",
    subjects: [
      {
        id: "c12-math",
        title: "Class 12 Mathematics",
        category: "Mathematics",
        colorTone: "indigo",
        description: "Calculus, Vectors, 3D Geometry, Probability.",
        chapters: [
          {
            id: "c12-m-ch2",
            title: "Differential Calculus",
            description: "Limits, continuity, derivatives, and application of derivatives.",
            estimatedHours: 14,
            topics: [TOPIC_LIMITS_CONTINUITY],
          },
        ],
      },
    ],
  },

  // TIER: UNDERGRADUATE ENGINEERING
  {
    id: "tier-undergrad-cs",
    tier: "undergraduate",
    subCategory: "Computer Science & Engineering",
    title: "B.Tech Computer Science & Engineering",
    description: "Core computer science curriculum from programming to advanced algorithms and distributed systems.",
    targetRoleOrOutcome: "Software Development Engineer (SDE), System Architect",
    subjects: [
      {
        id: "cs-dsa",
        title: "Data Structures & Algorithms",
        category: "Computer Science",
        colorTone: "violet",
        description: "Asymptotic notation, trees, graphs, dynamic programming, and greedy algorithms.",
        chapters: [
          {
            id: "cs-dsa-ch5",
            title: "Graph Algorithms",
            description: "Shortest paths, minimum spanning trees, and topological sorting.",
            estimatedHours: 16,
            topics: [TOPIC_DIJKSTRA_ALGORITHM],
          },
        ],
      },
      {
        id: "cs-dbms",
        title: "Database Management Systems",
        category: "Computer Science",
        colorTone: "cyan",
        description: "Relational algebra, SQL, indexing, ACID transactions, and NoSQL engines.",
        chapters: [],
      },
      {
        id: "cs-os",
        title: "Operating Systems",
        category: "Computer Science",
        colorTone: "amber",
        description: "Process management, memory paging, file systems, and concurrency primitives.",
        chapters: [],
      },
    ],
  },

  // TIER: INTERVIEW PREPARATION
  {
    id: "tier-interview-faang",
    tier: "interview_prep",
    subCategory: "FAANG / Tier-1 Tech",
    title: "FAANG & Top Product Companies Interview Track",
    description: "Comprehensive preparation covering LeetCode Hard DSA, System Design (HLD/LLD), and Leadership Principles.",
    targetRoleOrOutcome: "L4/L5 Software Engineer at Google, Meta, Amazon, Microsoft, Apple, Uber",
    subjects: [
      {
        id: "int-sys-design",
        title: "System Design (HLD & LLD)",
        category: "Interview Prep",
        colorTone: "rose",
        description: "Scalability, caching, distributed transactions, message queues, and real-world system blueprints.",
        chapters: [
          {
            id: "int-sd-ch3",
            title: "High-Throughput Web Scalability",
            description: "Rate limiters, load balancers, caching, and CDN architectures.",
            estimatedHours: 18,
            topics: [TOPIC_RATE_LIMITER],
          },
        ],
      },
      {
        id: "int-algo-mastery",
        title: "Advanced Coding Rounds & DSA",
        category: "Interview Prep",
        colorTone: "indigo",
        description: "Graph traversal, DP patterns, trie, segment tree, and monotonic queue.",
        chapters: [
          {
            id: "int-dsa-graphs",
            title: "Shortest Paths & Flow",
            description: "Dijkstra, Bellman-Ford, Max-Flow Min-Cut.",
            estimatedHours: 12,
            topics: [TOPIC_DIJKSTRA_ALGORITHM],
          },
        ],
      },
    ],
  },

  // TIER: CAREER ROADMAPS (14 Tracks)
  {
    id: "career-ai-engineer",
    tier: "career_roadmap",
    subCategory: "AI Engineer",
    title: "AI & Generative AI Engineer Career Track",
    description: "From Python and PyTorch fundamentals to LLM fine-tuning, RAG, LangChain, and Agentic Workflows.",
    targetRoleOrOutcome: "AI Engineer / LLM Application Developer ($140k - $220k)",
    subjects: [
      {
        id: "ai-rag-agents",
        title: "RAG & Knowledge Graphs for AI",
        category: "AI & ML",
        colorTone: "purple",
        description: "Vector databases, Neo4j GraphRAG, embedding models, and multi-agent coordination.",
        chapters: [
          {
            id: "ai-kg-ch1",
            title: "Graph Algorithms for AI Embeddings",
            description: "Graph traversal, PageRank, and shortest path heuristics in knowledge graphs.",
            estimatedHours: 10,
            topics: [TOPIC_DIJKSTRA_ALGORITHM],
          },
        ],
      },
    ],
  },
  {
    id: "career-backend-engineer",
    tier: "career_roadmap",
    subCategory: "Backend Developer",
    title: "Production Backend & Cloud Architect Track",
    description: "FastAPI, PostgreSQL, Redis, Kafka, Docker, Kubernetes, and High-Throughput Microservices.",
    targetRoleOrOutcome: "Senior Backend Developer / Cloud Architect",
    subjects: [
      {
        id: "backend-arch",
        title: "Scalable Backend Architecture",
        category: "Backend",
        colorTone: "blue",
        description: "Distributed caching, asynchronous workers, transactional outbox pattern, and rate limiting.",
        chapters: [
          {
            id: "backend-infra-ch2",
            title: "Traffic Throttling & Fault Tolerance",
            description: "Rate limiters, circuit breakers, and exponential backoff.",
            estimatedHours: 12,
            topics: [TOPIC_RATE_LIMITER],
          },
        ],
      },
    ],
  },

  // TIER: SCHOOL (Class 8, 9, 11)
  {
    id: "tier-school-class8",
    tier: "school",
    subCategory: "Class 8",
    title: "Class 8 Complete STEM Foundation",
    description: "Foundational mathematics (linear equations, exponents, geometry), physical science, cell biology, and block/Python programming intro.",
    targetRoleOrOutcome: "Strong Foundation for Secondary Board & Olympiads",
    subjects: [
      {
        id: "c8-math",
        title: "Mathematics Class 8",
        category: "Mathematics",
        colorTone: "indigo",
        description: "Rational Numbers, Linear Equations in One Variable, Understanding Quadrilaterals, Algebraic Expressions, and Mensuration.",
        chapters: [],
      },
      {
        id: "c8-science",
        title: "Science & Physics Class 8",
        category: "Science",
        colorTone: "emerald",
        description: "Force and Pressure, Friction, Sound, Chemical Effects of Electric Current, Light, and Microorganisms.",
        chapters: [],
      },
      {
        id: "c8-cs",
        title: "Computer Science & Logic",
        category: "Computer Science",
        colorTone: "purple",
        description: "Algorithmic thinking, flowcharting, scratch block logic, and introduction to Python syntax.",
        chapters: [],
      },
    ],
  },
  {
    id: "tier-school-class9",
    tier: "school",
    subCategory: "Class 9",
    title: "Class 9 Secondary Science & Tech",
    description: "Coordinate geometry, polynomial algebra, Newton's laws of motion, gravitation, atoms and molecules, cell structure, and Python programming.",
    targetRoleOrOutcome: "Class 9 Board Readiness & NTSE Foundation",
    subjects: [
      {
        id: "c9-math",
        title: "Mathematics Class 9",
        category: "Mathematics",
        colorTone: "indigo",
        description: "Number Systems, Polynomials, Coordinate Geometry, Linear Equations in Two Variables, Triangles, and Circles.",
        chapters: [],
      },
      {
        id: "c9-physics",
        title: "Physics Class 9",
        category: "Physics",
        colorTone: "blue",
        description: "Motion, Force and Laws of Motion, Gravitation, Work and Energy, and Sound.",
        chapters: [],
      },
      {
        id: "c9-chemistry",
        title: "Chemistry Class 9",
        category: "Chemistry",
        colorTone: "amber",
        description: "Matter in Our Surroundings, Atoms and Molecules, Structure of the Atom.",
        chapters: [],
      },
    ],
  },
  {
    id: "tier-school-class11",
    tier: "school",
    subCategory: "Class 11",
    title: "Class 11 Pre-University STEM & JEE/NEET Prep",
    description: "Calculus foundations, kinematics, thermodynamics, organic chemistry mechanisms, cell cycle, and Computer Science with Python & OOP.",
    targetRoleOrOutcome: "Pre-University & Entrance Exam Benchmark (JEE/NEET/Olympiads)",
    subjects: [
      {
        id: "c11-math",
        title: "Mathematics Class 11",
        category: "Mathematics",
        colorTone: "indigo",
        description: "Sets and Functions, Trigonometric Functions, Permutations & Combinations, Binomial Theorem, Sequences and Series, Limits and Derivatives.",
        chapters: [
          {
            id: "c11-math-ch13",
            title: "Limits & Introductory Calculus",
            description: "Intuitive limits, algebraic limits, trigonometric limits, and standard derivative rules.",
            estimatedHours: 14,
            topics: [TOPIC_LIMITS_CONTINUITY],
          },
        ],
      },
      {
        id: "c11-physics",
        title: "Physics Class 11",
        category: "Physics",
        colorTone: "blue",
        description: "Units & Measurements, Kinematics in 1D/2D, Laws of Motion, Work Energy Power, Rotational Dynamics, Gravitation, and Thermodynamics.",
        chapters: [],
      },
      {
        id: "c11-chemistry",
        title: "Chemistry Class 11",
        category: "Chemistry",
        colorTone: "amber",
        description: "Atomic Structure, Periodic Properties, Chemical Bonding & Molecular Structure, Chemical Thermodynamics, Equilibrium, and Redox Reactions.",
        chapters: [],
      },
    ],
  },

  // TIER: POSTGRADUATE
  {
    id: "tier-postgrad-mca",
    tier: "postgraduate",
    subCategory: "MCA (Master of Computer Applications)",
    title: "Master of Computer Applications (MCA)",
    description: "Enterprise software architecture, advanced database management, cloud microservices, software project management, and full-stack engineering.",
    targetRoleOrOutcome: "Enterprise Software Engineer / Cloud Solution Architect",
    subjects: [
      {
        id: "mca-adv-dsa",
        title: "Advanced Data Structures & Algorithms",
        category: "Computer Science",
        colorTone: "indigo",
        description: "Graph algorithms, dynamic programming, NP-completeness, randomized algorithms.",
        chapters: [
          {
            id: "mca-ch-graphs",
            title: "Shortest Paths & Spanning Trees",
            description: "Dijkstra, Floyd-Warshall, Kruskal, Prim.",
            estimatedHours: 12,
            topics: [TOPIC_DIJKSTRA_ALGORITHM],
          },
        ],
      },
      {
        id: "mca-cloud-arch",
        title: "Cloud Computing & Enterprise Systems",
        category: "Cloud",
        colorTone: "blue",
        description: "Distributed storage, microservices, container orchestration, and fault tolerance.",
        chapters: [
          {
            id: "mca-ch-scaling",
            title: "Traffic Throttling & High Availability",
            description: "Distributed rate limiting with Redis token buckets.",
            estimatedHours: 10,
            topics: [TOPIC_RATE_LIMITER],
          },
        ],
      },
    ],
  },
  {
    id: "tier-postgrad-mtech",
    tier: "postgraduate",
    subCategory: "M.Tech Computer Science & AI",
    title: "M.Tech in Computer Science & Artificial Intelligence",
    description: "Deep learning mathematical foundations, distributed systems consensus, compiler optimizations, graph neural networks, and research methodology.",
    targetRoleOrOutcome: "AI Research Scientist / Principal Systems Architect",
    subjects: [
      {
        id: "mtech-dist-sys",
        title: "Advanced Distributed Systems",
        category: "Systems",
        colorTone: "purple",
        description: "Paxos, Raft consensus, Byzantine fault tolerance, distributed transactions, and vector clocks.",
        chapters: [],
      },
      {
        id: "mtech-deep-learning",
        title: "Deep Learning & Transformer Architectures",
        category: "Artificial Intelligence",
        colorTone: "emerald",
        description: "Backpropagation calculus, self-attention mechanics, transformer scaling laws, diffusion models.",
        chapters: [],
      },
    ],
  },
  {
    id: "tier-postgrad-mba",
    tier: "postgraduate",
    subCategory: "MBA (Technology & Analytics)",
    title: "MBA in Technology Management & Business Analytics",
    description: "Data-driven business analytics, product strategy, financial modeling, organizational leadership, and platform economics.",
    targetRoleOrOutcome: "Product Manager / VP of Product / Strategy Consultant",
    subjects: [
      {
        id: "mba-product-strategy",
        title: "Tech Product Strategy & Management",
        category: "Product Management",
        colorTone: "amber",
        description: "Product discovery, North Star metrics, unit economics, A/B testing, and growth loops.",
        chapters: [],
      },
      {
        id: "mba-business-analytics",
        title: "Quantitative Business Analytics",
        category: "Analytics",
        colorTone: "rose",
        description: "Predictive regression, customer lifetime value modeling, cohort retention, and executive dashboards.",
        chapters: [],
      },
    ],
  },

  // ADDITIONAL 14 CAREER ROADMAP TRACKS
  {
    id: "career-frontend-engineer",
    tier: "career_roadmap",
    subCategory: "Frontend Developer",
    title: "Modern Frontend & Web Performance Engineer",
    description: "React 19, Next.js App Router, TypeScript, Tailwind CSS, Web Vitals optimization, and Design Systems.",
    targetRoleOrOutcome: "Senior Frontend Engineer / UI Architect ($120k - $180k)",
    subjects: [
      {
        id: "fe-react-arch",
        title: "Modern React & Component Engineering",
        category: "Frontend",
        colorTone: "blue",
        description: "Server Components, Zustand, custom hooks, micro-frontends, and accessible design tokens.",
        chapters: [],
      },
    ],
  },
  {
    id: "career-fullstack-developer",
    tier: "career_roadmap",
    subCategory: "Full Stack Developer",
    title: "Full Stack Web & Cloud Architect Track",
    description: "End-to-end full stack development: React/Next.js frontend, Python FastAPI backend, PostgreSQL, Redis, and Docker deployment.",
    targetRoleOrOutcome: "Full Stack Software Engineer / Startup Tech Lead",
    subjects: [
      {
        id: "fs-full-lifecycle",
        title: "Full Lifecycle Web Development",
        category: "Full Stack",
        colorTone: "indigo",
        description: "RESTful & GraphQL APIs, JWT RBAC security, state synchronization, and DB migrations.",
        chapters: [
          {
            id: "fs-rate-limiting",
            title: "API Gateway & Security",
            description: "Throttling, authentication tokens, and caching layers.",
            estimatedHours: 8,
            topics: [TOPIC_RATE_LIMITER],
          },
        ],
      },
    ],
  },
  {
    id: "career-devops-engineer",
    tier: "career_roadmap",
    subCategory: "DevOps Engineer",
    title: "DevOps & Cloud Platform Engineer Track",
    description: "Linux systems, Docker containerization, Kubernetes orchestration, Terraform Infrastructure as Code, CI/CD with GitHub Actions, and Prometheus/Grafana.",
    targetRoleOrOutcome: "DevOps Engineer / Site Reliability Engineer (SRE)",
    subjects: [
      {
        id: "devops-k8s-infra",
        title: "Kubernetes & Cloud Infrastructure",
        category: "DevOps & SRE",
        colorTone: "emerald",
        description: "Ingress controllers, service meshes, helm charts, horizontal pod autoscaling, and zero-downtime rollouts.",
        chapters: [],
      },
    ],
  },
  {
    id: "career-cybersecurity",
    tier: "career_roadmap",
    subCategory: "Cyber Security Engineer",
    title: "Cyber Security & Defensive Operations Track",
    description: "Network security, OWASP Top 10 web vulnerabilities, ethical hacking, cryptography, identity & access management, and SOC operations.",
    targetRoleOrOutcome: "Cyber Security Analyst / Penetration Tester / Information Security Officer",
    subjects: [
      {
        id: "sec-web-app",
        title: "Application Security & Cryptography",
        category: "Security",
        colorTone: "rose",
        description: "Public key infrastructure (RSA/ECC), OAuth2/OIDC, SQL injection prevention, and secure coding practices.",
        chapters: [],
      },
    ],
  },
  {
    id: "career-data-scientist",
    tier: "career_roadmap",
    subCategory: "Data Scientist",
    title: "Data Science & Predictive Analytics Track",
    description: "Python data science stack (NumPy, Pandas, Scipy), statistical hypothesis testing, machine learning pipelines with Scikit-learn, and Tableau visualization.",
    targetRoleOrOutcome: "Data Scientist / Machine Learning Analyst ($130k - $190k)",
    subjects: [
      {
        id: "ds-ml-foundations",
        title: "Applied Machine Learning & Statistics",
        category: "Data Science",
        colorTone: "purple",
        description: "Supervised & unsupervised learning, cross-validation, feature engineering, and ROC-AUC evaluation.",
        chapters: [],
      },
    ],
  },
  {
    id: "career-mobile-developer",
    tier: "career_roadmap",
    subCategory: "Android Developer",
    title: "Cross-Platform Mobile Engineer (Flutter & React Native)",
    description: "Native Android (Kotlin/Jetpack Compose), iOS fundamentals, cross-platform Flutter/React Native, state management, and offline-first SQLite sync.",
    targetRoleOrOutcome: "Lead Mobile Developer / Android Engineer",
    subjects: [
      {
        id: "mob-cross-platform",
        title: "Cross-Platform Mobile Architecture",
        category: "Mobile",
        colorTone: "teal",
        description: "Navigation stacks, offline caching, push notifications, native bridging, and app store deployment.",
        chapters: [],
      },
    ],
  },
];
