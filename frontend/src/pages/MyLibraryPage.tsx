import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import userBookService, { UserBook, ReadingStatus } from '../services/userBookService';
import useAuthStore from '../store/authStore';
import BookCard from '../components/BookCard';
import Modal from '../components/Modal';
import ReviewForm from '../components/ReviewForm';
import ConfirmModal from '../components/ConfirmModal';
import reviewService from '../services/reviewService';
import { useDataRefresh } from '../store/DataRefreshContext';

const MyLibraryPage = () => {
  const [books, setBooks] = useState<UserBook[]>([]);
  const [activeTab, setActiveTab] = useState<ReadingStatus>('READING');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedUserBook, setSelectedUserBook] = useState<UserBook | null>(null);
  const [selectedBooks, setSelectedBooks] = useState<Set<number>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDestructive?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    isDestructive: false
  });
  const { triggerRefresh } = useDataRefresh();
  const { isLoggedIn } = useAuthStore();

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

    // 완독한 책이 선택되었는지 확인
    const selectedUserBooks = filteredBooks.filter(book => selectedBooks.has(book.id));
    const completedBooksCount = selectedUserBooks.filter(book => book.status === 'COMPLETED').length;
    
    let message = `선택한 ${selectedBooks.size}권의 책을 서재에서 제거하시겠습니까?`;
    if (completedBooksCount > 0) {
      message += `\n\n⚠️ 주의: 완독한 책 ${completedBooksCount}권의 리뷰도 함께 삭제됩니다.`;
    }

    setConfirmModal({
      isOpen: true,
      title: '책 삭제 확인',
      message,
      isDestructive: true,
      onConfirm: () => {
        setConfirmModal({ ...confirmModal, isOpen: false });
        executeDeleteSelected(selectedUserBooks, completedBooksCount);
      }
    });
  };

  const executeDeleteSelected = async (selectedUserBooks: UserBook[], completedBooksCount: number) => {
    try {
      setIsLoading(true);
      // 선택된 책들을 병렬로 삭제
      await Promise.all(
        Array.from(selectedBooks).map(bookId => 
          userBookService.deleteUserBook(bookId)
        )
      );
      
      const deletedMessage = completedBooksCount > 0 
        ? `${selectedBooks.size}권의 책과 ${completedBooksCount}개의 리뷰가 삭제되었습니다.`
        : `${selectedBooks.size}권의 책이 서재에서 제거되었습니다.`;
      
      alert(deletedMessage);
      setSelectedBooks(new Set());
      setIsSelectionMode(false);
      
      // 책 목록 새로고침
      const updatedBooks = await userBookService.getMyLibrary();
      setBooks(updatedBooks);
      triggerRefresh(); // 전역 데이터 새로고침
    } catch (err) {
      console.error('Failed to delete selected books:', err);
      alert('일부 책 삭제에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookOptionsClick = (userBook: UserBook) => {
    const hasReview = userBook.status === 'COMPLETED';
    let message = `"${userBook.book.title}"을(를) 서재에서 제거하시겠습니까?`;
    if (hasReview) {
      message += '\n\n⚠️ 주의: 이 책의 리뷰도 함께 삭제됩니다.';
    }

    setConfirmModal({
      isOpen: true,
      title: '책 삭제 확인',
      message,
      isDestructive: true,
      onConfirm: () => {
        setConfirmModal({ ...confirmModal, isOpen: false });
        handleDeleteSingleBook(userBook);
      }
    });
  };

  const handleDeleteSingleBook = async (userBook: UserBook) => {
    try {
      setIsLoading(true);
      await userBookService.deleteUserBook(userBook.id);
      
      const hasReview = userBook.status === 'COMPLETED';
      const message = hasReview 
        ? `"${userBook.book.title}"과 리뷰가 삭제되었습니다.`
        : `"${userBook.book.title}"이 서재에서 제거되었습니다.`;
      
      alert(message);
      
      // 책 목록 새로고침
      const updatedBooks = await userBookService.getMyLibrary();
      setBooks(updatedBooks);
      triggerRefresh(); // 전역 데이터 새로고침
    } catch (err) {
      console.error('Failed to delete book:', err);
      alert('책 삭제에 실패했습니다.');
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
      triggerRefresh(); // 전역 데이터 새로고침
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
      triggerRefresh(); // 전역 데이터 새로고침
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
      triggerRefresh(); // 전역 데이터 새로고침
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

      <ResultsGrid>
        {isLoading ? (
          <LoadingText>로딩 중...</LoadingText>
        ) : error ? (
          <ErrorText>{error}</ErrorText>
        ) : filteredBooks.length > 0 ? (
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
                  )}<BookOptionsButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBookOptionsClick(userBook);
                  }}
                >
                  삭제하기
                </BookOptionsButton>
                </ActionButtonsContainer>
              )}
            </BookCardWrapper>
          ))
        ) : (
          <EmptyText>책 목록이 비어있습니다.</EmptyText>
        )}
      </ResultsGrid>

      {/* 플로팅 삭제 버튼 */}
      <FloatingDeleteButton 
        onClick={toggleSelectionMode}
        $isSelectionMode={isSelectionMode}
      >
        {isSelectionMode ? '❌' : '🗑️'}
      </FloatingDeleteButton>

      {/* 선택 모드일 때 하단 고정 액션 바 */}
      {isSelectionMode && (
        <BottomActionBar>
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
        </BottomActionBar>
      )}

      {isReviewModalOpen && selectedUserBook && (
        <Modal isOpen={isReviewModalOpen} onClose={handleCloseReviewModal}>
          <ReviewForm
            onSubmit={handleReviewSubmit}
            onCancel={handleCloseReviewModal}
          />
        </Modal>
      )}
      {confirmModal.isOpen && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText="삭제"
          cancelText="취소"
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
          isDestructive={confirmModal.isDestructive}
        />
      )}
    </Container>
  );
};

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: #f8fafc;
  min-height: 100vh;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2.5rem;
  font-weight: 600;
  color: #2d3748;
  background: linear-gradient(135deg,rgb(0, 0, 0) 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const TabContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
  background: white;
  border-radius: 16px;
  padding: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
`;

const TabButton = styled.button<{ $active: boolean }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  background: ${({ $active }) => 
    $active 
      ? '#667eea' 
      : 'transparent'
  };
  color: ${({ $active }) => ($active ? 'white' : '#4a5568')};

  &:hover {
    ${({ $active }) => !$active && `
      background: #f0f4ff;
      color: #667eea;
    `}
    ${({ $active }) => $active && `
      background: #5a67d8;
    `}
  }
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 2rem;
`;

const BookCardWrapper = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  position: relative;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
  }
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
  padding: 0.5rem 1rem;
  background: #38b2ac;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(56, 178, 172, 0.2);

  &:hover {
    background: #319795;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(56, 178, 172, 0.3);
  }
