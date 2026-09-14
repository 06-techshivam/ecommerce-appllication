"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/lib/toast";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/profile";

  const { user, signIn, signUp, verifyEmail, resendVerificationEmail } = useAuth();
  const { showToast } = useToast();

  // Screen mode: 'auth' (sign in / create account) or 'verify' (dedicated 6-digit verification code screen)
  const [mode, setMode] = useState<"auth" | "verify">("auth");
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Form fields
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");

  // Verification flow state
  const [verifyEmailAddress, setVerifyEmailAddress] = useState("");
  const [savedPassword, setSavedPassword] = useState("");
  const [codeDigits, setCodeDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(60);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifyNotice, setVerifyNotice] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Check for email verification return params in URL (magic link clicks)
  useEffect(() => {
    const status = searchParams.get("insforge_status");
    const type = searchParams.get("insforge_type");
    const err = searchParams.get("insforge_error");

    if (type === "verify_email") {
      if (status === "success") {
        setInfoMessage("Email verified successfully! Please sign in with your credentials.");
        setMode("auth");
        setTab("signin");
      } else if (status === "error" || err) {
        setErrorMessage(err || "The verification link is invalid or has expired.");
      }
    }
  }, [searchParams]);

  // Countdown timer for code resend
  useEffect(() => {
    if (mode !== "verify" || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [mode, countdown]);

  // If already authenticated, redirect
  useEffect(() => {
    if (user) {
      router.push(redirectUrl);
    }
  }, [user, redirectUrl, router]);

  // Focus first digit box when switching to verification screen
  useEffect(() => {
    if (mode === "verify") {
      const timer = setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [mode]);

  // --------------------------------------------------------------------------
  // Sign In Flow
  // --------------------------------------------------------------------------
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);
    setLoading(true);

    try {
      const res = await signIn(signInEmail.trim(), signInPassword);
      if (res.error) {
        const errLower = res.error.toLowerCase();
        if (
          errLower.includes("email verification") ||
          errLower.includes("verification required") ||
          errLower.includes("verify your email")
        ) {
          // Switch to dedicated verification screen
          const emailToVerify = signInEmail.trim();
          setVerifyEmailAddress(emailToVerify);
          setSavedPassword(signInPassword);
          setCodeDigits(["", "", "", "", "", ""]);
          setVerifyError(null);
          setVerifyNotice(`A 6-digit verification code has been sent to ${emailToVerify}.`);
          setMode("verify");
          setCountdown(60);

          // Dispatch verification code email in background
          resendVerificationEmail(emailToVerify).catch(() => {});
          return;
        }
        setErrorMessage(res.error);
      } else {
        showToast("Welcome back to ZENVORA", "Successfully signed in");
        router.push(redirectUrl);
      }
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // Sign Up Flow
  // --------------------------------------------------------------------------
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    if (signUpPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const res = await signUp(signUpEmail.trim(), signUpPassword, signUpName.trim());
      if (res.error) {
        setErrorMessage(res.error);
      } else if (res.user && !res.user.emailVerified) {
        // Switch directly to verification screen
        const emailToVerify = signUpEmail.trim();
        setVerifyEmailAddress(emailToVerify);
        setSavedPassword(signUpPassword);
        setCodeDigits(["", "", "", "", "", ""]);
        setVerifyError(null);
        setVerifyNotice(`Account created. Enter the 6-digit code sent to ${emailToVerify} to verify.`);
        setMode("verify");
        setCountdown(60);
      } else {
        showToast("Account created successfully", "Welcome to ZENVORA Maison");
        router.push(redirectUrl);
      }
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // 6-Digit Code Digit Handling
  // --------------------------------------------------------------------------
  const handleDigitChange = (index: number, value: string) => {
    // If multiple characters pasted or typed
    const digitsOnly = value.replace(/\D/g, "");
    if (digitsOnly.length > 1) {
      const newDigits = [...codeDigits];
      for (let i = 0; i < digitsOnly.length && index + i < 6; i++) {
        newDigits[index + i] = digitsOnly[i];
      }
      setCodeDigits(newDigits);
      const nextFocus = Math.min(index + digitsOnly.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    const newDigits = [...codeDigits];
    newDigits[index] = digitsOnly;
    setCodeDigits(newDigits);

    if (digitsOnly && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!codeDigits[index] && index > 0) {
        const newDigits = [...codeDigits];
        newDigits[index - 1] = "";
        setCodeDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const newDigits = [...codeDigits];
    for (let i = 0; i < pasted.length && i < 6; i++) {
      newDigits[i] = pasted[i];
    }
    setCodeDigits(newDigits);
    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();
  };

  // --------------------------------------------------------------------------
  // Verification Submission
  // --------------------------------------------------------------------------
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = codeDigits.join("").trim();
    if (fullOtp.length !== 6) {
      setVerifyError("Please enter all 6 digits of your verification code.");
      return;
    }

    setVerifyError(null);
    setVerifyNotice(null);
    setVerifying(true);

    try {
      const res = await verifyEmail(verifyEmailAddress, fullOtp);
      if (res.error) {
        setVerifyError(res.error || "The verification code is incorrect or has expired.");
      } else {
        // If the session was not already established and password is saved, sign in seamlessly
        if (!user && savedPassword) {
          const signinRes = await signIn(verifyEmailAddress, savedPassword);
          if (signinRes.error) {
            setMode("auth");
            setTab("signin");
            setSignInEmail(verifyEmailAddress);
            setInfoMessage("Email verified successfully! Please enter your password to sign in.");
            showToast("Email verified", "Please sign in to Atelier ZENVORA");
            return;
          }
        }
        showToast("Email verified successfully", "Welcome to Atelier ZENVORA");
        router.push(redirectUrl);
      }
    } catch {
      setVerifyError("An unexpected error occurred during verification. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  // --------------------------------------------------------------------------
  // Resend Code Action with Countdown
  // --------------------------------------------------------------------------
  const handleResendCode = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    setVerifyError(null);

    try {
      const res = await resendVerificationEmail(verifyEmailAddress);
      if (res.error) {
        setVerifyError(res.error);
      } else {
        setCountdown(60);
        setVerifyNotice("A new 6-digit verification code has been dispatched to your email.");
      }
    } catch {
      setVerifyError("Could not dispatch a new code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  // ==========================================================================
  // RENDER: Dedicated Verification Screen
  // ==========================================================================
  if (mode === "verify") {
    return (
      <div className="auth-container">
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <span className="section-eyebrow">Security Verification</span>
          <h1 className="heading-2" style={{ marginTop: "0.35rem" }}>
            Verify Your Email
          </h1>
          <p
            className="body-small"
            style={{
              color: "var(--text-muted)",
              marginTop: "0.75rem",
              lineHeight: 1.6,
              maxWidth: "360px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            We have sent a 6-digit verification code to
            <br />
            <strong style={{ color: "var(--text-primary)", fontWeight: 600 }}>{verifyEmailAddress}</strong>
          </p>
        </div>

        {verifyNotice && (
          <div
            style={{
              backgroundColor: "rgba(146, 92, 56, 0.08)",
              border: "1px solid rgba(146, 92, 56, 0.3)",
              color: "#925c38",
              padding: "0.75rem 1rem",
              fontSize: "0.85rem",
              marginBottom: "1.25rem",
              borderRadius: "2px",
              lineHeight: 1.5,
              textAlign: "center",
            }}
          >
            {verifyNotice}
          </div>
        )}

        {verifyError && (
          <div
            style={{
              backgroundColor: "rgba(180, 50, 50, 0.08)",
              border: "1px solid rgba(180, 50, 50, 0.3)",
              color: "#991b1b",
              padding: "0.75rem 1rem",
              fontSize: "0.85rem",
              marginBottom: "1.25rem",
              borderRadius: "2px",
              lineHeight: 1.5,
              textAlign: "center",
            }}
          >
            {verifyError}
          </div>
        )}

        <form onSubmit={handleVerifySubmit} style={{ display: "flex", flexDirection: "column" }}>
          <label
            className="form-label"
            style={{ textAlign: "center", textTransform: "uppercase", letterSpacing: "0.15em", fontSize: "0.72rem" }}
          >
            Enter 6-Digit Code
          </label>

          {/* 6 Digit Responsive Box Inputs */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "clamp(0.35rem, 2vw, 0.6rem)",
              margin: "1rem 0 1.5rem",
            }}
          >
            {codeDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                className="form-input"
                style={{
                  width: "clamp(38px, 11vw, 48px)",
                  height: "clamp(48px, 13vw, 56px)",
                  textAlign: "center",
                  fontSize: "clamp(1.2rem, 3.5vw, 1.4rem)",
                  fontWeight: 600,
                  padding: 0,
                  borderRadius: "2px",
                  border: verifyError ? "1px solid var(--accent-sale)" : "1px solid var(--border-subtle)",
                  backgroundColor: "var(--bg-surface)",
                  color: "var(--text-primary)",
                  boxShadow: "none",
                }}
                aria-label={`Digit ${idx + 1}`}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={verifying || codeDigits.join("").length !== 6}
            className="btn btn-primary btn-full"
            style={{
              opacity: verifying || codeDigits.join("").length !== 6 ? 0.6 : 1,
              cursor: verifying || codeDigits.join("").length !== 6 ? "not-allowed" : "pointer",
            }}
          >
            {verifying ? "Verifying Code..." : "Verify Email"}
          </button>

          {/* Resend Code with Countdown Timer */}
          <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
            <span className="body-small" style={{ color: "var(--text-muted)" }}>
              Didn&apos;t receive the code?{" "}
            </span>
            {countdown > 0 ? (
              <span className="body-small" style={{ color: "var(--text-muted)", fontWeight: 500 }}>
                Resend code in <strong style={{ color: "#925c38" }}>{countdown}s</strong>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resending}
                className="btn-link"
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "#925c38",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
              >
                {resending ? "Dispatching..." : "Resend Code"}
              </button>
            )}
          </div>

          {/* Navigation Back to Sign In */}
          <div
            style={{
              textAlign: "center",
              marginTop: "1.5rem",
              borderTop: "1px solid var(--border-hairline)",
              paddingTop: "1.25rem",
            }}
          >
            <button
              type="button"
              onClick={() => {
                setMode("auth");
                setTab("signin");
                setVerifyError(null);
                setVerifyNotice(null);
                setCodeDigits(["", "", "", "", "", ""]);
              }}
              className="btn-link"
              style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}
            >
              ← Back to Sign In
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ==========================================================================
  // RENDER: Sign In & Create Account Tabs
  // ==========================================================================
  return (
    <div className="auth-container">
      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <span className="section-eyebrow">Client Portal</span>
        <h1 className="heading-2" style={{ marginTop: "0.25rem" }}>
          Maison ZENVORA
        </h1>
      </div>

      {/* Tab Switcher */}
      <div className="auth-tabs">
        <button
          type="button"
          className={`auth-tab-btn ${tab === "signin" ? "is-active" : ""}`}
          onClick={() => {
            setTab("signin");
            setErrorMessage(null);
            setInfoMessage(null);
          }}
        >
          Sign In
        </button>
        <button
          type="button"
          className={`auth-tab-btn ${tab === "signup" ? "is-active" : ""}`}
          onClick={() => {
            setTab("signup");
            setErrorMessage(null);
            setInfoMessage(null);
          }}
        >
          Create Account
        </button>
      </div>

      {infoMessage && (
        <div
          style={{
            backgroundColor: "rgba(146, 92, 56, 0.08)",
            border: "1px solid rgba(146, 92, 56, 0.3)",
            color: "#925c38",
            padding: "0.75rem 1rem",
            fontSize: "0.85rem",
            marginBottom: "1.25rem",
            borderRadius: "2px",
            lineHeight: 1.5,
          }}
        >
          {infoMessage}
        </div>
      )}

      {errorMessage && (
        <div
          style={{
            backgroundColor: "rgba(180, 50, 50, 0.08)",
            border: "1px solid rgba(180, 50, 50, 0.3)",
            color: "#991b1b",
            padding: "0.75rem 1rem",
            fontSize: "0.85rem",
            marginBottom: "1.25rem",
            borderRadius: "2px",
            lineHeight: 1.5,
          }}
        >
          <div>{errorMessage}</div>
        </div>
      )}

      {tab === "signin" ? (
        <form onSubmit={handleSignIn} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div className="form-group">
            <label className="form-label" htmlFor="signin-email">
              Email Address
            </label>
            <input
              id="signin-email"
              type="email"
              required
              value={signInEmail}
              onChange={(e) => setSignInEmail(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label className="form-label" htmlFor="signin-password">
                Password
              </label>
            </div>
            <input
              id="signin-password"
              type="password"
              required
              value={signInPassword}
              onChange={(e) => setSignInPassword(e.target.value)}
              className="form-input"
            />
          </div>


          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-full"
            style={{ marginTop: "0.5rem", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Authenticating..." : "Sign In to Atelier"}
          </button>

          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            <span className="body-small">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setTab("signup");
                  setErrorMessage(null);
                  setInfoMessage(null);
                }}
                className="btn-link"
                style={{ fontSize: "0.75rem" }}
              >
                Create One
              </button>
            </span>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSignUp} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div className="form-group">
            <label className="form-label" htmlFor="signup-name">
              Full Name
            </label>
            <input
              id="signup-name"
              type="text"
              required
              value={signUpName}
              onChange={(e) => setSignUpName(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="signup-email">
              Email Address
            </label>
            <input
              id="signup-email"
              type="email"
              required
              value={signUpEmail}
              onChange={(e) => setSignUpEmail(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="signup-password">
              Create Password
            </label>
            <input
              id="signup-password"
              type="password"
              required
              value={signUpPassword}
              onChange={(e) => setSignUpPassword(e.target.value)}
              className="form-input"
            />
          </div>


          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-full"
            style={{ marginTop: "0.5rem", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Registering..." : "Register Account"}
          </button>

          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            <span className="body-small">
              Already registered?{" "}
              <button
                type="button"
                onClick={() => {
                  setTab("signin");
                  setErrorMessage(null);
                  setInfoMessage(null);
                }}
                className="btn-link"
                style={{ fontSize: "0.75rem" }}
              >
                Sign In
              </button>
            </span>
          </div>
        </form>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="site-container section">
      <Suspense
        fallback={
          <div className="site-container">
            <span className="micro-caps">Loading Client Portal...</span>
          </div>
        }
      >
        <LoginFormContent />
      </Suspense>
    </div>
  );
}
