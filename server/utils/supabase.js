const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
} else {
    console.error('❌ Supabase credentials missing. Payment verification uploads will fail. Please add SUPABASE_URL and SUPABASE_ANON_KEY to your .env file.');
}

module.exports = supabase;
