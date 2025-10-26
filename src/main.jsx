import React, { useEffect, useMemo, useState } from "react";

import ReactDOM from "react-dom/client";

import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { Scan, Stethoscope, FileText, BookOpen } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// ---------- Prediction History Storage ----------

function savePredictionToStorage(prediction) {
  try {
    const existing = localStorage.getItem("carescan_predictions");
    const predictions = existing ? JSON.parse(existing) : [];
    predictions.unshift({
      ...prediction,
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
    });
    // Keep only last 50 predictions
    if (predictions.length > 50) predictions.length = 50;
    localStorage.setItem("carescan_predictions", JSON.stringify(predictions));
  } catch (e) {
    console.error("Failed to save prediction:", e);
  }
}

function getPredictionsFromStorage() {
  try {
    const existing = localStorage.getItem("carescan_predictions");
    return existing ? JSON.parse(existing) : [];
  } catch (e) {
    console.error("Failed to load predictions:", e);
    return [];
  }
}

// ---------- Medication Storage ----------

function saveMedicationToStorage(medication) {
  try {
    const existing = localStorage.getItem("carescan_medications");
    const medications = existing ? JSON.parse(existing) : [];
    medications.unshift({
      ...medication,
      id: Date.now() + Math.random(),
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem("carescan_medications", JSON.stringify(medications));
  } catch (e) {
    console.error("Failed to save medication:", e);
  }
}

function getMedicationsFromStorage() {
  try {
    const existing = localStorage.getItem("carescan_medications");
    return existing ? JSON.parse(existing) : [];
  } catch (e) {
    console.error("Failed to load medications:", e);
    return [];
  }
}

function deleteMedicationFromStorage(id) {
  try {
    const existing = localStorage.getItem("carescan_medications");
    const medications = existing ? JSON.parse(existing) : [];
    const filtered = medications.filter((m) => m.id !== id);
    localStorage.setItem("carescan_medications", JSON.stringify(filtered));
  } catch (e) {
    console.error("Failed to delete medication:", e);
  }
}

// ---------- Emergency Contact Storage ----------

function saveEmergencyContactToStorage(contact) {
  try {
    const existing = localStorage.getItem("carescan_emergency_contacts");
    const contacts = existing ? JSON.parse(existing) : [];
    contacts.unshift({
      ...contact,
      id: Date.now() + Math.random(),
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem(
      "carescan_emergency_contacts",
      JSON.stringify(contacts),
    );
  } catch (e) {
    console.error("Failed to save contact:", e);
  }
}

function getEmergencyContactsFromStorage() {
  try {
    const existing = localStorage.getItem("carescan_emergency_contacts");
    return existing ? JSON.parse(existing) : [];
  } catch (e) {
    console.error("Failed to load contacts:", e);
    return [];
  }
}

function deleteEmergencyContactFromStorage(id) {
  try {
    const existing = localStorage.getItem("carescan_emergency_contacts");
    const contacts = existing ? JSON.parse(existing) : [];
    const filtered = contacts.filter((c) => c.id !== id);
    localStorage.setItem(
      "carescan_emergency_contacts",
      JSON.stringify(filtered),
    );
  } catch (e) {
    console.error("Failed to delete contact:", e);
  }
}

// ---------- Shared UI ----------

function Container({ children, width = 1024, style, className }) {
  return (
    <div
      className={className || "fade-in"}
      style={{
        maxWidth: width,
        margin: "0 auto",
        padding: 16,
        boxSizing: "border-box",
        width: "100%",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Section({ title, children, style }) {
  return (
    <div
      className="slide-up"
      style={{
        marginBottom: 28,
        padding: 20,
        borderRadius: 14,
        background: "#fff",
        boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
        ...style,
      }}
    >
      {title && (
        <h2
          style={{
            margin: "0 0 12px 0",

            fontSize: 20,

            fontWeight: 800,
            backgroundImage: "linear-gradient(90deg, #0092FF, #8E24AA)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            letterSpacing: 0.2,
          }}
        >
          {title}
        </h2>
      )}

      <div>{children}</div>
    </div>
  );
}

function Card({
  children,
  onClick,
  image,
  overlay = true,
  style,
  footer,
  disabled,
}) {
  return (
    <div
      onClick={disabled ? undefined : onClick}
      role={onClick && !disabled ? "button" : undefined}
      style={{
        position: "relative",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        transition: "transform .25s ease, box-shadow .25s ease",
        animation: "slideUp .45s cubic-bezier(.22,1,.36,1) both",
        cursor: onClick && !disabled ? "pointer" : "default",
        background: "#fff",
        ...style,
      }}
    >
      {image && (
        <img
          src={image}
          alt=""
          style={{
            width: "100%",
            height: 180,
            objectFit: "cover",
            display: "block",
          }}
        />
      )}
      {image && overlay && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.25)",
          }}
        />
      )}
      <div
        style={{
          position: image ? "absolute" : "relative",
          inset: image ? "auto 0 0 0" : undefined,
          padding: 16,
          color: image ? "#fff" : "#333",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        {children}
      </div>
      {footer}
    </div>
  );
}

function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled,
  style,
}) {
  const bg =
    {
      primary: "#0092FF",
      danger: "#FF6B6B",
      purple: "#8E24AA",
      green: "#4CAF50",
      gray: "#999",
    }[variant] || "#0092FF";

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "12px 16px",
        borderRadius: 10,
        border: "1px solid transparent",
        background: disabled ? "#ccc" : bg,
        color: "#fff",
        animation: "fadeIn .4s ease both",
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  helper,
  min,
  max,
  step,
  required,
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      {label && (
        <label
          style={{
            display: "block",
            marginBottom: 6,
            fontWeight: 600,
            color: "#333",
          }}
        >
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        required={required}
        style={{
          width: "100%",
          padding: "12px 12px",
          borderRadius: 10,
          border: "1px solid #ddd",
          background: "#fff",
          outline: "none",
          fontSize: 14,
          color: "#333",
          boxSizing: "border-box",
        }}
      />
      {helper && (
        <div style={{ marginTop: 4, fontSize: 12, color: "#666" }}>
          {helper}
        </div>
      )}
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: 12 }}>
      {label && (
        <div style={{ marginBottom: 6, fontWeight: 600, color: "#333" }}>
          {label}
        </div>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "12px 12px",
          borderRadius: 10,
          border: "1px solid #ddd",
          background: "#fff",
          outline: "none",
          fontSize: 14,
          color: "#333",
          appearance: "none",
          boxSizing: "border-box",
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ResultBox({ title = "Result", children }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #eee",
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 8 }}>{title}</div>
      <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{children}</div>
    </div>
  );
}

function ErrorBox({ children }) {
  if (!children) return null;
  return (
    <div
      className="top-nav-glass"
      style={{
        marginTop: 12,
        background: "#FFE5E5",
        border: "1px solid #FFD0CC",
        borderRadius: 12,
        padding: 12,
        color: "#D63031",
      }}
    >
      {children}
    </div>
  );
}

// ---------- Top Navigation ----------

function useActivePath() {
  const loc = useLocation();
  return loc.pathname;
}

function NavLink({ to, label, isActive }) {
  return (
    <Link
      to={to}
      style={{
        textDecoration: "none",
        color: isActive ? "#0092FF" : "#444",
        fontWeight: isActive ? 700 : 600,
        padding: "8px 12px",
        borderRadius: 8,
        background: isActive ? "rgba(0,146,255,0.08)" : "transparent",
      }}
    >
      {label}
    </Link>
  );
}

function TopNav() {
  const active = useActivePath();
  const isScanner = active.startsWith("/scanner");

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        background: "#fff",
        borderBottom: "1px solid #f0f0f0",
      }}
    >
      <Container
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          paddingTop: 12,
          paddingBottom: 12,
        }}
      >
        <img
          src="/assets/carescan_logo.jpg"
          alt="CareScan"
          style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover" }}
        />
        <div
          style={{
            fontWeight: 800,
            fontSize: 18,
            color: "#222",
            marginRight: "auto",
          }}
        >
          CareScan Web
        </div>
        <nav style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <NavLink to="/" label="Home" isActive={active === "/"} />
          <NavLink to="/scanner" label="Scanner" isActive={isScanner} />
          <NavLink
            to="/health"
            label="Health"
            isActive={active.startsWith("/health")}
          />
          <NavLink
            to="/profile"
            label="Profile"
            isActive={active.startsWith("/profile")}
          />
        </nav>
      </Container>
    </div>
  );
}

