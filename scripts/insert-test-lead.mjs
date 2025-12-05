import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Load env vars from .env.local
const envFile = readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    env[key.trim()] = valueParts.join('=').trim();
  }
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const { data, error } = await supabase
  .from('splash_leads')
  .insert({
    first_name: 'John',
    last_name: 'TestLead',
    phone: '(217) 555-0123',
    email: 'john.testlead@example.com',
    street_address: '123 Solar Lane',
    city: 'Springfield',
    state: 'IL',
    zip_code: '62701',
    utility_company: 'Ameren Illinois',
    homeowner_status: 'yes',
    credit_score: '650+',
    shading: 'none',
    is_partial: false,
    form_type: 'ameren_illinois_splash',
    source: 'splash_page',
    status: 'new',
    completed_at: new Date().toISOString()
  })
  .select();

if (error) {
  console.error('Error:', error.message);
  process.exit(1);
}

console.log('Test lead inserted successfully:');
console.log(JSON.stringify(data, null, 2));
