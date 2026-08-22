import { supabase } from "./supabaseClient";

/**
 * Obtiene los mensajes del libro de visitas ordenados por fecha descendente.
 */
export async function fetchGuestbookEntries() {
  const { data, error } = await supabase
    .from("guestbook")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error al obtener mensajes de Supabase:", error);
    throw new Error("No se pudieron cargar los mensajes.");
  }

  return data;
}

/**
 * Inserta un nuevo mensaje en Supabase.
 */
export async function submitGuestbookEntry(payload) {
  const { data, error } = await supabase
    .from("guestbook")
    .insert([
      {
        full_name: payload.fullName,
        song: payload.song,
        message: payload.message,
      },
    ])
    .select();

  if (error) {
    console.error("Error al guardar mensaje en Supabase:", error);
    throw new Error("No se pudo guardar tu mensaje. Inténtalo de nuevo.");
  }

  return data;
}