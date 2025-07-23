import React, { useState } from 'react';
import styled from 'styled-components';
import { BookDetail } from '../types/book';
import { ReadingStatus } from '../services/userBookService';
import Modal from './Modal';

interface AddBookToLibraryModalProps {
  isOpen: boolean;
  book: BookDetail;
  onClose: () => void;
  onAddBook: (readingStatus: ReadingStatus) => void;
}

const AddBookToLibraryModal = ({ isOpen, book, onClose, onAddBook }: AddBookToLibraryModalProps) => {
  const [readingStatus, setReadingStatus] = useState<ReadingStatus>('WANT_TO_READ');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddBook(readingStatus);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Container>
        <Title>내 서재에 추가</Title>
        <BookTitle>{book.title}</BookTitle>

        <form onSubmit={handleSubmit}>
          <StatusSelect
            value={readingStatus}
            onChange={(e) => setReadingStatus(e.target.value as ReadingStatus)}
          >
            <option value="WANT_TO_READ">읽고 싶어요</option>
            <option value="READING">읽고 있어요</option>
            <option value="COMPLETED">다 읽었어요</option>
          </StatusSelect>
          <Button type="submit">추가하기</Button>
        </form>
      </Container>
    </Modal>
  );
};

export default AddBookToLibraryModal;

const Container = styled.div`
  padding: 1rem;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
`;

const BookTitle = styled.h3`
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  color: #555;
`;

const StatusSelect = styled.select`
  width: 100%;
  padding: 0.75rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  margin-bottom: 1rem;
`;

const Button = styled.button`
  width: 100%;
  padding: 0.75rem;
  border: none;
  background-color: #333;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    background-color: #555;
  }
`; 