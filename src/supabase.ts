
import { createClient } from '@supabase/supabase-js';

// Estas variables se cargan desde el entorno. 
// En desarrollo puedes reemplazarlas temporalmente por tus cadenas de texto reales
// que obtuviste en el panel de Supabase.
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://dhiowubwvlitryzfvnoe.supabase.co';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoaW93dWJ3dmxpdHJ5emZ2bm9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MzQ5MDMsImV4cCI6MjA4MzQxMDkwM30.wAzhwtp4r6NWOJHncegAjYZxOWWRPtYxUCpylNfduoo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
