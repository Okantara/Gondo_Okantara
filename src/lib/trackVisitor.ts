import { supabase } from "@/lib/supabase";

export async function trackVisitor(page: string) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const storageKey = `visited_${page}_${today}`;

    // Supaya 1 pengunjung tidak dicatat berkali-kali dalam 1 hari
    if (localStorage.getItem(storageKey)) {
      return;
    }

    const { error } = await supabase.from("visitor_logs").insert({
      page,
      user_agent: navigator.userAgent,
      referrer: document.referrer || null,
    });

    if (error) {
      console.error("Gagal mencatat visitor:", error);
      return;
    }

    localStorage.setItem(storageKey, "true");
  } catch (err) {
    console.error("Error trackVisitor:", err);
  }
}
