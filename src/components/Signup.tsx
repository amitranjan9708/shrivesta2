// Signup.tsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, User, ArrowLeft } from "lucide-react";
import styled from "styled-components";
import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../services/api";

export function Signup() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isResendLoading, setIsResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMessage("");
    setResendMessage("");

    try {
      const result = await register(name, email, password);
      if (result.success) {
        setSuccessMessage(
          result.message || "Please verify your email to complete registration."
        );
      } else {
        setError(result.error || "Registration failed");
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!email) {
      setResendMessage("Enter your email above to resend the verification link.");
      return;
    }
    setIsResendLoading(true);
    setResendMessage("");
    try {
      const response = await apiService.resendVerificationEmail(email);
      if (response.success) {
        setResendMessage(
          (response.data as any)?.message ||
            "Verification email sent again. Please check your inbox."
        );
      } else {
        setResendMessage(response.error || "Unable to resend verification email.");
      }
    } catch (err) {
      setResendMessage(
        "Unable to resend verification email right now. Please try again later."
      );
    } finally {
      setIsResendLoading(false);
    }
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
              "https://images.unsplash.com/photo-1603252109303-2751441dd157?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80";
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
            {error && <ErrorMessage>{error}</ErrorMessage>}
            {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}

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
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                  disabled={isLoading}
                />
              </InputWrapper>
            </InputGroup>

            <SubmitButton type="submit" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </SubmitButton>
          </Form>

          {successMessage && (
            <ResendContainer>
              <p>Didn&apos;t get the email?</p>
              <ResendButton
                type="button"
                onClick={handleResendEmail}
                disabled={isResendLoading}
              >
                {isResendLoading ? "Resending..." : "Resend verification email"}
              </ResendButton>
              {resendMessage && <ResendFeedback>{resendMessage}</ResendFeedback>}
            </ResendContainer>
          )}

          <SignupText>
            Already have an account?{" "}
            <StyledLink to="/login">Sign in</StyledLink>
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

const ErrorMessage = styled.div`
  background: #fee2e2;
  color: #dc2626;
  padding: 10px;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
  border: 1px solid #fecaca;
`;

const SuccessMessage = styled.div`
  background: #ecfdf3;
  color: #047857;
  padding: 10px;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
  border: 1px solid #bbf7d0;
`;

const ResendContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: center;
  font-size: 14px;
`;

const ResendButton = styled.button`
  background: none;
  border: 1px solid #f59e0b;
  color: #f59e0b;
  border-radius: 999px;
  padding: 8px 16px;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ResendFeedback = styled.span`
  font-size: 12px;
  color: #6b7280;
`;
