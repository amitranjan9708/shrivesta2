// AccountDashboard.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { User, Mail, ArrowLeft } from 'lucide-react';

export function AccountDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john@example.com',
  });

  return (
    <Container>
      {/* Sidebar */}
      <Sidebar>
        <h2>Account</h2>
        <SidebarButton onClick={() => alert('Go to Orders')}>Orders</SidebarButton>
        <SidebarButton onClick={() => alert('Go to Payment Options')}>Payment Options</SidebarButton>
        <SidebarButton onClick={() => alert('Go to Delivery Addresses')}>Delivery Addresses</SidebarButton>
        <SidebarButton onClick={() => alert('Go to Wishlist')}>Wishlist</SidebarButton>
        <SidebarButton onClick={() => alert('Go to Settings')}>Settings</SidebarButton>
      </Sidebar>

      {/* Main Content */}
      <Main>
        <Header>
          <h1>My Account</h1>
        </Header>

        <UserInfoCard>
          <UserIcon>
            <User size={36} />
          </UserIcon>
          <Info>
            <Name>{user.name}</Name>
            <Email>{user.email}</Email>
          </Info>
          <EditButton onClick={() => navigate('/account/edit')}>Edit Account</EditButton>
        </UserInfoCard>

        <Section>
          <SectionTitle>Orders</SectionTitle>
          <p>View your past orders and track current orders.</p>
          <SectionButton onClick={() => alert('View Orders')}>Go to Orders</SectionButton>
        </Section>

        <Section>
          <SectionTitle>Payment Options</SectionTitle>
          <p>Manage your saved cards, UPI, wallets, etc.</p>
          <SectionButton onClick={() => alert('Payment Options')}>Manage Payment</SectionButton>
        </Section>

        <Section>
          <SectionTitle>Delivery Addresses</SectionTitle>
          <p>Manage your saved delivery addresses.</p>
          <SectionButton onClick={() => alert('Delivery Addresses')}>Manage Addresses</SectionButton>
        </Section>
      </Main>
    </Container>
  );
}

// Styled Components
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

const SidebarButton = styled.button`
  background: none;
  border: none;
  text-align: left;
  font-size: 16px;
  color: #333;
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

const Header = styled.div`
  margin-bottom: 20px;

  h1 {
    font-size: 28px;

    @media(min-width: 768px) {
      font-size: 32px;
    }

    background: linear-gradient(to right, #f59e0b, #facc15);
    -webkit-background-clip: text;
    color: transparent;
  }
`;

const UserInfoCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background: white;
  padding: 20px;
  border-radius: 15px;
  margin-bottom: 20px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);

  @media(min-width: 768px) {
    flex-direction: row;
    align-items: center;
    margin-bottom: 30px;
  }
`;

const UserIcon = styled.div`
  margin-bottom: 10px;
  color: #f59e0b;

  @media(min-width: 768px) {
    margin-bottom: 0;
    margin-right: 20px;
  }
`;

const Info = styled.div`
  flex: 1;
  margin-bottom: 10px;

  @media(min-width: 768px) {
    margin-bottom: 0;
  }
`;

const Name = styled.h2`
  font-size: 18px;

  @media(min-width: 768px) {
    font-size: 20px;
  }
  margin-bottom: 5px;
`;

const Email = styled.p`
  font-size: 12px;

  @media(min-width: 768px) {
    font-size: 14px;
  }
  color: #555;
`;

const EditButton = styled.button`
  background: linear-gradient(to right, #f59e0b, #facc15);
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    opacity: 0.9;
  }

  @media(min-width: 768px) {
    font-size: 16px;
    padding: 10px 15px;
  }
`;

const Section = styled.div`
  background: white;
  padding: 15px;
  border-radius: 15px;
  margin-bottom: 15px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);

  @media(min-width: 768px) {
    padding: 20px;
    margin-bottom: 20px;
  }
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  margin-bottom: 5px;

  @media(min-width: 768px) {
    font-size: 18px;
    margin-bottom: 10px;
  }
`;

const SectionButton = styled.button`
  margin-top: 8px;
  background: linear-gradient(to right, #f59e0b, #facc15);
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    opacity: 0.9;
  }

  @media(min-width: 768px) {
    padding: 8px 12px;
    font-size: 14px;
  }
`;
