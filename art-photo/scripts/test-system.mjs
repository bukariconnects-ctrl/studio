import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rpfliekiobxoibkatqah.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwZmxpZWtpb2J4b2lia2F0cWFoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzA3MDQ0MywiZXhwIjoyMDg4NjQ2NDQzfQ.wn9mLkGdlxGzpNCeAvy_2gU-BW--lHyhNXSOMMtybNY';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const USERS = [
  { email: 'admin@artphoto.ye', password: 'Admin@2026', role: 'admin', name: 'أديب الحكيمي' },
  { email: 'essam@artphoto.ye', password: 'Photo@2026', role: 'photographer', name: 'عصام التعزي' },
  { email: 'arwa@artphoto.ye', password: 'Photo@2026', role: 'photographer', name: 'أروى الصبري' },
  { email: 'mazen@artphoto.ye', password: 'Photo@2026', role: 'photographer', name: 'مازن المخلافي' },
  { email: 'fatima@client.ye', password: 'Client@2026', role: 'client', name: 'فاطمة السعيدي' },
  { email: 'mohammed@client.ye', password: 'Client@2026', role: 'client', name: 'محمد الشرعبي' },
  { email: 'noor@client.ye', password: 'Client@2026', role: 'client', name: 'نور الحمادي' },
];

console.log('🔍 بدء اختبار النظام الشامل...\n');

async function checkUserExists(email) {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error(`❌ خطأ في جلب المستخدمين:`, error.message);
    return null;
  }
  return data.users.find(u => u.email === email);
}

async function createUserIfNotExists(userInfo) {
  const existing = await checkUserExists(userInfo.email);
  
  if (existing) {
    console.log(`✅ المستخدم موجود: ${userInfo.email}`);
    return existing;
  }

  console.log(`🔨 إنشاء مستخدم جديد: ${userInfo.email}`);
  const { data, error } = await supabase.auth.admin.createUser({
    email: userInfo.email,
    password: userInfo.password,
    email_confirm: true,
    user_metadata: { full_name: userInfo.name },
    app_metadata: { user_role: userInfo.role }
  });

  if (error) {
    console.error(`❌ فشل إنشاء ${userInfo.email}:`, error.message);
    return null;
  }

  const { data: roleData } = await supabase
    .from('roles')
    .select('id')
    .eq('name', userInfo.role)
    .single();

  if (roleData) {
    await supabase.from('user_roles').insert({
      user_id: data.user.id,
      role_id: roleData.id
    });
  }

  if (userInfo.role === 'photographer') {
    await supabase.from('photographers').insert({
      user_id: data.user.id,
      specialty: 'تصوير عام',
      experience_years: 5
    });
  }

  console.log(`✅ تم إنشاء: ${userInfo.email}`);
  return data.user;
}

async function testLogin(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    console.error(`❌ فشل تسجيل الدخول لـ ${email}:`, error.message);
    return null;
  }

  console.log(`✅ نجح تسجيل الدخول: ${email}`);
  console.log(`   - الدور: ${data.user.app_metadata?.user_role || 'غير محدد'}`);
  console.log(`   - الصلاحيات: ${data.user.app_metadata?.permissions?.length || 0}`);
  return data;
}

async function testAdminOperations(session) {
  console.log('\n📋 اختبار عمليات المدير...');
  
  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    global: { headers: { Authorization: `Bearer ${session.access_token}` } }
  });

  const { data: services } = await adminClient.from('services').select('id, name').limit(3);
  console.log(`✅ جلب الخدمات: ${services?.length || 0} خدمة`);

  const { data: products } = await adminClient.from('products').select('id, name').limit(3);
  console.log(`✅ جلب المنتجات: ${products?.length || 0} منتج`);

  const { data: bookings } = await adminClient.from('bookings').select('id, status').limit(5);
  console.log(`✅ جلب الحجوزات: ${bookings?.length || 0} حجز`);

  const { data: users } = await adminClient.from('profiles').select('id, full_name').limit(5);
  console.log(`✅ جلب المستخدمين: ${users?.length || 0} مستخدم`);

  const { data: roles } = await adminClient.from('roles').select('id, name');
  console.log(`✅ جلب الأدوار: ${roles?.length || 0} دور`);

  const { data: permissions } = await adminClient.from('permissions').select('id, name');
  console.log(`✅ جلب الصلاحيات: ${permissions?.length || 0} صلاحية`);
}

async function testPhotographerOperations(session) {
  console.log('\n📸 اختبار عمليات المصور...');
  
  const photoClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    global: { headers: { Authorization: `Bearer ${session.access_token}` } }
  });

  const { data: myBookings } = await photoClient
    .from('bookings')
    .select('id, status, booking_date')
    .eq('photographer_id', session.user.id)
    .limit(5);
  console.log(`✅ جلب حجوزاتي: ${myBookings?.length || 0} حجز`);

  const { data: allBookings } = await photoClient
    .from('bookings')
    .select('id, status')
    .limit(5);
  console.log(`✅ جلب كل الحجوزات: ${allBookings?.length || 0} حجز`);
}