// ---------- Auth Gate ----------
function AuthGate({ children }) {
  const [supabase] = useState(() =>
    createClient(
      "https://kgnkzozimkhiumedbfqb.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtnbmt6b3ppbWtoaXVtZWRiZnFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0ODE3NTMsImV4cCI6MjA3NzA1Nzc1M30.-CW3cPZ5BI_7-55Rsy6K9BL4dIfPzHorfYztkhENtWw",
    ),
  );
  const [user, setUser] = useState(undefined); // undefined => loading
  const [mode, setMode] = useState("signin"); // 'signin' | 'signup'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (active) setUser(data?.user ?? null);
      } catch (_e) {
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [supabase]);

  useEffect(() => {
    if (!supabase) return;
    const { data: { subscription } = { subscription: null } } =
      supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });
    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleSubmit(e) {
    e.preventDefault();
    console.log("Form submitted", { mode, email, hasSupabase: !!supabase });

    if (!supabase) {
      setError("Supabase client not initialized");
      console.error("No supabase client");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (mode === "signin") {
        console.log("Attempting sign in...");
        const { data, error: err } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        console.log("Sign in response:", { data, error: err });
        if (err) throw err;
      } else {
        console.log("Attempting sign up...");
        const { data, error: err } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name,
              surname: surname,
              full_name: `${name} ${surname}`,
            },
          },
        });
        console.log("Sign up response:", { data, error: err });
        if (err) throw err;
        if (data?.user && !data?.session) {
          setError("Check your email to verify your account");
        }
      }
    } catch (e) {
      console.error("Auth error:", e);
      setError(e.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
          boxSizing: "border-box",
        }}
      >
        <Container style={{ maxWidth: 480 }}>
          <Section title="Loading">
            <div>Preparing your experience...</div>
          </Section>
        </Container>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, #f7faff, #ffffff)",
          padding: "16px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "420px",
            margin: "0 auto",
          }}
        >
          <Section style={{ padding: "24px 20px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <img
                  src="/assets/carescan_logo.jpg"
                  alt="CareScan"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    objectFit: "cover",
                    flexShrink: 0,
                  }}
                />
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: "clamp(18px, 5vw, 20px)",
                    color: "#222",
                  }}
                >
                  CareScan
                </div>
              </div>

              <div
                style={{
                  fontSize: "clamp(16px, 4.5vw, 18px)",
                  fontWeight: 800,
                  color: "#333",
                }}
              >
                {mode === "signin" ? "Welcome back" : "Create your account"}
              </div>
              <div style={{ color: "#666", fontSize: "14px" }}>
                {mode === "signin"
                  ? "Sign in to continue"
                  : "Sign up to get started"}
              </div>

              <form
                onSubmit={handleSubmit}
                style={{ display: "grid", gap: 12 }}
              >
                {mode === "signup" && (
                  <>
                    <Input
                      label="Name"
                      value={name}
                      onChange={setName}
                      type="text"
                      placeholder="John"
                      required
                    />
                    <Input
                      label="Surname"
                      value={surname}
                      onChange={setSurname}
                      type="text"
                      placeholder="Doe"
                      required
                    />
                  </>
                )}
                <Input
                  label="Email"
                  value={email}
                  onChange={setEmail}
                  type="email"
                  placeholder="you@example.com"
                  required
                />
                <Input
                  label="Password"
                  value={password}
                  onChange={setPassword}
                  type="password"
                  placeholder="••••••••"
                  required
                />

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Button
                    type="button"
                    variant={mode === "signin" ? "purple" : "gray"}
                    onClick={(e) => {
                      e.preventDefault();
                      setMode("signin");
                    }}
                    style={{ flex: "1 1 auto", minWidth: "100px" }}
                  >
                    Sign In
                  </Button>
                  <Button
                    type="button"
                    variant={mode === "signup" ? "purple" : "gray"}
                    onClick={(e) => {
                      e.preventDefault();
                      setMode("signup");
                    }}
                    style={{ flex: "1 1 auto", minWidth: "100px" }}
                  >
                    Sign Up
                  </Button>
                </div>

                <Button
                  type="submit"
                  disabled={loading || !supabase}
                  style={{ width: "100%" }}
                  onClick={(e) => {
                    console.log("Submit button clicked");
                  }}
                >
                  {loading
                    ? mode === "signin"
                      ? "Signing in..."
                      : "Signing up..."
                    : mode === "signin"
                      ? "Continue"
                      : "Create Account"}
                </Button>
                {!supabase && (
                  <div style={{ color: "#FF6B6B", fontSize: 12 }}>
                    Initializing authentication...
                  </div>
                )}
                <ErrorBox>{error}</ErrorBox>
              </form>
            </div>
          </Section>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// ---------- Pages ----------

function Home() {
  const navigate = useNavigate();
  const [supabase] = useState(() =>
    createClient(
      "https://kgnkzozimkhiumedbfqb.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtnbmt6b3ppbWtoaXVtZWRiZnFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0ODE3NTMsImV4cCI6MjA3NzA1Nzc1M30.-CW3cPZ5BI_7-55Rsy6K9BL4dIfPzHorfYztkhENtWw",
    ),
  );
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user?.user_metadata?.name) {
        setUserName(data.user.user_metadata.name);
      }
    })();
  }, [supabase]);

  const cards = [
    {
      title: "Predict Disease",
      button: "Begin",
      nav: "/scanner",
    },
    {
      title: "Consult a Doctor",
      button: "Find Doctor",
      nav: "/consult",
    },
    {
      title: "View Health Reports",
      button: "View",
      nav: "/reports",
    },
    {
      title: "Learn About Conditions",
      button: "Explore",
      nav: "/learn",
    },
    {
      title: "Medications",
      button: "Manage",
      nav: "/medications",
    },
    {
      title: "Emergency Contacts",
      button: "View",
      nav: "/emergency",
    },
    {
      title: "Health Trends",
      button: "View Charts",
      nav: "/trends",
    },
  ];

  return (
    <Container>
      <Section>
        <div
          style={{
            padding: "16px 0",

            display: "flex",

            alignItems: "center",

            gap: 8,

            color: "#666",
          }}
        >
          <span>Welcome back,</span>

          <strong style={{ color: "#333" }}>{userName}</strong>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
          {cards.map((c, i) => (
            <Card
              key={i}
              onClick={c.nav ? () => navigate(c.nav) : undefined}
              disabled={!c.nav}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    background: "linear-gradient(135deg, #0092FF, #8E24AA)",
                    color: "#fff",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 8px 16px rgba(0,0,0,0.12)",
                  }}
                >
                  {c.title === "Predict Disease" ? (
                    <Scan size={22} />
                  ) : c.title === "Consult a Doctor" ? (
                    <Stethoscope size={22} />
                  ) : c.title === "View Health Reports" ? (
                    <FileText size={22} />
                  ) : c.title === "Learn About Conditions" ? (
                    <BookOpen size={22} />
                  ) : c.title === "Medications" ? (
                    <span style={{ fontSize: 22 }}>💊</span>
                  ) : c.title === "Emergency Contacts" ? (
                    <span style={{ fontSize: 22 }}>🚨</span>
                  ) : (
                    <span style={{ fontSize: 22 }}>📈</span>
                  )}
                </div>
                <div style={{ fontWeight: 800, fontSize: 18, color: "#333" }}>
                  {c.title}
                </div>
              </div>
              <Button disabled={!c.nav}>{c.button}</Button>
            </Card>
          ))}
        </div>
      </Section>
    </Container>
  );
}

function Scanner() {
  const items = [
    {
      name: "Skin Disease",
      image: "/assets/skin_disease.jpg",
      to: "/scanner/skin",
      description: "Analyze skin conditions",
      status: "Available",
      statusColor: "#00C853",
    },
    {
      name: "Pneumonia",
      image: "/assets/pneumonia.jpg",
      to: "/scanner/pneumonia",
      description: "Check for pneumonia signs",
      status: "Available",
      statusColor: "#00C853",
    },
    {
      name: "Lung Cancer",
      image: "/assets/lung_cancer.jpg",
      to: "/scanner/lung-cancer",
      description: "Early detection scan",
      status: "Available",
      statusColor: "#00C853",
    },
    {
      name: "Diabetes",
      image: "/assets/diabetes.jpg",
      to: "/scanner/diabetes",
      description: "Diabetes risk assessment",
      status: "Available",
      statusColor: "#00C853",
    },
    {
      name: "Hypertension",
      image: "/assets/hypertension.jpg",
      to: "/scanner/hypertension",
      description: "Blood pressure analysis",
      status: "Available",
      statusColor: "#00C853",
    },
    {
      name: "Chronic Kidney Disease",
      image: "/assets/kidney_disease.jpg",
      to: "/scanner/ckd",
      description: "Kidney health check",
      status: "Available",
      statusColor: "#00C853",
    },
  ];

  return (
    <Container>
      <Section title="AI Health Scanner">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 24,
            padding: 8,
          }}
        >
          {items.map((item) => (
            <Link key={item.to} to={item.to} style={{ textDecoration: "none" }}>
              <Card image={item.image} onClick={() => {}}>
                <div style={{ color: "#fff" }}>
                  <div style={{ fontWeight: 700 }}>{item.name}</div>
                  <div style={{ fontSize: 12, opacity: 0.85 }}>
                    {item.description}
                  </div>
                </div>

                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 10px",
                    borderRadius: 999,
                    backgroundImage:
                      "linear-gradient(135deg, #0092FF, #8E24AA)",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 700,
                    boxShadow: "0 8px 16px rgba(0,0,0,0.12)",
                  }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      background: "#fff",
                      opacity: 0.9,
                    }}
                  />
                  <span>{item.status}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </Section>
    </Container>
  );
}

