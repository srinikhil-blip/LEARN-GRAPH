import type { ChatMessage, TutorContext } from "@/types/tutor";

export const MOCK_TUTOR_CONTEXT: TutorContext = {
  activeConcept: "Limits & Continuity",
  conceptProgress: 46,
  relatedConcepts: [
    { name: "Functions", status: "mastered", masteryText: "86%" },
    { name: "Continuity", status: "learning", masteryText: "62%" },
    { name: "Derivatives", status: "upcoming", masteryText: "—" },
  ],
  recentTopics: [
    "Limits, explained visually",
    "Help with chain rule",
    "Quiz me on vectors",
    "Summarize lecture notes",
  ],
  monthTopics: ["Python recursion example", "Organic chemistry review"],
};

export const MOCK_INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "msg-1",
    sender: "ai",
    timestamp: "TODAY, 10:42 AM",
    content:
      "Hi Alex — I noticed you’ve been working on **Limits**. Want to explore why they matter, see a visual example, or jump into practice?",
    chips: ["Explain visually", "Use a real-world analogy", "Quiz me"],
  },
  {
    id: "msg-2",
    sender: "user",
    timestamp: "10:43 AM",
    content: "Explain limits visually, and connect them to what I already know about functions.",
  },
  {
    id: "msg-3",
    sender: "ai",
    timestamp: "10:44 AM",
    content:
      "Think of a function as a trail on a map. A **limit** asks: “Where is the trail heading?” — even if there’s a tiny gap in the path.",
    richMedia: {
      type: "visual-math",
      title: "Approaching L",
      sourceChapter: "Calculus II · Chapter 2",
      connectedConcept: {
        name: "Functions",
        mastery: 86,
      },
    },
  },
];
