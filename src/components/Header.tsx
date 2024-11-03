import React from 'react';
import styled from 'styled-components';
import HistoryIcon from '@mui/icons-material/History';
import AddIcon from '@mui/icons-material/Add';

const HeaderContainer = styled.div`
  background-color: #243b55;  // Lighter shade of navy blue
  color: #ffffff;
  padding: 16px;
  font-size: 18px;
  text-align: center;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #ffffff;
  display: flex;
  align-items: center;
  padding: 4px;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
`;

interface HeaderProps {
  onToggleHistory: () => void;
  onNewChat: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleHistory, onNewChat }) => {
  return (
    <HeaderContainer>
      Chatbot
      <ButtonGroup>
        <IconButton onClick={onNewChat} title="New Chat">
          <AddIcon />
        </IconButton>
        <IconButton onClick={onToggleHistory} title="History">
          <HistoryIcon />
        </IconButton>
      </ButtonGroup>
    </HeaderContainer>
  );
};

export default Header;