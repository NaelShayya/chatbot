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
  background-color: ${(props) => (props.sender === 'user' ? '#e76f51' : props.isStreaming ? '#2a3f5f' : '#3a506b')};
  color: #ffffff;
  padding: 10px 15px;
  border-radius: 15px;
  max-width: 70%;
  word-wrap: break-word;
  white-space: pre-wrap;
  animation: ${(props) => (props.isStreaming ? 'pulse 1.5s infinite' : 'none')};
  font-size: 0.9rem;
  line-height: 1.4;

  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.7; }
    100% { opacity: 1; }
  }
`;

const MessageText = styled.div`
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

const ReferencesList = styled.ul`
  margin-top: 8px;
  padding-left: 20px;
  font-size: 0.8rem;
  color: #9fc5e8;
  list-style-type: disc;
`;

const ReferenceItem = styled.li`
  margin-bottom: 4px;
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
    let { text, references } = message;

    // Format text to add spaces after punctuation if missing
    text = text.replace(/([.!?])([A-Za-z])/g, '$1 $2').replace(/([A-Za-z])([A-Z])/g, '$1 $2');

    // Check if references are embedded directly in the text
    const referenceSectionMatch = text.match(/References:\s(.*)$/);
    if (referenceSectionMatch) {
        const referenceSection = referenceSectionMatch[1];
        text = text.replace(/References:\s.*$/, "");

        // If references are embedded as numbered citations
        references = referenceSection.split(',').map(ref => ref.trim());
    }

    // Extract the full URL starting with https:// for each reference
    const cleanedReferences = references?.map(ref => {
        const urlMatch = ref.match(/https:\/\/[^\s]+/g);
        return urlMatch ? urlMatch[0] : ref; // Use only the matched URL or fall back to original if no match
    });

    // Convert numbered references in the text to clickable links
    const processedText = text.replace(
        /\[(\d+)\]/g,
        (match, num) => {
            const index = parseInt(num) - 1;
            if (cleanedReferences && cleanedReferences.length > index) {
                const url = cleanedReferences[index];
                return `<a href="${url}" target="_blank" rel="noopener noreferrer">[${num}]</a>`;
            }
            return match;
        }
    );

    return (
        <>
            <MessageText dangerouslySetInnerHTML={{ __html: processedText }} />
            {cleanedReferences && cleanedReferences.length > 0 && (
                <ReferencesList>
                    <strong>References:</strong>
                    {cleanedReferences.map((ref, refIndex) => (
                        <ReferenceItem key={refIndex}>
                            <a href={ref} target="_blank" rel="noopener noreferrer">
                                [{refIndex + 1}] {ref}
                            </a>
                        </ReferenceItem>
                    ))}
                </ReferencesList>
            )}
            <Timestamp>{new Date(message.timestamp).toLocaleTimeString()}</Timestamp>
        </>
    );
};


  return (
    <MessagesContainer>
      {messages.map((msg, index) => (
        <MessageBubble key={index} sender={msg.sender} isStreaming={msg.isStreaming}>
          {renderMessageContent(msg)}
        </MessageBubble>
      ))}
      <div ref={messagesEndRef} />
    </MessagesContainer>
  );
};

export default MessageList;
