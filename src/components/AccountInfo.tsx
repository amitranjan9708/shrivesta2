// AccountDashboard.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Package, MapPin, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { AccountLayout } from './AccountLayout';

export function AccountDashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [shippingAddress, setShippingAddress] = useState<string | null>(null);
  const [pincode, setPincode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchShippingAddress = async () => {
      try {
        const response = await apiService.getShippingAddress();
        console.log("Shipping address response:", response);
        if (response.success && response.data) {
          // Handle both response.data.shippingAddress and response.data.data.shippingAddress
          const address = response.data.shippingAddress ?? (response.data as any).data?.shippingAddress;
          const savedPincode = response.data.pincode ?? (response.data as any).data?.pincode;
          setShippingAddress(address || null);
          setPincode(savedPincode || null);
        }
      } catch (err) {
        console.error('Error fetching shipping address:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchShippingAddress();
  }, [isAuthenticated, navigate]);

  if (!user) {
    return (
      <AccountLayout>
        <LoadingContainer>
          <Loader size={48} className="animate-spin" />
          <p>Loading...</p>
        </LoadingContainer>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout>
      <Content>
        <Header>
          <h1>My Account</h1>
        </Header>

        <UserInfoCard>
          <UserIcon>
            <User size={36} />
          </UserIcon>
          <Info>
            <Name>{user.name}</Name>
            <Email>
              <Mail size={16} />
              {user.email}
            </Email>
          </Info>
        </UserInfoCard>

        <Section>
          <SectionTitle>
            <Package size={20} />
            Orders
          </SectionTitle>
          <p>View your past orders and track current orders.</p>
          <SectionButton onClick={() => navigate('/account/orders')}>View All Orders</SectionButton>
        </Section>

        <Section>
          <SectionTitle>
            <MapPin size={20} />
            Delivery Address
          </SectionTitle>
          {loading ? (
            <p>Loading address...</p>
          ) : shippingAddress ? (
            <>
              <AddressPreview>
                {shippingAddress}
                {pincode && (
                  <div style={{ marginTop: '8px', fontWeight: '600', color: '#333' }}>
                    Pincode: {pincode}
                  </div>
                )}
              </AddressPreview>
              <SectionButton onClick={() => navigate('/account/address')}>Manage Address</SectionButton>
            </>
          ) : (
            <>
              <p>Add a delivery address to make checkout faster.</p>
              <SectionButton onClick={() => navigate('/account/address')}>Add Address</SectionButton>
            </>
          )}
        </Section>
      </Content>
    </AccountLayout>
  );
}

// Styled Components
const Content = styled.div`
  width: 100%;
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
  display: flex;
  align-items: center;
  gap: 6px;

  @media(min-width: 768px) {
    font-size: 14px;
  }
  color: #555;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 20px;

  p {
    font-size: 18px;
    color: #666;
  }
`;

const AddressPreview = styled.div`
  background: #f9fafb;
  padding: 12px;
  border-radius: 8px;
  margin: 10px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  white-space: pre-wrap;
  border-left: 3px solid #f59e0b;
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
  display: flex;
  align-items: center;
  gap: 8px;

  @media(min-width: 768px) {
    font-size: 18px;
    margin-bottom: 10px;
  }

  svg {
    color: #f59e0b;
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
