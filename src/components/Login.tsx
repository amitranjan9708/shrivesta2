// Login.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Mail, Lock, ArrowLeft } from "lucide-react";
import styled from "styled-components";
import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../services/api";

export function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  // States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [forgotStatus, setForgotStatus] = useState("");
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);
  const [resendStatus, setResendStatus] = useState("");
  const [isResendLoading, setIsResendLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("verified") === "true") {
      setInfoMessage("Email verified successfully. You can now log in.");
    } else if (searchParams.get("reset") === "success") {
      setInfoMessage("Password reset successful. Please log in with your new password.");
    } else {
      const messageParam = searchParams.get("message");
      if (messageParam) {
        setInfoMessage(messageParam);
      }
    }
  }, [searchParams]);

  // Handlers
  const handleLoginSubmit = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setInfoMessage("");

    try {
      console.log("Attempting login for:", email);
      const result = await login(email, password);
      console.log("Login result:", result);
      if (result.success) {
        // Check if there's a redirect parameter
        const redirect = searchParams.get("redirect");
        if (redirect) {
          navigate(redirect);
        } else {
          navigate("/");
        }
      } else {
        setError(result.error || "Login failed. Please check your credentials.");
        if (result.error?.toLowerCase().includes("verify")) {
          setResendStatus("");
        }
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setError(
        error?.message ||
          "Failed to connect to server. Please check if the backend is running."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setResendStatus("Enter your email above to resend the verification link.");
      return;
    }
    setIsResendLoading(true);
    setResendStatus("");
    try {
      const response = await apiService.resendVerificationEmail(email);
      if (response.success) {
        setResendStatus(
          (response.data as any)?.message ||
            "Verification email sent again. Please check your inbox."
        );
      } else {
        setResendStatus(response.error || "Unable to resend verification email.");
      }
    } catch (err) {
      setResendStatus(
        "Unable to resend verification email right now. Please try again later."
      );
    } finally {
      setIsResendLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsForgotSubmitting(true);
    setForgotStatus("");
    setError("");
    try {
      const response = await apiService.forgotPassword(email);
      if (response.success) {
        setForgotStatus(
          (response.data as any)?.message ||
            "If that email is registered, a password reset link has been sent."
        );
      } else {
        setForgotStatus(
          response.error || "Unable to send password reset link right now."
        );
      }
    } catch (err) {
      setForgotStatus(
        "Unable to send password reset link right now. Please try again later."
      );
    } finally {
      setIsForgotSubmitting(false);
    }
  };

  const handleBackToLogin = () => {
    setForgotPassword(false);
    setForgotStatus("");
  };

  return (
    <Container>
      <LeftImage>
        <img
          src="https://images.unsplash.com/photo-1603252109303-2751441dd157?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
          alt="Fashion collage"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1717585679395-bbe39b5fb6bc?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.1.0";
          }}
        />
      </LeftImage>

      <RightForm>
        <LoginCard>
          <Header>
            <h1>{forgotPassword ? "Reset Password" : "Welcome Back"}</h1>
            <BackButton onClick={() => navigate(-1)}>
              <ArrowLeft /> Back
            </BackButton>
          </Header>

          {!forgotPassword && (
            <Subtitle>Sign in to continue to ShriVesta</Subtitle>
          )}
          {forgotPassword && (
            <Subtitle>Enter your registered email to receive a password reset link</Subtitle>
          )}

          {/* Login Form */}
          {!forgotPassword && (
            <Form onSubmit={handleLoginSubmit}>
              {error && <ErrorMessage>{error}</ErrorMessage>}
              {error && error.toLowerCase().includes("verify") && (
                <ResendContainer>
                  <ResendButton
                    type="button"
                    onClick={handleResendVerification}
                    disabled={isResendLoading}
                  >
                    {isResendLoading ? "Resending..." : "Resend verification email"}
                  </ResendButton>
                  {resendStatus && <ResendFeedback>{resendStatus}</ResendFeedback>}
                </ResendContainer>
              )}
              {infoMessage && <InfoMessage>{infoMessage}</InfoMessage>}

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
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                  />
                  <ShowHideButton
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    disabled={isLoading}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </ShowHideButton>
                </InputWrapper>
              </InputGroup>

              <FormFooter>
                <label>
                  <input type="checkbox" disabled={isLoading} /> Remember me
                </label>
                <ForgotPasswordLink onClick={() => setForgotPassword(true)}>
                  Forgot password?
                </ForgotPasswordLink>
              </FormFooter>

              <SubmitButton type="submit" disabled={isLoading}>
                {isLoading ? "Signing In..." : "Sign In"}
              </SubmitButton>
            </Form>
          )}

          {/* Forgot Password - Step 1: Enter Email */}
          {forgotPassword && (
            <Form onSubmit={handleForgotPasswordSubmit}>
              {forgotStatus && <InfoMessage>{forgotStatus}</InfoMessage>}
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
                    disabled={isForgotSubmitting}
                  />
                </InputWrapper>
              </InputGroup>
              <SubmitButton type="submit" disabled={isForgotSubmitting}>
                {isForgotSubmitting ? "Sending..." : "Send reset link"}
              </SubmitButton>
              <BackToLogin onClick={handleBackToLogin}>
                Back to Login
              </BackToLogin>
            </Form>
          )}

          {!forgotPassword && (
            <SignupText>
              Don&apos;t have an account?{" "}
              <StyledLink to="/signup">Create one</StyledLink>
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

const LoginCard = styled.div`
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

  input[type="checkbox"] {
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

const ErrorMessage = styled.div`
  background: #fee2e2;
  color: #dc2626;
  padding: 10px;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
  border: 1px solid #fecaca;
`;

const InfoMessage = styled.div`
  background: #fef3c7;
  color: #92400e;
  padding: 10px;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
  border: 1px solid #fcd34d;
`;

const ResendContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 8px;
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
