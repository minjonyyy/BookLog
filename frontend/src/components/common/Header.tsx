import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import useAuthStore from '../../features/auth/store/authStore';

const Header = () => {
  const { isLoggedIn, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <HeaderContainer>
      <Logo to="/">📚 BookLog</Logo>
      <Nav>
        <NavItem to="/search">책 검색</NavItem>
        {isLoggedIn && <NavItem to="/dashboard">대시보드</NavItem>}
        {isLoggedIn && <NavItem to="/my-library">내 서재</NavItem>}
        {isLoggedIn ? (
          <>
            <WelcomeMessage>{user?.username}님, 환영합니다!</WelcomeMessage>
            <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
          </>
        ) : (
          <>
            <NavItem to="/login">로그인</NavItem>
            <NavItem to="/register">회원가입</NavItem>
          </>
        )}
      </Nav>
    </HeaderContainer>
  );
};

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #fff;
  border-bottom: 1px solid #eee;
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const NavItem = styled(Link)`
  color: #555;
  &:hover {
    color: #007bff;
  }
`;

const WelcomeMessage = styled.span`
  color: #333;
  font-weight: bold;
`;

const LogoutButton = styled.button`
  background: none;
  border: none;
  color: #555;
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    color: #007bff;
  }
`;

export default Header; 