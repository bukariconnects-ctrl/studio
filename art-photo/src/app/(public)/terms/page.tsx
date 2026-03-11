import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "شروط الخدمة",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">شروط الخدمة</h1>
      <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
        <section>
          <h2 className="text-xl font-semibold text-foreground">1. القبول بالشروط</h2>
          <p>باستخدامك لموقع Art Photo Studio فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي جزء من هذه الشروط، يرجى عدم استخدام خدماتنا.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-foreground">2. الخدمات المقدمة</h2>
          <p>نقدم خدمات التصوير الفوتوغرافي الاحترافي، بما في ذلك جلسات التصوير الشخصي، تصوير المناسبات، وتصوير المنتجات. كما نوفر متجرًا إلكترونيًا لبيع المعدات والإكسسوارات المتعلقة بالتصوير.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-foreground">3. الحجوزات والإلغاء</h2>
          <p>يتم تأكيد الحجز بعد الدفع الكامل أو دفع العربون المحدد. يمكن إلغاء الحجز قبل 48 ساعة من الموعد المحدد مع استرداد كامل المبلغ. الإلغاء خلال 48 ساعة يخضع لرسوم إلغاء بنسبة 25%.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-foreground">4. حقوق الملكية الفكرية</h2>
          <p>جميع الصور الملتقطة خلال جلسات التصوير تبقى ملكية فكرية لـ Art Photo Studio ما لم يتم الاتفاق على خلاف ذلك كتابيًا. يحصل العميل على ترخيص استخدام شخصي غير تجاري.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-foreground">5. المسؤولية</h2>
          <p>نبذل قصارى جهدنا لتقديم خدمات عالية الجودة. لا نتحمل المسؤولية عن أي أضرار غير مباشرة ناتجة عن استخدام خدماتنا. مسؤوليتنا الكلية لا تتجاوز قيمة الخدمة المدفوعة.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-foreground">6. التعديلات</h2>
          <p>نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم إخطار المستخدمين بأي تغييرات جوهرية عبر البريد الإلكتروني أو من خلال إشعار على الموقع.</p>
        </section>
      </div>
    </div>
  );
}