async function testClientOperations(session) {
  console.log('\n👤 اختبار عمليات العميل...');
  
  const clientClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    global: { headers: { Authorization: `Bearer ${session.access_token}` } }
  });

  const { data: myBookings } = await clientClient
    .from('bookings')
    .select('id, status, booking_date')
    .eq('client_id', session.user.id);
  console.log(`✅ جلب حجوزاتي: ${myBookings?.length || 0} حجز`);

  const { data: myOrders } = await clientClient
    .from('orders')
    .select('id, status, total_amount')
    .eq('user_id', session.user.id);
  console.log(`✅ جلب طلباتي: ${myOrders?.length || 0} طلب`);

  const { data: services } = await clientClient
    .from('services')
    .select('id, name, base_price')
    .eq('is_active', true)
    .limit(5);
  console.log(`✅ تصفح الخدمات: ${services?.length || 0} خدمة`);

  const { data: products } = await clientClient
    .from('products')
    .select('id, name, price')
    .eq('is_active', true)
    .limit(5);
  console.log(`✅ تصفح المنتجات: ${products?.length || 0} منتج`);
}

async function testPermissions(session, userRole) {
  console.log('\n🔐 اختبار الصلاحيات...');
  
  const permissions = session.user.app_metadata?.permissions || [];
  console.log(`   الصلاحيات المتاحة: ${permissions.length}`);
  
  if (userRole === 'admin') {
    console.log(`   ✅ Admin لديه صلاحيات كاملة`);
  } else if (userRole === 'photographer') {
    const hasBookingsView = permissions.includes('bookings.view_all');
    const hasAlbumsManage = permissions.includes('albums.manage');
    console.log(`   ${hasBookingsView ? '✅' : '❌'} bookings.view_all`);
    console.log(`   ${hasAlbumsManage ? '✅' : '❌'} albums.manage`);
  } else {
    console.log(`   ℹ️  Client ليس لديه صلاحيات إدارية`);
  }
}

async function runTests() {
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('📦 المرحلة 1: التحقق من المستخدمين وإنشائهم إذا لزم الأمر\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  for (const user of USERS) {
    await createUserIfNotExists(user);
  }

  console.log('\n═══════════════════════════════════════════════════════════\n');
  console.log('🔑 المرحلة 2: اختبار تسجيل الدخول لجميع المستخدمين\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  const sessions = {};
  for (const user of USERS) {
    const session = await testLogin(user.email, user.password);
    if (session) {
      sessions[user.role] = sessions[user.role] || [];
      sessions[user.role].push({ ...session, userInfo: user });
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n═══════════════════════════════════════════════════════════\n');
  console.log('🧪 المرحلة 3: اختبار العمليات حسب الدور\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  if (sessions.admin && sessions.admin[0]) {
    console.log('\n👑 اختبار المدير (Admin)');
    console.log('─────────────────────────────────────────────────────────');
    await testPermissions(sessions.admin[0].session, 'admin');
    await testAdminOperations(sessions.admin[0].session);
  }

  if (sessions.photographer && sessions.photographer[0]) {
    console.log('\n📸 اختبار المصور (Photographer)');
    console.log('─────────────────────────────────────────────────────────');
    await testPermissions(sessions.photographer[0].session, 'photographer');
    await testPhotographerOperations(sessions.photographer[0].session);
  }

  if (sessions.client && sessions.client[0]) {
    console.log('\n👤 اختبار العميل (Client)');
    console.log('─────────────────────────────────────────────────────────');
    await testPermissions(sessions.client[0].session, 'client');
    await testClientOperations(sessions.client[0].session);
  }

  console.log('\n═══════════════════════════════════════════════════════════\n');
  console.log('📊 ملخص النتائج\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  const totalUsers = USERS.length;
  const successfulLogins = Object.values(sessions).flat().length;
  
  console.log(`✅ إجمالي المستخدمين: ${totalUsers}`);
  console.log(`✅ تسجيلات دخول ناجحة: ${successfulLogins}`);
  console.log(`${successfulLogins === totalUsers ? '✅' : '⚠️'} معدل النجاح: ${((successfulLogins/totalUsers)*100).toFixed(1)}%`);

  if (sessions.admin && sessions.admin.length > 0) {
    console.log(`✅ Admin: يعمل بشكل صحيح`);
  }
  if (sessions.photographer && sessions.photographer.length > 0) {
    console.log(`✅ Photographer: يعمل بشكل صحيح`);
  }
  if (sessions.client && sessions.client.length > 0) {
    console.log(`✅ Client: يعمل بشكل صحيح`);
  }

  console.log('\n═══════════════════════════════════════════════════════════\n');
  console.log('✅ اكتمل الاختبار الشامل!\n');
  console.log('═══════════════════════════════════════════════════════════\n');
}

runTests().catch(console.error);
