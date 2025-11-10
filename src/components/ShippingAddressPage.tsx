import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { MapPin, Save, Loader } from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { AccountLayout } from './AccountLayout';

export function ShippingAddressPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [shippingAddress, setShippingAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    if (isLoading || !isAuthenticated) {
      return;
    }

    const fetchShippingAddress = async () => {
      try {
        setLoading(true);
        const response = await apiService.getShippingAddress();
        console.log("Shipping address response:", response);
        if (response.success && response.data) {
          // Handle both response.data.shippingAddress and response.data.data.shippingAddress
          const address = response.data.shippingAddress ?? (response.data as any).data?.shippingAddress;
          const savedPincode = response.data.pincode ?? (response.data as any).data?.pincode;
          setShippingAddress(address || '');
          setPincode(savedPincode || '');
        } else {
          setError(response.error || 'Failed to fetch shipping address');
        }
      } catch (err) {
        setError('An error occurred while fetching shipping address');
        console.error('Error fetching shipping address:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchShippingAddress();
  }, [isAuthenticated, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!shippingAddress.trim()) {
      setError('Please enter a shipping address');
      return;
    }

    if (pincode && pincode.length !== 6) {
      setError('Pincode must be 6 digits');
      return;
    }

    try {
      setSaving(true);
      const response = await apiService.updateShippingAddress(shippingAddress.trim(), pincode.trim() || undefined);
      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      } else {
        setError(response.error || 'Failed to update shipping address');
      }
    } catch (err) {
      setError('An error occurred while updating shipping address');
      console.error('Error updating shipping address:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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
          <h1>Shipping Address</h1>
          <Subtitle>Manage your delivery address</Subtitle>
        </Header>

        <FormContainer>
          <FormCard>
            <FormHeader>
              <MapPin size={24} />
              <h2>Delivery Address</h2>
            </FormHeader>

            {error && <ErrorMessage>{error}</ErrorMessage>}
            {success && <SuccessMessage>Shipping address updated successfully!</SuccessMessage>}

            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label htmlFor="address">Shipping Address</Label>
                <TextArea
                  id="address"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Enter your complete shipping address including street, city, and state"
                  rows={6}
                  required
                />
                <HelpText>
                  Please include your complete address: street, apartment/building, city, and state. This address will be saved permanently and pre-filled during checkout.
                </HelpText>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Enter 6-digit pincode"
                  maxLength={6}
                />
                <HelpText>
                  Enter your 6-digit pincode. This will be saved and pre-filled during checkout.
                </HelpText>
              </FormGroup>

              <ButtonGroup>
                <CancelButton type="button" onClick={() => navigate('/account')}>
                  Cancel
                </CancelButton>
                <SaveButton type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Address
                    </>
                  )}
                </SaveButton>
              </ButtonGroup>
            </Form>
          </FormCard>

          {shippingAddress && (
            <PreviewCard>
              <PreviewHeader>
                <h3>Current Address</h3>
              </PreviewHeader>
              <PreviewContent>
                <MapPin size={20} />
                <div>
                  <AddressText>{shippingAddress}</AddressText>
                  {pincode && (
                    <AddressText style={{ marginTop: '8px', fontWeight: '600' }}>
                      Pincode: {pincode}
                    </AddressText>
                  )}
                </div>
              </PreviewContent>
            </PreviewCard>
          )}
        </FormContainer>
      </Content>
    </AccountLayout>
  );
}

const Content = styled.div`
  max-width: 800px;
  width: 100%;
`;

const Header = styled.div`
  margin-bottom: 30px;

  h1 {
    font-size: 32px;
    background: linear-gradient(to right, #f59e0b, #facc15);
    -webkit-background-clip: text;
    color: transparent;
    margin-bottom: 8px;
  }
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 16px;
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

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormCard = styled.div`
  background: white;
  border-radius: 15px;
  padding: 24px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
`;

const FormHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f3f4f6;

  svg {
    color: #f59e0b;
  }

  h2 {
    font-size: 20px;
    font-weight: 700;
    color: #333;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #f59e0b;
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  font-family: inherit;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #f59e0b;
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const HelpText = styled.p`
  font-size: 14px;
  color: #666;
  margin-top: 4px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 10px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const CancelButton = styled.button`
  flex: 1;
  background: white;
  border: 2px solid #e5e7eb;
  color: #666;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    border-color: #d1d5db;
    background: #f9fafb;
  }
`;

const SaveButton = styled.button`
  flex: 1;
  background: linear-gradient(to right, #F59E0B, #FBBF24);
  color: #000;
  border: none;
  padding: 16px 32px;
  border-radius: 9999px;
  cursor: pointer;
  font-size: 1.125rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s;
  box-shadow: 0 10px 15px rgba(0,0,0,0.2);

  &:hover:not(:disabled) {
    box-shadow: 0 12px 20px rgba(0,0,0,0.3);
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  background: #fee2e2;
  color: #dc2626;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
`;

const SuccessMessage = styled.div`
  background: #d1fae5;
  color: #065f46;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
`;

const PreviewCard = styled.div`
  background: white;
  border-radius: 15px;
  padding: 24px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
`;

const PreviewHeader = styled.div`
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f3f4f6;

  h3 {
    font-size: 18px;
    font-weight: 700;
    color: #333;
  }
`;

const PreviewContent = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;

  svg {
    color: #f59e0b;
    margin-top: 4px;
    flex-shrink: 0;
  }
`;

const AddressText = styled.p`
  font-size: 16px;
  color: #666;
  line-height: 1.6;
  white-space: pre-wrap;
`;

