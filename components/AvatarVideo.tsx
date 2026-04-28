"use client";
import { forwardRef } from "react";

interface Props {
  isSpeaking: boolean;
  isIdle: boolean;
}

const AvatarVideo = forwardRef<HTMLVideoElement, Props>(
  ({ isSpeaking, isIdle }, ref) => {
    return (
      <>
        <video
          ref={ref}
          className="avatar-video"
          autoPlay
          playsInline
          style={{ display: isIdle ? "none" : "block" }}
        />
        {isIdle && (
          <div className="avatar-idle-screen">
            <div className="avatar-idle-orb">🏛️</div>
            <div className="avatar-idle-text">
              <h3>Rubenius AI Guide</h3>
              <p>
                Click <strong>Start Session</strong> to talk with an AI avatar
                about Rubenius&apos;s trends, awards, and REDS framework.
              </p>
            </div>
          </div>
        )}
        {!isIdle && (
          <div className="avatar-status-bar">
            <span
              className={`status-indicator ${isSpeaking ? "speaking" : "ready"}`}
            />
            {isSpeaking ? "Avatar is speaking…" : "Ready — ask a question"}
          </div>
        )}
      </>
    );
  }
);

AvatarVideo.displayName = "AvatarVideo";
export default AvatarVideo;
