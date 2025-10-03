// Signup.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, ArrowLeft } from 'lucide-react';
import styled from 'styled-components';

export function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/login');
  };

  return (
    <Container>
      {/* Left Image */}
      <LeftImage>
        <img
          src="https://images.unsplash.com/photo-1717585679395-bbe39b5fb6bc?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.1.0"
          alt="Fashion collage"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1603252109303-2751441dd157?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80';
          }}
        />
      </LeftImage>

      {/* Right Form */}
      <RightForm>
        <FormCard>
          <Header>
            <h1>Create Account</h1>
            <BackButton onClick={() => navigate(-1)}>
              <ArrowLeft /> Back
            </BackButton>
          </Header>

          <Subtitle>Join ShriVesta and start shopping</Subtitle>

          <Form onSubmit={handleSubmit}>
            <InputGroup>
              <label>Full Name</label>
              <InputWrapper>
                <UserIcon />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </InputWrapper>
            </InputGroup>

            <InputGroup>
              <label>Email</label>
              <InputWrapper>
                <MailIcon />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </InputWrapper>
            </InputGroup>

            <InputGroup>
              <label>Password</label>
              <InputWrapper>
                <LockIcon />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </InputWrapper>
            </InputGroup>

            <SubmitButton type="submit">Create Account</SubmitButton>
          </Form>

          <SignupText>
            Already have an account? <StyledLink to="/login">Sign in</StyledLink>
          </SignupText>
        </FormCard>
      </RightForm>
    </Container>
  );
}

// Styled Components
const Container = styled.div`
  display: flex;
  min-height: 100vh;
  flex-direction: column;

  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const LeftImage = styled.div`
  display: none;
  flex: 1;

  @media (min-width: 768px) {
    display: block;
  }

  img {
    width: 100%;
    height: 100vh;
    object-fit: cover;
  }
`;

const RightForm = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(to bottom right, #fff8dc, #fffacd, #ffdab9);
  padding: 20px;
`;

const FormCard = styled.div`
  width: 100%;
  max-width: 400px;
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  h1 {
    font-size: 28px;
    background: linear-gradient(to right, #f59e0b, #facc15);
    -webkit-background-clip: text;
    color: transparent;
  }
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #f59e0b;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #555;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;

  label {
    margin-bottom: 5px;
    font-size: 14px;
    color: #333;
  }
`;

const InputWrapper = styled.div`
  position: relative;

  input {
    width: 100%;
    padding: 10px 15px 10px 35px;
    border-radius: 10px;
    border: 1px solid #f5deb3;
    outline: none;
  }
`;

const MailIcon = styled(Mail)`
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: gray;
`;

const LockIcon = styled(Lock)`
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: gray;
`;

const UserIcon = styled(User)`
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: gray;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 10px;
  background: linear-gradient(to right, #f59e0b, #facc15);
  border: none;
  color: white;
  border-radius: 10px;
  font-size: 16px;
  cursor: pointer;
`;

const SignupText = styled.p`
  text-align: center;
  font-size: 12px;
`;

const StyledLink = styled(Link)`
  color: #f59e0b;
  text-decoration: none;

  &:hover {
    color: #facc15;
  }
`;
