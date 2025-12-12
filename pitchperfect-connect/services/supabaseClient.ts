import { createClient } from '@supabase/supabase-js';

// ------------------------------------------------------------------
// CONFIGURATION
// ------------------------------------------------------------------

// YOUR PROJECT URL
const SUPABASE_URL = 'https://xajvdlneavikqgfflezc.supabase.co';

// YOUR API KEY
// This is the 'anon' public key (Safe to be public in a client-side app)
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhanZkbG5lYXZpa3FnZmZsZXpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzODA0NjcsImV4cCI6MjA4MDk1NjQ2N30.34Mc--iaZ47hjOO12zf8OBe-fk7ITF1jinKQz-rhw-4';

export const supabase = createClient(
  (SUPABASE_URL || '').trim(), 
  (SUPABASE_ANON_KEY || '').trim()
);