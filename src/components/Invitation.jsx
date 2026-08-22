import { useEffect, useState, useRef } from "react";
import {
  X,
  Music,
  ChevronLeft,
  ChevronRight,
  Layers,
  Play,
  Calendar,
  MapPin,
  Sparkles,
  Search,
  MessageCircle,
} from "lucide-react";
import { PhotoComments } from "./PhotoComments";
import {
  fetchGuestbookEntries,
  submitGuestbookEntry,
} from "../services/guestbookService";

// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// Import Swiper required modules
import { Pagination, Mousewheel, Keyboard, Navigation } from "swiper/modules";

const base = import.meta.env.BASE_URL;

// ==========================================
// Componente Canvas de Estrellas Vectoriales (Path2D)
// ==========================================
function StarfieldCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.parentElement) return;
    const ctx = canvas.getContext("2d");

    const updateBounds = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    updateBounds();

    const resizeObserver = new ResizeObserver(() => {
      updateBounds();
    });
    resizeObserver.observe(canvas.parentElement);

    // ----------------------------------------------------
    // Definición de los 3 tipos de Vectores (Path2D)
    // ----------------------------------------------------
    const pathClassic = new Path2D(
      "M 0,-12 Q 0,0 12,0 Q 0,0 0,12 Q 0,0 -12,0 Q 0,0 0,-12 Z"
    );
    const pathSlimCross = new Path2D(
      "M 0,-16 Q 0,0 4,0 Q 0,0 0,16 Q 0,0 -4,0 Q 0,0 0,-16 Z"
    );
    const pathRadiant8 = new Path2D(
      "M 0,-10 Q 0,0 10,0 Q 0,0 0,10 Q 0,0 -10,0 Q 0,0 0,-10 Z " +
        "M -4,-4 Q 0,0 4,-4 Q 0,0 4,4 Q 0,0 -4,4 Q 0,0 -4,-4 Z"
    );

    const starTypes = [pathClassic, pathSlimCross, pathRadiant8];

    const stars = Array.from({ length: 40 }).map(() => ({
      x: Math.random() * (canvas.width || 300),
      y: Math.random() * (canvas.height || 600),
      size: Math.random() * 0.8 + 0.4,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.008 + 0.003,
      maxOpacity: Math.random() * 0.6 + 0.35,
      color: Math.random() > 0.4 ? "#f2e8d4" : "#e0ecf8",
      typeIndex: Math.floor(Math.random() * 3),
      rotation: Math.random() * Math.PI,
    }));

    let animationFrameId;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      stars.forEach((star) => {
        star.phase += star.speed;

        const currentOpacity =
          ((Math.sin(star.phase) + 1) / 2) * star.maxOpacity;

        if (currentOpacity < 0.01 && Math.random() < 0.1) {
          star.x = Math.random() * canvas.width;
          star.y = Math.random() * canvas.height;
          star.typeIndex = Math.floor(Math.random() * 3);
          star.rotation = Math.random() * Math.PI;
        }

        ctx.save();
        ctx.translate(star.x, star.y);
        ctx.rotate(star.rotation);
        ctx.scale(star.size, star.size);

        ctx.fillStyle = star.color;
        ctx.globalAlpha = Math.max(0, currentOpacity);
        ctx.shadowBlur = 8;
        ctx.shadowColor = star.color;

        ctx.fill(starTypes[star.typeIndex]);
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 10,
      }}
    />
  );
}

const weddingDate = new Date("2026-11-21T16:00:00-06:00");

const eventDetails = {
  title: "Boda de Itsa & Joel 💍✨",
  description:
    "¡Acompáñanos a celebrar nuestra boda! Ceremonia en Parroquia de San Miguel Arcángel y recepción en Salón Santa Inés.",
  location: "Huejotzingo, Puebla",
  start: "20261121T210000Z",
  end: "20261122T080000Z",
};

const createGoogleCalendarUrl = () => {
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    eventDetails.title
  )}&dates=${eventDetails.start}/${eventDetails.end}&details=${encodeURIComponent(
    eventDetails.description
  )}&location=${encodeURIComponent(eventDetails.location)}`;
};

const createOutlookCalendarUrl = () => {
  return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(
    eventDetails.title
  )}&body=${encodeURIComponent(
    eventDetails.description
  )}&location=${encodeURIComponent(
    eventDetails.location
  )}&startdt=2026-11-21T15:00:00&enddt=2026-11-22T02:00:00`;
};

