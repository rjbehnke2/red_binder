/**
 * Supabase client — configured in Week 1 completion.
 * Credentials provided after scaffold is verified.
 *
 * Usage:
 *   import { supabase } from './lib/supabase'
 *   const { data, error } = await supabase.from('entries').select('*')
 */

// TODO: Replace with actual Supabase project URL and anon key
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

let supabase = null

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  // Lazy import to avoid errors before credentials are set
  import('@supabase/supabase-js').then(({ createClient }) => {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  })
}

export { supabase }
