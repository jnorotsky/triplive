"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/";

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push(from);
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Incorrect password");
        setLoading(false);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f7f4ef",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif',
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: "-0.04em",
              margin: "0 0 8px",
            }}
          >
            TripLive
          </h1>
          <p style={{ color: "#78716c", margin: 0 }}>Admin Dashboard</p>
        </div>

        {/* Card */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e7e5e4",
            borderRadius: 24,
            padding: 32,
            boxShadow: "0 4px 18px rgba(0,0,0,.05)",
          }}
        >
          <h2
            style={{
              fontSize: 20,
              fontWeight: 600,
              margin: "0 0 8px",
              letterSpacing: "-0.02em",
            }}
          >
            Sign in
          </h2>
          <p style={{ color: "#78716c", margin: "0 0 28px", fontSize: 14 }}>
            Enter your admin password to continue
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#57534e",
                  marginBottom: 8,
                }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                autoFocus
                style={{
                  width: "100%",
                  border: "1px solid #e7e5e4",
                  borderRadius: 12,
                  padding: "12px 14px",
                  fontSize: 15,
                  outline: "none",
                  background: "#fafaf9",
                  color: "#111",
                  boxSizing: "border-box",
                  transition: "border-color .15s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#111")}
                onBlur={(e) => (e.target.style.borderColor = "#e7e5e4")}
              />
            </div>

            {error && (
              <div
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: 10,
                  padding: "10px 14px",
                  fontSize: 13,
                  color: "#dc2626",
                  marginBottom: 16,
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                background: loading ? "#78716c" : "#111",
                color: "#fff",
                border: 0,
                borderRadius: 999,
                padding: "14px 20px",
                fontSize: 15,
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background .15s",
              }}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#f7f4ef" }} />}>
      <LoginForm />
    </Suspense>
  );
}
