import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

interface Message {
  sender: 'user' | 'bot';
  text: string;
  references?: string[];
  isStreaming?: boolean;
  timestamp: string;
}

const MessagesContainer = styled.div`
  flex-grow: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const MessageBubble = styled.div<{ sender: 'user' | 'bot'; isStreaming?: boolean }>`
  align-self: ${(props) => (props.sender === 'user' ? 'flex-end' : 'flex-start')};
  background-color: ${(props) => {
    if (props.sender === 'user') return '#e76f51';
    return props.isStreaming ? '#2a3f5f' : '#3a506b';
  }};
  color: #ffffff;
  padding: 10px 15px;
  border-radius: 15px;
  max-width: 70%;
  word-wrap: break-word;
  animation: ${props => props.isStreaming ? 'pulse 1.5s infinite' : 'none'};

  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.7; }
    100% { opacity: 1; }
  }
`;

const MessageText = styled.div`
  white-space: pre-wrap;
  line-height: 1.5;

  a {
    color: #ffcc00;
    text-decoration: underline;

    &:hover {
      color: #ffd633;
    }
  }
`;

const Timestamp = styled.div`
  font-size: 0.75rem;
  color: #8b8b8b;
  margin-top: 4px;
`;

interface MessageListProps {
  messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const renderMessageContent = (message: Message) => {
    const { text, references } = message;
    
    // Remove the "References:" section if it exists
    const mainText = text.split('\nReferences:\n')[0];

    // Convert numbered references to clickable links inline
    const processedText = mainText.replace(
      /\[(\d+)\]/g,
      (match, num) => {
        if (references && references.length >= num) {
          const url = references[num - 1];
          if (url) {
            return `<a href="${url}" target="_blank" rel="noopener noreferrer">[${num}]</a>`;
          }
        }
        return match;
      }
    );

    return (
      <>
        <MessageText
          dangerouslySetInnerHTML={{
            __html: processedText,
          }}
        />
        <Timestamp>
          {new Date(message.timestamp).toLocaleTimeString()}
        </Timestamp>
      </>
    );
  };

  return (
    <MessagesContainer>
      {messages.map((msg, index) => (
        <MessageBubble 
          key={index} 
          sender={msg.sender}
          isStreaming={msg.isStreaming}
        >
          {renderMessageContent(msg)}
        </MessageBubble>
      ))}
      <div ref={messagesEndRef} />
    </MessagesContainer>
  );
};

export default MessageList;
