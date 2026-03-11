import type { Metadata } from "next";
import { Camera, Award, Users, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "من نحن",
};

const STATS = [
  { icon: Camera, label: "جلسة تصوير", value: "500+" },
  { icon: Users, label: "عميل سعيد", value: "300+" },
  { icon: Award, label: "سنوات خبرة", value: "10+" },
  { icon: Clock, label: "ساعة عمل", value: "5000+" },
];

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-3xl font-bold">من نحن</h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Art Photo Studio هو استوديو تصوير احترافي يسعى لتقديم أفضل تجربة تصوير فوتوغرافي في المنطقة. نجمع بين الإبداع الفني والتقنية المتقدمة لنحقق رؤيتك.
        </p>
      </div>

      <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex flex-col items-center p-6 text-center">
              <stat.icon className="mb-2 h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">{stat.value}</span>
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="mb-3 text-2xl font-semibold">رؤيتنا</h2>
          <p className="text-muted-foreground">
            أن نكون الوجهة الأولى للتصوير الفوتوغرافي الاحترافي، ونقدم تجربة فريدة تجمع بين الجودة والابتكار والاهتمام بأدق التفاصيل لنترك أثرًا يدوم في ذاكرة عملائنا.
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-2xl font-semibold">رسالتنا</h2>
          <p className="text-muted-foreground">
            نسعى لتوثيق أجمل اللحظات بعدسة احترافية، مع توفير بيئة مريحة وفريق متخصص يحرص على تلبية احتياجات كل عميل. نؤمن بأن كل صورة تحكي قصة، ونحن هنا لنجعل قصتك مميزة.
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-2xl font-semibold">فريق العمل</h2>
          <p className="text-muted-foreground">
            يتكون فريقنا من مصورين محترفين ذوي خبرة واسعة في مختلف مجالات التصوير. كل مصور لدينا يتمتع بأسلوب فني فريد ومهارات تقنية عالية لضمان حصولك على أفضل النتائج.
          </p>
        </section>
      </div>
    </div>
  );
}
