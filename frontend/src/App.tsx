import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './features/common/pages/HomePage';
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import SearchPage from './features/book/pages/SearchPage';
import MyLibraryPage from './features/user/pages/MyLibraryPage';
import MyReviewsPage from './features/user/pages/MyReviewsPage';
import DashboardPage from './features/user/pages/DashboardPage';
import BookDetailPage from './features/book/pages/BookDetailPage';
import NotFoundPage from './features/common/pages/NotFoundPage';
import GlobalStyle from './styles/GlobalStyle';
import Header from './components/common/Header';
import { DataRefreshProvider } from './features/common/store/DataRefreshContext';

function App() {
  return (
    <>
      <GlobalStyle />
      <DataRefreshProvider>
        <Router>
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/my-library" element={<MyLibraryPage />} />
              <Route path="/library" element={<MyLibraryPage />} />
              <Route path="/my-reviews" element={<MyReviewsPage />} />
              <Route path="/book/:googleBooksId" element={<BookDetailPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </Router>
      </DataRefreshProvider>
    </>
  );
}

export default App;