`;

const LoadingText = styled.p`
  text-align: center;
  font-size: 1.2rem;
  color: #667eea;
  font-weight: 500;
  margin: 3rem 0;
`;

const ErrorText = styled.p`
  text-align: center;
  color: #e53e3e;
  font-size: 1.1rem;
  margin: 3rem 0;
  padding: 2rem;
  background: #fed7d7;
  border-radius: 12px;
  border: 1px solid #feb2b2;
`;

const EmptyText = styled.p`
  text-align: center;
  color: #4a5568;
  font-size: 1.1rem;
  margin: 3rem 0;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
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
  margin: 1rem 0;
  padding: 1rem;
  background: #f0f4ff;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

const ProgressText = styled.p`
  margin: 0 0 0.5rem;
  font-size: 0.9rem;
  color: #4a5568;
  font-weight: 600;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background-color: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $progress: number }>`
  height: 100%;
  width: ${({ $progress }) => $progress}%;
  background: #667eea;
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
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.2);

  &:hover {
    background: #5a67d8;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
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
  padding: 0.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.9rem;
  text-align: center;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
  }
`;

const BookOptionsButton = styled.button`
  padding: 0.5rem 1rem;
  background: #f0f4ff;
  color: #667eea;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.1);

  &:hover {
    background: #e0e7ff;
    color: #5a67d8;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(102, 126, 234, 0.2);
  }
`;


const SelectAllButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  background: #718096;
  color: white;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(113, 128, 150, 0.2);

  &:hover {
    background: #4a5568;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(113, 128, 150, 0.3);
  }
  
  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
  }
`;

const SelectedCount = styled.span`
  font-size: 1rem;
  color: #2d3748;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  
  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    flex-basis: 100%;
    text-align: center;
    order: -1;
  }
`;

const DeleteSelectedButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  background: #e53e3e;
  color: white;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(229, 62, 62, 0.2);

  &:hover:not(:disabled) {
    background: #c53030;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(229, 62, 62, 0.3);
  }

  &:disabled {
    background: #e2e8f0;
    color: #a0aec0;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
  }
`;

const FloatingDeleteButton = styled.button<{ $isSelectionMode: boolean }>`
  position: fixed;
  bottom: ${({ $isSelectionMode }) => $isSelectionMode ? '100px' : '20px'}; /* 선택 모드일 때 위로 올림 */
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: white;
  color: #e53e3e;
  border: 2px solid #e2e8f0;
  cursor: pointer;
  font-size: 1.3rem;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  z-index: 10;
  transition: all 0.3s ease;

  &:hover {
    background: #e53e3e;
    color: white;
    border-color: #e53e3e;
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(229, 62, 62, 0.3);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const BottomActionBar = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.08);
  border-top: 1px solid #e2e8f0;
  z-index: 9;
  gap: 1rem;
  
  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: center;
  }
`;

export default MyLibraryPage;