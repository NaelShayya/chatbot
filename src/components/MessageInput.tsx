// MessageInput.tsx
import React from 'react';
import styled from 'styled-components';

interface MessageInputProps {
  input: string;
  setInput: (input: string) => void;
  sendMessage: () => void;
  disabled?: boolean;  // Added disabled prop
}

const InputContainer = styled.div`
  padding: 16px;
  background: #1b2b3a;
  display: flex;
  gap: 8px;
`;

const StyledInput = styled.input<{ disabled?: boolean }>`
  flex-grow: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  background: #2d4356;
  color: #ffffff;
  font-size: 14px;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(231, 111, 81, 0.3);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    background: #243442;
  }
`;

const SendButton = styled.button<{ disabled?: boolean }>`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: #e76f51;
  color: #ffffff;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover:not(:disabled) {
    background: #f4845f;
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    background: #c25a40;
  }
`;

const MessageInput: React.FC<MessageInputProps> = ({ input, setInput, sendMessage, disabled }) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !disabled) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <InputContainer>
      <StyledInput
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type a message..."
        disabled={disabled}
      />
      <SendButton onClick={sendMessage} disabled={disabled || !input.trim()}>
        Send
      </SendButton>
    </InputContainer>
  );
};

export default MessageInput;
