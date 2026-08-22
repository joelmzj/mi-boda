// Background music file. Served from /public so it is available in production
// and can be added later by simply dropping the MP3 into public/audio/.
const base = import.meta.env.BASE_URL;
const cleanBase = base.endsWith('/') ? base : `${base}/`;

export const backgroundAudioSrc =
  import.meta.env.VITE_BACKGROUND_AUDIO_SRC || `${cleanBase}audio/wedding-background.mp3`;