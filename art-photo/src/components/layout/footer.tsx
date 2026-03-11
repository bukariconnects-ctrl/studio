import Link from "next/link";
import { Camera } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t-2 border-foreground bg-foreground text-background">
      <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-tertiary/20" />
      <div className="absolute -bottom-6 right-16 h-24 w-24 rotate-45 bg-secondary/15" />
      <div className="absolute right-1/3 top-8 h-16 w-16 rounded-full border-4 border-dashed border-quaternary/20" />
      <div className="relative mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Camera className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold" style={{ fontFamily: "var(--font-heading)" }}>Art Photo Studio</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-background/70">
              استوديو تصوير احترافي يقدم أفضل خدمات التصوير الفوتوغرافي
            </p>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-bold" style={{ fontFamily: "var(--font-heading)" }}>روابط سريعة</h3>
            <ul className="space-y-2.5 text-sm text-background/70">
              <li><Link href="/services" className="transition-colors hover:text-tertiary">الخدمات</Link></li>
              <li><Link href="/products" className="transition-colors hover:text-tertiary">المتجر</Link></li>
              <li><Link href="/photographers" className="transition-colors hover:text-tertiary">المصورون</Link></li>
              <li><Link href="/about" className="transition-colors hover:text-tertiary">من نحن</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-bold" style={{ fontFamily: "var(--font-heading)" }}>قانوني</h3>
            <ul className="space-y-2.5 text-sm text-background/70">
              <li><Link href="/terms" className="transition-colors hover:text-tertiary">شروط الخدمة</Link></li>
              <li><Link href="/privacy" className="transition-colors hover:text-tertiary">سياسة الخصوصية</Link></li>
              <li><Link href="/contact" className="transition-colors hover:text-tertiary">اتصل بنا</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-background/20 pt-6 text-center text-xs text-background/50">
          © {new Date().getFullYear()} Art Photo Studio. جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  );
}
