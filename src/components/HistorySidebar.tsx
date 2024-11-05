import React from 'react';
import styled from 'styled-components';
import { formatDistanceToNow } from 'date-fns';
import { ChatHistoryItem } from '../types';

interface HistorySidebarProps {
  chatHistory: ChatHistoryItem[];
  onClose: () => void;
  onSelectChat: (chatId: string) => void;
  selectedChatId: string | null;
}

const SidebarContainer = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  width: 300px;
  height: 100%;
  background: #1b2b3a;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.2);
  padding: 1rem;
  overflow-y: auto;
  z-index: 100;
`;

const CloseButton = styled.button`
  position: absolute;
  right: 1rem;
  top: 1rem;
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  font-size: 1.2rem;
  &:hover {
    opacity: 0.8;
  }
`;

const ChatItem = styled.div<{ isSelected: boolean }>`
  background: ${props => props.isSelected ? '#3a4b5a' : '#2a3b4a'};
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: ${props => props.isSelected ? '2px solid #4a8eff' : 'none'};
  
  &:hover {
    background: #3a4b5a;
  }
`;

const ChatTitle = styled.h3`
  color: #fff;
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
`;

const ChatTime = styled.p`
  color: #8b9cab;
  margin: 0;
  font-size: 0.8rem;
`;

const HistorySidebar: React.FC<HistorySidebarProps> = ({ 
  chatHistory = [], 
  onClose, 
  onSelectChat,
  selectedChatId 
}) => {
  const getChatTitle = (chat: ChatHistoryItem): string => {
    if (chat?.chat_history?.[0]?.user_message) {
      const firstMessage = chat.chat_history[0].user_message;
      return firstMessage.length > 50 
        ? firstMessage.substring(0, 50) + '...'
        : firstMessage;
    }
    return 'New Chat';
  };

  const formatTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Recent';
      }
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Recent';
    }
  };

  // Sort history by last_interaction_time
  const sortedHistory = Array.isArray(chatHistory) 
    ? [...chatHistory].sort((a, b) => {
        try {
          const aTime = new Date(a.last_interaction_time || 0).getTime();
          const bTime = new Date(b.last_interaction_time || 0).getTime();
          return bTime - aTime;
        } catch (error) {
          return 0;
        }
      })
    : [];

  return (
    <SidebarContainer>
      <CloseButton onClick={onClose}>×</CloseButton>
      <h2 style={{ color: '#fff', marginBottom: '1.5rem' }}>Chat History</h2>
      {!Array.isArray(chatHistory) || sortedHistory.length === 0 ? (
        <p style={{ color: '#8b9cab' }}>No chat history available</p>
      ) : (
        sortedHistory.map((chat) => (
          <ChatItem 
            key={chat.session_id}
            isSelected={chat.session_id === selectedChatId}
            onClick={() => onSelectChat(chat.session_id)}
          >
            <ChatTitle>{getChatTitle(chat)}</ChatTitle>
            <ChatTime>
              Last active: {formatTime(chat.last_interaction_time)}
            </ChatTime>
            <ChatTime>
              Messages: {chat.chat_history?.length || 0}
            </ChatTime>
          </ChatItem>
        ))
      )}
    </SidebarContainer>
  );
};

export default HistorySidebar;