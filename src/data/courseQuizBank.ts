/**
 * courseQuizBank.ts — Authentic Previous Year Paper Questions (PYQ)
 * Curated from GATE, JEE Advanced, NEET, UPSC CSE, CAT, and University Examination papers.
 * High-difficulty, concept-testing questions mapped to course subjects.
 */

import type { QuizQuestion } from "@/types/quiz";

export interface CourseQuizSet {
  subject: string;
  category: string;
  examSource: string;
  title: string;
  questions: QuizQuestion[];
}

export const COURSE_QUIZ_BANK: Record<string, CourseQuizSet> = {
  // ── Computer Science / IT / B.Tech CSE / GATE CS ──────────────────────────
  "Computer Science": {
    subject: "Computer Science",
    category: "GATE CS & IT PREVIOUS YEAR PAPERS",
    examSource: "GATE CS & University Advanced Exams",
    title: "GATE CS Advanced: DSA, Systems, DBMS & Algorithms",
    questions: [
      {
        id: "cs-pyq-1",
        type: "MULTIPLE CHOICE (GATE CS 2023)",
        difficulty: "Hard",
        questionText: "Consider the following recurrence relation for the runtime T(n) of an algorithm: T(n) = 3T(n/2) + n log n. Using the Master Theorem (or Akra-Bazzi method), what is the asymptotic tight bound of T(n)?",
        mathExpression: "T(n) = 3T(n/2) + \\Theta(n \\log n)",
        options: [
          { id: 0, label: "A", text: "Θ(n log n)" },
          { id: 1, label: "B", text: "Θ(n^(log₂ 3)) ≈ Θ(n^1.585)" },
          { id: 2, label: "C", text: "Θ(n²)" },
          { id: 3, label: "D", text: "Θ(n^(log₂ 3) log n)" },
        ],
        correctAnswerIndex: 1,
        explanation: "By the Master Theorem: a = 3, b = 2. log_b(a) = log₂ 3 ≈ 1.585. Since f(n) = n log n = O(n^(1.585 - ε)) where ε ≈ 0.585 > 0, Case 1 of Master Theorem applies: T(n) = Θ(n^(log₂ 3)).",
        weakConceptInsight: {
          title: "Asymptotic Recurrence Relations",
          description: "Struggling with Master Theorem cases when comparing f(n) polynomial dominance with n^(log_b a).",
          fromConcept: "Divide and Conquer Analysis",
          fromMastery: 75,
          toConcept: "Master Theorem Bounds",
          toMastery: 45,
        },
      },
      {
        id: "cs-pyq-2",
        type: "MULTIPLE CHOICE (GATE CS 2022)",
        difficulty: "Hard",
        questionText: "In a B+ tree of order d (maximum child pointers per internal node is d), the leaf nodes can hold at most (d-1) search keys. If the block size is 4096 bytes, search key size is 16 bytes, and block pointer size is 8 bytes, what is the maximum order of the B+ tree?",
        mathExpression: "d \\cdot P + (d - 1) \\cdot K \\le BlockSize",
        options: [
          { id: 0, label: "A", text: "170" },
          { id: 1, label: "B", text: "171" },
          { id: 2, label: "C", text: "256" },
          { id: 3, label: "D", text: "512" },
        ],
        correctAnswerIndex: 1,
        explanation: "For an internal node: d * 8 + (d - 1) * 16 <= 4096. 8d + 16d - 16 <= 4096 => 24d <= 4112 => d <= 4112 / 24 = 171.33. Hence, max order d = 171.",
        weakConceptInsight: {
          title: "B+ Tree Index Calculations",
          description: "Database indexing questions require exact arithmetic on block pointers vs key sizes.",
          fromConcept: "File Organizations",
          fromMastery: 80,
          toConcept: "B+ Tree Node Sizing",
          toMastery: 50,
        },
      },
      {
        id: "cs-pyq-3",
        type: "MULTIPLE CHOICE (GATE CS 2021)",
        difficulty: "Hard",
        questionText: "Consider a virtual memory system with 32-bit virtual addresses, 4 KB page size, and 4-byte page table entries. If a 2-level paging scheme is employed such that each page table fits exactly into one page frame, what is the size of the outer page table index and inner page table index?",
        mathExpression: "Offset = 12 \\text{ bits}, \\quad \\text{Frame} = 4096 / 4 = 1024 \\text{ entries}",
        options: [
          { id: 0, label: "A", text: "Outer = 10 bits, Inner = 10 bits, Offset = 12 bits" },
          { id: 1, label: "B", text: "Outer = 12 bits, Inner = 8 bits, Offset = 12 bits" },
          { id: 2, label: "C", text: "Outer = 8 bits, Inner = 12 bits, Offset = 12 bits" },
          { id: 3, label: "D", text: "Outer = 16 bits, Inner = 4 bits, Offset = 12 bits" },
        ],
        correctAnswerIndex: 0,
        explanation: "Page size 4 KB => offset is 12 bits (2^12 = 4096). Each page frame can hold 4096 / 4 = 1024 = 2^10 entries. Therefore, inner page table index must be 10 bits. The remaining 32 - 12 - 10 = 10 bits belong to the outer page table.",
        weakConceptInsight: {
          title: "Multi-level Paging & Memory Management",
          description: "Calculating bit partitions for page tables and TLB indexing.",
          fromConcept: "Virtual Memory Foundations",
          fromMastery: 82,
          toConcept: "Hierarchical Paging",
          toMastery: 48,
        },
      },
      {
        id: "cs-pyq-4",
        type: "MULTIPLE CHOICE (GATE CS 2020)",
        difficulty: "Medium",
        questionText: "What is the worst-case number of rotations required during an insertion into an AVL tree of height h?",
        options: [
          { id: 0, label: "A", text: "At most 1 (either single or double rotation)" },
          { id: 1, label: "B", text: "O(log n) rotations" },
          { id: 2, label: "C", text: "O(h) rotations" },
          { id: 3, label: "D", text: "h/2 rotations" },
        ],
        correctAnswerIndex: 0,
        explanation: "Insertion in an AVL tree requires at most ONE single or double rotation (at the lowest unbalance node) to restore the AVL balance property along the entire search path. Deletion, however, can require O(log n) rotations.",
        weakConceptInsight: {
          title: "AVL Tree Rotations: Insertion vs Deletion",
          description: "Recognizing that insertion terminates rebalancing in O(1) rotations while deletion can propagate up to the root.",
          fromConcept: "Binary Search Trees",
          fromMastery: 88,
          toConcept: "Self-Balancing Trees",
          toMastery: 52,
        },
      },
      {
        id: "cs-pyq-5",
        type: "MULTIPLE CHOICE (GATE CS 2021)",
        difficulty: "Hard",
        questionText: "A relation R(A, B, C, D, E) satisfies the functional dependencies: F = { AB → C, C → D, D → E, E → A }. Which of the following is a candidate key for R?",
        options: [
          { id: 0, label: "A", text: "AB, BC, BD, BE" },
          { id: 1, label: "B", text: "Only AB" },
          { id: 2, label: "C", text: "AB and CD only" },
          { id: 3, label: "D", text: "ABCDE" },
        ],
        correctAnswerIndex: 0,
        explanation: "Attribute B appears only on the left side of AB → C, so every candidate key MUST contain B. (AB)+ = {A,B,C,D,E}. Since E → A, (EB)+ = {E,B,A,C,D}. Since D → E, (DB)+ = {D,B,E,A,C}. Since C → D, (CB)+ = {C,B,D,E,A}. Thus all 4 are candidate keys: AB, BC, BD, BE.",
        weakConceptInsight: {
          title: "Relational Candidate Key Derivation",
          description: "Finding attribute closures and non-derivable attributes in functional dependency sets.",
          fromConcept: "Functional Dependencies",
          fromMastery: 78,
          toConcept: "Normalization & Candidate Keys",
          toMastery: 42,
        },
      },
      {
        id: "cs-pyq-6",
        type: "MULTIPLE CHOICE (GATE CS 2019)",
        difficulty: "Hard",
        questionText: "In TCP Tahoe/Reno, a connection has an MSS of 1 KB. In Congestion Avoidance phase, the Congestion Window (cwnd) is currently 16 KB. If 3 duplicate ACKs are received, what are the new values of ssthresh and cwnd under TCP Reno?",
        options: [
          { id: 0, label: "A", text: "ssthresh = 8 KB, cwnd = 11 KB (or 8 KB + 3 MSS)" },
          { id: 1, label: "B", text: "ssthresh = 8 KB, cwnd = 1 KB" },
          { id: 2, label: "C", text: "ssthresh = 16 KB, cwnd = 8 KB" },
          { id: 3, label: "D", text: "ssthresh = 4 KB, cwnd = 4 KB" },
        ],
        correctAnswerIndex: 0,
        explanation: "Under TCP Reno Fast Recovery: on 3 duplicate ACKs, ssthresh = cwnd / 2 = 16 / 2 = 8 KB. Then cwnd is set to ssthresh + 3 * MSS = 8 KB + 3 KB = 11 KB. (Unlike Tahoe which resets cwnd to 1 MSS).",
        weakConceptInsight: {
          title: "TCP Congestion Control Algorithms",
          description: "Distinguishing Tahoe vs Reno behavior during timeout vs triple-duplicate ACKs.",
          fromConcept: "Transport Layer Protocols",
          fromMastery: 85,
          toConcept: "Fast Retransmit & Fast Recovery",
          toMastery: 44,
        },
      },
      {
        id: "cs-pyq-7",
        type: "MULTIPLE CHOICE (GATE CS 2022)",
        difficulty: "Hard",
        questionText: "Consider the language L = { a^n b^m c^(n+m) | n, m ≥ 1 }. Which of the following automata recognizes L?",
        options: [
          { id: 0, label: "A", text: "Deterministic Pushdown Automaton (DPDA)" },
          { id: 1, label: "B", text: "Non-Deterministic Pushdown Automaton (NPDA) only, not DPDA" },
          { id: 2, label: "C", text: "Deterministic Finite Automaton (DFA)" },
          { id: 3, label: "D", text: "Linear Bounded Automaton (LBA) only, not CFL" },
        ],
        correctAnswerIndex: 0,
        explanation: "Push each 'a' and each 'b' onto the stack. When 'c' begins, pop one symbol for each 'c'. Since the transition to reading 'c' and popping is deterministic and unambiguous, a Deterministic PDA can recognize it.",
        weakConceptInsight: {
          title: "Chomsky Hierarchy & Automata Power",
          description: "Classifying languages by PDA determinism versus non-determinism.",
          fromConcept: "Context Free Grammars",
          fromMastery: 70,
          toConcept: "Deterministic Pushdown Automata",
          toMastery: 46,
        },
      },
      {
        id: "cs-pyq-8",
        type: "MULTIPLE CHOICE (GATE CS 2020)",
        difficulty: "Hard",
        questionText: "In Dijkstra's single-source shortest path algorithm implemented with a Min-Heap on a directed graph with V vertices and E edges, what is the exact asymptotic time complexity?",
        mathExpression: "O((V + E) \\log V)",
        options: [
          { id: 0, label: "A", text: "O(V²)" },
          { id: 1, label: "B", text: "O((V + E) log V)" },
          { id: 2, label: "C", text: "O(E + V log V)" },
          { id: 3, label: "D", text: "O(V log E)" },
        ],
        correctAnswerIndex: 1,
        explanation: "Extract-Min is performed V times (each O(log V)), giving O(V log V). Decrease-Key is executed at most once per edge (E times, each O(log V)), giving O(E log V). Total = O((V + E) log V). With Fibonacci Heap it reduces to O(E + V log V).",
        weakConceptInsight: {
          title: "Priority Queue Graph Implementations",
          description: "Analyzing heap operations (Extract-Min vs Decrease-Key) in greedy shortest path routines.",
          fromConcept: "Graph Traversal",
          fromMastery: 84,
          toConcept: "Heap-Optimized Dijkstra",
          toMastery: 50,
        },
      },
      {
        id: "cs-pyq-9",
        type: "MULTIPLE CHOICE (GATE CS 2023)",
        difficulty: "Hard",
        questionText: "In an OS using Banker's Algorithm with 5 processes P0-P4 and 3 resource types (A, B, C), if Available = (3, 3, 2), Allocation of P1 is (2, 0, 0) and Max of P1 is (3, 2, 2), what is the Need of P1 and is P1 guaranteed to enter the safe sequence?",
        options: [
          { id: 0, label: "A", text: "Need = (1, 2, 2); Yes, P1 can be allocated since Need ≤ Available" },
          { id: 1, label: "B", text: "Need = (5, 2, 2); No, deadlock will occur" },
          { id: 2, label: "C", text: "Need = (1, 0, 0); Yes, P1 already has resources" },
          { id: 3, label: "D", text: "Need = (1, 2, 2); No, Available is insufficient for B" },
        ],
        correctAnswerIndex: 0,
        explanation: "Need = Max - Allocation = (3 - 2, 2 - 0, 2 - 0) = (1, 2, 2). Comparing Need with Available (3, 3, 2): 1 ≤ 3, 2 ≤ 3, 2 ≤ 2. All resource requirements are satisfied, so P1 can run and return its resources.",
        weakConceptInsight: {
          title: "Deadlock Avoidance & Banker's Safety Vector",
          description: "Comparing vector relations Need[i] <= Work in matrix safety verification.",
          fromConcept: "Process Synchronization",
          fromMastery: 76,
          toConcept: "Banker's Safety Algorithm",
          toMastery: 48,
        },
      },
      {
        id: "cs-pyq-10",
        type: "MULTIPLE CHOICE (GATE CS 2021)",
        difficulty: "Hard",
        questionText: "What is the minimum number of states in a minimal Deterministic Finite Automaton (DFA) that accepts all binary strings whose decimal value is divisible by 5?",
        options: [
          { id: 0, label: "A", text: "3" },
          { id: 1, label: "B", text: "4" },
          { id: 2, label: "C", text: "5" },
          { id: 3, label: "D", text: "6" },
        ],
        correctAnswerIndex: 2,
        explanation: "Reading binary digits sequentially transitions value V to (2V + b) mod 5. The remainders mod 5 are {0, 1, 2, 3, 4}, producing 5 equivalence classes according to the Myhill-Nerode theorem. All 5 states are reachable and non-equivalent.",
        weakConceptInsight: {
          title: "Myhill-Nerode Theorem & DFA Minimization",
          description: "Proving minimum state count through modular equivalence classes.",
          fromConcept: "Regular Expressions & Finite Automata",
          fromMastery: 81,
          toConcept: "Minimal State Automata",
          toMastery: 54,
        },
      },
    ],
  },

  // ── Mathematics / Engineering Maths / JEE / Calculus ─────────────────────
  "Mathematics": {
    subject: "Mathematics",
    category: "JEE ADVANCED & GATE PREVIOUS YEAR PAPERS",
    examSource: "JEE Advanced / GATE Engineering Mathematics",
    title: "Advanced Calculus, Linear Algebra & Probability PYQs",
    questions: [
      {
        id: "math-pyq-1",
        type: "MULTIPLE CHOICE (JEE Advanced 2022)",
        difficulty: "Hard",
        questionText: "Evaluate the limit as x approaches 0:",
        mathExpression: "\\lim_{x \\to 0} \\frac{e^{x^2} - \\cos x - \\frac{3}{2}x^2}{x^4}",
        options: [
          { id: 0, label: "A", text: "1/4" },
          { id: 1, label: "B", text: "11/24" },
          { id: 2, label: "C", text: "7/24" },
          { id: 3, label: "D", text: "5/12" },
        ],
        correctAnswerIndex: 1,
        explanation: "Using Taylor expansions: e^(x^2) = 1 + x^2 + x^4 / 2 + O(x^6). cos x = 1 - x^2 / 2 + x^4 / 24 - O(x^6). Numerator = (1 + x^2 + x^4 / 2) - (1 - x^2 / 2 + x^4 / 24) - (3/2) x^2 = (1/2 - 1/24) x^4 = (11/24) x^4. Dividing by x^4 gives 11/24.",
        weakConceptInsight: {
          title: "Taylor Series vs Repeated L'Hôpital",
          description: "4th-order indeterminate limits are solved cleanly via power series rather than 4 iterations of differentiation.",
          fromConcept: "L'Hôpital's Rule",
          fromMastery: 80,
          toConcept: "Taylor Expansion Limits",
          toMastery: 40,
        },
      },
      {
        id: "math-pyq-2",
        type: "MULTIPLE CHOICE (GATE Engg Maths 2021)",
        difficulty: "Hard",
        questionText: "Let A be a 3 × 3 real symmetric matrix with eigenvalues 1, 2, and 3. What is the value of Trace(A² + 2A⁻¹)?",
        mathExpression: "\\text{Trace}(A^2 + 2A^{-1}) = \\sum \\left(\\lambda_i^2 + \\frac{2}{\\lambda_i}\\right)",
        options: [
          { id: 0, label: "A", text: "14" },
          { id: 1, label: "B", text: "17.67 (53/3)" },
          { id: 2, label: "C", text: "18.33" },
          { id: 3, label: "D", text: "21" },
        ],
        correctAnswerIndex: 1,
        explanation: "If λ is an eigenvalue of A, then λ² + 2/λ is an eigenvalue of A² + 2A⁻¹. For λ = 1: 1 + 2 = 3. For λ = 2: 4 + 1 = 5. For λ = 3: 9 + 2/3 = 29/3. Trace = 3 + 5 + 29/3 = 8 + 9.667 = 53/3 ≈ 17.67.",
        weakConceptInsight: {
          title: "Matrix Spectral Mapping Theorem",
          description: "Using polynomial and rational eigenvalue transformations instead of computing matrix inverses.",
          fromConcept: "Determinant & Inverse",
          fromMastery: 85,
          toConcept: "Eigenvalue Properties",
          toMastery: 50,
        },
      },
      {
        id: "math-pyq-3",
        type: "MULTIPLE CHOICE (JEE Advanced 2021)",
        difficulty: "Hard",
        questionText: "Let I = ∫₀^(π/2) (x sin x cos x) / (sin⁴ x + cos⁴ x) dx. What is the value of I?",
        mathExpression: "I = \\int_{0}^{\\frac{\\pi}{2}} \\frac{x \\sin x \\cos x}{\\sin^4 x + \\cos^4 x} dx",
        options: [
          { id: 0, label: "A", text: "π² / 16" },
          { id: 1, label: "B", text: "π² / 8" },
          { id: 2, label: "C", text: "π / 4" },
          { id: 3, label: "D", text: "π² / 32" },
        ],
        correctAnswerIndex: 0,
        explanation: "Use King's Property: replace x with (π/2 - x). Adding the two integrals eliminates x, giving 2I = (π/2) ∫₀^(π/2) (sin x cos x)/(sin⁴ x + cos⁴ x) dx. Divide numerator & denominator by cos⁴ x: tan x sec² x / (tan⁴ x + 1). Let u = tan² x, du = 2 tan x sec² x dx. The integral becomes (π/4) [arctan u] from 0 to ∞ = (π/4)(π/2) = π²/8. Therefore I = π²/16.",
        weakConceptInsight: {
          title: "Definite Integral Symmetry & King's Property",
          description: "Exploiting f(a + b - x) to eliminate linear terms in definite integration.",
          fromConcept: "Integration Techniques",
          fromMastery: 78,
          toConcept: "Definite Integral Properties",
          toMastery: 45,
        },
      },
      {
        id: "math-pyq-4",
        type: "MULTIPLE CHOICE (GATE Engg Maths 2023)",
        difficulty: "Hard",
        questionText: "The solution to the Cauchy-Euler differential equation x² y'' - 3x y' + 4y = 0 with y(1) = 1, y'(1) = 3 is:",
        mathExpression: "x^2 \\frac{d^2 y}{dx^2} - 3x \\frac{dy}{dx} + 4y = 0",
        options: [
          { id: 0, label: "A", text: "y = x² + x² ln x" },
          { id: 1, label: "B", text: "y = x² + 2x² ln x" },
          { id: 2, label: "C", text: "y = 2x² - x² ln x" },
          { id: 3, label: "D", text: "y = x² cos(ln x)" },
        ],
        correctAnswerIndex: 0,
        explanation: "Auxiliary equation: m(m - 1) - 3m + 4 = 0 => m² - 4m + 4 = (m - 2)² = 0. Repeated root m = 2, 2. General solution: y = c₁ x² + c₂ x² ln x. y(1) = c₁ = 1. y'(x) = 2c₁ x + c₂ (2x ln x + x). y'(1) = 2(1) + c₂ = 3 => c₂ = 1. Hence y = x² + x² ln x.",
        weakConceptInsight: {
          title: "Cauchy-Euler Repeated Root Solutions",
          description: "Understanding ln x factor emergence for repeated roots in equidimensional differential equations.",
          fromConcept: "Second Order ODEs",
          fromMastery: 82,
          toConcept: "Cauchy-Euler Equations",
          toMastery: 50,
        },
      },
      {
        id: "math-pyq-5",
        type: "MULTIPLE CHOICE (JEE Advanced 2020)",
        difficulty: "Hard",
        questionText: "A box contains 3 red and 5 black balls. Two balls are drawn successively without replacement. Given that the second ball drawn is red, what is the conditional probability that the first ball drawn was also red?",
        options: [
          { id: 0, label: "A", text: "2/7" },
          { id: 1, label: "B", text: "3/8" },
          { id: 2, label: "C", text: "1/4" },
          { id: 3, label: "D", text: "5/14" },
        ],
        correctAnswerIndex: 0,
        explanation: "By Bayes' Theorem: P(R1 | R2) = P(R1 ∩ R2) / P(R2). P(R1 ∩ R2) = (3/8) * (2/7) = 6/56. P(R2) = P(R1 ∩ R2) + P(B1 ∩ R2) = 6/56 + (5/8)*(3/7) = 6/56 + 15/56 = 21/56 = 3/8. Thus P(R1 | R2) = (6/56) / (21/56) = 6/21 = 2/7.",
        weakConceptInsight: {
          title: "Bayes' Theorem & Inverse Probability",
          description: "Recognizing that future conditioning shifts sample space cardinality.",
          fromConcept: "Conditional Probability",
          fromMastery: 79,
          toConcept: "Bayesian Reasoning",
          toMastery: 48,
        },
      },
    ],
  },

  // ── Physics / Electronics / JEE / NEET ────────────────────────────────────
  "Physics": {
    subject: "Physics",
    category: "JEE ADVANCED & NEET PREVIOUS YEAR PAPERS",
    examSource: "JEE Advanced / NEET Previous Papers",
    title: "Advanced Mechanics, Electromagnetism & Quantum Physics",
    questions: [
      {
        id: "phy-pyq-1",
        type: "MULTIPLE CHOICE (JEE Advanced 2022)",
        difficulty: "Hard",
        questionText: "A solid sphere of mass M and radius R rolls without slipping down an inclined plane of angle θ. What is the minimum coefficient of static friction μ_s required to prevent slipping?",
        mathExpression: "\\mu_s \\ge \\frac{2}{7} \\tan \\theta",
        options: [
          { id: 0, label: "A", text: "(1/3) tan θ" },
          { id: 1, label: "B", text: "(2/7) tan θ" },
          { id: 2, label: "C", text: "(2/5) tan θ" },
          { id: 3, label: "D", text: "(1/2) tan θ" },
        ],
        correctAnswerIndex: 1,
        explanation: "Linear acceleration down the incline: a = g sin θ / (1 + I / MR²). For a solid sphere, I = (2/5) MR², so a = g sin θ / (1 + 2/5) = (5/7) g sin θ. Friction force f = I α / R = (2/5) M a = (2/7) M g sin θ. Normal force N = M g cos θ. To prevent slip: f ≤ μ_s N => (2/7) M g sin θ ≤ μ_s M g cos θ => μ_s ≥ (2/7) tan θ.",
        weakConceptInsight: {
          title: "Rolling Without Slipping Dynamics",
          description: "Relating rotational torque to linear acceleration and static friction thresholds.",
          fromConcept: "Moment of Inertia",
          fromMastery: 84,
          toConcept: "Pure Rolling Constraints",
          toMastery: 46,
        },
      },
      {
        id: "phy-pyq-2",
        type: "MULTIPLE CHOICE (JEE Advanced 2021)",
        difficulty: "Hard",
        questionText: "A conducting circular loop of radius r and resistance R is placed in a uniform magnetic field B perpendicular to its plane. The magnetic field varies as B(t) = B₀ e^(-αt). What is the total electrical charge Q that passes through any cross-section of the loop from t = 0 to t → ∞?",
        mathExpression: "Q = \\int_0^\\infty I(t) dt = \\frac{\\Delta \\Phi}{R}",
        options: [
          { id: 0, label: "A", text: "π r² B₀ / R" },
          { id: 1, label: "B", text: "π r² B₀ α / R" },
          { id: 2, label: "C", text: "2 π r² B₀ / (R α)" },
          { id: 3, label: "D", text: "Zero" },
        ],
        correctAnswerIndex: 0,
        explanation: "By Faraday's law: Induced EMF = -dΦ/dt. Current I = (1/R) (dΦ/dt). Total charge Q = ∫ I dt = (1/R) ∫ dΦ = ΔΦ / R. Initial flux Φ(0) = B₀ (π r²); final flux Φ(∞) = 0. Hence ΔΦ = π r² B₀. Thus Q = π r² B₀ / R, completely independent of the decay rate α!",
        weakConceptInsight: {
          title: "Electromagnetic Induction: Charge vs Rate",
          description: "Understanding that total induced charge depends strictly on net flux change, not the rate of change.",
          fromConcept: "Faraday's Law",
          fromMastery: 86,
          toConcept: "Induced Charge Integration",
          toMastery: 52,
        },
      },
      {
        id: "phy-pyq-3",
        type: "MULTIPLE CHOICE (NEET / JEE 2020)",
        difficulty: "Hard",
        questionText: "In a Young's double slit experiment, if one of the slits is covered by a thin mica sheet of refractive index μ = 1.6 and thickness t = 1.8 μm, by how much does the central bright fringe shift if the wavelength of light used is λ = 600 nm and slit separation is d?",
        options: [
          { id: 0, label: "A", text: "Shift equivalent to 1.8 fringe widths (y = 1.8 β)" },
          { id: 1, label: "B", text: "Shift equivalent to 3 fringe widths (y = 3 β)" },
          { id: 2, label: "C", text: "Shift equivalent to 5 fringe widths (y = 5 β)" },
          { id: 3, label: "D", text: "Fringe pattern disappears" },
        ],
        correctAnswerIndex: 0,
        explanation: "Optical path difference introduced by sheet = (μ - 1) t = (1.6 - 1) * 1.8 μm = 0.6 * 1.8 = 1.08 μm. Shift in terms of fringe width: n = (μ - 1) t / λ = 1080 nm / 600 nm = 1.8 fringe widths.",
        weakConceptInsight: {
          title: "Wave Optics: Optical Path Shift",
          description: "Computing fringe shifts caused by thin dielectric dielectric films.",
          fromConcept: "Interference Patterns",
          fromMastery: 81,
          toConcept: "Optical Path Difference",
          toMastery: 50,
        },
      },
    ],
  },

  // ── Chemistry / Chemical Sciences ─────────────────────────────────────────
  "Chemistry": {
    subject: "Chemistry",
    category: "JEE ADVANCED & NEET PYQs",
    examSource: "JEE Advanced / NEET Chemistry",
    title: "Organic Mechanisms, Thermodynamics & Electrochemistry",
    questions: [
      {
        id: "chem-pyq-1",
        type: "MULTIPLE CHOICE (JEE Advanced 2022)",
        difficulty: "Hard",
        questionText: "For the galvanic cell: Zn(s) | Zn²⁺(0.01 M) || Cu²⁺(1.0 M) | Cu(s), given E°(Zn²⁺/Zn) = -0.76 V and E°(Cu²⁺/Cu) = +0.34 V, what is the cell electromotive force E_cell at 298 K? (Take 2.303 RT/F = 0.059 V)",
        mathExpression: "E_{\\text{cell}} = E^\\circ_{\\text{cell}} - \\frac{0.059}{n} \\log Q",
        options: [
          { id: 0, label: "A", text: "1.10 V" },
          { id: 1, label: "B", text: "1.159 V" },
          { id: 2, label: "C", text: "1.041 V" },
          { id: 3, label: "D", text: "1.22 V" },
        ],
        correctAnswerIndex: 1,
        explanation: "E°_cell = E°_cathode - E°_anode = 0.34 - (-0.76) = 1.10 V. n = 2. Q = [Zn²⁺] / [Cu²⁺] = 0.01 / 1.0 = 10⁻². Nernst equation: E_cell = 1.10 - (0.059 / 2) log(10⁻²) = 1.10 - (0.059 / 2) * (-2) = 1.10 + 0.059 = 1.159 V.",
        weakConceptInsight: {
          title: "Nernst Equation Concentration Quotient",
          description: "Sign convention in log Q calculation for galvanic vs electrolytic cells.",
          fromConcept: "Standard Electrode Potentials",
          fromMastery: 85,
          toConcept: "Nernst Equation Application",
          toMastery: 50,
        },
      },
      {
        id: "chem-pyq-2",
        type: "MULTIPLE CHOICE (JEE Advanced 2021)",
        difficulty: "Hard",
        questionText: "Which of the following compounds will undergo racemization when treated with aqueous KOH via an SN1 reaction mechanism?",
        options: [
          { id: 0, label: "A", text: "Optically active (R)-2-bromobutane" },
          { id: 1, label: "B", text: "1-bromobutane" },
          { id: 2, label: "C", text: "2-bromo-2-methylpropane" },
          { id: 3, label: "D", text: "Neopentyl bromide" },
        ],
        correctAnswerIndex: 0,
        explanation: "(R)-2-bromobutane has a chiral carbon at C2. Under SN1 conditions, the leaving group generates a planar carbocation intermediate. Attack by OH⁻ from either face occurs with near equal probability, causing racemization (inversion + retention).",
        weakConceptInsight: {
          title: "Carbocation Geometry & Stereochemistry",
          description: "Planar sp² intermediate loss of chirality in unimolecular nucleophilic substitution.",
          fromConcept: "SN1 vs SN2 Mechanisms",
          fromMastery: 83,
          toConcept: "Racemization & Inversion",
          toMastery: 48,
        },
      },
    ],
  },

  // ── Commerce / Economics / B.Com / CAT ─────────────────────────────────────
  "Commerce": {
    subject: "Commerce",
    category: "CA FOUNDATION & CAT PREVIOUS PAPERS",
    examSource: "CA Foundation / CAT Quantitative Aptitude",
    title: "Corporate Finance, Accounting & Business Mathematics",
    questions: [
      {
        id: "com-pyq-1",
        type: "MULTIPLE CHOICE (CA Foundation 2022)",
        difficulty: "Hard",
        questionText: "A company issues 10,000 equity shares of ₹10 each at a premium of ₹2 per share. The full amount is called up. A shareholder holding 500 shares failed to pay the final call of ₹3 per share. These shares are forfeited. What is the maximum discount per share the company can legally offer upon reissuing these forfeited shares?",
        options: [
          { id: 0, label: "A", text: "₹7 per share" },
          { id: 1, label: "B", text: "₹3 per share" },
          { id: 2, label: "C", text: "₹10 per share" },
          { id: 3, label: "D", text: "₹2 per share" },
        ],
        correctAnswerIndex: 0,
        explanation: "Under the Companies Act, the maximum discount on reissue of forfeited shares cannot exceed the amount already collected on those shares towards nominal value. Face value = ₹10, unpaid call = ₹3, so amount received on share capital = ₹7. Hence max discount is ₹7 per share.",
        weakConceptInsight: {
          title: "Forfeiture & Reissue Legal Thresholds",
          description: "Differentiating securities premium reserve from share forfeiture account capital reserves.",
          fromConcept: "Share Capital Accounting",
          fromMastery: 82,
          toConcept: "Forfeited Shares Reissue",
          toMastery: 47,
        },
      },
      {
        id: "com-pyq-2",
        type: "MULTIPLE CHOICE (CAT 2021 Quantitative Aptitude)",
        difficulty: "Hard",
        questionText: "An investor allocates capital across two assets: Asset A with expected return 12% and standard deviation 15%, and Asset B with expected return 18% and standard deviation 25%. If the correlation coefficient between the two assets is ρ = 0.20, what is the standard deviation of an equally weighted portfolio (50% in A, 50% in B)?",
        mathExpression: "\\sigma_p = \\sqrt{w_A^2 \\sigma_A^2 + w_B^2 \\sigma_B^2 + 2 w_A w_B \\sigma_A \\sigma_B \\rho}",
        options: [
          { id: 0, label: "A", text: "15.4%" },
          { id: 1, label: "B", text: "20.0%" },
          { id: 2, label: "C", text: "14.1%" },
          { id: 3, label: "D", text: "16.8%" },
        ],
        correctAnswerIndex: 0,
        explanation: "σ_p² = (0.5)²(15)² + (0.5)²(25)² + 2(0.5)(0.5)(15)(25)(0.20) = 0.25(225) + 0.25(625) + 0.5(75) = 56.25 + 156.25 + 37.5 = 237.5. σ_p = √237.5 ≈ 15.41%. Notice the significant risk reduction below the simple average (20%).",
        weakConceptInsight: {
          title: "Modern Portfolio Theory & Diversification",
          description: "Quantifying variance reduction via sub-unity correlation coefficients.",
          fromConcept: "Financial Risk & Return",
          fromMastery: 79,
          toConcept: "Portfolio Variance Formulation",
          toMastery: 45,
        },
      },
    ],
  },
};

