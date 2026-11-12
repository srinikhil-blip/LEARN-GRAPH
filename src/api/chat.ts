import { apiClient, apiWithFallback, simulateDelay } from "./client";
import { API_CONFIG } from "@/config/api.config";
import type { ChatMessage, TutorContext } from "@/types/tutor";
import { MOCK_INITIAL_MESSAGES, MOCK_TUTOR_CONTEXT } from "@/mock/tutor.mock";

export const chatApi = {
  getChatHistory: async (): Promise<ChatMessage[]> => {
    return apiWithFallback<ChatMessage[]>(
      async () => {
        const res = await apiClient.get(API_CONFIG.endpoints.tutor.history);
        if (Array.isArray(res.data) && res.data.length > 0) {
          return res.data.map((m: any) => ({
            id: m.id,
            sender: (m.role === "assistant" ? "ai" : "user") as "ai" | "user",
            timestamp: m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Just now",
            content: m.content,
          }));
        }
        return MOCK_INITIAL_MESSAGES;
      },
      async () => simulateDelay(MOCK_INITIAL_MESSAGES)
    );
  },

  getTutorContext: async (): Promise<TutorContext> => {
    return simulateDelay(MOCK_TUTOR_CONTEXT);
  },

  sendMessage: async (content: string): Promise<ChatMessage> => {
    return apiWithFallback<ChatMessage>(
      async () => {
        const res = await apiClient.post(API_CONFIG.endpoints.tutor.chat, { content });
        const chatMsg: ChatMessage = {
          id: res.data.id || `msg-${Date.now()}`,
          sender: "ai",
          timestamp: "Just now",
          content: res.data.content || res.data.response,
        };
        return chatMsg;
      },
      async () => {
        const responseMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          sender: "ai",
          timestamp: "Just now",
          content: `Great question about "${content}". Based on your graph, evaluating limits as inputs approach a value reveals how the function behaves locally. Would you like a practice step?`,
        };
        return simulateDelay(responseMessage, 300);
      }
    );
  },
};
