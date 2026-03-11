import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Briefcase, Camera } from "lucide-react";

export const metadata: Metadata = {
  title: "المصورون",
};

export const revalidate = 3600;

export default async function PhotographersPage() {
  const supabase = await createClient();

  const { data: photographers } = await supabase
    .from("photographers")
    .select("*, profile:profiles(full_name, avatar_url, bio)")
    .eq("is_available", true)
    .order("average_rating", { ascending: false });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold">فريق المصورين</h1>
        <p className="text-muted-foreground">تعرف على فريقنا من المصورين المحترفين</p>
      </div>

      {(!photographers || photographers.length === 0) ? (
        <div className="flex min-h-[30vh] items-center justify-center text-muted-foreground">
          لا يوجد مصورون حاليًا
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {photographers.map((ph) => {
            const profile = ph.profile as { full_name: string; avatar_url: string | null; bio: string | null } | null;
            const name = profile?.full_name ?? "مصور";
            const initials = name.slice(0, 2);

            return (
              <Card key={ph.id} className="transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={profile?.avatar_url ?? undefined} alt={name} />
                      <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold">{name}</h3>
                      {ph.specialty && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          <Camera className="ml-1 h-3 w-3" />
                          {ph.specialty}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {profile?.bio && (
                    <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">{profile.bio}</p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {Number(ph.average_rating).toFixed(1)}
                      <span className="text-xs">({ph.total_reviews})</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {ph.experience_years} سنوات
                    </span>
                    {ph.hourly_rate && (
                      <span>{ph.hourly_rate} ر.ي/ساعة</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
