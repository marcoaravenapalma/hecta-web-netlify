import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://gduywpeyshhhnnlwdgcm.supabase.co";

const supabaseKey =
  "sb_publishable_nK9oFEvZsPTATuzMAIm7Og_4Cu6SS5c";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);