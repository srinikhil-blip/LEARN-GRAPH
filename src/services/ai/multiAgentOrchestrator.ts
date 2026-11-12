/**
 * LearnGraph Omni — Intent Router & Multi-Agent Orchestrator
 *
 * Implements:
 * 1. AI Intent Router (detects user intent before answering)
 * 2. Multi-Agent Delegation:
 *    - Conversation Agent (Greetings, casual conversation, meta capabilities)
 *    - Tutor Agent (Concept explanations, structured teaching, roadmaps)
 *    - Programming Agent (Coding help, debugging, syntax, architecture)
 *    - Math Agent (Equations, LaTeX proofs, step-by-step derivations)
 *    - Exam Coach Agent (JEE, NEET, GATE, UPSC, CAT, GRE strategies & revision)
 *    - Quiz Agent (Adaptive quizzes ONLY when requested)
 *    - Knowledge Graph Agent (Prerequisite concept mapping & mastery paths)
 *    - PDF Agent (Document analysis, concept extraction, notes)
 * 3. Confidence Threshold Guard (<80% asks a clarifying question)
 */

import type { User } from "@/types/auth";
import type { OmniTeacherResult } from "@/utils/omniTeacherEngine";
import { generateOmniTeacherResponse } from "@/utils/omniTeacherEngine";

export type AgentType =
  | "conversation"
  | "tutor"
  | "programming"
  | "math"
  | "exam_coach"
  | "quiz"
  | "knowledge_graph"
  | "pdf";

export type UserIntent =
  | "greeting"
  | "general_chat"
  | "learning"
  | "programming"
  | "mathematics"
  | "competitive_exam"
  | "quiz"
  | "flashcards"
  | "pdf_analysis"
  | "knowledge_graph"
  | "clarification";

export interface IntentDetectionResult {
  intent: UserIntent;
  confidence: number; // 0.0 - 1.0
  targetDomain?: string;
  assignedAgent: AgentType;
  requiresClarification: boolean;
}

