import React from 'react';
import styled from 'styled-components';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  onCancel,
  isDestructive = false
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <Overlay onClick={handleOverlayClick}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>{title}</Title>
        </Header>
        
        <Content>
          <Message>{message}</Message>
        </Content>
        
        <Footer>
          <CancelButton onClick={onCancel}>
            {cancelText}
          </CancelButton>
          <ConfirmButton $isDestructive={isDestructive} onClick={onConfirm}>
            {confirmText}
          </ConfirmButton>
        </Footer>
      </ModalContainer>
    </Overlay>
  );
};

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  max-width: 400px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
`;

const Header = styled.div`
  padding: 1.5rem 2rem 1rem;
  border-bottom: 1px solid #e2e8f0;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: #2d3748;
`;

const Content = styled.div`
  padding: 1.5rem 2rem;
`;

const Message = styled.p`
  margin: 0;
  color: #4a5568;
  line-height: 1.6;
  white-space: pre-line;
`;

const Footer = styled.div`
  padding: 1rem 2rem 2rem;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s ease;
  min-width: 80px;
  
  &:hover {
    transform: translateY(-1px);
  }
`;

const CancelButton = styled(Button)`
  background: #f7fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
  
  &:hover {
    background: #edf2f7;
    border-color: #cbd5e0;
  }
`;

const ConfirmButton = styled(Button)<{ $isDestructive: boolean }>`
  background: ${({ $isDestructive }) => $isDestructive ? '#e53e3e' : '#667eea'};
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background: ${({ $isDestructive }) => $isDestructive ? '#c53030' : '#5a67d8'};
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

export default ConfirmModal; 