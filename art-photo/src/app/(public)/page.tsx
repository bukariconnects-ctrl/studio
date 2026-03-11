import Link from "next/link";
import { Camera, Image, ShoppingBag, CalendarDays, Users, Star, ArrowLeft, Sparkles } from "lucide-react";

const FEATURES = [
  { icon: Camera, title: "جلسات تصوير احترافية", description: "جلسات تصوير شخصية ومناسبات بأعلى معايير الجودة", color: "bg-primary" },
  { icon: Image, title: "معرض أعمال متميز", description: "استعرض نماذج من أعمالنا السابقة وأساليب التصوير المختلفة", color: "bg-secondary" },
  { icon: ShoppingBag, title: "متجر المعدات", description: "تسوق أفضل معدات وإكسسوارات التصوير الفوتوغرافي", color: "bg-tertiary" },
  { icon: CalendarDays, title: "حجز سهل وسريع", description: "احجز موعدك المناسب مع المصور المفضل لديك بخطوات بسيطة", color: "bg-quaternary" },
  { icon: Users, title: "فريق محترف", description: "فريق من المصورين المحترفين ذوي الخبرة الواسعة", color: "bg-primary" },
  { icon: Star, title: "تقييمات موثوقة", description: "اطلع على تقييمات العملاء واختر بثقة", color: "bg-secondary" },
];

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="absolute -left-16 top-1/4 h-64 w-64 rounded-full bg-tertiary/30" />
        <div className="absolute -right-12 bottom-12 h-48 w-48 rotate-12 rounded-3xl bg-secondary/20" />
        <div className="absolute left-1/3 top-12 h-20 w-20 rounded-full border-4 border-dashed border-quaternary/30" />
        <div className="absolute right-1/4 top-1/3 h-12 w-12 rotate-45 bg-primary/15" />

        <div className="relative mx-auto max-w-6xl px-4">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-tertiary px-5 py-2 text-sm font-semibold shadow-pop">
              <Sparkles className="h-4 w-4" />
              <span>استوديو تصوير احترافي</span>
            </div>
            <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight md:text-6xl lg:text-7xl" style={{ fontFamily: "var(--font-heading)" }}>
              نوثّق لحظاتك
              <span className="block text-primary">بعدسة إبداعية</span>
            </h1>
            <p className="mb-10 max-w-lg text-lg leading-relaxed text-muted-foreground">
              نقدم لك تجربة تصوير فريدة تجمع بين الإبداع الفني والتقنية المتقدمة. احجز جلستك الآن واصنع ذكريات تدوم للأبد.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/services"
                className="inline-flex h-12 items-center gap-2 rounded-full border-2 border-foreground bg-primary px-8 text-base font-bold text-primary-foreground shadow-pop hover-pop"
              >
                <span>استعرض خدماتنا</span>
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex h-12 items-center gap-2 rounded-full border-2 border-foreground bg-card px-8 text-base font-bold text-foreground shadow-pop hover-pop"
              >
                إنشاء حساب مجاني
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="mb-14 text-center">
          <h2 className="mb-3 text-3xl font-extrabold md:text-4xl" style={{ fontFamily: "var(--font-heading)" }}>
            لماذا Art Photo Studio؟
          </h2>
          <p className="text-lg text-muted-foreground">نقدم لك كل ما تحتاجه في مكان واحد</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border-2 border-foreground bg-card p-6 shadow-pop-lg card-hover"
            >
              <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl border-2 border-foreground ${feature.color} shadow-pop`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden border-y-2 border-foreground bg-primary py-20">
        <div className="absolute -left-10 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-white/10" />
        <div className="absolute -right-8 bottom-0 h-32 w-32 rotate-45 bg-white/10" />
        <div className="relative mx-auto max-w-6xl px-4 text-center">
          <h2 className="mb-4 text-3xl font-extrabold text-primary-foreground md:text-4xl" style={{ fontFamily: "var(--font-heading)" }}>
            جاهز لتبدأ؟
          </h2>
          <p className="mb-10 text-lg text-primary-foreground/80">أنشئ حسابك الآن واحجز أول جلسة تصوير</p>
          <Link
            href="/auth/register"
            className="inline-flex h-12 items-center gap-2 rounded-full border-2 border-foreground bg-tertiary px-8 text-base font-bold text-foreground shadow-pop hover-pop"
          >
            ابدأ الآن مجانًا
          </Link>
        </div>
      </section>
    </>
  );
}
