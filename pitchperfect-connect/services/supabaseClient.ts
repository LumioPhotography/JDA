import { createClient } from '@supabase/supabase-js';

// ------------------------------------------------------------------
// CONFIGURATION
// ------------------------------------------------------------------

// Ensure these are your valid Supabase Project URL and Anon Key.
// The URL usually ends in '.supabase.co'.
// The Anon Key usually starts with 'ey...'.

const SUPABASE_URL = 'https://xajvdlneavikqgfflezc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_TkSBRoU2C8tECbCMcYLP';

// We use .trim() to prevent errors from accidental whitespace during copy-paste
export const supabase = createClient(
  (SUPABASE_URL || '').trim(), 
  (SUPABASE_ANON_KEY || '').trim()
);
