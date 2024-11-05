// types.ts
export interface ChatMessage {
    timestamp: string;
    user_message: string;
    bot_response: string;
  }
  
export interface ChatHistoryMessage {
  user_message: string;
  bot_response: string;
  timestamp: string;
}


export interface Message {
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  isStreaming?: boolean;
  references?: string[];
}

export interface ChatHistoryItem {
  created_at: number;
  id: string;
  session_id: string;
  chat_history: Array<{
    role: string;
    content: {
      length: number;
      substring(arg0: number, arg1: number): unknown; timestamp: string; user_message: string; bot_response: string; references?: string[]; 
} | undefined;
    timestamp: string;
    user_message: string;
    bot_response: string;
    references?: string[];
  }>;
  last_interaction_time: string;
  start_time: string;
  user_id: string;
}

export interface ChatSession {
  user_id: string;
  session_id: string | null;
}

export interface ApiResponse {
  response?: string;
  references?: string[];
  chunks?: Array<{
    type: 'content' | 'references' | 'error' | 'done';
    content: string;
    references?: string[];
  }>;
  session_id?: string;
  error?: string;
}