function Health() {
  const metrics = [
    {
      title: "Blood Pressure",
      value: "120/80",
      unit: "mmHg",
      change: "-5%",
      color: "#FF6B6B",
    },
    {
      title: "Blood Sugar",
      value: "95",
      unit: "mg/dL",
      change: "+2%",
      color: "#4CAF50",
    },
    {
      title: "Heart Rate",
      value: "72",
      unit: "bpm",
      change: "stable",
      color: "#FF9800",
    },
    {
      title: "Sleep",
      value: "7.5",
      unit: "hours",
      change: "+30min",
      color: "#2196F3",
    },
  ];

  const activities = [
    { title: "Walking", value: "8,234", unit: "steps", color: "#4CAF50" },
    { title: "Water", value: "6/8", unit: "glasses", color: "#2196F3" },
    { title: "Exercise", value: "45", unit: "minutes", color: "#FF9800" },
  ];

  return (
    <Container>
      <Section>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#333" }}>
            Health Overview
          </div>
          <div style={{ color: "#666" }}>Track your daily wellness</div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 24,
            marginBottom: 24,
            padding: 8,
          }}
        >
          {metrics.map((m, i) => (
            <div
              key={i}
              style={{
                borderRadius: 14,
                border: "1px solid #eee",
                padding: 18,
                background: "#fff",
                boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
                transition: "transform .2s ease, box-shadow .25s ease",
              }}
            >
              <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>
                {m.title}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <div style={{ fontWeight: 800, fontSize: 22 }}>{m.value}</div>
                <div style={{ color: "#666" }}>{m.unit}</div>
              </div>
              <div
                style={{
                  marginTop: 8,
                  background: `${m.color}15`,
                  color: m.color,
                  padding: "6px 8px",
                  borderRadius: 8,
                  display: "inline-block",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {m.change}
              </div>
            </div>
          ))}
        </div>

        <Section title="Today's Activities" style={{ marginBottom: 8 }}>
          <div style={{ borderRadius: 12, background: "#f7f7f7", padding: 16 }}>
            <div style={{ display: "grid", gap: 12 }}>
              {activities.map((a, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "#fff",
                    borderRadius: 12,
                    border: "1px solid #eee",
                    padding: 12,
                  }}
                >
                  <div style={{ color: "#333", fontWeight: 600 }}>
                    {a.title}
                  </div>
                  <div style={{ color: "#333", fontWeight: 700 }}>
                    {a.value}{" "}
                    <span style={{ color: "#666", fontWeight: 500 }}>
                      {a.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Button variant="purple">Add Measurement</Button>

        <button
          className="fab"
          aria-label="Add measurement"
          title="Add measurement"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          +
        </button>
      </Section>
    </Container>
  );
}

function Profile() {
  const [supabase] = useState(() =>
    createClient(
      "https://kgnkzozimkhiumedbfqb.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtnbmt6b3ppbWtoaXVtZWRiZnFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0ODE3NTMsImV4cCI6MjA3NzA1Nzc1M30.-CW3cPZ5BI_7-55Rsy6K9BL4dIfPzHorfYztkhENtWw",
    ),
  );
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (active) setUser(data?.user ?? null);
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setUser(session?.user ?? null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleSignOut() {
    if (!supabase) return;
    setLoading(true);
    setError("");
    try {
      await supabase.auth.signOut();
    } catch (e) {
      setError(e.message || "Sign out failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container>
      <Section>
        {user ? (
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  background: "linear-gradient(135deg, #0092FF, #8E24AA)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 24,
                  fontWeight: 800,
                }}
              >
                {user.user_metadata?.name?.charAt(0)?.toUpperCase() ||
                  user.email.charAt(0).toUpperCase()}
              </div>

              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#333" }}>
                  {user.user_metadata?.full_name || user.email}
                </div>
                <div style={{ fontSize: 14, color: "#666" }}>{user.email}</div>
              </div>
            </div>

            <Button variant="danger" onClick={handleSignOut} disabled={loading}>
              {loading ? "Signing out..." : "Sign Out"}
            </Button>

            {error && <ErrorBox>{error}</ErrorBox>}
          </div>
        ) : (
          <div style={{ textAlign: "center", color: "#666" }}>
            Please sign in from the login page
          </div>
        )}
      </Section>
    </Container>
  );
}

function ConsultDoctor() {
  const doctors = [
    {
      name: "Dr. Rajesh Sharma",
      specialty: "Cardiologist",
      experience: "15 years",
      phone: "+91 9876543210",
    },
    {
      name: "Dr. Priya Mehta",
      specialty: "Dermatologist",
      experience: "12 years",
      phone: "+91 9876543211",
    },
    {
      name: "Dr. Amit Verma",
      specialty: "General Physician",
      experience: "10 years",
      phone: "+91 9876543212",
    },
    {
      name: "Dr. Sneha Reddy",
      specialty: "Pulmonologist",
      experience: "18 years",
      phone: "+91 9876543213",
    },
    {
      name: "Dr. Vikram Patel",
      specialty: "Endocrinologist",
      experience: "14 years",
      phone: "+91 9876543214",
    },
    {
      name: "Dr. Kavita Singh",
      specialty: "Nephrologist",
      experience: "16 years",
      phone: "+91 9876543215",
    },
    {
      name: "Dr. Anil Kumar",
      specialty: "Oncologist",
      experience: "20 years",
      phone: "+91 9876543216",
    },
    {
      name: "Dr. Neha Gupta",
      specialty: "Neurologist",
      experience: "13 years",
      phone: "+91 9876543217",
    },
    {
      name: "Dr. Sanjay Desai",
      specialty: "Rheumatologist",
      experience: "11 years",
      phone: "+91 9876543218",
    },
    {
      name: "Dr. Meera Iyer",
      specialty: "Gastroenterologist",
      experience: "17 years",
      phone: "+91 9876543219",
    },
  ];

  return (
    <Container>
      <Section title="Consult a Doctor">
        <div style={{ color: "#666", marginBottom: 20, fontSize: 15 }}>
          Connect with verified medical professionals
        </div>
        <div style={{ display: "grid", gap: 20 }}>
          {doctors.map((doctor, idx) => (
            <div
              key={idx}
              style={{
                background: "#fff",
                border: "1px solid #eee",
                borderRadius: 12,
                padding: 20,
                display: "grid",
                gap: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                transition: "box-shadow 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
              }}
            >
              <div
                style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    background: "linear-gradient(135deg, #0092FF, #8E24AA)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 22,
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  {doctor.name.split(" ")[1].charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: 17,
                      color: "#222",
                      marginBottom: 4,
                    }}
                  >
                    {doctor.name}
                  </div>
                  <div
                    style={{
                      display: "inline-block",
                      fontSize: 12,
                      color: "#8E24AA",
                      fontWeight: 700,
                      background: "#F3E5FF",
                      padding: "4px 10px",
                      borderRadius: 6,
                    }}
                  >
                    {doctor.specialty}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  paddingTop: 8,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#999",
                      marginBottom: 4,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    Experience
                  </div>
                  <div style={{ fontSize: 14, color: "#333", fontWeight: 600 }}>
                    {doctor.experience}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#999",
                      marginBottom: 4,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    Phone
                  </div>
                  <div
                    style={{ fontSize: 14, color: "#0092FF", fontWeight: 600 }}
                  >
                    {doctor.phone}
                  </div>
                </div>
              </div>

              <Button
                variant="primary"
                style={{ width: "100%", marginTop: 4 }}
                onClick={() => window.open(`tel:${doctor.phone}`, "_self")}
              >
                📞 Call Now
              </Button>
            </div>
          ))}
        </div>
      </Section>
    </Container>
  );
}

// ---------- Medications Page ----------
function Medications() {
  const [medications, setMedications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("Once daily");
  const [time, setTime] = useState("08:00");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    loadMedications();
  }, []);

  function loadMedications() {
    const stored = getMedicationsFromStorage();
    setMedications(stored);
  }

  function handleSubmit(e) {
    e.preventDefault();
    saveMedicationToStorage({
      name,
      dosage,
      frequency,
      time,
      notes,
    });
    setName("");
    setDosage("");
    setFrequency("Once daily");
    setTime("08:00");
    setNotes("");
    setShowForm(false);
    loadMedications();
  }

  function handleDelete(id) {
    if (confirm("Delete this medication?")) {
      deleteMedicationFromStorage(id);
      loadMedications();
    }
  }

  return (
    <Container>
      <Section title="Medication Reminders">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div style={{ color: "#666", fontSize: 15 }}>
            Track your medications and set reminders
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "+ Add Medication"}
          </Button>
        </div>

        {showForm && (
          <div
            style={{
              background: "#f8f9fa",
              borderRadius: 12,
              padding: 20,
              marginBottom: 20,
            }}
          >
            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
              <Input
                label="Medicine Name"
                value={name}
                onChange={setName}
                placeholder="e.g., Metformin"
                required
              />
              <Input
                label="Dosage"
                value={dosage}
                onChange={setDosage}
                placeholder="e.g., 500mg"
                required
              />
              <Select
                label="Frequency"
                value={frequency}
                onChange={setFrequency}
                options={[
                  { label: "Once daily", value: "Once daily" },
                  { label: "Twice daily", value: "Twice daily" },
                  { label: "Three times daily", value: "Three times daily" },
                  { label: "As needed", value: "As needed" },
                ]}
              />
              <Input
                label="Time"
                value={time}
                onChange={setTime}
                type="time"
                required
              />
              <Input
                label="Notes (Optional)"
                value={notes}
                onChange={setNotes}
                placeholder="e.g., Take with food"
              />
              <Button type="submit">Save Medication</Button>
            </form>
          </div>
        )}

        {medications.length === 0 ? (
          <div
            style={{
              border: "1px dashed #ccc",
              borderRadius: 12,
              padding: 32,
              background: "#f9f9f9",
              color: "#999",
              textAlign: "center",
            }}
          >
            No medications added yet. Click "Add Medication" to start.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {medications.map((med) => (
              <div
                key={med.id}
                style={{
                  background: "#fff",
                  border: "1px solid #eee",
                  borderRadius: 12,
                  padding: 16,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: 16,
                      color: "#222",
                      marginBottom: 4,
                    }}
                  >
                    {med.name}
                  </div>
                  <div style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>
                    💊 {med.dosage} • 🕐 {med.frequency} at {med.time}
                  </div>
                  {med.notes && (
                    <div style={{ fontSize: 13, color: "#999", marginTop: 4 }}>
                      📝 {med.notes}
                    </div>
                  )}
                </div>
                <Button
                  variant="danger"
                  onClick={() => handleDelete(med.id)}
                  style={{ padding: "8px 12px", fontSize: 13 }}
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        )}

        <div
          style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}
        >
          <Button onClick={() => exportReportAsPDF(predictions)}>
            📄 Export as PDF
          </Button>
          <Link to="/trends" style={{ textDecoration: "none" }}>
            <Button variant="purple">📈 View Trends</Button>
          </Link>
        </div>
      </Section>
    </Container>
  );
}

// ---------- PDF Export Utility ----------
async function exportReportAsPDF(predictions) {
  try {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("CareScan Health Report", 20, 20);

    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 30);

    let yPos = 45;

    if (predictions.length === 0) {
      doc.text("No predictions available.", 20, yPos);
    } else {
      predictions.forEach((pred, idx) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(14);
        doc.text(`${idx + 1}. ${pred.type}`, 20, yPos);
        yPos += 7;

        doc.setFontSize(10);
        doc.text(
          `Date: ${new Date(pred.timestamp).toLocaleString()}`,
          25,
          yPos,
        );
        yPos += 6;

        doc.text(`Result: ${pred.result || "N/A"}`, 25, yPos);
        yPos += 6;

        if (pred.parameters) {
          doc.text("Parameters:", 25, yPos);
          yPos += 6;
          Object.entries(pred.parameters).forEach(([key, value]) => {
            if (yPos > 270) {
              doc.addPage();
              yPos = 20;
            }
            doc.text(`  ${key}: ${value}`, 30, yPos);
            yPos += 5;
          });
        }

        if (pred.details) {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(`Details: ${pred.details}`, 25, yPos);
          yPos += 6;
        }

        yPos += 5;
      });
    }

    doc.save(`CareScan_Report_${new Date().toISOString().split("T")[0]}.pdf`);
    alert("Report exported successfully!");
  } catch (error) {
    console.error("Failed to export PDF:", error);
    alert("Failed to export PDF. Please try again.");
  }
}

