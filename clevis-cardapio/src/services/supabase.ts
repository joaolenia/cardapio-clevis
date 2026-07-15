import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://smkqpmbmexkedkprfleh.supabase.co';
// Usando a tua chave pública fornecida
const supabaseAnonKey = 'sb_publishable_bfbS5mriM6qA8AXJLNEr4A_ebVvJ1Ls'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);