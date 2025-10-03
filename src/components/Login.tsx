// Login.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import styled from 'styled-components';

export function Login() {
  const navigate = useNavigate();

  // States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Handlers
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add login logic here
    navigate('/');
  };

  const handleSendOtp = () => {
    // Simulate sending OTP
    setOtpSent(true);
    alert(`OTP sent to ${email}`);
  };

  const handleResetPassword = () => {
    // Simulate resetting password
    alert(`Password for ${email} reset successfully!`);
    setForgotPassword(false);
    setOtpSent(false);
    setEmail('');
    setOtp('');
    setNewPassword('');
  };

  return (
    <Container>
      <LeftImage>
        <img
          src="https://images.unsplash.com/photo-1603252109303-2751441dd157?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
          alt="Fashion collage"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1717585679395-bbe39b5fb6bc?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.1.0';
          }}
        />
      </LeftImage>

      <RightForm>
        <LoginCard>
          <Header>
            <h1>{forgotPassword ? 'Reset Password' : 'Welcome Back'}</h1>
            <BackButton onClick={() => navigate(-1)}>
              <ArrowLeft /> Back
            </BackButton>
          </Header>

          {!forgotPassword && <Subtitle>Sign in to continue to ShriVesta</Subtitle>}
          {forgotPassword && !otpSent && <Subtitle>Enter your registered email to receive OTP</Subtitle>}
          {forgotPassword && otpSent && <Subtitle>Enter OTP and new password</Subtitle>}

          {/* Login Form */}
          {!forgotPassword && (
            <Form onSubmit={handleLoginSubmit}>
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
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                  <ShowHideButton onClick={() => setShowPassword((v) => !v)}>
                    {showPassword ? 'Hide' : 'Show'}
                  </ShowHideButton>
                </InputWrapper>
              </InputGroup>

              <FormFooter>
                <label>
                  <input type="checkbox" /> Remember me
                </label>
                <ForgotPasswordLink onClick={() => setForgotPassword(true)}>
                  Forgot password?
                </ForgotPasswordLink>
              </FormFooter>

              <SubmitButton type="submit">Sign In</SubmitButton>
            </Form>
          )}

          {/* Forgot Password - Step 1: Enter Email */}
          {forgotPassword && !otpSent && (
            <Form>
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
              <SubmitButton type="button" onClick={handleSendOtp}>
                Send OTP
              </SubmitButton>
              <BackToLogin onClick={() => setForgotPassword(false)}>Back to Login</BackToLogin>
            </Form>
          )}

          {/* Forgot Password - Step 2: Enter OTP and New Password */}
          {forgotPassword && otpSent && (
            <Form>
              <InputGroup>
                <label>OTP</label>
                <InputWrapper>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter OTP"
                    required
                  />
                </InputWrapper>
              </InputGroup>

              <InputGroup>
                <label>New Password</label>
                <InputWrapper>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                  <ShowHideButton onClick={() => setShowPassword((v) => !v)}>
                    {showPassword ? 'Hide' : 'Show'}
                  </ShowHideButton>
                </InputWrapper>
              </InputGroup>

              <SubmitButton type="button" onClick={handleResetPassword}>
                Reset Password
              </SubmitButton>
              <BackToLogin onClick={() => setForgotPassword(false)}>Back to Login</BackToLogin>
            </Form>
          )}

          {!forgotPassword && (
            <SignupText>
              Don&apos;t have an account? <StyledLink to="/signup">Create one</StyledLink>
            </SignupText>
          )}
        </LoginCard>
      </RightForm>
    </Container>
  );
}

// Styled Components (same as before)
const Container = styled.div`
  display: flex;
  min-height: 100vh;
  flex-direction: column;

  @media(min-width: 768px) {
    flex-direction: row;
  }
`;

const LeftImage = styled.div`
  display: none;
  flex: 1;

  @media(min-width: 768px) {
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

const LoginCard = styled.div`
  width: 100%;
  max-width: 400px;
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
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
    padding: 10px 40px 10px 35px;
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

const ShowHideButton = styled.button`
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #f59e0b;
  cursor: pointer;
`;

const FormFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;

  input[type='checkbox'] {
    margin-right: 5px;
  }
`;

const ForgotPasswordLink = styled.span`
  color: #f59e0b;
  cursor: pointer;

  &:hover {
    color: #facc15;
  }
`;

const BackToLogin = styled.span`
  display: block;
  margin-top: 10px;
  text-align: center;
  font-size: 12px;
  color: #f59e0b;
  cursor: pointer;

  &:hover {
    color: #facc15;
  }
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
