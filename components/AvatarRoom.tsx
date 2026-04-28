"use client";
import { useEffect, useRef, useState } from "react";
import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
  TaskType,
} from "@heygen/streaming-avatar";
import AvatarVideo from "./AvatarVideo";
import Controls from "./Controls";
import TranscriptPanel from "./TranscriptPanel";

/* ── Rubenius Awards Data ─────────────────────────────── */
const AWARDS = [
  { year: 2025, org: "FOAID",                      category: "On Going Project" },
  { year: 2024, org: "Spaceiux",                   category: "Shopping Space" },
  { year: 2024, org: "Design Milestone",            category: "Innovative Technology Integration" },
  { year: 2024, org: "FOAID",                      category: "Bronze" },
  { year: 2023, org: "Architect & Interiors India", category: "Future Design" },
  { year: 2023, org: "Foaid India 10",              category: "Interior Retail" },
  { year: 2023, org: "IGEN",                       category: "India's Top 40 Best Designers" },
  { year: 2022, org: "Innovation At The Work Space",category: "Commercial Design" },
  { year: 2022, org: "Lexus Design Award",          category: "Finalist – Design Thinking" },
  { year: 2021, org: "ELDROK India",               category: "Best In Class – Residential Public Space" },
  { year: 2021, org: "Kyoorius Design Awards",      category: "Product Design" },
  { year: 2020, org: "D'source Design Awards",      category: "Product Solutions For Pandemic" },
  { year: 2019, org: "FOAID Awards",               category: "Best Interior Retail" },
  { year: 2018, org: "FOAID Awards",               category: "Best Interior Retail – India" },
  { year: 2017, org: "FOAID Awards",               category: "Best Residential Villa Large" },
  { year: 2016, org: "IQA Awards",                category: "Best Interior Design Services – Karnataka" },
];

/* ── REDS Pillars ─────────────────────────────────────── */
const PILLARS = [
  { key: "strategy",     icon: "🎯", label: "Strategy",     question: "Tell me about Rubenius's strategy pillar in the REDS framework" },
  { key: "storytelling", icon: "📖", label: "Storytelling", question: "What is the storytelling pillar of the REDS framework?" },
  { key: "technology",   icon: "⚡", label: "Technology",   question: "How does Rubenius integrate technology into experiential design?" },
  { key: "craft",        icon: "✨", label: "Craft",        question: "Explain the craft pillar in Rubenius REDS system" },
  { key: "psychology",   icon: "🧠", label: "Psychology",   question: "How does Rubenius use psychology in spatial design?" },
  { key: "performance",  icon: "📊", label: "Performance",  question: "What does Rubenius measure for performance outcomes?" },
];

type Status = "idle" | "connecting" | "ready" | "speaking";

