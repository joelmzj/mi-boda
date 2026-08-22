import { createClient } from "@supabase/supabase-js";

// Obtén estos dos valores en Supabase: Settings -> API
const SUPABASE_URL = "https://wtwhuxpkycqzdnrkedew.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0d2h1eHBreWNxemRucmtlZGV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4MDUxNjEsImV4cCI6MjEwMTM4MTE2MX0.oxe54LrNIqcB-DhIGv4fFFTL8dekhv7saDI5mEl8S70";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);