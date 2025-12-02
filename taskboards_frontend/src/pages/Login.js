import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { theme } from "../theme";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await login(form);
      nav("/boards");
    } catch (e2) {
      setErr("Login failed");
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", background: theme.colors.surface, padding: 24, borderRadius: theme.radius.md, border: `1px solid ${theme.colors.border}`, boxShadow: `0 1px 3px ${theme.colors.shadow}` }}>
      <h2 style={{ marginTop: 0, color: theme.colors.primary }}>Welcome back</h2>
      <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
        <input
          type="email"
          required
          placeholder="Email"
          aria-label="Email address"
          value={form.email}
          onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
          style={{ padding: 10, border: `1px solid ${theme.colors.border}`, borderRadius: theme.radius.sm }}
        />
        <input
          type="password"
          required
          placeholder="Password"
          aria-label="Password"
          value={form.password}
          onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
          style={{ padding: 10, border: `1px solid ${theme.colors.border}`, borderRadius: theme.radius.sm }}
        />
        {err && <div role="alert" style={{ color: theme.colors.error, fontSize: 12 }}>{err}</div>}
        <button type="submit" aria-label="Sign in" style={{ background: theme.colors.primary, color: "#fff", border: "none", padding: "10px 14px", borderRadius: theme.radius.sm }}>
          Login
        </button>
      </form>
    </div>
  );
}
