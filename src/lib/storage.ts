import { supabase } from "./supabase";

const BUCKET_NAME = "gondo-okantara"; // Sesuaikan dengan nama bucket Anda

// Upload file ke storage
export async function uploadFile(
  file: File,
  path: string
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;

  // Get public URL
  const { data: publicData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  return publicData.publicUrl;
}

// Delete file dari storage
export async function deleteFile(path: string) {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([path]);

  if (error) throw error;
}

// Get public URL untuk file
export function getPublicUrl(path: string): string {
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
  return data.publicUrl;
}

// Upload multiple files
export async function uploadMultipleFiles(
  files: File[],
  folder: string
): Promise<string[]> {
  const urls: string[] = [];

  for (const file of files) {
    const path = `${folder}/${Date.now()}-${file.name}`;
    const url = await uploadFile(file, path);
    urls.push(url);
  }

  return urls;
}
