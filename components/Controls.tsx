"use client";

interface Props {
  status: "idle" | "connecting" | "ready" | "speaking";
  onStart: () => void;
  onStop: () => void;
}

export default function Controls({ status, onStart, onStop }: Props) {
  const isConnecting = status === "connecting";

  return (
    <div className="controls-row">
      {status === "idle" ? (
        <button
          id="btn-start-session"
          className="btn btn-primary"
          onClick={onStart}
        >
          <span>▶</span> Start Session
        </button>
      ) : (
        <button
          id="btn-end-session"
          className="btn btn-danger"
          onClick={onStop}
          disabled={isConnecting}
        >
          <span>■</span> End Session
        </button>
      )}

      {isConnecting && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            color: "var(--text-secondary)",
          }}
        >
          <span className="spinner" />
          Connecting to avatar…
        </div>
      )}

      {status === "ready" || status === "speaking" ? (
        <span
          style={{ fontSize: 12, color: "var(--teal)", marginLeft: "auto" }}
        >
          ✦ Live
        </span>
      ) : null}
    </div>
  );
}
