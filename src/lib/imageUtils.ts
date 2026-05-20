import { supabase } from "./supabase";

export const getImageUrl = (imagePath: string): string => {
  const { data } = supabase.storage
    .from("gondo-okantara")
    .getPublicUrl(imagePath);

  return data.publicUrl;
};
