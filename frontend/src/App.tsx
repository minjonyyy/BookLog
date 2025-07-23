import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SearchPage from './pages/SearchPage';
import MyLibraryPage from './pages/MyLibraryPage';
import DashboardPage from './pages/DashboardPage';
import BookDetailPage from './pages/BookDetailPage';
import NotFoundPage from './pages/NotFoundPage';
import GlobalStyle from './styles/GlobalStyle';
import Header from './components/Header';

function App() {
  return (
    <>
      <GlobalStyle />
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
            <Route path="/book/:googleBooksId" element={<BookDetailPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </Router>
    </>
  );
}

export default App;
