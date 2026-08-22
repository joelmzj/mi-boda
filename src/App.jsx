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

  return (
    <>
      {!envelopeOpened && (
        <Intro onEnvelopeOpen={() => setEnvelopeOpened(true)} />
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