import type { User } from "@/types/auth";
import type { PedagogicalMode } from "@/pages/AITutor/AITutorPage";

export interface OmniTeacherSection {
  simpleExplanation: string;
  detailedExplanation: string;
  intuition: string;
  realWorldExample: string;
  diagram: string;
  formula?: string;
  codeExample?: {
    language: string;
    code: string;
    explanation: string;
  };
  commonMistakes: string[];
  practiceQuestions: {
    question: string;
    hint: string;
    solution: string;
  }[];
  miniQuiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  relatedTopics: string[];
  nextTopicRecommendation: {
    topic: string;
    reason: string;
    estimatedTime: string;
  };
  learningResources: {
    title: string;
    type: "Book" | "Paper" | "Documentation" | "Lecture";
    citation: string;
  }[];
  roadmap?: {
    title: string;
    targetOutcome: string;
    estimatedDuration: string;
    phases: {
      phase: string;
      duration: string;
      topics: string[];
      milestones: string[];
      handsOnExercise: string;
    }[];
    capstoneProject: string;
  };
}

export interface OmniTeacherResult {
  thoughtProcess: string;
  thoughtDurationSeconds: number;
  subjectDomain: string;
  studentContextGreeting: string;
  sections: OmniTeacherSection;
}

export function generateOmniTeacherResponse(
  prompt: string,
  user?: User | null,
  pedagogicalMode: PedagogicalMode = "socratic"
): OmniTeacherResult {
  const p = prompt.toLowerCase();
  const studentName = user?.name?.split(" ")[0] || "Scholar";
  const studentClass = user?.educationLevel || "Undergraduate (B.Tech)";
  const studentCollege = user?.institution || "University";
  const targetExam = user?.targetExam || "GATE CS / Engineering Entrance";
  const explanationStyle = user?.preferences?.preferredExplanationStyle || "Socratic Questioning";

  const isRoadmapRequest =
    p.includes("teach") ||
    p.includes("roadmap") ||
    p.includes("learn python") ||
    p.includes("from scratch") ||
    p.includes("how to start") ||
    p.includes("guide");

  // ─────────────────────────────────────────────────────────────
  // DOMAIN 1: PYTHON PROGRAMMING & ROADMAP REQUESTS
  // ─────────────────────────────────────────────────────────────
  if (p.includes("python") || (isRoadmapRequest && (p.includes("programming") || p.includes("coding")))) {
    return {
      thoughtProcess: `[LearnGraph Omni Context Engine]\n• Student: ${studentName} | Class/Tier: ${studentClass} | College: ${studentCollege}\n• Target Goal: ${targetExam} | Pedagogical Mode: ${pedagogicalMode}\n• Preferred Style: ${explanationStyle}\n• Diagnostic Intent: Comprehensive Mastery & Step-by-Step Curriculum Roadmap\n• Knowledge Graph Links: [Variables, Control Flow] -> [Functions & Scope] -> [OOP & Dunder] -> [Asyncio & Concurrency] -> [FastAPI & PyTorch]`,
      thoughtDurationSeconds: 3.4,
      subjectDomain: "Programming / Python",
      studentContextGreeting: `Welcome, ${studentName}! Tailored specifically for your background at **${studentCollege}** preparing for **${targetExam}**, here is your complete deep-dive educational breakdown and curriculum roadmap for **Python 3.12**.`,
      sections: {
        simpleExplanation:
          "Python is a high-level, human-readable programming language that reads almost like standard English. Instead of forcing you to manually allocate computer memory or write boilerplate punctuation like curly braces and semicolons, Python lets you translate thoughts directly into working instructions using clean indentation.",

        detailedExplanation:
          "Python is dynamically typed, strongly typed, and garbage-collected (using reference counting augmented by a cyclic generational collector). Source code compiles into Python bytecode (`.pyc`), which is executed by the CPython Virtual Machine (PVM). While traditional CPython employs a Global Interpreter Lock (GIL) for memory thread-safety, Python 3.12+ features a faster specialized adaptive interpreter (PEP 659) and subinterpreters with per-interpreter GILs, drastically improving numerical and concurrent execution throughput.",

        intuition:
          "Think of Python like an electric self-driving car compared to manual stick-shift assembly language. You tell the steering system 'turn left at 30 km/h' (clean readable syntax), and the sophisticated onboard computer manages fuel injection, transmission gears, and brake calipers behind the scenes.",

        realWorldExample:
          "1. Instagram serves over 2 billion daily active users using Django/Python backend clusters.\n2. NASA's James Webb Space Telescope uses Python scripts to automate astronomical data calibrations and image pipeline processing.\n3. Modern AI systems (ChatGPT, PyTorch, Hugging Face) write their primary model APIs in Python.",

        diagram:
          `+--------------------------------------------------------+\n|                   YOUR PYTHON SCRIPT                   |\n|                    script.py (Code)                    |\n+--------------------------------------------------------+\n                           │ (Compilation)\n                           ▼\n+--------------------------------------------------------+\n|                    PYTHON BYTECODE                     |\n|                  script.cpython-312.pyc                |\n+--------------------------------------------------------+\n                           │ (Execution Loop)\n                           ▼\n+--------------------------------------------------------+\n|              CPYTHON VIRTUAL MACHINE (PVM)             |\n|         Stack Frame Evaluation & Built-in Modules      |\n+--------------------------------------------------------+\n                           │\n                           ▼\n+--------------------------------------------------------+\n|                OPERATING SYSTEM / HARDWARE             |\n|                CPU Registers & RAM Allocation          |\n+--------------------------------------------------------+`,

        formula: "Time Complexity: Dict / Set Lookup \\mathcal{O}(1) \\text{ average}, \\quad \\text{List Sort (Timsort)}: \\mathcal{O}(n \\log n)",

        codeExample: {
          language: "Python",
          code: `from typing import List, Generator
import time

def process_student_grades(scores: List[float]) -> Generator[str, None, None]:
    """Generates letter grades with lazy evaluation memory efficiency."""
    for score in scores:
        if score >= 90:
            yield "A (Distinction)"
        elif score >= 75:
            yield "B (Proficient)"
        elif score >= 60:
            yield "C (Pass)"
        else:
            yield "Needs Review"

# Execution test
sample_scores = [94.5, 78.0, 62.5, 54.0]
for idx, grade in enumerate(process_student_grades(sample_scores), start=1):
    print(f"Student {idx}: {grade}")`,
          explanation:
            "This code demonstrates Python typing annotations, generator functions (`yield`) for memory-efficient iteration, and clean idiom (`enumerate`).",
        },

        commonMistakes: [
          "Mutable Default Arguments: Writing `def append_item(x, lst=[])` reuses the same list across all function calls! Always use `def append_item(x, lst=None): if lst is None: lst = []`.",
          "Shallow vs Deep Copies: `copy.copy(dict)` copies references to nested objects, causing unexpected mutations in inner arrays. Use `copy.deepcopy()`.",
          "Modifying Lists While Iterating: Deleting items inside a `for item in my_list:` causes skipped elements due to index shifts.",
        ],

        practiceQuestions: [
          {
            question: "Write a function to return the first non-repeating character in a string with O(n) runtime.",
            hint: "Use collections.Counter or an ordered dictionary to record frequencies.",
            solution: "from collections import Counter\ndef first_unique(s):\n    cnt = Counter(s)\n    for ch in s:\n        if cnt[ch] == 1: return ch\n    return None",
          },
          {
            question: "Explain the difference between `is` and `==` in Python.",
            hint: "One compares memory address identity (id(x)); the other checks value equality (__eq__).",
            solution: "`==` evaluates equality of values (e.g. `[1] == [1]` is True). `is` verifies whether both variables refer to the exact same memory address (e.g. `[1] is [1]` is False).",
          },
        ],

        miniQuiz: {
          question: "What is the output of `bool([])` and `bool([0])` in Python?",
          options: [
            "A. False and False",
            "B. False and True",
            "C. True and False",
            "D. True and True",
          ],
          correctIndex: 1,
          explanation:
            "An empty list `[]` is falsy (`bool([]) == False`). A list containing any element, even zero `[0]`, has a length of 1 and is strictly truthy (`bool([0]) == True`).",
        },

        relatedTopics: [
          "List Comprehensions & Generator Expressions",
          "Object-Oriented Programming (Classes & Inheritance)",
          "Decorator Functions & Closures",
          "Asynchronous I/O with asyncio",
        ],

        nextTopicRecommendation: {
          topic: "Object-Oriented Design & Dunder Methods in Python",
          reason: "Essential for structuring scalable software and understanding how frameworks like PyTorch and FastAPI override operators like `__call__` and `__getitem__`.",
          estimatedTime: "2 hours",
        },

        learningResources: [
          {
            title: "Fluent Python (2nd Edition)",
            type: "Book",
            citation: "Luciano Ramalho (O'Reilly Media) - Chapters 1-4: The Python Data Model.",
          },
          {
            title: "Official Python 3.12 Documentation",
            type: "Documentation",
            citation: "https://docs.python.org/3/tutorial/",
          },
          {
            title: "PEP 8 - Style Guide for Python Code",
            type: "Paper",
            citation: "Guido van Rossum et al., python.org/dev/peps/pep-0008",
          },
        ],

        roadmap: {
          title: "Complete Python 3.12 Mastery Curriculum Roadmap",
          targetOutcome: "From Zero to Production Software Engineer / AI Developer",
          estimatedDuration: "8 Weeks (5-8 hours/week)",
          phases: [
            {
              phase: "Phase 1: Foundations & Algorithmic Logic",
              duration: "Weeks 1-2",
              topics: ["Syntax, Data Types (Int, Float, Str, Bool)", "Control Flow (if/elif/else, while, for)", "Functions, Scoping, LEGB rule", "Data Structures: Lists, Tuples, Dictionaries, Sets"],
              milestones: ["Build a CLI Expense Tracker", "Solve 20 Basic LeetCode / HackerRank problems"],
              handsOnExercise: "Implement binary search and string anagram verification without third-party libraries.",
            },
            {
              phase: "Phase 2: Object-Oriented & Functional Python",
              duration: "Weeks 3-4",
              topics: ["Classes, Instances, Inheritance, Encapsulation", "Magic Dunder Methods (__repr__, __len__, __eq__)", "Iterators, Generators, yield", "Decorators & Function Closures"],
              milestones: ["Design a Banking Transaction Engine with custom exceptions", "Implement a custom rate-limiting decorator"],
              handsOnExercise: "Build an iterable Fibonacci sequence generator with memoization.",
            },
            {
              phase: "Phase 3: Production Tooling & Web APIs",
              duration: "Weeks 5-6",
              topics: ["Virtual Environments (uv / poetry)", "Pydantic v2 data validation", "FastAPI asynchronous REST endpoints", "PostgreSQL database integration via SQLAlchemy Async"],
              milestones: ["Deploy a full CRUD REST API with JWT Auth", "Write Pytest unit tests with 90%+ code coverage"],
              handsOnExercise: "Build an API that authenticates users and uploads PDF documents with validation.",
            },
            {
              phase: "Phase 4: Advanced Concurrency, AI & Deployment",
              duration: "Weeks 7-8",
              topics: ["Asyncio event loops & task gathering", "Multiprocessing for CPU-bound tasks", "Introduction to NumPy, Pandas & PyTorch tensors", "Docker containerization & CI/CD deployment"],
              milestones: ["Build a concurrent Web Scraper fetching 50 pages simultaneously", "Dockerize and deploy on cloud infrastructure"],
              handsOnExercise: "Develop a semantic search engine using local embeddings and cosine similarity.",
            },
          ],
          capstoneProject: "Full-Stack AI Study Assistant: A FastAPI service connected to PostgreSQL and vector embeddings that accepts textbooks and answers student questions.",
        },
      },
    };
  }

  // ─────────────────────────────────────────────────────────────
  // DOMAIN 2: MATHEMATICS / CALCULUS / DEFINITE INTEGRALS
  // ─────────────────────────────────────────────────────────────
  if (p.includes("calculus") || p.includes("integral") || p.includes("limit") || p.includes("derivative") || p.includes("math")) {
    return {
      thoughtProcess: `[LearnGraph Omni Context Engine]\n• Student: ${studentName} | Class/Tier: ${studentClass} | College: ${studentCollege}\n• Target Goal: ${targetExam} (Calculus & Analytical Proofs)\n• Pedagogical Mode: ${pedagogicalMode} | Preferred Style: ${explanationStyle}\n• Diagnostic Intent: Rigorous mathematical derivation with geometric intuition\n• Knowledge Graph Links: [Functions & Continuity] -> [Limits (L'Hopital)] -> [Definite Integrals] -> [King's Property & Symmetry]`,
      thoughtDurationSeconds: 2.9,
      subjectDomain: "Mathematics / Calculus",
      studentContextGreeting: `Hello ${studentName}! Tailored for your **${studentClass}** curriculum and **${targetExam}** problem-solving benchmark, here is the complete 13-section pedagogical breakdown for **Calculus & Definite Integrals**.`,
      sections: {
        simpleExplanation:
          "Integration is fundamentally the continuous accumulation of infinitely thin slices. While a derivative tells you how steep a hill is at one exact step, a definite integral adds up all the tiny steps to tell you how much total altitude you climbed between point A and point B.",

        detailedExplanation:
          "Formally, a Riemann integral is defined as the limit of Riemann sums as the mesh size approaches zero: $\\int_{a}^{b} f(x) \\, dx = \\lim_{\\|P\\| \\to 0} \\sum_{i=1}^{n} f(x_i^*) \\Delta x_i$. By the Fundamental Theorem of Calculus, if $F'(x) = f(x)$, then $\\int_{a}^{b} f(x) \\, dx = F(b) - F(a)$. When integrands exhibit reflection symmetry about the midpoint $(a+b)/2$, King's Property states $\\int_{a}^{b} f(x) \\, dx = \\int_{a}^{b} f(a+b-x) \\, dx$, converting intractable non-elementary integrands into trivial constants.",

        intuition:
          "Imagine looking at an asymmetrical mountain silhouette from the front versus looking at its mirror reflection from the back. The area under the mountain curve does not change whether you walk left-to-right or right-to-left. That geometric invariance is why reflecting $x \\mapsto a + b - x$ preserves the integral completely.",

        realWorldExample:
          "1. Structural Civil Engineering: Calculating the exact center of gravity and shear stress distribution across bridges.\n2. Machine Learning: Probability Density Functions (PDFs) integrate to 1; Gaussian distributions rely on Gaussian integrals to calculate confidence intervals.\n3. Electrical Engineering: Integrating alternating voltage waveforms over a cycle to find the Root-Mean-Square (RMS) power.",

        diagram:
          `     y ^                     y = f(x)\n       |                    .----\n       |                  /      \\\n       |                 /        \\\n       |        +-------+----------+------+\n       |        |///////|//////////|//////|   <-- Shaded Area = ∫[a,b] f(x) dx\n       |        |///////|//////////|//////|\n       +--------+-------+----------+------+--------> x\n               x=a                       x=b\n                        x = (a+b)/2 (Midpoint)`,

        formula:
          "\\text{King's Property: } \\int_{a}^{b} f(x) \\, dx = \\int_{a}^{b} f(a+b-x) \\, dx \\implies 2I = \\int_{a}^{b} [f(x) + f(a+b-x)] \\, dx",

        codeExample: {
          language: "Python",
          code: `import scipy.integrate as spi
import numpy as np

# Numerical verification of King's Rule:
# I = integral from 0 to pi/2 of sqrt(sin(x)) / (sqrt(sin(x)) + sqrt(cos(x))) dx
def integrand(x):
    return np.sqrt(np.sin(x)) / (np.sqrt(np.sin(x)) + np.sqrt(np.cos(x)))

result, error = spi.quad(integrand, 0, np.pi / 2)
expected = np.pi / 4

print(f"Computed Integral: {result:.6f}")
print(f"Exact Analytical (pi/4): {expected:.6f}")
print(f"Absolute Match: {np.isclose(result, expected)}")`,
          explanation:
            "This script uses adaptive Gauss-Kronrod quadrature (`scipy.integrate.quad`) to verify that the numerical integration matches $\\pi/4$ to 12 decimal places.",
        },

        commonMistakes: [
          "Forgetting to transform integration limits when substituting variables: if $u = g(x)$, the limits must become $g(a)$ and $g(b)$!",
          "Applying King's property without checking if the integrand is defined and continuous across the entire closed interval $[a, b]$.",
          "Confusing definite integrals (which evaluate to scalars) with indefinite integrals (which evaluate to families of functions $+ C$).",
        ],

        practiceQuestions: [
          {
            question: "Evaluate: $I = \\int_{0}^{\\pi/2} \\frac{\\sin^4 x}{\\sin^4 x + \\cos^4 x} \\, dx$",
            hint: "Apply King's property: substitute x with pi/2 - x. What happens when you add I + I?",
            solution: "By King's property: I = \\int_{0}^{\\pi/2} \\frac{\\cos^4 x}{\\cos^4 x + \\sin^4 x} dx. Adding both: 2I = \\int_{0}^{\\pi/2} 1 \\, dx = \\pi/2 \\implies I = \\pi/4.",
          },
          {
            question: "Why is $\\int_{-1}^{1} \\frac{1}{x} \\, dx$ not equal to $\\ln|1| - \\ln|-1| = 0$?",
            hint: "Check for discontinuities within the integration interval.",
            solution: "The function 1/x has an essential discontinuity at x = 0. It is an improper integral that diverges as two opposing infinities.",
          },
        ],

        miniQuiz: {
          question: "What is the value of $\\int_{-\\pi}^{\\pi} x^3 \\cos(x) \\, dx$?",
          options: [
            "A. 2pi",
            "B. pi/2",
            "C. 0",
            "D. -1",
          ],
          correctIndex: 2,
          explanation:
            "The function $f(x) = x^3 \\cos(x)$ is an odd function because $(-x)^3 \\cos(-x) = -x^3 \\cos(x) = -f(x)$. The integral of any odd function over a symmetric interval $[-a, a]$ is strictly 0.",
        },

        relatedTopics: [
          "Integration by Parts (Leibniz Product Rule)",
          "Partial Fractions Decomposition",
          "Improper Integrals & Cauchy Principal Value",
          "Multivariable Double & Triple Integrals",
        ],

        nextTopicRecommendation: {
          topic: "Differential Equations & Separable Variables",
          reason: "Essential for physical modeling in engineering (RLC circuits, heat transfer, and harmonic oscillators) tested extensively in GATE and college curricula.",
          estimatedTime: "2.5 hours",
        },

        learningResources: [
          {
            title: "Calculus (Vol. 1)",
            type: "Book",
            citation: "Tom M. Apostol - Chapter 3: The Concepts of Integral Calculus.",
          },
          {
            title: "MIT OpenCourseWare 18.01 Single Variable Calculus",
            type: "Lecture",
            citation: "Prof. David Jerison - Lecture 18: Definite Integrals & Fundamental Theorem.",
          },
        ],
      },
    };
  }

  // ─────────────────────────────────────────────────────────────
  // DOMAIN 3: ALGORITHMS / GRAPH THEORY / DIJKSTRA
  // ─────────────────────────────────────────────────────────────
  if (p.includes("dijkstra") || p.includes("graph") || p.includes("algorithm") || p.includes("shortest path")) {
    return {
      thoughtProcess: `[LearnGraph Omni Context Engine]\n• Student: ${studentName} | Class/Tier: ${studentClass} | College: ${studentCollege}\n• Target Goal: ${targetExam} (Graph Theory & DSA Optimization)\n• Pedagogical Mode: ${pedagogicalMode} | Preferred Style: ${explanationStyle}\n• Diagnostic Intent: Invariant proof of greedy relaxation + priority queue mechanics\n• Weak Concept Target: Edge relaxation invariant & negative edge weight pitfalls`,
      thoughtDurationSeconds: 3.1,
      subjectDomain: "Computer Science / Algorithms",
      studentContextGreeting: `Hello ${studentName}! Calibrated for your **${targetExam}** preparation and **${studentCollege}** coursework, here is the full 13-section pedagogical masterclass on **Dijkstra's Shortest Path Algorithm**.`,
      sections: {
        simpleExplanation:
          "Dijkstra's algorithm is like water spreading outward from a water fountain through a network of pipes. The water will always reach the closest intersection first. By always finalizing the closest unvisited intersection at each step, Dijkstra guarantees you find the shortest path from home to everywhere else without unnecessary detours.",

        detailedExplanation:
          "Dijkstra solves the Single-Source Shortest Path (SSSP) problem on a directed graph $G = (V, E, w)$ with non-negative edge weights $w(e) \\ge 0$. It maintains a set $S$ of vertices whose shortest distances are permanently settled. At each iteration, the vertex $u \\in V \\setminus S$ with the minimum tentative distance $d[u]$ is extracted from a priority queue. For each outgoing edge $(u, v) \\in E$, relaxation is performed: if $d[u] + w(u, v) < d[v]$, then $d[v]$ is updated to $d[u] + w(u, v)$. Using a binary min-heap, the total time complexity is $\\mathcal{O}((V + E) \\log V)$.",

        intuition:
          "Why is Dijkstra's greedy choice safe? Because all edge weights are positive! Once a vertex $u$ has the lowest distance in the priority queue, any other path to $u$ would have to travel through another node $x$ that is *already farther away* plus an additional positive edge, which could never beat $d[u]$.",

        realWorldExample:
          "1. Google Maps & Apple Maps: Calculating the fastest driving route across road segments with positive travel time weights.\n2. Internet Routing Protocols: Open Shortest Path First (OSPF) uses Dijkstra inside Autonomous Systems to route IP packets.\n3. Airline Route Optimization: Minimizing flight fuel consumption across global waypoints.",

        diagram:
          `      (4)              (1)\n  [A] ------> [B] -----------> [C]\n   |                            ^\n   |            (8)             |\n   +----------------------------+\n\n  1. Start A: d[A]=0, d[B]=inf, d[C]=inf. Heap: [(0,A)]\n  2. Pop A: Relax B (0+4=4), Relax C (0+8=8). Heap: [(4,B), (8,C)]\n  3. Pop B (dist 4): Relax C (4+1=5 < 8). Update d[C]=5! Heap: [(5,C)]\n  4. Pop C (dist 5): Queue empty. Shortest Path A->C is 5 (via B).`,

        formula:
          "\\text{Relaxation Invariant: } \\forall (u, v) \\in E, \\quad d[v] = \\min(d[v], \\, d[u] + w(u, v))",

        codeExample: {
          language: "Python",
          code: `import heapq
from typing import Dict, List, Tuple

def dijkstra(graph: Dict[str, List[Tuple[str, int]]], source: str) -> Dict[str, int]:
    # Distances initialized to infinity
    distances = {node: float('inf') for node in graph}
    distances[source] = 0
    
    # Priority Queue stores tuples of (current_distance, node)
    pq = [(0, source)]
    
    while pq:
        curr_dist, u = heapq.heappop(pq)
        
        # Stale entry check (if distance in heap is greater than settled distance)
        if curr_dist > distances[u]:
            continue
            
        for neighbor, weight in graph[u]:
            new_dist = curr_dist + weight
            if new_dist < distances[neighbor]:
                distances[neighbor] = new_dist
                heapq.heappush(pq, (new_dist, neighbor))
                
    return distances

# Test Graph
graph = {
    'A': [('B', 4), ('C', 8)],
    'B': [('C', 1)],
    'C': []
}
print(dijkstra(graph, 'A'))  # Output: {'A': 0, 'B': 4, 'C': 5}`,
          explanation:
            "This implementation leverages Python's binary min-heap (`heapq`), includes the crucial stale-entry guard clause (`curr_dist > distances[u]`), and achieves optimal $\\mathcal{O}((V+E)\\log V)$ complexity.",
        },

        commonMistakes: [
          "Running Dijkstra on graphs with Negative Edge Weights: A negative edge can retroactively make an already settled vertex shorter, completely invalidating the greedy invariant. Use Bellman-Ford instead!",
          "Forgetting the stale entry check in Min-Heaps: If you insert updated distances without decreasing keys, multiple entries for the same node exist. Without `if curr_dist > distances[u]: continue`, runtime degrades.",
          "Using an Adjacency Matrix on Sparse Graphs: Takes $\\mathcal{O}(V^2)$ instead of $\\mathcal{O}(E \\log V)$, causing Time Limit Exceeded (TLE) in competitive programming.",
        ],

        practiceQuestions: [
          {
            question: "What is the time complexity of Dijkstra if implemented with an Unsorted Array instead of a Min-Heap?",
            hint: "Finding the minimum element in an unsorted array takes O(V), repeated V times.",
            solution: "O(V^2 + E) = O(V^2). Surprisingly, this is optimal for dense graphs where E is approximately V^2!",
          },
          {
            question: "Does Dijkstra always find the shortest path in a DAG even if some edge weights are negative?",
            hint: "Can we use Topological Sort instead?",
            solution: "Dijkstra can still fail on DAGs with negative weights. However, dynamic programming on Topological Sort finds shortest paths in a DAG with negative weights in O(V + E) time.",
          },
        ],

        miniQuiz: {
          question: "Which data structure provides the theoretically fastest runtime for Dijkstra's algorithm?",
          options: [
            "A. Binary Min-Heap: O((V + E) log V)",
            "B. Fibonacci Heap: O(E + V log V)",
            "C. Red-Black Balanced BST: O(E log V)",
            "D. Unsorted Array: O(V^2)",
          ],
          correctIndex: 1,
          explanation:
            "A Fibonacci Heap achieves $\\mathcal{O}(1)$ amortized time for `decrease-key` operations, yielding a total theoretical runtime of $\\mathcal{O}(E + V \\log V)$.",
        },

        relatedTopics: [
          "Bellman-Ford Algorithm (Handles Negative Weights & Cycles)",
          "Floyd-Warshall (All-Pairs Shortest Paths in O(V^3))",
          "A* Search Algorithm (Heuristic Directed Graph Search)",
          "Prim's Minimum Spanning Tree (MST)",
        ],

        nextTopicRecommendation: {
          topic: "Bellman-Ford & Negative Cycle Detection",
          reason: "Directly complements Dijkstra by handling negative weights and currency arbitrage detection in financial networks.",
          estimatedTime: "1.5 hours",
        },

        learningResources: [
          {
            title: "Introduction to Algorithms (CLRS 4th Edition)",
            type: "Book",
            citation: "Cormen, Leiserson, Rivest, Stein - Chapter 24.3: Dijkstra's Algorithm.",
          },
          {
            title: "Algorithms (Sedgewick & Wayne)",
            type: "Book",
            citation: "Section 4.4: Shortest Paths and Priority Queues.",
          },
        ],
      },
    };
  }

  // ─────────────────────────────────────────────────────────────
  // DOMAIN 4: GENERAL / FALLBACK UNIVERSAL PEDAGOGICAL ENGINE
  // ─────────────────────────────────────────────────────────────
  const topicTitle = prompt.length > 36 ? prompt.slice(0, 32) + "..." : prompt;
  return {
    thoughtProcess: `[LearnGraph Omni Context Engine]\n• Student: ${studentName} | Class/Tier: ${studentClass} | College: ${studentCollege}\n• Target Goal: ${targetExam} | Pedagogical Mode: ${pedagogicalMode}\n• Preferred Style: ${explanationStyle}\n• Active Inquiry: "${prompt}"\n• Action: Synthesizing deep 13-part pedagogical instruction module.`,
    thoughtDurationSeconds: 2.7,
    subjectDomain: "General Academic / Science & Engineering",
    studentContextGreeting: `Hello ${studentName}! Formatted specifically for your **${studentClass}** studies and **${targetExam}** milestones, here is the complete 13-part deep conceptual guide to **${topicTitle}**.`,
    sections: {
      simpleExplanation: `In simple terms, ${topicTitle} is a structured approach to solving a core challenge in this field. Instead of memorizing isolated facts, understand the single question it answers: How can we optimize resources, ensure correctness, and prevent system failure under realistic constraints?`,

      detailedExplanation: `From a rigorous academic perspective, ${topicTitle} operates under well-defined axiomatic frameworks. It requires establishing clear boundaries, understanding state transitions, verifying invariance conditions, and quantifying asymptotic or empirical performance metrics. Mastery involves decomposing complex phenomena into first-principles fundamentals.`,

      intuition: `Think of this concept like an orchestra conductor. Every instrument (component) has a specialized role and timing. Without coordinated synchronization, you get chaos; with structured communication protocols, you achieve harmonious, predictable execution.`,

      realWorldExample: `1. Large-scale enterprise systems deploy these exact architectural principles to maintain 99.999% availability.\n2. Research scientists apply these models to run predictive physical simulations.\n3. Competitive examinations evaluate candidates specifically on edge cases where standard heuristics fail.`,

      diagram:
        `+-----------------------------------------------------------+\n|                      INPUT CONSTRAINTS                    |\n|               Raw Data / Boundary Parameters              |\n+-----------------------------------------------------------+\n                              │\n                              ▼\n+-----------------------------------------------------------+\n|                    CORE PROCESSING UNIT                   |\n|        Transformation Logic & Invariance Preservation      |\n+-----------------------------------------------------------+\n                              │\n                              ▼\n+-----------------------------------------------------------+\n|                     VERIFIED OUTPUT                       |\n|             Deterministic Result / Solved State           |\n+-----------------------------------------------------------+`,

      formula: "\\text{Efficiency Metric: } \\Phi = \\frac{\\text{Useful Work Output}}{\\text{Total Resource Energy Expended}} \\times 100\\%",

      codeExample: {
        language: "Python",
        code: `# Demonstration of invariant verification\ndef verify_system_state(parameters):\n    """Validates operational invariants before execution."""\n    for param in parameters:\n        assert param >= 0, "Violates non-negative constraint"\n    return sum(parameters) / len(parameters)\n\nprint("Mean Metric:", verify_system_state([12, 18, 24, 30]))`,
        explanation: "This snippet demonstrates defensive programming, assertion of invariant constraints, and mathematical reduction.",
      },

      commonMistakes: [
        "Confusing symptoms with root causes when analyzing system failures or mathematical counterexamples.",
        "Overlooking boundary constraints (zero, negative numbers, null pointers, empty collections).",
        "Assuming linear scaling without calculating second-order asymptotic growth rates.",
      ],

      practiceQuestions: [
        {
          question: `What fundamental constraint distinguishes ${topicTitle} from basic naive approaches?`,
          hint: "Consider trade-offs between space complexity, time overhead, and algorithmic correctness.",
          solution: "Naive approaches recompute states redundantly; optimized frameworks preserve invariants and cache intermediate computations.",
        },
        {
          question: "How do you systematically debug a failure where output drifts from expected values?",
          hint: "Use binary search isolation or trace state transitions step-by-step.",
          solution: "Isolate the minimal failing test case, check precondition assertions, and verify state mutations at each boundary.",
        },
      ],

      miniQuiz: {
        question: `When evaluating solutions in ${topicTitle}, which factor should always take highest priority?`,
        options: [
          "A. Absolute code brevity above all else",
          "B. Correctness, invariance guarantees, and error handling",
          "C. Premature micro-optimizations",
          "D. Memorizing fixed patterns without understanding intuition",
        ],
        correctIndex: 1,
        explanation:
          "Algorithmic correctness and mathematical guarantees must always precede optimization. An ultra-fast program that produces incorrect answers is useless.",
      },

      relatedTopics: [
        "First-Principles Problem Decomposition",
        "Asymptotic Performance & Space-Time Tradeoffs",
        "Deterministic State Machine Design",
        "Empirical Benchmark Verification",
      ],

      nextTopicRecommendation: {
        topic: "Advanced Optimization & Real-World Case Studies",
        reason: "Connects theoretical proofs to production engineering systems and competitive exam style problem sets.",
        estimatedTime: "2 hours",
      },

      learningResources: [
        {
          title: "Standard University Course Textbook",
          type: "Book",
          citation: "Refer to foundational textbooks in your university syllabus for comprehensive proofs.",
        },
        {
          title: "Official Academic Research Index",
          type: "Paper",
          citation: "ACM Digital Library & IEEE Xplore Open Access Repositories.",
        },
      ],
    },
  };
}
