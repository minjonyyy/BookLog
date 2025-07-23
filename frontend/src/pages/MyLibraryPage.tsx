import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import userBookService, { UserBook, ReadingStatus } from '../services/userBookService';
import BookCard from '../components/BookCard';
import Modal from '../components/Modal';
import ReviewForm from '../components/ReviewForm';
import reviewService from '../services/reviewService';

const MyLibraryPage = () => {
  const [books, setBooks] = useState<UserBook[]>([]);
  const [activeTab, setActiveTab] = useState<ReadingStatus>('WANT_TO_READ');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedUserBook, setSelectedUserBook] = useState<UserBook | null>(null);
  const [selectedBooks, setSelectedBooks] = useState<Set<number>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setIsLoading(true);
        const userBooks = await userBookService.getMyLibrary();
        setBooks(userBooks);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch books:', err);
        setError('책 목록을 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const filteredBooks = books.filter(book => book.status === activeTab);

  const handleOpenReviewModal = (book: UserBook) => {
    setSelectedUserBook(book);
    setIsReviewModalOpen(true);
  };

  const handleCloseReviewModal = () => {
    setSelectedUserBook(null);
    setIsReviewModalOpen(false);
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedBooks(new Set());
  };

  const handleSelectBook = (bookId: number) => {
    const newSelected = new Set(selectedBooks);
    if (newSelected.has(bookId)) {
      newSelected.delete(bookId);
    } else {
      newSelected.add(bookId);
    }
    setSelectedBooks(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedBooks.size === filteredBooks.length) {
      setSelectedBooks(new Set());
    } else {
      setSelectedBooks(new Set(filteredBooks.map(book => book.id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedBooks.size === 0) {
      alert('삭제할 책을 선택해주세요.');
      return;
    }

    if (!window.confirm(`선택한 ${selectedBooks.size}권의 책을 서재에서 제거하시겠습니까?`)) {
      return;
    }

    try {
      setIsLoading(true);
      // 선택된 책들을 병렬로 삭제
      await Promise.all(
        Array.from(selectedBooks).map(bookId => 
          userBookService.deleteUserBook(bookId)
        )
      );
      
      alert(`${selectedBooks.size}권의 책이 서재에서 제거되었습니다.`);
      setSelectedBooks(new Set());
      setIsSelectionMode(false);
      
      // 책 목록 새로고침
      const updatedBooks = await userBookService.getMyLibrary();
      setBooks(updatedBooks);
    } catch (err) {
      console.error('Failed to delete selected books:', err);
      alert('일부 책 삭제에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartReading = async (userBook: UserBook) => {
    try {
      setIsLoading(true);
      await userBookService.updateUserBook(userBook.id, 'READING');
      alert('읽기를 시작했습니다!');
      // 책 목록 새로고침
      const updatedBooks = await userBookService.getMyLibrary();
      setBooks(updatedBooks);
    } catch (err) {
      console.error('Failed to start reading:', err);
      alert('상태 변경에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteReading = async (userBook: UserBook) => {
    if (!window.confirm('이 책을 다 읽음으로 표시하시겠습니까?')) {
      return;
    }
    try {
      setIsLoading(true);
      await userBookService.updateUserBook(userBook.id, 'COMPLETED');
      alert('책을 완료했습니다!');
      // 책 목록 새로고침
      const updatedBooks = await userBookService.getMyLibrary();
      setBooks(updatedBooks);
    } catch (err) {
      console.error('Failed to complete reading:', err);
      alert('상태 변경에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePage = async (userBook: UserBook, newPage: number) => {
    try {
      await userBookService.updateUserBook(userBook.id, undefined, newPage);
      // 책 목록 새로고침 (로딩 표시 없이)
      const updatedBooks = await userBookService.getMyLibrary();
      setBooks(updatedBooks);
    } catch (err) {
      console.error('Failed to update page:', err);
      alert('페이지 업데이트에 실패했습니다.');
    }
  };



  const handleReviewSubmit = async (rating: number, content: string) => {
    if (!selectedUserBook) return;
    try {
      await reviewService.createReview({
        googleBooksId: selectedUserBook.book.googleBooksId,
        rating,
        oneLineReview: content,
        detailedReview: '' // 상세 리뷰는 선택사항으로 처리
      });
      alert('리뷰가 성공적으로 등록되었습니다.');
      handleCloseReviewModal();
    } catch (err) {
      console.error('Failed to submit review:', err);
      alert('리뷰 등록에 실패했습니다.');
    }
  };

  if (isLoading) return <LoadingText>로딩 중...</LoadingText>;
  if (error) return <ErrorText>{error}</ErrorText>;

  return (
    <Container>
      <Title>내 서재</Title>
      <TabContainer>
        <TabButton 
          $active={activeTab === 'WANT_TO_READ'} 
          onClick={() => setActiveTab('WANT_TO_READ')}
        >
          읽고 싶어요
        </TabButton>
        <TabButton 
          $active={activeTab === 'READING'} 
          onClick={() => setActiveTab('READING')}
        >
          읽는 중
        </TabButton>
        <TabButton 
          $active={activeTab === 'COMPLETED'} 
          onClick={() => setActiveTab('COMPLETED')}
        >
          다 읽음
        </TabButton>
      </TabContainer>

      {/* 선택 관리 UI */}
      <SelectionControls>
        <SelectionToggle onClick={toggleSelectionMode}>
          {isSelectionMode ? '📋 선택 취소' : '🗑️ 책 삭제하기'}
        </SelectionToggle>
        
        {isSelectionMode && (
          <SelectionActions>
            <SelectAllButton onClick={handleSelectAll}>
              {selectedBooks.size === filteredBooks.length ? '✅ 전체 해제' : '☑️ 전체 선택'}
            </SelectAllButton>
            <SelectedCount>
              {selectedBooks.size}권 선택됨
            </SelectedCount>
            <DeleteSelectedButton 
              onClick={handleDeleteSelected}
              disabled={selectedBooks.size === 0}
            >
              🗑️ 선택된 책 삭제 ({selectedBooks.size})
            </DeleteSelectedButton>
          </SelectionActions>
        )}
      </SelectionControls>

      <ResultsGrid>
        {filteredBooks.length > 0 ? (
          filteredBooks.map((userBook) => (
            <BookCardWrapper key={userBook.id}>
              {/* 선택 체크박스 */}
              {isSelectionMode && (
                <SelectCheckbox>
                  <input
                    type="checkbox"
                    checked={selectedBooks.has(userBook.id)}
                    onChange={() => handleSelectBook(userBook.id)}
                  />
                </SelectCheckbox>
              )}
              
              <BookCard 
                book={{
                  id: userBook.book.id,
                  googleBooksId: userBook.book.googleBooksId,
                  title: userBook.book.title,
                  authors: userBook.book.authors.split(', '),
                  thumbnailUrl: userBook.book.thumbnailUrl || ''
                }} 
              />
              
              {/* 진행률 표시 (읽는 중인 책만) */}
              {userBook.status === 'READING' && (
                <ProgressContainer>
                  <ProgressText>
                    {userBook.currentPage}/{userBook.book.pageCount}페이지 ({userBook.progress.toFixed(1)}%)
                  </ProgressText>
                  <ProgressBar>
                    <ProgressFill $progress={userBook.progress} />
                  </ProgressBar>
                </ProgressContainer>
              )}

              {/* 상태별 액션 버튼들 (선택 모드가 아닐 때만) */}
              {!isSelectionMode && (
                <ActionButtonsContainer>
                  {userBook.status === 'WANT_TO_READ' && (
                    <ActionButton onClick={() => handleStartReading(userBook)}>
                      읽기 시작
                    </ActionButton>
                  )}
                  
                  {userBook.status === 'READING' && (
                    <>
                      <PageInputContainer>
                        <PageInput
                          type="number"
                          min="0"
                          max={userBook.book.pageCount}
                          defaultValue={userBook.currentPage}
                          onBlur={(e) => {
                            const newPage = parseInt(e.target.value);
                            if (newPage !== userBook.currentPage && newPage >= 0 && newPage <= userBook.book.pageCount) {
                              handleUpdatePage(userBook, newPage);
                            }
                          }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const newPage = parseInt(e.currentTarget.value);
                              if (newPage !== userBook.currentPage && newPage >= 0 && newPage <= userBook.book.pageCount) {
                                handleUpdatePage(userBook, newPage);
                              }
                            }
                          }}
                        />
                        <span>페이지</span>
                      </PageInputContainer>
                      <ActionButton onClick={() => handleCompleteReading(userBook)}>
                        다 읽음
                      </ActionButton>
                    </>
                  )}
                  
                  {userBook.status === 'COMPLETED' && (
                    <ReviewButton onClick={() => handleOpenReviewModal(userBook)}>
                      리뷰 작성
                    </ReviewButton>
                  )}
                </ActionButtonsContainer>
              )}
            </BookCardWrapper>
          ))
        ) : (
          <EmptyText>이 상태의 책이 아직 없습니다.</EmptyText>
        )}
      </ResultsGrid>

      {isReviewModalOpen && selectedUserBook && (
        <Modal isOpen={isReviewModalOpen} onClose={handleCloseReviewModal}>
          <ReviewForm
            onSubmit={handleReviewSubmit}
            onCancel={handleCloseReviewModal}
          />
        </Modal>
      )}
    </Container>
  );
};

const Container = styled.div`
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 2rem;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const TabButton = styled.button<{ $active: boolean }>`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background-color: ${({ $active }) => ($active ? '#333' : '#eee')};
  color: ${({ $active }) => ($active ? 'white' : '#333')};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ $active }) => ($active ? '#444' : '#ddd')};
  }
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 2rem;
`;

const BookCardWrapper = styled.div`
  position: relative;
`;

const SelectCheckbox = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1;
  
  input[type="checkbox"] {
    width: 20px;
    height: 20px;
    cursor: pointer;
    accent-color: #007bff;
  }
`;

const ReviewButton = styled.button`
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  padding: 0.5rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;

  ${BookCardWrapper}:hover & {
    opacity: 1;
  }
`;

const LoadingText = styled.p`
  text-align: center;
  font-size: 1.2rem;
  color: #666;
  margin-top: 2rem;
`;

const ErrorText = styled.p`
  text-align: center;
  color: #dc3545;
  margin-top: 2rem;
`;

const EmptyText = styled.p`
  text-align: center;
  color: #666;
  grid-column: 1 / -1;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
`;

const ProgressContainer = styled.div`
  margin-top: 0.5rem;
  padding: 0.5rem;
`;

const ProgressText = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.25rem;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $progress: number }>`
  height: 100%;
  background-color: #4caf50;
  width: ${({ $progress }) => Math.min($progress, 100)}%;
  transition: width 0.3s ease;
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;

  &:hover {
    background-color: #0056b3;
  }
`;

const PageInputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
`;

const PageInput = styled.input`
  width: 80px;
  padding: 0.25rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const SelectionControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.5rem 1rem;
  background-color: #f0f0f0;
  border-radius: 8px;
`;

const SelectionToggle = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: bold;

  &:hover {
    background-color: #0056b3;
  }
`;

const SelectionActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const SelectAllButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  background-color: #6c757d;
  color: white;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: bold;

  &:hover {
    background-color: #5a6268;
  }
`;

const SelectedCount = styled.span`
  font-size: 0.9rem;
  color: #333;
  font-weight: bold;
`;

const DeleteSelectedButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  background-color: #dc3545;
  color: white;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: bold;

  &:hover {
    background-color: #c82333;
  }

  &:disabled {
    background-color: #e0e0e0;
    color: #888;
    cursor: not-allowed;
  }
`;

export default MyLibraryPage; 