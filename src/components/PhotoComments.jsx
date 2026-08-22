import { useEffect, useState } from "react";
import { Heart, Send } from "lucide-react";
import { supabase } from "../services/supabaseClient";

export function PhotoComments({ photoId }) {
  const [comments, setComments] = useState([]);
  const [likesCount, setLikesCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchComments();
    fetchLikes();

    // Comprobar si este dispositivo ya dio like localmente
    const localLikes = JSON.parse(localStorage.getItem("liked_photos") || "{}");
    if (localLikes[photoId]) {
      setHasLiked(true);
    }

    // Suscripción en tiempo real a comentarios
    const commentChannel = supabase
      .channel(`comments:${photoId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "photo_comments", filter: `photo_id=eq.${photoId}` },
        (payload) => setComments((prev) => [payload.new, ...prev])
      )
      .subscribe();

    // Suscripción en tiempo real a likes
    const likeChannel = supabase
      .channel(`likes:${photoId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "photo_likes", filter: `photo_id=eq.${photoId}` },
        () => setLikesCount((prev) => prev + 1)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(commentChannel);
      supabase.removeChannel(likeChannel);
    };
  }, [photoId]);

  async function fetchComments() {
    setLoading(true);
    const { data } = await supabase
      .from("photo_comments")
      .select("*")
      .eq("photo_id", photoId)
      .order("created_at", { ascending: false });
    setComments(data || []);
    setLoading(false);
  }

  async function fetchLikes() {
    const { count } = await supabase
      .from("photo_likes")
      .select("*", { count: "exact", head: true })
      .eq("photo_id", photoId);
    setLikesCount(count || 0);
  }

  async function handleLike() {
    if (hasLiked) return; // Evita múltiples likes por dispositivo

    setHasLiked(true);
    setLikesCount((prev) => prev + 1);

    // Guardar preferencia local
    const localLikes = JSON.parse(localStorage.getItem("liked_photos") || "{}");
    localLikes[photoId] = true;
    localStorage.setItem("liked_photos", JSON.stringify(localLikes));

    await supabase.from("photo_likes").insert([{ photo_id: photoId }]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!authorName.trim() || !commentText.trim()) return;

    setSending(true);
    const { error } = await supabase.from("photo_comments").insert([
      {
        photo_id: photoId,
        author_name: authorName.trim(),
        comment_text: commentText.trim(),
      },
    ]);

    if (!error) {
      setCommentText("");
    }
    setSending(false);
  }

  return (
    <div className="photo-interactions-container">
      {/* Barra de Me Gusta Pro */}
      <div className="photo-likes-bar">
        <button 
          onClick={handleLike} 
          className={`like-action-btn ${hasLiked ? "is-liked" : ""}`}
          aria-label="Me gusta"
        >
          <Heart className={`h-5 w-5 ${hasLiked ? "fill-red-500 text-red-500" : "text-gray-700"}`} />
        </button>
        <span className="likes-counter-text">
          <b>{likesCount}</b> {likesCount === 1 ? "me gusta" : "me gusta"}
        </span>
      </div>

      {/* Lista de Comentarios Scrollable con estilo burbuja/avatar */}
      <div className="photo-comments-scroll-area">
        {loading ? (
          <p className="comments-loading">Cargando mensajes...</p>
        ) : comments.length === 0 ? (
          <p className="no-comments-hint">Sé el primero en dejar un mensaje... ❤️</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="photo-comment-bubble">
              <div className="comment-avatar-mini">{c.author_name.charAt(0).toUpperCase()}</div>
              <div className="comment-bubble-content">
                <div className="comment-bubble-header">
                  <strong>{c.author_name}</strong>
                </div>
                <p>{c.comment_text}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Formulario Estilizado con Caja de Texto Ad Hoc */}
      <form onSubmit={handleSubmit} className="photo-comment-box-form">
        <div className="comment-inputs-stack">
          <input
            type="text"
            placeholder="Tu nombre *"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            required
            className="comment-input-field"
            autoComplete="off"
          />
          <div className="comment-textarea-wrapper">
            <textarea
              placeholder="Escribe un comentario especial..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              required
              rows="2"
              className="comment-textarea-field"
            />
            <button 
              type="submit" 
              disabled={sending}
              className="comment-send-btn"
              title="Publicar comentario"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}