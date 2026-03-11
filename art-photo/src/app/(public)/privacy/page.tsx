import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "سياسة الخصوصية",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">سياسة الخصوصية</h1>
      <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
        <section>
          <h2 className="text-xl font-semibold text-foreground">1. جمع البيانات</h2>
          <p>نجمع المعلومات التي تقدمها لنا مباشرة عند إنشاء حساب أو إجراء حجز، بما في ذلك: الاسم الكامل، البريد الإلكتروني، رقم الهاتف، والعنوان. كما نجمع بيانات الاستخدام تلقائيًا لتحسين تجربتك.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-foreground">2. استخدام البيانات</h2>
          <p>نستخدم بياناتك لتقديم خدماتنا وتحسينها، معالجة الحجوزات والمدفوعات، التواصل معك بشأن حجوزاتك، وإرسال تحديثات وعروض (بموافقتك المسبقة).</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-foreground">3. حماية البيانات</h2>
          <p>نستخدم تقنيات تشفير متقدمة (bcrypt, TLS) لحماية بياناتك. يتم تخزين كلمات المرور بشكل مشفر ولا يمكن لأي شخص الوصول إليها، بما في ذلك فريق العمل لدينا.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-foreground">4. مشاركة البيانات</h2>
          <p>لا نبيع أو نشارك بياناتك الشخصية مع أطراف ثالثة إلا في الحالات التالية: لمعالجة المدفوعات (عبر بوابة الدفع الآمنة)، للامتثال للمتطلبات القانونية، أو بموافقتك الصريحة.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-foreground">5. حقوقك (GDPR)</h2>
          <p>لديك الحق في: الوصول إلى بياناتك الشخصية، تصحيح البيانات غير الدقيقة، طلب حذف بياناتك، الاعتراض على معالجة البيانات، ونقل بياناتك إلى مزود خدمة آخر.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-foreground">6. ملفات تعريف الارتباط (Cookies)</h2>
          <p>نستخدم ملفات تعريف الارتباط الأساسية للحفاظ على جلسة تسجيل الدخول وتفضيلاتك. لا نستخدم ملفات تعريف الارتباط لأغراض إعلانية.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-foreground">7. التواصل</h2>
          <p>لأي استفسارات تتعلق بالخصوصية، يرجى التواصل معنا عبر صفحة &quot;اتصل بنا&quot; أو عبر البريد الإلكتروني المخصص لشؤون الخصوصية.</p>
        </section>
      </div>
    </div>
  );
}
