import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nlijbrwwrufhpwjahukz.supabase.co';
const supabaseAnonKey = 'sb_publishable_JkfQ8LWrFtIjgH5I-OuLyQ_s0OafGi_';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
