import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { apiService } from "../services/api";

type VerificationState = "loading" | "success" | "error";

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<VerificationState>("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing. Please request a new verification email.");
      return;
    }

    const verify = async () => {
      try {
        console.log("🔍 Verifying email with token:", token.substring(0, 10) + "...");
        const response = await apiService.verifyEmail(token);
        console.log("📧 Verification response:", response);
        if (response.success) {
          setStatus("success");
          setMessage(
            (response.data as any)?.message || "Your email has been verified successfully."
          );
        } else {
          setStatus("error");
          setMessage(response.error || (response.data as any)?.message || "Verification failed.");
        }
      } catch (error) {
        console.error("❌ Verification error:", error);
        setStatus("error");
        setMessage("Verification failed. Please try again later or request a new email.");
      }
    };

    verify();
  }, [searchParams]);

  const handleGoToLogin = () => {
    if (status === "success") {
      navigate("/login?verified=true");
    } else {
      navigate("/login");
    }
  };

  return (
    <Container>
      <Card status={status}>
        <h1>
          {status === "success"
            ? "Email Verified"
            : status === "error"
            ? "Verification Failed"
            : "Verifying..."}
        </h1>
        <p>{message}</p>
        <ActionButton onClick={handleGoToLogin}>
          {status === "success" ? "Go to Login" : "Back to Login"}
        </ActionButton>
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

const Card = styled.div<{ status: VerificationState }>`
  max-width: 420px;
  width: 100%;
  background: #ffffff;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 16px;
  text-align: center;

  h1 {
    font-size: 28px;
    font-weight: 600;
    background: ${({ status }) =>
      status === "success"
        ? "linear-gradient(to right, #16a34a, #4ade80)"
        : status === "error"
        ? "linear-gradient(to right, #dc2626, #f87171)"
        : "linear-gradient(to right, #f59e0b, #facc15)"};
    -webkit-background-clip: text;
    color: transparent;
  }

  p {
    font-size: 14px;
    color: #4b5563;
  }
`;

const ActionButton = styled.button`
  padding: 12px;
  border: none;
  background: linear-gradient(to right, #f59e0b, #facc15);
  border-radius: 10px;
  color: #ffffff;
  font-size: 16px;
  cursor: pointer;
`;

