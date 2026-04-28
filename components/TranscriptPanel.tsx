"use client";
import { useEffect, useRef } from "react";

interface Message {
  role: string;
  text: string;
}

interface Props {
  messages: Message[];
}

export default function TranscriptPanel({ messages }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="transcript-scroll">
      {messages.length === 0 ? (
        <div className="transcript-empty">
          <span>💬</span>
          <p>
            Start a session and ask the avatar about Rubenius trends, awards, or
            the REDS framework.
          </p>
        </div>
      ) : (
        messages.map((msg, i) => (
          <div
            key={i}
            className={`message ${msg.role === "user" ? "user" : "avatar"}`}
          >
            <div
              className={`msg-avatar ${msg.role === "user" ? "user-av" : "bot-av"}`}
            >
              {msg.role === "user" ? "U" : "R"}
            </div>
            <div className="msg-bubble">{msg.text}</div>
          </div>
        ))
      )}
      <div ref={bottomRef} />
    </div>
  );
}
