"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  initialQuery: string;
  initialType: string;
}

const TYPES = [
  { value: "all", label: "الكل" },
  { value: "services", label: "الخدمات" },
  { value: "products", label: "المنتجات" },
  { value: "packages", label: "الباقات" },
];

export function SearchForm({ initialQuery, initialType }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [type, setType] = useState(initialType);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}&type=${type}`);
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن خدمة أو منتج..."
            className="pr-10"
          />
        </div>
        <Button type="submit">بحث</Button>
      </div>
      <div className="flex justify-center gap-2">
        {TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setType(t.value)}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${type === t.value ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </form>
  );
}
