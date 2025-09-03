// src/config/db.js
import { createClient } from '@supabase/supabase-js';
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // use com cuidado no backend

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Supabase env variables not set');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default supabase;
