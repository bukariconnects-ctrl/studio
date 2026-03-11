"use client";

import { useTransition } from "react";
import { Loader2, Sparkles, AlertTriangle } from "lucide-react";
import { generateItemEmbeddings } from "@/actions/embeddings";
import { toast } from "sonner";

export function EmbeddingsManager({ hasApiKey }: { hasApiKey: boolean }) {
  const [isPending, startTransition] = useTransition();

  function handleGenerate() {
    startTransition(async () => {
      const result = await generateItemEmbeddings();
      if (result.error) toast.error(result.error);
      else toast.success(result.success);
    });
  }

  if (!hasApiKey) {
    return (
      <div className="flex items-center gap-3 rounded-xl border-2 border-destructive bg-destructive/10 p-4">
        <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
        <div>
          <p className="text-sm font-bold text-destructive">مفتاح Gemini API غير مُعرّف</p>
          <p className="text-xs text-destructive/80">أضف GEMINI_API_KEY في ملف .env.local لتفعيل توليد المتجهات</p>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleGenerate}
      disabled={isPending}
      className="flex items-center gap-2 rounded-full border-2 border-foreground bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-pop hover-pop disabled:opacity-50"
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
      <span>{isPending ? "جارٍ التوليد..." : "توليد المتجهات الآن"}</span>
    </button>
  );
}
