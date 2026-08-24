import { useCallback, useEffect, useRef, useState } from "react";

const preferenceKey = "wedding-background-music-enabled";
const defaultVolume = 0.24;

function readPreference() {
  return localStorage.getItem(preferenceKey) !== "false";
}

export function useBackgroundMusic(src) {
  const audioRef = useRef(null);
  const [enabled, setEnabled] = useState(readPreference);
  const [playing, setPlaying] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const wasPlayingBeforeHidden = useRef(false);

  const attemptPlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !enabled || unavailable) return;

    try {
      await audio.play();
    } catch {
      // Autoplay was blocked; playback will be retried after a user gesture.
    }
  }, [enabled, unavailable]);

  // Método robusto para forzar reproducción inmediata desde gestos táctiles en móviles
  const forcePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || unavailable) return;
    
    setEnabled(true);
    localStorage.setItem(preferenceKey, "true");

    try {
      audio.muted = false;
      await audio.play();
    } catch (err) {
      console.error("Error al forzar reproducción de audio en móvil:", err);
    }
  }, [unavailable]);

  useEffect(() => {
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = defaultVolume;
    // Cambiamos a "auto" para asegurar precarga óptima en móviles
    audio.preload = "auto";
    audioRef.current = audio;

    const markPlaying = () => setPlaying(true);
    const markPaused = () => setPlaying(false);
    const markUnavailable = () => {
      setUnavailable(true);
      setPlaying(false);
    };

    audio.addEventListener("play", markPlaying);
    audio.addEventListener("pause", markPaused);
    audio.addEventListener("error", markUnavailable);

    return () => {
      audio.pause();
      audio.removeEventListener("play", markPlaying);
      audio.removeEventListener("pause", markPaused);
      audio.removeEventListener("error", markUnavailable);
      audioRef.current = null;
    };
  }, [src]);

  useEffect(() => {
    localStorage.setItem(preferenceKey, String(enabled));

    if (!enabled) {
      audioRef.current?.pause();
      return undefined;
    }

    attemptPlay();

    const startAfterInteraction = () => attemptPlay();
    window.addEventListener("pointerdown", startAfterInteraction, { once: true });
    window.addEventListener("keydown", startAfterInteraction, { once: true });

    return () => {
      window.removeEventListener("pointerdown", startAfterInteraction);
      window.removeEventListener("keydown", startAfterInteraction);
    };
  }, [attemptPlay, enabled]);

  useEffect(() => {
    const handleVisibilityChange = async () => {
      const audio = audioRef.current;

      if (!audio || unavailable) return;

      if (document.hidden) {
        wasPlayingBeforeHidden.current = !audio.paused;

        if (!audio.paused) {
          audio.pause();
        }
      } else if (enabled && wasPlayingBeforeHidden.current) {
        await attemptPlay();
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () =>
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
  }, [attemptPlay, enabled, unavailable]);

  const toggle = useCallback(() => {
    setEnabled((current) => !current);
  }, []);

  return { enabled, playing, unavailable, toggle, forcePlay };
}