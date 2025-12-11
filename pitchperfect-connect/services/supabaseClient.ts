import { createClient } from '@supabase/supabase-js';

// ------------------------------------------------------------------
// CONFIGURATION
// ------------------------------------------------------------------

// Ensure these are your valid Supabase Project URL and Anon Key.
// The URL usually ends in '.supabase.co'.
// The Anon Key usually starts with 'ey...'.

const SUPABASE_URL = 'https://xajvdlneavikqgfflezc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhanZkbG5lYXZpa3FnZmZsZXpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzODA0NjcsImV4cCI6MjA4MDk1NjQ2N30.34Mc--iaZ47hjOO12zf8OBe-fk7ITF1jinKQz-rhw-4';

// We use .trim() to prevent errors from accidental whitespace during copy-paste
export const supabase = createClient(
  (SUPABASE_URL || '').trim(), 
  (SUPABASE_ANON_KEY || '').trim()
);
