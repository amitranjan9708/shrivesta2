import React from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';

interface AccountLayoutProps {
  children: React.ReactNode;
}

export function AccountLayout({ children }: AccountLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveTab = () => {
    if (location.pathname === '/account/orders') return 'orders';
    if (location.pathname === '/account/address') return 'address';
    return 'dashboard';
  };

  const activeTab = getActiveTab();

  return (
    <Container>
      <Sidebar>
        <h2>Account</h2>
        <SidebarButton
          active={activeTab === 'dashboard'}
          onClick={() => navigate('/account')}
        >
          Dashboard
        </SidebarButton>
        <SidebarButton
          active={activeTab === 'orders'}
          onClick={() => navigate('/account/orders')}
        >
          Orders
        </SidebarButton>
        <SidebarButton
          active={activeTab === 'address'}
          onClick={() => navigate('/account/address')}
        >
          Delivery Address
        </SidebarButton>
      </Sidebar>
      <Main>{children}</Main>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  min-height: 100vh;
  background: linear-gradient(to bottom right, #fff8dc, #fffacd, #ffdab9);
  flex-direction: column;

  @media(min-width: 768px) {
    flex-direction: row;
  }
`;

const Sidebar = styled.div`
  width: 250px;
  background: #fff3cd;
  padding: 20px;
  display: flex;
  flex-direction: column;

  h2 {
    margin-bottom: 15px;
    color: #f59e0b;
  }

  @media(max-width: 768px) {
    width: 100%;
    flex-direction: row;
    overflow-x: auto;
    padding: 10px 0;
    gap: 8px;

    h2 {
      display: none;
    }
  }
`;

const SidebarButton = styled.button<{ active?: boolean }>`
  background: ${(props) => (props.active ? '#ffe8a1' : 'none')};
  border: none;
  text-align: left;
  font-size: 16px;
  color: ${(props) => (props.active ? '#f59e0b' : '#333')};
  font-weight: ${(props) => (props.active ? '600' : '400')};
  cursor: pointer;
  padding: 8px 10px;
  border-radius: 8px;
  width: 100%;
  margin-bottom: 8px;

  &:hover {
    background: #ffe8a1;
  }

  @media(max-width: 768px) {
    text-align: center;
    margin-bottom: 0;
    white-space: nowrap;
    padding: 8px 12px;
  }
`;

const Main = styled.div`
  flex: 1;
  padding: 20px;

  @media(min-width: 768px) {
    padding: 40px;
  }
`;

