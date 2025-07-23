import React, { useState } from 'react';
import styled from 'styled-components';

interface ReviewFormProps {
  onSubmit: (rating: number, content: string) => void;
  onCancel: () => void;
  initialRating?: number;
  initialContent?: string;
  isEditMode?: boolean;
}

const StarRatingInput = ({ rating, setRating }: { rating: number; setRating: (r: number) => void }) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <StarContainer>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          $selected={star <= (hoverRating || rating)}
          onClick={() => setRating(star)}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
        >
          ★
        </Star>
      ))}
      <RatingText>{rating ? `${rating}점` : '별점을 선택하세요'}</RatingText>
    </StarContainer>
  );
};

const ReviewForm = ({ onSubmit, onCancel, initialRating = 0, initialContent = '', isEditMode = false }: ReviewFormProps) => {
  const [rating, setRating] = useState(initialRating);
  const [content, setContent] = useState(initialContent);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert('별점을 선택해주세요.');
      return;
    }
    if (!content.trim()) {
      alert('리뷰 내용을 입력해주세요.');
      return;
    }
    onSubmit(rating, content);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Title>{isEditMode ? '리뷰 수정' : '리뷰 작성'}</Title>
      <Label>별점</Label>
      <StarRatingInput rating={rating} setRating={setRating} />
      <Label>리뷰 내용</Label>
      <ContentTextarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="이 책에 대한 생각을 자유롭게 작성해주세요."
        rows={5}
        required
      />
      <ButtonContainer>
        <SubmitButton type="submit">{isEditMode ? '수정 완료' : '작성 완료'}</SubmitButton>
        <CancelButton type="button" onClick={onCancel}>
          취소
        </CancelButton>
      </ButtonContainer>
    </Form>
  );
};

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  min-width: 300px;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  text-align: center;
`;

const Label = styled.label`
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const StarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-bottom: 1rem;
`;

const Star = styled.span<{ $selected: boolean }>`
  font-size: 2rem;
  color: ${({ $selected }) => ($selected ? '#f0c040' : '#ddd')};
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: #f0c040;
  }
`;

const RatingText = styled.span`
  margin-left: 1rem;
  color: #666;
`;

const ContentTextarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #666;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
`;

const SubmitButton = styled(Button)`
  background-color: #333;
  color: white;

  &:hover {
    background-color: #444;
  }
`;

const CancelButton = styled(Button)`
  background-color: #eee;
  color: #333;

  &:hover {
    background-color: #ddd;
  }
`;

export default ReviewForm; 