// ---------- Emergency Contacts Page ----------
function EmergencyContacts() {
  const [contacts, setContacts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    loadContacts();
  }, []);

  function loadContacts() {
    const stored = getEmergencyContactsFromStorage();
    setContacts(stored);
  }

  function handleSubmit(e) {
    e.preventDefault();
    saveEmergencyContactToStorage({
      name,
      relationship,
      phone,
      email,
    });
    setName("");
    setRelationship("");
    setPhone("");
    setEmail("");
    setShowForm(false);
    loadContacts();
  }

  function handleDelete(id) {
    if (confirm("Delete this contact?")) {
      deleteEmergencyContactFromStorage(id);
      loadContacts();
    }
  }

  return (
    <Container>
      <Section title="Emergency Contacts">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div style={{ color: "#666", fontSize: 15 }}>
            Keep important contacts handy for emergencies
          </div>
          <Button onClick={() => setShowForm(!showForm)} variant="danger">
            {showForm ? "Cancel" : "+ Add Contact"}
          </Button>
        </div>

        {showForm && (
          <div
            style={{
              background: "#fff5f5",
              borderRadius: 12,
              padding: 20,
              marginBottom: 20,
              border: "1px solid #ffcccc",
            }}
          >
            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
              <Input
                label="Name"
                value={name}
                onChange={setName}
                placeholder="e.g., Dr. Sharma"
                required
              />
              <Input
                label="Relationship"
                value={relationship}
                onChange={setRelationship}
                placeholder="e.g., Family Doctor"
                required
              />
              <Input
                label="Phone Number"
                value={phone}
                onChange={setPhone}
                type="tel"
                placeholder="+91 98765 43210"
                required
              />
              <Input
                label="Email (Optional)"
                value={email}
                onChange={setEmail}
                type="email"
                placeholder="doctor@example.com"
              />
              <Button type="submit" variant="danger">
                Save Contact
              </Button>
            </form>
          </div>
        )}

        <div style={{ display: "grid", gap: 12, marginBottom: 20 }}>
          <div
            style={{
              background: "#fff5f5",
              border: "1px solid #ffcccc",
              borderRadius: 12,
              padding: 16,
            }}
          >
            <div
              style={{
                fontWeight: 700,
                color: "#d63031",
                marginBottom: 8,
                fontSize: 16,
              }}
            >
              🚨 Quick Emergency Numbers
            </div>
            <div style={{ display: "grid", gap: 8, fontSize: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Ambulance</span>
                <a
                  href="tel:108"
                  style={{
                    color: "#0092FF",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  108
                </a>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Police</span>
                <a
                  href="tel:100"
                  style={{
                    color: "#0092FF",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  100
                </a>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Fire</span>
                <a
                  href="tel:101"
                  style={{
                    color: "#0092FF",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  101
                </a>
              </div>
            </div>
          </div>
        </div>

        {contacts.length === 0 ? (
          <div
            style={{
              border: "1px dashed #ccc",
              borderRadius: 12,
              padding: 32,
              background: "#f9f9f9",
              color: "#999",
              textAlign: "center",
            }}
          >
            No emergency contacts added yet.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {contacts.map((contact) => (
              <div
                key={contact.id}
                style={{
                  background: "#fff",
                  border: "1px solid #eee",
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 12,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: 16,
                        color: "#222",
                        marginBottom: 2,
                      }}
                    >
                      {contact.name}
                    </div>
                    <div style={{ fontSize: 13, color: "#999" }}>
                      {contact.relationship}
                    </div>
                  </div>
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(contact.id)}
                    style={{ padding: "6px 10px", fontSize: 12 }}
                  >
                    Delete
                  </Button>
                </div>
                <div style={{ display: "grid", gap: 8, fontSize: 14 }}>
                  <a
                    href={`tel:${contact.phone}`}
                    style={{
                      color: "#0092FF",
                      fontWeight: 600,
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    📞 {contact.phone}
                  </a>
                  {contact.email && (
                    <a
                      href={`mailto:${contact.email}`}
                      style={{
                        color: "#666",
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      ✉️ {contact.email}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </Container>
  );
}

// ---------- Health Trends Page ----------
function HealthTrends() {
  const [predictions, setPredictions] = useState([]);

  useEffect(() => {
    const stored = getPredictionsFromStorage();
    setPredictions(stored);
  }, []);

  // Group predictions by type
  const groupedPredictions = predictions.reduce((acc, pred) => {
    if (!acc[pred.type]) acc[pred.type] = [];
    acc[pred.type].push(pred);
    return acc;
  }, {});

  const diabetesData = predictions
    .filter((p) => p.type === "Diabetes" && p.parameters)
    .slice(0, 10)
    .reverse()
    .map((p) => ({
      date: new Date(p.timestamp).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      }),
      glucose: parseFloat(p.parameters.Glucose) || 0,
      bmi: parseFloat(p.parameters.BMI) || 0,
    }));

  const hypertensionData = predictions
    .filter((p) => p.type === "Hypertension" && p.parameters)
    .slice(0, 10)
    .reverse()
    .map((p) => ({
      date: new Date(p.timestamp).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      }),
      glucose: parseFloat(p.parameters["Blood Glucose"]) || 0,
      bmi: parseFloat(p.parameters.BMI) || 0,
    }));

  return (
    <Container>
      <Section title="Health Trends & Analytics">
        <div style={{ color: "#666", marginBottom: 20, fontSize: 15 }}>
          Track your health metrics over time
        </div>

        {predictions.length === 0 ? (
          <div
            style={{
              border: "1px dashed #ccc",
              borderRadius: 12,
              padding: 32,
              background: "#f9f9f9",
              color: "#999",
              textAlign: "center",
            }}
          >
            No data yet. Make predictions to see trends.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 20 }}>
            <div
              style={{
                background: "#fff",
                border: "1px solid #eee",
                borderRadius: 12,
                padding: 20,
              }}
            >
              <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 16 }}>
                📊 Prediction Summary
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: 16,
                }}
              >
                {Object.entries(groupedPredictions).map(([type, preds]) => (
                  <div
                    key={type}
                    style={{
                      background: "#f8f9fa",
                      borderRadius: 10,
                      padding: 16,
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 24,
                        fontWeight: 800,
                        color: "#0092FF",
                      }}
                    >
                      {preds.length}
                    </div>
                    <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
                      {type}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {diabetesData.length > 0 && (
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #eee",
                  borderRadius: 12,
                  padding: 20,
                }}
              >
                <div
                  style={{ fontWeight: 800, fontSize: 16, marginBottom: 12 }}
                >
                  📈 Diabetes Glucose Trends
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: 14,
                    }}
                  >
                    <thead>
                      <tr style={{ borderBottom: "2px solid #eee" }}>
                        <th
                          style={{
                            padding: 12,
                            textAlign: "left",
                            color: "#666",
                          }}
                        >
                          Date
                        </th>
                        <th
                          style={{
                            padding: 12,
                            textAlign: "right",
                            color: "#666",
                          }}
                        >
                          Glucose
                        </th>
                        <th
                          style={{
                            padding: 12,
                            textAlign: "right",
                            color: "#666",
                          }}
                        >
                          BMI
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {diabetesData.map((d, i) => (
                        <tr
                          key={i}
                          style={{ borderBottom: "1px solid #f0f0f0" }}
                        >
                          <td style={{ padding: 12 }}>{d.date}</td>
                          <td
                            style={{
                              padding: 12,
                              textAlign: "right",
                              fontWeight: 600,
                              color: d.glucose > 140 ? "#FF6B6B" : "#4CAF50",
                            }}
                          >
                            {d.glucose}
                          </td>
                          <td
                            style={{
                              padding: 12,
                              textAlign: "right",
                              fontWeight: 600,
                            }}
                          >
                            {d.bmi.toFixed(1)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {hypertensionData.length > 0 && (
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #eee",
                  borderRadius: 12,
                  padding: 20,
                }}
              >
                <div
                  style={{ fontWeight: 800, fontSize: 16, marginBottom: 12 }}
                >
                  ❤️ Hypertension Trends
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: 14,
                    }}
                  >
                    <thead>
                      <tr style={{ borderBottom: "2px solid #eee" }}>
                        <th
                          style={{
                            padding: 12,
                            textAlign: "left",
                            color: "#666",
                          }}
                        >
                          Date
                        </th>
                        <th
                          style={{
                            padding: 12,
                            textAlign: "right",
                            color: "#666",
                          }}
                        >
                          Blood Glucose
                        </th>
                        <th
                          style={{
                            padding: 12,
                            textAlign: "right",
                            color: "#666",
                          }}
                        >
                          BMI
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {hypertensionData.map((d, i) => (
                        <tr
                          key={i}
                          style={{ borderBottom: "1px solid #f0f0f0" }}
                        >
                          <td style={{ padding: 12 }}>{d.date}</td>
                          <td
                            style={{
                              padding: 12,
                              textAlign: "right",
                              fontWeight: 600,
                            }}
                          >
                            {d.glucose}
                          </td>
                          <td
                            style={{
                              padding: 12,
                              textAlign: "right",
                              fontWeight: 600,
                            }}
                          >
                            {d.bmi.toFixed(1)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div
              style={{
                background: "#fff",
                border: "1px solid #eee",
                borderRadius: 12,
                padding: 20,
              }}
            >
              <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 12 }}>
                📅 Recent Activity
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                {predictions.slice(0, 5).map((pred) => (
                  <div
                    key={pred.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: 12,
                      background: "#f8f9fa",
                      borderRadius: 8,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>
                        {pred.type}
                      </div>
                      <div style={{ fontSize: 12, color: "#999" }}>
                        {new Date(pred.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div
                      style={{ fontSize: 13, color: "#666", fontWeight: 600 }}
                    >
                      {pred.result}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Section>
    </Container>
  );
}

function HealthReports() {
  const [predictions, setPredictions] = useState([]);

  useEffect(() => {
    const loadPredictions = () => {
      const stored = getPredictionsFromStorage();
      setPredictions(stored);
    };
    loadPredictions();

    // Refresh on storage changes
    const handleStorage = () => loadPredictions();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <Container>
      <Section title="Health Reports">
        <div style={{ color: "#666", marginBottom: 16, fontSize: 15 }}>
          Your prediction history and results
        </div>

        {predictions.length === 0 ? (
          <div
            style={{
              border: "1px dashed #ccc",
              borderRadius: 12,
              padding: 32,
              background: "#f9f9f9",
              color: "#999",
              textAlign: "center",
            }}
          >
            No reports yet. Start by making predictions.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {predictions.map((pred) => (
              <div
                key={pred.id}
                style={{
                  background: "#fff",
                  border: "1px solid #eee",
                  borderRadius: 12,
                  padding: 20,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 12,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: 16,
                        color: "#222",
                        marginBottom: 4,
                      }}
                    >
                      {pred.type}
                    </div>
                    <div style={{ fontSize: 12, color: "#999" }}>
                      {new Date(pred.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "inline-block",
                      padding: "6px 12px",
                      borderRadius: 8,
                      background:
                        pred.result?.includes("Detected") ||
                        pred.result?.includes("Diabetic") ||
                        pred.result?.includes("Hypertension")
                          ? "#FFE5E5"
                          : "#E5F6FF",
                      color:
                        pred.result?.includes("Detected") ||
                        pred.result?.includes("Diabetic") ||
                        pred.result?.includes("Hypertension")
                          ? "#FF6B6B"
                          : "#4CAF50",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {pred.result || "Completed"}
                  </div>
                </div>

                {pred.parameters && (
                  <div
                    style={{
                      background: "#F8F9FA",
                      borderRadius: 8,
                      padding: 12,
                      marginTop: 12,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        color: "#666",
                        fontWeight: 700,
                        marginBottom: 8,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      Parameters
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(150px, 1fr))",
                        gap: 8,
                        fontSize: 13,
                      }}
                    >
                      {Object.entries(pred.parameters).map(([key, value]) => (
                        <div key={key} style={{ color: "#555" }}>
                          <span style={{ fontWeight: 600, color: "#333" }}>
                            {key}:
                          </span>{" "}
                          {value}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {pred.details && (
                  <div
                    style={{
                      marginTop: 12,
                      fontSize: 14,
                      color: "#666",
                      lineHeight: 1.5,
                    }}
                  >
                    {pred.details}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Section>
    </Container>
  );
}

function LearnConditions() {
  const conditions = [
    {
      title: "Diabetes",
      description:
        "A chronic condition that affects how your body turns food into energy and regulates blood glucose levels.",
      symptoms: [
        "Increased thirst and frequent urination",
        "Fatigue and blurred vision",
        "Slow-healing sores or frequent infections",
      ],
      prevention: [
        "Maintain a healthy weight and stay active",
        "Follow a balanced diet; limit added sugars",
        "Regular health check-ups and glucose monitoring",
      ],
    },
    {
      title: "Hypertension (High Blood Pressure)",
      description:
        "A condition where the force of blood against your artery walls is consistently too high, increasing the risk of heart disease and stroke.",
      symptoms: [
        "Often no noticeable symptoms",
        "Severe hypertension may cause headaches or shortness of breath",
      ],
      prevention: [
        "Reduce sodium intake and eat heart-healthy foods",
        "Exercise regularly and manage stress",
        "Limit alcohol and avoid tobacco",
      ],
    },
    {
      title: "Chronic Kidney Disease (CKD)",
      description:
        "A gradual loss of kidney function over time, affecting the body’s ability to filter wastes and excess fluids.",
      symptoms: [
        "Fatigue and swelling in legs/ankles",
        "Changes in urination patterns",
        "Nausea, muscle cramps, or itching",
      ],
      prevention: [
        "Control diabetes and blood pressure",
        "Stay hydrated; avoid excessive NSAID use",
        "Regular kidney function screening if at risk",
      ],
    },
    {
      title: "Lung Cancer",
      description:
        "A type of cancer that begins in the lungs; risk increases with smoking and certain environmental exposures.",
      symptoms: [
        "Persistent cough or coughing up blood",
        "Chest pain or shortness of breath",
        "Unexplained weight loss and fatigue",
      ],
      prevention: [
        "Avoid smoking; seek support for cessation",
        "Limit exposure to pollutants and radon",
        "Regular screenings for high-risk individuals",
      ],
    },
    {
      title: "Pneumonia",
      description:
        "An infection that inflames the air sacs in one or both lungs, which may fill with fluid or pus.",
      symptoms: [
        "Chest pain when breathing or coughing",
        "Cough with phlegm, fever, chills",
        "Shortness of breath and fatigue",
      ],
      prevention: [
        "Vaccination (e.g., flu, pneumococcal) where appropriate",
        "Good hand hygiene and respiratory etiquette",
        "Seek medical care promptly if symptoms worsen",
      ],
    },
    {
      title: "Skin Diseases",
      description:
        "A broad category including conditions like eczema, psoriasis, acne, and infections affecting the skin’s health and appearance.",
      symptoms: [
        "Rash, redness, or itching",
        "Dry, scaly, or inflamed patches",
        "Lesions, bumps, or changes in moles",
      ],
      prevention: [
        "Gentle skincare; avoid harsh irritants",
        "Sun protection and proper moisturization",
        "Consult a dermatologist for persistent changes",
      ],
    },
  ];

  const icons = {
    Diabetes: "🩸",
    "Hypertension (High Blood Pressure)": "❤️",
    "Chronic Kidney Disease (CKD)": "🧪",
    "Lung Cancer": "🫁",
    Pneumonia: "🤧",
    "Skin Diseases": "🧴",
  };

  return (
    <Container>
      <Section title="Learn About Conditions">
        <div style={{ color: "#666", marginBottom: 12 }}>
          Educational information about common conditions. This is not a
          diagnosis.
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          {conditions.map((c, idx) => (
            <Card key={idx}>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      background: "linear-gradient(135deg, #0092FF, #8E24AA)",
                      color: "#fff",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                      fontWeight: 700,
                      boxShadow: "0 8px 16px rgba(0,0,0,0.12)",
                    }}
                  >
                    {icons[c.title] || "ℹ️"}
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 16, color: "#333" }}>
                    {c.title}
                  </div>
                </div>

                <div style={{ color: "#555" }}>{c.description}</div>

                <div style={{ marginTop: 6 }}>
                  <div
                    style={{ fontWeight: 700, color: "#333", marginBottom: 4 }}
                  >
                    Common symptoms
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 18, color: "#555" }}>
                    {c.symptoms.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ marginTop: 6 }}>
                  <div
                    style={{ fontWeight: 700, color: "#333", marginBottom: 4 }}
                  >
                    Prevention tips
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 18, color: "#555" }}>
                    {c.prevention.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Section>
    </Container>
  );
}

// ---------- Scanner Detail Pages with APIs ----------

// Skin Disease prediction
function SkinDisease() {
  const API_URL = "https://walgar-skin-2.hf.space/predict";
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [raw, setRaw] = useState("");
  const [error, setError] = useState("");

  async function handlePredict() {
    if (!file) return;
    setLoading(true);
    setResult("");
    setRaw("");
    setError("");

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: form,
      });

      const data = await res.json();
      setRaw(JSON.stringify(data, null, 2));

      if (!data.success && !Array.isArray(data.predictions)) {
        throw new Error(data.error || "Prediction failed");
      }

      if (Array.isArray(data.predictions)) {
        const formatted = data.predictions
          .map((p) => `${p.class}: ${(p.confidence * 100).toFixed(2)}%`)
          .join("\n");
        setResult(formatted);

        // Save to localStorage
        savePredictionToStorage({
          type: "Skin Disease",
          result: data.predictions[0]?.class || "Analyzed",
          details: formatted,
        });
      } else if (data.predictions) {
        setResult(JSON.stringify(data.predictions));
        savePredictionToStorage({
          type: "Skin Disease",
          result: "Analyzed",
          details: JSON.stringify(data.predictions),
        });
      } else {
        setResult("No predictions available.");
      }
    } catch (e) {
      setError(e.message || "Prediction failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container>
      <Section title="Skin Disease Prediction">
        <div style={{ marginBottom: 12, color: "#666" }}>
          Upload a clear image of the skin condition. The model will analyze and
          predict.
        </div>
        <div
          style={{
            border: "2px dashed #ccc",
            borderRadius: 12,
            padding: 16,
            background: "#f7f7f7",
          }}
        >
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              setFile(f || null);
              setResult("");
              setRaw("");
              setError("");
            }}
          />
          <div style={{ marginTop: 12 }}>
            <Button
              variant="danger"
              disabled={!file || loading}
              onClick={handlePredict}
            >
              {loading ? "Analyzing..." : "Analyze Image"}
            </Button>
          </div>
        </div>

        {result && <ResultBox title="Prediction Result">{result}</ResultBox>}
        {raw && <ResultBox title="Raw Response">{raw}</ResultBox>}
        <ErrorBox>{error}</ErrorBox>
      </Section>
    </Container>
  );
}

// Pneumonia prediction
function Pneumonia() {
  const API_URL = "https://walgar-pneumonia.hf.space/predict";
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  async function handlePredict() {
    if (!file) return;
    setLoading(true);
    setResult("");
    setError("");

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: form,
      });

      const data = await res.json();

      if (data.prediction && data.confidence) {
        const resultText = `${data.prediction} (${(parseFloat(data.confidence) * 100).toFixed(2)}%)`;
        setResult(resultText);

        // Save to localStorage
        savePredictionToStorage({
          type: "Pneumonia",
          result: data.prediction,
          details: resultText,
        });
      } else {
        throw new Error("Prediction failed: Invalid response format");
      }
    } catch (e) {
      setError(e.message || "Prediction failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container>
      <Section title="Pneumonia Detection">
        <div style={{ marginBottom: 12, color: "#666" }}>
          Upload a chest X-ray image. The AI model will analyze for signs of
          pneumonia.
        </div>
        <div
          style={{
            border: "2px dashed #ccc",
            borderRadius: 12,
            padding: 16,
            background: "#f7f7f7",
          }}
        >
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              setFile(f || null);
              setResult("");
              setError("");
            }}
          />
          <div style={{ marginTop: 12 }}>
            <Button disabled={!file || loading} onClick={handlePredict}>
              {loading ? "Analyzing..." : "Analyze X-ray"}
            </Button>
          </div>
        </div>

        {result && <ResultBox title="Prediction Result">{result}</ResultBox>}
        <ErrorBox>{error}</ErrorBox>
      </Section>
    </Container>
  );
}

// Lung Cancer prediction
function LungCancer() {
  const API_URL = "https://walgar-lung.hf.space/predict";
  const [file, setFile] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePredict() {
    if (!file) return;
    setLoading(true);
    setPrediction(null);
    setError("");

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: form,
      });

      const data = await res.json();
      const normalized = {
        class:
          data.class ||
          data.prediction ||
          (typeof data === "string" ? data : "Unknown"),
        confidence: data.confidence || data.probability || 1.0,
      };
      setPrediction(normalized);

      // Save to localStorage
      savePredictionToStorage({
        type: "Lung Cancer",
        result: normalized.class,
        details: `${normalized.class} - Confidence: ${(normalized.confidence * 100).toFixed(1)}%`,
      });
    } catch (e) {
      setError(e.message || "Error during prediction.");
    } finally {
      setLoading(false);
    }
  }

  const color = useMemo(() => {
    const c = prediction?.class;
    switch (c) {
      case "Normal":
        return "#4CAF50";
      case "Benign":
        return "#FFA726";
      case "Malignant":
        return "#FF5252";
      default:
        return "#333";
    }
  }, [prediction]);

  return (
    <Container>
      <Section title="Lung Cancer Detection">
        <div style={{ marginBottom: 12, color: "#666" }}>
          Upload a CT scan image for analysis.
        </div>

        <div
          style={{
            border: "2px dashed #ccc",
            borderRadius: 12,
            padding: 16,
            background: "#f7f7f7",
            marginBottom: 12,
          }}
        >
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              setFile(f || null);
              setPrediction(null);
              setError("");
            }}
          />
          <div style={{ marginTop: 12 }}>
            <Button disabled={!file || loading} onClick={handlePredict}>
              {loading ? "Analyzing..." : "Analyze Image"}
            </Button>
          </div>
        </div>

        {prediction && (
          <div
            style={{
              background: "#fff",
              border: "1px solid #ddd",
              borderRadius: 12,
              padding: 16,
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
              Analysis Result
            </div>

            <div
              style={{
                display: "inline-block",

                padding: "8px 14px",

                borderRadius: 999,
                marginBottom: 12,

                backgroundImage: "linear-gradient(135deg, #0092FF, #8E24AA)",
                color: "#fff",
                fontWeight: 800,

                boxShadow: "0 10px 22px rgba(0,0,0,0.12)",
              }}
            >
              {prediction.class}
            </div>

            <div
              style={{
                height: 6,
                background: "#eee",
                borderRadius: 3,
                overflow: "hidden",
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  width: `${(prediction.confidence * 100).toFixed(1)}%`,
                  height: "100%",
                  background: color,
                }}
              />
            </div>
            <div style={{ color: "#666" }}>
              Confidence: {(prediction.confidence * 100).toFixed(1)}%
            </div>
          </div>
        )}

        <ErrorBox>{error}</ErrorBox>
      </Section>
    </Container>
  );
}

// Diabetes prediction (form)
function Diabetes() {
  const BASE_URL = "https://walgar-diabetes.hf.space";
  const initialFields = {
    pregnancies: "",
    glucose: "",
    bloodpressure: "",
    skinthickness: "",
    insulin: "",
    bmi: "",
    dpf: "",
    age: "",
  };

  const [fields, setFields] = useState(initialFields);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  function updateField(key, val) {
    const numeric = val.replace(/[^0-9.]/g, "");
    setFields((p) => ({ ...p, [key]: numeric }));
    setResult(null);
    setError("");
  }

  function validate() {
    const limits = {
      pregnancies: 20,
      glucose: 300,
      bloodpressure: 200,
      skinthickness: 100,
      insulin: 846,
      bmi: 67.1,
      dpf: 2.42,
      age: 120,
    };
    for (const k of Object.keys(fields)) {
      const v = fields[k];
      if (v === "") {
        setError(`${k} is required`);
        return false;
      }
      const n = parseFloat(v);
      if (isNaN(n)) {
        setError(`${k} must be a number`);
        return false;
      }
      if (n < 0) {
        setError(`${k} cannot be negative`);
        return false;
      }
      if (n > limits[k]) {
        setError(`${k} cannot exceed ${limits[k]}`);
        return false;
      }
    }
    setError("");
    return true;
  }

  async function handlePredict() {
    if (!validate()) return;
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const form = new FormData();
      Object.entries(fields).forEach(([k, v]) => form.append(k, v));
      const res = await fetch(`${BASE_URL}/predict`, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: form,
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`HTTP ${res.status}: ${t}`);
      }
      const data = await res.json();
      if (data.success) {
        setResult({
          status: data.prediction_text,
          details:
            data.prediction === 1
              ? "Please consult with a healthcare professional for proper medical advice."
              : "Maintain a healthy lifestyle to stay diabetes-free.",
        });

        // Save to localStorage
        savePredictionToStorage({
          type: "Diabetes",
          result: data.prediction_text,
          parameters: {
            Pregnancies: fields.pregnancies,
            Glucose: fields.glucose,
            "Blood Pressure": fields.bloodpressure,
            "Skin Thickness": fields.skinthickness,
            Insulin: fields.insulin,
            BMI: fields.bmi,
            "Diabetes Pedigree": fields.dpf,
            Age: fields.age,
          },
          details:
            data.prediction === 1
              ? "Please consult with a healthcare professional for proper medical advice."
              : "Maintain a healthy lifestyle to stay diabetes-free.",
        });
      } else {
        setError(data.error || "Unexpected error");
      }
    } catch (e) {
      setError(e.message || "Failed to get prediction");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setFields(initialFields);
    setResult(null);
    setError("");
  }

  return (
    <Container>
      <Section title="Diabetes Risk Assessment">
        <div style={{ color: "#666", marginBottom: 16 }}>
          Enter your health metrics below for accurate assessment.
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
            gap: 12,
          }}
        >
          <Input
            label="Pregnancies (0-20)"
            value={fields.pregnancies}
            onChange={(v) => updateField("pregnancies", v)}
          />
          <Input
            label="Glucose (0-300 mg/dL)"
            value={fields.glucose}
            onChange={(v) => updateField("glucose", v)}
          />
          <Input
            label="Blood Pressure (0-200 mmHg)"
            value={fields.bloodpressure}
            onChange={(v) => updateField("bloodpressure", v)}
          />
          <Input
            label="Skin Thickness (0-100 mm)"
            value={fields.skinthickness}
            onChange={(v) => updateField("skinthickness", v)}
          />
          <Input
            label="Insulin (0-846 mu U/ml)"
            value={fields.insulin}
            onChange={(v) => updateField("insulin", v)}
          />
          <Input
            label="BMI (0-67.1 kg/m²)"
            value={fields.bmi}
            onChange={(v) => updateField("bmi", v)}
          />
          <Input
            label="Diabetes Pedigree Function (0-2.42)"
            value={fields.dpf}
            onChange={(v) => updateField("dpf", v)}
          />
          <Input
            label="Age (0-120 years)"
            value={fields.age}
            onChange={(v) => updateField("age", v)}
          />
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <Button variant="purple" disabled={loading} onClick={handlePredict}>
            {loading ? "Analyzing..." : "Analyze Risk"}
          </Button>
          <Button variant="gray" disabled={loading} onClick={reset}>
            Reset
          </Button>
        </div>

        <ErrorBox>{error}</ErrorBox>

        {result && (
          <div
            style={{
              marginTop: 16,
              background: "#F8F9FA",
              borderRadius: 12,
              padding: 16,
              border: "1px solid #eee",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
                fontWeight: 700,
              }}
            >
              Analysis Result
            </div>

            <div
              style={{
                fontSize: 22,

                fontWeight: 900,
                backgroundImage:
                  result.status === "Diabetic"
                    ? "linear-gradient(90deg, #FF6B6B, #FFA726)"
                    : "linear-gradient(90deg, #00B894, #0092FF)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                marginBottom: 8,
              }}
            >
              {result.status}
            </div>

            <div style={{ color: "#666" }}>{result.details}</div>
          </div>
        )}
      </Section>
    </Container>
  );
}

// Hypertension prediction (form, JSON)
function Hypertension() {
  const API_URL = "https://walgar-hyper.hf.space";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [prediction, setPrediction] = useState(null);

  const [formData, setFormData] = useState({
    gender: "1",
    age: "",
    diabetes: "0",
    heart_disease: "0",
    smoking_history: "0",
    bmi: "",
    HbA1c_level: "",
    blood_glucose_level: "",
  });

  function setField(k, v) {
    setFormData((p) => ({ ...p, [k]: v }));
    setError("");
    setPrediction(null);
  }

  function validate() {
    const required = ["age", "bmi", "HbA1c_level", "blood_glucose_level"];
    for (const k of required) {
      if (!formData[k]) {
        setError("Please fill in all fields");
        return false;
      }
    }
    const age = parseFloat(formData.age);
    if (age < 0 || age > 120) {
      setError("Please enter a valid age");
      return false;
    }
    const bmi = parseFloat(formData.bmi);
    if (bmi < 10 || bmi > 50) {
      setError("Please enter a valid BMI (10-50)");
      return false;
    }
    const hba1c = parseFloat(formData.HbA1c_level);
    if (hba1c < 3 || hba1c > 9) {
      setError("Please enter a valid HbA1c level (3-9%)");
      return false;
    }
    const glucose = parseFloat(formData.blood_glucose_level);
    if (glucose < 50 || glucose > 300) {
      setError("Please enter a valid blood glucose level (50-300 mg/dL)");
      return false;
    }
    return true;
  }

  async function handlePredict() {
    if (!validate()) return;

    setLoading(true);
    setError("");
    setPrediction(null);

    try {
      const requestData = {
        gender: parseInt(formData.gender),
        age: parseFloat(formData.age),
        diabetes: parseInt(formData.diabetes),
        heart_disease: parseInt(formData.heart_disease),
        smoking_history: parseInt(formData.smoking_history),
        bmi: parseFloat(formData.bmi),
        HbA1c_level: parseFloat(formData.HbA1c_level),
        blood_glucose_level: parseInt(formData.blood_glucose_level),
      };

      const res = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(`HTTP ${res.status}: ${t}`);
      }
      const data = await res.json();
      if (data) {
        setPrediction({
          hypertension: data.hypertension,
          message: data.message,
        });

        // Save to localStorage
        savePredictionToStorage({
          type: "Hypertension",
          result: data.hypertension
            ? "Hypertension Detected"
            : "No Hypertension",
          parameters: {
            Gender: formData.gender === "1" ? "Male" : "Female",
            Age: formData.age,
            Diabetes: formData.diabetes === "1" ? "Yes" : "No",
            "Heart Disease": formData.heart_disease === "1" ? "Yes" : "No",
            "Smoking History":
              formData.smoking_history === "0"
                ? "Never"
                : formData.smoking_history === "1"
                  ? "Former"
                  : "Current",
            BMI: formData.bmi,
            "HbA1c Level": formData.HbA1c_level,
            "Blood Glucose": formData.blood_glucose_level,
          },
          details: data.message,
        });
      } else {
        throw new Error("Invalid response format");
      }
    } catch (e) {
      setError(e.message || "Error during prediction.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container>
      <Section title="Hypertension Risk Assessment">
        <div style={{ color: "#666", marginBottom: 16 }}>
          Please fill in your health information
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 24,
            padding: 8,
          }}
        >
          <Select
            label="Gender"
            value={formData.gender}
            onChange={(v) => setField("gender", v)}
            options={[
              { label: "Male", value: "1" },
              { label: "Female", value: "0" },
            ]}
          />
          <Input
            label="Age"
            value={formData.age}
            onChange={(v) => setField("age", v)}
          />
          <Select
            label="Diabetes"
            value={formData.diabetes}
            onChange={(v) => setField("diabetes", v)}
            options={[
              { label: "No", value: "0" },
              { label: "Yes", value: "1" },
            ]}
          />
          <Select
            label="Heart Disease"
            value={formData.heart_disease}
            onChange={(v) => setField("heart_disease", v)}
            options={[
              { label: "No", value: "0" },
              { label: "Yes", value: "1" },
            ]}
          />
          <Select
            label="Smoking History"
            value={formData.smoking_history}
            onChange={(v) => setField("smoking_history", v)}
            options={[
              { label: "Never", value: "0" },
              { label: "Former", value: "1" },
              { label: "Current", value: "2" },
            ]}
          />
          <Input
            label="BMI"
            value={formData.bmi}
            onChange={(v) => setField("bmi", v)}
          />
          <Input
            label="HbA1c Level (%)"
            value={formData.HbA1c_level}
            onChange={(v) => setField("HbA1c_level", v)}
          />
          <Input
            label="Blood Glucose Level (mg/dL)"
            value={formData.blood_glucose_level}
            onChange={(v) => setField("blood_glucose_level", v)}
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <Button disabled={loading} onClick={handlePredict}>
            {loading ? "Analyzing..." : "Analyze Risk"}
          </Button>
        </div>

        <ErrorBox>{error}</ErrorBox>

        {prediction && (
          <div
            style={{
              marginTop: 16,
              padding: 16,
              borderRadius: 12,
              background: prediction.hypertension ? "#FFE5E5" : "#E5F6FF",
              color: prediction.hypertension ? "#FF6B6B" : "#4CAF50",
              fontWeight: 700,
            }}
          >
            {prediction.message}
          </div>
        )}
      </Section>
    </Container>
  );
}

// CKD prediction (form, JSON)
function CKD() {
  const API_URL = "https://walgar-ckd.hf.space";
  const yesNo = [
    { label: "No", value: "0" },
    { label: "Yes", value: "1" },
  ];

  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    age: "",
    blood_pressure: "",
    specific_gravity: "",
    albumin: "",
    sugar: "",
    red_blood_cells: "0",
    pus_cell: "0",
    pus_cell_clumps: "0",
    bacteria: "0",
    blood_glucose_random: "",
    blood_urea: "",
    serum_creatinine: "",
    sodium: "",
    potassium: "",
    haemoglobin: "",
    packed_cell_volume: "",
    white_blood_cell_count: "",
    red_blood_cell_count: "",
    hypertension: "0",
    diabetes_mellitus: "0",
    coronary_artery_disease: "0",
    appetite: "0",
    peda_edema: "0",
    aanemia: "0",
  });

  function setField(k, v) {
    setFormData((p) => ({ ...p, [k]: v }));
    setError("");
    setPrediction(null);
  }

  async function handlePredict() {
    setLoading(true);
    setError("");
    setPrediction(null);

    const req = {
      age: parseFloat(formData.age) || 0,
      blood_pressure: parseFloat(formData.blood_pressure) || 0,
      specific_gravity: parseFloat(formData.specific_gravity) || 0,
      albumin: parseFloat(formData.albumin) || 0,
      sugar: parseFloat(formData.sugar) || 0,
      red_blood_cells: parseInt(formData.red_blood_cells) || 0,
      pus_cell: parseInt(formData.pus_cell) || 0,
      pus_cell_clumps: parseInt(formData.pus_cell_clumps) || 0,
      bacteria: parseInt(formData.bacteria) || 0,
      blood_glucose_random: parseFloat(formData.blood_glucose_random) || 0,
      blood_urea: parseFloat(formData.blood_urea) || 0,
      serum_creatinine: parseFloat(formData.serum_creatinine) || 0,
      sodium: parseFloat(formData.sodium) || 0,
      potassium: parseFloat(formData.potassium) || 0,
      haemoglobin: parseFloat(formData.haemoglobin) || 0,
      packed_cell_volume: parseFloat(formData.packed_cell_volume) || 0,
      white_blood_cell_count: parseFloat(formData.white_blood_cell_count) || 0,
      red_blood_cell_count: parseFloat(formData.red_blood_cell_count) || 0,
      hypertension: parseInt(formData.hypertension) || 0,
      diabetes_mellitus: parseInt(formData.diabetes_mellitus) || 0,
      coronary_artery_disease: parseInt(formData.coronary_artery_disease) || 0,
      appetite: parseInt(formData.appetite) || 0,
      peda_edema: parseInt(formData.peda_edema) || 0,
      aanemia: parseInt(formData.aanemia) || 0,
    };

    try {
      const res = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(req),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`HTTP ${res.status}: ${t}`);
      }
      const data = await res.json();
      setPrediction(data);

      // Save to localStorage
      savePredictionToStorage({
        type: "Chronic Kidney Disease (CKD)",
        result: data.prediction === "ckd" ? "No CKD Detected" : "CKD Detected",
        parameters: {
          Age: formData.age,
          "Blood Pressure": formData.blood_pressure,
          "Specific Gravity": formData.specific_gravity,
          Albumin: formData.albumin,
          Sugar: formData.sugar,
          "Blood Glucose": formData.blood_glucose_random,
          "Blood Urea": formData.blood_urea,
          "Serum Creatinine": formData.serum_creatinine,
          Sodium: formData.sodium,
          Potassium: formData.potassium,
          Haemoglobin: formData.haemoglobin,
        },
        details:
          data.prediction === "ckd"
            ? "No chronic kidney disease detected"
            : "Chronic kidney disease detected - consult a nephrologist",
      });
    } catch (e) {
      setError(e.message || "Prediction failed. Please verify inputs.");
    } finally {
      setLoading(false);
    }
  }

  const numericFields = [
    ["Age", "age"],
    ["Blood Pressure", "blood_pressure"],
    ["Specific Gravity", "specific_gravity"],
    ["Albumin", "albumin"],
    ["Sugar", "sugar"],
    ["Blood Glucose Random", "blood_glucose_random"],
    ["Blood Urea", "blood_urea"],
    ["Serum Creatinine", "serum_creatinine"],
    ["Sodium", "sodium"],
    ["Potassium", "potassium"],
    ["Haemoglobin", "haemoglobin"],
    ["Packed Cell Volume", "packed_cell_volume"],
    ["WBC Count", "white_blood_cell_count"],
    ["RBC Count", "red_blood_cell_count"],
  ];

  const selectFields = [
    ["Red Blood Cells", "red_blood_cells"],
    ["Pus Cell", "pus_cell"],
    ["Pus Cell Clumps", "pus_cell_clumps"],
    ["Bacteria", "bacteria"],
    ["Hypertension", "hypertension"],
    ["Diabetes Mellitus", "diabetes_mellitus"],
    ["Coronary Artery Disease", "coronary_artery_disease"],
    ["Appetite", "appetite"],
    ["Pedal Edema", "peda_edema"],
    ["Anemia", "aanemia"],
  ];

  return (
    <Container>
      <Section title="CKD Prediction">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
            gap: 12,
          }}
        >
          {numericFields.map(([label, key]) => (
            <Input
              key={key}
              label={label}
              value={formData[key]}
              onChange={(v) => setField(key, v)}
            />
          ))}
          {selectFields.map(([label, key]) => (
            <Select
              key={key}
              label={label}
              value={formData[key]}
              onChange={(v) => setField(key, v)}
              options={yesNo}
            />
          ))}
        </div>

        <div style={{ marginTop: 12 }}>
          <Button disabled={loading} onClick={handlePredict}>
            {loading ? "Analyzing..." : "Analyze"}
          </Button>
        </div>

        <ErrorBox>{error}</ErrorBox>

        {prediction && (
          <div
            style={{
              marginTop: 16,
              padding: 16,
              borderRadius: 12,
              background:
                prediction.prediction === "ckd" ? "#E5F6FF" : "#FFE5E5",
              color: prediction.prediction === "ckd" ? "#4CAF50" : "#FF6B6B",
              fontWeight: 800,
              textAlign: "center",
            }}
          >
            {prediction.prediction === "ckd"
              ? "No CKD Detected"
              : "CKD Detected"}
          </div>
        )}
      </Section>
    </Container>
  );
}

// ---------- App and Routes ----------

function App() {
  useEffect(() => {
    document.title = "CareScan Web";
    // Inject global styles for modern look and animations
    const style = document.createElement("style");
    style.setAttribute("id", "carescan-global-styles");

    style.innerHTML = `

          :root{

            --cs-primary:#0092FF; --cs-danger:#FF6B6B; --cs-purple:#8E24AA; --cs-green:#4CAF50;

            --cs-bg:#ffffff; --cs-text:#222; --cs-muted:#666;

          }

          html,body{scroll-behavior:smooth; font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif;}

          /* Modern hover for buttons */

          button{transition:transform .2s ease, box-shadow .25s ease, background .25s ease;}

          button:hover:not(:disabled){transform: translateY(-2px); box-shadow: 0 10px 22px rgba(0,146,255,.18);}

          button:active:not(:disabled){transform: translateY(0);}

          /* Clickable cards */

          [role="button"]{transition:transform .25s ease, box-shadow .25s ease;}

          [role="button"]:hover{transform: translateY(-4px); box-shadow: 0 12px 26px rgba(0,0,0,.12);}

          /* Subtle content animations */

          .fade-in{animation: fadeIn .4s ease both;}

          .slide-up{animation: slideUp .45s cubic-bezier(.22,1,.36,1) both;}

          @keyframes fadeIn{from{opacity:0} to{opacity:1}}

          @keyframes slideUp{from{opacity:0; transform: translateY(12px)} to{opacity:1; transform: translateY(0)}}

          /* Elevated/glass nav */

          .top-nav-glass{backdrop-filter: saturate(180%) blur(10px); background: rgba(255,255,255,.85);}

          /* Nicer image polish */

          img{transition: transform .35s ease;}

          [role="button"] img{will-change: transform;}

          [role="button"]:hover img{transform: scale(1.03);}

          /* Floating Action Button */
          .fab{
            position: fixed;
            right: 24px;
            bottom: 24px;
            width: 56px;
            height: 56px;
            border-radius: 50%;
            border: none;
            background: linear-gradient(135deg, var(--cs-purple), var(--cs-primary));
            color: #fff;
            font-size: 26px;
            line-height: 0;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 14px 30px rgba(0,0,0,.18);
            cursor: pointer;
            animation: popIn .35s ease both;
            transition: transform .2s ease, box-shadow .25s ease, background .25s ease;
            z-index: 50;
          }
          .fab:hover{
            transform: translateY(-2px) scale(1.02);
            box-shadow: 0 18px 36px rgba(0,0,0,.22);
          }
          .fab:active{ transform: translateY(0) scale(1); }
          .fab::after{
            content: "";
            position: absolute;
            inset: 0;
            border-radius: 50%;
            box-shadow: 0 0 0 0 rgba(255,255,255,0.35);
            animation: pulse 2.2s ease-in-out infinite;
            pointer-events: none;
          }
          @keyframes popIn{from{opacity:0; transform: translateY(8px) scale(.9)} to{opacity:1; transform: translateY(0) scale(1)}}
          @keyframes pulse{
            0%{ box-shadow: 0 0 0 0 rgba(255,255,255,0.35); }
            70%{ box-shadow: 0 0 0 14px rgba(255,255,255,0); }
            100%{ box-shadow: 0 0 0 0 rgba(255,255,255,0); }
          }
        `;

    if (!document.getElementById("carescan-global-styles")) {
      document.head.appendChild(style);
    }
    return () => {
      const el = document.getElementById("carescan-global-styles");
      el && el.remove();
    };
  }, []);

  return (
    <AuthGate>
      <div>
        <TopNav />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/scanner" element={<Scanner />} />
          <Route path="/scanner/skin" element={<SkinDisease />} />
          <Route path="/scanner/pneumonia" element={<Pneumonia />} />
          <Route path="/scanner/lung-cancer" element={<LungCancer />} />
          <Route path="/scanner/diabetes" element={<Diabetes />} />
          <Route path="/scanner/hypertension" element={<Hypertension />} />
          <Route path="/scanner/ckd" element={<CKD />} />
          <Route path="/health" element={<Health />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/consult" element={<ConsultDoctor />} />
          <Route path="/reports" element={<HealthReports />} />
          <Route path="/learn" element={<LearnConditions />} />
          <Route path="/medications" element={<Medications />} />
          <Route path="/emergency" element={<EmergencyContacts />} />
          <Route path="/trends" element={<HealthTrends />} />
          <Route
            path="*"
            element={
              <Container>
                <Section title="404">
                  <div>Page not found.</div>
                  <div style={{ marginTop: 8 }}>
                    <Link
                      to="/"
                      style={{
                        color: "#0092FF",
                        textDecoration: "none",
                        fontWeight: 700,
                      }}
                    >
                      Go Home
                    </Link>
                  </div>
                </Section>
              </Container>
            }
          />
        </Routes>
        <footer style={{ borderTop: "1px solid #f0f0f0", marginTop: 24 }}>
          <Container>
            <div style={{ color: "#999", fontSize: 12, padding: "16px 0" }}>
              © {new Date().getFullYear()} CareScan — Health insights and
              predictions
            </div>
          </Container>
        </footer>
      </div>
    </AuthGate>
  );
}

// ---------- Mount ----------

const rootEl = document.getElementById("root");
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>,
  );
}
