/// <reference types="vite/client" />

declare module "*.jpeg";
declare module "*.jpg";
declare module "*.png";
declare module "*.svg";

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "../../lib/supabase" {
  export const supabase: any;
}