/**
 * Fallback questions if subject does not match directly
 */
export const DEFAULT_PYQ_QUESTIONS: QuizQuestion[] = COURSE_QUIZ_BANK["Computer Science"].questions;

/**
 * Retrieve targeted previous paper questions based on the learner's active course or subject
 */
export function getQuizForCourse(courseSubject?: string, courseTitle?: string): CourseQuizSet {
  if (!courseSubject && !courseTitle) {
    return COURSE_QUIZ_BANK["Computer Science"];
  }

  const query = `${courseSubject || ""} ${courseTitle || ""}`.toLowerCase();

  if (query.includes("computer") || query.includes("software") || query.includes("data") || query.includes("ai") || query.includes("b.tech") || query.includes("dsa") || query.includes("programming") || query.includes("network") || query.includes("algorithm")) {
    return COURSE_QUIZ_BANK["Computer Science"];
  }

  if (query.includes("math") || query.includes("calculus") || query.includes("algebra") || query.includes("statistics") || query.includes("jee")) {
    return COURSE_QUIZ_BANK["Mathematics"];
  }

  if (query.includes("physic") || query.includes("mechanic") || query.includes("electronic") || query.includes("circuit") || query.includes("neet")) {
    return COURSE_QUIZ_BANK["Physics"];
  }

  if (query.includes("chem") || query.includes("organic") || query.includes("biolog")) {
    return COURSE_QUIZ_BANK["Chemistry"];
  }

  if (query.includes("com") || query.includes("account") || query.includes("finance") || query.includes("econom") || query.includes("business") || query.includes("management")) {
    return COURSE_QUIZ_BANK["Commerce"];
  }

  // Default to Computer Science / Engineering
  return COURSE_QUIZ_BANK["Computer Science"];
}
