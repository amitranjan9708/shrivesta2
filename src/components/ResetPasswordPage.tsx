import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { apiService } from "../services/api";

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const urlToken = searchParams.get("token");
    if (urlToken) {
      setToken(urlToken);
    } else {
      setError("Reset token is missing. Please request a new password reset email.");
    }
  }, [searchParams]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) {
      setError("Reset token is missing. Please request a new password reset email.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await apiService.resetPassword(token, newPassword);
      if (response.success) {
        setSuccessMessage(
          (response.data as any)?.message || "Password reset successfully. You can log in now."
        );
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          navigate("/login?reset=success");
        }, 1500);
      } else {
        setError(response.error || (response.data as any)?.message || "Unable to reset password.");
      }
    } catch (err) {
      setError("Unable to reset password right now. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container>
      <Card>
        <h1>Reset Password</h1>
        <p>Enter your new password below.</p>

        <Form onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}

          <InputGroup>
            <label>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              disabled={isSubmitting || !token}
            />
          </InputGroup>
          <InputGroup>
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              disabled={isSubmitting || !token}
            />
          </InputGroup>

          <SubmitButton type="submit" disabled={isSubmitting || !token}>
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </SubmitButton>
        </Form>
      </Card>
    </Container>
  );
};

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to bottom right, #fff8dc, #fffacd, #ffdab9);
  padding: 20px;
`;

const Card = styled.div`
  max-width: 420px;
  width: 100%;
  background: #ffffff;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 16px;

  h1 {
    font-size: 28px;
    font-weight: 600;
    background: linear-gradient(to right, #f59e0b, #facc15);
    -webkit-background-clip: text;
    color: transparent;
  }

  p {
    font-size: 14px;
    color: #4b5563;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 14px;
    color: #4b5563;
  }

  input {
    padding: 10px 14px;
    border-radius: 10px;
    border: 1px solid #f5deb3;
    outline: none;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 12px;
  background: linear-gradient(to right, #f59e0b, #facc15);
  border: none;
  color: white;
  border-radius: 10px;
  font-size: 16px;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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

