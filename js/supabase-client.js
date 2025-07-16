import { createClient } from '@supabase/supabase-js'

const supabaseUrl =  'https://ezpaehiyfqjhzbbvkpss.supabase.co'
const supabaseAnonKey = process.env.SUPABASE_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase