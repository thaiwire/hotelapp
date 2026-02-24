import { createClient } from "@supabase/supabase-js";


const supabaseUrl = process.env.SUPABASE_PROJECT_URL;
const supabaseKey = process.env.SUPABASE_API_KEY;


const supabaseConfig = createClient(supabaseUrl!, supabaseKey!);

export default supabaseConfig;
