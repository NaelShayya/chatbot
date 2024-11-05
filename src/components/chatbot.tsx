import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import Header from "./Header";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import HistorySidebar from "./HistorySidebar";
import { Message, ChatHistoryItem, ChatSession } from "../types";

// Styled Components
const ChatbotContainer = styled.div`
  width: 400px;
  height: 600px;
  background: #0d1b2a;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.6);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
`;

const ErrorMessage = styled.div`
  background-color: #ff4444;
  color: white;
  padding: 8px 16px;
  text-align: center;
  font-size: 14px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
`;

const RetryButton = styled.button`
  background: #e76f51;
  color: white;
  border: none;
  padding: 4px 8px;
  margin-left: 8px;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: #f4845f;
  }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(13, 27, 42, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [sessionState, setSessionState] = useState<ChatSession>({
    user_id: "Nor3",
    session_id: null,
  });
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState({
    messages: false,
    history: false,
  });

  const retryCountRef = useRef(0);
  const maxRetries = 3;
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const savedSession = localStorage.getItem("chatSession");
    if (savedSession) {
      const session = JSON.parse(savedSession);
      setSessionState(session);
      if (session.session_id) {
        loadChatHistory(session.session_id);
      }
    } else {
      setMessages([
        {
          sender: "bot",
          text: "Hello! How can I assist you today?",
          timestamp: new Date().toISOString(),
        },
      ]);
    }

    fetchChatHistory();
  }, []);

  useEffect(() => {
    localStorage.setItem("chatSession", JSON.stringify(sessionState));
  }, [sessionState]);

  const handleError = (error: unknown) => {
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";
    setError(errorMessage);

    if (retryCountRef.current < maxRetries) {
      retryConnection();
    } else {
      updateLastBotMessage(`Error: ${errorMessage}`, undefined, false);
    }
  };

  const retryConnection = async () => {
    retryCountRef.current += 1;
    setError(`Retrying... Attempt ${retryCountRef.current}/${maxRetries}`);
    await sendMessage();
  };

  const startNewChat = () => {
    setSessionState((prev) => ({ ...prev, session_id: null }));
    setMessages([
      {
        sender: "bot",
        text: "Hello! How can I assist you today?",
        timestamp: new Date().toISOString(),
      },
    ]);
    setIsHistoryOpen(false);
  };

  const selectChat = (chatId: string) => {
    setSessionState((prev) => ({ ...prev, session_id: chatId }));
    loadChatHistory(chatId);
    setIsHistoryOpen(false);
  };

  const fetchChatHistory = async () => {
    setIsLoading((prev) => ({ ...prev, history: true }));
    try {
      const response = await fetch("https://testingcosmo.azurewebsites.net/api/getchathistory?code=mrDPB-FxGIBwtjrWFaBYQ4JPppMvWQOu9M55kQziL7QkAzFuj0SKRw%3D%3D", {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch chat history");

      const data = await response.json();
      if (data.status === "success" && Array.isArray(data.histories)) {
        setChatHistory(data.histories);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
      setError("Failed to fetch chat history");
    } finally {
      setIsLoading((prev) => ({ ...prev, history: false }));
    }
  };
  const loadChatHistory = async (chatId: string) => {
    setIsLoading((prev) => ({ ...prev, messages: true }));
    try {
      const response = await fetch(
        "https://testingcosmo.azurewebsites.net/api/getchathistorybysession?code=9KKoOEcXXBxrpnnl-aow541qUQlV3z_BDYKhAtvz9VjCAzFu3lEdwA%3D%3D",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ session_id: chatId }),
        }
      );
  
      if (!response.ok) throw new Error("Failed to load chat history");
  
      const data = await response.json();
  
      // Map data to Message format expected by MessageList
      const chatMessages: Message[] = data.map((msg: any) => ({
        sender: msg.role === "assistant" ? "bot" : "user",
        text: msg.content || "No content available",
        timestamp: msg.timestamp || new Date().toISOString(),
      }));
      setMessages(chatMessages);
    } catch (error) {
      console.error("Error loading chat history:", error);
      setError("Failed to load chat messages");
    } finally {
      setIsLoading((prev) => ({ ...prev, messages: false }));
    }
  };
  

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return;

    // Define userMessage with specific types
    const userMessage: Message = {
        sender: "user", // Explicitly set as "user" type
        text: input,
        timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Define botMessage as a placeholder for streaming
    const botMessage: Message = {
        sender: "bot", // Explicitly set as "bot" type
        text: "",
        timestamp: new Date().toISOString(),
        isStreaming: true,
    };

    setMessages((prev) => [...prev, botMessage]);
    setIsStreaming(true);
    setError(null);

    try {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }

        const response = await fetch("https://testingcosmo.azurewebsites.net/api/chatbot?code=EdE_vOOJRtEbYF0z480lahH-VWqhDCCv_FyINJ0HEpWgAzFurPIdQg%3D%3D", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user_id: sessionState.user_id,
                message: input,
                session_id: sessionState.session_id,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error("Response body is not readable");
        }

        let accumulatedText = "";
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const messages = chunk
                .split("\n\n")
                .filter((msg) => msg.trim())
                .map((msg) => msg.replace(/^data: /, ""));

            for (const msg of messages) {
                try {
                    const data = JSON.parse(msg);

                    switch (data.type) {
                        case "info":
                            if (data.session_id) {
                                setSessionState((prev) => ({
                                    ...prev,
                                    session_id: data.session_id,
                                }));
                            }
                            break;

                        case "chunk":
                            accumulatedText += data.content;
                            updateLastBotMessage(accumulatedText, data.references, true);
                            break;

                        case "error":
                            throw new Error(data.content);

                        case "done":
                            setIsStreaming(false);
                            updateLastBotMessage(accumulatedText, undefined, false);
                            break;
                    }
                } catch (e) {
                    console.error("Error parsing SSE message:", e);
                }
            }
        }
    } catch (error) {
        handleError(error);
    } finally {
        setIsStreaming(false);
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }
    }
};


  const updateLastBotMessage = (
    text: string,
    references?: string[],
    isStreaming: boolean = true
  ) => {
    setMessages((prev) => {
      const newMessages = [...prev];
      const lastMessage = newMessages[newMessages.length - 1];
      if (lastMessage && lastMessage.sender === "bot") {
        lastMessage.text = text;
        lastMessage.references = references;
        lastMessage.isStreaming = isStreaming;
      }
      return newMessages;
    });
  };

  return (
    <ChatbotContainer>
      {error && (
        <ErrorMessage>
          {error}
          {retryCountRef.current < maxRetries && (
            <RetryButton onClick={() => sendMessage()}>Retry</RetryButton>
          )}
        </ErrorMessage>
      )}

      {(isLoading.messages || isLoading.history) && (
        <LoadingOverlay>Loading...</LoadingOverlay>
      )}

      <Header
        onToggleHistory={() => setIsHistoryOpen(!isHistoryOpen)}
        onNewChat={startNewChat}
      />

      <MessageList messages={messages} />

      <MessageInput
        input={input}
        setInput={setInput}
        sendMessage={sendMessage}
        disabled={isStreaming}
      />

      {isHistoryOpen && (
        <HistorySidebar
          chatHistory={chatHistory}
          onClose={() => setIsHistoryOpen(false)}
          onSelectChat={selectChat}
          selectedChatId={sessionState.session_id}
        />
      )}
    </ChatbotContainer>
  );
};

export default Chatbot;