export default function AvatarRoom() {
  const avatarRef = useRef<StreamingAvatar | null>(null);
  const videoRef  = useRef<HTMLVideoElement>(null!);

  const [status,       setStatus]       = useState<Status>("idle");
  const [input,        setInput]        = useState("");
  const [transcript,   setTranscript]   = useState<{ role: string; text: string }[]>([]);
  const [activeRow,    setActiveRow]    = useState<number | null>(null);
  const [activePillar, setActivePillar] = useState<string | null>(null);
  const [isIngesting,  setIsIngesting]  = useState(false);
  const [ingested,     setIngested]     = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [avatarError,  setAvatarError]  = useState<string | null>(null);

  /* ── HeyGen session management via SDK ───────────────── */
  async function start() {
    setStatus("connecting");
    setAvatarError(null);
    try {
      const res  = await fetch("/api/get-access-token", { method: "POST" });
      const body = await res.json();

      if (!res.ok || !body.token) {
        throw new Error(body.error ?? `Token API returned ${res.status}`);
      }

      avatarRef.current = new StreamingAvatar({ token: body.token });

      avatarRef.current.on(StreamingEvents.STREAM_READY, (e) => {
        if (videoRef.current) {
          videoRef.current.srcObject = e.detail;
          videoRef.current.play().catch(() => {});
        }
        setStatus("ready");
      });

      avatarRef.current.on(StreamingEvents.AVATAR_START_TALKING, () => setStatus("speaking"));
      avatarRef.current.on(StreamingEvents.AVATAR_STOP_TALKING,  () => setStatus("ready"));
      avatarRef.current.on(StreamingEvents.STREAM_DISCONNECTED,  () => { setStatus("idle"); });

      // Strip placeholder/invalid voice IDs before sending
      const rawVoice = process.env.NEXT_PUBLIC_VOICE_ID ?? "";
      const voiceId  = rawVoice.trim().length > 5 ? rawVoice.trim() : undefined;

      await avatarRef.current.createStartAvatar({
        avatarName: process.env.NEXT_PUBLIC_AVATAR_ID!,
        voice:      voiceId ? { voiceId } : undefined,
        quality:    AvatarQuality.Medium,
        language:   "en",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[AvatarRoom] start error", msg);
      setAvatarError(msg);
      setStatus("idle");
      avatarRef.current = null;
    }
  }

  async function stop() {
    await avatarRef.current?.stopAvatar();
    avatarRef.current = null;
    setStatus("idle");
  }

  async function ask(question: string) {
    if (!question.trim() || status === "idle" || status === "connecting") return;

    setLoading(true);
    setTranscript((t) => [...t, { role: "user", text: question }]);

    try {
      const res = await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ question }),
      });
      const { answer } = await res.json();

      setTranscript((t) => [...t, { role: "avatar", text: answer }]);
      await avatarRef.current?.speak({ text: answer, taskType: TaskType.REPEAT });
    } catch (err) {
      console.error("[AvatarRoom] ask error", err);
      setTranscript((t) => [...t, { role: "avatar", text: "Sorry, I couldn't fetch an answer right now." }]);
    } finally {
      setLoading(false);
    }
  }

  /* ── Ingest Rubenius data to Pinecone ────────────────── */
  async function handleIngest() {
    setIsIngesting(true);
    try {
      const res  = await fetch("/api/ingest", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setIngested(true);
      } else {
        setAvatarError(`Ingestion failed: ${data.error}`);
      }
    } catch (err) {
      console.error("[AvatarRoom] ingest error", err);
      setAvatarError("Ingestion failed: Network error");
    } finally {
      setIsIngesting(false);
    }
  }

  function handlePillar(p: typeof PILLARS[0]) {
    setActivePillar(p.key);
    ask(p.question);
  }

  function handleAwardRow(i: number, award: typeof AWARDS[0]) {
    setActiveRow(i);
    ask(`Tell me about the ${award.org} ${award.category} award that Rubenius received in ${award.year}`);
  }

  // Cleanup on unmount
  useEffect(() => () => { avatarRef.current?.stopAvatar(); }, []);

  const isIdle = status === "idle";

  return (
    <>
      {/* ── HEADER ─────────────────────────────────── */}
      <header className="app-header">
        <div className="logo-area">
          <div className="logo-badge">R</div>
          <div>
            <div className="logo-text">Rubenius</div>
            <div className="logo-tagline">Interior Wellbeing™</div>
          </div>
        </div>
        <div className="header-badge">
          <span className="header-dot" />
          AI Trend Explorer
        </div>
      </header>

      {/* ── WORKSPACE ──────────────────────────────── */}
      <div className="workspace">

        {/* LEFT — Avatar + Controls + Chat */}
        <div className="avatar-panel">

          {!ingested && (
            <div className="ingest-banner">
              <span>🗄️</span>
              <p>First-time setup: seed Rubenius knowledge into the AI before chatting.</p>
              <button
                id="btn-ingest-data"
                className="btn-ingest"
                onClick={handleIngest}
                disabled={isIngesting}
              >
                {isIngesting ? "Seeding…" : "Seed Data"}
              </button>
            </div>
          )}

          <div className={`avatar-stage ${status === "speaking" ? "speaking" : ""}`}>
            <AvatarVideo ref={videoRef} isSpeaking={status === "speaking"} isIdle={isIdle} />
          </div>

          <Controls status={status} onStart={start} onStop={stop} />

          {avatarError && (
            <div style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: "var(--radius-md)",
              padding: "10px 14px",
              fontSize: 12,
              color: "#f87171",
              lineHeight: 1.5,
            }}>
              <strong>Error:</strong> {avatarError}
              {(avatarError.includes("401") || avatarError.includes("403")) && (
                <div style={{ marginTop: 6, color: "var(--text-muted)" }}>
                  Hint: Verify your HeyGen API key has Streaming Avatar access enabled in your plan.
                </div>
              )}
            </div>
          )}

          <form
            id="chat-form"
            className="chat-form"
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
              setInput("");
            }}
          >
            <input
              id="chat-input"
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isIdle ? "Start a session first…" : "Ask about Rubenius trends, awards, REDS…"}
              disabled={isIdle || loading}
            />
            <button
              id="btn-ask"
              className="btn-send"
              type="submit"
              disabled={isIdle || loading || !input.trim()}
            >
              {loading ? <span className="spinner" /> : "Ask"}
            </button>
          </form>
        </div>

        {/* RIGHT — REDS Pillars + Awards Table + Transcript */}
        <div className="right-panel">

          <div className="section-card">
            <div className="section-header">
              <div className="section-header-icon">⬡</div>
              <span className="section-title">REDS Framework Pillars</span>
              <span className="section-subtitle">click to ask</span>
            </div>
            <div className="pillars-grid">
              {PILLARS.map((p) => (
                <button
                  key={p.key}
                  id={`pillar-${p.key}`}
                  className={`pillar-card ${activePillar === p.key ? "active" : ""}`}
                  onClick={() => handlePillar(p)}
                  disabled={isIdle || loading}
                >
                  <div className="pillar-icon">{p.icon}</div>
                  <div className="pillar-name">{p.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="section-card" style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div className="section-header">
              <div className="section-header-icon">🏆</div>
              <span className="section-title">Awards &amp; Recognition Trend</span>
              <span className="section-subtitle">2016 – 2025</span>
            </div>
            <div style={{ overflowY: "auto", flex: 1, scrollbarWidth: "thin" }}>
              <table className="awards-table">
                <thead>
                  <tr><th>Year</th><th>Organisation</th><th>Category</th></tr>
                </thead>
                <tbody>
                  {AWARDS.map((award, i) => (
                    <tr
                      key={i}
                      id={`award-row-${i}`}
                      className={activeRow === i ? "row-active" : ""}
                      onClick={() => handleAwardRow(i, award)}
                      style={{ opacity: isIdle || loading ? 0.6 : 1, cursor: isIdle ? "default" : "pointer" }}
                    >
                      <td><span className="year-badge">{award.year}</span></td>
                      <td><span className="award-org">{award.org}</span></td>
                      <td><span className="award-category">{award.category}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="section-card transcript-panel">
            <div className="section-header">
              <div className="section-header-icon">💬</div>
              <span className="section-title">Conversation</span>
              {transcript.length > 0 && (
                <button className="btn-ghost btn" style={{ marginLeft: "auto", padding: "4px 10px", fontSize: 11 }} onClick={() => setTranscript([])}>Clear</button>
              )}
            </div>
            <TranscriptPanel messages={transcript} />
          </div>
        </div>
      </div>
    </>
  );
}