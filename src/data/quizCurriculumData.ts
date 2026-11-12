/**
 * quizCurriculumData.ts — Canonical 5-Level Curriculum Hierarchy for LearnGraph Quiz Lab
 * Education Level → Class / Degree / Exam → Subject → Chapter → Topic
 */

import type { QuizHierarchy, QuizQuestion } from "@/types/quiz";

export const QUIZ_HIERARCHY: QuizHierarchy = {
  levels: [
    // ── 1. SCHOOL (CLASS 5 – 12) ─────────────────────────────────────────────
    {
      id: "School",
      label: "School (Class 5 – 12)",
      gradesOrExams: [
        {
          id: "class-10",
          label: "Class 10 (CBSE / ICSE / State Boards)",
          subjects: [
            {
              id: "c10-science",
              label: "Science",
              chapters: [
                {
                  id: "c10-sci-ch1",
                  label: "Chemical Reactions and Equations",
                  topics: [
                    "Chemical Equations & Balancing",
                    "Types of Chemical Reactions (Combination, Decomposition, Displacement)",
                    "Oxidation & Reduction (Redox)",
                    "Corrosion and Rancidity",
                  ],
                },
                {
                  id: "c10-sci-ch2",
                  label: "Acids, Bases and Salts",
                  topics: [
                    "Properties of Acids & Bases",
                    "pH Scale & Universal Indicators",
                    "Common Salts & Chlor-Alkali Process",
                    "Baking Soda, Washing Soda & Plaster of Paris",
                    "Water of Crystallization",
                  ],
                },
                {
                  id: "c10-sci-ch3",
                  label: "Metals and Non-metals",
                  topics: [
                    "Physical & Chemical Properties of Metals",
                    "Reactivity Series of Metals",
                    "Ionic Compounds Formation & Properties",
                    "Metallurgy & Extraction of Metals",
                    "Prevention of Corrosion & Alloys",
                  ],
                },
                {
                  id: "c10-sci-ch4",
                  label: "Carbon and its Compounds",
                  topics: [
                    "Covalent Bonding in Carbon Compounds",
                    "Versatile Nature of Carbon & Catenation",
                    "Homologous Series & Nomenclature",
                    "Chemical Properties of Carbon Compounds",
                    "Ethanol and Ethanoic Acid",
                    "Soaps and Detergents Mechanism",
                  ],
                },
                {
                  id: "c10-sci-ch6",
                  label: "Life Processes",
                  topics: [
                    "Autotrophic & Heterotrophic Nutrition",
                    "Human Digestive System",
                    "Aerobic and Anaerobic Respiration",
                    "Human Circulatory System & Double Circulation",
                    "Excretion in Human Beings & Plants",
                  ],
                },
                {
                  id: "c10-sci-ch10",
                  label: "Light – Reflection and Refraction",
                  topics: [
                    "Reflection by Spherical Mirrors & Ray Diagrams",
                    "Mirror Formula and Magnification",
                    "Refraction of Light & Snell's Law",
                    "Refractive Index Calculations",
                    "Refraction by Spherical Lenses",
                    "Lens Formula, Magnification & Power of Lens",
                  ],
                },
                {
                  id: "c10-sci-ch12",
                  label: "Electricity",
                  topics: [
                    "Electric Current, Potential Difference & Ohm's Law",
                    "Factors on which Resistance Depends & Resistivity",
                    "Resistors in Series and Parallel Combinations",
                    "Joule's Law of Heating",
                    "Electric Power & Commercial Energy Units",
                  ],
                },
                {
                  id: "c10-sci-ch13",
                  label: "Magnetic Effects of Electric Current",
                  topics: [
                    "Magnetic Field Lines & Properties",
                    "Right Hand Thumb Rule & Circular Loop Field",
                    "Magnetic Field in a Solenoid",
                    "Force on a Current-Carrying Conductor in Magnetic Field",
                    "Electromagnetic Induction & Domestic Circuits",
                  ],
                },
              ],
            },
            {
              id: "c10-math",
              label: "Mathematics",
              chapters: [
                {
                  id: "c10-math-ch1",
                  label: "Real Numbers",
                  topics: [
                    "Fundamental Theorem of Arithmetic",
                    "Proof of Irrationality (√2, √3, √5)",
                    "Decimal Expansion of Rational Numbers",
                  ],
                },
                {
                  id: "c10-math-ch2",
                  label: "Polynomials",
                  topics: [
                    "Geometrical Meaning of Zeroes of a Polynomial",
                    "Relationship between Zeroes and Coefficients",
                    "Division Algorithm for Polynomials",
                  ],
                },
                {
                  id: "c10-math-ch3",
                  label: "Pair of Linear Equations in Two Variables",
                  topics: [
                    "Graphical Method of Solution & Consistency",
                    "Algebraic Methods: Substitution & Elimination",
                    "Cross-Multiplication Method",
                    "Word Problems on Speed, Distance & Work",
                  ],
                },
                {
                  id: "c10-math-ch4",
                  label: "Quadratic Equations",
                  topics: [
                    "Solution of Quadratic Equations by Factorization",
                    "Solution by Completing the Square",
                    "Nature of Roots & Discriminant Analysis",
                  ],
                },
                {
                  id: "c10-math-ch8",
                  label: "Introduction to Trigonometry",
                  topics: [
                    "Trigonometric Ratios in Right Triangles",
                    "Trigonometric Ratios of Specific Angles (30°, 45°, 60°)",
                    "Trigonometric Identities (sin²θ + cos²θ = 1)",
                    "Heights and Distances & Angles of Elevation",
                  ],
                },
                {
                  id: "c10-math-ch14",
                  label: "Statistics & Probability",
                  topics: [
                    "Mean of Grouped Data (Direct & Assumed Mean)",
                    "Mode and Median of Grouped Data",
                    "Empirical Relationship between Mean, Median & Mode",
                    "Classical Definition of Probability",
                  ],
                },
              ],
            },
          ],
        },
        {
          id: "class-12",
          label: "Class 12 (Board & Pre-University)",
          subjects: [
            {
              id: "c12-physics",
              label: "Physics",
              chapters: [
                {
                  id: "c12-phy-ch1",
                  label: "Electrostatics & Gauss's Law",
                  topics: [
                    "Coulomb's Law & Electric Field Lines",
                    "Electric Dipole in Uniform Electric Field",
                    "Gauss's Theorem & Applications",
                    "Electrostatic Potential & Capacitance",
                    "Parallel Plate Capacitor with Dielectric Slab",
                  ],
                },
                {
                  id: "c12-phy-ch3",
                  label: "Current Electricity",
                  topics: [
                    "Drift Velocity and Ohm's Law Derivation",
                    "Kirchhoff's Rules and Wheatstone Bridge",
                    "Internal Resistance and Cell Combinations",
                    "Potentiometer Principle & Comparison of EMF",
                  ],
                },
                {
                  id: "c12-phy-ch9",
                  label: "Ray Optics and Optical Instruments",
                  topics: [
                    "Refraction at Spherical Surfaces & Lens Maker's Formula",
                    "Total Internal Reflection and Optical Fibres",
                    "Dispersion and Prism Formula",
                    "Astronomical Telescope and Compound Microscope",
                  ],
                },
              ],
            },
            {
              id: "c12-chemistry",
              label: "Chemistry",
              chapters: [
                {
                  id: "c12-chem-ch2",
                  label: "Electrochemistry",
                  topics: [
                    "Galvanic Cells & Standard Electrode Potentials",
                    "Nernst Equation and Equilibrium Constant",
                    "Conductivity and Kohlrausch's Law",
                    "Faraday's Laws of Electrolysis",
                  ],
                },
                {
                  id: "c12-chem-ch10",
                  label: "Haloalkanes and Haloarenes",
                  topics: [
                    "SN1 and SN2 Reaction Mechanisms",
                    "Stereochemistry: Inversion vs Racemization",
                    "Electrophilic Substitution in Haloarenes",
                    "Elimination Reactions & Saytzeff Rule",
                  ],
                },
              ],
            },
            {
              id: "c12-math",
              label: "Mathematics",
              chapters: [
                {
                  id: "c12-math-ch5",
                  label: "Continuity and Differentiability",
                  topics: [
                    "Continuity at a Point and Closed Intervals",
                    "Differentiability & Chain Rule",
                    "Logarithmic and Parametric Differentiation",
                    "Mean Value Theorem & Rolle's Theorem",
                  ],
                },
                {
                  id: "c12-math-ch7",
                  label: "Integrals",
                  topics: [
                    "Integration by Partial Fractions & By Parts",
                    "Definite Integrals & Fundamental Theorem of Calculus",
                    "King's Property & Periodic Definite Integrals",
                    "Area Under Simple and Between Curves",
                  ],
                },
              ],
            },
          ],
        },
      ],
    },

    // ── 2. UNDERGRADUATE (B.TECH, B.COM, B.SC, BCA) ──────────────────────────
    {
      id: "Undergraduate",
      label: "Undergraduate (B.Tech, B.Com, B.Sc, BCA)",
      gradesOrExams: [
        {
          id: "btech-cse",
          label: "B.Tech Computer Science & IT",
          subjects: [
            {
              id: "ug-dsa",
              label: "Data Structures & Algorithms",
              chapters: [
                {
                  id: "ug-dsa-ch1",
                  label: "Asymptotic Analysis & Recurrences",
                  topics: [
                    "Big-O, Omega and Theta Formal Definitions",
                    "Master Theorem for Divide & Conquer Recurrences",
                    "Akra-Bazzi Method for Non-Uniform Recurrences",
                    "Amortized Analysis (Aggregate & Potential Method)",
                  ],
                },
                {
                  id: "ug-dsa-ch2",
                  label: "Advanced Trees and Priority Queues",
                  topics: [
                    "Binary Search Trees & Threaded BSTs",
                    "AVL Trees: Single and Double Rotations",
                    "Red-Black Trees Balance Invariants",
                    "B-Trees and B+ Trees for Database Indexing",
                    "Min/Max Binary Heaps & Fibonacci Heaps",
                  ],
                },
                {
                  id: "ug-dsa-ch3",
                  label: "Graph Algorithms",
                  topics: [
                    "Breadth First Search (BFS) & Depth First Search (DFS)",
                    "Dijkstra's Single Source Shortest Path",
                    "Bellman-Ford Algorithm & Negative Weight Cycles",
                    "Floyd-Warshall All-Pairs Shortest Path",
                    "Kruskal's & Prim's Minimum Spanning Tree Algorithms",
                    "Topological Sorting & Strongly Connected Components",
                  ],
                },
                {
                  id: "ug-dsa-ch4",
                  label: "Dynamic Programming & Greedy Strategies",
                  topics: [
                    "Optimal Substructure & Overlapping Subproblems",
                    "0/1 Knapsack & Fractional Knapsack",
                    "Longest Common Subsequence (LCS)",
                    "Matrix Chain Multiplication",
                    "Huffman Coding & Greedy Choice Property",
                  ],
                },
              ],
            },
            {
              id: "ug-os",
              label: "Operating Systems",
              chapters: [
                {
                  id: "ug-os-ch1",
                  label: "Processes, Threads & CPU Scheduling",
                  topics: [
                    "Process Control Block & Context Switching",
                    "Preemptive vs Non-Preemptive Scheduling Algorithms",
                    "Multi-threading Models & Kernel vs User Threads",
                  ],
                },
                {
                  id: "ug-os-ch2",
                  label: "Process Synchronization & Deadlocks",
                  topics: [
                    "Critical Section Problem & Peterson's Solution",
                    "Semaphores (Counting vs Binary) & Mutex Locks",
                    "Classical Synchronization Problems (Dining Philosophers, Readers-Writers)",
                    "Deadlock Necessary Conditions & Banker's Safety Algorithm",
                  ],
                },
                {
                  id: "ug-os-ch3",
                  label: "Memory Management & Virtual Memory",
                  topics: [
                    "Paging Architecture & Page Table Structures",
                    "Multi-level and Inverted Page Tables",
                    "TLB Hit/Miss & Effective Memory Access Time",
                    "Page Replacement Algorithms (FIFO, LRU, Optimal)",
                    "Thrashing and Working Set Model",
                  ],
                },
              ],
            },
            {
              id: "ug-dbms",
              label: "Database Management Systems",
              chapters: [
                {
                  id: "ug-dbms-ch1",
                  label: "Relational Model & SQL",
                  topics: [
                    "Relational Algebra Operators & Query Trees",
                    "Complex SQL Joins, Aggregations & Subqueries",
                    "Integrity Constraints & Foreign Keys",
                  ],
                },
                {
                  id: "ug-dbms-ch2",
                  label: "Database Normalization & Dependencies",
                  topics: [
                    "Functional Dependencies & Attribute Closure",
                    "First, Second and Third Normal Forms (1NF, 2NF, 3NF)",
                    "Boyce-Codd Normal Form (BCNF) Decomposition",
                    "Lossless Join & Dependency Preservation Proofs",
                  ],
                },
                {
                  id: "ug-dbms-ch3",
                  label: "Transactions, Concurrency & Indexing",
                  topics: [
                    "ACID Properties & Transaction States",
                    "Conflict Serializability & Precedence Graphs",
                    "Two-Phase Locking (2PL) & Strict 2PL",
                    "B+ Tree Index Calculations & Fan-Out",
                  ],
                },
              ],
            },
          ],
        },
        {
          id: "bcom",
          label: "B.Com / Commerce & Finance",
          subjects: [
            {
              id: "bcom-corp-fin",
              label: "Corporate Accounting & Finance",
              chapters: [
                {
                  id: "bcom-ch1",
                  label: "Share Capital & Forfeiture",
                  topics: [
                    "Issue of Shares at Par, Premium & Discount",
                    "Forfeiture of Shares & Accounting Entries",
                    "Reissue of Forfeited Shares & Maximum Legal Discount",
                  ],
                },
                {
                  id: "bcom-ch2",
                  label: "Financial Statements & Valuation",
                  topics: [
                    "Cash Flow Statements (AS 3) Direct vs Indirect",
                    "Ratio Analysis: Liquidity, Solvency & Profitability",
                    "Working Capital Management & Cash Budgeting",
                  ],
                },
              ],
            },
          ],
        },
      ],
    },

    // ── 3. COMPETITIVE EXAMS ─────────────────────────────────────────────────
    {
      id: "Competitive Exams",
      label: "Competitive Exams (GATE, JEE, NEET, UPSC, CAT, Bank)",
      gradesOrExams: [
        {
          id: "exam-gate-cs",
          label: "GATE Computer Science & IT",
          subjects: [
            {
              id: "gate-dsa",
              label: "Algorithms & Data Structures",
              chapters: [
                {
                  id: "gate-algos-ch1",
                  label: "Algorithm Design Techniques",
                  topics: [
                    "Asymptotic Notation & Time Complexity PYQs",
                    "Divide and Conquer Recurrence Relations",
                    "Dynamic Programming: Knapsack & Matrix Chain",
                    "Greedy Algorithms: Huffman & Interval Scheduling",
                    "Graph Traversals & Shortest Paths",
                  ],
                },
              ],
            },
            {
              id: "gate-systems",
              label: "Operating Systems & Databases",
              chapters: [
                {
                  id: "gate-os-ch1",
                  label: "OS & DBMS Core PYQs",
                  topics: [
                    "Paging & Virtual Memory Calculations",
                    "Concurrency & Banker's Algorithm",
                    "Normalization: 3NF & BCNF Derivations",
                    "Conflict Serializability & Indexing",
                  ],
                },
              ],
            },
          ],
        },
        {
          id: "exam-jee-adv",
          label: "JEE Main & Advanced",
          subjects: [
            {
              id: "jee-maths",
              label: "Mathematics",
              chapters: [
                {
                  id: "jee-calc-ch1",
                  label: "Calculus & Limits",
                  topics: [
                    "Indeterminate Limits & Taylor Expansions",
                    "Differentiability and Rolle's Theorem",
                    "Definite Integrals & King's Property",
                    "Differential Equations & Integrating Factors",
                  ],
                },
              ],
            },
            {
              id: "jee-physics",
              label: "Physics",
              chapters: [
                {
                  id: "jee-mech-ch1",
                  label: "Mechanics & Electrodynamics",
                  topics: [
                    "Rotational Dynamics & Pure Rolling Without Slipping",
                    "Conservation of Angular Momentum",
                    "Faraday's Law & Total Induced Charge",
                    "Wave Optics & Thin Film Fringe Shift",
                  ],
                },
              ],
            },
          ],
        },
        {
          id: "exam-neet",
          label: "NEET (Medical Entrance)",
          subjects: [
            {
              id: "neet-biology",
              label: "Biology",
              chapters: [
                {
                  id: "neet-physio-ch1",
                  label: "Human Physiology & Genetics",
                  topics: [
                    "Human Digestion & Absorption Mechanisms",
                    "Neural Control and Synaptic Transmission",
                    "Mendelian Genetics & Dihybrid Cross Ratios",
                    "DNA Replication & Molecular Basis of Inheritance",
                  ],
                },
              ],
            },
          ],
        },
        {
          id: "exam-upsc",
          label: "UPSC Civil Services (CSE)",
          subjects: [
            {
              id: "upsc-polity",
              label: "Indian Polity & Governance",
              chapters: [
                {
                  id: "upsc-const-ch1",
                  label: "Constitutional Framework & Rights",
                  topics: [
                    "Preamble & Basic Structure Doctrine",
                    "Fundamental Rights (Articles 14 to 32)",
                    "Directive Principles of State Policy (DPSPs)",
                    "Emergency Provisions & President's Rule (Article 356)",
                  ],
                },
              ],
            },
          ],
        },
        {
          id: "exam-cat",
          label: "CAT (MBA Entrance)",
          subjects: [
            {
              id: "cat-quant",
              label: "Quantitative Aptitude",
              chapters: [
                {
                  id: "cat-arithmetic-ch1",
                  label: "Modern Math & Arithmetic",
                  topics: [
                    "Permutations & Combinations (P&C)",
                    "Probability & Expected Values",
                    "Time, Speed & Circular Tracks",
                    "Profit, Loss, Discount & Mixtures",
                  ],
                },
              ],
            },
          ],
        },
      ],
    },

    // ── 4. PROGRAMMING & PROFESSIONAL ─────────────────────────────────────────
    {
      id: "Programming",
      label: "Programming & Professional Tech Tracks",
      gradesOrExams: [
        {
          id: "prog-web-dev",
          label: "Full Stack & Web Development",
          subjects: [
            {
              id: "prog-js-ts",
              label: "JavaScript, TypeScript & React",
              chapters: [
                {
                  id: "prog-react-ch1",
                  label: "React 19 & Modern State Management",
                  topics: [
                    "React Fiber Reconciler & Concurrent Features",
                    "Custom Hooks & useCallback / useMemo Optimizations",
                    "Zustand vs Redux Toolkit State Architectures",
                    "Server Components & Hydration Boundaries",
                  ],
                },
              ],
            },
            {
              id: "prog-backend-sys",
              label: "System Design & Distributed Architectures",
              chapters: [
                {
                  id: "prog-sysdes-ch1",
                  label: "Scalability & Distributed Storage",
                  topics: [
                    "CAP Theorem & PACELC Trade-offs",
                    "Consistent Hashing & Virtual Nodes",
                    "Rate Limiting Algorithms (Token Bucket & Leaky Bucket)",
                    "Cache-Aside vs Write-Through Strategies",
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