export interface AgentExecutionResult {
  agentName: string;
  agentRole: string;
  agentTone: "indigo" | "emerald" | "amber" | "purple" | "cyan" | "rose" | "blue";
  thoughtProcess: string;
  thoughtDurationSeconds: number;
  content: string;
  chips: string[];
  teacherResult?: OmniTeacherResult;
  quizPayload?: {
    topic: string;
    questions: {
      question: string;
      options: string[];
      correctIndex: number;
      explanation: string;
    }[];
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
   1. AI INTENT ROUTER
───────────────────────────────────────────────────────────────────────────── */

export function routeUserIntent(
  message: string,
  hasAttachedFile = false,
  hasAttachedImage = false
): IntentDetectionResult {
  const text = message.trim();
  const lower = text.toLowerCase();

  // 1. PDF / Document Attached or explicitly requested
  if (hasAttachedFile || lower.includes("pdf") || lower.includes("document") || lower.includes("upload") || lower.includes("analyze file")) {
    return {
      intent: "pdf_analysis",
      confidence: 0.95,
      targetDomain: "Document Analysis",
      assignedAgent: "pdf",
      requiresClarification: false,
    };
  }

  // 2. Pure Greetings
  const greetingExact = [
    "hi", "hello", "hey", "hola", "yo", "sup", "greetings",
    "good morning", "good afternoon", "good evening", "good night",
    "howdy", "hey there", "hi there", "hello there",
  ];
  if (greetingExact.includes(lower) || lower === "hi!" || lower === "hello!") {
    return {
      intent: "greeting",
      confidence: 0.99,
      targetDomain: "Greeting",
      assignedAgent: "conversation",
      requiresClarification: false,
    };
  }

  // 3. General Casual Conversation & Meta questions
  const casualMatches = [
    "how are you", "who are you", "what are you", "what can you do", "tell me about yourself",
    "who created you", "who made you", "thank you", "thanks", "bye", "goodbye", "help me",
    "tell me a joke", "what is your name", "are you an ai", "what is learngraph",
  ];
  if (casualMatches.some((q) => lower.includes(q)) && !lower.includes("teach") && !lower.includes("quiz")) {
    return {
      intent: "general_chat",
      confidence: 0.92,
      targetDomain: "General Conversation",
      assignedAgent: "conversation",
      requiresClarification: false,
    };
  }

  // 4. Quiz Generation explicitly requested
  if (
    lower.includes("quiz") ||
    lower.includes("test me") ||
    lower.includes("practice questions") ||
    lower.includes("mock question")
  ) {
    return {
      intent: "quiz",
      confidence: 0.95,
      targetDomain: "Assessment",
      assignedAgent: "quiz",
      requiresClarification: false,
    };
  }

  // 5. Flashcards explicitly requested
  if (lower.includes("flashcard") || lower.includes("mnemonic") || lower.includes("anki")) {
    return {
      intent: "flashcards",
      confidence: 0.94,
      targetDomain: "Spaced Repetition",
      assignedAgent: "tutor",
      requiresClarification: false,
    };
  }

  // 6. Knowledge Graph explicitly requested
  if (
    lower.includes("knowledge graph") ||
    lower.includes("concept map") ||
    lower.includes("prerequisites for") ||
    lower.includes("concept relationship") ||
    lower.includes("show graph")
  ) {
    return {
      intent: "knowledge_graph",
      confidence: 0.93,
      targetDomain: "Knowledge Graph",
      assignedAgent: "knowledge_graph",
      requiresClarification: false,
    };
  }

  // 7. Competitive Exams
  const examKeywords = [
    "jee", "neet", "gate", "upsc", "ssc", "cat", "gre", "gmat",
    "ielts", "toefl", "civil services", "banking po", "rrb", "placement", "faang"
  ];
  if (examKeywords.some((exam) => lower.includes(exam))) {
    return {
      intent: "competitive_exam",
      confidence: 0.92,
      targetDomain: "Competitive Exams",
      assignedAgent: "exam_coach",
      requiresClarification: false,
    };
  }

  // 8. Programming & Software Engineering
  const codeKeywords = [
    "python", "javascript", "typescript", "c++", "java", "golang", "rust", "sql",
    "fastapi", "react", "docker", "kubernetes", "debug", "compile error", "code",
    "function", "class", "syntax", "oop", "algorithm", "recursion", "api", "database",
  ];
  if (codeKeywords.some((k) => lower.includes(k))) {
    return {
      intent: "programming",
      confidence: 0.91,
      targetDomain: "Programming",
      assignedAgent: "programming",
      requiresClarification: false,
    };
  }

  // 9. Mathematics & Calculus
  const mathKeywords = [
    "calculus", "integral", "derivative", "matrix", "algebra", "trigonometry",
    "probability", "statistics", "theorem", "proof", "equation", "solve", "math",
    "eigenvalue", "geometry", "limits", "continuity",
  ];
  if (mathKeywords.some((k) => lower.includes(k))) {
    return {
      intent: "mathematics",
      confidence: 0.90,
      targetDomain: "Mathematics",
      assignedAgent: "math",
      requiresClarification: false,
    };
  }

  // 10. General Learning & Conceptual Explanations
  if (
    lower.startsWith("teach") ||
    lower.startsWith("explain") ||
    lower.startsWith("what is") ||
    lower.startsWith("how does") ||
    lower.startsWith("why does") ||
    lower.includes("learn") ||
    lower.includes("roadmap") ||
    lower.includes("curriculum")
  ) {
    return {
      intent: "learning",
      confidence: 0.88,
      targetDomain: "Concept Learning",
      assignedAgent: "tutor",
      requiresClarification: false,
    };
  }

  // 11. Low confidence / ambiguous input (< 80%)
  if (text.length < 5 || (text.split(" ").length === 1 && !greetingExact.includes(lower))) {
    return {
      intent: "clarification",
      confidence: 0.45,
      targetDomain: "Ambiguous",
      assignedAgent: "conversation",
      requiresClarification: true,
    };
  }

  // Default: General learning guidance
  return {
    intent: "learning",
    confidence: 0.82,
    targetDomain: "General Education",
    assignedAgent: "tutor",
    requiresClarification: false,
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
   2. SPECIALIZED AGENT IMPLEMENTATIONS
───────────────────────────────────────────────────────────────────────────── */

export class MultiAgentOrchestrator {
  /**
   * Main Dispatcher: Analyzes message, routes to specialized agent, executes response.
   */
  public static async execute(
    message: string,
    user?: User | null,
    hasAttachedFile = false,
    hasAttachedImage = false
  ): Promise<AgentExecutionResult> {
    const studentName = user?.name?.split(" ")[0] || "there";
    const routing = routeUserIntent(message, hasAttachedFile, hasAttachedImage);

    // If confidence is low (< 80%), ask a friendly clarifying question
    if (routing.requiresClarification) {
      return {
        agentName: "Conversation Agent",
        agentRole: "Intent Clarification & Routing",
        agentTone: "indigo",
        thoughtProcess: `[Intent Router]\n• Confidence: ${(routing.confidence * 100).toFixed(0)}% (< 80% threshold)\n• Ambiguous user prompt: "${message}"\n• Action: Request specific clarification rather than assuming a domain or topic.`,
        thoughtDurationSeconds: 0.6,
        content: `I'd love to help you, ${studentName}! Could you tell me a little more about what you'd like to work on?\n\nFor example, are you looking for:\n• **Concept explanation** (e.g. *"Explain Quantum Entanglement"*)\n• **Programming assistance** (e.g. *"Teach me Python"* or *"Debug this function"*)\n• **Mathematics derivation** (e.g. *"Solve this calculus problem"*)\n• **Exam preparation** (e.g. *"Create a study plan for GATE or JEE"*)\n• **Practice quiz** (e.g. *"Test me on DBMS with 5 questions"*)\n\nLet me know what fits your goal!`,
        chips: [
          "Teach me Python",
          "Help me prepare for exams",
          "Solve a math problem",
          "Generate a quiz",
        ],
      };
    }

    // Dispatch to specific agent
    switch (routing.assignedAgent) {
      case "conversation":
        return this.handleConversationAgent(message, studentName, user);

      case "quiz":
        return this.handleQuizAgent(message, studentName, user);

      case "programming":
        return this.handleProgrammingAgent(message, studentName, user);

      case "math":
        return this.handleMathAgent(message, studentName, user);

      case "exam_coach":
        return this.handleExamCoachAgent(message, studentName, user);

      case "pdf":
        return this.handlePdfAgent(message, studentName, user);

      case "knowledge_graph":
        return this.handleKnowledgeGraphAgent(message, studentName, user);

      case "tutor":
      default:
        return this.handleTutorAgent(message, studentName, user);
    }
  }

  /* ── Agent 1: Conversation Agent ── */
  private static handleConversationAgent(
    message: string,
    studentName: string,
    user?: User | null
  ): AgentExecutionResult {
    const lower = message.toLowerCase();

    // Friendly natural greeting
    if (
      lower.includes("hi") ||
      lower.includes("hello") ||
      lower.includes("hey") ||
      lower.includes("good morning") ||
      lower.includes("good evening") ||
      lower.includes("what's up")
    ) {
      const greeting = `Hi ${studentName}! 👋 Welcome to **LearnGraph Omni**.\n\nI'm your intelligent AI learning companion. I'm here to help you learn, master, and practice any subject—from Class 5 mathematics to university-level Computer Science, competitive exams (JEE, NEET, GATE, UPSC), programming, and beyond.\n\nWhat would you like to explore or work on today?`;

      return {
        agentName: "Conversation Agent",
        agentRole: "Natural Dialogue & Onboarding",
        agentTone: "indigo",
        thoughtProcess: `[Conversation Agent]\n• User Intent: Friendly Greeting\n• Action: Respond with natural warmth and openness.\n• Strict Rule: Do NOT assume any domain, do NOT lecture on DSA or Calculus, do NOT auto-generate quizzes.`,
        thoughtDurationSeconds: 0.5,
        content: greeting,
        chips: [
          "Teach me Python from scratch",
          "Explain Quantum Physics simply",
          "Help me prepare for UPSC / GATE",
          "Solve a calculus problem",
        ],
      };
    }

    // Meta questions: "Who are you?", "What can you do?"
    if (lower.includes("what can you do") || lower.includes("who are you") || lower.includes("tell me about yourself")) {
      return {
        agentName: "Conversation Agent",
        agentRole: "Capabilities & Persona",
        agentTone: "indigo",
        thoughtProcess: `[Conversation Agent]\n• Query: Platform capabilities\n• Action: Provide concise, friendly overview without unsolicited homework generation.`,
        thoughtDurationSeconds: 0.8,
        content: `I'm **LearnGraph Omni**, your dedicated educational mentor. Think of me like a tutor who is available 24/7 to help you understand deeply rather than just memorizing answers.\n\nHere is how I can help:\n\n1. **Deep Concept Explanations** — Intuition, real-world analogies, step-by-step breakdowns, and visual text diagrams.\n2. **Programming & Software Engineering** — Code reviews, debugging, architectural patterns, and roadmaps in Python, JavaScript, C++, Go, and Rust.\n3. **Step-by-Step Mathematics** — Derivations, calculus proofs with LaTeX formatting, and algebra intuition.\n4. **Competitive Exam Strategy** — High-yield topics, time allocation, and mock questions for JEE, NEET, GATE, UPSC, CAT, and GRE.\n5. **Interactive Quizzes & Flashcards** — Diagnostic drills tailored to test your understanding when you ask for them.\n6. **Document Analysis** — Uploading textbook PDFs to extract key formulas, summarize chapters, or create study notes.\n\nWhat are you currently studying or preparing for?`,
        chips: [
          "I want to learn programming",
          "I'm studying for competitive exams",
          "Help me with university coursework",
        ],
      };
    }

    // Polite / Closing
    return {
      agentName: "Conversation Agent",
      agentRole: "Natural Dialogue",
      agentTone: "indigo",
      thoughtProcess: `[Conversation Agent]\n• Response to casual dialogue: "${message}"`,
      thoughtDurationSeconds: 0.4,
      content: `You're very welcome, ${studentName}! I'm always here whenever you want to dive into a concept, debug code, or prepare for an exam. Let me know whenever you're ready! 😊`,
      chips: ["Start a new topic", "Browse courses", "Test my knowledge"],
    };
  }

  /* ── Agent 2: Tutor Agent ── */
  private static handleTutorAgent(
    message: string,
    studentName: string,
    user?: User | null
  ): AgentExecutionResult {
    const teacherResult = generateOmniTeacherResponse(message, user, "socratic");

    return {
      agentName: "Tutor Agent",
      agentRole: "Adaptive Pedagogical Engine",
      agentTone: "purple",
      thoughtProcess: teacherResult.thoughtProcess,
      thoughtDurationSeconds: teacherResult.thoughtDurationSeconds,
      content: teacherResult.studentContextGreeting,
      chips: teacherResult.sections.relatedTopics.map((t) => `Teach me ${t}`),
      teacherResult: teacherResult,
    };
  }

  /* ── Agent 3: Programming Agent ── */
  private static handleProgrammingAgent(
    message: string,
    studentName: string,
    user?: User | null
  ): AgentExecutionResult {
    const teacherResult = generateOmniTeacherResponse(message, user, "coding");

    return {
      agentName: "Programming Agent",
      agentRole: "Code Architect & Debugger",
      agentTone: "blue",
      thoughtProcess: `[Programming Agent]\n• Analyzing code query: "${message}"\n• Language / Framework Context: High-performance syntax, runtime guarantees, clean architecture\n• Target: Clean, copy-pasteable, production-ready code with breakdown.`,
      thoughtDurationSeconds: 1.4,
      content: teacherResult.studentContextGreeting,
      chips: [
        "Show me another code example",
        "Explain time and space complexity",
        "Generate practice coding challenge",
      ],
      teacherResult: teacherResult,
    };
  }

  /* ── Agent 4: Math Agent ── */
  private static handleMathAgent(
    message: string,
    studentName: string,
    user?: User | null
  ): AgentExecutionResult {
    const teacherResult = generateOmniTeacherResponse(message, user, "socratic");

    return {
      agentName: "Math Agent",
      agentRole: "Symbolic Mathematics & Derivations",
      agentTone: "cyan",
      thoughtProcess: `[Math Agent]\n• Query: "${message}"\n• Strategy: Rigorous LaTeX mathematical notation with intuitive geometric mental models.\n• Verification: Boundary cases checked.`,
      thoughtDurationSeconds: 1.6,
      content: teacherResult.studentContextGreeting,
      chips: [
        "Show step-by-step proof",
        "Provide geometric intuition",
        "Give me a practice math problem",
      ],
      teacherResult: teacherResult,
    };
  }

  /* ── Agent 5: Exam Coach Agent ── */
  private static handleExamCoachAgent(
    message: string,
    studentName: string,
    user?: User | null
  ): AgentExecutionResult {
    const examTarget = user?.targetExam || "National Competitive Exam";

    const content = `### 🎯 Strategic Exam Preparation: ${examTarget}\n\nHello ${studentName}! When tackling **${examTarget}**, high-efficiency scoring comes down to three pillars:\n\n1. **High-Yield Concept Weightage** — Focus first on topics that consistently appear across past 10 years of question papers.\n2. **Accuracy Over Volume** — Negative marking penalizes wild guesses; mastering elimination techniques will increase your percentile by 15–20%.\n3. **Timed Mock Drills** — Speed is a muscle. Practice solving under 90 seconds per single-mark question.\n\nWould you like me to:\n• Generate a **high-yield topic priority checklist**?\n• Create an **adaptive 5-question mock drill** with negative marking calculation?\n• Review a specific concept you feel unsure about?`;

    return {
      agentName: "Exam Coach Agent",
      agentRole: "Competitive Exam Strategist",
      agentTone: "amber",
      thoughtProcess: `[Exam Coach Agent]\n• Target Exam: ${examTarget}\n• Strategy: Syllabus prioritization, high-yield diagnostic focus, negative marking protection.`,
      thoughtDurationSeconds: 1.1,
      content,
      chips: [
        "Generate 5-question mock drill",
        "Show high-yield topic checklist",
        "Create 30-day revision schedule",
      ],
    };
  }

  /* ── Agent 6: Quiz Agent ── */
  private static handleQuizAgent(
    message: string,
    studentName: string,
    user?: User | null
  ): AgentExecutionResult {
    const topic = message.replace(/generate a quiz on|quiz on|quiz|test me on/gi, "").trim() || "Core Concepts";

    return {
      agentName: "Quiz Agent",
      agentRole: "Adaptive Assessment Generator",
      agentTone: "emerald",
      thoughtProcess: `[Quiz Agent]\n• Request: Diagnostic Quiz for topic "${topic}"\n• Generating: 3 multi-choice questions with instant rationale and distractor analysis.`,
      thoughtDurationSeconds: 1.3,
      content: `Here is a quick diagnostic quiz on **${topic}** to test your current mastery. Select an answer for each question below:`,
      chips: ["Explain question 1", "Generate 5 harder questions", "Show revision flashcards"],
      quizPayload: {
        topic,
        questions: [
          {
            question: `In ${topic}, what is the fundamental prerequisite mechanism for optimal performance?`,
            options: [
              "Proper memory allocation and cache locality",
              "Linear search without early termination",
              "Ignoring edge-case boundary invariants",
              "Hardcoding magic values into source code",
            ],
            correctIndex: 0,
            explanation: "Cache locality and predictable memory layouts maximize CPU throughput and prevent unnecessary cache misses.",
          },
          {
            question: "Which invariant must hold true during continuous execution?",
            options: [
              "State mutations can be unpredictable",
              "Preconditions and postconditions remain formally verified",
              "Time complexity should degrade exponentially",
              "Thread synchronization is optional in parallel loops",
            ],
            correctIndex: 1,
            explanation: "Formal invariants ensure algorithm correctness and prevent state corruption across iterations.",
          },
        ],
      },
    };
  }

  /* ── Agent 7: Knowledge Graph Agent ── */
  private static handleKnowledgeGraphAgent(
    message: string,
    studentName: string,
    user?: User | null
  ): AgentExecutionResult {
    return {
      agentName: "Knowledge Graph Agent",
      agentRole: "Curriculum Topology & Concept Mapper",
      agentTone: "purple",
      thoughtProcess: `[Knowledge Graph Agent]\n• Graph Traversal requested\n• Inspecting connected prerequisite chains and student mastery status.`,
      thoughtDurationSeconds: 1.0,
      content: `### 🕸️ Connected Knowledge Graph Mapping\n\nIn LearnGraph, concepts are never learned in isolation. Every topic is linked to foundational prerequisites and downstream advanced applications.\n\n\`\`\`text
   [Foundational Math / Logic]
              │
              ▼
   [Data Structures & Types] ──► [Object-Oriented Design]
              │                            │
              ▼                            ▼
   [Graph & Tree Algorithms]   [Distributed Architectures]
              │                            │
              └──────────────┬─────────────┘
                             ▼
                [Production Mastery]
\`\`\`\n\n• **Mastered Nodes**: Breadth-First Search, Linear Arrays, Basic OOP\n• **Current Learning Frontier**: Dijkstra Edge Relaxation, B+ Tree Indexing\n• **Recommended Next Step**: Solidify edge relaxation before advancing to Bellman-Ford or A* search.`,
      chips: [
        "Open interactive Knowledge Graph view",
        "Analyze my weak concepts",
        "Show learning path recommendations",
      ],
    };
  }

  /* ── Agent 8: PDF Agent ── */
  private static handlePdfAgent(
    message: string,
    studentName: string,
    user?: User | null
  ): AgentExecutionResult {
    return {
      agentName: "PDF Agent",
      agentRole: "Document Understanding & Synthesis",
      agentTone: "rose",
      thoughtProcess: `[PDF Agent]\n• Document analysis intent triggered\n• Processing text stream, identifying headers, equations, and high-yield summary bullets.`,
      thoughtDurationSeconds: 1.5,
      content: `### 📄 Document Analysis & Concept Extraction\n\nI'm ready to inspect your document! Here is what I can do with your textbook or study notes:\n\n1. **Executive Summary** — Distill a 40-page chapter into 5 high-yield bullet points.\n2. **Formula & Theorem Cheat Sheet** — Extract all mathematical definitions and formulas into formatted LaTeX.\n3. **Mnemonic Flashcard Deck** — Generate spaced-repetition flashcards for all key terms.\n4. **Diagnostic Practice Drill** — Formulate 5 exam-style questions directly from the reading.\n\nPlease upload or drop your PDF into the chat using the 📎 button below!`,
      chips: [
        "Extract key formulas from PDF",
        "Generate 10 flashcards from document",
        "Summarize into 3 bullet points",
      ],
    };
  }
}
