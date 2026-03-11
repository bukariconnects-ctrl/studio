import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rpfliekiobxoibkatqah.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwZmxpZWtpb2J4b2lia2F0cWFoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzA3MDQ0MywiZXhwIjoyMDg4NjQ2NDQzfQ.wn9mLkGdlxGzpNCeAvy_2gU-BW--lHyhNXSOMMtybNY';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const USERS = [
  { email: 'admin@artphoto.ye', password: 'Admin@2026' },
  { email: 'essam@artphoto.ye', password: 'Photo@2026' },
  { email: 'arwa@artphoto.ye', password: 'Photo@2026' },
  { email: 'mazen@artphoto.ye', password: 'Photo@2026' },
  { email: 'fatima@client.ye', password: 'Client@2026' },
  { email: 'mohammed@client.ye', password: 'Client@2026' },
  { email: 'noor@client.ye', password: 'Client@2026' },
];

console.log('🔐 بدء إعادة تعيين كلمات المرور...\n');

async function resetPassword(email, newPassword) {
  const { data: users } = await supabase.auth.admin.listUsers();
  const user = users.users.find(u => u.email === email);
  
  if (!user) {
    console.log(`❌ لم يتم العثور على: ${email}`);
    return false;
  }

  const { error } = await supabase.auth.admin.updateUserById(user.id, {
    password: newPassword
  });

  if (error) {
    console.log(`❌ فشل تحديث كلمة المرور لـ ${email}:`, error.message);
    return false;
  }

  console.log(`✅ تم تحديث كلمة المرور: ${email}`);
  return true;
}

async function run() {
  let success = 0;
  let failed = 0;

  for (const user of USERS) {
    const result = await resetPassword(user.email, user.password);
    if (result) success++;
    else failed++;
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`✅ نجح: ${success}`);
  console.log(`❌ فشل: ${failed}`);
  console.log('═══════════════════════════════════════════════════════════\n');
}

run().catch(console.error);
