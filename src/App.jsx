import { useState } from "react";
import { Analytics } from '@vercel/analytics/react';
import { MusicToggle } from "./components/MusicToggle";
import { Intro } from "./components/Intro";
import { Invitation } from "./components/Invitation";
import { backgroundAudioSrc } from "./config/audio";
import { useBackgroundMusic } from "./hooks/useBackgroundMusic";

function App() {
  const [envelopeOpened, setEnvelopeOpened] = useState(false);
  const music = useBackgroundMusic(backgroundAudioSrc);

  const handleEnvelopeOpen = () => {
    setEnvelopeOpened(true);
    // Si la música no está sonando, aprovechamos la interacción del usuario con el sobre para activarla
    if (!music.playing && typeof music.toggle === "function") {
      music.toggle();
    }
  };

  return (
    <>
      {!envelopeOpened && (
        <Intro onEnvelopeOpen={handleEnvelopeOpen} />
      )}

      {envelopeOpened && <Invitation />}

      <MusicToggle
        enabled={music.enabled}
        playing={music.playing}
        unavailable={music.unavailable}
        onToggle={music.toggle}
      />

      <Analytics />
    </>
  );
}

export default App;