import { useEffect, useRef, useState } from "react";

const base = import.meta.env.BASE_URL;
const invitationCover = `${base}img/invitation-cover.webp`;
const invitationOpening = `${base}vid/invitation-opening.mp4`;

export function Intro({ onEnvelopeOpen }) {
  const [envelopeOpening, setEnvelopeOpening] = useState(false);
  const [introVisible, setIntroVisible] = useState(false);
  const introVideo = useRef(null);

  useEffect(() => {
    document.body.classList.add("invitation-locked");
    return () => document.body.classList.remove("invitation-locked");
  }, []);

  function openInvitation() {
    if (envelopeOpening) return;
    setEnvelopeOpening(true);
    
    const video = introVideo.current;
    if (video) {
      video.play().catch(() => {});
    }

    setTimeout(() => {
      onEnvelopeOpen();
    }, 1200);
  }

  function trackIntroProgress() {
    const video = introVideo.current;
    if (!video) return;
    if (video.currentTime > 0.05) setIntroVisible(true);
  }

  return (
    <section
      className={`invitation-cover ${envelopeOpening ? "is-opening" : ""}`}
      aria-label="Abrir invitación"
      role="button"
      tabIndex={0}
      onClick={openInvitation}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openInvitation();
        }
      }}
    >
      <img className={`intro-media intro-poster ${introVisible ? "hidden" : ""}`} src={invitationCover} alt="" />
      <video
        className={`intro-media intro-video ${introVisible ? "visible" : ""}`}
        ref={introVideo}
        src={invitationOpening}
        poster={invitationCover}
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        onTimeUpdate={trackIntroProgress}
        onEnded={onEnvelopeOpen}
      />
      {!envelopeOpening && <p className="intro-hint">Toca para abrir</p>}
    </section>
  );
}