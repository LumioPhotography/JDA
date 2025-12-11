import { createClient } from '@supabase/supabase-js';

// ------------------------------------------------------------------
// HOW TO FIND YOUR KEYS:
// 1. Go to your Supabase Dashboard.
// 2. Click on "Settings" (Gear icon ⚙️ at the bottom left).
// 3. Click on "API".
// 4. Copy the "Project URL" and paste it below.
// 5. Look for "Project API Keys" -> "anon" (public). Copy that and paste it below.
// 
// ⚠️ WARNING: Use the 'anon' key. Do NOT use the 'service_role' (secret) key!
// ------------------------------------------------------------------

// REPLACE THE TEXT INSIDE THE QUOTES BELOW:
const SUPABASE_URL = 'https://xajvdlneavikqgfflezc.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_TkSBRoU2C8tECbCMcYLPaw_glCv7VBM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
