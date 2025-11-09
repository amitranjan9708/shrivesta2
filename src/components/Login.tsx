// Login.tsx
import React, { useState } from "react";
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
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Handlers
  const handleLoginSubmit = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

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
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error?.message || "Failed to connect to server. Please check if the backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await apiService.requestPasswordReset(email);
      if (response.success) {
        setOtpSent(true);
        setError(""); // Clear any previous errors
      } else {
        setError(response.error || "Failed to send reset code. Please try again.");
      }
    } catch (error: any) {
      setError(error?.message || "Failed to send reset code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp || !newPassword) {
      setError("Please enter both the code and new password");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await apiService.resetPassword(email, otp, newPassword);
      if (response.success) {
        // Success - reset form and go back to login
        setError("");
        setForgotPassword(false);
        setOtpSent(false);
        setEmail("");
        setOtp("");
        setNewPassword("");
        // Show success message (you could use a toast notification here)
        alert("Password reset successfully! You can now login with your new password.");
      } else {
        setError(response.error || "Failed to reset password. Please check your code and try again.");
      }
    } catch (error: any) {
      setError(error?.message || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
          {forgotPassword && !otpSent && (
            <Subtitle>Enter your registered email to receive OTP</Subtitle>
          )}
          {forgotPassword && otpSent && (
            <Subtitle>Enter OTP and new password</Subtitle>
          )}

          {/* Login Form */}
          {!forgotPassword && (
            <Form onSubmit={handleLoginSubmit}>
              {error && <ErrorMessage>{error}</ErrorMessage>}

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
          {forgotPassword && !otpSent && (
            <Form>
              {error && <ErrorMessage>{error}</ErrorMessage>}
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
              <SubmitButton type="button" onClick={handleSendOtp} disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Code"}
              </SubmitButton>
              <BackToLogin onClick={() => {
                setForgotPassword(false);
                setError("");
              }}>
                Back to Login
              </BackToLogin>
            </Form>
          )}

          {/* Forgot Password - Step 2: Enter OTP and New Password */}
          {forgotPassword && otpSent && (
            <Form>
              {error && <ErrorMessage>{error}</ErrorMessage>}
              <InputGroup>
                <label>Reset Code</label>
                <InputWrapper>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="Enter 6-digit code"
                    required
                    disabled={isLoading}
                    maxLength={6}
                  />
                </InputWrapper>
              </InputGroup>

              <InputGroup>
                <label>New Password</label>
                <InputWrapper>
                  <LockIcon />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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

              <SubmitButton type="button" onClick={handleResetPassword} disabled={isLoading}>
                {isLoading ? "Resetting..." : "Reset Password"}
              </SubmitButton>
              <BackToLogin onClick={() => {
                setForgotPassword(false);
                setOtpSent(false);
                setError("");
                setOtp("");
                setNewPassword("");
              }}>
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
