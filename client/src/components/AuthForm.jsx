import { useState } from "react";
import { login, register, setToken } from "../api/checkout";

export default function AuthForm({ onAuthed }) {
  const [mode, setMode] = useState("login"); // login | register
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const fn = mode === "login" ? login : register;
      const { token, user } = await fn(email.trim(), password);
      setToken(token);
      onAuthed(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="auth" onSubmit={submit}>
      <h1>{mode === "login" ? "Sign in" : "Create account"}</h1>
      <p className="muted small">You need an account to book and pay.</p>

      <label>
        Email
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      <label>
        Password
        <input
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />
      </label>

      {error && <p role="alert" className="error">{error}</p>}

      <button className="pay-btn" disabled={busy}>
        {busy ? "…" : mode === "login" ? "Sign in" : "Sign up"}
      </button>

      <button
        type="button"
        className="link-btn"
        onClick={() => {
          setMode(mode === "login" ? "register" : "login");
          setError("");
        }}
      >
        {mode === "login" ? "Need an account? Sign up" : "Have an account? Sign in"}
      </button>
    </form>
  );
}
