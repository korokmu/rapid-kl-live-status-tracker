// Initialize the Supabase client
// We use 'sb' instead of 'supabase' to avoid naming conflicts
const { createClient } = window.supabase;
const sb = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
