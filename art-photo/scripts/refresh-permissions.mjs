import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rpfliekiobxoibkatqah.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwZmxpZWtpb2J4b2lia2F0cWFoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzA3MDQ0MywiZXhwIjoyMDg4NjQ2NDQzfQ.wn9mLkGdlxGzpNCeAvy_2gU-BW--lHyhNXSOMMtybNY';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

console.log('🔄 تحديث صلاحيات المستخدمين في JWT...\n');

async function refreshUserPermissions() {
  const { data: users } = await supabase.auth.admin.listUsers();
  
  for (const user of users.users) {
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role:roles(name)')
      .eq('user_id', user.id);

    const roleName = userRoles?.[0]?.role?.name || 'client';

    const { data: permissions } = await supabase
      .from('role_permissions')
      .select('permission:permissions(name)')
      .eq('role_id', (await supabase.from('roles').select('id').eq('name', roleName).single()).data?.id);

    const permissionNames = permissions?.map(p => p.permission.name) || [];

    await supabase.auth.admin.updateUserById(user.id, {
      app_metadata: {
        user_role: roleName,
        permissions: permissionNames
      }
    });

    console.log(`✅ ${user.email}: ${roleName} (${permissionNames.length} صلاحية)`);
  }
}

refreshUserPermissions()
  .then(() => console.log('\n✅ تم تحديث جميع الصلاحيات!'))
  .catch(console.error);