const downloadIcsFile = () => {
  const icsData = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Boda Itsa y Joel//MX",
    "BEGIN:VEVENT",
    `SUMMARY:${eventDetails.title}`,
    `DESCRIPTION:${eventDetails.description}`,
    `LOCATION:${eventDetails.location}`,
    `DTSTART:${eventDetails.start}`,
    `DTEND:${eventDetails.end}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "boda-itsa-y-joel.ics");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const churchEvents = [
  {
    id: 1,
    time: "3:00 pm",
    title: "Ceremonia religiosa",
    text: "Misa solemne de matrimonio en la Parroquia de San Miguel.",
  },
];

const venueEvents = [
  {
    id: 2,
    time: "5:00 pm",
    title: "Recepción",
    text: "Bienvenida y coctel para todos nuestros invitados.",
  },
  {
    id: 3,
    time: "5:30 pm",
    title: "Boda civil",
    text: "Ceremonia legal e intercambio de votos.",
  },
  {
    id: 4,
    time: "6:00 pm",
    title: "Banquete",
    text: "Cena, brindis y fiesta para celebrar juntos.",
  },
];

const couplePosts = [
  {
    id: "post-1",
    caption: "Donde el camino nos cruzó y la vida sonrió. ✨❤️",
    date: "21 DE NOVIEMBRE DE 2026",
    media: [
      {
        id: 1,
        type: "image",
        src: `${base}media/couple/couple-1.webp`,
        alt: "Pareja sonriendo bajo un quiosco al atardecer",
      },
      {
        id: 2,
        type: "image",
        src: `${base}media/couple/couple-2.webp`,
        alt: "Pareja abrazada mostrando anillo de compromiso",
      },
    ],
  },
  {
    id: "post-2",
    caption: "Las luces del invierno y la calidez de tu sonrisa. 🎄🌟",
    date: "21 DE NOVIEMBRE DE 2026",
    media: [
      {
        id: 3,
        type: "image",
        src: `${base}media/couple/couple-3.webp`,
        alt: "Selfie de pareja frente a árbol navideño",
      },
      {
        id: 5,
        type: "image",
        src: `${base}media/couple/couple-5.webp`,
        alt: "Selfie nocturno frente a estructura navideña",
      },
      {
        id: 6,
        type: "image",
        src: `${base}media/couple/couple-6.webp`,
        alt: "Selfie de cerca con luces al fondo",
      },
    ],
  },
  {
    id: "post-3",
    caption: "De las risas cotidianas a la gran aventura. 😄❤️",
    date: "21 DE NOVIEMBRE DE 2026",
    media: [
      {
        id: 4,
        type: "image",
        src: `${base}media/couple/couple-4.webp`,
        alt: "Pareja vestida elegante en recepción",
      },
      {
        id: 7,
        type: "image",
        src: `${base}media/couple/couple-7.webp`,
        alt: "Selfie espontáneo sonriendo alegremente",
      },
      {
        id: 8,
        type: "image",
        src: `${base}media/couple/couple-8.webp`,
        alt: "Pareja recostada en hamaca multicolor",
      },
      {
        id: 9,
        type: "image",
        src: `${base}media/couple/couple-9.webp`,
        alt: "Pareja abrazada en noche de fiesta",
      },
    ],
  },
];

const dressCodeGallery = [
  {
    id: 1,
    src: `${base}media/dress-code/dress-1.webp`,
    alt: "Referencia de vestimenta masculina 1",
  },
  {
    id: 2,
    src: `${base}media/dress-code/dress-2.webp`,
    alt: "Referencia de vestimenta femenina 1",
  },
  {
    id: 3,
    src: `${base}media/dress-code/dress-3.webp`,
    alt: "Referencia de vestimenta masculina 2",
  },
  {
    id: 4,
    src: `${base}media/dress-code/dress-4.webp`,
    alt: "Referencia de vestimenta femenina 2",
  },
];

const contactMessage =
  "Saludos, Itsa y Joel. Envío este mensaje para confirmar mi asistencia a su boda. A continuación, les indico el total de personas que me acompañarán.";

const contactWhatsAppUrl = `https://wa.me/522217824690?text=${encodeURIComponent(
  contactMessage
)}`;

const mapUrlReception =
  "https://www.google.com/maps/place/Salon+Santa+Ines/@19.1665138,-98.4060507,17z/data=!3m1!4b1!4m6!3m5!1s0x85cfcde69466365b:0x42d10d90251e1f21!8m2!3d19.1665138!4d-98.4034758!16s%2Fg%2F11c75yy60g?entry=ttu&g_ep=EgoyMDI2MDcyOS4wIKXMDSoASAFQAw%3D%3D";
const mapEmbedUrlReception =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3768.656360307379!2d-98.4060560896514!3d19.166513781981983!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85cfcde69466365b%3A0x42d10d90251e1f21!2sSalon+Santa+Ines!5e0!3m2!1ses-419!2smx!4v1785535828384!5m2!1ses-419!2smx";

const mapUrlCeremony =
  "https://www.google.com/maps/place/Parroquia+de+San+Miguel+Arc%C3%A1ngel./@19.1580668,-98.4106796,17z/data=!4m15!1m8!3m7!1s0x85cfcdc323433ca1:0x11d8660b6301e998!2sParroquia+de+San+Miguel+Arc%C3%A1ngel.!8m2!3d19.1580812!4d-98.4081315!10e5!16s%2Fg%2F1tg161q_!3m5!1s0x85cfcdc323433ca1:0x11d8660b6301e998!8m2!3d19.1580812!4d-98.4081315!16s%2Fg%2F1tg161q_?entry=ttu&g_ep=EgoyMDI2MDcyOS4wIKXMDSoASAFQAw%3D%3D";
const mapEmbedUrlCeremony =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3768.8494380314105!2d-98.41067962941095!3d19.1580667618388!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85cfcdc323433ca1%3A0x11d8660b6301e998!2sParroquia+de+San+Miguel+Arc%C3%A1ngel.!5e0!3m2!1ses-419!2smx!4v1785535944958!5m2!1ses-419!2smx";

function getCountdown() {
  const distance = Math.max(0, weddingDate.getTime() - Date.now());

  return [
    ["Días", Math.floor(distance / 86400000)],
    ["Horas", Math.floor((distance / 3600000) % 24)],
    ["Minutos", Math.floor((distance / 60000) % 60)],
    ["Segundos", Math.floor((distance / 1000) % 60)],
  ];
}

export function Invitation() {
  const [countdown, setCountdown] = useState(getCountdown);
  const [guestbookError, setGuestbookError] = useState("");
  const [guestbookSending, setGuestbookSending] = useState(false);
  const [entries, setEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(true);

  // Buscador de canciones con iTunes API
  const [songQuery, setSongQuery] = useState("");
  const [songResults, setSongResults] = useState([]);
  const [selectedSongData, setSelectedSongData] = useState(null);
  const [showResultsDropdown, setShowResultsDropdown] = useState(false);

  // Control de modal y contador de diapositivas (1/X)
  const [activeSlideIndex, setActiveSlideIndex] = useState(1);
  const [newlyAddedId, setNewlyAddedId] = useState(null);
  const wallHeaderRef = useRef(null);

  // Estados para Lazy Loading de Mapas
  const [loadCeremonyMap, setLoadCeremonyMap] = useState(false);
  const [loadReceptionMap, setLoadReceptionMap] = useState(false);

  // Control del botón flotante y menú de calendario
  const [showFloatingSaveDate, setShowFloatingSaveDate] = useState(false);
  const [showCalendarMenu, setShowCalendarMenu] = useState(false);

  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedDressImage, setSelectedDressImage] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Ref y Estado para la animación por scroll de la Sección Poética
  const poetryRef = useRef(null);
  const [isPoetryVisible, setIsPoetryVisible] = useState(false);

  useEffect(() => {
    const el = poetryRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsPoetryVisible(true);
        }
      },
      {
        threshold: 0.05,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  const openPostModal = (post) => {
    setSelectedPost(post);
    setSelectedDressImage(null);
    setActiveSlideIndex(1);
    setIsFullScreen(false);
    document.body.style.overflow = "hidden";
  };

  const openDressModal = (image) => {
    setSelectedDressImage(image);
    setSelectedPost(null);
    setIsFullScreen(false);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setSelectedPost(null);
    setSelectedDressImage(null);
    setIsFullScreen(false);
    document.body.style.overflow = "";
  };

  useEffect(() => {
    const intervalId = setInterval(() => setCountdown(getCountdown()), 1000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowFloatingSaveDate(true);
      } else {
        setShowFloatingSaveDate(false);
        setShowCalendarMenu(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Búsqueda en la API de iTunes con Debounce
  useEffect(() => {
    if (selectedSongData) return;

    if (!songQuery.trim() || songQuery.length < 3) {
      setSongResults([]);
      setShowResultsDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://itunes.apple.com/search?term=${encodeURIComponent(
            songQuery
          )}&entity=song&limit=4`
        );
        const data = await res.json();
        setSongResults(data.results || []);
        setShowResultsDropdown(true);
      } catch (err) {
        console.error("Error buscando en iTunes API:", err);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [songQuery, selectedSongData]);

  useEffect(() => {
    async function loadGuestbook() {
      try {
        const data = await fetchGuestbookEntries();
        setEntries(data || []);
      } catch (err) {
        console.error("Error al cargar libro de visitas:", err);
      } finally {
        setLoadingEntries(false);
      }
    }
    loadGuestbook();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (showCalendarMenu) {
          setShowCalendarMenu(false);
        } else if (isFullScreen) {
          setIsFullScreen(false);
        } else if (selectedPost || selectedDressImage) {
          closeModal();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPost, selectedDressImage, isFullScreen, showCalendarMenu]);

  useEffect(() => {
    if (selectedPost || selectedDressImage) {
      setShowHint(true);
      const timer = setTimeout(() => setShowHint(false), 3000);
      return () => clearTimeout(timer);
    } else {
      setShowHint(false);
    }
  }, [selectedPost, selectedDressImage, isFullScreen]);

  const selectSongItem = (track) => {
    const formattedSong = `${track.trackName} - ${track.artistName}`;
    setSongQuery(formattedSong);
    setSelectedSongData({
      title: track.trackName,
      artist: track.artistName,
      cover: track.artworkUrl100,
    });
    setShowResultsDropdown(false);
  };

  const clearSongSelection = () => {
    setSongQuery("");
    setSelectedSongData(null);
    setSongResults([]);
  };

  async function handleGuestbookSubmit(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const formData = new FormData(formElement);

    const fullName = String(formData.get("fullName") || "").trim();
    const message = String(formData.get("message") || "").trim();

    const song = selectedSongData
      ? `${selectedSongData.title} - ${selectedSongData.artist}|${selectedSongData.cover}`
      : songQuery.trim();

    if (!fullName || !message) {
      setGuestbookError("Por favor completa tu nombre y escribe un mensaje.");
      return;
    }

    setGuestbookSending(true);
    setGuestbookError("");

    try {
      const newEntry = await submitGuestbookEntry({ fullName, song, message });
      formElement.reset();
      clearSongSelection();

      if (newEntry && newEntry.length > 0) {
        const createdItem = newEntry[0];
        setEntries((prev) => [createdItem, ...prev]);
        setNewlyAddedId(createdItem.id);

        setTimeout(() => {
          wallHeaderRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);

        setTimeout(() => {
          setNewlyAddedId(null);
        }, 3500);
      }
    } catch (error) {
      setGuestbookError("No pudimos guardar tu mensaje. Inténtalo de nuevo.");
    } finally {
      setGuestbookSending(false);
    }
  }

  const parseSongEntry = (rawSong) => {
    if (!rawSong) return null;
    if (rawSong.includes("|")) {
      const [titleArtist, coverUrl] = rawSong.split("|");
      return { text: titleArtist, cover: coverUrl };
    }
    return { text: rawSong, cover: null };
  };

  return (
    <>
      {/* Botón Flotante Dinámico "Guarda la fecha" */}
      <button
        onClick={() => setShowCalendarMenu(!showCalendarMenu)}
        className={`floating-save-date-btn ${showFloatingSaveDate ? "visible" : ""}`}
      >
        <Calendar className="h-4 w-4" />
        <span>Guarda la fecha</span>
      </button>

      {/* Nuevo Botón Flotante para Confirmar Asistencia por WhatsApp */}
      <a
        href={contactWhatsAppUrl}
        target="_blank"
        rel="noreferrer"
        className={`floating-whatsapp-btn ${showFloatingSaveDate ? "visible" : ""}`}
        aria-label="Confirmar asistencia por WhatsApp"
      >
        <MessageCircle className="h-4 w-4" />
        <span>Confirmar asistencia</span>
      </a>

      {/* Popover / Menú Desplegable de Selección de Calendarios */}
      <div className={`calendar-popover ${showCalendarMenu ? "is-active" : ""}`}>
        <div className="popover-header">
          <span>Elige tu calendario</span>
          <button onClick={() => setShowCalendarMenu(false)} aria-label="Cerrar opciones">
            <X className="h-4 w-4" />
          </button>
        </div>
        <a
          href={createGoogleCalendarUrl()}
          target="_blank"
          rel="noreferrer"
          onClick={() => setShowCalendarMenu(false)}
        >
          📅 Google Calendar
        </a>
        <button
          onClick={() => {
            downloadIcsFile();
            setShowCalendarMenu(false);
          }}
        >
          🍏 Apple Calendar (.ics)
        </button>
        <a
          href={createOutlookCalendarUrl()}
          target="_blank"
          rel="noreferrer"
          onClick={() => setShowCalendarMenu(false)}
        >
          ✉️ Outlook / Office 365
        </a>
      </div>

      <main>
        {/* Galería Mosaico con Badges Enriquecidos */}
        <section className="gallery-section light-paper-section" id="bienvenida">
          <p className="kicker">Con mucha alegría</p>
          <h2>¡Nos casamos!</h2>

          <p className="lead">
            Después de compartir tantos caminos, queremos celebrar el más bonito
            de todos junto a las personas que hacen especial nuestra historia.
          </p>
          <br />
          <p className="gallery-hint">
            (Toca cualquier publicación para ver sus fotos y comentarios)
          </p>

          <div className="instagram-grid-container">
            {couplePosts.map((post) => {
              const coverMedia = post.media[0];
              const isMultiple = post.media.length > 1;
              const isVideo = coverMedia.type === "video";

              return (
                <div
                  key={post.id}
                  className="instagram-grid-item"
                  onClick={() => openPostModal(post)}
                >
                  {isVideo ? (
                    <video
                      src={coverMedia.src}
                      muted
                      playsInline
                      className="grid-media-item"
                    />
                  ) : (
                    <img
                      src={coverMedia.src}
                      alt={coverMedia.alt}
                      className="grid-media-item"
                    />
                  )}

                  <div className="grid-item-badge">
                    {isVideo ? (
                      <Play className="h-3.5 w-3.5 fill-white text-white" />
                    ) : isMultiple ? (
                      <div className="badge-multiple-count">
                        <Layers className="h-3.5 w-3.5 text-white" />
                        <span>{post.media.length}</span>
                      </div>
                    ) : null}
                  </div>

                  <div className="grid-item-overlay">
                    <p className="overlay-caption">{post.caption}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Contador Regresivo */}
        <section className="countdown-section">
          <p className="kicker light">La espera comienza</p>
          <h2>Faltan solamente</h2>
          <div className="countdown">
            {countdown.map(([label, value]) => (
              <div className="countdown-item" key={label}>
                <strong>{String(value).padStart(2, "0")}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ==========================================
            Sección Celestial Poética (Canvas 100% Fluido)
           ========================================== */}
        <section
          ref={poetryRef}
          className={`poetry-celestial-section ${isPoetryVisible ? "is-visible" : ""}`}
          id="poesia"
        >
          {/* Canvas de estrellas con movimiento orgánico e impredecible */}
          <StarfieldCanvas />

          <div className="poetry-intro-portal">
            <p className="kicker light">Nuestra historia en versos</p>
            <h2>La Luna y el Sol</h2>
            <div className="poetry-divider-ornament">✦ ─────────────────── ✦</div>
            <p className="poetry-portal-quote">
              “La Palabra que crea creó nuestro amor...”
            </p>
          </div>

          <div className="poetry-grid">
            {/* Tarjeta Luna */}
            <article className="poetry-card moon-card">
              <div className="poetry-image-wrapper">
                <img
                  src={`${base}media/site/Luna.png`}
                  alt="Ilustración de la Luna"
                  className="poetry-illustration"
                />
              </div>

              <div className="poetry-content">
                <span className="poetry-tag">La Luna</span>
                <h3 className="poetry-title">Menguante</h3>
                <span className="poetry-dedication">— Para Itsa —</span>

                <div className="poetry-text">
                  <p>
                    Vive en mí<br />
                    como mi sangre,<br />
                    como una espina<br />
                    que busca mi centro,<br />
                    como el aliento<br />
                    que pierdo si te acercas.<br />
                    <br />
                    Vive en mi carne,<br />
                    vive en mi sangre,<br />
                    vive de mí.<br />
                    <br />
                    Que mi sombra<br />
                    sea la tuya,<br />
                    que tus pasos<br />
                    se confundan<br />
                    con los míos.<br />
                    <br />
                    Que mi aliento<br />
                    lo comparta con tu boca,<br />
                    que tu cuerpo<br />
                    sea la roca<br />
                    en que me asiente,<br />
                    en que me rompa.<br />
                    <br />
                    Que tus labios sean mi sueño,<br />
                    tu saliva mi alimento,<br />
                    tus palabras la razón de cada paso,<br />
                    cada encuentro.<br />
                    <br />
                    Que me ahuese entre tus pechos<br />
                    y me duerma<br />
                    mansamente,<br />
                    hondamente,<br />
                    sin tiempo,<br />
                    sin prisas.<br />
                    <br />
                    Vive en mí<br />
                    como mi vida,<br />
                    como esta mano<br />
                    que extiendo hacia la tuya.<br />
                    <br />
                    Vive en mí,<br />
                    conmigo,<br />
                    de mí.<br />
                    <br />
                    Lejos de ti<br />
                    no hay nada.
                  </p>
                </div>

                <div className="poetry-footer">
                  <span className="poetry-author">Joel M. J.</span>
                  <span className="poetry-date">7 de abril de 2026</span>
                </div>
              </div>
            </article>

            {/* Tarjeta Sol */}
            <article className="poetry-card sun-card">
              <div className="poetry-image-wrapper">
                <img
                  src={`${base}media/site/Sol.png`}
                  alt="Ilustración del Sol"
                  className="poetry-illustration"
                />
              </div>

              <div className="poetry-content">
                <span className="poetry-tag">El Sol</span>
                <h3 className="poetry-title">Fronterizo</h3>
                <span className="poetry-dedication">— Para Itsa —</span>

                <div className="poetry-text">
                  <p>
                    El límite es la mirada,<br />
                    pero más allá hay verdor<br />
                    y un sol ardiente que entibia<br />
                    el corazón.<br />
                    <br />
                    Frontera entre tú y yo,<br />
                    los ojos.<br />
                    <br />
                    El suspiro me invita hacia tu pecho<br />
                    y el silencio es el guardián de tus encantos.<br />
                    <br />
                    También quiero cruzar esa frontera:<br />
                    mirar cerca los ojos que yo quiero,<br />
                    contemplar la sonrisa constelada.<br />
                    <br />
                    La silueta en que se mece la luna<br />
                    es el descanso que quieren mis manos.<br />
                    <br />
                    Esta patria perdida me retiene<br />
                    y el ojo escapa lejos a tus tierras.<br />
                    <br />
                    Frontera entre tú y yo,<br />
                    esa mirada<br />
                    que viene hacia la mía con sus misterios,<br />
                    me invita a que la siga hacia su estancia<br />
                    y me envuelve de amor entre tus besos.
                  </p>
                </div>

                <div className="poetry-footer">
                  <span className="poetry-author">Joel M. J.</span>
                  <span className="poetry-date">8 de diciembre de 2025</span>
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* Sección "El Gran Día" */}
        <section className="details-section dark-paper-section" id="detalles">
          <p className="kicker">Guarda la fecha</p>
          <h2>El gran día</h2>
          <div className="details-grid">
            <article>
              <h3>Cuándo</h3>
              <p>
                Sábado<br />
                <b>21 de noviembre de 2026</b>
              </p>
              <button
                className="calendar-add-btn"
                onClick={() => setShowCalendarMenu(!showCalendarMenu)}
              >
                📅 Agendar en mi calendario
              </button>
            </article>
            <article>
              <h3>Dónde</h3>
              <p>
                Parroquia de San Miguel Huejotzingo &<br />
                <b>Salón Santa Inés</b>
              </p>
              <a href="#ubicacion" rel="noreferrer">
                Ver ubicaciones
              </a>
            </article>
            <article>
              <h3>Vestuario</h3>
              <p>
                Ropa elegante<br />
                <b>Código de vestuario</b>
              </p>
              <a href="#vestimenta" rel="noreferrer">
                Ver referencias
              </a>
            </article>
          </div>
        </section>

        {/* Itinerario */}
        <section className="schedule-section light-paper-section" id="itinerario">
          <p className="kicker">No te pierdas nada</p>
          <h2>Itinerario</h2>

          <div className="scenarios-container">
            <article className="scenario-card">
              <header className="scenario-header">
                <span className="scenario-badge">⛪ Ceremonia</span>
                <h3>Parroquia de San Miguel</h3>
                <p className="scenario-location">Huejotzingo, Puebla</p>
              </header>

              <div className="scenario-timeline">
                {churchEvents.map((event) => (
                  <div key={`church-${event.id}`} className="scenario-item">
                    <time>{event.time}</time>
                    <div className="scenario-item-content">
                      <h4>{event.title}</h4>
                      <p>{event.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <a className="scenario-map-btn" href="#ubicacion">
                Ver mapa de la Parroquia
              </a>
            </article>

            <article className="scenario-card">
              <header className="scenario-header">
                <span className="scenario-badge">🥂 Celebración</span>
                <h3>Salón Santa Inés</h3>
                <p className="scenario-location">Cuarto Barrio, Huejotzingo</p>
              </header>

              <div className="scenario-timeline">
                {venueEvents.map((event) => (
                  <div key={`venue-${event.id}`} className="scenario-item">
                    <time>{event.time}</time>
                    <div className="scenario-item-content">
                      <h4>{event.title}</h4>
                      <p>{event.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <a className="scenario-map-btn" href="#ubicacion-recepcion">
                Ver mapa del Salón
              </a>
            </article>
          </div>
        </section>

        {/* Mapa 1: Parroquia con Lazy Load */}
        <section className="map-section dark-paper-section" id="ubicacion">
          <div className="map-copy">
            <p className="kicker">Cómo llegar</p>
            <p>Parroquia de San Miguel Huejotzingo</p>
            <span>Plaza Principal # 204 - Colonia Centro, Huejotzingo, Puebla</span>
            <a
              className="map-link"
              href={mapUrlCeremony}
              target="_blank"
              rel="noreferrer"
            >
              Abrir en Google Maps
            </a>
          </div>

          <div className="map-container">
            {loadCeremonyMap ? (
              <iframe
                title="Mapa de Parroquia de San Miguel Huejotzingo"
                src={mapEmbedUrlCeremony}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            ) : (
              <div
                className="map-placeholder"
                onClick={() => setLoadCeremonyMap(true)}
              >
                <MapPin className="h-8 w-8 text-gold" />
                <span>Haz clic para cargar el mapa interactivo</span>
              </div>
            )}
          </div>
        </section>

        <section className="schedule-section light-paper-section" id="contacto">
          <h3>Confirma tu asistencia</h3>
          <p>
            Presiona el siguiente botón para hacernos saber que podrás acompañarnos en nuestro día especial.
          </p>
          <a
            className="contact-link"
            href={contactWhatsAppUrl}
            target="_blank"
            rel="noreferrer"
          >
            Confirmar vía WhatsApp
          </a>
        </section>

        {/* Mapa 2: Recepción con Lazy Load */}
        <section
          className="map-section dark-paper-section"
          id="ubicacion-recepcion"
        >
          <div className="map-copy">
            <p className="kicker">Cómo llegar</p>
            <p>Salón Santa Inés</p>
            <span>Las Huertas 1114-1115, Cuarto Barrio, Huejotzingo, Puebla</span>
            <a
              className="map-link"
              href={mapUrlReception}
              target="_blank"
              rel="noreferrer"
            >
              Abrir en Google Maps
            </a>
          </div>

          <div className="map-container">
            {loadReceptionMap ? (
              <iframe
                title="Mapa de Salón Santa Inés"
                src={mapEmbedUrlReception}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            ) : (
              <div
                className="map-placeholder"
                onClick={() => setLoadReceptionMap(true)}
              >
                <MapPin className="h-8 w-8 text-gold" />
                <span>Haz clic para cargar el mapa interactivo</span>
              </div>
            )}
          </div>
        </section>

        {/* Cuadrícula Mosaico de Vestimenta */}
        <section className="gallery-section light-paper-section" id="vestimenta">
          <p className="kicker">Referencias de</p>
          <h2>Vestimenta</h2>

          <p className="lead">
            Los invitamos a vestir con un atuendo elegante y cómodo para un entorno natural, eligiendo
            tonos pastel o suaves. Les agradecemos reservar el blanco y sus tonalidades para la novia.
          </p>
          <br />
          <p className="gallery-hint">
            (Toca cualquier imagen para ver la referencia ampliada)
          </p>

          <div className="dress-code-grid-container">
            {dressCodeGallery.map((image) => (
              <div
                key={`dress-code-img-${image.id}`}
                className="dress-grid-item"
                onClick={() => openDressModal(image)}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="dress-media-item"
                />
                <div className="dress-item-overlay">
                  <span>Ver referencia</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Cita Destacada */}
        <section
          className="quote-section"
          style={{ backgroundImage: `url(${base}media/site/reception.webp)` }}
        >
          <div>
            <p>“De la suerte de encontrarnos a la fortuna de tenernos.”</p>
          </div>
        </section>

        {/* Sección Regalos */}
        <section className="gift-section light-paper-section" id="regalos">
          <p className="kicker">Lazos en forma de</p>
          <h2>Obsequios</h2>
          <p className="lead">
            Tu presencia es lo más importante para nosotros. Si además deseas
            tener un detalle, hemos preparado una opción sencilla.
          </p>
          <div className="gift-card">
            <h3>Lluvia de sobres</h3>
            <p>Encontrarás un espacio especial durante la celebración.</p>
          </div>
        </section>

        {/* Muro de Deseos con Buscador de iTunes */}
        <section className="rsvp-section" id="muro-deseos">
          <div className="rsvp-intro">
            <p className="kicker light">Con cariño para siempre</p>
            <h2>Muro de deseos</h2>
            <p className="lead" style={{ color: "#f2e8d4", paddingTop: "8px" }}>
              Cada paso hasta aquí ha sido más bonito gracias a ustedes. Déjanos un mensaje 
              o dedica una canción para celebrar juntos en la pista de baile.
            </p>
          </div>

          <form className="rsvp-form" onSubmit={handleGuestbookSubmit}>
            <div className="form-grid">
              <label>
                Nombre completo *
                <input name="fullName" required placeholder="Escribe tu nombre" />
              </label>

              <label className="song-search-container">
                Dedícale una canción a los novios
                <div className="input-with-search-icon">
                  <input
                    name="song"
                    value={songQuery}
                    onChange={(e) => {
                      setSongQuery(e.target.value);
                      if (selectedSongData) setSelectedSongData(null);
                    }}
                    placeholder="Ejemplo: Amor Primero - Los Ángeles Azules"
                    autoComplete="off"
                  />
                  {selectedSongData ? (
                    <button
                      type="button"
                      className="clear-song-btn"
                      onClick={clearSongSelection}
                      title="Borrar selección"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  ) : (
                    <Search className="h-4 w-4 search-icon-inside" />
                  )}
                </div>

                {showResultsDropdown && songResults.length > 0 && (
                  <ul className="song-autocomplete-dropdown">
                    {songResults.map((item) => (
                      <li
                        key={`song-${item.trackId}`}
                        onClick={() => selectSongItem(item)}
                      >
                        <img
                          src={item.artworkUrl100}
                          alt={item.trackName}
                          className="song-artwork-thumb"
                        />
                        <div className="song-info">
                          <strong>{item.trackName}</strong>
                          <span>{item.artistName}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </label>

              <label className="form-full">
                Tus palabras para los novios *
                <textarea
                  name="message"
                  required
                  rows="4"
                  placeholder="Escribe unas palabras especiales para Joel e Itsa..."
                />
              </label>
            </div>

            {guestbookError && <p className="form-error">{guestbookError}</p>}

            <button
              className="submit-button"
              type="submit"
              disabled={guestbookSending}
            >
              {guestbookSending ? "Publicando..." : "Publicar en el muro"}
            </button>
          </form>

          <div className="guestbook-wall" ref={wallHeaderRef}>
            <h3>Mensajes de nuestros invitados</h3>

            {!loadingEntries && entries.length > 0 && (
              <div className="social-proof-badge">
                <Sparkles className="h-4 w-4 text-gold" />
                <span>
                  <b>{entries.length}</b>{" "}
                  {entries.length === 1
                    ? "invitado ya dejó sus buenos deseos"
                    : "invitados ya dejaron sus buenos deseos"}
                </span>
              </div>
            )}

            {loadingEntries ? (
              <p className="guestbook-loading">Cargando mensajes con cariño...</p>
            ) : entries.length === 0 ? (
              <p className="guestbook-empty">
                Sé el primero en dejar un mensaje o dedicar una canción. ✨
              </p>
            ) : (
              <div className="guestbook-grid">
                {entries.map((entry) => {
                  const songObj = parseSongEntry(entry.song);

                  return (
                    <article
                      key={`entry-${entry.id}`}
                      className={`guestbook-card ${
                        newlyAddedId === entry.id ? "new-entry-highlight" : ""
                      }`}
                    >
                      <div className="guestbook-card-header">
                        <div className="guestbook-avatar">
                          {entry.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="guestbook-author-info">
                          <strong>{entry.full_name}</strong>
                        </div>
                      </div>

                      {songObj && songObj.text && (
                        <div className="guestbook-song-card-badge">
                          {songObj.cover ? (
                            <img
                              src={songObj.cover}
                              alt="Carátula"
                              className="song-badge-cover"
                            />
                          ) : (
                            <Music className="h-4 w-4 text-gold shrink-0" />
                          )}
                          <div className="song-badge-details">
                            <span className="song-badge-title">
                              🎵 Canción dedicada:
                            </span>
                            <span className="song-badge-name">
                              "{songObj.text}"
                            </span>
                          </div>
                        </div>
                      )}

                      <p className="guestbook-message">"{entry.message}"</p>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer con Firma y Dedicatoria Personal */}
      <footer>
        <div className="ornament">
          <img
            src={`${base}media/site/rings-ornament.webp`}
            width={88}
            height="auto"
            loading="lazy"
            alt=""
          />
        </div>
        <p className="signature">Nuestra Boda</p>
        <span>21 · 11 · 2026</span>
        <p className="footer-dedication">Hecho por Joel para Itsa con ❤️</p>
      </footer>

      {/* Modal Instagram con Contador de Diapositivas (1/X) */}
      {(selectedPost || selectedDressImage) && (
        <div className="image-modal-overlay" onClick={closeModal}>
          <div
            className={`instagram-card ${isFullScreen ? "is-fullscreen" : ""}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="instagram-header">
              <div className="instagram-user">
                <div className="instagram-avatar">I & J</div>
                <div className="instagram-user-info">
                  <span className="username">itsa_joel</span>
                  <span className="location">Huejotzingo, Puebla</span>
                </div>
              </div>
              <button
                className="instagram-close-button"
                onClick={closeModal}
                aria-label="Cerrar"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div
              className="instagram-image-container"
              onClick={() => setIsFullScreen(!isFullScreen)}
              style={{ cursor: isFullScreen ? "zoom-out" : "zoom-in" }}
            >
              {selectedPost ? (
                <div
                  className="modal-swiper-wrapper"
                  onClick={(e) => e.stopPropagation()}
                >
                  {selectedPost.media.length > 1 && (
                    <div className="modal-slide-counter">
                      {activeSlideIndex} / {selectedPost.media.length}
                    </div>
                  )}

                  <Swiper
                    slidesPerView={1}
                    spaceBetween={0}
                    pagination={{ clickable: true }}
                    navigation={{
                      prevEl: ".modal-prev",
                      nextEl: ".modal-next",
                    }}
                    onSlideChange={(swiper) =>
                      setActiveSlideIndex(swiper.activeIndex + 1)
                    }
                    modules={[Pagination, Navigation, Mousewheel, Keyboard]}
                    className="modal-swiper"
                  >
                    {selectedPost.media.map((item) => (
                      <SwiperSlide key={`modal-item-${item.id}`}>
                        {item.type === "video" ? (
                          <video
                            src={item.src}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="instagram-image"
                            onClick={() => setIsFullScreen(!isFullScreen)}
                          />
                        ) : (
                          <img
                            src={item.src}
                            alt={item.alt}
                            className="instagram-image"
                            onClick={() => setIsFullScreen(!isFullScreen)}
                          />
                        )}
                      </SwiperSlide>
                    ))}
                  </Swiper>

                  {selectedPost.media.length > 1 && (
                    <>
                      <button className="swiper-button-prev-custom modal-prev">
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button className="swiper-button-next-custom modal-next">
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <img
                  className="instagram-image"
                  src={selectedDressImage.src}
                  alt={selectedDressImage.alt}
                />
              )}

              {isFullScreen && (
                <button
                  className="fullscreen-close-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFullScreen(false);
                  }}
                  aria-label="Salir de pantalla completa"
                >
                  <X className="h-6 w-6" />
                </button>
              )}

              <span
                className={`fullscreen-hint ${
                  !isFullScreen ? "photo-preview-hint" : ""
                } ${showHint ? "visible" : ""}`}
              >
                {isFullScreen
                  ? "Haz clic o toca para volver a los comentarios"
                  : "Haz clic o toca la imagen para ver a pantalla completa"}
              </span>
            </div>

            <div className="instagram-footer">
              <p className="instagram-caption">
                <span className="username">itsa_joel</span>{" "}
                {selectedPost
                  ? selectedPost.caption
                  : "Código de vestimenta para nuestra boda. ✨"}
              </p>
              <span className="instagram-date">
                {selectedPost ? selectedPost.date : "21 DE NOVIEMBRE DE 2026"}
              </span>

              {selectedPost && <PhotoComments photoId={selectedPost.id} />}
            </div>
          </div>
        </div>
      )}
    </>
  );
}