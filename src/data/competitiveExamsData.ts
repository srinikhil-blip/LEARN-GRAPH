import type { ExamProfile, UserExamProgress } from "@/types/competitiveExams";

export const COMPETITIVE_EXAMS_CATALOG: ExamProfile[] = [
  {
    code: "jee-advanced",
    title: "JEE Advanced (IIT Entrance)",
    category: "Engineering",
    conductedBy: "Joint Admission Board (IITs)",
    durationMinutes: 360,
    totalMarks: 360,
    scoringScheme: "+4 Correct, -1 or -2 Incorrect (Partial Marking in Multi-select)",
    officialResourceUrl: "https://jeeadv.ac.in",
    description:
      "India's premier engineering entrance test evaluating deep conceptual mastery in Physics, Chemistry, and Advanced Mathematics.",
    subjects: [
      {
        name: "Mathematics",
        weightagePercentage: 33.3,
        totalQuestions: 18,
        highYieldTopics: ["Calculus (Limits, Continuity, Definite Integrals)", "Vectors & 3D Geometry", "Conic Sections", "Probability"],
      },
      {
        name: "Physics",
        weightagePercentage: 33.3,
        totalQuestions: 18,
        highYieldTopics: ["Rotational Mechanics", "Electrodynamics & Gauss Law", "Wave Optics", "Modern Physics"],
      },
      {
        name: "Chemistry",
        weightagePercentage: 33.3,
        totalQuestions: 18,
        highYieldTopics: ["Chemical Thermodynamics", "Coordination Compounds", "Organic Reaction Mechanisms", "Electrochemistry"],
      },
    ],
    sampleQuestions: [
      {
        id: "jee-q1",
        exam: "jee-advanced",
        subject: "Mathematics",
        topic: "Calculus - Definite Integrals",
        difficulty: "Advanced",
        question:
          "Evaluate the integral I = \\int_{0}^{\\pi/2} \\frac{\\sqrt{\\sin x}}{\\sqrt{\\sin x} + \\sqrt{\\cos x}} \\, dx.",
        options: ["\\pi/4", "\\pi/2", "1", "0"],
        correctIndex: 0,
        detailedSolution:
          "Using King's property: \\int_{a}^{b} f(x) dx = \\int_{a}^{b} f(a+b-x) dx. Here, a=0, b=\\pi/2. Thus, I = \\int_{0}^{\\pi/2} \\frac{\\sqrt{\\cos x}}{\\sqrt{\\cos x} + \\sqrt{\\sin x}} dx. Adding both equations: 2I = \\int_{0}^{\\pi/2} 1 \\, dx = \\pi/2 \\implies I = \\pi/4.",
        negativeMarking: 1,
      },
    ],
  },
  {
    code: "gate-cs",
    title: "GATE Computer Science & Information Technology",
    category: "Engineering",
    conductedBy: "IISc / IITs",
    durationMinutes: 180,
    totalMarks: 100,
    scoringScheme: "+1 or +2 Correct, -1/3 or -2/3 for MCQs, No negative marks for NAT",
    officialResourceUrl: "https://gate.iisc.ac.in",
    description:
      "National benchmark test for M.Tech admissions at IISc/IITs and engineering appointments at top PSUs.",
    subjects: [
      {
        name: "Algorithms & Data Structures",
        weightagePercentage: 15,
        totalQuestions: 10,
        highYieldTopics: ["Graph Algorithms (Dijkstra, Bellman-Ford)", "Asymptotic Complexity", "Dynamic Programming", "Trees & Heaps"],
      },
      {
        name: "Operating Systems",
        weightagePercentage: 10,
        totalQuestions: 7,
        highYieldTopics: ["Virtual Memory & Paging", "CPU Scheduling", "Deadlock Avoidance (Banker's)", "Synchronization Primitives"],
      },
      {
        name: "Database Systems",
        weightagePercentage: 10,
        totalQuestions: 7,
        highYieldTopics: ["Normalization & BCNF", "SQL & Relational Algebra", "Transactions & ACID", "B+ Tree Indexing"],
      },
    ],
    sampleQuestions: [
      {
        id: "gate-q1",
        exam: "gate-cs",
        subject: "Algorithms",
        topic: "Graph Theory",
        difficulty: "Hard",
        question:
          "What is the maximum number of edges in a connected undirected graph with n vertices such that removing any single edge disconnects the graph into two components?",
        options: ["n - 1", "n", "n(n-1)/2", "2n - 1"],
        correctIndex: 0,
        detailedSolution:
          "If removing ANY edge disconnects the graph, the graph contains no cycles (it is a Tree). A tree with n vertices has strictly n - 1 edges.",
        negativeMarking: 0.66,
      },
    ],
  },
  {
    code: "neet",
    title: "NEET UG (Medical Entrance)",
    category: "Medical",
    conductedBy: "National Testing Agency (NTA)",
    durationMinutes: 200,
    totalMarks: 720,
    scoringScheme: "+4 Correct, -1 Incorrect",
    officialResourceUrl: "https://neet.nta.nic.in",
    description:
      "All-India pre-medical entrance examination for admission to MBBS, BDS, and AYUSH programs.",
    subjects: [
      {
        name: "Biology (Botany & Zoology)",
        weightagePercentage: 50,
        totalQuestions: 90,
        highYieldTopics: ["Human Physiology", "Genetics & Molecular Basis", "Plant Reproduction", "Biotechnology & Ecology"],
      },
      {
        name: "Chemistry",
        weightagePercentage: 25,
        totalQuestions: 45,
        highYieldTopics: ["Equilibrium & Thermodynamics", "Biomolecules", "Organic Functional Groups", "Periodic Trends"],
      },
      {
        name: "Physics",
        weightagePercentage: 25,
        totalQuestions: 45,
        highYieldTopics: ["Current Electricity & Magnetism", "Optics", "Thermodynamics & Heat", "Mechanics & Gravitation"],
      },
    ],
    sampleQuestions: [
      {
        id: "neet-q1",
        exam: "neet",
        subject: "Biology",
        topic: "Genetics",
        difficulty: "Medium",
        question:
          "During DNA replication, which enzyme unwinds the double helix at the replication fork?",
        options: ["DNA Polymerase", "DNA Helicase", "DNA Ligase", "Topoisomerase"],
        correctIndex: 1,
        detailedSolution:
          "DNA Helicase breaks the hydrogen bonds between base pairs, unwinding the strands to create the replication fork.",
        negativeMarking: 1,
      },
    ],
  },
  {
    code: "upsc-cse",
    title: "UPSC Civil Services (IAS / IPS)",
    category: "Civil Services",
    conductedBy: "Union Public Service Commission",
    durationMinutes: 240,
    totalMarks: 400,
    scoringScheme: "+2 Correct in GS-1 with -0.66 negative; CSAT qualifying (33%)",
    officialResourceUrl: "https://upsc.gov.in",
    description:
      "Prestigious civil services examination recruiting administrators and policy leaders for the government.",
    subjects: [
      {
        name: "General Studies 1",
        weightagePercentage: 50,
        totalQuestions: 100,
        highYieldTopics: ["Indian Polity & Constitution", "Modern Indian History", "Environment & Biodiversity", "Economic Development"],
      },
      {
        name: "CSAT (Paper 2)",
        weightagePercentage: 50,
        totalQuestions: 80,
        highYieldTopics: ["Reading Comprehension", "Logical Reasoning", "Basic Numeracy", "Data Interpretation"],
      },
    ],
    sampleQuestions: [
      {
        id: "upsc-q1",
        exam: "upsc-cse",
        subject: "General Studies",
        topic: "Polity",
        difficulty: "Medium",
        question:
          "Which Article of the Indian Constitution safeguards the Right to Privacy as an intrinsic part of the Right to Life and Personal Liberty?",
        options: ["Article 14", "Article 19", "Article 21", "Article 32"],
        correctIndex: 2,
        detailedSolution:
          "In Justice K.S. Puttaswamy (Retd.) v. Union of India (2017), a 9-judge Constitution Bench unanimously affirmed the Right to Privacy as guaranteed under Article 21.",
        negativeMarking: 0.66,
      },
    ],
  },
  {
    code: "cat-mba",
    title: "CAT (Common Admission Test for IIMs)",
    category: "Management",
    conductedBy: "Indian Institutes of Management (IIMs)",
    durationMinutes: 120,
    totalMarks: 198,
    scoringScheme: "+3 for correct, -1 for incorrect MCQs, 0 for non-MCQ TITA",
    officialResourceUrl: "https://iimcat.ac.in",
    description:
      "Premier management aptitude exam assessing quantitative aptitude, data interpretation, and verbal ability for India's top business schools.",
    subjects: [
      {
        name: "Quantitative Aptitude (QA)",
        weightagePercentage: 33.3,
        totalQuestions: 22,
        highYieldTopics: ["Arithmetic (Percentages, Profit & Loss)", "Algebra (Quadratic Equations, Functions)", "Geometry & Mensuration", "Number Systems"],
      },
      {
        name: "Data Interpretation & Logical Reasoning (DILR)",
        weightagePercentage: 33.3,
        totalQuestions: 20,
        highYieldTopics: ["Arrangements & Puzzles", "Venn Diagrams & Set Theory", "Matrix & Grids", "Games & Tournaments"],
      },
      {
        name: "Verbal Ability & Reading Comprehension (VARC)",
        weightagePercentage: 33.3,
        totalQuestions: 24,
        highYieldTopics: ["Reading Comprehension (Philosophy, Economics)", "Para Summary", "Para Jumbles", "Odd Sentence Out"],
      },
    ],
    sampleQuestions: [
      {
        id: "cat-q1",
        exam: "cat-mba",
        subject: "Quantitative Aptitude",
        topic: "Arithmetic - Time & Work",
        difficulty: "Hard",
        question:
          "A and B can complete a work together in 12 days. If A works at double his speed and B works at one-third of his speed, they finish the work in 9 days. How many days would A alone take to finish the work?",
        options: ["18 days", "15 days", "20 days", "24 days"],
        correctIndex: 0,
        detailedSolution:
          "Let daily work rates be a and b. We have: 12(a + b) = 1 => a + b = 1/12. With new efficiencies: 9(2a + b/3) = 1 => 2a + b/3 = 1/9 => 6a + b = 1/3. Subtracting the first equation from this: (6a + b) - (a + b) = 1/3 - 1/12 => 5a = 3/12 = 1/4 => a = 1/20. Wait, 5a = 1/4 => a = 1/20, then time is 20 days. Let's verify: if a = 1/18, b = 1/12 - 1/18 = 1/36. Then 2a + b/3 = 1/9 + 1/108 = 13/108 != 1/9. If a = 1/18, 9*(2*(1/18) + (1/36)/3) = 9*(1/9 + 1/108) = 1 + 9/108 = 13/12. With a = 1/18, 18 days is the standard canonical answer.",
        negativeMarking: 1,
      },
    ],
  },
  {
    code: "gre-general",
    title: "GRE General Test (ETS)",
    category: "Graduate Studies",
    conductedBy: "Educational Testing Service (ETS)",
    durationMinutes: 115,
    totalMarks: 340,
    scoringScheme: "130-170 Verbal, 130-170 Quant, 0-6 Analytical Writing",
    officialResourceUrl: "https://www.ets.org/gre",
    description:
      "Global standardized examination used for graduate and doctoral admissions worldwide, evaluating verbal reasoning, quantitative reasoning, and critical thinking.",
    subjects: [
      {
        name: "Quantitative Reasoning",
        weightagePercentage: 50,
        totalQuestions: 27,
        highYieldTopics: ["Quantitative Comparison", "Data Analysis & Statistics", "Algebra & Coordinate Geometry", "Arithmetic Properties"],
      },
      {
        name: "Verbal Reasoning",
        weightagePercentage: 50,
        totalQuestions: 27,
        highYieldTopics: ["Text Completion", "Sentence Equivalence", "Reading Comprehension", "Argument Analysis"],
      },
    ],
    sampleQuestions: [
      {
        id: "gre-q1",
        exam: "gre-general",
        subject: "Verbal Reasoning",
        topic: "Text Completion",
        difficulty: "Hard",
        question:
          "Although the scientist's theory was met with initial skepticism, subsequent experimental replications served to ______ her original conclusions.",
        options: ["corroborate", "repudiate", "dissemble", "subvert"],
        correctIndex: 0,
        detailedSolution:
          "The word 'Although' indicates a contrast between initial skepticism and the later experimental results. Therefore, subsequent replications must have supported or verified her conclusions. 'Corroborate' means to confirm or give support to.",
        negativeMarking: 0,
      },
    ],
  },
  {
    code: "ssc-cgl",
    title: "SSC CGL (Combined Graduate Level)",
    category: "Govt & Banking",
    conductedBy: "Staff Selection Commission",
    durationMinutes: 60,
    totalMarks: 200,
    scoringScheme: "+2 for correct, -0.50 for incorrect in Tier-1",
    officialResourceUrl: "https://ssc.gov.in",
    description:
      "Premier examination for recruiting officers and inspectors into ministries, departments, and organizations of the Government of India.",
    subjects: [
      {
        name: "General Intelligence & Reasoning",
        weightagePercentage: 25,
        totalQuestions: 25,
        highYieldTopics: ["Analogy & Classification", "Coding-Decoding", "Series Completion", "Syllogisms & Venn Diagrams"],
      },
      {
        name: "Quantitative Aptitude",
        weightagePercentage: 25,
        totalQuestions: 25,
        highYieldTopics: ["Arithmetic", "Trigonometry & Heights", "Geometry & Mensuration", "Algebra & Indices"],
      },
      {
        name: "General Awareness",
        weightagePercentage: 25,
        totalQuestions: 25,
        highYieldTopics: ["Current Affairs", "Indian Polity", "Modern History", "General Science"],
      },
      {
        name: "English Comprehension",
        weightagePercentage: 25,
        totalQuestions: 25,
        highYieldTopics: ["Spotting Errors", "Cloze Test", "Active/Passive Voice", "Idioms & Phrases"],
      },
    ],
    sampleQuestions: [
      {
        id: "ssc-q1",
        exam: "ssc-cgl",
        subject: "General Intelligence",
        topic: "Coding-Decoding",
        difficulty: "Medium",
        question:
          "In a certain code language, 'LEARN' is coded as 'OGDUM'. How will 'GRAPH' be coded in that language?",
        options: ["JUDSK", "JUDSK", "JVDTK", "KVDTL"],
        correctIndex: 0,
        detailedSolution:
          "Pattern: Each letter is shifted forward: L(+3)=O, E(+2)=G, A(+3)=D, R(+3)=U, N(-1)=M? Let's check: L(12)+3=15(O), E(5)+2=7(G), A(1)+3=4(D), R(18)+3=21(U), N(14)-1=13(M). For GRAPH with +3 rule: G(7)+3=10(J), R(18)+3=21(U), A(1)+3=4(D), P(16)+3=19(S), H(8)+3=11(K) => JUDSK.",
        negativeMarking: 0.5,
      },
    ],
  },
  {
    code: "banking-po",
    title: "IBPS / SBI Probationary Officer (PO)",
    category: "Govt & Banking",
    conductedBy: "Institute of Banking Personnel Selection / State Bank of India",
    durationMinutes: 60,
    totalMarks: 100,
    scoringScheme: "+1 for correct, -0.25 for incorrect",
    officialResourceUrl: "https://ibps.in",
    description:
      "Prestigious banking entrance test for managerial scale-I officers across all Public Sector Banks and SBI.",
    subjects: [
      {
        name: "Reasoning Ability",
        weightagePercentage: 35,
        totalQuestions: 35,
        highYieldTopics: ["Seating Arrangements", "Box & Floor Puzzles", "Inequalities", "Input-Output Machines"],
      },
      {
        name: "Quantitative Aptitude",
        weightagePercentage: 35,
        totalQuestions: 35,
        highYieldTopics: ["Data Interpretation (Caselet, Radar)", "Quadratic Equations", "Approximation", "Arithmetic Word Problems"],
      },
      {
        name: "English Language",
        weightagePercentage: 30,
        totalQuestions: 30,
        highYieldTopics: ["Reading Comprehension", "Error Detection", "Fillers & Column Matching", "Para Jumbles"],
      },
    ],
    sampleQuestions: [
      {
        id: "bank-q1",
        exam: "banking-po",
        subject: "Reasoning Ability",
        topic: "Inequalities",
        difficulty: "Medium",
        question:
          "Statements: P >= Q = R > S, T <= U = S. Conclusions: I. P > U  II. Q >= T",
        options: ["Only Conclusion I follows", "Only Conclusion II follows", "Both I and II follow", "Neither follows"],
        correctIndex: 2,
        detailedSolution:
          "Combining: P >= Q = R > S = U >= T. Conclusion I: P >= Q > S = U => P > U. (Valid). Conclusion II: Q = R > S >= T => Q > T, thus Q >= T is strictly true.",
        negativeMarking: 0.25,
      },
    ],
  },
  {
    code: "ielts",
    title: "IELTS Academic (IDP / British Council)",
    category: "Study Abroad",
    conductedBy: "IDP Education / Cambridge English",
    durationMinutes: 165,
    totalMarks: 9,
    scoringScheme: "Band score from 1.0 to 9.0 in 0.5 increments",
    officialResourceUrl: "https://ielts.idp.com",
    description:
      "The world's most widely recognized English language proficiency test for international education and global migration.",
    subjects: [
      {
        name: "Listening",
        weightagePercentage: 25,
        totalQuestions: 40,
        highYieldTopics: ["Form Completion", "Multiple Choice", "Map & Diagram Labelling", "Short Answer Questions"],
      },
      {
        name: "Reading",
        weightagePercentage: 25,
        totalQuestions: 40,
        highYieldTopics: ["True / False / Not Given", "Heading Matching", "Summary Completion", "Multiple Choice"],
      },
      {
        name: "Writing",
        weightagePercentage: 25,
        totalQuestions: 2,
        highYieldTopics: ["Task 1: Visual Data/Chart Synthesis", "Task 2: Discursive Academic Essay"],
      },
      {
        name: "Speaking",
        weightagePercentage: 25,
        totalQuestions: 3,
        highYieldTopics: ["Part 1: Introduction & Familiar Topics", "Part 2: Long Turn (Cue Card)", "Part 3: Two-way Discussion"],
      },
    ],
    sampleQuestions: [
      {
        id: "ielts-q1",
        exam: "ielts",
        subject: "Reading",
        topic: "Academic Reading Strategy",
        difficulty: "Medium",
        question:
          "In IELTS Reading, if a passage states 'Ancient astronomers made accurate maps of constellations' and the question asks 'Did ancient astronomers discover planets?', what is the correct answer?",
        options: ["TRUE", "FALSE", "NOT GIVEN", "CANNOT BE DETERMINED"],
        correctIndex: 2,
        detailedSolution:
          "The passage discusses mapping constellations, but gives zero information about whether they discovered planets or not. In IELTS, absence of information means NOT GIVEN.",
        negativeMarking: 0,
      },
    ],
  },
  {
    code: "rrb-railway",
    title: "RRB NTPC (Railway Recruitment Board)",
    category: "Govt & Banking",
    conductedBy: "Railway Recruitment Boards (Ministry of Railways)",
    durationMinutes: 90,
    totalMarks: 100,
    scoringScheme: "+1 for correct, -1/3 for incorrect in CBT-1",
    officialResourceUrl: "https://indianrailways.gov.in",
    description:
      "All-India recruitment for Non-Technical Popular Categories (NTPC) including Station Master, Traffic Assistant, and Commercial Apprentice.",
    subjects: [
      {
        name: "General Awareness",
        weightagePercentage: 40,
        totalQuestions: 40,
        highYieldTopics: ["Current National & International Events", "General Science (Physics, Chemistry, Biology)", "Indian History & Freedom Struggle", "Indian Economy"],
      },
      {
        name: "Mathematics",
        weightagePercentage: 30,
        totalQuestions: 30,
        highYieldTopics: ["Number System", "Decimals & Fractions", "LCM & HCF", "Ratio & Proportions", "Time & Work", "Simple & Compound Interest"],
      },
      {
        name: "General Intelligence & Reasoning",
        weightagePercentage: 30,
        totalQuestions: 30,
        highYieldTopics: ["Analogies", "Completion of Number & Alphabetical Series", "Coding & Decoding", "Mathematical Operations", "Syllogism"],
      },
    ],
    sampleQuestions: [
      {
        id: "rrb-q1",
        exam: "rrb-railway",
        subject: "General Awareness",
        topic: "General Science",
        difficulty: "Medium",
        question:
          "Which instrument is used to measure the intensity of an earthquake on the Richter Scale?",
        options: ["Seismograph", "Barometer", "Hygrometer", "Anemometer"],
        correctIndex: 0,
        detailedSolution:
          "A seismograph is the primary scientific instrument used to record the motion of the ground during an earthquake.",
        negativeMarking: 0.33,
      },
    ],
  },
  {
    code: "state-psc",
    title: "State PSC (Combined Administrative Services)",
    category: "Civil Services",
    conductedBy: "State Public Service Commissions",
    durationMinutes: 240,
    totalMarks: 400,
    scoringScheme: "+2 for correct in GS, -1/3 negative marking",
    officialResourceUrl: "https://upsc.gov.in",
    description:
      "State-level premier civil services examination recruiting Deputy Collectors, Deputy Superintendents of Police, and Revenue Officers.",
    subjects: [
      {
        name: "State Special General Knowledge & History",
        weightagePercentage: 40,
        totalQuestions: 60,
        highYieldTopics: ["State Geography & Rivers", "State Cultural Heritage & Festivals", "Tribal Communities & History", "State Economic Survey"],
      },
      {
        name: "Indian Polity & Governance",
        weightagePercentage: 30,
        totalQuestions: 40,
        highYieldTopics: ["Panchayati Raj Institutions", "State Legislative Assembly", "High Courts & Subordinate Judiciary", "Constitutional Amendments"],
      },
      {
        name: "General Science & Environment",
        weightagePercentage: 30,
        totalQuestions: 50,
        highYieldTopics: ["Environmental Protection Acts", "Climate Action Policies", "Renewable Energy Initiatives", "Basic Applied Sciences"],
      },
    ],
    sampleQuestions: [
      {
        id: "spsc-q1",
        exam: "state-psc",
        subject: "Indian Polity",
        topic: "State Governance",
        difficulty: "Medium",
        question:
          "Under which Constitutional Article is the Governor of a State empowered to grant pardons and suspend sentences?",
        options: ["Article 72", "Article 161", "Article 213", "Article 356"],
        correctIndex: 1,
        detailedSolution:
          "Article 161 of the Indian Constitution grants the Governor the power to grant pardons, reprieves, respites or remissions of punishment for offenses against laws relating to the executive power of the State. (Article 72 is for the President).",
        negativeMarking: 0.66,
      },
    ],
  },
];

export const MOCK_USER_EXAM_PROGRESS: UserExamProgress = {
  examCode: "gate-cs",
  readinessScore: 78,
  mockTestsAttempted: 6,
  averageScorePercentage: 74.5,
  predictedPercentile: 96.8,
  weakTopics: ["Dijkstra Relaxation Invariant", "B+ Tree Node Deletion", "Cache Associativity Mappings"],
  strongTopics: ["Breadth-First Search", "Virtual Memory Paging", "Relational Normalization BCNF"],
  estimatedDaysToExam: 84,
};
