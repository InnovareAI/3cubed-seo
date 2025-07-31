import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkColumns() {
  const { data } = await supabase
    .from('submissions')
    .select('*')
    .limit(1);

  if (data && data[0]) {
    console.log('Available columns:');
    Object.keys(data[0]).forEach(col => {
      const value = data[0][col];
      const type = Array.isArray(value) ? 'array' : typeof value;
      console.log(`- ${col}: ${type}`);
    });
  }
}

checkColumns();