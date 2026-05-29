import { supabase } from "./supabase";

export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return "";

  // Jika sudah URL lengkap, return langsung
  if (imagePath.startsWith("http")) {
    return imagePath;
  }

  // Generate public URL dari storage
  const { data } = supabase.storage
    .from("gondo-okantara")
    .getPublicUrl(imagePath);

  return data.publicUrl || "";
};
