"use client";

import { Sparkles, Package, Camera, ShoppingBag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Recommendation {
  entity_type: string;
  entity_id: string;
  name?: string;
  price?: number;
  image?: string;
  similarity?: number;
  metadata?: Record<string, unknown>;
}

const TYPE_ICONS: Record<string, typeof Camera> = {
  service: Camera,
  product: ShoppingBag,
  package: Package,
};

const TYPE_LABELS: Record<string, string> = {
  service: "خدمة",
  product: "منتج",
  package: "باقة",
};

export function RecommendationsList({
  recommendations,
  source,
}: {
  recommendations: unknown[];
  source: string;
}) {
  const items = recommendations as Recommendation[];

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center text-muted-foreground">
          <Sparkles className="h-12 w-12" />
          <p>لا توجد توصيات حاليًا. استخدم المنصة أكثر لنتمكن من تقديم توصيات مخصصة لك!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, idx) => {
        const Icon = TYPE_ICONS[item.entity_type] ?? Package;
        const label = TYPE_LABELS[item.entity_type] ?? item.entity_type;
        const name = item.name ?? (item.metadata as Record<string, unknown>)?.name as string ?? "عنصر";
        const price = item.price ?? (item.metadata as Record<string, unknown>)?.price as number;

        return (
          <Card key={`${item.entity_type}-${item.entity_id}-${idx}`} className="transition-shadow hover:shadow-md">
            <CardContent className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <Badge variant="outline" className="gap-1">
                  <Icon className="h-3 w-3" />
                  {label}
                </Badge>
                {item.similarity !== undefined && source === "ai_similarity" && (
                  <span className="text-xs text-muted-foreground">
                    {(Number(item.similarity) * 100).toFixed(0)}% تطابق
                  </span>
                )}
              </div>
              <h3 className="mb-2 font-semibold">{name}</h3>
              {price !== undefined && (
                <span className="text-lg font-bold text-primary">{Number(price).toFixed(0)} ر.ي</span>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
